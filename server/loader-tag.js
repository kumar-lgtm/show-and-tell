// The gated inline snippet that loads the review toolbar into a page. One
// builder for every way it gets there: `show-and-tell install` (a marked line
// in the entry file), the Vite and Astro integrations (injected at serve time)
// and the React component (rendered only in development).
//
// No Node imports here on purpose: the React component pulls this file into a
// Next.js bundle.

export const DEFAULT_PORT = 55930;

/** Any name as a project name, [a-z0-9-]: `@acme/Web App` → `acme-web-app`. */
export function sanitizeName(raw) {
  return String(raw || '').toLowerCase().replace(/^@/, '').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Where the page fetches the loader from. With `name`, the URL carries the
 * project name (`/loader.js?name=my-app`) so the review server can refuse a
 * page that belongs to a different project instead of filing its notes under
 * the wrong one.
 */
export const loaderUrl = (port = DEFAULT_PORT, name) => {
  const n = sanitizeName(name);
  return `http://127.0.0.1:${port}/loader.js${n ? `?name=${n}` : ''}`;
};

/**
 * The inline JS (no <script> wrapper). It only runs on a localhost /
 * 127.0.0.1 page, and when the review server is down it shows a dismissible
 * "offline" pill instead of failing silently.
 *
 * @param {object} [o]
 * @param {number} [o.port]       review server port
 * @param {boolean} [o.storybook] skip Playwright runs (navigator.webdriver) unless ?show-and-tell=1
 * @param {string} [o.hint]       what the offline pill tells the reviewer to do
 * @param {string} [o.name]       project name, sent as ?name= (see loaderUrl)
 */
export function loaderGate({ port = DEFAULT_PORT, storybook = false, hint, name } = {}) {
  port = Number(port);
  // Escaped for a double-quoted JS string; no regex in the emitted code on
  // purpose — escapes do not survive template literals.
  const say = JSON.stringify(hint ?? `run show-and-tell serve (port ${port})`).slice(1, -1);
  // Sidecar down = no toolbar at all, which reads as "the review line is gone";
  // say so with a dismissible pill instead (it also flags a line left installed).
  const offline = `s.onerror=function(){var d=document.createElement("button");d.textContent="Review toolbar offline: ${say} \\u00d7";d.title="Dismiss";d.style.cssText="position:fixed;right:12px;bottom:12px;z-index:2147483647;font:12px system-ui;padding:7px 11px;border:0;border-radius:6px;background:#1a1a1a;color:#fff;opacity:.9;cursor:pointer";d.onclick=function(){d.remove()};document.body.appendChild(d)};`;
  // Storybook's story tests drive the same iframe.html under Playwright: no toolbar (and no session
  // per story view) unless a check asks for it with ?show-and-tell=1.
  const notUnderTest = storybook ? '&&(!navigator.webdriver||location.search.indexOf("show-and-tell=1")>=0)' : '';
  return `if(["localhost","127.0.0.1"].indexOf(location.hostname)>=0${notUnderTest}){var s=document.createElement("script");s.src="${loaderUrl(port, name)}";${offline}document.head.appendChild(s);}`;
}
