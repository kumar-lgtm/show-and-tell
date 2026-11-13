// Vite plugin: the review toolbar on `vite dev`, with nothing to install in
// the entry file and no second terminal.
//
//   // vite.config.js
//   import showAndTell from '@kumar-lgtm/show-and-tell/vite';
//   export default { plugins: [showAndTell()] };
//
// Dev server only. index.html gets the gated loader at serve time (never
// written to disk, never in a build), and the review server starts in-process
// on `port` and stops with Vite.
//
// Inside Storybook's Vite builder (detected from Storybook's own plugins or a
// root under .storybook/, or forced with `storybook: true`) the loader skips
// Playwright-driven story tests unless ?show-and-tell=1, and the toolbar defaults
// to framed with `routeKey: 'id'` (stories share /iframe.html; ?id= names one).
import { loaderGate, DEFAULT_PORT } from '../server/loader-tag.js';
import { projectName } from '../server/project-name.js';
import { loadDevServer } from '../server/load-dev-server.js';

/** Is this Vite config Storybook's preview builder? */
export function isStorybook(config) {
  if ((config?.plugins || []).some((p) => typeof p?.name === 'string' && p.name.startsWith('storybook:'))) return true;
  return /(^|[\\/])\.storybook([\\/]|$)/.test(String(config?.root || ''));
}

/**
 * @param {object} [opts]
 * @param {string} [opts.name]        project name; sanitised to [a-z0-9-] (default: package.json name of the Vite root)
 * @param {number} [opts.port]        review server port (default 55930)
 * @param {boolean} [opts.start]      start the review server in-process (default true); false = you run `show-and-tell serve`
 * @param {boolean} [opts.storybook]  Storybook preview (default: detected); see above
 * @param {boolean} [opts.framed]     let the toolbar mount inside an iframe (Storybook-style hosts)
 * @param {string|string[]} [opts.routeKey]  query key(s) that name the page, or 'search'
 * @param {boolean} [opts.critique]   critique markers (default off)
 * @param {boolean} [opts.layoutIntent] layout-intent prompt (default off)
 */
export function showAndTell(opts = {}) {
  const port = Number(opts.port ?? DEFAULT_PORT);
  let name;
  let storybook = !!opts.storybook;
  return {
    name: 'show-and-tell',
    // `serve` only, and not under Vitest (it runs a Vite server too).
    apply: (_config, env) => env.command === 'serve' && !env.isPreview && !process.env.VITEST,
    configResolved(config) {
      name = projectName(opts.name, config.root);
      storybook = opts.storybook ?? isStorybook(config);
    },
    async configureServer(server) {
      if (opts.start === false) return;
      const sb = storybook ? { framed: true, routeKey: 'id' } : {};
      const { attachToVite, toolbarConfig } = await loadDevServer();
      await attachToVite(server, { name, port, config: toolbarConfig({ ...sb, ...defined(opts) }), log: server.config.logger });
    },
    transformIndexHtml() {
      return [{ tag: 'script', children: loaderGate({ port, name, storybook, hint: opts.start === false ? undefined : `nothing on port ${port}; restart the dev server` }), injectTo: 'head' }];
    },
  };
}

const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export default showAndTell;
/** The plugin's name before the tool was renamed. */
export const agentationKit = showAndTell;
