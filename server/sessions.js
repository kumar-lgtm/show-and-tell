/**
 * Agentation sessions — the notes API the review toolbar talks to.
 *
 * The toolbar (`agentation` on npm) takes an `endpoint` prop and, when given
 * one, syncs sessions and annotations over a handful of HTTP routes instead of
 * keeping them in localStorage. Upstream expects that endpoint to be its own
 * MCP server; here it is the local review server (server/app.js, mounted at
 * `<base>/__ag` by `serve`, the dev-server integrations and the `share` proxy),
 * backed by one SQLite file per project (server/store.js). The reviewer needs
 * nothing installed: the page they are looking at *is* the session.
 *
 * ROUTES (relative to `<base>/__ag`):
 *   GET    /health                                   → {ok} — drives the status dot
 *   GET    /sessions                                 → every page's notes, for the inbox
 *   POST   /sessions                  {url,pageKey?} → session
 *   GET    /sessions/:id                             → session + annotations
 *   GET    /sessions/:id/events                      → SSE, status changes
 *   POST   /sessions/:id/annotations  <annotation>   → annotation  (idempotent on client id)
 *   POST   /annotations/:id/reply     {message,name} → annotation  (ours, not upstream's)
 *   POST   /annotations/:id/withdraw                 → annotation  (ours; a tombstone)
 *   POST   /annotations/:id/verdict   {verdict,message?,reviewer?} → annotation  (ours; Check the fix)
 *   POST   /annotations/:id/decision  {decision,…}  → annotation  (ours; the reviewer deciding a critique note)
 *   PATCH  /annotations/:id           <partial>      → annotation
 *   DELETE /annotations/:id[?reviewer=<name>]        → annotation  (a tombstone too; see the route)
 *
 * ⚠️ Both session reads take `?author=`, and it defaults to `reviewer`. The
 * toolbar calls them without it and ADOPTS whatever comes back as its own notes,
 * so an agent's critique must never be in that response — our own overlay asks
 * for `?author=agent` instead. See `loadAnnotations`.
 *
 * `/health` and `/events` are not guesses — the component polls the first every
 * 10s to colour its connection indicator, and subscribes to the second with an
 * `EventSource`. When a message arrives whose `payload.status` is `resolved` or
 * `dismissed`, it animates that marker out. That is the mechanism behind
 * "resolving from the agent makes it disappear in the reviewer's browser", and
 * without `/events` the loop is one-way until someone reloads.
 * ⚠️ It subscribes to the NAMED event `annotation.updated` and has no
 * `onmessage`, so an unnamed frame reaches it and is dropped — see the `event:`
 * line in `eventStream`. That was true here for four days and made the sentence
 * above a claim rather than a description.
 *
 * The agent half (acknowledge / resolve / dismiss / reply, critique, reading
 * across pages) is deliberately NOT on this HTTP surface. It lives in
 * server/agent.js, which the `feedback` CLI and the MCP server call directly
 * against the SQLite file, from the developer's own terminal. Anyone who can load
 * the page — including a remote reviewer through `share` — may add and answer
 * notes; deciding a note is handled is the developer's (or their agent's), and
 * it must not be reachable by a request a page can make.
 */

import { cleanReviewer } from "./reviewer.js";
import { cleanPlayhead } from "./playhead.js";

/** A JSON body that is an object; null, a number, a string or an array is read as {}. */
const objectBody = (b) => (b && typeof b === "object" && !Array.isArray(b) ? b : {});

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomId(prefix, length = 16) {
  const limit = Math.floor(256 / ID_ALPHABET.length) * ID_ALPHABET.length;
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte >= limit) continue; // biased tail — resample, same as src/ids.js
      out += ID_ALPHABET[byte % ID_ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return `${prefix}_${out}`;
}

const MAX_COMMENT = 8 * 1024;
const MAX_PAYLOAD = 64 * 1024;
const MAX_ANNOTATIONS_PER_SITE = 2000;

/**
 * ⚠️ Serialized JSON is never cut to fit. `JSON.stringify(x).slice(0, MAX)`
 * stores text that is no longer JSON; it then reads back as empty, and the next
 * write starts from that empty value and saves over it — a whole reply thread or
 * edit payload silently gone. So oversized values are made smaller BEFORE they
 * are serialized, and refused (413) when they cannot be.
 */
export class TooLarge extends Error {
  constructor(message) { super(message); this.status = 413; }
}

/** A row's JSON column, or `undefined` when what is stored is not valid JSON. */
function parseStored(text, fallback) {
  if (text == null || text === "") return fallback;
  try { return JSON.parse(text); } catch { return undefined; }
}

/** A reply timestamp in ms. Old rows (and any caller) may have written seconds. */
export function replyMs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n < 1e12 ? Math.round(n * 1000) : Math.round(n);
}

/**
 * A reply thread that serializes under MAX_PAYLOAD. Drops the oldest messages
 * first, but keeps the agent's first question when it can — it is what the rest
 * of the thread answers. Throws TooLarge when the newest message alone is too big.
 */
export function fitReplies(replies) {
  const list = replies.map((m) => ({ ...m, ts: replyMs(m.ts) }));
  const size = (l) => JSON.stringify(l).length;
  if (size(list) <= MAX_PAYLOAD) return list;
  const newest = list[list.length - 1];
  if (size([newest]) > MAX_PAYLOAD) throw new TooLarge("reply too large");
  const firstQuestion = list.findIndex((m) => m.from === "agent");
  let keepFirst = firstQuestion >= 0 && firstQuestion < list.length - 1 ? list[firstQuestion] : null;
  let rest = list.filter((m) => m !== keepFirst);
  const build = () => (keepFirst ? [keepFirst, ...rest] : rest);
  while (rest.length > 1 && size(build()) > MAX_PAYLOAD) rest = rest.slice(1);
  if (size(build()) > MAX_PAYLOAD) keepFirst = null;
  return build();
}

/** Toolbar fields that can grow without bound, in the order they are given up. */
const BULKY_FIELDS = ["computedStyles", "nearbyText", "nearbyElements", "fullPath", "accessibility",
  "cssClasses", "reactComponents", "selectedText", "boundingBox", "sourceFile"];
const TRIMMED_TO = 2000;

/**
 * An annotation payload serialized under MAX_PAYLOAD: first the bulky fields are
 * shortened, then dropped. Throws TooLarge when what is left still does not fit
 * (a comment or a text edit, which must never be cut silently).
 */
export function fitPayload(obj) {
  let out = JSON.stringify(obj);
  if (out.length <= MAX_PAYLOAD) return out;
  const copy = { ...obj };
  for (const f of BULKY_FIELDS) {
    if (!(f in copy)) continue;
    if (typeof copy[f] === "string" && copy[f].length > TRIMMED_TO) copy[f] = copy[f].slice(0, TRIMMED_TO) + "…";
    else if (typeof copy[f] !== "string" && JSON.stringify(copy[f] ?? null).length > TRIMMED_TO) delete copy[f];
    out = JSON.stringify(copy);
    if (out.length <= MAX_PAYLOAD) return out;
  }
  for (const f of BULKY_FIELDS) {
    delete copy[f];
    out = JSON.stringify(copy);
    if (out.length <= MAX_PAYLOAD) return out;
  }
  throw new TooLarge("annotation too large");
}

/** Lifecycle the MCP tools drive. Anything but `pending` is handled. */
export const AG_STATUSES = ["pending", "acknowledged", "resolved", "dismissed"];

/** Reviewer-authored feedback may be rejected from the inbox. Rejection is a
 * one-way tombstone, never an agent resolution and never a hard delete. */
const WITHDRAWABLE_KINDS = new Set(["placement", "rearrange", "annotation", "feedback", "edit", "copy", "voice"]);
// A tweak (toolbar/tweak.js) is the reviewer's too: its `tweak` payload is stored like `edit`.
WITHDRAWABLE_KINDS.add("tweak");
/** A tweak payload as stored: known fields only, strings bounded, flags boolean. */
export function cleanTweak(t) {
  if (!t || typeof t !== "object" || Array.isArray(t)) return undefined;
  const str = (v, n = 256) => (v == null ? undefined : typeof v === "object" ? undefined : String(v).slice(0, n));
  const out = {};
  for (const k of ["selector", "property", "from", "to", "token", "fromToken", "scale"]) { const v = str(t[k], k === "selector" ? 512 : 256); if (v !== undefined) out[k] = v; }
  for (const k of ["onScale", "fromOnScale"]) if (typeof t[k] === "boolean") out[k] = t[k];
  const rs = t.ruleSource;
  if (rs && typeof rs === "object" && !Array.isArray(rs)) {
    out.ruleSource = {};
    for (const k of ["href", "selector"]) { const v = str(rs[k], 512); if (v !== undefined) out.ruleSource[k] = v; }
    if (typeof rs.inherited === "boolean") out.ruleSource.inherited = rs.inherited;
  } else if (typeof rs === "string") out.ruleSource = { href: rs.slice(0, 512) };
  return out;
}

/** What the reviewer can decide about a critique note (POST /annotations/:id/decision). */
export const DECISIONS = ["fix", "not-an-issue", "discuss", "undo"];

/**
 * A critique note's suggested fix, checked when it is written (show-and-tell.pen
 * 9.4): a malformed one is refused at annotate time, not found broken in the page.
 *   {kind: "text",  from?, to}            new text for the target; with no `from`
 *                                         the browser reads the target's current text
 *   {kind: "tweak", property, from?, to}  one CSS property, e.g. min-height 39px → 44px
 * Returns {suggestion} (null when none was given) or {error}.
 */
export function cleanSuggestion(s) {
  if (s == null) return { suggestion: null };
  if (typeof s !== "object" || Array.isArray(s)) return { error: "suggestion must be an object: {kind, from?, to, property?}" };
  if (s.kind !== "text" && s.kind !== "tweak") return { error: `suggestion.kind must be text or tweak, got "${s.kind ?? ""}"` };
  if (typeof s.to !== "string" || !s.to.trim()) return { error: "suggestion.to must be the new text or value" };
  if (s.from != null && typeof s.from !== "string") return { error: "suggestion.from must be a string" };
  if (s.to.length > MAX_COMMENT || String(s.from ?? "").length > MAX_COMMENT) return { error: "suggestion is too long" };
  if (s.kind === "text") {
    if (s.property != null) return { error: "suggestion.property is only for kind tweak" };
    return { suggestion: { kind: "text", from: s.from ?? null, to: s.to } };
  }
  const property = String(s.property ?? "").trim().toLowerCase();
  if (!/^-?[a-z][a-z-]{0,63}$/.test(property)) return { error: `suggestion.property must be one CSS property name, like min-height; got "${s.property ?? ""}"` };
  // Previewed live in the reviewer's page, so one plain value: nothing that ends
  // the declaration or fetches (url(), image-set()).
  const to = s.to.trim();
  if (to.length > 256 || /[;{}<>\\]|\/\*|url\(|image-set\(|expression\(/i.test(to)) return { error: "suggestion.to must be one CSS value (no ; { } < > or url())" };
  return { suggestion: { kind: "tweak", property, from: s.from == null ? null : String(s.from).trim().slice(0, 256), to } };
}

/**
 * Shape a stored row the way the toolbar expects it back.
 *
 * `payload` is spread FIRST so our columns win: a client that sent a stale
 * `status` in its payload must not be able to un-resolve itself by re-syncing.
 */
export function annotationView(row) {
  let payload = {};
  try { payload = JSON.parse(row.payload || "{}"); } catch { /* corrupt blob — ignore */ }
  let replies = [];
  try { replies = JSON.parse(row.replies || "[]"); } catch { /* ditto */ }
  if (!Array.isArray(replies)) replies = [];
  replies = replies.map((m) => (m && typeof m === "object" ? { ...m, ts: replyMs(m.ts) } : m));
  // Cleaned on the way out too, so a row written before the cap still reads safely.
  const reviewer = cleanReviewer(payload.reviewer);
  delete payload.reviewer;
  return {
    ...payload,
    ...(reviewer ? { reviewer } : {}),
    id: row.id,
    clientId: row.client_id ?? null,
    sessionId: row.session_id,
    kind: row.kind,
    comment: row.comment ?? "",
    element: row.element ?? "",
    elementPath: row.element_path ?? "",
    intent: row.intent ?? null,
    severity: row.severity ?? null,
    status: row.status,
    resolution: row.resolution ?? null,
    // Who wrote it. Defaulted rather than trusted from the row so a database
    // that has not run migration 0015 yet reads as reviewer-authored, which is
    // what every pre-critique row is.
    author: row.author ?? "reviewer",
    // What the reviewer actually said, as opposed to what layout mode generated
    // into `comment`. Null until they are asked.
    note: row.note ?? null,
    replies,
    timestamp: row.created_at * 1000,
    updatedAt: row.updated_at * 1000,
  };
}

export function sessionView(row, annotations = []) {
  return {
    id: row.id,
    siteId: row.site_id,
    url: row.url,
    createdAt: row.created_at * 1000,
    updatedAt: row.updated_at * 1000,
    annotations,
  };
}

/**
 * Annotations in a session, filtered by who wrote them.
 *
 * ⚠️ The default is `reviewer`, and that is load-bearing rather than tidy.
 * `GET /sessions/:id` is what the upstream toolbar calls on join, and it does
 * `setAnnotations(session.annotations)` — it adopts whatever comes back as its
 * own. Hand it an agent's critique and the two streams merge: the critique
 * renders in the toolbar's marker style, indistinguishable from the reviewer's
 * own notes, deletable from a UI that would then DELETE the agent's work, and
 * written into the localStorage store that syncs back up.
 *
 * So the toolbar sees reviewer rows only, and the critique is rendered by our
 * own layer (`critique.js`), which asks for `?author=agent` explicitly. Two
 * authors, two surfaces, one table.
 */
async function loadAnnotations(env, sessionId, author = "reviewer") {
  const { results } = await env.DB.prepare(
    author === "all"
      ? "SELECT * FROM ag_annotations WHERE session_id = ? ORDER BY created_at ASC"
      : "SELECT * FROM ag_annotations WHERE session_id = ? AND author = ? ORDER BY created_at ASC",
  ).bind(...(author === "all" ? [sessionId] : [sessionId, author])).all();
  return results.map(annotationView);
}

/** `?author=` is a closed set — anything else falls back to the safe default. */
function readAuthor(rawUrl) {
  const want = new URL(rawUrl).searchParams.get("author");
  return want === "agent" || want === "all" ? want : "reviewer";
}

/**
 * Resolve an annotation by our id first, then by the client's own handle.
 * See the migration for why both are addressable.
 */
async function findAnnotation(env, siteId, ref) {
  const byId = await env.DB.prepare(
    "SELECT * FROM ag_annotations WHERE id = ? AND site_id = ?",
  ).bind(ref, siteId).first();
  if (byId) return byId;
  return env.DB.prepare(
    "SELECT * FROM ag_annotations WHERE client_id = ? AND site_id = ? ORDER BY created_at DESC",
  ).bind(ref, siteId).first();
}

/** Path only — the part of a URL that identifies the page rather than the host. */
function pathOf(raw) {
  try { return new URL(raw, "https://agentation-kit.invalid").pathname; } catch { return null; }
}

/**
 * Reuse a session for the same page rather than minting one per page load.
 * Without this a reviewer who refreshes starts a second thread and the agent
 * sees their feedback split across sessions that look unrelated.
 */
/**
 * A page key's view of any URL: its pathname plus only the params the key names
 * (`/iframe.html?id=x` → the url's path + its `id`). Hosts routing by query send
 * one (toolbar/page-key.js); everyone else sends none.
 */
function keyLike(raw, pageKey) {
  try {
    const k = new URL(pageKey, "https://agentation-kit.invalid");
    const u = new URL(raw, "https://agentation-kit.invalid");
    const q = new URLSearchParams();
    for (const name of k.searchParams.keys()) if (u.searchParams.has(name)) q.set(name, u.searchParams.get(name));
    const s = q.toString();
    return s ? `${u.pathname}?${s}` : u.pathname;
  } catch { return null; }
}

async function findOrCreateSession(env, siteId, url, ts, pageKey = null) {
  const existing = await env.DB.prepare(
    "SELECT * FROM ag_sessions WHERE site_id = ? AND url = ? ORDER BY created_at ASC",
  ).bind(siteId, url).first();
  if (existing) return existing;

  // ⚠️ Same page on a different HOST is the same page.
  //
  // One dev server is reachable at several origins at once: localhost and
  // 127.0.0.1, a LAN address, and the `share` proxy or its tunnel host. Matching
  // on the full URL would fork one page's notes across them. It bites hardest on
  // critique mode, where the agent has no browser and passes whatever URL it was
  // given while the reviewer is on another host: the critique lands in one
  // session, the reviewer's toolbar joins the other, and the feature silently
  // does nothing. A project has one session per page, so scanning them is
  // cheaper than a second index.
  //
  // A host that routes by query (a Storybook preview: every story is
  // /iframe.html, only ?id= differs) sends a pageKey. Then "same page" is the
  // same path AND the same key params — still host-agnostic — or every story
  // would join the first story's session.
  const path = pathOf(url);
  const key = pageKey ? keyLike(url, pageKey) : null;
  if (path) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM ag_sessions WHERE site_id = ? ORDER BY created_at ASC",
    ).bind(siteId).all();
    const samePage = results.find((r) => (key ? keyLike(r.url, pageKey) === key : pathOf(r.url) === path));
    if (samePage) return samePage;
  }

  // SELECT-then-INSERT is not enough on its own. On first load the toolbar and
  // our own bundle both resolve a session concurrently, both miss the row, and
  // both insert — which is how a page ended up with two sessions in QA. The
  // unique index on (site_id, url) makes the second insert a no-op, and we then
  // read back whichever one won.
  const id = randomId("ses");
  await env.DB.prepare(
    "INSERT OR IGNORE INTO ag_sessions (id, site_id, url, created_at, updated_at) VALUES (?,?,?,?,?)",
  ).bind(id, siteId, url, ts, ts).run();
  return env.DB.prepare(
    "SELECT * FROM ag_sessions WHERE site_id = ? AND url = ? ORDER BY created_at ASC",
  ).bind(siteId, url).first();
}

function touchSession(env, sessionId, ts) {
  return env.DB.prepare("UPDATE ag_sessions SET updated_at = ? WHERE id = ?").bind(ts, sessionId).run();
}

// A connection lives this long, then closes so EventSource reconnects. A stream
// that never ends pins a socket (and, through `share`, a tunnel connection) per
// open tab forever, and hides a restarted server behind a dead connection.
// 50s keeps us inside the toolbar's own 10s health cadence without churning.
const SSE_LIFETIME_MS = 50_000;
const SSE_POLL_MS = 3_000;

/**
 * Server-sent status changes for one session.
 *
 * SQLite has no change feed (and the agent writes from another process), so this polls on a cursor: every tick, look for rows
 * whose `updated_at` moved since the last pass and whose status is now terminal.
 * Only `resolved` and `dismissed` are worth sending — they are the only two the
 * toolbar reacts to (it animates the marker out), so emitting anything else
 * would be traffic no client reads.
 */
function eventStream(env, sessionId, lastEventId) {
  const encoder = new TextEncoder();
  let timer = null;
  let lifetime = null;
  let closed = false;

  // Where to resume from.
  //
  // Starting at "now" was wrong twice over. The connection only lives 50s, so
  // every reconnect opened a window in which changes were lost for good; and a
  // reviewer who reopens the page after an agent asked a question would never
  // see it, because the question predates their connection. EventSource sends
  // `Last-Event-ID` on reconnect precisely for this — honour it, and when it is
  // absent replay recent history rather than starting blind.
  const REPLAY_SECONDS = 7 * 24 * 60 * 60;
  const resumed = Number(lastEventId);
  let cursor = Number.isFinite(resumed) && resumed > 0
    ? resumed
    : Math.floor(Date.now() / 1000) - REPLAY_SECONDS;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (chunk) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(chunk)); } catch { closed = true; }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        clearTimeout(lifetime);
        try { controller.close(); } catch { /* already closed by the client */ }
      };

      // `retry` tells EventSource how fast to come back after we close.
      send(`retry: 2000\n\n`);
      send(`: connected\n\n`);

      timer = setInterval(async () => {
        if (closed) return;
        try {
          // Every change, not just terminal ones — an agent asking a clarifying
          // question has to reach the reviewer too, and that is a reply on a
          // still-open annotation. The toolbar's own handler only acts on
          // `payload.status` being resolved/dismissed, so the extra frames are
          // inert to it; our layer reads `payload.reply`.
          const { results } = await env.DB.prepare(
            `SELECT id, kind, status, comment, replies, author, note, payload, created_at, updated_at
               FROM ag_annotations
              WHERE session_id = ? AND updated_at > ?
              ORDER BY updated_at ASC LIMIT 50`,
          ).bind(sessionId, cursor).all();
          for (const row of results) {
            cursor = Math.max(cursor, row.updated_at);
            let replies = [];
            try { replies = JSON.parse(row.replies || "[]"); } catch { /* corrupt */ }
            if (!Array.isArray(replies)) replies = [];
            replies = replies.map((m) => (m && typeof m === "object" ? { ...m, ts: replyMs(m.ts) } : m));
            const last = replies.length ? replies[replies.length - 1] : null;
            let reviewer = null;
            try { reviewer = cleanReviewer(JSON.parse(row.payload || "{}").reviewer); } catch { /* corrupt */ }
            // ⚠️ NAMED, and this was missing for the toolbar's entire life here.
            //
            // `agentation@3.0.2` subscribes with
            // `eventSource.addEventListener("annotation.updated", handler)` and
            // has NO `onmessage` (grep the sourcemap: one addEventListener, zero
            // onmessage). An SSE frame with no `event:` line dispatches as
            // `message`, so every frame we sent was delivered to a browser that
            // had nobody listening — which quietly cost the two behaviours the
            // stream exists for:
            //   · an agent resolving a note did NOT animate the marker away in
            //     the reviewer's browser, and
            //   · a dismissed layout drag did not disappear from the page.
            // Both look like "the stream isn't reaching the browser" and it was;
            // the frames arrived under the wrong name. Our own layers use
            // `onmessage`, which is why replies, critique and layout intent all
            // worked and this stayed invisible.
            //
            // ⚠️ SENT TWICE — named AND unnamed — and that is not belt-and-braces.
            //
            // A reviewer's open tab keeps whatever bundle it loaded, and a
            // server upgraded underneath it must not go dark for that tab. Our
            // own layers listen with `onmessage` (unnamed); the component listens
            // for the named event. Sending both means any bundle works against
            // any server.
            //
            // Cost is two frames per changed row per 3s poll on an open page,
            // which is nothing next to a tab still running an older cached
            // bundle going silent. Our own
            // bundle dedupes on `lastEventId` + payload (see entry.jsx); the
            // component only listens to the named one and never sees the twin.
            const frame = JSON.stringify({
              payload: {
                id: row.id,
                kind: row.kind,
                status: row.status,
                comment: row.comment ?? "",
                // Which layer should act on this frame. The toolbar ignores the
                // field entirely (it only reads `status`), our critique overlay
                // uses it to notice a critique that landed while the page was
                // open instead of waiting for a reload.
                author: row.author ?? "reviewer",
                // Who left the note, so a question pops up for its author only.
                ...(reviewer ? { reviewer } : {}),
                // Both needed by the layout-intent prompt, which fires off this
                // stream rather than a toolbar callback: `note` says whether it
                // has already been explained, `createdAt` whether it is a drag
                // that just happened or one the 7-day replay dug up.
                note: row.note ?? null,
                createdAt: row.created_at * 1000,
                // Only forward a reply the OTHER side wrote. Echoing the
                // reviewer's own message back would render it as an incoming
                // question and prompt them to answer themselves.
                reply: last && last.from === "agent" ? last : null,
                // The WHOLE exchange, not just the newest message. A reviewer
                // answering "the second one" three questions deep was being
                // asked to remember what the first two were; the panel had no
                // way to show them because the frame never carried them.
                // Bounded: MAX_PAYLOAD caps `replies` at write time, and a
                // thread long enough to matter here is a conversation that
                // should have become an annotation of its own.
                replies,
                replyCount: replies.length,
              },
            });
            // `id:` is what the browser echoes back as Last-Event-ID, so a
            // reconnect resumes exactly where this left off. Repeated on the
            // twin rather than relying on the field persisting, so the two are
            // identical and our dedupe key matches on both.
            send(`event: annotation.updated\nid: ${row.updated_at}\ndata: ${frame}\n\n`);
            send(`id: ${row.updated_at}\ndata: ${frame}\n\n`);
          }
          // A comment frame doubles as a keepalive; without traffic some proxies
          // drop an idle stream well before our own deadline.
          if (!results.length) send(`: ping\n\n`);
        } catch {
          finish();
        }
      }, SSE_POLL_MS);

      // Held so `cancel()` can clear it. Left dangling, this timer outlives a
      // disconnected client by up to the full lifetime, pinning the event loop
      // for 50s (in tests, and in a CLI that would otherwise exit).
      lifetime = setTimeout(finish, SSE_LIFETIME_MS);
    },
    cancel() {
      closed = true;
      clearInterval(timer);
      clearTimeout(lifetime);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/**
 * Does this URL belong to the site being addressed?
 *
 * The toolbar keeps annotations per pathname (`feedback-annotations-<path>`)
 * and, on connecting to an endpoint, syncs EVERY page it has notes for — not
 * just the one you are on. That is right when one origin is one app. When
 * several independent sites share one origin under a path prefix (`token`), a
 * browser that had opened site A and then site B would flush A's notes into
 * B's project. With a token, only URLs under `/p/<token>` are accepted. The
 * local server passes no token (one origin is one project), so this is a no-op
 * there; it is kept so the handler stays safe if mounted that way.
 */
function belongsToLink(rawUrl, token) {
  if (!token) return true; // no token in context (tests, preview) — nothing to check against
  try {
    // `base` only matters for a relative value; a well-formed absolute URL
    // ignores it. Host is deliberately NOT compared: the same page is reachable
    // on more than one hostname.
    const { pathname } = new URL(rawUrl, "https://agentation-kit.invalid");
    return pathname === `/p/${token}` || pathname.startsWith(`/p/${token}/`);
  } catch {
    return false;
  }
}

/** What a reviewer can say about a closed note in Check the fix (toolbar/check.js). */
export const VERDICTS = ["looks-right", "not-yet", "agree"];
/** Payload fields the verdict route owns; a toolbar re-sync must not drop them. */
export const VERDICT_FIELDS = ["verdict", "reopenedFrom", "reopenedAt", "revisedAt"];
/** Payload fields the agent owns (its proof screenshots, server/shots.js); a toolbar re-sync must not drop them either. */
export const AGENT_FIELDS = ["shots"];

/**
 * The reviewer's verdict on what the agent did with a note.
 *
 *   - `looks-right` (a resolved note) and `agree` (a set-aside note) record the
 *     verdict and leave the note closed.
 *   - `not-yet` reopens it: status back to pending, the reviewer's message
 *     appended as a reply, and `reopenedFrom` keeps what the agent said. The new
 *     `reopenedAt` is what makes the toolbar count it toward the next Send.
 *
 * Reopening is the reviewer saying their feedback still stands, the same kind
 * of thing as leaving a note, which is why it is on this surface. Closing a note
 * stays the agent's (server/agent.js). The reply is marked `reopen`, so the
 * agent's wait wakes on the next Send, not the moment the reviewer types.
 */
async function recordVerdict({ env, row, body, ts, onEvent, json, apiError }) {
  const verdict = String(body.verdict ?? "");
  if (!VERDICTS.includes(verdict)) return apiError(`verdict must be one of ${VERDICTS.join(", ")}`, 422);
  if ((row.author ?? "reviewer") !== "reviewer") return apiError("agent feedback is read-only", 403);
  if (!["resolved", "dismissed"].includes(row.status)) return apiError("this note is still open; check it once the agent has closed it", 409);
  if (verdict === "looks-right" && row.status !== "resolved") return apiError("looks-right is for a note the agent resolved", 422);
  if (verdict === "agree" && row.status !== "dismissed") return apiError("agree is for a note the agent set aside", 422);
  const by = cleanReviewer(body.reviewer);
  const owner = annotationView(row).reviewer ?? null;
  // A signed note is checked by its author only: a request that names no one
  // can't reopen someone else's note.
  if (owner && (!by || by.toLowerCase() !== owner.toLowerCase())) return apiError(`this note is ${owner}'s; only they can check it`, 403);
  const payload = parseStored(row.payload, {});
  if (!payload || typeof payload !== "object") return apiError("this note's stored data is unreadable; not overwriting it", 409);
  const message = String(body.message ?? "").trim().slice(0, MAX_COMMENT);
  const at = replyMs(ts);
  payload.verdict = { verdict, at, ...(by ? { by } : {}), ...(message ? { message } : {}) };

  if (verdict === "not-yet") {
    const replies = parseStored(row.replies, []);
    if (!Array.isArray(replies)) return apiError("this note's reply thread is unreadable; not overwriting it", 409);
    replies.push({ from: "reviewer", message: message || "Reopened: not right yet.", ts: at, reopen: true, ...(by ? { name: by } : {}) });
    payload.reopenedFrom = { status: row.status, resolution: row.resolution ?? null, at: replyMs(row.updated_at) };
    payload.reopenedAt = at;
    await env.DB.prepare("UPDATE ag_annotations SET status = 'pending', resolution = NULL, replies = ?, payload = ?, updated_at = ? WHERE id = ?")
      .bind(JSON.stringify(fitReplies(replies)), fitPayload(payload), ts, row.id).run();
  } else {
    await env.DB.prepare("UPDATE ag_annotations SET payload = ?, updated_at = ? WHERE id = ?")
      .bind(fitPayload(payload), ts, row.id).run();
  }
  await touchSession(env, row.session_id, ts);
  const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first();
  const view = annotationView(fresh);
  onEvent?.("annotation", { action: verdict === "not-yet" ? "reopened" : "checked", sessionId: row.session_id, annotation: view });
  return json(view);
}

/**
 * Handle one request under `<base>/__ag/`. `rest` is the path after `__ag/`.
 * `site` is `{ id: <project name>, agentation: true }` (server/store.js).
 */
export async function handleAgentationApi(ctx) {
  try {
    return await route(ctx);
  } catch (e) {
    if (e instanceof TooLarge) return ctx.apiError(e.message, 413);
    throw e;
  }
}

async function route({ request, env, site, token, rest, json, apiError, now, onEvent }) {
  if (!site.agentation) return apiError("agentation is not enabled for this project", 404);

  const ts = now();
  const parts = rest.split("/").filter(Boolean);
  const method = request.method;

  // ---- GET /health -----------------------------------------------------
  // Polled every 10s purely to colour the toolbar's connection dot. Cheap and
  // uncached: a cached 200 would keep showing "connected" after an outage.
  if (parts[0] === "health" && parts.length === 1) {
    return json({ ok: true, service: "show-and-tell" }, 200, { "Cache-Control": "no-store" });
  }

  // ---- POST /sessions --------------------------------------------------
  if (parts[0] === "sessions" && parts.length === 1) {
    // ---- GET /sessions — every page of this project, for the inbox.
    //
    // A reviewer's session is one page, but a review round spans the whole
    // project: an agent's question about /pricing must reach someone reading /,
    // and "what's still open" is a question about the project, not the tab. Scoped
    // to `site.id` like every other read, so it shows nothing a reviewer could
    // not already reach by navigating to each page.
    if (method === "GET") {
      const { results: sessions } = await env.DB.prepare(
        "SELECT * FROM ag_sessions WHERE site_id = ? ORDER BY updated_at DESC LIMIT 200",
      ).bind(site.id).all();
      const author = readAuthor(request.url);
      const out = [];
      for (const row of sessions) {
        const annotations = await loadAnnotations(env, row.id, author);
        if (annotations.length) out.push(sessionView(row, annotations));
      }
      return json({ sessions: out }, 200, { "Cache-Control": "no-store" });
    }
    if (method !== "POST") return apiError("method not allowed", 405);
    const body = objectBody(await request.json().catch(() => ({})));
    const url = String(body.url ?? "").slice(0, 2048);
    if (!url) return apiError("url required", 422);
    // The agent reads every session's page from this: it has to be a web URL.
    try { if (!/^https?:$/.test(new URL(url).protocol)) throw 0; } catch { return apiError("url must be an http(s) URL", 422); }
    // Refused rather than silently re-homed onto this site: the annotations
    // behind it are real feedback about a DIFFERENT page, and quietly accepting
    // them is how they end up in the wrong owner's queue.
    if (!belongsToLink(url, token)) {
      return apiError("url does not belong to this site", 422);
    }
    const pageKey = typeof body.pageKey === "string" && body.pageKey ? body.pageKey.slice(0, 1024) : null;
    const row = await findOrCreateSession(env, site.id, url, ts, pageKey);
    return json(sessionView(row, await loadAnnotations(env, row.id, readAuthor(request.url))));
  }

  // ---- GET /sessions/:id  ·  POST /sessions/:id/annotations ------------
  if (parts[0] === "sessions" && parts.length >= 2) {
    const sessionId = parts[1];
    const session = await env.DB.prepare(
      "SELECT * FROM ag_sessions WHERE id = ? AND site_id = ?",
    ).bind(sessionId, site.id).first();
    if (!session) return apiError("session not found", 404);

    if (parts.length === 2 && method === "GET") {
      return json(sessionView(session, await loadAnnotations(env, session.id, readAuthor(request.url))));
    }

    // ---- GET /sessions/:id/events  (SSE) -------------------------------
    if (parts[2] === "events" && parts.length === 3 && method === "GET") {
      // EventSource sets the header on reconnect; the query param is for
      // anything driving the stream by hand.
      const resume = request.headers.get("Last-Event-ID")
        || new URL(request.url).searchParams.get("lastEventId");
      return eventStream(env, session.id, resume);
    }

    if (parts[2] === "annotations" && parts.length === 3 && method === "POST") {
      const body = objectBody(await request.json().catch(() => ({})));
      const comment = String(body.comment ?? "").slice(0, MAX_COMMENT);
      // Who left it (several reviewers). A short line or nothing; see reviewer.js.
      const reviewer = cleanReviewer(body.reviewer);
      if (reviewer) body.reviewer = reviewer; else delete body.reviewer;
      // A tweak's fields are rendered into the agent's CLI and MCP text: keep
      // them short strings (or flags), whatever a client sent.
      if (body.tweak !== undefined) body.tweak = cleanTweak(body.tweak);
      // So is a playhead (a page with its own timeline): numbers and short names only.
      if (body.playhead !== undefined) { const at = cleanPlayhead(body.playhead); if (at) body.playhead = at; else delete body.playhead; }
      let payload = fitPayload(body);
      const clientId = body.id != null ? String(body.id).slice(0, 128) : null;

      // ---- Re-syncing the same client annotation is an UPDATE, not a second row.
      //
      // ⚠️ The toolbar re-POSTs layout annotations on EVERY page load, and it is
      // not a bug on its side: placements and rearranges live in localStorage,
      // while the map from a placement to its server id
      // (`placementAnnotationMap`) is a `useRef` — memory only. On reload the
      // stored drag has no mapping, so it syncs as new. Measured: one accidental
      // placement, one refresh, two rows.
      //
      // The duplicate rows were the visible half. The worse half was that the
      // layout-intent prompt keys "I already asked about this drag" on the
      // SERVER id, so a fresh id per load meant being asked to explain the same
      // drag on every single reload, forever — reported as "it doesn't go away
      // when I dismiss it", which is exactly what it looks like from the page.
      //
      // Only the toolbar-generated fields are refreshed. `intent`, `severity`,
      // `note`, `status` and `replies` are left alone: the toolbar sends a
      // hardcoded `intent: "change"` on every layout annotation, so trusting the
      // body here would erase the reviewer's real answer — the same reason the
      // prompt writes to `note` rather than `comment`.
      if (clientId) {
        const existing = await env.DB.prepare(
          `SELECT * FROM ag_annotations
            WHERE session_id = ? AND client_id = ? AND author = 'reviewer'
            ORDER BY created_at ASC`,
        ).bind(session.id, clientId).first();
        if (existing) {
          // The note keeps the name it was first sent with. Layout drags live
          // in shared `agentation-design-*` keys, so a SECOND reviewer's browser
          // re-syncs the first one's drags on load, signed with its own name.
          let kept = null;
          try { kept = cleanReviewer(JSON.parse(existing.payload || "{}").reviewer); } catch { /* corrupt */ }
          if (kept !== (body.reviewer ?? null)) {
            const { reviewer: _drop, ...rest } = body;
            payload = fitPayload(kept ? { ...rest, reviewer: kept } : rest);
          }
          // The reviewer's verdict (Check the fix) is ours, not the toolbar's: keep it.
          const prior = parseStored(existing.payload, {}) || {};
          const owned = [...VERDICT_FIELDS, ...AGENT_FIELDS].filter((k) => k in prior);
          if (owned.length) payload = fitPayload({ ...JSON.parse(payload), ...Object.fromEntries(owned.map((k) => [k, prior[k]])) });
          await env.DB.prepare(
            `UPDATE ag_annotations
                SET comment = ?, element = ?, element_path = ?, payload = ?, updated_at = ?
              WHERE id = ?`,
          ).bind(
            comment,
            String(body.element ?? "").slice(0, 256),
            String(body.elementPath ?? body.element_path ?? "").slice(0, 2048),
            payload,
            ts,
            existing.id,
          ).run();
          await touchSession(env, session.id, ts);
          const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?")
            .bind(existing.id).first();
          const resynced = annotationView(fresh);
          onEvent?.("annotation", {
            action: "resynced",
            sessionId: session.id,
            url: session.url,
            annotation: resynced,
          });
          // 200, not 201 — nothing was created. The toolbar only reads `.id`
          // off this response, which is the point: it gets the id it already had.
          return json(resynced, 200);
        }
      }

      // Bound what one project can accumulate. A runaway page script looping
      // annotation.add would otherwise be an unauthenticated write amplifier.
      // ⚠️ Checked AFTER the re-sync branch: an update adds no row, and a project
      // sitting at the cap must still be able to re-sync the drags it has.
      const count = await env.DB.prepare(
        "SELECT COUNT(*) AS n FROM ag_annotations WHERE site_id = ?",
      ).bind(site.id).first();
      if ((count?.n ?? 0) >= MAX_ANNOTATIONS_PER_SITE) {
        return apiError("too many annotations for this project", 409);
      }

      const id = randomId("ann");
      // `author` is hardcoded, never read from the body. This is the reviewer's
      // surface — reachable by anyone who can load the page — and a caller able
      // to claim `author: 'agent'` could plant notes that render as the agent's
      // own critique. Agent rows are written only by `createAgentAnnotations`,
      // called from server/agent.js (the CLI and MCP), never over HTTP.
      await env.DB.prepare(
        `INSERT INTO ag_annotations
           (id, client_id, session_id, site_id, kind, comment, element, element_path,
            intent, severity, status, resolution, replies, author, payload, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,'pending',NULL,'[]','reviewer',?,?,?)`,
      ).bind(
        id,
        clientId,
        session.id,
        site.id,
        String(body.kind ?? "feedback").slice(0, 32),
        comment,
        String(body.element ?? "").slice(0, 256),
        String(body.elementPath ?? body.element_path ?? "").slice(0, 2048),
        body.intent != null ? String(body.intent).slice(0, 64) : null,
        body.severity != null ? String(body.severity).slice(0, 64) : null,
        payload,
        ts,
        ts,
      ).run();
      await touchSession(env, session.id, ts);
      const row = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(id).first();
      const view = annotationView(row);
      // Push, so nothing downstream has to poll for this.
      onEvent?.("annotation", {
        action: "created",
        sessionId: session.id,
        url: session.url,
        annotation: view,
      });
      return json(view, 201);
    }

    return apiError("not found", 404);
  }

  // ---- POST /annotations/:id/reply  (reviewer answering the agent) ------
  //
  // The one write on the public path that appends rather than edits. An agent
  // can already ask a clarifying question; without this the reviewer has no way
  // to answer it except out of band, which is the round trip the whole feature
  // exists to remove. It cannot change `status` — answering a question is not
  // the same as declaring it handled.
  if (parts[0] === "annotations" && parts[2] === "reply" && parts.length === 3) {
    if (method !== "POST") return apiError("method not allowed", 405);
    const row = await findAnnotation(env, site.id, parts[1]);
    if (!row) return apiError("annotation not found", 404);
    const body = objectBody(await request.json().catch(() => ({})));
    const message = String(body.message ?? "").trim().slice(0, MAX_COMMENT);
    if (!message) return apiError("message required", 422);

    // A thread that no longer parses is refused rather than restarted: starting
    // clean would save over the only copy of everything already said.
    const replies = parseStored(row.replies, []);
    if (!Array.isArray(replies)) return apiError("this note's reply thread is unreadable; not overwriting it", 409);
    const name = cleanReviewer(body.name);
    replies.push({ from: "reviewer", message, ts: replyMs(ts), ...(name ? { name } : {}) });
    await env.DB.prepare("UPDATE ag_annotations SET replies = ?, updated_at = ? WHERE id = ?")
      .bind(JSON.stringify(fitReplies(replies)), ts, row.id).run();
    await touchSession(env, row.session_id, ts);

    const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first();
    const view = annotationView(fresh);
    onEvent?.("annotation", { action: "replied", sessionId: row.session_id, annotation: view });
    return json(view);
  }

  // ---- POST /annotations/:id/withdraw  (reviewer taking a drag back) ----
  //
  // Layout mode is the one place a reviewer can say something by accident. A
  // stray click in placement mode drops a component onto the page, and that
  // lands as real feedback the owner is now expected to act on. Until this
  // route there was no way to take it back from anywhere except the toolbar's
  // own ✕ on the placement box — visible only while layout mode is open and the
  // box is on screen, and absent entirely for a rearrange (whose only undo is
  // dragging the section back to within a pixel of where it started).
  //
  // ⚠️ IT MUST BE A TOMBSTONE, NOT A DELETE. A removed row emits no SSE frame — so the toolbar never learns,
  // the placement stays in its React state and its localStorage, and the next
  // page load re-POSTs it as a new annotation. Setting `dismissed` is what the
  // toolbar actually listens for: on that frame it reverse-looks-up the
  // placement (or section), drops it from state, and the save effect then clears
  // it from storage — which the KV bridge mirrors, so it is gone for every
  // viewer rather than just this tab. Verified against `agentation@3.0.2`'s own
  // event handler.
  //
  // The inbox permits rejection of reviewer comments and text edits as well as
  // layout changes. Author and terminal-state guards still apply.
  if (parts[0] === "annotations" && parts[2] === "withdraw" && parts.length === 3) {
    if (method !== "POST") return apiError("method not allowed", 405);
    const row = await findAnnotation(env, site.id, parts[1]);
    if (!row) return apiError("annotation not found", 404);
    if (!WITHDRAWABLE_KINDS.has(row.kind)) {
      return apiError("only reviewer feedback can be withdrawn", 422);
    }
    if ((row.author ?? "reviewer") !== "reviewer") {
      return apiError("only a reviewer's own change can be withdrawn", 422);
    }
    // Already gone — idempotent, so a double-click or a retry is not an error.
    if (row.status === "dismissed") return json(annotationView(row));
    await env.DB.prepare(
      "UPDATE ag_annotations SET status = 'dismissed', resolution = ?, updated_at = ? WHERE id = ?",
    ).bind("Withdrawn by the reviewer — the drag was not intended.", ts, row.id).run();
    await touchSession(env, row.session_id, ts);
    const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first();
    const view = annotationView(fresh);
    onEvent?.("annotation", { action: "withdrawn", sessionId: row.session_id, annotation: view });
    return json(view);
  }

  // ---- POST /annotations/:id/verdict  (reviewer checking the agent's fix) ----
  if (parts[0] === "annotations" && parts[2] === "verdict" && parts.length === 3) {
    if (method !== "POST") return apiError("method not allowed", 405);
    const row = await findAnnotation(env, site.id, parts[1]);
    if (!row) return apiError("annotation not found", 404);
    const body = objectBody(await request.json().catch(() => ({})));
    return recordVerdict({ env, row, body, ts, onEvent, json, apiError });
  }

  // ---- POST /annotations/:id/decision  (the reviewer deciding a critique note)
  //
  // show-and-tell.pen 9.1: every note from the agent ends in a decision.
  //   fix           a REVIEWER note on the same target joins the round, marked
  //                 `fromCritique`, and the critique note closes as decided.
  //                 `comment` is the reviewer's own words (Fix it my way);
  //                 `draft: "text" | "tweak"` records that the suggested change
  //                 went into the reviewer's drafts instead, which reach the
  //                 agent as an ordinary edit on Send, so no note is made here.
  //   not-an-issue  closes it dismissed, with the reviewer's optional reason.
  //   discuss       recorded only; the thread is /reply.
  //   undo          reopens it, and tombstones the note Fix it made.
  //
  // ⚠️ This is the one place the page's side may close a row, and only an
  // AGENT row. The agent's opinion is the reviewer's to decide (the reverse of
  // a reviewer's note, which only the developer may close), so it is refused
  // for any other author, and every decision says who made it and can be undone.
  if (parts[0] === "annotations" && parts[2] === "decision" && parts.length === 3) {
    if (method !== "POST") return apiError("method not allowed", 405);
    const row = await findAnnotation(env, site.id, parts[1]);
    if (!row) return apiError("annotation not found", 404);
    if ((row.author ?? "reviewer") !== "agent") return apiError("only the agent's critique takes a decision", 422);
    const body = objectBody(await request.json().catch(() => ({})));
    const decision = String(body.decision ?? "");
    if (!DECISIONS.includes(decision)) return apiError(`decision must be one of ${DECISIONS.join(", ")}`, 422);
    const payload = parseStored(row.payload, {});
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return apiError("this note's stored data is unreadable; not overwriting it", 409);
    const reviewer = cleanReviewer(body.reviewer);
    const at = replyMs(ts);
    const closed = row.status === "resolved" || row.status === "dismissed";
    const save = (status, resolution, next) => env.DB.prepare(
      "UPDATE ag_annotations SET status = ?, resolution = ?, payload = ?, updated_at = ? WHERE id = ?",
    ).bind(status, resolution, fitPayload(next), ts, row.id);
    const by = reviewer ? ` (${reviewer})` : "";
    let note = null;

    if (decision === "undo") {
      const prior = payload.decision;
      if (!prior) return json(annotationView(row)); // nothing to undo: idempotent
      const statements = [];
      if (prior.noteId) {
        const made = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ? AND site_id = ?").bind(prior.noteId, site.id).first();
        if (made && made.status === "resolved") return apiError("the agent already handled the note Fix it made; it can't be taken back", 409);
        if (made && made.status !== "dismissed") {
          statements.push(env.DB.prepare("UPDATE ag_annotations SET status = 'dismissed', resolution = ?, updated_at = ? WHERE id = ?")
            .bind(`Undone by ${reviewer || "the reviewer"}: Fix it taken back.`, ts, made.id));
          note = { id: made.id, sessionId: made.session_id };
        }
      }
      const { decision: _undone, ...rest } = payload;
      statements.push(save("pending", null, rest));
      await env.DB.batch(statements);
    } else if (decision === "discuss") {
      // Discuss only opens the thread. On a decided note it must not replace
      // the decision: Undo needs its noteId to take back the note Fix it made.
      if (closed || (payload.decision && payload.decision.decision !== "discuss")) return apiError("this critique note is already decided; undo it first", 409);
      await save(row.status, row.resolution ?? null, { ...payload, decision: { decision, ...(reviewer ? { reviewer } : {}), at } }).run();
    } else {
      if (closed) return apiError("this critique note is already decided; undo it first", 409);
      if (decision === "not-an-issue") {
        const reason = String(body.reason ?? "").trim().slice(0, MAX_COMMENT);
        await save("dismissed", reason ? `Not an issue${by}: ${reason}` : `Not an issue${by}.`,
          { ...payload, decision: { decision, ...(reason ? { reason } : {}), ...(reviewer ? { reviewer } : {}), at } }).run();
      } else {
        const draft = body.draft === "text" || body.draft === "tweak" ? body.draft : null;
        const own = String(body.comment ?? "").trim().slice(0, MAX_COMMENT);
        const record = { decision, ...(reviewer ? { reviewer } : {}), at, ...(own ? { comment: own } : {}) };
        const statements = [];
        if (draft) {
          record.draft = draft;
          statements.push(save("resolved", `Fix it${by}: the suggested change is in the reviewer's ${draft === "text" ? "Edit text" : "Tweak"} drafts.`, { ...payload, decision: record }));
        } else {
          const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM ag_annotations WHERE site_id = ?").bind(site.id).first();
          if ((count?.n ?? 0) >= MAX_ANNOTATIONS_PER_SITE) return apiError("too many annotations for this project", 409);
          // Where the toolbar draws the note's marker: the reviewer's browser
          // measured the target, the only one that can.
          const hint = body.note && typeof body.note === "object" ? body.note : {};
          const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : undefined);
          const viewport = hint.viewport && typeof hint.viewport === "object"
            ? { width: num(hint.viewport.width), height: num(hint.viewport.height), name: String(hint.viewport.name ?? "").slice(0, 16) || undefined }
            : undefined;
          const id = randomId("ann");
          record.noteId = id;
          const notePayload = {
            fromCritique: row.id,
            ...(payload.selector ? { selector: payload.selector } : {}),
            ...(num(hint.x) !== undefined ? { x: num(hint.x) } : {}),
            ...(num(hint.y) !== undefined ? { y: num(hint.y) } : {}),
            ...(hint.isFixed === true ? { isFixed: true } : {}),
            ...(viewport?.width ? { viewport } : {}),
            ...(typeof hint.url === "string" ? { url: hint.url.slice(0, 2048) } : {}),
            ...(reviewer ? { reviewer } : {}),
          };
          statements.push(env.DB.prepare(
            `INSERT INTO ag_annotations
               (id, client_id, session_id, site_id, kind, comment, element, element_path,
                intent, severity, status, resolution, replies, author, payload, created_at, updated_at)
             VALUES (?,NULL,?,?,'feedback',?,?,?,'fix',?,'pending',NULL,'[]','reviewer',?,?,?)`,
          ).bind(id, row.session_id, site.id, own || row.comment || "", row.element ?? "", row.element_path ?? "",
            row.severity ?? null, fitPayload(notePayload), ts, ts));
          statements.push(save("resolved", `Fix it${by}: in the reviewer's round as ${id}.`, { ...payload, decision: record }));
          note = { id, sessionId: row.session_id };
        }
        await env.DB.batch(statements);
      }
    }
    await touchSession(env, row.session_id, ts);
    const fresh = annotationView(await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first());
    onEvent?.("annotation", { action: "decided", sessionId: row.session_id, annotation: fresh });
    let made = null;
    if (note) {
      made = annotationView(await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(note.id).first());
      onEvent?.("annotation", { action: decision === "undo" ? "withdrawn" : "created", sessionId: note.sessionId, annotation: made });
    }
    // `fixNote`, not `note`: a row's `note` is the reviewer's words on a layout drag.
    return json({ ...fresh, ...(made ? { fixNote: made } : {}) });
  }

  // ---- PATCH / DELETE /annotations/:id ---------------------------------
  if (parts[0] === "annotations" && parts.length === 2) {
    const row = await findAnnotation(env, site.id, parts[1]);
    if (!row) return apiError("annotation not found", 404);

    // ---- DELETE: the toolbar's "Clear all" and its per-note delete --------
    //
    // ⚠️ A TOMBSTONE, like /withdraw, never a row removal. Clear all sends a
    // DELETE for every note the toolbar shows, and the toolbar shows every
    // reviewer's notes on the page — so a hard delete let one reviewer wipe
    // another's notes, the agent's questions and the answers to them, with no
    // record left for `feedback list --all`. A removed row also emits no SSE
    // frame, so other open tabs never learned it was gone.
    //
    // Now: the row becomes `dismissed` and keeps its replies; agent rows and
    // closed rows are refused exactly as PATCH refuses them; and a request that
    // names a reviewer (`?reviewer=` or the `X-Agentation-Reviewer` header) may
    // only clear notes signed with that name. A request with no name, from a
    // toolbar that predates the parameter, is still allowed to clear, as is any
    // unsigned note.
    if (method === "DELETE") {
      if ((row.author ?? "reviewer") !== "reviewer") return apiError("agent feedback is read-only", 403);
      if (["resolved", "dismissed"].includes(row.status)) return apiError("feedback is already closed", 409);
      const asking = cleanReviewer(new URL(request.url).searchParams.get("reviewer") ?? request.headers.get("x-agentation-reviewer"));
      const owner = annotationView(row).reviewer ?? null;
      if (asking && owner && asking.toLowerCase() !== owner.toLowerCase()) {
        return apiError(`this note is ${owner}'s; only they can clear it`, 403);
      }
      await env.DB.prepare(
        "UPDATE ag_annotations SET status = 'dismissed', resolution = ?, updated_at = ? WHERE id = ?",
      ).bind(`Cleared by ${asking || owner || "the reviewer"}.`, ts, row.id).run();
      await touchSession(env, row.session_id, ts);
      const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first();
      const view = annotationView(fresh);
      onEvent?.("annotation", { action: "cleared", sessionId: row.session_id, annotation: view });
      // `ok` kept from when this answered `{ ok: true }`; the toolbar only checks the status.
      return json({ ...view, ok: true });
    }

    if (method === "PATCH") {
      if ((row.author ?? "reviewer") !== "reviewer") return apiError("agent feedback is read-only", 403);
      if (["resolved", "dismissed"].includes(row.status)) return apiError("feedback is already closed", 409);
      const body = objectBody(await request.json().catch(() => ({})));
      // Only the reviewer-owned fields. `status` is absent on purpose: a viewer
      // editing their note must not be able to mark it resolved, and the toolbar
      // re-syncing a locally-stale copy must not silently reopen it either.
      const sets = [];
      const binds = [];
      let updatedPayload = null;
      // A note syncs before the name prompt is answered. Attach that first
      // name explicitly; re-syncs and later name changes must keep its author.
      if ("reviewer" in body) {
        const payload = parseStored(row.payload, {});
        if (!payload || typeof payload !== "object") return apiError("this note's stored data is unreadable; not overwriting it", 409);
        const reviewer = cleanReviewer(body.reviewer);
        if (reviewer && !cleanReviewer(payload.reviewer)) {
          payload.reviewer = reviewer;
          updatedPayload = payload;
        }
      }
      if ("comment" in body) {
        sets.push("comment = ?");
        binds.push(String(body.comment ?? "").slice(0, MAX_COMMENT));
      }
      // The whole point of the field: a layout annotation's `comment` is
      // written and rewritten by the toolbar, so the reviewer's instruction has
      // to land somewhere the toolbar will not touch on the next drag.
      if ("note" in body) { sets.push("note = ?"); binds.push(body.note == null ? null : String(body.note).slice(0, MAX_COMMENT)); }
      if ("intent" in body) { sets.push("intent = ?"); binds.push(body.intent == null ? null : String(body.intent).slice(0, 64)); }
      if ("severity" in body) { sets.push("severity = ?"); binds.push(body.severity == null ? null : String(body.severity).slice(0, 64)); }
      if ("elementPath" in body) { sets.push("element_path = ?"); binds.push(String(body.elementPath ?? "").slice(0, 2048)); }
      if ("edit" in body && row.kind === "edit") {
        const current = annotationView(row).edit;
        if (!current || typeof body.edit?.to !== "string" || body.edit.to.length > MAX_COMMENT) return apiError("invalid text edit", 422);
        const payload = updatedPayload || parseStored(row.payload, {});
        if (!payload || typeof payload !== "object") return apiError("this note's stored data is unreadable; not overwriting it", 409);
        payload.edit = { ...current, to: body.edit.to };
        updatedPayload = payload;
      }
      // A copy edit revised in the copy view before the agent got to it.
      if ("copy" in body && row.kind === "copy") {
        const current = annotationView(row).copy;
        if (!current || typeof body.copy?.to !== "string" || body.copy.to.length > MAX_COMMENT) return apiError("invalid copy edit", 422);
        const payload = updatedPayload || parseStored(row.payload, {});
        if (!payload || typeof payload !== "object") return apiError("this note's stored data is unreadable; not overwriting it", 409);
        payload.copy = { ...current, to: body.copy.to };
        updatedPayload = payload;
      }
      // A reviewer rewording their own note after it was sent makes it new
      // again for the next Send (review-tools.js counts revisedAt). A re-sync
      // that changes nothing leaves it alone.
      const prior = annotationView(row);
      const revised = ("comment" in body && String(body.comment ?? "").slice(0, MAX_COMMENT) !== (row.comment ?? ""))
        || ("note" in body && (body.note == null ? null : String(body.note).slice(0, MAX_COMMENT)) !== (row.note ?? null))
        || ("edit" in body && row.kind === "edit" && body.edit?.to !== prior.edit?.to)
        || ("copy" in body && row.kind === "copy" && body.copy?.to !== prior.copy?.to);
      if (revised) {
        const payload = updatedPayload || parseStored(row.payload, {});
        if (payload && typeof payload === "object" && !Array.isArray(payload)) { payload.revisedAt = replyMs(ts); updatedPayload = payload; }
      }
      if (updatedPayload) { sets.push("payload = ?"); binds.push(fitPayload(updatedPayload)); }
      if (!sets.length) return json(annotationView(row));
      sets.push("updated_at = ?");
      binds.push(ts, row.id);
      await env.DB.prepare(`UPDATE ag_annotations SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
      await touchSession(env, row.session_id, ts);
      const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(row.id).first();
      return json(annotationView(fresh));
    }

    return apiError("method not allowed", 405);
  }

  return apiError("not found", 404);
}

/**
 * Critique mode — the agent writing annotations of its own.
 *
 * Upstream implements this by opening a headed browser and click-driving the
 * toolbar, because their server has no agent-create path and the marker's
 * position (`x` as a % of viewport width, `y` in document px) only exists once
 * something has laid the page out. We own the server, so we can skip the
 * browser — but not the coordinates, which nothing on this side can know.
 *
 * The way out is to anchor on a **CSS selector** instead and let the reviewer's
 * own browser resolve it at load: their viewport is the only one whose numbers
 * were ever meaningful. An annotation with no selector is page-level — it gets
 * no marker and lives in the critique list, which is the honest rendering of
 * "the spacing is inconsistent throughout" anyway.
 *
 * Written in a batch because a critique IS a batch: a pass over a page is five
 * to eight observations, and creating them one call at a time gives the reviewer
 * a panel that grows under them while they read it.
 *
 * @param {object} opts
 * @param {string} opts.siteId
 * @param {string} opts.url        page the critique is about — the session key
 * @param {Array}  opts.items      [{selector?, comment, kind?, intent?, severity?, element?}]
 * @param {boolean} opts.replace   drop this session's previous critique first
 * @param {string}  [opts.pageKey] the page key when the project routes by query
 *                                 (`serve --route-key id`), so a critique for
 *                                 /iframe.html?id=b lands in story b's session
 */
export async function createAgentAnnotations(env, { siteId, url, items, replace = false, ts, pageKey = null }) {
  if (!Array.isArray(items) || !items.length) return { error: "annotations required" };
  if (items.length > 50) return { error: "too many annotations in one critique (max 50)" };
  const withComment = items.filter((it) => String(it?.comment ?? "").trim());
  if (withComment.length !== items.length) return { error: "every annotation needs a comment" };
  const suggestions = items.map((it) => cleanSuggestion(it?.suggestion));
  const bad = suggestions.find((r) => r.error);
  if (bad) return { error: bad.error };

  const session = await findOrCreateSession(env, siteId, url, ts, pageKey);
  if (!session) return { error: "could not open a session for that url" };

  // Re-running a critique should read as a new opinion, not as the old one plus
  // a new one. Scoped to agent rows: a replace that swept up the reviewer's
  // notes would destroy the only copy of them.
  if (replace) {
    await env.DB.prepare(
      "DELETE FROM ag_annotations WHERE session_id = ? AND author = 'agent'",
    ).bind(session.id).run();
  }

  const count = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM ag_annotations WHERE site_id = ?",
  ).bind(siteId).first();
  if ((count?.n ?? 0) + items.length > MAX_ANNOTATIONS_PER_SITE) {
    return { error: "too many annotations for this project" };
  }

  const ids = [];
  const statements = items.map((it, i) => {
    const id = randomId("ann");
    ids.push(id);
    const selector = it.selector ? String(it.selector).slice(0, 2048) : null;
    // The payload is what the overlay reads. `anchor` says how to place the
    // marker; `selector` is the only positioning information an agent can give.
    // Bounded by construction (selector ≤ 2048), so it always serializes whole.
    const payload = JSON.stringify({
      selector,
      anchor: selector ? "selector" : "page",
      ...(suggestions[i].suggestion ? { suggestion: suggestions[i].suggestion } : {}),
    });
    return env.DB.prepare(
      `INSERT INTO ag_annotations
         (id, client_id, session_id, site_id, kind, comment, element, element_path,
          intent, severity, status, resolution, replies, author, payload, created_at, updated_at)
       VALUES (?,NULL,?,?,?,?,?,?,?,?,'pending',NULL,'[]','agent',?,?,?)`,
    ).bind(
      id,
      session.id,
      siteId,
      String(it.kind ?? "critique").slice(0, 32),
      String(it.comment).slice(0, MAX_COMMENT),
      String(it.element ?? "").slice(0, 256),
      selector ?? "",
      it.intent != null ? String(it.intent).slice(0, 64) : null,
      it.severity != null ? String(it.severity).slice(0, 64) : null,
      payload,
      ts,
      ts,
    );
  });
  // One transaction: a critique is the one place we knowingly issue N inserts
  // at once, and a reviewer should never see half of one.
  await env.DB.batch(statements);
  await touchSession(env, session.id, ts);

  const { results } = await env.DB.prepare(
    `SELECT * FROM ag_annotations WHERE id IN (${ids.map(() => "?").join(",")})`,
  ).bind(...ids).all();
  // ⚠️ Ordered by `ids`, NOT by `created_at`. The column is whole seconds and a
  // batch is written inside one, so every row in a critique shares a timestamp
  // and `ORDER BY created_at` returns them in whatever order the database felt
  // like — which is a numbered list whose numbers move between reads.
  const byId = new Map(results.map((r) => [r.id, r]));
  return {
    sessionId: session.id,
    url: session.url,
    annotations: ids.map((id) => byId.get(id)).filter(Boolean).map(annotationView),
  };
}

/**
 * Agent-side operations: resolve, dismiss, acknowledge, reply.
 *
 * Called from server/agent.js (the `feedback` CLI and the MCP server), never from
 * the HTTP handler above. Kept here, beside the reviewer's routes, so both sides
 * share one definition of the lifecycle rather than each re-deriving what
 * "resolved" means. Returns null for an unknown id and `{ error, status }` for a
 * refusal.
 */
export async function agentUpdateAnnotation(env, annotationId, { status, resolution, reply, plan = false, shot, ts }) {
  const row = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(annotationId).first();
  if (!row) return null;

  const sets = ["updated_at = ?"];
  const binds = [ts];

  if (status) {
    if (!AG_STATUSES.includes(status)) return { error: `unknown status: ${status}` };
    sets.push("status = ?");
    binds.push(status);
  }
  if (resolution !== undefined) {
    sets.push("resolution = ?");
    binds.push(resolution == null ? null : String(resolution).slice(0, MAX_COMMENT));
  }
  if (reply) {
    const replies = parseStored(row.replies, []);
    if (!Array.isArray(replies)) return { error: `${annotationId}'s reply thread is unreadable; not overwriting it.`, status: 409 };
    // A plan ("Here's what I'll do: …") asks for a go-ahead, not an answer: the toolbar offers Go ahead.
    replies.push({ from: "agent", message: String(reply).slice(0, MAX_COMMENT), ts: replyMs(ts), ...(plan ? { plan: true } : {}) });
    let fitted;
    try { fitted = fitReplies(replies); } catch (e) { return { error: e.message, status: 413 }; }
    sets.push("replies = ?");
    binds.push(JSON.stringify(fitted));
  }

  if (shot) {
    // The agent's proof (server/shots.js): one per kind, the newer replacing the older.
    const payload = parseStored(row.payload, {});
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { error: `${annotationId}'s payload is unreadable; not overwriting it.`, status: 409 };
    const prev = payload.shots && typeof payload.shots === "object" ? payload.shots : {};
    payload.shots = { ...prev, [shot.kind]: shot };
    sets.push("payload = ?");
    binds.push(JSON.stringify(payload));
  }

  binds.push(annotationId);
  await env.DB.prepare(`UPDATE ag_annotations SET ${sets.join(", ")} WHERE id = ?`).bind(...binds).run();
  const fresh = await env.DB.prepare("SELECT * FROM ag_annotations WHERE id = ?").bind(annotationId).first();
  return annotationView(fresh);
}
