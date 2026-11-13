// The agent's side of a review, shared by every front end (the `feedback` CLI,
// the MCP server, `apply`, `export`). Reads and writes the project's store
// directly, so the review server does not have to be running; when it is, the
// toolbar's event stream shows changes within a few seconds.
import { narrowCandidates } from './narrow-edit.js';
import { DatabaseSync } from './sqlite.js';
import { existsSync, readFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { STORE, assertSlug } from '../bin/lib.mjs';
import { annotationView, agentUpdateAnnotation, createAgentAnnotations, replyMs } from './sessions.js';
import { describeAnnotation, fenceValue, voiceContexts } from './format.js';
import { kvGet, kvSet } from './kv-store.js';
import { SCHEMA, d1, pragmas } from './store.js';
import { cleanReviewer, cleanRoundValue } from './reviewer.js';
import { captureShot, noteSelectors, readShotFile, storeShot, SHOT_KINDS } from './shots.js';

/** Critique severities, worst first (the toolbar orders its panel by these). */
export const SEVERITIES = ['blocking', 'important', 'suggestion'];
/** Build output, dependencies and generated files: never a place to look for (or write) copy. */
export const IGNORE_GLOBS = ['*.map', '*.min.js', '*.min.css', '**/node_modules/**', '**/dist/**', '**/build/**', '**/out/**',
  '**/.next/**', '**/.svelte-kit/**', '**/.astro/**', '**/.agentation-kit/**', '**/.git/**'];

/**
 * Text worth searching the source for, most specific first: the selection, the
 * text quoted in the element label (`h1 "Get started"`, `button "Save"`), then
 * the element's own text from `nearbyText`, which Agentation wraps in sibling
 * context: `[before: "…"] Get started [after: "Edit src/App.jsx and save"]`.
 */
export function searchTexts(a) {
  const out = [];
  const add = (s) => {
    const t = String(s || '').replace(/(?:\.\.\.|…)$/, '').replace(/\s+/g, ' ').trim();
    if (t.length >= 4 && !out.includes(t)) out.push(t);
  };
  add(a.selectedText);
  const quoted = /"([^"]{4,})"/.exec(String(a.element || ''));
  if (quoted) add(quoted[1]);
  const own = String(a.nearbyText || '')
    .replace(/^\s*\[before: ".*?"\]\s*/s, '')
    .replace(/\s*\[after: ".*?"\]\s*$/s, '');
  add(own.split(/\n|  +/)[0]);
  return out;
}

export const isOpen = (a) => a.status === 'pending' || a.status === 'acknowledged';
export const lastReply = (a) => (a.replies?.length ? a.replies[a.replies.length - 1] : null);

/** Every project that has a store on disk. */
export function projects() {
  if (!existsSync(STORE)) return [];
  return readdirSync(STORE).filter((f) => f.endsWith('.sqlite')).map((f) => f.slice(0, -7)).sort();
}

/** What to say about a project name with no store: the names that do exist, and how to start one. */
export function unknownProject(name) {
  let known = [];
  try { known = projects(); } catch {}
  return `No review project "${name}" in ${STORE}. ${known.length ? `Known: ${known.join(', ')}.` : 'There are none yet.'} Start one with: show-and-tell serve --origin <dev server origin> --name ${name}`;
}

export function openProject(rawName, { src = process.cwd(), create = false } = {}) {
  const name = assertSlug(rawName);
  const file = join(STORE, `${name}.sqlite`);
  const root = resolve(src);
  let db = null;
  const open = (force = false) => {
    if (!db && (existsSync(file) || create || force)) {
      mkdirSync(STORE, { recursive: true });
      db = new DatabaseSync(file);
      pragmas(db);
      db.exec(SCHEMA);
    }
    return db;
  };
  const env = d1(() => { if (!open()) throw new Error(`No feedback store for "${name}" (${file}).`); return db; });
  const now = () => Date.now() / 1000;

  const round = () => { try { return JSON.parse(cleanRoundValue(kvGet(name, 'agentation-round').value || 'null')); } catch { return null; } };
  // What the agent has read, kept in the store rather than in a process: a Send
  // or an answer landing between two waits must wake the next one. The key must
  // not start with "agentation", or the browser's bridge would mirror it.
  const READ = 'agent-last-read';
  const lastRead = () => { try { return JSON.parse(kvGet(name, READ).value || 'null'); } catch { return null; } };
  const receipt = () => ({ round: round()?.ts || 0, at: Date.now() });
  // Never the write that creates a store: reading an unknown project is not a reason to make one.
  const markRead = (r) => { if (existsSync(file)) kvSet(name, READ, JSON.stringify(r)); };

  function routeKey() {
    try { return JSON.parse(readFileSync(join(STORE, `${name}.route.json`), 'utf8')).routeKey ?? null; } catch { return null; }
  }
  /** A page is its pathname, or pathname + the route params the server was started with. */
  function pageOf(raw) {
    const key = routeKey();
    // A stored URL that does not parse must not take the whole read path down.
    let u; try { u = new URL(raw); } catch { return String(raw ?? ''); }
    if (!key) return u.pathname;
    if (key === 'search') return u.pathname + u.search;
    const q = new URLSearchParams();
    for (const k of key) if (u.searchParams.has(k)) q.set(k, u.searchParams.get(k));
    return q.toString() ? `${u.pathname}?${q}` : u.pathname;
  }

  /** Reviewer notes (or the agent's own, with author:'agent'), oldest first per page. */
  function items({ all = false, author = 'reviewer', reviewer = null } = {}) {
    if (!open()) return [];
    const rows = db.prepare(`SELECT a.*, s.url AS page FROM ag_annotations a JOIN ag_sessions s ON s.id = a.session_id
      WHERE a.site_id = ? AND a.author = ? ${all ? '' : "AND a.status IN ('pending','acknowledged')"} ORDER BY s.url, a.created_at`).all(name, author);
    const list = rows.map((r) => ({ ...annotationView(r), page: r.page, pagePath: pageOf(r.page) }));
    return reviewer ? list.filter((a) => (a.reviewer || '').toLowerCase() === String(reviewer).toLowerCase()) : list;
  }

  function get(id) {
    if (!open()) return null;
    const r = db.prepare('SELECT a.*, s.url AS page FROM ag_annotations a JOIN ag_sessions s ON s.id = a.session_id WHERE a.id = ? AND a.site_id = ?').get(id, name);
    return r ? { ...annotationView(r), page: r.page, pagePath: pageOf(r.page) } : null;
  }

  /** Literal search for a snippet under `src`, gitignore-aware. Honest when it finds nothing. */
  function hits(needle, { max = 3 } = {}) {
    const n = String(needle || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (n.length < 4) return [];
    try {
      const out = execFileSync('rg', ['-F', '-n', '--no-heading', '-m', '2', '--max-columns', '160', '--max-filesize', '1M',
        ...IGNORE_GLOBS.flatMap((g) => ['-g', `!${g}`]), '--', n, root], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      return out.trim().split('\n').filter(Boolean).slice(0, max).map((l) => {
        const [f, line] = l.split(':');
        return { file: relative(root, f), line: Number(line) };
      });
    } catch { return []; } // exit 1 = no match; rg missing = no pointers
  }
  const fmt = (list) => list.map((h) => `${h.file}:${h.line}`).join(', ');

  /** Where a note probably lives in the source, as [label, text] rows plus the raw hits. */
  function pointers(a) {
    const rows = [];
    let found = [];
    if (a.sourceFile) rows.push(['source', a.sourceFile]);
    if (a.reactComponents) rows.push(['component', a.reactComponents]);
    if (a.kind === 'copy' && a.copy?.unit?.file) {
      const u = a.copy.unit;
      found = [{ file: String(u.file), line: Number(u.line) || 1 }];
      rows.push(['find', `${u.file}:${u.line} (exact span; \`apply\` writes it)`]);
    } else if (a.edit) {
      // A short TO matches unrelated prose; only trust "already applied" when it's distinctive.
      let from = hits(a.edit.from), to = (a.edit.to || '').trim().length >= 16 ? hits(a.edit.to) : [];
      let narrowed = null;
      if (!from.length && !to.length) {
        // Captured on a container: look for just the words that changed.
        for (const c of narrowCandidates(a.edit.from, a.edit.to)) {
          const h = hits(c.from);
          if (h.length === 1) { from = h; narrowed = c; break; }
        }
      }
      found = from;
      if (!from.length && to.length) rows.push(['in source', `already says the new text → ${fmt(to)} (resolve it)`]);
      else rows.push(['find', from.length ? fmt(from) : 'old text not found verbatim — it may be split across JSX/markup']);
      if (narrowed) rows.push(['change', `"${narrowed.from}" → "${narrowed.to}" (the rest of FROM is other elements' text)`]);
    } else if (!a.sourceFile) {
      for (const needle of searchTexts(a)) {
        found = hits(needle);
        if (found.length) break;
      }
      if (found.length) rows.push(['find', fmt(found)]);
    }
    return { rows, hits: found };
  }

  /** When a shot was taken on a page with a timeline, and whether that is the note's moment. */
  const shotWhen = (sh) => (!Number.isFinite(sh.time) ? '' : sh.untimed ? `, the page's timeline at ${sh.time.toFixed(2)} s (this note has no time, so that may not be its moment)` : `, ${sh.time.toFixed(2)} s in`)
    + (sh.unsettled ? ' (a video was still loading: look at the picture)' : '');

  /** One note as plain text, the way `list` prints it. */
  function describe(a) {
    const { headline, rows: detail } = describeAnnotation(a);
    const vp = a.viewport?.name ? ` · ${a.viewport.name} ${a.viewport.width}px` : '';
    const who = a.reviewer ? ` · ${a.reviewer}` : '';
    const q = lastReply(a);
    const state = !isOpen(a) ? ` · ${a.status}` : q?.reopen ? ' · ↻ reopened by the reviewer' : q?.from === 'agent' ? (q.plan ? ' · ⏳ plan waiting on a go-ahead' : ' · ⏳ waiting on reviewer') : q?.from === 'reviewer' ? ' · ↩ reviewer answered' : '';
    const lines = [`[${a.id}] ${a.kind}${vp}${who}${state}`, `  ${headline}`];
    for (const [k, v] of [...detail, ...(isOpen(a) ? pointers(a).rows : [])]) lines.push(`  ${k}: ${String(v).replace(/\n/g, '\n    ')}`);
    for (const k of SHOT_KINDS) {
      const sh = a.shots?.[k];
      if (sh?.file) lines.push(`  ${k} shot: ${sh.width}×${sh.height}${sh.viewport ? ` at ${sh.viewport.width}×${sh.viewport.height}` : ''}${shotWhen(sh)}${sh.found === false ? ' (target not found: whole viewport)' : ''}`);
    }
    for (const m of a.replies || []) lines.push(`  ↳ ${m.from}${m.plan ? ' (plan)' : ''}${cleanReviewer(m.name) ? ` (${cleanReviewer(m.name)})` : ''}: ${m.message}`);
    return lines.join('\n');
  }

  function render(list, { all = false } = {}) {
    const out = [];
    const r = round();
    if (r) out.push(`Round sent ${new Date(r.ts).toLocaleString()}${r.reviewer ? ` by ${r.reviewer}` : ''} — ${r.open} note(s)${r.pages > 1 ? ` on ${r.pages} pages` : ''}${r.questions ? `, ${r.questions} question(s) still unanswered` : ''}.`);
    if (!list.length) { out.push(`No ${all ? '' : 'open '}feedback on "${name}".`); return out.join('\n'); }
    for (const v of voiceContexts(list)) {
      out.push(`\nVoice context — ${fenceValue(v.sessionId)}${v.reviewer ? ` · ${fenceValue(v.reviewer)}` : ''} (${v.count} listed passages in speech order)`);
      out.push('  Whole sentences in speech order. [→ T#] marks where the reviewer pointed at a new target mid-speech; the words after it were spoken while T# was selected.');
      v.sentences.forEach((s, i) => out.push(`  ${i + 1}. ${fenceValue(s)}`));
      if (v.omittedSentences) out.push(`  … ${v.omittedSentences} more sentence(s) not shown here; every word is in the passages below.`);
      out.push('  targets:');
      for (const t of v.targets) out.push(`    ${t.ref} ${fenceValue(t.detail)}`);
      out.push('  Read these passages together: target changes can split sentences. Only listed notes are included; use the anchors and alignment warnings below.');
    }
    let page = null;
    for (const a of list) {
      if (a.pagePath !== page) { out.push(`\n## ${a.pagePath}`); page = a.pagePath; }
      out.push('\n' + describe(a));
    }
    const waiting = list.filter((a) => isOpen(a) && lastReply(a)?.from === 'agent').length;
    out.push(`\n${list.length} item(s)${waiting ? `, ${waiting} waiting on the reviewer` : ''}. Pointers searched under ${root}.`);
    return out.join('\n');
  }

  /** List and mark read (what `list` and the MCP read tools do). */
  function read(opts = {}) {
    const seen = receipt();
    const list = items(opts);
    markRead(seen);
    return list;
  }

  /** Does the project have a store on disk? */
  const exists = () => existsSync(file);

  /** Reviewer replies newer than `since` (ms). Robust to a reply stored with a seconds timestamp. */
  // A reopen (Check the fix) waits for the next Send rather than waking the agent as it is typed.
  const repliedSince = (a, since) => (a.replies || []).some((m) => m.from === 'reviewer' && !m.reopen && replyMs(m.ts) > since);
  /** The reviewer decided one of the agent's critique notes (Fix it, Not an issue) after `since`. */
  const decidedSince = (a, since) => !!a.decision && a.decision.decision !== 'discuss' && replyMs(a.decision.at) > since;

  /**
   * Block until the reviewer sends a round, answers one of the agent's questions,
   * or replies to (or decides) one of its critique notes. Resolves to {reason, list, …} or
   * {reason:'timeout'}. `critique` lists the agent notes that got a reply.
   */
  async function wait({ timeout = 3600, poll = 2000, signal, onPoll } = {}) {
    if (!(Number.isFinite(timeout) && timeout > 0)) throw new Error(`timeout must be a positive number of seconds, got "${timeout}"`);
    const prev = lastRead();
    const since = replyMs(prev?.at) || Date.now();
    const startRound = prev?.round ?? 0;
    const deadline = Date.now() + timeout * 1000;
    for (;;) {
      const r = round();
      if (r && r.ts > startRound) return { reason: 'round', round: r, list: read() };
      const answered = items().filter((a) => repliedSince(a, since));
      const critique = items({ author: 'agent', all: true }).filter((a) => repliedSince(a, since) || decidedSince(a, since));
      if (answered.length || critique.length) {
        return { reason: 'answered', answered: [...answered, ...critique].map((a) => a.id), critique, list: read() };
      }
      if (Date.now() > deadline || signal?.aborted) return { reason: 'timeout' };
      onPoll?.(); // e.g. an MCP progress notification, so the client knows the call is alive
      await new Promise((done) => setTimeout(done, poll));
      db?.close(); db = null; // re-open so another process's writes are visible
    }
  }

  /**
   * resolve | dismiss | reply | acknowledge. Throws with a message a person can act on.
   * `plan`: a reply that says what the agent will do and asks for a go-ahead.
   * `shot`: a stored screenshot (takeShot) to attach in the same write.
   */
  async function act(action, id, text = '', { plan = false, shot = null } = {}) {
    const actions = {
      resolve: () => ({ status: 'resolved', resolution: text || 'Applied in source.' }),
      dismiss: () => ({ status: 'dismissed', resolution: text || 'Not applied.' }),
      acknowledge: () => ({ status: 'acknowledged' }),
      // Keeps it open and marks it seen; the question lands under "Questions for you".
      reply: () => { if (!text) throw new Error(plan ? 'a plan needs a message: what you will do' : 'reply needs a message'); return { status: 'acknowledged', reply: text, plan: !!plan }; },
    };
    if (!actions[action]) throw new Error(`unknown action ${action}`);
    if (!open()) throw new Error(`No feedback store for "${name}" (${file}).`);
    const row = db.prepare('SELECT site_id, status FROM ag_annotations WHERE id = ?').get(id);
    if (!row || row.site_id !== name) throw new Error(`No annotation ${id} on "${name}".`);
    if (action === 'reply' && !isOpen(row)) throw new Error(`${id} is ${row.status}; reopen isn't supported — ask about a new note instead.`);
    const out = await agentUpdateAnnotation(env, id, { ...actions[action](), ...(shot ? { shot } : {}), ts: now() });
    if (!out) throw new Error(`No annotation ${id} on "${name}".`);
    if (out.error) throw new Error(out.error);
    return out;
  }

  /**
   * Photograph a note's target and store it (server/shots.js). Not attached yet:
   * pass the result to `act(…, { shot })`, or `attachShot` it on its own.
   * `kind` defaults to before for an open note and after for a closed one;
   * `file` uses an image the agent took itself instead of loading the page.
   */
  async function takeShot(id, { kind, file, settleMs } = {}) {
    const a = get(id);
    if (!a) throw new Error(`No annotation ${id} on "${name}".`);
    const k = kind || (isOpen(a) ? 'before' : 'after');
    if (!SHOT_KINDS.includes(k)) throw new Error(`a shot is ${SHOT_KINDS.join(' or ')}, not "${k}"`);
    if (file) return { ...storeShot(name, id, k, readShotFile(file)), by: 'file' };
    const r = await captureShot({ url: a.page, viewport: a.viewport, selectors: noteSelectors(a), src: root, playhead: a.playhead, ...(settleMs != null ? { settleMs } : {}) });
    return { ...storeShot(name, id, k, r.buf), found: r.found, viewport: r.viewport, ...(r.time !== undefined ? { time: r.time } : {}), ...(r.untimed ? { untimed: true } : {}), ...(r.unsettled ? { unsettled: true } : {}), by: 'auto' };
  }

  /** Attach a stored shot to a note without changing its status. */
  async function attachShot(id, shot) {
    if (!open()) throw new Error(`No feedback store for "${name}" (${file}).`);
    const out = await agentUpdateAnnotation(env, id, { shot, ts: now() });
    if (!out) throw new Error(`No annotation ${id} on "${name}".`);
    if (out.error) throw new Error(out.error);
    return out;
  }

  /**
   * The ids an action applies to. `ids` may be one id or a comma list; with
   * `sameTarget`, each voice note pulls in every other open note spoken at the
   * same target in the same voice session (one thought split at pauses).
   */
  function expandIds(ids, { sameTarget = false } = {}) {
    const wanted = [...new Set(String(ids || '').split(',').map((x) => x.trim()).filter(Boolean))];
    if (!sameTarget) return wanted;
    const open = items();
    const out = [];
    for (const id of wanted) {
      out.push(id);
      const note = get(id);
      const target = note?.voice?.target?.id;
      if (!target) continue;
      for (const n of open) if (n.voice?.target?.id === target && n.voice?.sessionId === note.voice.sessionId) out.push(n.id);
    }
    return [...new Set(out)];
  }

  /**
   * The agent's own notes on a page (critique mode). items: [{selector?, comment, severity?, intent?, suggestion?}]
   * `suggestion` is {kind:'text'|'tweak', from?, to, property?} (sessions.js cleanSuggestion).
   * Refuses a project with no store unless `create` (a typo must not make a new project).
   */
  async function annotate(url, list, { replace = false, create = false } = {}) {
    if (!create && !exists()) throw new Error(unknownProject(name));
    let u;
    try { u = new URL(url); } catch { u = null; }
    if (!u || !/^https?:$/.test(u.protocol)) throw new Error(`annotate needs the page's full URL as the reviewer opens it (e.g. http://localhost:5173/pricing), got "${url}".`);
    for (const it of list || []) {
      if (it?.severity != null && !SEVERITIES.includes(it.severity)) throw new Error(`severity must be one of ${SEVERITIES.join(', ')}, got "${it.severity}".`);
    }
    open(true);
    // With --route-key, the page is path + key params; without one, its path.
    // Passed so a critique for /iframe.html?id=b joins story b's session, not
    // whichever /iframe.html session came first.
    const key = routeKey();
    const pageKey = key ? pageOf(url) : null;
    const result = await createAgentAnnotations(env, { siteId: name, url, items: list, replace, ts: now(), pageKey });
    if (result.error) throw new Error(result.error);
    return result;
  }

  async function clearCritique() {
    if (!open()) return 0;
    return Number(db.prepare("DELETE FROM ag_annotations WHERE site_id = ? AND author = 'agent'").run(name).changes);
  }

  /**
   * The agent's critique as get_critique and `list --agent` show it: the open
   * notes plus the ones the reviewer decided, so a Not an issue and its reason
   * reach the agent instead of vanishing. `all` adds every closed note.
   */
  function critique({ all = false } = {}) {
    return read({ all: true, author: 'agent' }).filter((a) => all || isOpen(a) || (a.decision && a.decision.decision !== 'discuss'));
  }

  return { name, file, root, env, exists, items, get, read, wait, act, takeShot, attachShot, expandIds, annotate, clearCritique, critique, pointers, hits, describe, render, round, pageOf };
}
