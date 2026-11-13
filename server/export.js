// `feedback <name> export`: the round as a document. Markdown (default) or JSON
// to stdout, or posted to GitHub through the `gh` CLI: one issue (`--github`)
// or one PR review with line comments (`--pr <n>`).
//
// GitHub is an external service, so both GitHub modes are dry runs unless
// `yes` is passed: they print exactly what they would create and stop.
import { execFileSync } from 'node:child_process';
import { relative, posix, sep } from 'node:path';
import { describeAnnotation, fenceValue, voiceContexts } from './format.js';
import { isOpen } from './agent.js';

/** A fence longer than any backtick run inside, so reviewer text can't close it. */
function fence(text, lang = 'text') {
  const run = Math.max(2, ...(String(text).match(/`+/g) || []).map((s) => s.length));
  const f = '`'.repeat(run + 1);
  return `${f}${lang}\n${text}\n${f}`;
}
const quote = (text) => String(text).replace(/\r\n?/g, '\n').split('\n').map((l) => `> ${l}`).join('\n');
const code = (s) => { const t = String(s); const n = Math.max(0, ...(t.match(/`+/g) || []).map((x) => x.length)) + 1; const f = '`'.repeat(n); return `${f}${n > 1 ? ' ' : ''}${t}${n > 1 ? ' ' : ''}${f}`; };
// GitHub notifies anyone @mentioned in an issue, review or comment, and any
// markdown export may end up pasted into one. Reviewer text is not ours to send
// notifications with: a zero-width joiner keeps it readable and inert. JSON
// exports stay raw (they are data, not something to paste).
const inert = (s) => String(s).replace(/@(?=[A-Za-z0-9-])/g, '@‍');

/** Where a note points in the source: [{file, line}] relative to the project root. */
export function locate(p, a) {
  if (!isOpen(a)) return [];
  let hits = p.pointers(a).hits;
  if (!hits.length && a.edit?.to) hits = p.hits(a.edit.to); // already applied: point at the new text
  if (!hits.length && a.sourceFile) {
    const m = String(a.sourceFile).match(/^(.+?):(\d+)/);
    if (m) hits = [{ file: m[1], line: Number(m[2]) }];
  }
  return hits;
}

/**
 * One note as markdown. `level` is the heading depth. @handles are inert by
 * default: any markdown export may be pasted into GitHub. `mentions: true` keeps them live.
 */
export function noteMarkdown(p, a, { level = 3, mentions = false } = {}) {
  const t = mentions ? (s) => s : inert;
  const { headline, rows } = describeAnnotation(a);
  const out = [];
  const title = a.kind === 'edit' && a.edit ? 'Text edit' : a.kind === 'copy' && a.copy ? 'Copy edit' : headline.length > 80 ? `${headline.slice(0, 77)}…` : headline;
  out.push(`${'#'.repeat(level)} ${t(title)} · ${code(a.id)}`);
  const meta = [];
  if (a.viewport?.width) meta.push(['Viewport', `${a.viewport.name || 'captured'} · ${a.viewport.width}×${a.viewport.height || '?'}`]);
  if (a.reviewer) meta.push(['Reviewer', t(a.reviewer)]);
  meta.push(['Status', a.status + (a.resolution ? `: ${t(a.resolution)}` : '')]);
  for (const [k, v] of rows) {
    if (['FROM', 'TO', 'viewport'].includes(k)) continue;
    meta.push([k[0].toUpperCase() + k.slice(1), ['selector', 'anchor', 'near', 'element'].includes(k) ? code(v) : t(v)]);
  }
  const hits = locate(p, a);
  if (hits.length) meta.push(['Source', hits.map((h) => code(`${h.file}:${h.line}`)).join(', ')]);
  else if (a.kind === 'edit' && isOpen(a)) meta.push(['Source', 'old text not found verbatim in the source']);
  out.push(meta.map(([k, v]) => `- **${k}:** ${v}`).join('\n'));

  if (a.kind === 'edit' && a.edit) {
    out.push(`**FROM**\n${fence(a.edit.from ?? '')}`, `**TO**\n${fence(a.edit.to ?? '')}`);
  } else if (a.kind === 'copy' && a.copy) {
    out.push(`**FROM**\n${fence(a.copy.from ?? '')}`, `**TO**\n${fence(a.copy.to ?? '')}`);
  } else if (!['placement', 'rearrange', 'critique'].includes(a.kind) && a.comment) {
    out.push(quote(t(a.comment))); // the reviewer's own words, line breaks kept
  }
  if (a.replies?.length) {
    out.push('**Q&A**\n' + a.replies.map((m) => `- **${m.from === 'agent' ? 'Agent' : 'Reviewer'}${m.name ? ` (${t(m.name)})` : ''}:** ${t(String(m.message).replace(/\s*\n\s*/g, ' '))}`).join('\n'));
  }
  return out.join('\n\n');
}

/** The whole list as one markdown document, grouped by page. @handles inert unless `mentions: true`. */
export function exportMarkdown(p, list, { all = false, mentions = false, title, level = 1 } = {}) {
  const t = mentions ? (s) => s : inert;
  const pages = [...new Set(list.map((a) => a.pagePath))];
  const h = (n) => '#'.repeat(Math.min(6, level + n));
  const out = [`${h(0)} ${title || `Review feedback: ${p.name}`}`];
  const r = p.round();
  const facts = [`${list.length} ${all ? '' : 'open '}note(s) on ${pages.length} page(s)`];
  if (r) facts.push(`round sent ${new Date(r.ts).toISOString().slice(0, 16).replace('T', ' ')}${r.reviewer ? ` by ${t(r.reviewer)}` : ''}`);
  out.push(facts.join(' · '));
  if (!list.length) out.push(`No ${all ? '' : 'open '}feedback.`);
  for (const v of voiceContexts(list)) {
    out.push(`${h(1)} Voice context · ${code(t(fenceValue(v.sessionId)))}${v.reviewer ? ` · ${code(t(fenceValue(v.reviewer)))}` : ''}`);
    out.push(`${v.count} listed passages in speech order. Target changes can split sentences. Only listed notes are included; use the anchors and alignment warnings below.`);
    out.push('Whole sentences in speech order. `[→ T#]` marks where the reviewer pointed at a new target mid-speech; the words after it were spoken while that target was selected.');
    out.push(v.sentences.map((s, i) => `${i + 1}. ${t(fenceValue(s)).replace(/[\\`*_<>#|]/g, (c) => '\\' + c)}`).join('\n'));
    if (v.omittedSentences) out.push(`${v.omittedSentences} more sentence(s) not shown; every word is in the notes below.`);
    out.push('**Targets**\n' + v.targets.map((x) => `- ${x.ref}: ${t(fenceValue(x.detail)).replace(/[\\`*_<>#|]/g, (c) => '\\' + c)}`).join('\n'));
  }
  for (const page of pages) {
    out.push(`${h(1)} ${code(page)}`);
    for (const a of list.filter((x) => x.pagePath === page)) out.push(noteMarkdown(p, a, { level: Math.min(6, level + 2), mentions }));
  }
  return out.join('\n\n') + '\n';
}

export function exportJson(p, list) {
  return JSON.stringify({
    project: p.name,
    exportedAt: new Date().toISOString(),
    src: p.root,
    round: p.round(),
    notes: list.map((a) => ({
      ...a,
      pointers: isOpen(a) ? p.pointers(a).rows.map(([label, text]) => ({ label, text })) : [],
      locations: locate(p, a),
    })),
  }, null, 2);
}

// ---- GitHub -------------------------------------------------------------

const labelsOf = (label) => (typeof label === 'string' ? label.split(',').map((s) => s.trim()).filter(Boolean) : []);
const shellQuote = (a) => (/^[\w@%+=:,./-]+$/.test(a) ? a : `'${String(a).replace(/'/g, `'\\''`)}'`);

function gh(args, { cwd, input } = {}) {
  try {
    return execFileSync('gh', args, { cwd, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    if (e.code === 'ENOENT') throw new Error('gh (GitHub CLI) is not on PATH. Install it and run `gh auth login`.');
    throw new Error(`gh ${args.slice(0, 2).join(' ')} failed: ${(e.stderr || e.message).toString().trim()}`);
  }
}

/** One issue with the markdown export as its body. */
export function githubIssue(p, list, { repo, label, title, yes = false, all = false } = {}) {
  const body = exportMarkdown(p, list, { all, mentions: false });
  const heading = title || `Review feedback: ${p.name} (${list.length} note${list.length === 1 ? '' : 's'})`;
  const args = ['issue', 'create', '--title', heading, '--body-file', '-'];
  if (typeof repo === 'string') args.push('--repo', repo);
  for (const l of labelsOf(label)) args.push('--label', l);
  if (!yes) {
    return [`Dry run: would run \`gh ${args.map(shellQuote).join(' ')}\` with this body (re-run with --yes to create it):`, '', body].join('\n');
  }
  const url = gh(args, { cwd: p.root, input: body }).trim();
  return `Created ${url}`;
}

/** Right-side line numbers present in a unified diff patch (added and context lines). */
export function diffLines(patch) {
  const lines = new Set();
  let right = 0;
  for (const l of String(patch || '').split('\n')) {
    const h = l.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (h) { right = Number(h[1]); continue; }
    if (!right || l.startsWith('\\')) continue;
    if (l.startsWith('-')) continue;
    if (l.startsWith('+') || l.startsWith(' ') || l === '') { lines.add(right); right++; }
  }
  return lines;
}

/** Path from the git root to `root`, posix style ('' when root is the repo root or not in git). */
function repoPrefix(root) {
  try {
    const top = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const rel = relative(top, root);
    return rel.startsWith('..') ? '' : rel.split(sep).join('/');
  } catch { return ''; }
}

/**
 * One PR review: a line comment for each note whose source pointer lands on a
 * line in the PR's diff, everything else in the review body.
 */
export function githubPrReview(p, list, { pr, repo, label, yes = false, all = false } = {}) {
  const n = Number(pr);
  if (!Number.isInteger(n) || n <= 0) throw new Error('--pr needs a pull request number');
  const slug = typeof repo === 'string' ? repo : '{owner}/{repo}'; // gh fills these in from the checkout
  const out = [];
  let files = new Map();
  try {
    const raw = gh(['api', '--paginate', `repos/${slug}/pulls/${n}/files`, '--jq', '.[] | {filename: .filename, patch: .patch}'], { cwd: p.root });
    for (const line of raw.split('\n').filter(Boolean)) {
      const f = JSON.parse(line);
      files.set(f.filename, diffLines(f.patch));
    }
  } catch (e) {
    if (yes) throw e;
    out.push(`Could not read the PR's files (${e.message}); every note would go in the review body.`);
    files = new Map();
  }

  const prefix = repoPrefix(p.root);
  const comments = [], rest = [];
  for (const a of list) {
    const hit = locate(p, a).map((h) => ({ path: posix.join(prefix, h.file.split(sep).join('/')), line: h.line }))
      .find((h) => files.get(h.path)?.has(h.line));
    if (hit) comments.push({ path: hit.path, line: hit.line, side: 'RIGHT', body: noteMarkdown(p, a, { level: 4, mentions: false }) + `\n\n_Page: ${code(a.pagePath)}_` });
    else rest.push(a);
  }
  const body = [
    `**Review feedback from show-and-tell (${p.name})**: ${list.length} note(s), ${comments.length} on lines in this diff.`,
    rest.length ? exportMarkdown(p, rest, { all, mentions: false, title: 'Notes not on a changed line', level: 3 }) : '',
  ].filter(Boolean).join('\n\n');
  const review = { event: 'COMMENT', body, comments };
  const args = ['api', '--method', 'POST', `repos/${slug}/pulls/${n}/reviews`, '--input', '-'];
  const labelArgs = labelsOf(label).length ? ['pr', 'edit', String(n), ...(typeof repo === 'string' ? ['--repo', repo] : []), ...labelsOf(label).flatMap((l) => ['--add-label', l])] : null;

  if (!yes) {
    out.push(`Dry run: would post one review on PR #${n} (${slug}) with ${comments.length} line comment(s) and ${rest.length} note(s) in the body. Re-run with --yes to post it.`);
    for (const c of comments) out.push(`  ${c.path}:${c.line}`);
    out.push('', `gh ${args.map(shellQuote).join(' ')} <<'JSON'`, JSON.stringify(review, null, 2), 'JSON');
    if (labelArgs) out.push('', `gh ${labelArgs.map(shellQuote).join(' ')}`);
    return out.join('\n');
  }
  const res = gh(args, { cwd: p.root, input: JSON.stringify(review) });
  if (labelArgs) gh(labelArgs, { cwd: p.root });
  let url = '';
  try { url = JSON.parse(res).html_url || ''; } catch {}
  return `Posted a review on PR #${n} with ${comments.length} line comment(s)${url ? `: ${url}` : '.'}`;
}
