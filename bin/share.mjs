#!/usr/bin/env node
// Share a dev build with a remote reviewer: a key-gated reverse proxy in front of
// the dev server that injects the review toolbar, optionally behind a tunnel.
//
//   show-and-tell share --origin http://localhost:5173 --name my-app [--port 55940]
//                        [--tunnel] [--key <token>] [--framed] [--route-key id]
//
// Notes land in the same store as `serve`, so `show-and-tell feedback <name>`
// reads them unchanged. No `install` line is needed: the proxy adds the loader.
import { spawn, spawnSync } from 'node:child_process';
import { parseArgs, assertSlug, portArg, originArg, exitOnUsage } from './lib.mjs';
import { createShareProxy, generateKey, KEY_PARAM } from '../server/proxy.js';
import { registerServer } from '../server/registry.js';

const DEFAULT_SHARE_PORT = 55940;
const args = parseArgs(process.argv.slice(2));
const wantsHelp = args.help || args.h || process.argv.includes('-h');
if (wantsHelp || !args.origin || !args.name) {
  (wantsHelp ? console.log : console.error)('usage: show-and-tell share --origin http://localhost:5173 --name <slug> [--port 55940] [--tunnel] [--key <token>] [--framed] [--route-key id] [--src <dir>]');
  process.exit(wantsHelp ? 0 : 2);
}
let name, port, origin;
try {
  name = assertSlug(args.name);
  port = portArg(args.port, DEFAULT_SHARE_PORT);
  origin = originArg(args.origin);
} catch (e) { exitOnUsage(e); }
let key = typeof args.key === 'string' ? args.key : generateKey();
if (typeof args.key === 'string' && key.length < 16) console.warn('warning: --key is shorter than 16 characters; anyone who guesses it gets your dev server.');
const routeKey = typeof args['route-key'] === 'string' ? (args['route-key'] === 'search' ? 'search' : args['route-key'].split(',').map((s) => s.trim()).filter(Boolean)) : null;
const config = { ...(args.framed === true ? { framed: true } : {}), ...(routeKey ? { routeKey } : {}) };

// The project's source folder, for All text and the stale-page check (default: the current directory).
const src = typeof args.src === 'string' ? args.src : process.cwd();
const { server, target, close } = createShareProxy({ target: origin, name, key, config, src, voiceLocal: true });
const local = `http://127.0.0.1:${port}`;
const link = (origin) => `${origin}/?${KEY_PARAM}=${encodeURIComponent(key)}`;

let tunnel = null;
const stop = () => {
  if (tunnel && tunnel.exitCode === null) tunnel.kill('SIGTERM');
  close();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', () => { if (tunnel && tunnel.exitCode === null) tunnel.kill('SIGTERM'); });

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `Port ${port} is taken: is a share already running? Pass --port.` : e.message);
  process.exit(1);
});

server.listen(port, '127.0.0.1', () => {
  registerServer({ port, name, origin: target, kind: 'share', signals: false }); // share's own stop() handles the signals
  console.log(`show-and-tell share "${name}": ${local} → ${target}`);
  console.log(`local link   ${link(local)}`);
  console.log('');
  console.log('WARNING: anyone with the link (and its key) can use your dev server: every page,');
  console.log('API route, source module and HMR socket it serves. The review tools add the page');
  console.log('copy from files under --src (not code strings or paths). The key is the only protection. Stop `share`');
  console.log('(Ctrl-C) as soon as the review round is done.');
  console.log('');
  console.log(`feedback → show-and-tell feedback ${name} list`);
  if (args.tunnel) startTunnel(); else printOtherTunnels();
});

function printOtherTunnels() {
  console.log('');
  console.log(`To share outside this machine, point any tunnel at port ${port}, e.g.:`);
  console.log(`  cloudflared tunnel --url ${local}     (or rerun with --tunnel)`);
  console.log(`  ngrok http ${port}`);
  console.log(`then send https://<tunnel host>/?${KEY_PARAM}=${key}`);
}

function startTunnel() {
  const has = spawnSync('cloudflared', ['--version'], { stdio: 'ignore' });
  if (has.error || has.status !== 0) {
    console.log('');
    console.log('--tunnel needs cloudflared, which is not on your PATH. Install it:');
    console.log('  brew install cloudflared            (macOS)');
    console.log('  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/');
    printOtherTunnels();
    return;
  }
  console.log('');
  console.log('Starting a cloudflared quick tunnel…');
  tunnel = spawn('cloudflared', ['tunnel', '--url', local], { stdio: ['ignore', 'pipe', 'pipe'] });
  let found = false;
  let log = '';
  const scan = (chunk) => {
    if (found) return;
    log += chunk.toString();
    const m = log.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
    if (!m) return;
    found = true;
    console.log('');
    console.log(`share link   ${link(m[0])}`);
    console.log('Send that link to the reviewer. It sets a cookie and drops the key from the address bar.');
  };
  tunnel.stdout.on('data', scan);
  tunnel.stderr.on('data', scan);
  tunnel.on('error', (e) => console.error(`cloudflared failed to start: ${e.message}`));
  tunnel.on('exit', (code) => {
    if (!found) {
      console.error(`cloudflared exited (${code}) before giving a URL. Its output:\n${log.trim().split('\n').slice(-15).join('\n')}`);
    } else {
      console.error(`cloudflared exited (${code}); the share link no longer works. The proxy is still up on ${local}.`);
    }
    tunnel = null;
  });
}
