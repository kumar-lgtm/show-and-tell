/**
 * Agent replies, surfaced to the reviewer.
 *
 * The toolbar has no thread UI — `replies`, `reply` and `thread` appear zero
 * times in the component. So an agent could already call `agentation_reply` to
 * ask "which logo did you mean?", the message was stored and readable from the
 * agent side, and the reviewer never saw it. The clarifying question worked in
 * every direction except the one that mattered.
 *
 * This is that missing half: a panel that shows what the question is about and
 * lets the reviewer answer without leaving the page. Answers go back on the
 * same annotation, so the agent picks them up with the tools it already has.
 *
 * ⚠️ The panel never opens by itself. It used to open the moment a question
 * arrived, and on a phone that put a 300px sheet over the comment popup's Add
 * button, over the Tweak sheet and, on a desktop, over Settings and the Layout
 * palette (UX review round 1, findings 2, 7 and 8). A waiting question is the
 * inbox badge plus the inbox's Needs you row; here it is at most one passive
 * line above the bar, which steps aside for every other panel or popup. The
 * reviewer opens the panel from that line, and it closes again when anything
 * else opens, so there is only ever one sheet on screen.
 */

/**
 * ⚠️ This key must NOT start with "agentation".
 *
 * The collab KV bridge mirrors every `agentation*` key to the link's SHARED
 * server store, so as `agentation-replyseen_*` this was global: one viewer
 * dismissing or answering a question marked it seen for everyone, and the next
 * person to load the page had it silently suppressed. Observed for real — a
 * question was visible, answered from a second browser, and vanished for the
 * first reviewer who never touched it.
 *
 * "Have I read this" is per-person by definition. The thread itself is shared;
 * the receipt is not.
 */
import { createHost, threadCSS, paintThread, slotPanel, slotFront, placeNearToolbar, placeToast, releaseSurface, scheduleInsets, failMessage, WIDE, othersOpen as anythingElseOpen, CLOSE_ICON } from "./ui.js";
import { ensureReviewer, isForMe } from "./reviewer.js";

const SEEN = "sk-replyseen_";

/**
 * The notice's line (UX review 5, #2). "The agent asked you 2 questions" was
 * cut to "questio…" at every width; this is shorter and says the number first.
 */
export function noticeText(n, plans = 0) {
  // A plan wants a go-ahead, not an answer: say so when that is all there is.
  if (plans && plans === n) return n === 1 ? "The agent has a plan for your note" : `The agent has ${n} plans for you`;
  return n === 1 ? "1 question from the agent" : `${n} questions from the agent`;
}

/** Is the agent's newest message a plan ("Here's what I'll do: …") waiting on a go-ahead? */
export const isPlan = (t) => !!t?.reply?.plan;
export const GO_AHEAD = "Go ahead.";

/** 'none' when the page has no toolbar (questions still reach the reviewer), else open or closed. */
function barState() {
  const bar = document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']");
  if (!bar) return "none";
  return /expanded/.test(bar.className) ? "open" : "closed";
}

export function createReplies({ endpoint }) {
  const threads = new Map(); // annotationId -> { comment, reply, replies }
  // What the reviewer has typed, per question: closing the panel (Esc, Close, or
  // another panel taking over) must never drop an answer half written.
  const drafts = new Map();
  // Close on the notice hides it until the next question arrives. Deliberately in
  // memory and NOT in the seen store: hiding the line is not having dealt with
  // the question, which stays in the inbox and comes back on reload.
  let noticeHidden = false;
  let ui = null;

  const seen = (id, ts) => {
    try { return localStorage.getItem(SEEN + id) === String(ts); } catch { return false; }
  };
  const markSeen = (id, ts) => {
    try { localStorage.setItem(SEEN + id, String(ts)); } catch { /* private mode */ }
  };

  function build() {
    const { host, root, el } = createHost(`
      [hidden] { display: none !important; }
      /* Placed beside the toolbar in the shared panel slot (ui.js), so it can
         never open under the inbox or the Send panel. These are the fallback. */
      .panel { right: 16px; bottom: 176px; width: 328px; max-width: calc(100vw - 24px);
        display: flex; flex-direction: column; }
      .panel .body { overflow-y: auto; }
      .panel { --sk-accent: #FF5436; }
      .hd #title { flex: 1; }
      .iconbtn { min-width: 28px; min-height: 28px; display: inline-flex; align-items: center; justify-content: center; }
      .iconbtn svg { width: 16px; height: 16px; flex: none; }
      /* The annotation the question is ABOUT: a label and the quote, muted and
         clipped to two lines. It is context, not the message. No side bar: a
         one-side rule is not how this tool marks anything (review finding 9). */
      .about { margin-bottom: 9px; }
      .about .lbl { display: block; font-size: 12px; color: var(--sk-text-3); margin-bottom: 1px; }
      .ctx { font-size: 12px; color: var(--sk-text-2);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .tw { position: relative; margin-bottom: 9px; }
      /* Capped and scrolled rather than grown: the panel is pinned above the
         toolbar, so an unbounded thread pushes the answer box — the one control
         that must stay reachable — off the screen. */
${threadCSS()}
      .who { font-size: 12px; }
      /* Scrolled-to-newest is right, but only if the top edge admits there is
         more above it — otherwise the oldest message is a headless fragment and
         nothing on screen says it can be scrolled. */
      .fade { position: absolute; left: 0; right: 0; top: 0; height: 26px; pointer-events: none;
        background: linear-gradient(var(--sk-surface), transparent); opacity: 0; transition: opacity .12s; }
      .earlier { position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
        font: inherit; font-size: 12px; font-weight: 600; padding: 2px 9px; border: 0;
        border-radius: 999px; background: var(--sk-text); color: var(--sk-surface);
        cursor: pointer; opacity: 0; pointer-events: none; transition: opacity .12s; }
      .tw.scrolled .fade, .tw.scrolled .earlier { opacity: 1; }
      .tw.scrolled .earlier { pointer-events: auto; }
      /* The answer box and its dictate button side by side, as in the Check card. */
      .field { display: flex; gap: 6px; align-items: flex-start; }
      .field textarea { flex: 1; min-width: 0; }
      .row { display: flex; gap: 7px; align-items: center; margin-top: 8px; }
      .row .primary { flex: 1; }
      .row .secondary { font: inherit; font-size: 13px; font-weight: 500; padding: 6px 12px; min-height: 32px; border: 0; border-radius: 6px;
        cursor: pointer; background: transparent; color: var(--sk-text); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
      :host([data-sk-theme=light]) .row .secondary { box-shadow: inset 0 0 0 1px rgba(0,0,0,.16); }
      .row .secondary:hover { background: var(--sk-hover); }
      .row .secondary[disabled] { opacity: .4; cursor: default; }
      .status { font-size: 12px; }

      /* The passive line: one row above the bar, never a sheet. */
      .notice { position: fixed; z-index: 2147483644; display: flex; align-items: center; gap: 6px;
        font: 400 13px/1.4 var(--sk-font); color: var(--sk-text); background: var(--sk-surface);
        box-shadow: var(--sk-ring); border-radius: 8px; padding: 4px 4px 4px 12px; }
      /* Sized to its line, up to the screen less the 12px insets (#2). */
      .notice { max-width: calc(100vw - 24px); box-sizing: border-box; }
      .notice .msg { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .notice .answer { font: inherit; font-size: 13px; font-weight: 600; color: var(--sk-text);
        background: var(--sk-raised); border: 0; border-radius: 6px; padding: 6px 10px; cursor: pointer; min-height: 32px; }
      .notice .answer:hover { background: var(--sk-hover); }
      button:focus-visible, textarea:focus-visible { outline:2px solid var(--sk-focus); outline-offset: 2px; }

      /* Phones: every target is 44px. */
      @media (pointer: coarse) {
        .iconbtn { min-width: 44px; min-height: 44px; font-size: 15px; }
        button.primary, .notice .answer, .row .secondary { min-height: 44px; }
        .earlier { min-height: 32px; }
      }
    `);
    host.dataset.repliesUi = "";
    root.append(Object.assign(document.createElement("div"), { innerHTML: `
      <div class="panel" role="dialog" aria-label="Reply from the agent" hidden>
        <div class="hd"><span id="title">Agent asked a question</span>
          <button class="iconbtn" id="setaside" aria-label="Close" title="Close. The question stays in your inbox.">${CLOSE_ICON}</button></div>
        <div class="body">
          <div class="about"><span class="lbl">About your note</span><div class="ctx" id="ctx"></div></div>
          <div class="tw" id="tw">
            <div class="thread" id="thread"></div>
            <div class="fade"></div>
            <button class="earlier" id="earlier">↑ earlier</button>
          </div>
          <div class="field"><textarea id="answer" placeholder="Answer so the agent can carry on"></textarea></div>
          <div class="row">
            <button class="primary" id="goahead" hidden>Go ahead</button>
            <button class="primary" id="send">Send answer</button>
            <span class="status" id="nav"></span>
          </div>
        </div>
      </div>
      <div class="notice" data-question-notice role="status" aria-live="polite" hidden>
        <span class="msg" id="nmsg"></span>
        <button class="answer" id="nanswer">Answer</button>
        <button class="iconbtn" id="nhide" aria-label="Hide until the next question" title="Hide until the next question. It stays in your inbox.">${CLOSE_ICON}</button>
      </div>` }));

    el("setaside").addEventListener("click", (e) => { e.stopPropagation(); closePanel(); });
    el("send").addEventListener("click", () => sendAnswer());
    el("goahead").addEventListener("click", () => sendAnswer(GO_AHEAD));
    el("nanswer").addEventListener("click", (e) => { e.stopPropagation(); openPanel(); });
    el("nhide").addEventListener("click", (e) => { e.stopPropagation(); noticeHidden = true; sync(); });
    el("earlier").addEventListener("click", () => {
      el("thread").scrollTo({ top: 0, behavior: "smooth" });
    });
    el("thread").addEventListener("scroll", () => {
      el("tw").classList.toggle("scrolled", el("thread").scrollTop > 4);
    });
    el("answer").addEventListener("input", () => { if (ui?.current) drafts.set(ui.current, el("answer").value); planButtons(); });
    el("answer").addEventListener("keydown", (e) => {
      // Enter sends; the box is one sentence in practice, and reaching for a
      // button breaks the flow of answering a quick question.
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); }
      if (e.key !== "Escape") e.stopPropagation(); // the toolbar binds single-key shortcuts on document
    });

    return { host, root, el, panel: root.querySelector(".panel"), notice: root.querySelector(".notice") };
  }
  const ensureUi = () => (ui ||= build());

  // The panel holds the shared slot only while the reviewer has it open. When
  // anything else takes the slot it closes (back to the notice) instead of
  // waiting hidden behind it. The name prompt is the exception: Send answer
  // asks for a name, and the answer comes back when that is done.
  const slotted = slotPanel("question", (visible) => {
    if (!ui) return;
    ui.panel.hidden = !visible;
    if (visible) requestAnimationFrame(place);
    else { releaseSurface(ui.panel); scheduleInsets(); }
  });
  const place = () => { if (ui && slotted.visible) placeNearToolbar(ui.panel, 328); };

  const unanswered = () => [...threads.entries()];

  function openPanel() {
    if (!unanswered().length) return;
    ensureUi();
    hideNotice();
    slotted.want(true, { bump: true });
    render();
    // A plan's first move is Go ahead; a question's is typing the answer.
    requestAnimationFrame(() => { place(); if (slotted.visible) ui.el(ui.el("goahead").hidden ? "answer" : "goahead").focus({ preventScroll: true }); });
  }
  function closePanel() {
    if (ui?.current) drafts.set(ui.current, ui.el("answer").value);
    if (slotted.wants) slotted.want(false);
    sync();
  }

  /** Any other panel, popup, sheet or recording dock on screen (ui.js, shared with Check). */
  const othersOpen = () => anythingElseOpen({ slots: ["question"], hosts: ui ? [ui.host] : [] });

  function hideNotice() {
    if (!ui || ui.notice.hidden) return;
    ui.notice.hidden = true;
    liftTips(null);
    releaseSurface(ui.notice);
    scheduleInsets();
  }
  /**
   * The bar's tooltips open above the notice while it shows (UX review 5, #3):
   * the toolbar's own (Exit) by a margin chrome.css.js reads from
   * --sk-tip-lift; ours (review-tools.js) look the notice up as they open.
   */
  function liftTips(notice) {
    const bar = document.querySelector("[data-agentation-toolbar]");
    if (!bar) return;
    let lift = "";
    if (notice) {
      const wrap = [...bar.querySelectorAll('[class*="buttonWrapper"]')].map((w) => w.getBoundingClientRect()).find((r) => r.width);
      const top = wrap ? wrap.top : bar.querySelector('[class*="toolbarContainer"]')?.getBoundingClientRect().top;
      // Upstream opens its tooltip 14px above the button; clear the notice by 6.
      if (top != null && top > notice.top) lift = Math.max(0, Math.ceil(top - 14 - (notice.top - 6))) + "px";
    }
    if (bar.style.getPropertyValue("--sk-tip-lift") !== lift) {
      if (lift) bar.style.setProperty("--sk-tip-lift", lift); else bar.style.removeProperty("--sk-tip-lift");
    }
  }

  /**
   * Re-decide what is on screen. Cheap, so it runs on every slot and inset
   * change, on pointer and key release, and on a short timer for the surfaces
   * that announce nothing (the toolbar's own popups, the Tweak sheet).
   */
  function sync() {
    if (!ui) return;
    const list = unanswered();
    const bar = barState();
    // Collapsing the bar closes the panel and releases its inset.
    if (slotted.wants && (bar === "closed" || !list.length)) { slotted.want(false); }
    // Something else took the slot (or a popup opened over the page): one sheet at a time.
    if (slotted.wants && !slotted.visible && slotFront() !== "reviewer") slotted.want(false);
    if (slotted.wants && slotted.visible && othersOpen()) {
      if (ui.current) drafts.set(ui.current, ui.el("answer").value);
      slotted.want(false);
    }
    const show = list.length && !noticeHidden && bar !== "closed" && !slotted.wants && !othersOpen();
    if (!show) { hideNotice(); return; }
    const words = noticeText(list.length, list.filter(([, t]) => isPlan(t)).length);
    if (ui.el("nmsg").textContent !== words) { ui.el("nmsg").textContent = words; ui.noticeWidth = 0; }
    ui.el("nanswer").setAttribute("aria-label", list.length === 1 ? "Answer the agent's question" : `Answer the agent's ${list.length} questions`);
    const first = ui.notice.hidden;
    ui.notice.hidden = false;
    // Full width on a phone; on a desktop, as wide as its line, beside the bar.
    // Measured once per wording: it was a fixed 320, which cut the line short.
    if (innerWidth >= WIDE && !ui.noticeWidth) {
      ui.notice.style.width = "max-content";
      ui.noticeWidth = Math.ceil(ui.notice.getBoundingClientRect().width);
    }
    placeToast(ui.notice, innerWidth < WIDE ? innerWidth : ui.noticeWidth || 320);
    liftTips(ui.notice.getBoundingClientRect());
    if (first) scheduleInsets();
  }
  let frame = 0;
  const soon = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; sync(); }); };
  document.addEventListener("agentation-kit:slot", soon);
  document.addEventListener("agentation-kit:insets", soon);
  document.addEventListener("agentation-kit:toolbar-position", () => { soon(); requestAnimationFrame(place); });
  addEventListener("resize", () => { soon(); requestAnimationFrame(place); });
  addEventListener("pointerup", () => { setTimeout(sync, 60); setTimeout(place, 60); }, { passive: true });
  addEventListener("keyup", () => setTimeout(sync, 30), { passive: true });
  setInterval(() => { if (threads.size) sync(); }, 300);

  // Esc closes the panel before it reaches the toolbar, which would exit
  // feedback mode with the panel still on screen.
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !ui || !slotted.visible || ui.panel.hidden) return;
    e.preventDefault(); e.stopImmediatePropagation();
    closePanel();
  }, true);

  /**
   * Render the whole exchange, oldest at the top.
   *
   * Only the newest question used to be shown, which made a multi-turn thread
   * unanswerable in practice: by the third question the reviewer could no
   * longer see what they had already told the agent, so the natural move was to
   * repeat themselves or give up. The messages were always stored — the panel
   * simply never received them.
   *
   * Built with DOM nodes rather than innerHTML because every message is
   * attacker-adjacent text: an agent's reply and a reviewer's own answer both
   * arrive as strings, and `textContent` is what keeps them strings.
   */
  function renderThread(t) {
    const box = ui.el("thread");
    paintThread(box, t.replies?.length ? t.replies : (t.reply ? [t.reply] : []), "reviewer");
    // Set the affordance from real geometry rather than guessing whether it
    // will overflow — the scroll event does not fire for a programmatic set.
    ui.el("tw").classList.toggle("scrolled", box.scrollTop > 4);
  }

  function render() {
    ensureUi();
    const list = unanswered();
    if (!list.length) { ui.current = null; if (slotted.wants) slotted.want(false); sync(); return; }
    if (!slotted.wants) { sync(); return; }
    const [id, t] = list[0];
    const plan = isPlan(t);
    ui.el("title").textContent = plan ? "The agent's plan" : "Agent asked a question";
    ui.el("ctx").textContent = t.comment ? `“${t.comment}”` : "Your note";
    // A plan: Go ahead in one press, or say what to change instead.
    ui.el("answer").placeholder = plan ? "Or say what to change" : "Answer so the agent can carry on";
    ui.el("goahead").hidden = !plan;
    renderThread(t);
    // Only a different question resets the box: a new frame for the same one
    // must not wipe what the reviewer is typing.
    if (ui.current !== id) ui.el("answer").value = drafts.get(id) || "";
    ui.el("send").disabled = false;
    ui.el("goahead").disabled = false;
    planButtons();
    // A count, not pagination: there is no way to jump to #2 except by dealing
    // with #1. Say "more" rather than "1 of 3", which reads as navigation that
    // isn't there.
    const more = list.length - 1;
    ui.el("nav").textContent = more ? `+${more} more` : "";
    ui.current = id;
  }

  /** With a plan up, Send answer is the second choice: secondary, and only once something is typed. */
  function planButtons() {
    if (!ui) return;
    const plan = !ui.el("goahead").hidden, typed = !!ui.el("answer").value.trim();
    ui.el("send").className = plan ? "secondary" : "primary";
    ui.el("send").textContent = plan ? "Send changes" : "Send answer";
    if (plan) ui.el("send").disabled = !typed;
  }

  async function sendAnswer(preset) {
    const id = ui?.current;
    const message = (typeof preset === "string" ? preset : ui.el("answer").value).trim();
    if (!id || !message || !endpoint) return;
    ui.el("send").disabled = true;
    ui.el("goahead").disabled = true;
    ui.el("nav").textContent = "Sending…";
    const name = await ensureReviewer();
    try {
      const res = await fetch(`${endpoint}/annotations/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, ...(name ? { name } : {}) }),
      });
      if (!res.ok) throw Object.assign(new Error(String(res.status)), { status: res.status });
      const t = threads.get(id);
      // Answering IS the receipt — the only thing that marks a question seen.
      if (t?.reply?.ts) markSeen(id, t.reply.ts);
      threads.delete(id);
      drafts.delete(id);
      // Confirm in place. Replacing the panel's markup here would destroy the
      // nodes render() needs for the next question in the queue.
      ui.el("nav").textContent = "✓ Sent";
      setTimeout(() => { if (ui.current === id) ui.current = null; render(); }, 1200);
    } catch (err) {
      // The answer stays in the box: nothing typed is ever dropped.
      ui.el("send").disabled = false;
      ui.el("goahead").disabled = false;
      planButtons();
      ui.el("nav").textContent = failMessage(err?.status || 0, "send");
    }
  }

  /** Called for every SSE frame. A new question shows the notice, never the panel. */
  function ingest(payload) {
    if (!payload?.id) return;
    // The agent closed the thread. Anything still on screen asking the reviewer
    // to answer it is now asking about a settled question — worse than showing
    // nothing. This used to `return` without dropping an OPEN panel, so a
    // resolved thread stayed up indefinitely.
    if (payload.status === "resolved" || payload.status === "dismissed") {
      if (threads.delete(payload.id)) { drafts.delete(payload.id); render(); }
      return;
    }
    // The newest message is no longer the agent's: answered (in the inbox, or
    // in another tab), so the question is settled here too.
    if (!payload.reply) {
      if (threads.delete(payload.id)) { drafts.delete(payload.id); render(); }
      return;
    }
    // Several reviewers: a question on someone else's note is theirs to answer.
    // It still shows in everyone's inbox under Everyone; it just does not pop up.
    if (!isForMe(payload)) return;
    if (seen(payload.id, payload.reply.ts)) return;
    const known = threads.get(payload.id);
    // A NEW question brings back a notice the reviewer had hidden: they hid
    // the old one, not the conversation.
    if (!known || known.reply?.ts !== payload.reply.ts) noticeHidden = false;
    threads.set(payload.id, {
      comment: payload.comment || "",
      reply: payload.reply,
      // The full exchange when the server sends it. Older Workers send only
      // `reply`, and paintThread falls back to that — a deploy skew must not
      // leave the panel blank.
      replies: Array.isArray(payload.replies) ? payload.replies : null,
      answered: false,
    });
    render();
  }

  return {
    ingest,
    pending: () => unanswered().length,
    /** Open the question panel (the reviewer asked for it: the notice, a test). */
    open: openPanel,
    close: closePanel,
    get visible() { return !!(ui && slotted.visible && !ui.panel.hidden); },
  };
}
