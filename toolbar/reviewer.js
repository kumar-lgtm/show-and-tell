/**
 * Who is reviewing, per browser.
 *
 * Several people can review one app at once, so every note, text edit, answer
 * and round carries a name. It is asked for the first time someone does
 * something that needs one (adds a note, enters text edit, answers a question,
 * presses Send), never on page load, and can be changed from the inbox.
 *
 * ⚠️ The key must NOT start with "agentation". The KV bridge (server/client.js)
 * mirrors every `agentation*` key to the project's shared store and seeds it
 * into EVERY reviewer's browser on load, so an `agentation-reviewer` key would
 * hand the last person's name to everyone. It is also outside the per-project
 * swap in the loader (that skips `feedback-toolbar-*`), so one browser keeps
 * one name across projects, like the toolbar's own theme and position.
 */
import { createHost, slotPanel, placeNearToolbar, Z } from "./ui.js";

const KEY = "feedback-toolbar-reviewer";
export const MAX_NAME = 40;

/** Same rules as the server's cleanReviewer: one line, printable, short. */
export function cleanName(raw) {
  if (typeof raw !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_NAME).trim();
}

export function reviewerName() {
  try { return cleanName(localStorage.getItem(KEY) || ""); } catch { return ""; }
}

function setName(name) {
  const clean = cleanName(name);
  try { if (clean) localStorage.setItem(KEY, clean); else localStorage.removeItem(KEY); } catch { /* private mode */ }
  document.dispatchEvent(new CustomEvent("agentation-kit:reviewer-change", { detail: { name: clean } }));
  return clean;
}

const norm = (s) => cleanName(s || "").toLowerCase();
/** Did this browser's reviewer write it? Unnamed matches unnamed. */
export const isMine = (reviewer) => norm(reviewer) === norm(reviewerName());
/** A question on a note is for me if the note is mine or nobody signed it. */
export const isForMe = (note) => !norm(note?.reviewer) || isMine(note.reviewer);

/**
 * Notes this browser sent, by id (the toolbar's client id and the server's).
 *
 * A note goes out the moment it is added, signed or not (see `syncNew`), so an
 * unsigned note is not necessarily someone else's: it may be mine, sent while
 * the name prompt was still open. `sk-` keys are per project (the loader swaps
 * them) and are not mirrored to the shared store, so this stays in this browser.
 */
const OWN = "sk-own-notes";
const UNSIGNED = "sk-unsigned-notes";
const readIds = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const writeIds = (k, ids) => { try { localStorage.setItem(k, JSON.stringify(ids.slice(-500))); } catch { /* private mode */ } };
export function rememberOwn(...ids) {
  const have = readIds(OWN); let changed = false;
  for (const id of ids) if (id && !have.includes(String(id))) { have.push(String(id)); changed = true; }
  if (changed) writeIds(OWN, have);
}
const createdHere = (id) => !!id && readIds(OWN).includes(String(id));

/**
 * Is this note mine to edit, reject or clear?
 *
 * Signed: only if it carries my name. Unsigned: only if this browser sent it,
 * or while I have no name myself (then nobody here is distinguishable, and the
 * old single-reviewer behaviour holds). The Mine filter, the inbox's Edit and
 * Reject, and Clear all use this one rule, so they cannot disagree.
 */
export function ownsNote(a) {
  if (!a) return false;
  if (norm(a.reviewer)) return isMine(a.reviewer);
  if (createdHere(a.id) || createdHere(a.clientId)) return true;
  return !reviewerName();
}

let endpointUrl = "";
let signing = null;
/**
 * Attach my name to notes I sent unsigned. Needs the server to accept
 * `reviewer` on PATCH for a note that has none; a server that ignores the
 * field leaves the note unsigned for others, and ownership here still holds
 * through `sk-own-notes`.
 */
async function signUnsigned() {
  if (signing) { await signing; return signUnsigned(); }
  const name = reviewerName();
  const ids = readIds(UNSIGNED);
  if (!name || !ids.length || !endpointUrl) return;
  signing = (async () => {
    const done = new Set();
    await Promise.all(ids.map(async (id) => {
      try {
        const res = await fetch(`${endpointUrl}/annotations/${encodeURIComponent(id)}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviewer: name }),
        });
        if (res.ok && norm((await res.json()).reviewer) === norm(name)) done.add(id);
        else if (res.status === 404 || res.status === 409) done.add(id);
      } catch { /* Keep failed writes queued for the next connection. */ }
    }));
    writeIds(UNSIGNED, readIds(UNSIGNED).filter((id) => !done.has(id)));
    document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"));
  })();
  try { await signing; } finally { signing = null; }
}

/**
 * The toolbar's add path (build.mjs seam). The note syncs NOW, signed if a
 * name is known; the name prompt opens beside it without holding it back. A
 * note held behind the prompt was lost for good when the tab closed first.
 */
export function syncNew(send, local) {
  rememberOwn(local?.id);
  const asking = ensureReviewer();
  const sent = send();
  Promise.resolve(sent).then((server) => {
    rememberOwn(local?.id, server?.id);
    if (server?.id && !norm(server.reviewer)) {
      writeIds(UNSIGNED, [...readIds(UNSIGNED), String(server.id)]);
      asking.then(() => signUnsigned());
    }
  }).catch((err) => { window.__AGENTATION_KIT_SAVE_FAILED__?.(err); });
  return sent;
}

let skipped = false; // "Not now" holds for this page load, then asks again next time
let pending = null;
let ui = null;

function build() {
  const { host, root, el } = createHost(`
    .panel { right: 16px; bottom: 84px; width: 300px; max-width: calc(100vw - 32px); z-index: ${Z.panel}; }
    .hint { margin: 0 0 8px; font-size: 12px; color: var(--sk-text-2); }
    input { width: 100%; font: inherit; font-size: 13px; color: var(--sk-text);
      background: var(--sk-raised); border: 1px solid var(--sk-hairline); border-radius: 6px;
      padding: 7px 9px; outline: none; min-height: 34px; }
    input:focus { border-color: var(--sk-focus); background: var(--sk-hover); }
    .row { display: flex; gap: 6px; align-items: center; justify-content: flex-end; margin-top: 9px; }
    @media (pointer: coarse) { input, button { min-height: 44px; } }
  `);
  host.style.display = "none";
  root.append(Object.assign(document.createElement("div"), { innerHTML: `
    <form class="panel" role="dialog" aria-labelledby="sk-rv-title" id="form">
      <div class="hd"><span id="sk-rv-title">Who is reviewing?</span></div>
      <div class="body">
        <p class="hint" id="hint">Your name goes on your notes, so the agent and other reviewers know who said what.</p>
        <input id="name" name="name" autocomplete="name" maxlength="${MAX_NAME}" placeholder="Your name" aria-label="Your name">
        <div class="row">
          <button type="button" class="ghost" id="skip">Not now</button>
          <button type="submit" class="primary" id="save">Save</button>
        </div>
      </div>
    </form>` }).firstElementChild);
  const finish = (name) => {
    slotted.want(false);
    const done = pending; pending = null;
    done?.resolve(name);
  };
  el("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = cleanName(el("name").value);
    if (!name) { el("name").focus(); return; }
    finish(setName(name));
  });
  el("skip").addEventListener("click", () => { skipped = true; finish(reviewerName()); });
  // The toolbar binds single-key shortcuts on document; typing a name must not fire them.
  el("name").addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); el("skip").click(); }
    e.stopPropagation();
  });
  // One slot with the other panels: the prompt goes in front while it is open
  // and whatever it covered comes back after.
  const slotted = slotPanel("reviewer", (visible) => {
    host.style.display = visible ? "" : "none";
    if (visible) placeNearToolbar(root.getElementById("form"), 300);
  });
  return { host, root, el, slotted };
}

function show(reason) {
  if (!ui) ui = build();
  ui.el("name").value = reviewerName();
  ui.el("sk-rv-title").textContent = reviewerName() ? "Change your name" : "Who is reviewing?";
  ui.el("hint").textContent = reason || "Your name goes on your notes, so the agent and other reviewers know who said what.";
  ui.slotted.want(true, { bump: true });
  setTimeout(() => ui.el("name").focus(), 0);
  if (!pending) {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    pending = { promise, resolve };
  }
  return pending.promise;
}

/**
 * The name to sign with, asking once if there is none. Resolves to "" when the
 * reviewer chose "Not now" (the action still goes ahead, unsigned).
 */
export function ensureReviewer(reason) {
  const name = reviewerName();
  if (name || skipped) return Promise.resolve(name);
  return pending ? pending.promise : show(reason);
}

/** Open the prompt to change the name (from the inbox). */
export function changeReviewer() {
  skipped = false;
  return show(reviewerName() ? "Notes you already left keep the name they were sent with." : "");
}

/** Read-only global for the build seam in syncAnnotation and for tests. */
export function installReviewerGlobals(endpoint) {
  endpointUrl = endpoint || "";
  window.__AGENTATION_KIT_REVIEWER__ = reviewerName;
  window.__AGENTATION_KIT_ASK_REVIEWER__ = ensureReviewer;
  window.__AGENTATION_KIT_SYNC_NEW__ = syncNew;
  window.__AGENTATION_KIT_OWNS__ = ownsNote;
  // A name given later (from the inbox, or a prompt answered after the note
  // went out) signs what was sent without one.
  document.addEventListener("agentation-kit:reviewer-change", () => { signUnsigned(); });
  document.addEventListener("agentation-kit:health", (e) => { if (e.detail?.ok) signUnsigned(); });
  signUnsigned();
}
