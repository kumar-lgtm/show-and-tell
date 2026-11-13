# Running a review round (for coding agents)

You are working with one or more reviewers who leave notes on the running app
with the show-and-tell toolbar. Your job: read their notes, ask when unsure,
change the source, and close each note. The detail behind each step is in
[`docs/agent-reference.md`](docs/agent-reference.md).

**Setting the tool up for the first time?** Start with
[`docs/agent-setup.md`](docs/agent-setup.md): it goes from a fresh clone to a
live toolbar, then sends you back here for the round.

`kit() { node "<path to show-and-tell>/bin/show-and-tell.mjs" "$@"; }` (a function, so it
works in zsh too; or `pnpm exec show-and-tell` when the project has it as a dev
dependency) ·
`<name>` is a stable `[a-z0-9-]` name for the project. Reuse it across rounds.

## Set up (once per session)

**If the project uses a plugin** (`show-and-tell/vite` in `vite.config.*`,
`show-and-tell/astro` in `astro.config.*`, or `withShowAndTell` +
`<ShowAndTell />` for Next.js): there is nothing to start or install. Start
the dev server as usual. `<name>` is the plugin's `name` option, else the
`package.json` name sanitised; the dev server's log prints it. Skip to step 4.

Otherwise:

1. The app's dev server must be running. Note its origin, e.g. `http://localhost:5173`.
2. Start the review server in the background: `kit serve --origin http://localhost:5173 --name <name>`.
   On `EADDRINUSE`, never stop another project's server: pass a free `--port`
   to both serve and install. `kit servers` lists what is running.
3. Install the loader with the same name (and port): `kit install <project dir> --name <name> [--port 55931]`.
   Storybook: [reference](docs/agent-reference.md#set-up-detail).
4. Tell the reviewer it's live and what URL to open. Several people can review
   at once; every note is signed with its author.

## The round

1. Wait in the background: `kit feedback <name> wait --src <project dir>`. It
   exits on **Send** or an answer and prints the list; exit 3 means it timed
   out with nothing new, so start it again.
2. Read the batch and say back how you read it before editing. For each note:
   - `find: file:line` is a lead, not an answer; `in source:` means the new text is already there, so resolve it.
   - The viewport it was left at. Reproduce there, fix the cause (a phone symptom can
     need a shared layout fix, not a phone-only override) and check the sizes either side.
   - `reopened:` / `still off:`: they checked your earlier fix and it isn't right yet.
   - `tweak:`, `from critique:`, `· Ana` and the rest: [reading each note](docs/agent-reference.md#reading-each-note).
3. If a note is ambiguous, ask instead of guessing:
   `kit feedback <name> reply <id> "Monthly or annual price?"`. For a note about
   an idea rather than a measurement, say what you'll do and get a go-ahead:
   `reply <id> "Here's what I'll do: …" --plan`. Run `wait` again; it wakes on their answer.
4. Once a change is in the source **and you have checked it on the page**, close the note:
   ```bash
   kit feedback <name> resolve <id> "what changed"
   kit feedback <name> resolve <id> "what changed" --shot          # + a screenshot at their viewport, shown in Check
   kit feedback <name> resolve <id>,<id> "one change covered these"
   kit feedback <name> resolve <id> "what changed" --same-target   # every open voice note spoken at that target
   kit feedback <name> dismiss <id> "why not"
   ```
   Voice splits one thought at pauses into several notes on one target;
   `--same-target` closes them together, so read them all first. Never resolve
   a note you haven't applied. If you won't apply it, dismiss it with a reason;
   if you can't yet, leave it open and reply.
5. For a copy round, `kit feedback <name> apply --src <project dir>` is a dry run
   (every diff and skip reason); `--yes` writes and resolves. Fix the skipped
   ones by hand and run the project's tests. [What it skips](docs/agent-reference.md#apply-what-it-writes-and-skips).
6. `kit feedback <name> export` prints the round as markdown. `--github` and
   `--pr <n>` post through `gh` only with `--yes`: show the dry run and ask
   before posting.

## Also

- **Your own notes on the page** (critique, `annotate`): [reference](docs/agent-reference.md#critique-pointing-things-out-yourself).
- **MCP** (`kit mcp --project <name> --src <dir>`): the same tools; `apply` and `export` are CLI only. [Reference](docs/agent-reference.md#over-mcp).
- **A reviewer on another machine:** `kit share … --tunnel`. The key grants the
  whole dev server: ask before running it, give the link only to the person
  the user names, never post it, and stop it when the round is done.
- **Before committing:** the loader is stripped from commits automatically;
  `kit install <dir> --remove`, then `--check`, removes it. Stop the review server.
- **Gotchas** (notes that vanished, a Send you missed, overlays): [reference](docs/agent-reference.md#gotchas).
