# Agent reference: the detail behind AGENTS.md

[`AGENTS.md`](../AGENTS.md) is the round in order, and this file holds the detail
it links to. Same rules; nothing here overrides it.

## Set-up detail

With a plugin, the review server runs inside the dev server and the loader is
added at serve time. Without a `name` option the plugin sanitises the
`package.json` name (`@acme/Web App` → `acme-web-app`).

`serve` binds a port (default 55930) and writes to `~/.show-and-tell/`. Install
the loader with the same name, and the same port when it isn't the default:

```bash
kit install <project dir> --name <name>                # default port 55930
kit install <project dir> --name <name> --port 55931   # when serve has --port 55931
```

Re-running `install` replaces the line. It carries the name, and the server
refuses a page that names another project. In a project that also has
Storybook, the line goes into the app's entry file; add `--storybook` to review
stories instead (then start `serve` with `--framed --route-key id`, and remove
it with `install <dir> --remove --storybook`).

`kit servers` lists the running review servers (port, name, origin) from disk,
so it works where `curl` can't reach localhost. On `EADDRINUSE`, serve names
the project that holds the port: never stop another project's server; pass a
free `--port` to both serve and install.

## Reading each note

- `find: file:line`: where the old, selected or clicked element's text lives.
  A string can repeat across components, variants or routes; check the one they saw.
- A question you ask with `reply` appears under **Questions for you** for the
  note's author. Your resolution shows under the item within a few seconds.
- `source` / `component`: captured by the toolbar when available.
- The viewport it was left at. Reproduce there, fix the cause (a phone symptom can
  need a shared layout fix, not a phone-only override) and check the sizes either side.
- `time:` / `in:` / `on screen:` / `sound:`: the page has its own timeline (a
  film, a HyperFrames preview) and the note was left at that moment, e.g. `time:
  14.20 s of 50.80 s`. `in:` is the timed part the target sits inside, `on
  screen:` and `sound:` are everything playing then, each with its span and file.
  The selector alone does not say when: a full-frame layer can sit over the
  scene they meant, so read `on screen:` too. `noted while playing` means they
  reacted mid-playback, so the moment may be a beat earlier. `resolve --shot`
  stops the page at that time first, and refuses with the reason when it cannot.
  A shot line that says `this note has no time` (a layout drag, a measured
  check) was taken where the fresh load rested, usually the first frame.
- `· Ana`: who wrote it. `list --by ana` shows one reviewer's notes.
- `reopened:` / `still off:`: the reviewer checked your earlier fix (Check the fix) and it is not right yet. The row quotes what you said then; the reply says what is still off.
- `tweak:` (Tweak mode): one property on one element, before → after, the
  scale token it moved onto and the rule that sets it now, e.g. `tweak: a.cta
  padding 12px 20px → 16px 24px (--space-4 · --space-5), rule in styles.css
  .cta`. Change that rule, using the token rather than the raw value. `off
  scale` means the reviewer chose a value outside the project's scale on purpose.
- `from critique:`: the reviewer chose Fix it on one of your critique notes,
  so it is their instruction now.

## `apply`: what it writes and skips

Copy notes (`COPY — replace this text at its source`, from the copy view)
carry their exact span (`at: file:line path`), so `apply` writes them
without searching. Text edits only write when their old text occurs exactly once, and skips (with a
reason) any whose new text could break the file: `<`, `>`, `{`, `}` in JSX or
HTML (`.js`/`.ts` files count, they may hold JSX), or a quote that could end
the string the text sits in. Fix the skipped ones by hand, and run the
project's tests afterwards.

## Handing the round off

To hand the round off, `kit feedback <name> export` prints it as markdown
(`--format json` for data). `@handles` are made inert in markdown so a paste
into GitHub notifies nobody. `--github` (one issue) and `--pr <n>` (one PR
review with line comments) go through `gh` and post only with `--yes`: run
the dry run, show it, and ask before posting.

## Critique: pointing things out yourself

`kit feedback <name> annotate <page url> "<comment>" --selector <css>
[--severity blocking|important|suggestion] [--replace]` leaves your own note on
the page. The reviewer sees it as a numbered marker in a **From the agent**
panel only when critique is on (`serve --critique`, or the plugin's
`critique: true`). Your notes never appear in `list`. `kit feedback <name>
clear-critique` removes them all.

Add `--suggest-text "<new text>"` or `--suggest-tweak "<property>=<value>"`
(e.g. `min-height=44px`) to attach a concrete change: the reviewer previews it
on the page and can drop it into their drafts. The reviewer decides every note:
**Fix it** turns it into their own note in the round (it shows in `list` with
`from critique: <id>`), **Not an issue** closes it with an optional reason.
`list --agent` (MCP `get_critique`) shows each decision, and `wait` wakes on
one. A note marked `MEASURED` is a fact the reviewer's browser measured (Run
checks: tap targets, clipped text, contrast), with its number and rule.

## Over MCP

If your client has the `show-and-tell` MCP server (`kit mcp --project <name>
--src <project dir>`, see the README), use its tools instead of the CLI:
`wait_for_round` / `get_pending` / `get_note` to read, `reply`, `resolve`,
`dismiss`, `acknowledge` to act, `annotate` / `clear_critique` for critique.
Same store, same rules. `wait_for_round` returns at most every 10 minutes; on
reason `timeout`, call it again. `apply` and `export` are CLI only.

## A reviewer somewhere else

`serve` and the plugins only work on this machine. For a reviewer on another
machine, `kit share --origin <dev server origin> --name <name> --tunnel` starts a
key-gated proxy and prints a link. The key grants access to the whole dev
server: give the link only to the person the user names, never post it, and
stop `share` when the round is done. Ask before running it.

## Before committing

With `install` on a git-tracked file, commits already leave the loader out: a
local clean filter (`.git/info/attributes`, never committed) strips the block
whenever the file is staged, so you can commit mid-round without removing it.
`kit install <project dir> --remove` restores the entry file byte for byte (`--check` exits 1 while the loader is still there), and deletes a
`preview-head.html` only if install created it. Stop the review server. With a
plugin there is nothing to remove. Notes stay on disk under `<name>`.

## Gotchas

- `list` shows open notes only. If the reviewer asks why a note disappeared,
  run `list --all` and say which change resolved it. A reviewer's **Clear all**
  clears their own notes; they stay in the history as dismissed.
- A Send that arrived while you weren't waiting is not lost: `wait` wakes at once
  for anything newer than your last `list`, `json` or `wait`.
- A committed text edit is the reviewer's intent, not a source change. The
  overlay keeps showing it until you resolve the note.
- Never resolve a note you haven't actually applied. Dismiss with a reason instead.
- Two dev servers for one project share one review server; if the first stops,
  the second takes the port over within a few seconds.
