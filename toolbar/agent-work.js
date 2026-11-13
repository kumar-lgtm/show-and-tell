import { createHost, slotPanel, slotFront, placeNearToolbar, reserveSurface, scheduleInsets, Z, statusLine, focusFirst, deepActive, CLOSE_ICON } from './ui.js';

/**
 * Opt-in local listener indicator, docked beside the toolbar.
 *
 * Routine states (listening, offline) are a small drawn icon with a tooltip:
 * feedback is kept either way, so offline is calm rather than alarming. Work,
 * completion and problems add concise text. Clicking opens a panel in the
 * toolbar's panel slot with the full message, optional step progress, an
 * optional "what changed" list, the queue state and Reload preview.
 *
 * Status shape: {state, message, updatedAt, roundTs, queued} plus OPTIONAL
 * {steps:[{label,state}], changes:[{noteId,summary,status}]}. Absent optional
 * fields keep the plain behaviour. All text is set with textContent.
 */

const ICONS = {
  // A terminal prompt: the local agent process.
  listening: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',
  // Same process, idle: the prompt is replaced by a flat line. Calm, not an error.
  offline: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 12h7"/>',
  working: '<circle cx="12" cy="12" r="8" opacity=".25"/><path d="M20 12a8 8 0 0 0-8-8"/>',
  complete: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',
  'needs-input': '<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2M12 13.6h.01"/>',
  failed: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  queued: '<path d="M4 8h16M4 12h16M4 16h10"/>',
  'step-done': '<path d="m6 12.5 4 4L18 8"/>',
  'step-active': '<circle cx="12" cy="12" r="7" opacity=".25"/><path d="M19 12a7 7 0 0 0-7-7"/>',
  'step-pending': '<circle cx="12" cy="12" r="6.5"/>',
  'step-failed': '<path d="m7 7 10 10M17 7 7 17"/>',
  resolved: '<path d="m6 12.5 4 4L18 8"/>',
  rejected: '<path d="M6 12h12"/>',
};
const icon = (key, cls = '') => `<svg class="${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[key] || ICONS.listening}</svg>`;
const TITLES = { listening: 'Agent listening', working: 'Agent working', complete: 'Changes ready', 'needs-input': 'Agent needs input', failed: 'Agent run failed', offline: 'Agent listener offline' };
const STATES = new Set(Object.keys(TITLES));
const STEP_STATES = new Set(['done', 'active', 'pending', 'failed']);
const CHANGE_STATES = new Set(['resolved', 'needs-input', 'rejected']);
// The inbox's words for the same outcomes (review-tools.js statusWord): a note the agent set aside says so in both.
const CHANGE_WORDS = { resolved: 'Done', 'needs-input': 'Needs your input', rejected: 'Set aside' };
const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

/** Bounded, whitelisted copy of the optional fields. Malformed entries are skipped. */
/**
 * The panel's body under its heading, or '' when it would only repeat it.
 * "Changes ready" over "Changes ready." said the same thing twice (UX review
 * 5, #15): the same words, whatever the case or trailing punctuation, are
 * dropped, and so is listening's or offline's own status line.
 */
export function bodyText(title, message, state) {
  const m = String(message || '').trim();
  const norm = (t) => String(t || '').trim().replace(/[\s.!?…:]+$/u, '').toLowerCase();
  if (!m || norm(m) === norm(title)) return '';
  if (statusLine(title, m) === m && /offline|listening/i.test(m) && (state === 'offline' || state === 'listening')) return '';
  return m;
}

export function cleanSteps(steps) {
  if (!Array.isArray(steps)) return null;
  const out = steps.slice(0, 8).filter((s) => s && typeof s.label === 'string' && s.label.trim())
    .map((s) => ({ label: clip(s.label, 120), state: STEP_STATES.has(s.state) ? s.state : 'pending' }));
  return out.length ? out : null;
}
export function cleanChanges(changes) {
  if (!Array.isArray(changes)) return null;
  const out = changes.slice(0, 12).filter((c) => c && typeof c.summary === 'string' && c.summary.trim())
    .map((c) => ({ noteId: clip(c.noteId, 128), summary: clip(c.summary, 200), status: CHANGE_STATES.has(c.status) ? c.status : 'resolved' }));
  return out.length ? out : null;
}

export function createAgentWork({ endpoint, hint: idleHint, livePage = false }) {
  const ui = createHost(`
    [hidden]{display:none!important}
    :host{--aw-accent:#FF9C87}
    :host([data-sk-theme=light]){--aw-accent:var(--sk-accent)}
    .activity{position:fixed;right:16px;bottom:20px;z-index:${Z.notice};display:flex;align-items:center;gap:7px;box-sizing:border-box;min-width:36px;height:36px;max-width:calc(100vw - 32px);border:0;border-radius:18px;padding:0 10px;background:var(--sk-surface);color:var(--sk-text-2);box-shadow:var(--sk-ring);cursor:pointer;font:500 12px/1 var(--sk-font);transition:color .15s ease}
    .activity:hover{color:var(--sk-text)}
    .activity:focus-visible{outline:2px solid var(--sk-focus);outline-offset:3px}
    .activity svg{flex:none;width:16px;height:16px}
    .activity[data-state=offline]{color:var(--sk-text-3);box-shadow:0 0 0 1px var(--sk-hairline);background:var(--sk-surface)}
    .activity[data-state=working]{color:var(--sk-text)}
    .activity[data-state=working] svg,.activity[data-state=complete] svg{color:var(--aw-accent)}
    .activity[data-state=complete],.activity[data-state=needs-input],.activity[data-state=failed]{color:var(--sk-text)}
    .activity .label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:240px;line-height:1.3}
    .activity .count{font-variant-numeric:tabular-nums;color:var(--sk-text-2);margin-right:2px}
    .spin{animation:agent-work-turn 1s linear infinite;transform-origin:50% 50%}
    @keyframes agent-work-turn{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.spin{animation:none}}
    @media(pointer:coarse){.activity{height:44px;min-width:44px;border-radius:22px;padding:0 13px}}
    .work-panel{width:320px;max-width:calc(100vw - 24px);box-sizing:border-box;display:flex;flex-direction:column}
    .work-panel .hd{padding:4px 4px 4px 12px;min-height:44px}
    .work-panel .hd svg{width:16px;height:16px;flex:none}
    .work-panel .hd[data-state=working] .state,.work-panel .hd[data-state=complete] .state{color:var(--aw-accent)}
    .work-panel .hd strong{flex:1}
    .work-panel .body{padding:12px;overflow:auto;min-height:0}
    .work-panel p{margin:0 0 10px;overflow-wrap:anywhere;line-height:1.5}
    .work-panel .msg{font-size:13px;color:var(--sk-text)}
    .work-panel h3{margin:12px 0 6px;font-size:12px;font-weight:600;color:var(--sk-text-2)}
    .work-panel ol,.work-panel ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
    .work-panel li{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;font-size:12.5px;line-height:1.45;overflow-wrap:anywhere}
    .work-panel li svg{width:16px;height:16px;margin-top:1px}
    .work-panel li[data-state=done],.work-panel li[data-state=pending]{color:var(--sk-text-2)}
    .work-panel li[data-state=pending] svg{color:var(--sk-text-3)}
    .work-panel li[data-state=active]{color:var(--sk-text);font-weight:500}
    .work-panel li[data-state=active] svg,.work-panel li[data-state=resolved] svg{color:var(--aw-accent)}
    .work-panel li small{display:block;color:var(--sk-text-3);font-size:12px}
    .callout{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;background:var(--sk-raised);border-radius:6px;padding:8px 10px;margin:12px 0 0;font-size:12.5px;line-height:1.45}
    .callout svg{width:16px;height:16px;margin-top:1px;color:var(--sk-text-2)}
    .work-panel .hint{font-size:12px;color:var(--sk-text-3);margin:12px 0 0}
    .work-panel .actions{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--sk-hairline)}
    .work-panel .actions button{min-height:36px}
    .work-panel .actions .secondary{font:inherit;font-size:12.5px;color:var(--sk-text);background:var(--sk-raised);border:1px solid var(--sk-hairline);border-radius:6px;padding:7px 12px;cursor:pointer}
    .work-panel .actions .secondary:hover{background:var(--sk-hover)}
    .work-panel button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    @media(pointer:coarse){.work-panel .actions button{min-height:44px;min-width:44px}}
  `);
  ui.host.dataset.agentWorkUi = '';
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

  const badge = el('button', 'activity'); badge.type = 'button'; badge.hidden = true;
  const glyph = el('span'); glyph.setAttribute('aria-hidden', 'true'); glyph.style.display = 'contents';
  const label = el('span', 'label');
  badge.append(glyph, label);
  badge.setAttribute('aria-haspopup', 'dialog'); badge.setAttribute('aria-expanded', 'false'); badge.setAttribute('aria-controls', 'agent-work-panel');
  const live = el('span'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
  Object.assign(live.style, { position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clipPath: 'inset(50%)' });

  const panel = el('section', 'panel work-panel'); panel.id = 'agent-work-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Agent activity');
  const hd = el('div', 'hd'); const hdIcon = el('span'); hdIcon.style.display = 'contents'; const heading = el('strong', 'sk-title');
  const x = el('button', 'x sk-x'); x.type = 'button'; x.innerHTML = CLOSE_ICON; x.setAttribute('aria-label', 'Close agent activity'); x.title = 'Close';
  hd.append(hdIcon, heading, x);
  const body = el('div', 'body');
  const text = el('p', 'msg');
  const stepsHead = el('h3', '', 'Progress'); const steps = el('ol');
  const changesHead = el('h3', '', 'What changed'); const changes = el('ul');
  const queue = el('div', 'callout'); queue.innerHTML = icon('queued'); const queueText = el('span', '', 'Your next round is queued. One agent works at a time.'); queue.append(queueText);
  const recording = el('div', 'callout'); recording.innerHTML = icon('listening'); recording.append(el('span', '', 'You are recording voice feedback. Stop and save it before reloading; reloading ends the recording.'));
  const hint = el('p', 'hint');
  body.append(text, stepsHead, steps, changesHead, changes, queue, recording, hint);
  const actions = el('div', 'actions');
  const close = el('button', 'secondary', 'Close'); close.type = 'button';
  const reload = el('button', 'primary', 'Reload preview'); reload.type = 'button'; reload.hidden = true;
  reload.onclick = () => { if (!recordingNow()) location.reload(); };
  actions.append(close, reload);
  panel.append(hd, body, actions);
  ui.root.append(badge, live, panel);
  reserveSurface(badge, 'bottom');

  const slot = slotPanel('agent-work', (visible) => {
    panel.hidden = !visible; badge.setAttribute('aria-expanded', String(visible));
    // Focus goes into the panel, so Esc and Tab work from where the reviewer is.
    // A frame later, so only if it isn't in the panel already: a control focused
    // in that frame (a quick Tab, a test) must not be pulled back to the close icon.
    if (visible) requestAnimationFrame(() => { placeNearToolbar(panel, 320); if (!panel.contains(deepActive())) x.focus({ preventScroll: true }); });
  });
  // On the bar (review-tools.js data-review=agent) when the toolbar is there;
  // the pill beside it is only the fallback for a page without one.
  // Collapsed, the bar shows none of its buttons, so the pill comes back. Open,
  // the bar owns the status, even where a phone shows it only with news.
  const docked = () => { const b = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"] [data-review=agent]'); return b && !b.hidden ? b : null; };
  // Focus back where the panel came from: the bar's agent button, else the
  // pill. A phone's bar shows the agent only with news, so there the inbox.
  const hide = () => { slot.want(false); focusFirst(docked(), badge, '[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"] [data-review=inbox]'); };
  close.onclick = hide; x.onclick = hide;
  // Window capture: the toolbar's own document-level Escape handling must not
  // swallow the key while focus is inside this dialog.
  // Esc closes it from anywhere except another field being typed in.
  const onKey = (e) => { if (e.key !== 'Escape' || panel.hidden) return; const t = e.composedPath()[0]; if (!e.composedPath().includes(panel) && t instanceof Element && t.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')) return; e.stopPropagation(); hide(); };
  addEventListener('keydown', onKey, true);
  badge.onclick = () => slot.want(panel.hidden, { bump: true });

  const recordingNow = () => !!window.__AGENTATION_KIT_VOICE_RECORDING__ && window.__AGENTATION_KIT_VOICE_KIND__ === 'session';

  // Dock beside the toolbar shell: left of it when there is room, else right.
  // The label shrinks, then disappears, before the pill would leave the screen.
  let placing = 0, observed = null;
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => place()) : null;
  function place() {
    if (placing) return;
    placing = requestAnimationFrame(() => {
      placing = 0;
      const shell = document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]');
      if (ro && shell && observed !== shell) { if (observed) ro.unobserve(observed); ro.observe(shell); observed = shell; }
      const bar = shell?.getBoundingClientRect();
      badge.style.display = docked() ? 'none' : '';
      const h = badge.getBoundingClientRect().height || 36, gap = 8;
      if (!bar || !bar.width) { Object.assign(badge.style, { left: 'auto', right: '16px', top: 'auto', bottom: '20px' }); label.style.maxWidth = ''; return; }
      // Centre on the bar's bottom row (a narrow open tray adds a row above it).
      const rowCentre = bar.bottom - Math.min(bar.height, 56) / 2;
      const top = Math.round(Math.max(12, Math.min(innerHeight - h - 12, rowCentre - h / 2)));
      const leftRoom = bar.left - gap - 12, rightRoom = innerWidth - bar.right - gap - 12;
      const onLeft = leftRoom >= Math.min(120, rightRoom) || leftRoom >= 44;
      const room = Math.max(0, onLeft ? leftRoom : rightRoom);
      // On a phone the bar leaves no room for words beside it. While there is
      // something to say and nothing else is open above the bar, the pill
      // stands on the bar's left edge instead, so progress stays readable.
      const busy = !!slotFront() || !!window.__AGENTATION_KIT_VOICE_RECORDING__;
      if (room < 110 && !label.hidden && !busy) {
        label.style.maxWidth = Math.max(0, Math.min(280, bar.width - 44)) + 'px';
        Object.assign(badge.style, { left: Math.round(Math.max(12, bar.left)) + 'px', right: 'auto', top: Math.round(bar.top - h - gap) + 'px', bottom: 'auto' });
        if (!panel.hidden) placeNearToolbar(panel, 320);
        return;
      }
      label.style.maxWidth = room >= 110 ? Math.min(240, room - 44) + 'px' : '0px';
      Object.assign(badge.style, onLeft
        ? { left: 'auto', right: Math.round(innerWidth - bar.left + gap) + 'px', top: top + 'px', bottom: 'auto' }
        : { left: Math.round(bar.right + gap) + 'px', right: 'auto', top: top + 'px', bottom: 'auto' });
      if (!panel.hidden) placeNearToolbar(panel, 320);
      scheduleInsets();
    });
  }
  addEventListener('resize', place);
  document.addEventListener('agentation-kit:toolbar-position', place);
  document.addEventListener('agentation-kit:slot', place);
  // Opening or collapsing the bar moves the status between the pill and the bar.
  const dockTimer = setInterval(() => { const want = docked() ? 'none' : ''; if (badge.style.display !== want) place(); }, 400);

  let status = { state: 'offline', message: 'Checking local listener.' };
  let lastAnnouncement = '';
  let fetching = false;
  let alive = true;

  function paint(raw) {
    const next = { ...raw, state: STATES.has(raw?.state) ? raw.state : 'offline', message: clip(raw?.message, 400) };
    const stepList = cleanSteps(raw?.steps), changeList = cleanChanges(raw?.changes);
    status = next;
    window.__AGENTATION_KIT_AGENT_WORK_STATUS__ = status;
    const s = status.state, title = TITLES[s];
    badge.hidden = false; badge.dataset.state = s;
    glyph.innerHTML = icon(s, s === 'working' ? 'spin' : '');
    const active = stepList?.find((x) => x.state === 'active');
    const progress = stepList && s === 'working' ? `${stepList.filter((x) => x.state === 'done').length + (active ? 1 : 0)} of ${stepList.length}` : '';
    const words = s === 'working' ? (active?.label || status.message || 'Working') : s === 'complete' ? 'Changes ready' : s === 'needs-input' || s === 'failed' ? title : '';
    label.replaceChildren(); if (progress) label.append(el('span', 'count', progress));
    label.append(words); label.hidden = !words;
    const queuedText = status.queued ? ' Another round is queued.' : '';
    const message = `${statusLine(title, status.message)}${queuedText}`.trim();
    badge.title = message; badge.setAttribute('aria-label', message);
    // Announce state changes, not every progress line: a polite region that
    // speaks every heartbeat would talk over the reviewer.
    const announce = `${title}.${queuedText}${s === 'complete' ? ' Reload the preview to review the changes.' : ''}`;
    if (lastAnnouncement !== announce) { live.textContent = announce; lastAnnouncement = announce; }

    hd.dataset.state = s; hdIcon.innerHTML = icon(s, s === 'working' ? 'state spin' : 'state'); heading.textContent = title;
    // The heading already says the state: drop a message that only repeats it.
    text.textContent = bodyText(title, status.message, s);
    text.hidden = !text.textContent;
    steps.replaceChildren(); stepsHead.hidden = steps.hidden = !stepList;
    for (const step of stepList || []) {
      const li = el('li'); li.dataset.state = step.state;
      li.innerHTML = icon('step-' + step.state, step.state === 'active' && s === 'working' ? 'spin' : '');
      const t = el('span'); t.append(el('span', '', step.label));
      if (step.state !== 'pending' && step.state !== 'done') t.append(el('small', '', step.state === 'active' ? 'In progress' : 'Failed'));
      li.append(t); li.setAttribute('aria-label', `${step.label}: ${({ done: 'done', active: 'in progress', pending: 'not started', failed: 'failed' })[step.state]}`);
      steps.append(li);
    }
    changes.replaceChildren(); changesHead.hidden = changes.hidden = !changeList;
    for (const c of changeList || []) {
      const li = el('li'); li.dataset.state = c.status;
      li.innerHTML = icon(c.status === 'needs-input' ? 'needs-input' : c.status);
      const t = el('span'); t.append(el('span', '', c.summary)); t.append(el('small', '', CHANGE_WORDS[c.status])); li.append(t);
      changes.append(li);
    }
    queue.hidden = !status.queued;
    const rec = recordingNow();
    recording.hidden = !(rec && s === 'complete');
    hint.textContent = s === 'offline' ? 'Your feedback is saved. Start the local listener to apply it automatically, or ask your agent to read the round.'
      : s === 'failed' ? 'Your notes are kept. Send to agent again to retry.'
      : s === 'needs-input' ? 'Open the inbox to answer the agent.'
      : (typeof idleHint === 'string' && idleHint.trim() ? idleHint.trim().slice(0, 200) : 'Send to agent starts a local run. Changes stay local for review.');
    // A live page repaints itself when a run finishes; Reload would only end a recording.
    reload.hidden = livePage || s !== 'complete'; reload.disabled = rec;
    reload.title = rec ? 'Stop recording first: reloading ends it' : 'Reload to see the changes';
    place();
    document.dispatchEvent(new CustomEvent('agentation-kit:agent-work', { detail: status }));
  }
  async function check() {
    if (!alive || fetching) return;
    fetching = true;
    try {
      const r = await fetch(`${endpoint}/agent-work`, { cache: 'no-store' });
      if (!r.ok) throw new Error();
      const data = await r.json();
      if (alive) paint(data);
    } catch { if (alive) paint({ state: 'offline', message: 'The local agent listener is not reachable. Your feedback is kept.' }); }
    finally { fetching = false; }
  }
  const onCapture = () => paint(status);
  const interval = setInterval(check, 2000);
  document.addEventListener('agentation-kit:round-done', check);
  document.addEventListener('agentation-kit:voice-capture', onCapture);
  check();
  return {
    check,
    toggle() { slot.want(panel.hidden, { bump: true }); },
    destroy() {
      alive = false; clearInterval(interval); clearInterval(dockTimer); ro?.disconnect();
      document.removeEventListener('agentation-kit:round-done', check);
      document.removeEventListener('agentation-kit:voice-capture', onCapture);
      removeEventListener('resize', place); removeEventListener('keydown', onKey, true);
      document.removeEventListener('agentation-kit:toolbar-position', place);
      document.removeEventListener('agentation-kit:slot', place);
      slot.want(false); ui.host.remove();
    },
  };
}
