/**
 * Which page a note belongs to.
 *
 * By default a page is its pathname, as it always was: a published link or a
 * local preview is one file per page. Some hosts route by query instead — a
 * Storybook preview is `/iframe.html` for every story, and only `?id=<story>`
 * says which one — so the host can name the params that identify a page:
 *
 *   window.__AGENTATION_KIT_AGENTATION__ = { routeKey: ["id"] }   // pathname + ?id=
 *   window.__AGENTATION_KIT_AGENTATION__ = { routeKey: "search" } // pathname + the whole query
 *
 * Every place that keys storage, sessions, scopes or the inbox on a page uses
 * this, including the pinned upstream toolbar (through the seam in build.mjs,
 * which reads `window.__AGENTATION_KIT_PAGE_KEY__`), so a routeKey can't be half
 * applied. Other params (Storybook's `args`, `globals`, `viewMode`) change
 * without making another page, which is why the default isn't "search".
 */
const CONFIG = (typeof window !== "undefined" && (window.__AGENTATION_KIT_AGENTATION__ || window.__SHAREKIT_AGENTATION__)) || {};

/** The page key of any URL (relative to this page). */
export function keyOf(raw) {
  let u;
  try { u = new URL(raw, typeof location !== "undefined" ? location.href : "https://agentation-kit.invalid/"); } catch { return raw || "/"; }
  const rk = CONFIG.routeKey;
  if (!rk) return u.pathname;
  if (rk === "search") return u.pathname + u.search;
  const q = new URLSearchParams();
  for (const name of Array.isArray(rk) ? rk : [rk]) if (u.searchParams.has(name)) q.set(name, u.searchParams.get(name));
  const s = q.toString();
  return s ? `${u.pathname}?${s}` : u.pathname;
}

/** This page's key. */
export const pageKey = () => keyOf(location.href);

/** The key to send with a session request, or null: only a host that routes by query needs the server to match on it. */
export const sessionKeyOf = (raw) => (CONFIG.routeKey ? keyOf(raw) : null);

if (typeof window !== "undefined") {
  window.__AGENTATION_KIT_PAGE_KEY__ = pageKey;
  window.__AGENTATION_KIT_SESSION_KEY_OF__ = sessionKeyOf;
}
