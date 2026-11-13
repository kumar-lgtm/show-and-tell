# Setting up Show and tell from this repo (for coding agents)

You are a coding agent and someone has asked you to set up Show and tell for
their project. This page takes you from nothing to a live toolbar and a first
review round. Follow it in order. Each step says how to tell it worked.

Show and tell is a review toolbar for a **local dev server**. The person
reviewing points at the page and types, says or edits what should change. You
get notes with source pointers, fix the code, and close each note.

Read these when the step sends you there, not before:

- [`AGENTS.md`](../AGENTS.md): how a review round runs.
- [`skill/show-and-tell/SKILL.md`](../skill/show-and-tell/SKILL.md): the same round as an agent skill, with more detail.
- [`docs/agent-reference.md`](agent-reference.md): every command and every gotcha.

## 0. Check what you have

```bash
node --version    # must be 22.5 or newer (the server uses node:sqlite)
git --version
rg --version      # optional: without ripgrep, notes arrive without file:line pointers
```

If Node is older than 22.5, stop and tell the person. Do not work around it.

**If your tool runs commands in a sandbox:** the review server listens on a
local port (55930 by default) and writes notes to `~/.show-and-tell/`. If a
command fails with `EPERM` or `EADDRINUSE`, read the error before retrying:
`EPERM` is the sandbox, `EADDRINUSE` is another project's server.

## 1. Get the repo

Clone it **next to** the project, never inside it. From the project's root:

```bash
git clone https://github.com/kumar-lgtm/show-and-tell.git ../show-and-tell
KIT="$(cd ../show-and-tell && pwd)"
st() { node --no-warnings "$KIT/bin/show-and-tell.mjs" "$@"; }   # a function, so it works in zsh
st --help
```

If your shell does not keep variables and functions between commands, define
`KIT` and `st` again at the start of each command, or call
`node --no-warnings /absolute/path/to/show-and-tell/bin/show-and-tell.mjs`
directly. `AGENTS.md` calls the same function `kit`; they are the same thing.

There is nothing to install or build: the toolbar ships prebuilt in `dist/`.
`pnpm install` is only needed to rebuild the toolbar or run the tests.

**Worked if:** `st --help` prints the list of commands (`serve`, `install`,
`feedback`, …).

## 2. See it working before touching the project (optional, one minute)

```bash
node "$KIT/scripts/prototype.mjs"      # a demo pricing page with the toolbar, on http://127.0.0.1:8877
```

Run it in the background, give the person the URL, and stop it when they have
seen it. Set `PORT=<free port>` if 8877 is taken. Notes from the demo go to
`.prototype-data/` inside the clone, not to the project.

## 3. Install the skill (once per machine)

- **Claude Code:** `mkdir -p ~/.claude/skills && ln -s "$KIT/skill/show-and-tell" ~/.claude/skills/show-and-tell`
- **Codex, Cursor, others:** read `skill/show-and-tell/SKILL.md` directly, or
  copy the folder to wherever your tool reads skills. Keep the clone: the skill
  runs the CLI from it.

Skip this if you will only follow `AGENTS.md`; it covers the same round.

## 4. Put the toolbar on the project

Pick a stable name for the project, lowercase letters, digits and dashes, for
example `acme-site`. Use the same name every time.

**Any project with a dev server** (plain HTML, Vite, Next.js, Astro, SvelteKit,
CRA, Ghost, Storybook):

```bash
# the project's dev server is already running, e.g. on http://localhost:5173
st serve --origin http://localhost:5173 --name acme-site     # run in the background; it keeps running
st install /path/to/project --name acme-site                  # adds one dev-only line to the entry file
```

`install` prints which file it changed and why. If it cannot find the entry
file, pass the file that renders `<head>`.

If port 55930 is in use, **never stop the other server**: it belongs to another
project. Pass a free `--port` to both `serve` and `install`. `st servers` lists
what is running.

**Vite, Astro or Next.js, if the person wants no extra terminal:** the plugins
in the README's "Framework plugins" section replace both commands. They add a
dev dependency to the project, so ask before choosing this route.

**Worked if:** the dev server's page shows a round Show and tell button in the
bottom-right corner, and `st feedback acme-site list` runs without an error.
Tell the person the URL to open. The bar starts closed: they click the round
button, or press ⌘⇧F (Ctrl⇧F on Windows and Linux), to open it. With the bar
open they press **N** to comment, **V** to talk, **T** to edit text, then
**Send**. **Shift T** opens every string on the page and works with the bar
closed too.

## 5. Run the round

```bash
st feedback acme-site wait --src /path/to/project    # in the background; exits when they press Send
```

Then follow [`AGENTS.md`](../AGENTS.md) from "The round": read the batch, say
back how you read it, ask when a note is ambiguous, fix the source, check the
fix on the page, and close each note with `resolve` (or `dismiss` with a
reason). Exit code 3 from `wait` means it timed out with nothing new: start it
again.

Three rules that matter most:

1. `find: file:line` is a lead, not an answer. Open the file and confirm.
2. Never resolve a note you have not applied and checked.
3. Reproduce at the viewport the note was left at.

## 6. Take it out again

```bash
st install /path/to/project --remove     # restores the entry file byte for byte
st install /path/to/project --check      # exits 1 while the line is still there
```

Then stop the review server you started. The loader line is also kept out of
every commit by a local git filter, and it only runs on `localhost`, so
nothing reaches production either way. Notes stay in `~/.show-and-tell/` on
this machine.

## What to tell the person when you are done

- The URL the toolbar is on, and the project name you used.
- How to open the bar (click the round button, or ⌘⇧F / Ctrl⇧F), then the keys:
  N comment, V talk, T edit text, Shift T all text; then Send.
- That the first use of Talk downloads a local speech model and can take a few
  minutes; it needs Python 3.10 to 3.13 or `uv`. `SHOW_AND_TELL_VOICE=off`
  turns it off.
- That you are waiting for their round.

## If something goes wrong

| What you see | What it means |
| --- | --- |
| `st --help` fails | Check `node --version` first. |
| No toolbar on the page | The page must be on `localhost` or `127.0.0.1`; `serve --name` and `install --name` must match; reload after `install`. |
| `EADDRINUSE` on `serve` | Another project's review server holds the port. Use `--port` on both commands. |
| Notes without `find:` | ripgrep is missing, or `--src` does not point at the project. |
| A note you fixed is still open | You have to close it: `st feedback <name> resolve <id> "what changed"`. |

More in [`docs/agent-reference.md`](agent-reference.md#gotchas).
