/**
 * Is anything actually being saved?
 *
 * When the review server refuses the page (403: started with another
 * `--origin`; 404: wrong mount or link), is a different project's server, or
 * is simply down, the toolbar falls back to this browser's localStorage and
 * looks exactly as it does when everything works. The reviewer leaves a round
 * of notes that never reach the agent. So this layer watches the three things
 * the toolbar depends on (`/__ag/health`, `/__ag/sessions`, `/__kv`) and says
 * so on the toolbar itself, collapsed or not:
 *
 *   - a notice above the toolbar, dismissible, that comes back if the reason
 *     changes or the server recovers and fails again;
 *   - a red dot on the toolbar's corner that stays while the problem does,
 *     so dismissing the notice never hides the state. Clicking it reopens it.
 *
 * Health is polled every 10s (the toolbar's own cadence), so a server that
 * dies with the page open is noticed, and one that comes back clears it.
 * State is published as `window.__AGENTATION_KIT_HEALTH__` ({ok, reason}) and
 * the `agentation-kit:health` event; the inbox reads both.
 */
import { createHost, placeToast, slotFront, Z } from "./ui.js";

const POLL = 10000;
const TITLE = "Review server not reachable — notes aren’t being saved";

/** Why a response means "not saving", in words a reviewer can act on. */
async function describe(res, what) {
  if (!res) return `The review server did not answer. Start it again (show-and-tell serve); notes stay in this browser until then.`;
  let detail = "";
  try { detail = (await res.clone().json())?.error || ""; } catch { /* not JSON */ }
  if (res.status === 403) return `The review server refused this page${detail ? `: ${detail}` : "."}`;
  if (res.status === 404) return `The review server has no ${what} for this page (404). It may be another project's server.`;
  return `The review server failed (${res.status})${detail ? `: ${detail}` : "."}`;
}

export function createConnection({ endpoint, expectedName, recoverSession }) {
  const state = { ok: true, reason: "" };
  window.__AGENTATION_KIT_HEALTH__ = state;
  if (!endpoint) return { report() {}, check() {} };
  const base = endpoint.replace(/\/__ag$/, "");
  const problems = new Map(); // source -> reason
  let dismissed = "";         // the reason the reviewer dismissed, if any
  let ui = null;

  function build() {
    const { host, root, el } = createHost(`
      [hidden] { display: none !important; }
      .panel.notice { z-index: ${Z.notice}; display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 9px 9px 11px; width: 300px; max-width: calc(100vw - 24px);
        right: 16px; bottom: 84px; }
      .notice .sign { flex: none; width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; background: #E5484D; }
      .notice .txt { min-width: 0; flex: 1; }
      .notice strong { display: block; font-size: 12.5px; font-weight: 600; color: var(--sk-text); }
      .notice .why { margin: 2px 0 0; font-size: 12px; color: var(--sk-text-2); overflow-wrap: anywhere; }
      .notice .iconbtn { flex: none; min-width: 28px; min-height: 28px; }
      .flag { position: fixed; z-index: ${Z.notice}; width: 14px; height: 14px; padding: 0; border: 0;
        border-radius: 50%; background: #E5484D; box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.3);
        cursor: pointer; }
      .flag::before { content: ""; position: absolute; inset: -15px; }
      @media (pointer: coarse) { .notice .iconbtn { min-width: 44px; min-height: 44px; } }
    `);
    root.append(Object.assign(document.createElement("div"), { innerHTML: `
      <div class="panel notice" id="notice" role="alert">
        <span class="sign" aria-hidden="true"></span>
        <div class="txt"><strong id="title"></strong><p class="why" id="why"></p></div>
        <button class="iconbtn" id="dismiss" aria-label="Dismiss">✕</button>
      </div>
      <button class="flag" id="flag" hidden></button>` }));
    el("title").textContent = TITLE;
    el("dismiss").addEventListener("click", (e) => { e.stopPropagation(); dismissed = state.reason; paint(); });
    el("flag").addEventListener("click", (e) => { e.stopPropagation(); dismissed = ""; paint(); });
    el("flag").setAttribute("aria-label", TITLE + ". Show details");
    el("flag").title = TITLE;
    return { host, root, el };
  }

  function paint() {
    if (state.ok) { if (ui) ui.host.style.display = "none"; return; }
    if (!ui) ui = build();
    ui.host.style.display = "";
    ui.el("why").textContent = state.reason;
    const notice = ui.el("notice"), flag = ui.el("flag");
    // The notice steps aside while a panel holds the slot (the inbox says the
    // same thing in its own header); the dot stays on the toolbar regardless.
    notice.hidden = dismissed === state.reason || !!slotFront();
    if (!notice.hidden) placeToast(notice, 300);
    const bar = document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']")?.getBoundingClientRect();
    flag.hidden = !bar?.width;
    if (bar?.width) { flag.style.left = `${bar.left - 1}px`; flag.style.top = `${bar.top - 1}px`; }
  }

  function update() {
    const reason = [...problems.values()][0] || "";
    const ok = !reason;
    if (ok !== state.ok || reason !== state.reason) {
      if (ok) dismissed = "";
      state.ok = ok; state.reason = reason;
      document.dispatchEvent(new CustomEvent("agentation-kit:health", { detail: { ...state } }));
    }
    paint();
  }

  /** Record what a request told us. `res` null = network failure. */
  async function report(source, res, what = "review routes") {
    if (res && res.ok) problems.delete(source); else problems.set(source, await describe(res, what));
    update();
  }

  async function check() {
    const res = await fetch(`${endpoint}/health`, { cache: "no-store" }).catch(() => null);
    await report("health", res);
    if (res?.ok) {
      // Health and sessions are separate routes. A healthy process can still
      // refuse session creation, so only an actual successful retry clears it.
      if (problems.has("sessions")) await recoverSession?.();
      if (problems.has("kv")) await report("kv", await fetch(`${base}/__kv?prefix=agentation-round`).catch(() => null), "note store");
      update();
    }
  }

  // The bridge (server/client.js) reports the seed's status, then each write.
  const kv = (status) => {
    if (status === undefined) return;
    if (status >= 200 && status < 300) problems.delete("kv");
    else problems.set("kv", status ? `The note store refused this page (${status}). Notes stay in this browser only.` : "The note store did not answer. Notes stay in this browser only.");
    update();
  };
  kv(window.__AGENTATION_KIT_KV_STATUS__);
  document.addEventListener("agentation-kit:kv-status", (e) => kv(e.detail?.status));

  // A loader from a server for a different project files every note under
  // the wrong name. Only checkable when the page knows which project to expect.
  if (expectedName) {
    fetch(`${base}/`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((info) => {
      if (info?.name && info.name !== expectedName) {
        problems.set("name", `This page expects the review server for “${expectedName}”, but the one answering is “${info.name}”.`);
        update();
      }
    }).catch(() => {});
  }

  check();
  setInterval(() => { if (document.visibilityState === "visible") check(); }, POLL);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
  const repaint = () => { if (!state.ok) requestAnimationFrame(paint); };
  addEventListener("resize", repaint);
  addEventListener("pointerup", () => setTimeout(repaint, 320), { passive: true });
  document.addEventListener("agentation-kit:toolbar-position", repaint);
  document.addEventListener("agentation-kit:slot", repaint);
  // The toolbar animates open and shut; follow it while the dot is showing.
  setInterval(repaint, 1000);

  return { report, check };
}
