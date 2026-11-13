// Regressions from the production-readiness audit: a session URL that does not
// parse, JSON bodies that are not objects, help that exits 0 and writes
// nothing, install's argument errors, and the skill's path through a symlink.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ORIGIN, uniqueName, seedNote, cli, cleanup } from './_seed.mjs';

const { handle } = await import('../server/store.js');
const tmp = mkdtempSync(join(tmpdir(), 'agk-prod-'));
after(() => { cleanup(); rmSync(tmp, { recursive: true, force: true }); });

async function api(name, method, rest, raw) {
  const res = await handle(new Request(`http://127.0.0.1:55930/__ag/${rest}`, {
    method, headers: { 'Content-Type': 'application/json', Origin: ORIGIN }, body: raw,
  }), name, rest);
  return { status: res.status, body: await res.json().catch(() => null) };
}

test('a session URL that is not a web URL is refused, and never breaks the agent\'s read', async () => {
  const name = uniqueName('badurl');
  for (const url of ['not a url', 'javascript:alert(1)', 'file:///etc/passwd']) {
    assert.equal((await api(name, 'POST', 'sessions', JSON.stringify({ url }))).status, 422, url);
  }
  await seedNote(name, { comment: 'still readable' });
  const out = cli(['feedback', name, 'list']);
  assert.equal(out.code, 0, out.err);
  assert.match(out.out, /still readable/);
});

test('a JSON body that is not an object is treated as empty, not a crash', async () => {
  const name = uniqueName('bodies');
  for (const raw of ['null', '5', '"text"', '[1,2]']) {
    const r = await api(name, 'POST', 'sessions', raw);
    assert.equal(r.status, 422, `POST sessions ${raw}: ${r.status}`);
  }
  const note = await seedNote(name, { comment: 'keep me' });
  for (const raw of ['null', '5']) {
    const r = await api(name, 'PATCH', `annotations/${note.id}`, raw);
    assert.ok(r.status < 500, `PATCH ${raw}: ${r.status}`);
  }
});

test('help prints to stdout and exits 0, for the CLI and each command that takes arguments', () => {
  for (const args of [['--help'], ['-h'], ['help'], [], ['serve', '--help'], ['share', '--help'], ['feedback', '--help'], ['install', '--help']]) {
    const r = cli(args);
    assert.equal(r.code, 0, `${args.join(' ') || '(none)'}: ${r.err}`);
    assert.match(r.out, /usage: show-and-tell/, args.join(' '));
  }
  assert.equal(cli(['nope']).code, 2, 'an unknown command is still a usage error');
});

test('install --help writes nothing; a bad port or a missing folder is a usage error, not a stack', () => {
  const dir = mkdtempSync(join(tmp, 'app-'));
  const page = '<html><head></head><body></body></html>\n';
  writeFileSync(join(dir, 'index.html'), page);
  assert.equal(cli(['install', '--help'], { cwd: dir }).code, 0);
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), page, '--help left the entry file alone');
  for (const args of [['install', dir, '--port', 'abc'], ['install', dir, '--port'], ['install', join(dir, 'missing')]]) {
    const r = cli(args);
    assert.equal(r.code, 2, args.join(' '));
    assert.doesNotMatch(r.err, /\n\s+at /, 'no stack trace');
  }
  assert.equal(readFileSync(join(dir, 'index.html'), 'utf8'), page);
});

test('the skill finds the repo through the symlink it is installed by', () => {
  const skill = fileURLToPath(new URL('../skill/show-and-tell', import.meta.url));
  const repo = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
  const link = join(mkdtempSync(join(tmp, 'skills-')), 'show-and-tell');
  symlinkSync(skill, link);
  // The line SKILL.md tells the agent to run.
  const kit = execFileSync('bash', ['-c', 'cd -P "$1" && cd ../.. && pwd', '_', link], { encoding: 'utf8' }).trim();
  assert.equal(kit, execFileSync('bash', ['-c', 'cd -P "$1" && pwd', '_', repo], { encoding: 'utf8' }).trim());
  assert.match(readFileSync(join(skill, 'SKILL.md'), 'utf8'), /KIT="\$\(cd -P /);
  assert.match(readFileSync(join(skill, 'scripts/voice-server.sh'), 'utf8'), /cd -P "\$\(dirname "\$\{BASH_SOURCE\[0\]\}"\)" && cd \.\.\/\.\.\/\.\. && pwd/);
});
