#!/usr/bin/env node
// show-and-tell copy --src <dir> [--all] [--json] [--file <rel>]
//
// Every piece of copy in the project's source, grouped by file and by the
// variable, function or section that holds it, with line numbers. The same map
// copy edit mode reads (server/copy-map.js): DOM text alone misses arrays,
// canvas labels, rotating lines and markup built in strings.
//   ' '  copy      '?'  maybe copy (a short label, a word in a list)
//   --all also lists the strings judged to be code, with the reason.
import { parseArgs, exitOnUsage } from './lib.mjs';
import { extractCopy, renderCopyMap } from '../server/copy-map.js';

let args;
try { args = parseArgs(process.argv.slice(2), { boolean: ['all', 'json'] }); } catch (e) { exitOnUsage(e); }
const src = args.src || process.cwd();
const only = [].concat(args.file || []);
try {
  const map = extractCopy(src, only.length ? { files: only } : {});
  if (args.json) console.log(JSON.stringify(map, null, 2));
  else console.log(renderCopyMap(map, { all: !!args.all }));
} catch (e) {
  console.error(`show-and-tell copy: ${e.message}`);
  process.exit(1);
}
