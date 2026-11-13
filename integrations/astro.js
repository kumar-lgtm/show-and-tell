// Astro integration: the review toolbar on `astro dev`, with nothing to
// install in a layout and no second terminal.
//
//   // astro.config.mjs
//   import showAndTell from '@kumar-lgtm/show-and-tell/astro';
//   export default defineConfig({ integrations: [showAndTell()] });
//
// Dev only: every page's <head> gets the gated loader, and the review server
// starts in-process on `port` and stops with the dev server.
import { fileURLToPath } from 'node:url';
import { loaderGate, DEFAULT_PORT } from '../server/loader-tag.js';
import { projectName } from '../server/project-name.js';
import { loadDevServer } from '../server/load-dev-server.js';

/** Same options as the Vite plugin: name, port, start, framed, routeKey, critique, layoutIntent. */
export function showAndTell(opts = {}) {
  const port = Number(opts.port ?? DEFAULT_PORT);
  let name;
  let dev = false;
  return {
    name: 'show-and-tell',
    hooks: {
      'astro:config:setup': ({ command, config, injectScript }) => {
        dev = command === 'dev';
        if (!dev) return;
        name = projectName(opts.name, fileURLToPath(config.root));
        injectScript('head-inline', loaderGate({ port, name, hint: opts.start === false ? undefined : `nothing on port ${port}; restart the dev server` }));
      },
      'astro:server:setup': async ({ server, logger }) => {
        if (!dev || opts.start === false) return;
        const { attachToVite, toolbarConfig } = await loadDevServer();
        await attachToVite(server, { name, port, config: toolbarConfig(opts), log: logger ?? server.config.logger });
      },
    },
  };
}

export default showAndTell;
/** The plugin's name before the tool was renamed. */
export const agentationKit = showAndTell;
