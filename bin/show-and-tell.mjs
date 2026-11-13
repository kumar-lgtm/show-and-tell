#!/usr/bin/env node
// show-and-tell — one entry point for every command.
//
//   show-and-tell serve    --origin <dev server origin> --name <project> [--port 55930] [--framed] [--route-key id]
//                           [--critique] [--layout-intent] [--src <dir>]
//   show-and-tell install  <project dir | file> [--port 55930] [--remove | --check]
//   show-and-tell feedback <project> list|json|wait|resolve|dismiss|reply|annotate|clear-critique [id] [text] [--all] [--src <dir>]
//   show-and-tell feedback <project> apply [id…] [--yes] | export [--format md|json] [--github | --pr <n>] [--yes]
//   show-and-tell mcp      [--project <name>] [--src <dir>]   MCP server on stdio for coding agents
//   show-and-tell servers                                    which review server runs on which port (no network needed)
//   show-and-tell copy     --src <dir> [--all] [--json] [--file <rel>]   every piece of copy in the source, by file and owner
//   show-and-tell share    --origin <dev server origin> --name <project> [--port 55940] [--tunnel] [--key <token>]
import '../server/env.js';
const [cmd, ...rest] = process.argv.slice(2);
const commands = { serve: './serve.mjs', install: './install.mjs', feedback: './feedback.mjs', mcp: './mcp.mjs', share: './share.mjs', servers: './servers.mjs', copy: './copy.mjs' };
const help = !cmd || cmd === '--help' || cmd === '-h' || cmd === 'help';
if (!commands[cmd]) {
  (help ? console.log : console.error)(`usage: show-and-tell <${Object.keys(commands).join('|')}> …

  serve     run the review server beside your dev server
  install   add (or --remove) the one dev-only line that loads the toolbar
  feedback  read, wait on, answer and close the reviewer's notes;
            apply text edits to the source; export the round (markdown, JSON, GitHub)
  mcp       the same agent tools over MCP (stdio), for Claude Code, Codex, Cursor
  share     let a remote reviewer in: key-gated proxy that injects the toolbar (--tunnel)
  servers   which review server runs on which port, read from disk (works where curl can't)
  copy      every piece of copy in the source (strings, arrays, JSX, HTML), by file and owner`);
  process.exit(help ? 0 : 2);
}
process.argv = [process.argv[0], commands[cmd], ...rest];
await import(commands[cmd]);
