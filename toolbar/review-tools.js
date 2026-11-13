import { createHost, markChrome, threadCSS, paintThread, slotPanel, Z, failMessage, statusOf, placeNearToolbar, placeToast, slotFront, toolbarShell, statusLine, holdFocus, focusFirst, focusKeeper, focusMode, onScreen, CLOSE_ICON } from './ui.js';
import { focusInto } from './a11y.js';
import { viewport, belongsToViewport, createViewportSimulator } from './viewport.js';
import { keyOf, pageKey } from './page-key.js';
import { reviewerName, ensureReviewer, changeReviewer, isMine, isForMe, ownsNote } from './reviewer.js';
import { openCopyView } from './copy-open.js';
import { FONT, MONO } from './brand.js';
import { MARK, BUB } from './brand-art.js';

const icons = {
  grip: '<path d="M9.5 6v12M14.5 6v12"/>',
  edit: '<path d="M4 5h16M12 5v15M8 20h8"/>',
  inbox: '<path d="M4 5h16v15H4zM4 14h5l2 3h2l2-3h5"/>',
  locate: '<circle cx=\"12\" cy=\"12\" r=\"6\"/><path d=\"M12 2v4M12 18v4M2 12h4M18 12h4\"/>',
  voice: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
  viewport: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  // More › Viewport draws the device it is on (UX review 4, N16).
  'viewport-tablet': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',
  'viewport-mobile': '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  done: '<path d="M4 12l16-8-6 16-3-7z"/>',
  more: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="2.6"/>',
  comment: '<path d="M4 5h16v11H9.5L5 19.5V16H4z"/>',
  tweak: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  updown: '<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
  layout: '<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  markers: '<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.8M6.6 6.6C4.5 8 3.1 10 2.5 12c1 2.5 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  markdown: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h4"/>',
  clear: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  'agent-listening': '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',
  'agent-offline': '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 12h7"/>',
  'agent-working': '<circle cx="12" cy="12" r="8" opacity=".25"/><path d="M20 12a8 8 0 0 0-8-8"/>',
  'agent-complete': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',
  'agent-needs-input': '<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2M12 13.6h.01"/>',
  'agent-failed': '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  commit: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  revise: '<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',
  reject: '<path d="M6 6l12 12M18 6L6 18"/>',
  chevron: '<path d="M6 15l6-6 6 6"/>',
  critique: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',
  checks: '<path d="M5.2 16.5a7.5 7.5 0 1 1 13.6 0"/><path d="M12 13.5l3.2-3.6"/>'
};
// Mirrored from the shared store on load, so a reload still knows the round went.
// Every share link on a host shares this localStorage, so a round names its link.
const linkOf = endpoint => { try { return new URL(endpoint, location.href).pathname; } catch { return ''; } };
const roundOf = endpoint => { try { const r = JSON.parse(localStorage.getItem('agentation-round')); return r?.link === linkOf(endpoint) ? r : null; } catch { return null; } };
const lastRound = endpoint => roundOf(endpoint)?.ts || 0;
// Mine / Everyone in the inbox. A per-browser view setting, so not an agentation* key.
const FILTER = 'feedback-toolbar-inbox-filter';
const readFilter = () => { try { return localStorage.getItem(FILTER) === 'mine' ? 'mine' : 'all'; } catch { return 'all'; } };
const sentLabel = ts => { const d = new Date(ts), time = d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}); return d.toDateString() === new Date().toDateString() ? time : d.toLocaleDateString([], {month:'short',day:'numeric'}) + ', ' + time; };
// The agent's critique has its own panel (critique.js). Your inbox is your notes.
// A note cleared with Clear all is a tombstone on the server (status
// dismissed, resolution "Cleared by …"). It was deleted from the reviewer's
// point of view, so it leaves the inbox as it did when Clear all hard-deleted.
// Rejected notes stay as history.
// A Fix it the reviewer undid in From the agent (critique.js) is the same: the
// note it made never stood, so it doesn't sit under Done as "Not applied".
export const cleared = a => a.status === 'dismissed' && /^(Cleared by |Undone by .*: Fix it taken back\.$)/.test(a.resolution || '');
const mine = a => a.author !== 'agent' && !cleared(a);
const open_ = a => !['resolved','dismissed'].includes(a.status);
/** An open note whose newest message is the agent's: it is waiting on the reviewer. */
export const isQuestion = a => open_(a) && a.author !== 'agent' && a.replies?.length > 0 && a.replies[a.replies.length-1].from === 'agent';
/**
 * The questions waiting on this browser's reviewer: on a note of theirs, or
 * one nobody signed. The inbox's badge, its list and the Send sheet all count
 * with this, so they agree (UX review 6, N6: the sheet counted everyone's).
 */
export const questionsForMe = rows => rows.filter(a => isQuestion(a) && isForMe(a));
/**
 * A note row's label: its kind, then its viewport when it was left at one.
 * "Any viewport" was the default on nearly every row and pushed the author
 * past the ellipsis (UX review 6, N10). Text edit mode lists only edits, so
 * there the kind goes too.
 */
export function rowLabel(a, editing = false) {
  const kind = editing ? '' : a.kind === 'edit' ? 'Text edit' : a.kind === 'tweak' ? 'Tweak' : 'Comment';
  return [kind, a.viewport?.name].filter(Boolean).join(' · ');
}
// A page is its key (page-key.js): the pathname, or pathname + the host's route params.
const pathOf = url => keyOf(url);
// Brand art stands in for three line icons: the mark is Comment, and Bub is the
// agent while it listens, works or is away (brand-art.js).
const ART = { comment: MARK, 'agent-listening': BUB.ready, 'agent-working': BUB.working, 'agent-offline': BUB.asleep };
const svg = key => ART[key] || `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || ''}</svg>`;
// Browser-local like `feedback-toolbar-position`: an `agentation*` key would ride the KV
// bridge to every reviewer, and one reviewer's drag would switch avoidance off for all.
const HAND_PLACED = 'feedback-toolbar-placed';
/**
 * What the Send sheet says, from its counts. Pure, so the wording is tested
 * without a page.
 *
 * `fresh` is the bar's number (unsent notes, edits and tweaks), `n` every open
 * note plus those, `has` the open notes the agent already has. Nothing new and
 * something open is "went", whether or not this browser ever pressed Send: the
 * bar says "Nothing to send yet" then, and the sheet used to offer a primary
 * "Send to agent" and "You can send now" under it (UX review 5, #8).
 *
 * `lead` is a list of strings and `{ b }` runs (bold), in order.
 */
export function sendSummary({ fresh = 0, n = 0, has = 0, pages = 1, sentAt = 0, qs = 0, drafts = 0, tweaks = 0 } = {}) {
  const across = pages > 1 ? ' across ' + pages + ' pages' : '';
  const went = !fresh && n > 0;
  const plural = (k, one, many) => k + (k === 1 ? one : many);
  let lead;
  if (fresh) lead = [{ b: plural(fresh, ' new note', ' new notes') }, has ? `${across}. The agent reads ${fresh === 1 ? 'it' : 'them'} with the ${has} it already has.` : `${across} for the agent.`];
  else if (went) lead = ['The agent has ', { b: plural(n, ' note', ' notes') }, across + '. Nothing new to send.'];
  else lead = ['No notes yet.'];
  const facts = [];
  if (drafts) facts.push(plural(drafts, ' text edit', ' text edits') + ' will be saved first.');
  if (tweaks) facts.push(plural(tweaks, ' tweak', ' tweaks') + ' will be saved first.');
  if (qs) facts.push(plural(qs, ' question is', ' questions are') + ' waiting on your answer.' + (fresh ? ' You can send now and answer later.' : ''));
  return {
    went, lead, facts,
    send: { label: fresh ? `Send ${fresh}` : went || sentAt ? 'Send again' : 'Send to agent', kind: went ? 'ghost' : 'primary', disabled: !n },
  };
}

export function createReviewTools({ endpoint, sessionId, editMode, copyView = true }) {
  // All text needs the review server's copy view; a host without one passes copyView:false.
  const canCopyView = copyView !== false && !!endpoint;
  let rows = [], sessions = [], mode = null, expanded = false, loading = false, error = '', focused = null, saving = false, sentAt = lastRound(endpoint), sentBy = roundOf(endpoint)?.reviewer || '', armedAt = 0, who = readFilter();
  const openRows = new Set();
  // A note just added, until the server lists it. The component posts it after
  // telling us, and the event stream polls every 3s, so without this Send's
  // count lagged a new note by up to 3s.
  //
  // ⚠️ One note, two ids. The component makes the note with its own id
  // (Date.now()), and the server stores it under a new one ("ann_…") with the
  // component's id as clientId. Matching on id alone counted the optimistic
  // copy and the server copy as two notes until the optimistic one aged out
  // (15s): Send went 3, 4, 5 for one note and the inbox listed it twice. So
  // `added` is keyed by the component's id, and a note is the same note when
  // either id matches.
  const added = new Map();
  const idsOf = a => [a.id, a.clientId].filter(Boolean).map(String);
  const listed = () => sessions.length ? sessions.flatMap(s => s.annotations.map(a => ({ ...a, page: s.url, here: s.id === sessionId }))) : rows.map(a => ({ ...a, page: location.href, here: true }));
  const knownIds = list => new Set(list.flatMap(idsOf));
  const allRows = () => { const list = listed(); if (!added.size) return list; const known = knownIds(list); return list.concat([...added.values()].filter(a => !idsOf(a).some(id => known.has(id))).map(a => ({ ...a, page: location.href, here: true }))); };
  function noteAdded(a) {
    if (!a?.id || a.author === 'agent' || ['resolved','dismissed'].includes(a.status)) return;
    document.dispatchEvent(new CustomEvent('agentation-kit:note-added'));
    const key = String(a.clientId || a.id);
    // The server's copy (from the stream) replaces the optimistic one, never joins it.
    if (!idsOf(a).some(id => knownIds(listed()).has(id))) added.set(key, { ...added.get(key), ...a, reviewer: a.reviewer || reviewerName() || undefined, status: a.status || 'pending', timestamp: Number(a.timestamp) || Number(a.createdAt) || Date.now(), seen: Date.now() });
    updateButtons(); if (mode === 'inbox' && !focused && !saving) render();
    refresh(true); setTimeout(() => refresh(true), 700);
  }
  const simulator = createViewportSimulator();
  const ui = createHost(`
    [hidden],.panel[data-deferred]{display:none!important}
    .panel{position:fixed;right:20px;bottom:122px;width:320px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 150px);overflow:auto;z-index:${Z.panel};font:13px/1.5 var(--sk-font)}
    .panel.strip{width:max-content}.panel.strip .hd{border-bottom:0;padding:6px 6px 6px 11px;white-space:nowrap}.panel.strip .body{display:none}
    .hd #commit-all,.hd #all-copy{padding:3px 9px;min-height:26px;font-size:12px}.hd #toggle{display:grid;place-items:center;width:26px;height:26px;min-height:26px;padding:0}.hd #toggle[aria-expanded=true] svg{transform:rotate(180deg)}
    .hd{position:sticky;top:0;background:var(--sk-surface);z-index:2}
    .body{padding:12px}.hint{color:var(--sk-text-2);margin:0 0 12px}.empty{padding:24px 6px;text-align:center}
    .row{padding:7px 0 9px;border-bottom:1px solid var(--sk-hairline)}.row:last-child{border-bottom:0}
    /* An answered row holds focus (F-Answer): its ring clears the text it surrounds. */
    .row[tabindex="-1"]:focus{outline:2px solid var(--sk-focus);outline-offset:4px;border-radius:4px}
    /* Brought into view, a row leaves room for that ring (6px) below and above it (UX review 6, N9). */
    .row{scroll-margin-block:8px}
    .meta{display:flex;align-items:center;gap:6px;color:var(--sk-text-2);font-size:12px;min-height:26px;margin-bottom:3px}.meta .tools{margin-left:auto;display:flex;align-items:center;gap:1px;flex:none}.meta .tools button{padding:0;width:26px;min-height:26px;display:grid;place-items:center}.meta .label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy{white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0;font-size:13px}.row:not(.open) .copy{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}.row[data-expandable]{cursor:pointer}
    /* Before and After are words, not a coloured bar down one side: the old
       text keeps its strike-through, the new text reads at full strength. */
    .diff{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:2px 8px;align-items:baseline;margin:0}.diff>div{display:contents}
    .diff small{font-size:12px;color:var(--sk-text-3)}.diff .txt{white-space:pre-wrap;overflow-wrap:anywhere;min-width:0}
    .before .txt{color:var(--sk-text-2);text-decoration:line-through;text-decoration-thickness:1px}.after .txt{font-size:12.5px}
    .row:not(.open) .before .txt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row:not(.open) .after .txt{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
    .actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}button{min-height:32px}button:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    .actions button{padding:4px 10px;font:inherit}
    label{display:block;margin:10px 0 4px;color:var(--sk-text-2)}textarea{width:100%;min-height:90px;box-sizing:border-box;resize:vertical}
    .message{padding:9px 12px;color:var(--sk-text-2);overflow-wrap:anywhere}.message.error{color:#df8989}:host([data-sk-theme=light]) .message.error{color:#c53030}
    .why{margin:8px 0 0;color:var(--sk-text-2)}
    .devices{display:grid;gap:8px}.devices button{text-align:left;display:flex;justify-content:space-between;padding:10px 12px}
    select{font:inherit;background:var(--sk-surface);color:var(--sk-text);padding:6px;border:1px solid var(--sk-hairline);border-radius:8px;max-width:100%}
    .sec{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--sk-text-2);margin:14px 0 0;padding-bottom:4px;border-bottom:1px solid var(--sk-hairline)}.sec:first-child{margin-top:0}
    .sec .n{font-weight:500;color:var(--sk-text-3)}
    .meta .label.page{color:var(--sk-text-2);overflow-wrap:anywhere}.meta .q{color:var(--sk-text);font-weight:600}
    .tweak-what{margin:2px 0 3px;font:12px/1.4 var(--sk-mono);overflow-wrap:anywhere}
    .who-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 10px;color:var(--sk-text-2);font-size:12px}.who-bar .me{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.who-bar .ghost{padding:2px 6px;min-height:26px;font-size:12px}.who-bar .chips{display:flex;gap:4px;margin-left:auto}.who-bar .chip{min-height:26px}
    .meta .by{color:var(--sk-text);font-weight:500}.meta .label.with-by{display:flex}.meta .label.with-by .txt{min-width:0;overflow:hidden;text-overflow:ellipsis}.meta .label.with-by .sep{flex:none;white-space:pre}.meta .label.with-by .by{flex:none;max-width:60%;overflow:hidden;text-overflow:ellipsis}
    .row.from-agent{display:flex;align-items:center;justify-content:space-between;gap:12px}.row.from-agent .copy{margin:0}
    .summary{margin:0 0 12px;font-size:12.5px}.summary b{font-weight:600}.sent{display:flex;align-items:flex-start;gap:6px}.sent svg{flex:none;width:14px;height:14px;margin-top:2px}
    /* The notice's shape and type (voice.css.js .notice). A guard or a heads-up
       is not an error: its lead is the text colour. Red is for a real failure,
       a note that did not save (UX review 6, N8). */
    .toast{position:fixed;z-index:${Z.toast};max-width:min(320px,calc(100vw - 24px));padding:9px 12px;border-radius:8px;font:12px/1.45 var(--sk-font);background:var(--sk-surface);color:var(--sk-text);box-shadow:0 4px 18px rgba(0,0,0,.25),0 0 0 1px var(--sk-hairline)}
    .toast strong{color:var(--sk-text);font-weight:600}.toast.fail strong{color:#df8989}:host([data-sk-theme=light]) .toast.fail strong{color:#c53030}
${threadCSS()}
    /* Text is 12px or more (ui.js's shared sizes go to 11px). */
    .hd .grow,.chip,.status,.who{font-size:12px}
    @media (pointer:coarse){button{min-height:44px}.who-bar .chip,.who-bar .ghost{min-height:44px}.meta .tools button{width:44px;min-height:44px}.hd #commit-all,.hd #all-copy,.hd #toggle{min-height:44px}.hd #toggle{width:44px;height:44px;min-width:44px;display:grid;place-items:center}.panel.strip .hd{padding:3px 3px 3px 12px}}
  `);
  const panel = document.createElement('section'); panel.className = 'panel'; panel.hidden = true;
  panel.setAttribute('aria-label', 'Review tools');
  panel.innerHTML = '<div class="hd"><span id="title" class="title sk-title">Feedback inbox</span><span class="grow" id="count"></span><button id="all-copy" class="ghost" hidden title="Edit every string, full page (Shift T)" aria-keyshortcuts="Shift+T">All text</button><button id="commit-all" class="primary" hidden>Save</button><button id="toggle" class="iconbtn" hidden></button><button id="close" class="sk-x" aria-label="Close review panel" title="Close">' + CLOSE_ICON + '</button></div><div class="message" id="message" role="status" aria-live="polite"></div><div class="body" id="body"></div>';
  ui.root.append(panel);
  ui.el('close').onclick = () => open(null);
  ui.el('toggle').innerHTML = svg('chevron');
  ui.el('toggle').onclick = () => { expanded = !expanded; render(); };
  // All text (copy edit mode): every string on the page and in its scripts, full page.
  const allText = () => act(async () => {
    const r = await openCopyView(endpoint);
    if (!r.ok) throw new Error(`Couldn’t open All text: ${r.error}.`);
    if (r.blocked) throw new Error(`The browser blocked the new tab. Open ${r.url}`);
  });
  ui.el('all-copy').onclick = allText;
  // Shift T, anywhere on the page except while typing. (T alone is Edit text.)
  document.addEventListener('keydown', e => {
    if (e.key !== 'T' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || !canCopyView) return;
    if (e.composedPath().some(n => n instanceof Element && n.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'))) return;
    e.preventDefault(); e.stopPropagation(); allText();
  }, true);
  ui.el('commit-all').onclick = () => act(async () => {
    const n = draftEdits().length; const result = await editMode.commit();
    if (result.failed || result.count < n) throw new Error('Could not save. Your drafts are kept; retry when connected.');
  });
  const toast = document.createElement('div'); toast.className = 'toast'; toast.hidden = true; toast.setAttribute('role','alert'); ui.root.append(toast);
  let toastTimer = null;
  // `fail`: something the reviewer made was lost or not saved. Only that is red.
  function showToast(node, ms = 5000, fail = false) {
    toast.replaceChildren(node); toast.hidden = false; toast.classList.toggle('fail', fail);
    const r = document.querySelector('[data-agentation-toolbar]')?.getBoundingClientRect();
    const w = Math.min(320, innerWidth - 24);
    toast.style.left = Math.max(12, Math.min((r ? r.right : innerWidth - 12) - w, innerWidth - w - 12)) + 'px';
    toast.style.top = 'auto'; toast.style.bottom = Math.max(12, innerHeight - (r ? r.top : innerHeight - 70) + 10) + 'px';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.hidden = true; }, ms);
  }
  // ⚠️ Clear all used to delete every note on this page, everyone's, in one
  // click or the bare X key. It now clears only the notes this reviewer owns
  // (the seam in build.mjs filters with ownsNote and asks this first). The
  // first press arms it and says exactly what it will clear; only a second
  // press within the window does it.
  window.__AGENTATION_KIT_CONFIRM_CLEAR__ = (count, others = 0) => {
    const t = document.createElement('div'); const s = document.createElement('strong');
    const theirs = others ? ' Notes from other reviewers stay.' : '';
    if (!count) {
      armedAt = 0;
      s.textContent = others ? 'None of the notes on this page are yours.' : 'Nothing to clear on this page.';
      t.append(s, document.createTextNode(others ? ' Clear removes only your own notes.' : ''));
      showToast(t); return false;
    }
    const now = Date.now();
    if (armedAt && now - armedAt < 5000) { armedAt = 0; toast.hidden = true; return true; }
    armedAt = now;
    s.textContent = count === 1 ? 'Clear your note on this page?' : 'Clear your ' + count + ' notes on this page?';
    t.append(s, document.createTextNode(' Press Clear again within 5 seconds.' + theirs + ' To drop one note, delete it in the inbox instead.'));
    showToast(t); return false;
  };
  // One floating layer at a time (UX review 5, #1). The toolbar's own comment
  // popup is not in the panel slot, so More, Send, the inbox and the rest
  // opened over it, and on a phone a half-typed note sat behind the sheet.
  // A bar button that opens something closes an empty popup first. A popup
  // with words in it stays and the button waits: the note is the reviewer's,
  // and the popup is the component's, with no draft to keep it in.
  // Returns true when the way is clear.
  function popupYields() {
    // Any popup on the page that is not on its way out, whatever its opacity:
    // one still fading in (a slow machine) holds words too, and onScreen()'s
    // opacity floor let a bar button walk past it. Hidden ones (visibility,
    // display, no size) still don't count: nothing invisible blocks the bar.
    const pop = [...document.querySelectorAll('[data-annotation-popup]')].find(n => { if (!n.isConnected || n.hidden || /exit___/.test(n.className)) return false; const r = n.getBoundingClientRect(), cs = getComputedStyle(n); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; });
    if (!pop) return true;
    const field = pop.querySelector('textarea');
    // Any words count, an edit popup's too: React keeps defaultValue in step
    // with what is typed, so an unchanged note can't be told from a changed one.
    if ((field?.value || '').trim()) {
      const t = document.createElement('div'); const b = document.createElement('strong'); b.textContent = 'Finish or cancel the note first.';
      t.append(b); showToast(t, 4000); field.focus({ preventScroll: true });
      return false;
    }
    pop.querySelector('[class*="cancel___"]')?.click();
    return true;
  }
  // Exit is the component's own button, and the one that threw a typed note
  // away: it collapsed the bar and the popup with it (UX review 6, N3). It
  // waits behind words as our bar buttons do. Capture on the document runs
  // before React's listener on its root.
  const isExit = b => b?.parentElement?.querySelector(':scope>[class*="buttonTooltip"]')?.firstChild?.textContent?.trim() === 'Exit';
  document.addEventListener('click', e => {
    const b = e.target?.closest?.('[data-agentation-toolbar] [class*="controlsContent"] button');
    if (!b || !isExit(b) || popupYields()) return;
    e.preventDefault(); e.stopPropagation();
  }, true);
  // A new note the server would not take (413 too long, 409, offline). The
  // toolbar keeps it on the page and in this browser; say so, never silently.
  window.__AGENTATION_KIT_SAVE_FAILED__ = err => {
    const t = document.createElement('div'); const s = document.createElement('strong');
    s.textContent = 'Your note was not saved to the review server.';
    t.append(s, document.createTextNode(' ' + failMessage(statusOf(err)).replace('Your text is kept', 'It is kept on this page').replace('Shorten it and try again.', 'Edit it shorter from its marker to retry.')));
    showToast(t, 9000, true);
  };
  window.__AGENTATION_KIT_NOT_YOURS__ = a => {
    const t = document.createElement('div'); const s = document.createElement('strong');
    s.textContent = a?.reviewer ? 'This note is ' + a.reviewer + '\u2019s.' : 'This note is not yours.';
    t.append(s, document.createTextNode(' Only the reviewer who left it can delete it.'));
    showToast(t);
  };
  // The bar (show-and-tell.pen, "Show and tell redesign", chapter 1). It reads
  // as a round: move, the four ways to give feedback, then the round's own
  // controls (inbox, the agent, Send, More). Exactly one mode is on; names and
  // keys live in tooltips. On a phone the current mode is one named button that
  // opens a short sheet, because phones have no hover for tooltips.
  // The component's own tools (layout, pause, markers, copy, clear, settings)
  // stay mounted but hidden: React owns them. More lists them and clicks them.
  let dock = null, dockEnd = null, more = false, sheetOpen = false;
  const MODES = [
    { key:'comment', name:'Comment', hint:'Click anything and type a note.', shortcut:'N' },
    { key:'voice', name:'Talk', hint:'Talk while you point. Your words stay with what you point at.', shortcut:'V' },
    { key:'edit', name:'Edit text', hint:'Rewrite text in place, or open all page text full screen.', shortcut:'T' },
    { key:'tweak', name:'Tweak', hint:'Change size, spacing and colour, using sizes the page already has.', shortcut:'D' },
  ];
  const tweak = () => window.__AGENTATION_KIT_TWEAK__;
  const modeAvailable = m => m.key === 'tweak' ? !!tweak() : m.key === 'voice' ? !!window.__AGENTATION_KIT_VOICE__ : true;
  const voiceOn = () => !!window.__AGENTATION_KIT_VOICE_RECORDING__ || slotFront() === 'voice';
  function currentMode() {
    if (voiceOn()) return 'voice';
    if (editMode?.active) return 'edit';
    if (tweak()?.active) return 'tweak';
    return 'comment';
  }
  function setMode(key) {
    if (key !== 'comment' && key !== currentMode() && !popupYields()) return;
    setMore(false); setSheet(false);
    // Talk's setup panel closes on any other mode, and on Talk again (voice.js
    // close). A recording keeps going: it has its own Stop.
    const voice = window.__AGENTATION_KIT_VOICE__;
    if (key === 'voice' && slotFront() === 'voice' && !window.__AGENTATION_KIT_VOICE_RECORDING__) { voice?.close?.(); updateButtons(); return; }
    if (key !== 'voice' && !window.__AGENTATION_KIT_VOICE_RECORDING__) voice?.close?.();
    if (key === 'edit') { tweak()?.toggle(false); editMode?.toggle(); open(editMode?.active ? 'edits' : null); return; }
    // Talk owns the page while it points: leave Edit text and Tweak first, or
    // Tweak would keep swallowing the clicks that pick a target.
    if (key === 'voice') { tweak()?.toggle(false); if (editMode?.active) editMode.toggle(false); window.__AGENTATION_KIT_VOICE__?.open(); updateButtons(); return; }
    if (editMode?.active) editMode.toggle(false);
    tweak()?.toggle(key === 'tweak');
    updateButtons();
  }
  const typing = e => e.composedPath().some(n => n instanceof Element && n.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'));
  const barOpen = () => !!document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]');
  // N, V, T and D pick a mode while the bar is open. The kit's other single
  // keys stay as the component has them (P, L, H, C, X, S).
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.repeat) return;
    const m = MODES.find(x => x.shortcut === e.key.toUpperCase());
    if (!m || !modeAvailable(m) || !barOpen() || typing(e)) return;
    if (m.key === 'edit' && !editMode) return;
    e.preventDefault(); e.stopPropagation(); setMode(m.key);
  }, true);
  // Bar buttons carry no native title: one styled tooltip (below) reads data-tip
  // and data-key, like the component's own "Exit Esc". The aria-label stays.
  const make = (cls, key, label) => { const b = document.createElement('button'); b.className = cls; b.dataset.review = key; b.dataset.tip = label; b.setAttribute('aria-label', label); b.innerHTML = svg(key); return b; };
  function attachDock() {
    document.querySelectorAll('[data-agentation-root] a[class*="settingsBrand"]').forEach(a => a.setAttribute('aria-label','Built on Agentation: opens agentation.com'));
    const webhook=document.querySelector('[data-agentation-root] textarea[placeholder="Webhook URL"]');
    if (webhook && !webhook.getAttribute('aria-label')) {
      webhook.id ||= 'sk-webhook-url'; webhook.setAttribute('aria-label','Webhook URL');
      const label=document.createElement('label');label.htmlFor=webhook.id;label.textContent='Webhook URL';
      label.style.cssText='display:block;font:12px '+FONT+';margin:4px 0;color:inherit';
      webhook.before(label);
    }
    const controls = document.querySelector('[data-agentation-toolbar] [class*="controlsContent"]');
    if (!controls || dock?.isConnected) return;
    const cls = controls.querySelector('button')?.className || '';
    dock = markChrome(document.createElement('div')); dock.className = 'sk-review-controls';
    dock.append(make(cls, 'grip', 'Move toolbar'));
    const modes = document.createElement('div'); modes.className = 'sk-modes'; modes.setAttribute('role','group'); modes.setAttribute('aria-label','Feedback mode');
    for (const m of MODES) {
      const b = make(cls, m.key, m.name); b.dataset.mode = m.key; b.dataset.key = m.shortcut;
      // The name shows while the mode is on (CSS). It is built once and never
      // repainted: replacing a button's contents during its own click leaves
      // the click's target detached, and the component then reads the click
      // as one on the page and opens a comment on it.
      const word = document.createElement('span'); word.className = 'sk-label'; word.textContent = m.name; word.setAttribute('aria-hidden', 'true'); b.append(word);
      b.setAttribute('aria-keyshortcuts', m.shortcut); b.setAttribute('aria-pressed','false');
      b.onclick = e => { e.stopPropagation(); setMode(m.key); };
      modes.append(b);
    }
    const pick = make(cls + ' sk-mode-pick', 'mode', 'Change mode'); pick.setAttribute('aria-haspopup','menu'); pick.setAttribute('aria-expanded','false');
    pick.onclick = e => { e.stopPropagation(); if (!sheetOpen && !popupYields()) return; setSheet(!sheetOpen); };
    const divider = document.createElement('span'); divider.className = 'sk-divider'; divider.setAttribute('aria-hidden','true');
    const inbox = make(cls, 'inbox', 'Feedback inbox'); inbox.setAttribute('aria-pressed','false');
    inbox.onclick = e => { e.stopPropagation(); if (mode !== 'inbox' && !popupYields()) return; setMore(false); setSheet(false); open(mode === 'inbox' ? null : 'inbox'); };
    const agent = make(cls + ' sk-agent', 'agent', 'Agent status'); agent.hidden = true; agent.setAttribute('aria-haspopup','dialog');
    agent.onclick = e => { e.stopPropagation(); if (slotFront() !== 'agent-work' && !popupYields()) return; setMore(false); setSheet(false); window.__AGENTATION_KIT_AGENT_WORK__?.toggle?.(); };
    const send = make(cls + ' sk-send', 'done', 'Send feedback to the agent'); send.setAttribute('aria-pressed','false');
    send.onclick = e => { e.stopPropagation(); if (mode !== 'done' && !popupYields()) return; setMore(false); setSheet(false); open(mode === 'done' ? null : 'done'); };
    dock.append(modes, pick, divider, inbox, agent, send);
    dockEnd = markChrome(document.createElement('div')); dockEnd.className = 'sk-review-controls sk-review-end';
    const moreButton = make(cls, 'more', 'More tools'); moreButton.setAttribute('aria-haspopup','menu'); moreButton.setAttribute('aria-expanded','false');
    moreButton.onclick = e => { e.stopPropagation(); if (!more && !popupYields()) return; setSheet(false); setMore(!more); };
    dockEnd.append(moreButton);
    controls.prepend(dock);
    controls.insertBefore(dockEnd, controls.querySelector(':scope>[class*="divider"]') || controls.lastElementChild);
    controls.querySelectorAll('button:not([aria-label])').forEach(b => {
      const tooltip = b.parentElement.querySelector('[class*="buttonTooltip"]');
      if (tooltip) b.setAttribute('aria-label', tooltip.childNodes[0]?.textContent?.trim() || tooltip.textContent.trim());
    });
    if (!editMode) { const edit = dock.querySelector('[data-mode=edit]'); edit.disabled = true; edit.dataset.tip = window.__AGENTATION_KIT_EDIT_STANDDOWN__ || 'Text editing unavailable'; delete edit.dataset.key; }
    for (const el of [dock, dockEnd]) { el.addEventListener('pointerover', tipOver); el.addEventListener('pointerout', tipOut); el.addEventListener('focusin', tipFocus); el.addEventListener('focusout', hideTip); el.addEventListener('pointerdown', hideTip, true); }
    watchInert();
    const grip = dock.querySelector('[data-review=grip]');
    grip.style.touchAction = 'none'; grip.style.cursor = 'grab';
    let drag = null;
    grip.onpointerdown = e => {
      if (e.button !== 0) return;
      placedByHand(); setMore(false); setSheet(false);
      e.preventDefault(); e.stopPropagation();
      const r = document.querySelector('[data-agentation-toolbar]').getBoundingClientRect();
      drag = { x:e.clientX, y:e.clientY, left:r.left, top:r.top };
      grip.setPointerCapture(e.pointerId);
    };
    grip.onpointermove = e => { if (drag) move(drag.left + e.clientX-drag.x, drag.top+e.clientY-drag.y); };
    grip.onpointerup = grip.onpointercancel = () => { drag = null; };
    grip.onkeydown = e => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)) return;
      e.preventDefault();e.stopPropagation();placedByHand();const r = document.querySelector('[data-agentation-toolbar]').getBoundingClientRect();
      const step = e.shiftKey ? 40 : 10;
      move(e.key === 'Home' ? innerWidth-r.width-20 : r.left+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0),e.key === 'Home' ? innerHeight-r.height-20 : r.top+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));
    };
    paintAgent(window.__AGENTATION_KIT_AGENT_WORK_STATUS__);
    paintCritique();
    updateButtons();
  }
  // More, and the phone's mode sheet: small menus just above the bar, one at
  // a time in the panel slot. They cover nothing but the bar's own band.
  const menuStyle = document.createElement('style');
  menuStyle.textContent = `
    .menu{position:fixed;z-index:${Z.panel};width:max-content;min-width:232px;max-width:calc(100vw - 24px);padding:6px;background:var(--sk-surface);color:var(--sk-text);border-radius:14px;box-shadow:var(--sk-ring);font:400 13px/1.4 var(--sk-font)}
    .menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:34px;padding:6px 10px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .menu button:hover,.menu button:focus-visible{background:var(--sk-hover);outline:none}
    /* The keyboard's place in the menu is a ring, not only the hover tint (UX review 6, N11). */
    .menu button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:-2px}
    .menu button svg{flex:none;width:16px;height:16px;color:var(--sk-text-2)}.menu button svg[data-art]{width:18px;height:18px;color:var(--sk-text)}
    .menu .k,.menu .v{margin-left:auto;padding-left:16px;color:var(--sk-text-3);font-size:12px}
    .menu .v{color:var(--sk-text-2)}
    .menu hr{border:0;border-top:1px solid var(--sk-hairline);margin:5px 4px}
    .menu .danger,.menu .danger svg{color:#FF8FB3}
    /* Light: the dark theme's danger pink is 2.4:1 on white; this is 5.9:1 (N6). */
    :host([data-sk-theme=light]) .menu .danger,:host([data-sk-theme=light]) .menu .danger svg{color:#B0204A}
    .menu .two{display:grid;gap:2px}.menu .two small{color:var(--sk-text-2);font-size:12px;line-height:1.35}
    .menu.sheet button{align-items:flex-start;padding:10px}.menu.sheet button svg{margin-top:1px}
    .menu .tick{margin-left:auto;padding-left:12px;visibility:hidden}.menu [aria-checked=true] .tick{visibility:visible;color:var(--sk-text)}
    @media (pointer:coarse){.menu button{min-height:44px}.menu .k{display:none}}
    /* The bar's tooltip, drawn like the component's own ("Exit Esc"). */
    .tip{position:fixed;z-index:${Z.toast};padding:6px 10px;background:#1D1A2F;color:rgba(255,244,224,.94);font:500 12px/1.3 var(--sk-font);border-radius:8px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(12,10,24,.3),0 0 0 1px rgba(255,244,224,.14)}
    .tip::after{content:"";position:absolute;left:var(--x,50%);top:calc(100% - 4px);width:8px;height:8px;background:inherit;border-radius:0 0 2px 0;transform:translateX(-50%) rotate(45deg)}
    .tip.below::after{top:-4px;border-radius:2px 0 0 0}
    /* The key hint is quieter than the name but still 4.5:1 (N6): dark .65, light .6. */
    .tip .k{margin-left:4px;color:rgba(255,244,224,.68)}
    :host([data-sk-theme=light]) .tip{background:#FFFCF5;color:rgba(29,26,47,.94);box-shadow:0 2px 8px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04)}
    :host([data-sk-theme=light]) .tip .k{color:rgba(29,26,47,.66)}
  `;
  ui.root.append(menuStyle);
  const menu = document.createElement('div'); menu.className = 'menu'; menu.setAttribute('role','menu'); menu.setAttribute('aria-label','More tools'); menu.hidden = true;
  const sheet = document.createElement('div'); sheet.className = 'menu sheet'; sheet.setAttribute('role','menu'); sheet.setAttribute('aria-label','Feedback mode'); sheet.hidden = true;
  ui.root.append(menu, sheet);
  // A menu is one tab stop (UX review 6, N11): ArrowUp and ArrowDown move
  // between its items and wrap, Home and End go to the first and last.
  for (const m of [menu, sheet]) {
    m.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const items = [...m.querySelectorAll('button')].filter(b => !b.disabled && !b.hidden);
      if (!items.length) return;
      const i = items.indexOf(ui.root.activeElement), last = items.length - 1;
      const to = { ArrowDown: i < 0 ? 0 : i === last ? 0 : i + 1, ArrowUp: i <= 0 ? last : i - 1, Home: 0, End: last }[e.key];
      if (to === undefined) return;
      e.preventDefault(); e.stopPropagation(); items[to].focus();
    });
    m.addEventListener('focusin', e => { for (const b of m.querySelectorAll('button')) b.tabIndex = b === e.target ? 0 : -1; });
  }
  // One tooltip for every button on the bar. Hover waits as the component's
  // does (850ms, then at once while moving along the bar); keyboard focus shows
  // it at once. Never on touch: there is no hover, and the phone's mode button
  // is labelled.
  const tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.setAttribute('aria-hidden', 'true'); tipEl.hidden = true; tipEl.dataset.barTip = '';
  ui.root.append(tipEl);
  let tipFor = null, tipTimer = 0, tipShownAt = 0;
  const tipButton = e => { const b = e.target?.closest?.('button[data-tip]'); return b && !b.hidden ? b : null; };
  const settingsOpen = () => !!document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]');
  function paintTip(b) {
    tipEl.replaceChildren(document.createTextNode(b.dataset.tip));
    if (b.dataset.key) { const k = document.createElement('span'); k.className = 'k'; k.textContent = b.dataset.key; tipEl.append(k); }
    tipEl.hidden = false;
    const r = b.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    const left = Math.round(Math.max(8, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 8)));
    const below = r.top - 14 - h < 8;
    tipEl.classList.toggle('below', below);
    let top = below ? r.bottom + 14 : r.top - 14 - h;
    // The agent's question notice sits just above the bar: open above it, not
    // over it, a dark tooltip on a dark line (UX review 5, #3).
    const n = noticeRect();
    if (n && !below && left < n.right && left + w > n.left && top < n.bottom && top + h > n.top) top = Math.max(8, n.top - 6 - h);
    tipEl.style.left = left + 'px'; tipEl.style.top = Math.round(top) + 'px';
    tipEl.style.setProperty('--x', Math.round(r.left + r.width / 2 - left) + 'px');
  }
  function noticeRect() {
    const n = document.querySelector('[data-replies-ui]')?.shadowRoot?.querySelector('[data-question-notice]');
    if (!n || n.hidden) return null;
    const r = n.getBoundingClientRect();
    return r.width ? r : null;
  }
  function showTip(b, now) {
    clearTimeout(tipTimer);
    if (more || sheetOpen || settingsOpen()) return;
    const go = () => { if (!b.isConnected || b.hidden) return; tipFor = b; paintTip(b); tipShownAt = Date.now(); };
    if (now || Date.now() - tipShownAt < 400) go(); else tipTimer = setTimeout(go, 850);
  }
  function hideTip() { clearTimeout(tipTimer); if (!tipEl.hidden) tipShownAt = Date.now(); tipEl.hidden = true; tipFor = null; }
  function tipOver(e) { if (e.pointerType === 'touch') return; const b = tipButton(e); if (b && b !== tipFor) showTip(b, false); }
  function tipOut(e) { const b = tipButton(e); if (b && !b.contains(e.relatedTarget)) hideTip(); }
  function tipFocus(e) { const b = tipButton(e); if (b && b.matches(':focus-visible')) showTip(b, true); }
  addEventListener('scroll', hideTip, { passive: true, capture: true });
  // The component's own tooltips ("Exit Esc") open on hover at z 100001, under
  // every layer of ours. More, Talk's setup or its dock opening over a tooltip
  // the pointer rests on left an empty dark tab poking out past the layer
  // (UX review 6, N1). While a wrapper is hovered, each frame asks what is on
  // top at points across its tooltip; if any is one of our layers, the
  // tooltip is hidden until it is clear again. Never half covered.
  const UP_TIPS = '[data-agentation-toolbar] [class*="controlsContent"] [class*="buttonWrapper"]';
  function underUs(t) {
    const r = t.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    // Its edges too: Talk's setup tucks over the top by under 2px.
    const xs = [r.left + 0.5, r.left + r.width / 4, r.left + r.width / 2, r.right - r.width / 4, r.right - 0.5], ys = [r.top + 0.5, r.top + r.height / 2, r.bottom - 0.5];
    for (const x of xs) for (const y of ys) {
      const top = document.elementFromPoint(x, y);
      if (top?.closest?.('.sk-edit-ui') && !top.closest('[data-agentation-root]')) return true;
    }
    return false;
  }
  let tipLoop = 0;
  function coverTips() {
    for (const t of document.querySelectorAll(UP_TIPS + '>[class*="buttonTooltip"]')) {
      const on = t.parentElement.matches(':hover') && underUs(t);
      if (t.hasAttribute('data-sk-covered') !== on) t.toggleAttribute('data-sk-covered', on);
    }
  }
  function watchTips() {
    if (tipLoop) return;
    const tick = () => { coverTips(); tipLoop = document.querySelector(UP_TIPS + ':hover') ? requestAnimationFrame(tick) : 0; };
    tick();
  }
  document.addEventListener('pointerover', e => { if (e.target?.closest?.(UP_TIPS)) watchTips(); }, true);
  document.addEventListener('agentation-kit:slot', watchTips);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTip(); }, true);
  // Hidden controls take no focus. Collapsed, the bar's controls (our dock
  // with them) stay mounted but hidden; closed, the component's Settings panel
  // is only faded out. Both are inert until they show, so Tab can't land on
  // Move toolbar or the docs link that no one can see.
  let inertWatch = null;
  function syncInert() {
    const bar = document.querySelector('[data-agentation-toolbar]'); if (!bar) return;
    const controls = bar.querySelector('[class*="controlsContent"]');
    if (controls) { const off = /hidden/.test(controls.className); if (controls.inert !== off) controls.inert = off; if (off) hideTip(); }
    for (const s of bar.querySelectorAll('[class*="settingsPanel_"]')) { const off = !/enter/.test(s.className); if (s.inert !== off) s.inert = off; }
  }
  function watchInert() {
    const bar = document.querySelector('[data-agentation-toolbar]'); if (!bar) return;
    if (inertWatch?.bar !== bar) { inertWatch?.obs.disconnect(); const obs = new MutationObserver(syncInert); obs.observe(bar, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] }); inertWatch = { bar, obs }; }
    syncInert();
  }
  const upstream = label => document.querySelector(`[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="${label}"]`);
  function item(parent, iconKey, label, action, { key = '', value = '', danger = false, checked = null, hint = '' } = {}) {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', checked === null ? 'menuitem' : 'menuitemradio');
    if (checked !== null) b.setAttribute('aria-checked', String(checked));
    if (danger) b.className = 'danger';
    b.innerHTML = svg(iconKey);
    if (hint) { const two = document.createElement('span'); two.className = 'two'; const n = document.createElement('span'); n.textContent = label; const s = document.createElement('small'); s.textContent = hint; two.append(n, s); b.append(two); }
    else b.append(document.createTextNode(label));
    if (value) { const v = document.createElement('span'); v.className = 'v'; v.textContent = value; b.append(v); }
    if (key) { const k = document.createElement('span'); k.className = 'k'; k.textContent = key; b.append(k); }
    if (checked !== null) { const t = document.createElement('span'); t.className = 'tick'; t.innerHTML = svg('commit'); b.append(t); }
    b.onclick = e => { e.stopPropagation(); action(); };
    parent.append(b); return b;
  }
  function buildMenu() {
    menu.replaceChildren();
    // The Layout palette and Settings take focus as they open (a11y.js): More
    // closes under the item that opened them, and focus would fall to the page.
    const proxy = (label, into) => () => { setMore(false); upstream(label)?.click(); if (into) focusInto(into); requestAnimationFrame(updateButtons); };
    const on = label => upstream(label)?.dataset.active === 'true';
    const name = viewport().name;
    item(menu, name === 'desktop' ? 'viewport' : 'viewport-' + name, 'Viewport', () => { setMore(false); open('viewport'); }, { value: name[0].toUpperCase() + name.slice(1) });
    // On is a state (shown everywhere); the letter is a key hint (hidden on touch).
    if (upstream('Layout mode')) item(menu, 'layout', 'Layout moves', proxy('Layout mode', 'layout'), on('Layout mode') ? { value: 'On' } : { key: 'L' });
    if (upstream('Pause animations')) item(menu, 'pause', 'Pause animations', proxy('Pause animations'), on('Pause animations') ? { value: 'On' } : { key: 'P' });
    if (window.__AGENTATION_KIT_CRITIQUE__?.runChecks) item(menu, 'checks', 'Run checks', () => { setMore(false); window.__AGENTATION_KIT_CRITIQUE__.runChecks(); });
    const markers = upstream('Show markers') ? 'Show markers' : 'Hide markers';
    if (upstream(markers)) item(menu, 'markers', markers, proxy(markers), { key: 'H' });
    menu.append(document.createElement('hr'));
    if (upstream('Copy feedback')) item(menu, 'markdown', 'Notes as Markdown', proxy('Copy feedback'), { key: 'C' });
    const hook = upstream('Send Annotations');
    if (hook && !hook.disabled && hook.offsetParent !== null) item(menu, 'done', 'Send to webhook', proxy('Send Annotations'), { key: 'S' });
    const n = allRows().filter(a => a.here && open_(a) && ownsNote(a)).length;
    // Armed by a first press (the toast says so): the item itself now says the second press clears.
    const armed = armedAt && Date.now() - armedAt < 5000;
    if (upstream('Clear all')) item(menu, 'clear', armed ? `Press again to clear ${n === 1 ? 'your note' : n ? `your ${n} notes` : 'your notes'}` : n ? `Clear my ${n} ${n === 1 ? 'note' : 'notes'}` : 'Clear my notes', proxy('Clear all'), { key: 'X', danger: true });
    menu.append(document.createElement('hr'));
    if (upstream('Settings')) item(menu, 'settings', 'Settings', proxy('Settings', 'settings'));
  }
  function buildSheet() {
    sheet.replaceChildren();
    const cur = currentMode();
    for (const m of MODES) if (modeAvailable(m) && (m.key !== 'edit' || editMode)) item(sheet, m.key, m.name, () => setMode(m.key), { hint: m.hint, checked: cur === m.key });
  }
  function placeMenu(el) {
    const r = toolbarShell()?.getBoundingClientRect(); if (!r?.width) return;
    el.style.top = 'auto'; el.style.bottom = Math.round(innerHeight - r.top + 8) + 'px';
    if (innerWidth < 600) Object.assign(el.style, { left: '12px', right: '12px', width: 'auto' });
    else { el.style.width = ''; el.style.right = 'auto'; const w = el.getBoundingClientRect().width || 240; el.style.left = Math.round(Math.max(12, Math.min(r.right - w, innerWidth - w - 12))) + 'px'; }
  }
  const moreSlot = slotPanel('more', visible => { menu.hidden = !(visible && more); if (!visible && more) { more = false; syncMenus(); } else if (visible) placeMenu(menu); });
  const sheetSlot = slotPanel('mode-sheet', visible => { sheet.hidden = !(visible && sheetOpen); if (!visible && sheetOpen) { sheetOpen = false; syncMenus(); } else if (visible) placeMenu(sheet); });
  function syncMenus() {
    dockEnd?.querySelector('[data-review=more]')?.setAttribute('aria-expanded', String(more));
    dock?.querySelector('[data-review=mode]')?.setAttribute('aria-expanded', String(sheetOpen));
  }
  // Closing a menu that had focus (Esc, or an item that opens nothing) puts
  // focus back on the button that opened it, not on the page (F-Return).
  function setMore(next) {
    if (next === more) return;
    const back = !next && menu.contains(ui.root.activeElement);
    more = next; if (more) { buildMenu(); toast.hidden = true; hideTip(); }
    moreSlot.want(more, { bump: true }); syncMenus();
    if (more && moreSlot.visible) { placeMenu(menu); menu.querySelector('button')?.focus(); }
    if (back) focusFirst(dockEnd?.querySelector('[data-review=more]'));
  }
  function setSheet(next) {
    if (next === sheetOpen) return;
    const back = !next && sheet.contains(ui.root.activeElement);
    sheetOpen = next; if (sheetOpen) { buildSheet(); hideTip(); }
    sheetSlot.want(sheetOpen, { bump: true }); syncMenus();
    if (sheetOpen && sheetSlot.visible) { placeMenu(sheet); sheet.querySelector('[aria-checked=true]')?.focus(); }
    if (back) focusFirst(dock?.querySelector('[data-review=mode]'));
  }
  function move(x,y) {
    const r = document.querySelector('[data-agentation-toolbar]').getBoundingClientRect(), v = shell(), off = v.left - r.left;
    // Clamp what is visible, not the wrapper: collapsed, the wrapper is still
    // the open bar's width and the 44px button sits at its right end. Clamped
    // by the wrapper, a page narrowed to phone width (a browser's device mode)
    // left the button just past the right edge, out of reach.
    const position = {x:Math.max(12-off,Math.min(x,innerWidth-12-off-v.width)), y:Math.max(12,Math.min(y,innerHeight-r.height-12))};
    document.dispatchEvent(new CustomEvent('agentation-kit:toolbar-position',{detail:position}));
    requestAnimationFrame(positionPanel);
    try {localStorage.setItem('feedback-toolbar-position',JSON.stringify(position));} catch {}
  }
  // The component clamps its position against a hardcoded 337px width (build.mjs seam).
  window.__AGENTATION_KIT_TOOLBAR_WIDTH__ = () => document.querySelector('[data-agentation-toolbar]')?.getBoundingClientRect().width || 337;
  // The visible shell inside the wrapper: the open bar, or the collapsed button.
  function shell() { const bar = document.querySelector('[data-agentation-toolbar]'); return (bar?.querySelector('[class*="toolbarContainer"]') || bar).getBoundingClientRect(); }
  window.__AGENTATION_KIT_TOOLBAR_OFFSET__ = () => { const bar = document.querySelector('[data-agentation-toolbar]'); return bar ? Math.max(0, shell().left - bar.getBoundingClientRect().left) : 0; };
  // The bar is as wide as what it holds: Send's label and the agent's words
  // change its width, so it is measured rather than fixed.
  function sizeBar() {
    const bar = document.querySelector('[data-agentation-toolbar]'); const controls = bar?.querySelector('[class*="controlsContent"]'); if (!controls || !barOpen()) return;
    const pick = dock?.querySelector('[data-review=mode]'); if (pick) sizePick(pick);
    let left = Infinity, right = -Infinity;
    for (const c of controls.children) { const r = c.getBoundingClientRect(); if (!r.width) continue; left = Math.min(left, r.left); right = Math.max(right, r.right); }
    if (left === Infinity) return;
    // The component keeps the bar 20px from each edge (its own clamp), so the
    // bar may be at most the screen less 40px.
    const w = Math.min(Math.ceil(right - left + 12), innerWidth - 40);
    const now = parseFloat(bar.style.getPropertyValue('--sk-toolbar-width')) || 0;
    if (Math.abs(now - w) > 1) bar.style.setProperty('--sk-toolbar-width', w + 'px');
    // Keep the whole bar inside the screen, whichever way it grew.
    // A bar nobody dragged stays on the right edge as its width changes.
    requestAnimationFrame(() => { const r = bar.getBoundingClientRect(); let hand = false; try { hand = !!localStorage.getItem(HAND_PLACED); } catch {}
      if (!hand && Math.abs(r.right - (innerWidth - 20)) > 1) move(innerWidth - 20 - r.width, r.top);
      else if (r.left < 11 || r.right > innerWidth - 19) move(Math.min(r.left, innerWidth - r.width - 20), r.top);
      if (Math.abs(now - w) > 1) positionPanel(); });
  }
  const style = document.createElement('style');
  style.textContent = `
    [data-agentation-toolbar]{--sk-toolbar-width:420px;--sk-toolbar-height:52px;width:var(--sk-toolbar-width)!important;font-family:${FONT}!important}
    [data-agentation-toolbar] button{font-family:inherit}
    /* A fixed control layout prevents rewrapping while the shell opens. Only
       the small shell changes size; icons keep their size and position. */
    [data-agentation-toolbar] [class*="toolbarContainer"]{box-sizing:border-box;min-height:0;padding:0!important;animation:none;box-shadow:0 8px 28px rgba(12,10,24,.34),0 0 0 1px rgba(255,244,224,.16)!important;transition:width 280ms cubic-bezier(.22,1,.36,1),height 280ms cubic-bezier(.22,1,.36,1)}
    /* Clip only while the shell shrinks, so the full-width controls row can't
       show past it. Once it's a circle the count badge overhangs its corner,
       and a permanent clip cut the badge off. The badge waits for the clip. */
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"]{width:44px!important;height:44px!important;animation:sk-toolbar-conceal 280ms linear}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"] [class*="badge"]{transition-delay:280ms}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]{width:var(--sk-toolbar-width)!important;height:var(--sk-toolbar-height)!important;border-radius:16px!important;animation:sk-toolbar-reveal 280ms linear}
    [data-agentation-theme=light] [data-agentation-toolbar] [class*="toolbarContainer"],[data-agentation-toolbar] [class*="toolbarContainer"][class*="light"]{box-shadow:0 2px 8px rgba(29,26,47,.1),0 8px 24px rgba(29,26,47,.12),0 0 0 1px rgba(29,26,47,.1)!important}
    @keyframes sk-toolbar-reveal{from,to{overflow:hidden}}
    @keyframes sk-toolbar-conceal{from,to{overflow:hidden}}
    [data-agentation-toolbar] [class*="controlsContent"]{position:absolute;right:6px;top:50%;width:calc(var(--sk-toolbar-width) - 12px);max-width:none!important;flex-shrink:0;flex-wrap:nowrap;justify-content:flex-end;filter:none!important;transform:translateY(-50%);transition:opacity 120ms ease-out,transform 180ms ease-out}
    [data-agentation-toolbar] [class*="controlsContent"][class*="hidden"]{opacity:0;transform:translate(8px,-50%)}
    [data-agentation-toolbar] [class*="controlsContent"][class*="visible"]{opacity:1;transform:translate(0,-50%);transition-delay:70ms}
    /* Host pages' bare button rules leak in (the Ghost theme gives every
       button min 44x44 under 1024px wide). Zero the minimums; rules below
       re-raise them for our dock. */
    [data-agentation-toolbar] button,[data-agentation-root] button{min-width:0;min-height:0}
    /* Order, not DOM position: React owns the component's own nodes. Its tools
       stay mounted, hidden, and More clicks them; only its close stays. */
    .sk-review-controls{display:flex;align-items:center;gap:2px;flex-shrink:0;order:1!important}
    .sk-review-end{order:30!important}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="divider"]{order:40}
    [data-agentation-toolbar] [class*="controlsContent"]>:last-child{order:50}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]:not(:last-child){display:none!important}
    .sk-modes{display:flex;align-items:center;gap:2px}
    .sk-divider{flex:none;width:1px;height:22px;margin:0 6px;background:rgba(128,128,128,.36)}
    .sk-review-controls button{display:flex!important;align-items:center;justify-content:center;gap:7px;min-width:36px;min-height:36px;position:relative;white-space:nowrap;border-radius:10px!important}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]>button{width:36px;height:36px;border-radius:10px}
    /* The mode that is on says its name: shape, fill and a word, not colour alone. */
    .sk-modes button .sk-label{display:none;font:600 13px/1 ${FONT}}
    .sk-modes button[aria-pressed=true] .sk-label{display:inline}
    .sk-modes button[aria-pressed=true]{width:auto!important;padding:0 12px 0 10px!important;box-shadow:inset 0 0 0 1.5px #FF5436}
    .sk-review-controls button[hidden]{display:none!important}
    .sk-review-controls button[aria-pressed=true]{background:#573227!important;color:#FFF4E0!important}
    [data-agentation-theme=light] .sk-review-controls button[aria-pressed=true]{background:#FFDDD1!important;color:#1D1A2F!important}
    .sk-review-controls .sk-send[aria-pressed=true]{background:#FF5436!important;color:#1D1A2F!important}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"]:focus-visible{outline:2px solid #FFC72C!important;outline-offset:2px}
    .sk-review-controls [data-review=grip]{width:20px!important;min-width:20px;flex-shrink:0}
    .sk-review-controls .sk-send{width:auto!important;margin-left:4px;padding:0 14px 0 12px!important;border-radius:10px!important;background:#FF5436!important;color:#1D1A2F!important;font:600 13px/1 ${FONT}}
    .sk-review-controls .sk-send[data-state=ready]:hover{background:#FF6A4F!important}
    /* As wide as "Send 1" in every state, so the bar keeps its width when Send becomes Send 1 or Sent. */
    .sk-review-controls .sk-send{min-width:92px;font-variant-numeric:tabular-nums}
    .sk-review-controls .sk-send[data-state=empty],.sk-review-controls .sk-send[data-state=sent]{background:rgba(128,128,128,.16)!important;color:inherit!important;opacity:.75}
    .sk-review-controls .sk-send svg,.sk-review-controls .sk-agent svg{width:16px;height:16px}
    .sk-review-controls .sk-agent{width:auto!important;padding:0 8px!important;font:500 12px/1 ${FONT}}
    /* Bub is the agent: listening, working (a pencil, and a small bob) or away. */
    .sk-review-controls .sk-agent svg[data-art]{width:24px;height:24px}
    .sk-review-controls .sk-agent[data-state=listening],.sk-review-controls .sk-agent[data-state=offline]{padding:0 6px!important}
    .sk-review-controls .sk-agent[data-state=offline] svg[data-art]{opacity:.82}
    .sk-review-controls .sk-agent[data-state=working] svg[data-art]{animation:sk-bob 1.4s ease-in-out infinite}@keyframes sk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    
    .sk-review-controls .sk-agent[data-state=complete] svg{color:#FF9C87}[data-agentation-theme=light] .sk-review-controls .sk-agent[data-state=complete] svg{color:#A92B15}
    .sk-review-controls .sk-agent[data-state=failed] svg{color:#ec8e8e}
    .sk-review-controls .sk-spin{animation:sk-turn 1s linear infinite}@keyframes sk-turn{to{transform:rotate(360deg)}}
    .sk-review-controls .sk-mode-pick{display:none!important}
    .sk-review-controls .sk-badge{position:absolute;top:1px;right:1px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#FF5436;color:#1D1A2F;font:700 12px/16px ${FONT};text-align:center;pointer-events:none}
    [data-agentation-root] textarea:focus-visible,[data-agentation-toolbar] button:focus-visible{outline:2px solid #FFC72C!important;outline-offset:1px}
    /* A component tooltip one of our layers covers stays hidden (N1, below). */
    [data-agentation-toolbar] [class*="buttonTooltip"][data-sk-covered]{opacity:0!important;visibility:hidden!important;transition:none!important}
    /* Open, the shell is a container, not a control: clicking it to open left
       it focused, and the next key press drew a ring round the whole bar. The
       collapsed shell is the open button and keeps its ring. */
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]:focus-visible{outline:none}
    /* Touch: every control on the bar is a 44px target, ours and the
       component's own close. */
    @media(pointer:coarse){
      .sk-review-controls button{min-width:44px;min-height:44px}
      [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]:not([class*="sendButtonWrapper"])>button{width:44px!important;height:44px!important;min-width:44px;min-height:44px}
      .sk-review-controls [data-review=grip]{width:32px!important;min-width:32px}
      [data-agentation-toolbar]{--sk-toolbar-height:60px}
    }
    /* Phone: the current mode is one named button; the sheet explains all four. */
    @media(max-width:600px),(pointer:coarse) and (max-width:640px){
      .sk-modes,.sk-divider,.sk-review-controls [data-review=grip]{display:none!important}
      .sk-review-controls button{gap:6px}
      .sk-review-controls .sk-mode-pick{display:flex!important;width:auto!important;padding:0 10px!important;font:600 13px/1 ${FONT}}
      .sk-mode-pick svg{width:16px;height:16px}
      /* Its name is text, not an icon: 4.5:1 in light too. The component's
         rgba(0,0,0,.5) is 3.98:1 on the white bar (UX review 4, N6). */
      [data-agentation-theme=light] .sk-review-controls .sk-mode-pick{color:rgba(0,0,0,.75)!important}
      .sk-review-controls .sk-agent .sk-label{display:none}
      /* Room is short: the agent shows on the bar only when it has news. */
      .sk-review-controls .sk-agent:not([data-state=working]):not([data-state=needs-input]):not([data-state=failed]){display:none!important}
      [data-agentation-toolbar] [class*="controlsContent"]>[class*="divider"]{display:none}
      .sk-review-controls .sk-send{margin-left:2px;padding:0 10px!important;min-width:85px}
    }
    @media(max-width:400px){.sk-review-controls .sk-mode-pick .sk-label + svg{display:none}}
    /* The mode button is as wide as its longest name (sizePick): at 360 that
       left it a pixel past the bar's edge, so it gives up 2px of padding a side. */
    /* Sent keeps its check there, as on a desktop ("✓ Sent"): one state, one
       look (UX review 6, N13). Its padding gives the width back. */
    @media(max-width:380px){.sk-review-controls .sk-send:not([data-state=sent]) svg{display:none}.sk-review-controls .sk-send{min-width:44px}.sk-review-controls .sk-send[data-state=sent]{gap:4px;padding:0 8px 0 6px!important}.sk-review-controls .sk-mode-pick{padding:0 8px!important}}
    @media(max-width:350px){.sk-review-controls .sk-mode-pick .sk-label{display:none}}
    @media(prefers-reduced-motion:reduce){
      [data-agentation-toolbar] [class*="toolbarContainer"],[data-agentation-toolbar] [class*="controlsContent"]{transition:none!important;animation:none!important}
      .sk-review-controls .sk-spin,.sk-review-controls .sk-agent svg[data-art]{animation:none!important}
    }
  `;
  document.head.append(style);
  // When this browser last sent, notes made after it are new: Send says how many.
  // A note reopened in Check the fix (check.js) counts from when it was reopened.
  // A note reworded after it was sent counts from the rewording (revisedAt).
  const stamp = a => Math.max(Number(a.reopenedAt) || 0, Number(a.revisedAt) || 0, Number(a.timestamp) || Date.parse(a.createdAt || a.created_at || '') || 0);
  // A committed note being revised is one change, not two: its draft counts, its row doesn't.
  const unsent = () => { const d = draftEdits(), revising = new Set(d.map(x => x.annotationId).filter(Boolean)); return d.length + (tweak()?.count || 0) + allRows().filter(a => open_(a) && !isQuestion(a) && !revising.has(a.id) && stamp(a) > sentAt).length; };
  const label = (b, iconKey, text, cls = '') => { const key = iconKey + '|' + text + '|' + cls; if (b.dataset.paint === key) return false; b.dataset.paint = key; b.innerHTML = svg(iconKey).replace('<svg', `<svg class="${cls}"`); if (text) { const s = document.createElement('span'); s.className = 'sk-label'; s.textContent = text; b.append(s); } return true; };
  // The phone's mode button is as wide as its longest name, whichever mode is
  // on: sized to the current one, the bar's left edge moved 20, 41, 56px as
  // Comment, Tweak and Talk swapped in (UX review 4, N16). Measured in the
  // label's own font, so it holds for any system font.
  let measure = null;
  function sizePick(pick) {
    const lab = pick.querySelector('.sk-label');
    if (!lab || !lab.getClientRects().length) return;
    measure ||= document.createElement('canvas').getContext('2d');
    if (!measure) return;
    measure.font = getComputedStyle(lab).font;
    const widest = Math.max(...MODES.filter(m => modeAvailable(m) && (m.key !== 'edit' || editMode)).map(m => measure.measureText(m.name).width));
    const w = widest.toFixed(2) + 'px';
    if (lab.style.minWidth !== w) { lab.style.minWidth = w; lab.style.textAlign = 'left'; }
  }
  function updateButtons() {
    if (!dock) return;
    const q = sel => dock.querySelector(sel) || dockEnd?.querySelector(sel);
    const cur = currentMode();
    for (const m of MODES) { const b = q(`[data-mode=${m.key}]`); if (!b) continue; b.hidden = !modeAvailable(m); b.setAttribute('aria-pressed', String(cur === m.key)); }
    const now = MODES.find(m => m.key === cur);
    const pick = q('[data-review=mode]'); if (label(pick, cur, now.name)) pick.insertAdjacentHTML('beforeend', svg('updown'));
    pick.setAttribute('aria-label', `Mode: ${now.name}. Change mode`); pick.dataset.tip = 'Change mode';
    sizePick(pick);
    const badge = (b,n) => { let el = b.querySelector('.sk-badge'); if (n && !el) { el = document.createElement('span'); el.className = 'sk-badge'; b.append(el); } if (el) { if (n) el.textContent = String(n); else el.remove(); } };
    const inbox = q('[data-review=inbox]'); inbox.setAttribute('aria-pressed', String(mode === 'inbox'));
    const qs = questionsForMe(allRows()).length, crit = typeof critiqueOnInbox !== 'undefined' && critiqueOnInbox ? critiqueCount : 0; badge(inbox, qs + crit);
    inbox.setAttribute('aria-label', 'Feedback inbox' + (qs ? ', ' + qs + (qs === 1 ? ' question' : ' questions') + ' for you' : '') + (crit ? ', ' + crit + ' from the agent to decide' : ''));
    inbox.dataset.tip = qs ? `Inbox: ${qs} ${qs === 1 ? 'question' : 'questions'} for you` : 'Inbox';
    const edit = q('[data-mode=edit]'); const d = draftEdits().length; badge(edit, d);
    if (d) edit.setAttribute('aria-description', d + (d === 1 ? ' unsaved edit' : ' unsaved edits')); else edit.removeAttribute('aria-description');
    const tw = q('[data-mode=tweak]'); if (tw && tweak()) { const k = tweak().count || 0; badge(tw, k); if (k) tw.setAttribute('aria-description', k + (k === 1 ? ' unsaved tweak' : ' unsaved tweaks')); else tw.removeAttribute('aria-description'); }
    const send = q('[data-review=done]'); const n = unsent();
    const state = n ? 'ready' : sentAt ? 'sent' : 'empty'; send.dataset.state = state;
    label(send, state === 'sent' ? 'commit' : 'done', n ? `Send ${n}` : state === 'sent' ? 'Sent' : 'Send');
    send.setAttribute('aria-pressed', String(mode === 'done'));
    send.setAttribute('aria-label', n ? `Send ${n} ${n === 1 ? 'note' : 'notes'} to the agent` : state === 'sent' ? 'Sent to the agent. Nothing new to send' : 'Send to the agent. Nothing to send yet');
    send.dataset.tip = n ? 'Send to the agent' : state === 'sent' ? 'Sent. Add a note or edit text to send again' : 'Nothing to send yet. Add a note or edit some text first';
    if (tipFor && !tipEl.hidden) paintTip(tipFor);
    requestAnimationFrame(sizeBar);
  }
  // The agent's status lives on the bar (agent-work.js reports it): the icon
  // alone while listening, offline or done, a few words while it works, asks
  // or fails. Clicking opens the agent panel.
  const AGENT_WORDS = { working: 'Working', 'needs-input': 'Needs input', failed: 'Failed' };
  const AGENT_TITLES = { listening: 'Agent listening', working: 'Agent working', complete: 'Changes ready', 'needs-input': 'Agent needs input', failed: 'Agent run failed', offline: 'Agent offline' };
  function paintAgent(s) {
    const b = dock?.querySelector('[data-review=agent]'); if (!b) return;
    if (!s || !window.__AGENTATION_KIT_AGENT_WORK__) { b.hidden = true; return; }
    b.hidden = false; b.dataset.state = s.state;
    label(b, 'agent-' + s.state, AGENT_WORDS[s.state] || '');
    const msg = statusLine(AGENT_TITLES[s.state] || 'Agent', s.message);
    b.dataset.tip = msg; b.setAttribute('aria-label', msg);
    requestAnimationFrame(sizeBar);
  }
  document.addEventListener('agentation-kit:agent-work', e => paintAgent(e.detail));
  document.addEventListener('agentation-kit:voice-capture', () => updateButtons());
  document.addEventListener('agentation-kit:slot', () => updateButtons());
  document.addEventListener('agentation-kit:tweak-change', () => updateButtons());
  // Critique (critique.js) opens only from the bar. Its undecided count rides
  // the agent button when there is one, else a small button that exists only
  // while there are notes to decide. With the agent button, a click opens the
  // critique while it has notes, unless the agent itself needs you.
  let critiqueCount = 0, critiqueOnInbox = false;
  function paintCritique() {
    const agent = dock?.querySelector('[data-review=agent]'); if (!agent) return;
    let own = dock.querySelector('[data-review=critique]');
    if (!own) {
      own = make(dock.querySelector('[data-review=inbox]')?.className || '', 'critique', 'From the agent'); own.hidden = true; own.setAttribute('aria-haspopup', 'dialog');
      own.onclick = e => { e.stopPropagation(); if (slotFront() !== 'critique' && !popupYields()) return; setMore(false); setSheet(false); window.__AGENTATION_KIT_CRITIQUE__?.toggle(); };
      agent.after(own);
      dock.addEventListener('click', e => {
        if (!critiqueCount || !e.target.closest?.('[data-review=agent]') || ['needs-input', 'failed'].includes(agent.dataset.state)) return;
        e.stopPropagation(); if (slotFront() !== 'critique' && !popupYields()) return; setMore(false); setSheet(false); window.__AGENTATION_KIT_CRITIQUE__?.toggle();
      }, true);
    }
    // On a phone the agent button shows only with news (the CSS below), so the count can't ride it there.
    // A phone's bar has no room for another button: there the count rides the
    // inbox (as the phone design draws it), and the inbox opens From the agent.
    const phone = matchMedia('(max-width:600px),(pointer:coarse) and (max-width:640px)').matches;
    const onAgent = !agent.hidden && !(phone && !['working', 'needs-input', 'failed'].includes(agent.dataset.state));
    critiqueOnInbox = phone && !onAgent && critiqueCount > 0;
    own.hidden = onAgent || phone || !critiqueCount;
    for (const b of [agent, own]) {
      let n = b.querySelector('.sk-crit-badge'); const show = b === (onAgent ? agent : own) && critiqueCount;
      if (show && !n) { n = document.createElement('span'); n.className = 'sk-badge sk-crit-badge'; b.append(n); }
      if (n) { if (show) n.textContent = String(critiqueCount); else n.remove(); }
    }
    const words = critiqueCount ? `From the agent: ${critiqueCount} to decide` : 'From the agent';
    own.dataset.tip = words; own.setAttribute('aria-label', words);
    if (onAgent && critiqueCount) agent.setAttribute('aria-description', `${critiqueCount} critique ${critiqueCount === 1 ? 'note' : 'notes'} to decide`); else agent.removeAttribute('aria-description');
    updateButtons(); if (mode === 'inbox' && !focused && !saving) render();
  }
  document.addEventListener('agentation-kit:critique-count', e => { critiqueCount = e.detail?.count || 0; paintCritique(); });
  document.addEventListener('agentation-kit:agent-work', () => paintCritique());
  addEventListener('resize', () => paintCritique(), { passive: true });
  // Opening the bar changes no state of ours, so re-measure on a light timer.
  // A resize that lands mid-animation (the bar opening or collapsing) measures
  // a shell that is still changing width, and nothing re-placed it after: the
  // bar ended half past the right edge of a phone-width screen. Once its width
  // holds for a tick, put it back: in its corner when nobody dragged it, else
  // just on screen.
  let lastShell = 0;
  function settleBar() {
    const bar = document.querySelector('[data-agentation-toolbar]'); if (!bar || window.__AGENTATION_KIT_POINTER_DRAG__) return;
    const v = shell(), r = bar.getBoundingClientRect(); if (!v.width) return;
    const steady = Math.abs(v.width - lastShell) < 1; lastShell = v.width; if (!steady) return;
    let hand = false; try { hand = !!localStorage.getItem(HAND_PLACED); } catch {}
    const off = v.left - r.left;
    if (!hand && Math.abs(v.right - (innerWidth - 20)) > 1) move(innerWidth - 20 - off - v.width, r.top);
    else if (v.left < 11 || v.right > innerWidth - 11 || r.top < 11 || r.bottom > innerHeight - 11) move(r.left, r.top);
  }
  setInterval(() => { if (document.visibilityState === 'visible') { sizeBar(); settleBar(); } }, 400);
  const observer = new MutationObserver(attachDock); observer.observe(document.body,{childList:true,subtree:true}); attachDock();
  // Focus in the list survives every re-render (F-Answer): it is kept by row
  // and control, not by node, and put back as the new row is drawn, whenever
  // that render comes (a save, the stream, a critique arriving minutes later).
  const keeper = focusKeeper(panel, {
    rows: 'article.row[data-annotation],article.row[data-draft],article.row[data-batch]',
    rowKey: r => r.dataset.annotation ? 'a:' + r.dataset.annotation : r.dataset.draft ? 'd:' + r.dataset.draft : 'b:' + r.dataset.batch,
    when: () => !!mode && !panel.hidden && !panel.hasAttribute('data-deferred'),
    fallback: () => ui.el('close'),
  });
  // Text editing rests as a one-line strip, so the page stays readable and
  // clickable while typing. Leaving any other panel in edit mode returns to it.
  // The panel shares one slot with the question, the name prompt and the
  // narrow More tray (ui.js). Losing the slot hides it without closing it.
  const reviewSlot = slotPanel('review', visible => { panel.toggleAttribute('data-deferred', !visible); if (visible && mode) requestAnimationFrame(positionPanel); else announce(); });
  function open(next, { keepFocus = false } = {}) {
    if (!next && editMode?.active) next = 'edits';
    mode = next; expanded = mode !== 'edits'; focused = null; error=''; panel.hidden = !mode; updateButtons();
    reviewSlot.want(!!mode, { passive: mode === 'edits', bump: true });
    if (mode) { render(); if (mode !== 'viewport') refresh(); }
    else if (!keepFocus) dock?.querySelector('[data-review=inbox]')?.focus();
    if (!mode) announce();
  }
  // Other panels (critique.js) make room for the bar and whichever panel is open.
  function announce() { document.dispatchEvent(new CustomEvent('agentation-kit:review-chrome',{detail:{panel:mode&&!panel.hidden&&!panel.hasAttribute('data-deferred')?panel.getBoundingClientRect():null}})); }
  const isChrome = e => e.composedPath().some(n => n.nodeType === 1 && n.matches('[data-agentation-root],[data-agentation-toolbar],[data-feedback-toolbar],.sk-edit-ui'));
  // Clicking back into the page gets the panel out of the way. Unsaved typing in
  // a row holds it open.
  document.addEventListener('pointerdown', e => {
    if (isChrome(e)) return;
    setMore(false); setSheet(false);
    if (!mode || focused || saving) return;
    if (mode !== 'edits') open(null,{keepFocus:true});
    else if (expanded) { expanded = false; render(); }
  }, true);
  function setSession(id) { if (!id || id === sessionId) return; sessionId = id; rows = []; if (mode && !focused && !saving) refresh(); else refresh(true); }
  // Site-wide first: a review round spans the link, and an agent's question
  // about /pricing has to reach a reviewer reading /. Falls back to this page
  // alone against a Worker that predates GET /sessions.
  let again = false;
  async function refresh(quiet = false) {
    // Asked again while loading: run once more after, so a change is never dropped.
    if (loading || saving || !sessionId) { if (loading || saving) again = true; return; }
    loading = !quiet; if (!quiet) renderMessage();
    try {
      const all = await fetch(`${endpoint}/sessions?author=all`).catch(() => null);
      if (all?.ok) {
        sessions = ((await all.json()).sessions || []).map(s => ({ ...s, annotations: (s.annotations || []).filter(mine) }));
        rows = sessions.find(s => s.id === sessionId)?.annotations || [];
        // The site-wide list is the complete set, so it can say which committed
        // edits were deleted out from under their overlays.
        // (GET /sessions caps at 200 pages; at the cap the list may be partial.)
        // A cleared or resolved note is still listed (DELETE tombstones it as
        // dismissed), so pass statuses, not just ids.
        if (sessions.length < 200 && editMode?.reconcile(new Map(sessions.flatMap(s => s.annotations.map(a => [a.id, a.status]))))) render();
      } else {
        const response = await fetch(`${endpoint}/sessions/${sessionId}?author=all`);
        if (!response.ok) throw new Error('offline');
        sessions = []; rows = ((await response.json()).annotations || []).filter(mine);
      }
      // The round marker is shared, but the bridge only seeds it on page load,
      // so another reviewer's Send since then was invisible here. Re-read it.
      // Another reviewer's Send moves notes from Not sent yet to With the agent here too.
      {
        const kv = await fetch(`${endpoint.replace(/\/__ag$/, '')}/__kv?prefix=agentation-round`).catch(() => null);
        const item = kv?.ok ? ((await kv.json()).items || []).find(i => i.key === 'agentation-round') : null;
        try { const r = item && JSON.parse(item.value); if (r?.link === linkOf(endpoint) && r.ts > sentAt) { sentAt = r.ts; sentBy = r.reviewer || ''; } } catch {}
      }
      error = '';
      const known = knownIds(listed());
      for (const [key, a] of added) if (idsOf(a).some(id => known.has(id)) || Date.now() - a.seen > 15000) added.delete(key);
    } catch { if (!quiet) error = 'Feedback could not load. Retry when connected.'; }
    loading = false; updateButtons();
    if (again) { again = false; setTimeout(() => refresh(true), 0); }
    if (quiet && !mode) return;
    if (!focused && !saving) render(); else renderMessage();
  }
  // Keep the question badge honest without the panel open: questions on other
  // pages arrive on no stream this tab is subscribed to.
  setInterval(() => { if (document.visibilityState === 'visible' && !mode) refresh(true); }, 30000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(!mode); });
  refresh(true);
  function positionPanel() {
    if (!mode || panel.hasAttribute('data-deferred')) return;
    if(!document.querySelector('[data-agentation-toolbar]'))return;
    // Panels reserve their space (ui.js): a side or bottom sheet, the one-line
    // edit strip a slot in the toolbar band. The page reflows; nothing covers it.
    // The strip is as wide as its words, and its right edge meets the bar's:
    // placed once to measure, then again at its own width.
    if(panel.classList.contains('strip')){panel.style.maxHeight='';placeToast(panel,Math.min(520,innerWidth-24));panel.style.width='max-content';panel.style.maxWidth=(innerWidth-24)+'px';placeToast(panel,Math.min(Math.ceil(panel.getBoundingClientRect().width),innerWidth-24));}
    else placeNearToolbar(panel,320);
    announce();
  }
  // The bar's width animates (Send's label, a badge): the strip meets its final right edge.
  document.addEventListener('transitionend',e=>{if(e.propertyName==='width'&&e.target?.matches?.('[data-agentation-toolbar] [class*="toolbarContainer"]'))positionPanel();},true);
  // A bar nobody dragged belongs to the bottom-right corner, at any width: a
  // clamp on the way down to phone width must not strand it bottom-left once
  // the screen widens again. A dragged bar keeps its place, clamped on screen.
  window.addEventListener('resize',()=>requestAnimationFrame(()=>{const r=document.querySelector('[data-agentation-toolbar]')?.getBoundingClientRect();if(r){let hand=false;try{hand=!!localStorage.getItem(HAND_PLACED);}catch{}if(hand)move(r.left,r.top);else{const v=shell();move(innerWidth-20-(v.left-r.left)-v.width,innerHeight-20-r.height);}}positionPanel();clearHostWidgets();}));
  // The host page's own fixed widgets (Ghost's Portal button, chat bubbles,
  // cookie badges) often sit in the bar's corner and cover its controls. Until
  // the reviewer places the bar by hand, lift it just clear of them. Not saved.
  function placedByHand() { try { localStorage.setItem(HAND_PLACED, '1'); } catch {} }
  function clearHostWidgets() {
    let hand = false; try { hand = !!localStorage.getItem(HAND_PLACED); } catch {}
    // Any open panel (voice, agent status) is placed against the bar: moving the bar under it would bury the bar.
    if (hand || more || mode || slotFront() || window.__AGENTATION_KIT_VOICE_RECORDING__) return;
    const bar = document.querySelector('[data-agentation-toolbar]'); if (!bar) return;
    const r = bar.getBoundingClientRect(); if (!r.width || !r.height) return;
    // Sample the visible shell (collapsed: a 44px button), not the transparent 232px wrapper.
    const v = bar.querySelector('[class*="toolbarContainer"]')?.getBoundingClientRect() || r;
    const kit = bar.closest('body > *');
    let top = Infinity;
    for (let x = v.left + 4; x < v.right; x += Math.min(16, Math.max(4, (v.width - 8) / 3))) for (const y of [v.top + 4, v.top + v.height / 2, v.bottom - 4]) {
      const hit = document.elementFromPoint(x, y);
      if (!hit || bar.contains(hit) || kit?.contains(hit) || panel.contains(hit)) continue;
      // Pinned by the page: fixed, or sticky (a scroll-pinned hero whose CTA
      // sits where the bar does stays under it for the whole pinned scroll).
      let el = hit; while (el && el !== document.body && el !== document.documentElement && !/^(fixed|sticky)$/.test(getComputedStyle(el).position)) el = el.parentElement;
      if (!el || el === document.body || el === document.documentElement) continue;
      let w = el.getBoundingClientRect();
      // A widget, not an open modal or a full-height drawer. Inside a big pinned
      // container, what matters is the control itself (a button, a link).
      if (w.height > innerHeight / 2 || w.width > innerWidth * 0.6) {
        const control = hit.closest('a,button,input,select,textarea,[role="button"],[role="link"]');
        if (!control || !el.contains(control)) continue;
        w = control.getBoundingClientRect();
        if (w.height > innerHeight / 3) continue;
      }
      top = Math.min(top, w.top);
    }
    if (top === Infinity) return;
    // Move the wrapper so the visible shell ends 12px above the widget.
    const y = Math.round(r.top - (v.bottom - top + 12));
    if (y < 12) return;
    document.dispatchEvent(new CustomEvent('agentation-kit:toolbar-position', { detail: { x: Math.max(12, Math.min(r.left, innerWidth - r.width - 12)), y } }));
    requestAnimationFrame(positionPanel);
  }
  let press = null;
  document.addEventListener('pointerdown', e => { press = e.button === 0 && e.target.closest?.('[data-agentation-toolbar]') ? { x: e.clientX, y: e.clientY } : null; }, true);
  document.addEventListener('pointermove', e => { if (press && e.buttons & 1 && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) { press = null; placedByHand(); } }, true);
  document.addEventListener('pointerup', () => { press = null; }, true);
  // Skipped while a panel was open: check again once the last one closes.
  document.addEventListener('agentation-kit:slot', e => { if (!e.detail?.panel) setTimeout(clearHostWidgets, 80); });
  // Host widgets often load late (Ghost Portal mounts after the page).
  for (const ms of [300, 1500, 4000, 8000]) setTimeout(clearHostWidgets, ms);
  // While the review server is unreachable, every panel says so first: the
  // toolbar falls back to this browser's storage and nothing reaches the agent.
  const offline = () => window.__AGENTATION_KIT_HEALTH__?.ok === false;
  function renderMessage() { const down = !error && offline(); ui.el('message').textContent = error || (down ? 'Review server not reachable. Notes aren\u2019t being saved.' : loading ? 'Loading feedback…' : saving ? 'Saving…' : ''); ui.el('message').className = 'message'+(error||down?' error':''); ui.el('message').hidden = !error && !down && !loading && !saving; panel.setAttribute('aria-busy',String(loading||saving)); }
  document.addEventListener('agentation-kit:health', () => { if (mode) renderMessage(); });
  function button(label, action, cls='ghost') {const b=document.createElement('button');b.className=cls;b.textContent=label;b.onclick=action;return b;}
  function diff(parent, from, to) {
    const d=document.createElement('div');d.className='diff';
    for (const [cls,label,text] of [['before','Before',from],['after','After',to]]) {const line=document.createElement('div');line.className=cls;const small=document.createElement('small');small.textContent=label;const t=document.createElement('span');t.className='txt';t.textContent=text??'';line.append(small,t);d.append(line);}parent.append(d);
  }
  // A tweak (tweak.js): one property, before and after, with the token it moved onto.
  function tweakDiff(row,t){
    const what=document.createElement('p');what.className='hint tweak-what';what.textContent=`${t.selector||'element'} · ${t.property||''}`;row.append(what);
    diff(row,t.from,`${t.to??''}${t.token?` (${t.token})`:t.onScale?'':' (off scale)'}`);
  }
  function batchRow(list) {
    const row=document.createElement('article');row.className='row';row.dataset.batch=list[0].copy.batch;
    const waiting=list.filter(open_).length, done=list.filter(a=>a.status==='resolved').length;
    const status=document.createElement('span');status.className='status';
    status.textContent=waiting?(done?`${done} of ${list.length} done`:'Saved'):done===list.length?'Done':`${done} of ${list.length} done`;
    row.append(byline(meta_(`All text · ${list.length} edit${list.length===1?'':'s'}`,status,iconButton('revise','Edit in All text',allText)),list[0]));
    for(const a of list){
      const where=document.createElement('p');where.className='hint';
      const u=a.copy.unit||{};
      where.textContent=`${u.file||''}${u.line?`:${u.line}`:''}${open_(a)?'':` · ${a.status==='resolved'?'Done':'Set aside'}${a.resolution?`: ${a.resolution}`:''}`}`;
      row.append(where);diff(row,a.copy.from,a.copy.to);
      if(a.replies?.length){const t=document.createElement('div');t.className='thread';paintThread(t,a.replies,'reviewer');row.append(t);}
    }
    expandable(row,list[0].copy.batch);
    return row;
  }
  function draftEdits() { return (editMode?.pendingEdits()||[]).filter(e=>!e.annotationId || e.dirty); }
  function render() { renderPanel(); keeper.restore(); }
  function renderPanel() {
    if (!mode) return;
    requestAnimationFrame(positionPanel);
    const body = ui.el('body'); body.replaceChildren(); renderMessage();
    const editing = mode === 'edits';
    panel.classList.toggle('strip', editing && !expanded);
    ui.el('title').textContent = mode === 'viewport' ? 'Viewport simulator' : editing ? 'Text edits' : mode === 'done' ? 'Send to agent' : 'Feedback inbox';
    ui.el('count').textContent = '';
    ui.el('close').hidden = editing; ui.el('commit-all').hidden = true; ui.el('all-copy').hidden = !editing || !canCopyView; ui.el('toggle').hidden = true;
    if(mode === 'viewport') {
      const p=document.createElement('p');p.className='hint';p.textContent='Render the page at its real responsive width. Feedback stays with the viewport it was captured in.';body.append(p);
      const list=document.createElement('div');list.className='devices';body.append(list);
      for(const [name,size] of [['mobile','390 × 844'],['tablet','820 × 1180'],['desktop','1440 × 900']]) list.append(button(name[0].toUpperCase()+name.slice(1)+' · '+size,()=>{open(null);simulator.choose(name);}));
      return;
    }
    if(error) body.append(button('Retry',()=>refresh()));
    const drafts=draftEdits();
    if(mode === 'done') return renderDone(body, drafts);
    const changedIds=new Set(drafts.map(d=>d.annotationId).filter(Boolean));
    // Several reviewers: Mine narrows to notes signed with this browser's name.
    // Questions for you are always yours, whatever the filter: one on someone
    // else's note is theirs to answer, and shows with its thread under Everyone.
    const shown=a=>who!=='mine'||ownsNote(a);
    const questions=mode==='edits'?[]:questionsForMe(allRows());
    const qIds=new Set(questions.map(a=>a.id));
    if(mode==='inbox')return renderInbox(body,drafts,questions,shown,changedIds,qIds);
    const items=rows.filter(a=>!changedIds.has(a.id)&&!qIds.has(a.id)&&(a.kind==='edit'||a.kind==='copy')&&shown(a));
    const count=drafts.length+items.length;
    const saved=items.filter(open_).length, parts=[];
    // "2 edits", as the Tweak strip says "2 tweaks": a count of the thing, not of drafts.
    if(drafts.length)parts.push(drafts.length+(drafts.length===1?' edit':' edits'));
    if(saved)parts.push(saved+' saved');
    ui.el('title').textContent=parts.join(' · ')||(count?'Text edits':'Click any text to edit');
    ui.el('count').textContent='';
    ui.el('commit-all').hidden=!drafts.length;ui.el('commit-all').textContent=`Save ${drafts.length}`;
    if(!count)expanded=false;
    panel.classList.toggle('strip',!expanded);
    const t=ui.el('toggle');t.hidden=!count;t.setAttribute('aria-expanded',String(expanded));t.setAttribute('aria-label',expanded?'Hide text edits':'Show text edits');t.title=t.getAttribute('aria-label');
    for(const d of drafts)body.append(draftRow(d));
    appendNotes(body,items,true);
  }
  // The inbox (chapter 6): grouped by where each note stands, not by person or
  // page. Needs you first (the agent asked), then what you haven't sent, what
  // the agent has, and what's done. A note on another page says which page.
  function renderInbox(body,drafts,questions,shown,changedIds,qIds){
    whoBar(body);
    const all=allRows().filter(a=>!changedIds.has(a.id)&&!qIds.has(a.id)&&shown(a));
    const waiting=all.filter(a=>open_(a)&&stamp(a)>sentAt);
    const withAgent=all.filter(a=>open_(a)&&stamp(a)<=sentAt);
    const done=all.filter(a=>!open_(a)).sort((a,b)=>stamp(b)-stamp(a)).slice(0,20);
    const crit=critiqueCount&&window.__AGENTATION_KIT_CRITIQUE__?critiqueCount:0;
    // Tweaks not saved yet (tweak.js) are in Send's count, so they're listed here too.
    const tweaks=tweak()?.drafts?.()||[];
    const openCount=questions.length+crit+drafts.length+tweaks.length+waiting.length+withAgent.length;
    ui.el('count').textContent=openCount?`${openCount} open`:'';
    if(!openCount&&!done.length&&!loading){const p=document.createElement('p');p.className='empty hint';p.textContent=who==='mine'&&allRows().length?'None of the feedback here is yours yet. Switch to Everyone to see the rest.':'No feedback yet. Click anything on the page to comment, or press T to edit text.';body.append(p);return;}
    // The agent's critique waits on a decision too; it opens in its own panel.
    if(questions.length||crit){section(body,'Needs you',questions.length+crit);
      if(crit){const row=document.createElement('div');row.className='row from-agent';const t=document.createElement('p');t.className='copy';t.textContent=`From the agent: ${crit} ${crit===1?'note':'notes'} to decide`;row.append(t,button('Decide',()=>{open(null,{keepFocus:true});window.__AGENTATION_KIT_CRITIQUE__.open();},'primary'));body.append(row);}
      for(const a of questions)body.append(questionRow(a));}
    if(drafts.length||waiting.length||tweaks.length){section(body,'Not sent yet',drafts.length+waiting.length+tweaks.length);for(const d of drafts)body.append(draftRow(d));for(const t of tweaks)body.append(tweakDraftRow(t));appendNotes(body,waiting,false);}
    if(withAgent.length){section(body,'With the agent',withAgent.length);appendNotes(body,withAgent,false);}
    if(done.length){section(body,'Done',done.length);checkEntry(body.lastChild);appendNotes(body,done,false);}
  }
  function tweakDraftRow(t){
    const row=document.createElement('article');row.className='row';
    const go=button('Review',()=>{open(null,{keepFocus:true});setMode('tweak');tweak()?.review?.();},'ghost');
    // Kind first, then where it stands, as a draft text edit reads: "Tweak · draft".
    row.append(meta_('Tweak · draft',go));
    const what=document.createElement('p');what.className='hint tweak-what';what.textContent=`${t.selector||'element'} · ${t.property||''}`;row.append(what);
    diff(row,t.from??'',t.to??'');return row;
  }
  function draftRow(d){
    const row=document.createElement('article');row.className='row';row.dataset.draft=d.id;
    // "Text edit · draft": the same kind word the row keeps once it is saved
    // ("Text edit · desktop"), so a row doesn't change name when it goes out.
    row.append(meta_('Text edit · draft',
      iconButton('commit','Save',()=>act(async()=>{const result=await editMode.commit(d.id);if(!result.count)throw new Error('Could not save. Your draft is kept; retry when connected.');})),
      iconButton('revise','Edit',()=>editDraft(row,d)),
      iconButton('reject','Delete',()=>{editMode.reject(d.id);render();}),
      locateButton(()=>locate({node:d.node}))));
    diff(row,d.from,d.to);enableDoubleClick(row,()=>editDraft(row,d));expandable(row,d.id);return row;
  }
  // One All text save is one row ("3 edits"), though each string is its own note.
  function appendNotes(body,list,editing){
    const batches=new Map(), entries=[];
    for(const a of list){
      const b=a.kind==='copy'&&a.copy?.batch;
      if(!b){entries.push(a);continue;}
      if(!batches.has(b)){batches.set(b,[]);entries.push({batch:b});}
      batches.get(b).push(a);
    }
    for(const a of [...entries].reverse())body.append(a.batch?batchRow(batches.get(a.batch)):a.here===false?elsewhereRow(a):noteRow(a,editing));
  }
  function noteRow(a,editing){
    const row=document.createElement('article');row.className='row';row.dataset.annotation=a.id;
    const status=document.createElement('span');status.className='status';status.textContent=statusWord(a);
    // Someone else's note is theirs to reword or withdraw: editing it here
    // would put my words under their name.
    // One rule with Mine and Clear all (reviewer.js ownsNote): unsigned is
    // only mine if this browser sent it, or while I have no name.
    const live=open_(a), own=ownsNote(a);
    row.append(byline(meta_(rowLabel(a,editing),
      status,
      // Not sent yet: Delete takes it back before the agent sees it. Sent: Withdraw tells the agent to leave it.
      ...(live&&own?[...(a.tweak?[]:[iconButton('revise','Edit',()=>editAnnotation(row,a))]),stamp(a)>sentAt?iconButton('reject','Delete',()=>confirmRemove(row,a,false)):iconButton('reject','Withdraw',()=>confirmRemove(row,a,true))]:[]),
      locateButton(()=>locate(a))),a));
    if(a.edit)diff(row,a.edit.from,a.edit.to);else if(a.tweak)tweakDiff(row,a.tweak);else {const text=document.createElement('p');text.className='copy';text.textContent=a.note||a.comment||`${a.kind} change`;row.append(text);}
    // What the agent did about it, in its own words — a resolved note that
    // just vanished left the reviewer guessing whether it was done or lost.
    if(a.resolution&&!open_(a)&&statusWord(a)!=='Withdrawn'){const r=document.createElement('p');r.className='hint';r.textContent=(a.status==='resolved'?'Done: ':'Set aside: ')+a.resolution;row.append(r);}
    if(a.replies?.length){const t=document.createElement('div');t.className='thread';paintThread(t,a.replies,'reviewer');row.append(t);}
    if(live&&own&&!a.tweak)enableDoubleClick(row,()=>editAnnotation(row,a));
    expandable(row,a.id);return row;
  }
  function elsewhereRow(a){
    const row=document.createElement('article');row.className='row';row.dataset.annotation=a.id;
    const go=button('',()=>goTo(a),'ghost locate');go.innerHTML=svg('locate');go.title='Open this page';go.setAttribute('aria-label','Open '+pathOf(a.page));
    const meta=meta_(pathOf(a.page),go);meta.querySelector('.label').classList.add('page');row.append(byline(meta,a));
    if(a.edit)diff(row,a.edit.from,a.edit.to);else if(a.tweak)tweakDiff(row,a.tweak);else{const text=document.createElement('p');text.className='copy';text.textContent=a.note||a.comment||`${a.kind} change`;row.append(text);}
    if(a.resolution&&!open_(a)&&statusWord(a)!=='Withdrawn'){const r=document.createElement('p');r.className='hint';r.textContent=(a.status==='resolved'?'Done: ':'Set aside: ')+a.resolution;row.append(r);}
    if(a.replies?.length){const t=document.createElement('div');t.className='thread';paintThread(t,a.replies,'reviewer');row.append(t);}
    expandable(row,a.id);return row;
  }
  // Check the fix (check.js): what the agent closed since your Send, one at a time.
  function checkEntry(h){const c=window.__AGENTATION_KIT_CHECK__,n=c?.count()||0;if(!n)return;const b=button(`Check ${n}`,()=>{open(null,{keepFocus:true});c.start();});b.dataset.check='';b.style.cssText='margin-left:auto;padding:2px 8px;font-size:12px;color:var(--sk-text)';b.title='Check what the agent changed, one at a time';h.append(b);}
  function section(body,label,n){const h=document.createElement('h3');h.className='sec';h.textContent=label+' ';const c=document.createElement('span');c.className='n';c.textContent=String(n);h.append(c);body.append(h);}
  // A question the agent asked, answerable right here whichever page it is on.
  function questionRow(a){
    const row=document.createElement('article');row.className='row question';row.dataset.annotation=a.id;
    // A question is labelled by the word, not by a coloured bar down its side.
    // Scoped to what the note is on (h2 "Starter"), as its marker is. Only a
    // note on the whole page says "about this page"; another page names it.
    const on=String(a.element||'').trim(), whole=!on||on==='Page feedback';
    const where=a.here?(whole?'about this page':on):(whole?'about ':on+' on ')+pathOf(a.page);
    const meta=meta_(where,locateButton(()=>a.here?locate(a):goTo(a)));const l=meta.querySelector('.label');l.classList.add('page');l.title=where;const q=document.createElement('span');q.className='q';q.textContent='Question';l.prepend(q,document.createTextNode(' · '));row.append(meta);row.classList.add('open');
    if(a.edit)diff(row,a.edit.from,a.edit.to);else if(a.tweak)tweakDiff(row,a.tweak);else{const text=document.createElement('p');text.className='copy';text.textContent=a.note||a.comment||`${a.kind} change`;row.append(text);}
    const t=document.createElement('div');t.className='thread';paintThread(t,a.replies,'reviewer');row.append(t);
    const actions=document.createElement('div');actions.className='actions';
    actions.append(button('Answer',()=>{focused=a.id;const keep=[...row.children].slice(0,3);row.replaceChildren(...keep);
      const field=document.createElement('textarea');field.id='sk-review-answer';const l=document.createElement('label');l.htmlFor=field.id;l.textContent='Your answer';
      // A half-typed answer survives closing the panel (kept per question, this page only).
      field.value=answerDrafts.get(a.id)||'';field.oninput=()=>{if(field.value)answerDrafts.set(a.id,field.value);else answerDrafts.delete(a.id);};
      const act2=document.createElement('div');act2.className='actions';
      act2.append(button('Send answer',()=>{const msg=field.value.trim();if(!msg){error='Write an answer first.';renderMessage();return;}
        // Keep the keyboard user where they were: the row they just answered.
        // Sending disables the button and removes the field, and the list
        // re-renders on the save and again on the stream (up to 1.3s later),
        // each time with a new row. The keeper puts focus back on this row after
        // every render; the hold covers the gaps between them (F-Answer).
        row.tabIndex=-1;row.focus({preventScroll:true});keeper.set({row:'a:'+a.id,control:''});
        const hold=holdFocus(()=>keeper.target()||ui.el('close'),{ms:5000,when:()=>mode==='inbox'&&!panel.hidden});
        act(async()=>{const name=await ensureReviewer();await request(`annotations/${a.id}/reply`,'POST',{message:msg,...(name?{name}:{})});answerDrafts.delete(a.id);focused=null;})
          .then(()=>{if(error&&field.isConnected){hold.stop();field.focus();}});},'primary'),button('Cancel',()=>{focused=null;error='';render();}));
      field.onkeydown=e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();act2.firstChild.click();}};
      row.append(l,field,act2);field.focus();},'primary'));
    row.append(actions);return row;
  }
  const answerDrafts=new Map();
  function goTo(a){ try { const u=new URL(a.page,location.href); if(u.origin===location.origin){ location.assign(u.href); return; } } catch {} error='That page is on a different address.';renderMessage(); }
  /**
   * Handing the round to the agent. Uncommitted text edits are committed first,
   * because "I'm done" means the drafts on screen are what they want. The
   * signal is a single `agentation-round` key: the KV bridge mirrors it to the
   * link's shared store (D1 on a link, the preview JSON locally), where the
   * agent's wait loop and read_annotations both see it. No schema change.
   */
  function renderDone(body,drafts){
    const notes=allRows().filter(open_);
    const pages=new Set(notes.map(a=>pathOf(a.page))).size;
    const qs=questionsForMe(notes).length;
    const p=document.createElement('p');p.className='summary';
    const tw=tweak()?.count||0;
    const n=notes.length+drafts.length+tw;
    const fresh=unsent();
    const revising=new Set(drafts.map(x=>x.annotationId).filter(Boolean));
    const has=notes.filter(a=>!revising.has(a.id)&&(isQuestion(a)||stamp(a)<=sentAt)).length;
    // The sheet leads with the button's number (unsent(), Send N), then says
    // what the agent already has: "2 new notes. The agent reads them with the
    // 4 it already has." Nothing new: what the agent has, and no primary Send.
    const say=sendSummary({fresh,n,has,pages,sentAt,qs,drafts:drafts.length,tweaks:tw});
    const went=say.went;
    p.append(...say.lead.map(x=>typeof x==='string'?document.createTextNode(x):Object.assign(document.createElement('b'),{textContent:x.b})));
    body.append(p);
    for(const f of say.facts){const h=document.createElement('p');h.className='hint';h.textContent=f;body.append(h);}
    // The round marker is shared: anyone's Send wakes the agent, so say whose it was.
    // Neutral text with a check, not green: status is an icon and a word.
    if(sentAt){const s=document.createElement('p');s.className='hint sent';s.innerHTML=svg('commit');s.append(document.createTextNode('Last sent '+(sentBy&&!isMine(sentBy)?'by '+sentBy+', ':'')+sentLabel(sentAt)+'. Questions come back to the inbox.'));body.append(s);}
    const actions=document.createElement('div');actions.className='actions';
    let sentNow=false;
    const send=button(say.send.label,()=>act(async()=>{
      if(drafts.length){const r=await editMode.commit();if(r.failed||r.count<drafts.length)throw new Error('Some text edits could not be saved. Nothing was sent; retry when connected.');}
      if(tweak()?.count){const r=await tweak().save();if(r.failed)throw new Error('Some tweaks could not be saved. Nothing was sent; retry when connected.');}
      const reviewer=await ensureReviewer();
      // Snapshot server IDs at Send, after committing drafts. Later notes must
      // not silently join a queued round while its agent is still busy.
      // A note still saving would be left out of the round and then read as
      // sent (its time predates Send). Wait for every optimistic note to reach
      // the server, briefly; if one never does, send nothing and say so.
      let submitted=null;
      for(let i=0;!submitted;i++){
        const snapshot=await fetch(`${endpoint}/sessions?author=all`);
        if(!snapshot.ok)throw new Error('Feedback could not be loaded. Nothing was sent; retry when connected.');
        const all=((await snapshot.json()).sessions||[]).flatMap(s=>s.annotations||[]);
        const known=knownIds(all), waiting=[...added.values()].filter(a=>!idsOf(a).some(id=>known.has(id)));
        if(!waiting.length)submitted=all.filter(mine).filter(open_);
        else if(i>=24)throw new Error('A note is still saving. Nothing was sent; try again in a moment.');
        else await new Promise(r=>setTimeout(r,200));
      }
      sentAt=Date.now();sentBy=reviewer;
      try{localStorage.setItem('agentation-round',JSON.stringify({ts:sentAt,link:linkOf(endpoint),page:pageKey(),open:submitted.length,pages,questions:qs,noteIds:submitted.map(a=>a.id),...(reviewer?{reviewer}:{})}));}catch{}
      document.dispatchEvent(new CustomEvent('agentation-kit:round-done',{detail:{ts:sentAt}}));
      sentNow=true;
      // Focus goes to the bar's Send, now "Sent", before the sheet goes: not
      // the page, and not the inbox (UX review 6, N12).
      focusFirst(dock?.querySelector('[data-review=done]'));
    // Sent: the sheet closes and the bar says Sent.
    }).then(()=>{if(sentNow&&!error&&mode==='done')open(null,{keepFocus:true});}),say.send.kind);
    actions.append(...(went?[button('Keep reviewing',()=>open(null),'primary'),send]:[send,button('Keep reviewing',()=>open(null))]));
    body.append(actions);
    // A disabled button on its own says nothing; say why.
    if(say.send.disabled){send.disabled=true;const why=document.createElement('p');why.className='why';why.id='sk-send-why';why.textContent='Nothing new to send. Add a note or edit some text first.';send.setAttribute('aria-describedby',why.id);body.append(why);}
  }
  // Who wrote it, after what it is. Unsigned notes (from before names, or "Not now") show none.
  // The label's text gives way first, never the name: an ellipsis on the end
  // of "Comment · Any viewport · You" hid who wrote it (UX review 6, N10).
  function byline(meta,a){
    if(!a.reviewer)return meta;
    const by=document.createElement('span');by.className='by';by.textContent=isMine(a.reviewer)?'You':a.reviewer;by.title=a.reviewer;
    const label=meta.querySelector('.label'),txt=document.createElement('span');txt.className='txt';txt.append(...label.childNodes);
    const what=txt.textContent;label.title=(what?what+' · ':'')+a.reviewer;label.classList.add('with-by');
    if(what)label.append(txt,Object.assign(document.createElement('span'),{className:'sep',textContent:' · '}));
    label.append(by);return meta;
  }
  // Reviewing as …, Change, and the Mine / Everyone filter.
  function whoBar(body){
    const bar=document.createElement('div');bar.className='who-bar';
    const me=document.createElement('span');me.className='me';const name=reviewerName();
    me.textContent=name?'Reviewing as '+name:'No name set';
    const change=button(name?'Change':'Add your name',()=>changeReviewer());
    const chips=document.createElement('span');chips.className='chips';chips.setAttribute('role','group');chips.setAttribute('aria-label','Show feedback from');
    for(const [key,label] of [['mine','Mine'],['all','Everyone']]){
      const c=button(label,()=>{who=key;try{localStorage.setItem(FILTER,key);}catch{}render();},'chip');c.setAttribute('aria-pressed',String(who===key));chips.append(c);
    }
    bar.append(me,change,chips);body.append(bar);
  }
  // One line per row: what it is on the left, what you can do on the right.
  function meta_(label,...tools){
    const m=document.createElement('div');m.className='meta';
    const l=document.createElement('span');l.className='label';l.textContent=label;
    const t=document.createElement('span');t.className='tools';t.append(...tools);
    m.append(l,t);return m;
  }
  function iconButton(icon,label,action,cls='ghost'){const b=button('',action,cls);b.innerHTML=svg(icon);b.title=label;b.setAttribute('aria-label',label);return b;}
  // Long text is clamped so a list stays scannable. A click shows all of it.
  function expandable(row,id){
    row.dataset.expandable='';row.classList.toggle('open',openRows.has(id));
    row.onclick=e=>{if(saving||focused||e.target.closest('button,textarea,input,label,a,select'))return;
      if(openRows.has(id))openRows.delete(id);else openRows.add(id);row.classList.toggle('open',openRows.has(id));requestAnimationFrame(positionPanel);};
  }
  function locateButton(action) {
    const b=button('',action,'ghost locate');b.innerHTML=svg('locate');b.title='Jump to location';b.setAttribute('aria-label','Jump to location');return b;
  }
  function enableDoubleClick(row,edit) {
    row.classList.add('editable');
    row.ondblclick=e=>{if(saving||focused||e.target.closest('button,textarea,input,label'))return;e.preventDefault();edit();};
  }
  function editDraft(row,d) { focused=d.id;editor(row,d.to, async text=>{editMode.revise(d.id,text);focused=null;render();},'Save draft'); }
  function editor(row,value,save,label='Save changes') {
    row.replaceChildren();const field=document.createElement('textarea');field.id='sk-review-edit-value';field.value=value;
    const l=document.createElement('label');l.htmlFor=field.id;l.textContent='Revised text';row.append(l,field);
    const actions=document.createElement('div');actions.className='actions';actions.append(button(label,()=>act(()=>save(field.value)),'primary'),button('Cancel',()=>{focused=null;error='';render();}));row.append(actions);field.focus();
  }
  function editAnnotation(row,a) {focused=a.id;editor(row,a.edit?.to??a.note??a.comment,async value=>{
    const body=a.edit?{edit:{to:value},comment:`Change to: "${value}"`}:a.kind==='placement'||a.kind==='rearrange'?{note:value}:{comment:value};
    await request(`annotations/${a.id}`,'PATCH',body);
    if(a.edit)editMode?.revise(a.edit.id,value,true);focused=null;
  });}
  // Delete (not sent yet) clears the note as Clear all would, so it leaves the
  // inbox. Withdraw (sent) keeps it under Done, marked Withdrawn, so the agent
  // and the reviewer both see it was taken back. Neutral, not red: neither
  // loses anyone else's work.
  function confirmRemove(row,a,sent) {
    focused=a.id;const tools=row.querySelector('.tools');[...tools.querySelectorAll('button')].forEach(b=>{if(b.getAttribute('aria-label')!=='Jump to location')b.hidden=true;});const actions=document.createElement('div');actions.className='actions';row.append(actions);const hint=document.createElement('p');hint.className='hint';
    hint.textContent=sent?'Withdraw this note? The agent will leave it. It stays under Done.':'Delete this note? It was not sent, so the agent never sees it.';
    actions.append(hint,button('Keep note',()=>{focused=null;render();}),button(sent?'Withdraw note':'Delete note',()=>act(async()=>{
      if(sent)await request(`annotations/${a.id}/withdraw`,'POST',{});
      else{const name=reviewerName();await request(`annotations/${a.id}${name?`?reviewer=${encodeURIComponent(name)}`:''}`,'DELETE');}
      editMode?.clearCommitted(a.id,'dismissed');focused=null;}),'ghost'));
  }
  // Done, not Resolved; a note the reviewer took back says so.
  function statusWord(a){
    if(a.status==='resolved')return 'Done';
    if(a.status==='dismissed')return /^Withdrawn by the reviewer/.test(a.resolution||'')?'Withdrawn':'Set aside';
    return stamp(a)>sentAt?'Not sent':'Sent';
  }
  // A failed save keeps the editor (and the typed text) open: act() only
  // re-renders on success. The message says why (413 too long, 409 conflict).
  async function request(path,method,body) {let r;try { r=await fetch(`${endpoint}/${path}`,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); } catch { throw new Error(failMessage(0)); } if(!r.ok)throw new Error(failMessage(r.status));return r.json();}
  // The pressed button keeps focus while it works (UX review 6, N12): disabled,
  // it dropped focus to the page. It is marked busy instead; act() ignores a
  // second press while saving.
  async function act(work) {if(saving)return;saving=true;error='';renderMessage();const held=ui.root.activeElement;panel.querySelectorAll('button').forEach(b=>{if(b===held)b.setAttribute('aria-disabled','true');else b.disabled=true;});try{await work();document.dispatchEvent(new CustomEvent('agentation-kit:annotations-refresh'));}catch(e){error=e.message;}finally{saving=false;panel.querySelectorAll('button').forEach(b=>{b.disabled=false;b.removeAttribute('aria-disabled');});if(!error)await refresh();renderMessage();}}
  function locate(a) {
    if(!belongsToViewport(a)) { simulator.choose(a.viewport?.name || (a.viewport.width<768?'mobile':a.viewport.width<1200?'tablet':'desktop'),a);return; }
    let node=a.node;try{node ||= document.querySelector(a.elementPath||a.selector);}catch{}
    if(node){open(null);node.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});const previous=node.style.outline;node.style.outline='2px solid #FF5436';node.style.outlineOffset='2px';setTimeout(()=>node.style.outline=previous,1800);}else {error='This element is no longer on the page. The original feedback is kept in the inbox.';renderMessage();}
  }
  document.addEventListener('agentation-kit:edit-change',()=>{updateButtons();if(!editMode?.active&&mode==='edits')open(null,{keepFocus:true});else if(editMode?.active&&!mode)open('edits');else if(mode==='edits'&&!focused&&!saving)render();});
  document.addEventListener('agentation-kit:annotations-refresh',()=>{if(mode)refresh();});
  document.addEventListener('agentation-kit:reviewer-change',()=>{updateButtons();if(mode&&!focused&&!saving)render();});
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(more||sheetOpen){setMore(false);setSheet(false);e.stopPropagation();return;}
    // Typing in one of our fields: the first Escape only leaves the field (its
    // text is kept); the next one closes the panel.
    if(mode&&mode!=='edits'&&ui.root.activeElement?.matches?.('textarea,input')){ui.root.activeElement.blur();ui.el('close')?.focus();e.stopPropagation();return;}
    if(mode==='edits'){
      // A first Escape while typing only leaves the text. Left to the toolbar,
      // it would exit feedback mode.
      if(expanded){focused=null;expanded=false;render();e.stopPropagation();}
      // Leaving the text puts focus on the mode button, not the page (UX review 5, #12).
      else if(document.activeElement?.matches?.('[data-sk-edit]')){const t=document.activeElement;if(!focusMode())t.blur();e.stopPropagation();}
      return;
    }
    if(mode){open(null);e.stopPropagation();}
  },true);
  document.addEventListener('agentation-kit:route',()=>{if(mode&&!focused&&!saving)render();});
  return {open,refresh,locate,setSession,added:noteAdded,ingest:payload=>{
    // A reviewer note the list doesn't have yet counts at once; the fetch below confirms it.
    // Not while one of ours is still unconfirmed: the stream frame carries the
    // server id but no clientId, so it can't be matched to the optimistic copy
    // and would count the same note twice. The fetch below matches it exactly.
    if(payload?.id&&payload.author!=='agent'&&payload.createdAt&&!added.size&&!idsOf(payload).some(id=>knownIds(listed()).has(id)))noteAdded(payload);
    if(mode&&!focused&&!saving)refresh();else refresh(true);},focusViewport:()=>{setMore(false);open('viewport');}};
}
