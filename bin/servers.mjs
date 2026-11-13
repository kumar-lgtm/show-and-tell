#!/usr/bin/env node
// show-and-tell servers [--json]: the running review servers, by port, read
// from the store (server/registry.js). No network: it works inside a sandbox
// that blocks localhost, where `curl 127.0.0.1:<port>/` can't answer.
import { parseArgs } from './lib.mjs';
import { listServers } from '../server/registry.js';

const args = parseArgs(process.argv.slice(2), { boolean: ['json'] });
const list = listServers();
if (args.json) { console.log(JSON.stringify(list, null, 2)); process.exit(0); }
if (!list.length) { console.log('No review servers running.'); process.exit(0); }
for (const s of list) console.log(`${s.port}  ${s.name}  ${s.origin || ''}  pid ${s.pid}  since ${s.startedAt}${s.kind && s.kind !== 'serve' ? `  (${s.kind})` : ''}`);
