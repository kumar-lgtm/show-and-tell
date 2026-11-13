import { createHost, markChrome, slotPanel, Z, placeToast, revealRect, failMessage, toolbarShell, scheduleInsets, othersOpen } from './ui.js';
import { keyOf, pageKey } from './page-key.js';
import { reviewerName, ownsNote } from './reviewer.js';
import { showMoment } from './playhead.js';
import { playheadLabel } from '../server/playhead.js';

/**
 * Check the fix (show-and-tell.pen, "Show and tell redesign", chapter 8).
 *
 * After a round, the agent has resolved some notes and set others aside. Check
 * walks through them one at a time: the page scrolls each change into the free
 * area and outlines it, and a small card above the bar says what was asked,
 * what the agent did, and before → after when the note holds it. The reviewer
 * says Looks right, or Not yet with what's still off, which reopens the note
 * into their next Send (POST /annotations/:id/verdict). Set-aside notes come
 * last, with the agent's reason: Agree closes them, Disagree reopens them.
 *
 * Three surfaces, all in the panel slot (ui.js):
 *   - the entry strip, "5 changed, 1 set aside · Check 6", PASSIVE so it never
 *     covers a panel the reviewer opened;
 *   - the card, active while checking;
 *   - the done strip, "4 look right, 1 reopened, 1 set aside", passive again.
 *
 * Decision: on a wide screen the design draws the card over the right edge of
 * the page. Here it reserves the bottom band like every other strip (ui.js), so
 * the page reflows above it and the outlined target is revealed into what is
 * left. That keeps the change in view instead of under the card.
 */

const icons = {
  check: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/>',
  done: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',
  prev: '<path d="M15 6l-6 6 6 6"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  reopen: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const svg = (key, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key] || ''}</svg>`;

// The same round marker review-tools.js reads: this browser's last Send.
const linkOf = (endpoint) => { try { return new URL(endpoint, location.href).pathname; } catch { return ''; } };
const sentAtOf = (endpoint) => { try { const r = JSON.parse(localStorage.getItem('agentation-round')); return r?.link === linkOf(endpoint) ? Number(r.ts) || 0 : 0; } catch { return 0; } };
// Browser-local (not an agentation* key, which the KV bridge shares with every reviewer).
const CLOSED = 'feedback-toolbar-check-closed';

const closed = (a) => a.status === 'resolved' || a.status === 'dismissed';
// Rejected, cleared or an undone Fix it: the reviewer's doing, not the agent setting it aside.
const byReviewer = (a) => /^(Cleared by |Withdrawn by the reviewer|Undone by .*: Fix it taken back\.$)/.test(a.resolution || '');
/**
 * Does this note want checking? Closed by the agent since `sentAt`, and not
 * yet given a verdict since it was closed (a verdict writes `updatedAt` itself,
 * so a later re-close by the agent is newer than it).
 */
export function needsCheck(a, sentAt) {
  if (!a || a.author === 'agent' || !closed(a) || byReviewer(a) || !sentAt) return false;
  const at = Number(a.updatedAt) || 0;
  return at > sentAt && !(a.verdict && Number(a.verdict.at) >= at);
}
/** Resolved first, then set aside; each oldest first. */
export function checkOrder(list) {
  const rank = (a) => (a.status === 'dismissed' ? 1 : 0);
  return [...list].sort((a, b) => rank(a) - rank(b) || (Number(a.updatedAt) || 0) - (Number(b.updatedAt) || 0));
}
/** "5 changed, 1 set aside". */
export function entryText(list) {
  const changed = list.filter((a) => a.status === 'resolved').length, aside = list.length - changed;
  return [changed ? `${changed} changed` : '', aside ? `${aside} set aside` : ''].filter(Boolean).join(', ');
}
/** "4 look right, 1 reopened, 1 set aside" from verdicts {looks-right, not-yet, agree, skipped}. */
export function summaryText(c) {
  const parts = [];
  if (c['looks-right']) parts.push(`${c['looks-right']} ${c['looks-right'] === 1 ? 'looks' : 'look'} right`);
  if (c['not-yet']) parts.push(`${c['not-yet']} reopened`);
  if (c.agree) parts.push(`${c.agree} set aside`);
  if (c.skipped) parts.push(`${c.skipped} not checked`);
  return parts.join(', ') || 'Nothing checked';
}
/**
 * Before → after the note itself holds: a text edit, an All text edit, a tweak.
 * A tweak names its property once ("border-radius 8px → 10px"): the values
 * alone don't say what changed.
 */
export function beforeAfter(a) {
  const val = (v) => (v && typeof v === 'object' ? Object.entries(v).map(([k, x]) => `${k} ${x}`).join(', ') : v == null ? '' : String(v));
  for (const src of [a.edit, a.copy, a.tweak]) {
    if (!src || (src.from == null && src.to == null)) continue;
    const ba = { from: val(src.from), to: val(src.to) };
    if (src === a.tweak && src.property && typeof src.from !== 'object' && typeof src.to !== 'object') ba.property = String(src.property);
    return ba;
  }
  return null;
}
/** What the reviewer asked, in their words. */
export function askedText(a) {
  return String(a.note || a.comment || '').trim() || `${a.kind || 'Note'} with no text`;
}

/** The agent's screenshots on a note, before first: [{kind, file, width, height, found, viewport}]. */
export function shotsOf(a) {
  return ['before', 'after'].map((k) => a?.shots?.[k]).filter((sh) => sh && typeof sh.file === 'string' && /^(before|after)-\d+\.(png|jpg)$/.test(sh.file));
}

/**
 * @param {object} o
 * @param {string} o.endpoint
 * @param {object} [o.fresh]  fresh.js: is the page older than the fix? Then Check says Reload first.
 */
export function createCheck({ endpoint, fresh: freshness = null }) {
  let notes = [], queue = [], index = 0, verdicts = new Map(), state = 'idle', replying = false, busy = false, error = '', work = null, target = null, resumeAt = null;
  const ui = createHost(`
    [hidden]{display:none!important}
    .panel{position:fixed;z-index:${Z.panel};font:400 13px/1.45 var(--sk-font)}
    .strip{display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100vw - 24px);padding:6px 6px 6px 12px;white-space:nowrap}
    .strip .say{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:500}
    .strip .say svg{flex:none;color:var(--sk-text-2)}
    button{font:inherit;cursor:pointer;border:0;border-radius:6px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
    button:focus-visible,textarea:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    button.primary{padding:6px 12px;font-size:13px}
    button.secondary{padding:6px 12px;font-size:13px;font-weight:500;background:transparent;color:var(--sk-text);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
    :host([data-sk-theme=light]) button.secondary{box-shadow:inset 0 0 0 1px rgba(0,0,0,.16)}
    button.secondary:hover{background:var(--sk-hover)}
    button.quiet{padding:6px 10px;font-size:13px;background:none;color:var(--sk-text-2)}button.quiet:hover{background:var(--sk-hover);color:var(--sk-text)}
    .iconbtn{width:32px;height:32px;padding:0;display:grid;place-items:center;color:var(--sk-text-2)}
    .iconbtn[disabled]{opacity:.35;cursor:default}
    .card{display:flex;flex-direction:column;max-height:calc(100dvh - 140px)}
    .card .top{display:flex;align-items:center;gap:2px;padding:6px 6px 0 14px}
    .card .count{margin-right:auto;font-size:12px;font-weight:500;color:var(--sk-text-2);font-variant-numeric:tabular-nums}
    .card .main{padding:6px 14px 12px;overflow-y:auto;min-height:0}
    .card .lbl{font-size:12px;color:var(--sk-text-2);margin:8px 0 2px}.card .lbl:first-child{margin-top:2px}
    .card .txt{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
    .card .ba{display:flex;align-items:center;gap:10px;margin:4px 0 10px;padding:8px 10px;border-radius:6px;background:var(--sk-raised);overflow-wrap:anywhere}
    .card .ba .from{color:var(--sk-text-2);text-decoration:line-through;text-decoration-thickness:1px}
    .card .ba .to{font-weight:600}.card .ba svg{flex:none;color:var(--sk-text-3)}.card .ba .prop{color:var(--sk-text-2)}
    .card .where{margin:10px 0 0;font-size:12px;color:var(--sk-text-2)}.card .where code{font:12px ui-monospace,SFMono-Regular,Menlo,monospace}
    .card .stamp{display:flex;align-items:center;gap:6px;margin:10px 0 0;font-size:12px;color:var(--sk-text)}
    .card .field{display:flex;align-items:flex-start;gap:4px;margin-top:10px}
    .card .field textarea{flex:1;min-height:44px;max-height:160px;resize:none;font-size:13px;line-height:1.45;padding:8px 10px}
    .card .err{margin:8px 0 0;font-size:12px;color:#ec8e8e}
    .card .stale{display:flex;align-items:center;gap:8px;margin:10px 0 0;padding:8px 8px 8px 10px;border-radius:6px;background:var(--sk-raised);font-size:12px}
    .card .stale span{flex:1;min-width:0}
    .card .shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px;margin:6px 0 0}
    .card .shot{position:relative;display:block;border-radius:6px;overflow:hidden;background:var(--sk-raised);text-decoration:none;color:inherit}
    .card .shot:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    .card .shot img{display:block;width:100%;height:auto;max-height:220px;object-fit:contain}
    .card .shotfig{margin:0;min-width:0}.card .shotfig .lbl{margin:0 0 4px}
    .card .shotnote{margin:6px 0 0;font-size:12px;color:var(--sk-text-2)}
    .card .foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--sk-hairline)}
    @media (max-width:600px),(pointer:coarse){
      button,.iconbtn{min-height:44px}.iconbtn{width:44px;height:44px}
      .card .foot{display:grid;grid-template-columns:1fr 1fr}
      .card .foot button{width:100%}
      .strip{padding:4px 4px 4px 12px}
    }
  `);
  ui.host.dataset.checkUi = '';
  const strip = document.createElement('section'); strip.className = 'panel strip'; strip.hidden = true; strip.setAttribute('aria-label', 'Check the fix');
  const card = document.createElement('section'); card.className = 'panel card'; card.hidden = true; card.setAttribute('role', 'dialog'); card.setAttribute('aria-label', 'Check the fix');
  ui.root.append(strip, card);
  // The outline drawn round the change: a ring over the target, never a style on it.
  const ring = markChrome(document.createElement('div'));
  ring.dataset.checkRing = '';
  Object.assign(ring.style, { position: 'fixed', pointerEvents: 'none', zIndex: String(Z.marker), border: '2px solid #FF5436', borderRadius: '6px', background: 'rgba(255,84,54,.08)', display: 'none', boxSizing: 'border-box' });
  document.body.append(ring);

  // The strip steps aside while anything else is open (ui.js othersOpen, the
  // same test the question notice uses): the Tweak panel, upstream Settings,
  // the Layout palette, the comment popup. On a phone it sat on the Tweak
  // sheet's footer and on Settings. It comes back when they close.
  const aside = () => othersOpen({ slots: ['check-strip'], hosts: [ui.host] });
  const stripSlot = slotPanel('check-strip', (visible) => { strip.hidden = !visible || aside(); if (!strip.hidden) requestAnimationFrame(placeStrip); });
  function syncStrip() {
    if (!stripSlot.visible) return;
    const hide = aside();
    if (strip.hidden === hide) return;
    strip.hidden = hide; scheduleInsets();
    if (!hide) requestAnimationFrame(placeStrip);
  }
  let syncFrame = 0;
  const syncSoon = () => { if (!syncFrame) syncFrame = requestAnimationFrame(() => { syncFrame = 0; syncStrip(); }); };
  document.addEventListener('agentation-kit:slot', syncSoon);
  document.addEventListener('agentation-kit:insets', syncSoon);
  document.addEventListener('agentation-kit:tweak-change', syncSoon);
  addEventListener('pointerup', () => setTimeout(syncStrip, 60), { passive: true });
  addEventListener('keyup', () => setTimeout(syncStrip, 30), { passive: true });
  // Upstream's popups and the Tweak sheet announce nothing: a light timer, only while the strip is up.
  setInterval(() => { if (stripSlot.visible) syncStrip(); }, 300);
  const cardSlot = slotPanel('check', (visible) => {
    card.hidden = !visible;
    if (visible) requestAnimationFrame(() => { placeCard(); reveal(); });
    else ring.style.display = 'none';
  });

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const btn = (cls, text, action, icon) => { const b = el('button', cls); b.type = 'button'; if (icon) b.innerHTML = svg(icon); if (text) b.append(document.createTextNode(text)); b.onclick = (e) => { e.stopPropagation(); action(); }; return b; };
  const iconBtn = (icon, label, action) => { const b = btn('iconbtn', '', action, icon); b.title = label; b.setAttribute('aria-label', label); return b; };

  // ---- data ---------------------------------------------------------------
  const sessionId = () => window.__AGENTATION_KIT_AGENTATION_SESSION__;
  const checkable = () => checkOrder(notes.filter((a) => ownsNote(a) && needsCheck(a, sentAtOf(endpoint))));
  async function refresh() {
    if (!endpoint) return;
    try {
      const r = await fetch(`${endpoint}/sessions?author=all`);
      if (!r.ok) return;
      notes = ((await r.json()).sessions || []).flatMap((s) => (s.annotations || []).filter((a) => a.author !== 'agent').map((a) => ({ ...a, page: s.url, here: s.id === sessionId() })));
    } catch { return; }
    paint();
    // Reloaded from Reload and check: open the card where it was, once the notes are in.
    if (resumeAt && state !== 'card') { const id = resumeAt === true ? undefined : resumeAt; resumeAt = null; start(id) || start(); }
  }
  let refreshTimer = 0;
  const soon = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 300); };

  // ---- the strips -------------------------------------------------------
  const closedMark = () => { try { return JSON.parse(localStorage.getItem(CLOSED)) || {}; } catch { return {}; } };
  const latest = (list) => list.reduce((m, a) => Math.max(m, Number(a.updatedAt) || 0), 0);
  const complete = () => work?.state === 'complete';
  function paint() {
    if (state === 'card') return;
    if (state === 'done') { stripSlot.want(true, { passive: true }); paintDone(); return; }
    const list = checkable(), mark = closedMark();
    const fresh = latest(list) > (Number(mark.at) || 0) || (complete() && (Number(work.updatedAt) || 1) > (Number(mark.work) || 0));
    const show = (list.length > 0 || complete()) && fresh;
    if (!show) { stripSlot.want(false); return; }
    strip.replaceChildren();
    const say = el('span', 'say'); say.innerHTML = svg('done');
    say.append(document.createTextNode(list.length ? entryText(list) : 'Changes ready'));
    strip.append(say);
    // The page predates the fixes (fresh.js): checking it now would show the old
    // page and read as "not done". Reload first, then the card opens by itself.
    const old = list.length && freshness?.olderThan(latest(list));
    if (old) {
      const go = btn('primary', `Reload and check ${list.length}`, () => reloadThen(), 'reopen'); go.dataset.checkReload = '';
      go.title = `This page loaded before the changes (${freshness.stale.map((x) => x.file).join(', ')})`;
      strip.append(go);
    } else if (list.length) { const go = btn('primary', `Check ${list.length}`, () => start(), 'check'); go.dataset.checkStart = ''; go.setAttribute('aria-label', `Check ${list.length} ${list.length === 1 ? 'change' : 'changes'}`); strip.append(go); }
    if (complete() && !old) strip.append(btn('secondary', 'Reload page', () => (freshness ? freshness.reload() : location.reload())));
    strip.append(iconBtn('close', 'Close', () => {
      try { localStorage.setItem(CLOSED, JSON.stringify({ at: latest(list), work: complete() ? Number(work.updatedAt) || 1 : 0 })); } catch {}
      stripSlot.want(false);
    }));
    stripSlot.want(true, { passive: true });
    if (stripSlot.visible) requestAnimationFrame(placeStrip);
  }
  function paintDone() {
    const c = { 'looks-right': 0, 'not-yet': 0, agree: 0, skipped: 0 };
    for (const a of queue) { const v = verdicts.get(a.id); if (v) c[v]++; else c.skipped++; }
    strip.replaceChildren();
    // How the check went: a plain check mark, not the scan frame Check starts with.
    const say = el('span', 'say'); say.innerHTML = svg('tick'); say.append(document.createTextNode(summaryText(c)));
    say.setAttribute('role', 'status');
    strip.append(say, iconBtn('close', 'Close', () => { state = 'idle'; queue = []; verdicts = new Map(); stripSlot.want(false); paint(); }));
    if (stripSlot.visible) requestAnimationFrame(placeStrip);
  }
  async function reloadThen(id) {
    const why = await (freshness ? freshness.reload({ then: 'check', id }) : (location.reload(), ''));
    if (!why) return;
    if (state === 'card') { error = why; paintCard(); placeCard(); } else toastWhy(why);
  }
  function toastWhy(why) {
    const say = strip.querySelector('.say'); if (!say) return;
    const was = say.lastChild?.textContent;
    if (say.lastChild) say.lastChild.textContent = why;
    setTimeout(() => { if (say.isConnected && say.lastChild?.textContent === why) say.lastChild.textContent = was; }, 5000);
  }
  function placeStrip() { if (strip.hidden) return; placeToast(strip, Math.min(560, innerWidth - 24)); strip.style.width = 'max-content'; placeToast(strip, Math.min(strip.getBoundingClientRect().width || 400, innerWidth - 24)); }

  // ---- the card ---------------------------------------------------------
  function start(id) {
    const list = checkable();
    if (!list.length) return false;
    queue = list; verdicts = new Map(); replying = false; error = '';
    index = Math.max(0, id ? queue.findIndex((a) => a.id === id) : 0);
    state = 'card'; stripSlot.want(false);
    paintCard(); cardSlot.want(true, { bump: true });
    requestAnimationFrame(() => card.querySelector('.foot .primary')?.focus({ preventScroll: true }));
    return true;
  }
  function stop() {
    replying = false; error = ''; cardSlot.want(false); ring.style.display = 'none'; target = null;
    // Everything answered: one line says how it went. Otherwise back to the
    // entry strip, which counts what is left.
    state = queue.length && queue.every((a) => verdicts.has(a.id)) ? 'done' : 'idle';
    if (state === 'idle') { queue = []; verdicts = new Map(); }
    paint();
  }
  function go(step) {
    if (!queue.length || busy) return;
    index = (index + step + queue.length) % queue.length; replying = false; error = '';
    paintCard(); placeCard(); reveal();
  }
  const current = () => queue[index];
  function paintCard() {
    const a = current(); if (!a) return;
    const aside = a.status === 'dismissed', v = verdicts.get(a.id);
    card.replaceChildren();
    const top = el('div', 'top');
    const count = el('span', 'count', `${index + 1} of ${queue.length}${aside ? ', set aside' : ''}`);
    top.append(count, iconBtn('prev', 'Previous change', () => go(-1)), iconBtn('next', 'Next change', () => go(1)), iconBtn('close', 'Close', stop));
    if (queue.length < 2) top.querySelectorAll('.iconbtn').forEach((b, i) => { if (i < 2) b.disabled = true; });
    const main = el('div', 'main');
    // A text edit or tweak is its own request: show its before → after under
    // You asked, not the generated "Change to: …" line it was stored with.
    const ba = beforeAfter(a), made = ba && (['edit', 'copy', 'tweak'].includes(a.kind) || /^Change to: /.test(askedText(a)));
    main.append(el('p', 'lbl', a.playhead ? `You asked, ${playheadLabel(a.playhead)}` : 'You asked'));
    if (!made) main.append(el('p', 'txt', askedText(a)));
    if (ba) { const box = el('div', 'ba'); if (ba.property) box.append(el('span', 'prop', ba.property)); box.append(el('span', 'from', ba.from || '(empty)')); box.insertAdjacentHTML('beforeend', svg('arrow', 14)); box.append(el('span', 'to', ba.to || '(empty)')); box.setAttribute('aria-label', `${ba.property ? ba.property + '. ' : ''}Before: ${ba.from}. After: ${ba.to}.`); main.append(box); }
    main.append(el('p', 'lbl', aside ? 'The agent set this aside' : 'The agent'), el('p', 'txt', a.resolution || (aside ? 'Set aside without a reason.' : 'Marked done without a note.')));
    // The agent's proof (feedback resolve --shot): what it saw at your viewport.
    const shots = shotsOf(a);
    if (shots.length) {
      const fig = el('div', 'shots');
      for (const sh of shots) {
        const url = `${endpoint}/shots/${encodeURIComponent(a.id)}/${encodeURIComponent(sh.file)}`;
        const link = el('a', 'shot'); link.href = url; link.target = '_blank'; link.rel = 'noopener';
        link.title = 'Open full size';
        const img = el('img'); img.src = url; img.loading = 'lazy'; img.decoding = 'async';
        img.alt = `${sh.kind === 'before' ? 'Before' : 'After'} the change, as the agent saw it`;
        if (sh.width && sh.height) { img.width = sh.width; img.height = sh.height; }
        img.onload = () => placeCard();
        link.append(img);
        // The label above the picture, never on it: it covered the very words being checked.
        const one = el('figure', 'shotfig');
        one.append(el('p', 'lbl', shots.length > 1 ? (sh.kind === 'before' ? 'Before' : 'After') : (sh.kind === 'before' ? 'Before, as the agent saw it' : 'After, as the agent saw it')), link);
        fig.append(one);
      }
      const vp = shots.find((sh) => sh.viewport)?.viewport;
      const missed = shots.some((sh) => sh.found === false);
      const when = shots.find((sh) => Number.isFinite(sh.time) && !sh.untimed);
      main.append(fig, el('p', 'shotnote', `A fresh load${vp ? ` at ${vp.width} × ${vp.height}` : ''}${when ? `, stopped ${playheadLabel({ time: when.time })}` : ''}${missed ? '. The agent could not find the element, so this is the whole screen' : ''}. Open it for full size.`));
    }
    // This page loaded before the fix: what's on screen may be the old version.
    if (a.here && freshness?.olderThan(Number(a.updatedAt) || 0)) {
      const box = el('div', 'stale'); box.dataset.checkStale = '';
      box.append(el('span', '', 'This page loaded before this change, so it may still show the old version.'));
      box.append(btn('secondary', 'Reload', () => reloadThen(a.id)));
      main.append(box);
    }
    if (!a.here) { const w = el('p', 'where', 'This change is on '); w.append(el('code', '', keyOf(a.page))); w.append(document.createTextNode('.')); main.append(w); }
    else if (!findTarget(a)) main.append(el('p', 'where', 'Not on the page right now, so there is nothing to outline. Check it where it shows.'));
    if (v) { const s = el('p', 'stamp'); s.innerHTML = svg(v === 'not-yet' ? 'reopen' : 'tick', 14); s.append(document.createTextNode(v === 'looks-right' ? 'You said this looks right.' : v === 'agree' ? 'You agreed to set it aside.' : 'Reopened for your next Send.')); main.append(s); }
    let field = null;
    if (replying) {
      const wrap = el('div', 'field');
      field = el('textarea'); field.id = 'sk-check-reply'; field.rows = 2;
      field.placeholder = aside ? 'Why it should be done' : 'What’s still off?';
      field.setAttribute('aria-label', aside ? 'Why it should be done' : 'What’s still off');
      field.oninput = () => { field.style.height = 'auto'; field.style.height = Math.min(160, field.scrollHeight + 2) + 'px'; placeCard(); };
      field.onkeydown = (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); reopen(field.value); } };
      wrap.append(field); main.append(wrap);
    }
    if (error) main.append(el('p', 'err', error));
    const foot = el('div', 'foot');
    if (replying) {
      foot.append(btn('quiet', 'Cancel', () => { replying = false; error = ''; paintCard(); placeCard(); }));
      const r = btn('primary', 'Reopen', () => reopen(field.value), 'reopen'); r.dataset.checkReopen = ''; foot.append(r);
    } else if (!v) {
      foot.append(btn('secondary', aside ? 'Disagree, reopen' : 'Not yet', () => { replying = true; error = ''; paintCard(); placeCard(); card.querySelector('textarea')?.focus(); }));
      const ok = btn('primary', aside ? 'Agree' : 'Looks right', () => decide(aside ? 'agree' : 'looks-right'), aside ? '' : 'tick');
      ok.setAttribute('aria-keyshortcuts', 'Enter'); ok.title = `${aside ? 'Agree' : 'Looks right'} (Enter)`; foot.append(ok);
    } else {
      foot.append(btn('primary', 'Next', () => nextOpen()));
    }
    if (busy) foot.querySelectorAll('button').forEach((b) => { b.disabled = true; });
    card.append(top, main, foot);
    if (field && replying) queueMicrotask(() => field.focus());
  }
  function nextOpen() {
    const left = queue.findIndex((a, i) => i > index && !verdicts.has(a.id));
    const wrap = left < 0 ? queue.findIndex((a) => !verdicts.has(a.id)) : left;
    if (wrap < 0) { stop(); return; }
    index = wrap; replying = false; paintCard(); placeCard(); reveal();
    card.querySelector('.foot .primary')?.focus({ preventScroll: true });
  }
  async function send(a, body) {
    let r;
    try { r = await fetch(`${endpoint}/annotations/${encodeURIComponent(a.id)}/verdict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, ...(reviewerName() ? { reviewer: reviewerName() } : {}) }) }); }
    catch { throw new Error(failMessage(0)); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(r.status === 409 || r.status === 403 || r.status === 422 ? (j.error ? j.error[0].toUpperCase() + j.error.slice(1) + '.' : failMessage(r.status)) : failMessage(r.status)); }
    return r.json();
  }
  async function act(verdict, message) {
    const a = current(); if (!a || busy) return;
    busy = true; error = ''; paintCard();
    try {
      const view = await send(a, { verdict, ...(message ? { message } : {}) });
      verdicts.set(a.id, verdict);
      const i = notes.findIndex((n) => n.id === a.id); if (i >= 0) notes[i] = { ...notes[i], ...view };
      queue[index] = { ...a, ...view };
      replying = false; busy = false;
      // The reopened note now counts toward Send N on the bar.
      if (verdict === 'not-yet') window.__AGENTATION_KIT_REVIEW__?.refresh(true);
      document.dispatchEvent(new CustomEvent('agentation-kit:check', { detail: { id: a.id, verdict } }));
      nextOpen();
    } catch (e) { busy = false; error = e.message; paintCard(); placeCard(); }
  }
  const decide = (verdict) => act(verdict);
  function reopen(text) {
    const message = String(text || '').trim();
    if (!message) { error = current()?.status === 'dismissed' ? 'Say why it should be done, so the agent knows.' : 'Say what’s still off, so the agent knows what to change.'; paintCard(); placeCard(); card.querySelector('textarea')?.focus(); return; }
    act('not-yet', message);
  }

  // ---- the page -----------------------------------------------------------
  function findTarget(a) {
    if (!a?.here) return null;
    for (const sel of [a.elementPath, a.selector, a.voice?.target?.selector]) {
      if (!sel) continue;
      try { const n = document.querySelector(sel); if (n && !n.closest('[data-feedback-toolbar],[data-agentation-root]')) return n; } catch { /* not a selector this page can parse */ }
    }
    return null;
  }
  function placeCard() {
    if (card.hidden) return;
    const narrow = innerWidth < 600;
    placeToast(card, narrow ? innerWidth - 24 : Math.min(400, innerWidth - 24));
    // Phone: the card sits on the bar. With the keyboard up, above the keyboard.
    const vv = window.visualViewport;
    if (vv && vv.height < innerHeight - 80 && document.activeElement === ui.host) {
      card.style.bottom = Math.round(innerHeight - vv.height - vv.offsetTop + 8) + 'px';
    } else if (narrow) {
      const bar = toolbarShell()?.getBoundingClientRect();
      if (bar?.width) card.style.bottom = Math.round(innerHeight - bar.top + 6) + 'px';
    }
    card.style.maxHeight = Math.round(narrow ? innerHeight * 0.55 : innerHeight - 140) + 'px';
    scheduleInsets();
  }
  function outline() {
    if (!target?.isConnected || card.hidden) { ring.style.display = 'none'; return; }
    const r = target.getBoundingClientRect();
    if (!r.width && !r.height) { ring.style.display = 'none'; return; }
    Object.assign(ring.style, { display: 'block', left: (r.left - 4) + 'px', top: (r.top - 4) + 'px', width: (r.width + 8) + 'px', height: (r.height + 8) + 'px' });
  }
  let revealTurn = 0;
  function reveal() {
    const a = current();
    // A note on a film: stop at its moment first, then look for what it pointed at there.
    // The newest reveal wins: two quick presses of Next must not finish out of order.
    const turn = ++revealTurn;
    if (a?.here && a.playhead && Number.isFinite(a.playhead.time)) {
      showMoment(a.playhead.time).then((moved) => {
        if (!moved || turn !== revealTurn || card.hidden || current()?.id !== a.id) return;
        // What was not on the page at the old frame may be now: the card says which.
        const had = !!target; target = findTarget(current());
        if (!!target !== had && !replying) { paintCard(); placeCard(); }
        outline();
      });
    }
    target = findTarget(a);
    if (!target) { outline(); return; }
    // Two frames: the card's reserved band has to reach the page padding first.
    requestAnimationFrame(() => requestAnimationFrame(() => { if (target) revealRect(target.getBoundingClientRect()); outline(); }));
  }
  addEventListener('scroll', () => { if (!card.hidden) outline(); }, { capture: true, passive: true });
  addEventListener('resize', () => { if (!card.hidden) { placeCard(); outline(); } if (!strip.hidden) placeStrip(); });
  window.visualViewport?.addEventListener('resize', () => { if (!card.hidden) placeCard(); });
  setInterval(() => { if (!card.hidden) outline(); }, 400);

  // Keys while the card is up: left and right move, Enter is Looks right (or
  // Agree), Escape closes. Window capture, ahead of the toolbar's own
  // document-level handlers, which would otherwise take Escape.
  const typing = (e) => e.composedPath().some((n) => n instanceof Element && n.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'));
  addEventListener('keydown', (e) => {
    if (card.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape') {
      e.preventDefault(); e.stopPropagation();
      if (replying) { replying = false; error = ''; paintCard(); placeCard(); card.querySelector('.foot .primary')?.focus(); } else stop();
      return;
    }
    if (typing(e)) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); go(e.key === 'ArrowLeft' ? -1 : 1); return; }
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter on a focused button presses that button, as it should.
      if (e.composedPath()[0]?.tagName === 'BUTTON') return;
      const ok = card.querySelector('.foot .primary'); if (!ok || ok.disabled) return;
      e.preventDefault(); e.stopPropagation(); ok.click();
    }
  }, true);

  // ---- when to look again --------------------------------------------------
  document.addEventListener('agentation-kit:agent-work', (e) => { const was = work?.state; work = e.detail; if (work?.state === 'complete' && was !== 'complete') refresh(); else if (state !== 'card') paint(); });
  // A new Send starts a new round: the last summary is over.
  document.addEventListener('agentation-kit:round-done', () => { if (state === 'done') { state = 'idle'; queue = []; verdicts = new Map(); } paint(); });
  // The page's freshness changed: the strip and an idle card say Reload or stop saying it.
  document.addEventListener('agentation-kit:fresh', () => { if (state === 'card') { if (!replying && !busy) { paintCard(); placeCard(); } } else paint(); });
  document.addEventListener('agentation-kit:route', () => { soon(); if (!card.hidden) { paintCard(); reveal(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  setInterval(() => { if (document.visibilityState === 'visible' && state !== 'card') refresh(); }, 30000);
  work = window.__AGENTATION_KIT_AGENT_WORK_STATUS__ || null;
  refresh();

  return {
    /** How many changes are waiting to be checked. */
    count: () => checkable().length,
    /** Open the card, at a note when given one. False when there is nothing to check. */
    start,
    stop,
    refresh,
    get state() { return state; },
    /** After a reload that asked for it (fresh.js takeResume): open the card, at `id` when given. */
    resume(id) { resumeAt = id || true; refresh(); },
    /** A stream frame (entry.jsx): a note closing or reopening is worth a re-read. */
    ingest(payload) { if (payload?.id && payload.author !== 'agent' && payload.status) soon(); },
  };
}
