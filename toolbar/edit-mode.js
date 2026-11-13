import { viewport } from "./viewport.js";
import { playhead } from "./playhead.js";
import { pageKey } from "./page-key.js";
/**
 * Direct text editing for any agentation link.
 *
 * Annotating says "this line is wrong". Editing says "it should say this
 * instead" — which is both faster for the reviewer and unambiguous for whoever
 * acts on it. This ships in the same bundle as the toolbar so every link with
 * agentation on gets it, rather than each page hand-rolling its own.
 *
 * TWO LAYERS, and the distinction is the whole design:
 *
 *   overlay   Typing saves immediately to the link's shared KV, so the change
 *             is live for everyone and survives a reload. It is NOT in the
 *             source — it is a patch applied on top of it.
 *
 *   commit    Turns the pending diffs into `kind:"edit"` annotations. Now they
 *             are in the same queue as every other piece of feedback: an agent
 *             reads them with `agentation_get_all_pending`, writes them into
 *             the source, and resolves them. The overlay then drops away
 *             because the source finally says it.
 *
 * Without the commit step an overlay is permanently load-bearing, and the first
 * republish that rewrites that sentence silently retires the edit. Commit is
 * what makes an edit durable rather than sticky.
 */

import { markChrome } from "./ui.js";
import { reviewerName, ensureReviewer, isMine } from "./reviewer.js";

const NS = "agentation-edit_";
const PENDING = "agentation-editpending_";

// Elements whose text is chrome, not content.
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "INPUT", "TEXTAREA", "SELECT", "OPTION",
  "LABEL", "SVG", "PATH", "VIDEO", "AUDIO", "SOURCE", "IMG", "PICTURE", "CANVAS",
  "IFRAME", "TRACK", "OBJECT", "EMBED",
]);
// Inline formatting is part of a text leaf, not a child block.
const INLINE_OK = new Set([
  "B", "I", "EM", "STRONG", "SPAN", "A", "BR", "U", "SUB", "SUP", "MARK", "SMALL",
  "CODE", "ABBR", "TIME", "S", "DEL", "INS", "KBD", "WBR", "Q", "VAR", "SAMP", "BDI", "BDO",
]);
// Our own UI, and anything a page has explicitly fenced off.
const SKIP_ZONE = "#agentation-root, [data-agentation-root], .sk-edit-ui, [data-sk-no-edit]";

const collapse = (s) => (s || "").replace(/\s+/g, " ").trim();

/**
 * Parse untrusted HTML WITHOUT running it.
 *
 * `div.innerHTML = html` on a detached node still fetches `src`/`href`
 * subresources, so `<img src=x onerror=…>` fires even though nothing was ever
 * appended to the document. A `DOMParser` document is inert: no fetches, no
 * script, no event handlers. Every read of stored overlay HTML goes through it.
 */
function parseInert(html) {
  return new DOMParser().parseFromString(String(html ?? ""), "text/html");
}

/**
 * Put `html` into `node` without replacing text nodes a framework still holds.
 *
 * ⚠️ `innerHTML =` swaps every child for a new node. React (and Vue, Svelte)
 * keep references to the text nodes they rendered and update them in place, so
 * after a swap their next update writes to a detached node — invisible — and an
 * unmount calls `removeChild` on a node that is no longer a child, which throws
 * and can blank the app. A plain-text edit over a single text node is the
 * overwhelmingly common case, and for it we can change the text in place and
 * keep the node React owns. Only a genuinely structural change falls back.
 * `html` must already be sanitized (or be the page's own original markup).
 */
export function setText(node, text) {
  const only = node.childNodes.length === 1 ? node.firstChild : null;
  if (only && only.nodeType === 3) only.nodeValue = text; else node.textContent = text;
}

export function setContent(node, html) {
  if (node.innerHTML === html) return;
  const parsed = parseInert(html).body;
  const only = node.childNodes.length === 1 ? node.firstChild : null;
  if (only && only.nodeType === 3 && parsed.childNodes.length === 1 && parsed.firstChild.nodeType === 3) {
    only.nodeValue = parsed.firstChild.nodeValue;
    return;
  }
  node.innerHTML = html;
}

const SAFE_URL = /^(?:https?:|mailto:|tel:)/i;

// What the sanitizer may keep. Deliberately a SUPERSET of `INLINE_OK`, and
// deliberately tuned against what is actually in the store rather than guessed:
// a survey of the 34 live overlays found `b`/`span`/`br` plus one `<font>`, and
// the attributes `class` ×6, `color` ×1, `style` ×1. Dropping those would have
// silently restyled three overlays on a widely viewed client page.
//
// `font` is here because contenteditable EMITS it: changing a colour in a
// browser's rich-text editor produces `<font color=…>`, not a styled span. It
// carries no script surface.
const SAFE_TAGS = new Set([...INLINE_OK, "FONT"]);
// Inert everywhere: none of these load a resource or run code.
const SAFE_ATTRS = new Set(["class", "title", "lang", "dir"]);
const SAFE_TAG_ATTRS = { A: ["href"], FONT: ["color", "face", "size"] };
// `style` is kept but property-filtered. Arbitrary CSS cannot execute script in
// any current browser, but it can absolutely position an element over the page,
// so only text-presentation properties survive.
const SAFE_CSS_PROPS = new Set([
  "color", "background-color", "font-weight", "font-style", "font-size",
  "font-family", "text-decoration", "text-transform", "letter-spacing",
]);

function safeStyle(value) {
  return String(value || "")
    .split(";")
    .map((d) => d.trim())
    .filter(Boolean)
    .filter((d) => {
      const prop = d.slice(0, d.indexOf(":")).trim().toLowerCase();
      if (!SAFE_CSS_PROPS.has(prop)) return false;
      // `url(…)` fetches, and `expression(…)` is legacy IE script. Neither has
      // any business in a text edit.
      return !/url\s*\(|expression\s*\(/i.test(d);
    })
    .join("; ");
}

/**
 * Reduce untrusted HTML to the inline formatting an edit is allowed to carry.
 *
 * An overlay arrives from the link's SHARED store, so it is written by whoever
 * holds the link — not necessarily by the person about to see it. `applyOverlays`
 * assigns it to `innerHTML`, which makes any viewer's stored string executable in
 * every other viewer's browser (`<img src=x onerror=…>`; `<script>` is inert via
 * innerHTML but nothing else is). The share-link origin is shared by every link,
 * and the owner's `sk_admin` session cookie is `Path=/` and same-site, so a
 * payload that ran here could call the admin API as the owner.
 *
 * So: keep text, keep `INLINE_OK` tags, drop every attribute except a
 * scheme-checked `href` on `<a>`. That is exactly the surface `isTextLeaf`
 * already says an editable leaf may contain, so nothing legitimate is lost.
 */
function sanitizeInline(html) {
  const doc = parseInert(html);
  const walk = (src, dest) => {
    for (const node of [...src.childNodes]) {
      if (node.nodeType === 3) {
        dest.appendChild(document.createTextNode(node.nodeValue));
        continue;
      }
      if (node.nodeType !== 1) continue;           // comments, PIs — drop
      if (!SAFE_TAGS.has(node.tagName)) {
        // Unwrap rather than delete: the words inside were the edit.
        walk(node, dest);
        continue;
      }
      const el = document.createElement(node.tagName.toLowerCase());
      const allowed = SAFE_TAG_ATTRS[node.tagName] || [];
      for (const attr of [...node.attributes]) {
        const name = attr.name.toLowerCase();
        // Every `on*` handler is excluded by construction: the allowlists below
        // never contain one, so this is a default-deny, not a blocklist.
        if (name === "style") {
          const style = safeStyle(attr.value);
          if (style) el.setAttribute("style", style);
        } else if (name === "href") {
          if (allowed.includes("href") && SAFE_URL.test(attr.value.trim())) {
            el.setAttribute("href", attr.value.trim());
          }
        } else if (SAFE_ATTRS.has(name) || allowed.includes(name)) {
          el.setAttribute(name, attr.value);
        }
      }
      walk(node, el);
      dest.appendChild(el);
    }
  };
  const out = document.createElement("div");
  walk(doc.body, out);
  return out.innerHTML;
}

function textOf(html) {
  return collapse(parseInert(html).body.textContent);
}

/**
 * Content-derived id.
 *
 * A positional id ("the 427th text node") breaks the moment anything above it
 * changes — every later id shifts by one and each stored edit silently
 * reattaches to a different sentence. Hashing WHERE the text lives plus the
 * text ITSELF means an edit stays bound to its own line no matter what else
 * moves. Rewriting that line at source legitimately changes the id, which
 * retires the stale edit instead of misplacing it.
 */
function hashText(s) {
  let h = 0x811c9dc5; // FNV-1a, 32-bit
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ("0000000" + h.toString(16)).slice(-8);
}

/** Nearest stable landmark, so identical boilerplate in two sections cannot collide. */
function scopeOf(node) {
  const anchored = node.closest("[data-anchor]");
  if (anchored) return anchored.getAttribute("data-anchor");
  const identified = node.closest("[id]");
  if (identified) return identified.id;
  const section = node.closest("section, article, main, header, footer, nav, aside");
  return section ? section.tagName.toLowerCase() : "page";
}

/**
 * A CSS selector for the element, good enough for a human and an agent to find
 * it in source. Not guaranteed unique — the id above is what addresses the
 * edit; this is for reading.
 */
// Classes we add ourselves. They exist only while editing, so emitting them
// would send an agent hunting for a selector that appears nowhere in the source.
const TRANSIENT_CLASSES = new Set(["sk-editing"]);

function selectorOf(node) {
  const parts = [];
  let el = node;
  for (let depth = 0; el && el.nodeType === 1 && depth < 4; depth++, el = el.parentElement) {
    // Stop at BODY rather than describing it — "body > " prefixes every
    // selector and distinguishes nothing.
    if (el.tagName === "BODY" || el.tagName === "HTML") break;
    if (el.id) { parts.unshift(`#${el.id}`); break; }
    let part = el.tagName.toLowerCase();
    const cls = (el.getAttribute("class") || "")
      .trim().split(/\s+/)
      .filter((c) => c && !TRANSIENT_CLASSES.has(c) && !c.startsWith("sk-"))[0];
    if (cls) part += `.${cls}`;
    parts.unshift(part);
  }
  return parts.join(" > ");
}

/**
 * Run `fn` once the page's framework has hydrated.
 *
 * ⚠️ The scan writes `data-sk-edit` onto the page's elements and an overlay
 * rewrites their text. Done before React hydrates server-rendered markup (a
 * Next.js app in dev hydrates well after our bundle starts), every load threw
 * a hydration mismatch. Nothing exposes "hydrated", so wait for `load`, two
 * frames and an idle slot: hydration is scheduled work that finishes before
 * the browser next goes idle.
 */
function afterHydration(fn) {
  const idle = () => (typeof requestIdleCallback === "function" ? requestIdleCallback(() => fn(), { timeout: 2000 }) : setTimeout(fn, 200));
  const frames = () => requestAnimationFrame(() => requestAnimationFrame(idle));
  if (document.readyState === "complete") frames(); else addEventListener("load", frames, { once: true });
}

function isTextLeaf(node) {
  if (!collapse(node.textContent)) return false;
  for (const child of node.children) if (!INLINE_OK.has(child.tagName)) return false;
  return true;
}

/**
 * A flex or grid row of inline items (a nav: wordmark, statement, CTA) is
 * separate pieces of copy, not one run of text: each child is the leaf, or one
 * edit captures all three glued together and can't be found in the source.
 */
function isRowOfPieces(node) {
  if (node.children.length < 2 || ownText(node)) return false;
  let display = "";
  try { display = getComputedStyle(node).display || ""; } catch { /* detached */ }
  if (!/flex|grid/.test(display)) return false;
  return Array.from(node.children).filter((c) => collapse(c.textContent)).length > 1;
}

/** Does the element carry any text directly (not only inside its children)? */
function ownText(node) {
  for (const c of node.childNodes) if (c.nodeType === 3 && collapse(c.nodeValue)) return true;
  return false;
}

export function createEditMode({ endpoint, sessionId, onCommitted, integrated = false }) {
  let scope = `${pageKey()}:${viewport().name}:`;
  const originals = new Map(); // id -> original innerHTML
  const nodes = new Map();     // id -> element
  let active = false;
  let ui = null;
  const attached = new WeakSet();
  let controlsAttached = false;

  // ---- storage (rides the KV bridge: any `agentation*` key mirrors server-side)
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* quota/private mode */ } };
  const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const drop = (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } };

  // Until the page has hydrated, edit mode touches nothing on it (see
  // afterHydration). After that it scans only when there is a reason to:
  // text edit is on, or this page and viewport have saved overlays to restore.
  let hydrated = false;
  function overlaysHere() {
    const prefix = `${NS}${hashText(scope)}-`;
    try {
      for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith(prefix)) return true;
    } catch { /* private mode */ }
    return false;
  }
  const shouldScan = () => hydrated && (active || overlaysHere());

  function scan() {
    const added = new Set();
    const seen = Object.create(null);
    for (const [id,node] of nodes) if (!node.isConnected) { nodes.delete(id); originals.delete(id); }
    for (const node of document.body.querySelectorAll("*")) {
      if (nodes.has(node.getAttribute("data-sk-edit"))) continue;
      if (node.isContentEditable || node.closest("[contenteditable=true]")) continue;
      if (SKIP_TAGS.has(node.tagName)) continue;
      if (node.closest(SKIP_ZONE)) continue;
      if (!isTextLeaf(node)) continue;
      // Document order means a qualifying ancestor was tagged first; never nest
      // an editable inside an editable.
      if (node.parentElement && node.parentElement.closest("[data-sk-edit]")) continue;

      const base = `${hashText(scope)}-${scopeOf(node)}-${hashText(textOf(node.innerHTML))}`;
      // A row of pieces splits into its children, unless an overlay or draft was
      // saved on the whole row before rows split: keep that one editable as it was.
      if (isRowOfPieces(node) && get(NS + base) == null) continue;
      seen[base] = (seen[base] || 0) + 1;
      const id = seen[base] === 1 ? base : `${base}~${seen[base]}`;

      let uniqueId = id;
      while (nodes.has(uniqueId)) uniqueId = `${id}~${++seen[base]}`;
      node.setAttribute("data-sk-edit", uniqueId);
      originals.set(uniqueId, node.innerHTML);
      nodes.set(uniqueId, node);
      added.add(uniqueId);
    }
    return added;
  }

  /**
   * Re-apply overlays saved by anyone, on this browser or another.
   *
   * ⚠️ "or another" is why every record is sanitized on the way in: this runs on
   * load for every viewer, over a store any link-holder can write.
   */
  function applyOverlays(onlyIds) {
    for (const [id, node] of nodes) {
      if (onlyIds && !onlyIds.has(id)) continue;
      const raw = get(NS + id);
      if (!raw) continue;
      try {
        const rec = JSON.parse(raw);
        if (typeof rec.html === "string") setContent(node, sanitizeInline(rec.html));
      } catch { /* corrupt record — leave the source text alone */ }
    }
  }

  function pendingEdits() {
    const out = [];
    for (const [id, node] of nodes) {
      const from = textOf(originals.get(id) || "");
      const to = textOf(node.innerHTML);
      if (from === to) continue;
      // Only text the REVIEWER changed is an edit. ⚠️ Without this, any text
      // the app changes itself (a counter, a clock, data arriving) surfaced as
      // a draft nobody typed. No saved record = the app did it, so what it
      // rendered becomes the new original.
      if (!get(NS + id)) { originals.set(id, node.innerHTML); continue; }
      // Overlays ride the shared KV, so another reviewer's draft is applied on
      // this page too. It is theirs to commit, not a draft of mine: listing it
      // here put it in my count and committed it under my name on Send.
      if (!ownedHere(id)) continue;
      out.push({ id, from, to, node, annotationId: get(PENDING + id), dirty: JSON.parse(get(NS + id) || "{}")?.submittedTo !== to });
    }
    return out;
  }

  /** Records carry who typed them; one without a name predates several reviewers and stays editable by anyone. */
  function ownedHere(id) {
    try { const rec = JSON.parse(get(NS + id) || "null"); return !rec?.reviewer || isMine(rec.reviewer); } catch { return true; }
  }

  function save(node) {
    const id = node.getAttribute("data-sk-edit");
    if (!id) return;
    try { if (JSON.parse(get(NS + id) || "null")?.html === sanitizeInline(node.innerHTML)) return; } catch {}
    // Typing a line back to its original is a revert, not an edit — clear the
    // record rather than storing one that says "no change", which is
    // indistinguishable from a real edit in the store.
    if (node.innerHTML === originals.get(id)) {
      drop(NS + id);
    } else {
      // Sanitized on write as well as on read: a contenteditable accepts a rich
      // paste, so this is also where a payload lands without anyone crafting one.
      // Belt and braces — the read side is the security boundary, since a record
      // can be POSTed straight to `__kv` without passing through here at all.
      let prior = JSON.parse(get(NS + id) || "{}");
      // Rewriting a line another reviewer changed makes it a new edit of mine:
      // their committed note keeps their wording, and mine gets its own id
      // rather than PATCHing theirs.
      if (prior.reviewer && !isMine(prior.reviewer)) { drop(PENDING + id); prior = {}; }
      const reviewer = reviewerName();
      const at = prior.playhead || playhead(node);
      put(NS + id, JSON.stringify({ ...prior, id, clientId: prior.clientId || crypto.randomUUID(), ...(reviewer ? { reviewer } : {}), ...(at ? { playhead: at } : {}), html: sanitizeInline(node.innerHTML), ts: Date.now() }));
    }
    refresh();
  }

  // ---- commit ------------------------------------------------------------
  let committing = false;
  async function commit(onlyId) {
    if (committing) return { count: 0 };
    committing = true;
    const edits = pendingEdits().filter(e => !onlyId || e.id === onlyId);
    if (!edits.length || !endpoint || !sessionId) { committing = false; return { count: 0 }; }
    // Asked when edit mode opened; this catches a draft made before that.
    const reviewer = await ensureReviewer();

    let sent = 0, failed = 0;
    for (const edit of edits) {
      // Already committed and awaiting an agent? Don't queue it twice.
      const previous = get(PENDING + edit.id);
      try {
        const res = await fetch(previous ? `${endpoint}/annotations/${previous}` : `${endpoint}/sessions/${sessionId}/annotations`, {
          method: previous ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: JSON.parse(get(NS + edit.id) || "{}").clientId || crypto.randomUUID(),
            kind: "edit",
            viewport: viewport(),
            // Where the film was when this text was first edited (playhead.js).
            playhead: JSON.parse(get(NS + edit.id) || "{}").playhead || playhead(edit.node),
            url: location.href,
            comment: `Change to: "${edit.to}"`,
            element: edit.node.tagName.toLowerCase(),
            elementPath: selectorOf(edit.node),
            intent: "edit",
            // The diff is the payload an agent acts on. `from` matters as much
            // as `to`: it is how the right line gets found in source when the
            // selector is ambiguous.
            edit: { id: edit.id, from: edit.from, to: edit.to },
            ...(reviewer ? { reviewer } : {}),
          }),
        });
        if (res.ok) {
          const ann = await res.json();
          put(PENDING + edit.id, ann.id);
          const rec = JSON.parse(get(NS + edit.id) || "{}");
          put(NS + edit.id, JSON.stringify({ ...rec, submittedTo: edit.to }));
          sent++;
        } else failed++;
      } catch { failed++; /* offline — the overlay is still saved, commit can be retried */ }
    }
    refresh();
    committing = false;
    if (sent) document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"));
    onCommitted?.(sent);
    // `edits` includes lines already committed, which are re-saved here. So a
    // count can match the number of drafts while a draft failed: say so outright.
    return { count: sent, failed };
  }

  /**
   * An agent resolved a committed edit, meaning the source now says it.
   * Drop the overlay so the page stops patching text that already matches —
   * otherwise every committed edit stays a permanent patch forever.
   */
  function clearCommitted(annotationId, status = "resolved") {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PENDING)) continue;
      if (get(key) !== annotationId) continue;
      const id = key.slice(PENDING.length);
      drop(key);
      drop(NS + id);
      const node = nodes.get(id);
      // Leave the visible text as-is: the source agrees with it now, and
      // reverting on screen would look like the change was rejected.
      if (node && status === "dismissed") setContent(node, originals.get(id));
      else if (node) originals.set(id, node.innerHTML);
      refresh();
      return true;
    }
    return false;
  }

  // ---- UI ----------------------------------------------------------------
  /**
   * Bottom-LEFT, and always present.
   *
   * Two things were wrong before. There was no visible way to start editing at
   * all — only `window.__AGENTATION_KIT_EDIT__.toggle()` — so the feature shipped
   * invisible unless you knew the JS API. And the bar was bottom-centre, which
   * on a phone lands on top of the feedback toolbar's own button.
   *
   * The launcher and the bar are the same element in two states, so there is
   * never more than one control in the corner: collapsed it says "Edit text",
   * expanded it carries the count, Commit and Done. The feedback toolbar owns
   * bottom-right, the countdown owns top-left, this owns bottom-left.
   */
  function buildUi() {
    const host = document.createElement("div");
    host.className = "sk-edit-ui";
    host.setAttribute("data-sk-no-edit", "");
    // Chrome, not content — without this the toolbar's crosshair lands on our own
    // pill and a click annotates the Commit button. This host does not go through
    // `createHost`, so it has to say so itself.
    markChrome(host);
    // `open` so a test or a host page can drive it; style isolation is the same.
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .bar { position: fixed; left: 16px; bottom: 16px; z-index: 2147483645;
          display: flex; align-items: center; gap: 9px;
          font: 500 13px/1.3 "ST Sans", "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          padding: 9px 14px; border-radius: 999px; background: rgba(29,26,47,.96);
          color: #FFF4E0; border: 1px solid rgba(255,244,224,.16);
          box-shadow: 0 6px 22px rgba(0,0,0,.32); backdrop-filter: blur(8px);
          max-width: calc(100vw - 32px); }
        .bar.idle { cursor: pointer; }
        .bar.idle:hover { background: rgba(42,38,64,.98); }
        button { font: inherit; font-weight: 600; cursor: pointer; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.2); background: transparent; color: inherit;
          padding: 6px 13px; white-space: nowrap; }
        button:hover { background: rgba(255,255,255,.12); }
        button:focus-visible { outline: 2px solid #FFC72C; outline-offset: 2px; }
        .go { background: #FF5436; color: #1D1A2F; border-color: #FF5436; }
        .go:hover { background: #FF6A4F; }
        .go[disabled] { opacity: .4; cursor: default; background: transparent;
          color: #FFF4E0; border-color: rgba(255,244,224,.2); }
        .n { opacity: .7; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ok { color: #86efac; }
        .pen { opacity: .9; }
        /* Editing needs the room; idle does not. */
        .live { display: none; gap: 9px; align-items: center; }
        .bar.on .live { display: flex; }
        .bar.on .idle-label { display: none; }
        @media (max-width: 460px) {
          .bar { left: 12px; bottom: 12px; padding: 8px 12px; font-size: 12.5px; }
          button { padding: 6px 11px; }
        }
      </style>
      <div class="bar idle" id="bar">
        <span class="idle-label"><span class="pen">✎</span> Edit text</span>
        <span class="live">
          <span class="n" id="count">Edit mode</span>
          <button class="go" id="commit" disabled>Save</button>
          <button id="done">Done</button>
        </span>
      </div>`;
    document.body.appendChild(host);

    const bar = root.getElementById("bar");
    const countEl = root.getElementById("count");
    const commitEl = root.getElementById("commit");

    // Collapsed, the whole pill is the button.
    bar.addEventListener("click", (e) => {
      if (active) return;                       // expanded: inner controls own it
      e.stopPropagation();
      toggle(true);
    });
    root.getElementById("done").addEventListener("click", (e) => { e.stopPropagation(); toggle(false); });
    commitEl.addEventListener("click", async (e) => {
      e.stopPropagation();
      commitEl.disabled = true;
      commitEl.textContent = "Saving…";
      const { count } = await commit();
      commitEl.textContent = "Save";
      countEl.innerHTML = count
        ? `<span class="ok">✓ ${count} saved</span>`
        : "Edit mode";
      setTimeout(refresh, 2600);
    });

    return { host, root, bar, countEl, commitEl };
  }

  function refresh() {
    document.dispatchEvent(new CustomEvent("agentation-kit:edit-change"));
    if (!ui) return;
    const edits = pendingEdits();
    const uncommitted = edits.filter((e) => !get(PENDING + e.id));
    ui.commitEl.disabled = uncommitted.length === 0;
    if (!ui.countEl.querySelector(".ok")) {
      const waiting = edits.length - uncommitted.length;
      ui.countEl.textContent = edits.length === 0
        ? "Edit mode"
        : `${uncommitted.length} to save${waiting ? ` · ${waiting} awaiting agent` : ""}`;
    }
  }

  function toggle(on) {
    active = on === undefined ? !active : on;
    // The reviewer switched it on, so the page is interactive: hydrated.
    if (active) hydrated = true;
    if (active) { scan(); applyOverlays(); attach(); ensureReviewer(); }
    document.body.classList.toggle("sk-editing", active);
    for (const node of nodes.values()) {
      if (active) node.setAttribute("contenteditable", "true"); else node.removeAttribute("contenteditable");
      node.spellcheck = false;
    }
    if (!ui && !integrated) ui = buildUi();
    if (!ui) { refresh(); return; }
    // The launcher never hides — it is the only way back in.
    ui.bar.classList.toggle("on", active);
    ui.bar.classList.toggle("idle", !active);
    refresh();
  }

  function attach() {
    // The one accent, #FF5436, at the alphas the indigo had (UX review 4, N8).
    const style = document.createElement("style");
    style.textContent = `
      body.sk-editing [data-sk-edit] { border-radius: 5px; cursor: text;
        box-shadow: 0 0 0 1px rgba(255,84,54,.28); transition: box-shadow .12s, background .12s; }
      body.sk-editing [data-sk-edit]:hover { background: rgba(255,84,54,.07); }
      body.sk-editing [data-sk-edit]:focus { outline: none; background: rgba(255,84,54,.08);
        box-shadow: 0 0 0 2px rgba(255,84,54,.9); }`;
    if (!controlsAttached) document.head.appendChild(style);

    for (const node of nodes.values()) {
      if (attached.has(node)) continue;
      attached.add(node);
      // ⚠️ Only what the reviewer TYPED is saved. `blur` used to save
      // unconditionally, with editing on or off, so on an app that relabels
      // its own controls ("Re-render 0" → "1") focusing a button and clicking
      // away stored the app's change as the reviewer's edit.
      let typed = false;
      node.addEventListener("input", () => { if (!active) return; typed = true; save(node); });
      node.addEventListener("blur", () => { if (typed) save(node); });
      // Paste as plain text: pasting rich HTML into a line destroys the markup
      // the id was derived from, and the edit stops matching anything.
      node.addEventListener("paste", (e) => {
        e.preventDefault();
        const t = (e.clipboardData || window.clipboardData).getData("text/plain");
        try { document.execCommand("insertText", false, t); } catch { /* older engines */ }
      });
    }

    // The agentation toolbar registers capture-phase click handlers on document
    // and treats [contenteditable] as annotatable, so with both live one click
    // both opens a comment and drops a caret. Capture order is window →
    // document, so stopping it here wins. stopPropagation, not preventDefault:
    // the browser's own default still places the caret, so typing behaves.
    if (controlsAttached) return;
    controlsAttached = true;
    for (const type of ["mousedown", "click"]) {
      window.addEventListener(type, (e) => {
        if (!active) return;
        const t = e.target;
        if (t && t.closest && t.closest("[data-sk-edit]")) { e.stopPropagation(); if (type === "click" && t.closest("a,button")) e.preventDefault(); }
      }, true);
    }
  }

  afterHydration(() => {
    hydrated = true;
    if (!shouldScan()) return;
    scan(); applyOverlays(); attach();
    if (active) for (const node of nodes.values()) node.setAttribute("contenteditable", "true");
    refresh();
  });
  // Runs whether or not editing is on. ⚠️ It used to return early when inactive,
  // so on an app that renders (a SPA route, a hot reload, a lazy section) a
  // committed-but-unresolved edit simply never came back until the reviewer
  // toggled editing — the overlay looked lost. Idle, it is throttled: scan()
  // walks the whole body, and a page with a ticking clock mutates every frame.
  let rescanQueued = false;
  new MutationObserver(records => {
    if (rescanQueued || !shouldScan() || !records.some(r => !(r.target.closest?.(SKIP_ZONE) || r.target.parentElement?.closest(SKIP_ZONE)))) return;
    rescanQueued = true;
    const run = () => {
      rescanQueued = false;
      const added = scan(); applyOverlays(added); attach();
      if (active) for (const node of nodes.values()) node.setAttribute("contenteditable", "true");
      if (added.size) refresh();
    };
    if (active) requestAnimationFrame(run); else setTimeout(run, 250);
  }).observe(document.body, { childList: true, subtree: true });
  // Show the launcher immediately. Building it lazily on first toggle is what
  // made the feature invisible: there was nothing to click to cause the toggle.
  ui = integrated ? null : buildUi();
  refresh();

  // A new page (client-side route) or a new breakpoint is a new edit scope:
  // put the old scope's text back, then pick up whatever this one has saved.
  window.addEventListener('resize', rescope);
  document.addEventListener('agentation-kit:route', rescope);
  function rescope() {
    const nextScope = `${pageKey()}:${viewport().name}:`;
    if (nextScope === scope) return;
    for (const [id,node] of nodes) {
      // Put back only what an overlay changed. ⚠️ Restoring every tagged node wrote a
      // stale innerHTML copy over markup the app had re-rendered since the scan (a
      // React switch whose aria-pressed had flipped): the copy looked right and was
      // dead, so on a Storybook host the Make | Library switch stopped responding
      // after the first route change.
      if (get(NS + id)) setContent(node, originals.get(id));
      node.removeAttribute('data-sk-edit');node.removeAttribute('contenteditable');
    }
    nodes.clear(); originals.clear(); scope = nextScope;
    if (shouldScan()) { scan(); applyOverlays(); attach(); }
    if (active) for (const node of nodes.values()) node.setAttribute('contenteditable','true');
    refresh();
  }
  function reject(id) {
    if (get(PENDING + id)) {
      const rec = JSON.parse(get(NS + id) || "{}");
      if (typeof rec.submittedTo !== "string") return false;
      const node = nodes.get(id);
      if (node) { setText(node, rec.submittedTo); save(node); return true; }
      // Not on screen (another breakpoint's scope): put the stored draft back
      // to the sent wording, so the sent note stays and the revision goes.
      // It crashed on the missing node, and the revision stayed queued.
      const holder = document.createElement("div"); holder.textContent = rec.submittedTo;
      put(NS + id, JSON.stringify({ ...rec, html: sanitizeInline(holder.innerHTML), ts: Date.now() }));
      refresh(); return true;
    }
    const node = nodes.get(id);
    if (node) setContent(node, originals.get(id));
    drop(NS + id); refresh(); return true;
  }
  function revise(id, text, submitted = false) {
    const node = nodes.get(id);
    if (!node) return;
    // Use textContent for reviewer strings; never inject untrusted markup.
    setText(node, text); save(node);
    if (submitted) { const rec = JSON.parse(get(NS + id) || "{}"); put(NS + id, JSON.stringify({ ...rec, submittedTo: text })); }
  }
  /**
   * A draft made from outside: the agent's suggested text, accepted from the
   * critique panel (show-and-tell.pen 9.2). The same record typing would save,
   * so it sits in Edit text drafts, can still be changed, and goes out on Send.
   * `el` is the element the suggestion targets: a text leaf itself, or one
   * holding exactly one. Returns the draft's id (reject(id) takes it back), or
   * null when the element has no single line of text to put it in.
   */
  function draftText(el, text) {
    if (!el?.isConnected || typeof text !== "string" || el.closest(SKIP_ZONE)) return null;
    hydrated = true;
    scan(); applyOverlays(); attach();
    let node = el.hasAttribute("data-sk-edit") ? el : null;
    if (!node) { const inner = el.querySelectorAll("[data-sk-edit]"); if (inner.length === 1) node = inner[0]; }
    if (!node) return null;
    if (active) node.setAttribute("contenteditable", "true");
    setText(node, text); save(node);
    return node.getAttribute("data-sk-edit");
  }
  /**
   * Take back a draft by id, at any breakpoint, but only one that is this
   * reviewer's and still says `text` (critique.js Undo). Drafts ride the
   * shared KV, so the record for an id can be another reviewer's who typed
   * the same words; and the edit view lists only the breakpoint on screen,
   * so this reads the stored record, not pendingEdits(). Returns true when
   * the draft was taken back.
   */
  function withdrawDraft(id, text) {
    let rec = null;
    try { rec = JSON.parse(get(NS + id) || "null"); } catch { return false; }
    if (!rec || (rec.reviewer && !isMine(rec.reviewer))) return false;
    const norm = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
    if (norm(textOf(rec.html || "")) !== norm(text)) return false;
    return reject(id);
  }
  // A client-side route moves the reviewer onto another page's session; commits
  // must follow them there rather than land on the page they started on.
  function setSession(id) { if (id) sessionId = id; }
  /**
   * Drop overlays whose committed note is closed or gone on the server.
   *
   * Clear all now tombstones a note (status "dismissed") rather than deleting
   * the row, and a note removed or closed while this tab was away sent it no
   * stream frame, so an overlay could keep patching the page forever. Called
   * with the COMPLETE map of id -> status the link holds; never a partial one.
   * Missing or dismissed puts the original text back; resolved keeps the new
   * text, since the source now says it.
   */
  function reconcile(statuses) {
    let dropped = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PENDING)) continue;
      const annotationId = get(key);
      if (!annotationId) continue;
      const status = statuses.has(annotationId) ? statuses.get(annotationId) : "dismissed";
      if ((status === "dismissed" || status === "resolved") && clearCommitted(annotationId, status)) dropped++;
    }
    return dropped;
  }
  return { toggle, commit, pendingEdits, clearCommitted, reject, withdrawDraft, revise, draftText, setSession, reconcile, get active() { return active; }, rescan: () => { scan(); applyOverlays(); } };
}
