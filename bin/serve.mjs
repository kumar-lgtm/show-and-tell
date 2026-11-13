#!/usr/bin/env node
// Review server for a project's OWN dev server (Vite, Next, Astro, Storybook, plain HTML…).
//
//   show-and-tell serve --origin http://localhost:5173 --name my-app [--port 55930]
//                        [--framed] [--route-key id] [--critique] [--layout-intent] [--src <dir>]
//
// --src is the project's source folder (default: the current directory). Copy edit
// mode reads the copy in it, so strings that never sit in the DOM can be edited too.
// It runs beside the dev server: the page loads /loader.js from here (`show-and-tell
// install` adds that one gated line), and every write lands in a per-project
// SQLite store (notes and the shared keys) that `show-and-tell feedback` reads.
import { createServer } from 'node:http';
import { parseArgs, bundlePath, assertSlug, DEFAULT_PORT, portArg, originArg, exitOnUsage } from './lib.mjs';
import { createReviewApp } from '../server/app.js';
import { registerServer, serverOn } from '../server/registry.js';

const args = parseArgs(process.argv.slice(2), { boolean: ['framed', 'critique', 'layout-intent'] });
const wantsHelp = args.help || args.h || process.argv.includes('-h');
if (wantsHelp || !args.origin || !args.name) {
  (wantsHelp ? console.log : console.error)('usage: show-and-tell serve --origin http://localhost:5173 --name <slug> [--port 55930] [--framed] [--route-key id] [--critique] [--layout-intent] [--src <dir>]');
  process.exit(wantsHelp ? 0 : 2);
}
let name, port, origin;
try {
  name = assertSlug(args.name);
  port = portArg(args.port, DEFAULT_PORT);
  origin = originArg(args.origin);
} catch (e) { exitOnUsage(e); }
const base = `http://127.0.0.1:${port}`;
// A host that shows its pages inside its own frame and routes by query (Storybook: every story is
// /iframe.html?id=…): --framed lets the toolbar mount in the frame, --route-key id files notes per
// story instead of per pathname (toolbar/page-key.js). Both off by default.
const routeKey = typeof args['route-key'] === 'string' ? (args['route-key'] === 'search' ? 'search' : args['route-key'].split(',').map((s) => s.trim()).filter(Boolean)) : null;
// --critique shows the agent's own notes (`feedback annotate`, the MCP `annotate` tool) as
// amber markers and a panel; --layout-intent asks the reviewer what a drag in layout mode
// meant. Both are in the bundle and off by default (server/app.js).
const config = {
  ...(args.framed === true ? { framed: true } : {}),
  ...(routeKey ? { routeKey } : {}),
  ...(args.critique === true ? { critique: true } : {}),
  ...(args['layout-intent'] === true ? { layoutIntent: true } : {}),
};

const src = typeof args.src === 'string' ? args.src : process.cwd();
const app = createReviewApp({ name, base, origins: [origin, base], config, src, voiceLocal: true });
const server = createServer((req, res) => app.handler(req, res));
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const owner = serverOn(port);
    console.error(owner
      ? `Port ${port} is taken by the review server for "${owner.name}" (pid ${owner.pid}, origin ${owner.origin}).${owner.name === name ? ' It is this project: use it.' : ' Leave it running and pass a free --port to both serve and install.'}`
      : `Port ${port} is taken by something else. Pass a free --port to both serve and install. (\`show-and-tell servers\` lists the review servers.)`);
  } else console.error(e.message);
  process.exit(1);
});
server.listen(port, '127.0.0.1', () => {
  registerServer({ port, name, origin });
  console.log(`show-and-tell "${name}" on ${base}  ·  accepts ${[...app.allowed].join(', ')}`);
  console.log(`bundle ${bundlePath()}`);
  const modes = [config.critique && 'critique', config.layoutIntent && 'layout intent'].filter(Boolean);
  if (modes.length) console.log(`modes: ${modes.join(', ')}`);
  console.log(`feedback → show-and-tell feedback ${name} list`);
});
