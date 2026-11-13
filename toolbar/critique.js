/**
 * From the agent: the agent's critique, a decision on every note, and measured
 * checks (show-and-tell.pen chapters 9 and 10).
 *
 * The usual direction is reviewer → agent: someone clicks an element, leaves a
 * note, an agent reads it. Critique is the same loop run backwards: the agent
 * leaves ITS observations, and the reviewer decides each one.
 *
 *   - Fix it moves the note into the reviewer's round as their own note
 *     (`fromCritique`), so the agent gets an instruction back, not its own
 *     observation. Not an issue closes it with an optional reason the agent
 *     reads. Discuss is the reply thread. A decided note shows what happened,
 *     with Undo, for a few seconds, then leaves; its marker fades.
 *   - A note can carry a suggested change (text, or one CSS property). Before /
 *     After previews it live on the page, outlined and labelled as not saved;
 *     Use this change drops it into the reviewer's drafts. Fix it my way is
 *     Fix it in their own words.
 *   - Run checks (measure.js) measures tap targets, clipped text and contrast in
 *     this browser. Measured findings come first, then what couldn't be
 *     measured, then the agent's notes as Opinion. They are never mixed.
 *
 * The panel opens only from the bar (review-tools.js listens for
 * `agentation-kit:critique-count` and shows the count), never by itself, and it
 * sits in the panel slot like every other panel (ui.js), so it never covers the
 * page: a side sheet on a wide screen, a bottom sheet of at most 55% on a phone.
 *
 * ⚠️ WHY THIS IS OUR OWN LAYER AND NOT THE TOOLBAR'S MARKERS
 * `GET /sessions/:id` is what the upstream toolbar calls on join, and it does
 * `setAnnotations(session.annotations)`: it adopts whatever comes back as its
 * own notes. Handing it a critique would render the agent's opinion as the
 * reviewer's, deletable from a UI whose delete would destroy the agent's work.
 * So the server serves reviewer rows to the toolbar, this layer asks for
 * `?author=agent`, and the two never mix. A Fix it is the one crossing, and it
 * is made server side as a NEW reviewer row (POST /annotations/:id/decision).
 *
 * ⚠️ WHY CSS SELECTORS AND NOT COORDINATES
 * An agent writing over HTTP has no viewport and cannot invent a marker's x/y
 * honestly. So it sends a selector, and the reviewer's browser, the only one
 * whose geometry was ever meaningful, resolves it here, live. A note with no
 * selector, or one that matches nothing, is a page-level observation: listed
 * without a marker rather than pinned to an arbitrary element.
 *
 * ⚠️ Measured findings are stored only when the reviewer picks Fix it (9.4):
 * checks stay local and cheap, and the agent sees a measured fact with its
 * number (`source: "measured"`, `measure`), never every pass of every run.
 * Not an issue on one is remembered in this browser only.
 */
import { FONT } from "./brand.js";
import { createHost, markChrome, markerStyle, markerLayer, layoutMarkers, markersShown, threadCSS, paintThread, failMessage, slotPanel, placeNearToolbar, releaseSurface, setWorking, clearWorking, Z, deepActive, focusLost, focusFirst, othersOpen, CLOSE_ICON } from "./ui.js";
import { sessionKeyOf } from "./page-key.js";
import { ensureReviewer, reviewerName } from "./reviewer.js";
import { viewport } from "./viewport.js";
import { runChecks, listWidths, SIZES } from "./measure.js";

const SEVERITY_WORD = { blocking: "Blocking", important: "Important", suggestion: "Suggestion" };
/** How long a decided note stays in the list with its Undo. */
export const UNDO_MS = 6000;
/**
 * ⚠️ Must NOT start with "agentation": the KV bridge mirrors every `agentation*`
 * key into the project's SHARED store. Dismissing a measured finding is personal.
 */
const DISMISSED = "sk-measured-dismissed";

const ICONS = {
  alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v4.8M12 15.9h.01"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  chat: '<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.3A7.5 7.5 0 1 1 20 11.5z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  gauge: '<path d="M5.2 16.5a7.5 7.5 0 1 1 13.6 0"/><path d="M12 13.5l3.2-3.6"/>',
  rerun: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',
  text: '<path d="M5 6h14M12 6v13M9 19h6"/>',
  tweak: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  passed: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.4 2.4 4.6-4.9"/>',
  moved: '<path d="M6 5v6a4 4 0 0 0 4 4h9M15.5 11.5 19 15l-3.5 3.5"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  unknown: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.5a2.4 2.4 0 1 1 3.3 2.2c-.6.3-1 .8-1 1.5M12 16.2h.01"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ""}</svg>`;

const sev = (a) => (a.severity === "blocking" || a.severity === "suggestion" ? a.severity : "important");
const quote = (s) => `“${s}”`;
const collapse = (s) => String(s || "").replace(/\s+/g, " ").trim();

/**
 * The agent's notes are numbered A1, A2… in the order they were made, decided
 * ones included, so a number never moves: not after Fix it, not after a
 * reload. (Sorting by severity renumbered the list on every reload, and the
 * "1" on the page changed meaning.) The sort is stable, so notes from one
 * critique, which share a creation second, keep the server's order.
 */
export function numberNotes(notes) {
  const at = (a) => Number(a.createdAt ?? a.timestamp ?? 0);
  const order = [...notes].sort((a, b) => at(a) - at(b));
  return new Map(order.map((a, i) => [a.id, `A${i + 1}`]));
}

/** The list in the order its labels read: A1, A2, A3. Unnumbered notes go last. */
export function byNumber(list, numbers) {
  const n = (a) => Number(String(numbers.get(a.id) || "").slice(1)) || Infinity;
  return [...list].sort((a, b) => n(a) - n(b));
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function btn(cls, text, onClick, label) {
  const b = el("button", cls, text);
  b.type = "button";
  if (label) b.setAttribute("aria-label", label);
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(e); });
  return b;
}

export function createCritique({ endpoint, opinion = true, toolbar = true }) {
  let items = [];             // the agent's undecided notes, A1 first
  let earlier = [];           // notes decided before this load (Undo stays available)
  let earlierOpen = false;
  let ui = null;
  let markers = new Map();    // id -> marker element on the page
  let numbers = new Map();    // id -> its label, "A1": stable, from creation order
  const decided = new Map();  // id -> {what, undo, timer}: shown with Undo, then gone
  const forms = new Map();    // id -> "reason" | "way": an open text box on a row
  const formText = new Map(); // "id:reason" | "id:way" -> what was typed there, kept across renders and Esc
  let threadId = null;        // the row whose reply thread is open
  let preview = null;         // {id, mode: "before"|"after", restore}
  let checks = null;          // the last Run checks result
  let running = false;
  let showPassed = false;
  let launcher = null;

  // ---- data -------------------------------------------------------------

  async function load() {
    if (!endpoint || !opinion) { render(); return; }
    try {
      // Resolve the session the same way everything else does — by URL, so a
      // reviewer who refreshes lands on the same one rather than forking it.
      const sres = await fetch(`${endpoint}/sessions?author=agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: window.location.href, ...(sessionKeyOf(window.location.href) ? { pageKey: sessionKeyOf(window.location.href) } : {}) }),
      });
      if (!sres.ok) return;
      const session = await sres.json();
      const all = (session.annotations || []).filter((a) => a.author === "agent");
      numbers = numberNotes(all);
      const next = all.filter((a) => a.status !== "resolved" && a.status !== "dismissed");
      // A note decided here stays in the list (with its Undo) until its timer ends.
      const keep = items.filter((a) => decided.has(a.id) && !next.some((n) => n.id === a.id));
      // By number, A1 first, the way the markers on the page read. Worst first
      // listed A2, A1, A3; the severity word on each row and the counts in the
      // summary still say which is blocking.
      items = byNumber([...next, ...keep], numbers);
      // Decided before this page load: listed at the end, folded, each with
      // Undo, so a decision can still be taken back after a reload.
      earlier = byNumber(all.filter((a) => (a.status === "resolved" || a.status === "dismissed") && a.decision && a.decision.decision !== "discuss" && !decided.has(a.id)), numbers);
      render();
    } catch { /* offline, or agentation off — nothing to show */ }
  }

  /** Resolve a selector to the page element it names, or null. */
  function find(sel) {
    if (!sel) return null;
    try {
      const n = document.querySelector(sel);
      // Our own furniture is not part of the page under review.
      if (!n || n.closest("[data-sk-no-edit], #agentation-root, [data-feedback-toolbar]")) return null;
      return n;
    } catch { return null; } // an invalid selector is a miss, not a crash
  }
  const anchorOf = (a) => find(a.selector || a.elementPath);

  // Use this change on a text suggestion puts an Edit text draft in this
  // browser, which outlives a reload. Which draft belongs to which note is
  // kept beside it, so Undo from the Decided list (after a reload) takes the
  // draft back too, instead of leaving the undone change queued for Send.
  // Our keys are not `agentation*` ones: those ride the shared KV.
  //
  // A draft is per element, so a second suggestion on the same paragraph
  // takes over the first one's draft. Each note keeps the draft it filled and
  // the text it put there, and each draft names the last note that filled it:
  // Undo takes a draft back only for that note, and only while it still says
  // that note's text (Codex re-reviews: a newer suggestion, even one with the
  // same words, keeps its draft).
  //
  // Taking the draft back is Edit text's own call (edit-mode.js
  // withdrawDraft): at any breakpoint, and only this reviewer's draft.
  const DRAFT_OF = "feedback-critique-draft:";
  const DRAFT_BY = "feedback-critique-draft-by:";
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
    drop: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };
  function rememberDraft(noteId, draftId, text) {
    if (!draftId) { store.drop(DRAFT_OF + noteId); return; }
    store.set(DRAFT_OF + noteId, JSON.stringify({ id: draftId, text }));
    store.set(DRAFT_BY + draftId, noteId);
  }
  function takeDraftBack(note) {
    const noteId = note.id;
    const raw = store.get(DRAFT_OF + noteId);
    store.drop(DRAFT_OF + noteId);
    if (!raw) return;
    // A bare id is the record's first shape: the text is the note's own suggestion.
    let rec = null;
    try { rec = JSON.parse(raw); } catch { rec = null; }
    if (!rec || typeof rec !== "object") rec = { id: raw, text: note.suggestion?.to };
    // The first shape kept no owner: then the text alone decides.
    const by = store.get(DRAFT_BY + rec.id);
    if (!rec.id || (by && by !== noteId)) return;
    // Edit text decides the rest: the draft must be this reviewer's (drafts
    // ride the shared KV) and still say this note's words, at any breakpoint.
    window.__AGENTATION_KIT_EDIT__?.withdrawDraft?.(rec.id, rec.text);
    store.drop(DRAFT_BY + rec.id);
  }

  const dismissedMeasures = () => { try { return new Set(JSON.parse(localStorage.getItem(DISMISSED) || "[]")); } catch { return new Set(); } };
  const measureKey = (f) => `${location.pathname}|${f.check}|${f.selectors[0]}`;
  function rememberDismissed(f, on) {
    const set = dismissedMeasures();
    if (on) set.add(measureKey(f)); else set.delete(measureKey(f));
    try { localStorage.setItem(DISMISSED, JSON.stringify([...set].slice(-200))); } catch { /* private mode */ }
  }
  const measuredRows = () => {
    if (!checks) return [];
    const gone = dismissedMeasures();
    return checks.findings.filter((f) => !gone.has(measureKey(f)) || decided.has(f.id));
  };

  const open = (a) => !decided.has(a.id);
  /** What is left to decide: the badge on the bar and the header's count. */
  const undecided = () => items.filter(open).length + measuredRows().filter(open).length;

  let lastCount = -1;
  function announceCount() {
    const count = undecided();
    if (count === lastCount) return;
    lastCount = count;
    document.dispatchEvent(new CustomEvent("agentation-kit:critique-count", { detail: { count } }));
    window.__AGENTATION_KIT_CRITIQUE_COUNT__ = count;
  }

  // ---- the panel ----------------------------------------------------------

  const slot = slotPanel("critique", (visible) => {
    if (!ui) return;
    ui.panel.hidden = !visible;
    if (visible) { render(); requestAnimationFrame(place); }
    else { stopPreview(); outline(null); releaseSurface(ui.panel); }
    launcher?.setAttribute("aria-expanded", String(visible));
  });
  const place = () => { if (ui && !ui.panel.hidden) placeNearToolbar(ui.panel, 384); };

  function build() {
    // Only what is specific to this panel. Surface, text scale, radii and the
    // theme mirror come from ui.js. One accent (the toolbar's blue): severity
    // is an icon and a word, never a second colour scheme.
    const { host, root, el: byId } = createHost(`
      .panel { display: flex; flex-direction: column; --sk-danger: #f0797c; --sk-hairline-2: rgba(255,255,255,0.16); }
      :host([data-sk-theme=light]) .panel { --sk-danger: #cd2b31; --sk-hairline-2: rgba(0,0,0,0.16); }
      .panel[hidden] { display: none; }
      .hd { flex: none; gap: 8px; padding: 11px 12px; }
      .hd .sub { font-size: 12px; font-weight: 400; color: var(--sk-text-3); }
      svg { width: 16px; height: 16px; flex: none; }
      .bar { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--sk-hairline); font-size: 12px; color: var(--sk-text-2); }
      .bar .grow { flex: 1; min-width: 0; display: flex; gap: 7px; align-items: center; }
      button.sec { font: inherit; font-size: 12.5px; font-weight: 600; color: var(--sk-text); background: transparent; border: 0;
        box-shadow: inset 0 0 0 1px var(--sk-hairline-2); border-radius: 6px; padding: 6px 11px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; white-space: nowrap; }
      button.sec:hover { background: var(--sk-hover); }
      button.sec[disabled] { opacity: .45; cursor: default; background: transparent; }
      button.ghost { font-size: 12.5px; font-weight: 500; color: var(--sk-text-2); padding: 6px 10px; }
      button.primary { white-space: nowrap; }
      .list { flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: thin; }
      .group { display: flex; gap: 7px; align-items: baseline; padding: 10px 12px 4px; font-size: 12px; font-weight: 600; color: var(--sk-text); }
      .group span { font-weight: 400; color: var(--sk-text-3); }
      .group.fold { width: 100%; border: 0; border-top: 1px solid var(--sk-hairline); background: none; cursor: pointer; text-align: left; font: inherit; font-size: 12px; font-weight: 600; color: var(--sk-text-2); padding: 10px 12px; min-height: 36px; }
      .group.fold:hover { color: var(--sk-text); }
      .group.fold { display: flex; align-items: center; }
      .group.fold .chev { margin-left: auto; display: inline-flex; transition: transform .12s; }
      .group.fold[aria-expanded=true] .chev { transform: rotate(180deg); }
      @media (prefers-reduced-motion: reduce) { .group.fold .chev { transition: none; } }
      .what.earlier { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; color: var(--sk-text-2); }
      .what.earlier .num { font-weight: 600; color: var(--sk-text); min-width: 22px; }
      .what.earlier .grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (pointer: coarse) { .group.fold, .what.earlier .undo { min-height: 44px; } }
      .note { padding: 10px 12px 11px; border-bottom: 1px solid var(--sk-hairline); }
      .note.on { background: var(--sk-raised); }
      .top { display: flex; align-items: center; gap: 8px; min-height: 22px; }
      .n { flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 4px;
        border-radius: 5px; font-size: 12px; font-weight: 600; box-shadow: inset 0 0 0 1.5px var(--sk-text); color: var(--sk-text); }
      .n.page { box-shadow: inset 0 0 0 1px var(--sk-hairline-2); color: var(--sk-text-3); }
      .n svg { width: 14px; height: 14px; }
      .word { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--sk-text-2); }
      .word.blocking { color: var(--sk-danger); }
      .word.handled { color: var(--sk-text-2); }
      .word svg { width: 14px; height: 14px; }
      .top .iconbtn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; }
      .top .iconbtn[aria-expanded=true] { color: var(--sk-accent-text); }
      .txt { margin: 6px 0 0; font-size: 13px; color: var(--sk-text); overflow-wrap: anywhere; }
      .title2 { font-size: 13px; font-weight: 600; color: var(--sk-text); }
      .meta { margin-top: 4px; font-size: 12px; color: var(--sk-text-3); }
      .verbs { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .note.done .txt, .note.done .title2 { color: var(--sk-text-3); }
      .what { display: flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 12px; font-weight: 500; color: var(--sk-text-2); }
      .what .undo { margin-left: auto; color: var(--sk-accent-text); font-weight: 600; }
      .form { margin-top: 9px; }
      .form textarea { min-height: 52px; }
      .sugg { margin-top: 10px; padding: 9px 10px 10px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--sk-hairline-2); }
      .sugg .head { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--sk-text-2); }
      .seg { margin-left: auto; display: inline-flex; padding: 2px; gap: 2px; border-radius: 7px; background: var(--sk-hover); }
      .seg button { font: inherit; font-size: 12px; font-weight: 500; color: var(--sk-text-2); background: none; border: 0; border-radius: 5px; padding: 4px 10px; cursor: pointer; }
      .seg button[aria-pressed=true] { background: var(--sk-surface); color: var(--sk-text); font-weight: 600; box-shadow: 0 0 0 1px var(--sk-hairline-2); }
      .sugg .before { margin-top: 7px; font-size: 12.5px; color: var(--sk-text-3); }
      .sugg .after { margin-top: 4px; font-size: 13px; font-weight: 600; color: var(--sk-text); }
      .sugg .tw { margin-top: 7px; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; font-size: 12.5px; }
      .sugg .tw .k { color: var(--sk-text-3); }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
      .passed { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: 0; border-bottom: 1px solid var(--sk-hairline);
        background: none; color: var(--sk-text-2); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
      .passed .chev { margin-left: auto; transition: transform .12s; }
      .passed[aria-expanded=true] .chev { transform: rotate(180deg); }
      .passlist { padding: 0 12px 9px 36px; font-size: 12px; color: var(--sk-text-3); border-bottom: 1px solid var(--sk-hairline); }
      .empty { padding: 14px 12px; font-size: 12.5px; color: var(--sk-text-3); }
      .reply { margin-top: 10px; }
      .reply .row { display: flex; gap: 7px; align-items: center; margin-top: 7px; justify-content: flex-end; }
      .thread { margin-bottom: 8px; }
${threadCSS()}
      /* Phone and touch: a bottom sheet (placeNearToolbar), 44px targets, and
         the two decisions side by side at full width. */
      @media (pointer: coarse), (max-width: 640px) {
        button.primary, button.sec, button.ghost { min-height: 44px; }
        .verbs { flex-wrap: nowrap; }
        .verbs button { flex: 1 1 0; justify-content: center; }
        .verbs button.ghost { box-shadow: inset 0 0 0 1px var(--sk-hairline-2); color: var(--sk-text); }
        .seg button { min-height: 44px; min-width: 64px; }
        .seg { padding: 2px; }
        .top .iconbtn { width: 44px; height: 44px; }
        .passed { min-height: 44px; }
      }
    `);
    root.append(Object.assign(document.createElement("div"), { innerHTML: `
      <section class="panel" role="dialog" aria-label="From the agent" hidden>
        <div class="hd"><span class="title sk-title" id="title"></span><span class="sub" id="todo"></span>
          <button class="sk-x" id="close" type="button" aria-label="Close">${CLOSE_ICON}</button></div>
        <div class="bar" id="sum"></div>
        <div class="bar" id="checks"></div>
        <div class="list" id="list"></div>
      </section>` }).firstElementChild);
    byId("close").addEventListener("click", () => close());
    // The toolbar binds single-key shortcuts on document: typing here is not a shortcut.
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        // Esc in a reason or Fix it my way box closes that box only, and keeps
        // what was typed for when it opens again; the next Esc closes the
        // panel (UX review 6, N5). Focus goes to the button that opened it.
        const key = e.composedPath()[0]?.dataset?.focus || "";
        const id = key.endsWith(":form") ? key.slice(0, -5) : null;
        if (id && forms.has(id)) { focusLater(id + (forms.get(id) === "way" ? ":way" : ":decide")); forms.delete(id); render(); return; }
        close(); return;
      }
      if (e.composedPath()[0]?.matches?.("textarea")) e.stopPropagation();
    });
    return { host, root, el: byId, panel: root.querySelector(".panel") };
  }

  // ---- markers and outlines on the page -------------------------------------

  // Placement is shared with the reviewer's markers (ui.js markerLayer): one
  // pass puts every marker just outside its element's top-left corner, steps
  // markers that share a corner apart, and re-runs whenever the page reflows.
  function placeMarkers() {
    for (const [, m] of markers) m.dot.remove();
    markers = new Map();
    const shown = markersShown();
    const pin = (id, target, content, title) => {
      const rect = target.getBoundingClientRect();
      // Off-layout elements have a zero box: pinning them to (0,0) reads as a bug.
      if (!rect.width && !rect.height) return null;
      const dot = document.createElement("button");
      dot.className = "sk-crit-dot";
      dot.type = "button";
      dot.innerHTML = content;
      dot.title = title || "";
      dot.setAttribute("aria-label", title || "Note from the agent");
      dot.setAttribute("data-sk-no-edit", "");
      // A marker is chrome: clicking one opens what it points at, never starts a comment about the dot.
      markChrome(dot);
      Object.assign(dot.style, markerStyle(), {
        left: `${window.scrollX + rect.left}px`,
        top: `${window.scrollY + rect.top}px`,
        transition: "opacity .3s ease",
        opacity: decided.has(id) ? "0.3" : "1",
      });
      // Hide markers (and a collapsed bar) hide these too, as one marker system.
      dot.hidden = !shown;
      dot.addEventListener("click", () => { threadId = null; showRow(id); });
      document.body.appendChild(dot);
      markers.set(id, { dot, target });
      return dot;
    };
    if (!items.length && !measuredRows().length) { layoutMarkers(); return; }
    for (const a of items) {
      const target = anchorOf(a);
      if (!target) continue;
      pin(a.id, target, numbers.get(a.id) || "A", `${numbers.get(a.id) ? numbers.get(a.id) + ", " : ""}${SEVERITY_WORD[sev(a)]}: ${a.comment || ""}`);
    }
    for (const f of measuredRows()) {
      const target = find(f.selectors[0]);
      if (!target) continue;
      pin(f.id, target, icon("gauge").replace("<svg", '<svg width="14" height="14"'), `Measured: ${titleOf(f)}`);
    }
    layoutMarkers();
  }
  markerLayer("critique", () => [...markers].map(([id, m]) => ({ key: "crit:" + id, target: m.target, el: m.dot })));

  // One outline on the page at a time: the target of a preview, or of a
  // measured row being read. A ring and a small label, never a fill over it.
  let ring = null;
  let ringFor = null; // {selectors, label, tone}
  // The outlined target is what the reviewer is working on: the side sheet
  // moves off it rather than covering it (ui.js setWorking).
  let ringTarget = null;
  function outline(spec) {
    ringFor = spec;
    if (!spec) { ring?.remove(); ring = null; if (ringTarget) clearWorking(ringTarget); ringTarget = null; return; }
    if (!ring) {
      ring = markChrome(document.createElement("div"));
      ring.setAttribute("data-sk-no-edit", "");
      ring.className = "sk-crit-ring";
      Object.assign(ring.style, { position: "absolute", left: "0", top: "0", pointerEvents: "none", zIndex: String(Z.marker - 1) });
      document.body.append(ring);
    }
    ring.replaceChildren();
    spec.selectors.map(find).filter(Boolean).forEach((target, i) => {
      const r = target.getBoundingClientRect();
      const box = document.createElement("div");
      Object.assign(box.style, {
        position: "absolute", left: `${scrollX + r.left - 4}px`, top: `${scrollY + r.top - 4}px`,
        width: `${r.width + 8}px`, height: `${r.height + 8}px`, borderRadius: "8px",
        boxShadow: "0 0 0 2px #FF5436, 0 0 0 5px rgba(255,84,54,.18)",
        background: spec.tone === "preview" ? "rgba(255,84,54,.06)" : "transparent",
      });
      ring.append(box);
      if (spec.label && i === 0) {
        const tag = document.createElement("div");
        tag.textContent = spec.label;
        Object.assign(tag.style, {
          position: "absolute", font: "600 12px/1 " + FONT, color: "#1D1A2F", background: "#FF5436",
          padding: "5px 8px", borderRadius: "5px", whiteSpace: "nowrap",
          ...(spec.tone === "preview"
            ? { left: `${scrollX + r.left - 4}px`, top: `${Math.max(0, scrollY + r.top - 30)}px` }
            : { left: `${scrollX + r.right + 10}px`, top: `${scrollY + r.top + r.height / 2 - 11}px` }),
        });
        ring.append(tag);
      }
    });
    const first = spec.selectors.map(find).find(Boolean);
    if (ringTarget && ringTarget !== first) clearWorking(ringTarget);
    ringTarget = first || null;
    if (first) setWorking(first);
  }

  // ---- previews -------------------------------------------------------------

  function stopPreview() {
    if (!preview) return;
    try { preview.restore?.(); } catch { /* the page re-rendered it */ }
    preview = null;
    if (ringFor?.tone === "preview") outline(null);
  }

  /** The text a text suggestion replaces: its own `from`, else what the page says now. */
  function fromText(a, target) {
    if (a.suggestion.from) return a.suggestion.from;
    if (preview?.id === a.id && preview.before != null) return preview.before;
    return collapse(target?.textContent);
  }

  function setPreview(a, mode) {
    const target = anchorOf(a);
    if (!target) return;
    if (preview && preview.id !== a.id) stopPreview();
    if (preview?.id === a.id && preview.mode === mode) return;
    const s = a.suggestion;
    if (preview?.id === a.id) { try { preview.restore?.(); } catch {} }
    const before = collapse(target.textContent);
    let restore = null;
    if (mode === "after") {
      if (s.kind === "text") {
        // Swap the element's children for the new text and put the very same
        // nodes back after, so whatever owns them (React) finds them unchanged.
        const kept = [...target.childNodes];
        target.textContent = s.to;
        restore = () => target.replaceChildren(...kept);
      } else {
        // Put the whole style attribute back, not the one property: setting a
        // shorthand (padding) rewrites its longhands, and an existing
        // padding-left or padding:var(--x) would otherwise be lost.
        const attr = target.getAttribute("style");
        target.style.setProperty(s.property, s.to, "important");
        restore = () => { if (attr == null) target.removeAttribute("style"); else target.setAttribute("style", attr); };
      }
    }
    preview = { id: a.id, mode, restore, before };
    target.scrollIntoView?.({ block: "nearest" });
    outline({ selectors: [a.selector || a.elementPath], label: mode === "after" ? "Preview, not saved" : "", tone: "preview" });
    render();
  }

  // ---- decisions -------------------------------------------------------------

  async function post(path, body) {
    const res = await fetch(`${endpoint}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw Object.assign(new Error(String(res.status)), { status: res.status });
    return res.json();
  }
  /** Where the toolbar should draw the reviewer note Fix it makes: the target, measured here. */
  function noteHint(target) {
    const r = target?.getBoundingClientRect();
    return {
      ...(r && r.width ? { x: ((r.left + r.width / 2) / innerWidth) * 100, y: scrollY + r.top + Math.min(r.height / 2, 16) } : {}),
      viewport: viewport(), url: location.href,
    };
  }
  /** The round changed: the bar's Send count and the toolbar's markers catch up. */
  function roundChanged() {
    window.__AGENTATION_KIT_REVIEW__?.refresh?.();
    document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"));
  }

  let flash = "";
  /**
   * `what` is the short status shown in place of the severity ("Added to your
   * round"); `detail` (a reason) goes on the Undo line; `kind` picks the icon.
   */
  function settle(id, what, undo, { detail = "", kind = "moved" } = {}) {
    // Decided from the keyboard: focus goes to the row's Undo, the one control
    // the row still has, not the panel's close (UX review 5, #13).
    if (inRow(id)) focusLater(id + ":undo");
    clearTimeout(decided.get(id)?.timer);
    forms.delete(id); formText.delete(id + ":reason"); formText.delete(id + ":way");
    if (threadId === id) threadId = null;
    if (preview?.id === id) stopPreview();
    const timer = setTimeout(() => {
      decided.delete(id);
      items = items.filter((a) => a.id !== id);
      if (checks) checks.findings = checks.findings.filter((f) => f.id !== id);
      render();
    }, UNDO_MS);
    decided.set(id, { status: what, what: detail || what, undo, timer, kind });
    render();
  }
  async function undoDecision(id) {
    const d = decided.get(id);
    if (!d) return;
    const back = inRow(id);
    clearTimeout(d.timer);
    try { await d.undo?.(); } catch (err) { flash = failMessage(err?.status || 0, "undo"); }
    decided.delete(id);
    // Undone: back on the decision that was taken back (#13).
    if (back) focusLater(id + ":fix");
    render();
  }
  /** Focus is in this note's row. */
  const inRow = (id) => !!ui?.root.activeElement?.closest?.(`[data-id="${CSS.escape(id)}"]`);

  /** Fix it on an agent note: `extra` is {comment} (my way) or {draft} (a suggestion in my drafts). */
  async function fixNote(a, extra = {}) {
    const reviewer = await ensureReviewer();
    try {
      const out = await post(`/annotations/${a.id}/decision`, { decision: "fix", ...extra, ...(reviewer ? { reviewer } : {}), ...(extra.draft ? {} : { note: noteHint(anchorOf(a)) }) });
      if (!extra.draft) roundChanged();
      settle(a.id, extra.draft ? `In your ${extra.draft === "text" ? "Edit text" : "Tweak"} drafts` : "Added to your round", async () => {
        // The draft comes back out only once the server took the decision
        // back: a refused Undo must not leave the note decided and its
        // change gone.
        await post(`/annotations/${a.id}/decision`, { decision: "undo", ...(reviewer ? { reviewer } : {}) });
        extra.onUndo?.();
        if (out.fixNote) roundChanged();
      });
    } catch (err) { flash = failMessage(err?.status || 0, "save"); render(); }
  }
  async function notAnIssue(a, reason) {
    const reviewer = await ensureReviewer();
    try {
      await post(`/annotations/${a.id}/decision`, { decision: "not-an-issue", ...(reason ? { reason } : {}), ...(reviewer ? { reviewer } : {}) });
      settle(a.id, "Not an issue", () => post(`/annotations/${a.id}/decision`, { decision: "undo", ...(reviewer ? { reviewer } : {}) }), { detail: reason ? `Not an issue: ${reason}` : "", kind: "dismissed" });
    } catch (err) { flash = failMessage(err?.status || 0, "save"); render(); }
  }
  async function fixAllBlocking() {
    for (const a of items.filter((x) => open(x) && sev(x) === "blocking")) await fixNote(a);
  }

  /** Use this change: the suggestion goes into the reviewer's own drafts. */
  async function useChange(a) {
    const s = a.suggestion, target = anchorOf(a);
    stopPreview();
    if (s.kind === "text") {
      const editor = window.__AGENTATION_KIT_EDIT__;
      const id = target && editor?.draftText?.(target, s.to);
      if (id) { rememberDraft(a.id, id, s.to); return fixNote(a, { draft: "text", onUndo: () => takeDraftBack(a) }); }
    } else {
      // Tweak (another layer) takes a draft when it exposes `draft`; until then
      // the change travels as a Fix it note that names it exactly.
      const tweak = window.__AGENTATION_KIT_TWEAK__;
      if (target && typeof tweak?.draft === "function") {
        const handle = tweak.draft({ element: target, selector: a.selector || a.elementPath, property: s.property, from: s.from ?? getComputedStyle(target).getPropertyValue(s.property), to: s.to });
        if (handle) return fixNote(a, { draft: "tweak", onUndo: () => tweak.undraft?.(handle) });
      }
    }
    return fixNote(a, { comment: `${collapse(a.comment)} Suggested change: ${changeText(s, target)}.` });
  }
  const changeText = (s, target) => s.kind === "text"
    ? `change the text to ${quote(s.to)}`
    : `set ${s.property} to ${s.to}${s.from || target ? ` (now ${s.from || getComputedStyle(target).getPropertyValue(s.property).trim()})` : ""}`;

  // Measured findings: stored only when the reviewer picks Fix it, as their note.
  async function fixMeasured(f, { useFix = false } = {}) {
    const sessionId = window.__AGENTATION_KIT_AGENTATION_SESSION__;
    if (!endpoint || !sessionId) { flash = "Not connected to the review server yet. Try again in a moment."; render(); return; }
    const reviewer = await ensureReviewer();
    const target = find(f.selectors[0]);
    const tweak = window.__AGENTATION_KIT_TWEAK__;
    const where = checks ? `at ${listWidths(f.widths)}px` : "";
    if (useFix && target && f.suggestion && typeof tweak?.draft === "function") {
      const handle = tweak.draft({ element: target, selector: f.selectors[0], property: f.suggestion.property, from: f.suggestion.from, to: f.suggestion.to });
      if (handle) { settle(f.id, "In your Tweak drafts", () => tweak.undraft?.(handle)); return; }
    }
    const fix = useFix && f.suggestion ? ` Fix: set ${f.suggestion.property} to ${f.suggestion.to} (now ${f.suggestion.from}).` : "";
    try {
      const note = await post(`/sessions/${encodeURIComponent(sessionId)}/annotations`, {
        id: crypto.randomUUID(), kind: "feedback", intent: "fix", severity: "important",
        comment: `${titleOf(f)}${f.selectors.length > 1 ? ` (${f.selectors.length} elements)` : ""}. ${f.rule}.${fix}`,
        element: target?.tagName.toLowerCase() || "", elementPath: f.selectors[0],
        source: "measured",
        measure: { check: f.check, value: f.value, rule: f.rule, widths: f.widths, selectors: f.selectors, ...(f.detail ? { detail: f.detail } : {}), where },
        ...(useFix && f.suggestion ? { suggestion: f.suggestion } : {}),
        ...noteHint(target), ...(reviewer ? { reviewer } : {}),
      });
      roundChanged();
      settle(f.id, "Added to your round", async () => { await post(`/annotations/${note.id}/withdraw`, {}); roundChanged(); });
    } catch (err) { flash = failMessage(err?.status || 0, "save"); render(); }
  }
  function dismissMeasured(f) {
    rememberDismissed(f, true);
    settle(f.id, "Not an issue", () => rememberDismissed(f, false), { detail: "Not an issue (on this browser)", kind: "dismissed" });
  }

  /** Reply to a critique note. Answering is not deciding: push-back is a message. */
  async function sendReply(a, box, status, send) {
    const message = box.value.trim();
    if (!message || !endpoint) return;
    send.disabled = true;
    status.textContent = "Sending…";
    const name = await ensureReviewer();
    try {
      const updated = await post(`/annotations/${a.id}/reply`, { message, ...(name ? { name } : {}) });
      items = items.map((x) => (x.id === a.id ? { ...x, replies: updated.replies } : x));
      formText.delete(a.id + ":reply");
      // Recorded so the agent reads "discuss" next to the thread, not a silent note.
      post(`/annotations/${a.id}/decision`, { decision: "discuss", ...(name ? { reviewer: name } : {}) }).catch(() => {});
      render();
    } catch (err) {
      send.disabled = false;
      status.textContent = failMessage(err?.status || 0, "send");
    }
  }

  // ---- Run checks --------------------------------------------------------------

  async function check() {
    if (running) return;
    running = true;
    stopPreview(); outline(null);
    render();
    try {
      const result = await runChecks({ mark: markChrome });
      result.findings.forEach((f, i) => { f.id = `measured-${result.at}-${i}`; });
      checks = result;
      showPassed = false;
      if (ui) ui.el("list").scrollTop = 0; // the results are at the top
    } catch { flash = "Checks could not run on this page."; }
    running = false;
    render();
  }

  // ---- rendering ---------------------------------------------------------------

  function titleOf(f) {
    const who = f.selectors.length > 1 ? `${f.selectors.length} × ${quote(f.label)}` : quote(f.label);
    const be = f.selectors.length > 1 ? "are" : "is";
    if (f.check === "target") return `${who} ${be} ${f.value}`;
    if (f.check === "overflow") return `Text is ${f.how} in ${quote(f.label)}`;
    return `${who} ${f.selectors.length > 1 ? "have" : "has"} ${f.value}`;
  }
  function whereOf(f) {
    const all = SIZES.every(([w]) => f.widths.includes(w));
    const at = all ? `at all three widths${f.widths.length > 3 ? " and this one" : ""}` : `at ${listWidths(f.widths)}`;
    const bits = [f.check === "overflow" ? f.value : f.detail, at].filter(Boolean);
    return bits.join(", ").replace(/^./, (c) => c.toUpperCase()) + ".";
  }

  /** The Undo line. An opinion row already shows the status in its top line, so it adds only a reason. */
  function decidedLine(row, id, withStatus = true) {
    const d = decided.get(id);
    const what = el("div", "what");
    if (withStatus) { what.innerHTML = icon(d.kind === "dismissed" ? "passed" : "moved"); what.append(el("span", "", d.what)); }
    else if (d.what !== d.status) what.append(el("span", "", d.what));
    const u = btn("ghost undo", "Undo", () => undoDecision(id));
    u.dataset.focus = id + ":undo";
    what.append(u);
    row.append(what);
  }

  function reasonForm(row, a, onConfirm) {
    const box = el("div", "form");
    const draft = a.id + ":" + forms.get(a.id);
    const ta = el("textarea");
    ta.placeholder = forms.get(a.id) === "way" ? "How would you fix it? This goes in your round." : "Why not? Optional; the agent reads it.";
    ta.setAttribute("aria-label", forms.get(a.id) === "way" ? "Your fix" : "Reason it is not an issue");
    ta.dataset.focus = a.id + ":form";
    ta.value = formText.get(draft) || "";
    ta.addEventListener("input", () => formText.set(draft, ta.value));
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onConfirm(ta.value.trim()); } });
    const verbs = el("div", "verbs");
    // Cancel drops the words; Esc keeps them.
    verbs.append(btn("ghost", "Cancel", () => { focusLater(a.id + (forms.get(a.id) === "way" ? ":way" : ":decide")); forms.delete(a.id); formText.delete(draft); render(); }));
    verbs.append(forms.get(a.id) === "way"
      ? btn("primary", "Add to my round", () => { if (ta.value.trim()) onConfirm(ta.value.trim()); else ta.focus(); })
      : btn("sec", "Not an issue", () => onConfirm(ta.value.trim())));
    box.append(ta, verbs);
    row.append(box);
  }

  function suggestionBox(row, a) {
    const s = a.suggestion, target = anchorOf(a);
    const box = el("div", "sugg");
    const head = el("div", "head");
    head.innerHTML = icon(s.kind === "text" ? "text" : "tweak");
    head.append(el("span", "", s.kind === "text" ? "Suggested text" : "Suggested tweak"));
    if (target) {
      const seg = el("div", "seg");
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", "Preview the suggested change on the page");
      const mode = preview?.id === a.id ? preview.mode : "before";
      for (const [m, label] of [["before", "Before"], ["after", "After"]]) {
        const b = btn("", label, () => setPreview(a, m));
        b.setAttribute("aria-pressed", String(mode === m));
        seg.append(b);
      }
      head.append(seg);
    }
    box.append(head);
    if (s.kind === "text") {
      box.append(el("div", "before", fromText(a, target)), el("div", "after", s.to));
    } else {
      const tw = el("div", "tw");
      const from = s.from || (target ? getComputedStyle(target).getPropertyValue(s.property).trim() : "");
      tw.append(el("span", "k", s.property), el("span", "mono", `${from ? from + " → " : ""}${s.to}`));
      box.append(tw);
    }
    if (!target) box.append(el("div", "meta", "Its target isn't on this page, so it can't be previewed."));
    row.append(box);
  }

  function threadBox(row, a) {
    const wrap = el("div", "reply");
    const thread = el("div", "thread");
    thread.hidden = !(a.replies?.length);
    paintThread(thread, a.replies || [], "reviewer");
    const ta = el("textarea");
    ta.placeholder = "Reply: agree, push back, or ask for detail";
    ta.setAttribute("aria-label", "Reply to the agent");
    ta.dataset.focus = a.id + ":reply";
    ta.value = formText.get(a.id + ":reply") || "";
    ta.addEventListener("input", () => formText.set(a.id + ":reply", ta.value));
    const r = el("div", "row");
    const status = el("span", "status");
    const send = btn("primary", "Send reply", () => sendReply(a, ta, status, send));
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(a, ta, status, send); } });
    r.append(status, send);
    wrap.append(thread, ta, r);
    row.append(wrap);
  }

  function opinionRow(a) {
    const s = sev(a), done = decided.has(a.id);
    const row = el("article", `note${done ? " done" : ""}${threadId === a.id || preview?.id === a.id ? " on" : ""}`);
    row.dataset.id = a.id;
    const top = el("div", "top");
    // The same label as its marker, in one treatment; severity is the word beside it.
    const n = el("span", `n${markers.has(a.id) ? "" : " page"}`, numbers.get(a.id) || "");
    n.setAttribute("aria-hidden", "true");
    // Once decided, what happened replaces the severity: a handled blocker is
    // no longer blocking anything.
    const word = el("span", done ? "word handled" : `word ${s}`);
    word.innerHTML = icon(done ? (decided.get(a.id).kind === "dismissed" ? "passed" : "moved") : s === "suggestion" ? "bulb" : "alert");
    word.append(done ? decided.get(a.id).status : SEVERITY_WORD[s]);
    top.append(n, word);
    if (!done) {
      const talk = btn("iconbtn", "", () => { threadId = threadId === a.id ? null : a.id; render(); }, a.replies?.length ? `Discuss (${a.replies.length} in thread)` : "Discuss");
      talk.innerHTML = icon("chat");
      talk.setAttribute("aria-expanded", String(threadId === a.id));
      top.append(talk);
    }
    row.append(top, el("p", "txt", a.comment || ""));
    // Be specific about WHY there is no marker: a deliberate page-level note,
    // or a selector this DOM does not have (the note may be stale).
    if (!markers.has(a.id)) row.append(el("div", "meta", a.selector || a.elementPath ? "Not found on this page" : "About the whole page"));
    if (done) { decidedLine(row, a.id, false); return row; }
    if (a.suggestion) suggestionBox(row, a);
    if (forms.has(a.id)) {
      reasonForm(row, a, (text) => (forms.get(a.id) === "way" ? fixNote(a, { comment: text }) : notAnIssue(a, text)));
    } else {
      const verbs = el("div", "verbs");
      verbs.append(btn("ghost", "Not an issue", () => { forms.set(a.id, "reason"); focusLater(a.id + ":form"); render(); }));
      if (a.suggestion) {
        const way = btn("sec", "Fix it my way", () => { forms.set(a.id, "way"); focusLater(a.id + ":form"); render(); });
        way.dataset.focus = a.id + ":way";
        verbs.append(way);
        verbs.append(btn("primary", "Use this change", () => useChange(a)));
      } else {
        verbs.append(btn("primary", "Fix it", () => fixNote(a)));
      }
      tagVerbs(verbs, a.id);
      row.append(verbs);
    }
    if (threadId === a.id) threadBox(row, a);
    return row;
  }

  function measuredRow(f) {
    const done = decided.has(f.id);
    const row = el("article", `note${done ? " done" : ""}${ringFor?.id === f.id ? " on" : ""}`);
    row.dataset.id = f.id;
    const top = el("div", "top");
    const n = el("span", "n");
    n.innerHTML = icon("gauge");
    n.setAttribute("aria-hidden", "true");
    top.append(n, el("span", "title2", titleOf(f)));
    row.append(top);
    row.append(el("div", "meta", whereOf(f)), el("div", "meta", `${f.rule}.`));
    // Reading a measured row outlines its targets with the measured value.
    row.addEventListener("pointerenter", () => { if (!preview) outline({ id: f.id, selectors: f.selectors, label: f.check === "contrast" ? f.value.replace(" contrast", "") : f.value.replace(/ (tall|wide)$/, ""), tone: "measure" }); });
    row.addEventListener("pointerleave", () => { if (ringFor?.id === f.id) outline(null); });
    if (done) { decidedLine(row, f.id); return row; }
    const verbs = el("div", "verbs");
    verbs.append(btn("ghost", "Not an issue", () => dismissMeasured(f)));
    if (f.suggestion) {
      verbs.append(btn("primary", `Use ${f.suggestion.property} ${f.suggestion.to}`, () => fixMeasured(f, { useFix: true })));
    } else {
      verbs.append(btn("primary", "Fix it", () => fixMeasured(f)));
    }
    tagVerbs(verbs, f.id);
    row.append(verbs);
    return row;
  }

  function unknownRow(u) {
    const row = el("article", "note");
    const top = el("div", "top");
    const n = el("span", "n page");
    n.innerHTML = icon("unknown");
    const why = { image: "is over an image", gradient: "is over a gradient", filter: "is under a filter or blend", overlap: "sits over another element", colour: "uses a colour this browser can't read as sRGB" }[u.reason] || "can't be measured";
    top.append(n, el("span", "title2", `${quote(u.label)} ${why}`));
    row.append(top, el("div", "meta", "Its contrast can't be measured honestly here. Check it by eye."));
    return row;
  }

  // Set BEFORE render(): render focuses it. Set after, it waited for the next
  // render and focus stayed on BODY when Not an issue opened its reason field.
  let focusKey = null;
  const focusLater = (k) => { focusKey = k; };
  /**
   * A row's decisions, named for focus: its first (`:decide`) and its Fix it
   * (`:fix`, the primary, whatever its words: Use this change, Use height 44px).
   */
  function tagVerbs(verbs, id) {
    const bs = verbs.querySelectorAll("button");
    if (bs[0]) bs[0].dataset.focus = id + ":decide";
    const fix = verbs.querySelector("button.primary");
    if (fix) fix.dataset.focus = id + ":fix";
  }

  function render() {
    announceCount();
    placeMarkers();
    paintLauncher();
    if (ringFor && ringFor.tone !== "preview" && !measuredRows().some((f) => f.id === ringFor.id)) outline(null);
    if (!ui || ui.panel.hidden) return;

    // Keep what the reviewer is typing, and where, across a re-render.
    const active = ui.root.activeElement;
    const keep = active?.dataset?.focus ? { key: active.dataset.focus, start: active.selectionStart, end: active.selectionEnd } : null;
    const scroll = ui.el("list").scrollTop;


    const opinionOpen = items.filter(open);
    ui.el("title").textContent = opinion ? "From the agent" : "Checks";
    const left = undecided();
    ui.el("todo").textContent = left ? `${left} to decide` : items.length || measuredRows().length ? "All decided" : "";

    // Counts by severity, and the one action for the common case.
    const sum = ui.el("sum");
    sum.replaceChildren();
    sum.hidden = !opinion || !items.length;
    const by = { blocking: 0, important: 0, suggestion: 0 };
    for (const a of opinionOpen) by[sev(a)]++;
    const parts = Object.entries(by).filter(([, n]) => n).map(([k, n]) => `${n} ${k}`);
    const counts = el("span", "grow", parts.length ? parts.join(", ") : "Every note decided");
    sum.append(counts);
    // Only while there is something blocking left to fix.
    if (by.blocking) sum.append(btn("sec", "Fix all blocking", () => fixAllBlocking()));

    // Run checks: what was measured, where, and when.
    const bar = ui.el("checks");
    bar.replaceChildren();
    const line = el("span", "grow");
    line.innerHTML = icon("gauge");
    let words;
    if (running) words = "Measuring at this width, 390, 820 and 1440…";
    else if (!checks) words = "Measure tap targets, clipped text and contrast in this browser.";
    else {
      const ws = checks.widths.length > 1 ? listWidths(checks.widths) : `${checks.width} (this window) only`;
      words = `Checked at ${ws}, ${ago(checks.at)}`;
      if (checks.skipped.length) words += `. ${listWidths(checks.skipped.map((s) => s.width))} didn't load in a frame, so ${checks.skipped.length === 1 ? "it was" : "they were"} skipped`;
    }
    line.append(el("span", "", words));
    const run = btn("sec", running ? "Running…" : checks ? "Run again" : "Run checks", () => check());
    run.insertAdjacentHTML("afterbegin", icon("rerun"));
    run.disabled = running;
    bar.append(line, run);

    // The list: Measured, Couldn't measure, then Opinion. Never mixed.
    const list = ui.el("list");
    list.replaceChildren();
    if (flash) { list.append(el("div", "empty", flash)); flash = ""; }
    const measured = measuredRows();
    if (checks) {
      const g = el("div", "group", "Measured ");
      g.append(el("span", "", String(measured.filter(open).length)));
      list.append(g);
      for (const f of measured) list.append(measuredRow(f));
      if (!measured.length) list.append(el("div", "empty", "Nothing failed."));
      if (checks.passed) {
        const p = el("button", "passed");
        p.type = "button";
        p.innerHTML = icon("passed");
        p.append(el("span", "", checks.passed));
        p.insertAdjacentHTML("beforeend", icon("chevron").replace("<svg", '<svg class="chev"'));
        p.setAttribute("aria-expanded", String(showPassed));
        p.addEventListener("click", () => { showPassed = !showPassed; render(); });
        list.append(p);
        if (showPassed) {
          const c = checks.checked;
          list.append(el("div", "passlist", `${c.target} targets, ${c.overflow} text boxes and ${c.contrast} text colours checked across ${checks.widths.length} ${checks.widths.length === 1 ? "width" : "widths"}.`));
        }
      }
      if (checks.unknown.length) {
        const g2 = el("div", "group", "Couldn’t measure ");
        g2.append(el("span", "", String(checks.unknown.length)));
        list.append(g2);
        for (const u of checks.unknown) list.append(unknownRow(u));
      }
    }
    if (opinion) {
      if (checks) {
        const g3 = el("div", "group", "Opinion ");
        g3.append(el("span", "", String(opinionOpen.length)));
        list.append(g3);
      }
      for (const a of items) list.append(opinionRow(a));
      if (!items.length && !earlier.length) list.append(el("div", "empty", "No notes from the agent on this page."));
      if (earlier.length) {
        // The fold is re-rendered with the list: it keeps focus (focusLater),
        // and opening it brings what it opened into view. At 1280 the rows
        // opened below the panel's bottom edge, Undo clipped (F-Decided).
        const g4 = btn("group fold", `Decided ${earlier.length}`, () => { earlierOpen = !earlierOpen; focusLater("fold"); render(); if (earlierOpen) revealEarlier(); });
        g4.setAttribute("aria-expanded", String(earlierOpen));
        g4.dataset.focus = "fold";
        g4.insertAdjacentHTML("beforeend", `<span class="chev">${icon("chevron")}</span>`);
        list.append(g4);
        if (earlierOpen) for (const a of earlier) list.append(earlierRow(a));
      }
    }
    list.scrollTop = scroll;

    const moved = focusKey;
    const want = focusKey || keep?.key;
    focusKey = null;
    if (want) {
      const t = ui.root.querySelector(`[data-focus="${CSS.escape(want)}"]`);
      if (t) {
        t.focus();
        if (keep?.key === want) try { t.setSelectionRange(keep.start, keep.end); } catch { /* not a text box */ }
        // Moved there on purpose: its row comes into the list's view (#12).
        if (moved === want) (t.closest("[data-id]") || t).scrollIntoView({ block: "nearest" });
      }
    }
    // The list is rebuilt, so a focused button in it (Undo, a decision) is
    // gone: focus stays in the panel, on its close, never on the page.
    if (active && focusLost()) ui.el("close")?.focus({ preventScroll: true });

    requestAnimationFrame(place);
  }

  /** Bring the opened Decided rows into the panel's view, the last one included. */
  function revealEarlier() {
    requestAnimationFrame(() => {
      const rows = ui?.root.querySelectorAll(".what.earlier");
      if (!rows?.length) return;
      rows[rows.length - 1].scrollIntoView({ block: "nearest" });
      ui.root.querySelector("[data-focus=fold]")?.scrollIntoView({ block: "nearest" });
    });
  }

  /** A note decided before this page load: what was decided, and Undo. */
  function earlierRow(a) {
    const row = el("div", "what earlier");
    row.dataset.id = a.id;
    const d = a.decision || {};
    const said = d.decision === "fix" ? (d.draft ? "In your drafts" : "Added to your round") : `Not an issue${d.reason ? `: ${d.reason}` : ""}`;
    const n = numbers.get(a.id);
    // `numbers` already holds the marker's name ("A1"): prefixing another A read "AA1" (N2).
    row.append(el("span", "num", n || ""), el("span", "grow", `${said} · ${String(a.comment || "").slice(0, 80)}`));
    const u = btn("ghost undo", "Undo", async () => {
      // Disabling the focused Undo, then the reload removing its row, dropped
      // focus to the page. It goes to the restored note's first decision,
      // brought into view (UX review 5, #12); on a failure, back to this Undo.
      const back = ui?.root.activeElement === u;
      u.disabled = true;
      let ok = true;
      try {
        await post(`/annotations/${a.id}/decision`, { decision: "undo", ...(reviewerName() ? { reviewer: reviewerName() } : {}) });
        // Whatever the decision record says: a note decided again after an
        // Undo may not carry `draft` here, and the draft record is the truth.
        takeDraftBack(a);
        roundChanged();
      }
      catch (err) { ok = false; flash = err?.status === 409 ? "The agent already acted on that, so it can't be taken back." : failMessage(err?.status || 0, "undo"); }
      if (back) focusLater(ok ? a.id + ":decide" : a.id + ":earlier");
      // On a failure, say so and offer Undo again even when the reload that
      // follows fails too (offline): load() renders nothing then, and the
      // disabled button stayed, with no message, until something else drew
      // the panel.
      // And stop there: a reload that works redraws the panel and wiped the
      // message within a frame (a 409, when the agent already acted).
      if (!ok) { u.disabled = false; render(); return; }
      await load();
    });
    u.dataset.focus = a.id + ":earlier";
    u.setAttribute("aria-label", n ? `Undo the decision on ${n}` : "Undo the decision");
    row.append(u);
    return row;
  }

  const ago = (t) => {
    const s = Math.round((Date.now() - t) / 1000);
    return s < 45 ? "just now" : s < 3600 ? `${Math.round(s / 60)} min ago` : "earlier";
  };

  /** Scroll a row into view in the panel (a marker was clicked). */
  function showRow(id) {
    // Opened from a marker: keep the element it points at in view.
    const target = markers.get(id)?.target;
    if (target) setWorking(target);
    showPanel();
    requestAnimationFrame(() => {
      const row = ui?.root.querySelector(`[data-id="${CSS.escape(id)}"]`);
      row?.scrollIntoView({ block: "nearest" });
      row?.classList.add("on");
    });
  }

  // ---- open / close ---------------------------------------------------------------

  // Where focus goes back to when the panel closes: whatever opened it (the
  // agent or critique button, the inbox on a phone, a marker), else the bar's
  // agent buttons. Closing used to leave it on the page (F-Return).
  let opener = null;
  const BAR = "[data-agentation-toolbar] [class*=\"toolbarContainer\"][class*=\"expanded\"]";
  function showPanel() {
    const from = deepActive();
    if (from && from !== document.body && !ui?.root.contains(from)) opener = from;
    if (!ui) ui = build();
    slot.want(true, { bump: true });
    if (!slot.visible) return;
    ui.panel.hidden = false;
    render();
    requestAnimationFrame(() => ui.el("close")?.focus({ preventScroll: true }));
  }
  function close() {
    const had = !!ui && (!!ui.root.activeElement || focusLost());
    stopPreview(); outline(null);
    for (const m of markers.values()) clearWorking(m.target);
    slot.want(false);
    if (had && focusLost()) focusFirst(opener, `${BAR} [data-review=agent]`, `${BAR} [data-review=critique]`, `${BAR} [data-review=inbox]`, launcher);
  }
  const isOpen = () => !!ui && slot.visible && !ui.panel.hidden;
  const toggle = () => (isOpen() ? close() : showPanel());
  // Esc closes the panel from anywhere, as Agent activity's does: opened from
  // the bar, it takes focus a frame later, and an Esc in that frame reached no
  // one (the panel's own handler only hears keys from inside it). Not while
  // typing in another field, and not past a surface open above it.
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || e.defaultPrevented || !isOpen()) return;
    const path = e.composedPath();
    if (path.includes(ui.host)) return;
    const t = path[0];
    if (t instanceof Element && t.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')) return;
    if (othersOpen({ slots: ["critique"], hosts: [ui.host] })) return;
    e.stopPropagation(); close();
  }, true);

  // With no toolbar (a critique-only link) there is no bar to carry the count,
  // so a small launcher does, in the corner the bar would hold.
  function paintLauncher() {
    if (toolbar) return;
    const n = undecided();
    if (!launcher) {
      if (!n) return;
      launcher = markChrome(document.createElement("button"));
      launcher.type = "button";
      launcher.setAttribute("data-sk-no-edit", "");
      launcher.className = "sk-crit-launch";
      Object.assign(launcher.style, { position: "fixed", right: "16px", bottom: "16px", zIndex: String(Z.panel), minHeight: "44px", padding: "0 14px",
        border: "0", borderRadius: "10px", background: "#1D1A2F", color: "#FFF4E0", font: "600 13px/1 " + FONT,
        boxShadow: "0 4px 20px rgba(0,0,0,.3)", cursor: "pointer" });
      launcher.addEventListener("click", toggle);
      document.body.append(launcher);
    }
    launcher.hidden = !n && !isOpen();
    launcher.textContent = n ? `From the agent · ${n} to decide` : "From the agent";
  }

  /**
   * Called for every SSE frame. A critique that lands while the page is open
   * appears without a reload; one the agent resolves leaves. A note decided
   * here stays until its Undo window ends.
   */
  function ingest(payload) {
    if (!payload?.id || !opinion) return;
    const known = items.some((a) => a.id === payload.id);
    if (payload.author === "agent" && !known && payload.status !== "resolved" && payload.status !== "dismissed") { load(); return; }
    if (known && !decided.has(payload.id) && (payload.status === "resolved" || payload.status === "dismissed")) {
      items = items.filter((a) => a.id !== payload.id);
      if (threadId === payload.id) threadId = null;
      if (preview?.id === payload.id) stopPreview();
      render();
    }
  }

  // Markers follow the page through ui.js (markerLayer re-places them on every
  // reflow, panel open or not). The outline and the panel re-measure here.
  // This used to be bound only once the panel had been opened, so the markers
  // stayed put when any other panel docked and moved the page.
  const reflow = () => { if (ringFor) outline(ringFor); place(); };
  addEventListener("resize", reflow, { passive: true });
  // Scrolling moves pinned (fixed or sticky) targets against the document:
  // re-place their markers and the outline once per frame.
  let scrollFrame = 0;
  addEventListener("scroll", () => { if (scrollFrame) return; scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; layoutMarkers(); reflow(); }); }, { passive: true, capture: true });
  document.addEventListener("agentation-kit:insets", () => requestAnimationFrame(reflow));
  document.addEventListener("agentation-kit:markers", () => {
    const shown = markersShown();
    for (const [, m] of markers) m.dot.hidden = !shown;
    layoutMarkers();
  });

  load();
  return {
    // A new page (client-side route): its own notes, and the last page's measurements are gone.
    ingest, reload: () => { stopPreview(); outline(null); checks = null; return load(); }, toggle, open: showPanel, close,
    runChecks: () => { showPanel(); return check(); },
    count: () => undecided(),
    get isOpen() { return isOpen(); },
  };
}
