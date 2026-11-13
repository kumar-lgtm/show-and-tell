#!/usr/bin/env node
// Read, wait on, and close the feedback left on a local dev review.
//
//   show-and-tell feedback <name> list [--all] [--agent] [--src <dir>] [--by <reviewer>]
//                                                               open feedback, grouped by page, with source pointers;
//                                                               --agent: your own critique notes and the replies to them
//   show-and-tell feedback <name> json [--all] [--agent]       same, raw annotation objects
//   show-and-tell feedback <name> wait [--timeout 3600]        block until the reviewer presses "Send to agent",
//                                                               answers a question or replies to a critique note;
//                                                               then print the list
//   show-and-tell feedback <name> resolve <id>[,<id>…] [note]  done — clears a text-edit overlay live
//   show-and-tell feedback <name> dismiss <id>[,<id>…] [why]   won't do
//     --same-target   also close every open voice note spoken at the same target in the same session
//     --shot          photograph each note's target at the reviewer's viewport first (Playwright), shown in Check the fix
//     --shot-file <f> attach a PNG/JPEG you took yourself instead
//   show-and-tell feedback <name> reply <id> <question>        ask the reviewer; shows as "Questions for you"
//     --plan          say what you'll do and ask for a go-ahead; the reviewer gets Go ahead
//   show-and-tell feedback <name> shot <id> [--before|--after] [--shot-file <f>]
//                                                               photograph a note's target now (before: open notes; after: closed)
//   show-and-tell feedback <name> annotate <page url> <comment> [--selector <css>] [--severity blocking|important|suggestion] [--replace] [--create]
//                                       [--suggest-text "<new text>" | --suggest-tweak "<property>=<value>"]
//                                                               leave the agent's own note on a page (needs serve --critique to show),
//                                                               optionally with a change the reviewer can preview and accept
//   show-and-tell feedback <name> clear-critique               delete every agent note on the project
//   show-and-tell feedback <name> apply [id…] [--yes]          write text edits that match the source exactly once;
//                                                               dry run (a diff per note) unless --yes
//   show-and-tell feedback <name> export [--format md|json]    the round as a document, to stdout
//   show-and-tell feedback <name> export --github [--repo o/r] [--label x] [--yes]   one GitHub issue (dry run without --yes)
//   show-and-tell feedback <name> export --pr <n> [--repo o/r] [--yes]              one PR review with line comments
//
// Works on the store directly (server/agent.js), so the review server does not
// have to be running. When it is, the toolbar picks changes up within ~3s.
// Every command refuses a project name with no store (and lists the ones that
// exist) rather than reporting "no feedback" for a typo; `annotate --create`
// is the one way to start a store from here.
import { parseArgs, positiveNumber, UsageError, assertSlug } from './lib.mjs';
import { openProject, unknownProject, SEVERITIES } from '../server/agent.js';
import { applyEdits, renderApply } from '../server/apply.js';
import { exportMarkdown, exportJson, githubIssue, githubPrReview } from '../server/export.js';

const USAGE = [
  'usage: show-and-tell feedback <name> list|json [--all] [--agent] [--src <dir>] [--by <reviewer>]',
  '       show-and-tell feedback <name> wait [--timeout <seconds>]',
  '       show-and-tell feedback <name> resolve|dismiss|acknowledge <id>[,<id>…] [text] [--same-target] [--shot | --shot-file <png|jpg>]',
  '       show-and-tell feedback <name> reply <id> <question> [--plan]',
  '       show-and-tell feedback <name> shot <id> [--before | --after] [--shot-file <png|jpg>]',
  `       show-and-tell feedback <name> annotate <page url> "<comment>" [--selector <css>] [--severity ${SEVERITIES.join('|')}] [--replace] [--create]`,
  '                                           [--suggest-text "<new text>" | --suggest-tweak "<property>=<value>"]',
  '       show-and-tell feedback <name> clear-critique',
  '       show-and-tell feedback <name> apply [id…] [--yes] [--include-code <id,…>] [--src <dir>]',
  '       show-and-tell feedback <name> export [--format md|json] [--all] [--github | --pr <n>] [--repo owner/name] [--label x] [--yes]',
].join('\n');
const COMMANDS = new Set(['list', 'json', 'wait', 'resolve', 'dismiss', 'reply', 'acknowledge', 'shot', 'annotate', 'clear-critique', 'apply', 'export']);

const usage = (why) => new UsageError(why ? `${why}\n${USAGE}` : USAGE);
if (process.argv.slice(2).some((a) => a === '--help' || a === '-h')) { console.log(USAGE); process.exit(0); }

// Switches never take a value, so `--yes abc` keeps abc as a positional.
const args = parseArgs(process.argv.slice(2), { boolean: ['all', 'replace', 'yes', 'github', 'agent', 'create', 'same-target', 'shot', 'plan', 'before', 'after'] });
const [rawName, cmd = 'list', id, ...rest] = args._;

try {
  if (rawName === undefined) throw usage('feedback needs a project name.');
  assertSlug(rawName);
  if (!COMMANDS.has(cmd)) throw usage(`unknown command "${cmd}".`);
  if (typeof args.src === 'boolean') throw usage('--src needs a directory.');
  const timeout = cmd === 'wait' ? positiveNumber(args.timeout, 'timeout', 3600) : undefined;

  const p = openProject(rawName, { src: args.src });
  if (!p.exists() && !(cmd === 'annotate' && args.create)) {
    throw new UsageError(unknownProject(p.name) + (cmd === 'annotate' ? ' Or pass --create to start it from here.' : ''));
  }
  const filter = { all: !!args.all, ...(typeof args.by === 'string' ? { reviewer: args.by } : {}) };

  if (cmd === 'list' || cmd === 'json') {
    // --agent: your own critique notes, with what the reviewer said back.
    const list = args.agent ? p.critique(filter) : p.read(filter);
    if (cmd === 'json') console.log(JSON.stringify(list, null, 2));
    else if (args.agent && !list.length) console.log(`No ${filter.all ? '' : 'open '}critique notes on "${p.name}".`);
    else console.log(p.render(list, filter));
    process.exit(0);
  }

  if (cmd === 'wait') {
    console.log(`Waiting on "${p.name}" — press "Send to agent" in the toolbar, or answer a question.`);
    const r = await p.wait({ timeout });
    if (r.reason === 'timeout') { console.log('Timed out with nothing new.'); process.exit(3); }
    if (r.reason === 'round') {
      console.log('Reviewer sent the round.\n');
      console.log(p.render(r.list));
    } else {
      // The answers are the news: show those notes first, not buried under the whole round.
      const answered = new Set(r.answered);
      const hit = r.list.filter((a) => answered.has(a.id));
      console.log(`Reviewer answered ${r.answered.length} question(s): ${r.answered.join(', ')}\n`);
      if (hit.length) console.log(p.render(hit));
      const rest = r.list.length - hit.length;
      if (rest > 0) console.log(`\n${rest} other open note(s). \`feedback ${p.name} list\` shows them.`);
    }
    if (r.critique?.length) console.log(`\n# Replies to your critique\n${p.render(r.critique)}`);
    process.exit(0);
  }

  const shotFile = args['shot-file'];
  if (shotFile === true) throw usage('--shot-file needs the path of a PNG or JPEG.');
  const wantsShot = !!args.shot || typeof shotFile === 'string';
  if (args.shot && typeof shotFile === 'string') throw usage('pass --shot or --shot-file, not both.');
  if (args.before && args.after) throw usage('pass --before or --after, not both.');
  const shotLine = (sh) => sh ? ` · ${sh.kind} shot ${sh.width}×${sh.height}${Number.isFinite(sh.time) ? (sh.untimed ? ` with the page's timeline at ${sh.time.toFixed(2)} s (this note has no time)` : ` at ${sh.time.toFixed(2)} s`) : ''}${sh.unsettled ? ' (a video was still loading: look at the picture)' : ''}${sh.found === false ? ' (target not found: whole viewport)' : ''}` : '';

  if (cmd === 'shot') {
    if (!id) throw usage('shot needs a note id.');
    if (args.shot) throw usage('shot takes a picture already; --shot-file attaches your own instead.');
    const kind = args.before ? 'before' : args.after ? 'after' : undefined;
    const meta = await p.takeShot(id, { kind, ...(typeof shotFile === 'string' ? { file: shotFile } : {}) });
    const view = await p.attachShot(id, meta);
    console.log(`shot → ${view.id} (${view.status})${shotLine(meta)}`);
    process.exit(0);
  }

  if (['resolve', 'dismiss', 'reply', 'acknowledge'].includes(cmd)) {
    if (!id) throw usage(`${cmd} needs a note id.`);
    if (args.plan && cmd !== 'reply') throw usage('--plan is for reply.');
    if (wantsShot && !['resolve', 'dismiss'].includes(cmd)) throw usage(`--shot is for resolve and dismiss; \`feedback ${p.name} shot <id>\` takes one on its own.`);
    const ids = p.expandIds(id, { sameTarget: !!args['same-target'] });
    if (cmd === 'reply' && ids.length > 1) throw usage('reply takes one note id.');
    let failed = 0;
    for (const one of ids) {
      try {
        // The proof first: a note is not closed on a picture that failed.
        const shot = wantsShot ? await p.takeShot(one, { kind: 'after', ...(typeof shotFile === 'string' ? { file: shotFile } : {}) }) : null;
        const view = await p.act(cmd, one, rest.join(' '), { plan: !!args.plan, shot });
        console.log(`${cmd} → ${view.id} (${view.status})${view.resolution ? `: ${view.resolution}` : ''}${shotLine(shot)}${args.plan ? ' · plan: the reviewer gets Go ahead' : ''}`);
      } catch (e) { failed++; console.error(`${cmd} → ${one}: ${e.message}`); }
    }
    process.exit(failed ? 1 : 0);
  }

  if (cmd === 'annotate') {
    const comment = rest.join(' ').trim();
    if (!id || !comment) throw usage('annotate needs a page URL and a comment.');
    const item = { comment, ...(typeof args.selector === 'string' ? { selector: args.selector } : {}), ...(typeof args.severity === 'string' ? { severity: args.severity } : {}) };
    // A suggested fix (show-and-tell.pen 9.2). The text's `from` is the target's
    // current text, which only the reviewer's browser can read, so it is left out.
    if (args['suggest-text'] !== undefined && args['suggest-tweak'] !== undefined) throw usage('pass --suggest-text or --suggest-tweak, not both.');
    if (args['suggest-text'] !== undefined) {
      if (typeof args['suggest-text'] !== 'string') throw usage('--suggest-text needs the new text.');
      item.suggestion = { kind: 'text', to: args['suggest-text'] };
    }
    if (args['suggest-tweak'] !== undefined) {
      const m = /^\s*([a-zA-Z-]+)\s*=\s*(.+)$/.exec(typeof args['suggest-tweak'] === 'string' ? args['suggest-tweak'] : '');
      if (!m) throw usage('--suggest-tweak takes "<property>=<value>", e.g. "min-height=44px".');
      item.suggestion = { kind: 'tweak', property: m[1], to: m[2].trim() };
    }
    const r = await p.annotate(id, [item], { replace: !!args.replace, create: !!args.create });
    for (const a of r.annotations) console.log(`annotate → ${a.id} on ${r.url}${a.selector ? ` at ${a.selector}` : ' (page-level)'}${a.severity ? ` · ${a.severity}` : ''}${a.suggestion ? ` · suggests a ${a.suggestion.kind} change` : ''}`);
    console.log('Shows in the page as a critique marker when the review server runs with --critique.');
    process.exit(0);
  }

  if (cmd === 'clear-critique') {
    const n = await p.clearCritique();
    console.log(`clear-critique → removed ${n} agent note(s) from "${p.name}"`);
    process.exit(0);
  }

  if (cmd === 'apply') {
    const ids = [id, ...rest].filter(Boolean);
    const result = await applyEdits(p, { ids, yes: !!args.yes, includeCode: typeof args['include-code'] === 'string' ? args['include-code'].split(',').map((x) => x.trim()).filter(Boolean) : [] });
    console.log(renderApply(result, { yes: !!args.yes }));
    process.exit(result.results.some((r) => r.status === 'failed') ? 1 : 0);
  }

  if (cmd === 'export') {
    const format = args.format === undefined ? 'md' : args.format;
    // Exit 1, not 2: kept as it was before usage errors had their own code.
    if (format !== 'md' && format !== 'json') throw new Error(`--format must be md or json, got "${format === true ? '' : format}".`);
    const list = p.items(filter);
    const opts = { ...filter, repo: args.repo, label: args.label, title: typeof args.title === 'string' ? args.title : undefined, yes: !!args.yes };
    if (args.pr !== undefined) console.log(githubPrReview(p, list, { ...opts, pr: args.pr }));
    else if (args.github) console.log(githubIssue(p, list, opts));
    else if (format === 'json') console.log(exportJson(p, list));
    else process.stdout.write(exportMarkdown(p, list, filter));
    process.exit(0);
  }
} catch (e) {
  console.error(e.message);
  process.exit(e instanceof UsageError ? 2 : 1);
}
