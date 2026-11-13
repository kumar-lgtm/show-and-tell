// Next.js: start the review server with `next dev`.
//
//   // next.config.mjs
//   import { withShowAndTell } from '@kumar-lgtm/show-and-tell/next';
//   export default withShowAndTell({ /* your config */ });
//
// Next can't inject HTML from its config, so the page side is a component:
// render <ShowAndTell /> from '@kumar-lgtm/show-and-tell/react' in the root layout. It
// renders nothing outside development, so it can stay committed.
//
// Build, start and lint phases leave the config untouched and start nothing.
import { DEFAULT_PORT } from '../server/loader-tag.js';

// next/constants PHASE_DEVELOPMENT_SERVER, inlined so this file doesn't import next.
export const PHASE_DEVELOPMENT_SERVER = 'phase-development-server';

/**
 * @param {object|Function} [nextConfig]  your config object, or a (phase, ctx) => config function
 * @param {object} [opts]  name, port, start, origin, framed, routeKey, critique, layoutIntent
 *   `name` is sanitised to [a-z0-9-]; pass the same name to <ShowAndTell name="…" />.
 *   `origin`: the dev server's origin, when it isn't on localhost / 127.0.0.1. Any
 *   localhost / 127.0.0.1 port is accepted already (Next doesn't say which port it took).
 */
export function withShowAndTell(nextConfig = {}, opts = {}) {
  return async function showAndTellConfig(phase, ctx) {
    const resolved = typeof nextConfig === 'function' ? await nextConfig(phase, ctx) : nextConfig;
    if (phase === PHASE_DEVELOPMENT_SERVER && opts.start !== false) {
      // Loaded only in dev, so build/start never pull in node:sqlite and friends.
      const { projectName } = await import('../server/project-name.js');
      const { loadDevServer } = await import('../server/load-dev-server.js');
      const { acquireReviewServer, toolbarConfig } = await loadDevServer();
      await acquireReviewServer({
        name: projectName(opts.name, process.cwd()),
        port: Number(opts.port ?? DEFAULT_PORT),
        config: toolbarConfig(opts),
        origins: opts.origin ? [new URL(opts.origin).origin] : [],
        loopback: !opts.origin, // no origin given: trust the first localhost page (dev-server.js)
      });
      // Held for the life of the process: `next dev` has no close hook.
    }
    return resolved;
  };
}

export default withShowAndTell;

/** The wrapper's name before the tool was renamed. */
export const withAgentationKit = withShowAndTell;
