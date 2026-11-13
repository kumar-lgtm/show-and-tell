import { pageKey, sessionKeyOf } from "./page-key.js";
import { installFonts } from "./brand.js";
import { createReviewTools } from "./review-tools.js";
import { viewport, belongsToViewport, simulatedChild } from "./viewport.js";
/**
 * Entry point for sharekit's Agentation bundle.
 *
 * Upstream ships a prebuilt dist whose auto-mount is:
 *
 *     createRoot(el).render(createElement(Agentation, { copyToClipboard: true }))
 *
 * — one hardcoded prop, no config global, no script dataset. That is the entire
 * reason nothing about the toolbar was configurable on a published link. The
 * component itself supports far more; the build simply never passed it.
 *
 * This entry mounts the same component and reads its props from a global the
 * Worker writes into the entry document (see src/agentation-client.js), so a
 * per-link session endpoint and webhook can be set server-side with no rebuild.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { Agentation } from "agentation";
import { createEditMode } from "./edit-mode.js";
import { openCopyView } from "./copy-open.js";
import { createReplies } from "./replies.js";
import { createCritique } from "./critique.js";
import { createLayoutIntent } from "./layout-intent.js";
import { installReviewerGlobals } from "./reviewer.js";
import { createConnection } from "./connection.js";
import { createVoice } from "./voice.js";
import { installPopupStyle } from "./popup-style.js";
import { createAgentWork } from "./agent-work.js";
import { createCheck } from "./check.js";
import { createFresh, takeResume } from "./fresh.js";
import { createTweak } from "./tweak.js";
import { installToolbarKeys } from "./a11y.js";
import { installPlayhead, pointedPlayhead } from "./playhead.js";

const CONFIG = (typeof window !== "undefined" && (window.__AGENTATION_KIT_AGENTATION__ || window.__SHAREKIT_AGENTATION__)) || {};

/**
 * Resolve the session endpoint to an absolute URL.
 *
 * The Worker injects a root-relative path (`/p/<token>/__ag`). The toolbar
 * concatenates it with `/sessions`, which works relative — but a page served
 * from a nested path (`/p/<token>/docs/page.html`) would otherwise be fine
 * while any future absolute use would not. Normalising once here removes the
 * class of bug that already bit the KV bridge, which had to stop deriving its
 * URL from `location.pathname` for exactly this reason.
 */
function absoluteEndpoint(endpoint) {
  if (!endpoint) return undefined;
  try {
    return new URL(endpoint, window.location.origin).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function mount() {
  // Injection is per-HTML-file, so a site that frames its own pages would get a
  // second toolbar inside the frame. The expiry badge already bails this way;
  // the upstream dist could not, being prebuilt. Ours can.
  // A host that shows its pages inside its own frame (Storybook's story pane) opts in with `framed`.
  if (window.top !== window.self && !simulatedChild() && !CONFIG.framed) return;
  // Run checks measures other widths in a hidden copy of the page (measure.js); nothing mounts there.
  if (window.name === "show-and-tell-measure") return;
  window.__AGENTATION_KIT_VIEWPORT__ = viewport;
  window.__AGENTATION_KIT_VIEWPORT_MATCH__ = belongsToViewport;
  // A page with its own timeline (a film, a HyperFrames preview): notes carry the time, and pointing holds it still.
  installPlayhead();
  // Read by the syncAnnotation seam (build.mjs), so every note is signed.
  installFonts(absoluteEndpoint(CONFIG.endpoint));
  installReviewerGlobals(absoluteEndpoint(CONFIG.endpoint));
  if (document.getElementById("agentation-root")) return;
  watchRoutes();
  // Say so on the toolbar when nothing is being saved (connection.js). The
  // config may name the project; the loader always sets __AGENTATION_KIT__.
  connection = createConnection({
    endpoint: absoluteEndpoint(CONFIG.endpoint),
    expectedName: CONFIG.name || (typeof window.__AGENTATION_KIT__ === "string" ? window.__AGENTATION_KIT__ : ""),
    recoverSession: () => resolveSession().then((id) => id && switchSession(id)),
  });
  window.__AGENTATION_KIT_CONNECTION__ = connection;
  if (CONFIG.agentWork) window.__AGENTATION_KIT_AGENT_WORK__ = createAgentWork({endpoint:absoluteEndpoint(CONFIG.endpoint), ...(typeof CONFIG.agentWork === 'object' ? { hint: CONFIG.agentWork.hint, livePage: !!CONFIG.agentWork.livePage } : {})});
  // A server that was down at load and came back: start the layers now.
  document.addEventListener("agentation-kit:health", (e) => {
    if (e.detail?.ok && !started) resolveSession().then((id) => id && startLayers(id));
  });

  // Critique-only links mount no toolbar. The bundle still loads — our layers
  // need it — but the reviewer is not handed a control for adding their own
  // notes on a page whose whole purpose is to show them someone else's.
  // ⚠️ `startLayers` must still run, so the session is resolved directly below
  // rather than waiting on the component's `onSessionCreated`.
  if (CONFIG.toolbar === false) {
    window.__AGENTATION_KIT_TOOLBAR_OFF__ = true;
    resolveSession().then((id) => id && startLayers(id));
    return;
  }

  const host = document.createElement("div");
  host.id = "agentation-root";
  document.body.appendChild(host);

  createRoot(host).render(
    React.createElement(Agentation, {
      // Sync sessions and annotations to the link itself. Without this the
      // toolbar is localStorage-only and an agent can only read a blob.
      endpoint: absoluteEndpoint(CONFIG.endpoint),
      // review.added counts the note on the bar at once, before the server lists it.
      // The same object is synced to the server next (the component calls this first), so what is set here is stored.
      onAnnotationAdd: annotation => { annotation.viewport ||= viewport(); const at = annotation.playhead ? null : pointedPlayhead(annotation); if (at) annotation.playhead = at; review?.added(annotation); },
      onAnnotationUpdate: () => review?.refresh(),
      onAnnotationDelete: () => review?.refresh(),
      // Clear all tombstones my notes; a cleared edit must take its overlay with it.
      onAnnotationsClear: (list) => { for (const a of list || []) editMode?.clearCommitted(a.id, "dismissed"); review?.refresh(); },
      // Optional: fire annotation events at a URL as they happen.
      webhookUrl: CONFIG.webhookUrl || undefined,
      // Copy-to-clipboard stays on. The session endpoint is the durable path,
      // but pasting into a chat is still the fastest route for a one-off note,
      // and removing a control reviewers already know is a regression.
      copyToClipboard: CONFIG.copyToClipboard !== false,
      onSessionCreated: (sessionId) => {
        // Surfaced so the page (and anything driving it in a test) can see which
        // session it joined without reaching into the toolbar's internals.
        window.__AGENTATION_KIT_AGENTATION_SESSION__ = sessionId;
        document.dispatchEvent(
          new CustomEvent("agentation-kit:agentation-session", { detail: { sessionId } }),
        );
        startLayers(sessionId);
      },
    }),
  );

  // Enter and Space open the collapsed bar; Esc closes Settings before the bar (a11y.js).
  installToolbarKeys();

  // A returning reviewer rejoins an existing session, and `onSessionCreated`
  // only fires for a NEW one — so editing would never start on the second visit
  // if we waited for that callback alone. Ask the endpoint directly.
  resolveSession().then((id) => id && startLayers(id));
}

async function resolveSession() {
  const endpoint = absoluteEndpoint(CONFIG.endpoint);
  if (!endpoint) return null;
  try {
    const res = await fetch(`${endpoint}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: window.location.href, ...(sessionKeyOf(window.location.href) ? { pageKey: sessionKeyOf(window.location.href) } : {}) }),
    });
    connection?.report("sessions", res, "sessions");
    if (!res.ok) return null;
    return (await res.json()).id ?? null;
  } catch {
    connection?.report("sessions", null);
    return null;
  }
}

/**
 * Client-side routes.
 *
 * ⚠️ A session is ONE page, and everything here used to resolve it once, at
 * load. On a single-page app (Next, React Router, SvelteKit, Astro view
 * transitions) the reviewer then walks to /pricing without a reload, and every
 * note, edit and answer they leave there is filed under the page they STARTED
 * on — measured: an edit made on /pricing was stored against /. The agent
 * then looks for the fix in the wrong file.
 *
 * So a pathname change is broadcast as `agentation-kit:route`. The toolbar's own
 * session effect re-runs on it (see the seams in build.mjs), and our layers
 * follow via `switchSession`. History methods are wrapped because
 * `pushState` fires no event; `popstate` covers back/forward; the poll is the
 * backstop for routers that navigate some other way (the Navigation API,
 * a framework that captured `history.pushState` before we wrapped it).
 */
// The page key, not the bare pathname: a host routing by query (routeKey, page-key.js) changes page on replaceState(?id=…).
let routePath = typeof location !== "undefined" ? pageKey() : "/";
function checkRoute() {
  if (pageKey() === routePath) return;
  routePath = pageKey();
  document.dispatchEvent(new CustomEvent("agentation-kit:route", { detail: { pathname: routePath } }));
}
function watchRoutes() {
  if (window.__AGENTATION_KIT_ROUTES__) return;
  window.__AGENTATION_KIT_ROUTES__ = true;
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      queueMicrotask(checkRoute);
      return result;
    };
  }
  addEventListener("popstate", checkRoute);
  setInterval(checkRoute, 1000);
  document.addEventListener("agentation-kit:route", () => {
    critique?.reload();
    resolveSession().then((id) => id && switchSession(id));
  });
}

function switchSession(sessionId) {
  if (!started) return startLayers(sessionId);
  if (sessionId === window.__AGENTATION_KIT_AGENTATION_SESSION__) return;
  window.__AGENTATION_KIT_AGENTATION_SESSION__ = sessionId;
  editMode?.setSession(sessionId);
  tweak?.setSession(sessionId);
  review?.setSession(sessionId);
  voice?.setSession(sessionId);
  openStream(sessionId);
  document.dispatchEvent(new CustomEvent("agentation-kit:agentation-session", { detail: { sessionId } }));
}

let connection = null;
let editMode = null;
let tweak = null;
let replies = null;
let critique = null;
let layoutIntent = null;
let stream = null;
let review = null;
let voice = null;
let check = null;
let started = false;

/**
 * Start the sharekit layers for a session.
 *
 * Two independent concerns share one stream, and they must fail independently:
 * a page that brings its own editor still needs to receive an agent's
 * clarifying question. Bundling them meant standing down the editor also
 * silenced replies, which is the opposite of what a page-with-its-own-editor
 * wants.
 */
function startLayers(sessionId) {
  if (started || !sessionId) return;
  started = true;
  window.__AGENTATION_KIT_AGENTATION_SESSION__ = sessionId;
  const endpoint = absoluteEndpoint(CONFIG.endpoint);

  // --- direct editing (optional) ---
  //
  // Stand down when the page already ships its own editor. Two contenteditable
  // systems over the same text is not a merge, it is a coin flip: whichever
  // saves last wins, and edits made in one are invisible to the other. A page
  // that built its own knows more about its content model than we do. Detected
  // by the marker attribute so no page has to be changed to be safe.
  if (CONFIG.edit === false) {
    window.__AGENTATION_KIT_EDIT_STANDDOWN__ = "disabled for this link";
  } else if (document.querySelector("[data-editid]")) {
    window.__AGENTATION_KIT_EDIT_STANDDOWN__ = "page has its own editor ([data-editid])";
  } else {
    editMode = createEditMode({ endpoint, sessionId, integrated: CONFIG.toolbar !== false });
    window.__AGENTATION_KIT_EDIT__ = editMode;
    document.addEventListener("agentation-kit:edit-toggle", (e) => editMode.toggle(e.detail?.on));
  }

  // Copy edit mode: `window.__AGENTATION_KIT_COPY__.open()` opens the copy view
  // (the "All copy" button in the text editing panel does the same).
  // Off with `copyView: false`: All text reads the project's source through the
  // review server, and a hosted link has neither.
  const copyView = CONFIG.copyView !== false;
  if (copyView) {
    window.__AGENTATION_KIT_COPY__ = { open: () => openCopyView(endpoint) };
    // The public handle: window.__SHOW_AND_TELL__.allText() opens All text from a script or the console.
    window.__SHOW_AND_TELL__ = { ...(window.__SHOW_AND_TELL__ || {}), allText: () => openCopyView(endpoint) };
  }

  if (CONFIG.toolbar !== false) {
    // Tweak (key D): before the review tools, so the bar shows its mode at once.
    // `!== false` like critique: a cached older config must not turn it off.
    // Phone-sized Cancel and Add, and room for Dictate, in the comment popup.
    installPopupStyle();
    if (CONFIG.tweak !== false) tweak = createTweak({ endpoint, sessionId });
    review = createReviewTools({ endpoint, sessionId, editMode, copyView });
    window.__AGENTATION_KIT_REVIEW__ = review;
    // Off with `voice: false`, for a host with no transcription route. The bar
    // offers Talk only while this handle exists (review-tools.js modeAvailable).
    if (CONFIG.voice !== false) {
      voice = createVoice({ endpoint, sessionId, config: CONFIG.voice || {} });
      window.__AGENTATION_KIT_VOICE__ = voice;
    }
    // Is this page older than its source? (fresh.js) Off with `fresh: false` in the config.
    const fresh = CONFIG.fresh !== false ? createFresh({ endpoint }) : null;
    window.__AGENTATION_KIT_FRESH__ = fresh;
    // Check the fix: what the agent closed since this browser's Send, one change at a time.
    check = createCheck({ endpoint, fresh });
    window.__AGENTATION_KIT_CHECK__ = check;
    // Back from Reload and check: carry on checking.
    const resume = takeResume();
    if (resume?.then === "check") check.resume(resume.id);
    if (simulatedChild() && window.parent.__AGENTATION_KIT_SIMULATOR__.target) {
      const target = window.parent.__AGENTATION_KIT_SIMULATOR__.target;
      window.parent.__AGENTATION_KIT_SIMULATOR__.target = null;
      setTimeout(() => review.locate(target), 300);
    }
  }

  // --- agent replies (always) ---
  replies = createReplies({ endpoint });
  window.__AGENTATION_KIT_REPLIES__ = replies;

  // --- agent critique (mode) ---
  //
  // Renders `author=agent` annotations, which the toolbar never sees: the
  // server serves it reviewer rows only, precisely so it cannot adopt an
  // agent's opinion as the reviewer's own note and then offer to delete it.
  //
  // ⚠️ `!== false`, not truthiness. The bundle is cached for an hour, so a
  // reviewer can be running a build older than the flag that controls it —
  // absent has to keep meaning on, or a stale cache silently turns modes off.
  //
  // With critique off the layer still runs for Run checks (More), measuring
  // needs no agent (show-and-tell.pen 9.4), but it loads no agent notes.
  if (CONFIG.critique !== false || CONFIG.toolbar !== false) {
    critique = createCritique({ endpoint, opinion: CONFIG.critique !== false, toolbar: CONFIG.toolbar !== false });
    window.__AGENTATION_KIT_CRITIQUE__ = critique;
  }

  // --- layout intent (mode) ---
  //
  // Asks what a drag meant. Driven off the stream below rather than a toolbar
  // callback, because `onAnnotationAdd` does not fire for layout kinds. Moot
  // without the toolbar, since layout mode is one of its buttons — but gated on
  // its own flag anyway, because "no toolbar" and "no prompt" are different
  // decisions and coupling them would surprise whoever set only one.
  if (CONFIG.layoutIntent !== false && CONFIG.toolbar !== false) {
    layoutIntent = createLayoutIntent({ endpoint });
    window.__AGENTATION_KIT_LAYOUT_INTENT__ = layoutIntent;
  }

  openStream(sessionId);
}

function openStream(sessionId) {
  const endpoint = absoluteEndpoint(CONFIG.endpoint);
  if (!endpoint) return;
  stream?.close();
  // The toolbar opens its own EventSource for markers; this is a second
  // subscriber. Same stream, two concerns: retiring a committed edit once the
  // source agrees with it, and surfacing a question the agent has asked.
  try {
    stream = new EventSource(`${endpoint}/sessions/${sessionId}/events`);
    const onFrame = (event) => {
      try {
        const data = JSON.parse(event.data);
        const payload = data.payload || {};
        const { id, status } = payload;
        if (editMode && id && (status === "resolved" || status === "dismissed")) {
          editMode.clearCommitted(id, status);
        }
        // Four subscribers, one stream. Each ignores what is not its own — a
        // frame carries every field any of them needs, and adding a fifth
        // concern must not mean a fifth EventSource.
        review?.ingest(payload);
        check?.ingest(payload);
        replies.ingest(payload);
        critique?.ingest(payload);
        layoutIntent?.ingest(payload);
      } catch { /* keepalive or malformed frame */ }
    };
    // ⚠️ Both names, and a Set guards against handling a frame twice.
    //
    // The Worker sends `event: annotation.updated`, because that is the ONLY
    // thing the component itself subscribes to — it has no `onmessage`, so for
    // as long as our stream sent unnamed frames the toolbar received none of
    // them and an agent resolving a note never made the marker go away. Our
    // layers were built against `onmessage` and worked, which is exactly why
    // nobody noticed.
    //
    // Listening for both means neither half has to be deployed first: an older
    // bundle against a new Worker keeps working through the named event, and a
    // new bundle against an un-deployed Worker keeps working through `message`.
    const seen = new Set();
    const once = (event) => {
      // `lastEventId` is the row's `updated_at`; pairing it with the payload id
      // identifies one change without growing unbounded per annotation.
      const key = `${event.lastEventId || ""}:${event.data}`;
      if (seen.has(key)) return;
      seen.add(key);
      // Bounded: the stream replays 7 days on a fresh connection, and this only
      // has to catch a duplicate arriving in the same instant as its twin.
      if (seen.size > 200) seen.clear();
      onFrame(event);
    };
    stream.addEventListener("annotation.updated", once);
    stream.onmessage = once;
  } catch { /* no EventSource — commits still work, overlays just linger */ }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
