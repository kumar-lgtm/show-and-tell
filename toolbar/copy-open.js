/**
 * "All copy": snapshot the page's copy and open the copy view in a new tab.
 *
 * The view (server/copy-view/) is served by the review server, so it has the
 * whole window and none of this page's CSS or scripts. It needs this page's
 * outline (toolbar/copy-outline.js), its session (so notes land on this page)
 * and the reviewer's name, which live here, so they travel in the snapshot.
 */
import { collectOutline } from "./copy-outline.js";
import { reviewerName } from "./reviewer.js";
import { viewport } from "./viewport.js";

export async function openCopyView(endpoint) {
  if (!endpoint) return { ok: false, error: "no review server" };
  // Opened now, inside the click, so a popup blocker lets it through; pointed
  // at the view once the snapshot exists.
  let win = null;
  try { win = window.open("", "_blank"); } catch { /* blocked */ }
  try {
    const outline = collectOutline(document);
    const res = await fetch(`${endpoint}/copy-map/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        outline,
        sessionId: window.__AGENTATION_KIT_AGENTATION_SESSION__ || null,
        reviewer: reviewerName() || null,
        viewport: viewport(),
      }),
    });
    if (!res.ok) throw new Error(`review server answered ${res.status}`);
    const { view } = await res.json();
    const url = `${endpoint}/${view}`;
    if (win) { try { win.opener = null; } catch { /* cross-origin already */ } win.location.href = url; }
    else win = window.open(url, "_blank", "noopener");
    return { ok: true, url, blocked: !win };
  } catch (e) {
    try { win?.close(); } catch { /* ignore */ }
    return { ok: false, error: e.message };
  }
}
