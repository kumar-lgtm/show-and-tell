# Show and tell

Review rounds on your local dev server, with your coding agent. A reviewer points
at the page and says, types or edits what should change. The agent gets notes
with source pointers, fixes the code and closes each note, and the reviewer
watches it happen, checks each fix and reopens what isn't right.

Point, talk, type or edit text in place. Voice is local and free: speak a
review while you click or box parts of the page, then edit a transcript whose
passages keep their targets ([VOICE.md](VOICE.md)).

```bash
node scripts/prototype.mjs   # try it: a demo page with the toolbar on http://127.0.0.1:8877
```

**Watch it first (98 seconds):** [landscape](docs/video/show-and-tell-landscape.mp4) ·
[vertical](docs/video/show-and-tell-vertical.mp4) ·
[transcript](docs/video/transcript.md). The same film plays on the demo page,
[`docs/index.html`](docs/index.html): open that file in a browser.

**Install** (Node 22.5 or newer; tested on macOS, voice needs macOS or Linux).
It installs from this GitHub repo; pin a release tag so you get a build you
can verify:

```bash
pnpm add -D github:kumar-lgtm/show-and-tell#v0.1.0     # in a project, for the framework plugins
git clone --branch v0.1.0 https://github.com/kumar-lgtm/show-and-tell.git   # or a copy next to your project
```

Each [release](https://github.com/kumar-lgtm/show-and-tell/releases) also has
the package file, built by this repo's release workflow with a signed
provenance attestation. To check a download came from that workflow, unchanged:

```bash
gh attestation verify kumar-lgtm-show-and-tell-0.1.0.tgz -R kumar-lgtm/show-and-tell
pnpm add -D ./kumar-lgtm-show-and-tell-0.1.0.tgz
```

The package has no dependencies and no install scripts: nothing runs when you
install it. The toolbar ships prebuilt in `dist/`, and CI checks that it matches
the source on every push.

**Setting it up with an agent?** Paste this into your coding agent from inside
your project:

> Set up Show and tell for this project. Clone
> https://github.com/kumar-lgtm/show-and-tell.git next to this project (not
> inside it), then follow `docs/agent-setup.md` in that repo from the top. Tell
> me the URL to open when the toolbar is live.

[`docs/agent-setup.md`](docs/agent-setup.md) takes any agent (Claude Code,
Codex, Cursor, anything with a shell) from a fresh clone to a live toolbar and
a first round, and back out again.

Show and tell builds on [Agentation](https://www.npmjs.com/package/agentation)
by Benji Taylor, which supplies the click-to-annotate core; see
[Credits](#credits). The brand, the look and everything listed
below are this project's ([docs/brand.md](docs/brand.md)).

**It leaves nothing behind in what you ship.** The one line `install` adds runs
only on `localhost`, a local git filter keeps it out of every commit, and
`install --remove` restores the file byte for byte. With a framework plugin
nothing is written to your project at all, and builds are untouched.

## Use it with your coding agent

The repo ships an agent skill, [`skill/show-and-tell/SKILL.md`](skill/show-and-tell/SKILL.md).
It walks an agent through a whole round: start the review server, load the
toolbar, wait for the round, read the notes properly, ask questions in the page,
fix, verify, resolve and clean up. Install it once per machine.

- **Claude Code:** link the skill into your skills folder:
  ```bash
  mkdir -p ~/.claude/skills && ln -s "$PWD/skill/show-and-tell" ~/.claude/skills/show-and-tell   # run from the repo root
  ```
  For one project only, link it into that project's `.claude/skills/` instead.
- **Codex, Cursor and other agents:** point the agent at `skill/show-and-tell/SKILL.md`, or copy the folder to wherever your tool reads skills.

An agent starting from nothing should read [`docs/agent-setup.md`](docs/agent-setup.md) first.

Then ask your agent for "a show and tell round on this app". The skill finds
the kit from its own location, so keep it inside the repo, or link to it.

A review toolbar for your local dev server. A reviewer opens the app, clicks
anything to leave a note, edits copy in place and presses **Send to agent**. A
coding agent (Claude Code, Codex, anything with a shell) reads those notes from
the terminal with source pointers, asks questions back and resolves them. Every
answer and resolution shows up live in the reviewer's toolbar.

It is built on [Agentation](https://www.npmjs.com/package/agentation) (pinned to
3.0.2), extended with:

- **One bar, four modes:** Comment (N, click anything), Talk (V, speak while
  you point), Edit text (T) and Tweak (D, when loaded). Exactly one is on; names
  and keys are in tooltips. On a phone the current mode is one named button that
  opens a short sheet. Viewport, layout moves, pause, markers, notes as
  Markdown, clear and settings are under **More (…)**.
- **Edit text (T):** click any text on the page and rewrite it. Each change is a
  draft you commit, revise or reject, and it reaches the agent as a FROM → TO
  edit. **All text** (Shift T) opens every string on the page, full page.
- **Inbox:** grouped by where each note stands: **Needs you** (the agent asked),
  **Not sent yet**, **With the agent** and **Done**, with a jump-to-location
  link and the page for notes left elsewhere.
- **Send N:** the one labelled button. It counts the notes made since the last
  Send, marks the end of a round (`feedback wait` wakes on it) and reads
  **Sent** until there is something new.
- **The agent on the bar:** with the local listener, its status sits on the bar
  (icon alone while listening; a word while it works, asks or fails).
- **Agent replies:** the agent can ask a clarifying question on a note, and you
  answer it in the page.
- **Viewport monitor:** review at mobile 390, tablet 820 or desktop 1440 in a
  real-size frame. The viewport is recorded with every note.
- **Single-page apps:** notes follow client-side routes, so a note left on
  `/pricing` is filed under `/pricing`.

Nothing leaves your machine (unless you run `share`). Notes and toolbar state
live in SQLite under `~/.show-and-tell/`.

## Requirements

- Node **22.5 or newer** (it uses the built-in `node:sqlite`)
- [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) on your PATH for
  source pointers. Optional: without it, notes still list, just without
  `find: file:line`.

The toolbar bundle ships prebuilt in `dist/`, so there is nothing to install to
use it.

## Quick start

```bash
git clone <this repo> show-and-tell
alias show-and-tell="node $PWD/show-and-tell/bin/show-and-tell.mjs"

# 1. Start your app's dev server as usual, e.g. on http://localhost:5173

# 2. Start the review server beside it (one name per project; reuse it)
show-and-tell serve --origin http://localhost:5173 --name my-app

# 3. Add the one dev-only line that loads the toolbar
show-and-tell install path/to/my-app

# 4. Open http://localhost:5173: the toolbar is in the bottom-right corner
```

`install` finds your entry file: `app/layout.*` or `pages/_document.*` (Next.js),
`index.html` / `public/index.html` (Vite, CRA, plain HTML), `src/app.html`
(SvelteKit), `src/layouts/*.astro` (Astro) or `default.hbs` (Ghost). A project
that also has Storybook still gets the app entry; pass `--storybook` to install
into `.storybook/preview-head.html` instead (that is also the fallback when there
is no app entry). The output says which file it used and why. For anything
else, pass the file that renders `<head>`.

The installed line loads `/loader.js?name=<project>`, where the name is `--name`
or your `package.json` name, sanitised. Pass the same name to `serve --name`:
the review server refuses a page that names a different project, so one
project's page can't file notes under another's when they share a port.
Use `--port` on both if you don't use the default.

The line is gated twice: HTML versions only run on `localhost` / `127.0.0.1`, and
JSX versions only when `NODE_ENV=development`. It is still scaffolding, so take
it out before you commit:

```bash
show-and-tell install path/to/my-app --remove   # byte-identical restore
show-and-tell install path/to/my-app --check    # exits 1 while it's still there
```

`--remove` deletes a file only if `install` created it (a new
`.storybook/preview-head.html`); a file that existed before, even empty, is left
as it was. The block is written with the file's own line endings, so a CRLF
file stays CRLF.

### Try it

The repo has a demo page in `example/`. In three terminals:

```bash
python3 -m http.server 8123 -d example      # or: pnpm dlx serve example -l 8123
show-and-tell serve --origin http://localhost:8123 --name demo
show-and-tell install example --name demo
```

Open http://localhost:8123, leave a note, then `show-and-tell feedback demo list`.
`show-and-tell install example --remove` takes the line out again.

## Framework plugins

On Vite, Astro or Next.js, a plugin replaces both `serve` and `install`. The
review server starts inside your dev server and stops with it, and the loader is
added at serve time, so there's no second terminal and nothing to remove before
committing. Builds are untouched.

```bash
pnpm add -D github:kumar-lgtm/show-and-tell#v0.1.0     # or npm i -D, yarn add -D
```

**Vite** (`vite.config.js`):

```js
import showAndTell from '@kumar-lgtm/show-and-tell/vite';

export default { plugins: [showAndTell()] };
```

**Astro** (`astro.config.mjs`):

```js
import { defineConfig } from 'astro/config';
import showAndTell from '@kumar-lgtm/show-and-tell/astro';

export default defineConfig({ integrations: [showAndTell()] });
```

**Next.js** needs two pieces because its config can't add HTML. Wrap the config
to start the review server with `next dev`, then render the loader in the root
layout. `<ShowAndTell />` renders nothing unless `NODE_ENV` is `development`,
so it can stay committed.

```js
// next.config.mjs (next.config.ts works too)
import { withShowAndTell } from '@kumar-lgtm/show-and-tell/next';

export default withShowAndTell({ /* your config */ });
```

```jsx
// app/layout.jsx (or pages/_document.jsx, inside <body>)
import { ShowAndTell } from '@kumar-lgtm/show-and-tell/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ShowAndTell />
      </body>
    </html>
  );
}
```

Options, all optional, the same for every plugin:

| Option | Default | Meaning |
| --- | --- | --- |
| `name` | your `package.json` name | Project name for the store and `feedback`, sanitised to `[a-z0-9-]` (`@acme/web` → `acme-web`, `My App` → `my-app`). The loader sends it as `?name=`. On Next.js, pass the same `name` to `<ShowAndTell />`. |
| `port` | `55930` | Review server port. On Next.js, pass the same `port` to `<ShowAndTell />`. |
| `start` | `true` | `false` adds the loader only, for when you run `show-and-tell serve` yourself. |
| `framed`, `routeKey`, `critique`, `layoutIntent` | off | As `serve --framed`, `--route-key`, `--critique`, `--layout-intent`. |
| `storybook` (Vite only) | detected | Storybook's Vite builder: the loader skips Playwright story tests (`navigator.webdriver`) unless `?show-and-tell=1`, and `framed` / `routeKey: 'id'` default on. Detected from Storybook's own Vite plugins or a root under `.storybook/`; `true` / `false` overrides. |
| `origin` (Next.js only) | | Your dev server's origin, if it isn't on `localhost` / `127.0.0.1`. Any local port is accepted already. |

The agent's side is unchanged: `pnpm exec show-and-tell feedback <name> wait`.

**Two dev servers for one project** (say `vite` and `vite --port 5180`) share
one review server. The second finds the port taken by a review server with the
same `name` and attaches to it: it registers its page origin with the first
(over a loopback-only `POST /__origins`, which browsers can't call), so its
pages work too. It checks every few seconds that the first is still there; when
the first dev server stops, the second takes the port over and the toolbar
keeps working after a reload.

If the port has a `serve` you started yourself for the same `name`, the plugin
reuses it but can't add origins to it: a page on an origin `serve` wasn't given
gets 403s, and the dev server's log says to restart `serve` with that
`--origin`. When that `serve` stops, nothing takes over. A server for a
different name stops the dev server with an error naming both projects: give
one of them its own `port`.

The in-process server loads Node's built-in SQLite without printing its
"experimental feature" warning in your dev server's terminal. Only that one
warning is dropped; others still show.

## The agent's side

```bash
show-and-tell feedback my-app list --src path/to/my-app   # open notes, grouped by page
show-and-tell feedback my-app wait --src path/to/my-app   # block until "Send to agent" or an answer
show-and-tell feedback my-app reply <id> "Monthly or annual price?"
show-and-tell feedback my-app reply <id> "Here's what I'll do: …" --plan   # asks for a go-ahead: they get Go ahead
show-and-tell feedback my-app resolve <id> "Shortened to four words"
show-and-tell feedback my-app resolve <id> "Bolder" --shot            # + a screenshot of the target at their viewport
show-and-tell feedback my-app resolve <id> "Bolder" --shot-file a.png # + a screenshot you took yourself
show-and-tell feedback my-app shot <id>                               # a "before" screenshot of an open note
show-and-tell feedback my-app dismiss <id> "Keeping it: legal copy"
show-and-tell feedback my-app resolve <id>,<id> "One fix for both"     # a comma list
show-and-tell feedback my-app resolve <id> "Done" --same-target          # + every open voice note at that target
show-and-tell feedback my-app list --all                   # include closed notes
show-and-tell feedback my-app json                         # raw annotation objects

# Critique mode: the agent's own notes on a page (shown with serve --critique)
show-and-tell feedback my-app annotate http://localhost:5173/pricing "Headline wraps at 390px" \
  --selector "main h1" --severity blocking
show-and-tell feedback my-app annotate http://localhost:5173/pricing "Fresh take" --replace
show-and-tell feedback my-app clear-critique               # remove every agent note
show-and-tell feedback my-app apply --src path/to/my-app   # text edits as diffs (dry run); --yes writes them
show-and-tell feedback my-app export > review.md           # the round as markdown (--format json, --github, --pr <n>)
```

Each note in `list` gives what the reviewer said, the element and selector, the
viewport, and where it probably lives in your source (`find: src/Hero.tsx:12`).
A text edit whose new wording is already in the source is flagged
`in source: … (resolve it)`.

`feedback` reads the store directly, so it works whether or not the server is
running. With the server up, the toolbar picks up replies and resolutions within
a few seconds. `wait` exits 3 when it times out with nothing new.

To have your coding agent run the loop, point it at [`AGENTS.md`](AGENTS.md).

**Proof and plans.** `--shot` loads the note's page in headless Chromium at
the viewport the reviewer left the note at (the toolbar stands down in it),
outlines the target, and attaches a picture cropped to it; **Check the fix**
shows it under what the agent said. It needs Playwright with Chromium, found
in the kit, the project or `SHOW_AND_TELL_PLAYWRIGHT`; without it, take the
picture with your own browser tool and pass `--shot-file`. The picture comes
first: if it fails, the note stays open. Files live beside the store, in
`~/.show-and-tell/<name>.shots/`, one before and one after per note.
`reply --plan` is for a note about an idea rather than a measurement: the
reviewer gets **Go ahead** beside the answer box, and `wait` wakes on it like
any answer.

`annotate` is the other direction: the agent points out problems for the
reviewer to weigh in on. With `serve --critique`, each note is a numbered amber
marker on the element its `--selector` matches (red when `--severity blocking`),
listed worst first in an **Agent critique** panel the reviewer can reply to. A
note without a selector, or whose selector matches nothing, is page-level.
Severities are `blocking`, `important` (the default) and `suggestion`.
`--replace` clears your earlier notes on that page first. Agent notes never
appear in `list`, which is the reviewer's notes only.

## MCP server

`show-and-tell mcp` serves the same agent tools over MCP (stdio), so an agent
can call them directly instead of shelling out. No install step: it is plain
Node, like the rest of the kit.

| Tool | Does |
| --- | --- |
| `list_projects` | Every project with a store, its open notes, questions waiting on the reviewer and last round. |
| `get_pending` | Open notes grouped by page, with source pointers (`all`, `src`, `reviewer` optional). Marks them read. |
| `get_critique` | The agent's own critique notes, including the reviewer's replies. |
| `get_note` | One note by `id`, with its thread. |
| `wait_for_round` | Blocks until **Send to agent** or an answer, then returns the notes. `timeout` in seconds (default 240, max 600); on `timeout`, call again. |
| `reply`, `resolve`, `dismiss`, `acknowledge` | As the CLI verbs, by `id`. `reply` takes `plan: true`; `resolve` and `dismiss` take `shot: true` or an image path. |
| `shot` | A before or after screenshot of a note's target (`kind`, or `file` for your own image). |
| `annotate` | Critique notes on a page: `url`, `items: [{ comment, selector?, severity? }]`, `replace?`. |
| `clear_critique` | Removes every agent note on the project. |

Every tool takes `project` (the `serve --name`). Start the server with
`--project <name>` to make it the default, and `--src <dir>` to set where source
pointers are searched (default: the directory the client starts it in). Each
result is a text block (the same rendering as `feedback list`) plus
`structuredContent` JSON.

**Claude Code** (run in your project, so pointers search it):

```bash
claude mcp add show-and-tell -- node /path/to/show-and-tell/bin/show-and-tell.mjs mcp --project my-app
```

**Codex**: `codex mcp add show-and-tell -- node /path/to/show-and-tell/bin/show-and-tell.mjs mcp --project my-app`,
or in `~/.codex/config.toml`:

```toml
[mcp_servers.show-and-tell]
command = "node"
args = ["/path/to/show-and-tell/bin/show-and-tell.mjs", "mcp", "--project", "my-app", "--src", "/path/to/my-app"]
```

**Cursor**: `.cursor/mcp.json` in the project:

```json
{
  "mcpServers": {
    "show-and-tell": {
      "command": "node",
      "args": ["/path/to/show-and-tell/bin/show-and-tell.mjs", "mcp", "--project", "my-app", "--src", "/path/to/my-app"]
    }
  }
}
```

The review server (`serve`) still has to run for the reviewer's toolbar; the
MCP server only reads and writes the store, like `feedback`. Pass
`SHOW_AND_TELL_STORE` in the client's `env` if you moved the store.
## Applying edits and exporting

`apply` writes the reviewer's text edits (FROM → TO) into the source, but only
where that is unambiguous: the old text must occur exactly once across the
text files under `--src`. It doesn't search dependencies, build output,
lockfiles, binaries, minified files or symlinks out of the tree. Rendered text
and source can differ in whitespace (line wraps, indentation, CRLF); only the
words that changed are rewritten, so the file keeps its own line breaks.

```bash
show-and-tell feedback my-app apply --src path/to/my-app            # dry run: a diff per note, plus what it skipped and why
show-and-tell feedback my-app apply --src path/to/my-app --yes      # write, then resolve each note ("Applied: src/Hero.tsx:12")
show-and-tell feedback my-app apply <id> <id> --src path/to/my-app  # only these notes
```

A note is skipped, with the reason, when the old text is not found, is found
more than once, looks split across JSX or markup (`Hello <b>world</b>`), is
written with HTML entities (`&amp;`), or when the new text would break the file
(`<`, `>`, `{` or `}` in JSX, HTML or any `.js`/`.ts` file, which may hold JSX;
a quote in a `.js`/`.ts`/`.vue`/`.svelte`/`.astro` file that could end the
string the text sits in, such as `Bob's` inside `'…for our friends'`). If the new text is already in
the source, `--yes` resolves the note without writing. Files are written whole
(temp file, then rename), never outside `--src`. Run your tests afterwards:
`apply` changes copy, not logic, but it can't see a snapshot test.

`export` prints the round as a document, grouped by page, with the viewport,
source pointers, the reviewer's words, edits as FROM/TO and any agent Q&A.
`--all` includes closed notes.

```bash
show-and-tell feedback my-app export                     # markdown to stdout
show-and-tell feedback my-app export --format json       # notes plus pointers and locations
show-and-tell feedback my-app export --github --repo acme/site --label review          # what it would create
show-and-tell feedback my-app export --github --repo acme/site --label review --yes    # one issue, via gh
show-and-tell feedback my-app export --pr 42 --yes       # one PR review via gh api
```

`--pr` puts a line comment on each note whose source pointer lands on a line in
the PR's diff, and the rest in the review body. Both GitHub modes need the
[GitHub CLI](https://cli.github.com) signed in, and are dry runs unless you pass
`--yes`: without it they print exactly what they would post. `@handles` in
reviewer text are made inert in every markdown export (plain `export` too,
since it may be pasted into an issue), so a note can't notify people on GitHub.
`--format json` keeps the text raw.

## Copy edit mode

Text edit mode changes what the page shows right now. A lot of copy never sits
in the DOM at once: a random line from an array, a rotating role, a label drawn
on a canvas, a mascot's dialogue in a `data-*` attribute, an SVG diagram built in
a template string. `copy` reads all of it from the source, with the exact span
of each string, grouped by file and by the variable, function or section that
holds it:

```bash
show-and-tell copy --src path/to/my-app            # copy, plus "?" for maybe-copy (short labels, words in a list)
show-and-tell copy --src path/to/my-app --all      # also the strings judged to be code, with the reason
show-and-tell copy --src path/to/my-app --json     # every unit: file, start, end, line, path, kind, parts
show-and-tell copy --src path/to/my-app --file src/hero.js
```

It reads JS/TS string and template literals (`${…}` stays a locked part), JSX
text and attributes, HTML text, `alt` / `title` / `aria-label` / `placeholder`
/ meta descriptions, and copy-looking `data-*` values; markup inside a string is
listed piece by piece. Whether a string is copy is a judgement: selectors, class
names, URLs, event names, keys, CSS values and comparisons are left out.

The review server joins this with the page: `POST /__ag/copy-map` with the
outline from `toolbar/copy-outline.js` returns the page's copy in reading order
(landmarks, headings, text), each item traced to its source span. Data copy
(`const recordData = [...]`) is shown whole where it first renders; the rest
goes under "elsewhere in the code", limited to the scripts the page loaded.
`serve --src <dir>` sets the folder it reads (default: the current directory).

In the toolbar, open **Edit text** and press **All text** (or Shift T anywhere on
the page, or `window.__SHOW_AND_TELL__.allText()`). A full-page view opens in a
new tab: an outline of the page on the left (sections with their string counts
and how many are edited), and every string in a reading column, sized as it is
on the page, with its kind and `file:line` beside it. A data list
(`recordData`) shows once, where it renders ("Shown 72 times on the page");
the rest sits under "Elsewhere in the code" by file and owner, with how it shows
up ("Drawn on canvas", "Picked at random"). `/` finds; the filter shows All
text, Edited, On the page, Elsewhere in the code, Maybe text or the strings
judged to be code. `${…}` parts are locked chips you type around. Escape reverts
a field; drafts survive a reload. On a phone the view is one column; tapping a
string shows what it is and where it lives, with arrows to the next one.

**Review** shows before and after for each edit, grouped by file, with an Undo
each and whether it can be placed ("Ready", "Moved, found once", or "Can't
place", which saves as an ordinary FROM → TO note). **Save** turns each changed
string into a `kind: "copy"` note carrying its exact span, sharing one batch
id; the inbox shows a save as one row. Saving again revises the open note.

`feedback <name> apply` writes copy notes at their spans: only the changed words
are rewritten, so escapes, entities and line wraps elsewhere in the string stay
as they were, and new text is escaped for where it sits (a quote inside `'…'`,
`<` in HTML, `{` in JSX). If the file moved since the view opened, the old text
must still occur exactly once; if it changed, the note is skipped with the
reason. Copy notes and find-and-replace edits apply in the same run.

## When the page is older than the fix

Without live reload (a static server, a Ghost theme, unversioned scripts) the
reviewer's tab keeps the page it loaded before the agent's fix, and a plain
reload can still take an old script from the browser cache. The toolbar checks:
every few seconds it sends the review server the same-origin files the page
loaded and when (`POST /__ag/freshness`), and the server compares each with its
file under `--src`. Files it can't map to the source (bundler chunks) are left
out rather than guessed at, and a hot-reloading dev server re-fetches what
changed, so it stays quiet there.

When something is newer, a strip says which file changed, with **Reload**.
While Check the fix has changes to walk, its strip says **Reload and check**
instead, and the card opens by itself on the reloaded page. Both re-fetch the
changed files with `cache: 'reload'` first, and both wait while a recording or
unsent text would be lost. Turn it off with `fresh: false` in the toolbar
config.

## A film, or any page with a timeline

A page that plays over time is one URL for its whole length, so a note's page
and selector do not say *when*. When the page has a timeline:

- **Pointing holds it still.** Opening a note, Edit text and Tweak pause it at
  the moment of the press and give it back when the reviewer finishes. Talk
  pauses it and leaves the transport to them.
- **Notes say when.** Comments, text edits, tweaks and each voice passage carry
  the time, the timed part the target sits in, and what was on screen and
  audible. The agent reads `time:`, `in:`, `on screen:` and `sound:` rows.
  Layout drags and measured checks do not carry a time yet.
- **The proof is of that moment.** `resolve --shot` and `shot` stop a fresh load
  at the note's time, at the size the piece is made at, and fail with the
  reason rather than photograph another frame (the page has no timeline now,
  the film is shorter, the seek did not finish). A note with no time is
  photographed where the load rests, and the shot says so. Check the fix takes
  the reviewer back to the note's moment.

A [HyperFrames](https://hyperframes.heygen.com) preview is recognised with
nothing added: its `window.__player`, and the `data-start` / `data-duration`
attributes on its scenes and clips, read by HyperFrames' own rules (a start
relative to another clip, local to its composition). The preview does not state
a frame rate, so its notes give seconds and no frame number. Open the
composition's own preview URL, not the Studio that frames it. Any other page describes its timeline with a hook:

```js
window.__SHOW_AND_TELL__ = { ...window.__SHOW_AND_TELL__, timeline: {
  time: () => video.currentTime,            // seconds; the only required part
  duration: () => video.duration,
  playing: () => !video.paused,
  pause: () => video.pause(),
  play: () => video.play(),
  seek: (t) => { video.currentTime = t; },  // may return a promise
  fps: 30,                                  // without it no frame number is claimed
  clips: (t) => [{ id: 'intro', kind: 'scene', start: 0, end: 4, src: 'scenes/intro.html' }],
  within: (el) => [{ id: 'intro', start: 0, end: 4 }],   // the timed parts an element sits in
  stage: () => ({ width: 1920, height: 1080 }),
  settled: () => new Promise((r) => video.addEventListener('seeked', r, { once: true })),
} };
```

A `seek` or `settled` that never answers is given a few seconds, then treated as
not having arrived.

Not yet: markers stay on screen for the whole film rather than only near their
moment, a note is one instant rather than a range, and sounds can be read from a
note but not pointed at.

## Storybook

Stories render in an iframe, and each story is `/iframe.html?id=…`. Two flags
handle that:

```bash
show-and-tell serve --origin http://localhost:6006 --name my-stories --framed --route-key id
show-and-tell install path/to/project --storybook   # writes .storybook/preview-head.html
```

`--framed` lets the toolbar mount inside the preview frame, and `--route-key id`
files notes per story rather than per pathname. The loader skips Playwright test
runs (`navigator.webdriver`) unless the URL has `?show-and-tell=1`. With the Vite
plugin in Storybook's Vite config (`viteFinal`), all of that is on by default.

## Sharing with a remote reviewer

`serve` and `install` only work on your own machine. To have a client or a
teammate review a dev build from theirs, run `share` instead. It needs no
`install` line:

```bash
show-and-tell share --origin http://localhost:5173 --name my-app --tunnel
```

`share` starts a proxy on one port (default 55940) in front of your dev server.
It forwards every request, including streamed responses and the HMR WebSocket,
and adds the toolbar to each HTML page. The review server runs on the same
origin under `/__show-and-tell`. Notes go to the same store as `serve`, so
`show-and-tell feedback my-app list` reads them as usual.

With `--tunnel`, it starts a [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
quick tunnel (`brew install cloudflared`) and prints the link to send:
`https://<random>.trycloudflare.com/?agk_key=<key>`. Opening it sets a cookie
and drops the key from the address bar. Without `--tunnel`, point any tunnel at
the port yourself (`ngrok http 55940`) and send `https://<tunnel host>/?agk_key=<key>`.

**The key is the only protection.** Anyone with the link can use your whole
dev server (every page, API route and socket it serves), not only the review
toolbar. Requests without the key get a 401. A new random key is made on each
run, unless you pass `--key <token>` to keep one across restarts. Don't post
the link anywhere public, and stop `share` (Ctrl-C) when the round is done.
Stopping it also stops the tunnel.

| Flag | Meaning |
| --- | --- |
| `--origin`, `--name` | As for `serve`. |
| `--port` | Proxy port (default 55940). |
| `--tunnel` | Start a cloudflared quick tunnel and print the share link. |
| `--key` | Use this key instead of a random one (16+ characters). |
| `--framed`, `--route-key` | As for `serve` (Storybook). |

The proxy sends your dev server its own `Host`, so Vite's `allowedHosts` and
similar checks pass, and it rewrites redirects to `localhost` back to the
public address.

## Several reviewers

More than one person can review the same app at once. Each opens the page in
their own browser, and every note, text edit, answer and **Send to agent** is
signed with that person's name.

- **The name is asked once,** the first time someone adds a note, turns on text
  edit, answers a question or presses Send. Not on page load. **Not now** goes
  ahead unsigned and asks again on the next visit. Change it in the inbox under
  **Reviewing as …** (notes already sent keep the old name).
  A new comment saves immediately while the name prompt is open; giving a name
  then signs the notes this browser just saved unsigned.
- **It stays in that browser** (`localStorage` key `feedback-toolbar-reviewer`).
  It is deliberately not an `agentation*` key, because the bridge copies those to
  every reviewer's browser.
- **The inbox shows who wrote each note,** with **Mine / Everyone** to filter.
  Your own notes read "You". Edit and Reject only appear on your own notes.
- **Clear all** in the toolbar clears your own notes; they stay in the history
  as dismissed (`list --all` shows them). Press it twice to confirm the count.
  Once named, unsigned notes from other browsers have no Edit or Reject action.
- **Questions go to the note's author.** An agent's question pops up only for the
  person who wrote the note. It still shows under **Everyone** for the rest.
- **Text edits:** everyone sees every overlay on the page, but a draft belongs to
  the person who typed it. It is not in anyone else's count, and their Send does
  not commit it.
- **One round for the whole project.** Anyone's Send wakes `feedback wait` with
  everyone's open notes, and the Send panel says who sent last.

The agent side:

```bash
show-and-tell feedback my-app list            # "· Ana" on each note, "Round sent … by Ana"
show-and-tell feedback my-app list --by ana   # one reviewer's notes (case-insensitive)
```

Names are trimmed to one line of at most 40 characters, with control characters
removed, wherever the server stores them. They are what each reviewer typed, not
an identity check: anyone who can reach the page can sign with any name.

## Options

| Command | Flag | Meaning |
| --- | --- | --- |
| `serve` | `--origin` | Your dev server's origin. `localhost` and `127.0.0.1` are both accepted. Other origins get a 403. |
| `serve` | `--name` | Project name, `[a-z0-9-]`. It picks the store and isolates the browser's toolbar state per project. |
| `serve` | `--port` | Review server port (default 55930). Must match `install --port`. |
| `serve` | `--framed`, `--route-key` | See Storybook. `--route-key search` keys on the whole query string. |
| `serve` | `--critique` | Show the agent's own notes (`feedback annotate`, the MCP `annotate` tool) as markers and an **Agent critique** panel. Off by default. |
| `serve` | `--layout-intent` | In layout mode, ask the reviewer what a drag meant, so the agent gets the intent with the move. Off by default. |
| `install` | `--port`, `--name`, `--storybook`, `--remove`, `--check` | As above. `--name` defaults to the nearest `package.json` name, else the git repo's folder (a worktree is named for its repo); install prints which. On a git-tracked file it registers a local clean filter so commits leave the loader out. |
| `servers` | `--json` | The running review servers by port, read from disk (no network). |
| `serve` | `--src` | The source folder copy edit mode reads (default: the current directory). Never sent to the page. |
| `copy` | `--src`, `--all`, `--json`, `--file` | Every piece of copy in the source; `--all` adds code strings with the reason; `--file` limits it to one file. |
| `feedback` | `--src`, `--all`, `--timeout`, `--by`, `--same-target` | Where to search for source pointers (default: current directory), include closed notes, `wait` timeout in seconds (default 3600), only one reviewer's notes. |
| `feedback annotate` | `--selector`, `--severity`, `--replace` | The element to pin to, `blocking` / `important` / `suggestion`, and clear your earlier notes on that page first. |
| `mcp` | `--project`, `--src` | Default project for every tool, and where to search for source pointers (default: current directory). |
| `feedback apply` | `--yes` | Write the edits and resolve the notes. Without it, a dry run. |
| `feedback export` | `--format md\|json`, `--github`, `--pr <n>`, `--repo`, `--label`, `--title`, `--yes` | Output format; post as one issue or one PR review via `gh` (dry run without `--yes`). |

Set `SHOW_AND_TELL_STORE` to keep notes somewhere other than `~/.show-and-tell/`.

## Security

The review server listens on `127.0.0.1` only and answers pages from the
origins it was started for (`--origin`, or the dev server's own URLs with a
plugin); anything else gets a 403. It also checks the `Host` header, so a
DNS-rebinding page (a hostile domain that re-resolves to 127.0.0.1) can't reach
it under another name. Toolbar state the browser mirrors (`/__kv`) lives in the
same per-project SQLite file as the notes, not in a separate JSON file.

The loader URL carries the project name (`/loader.js?name=my-app`), and the
review server refuses a page that names a different project.

## Troubleshooting

- **"Review toolbar offline" pill:** the review server isn't running, or its
  `--port` doesn't match the installed line.
- **"Review server not reachable — notes aren't being saved":** the bundle
  loaded, but the server or note store refused a request or stopped answering.
  Notes remain in this browser. The notice explains the failure; dismissing it
  leaves a status button on the toolbar. Failed answers keep their typed text.
- **No toolbar, and the console says the server is for another project:** the
  page's loader names one project (`?name=`) and the server on that port runs
  another. Use the same `--name` for `install` and `serve`, or give each project
  its own `--port`.
- **Notes from another project appear:** the browser keeps toolbar state per
  origin (`localhost:3000` is every app you've run on port 3000). The loader
  swaps that state by `--name`, so use a distinct, stable name per project.
- **The T button is disabled:** the page already has its own inline editor
  (`[data-editid]`), so text edit stands down. The tooltip says why.
- **A committed edit still shows after a change:** the overlay shows the new
  text until the agent resolves the note. After that, a reload shows what the
  source says.
- **Strict CSP:** allow `http://127.0.0.1:<port>` in `script-src` and
  `connect-src`, in development only.
- **Canvas / WebGL apps:** notes can only target DOM elements, so a note on a 3D
  view pins to the `<canvas>`.

## How it works

```
your page ──<script> loader.js──▶ review server (127.0.0.1:55930)
   │                                 ├─ /show-and-tell.js toolbar bundle (dist/)
   │                                 ├─ /__ag/*          sessions + notes API, SSE stream
   │                                 └─ /__kv            localStorage mirror
   └── toolbar ◀──── live updates ───┘
                                     ~/.show-and-tell/<name>.sqlite  ◀── show-and-tell feedback
```

| Path | What it is |
| --- | --- |
| `toolbar/` | The bundle's source: `entry.jsx` mounts Agentation with an endpoint, and the review layers (text edit, inbox, replies, viewport, critique, layout intent) sit around it. `build.mjs` patches a few named integration points in the pinned Agentation source at build time and fails if any of them moves. |
| `server/sessions.js` | The HTTP API the toolbar syncs to, plus the agent-side update used by `feedback`. |
| `server/store.js`, `server/kv-store.js` | The SQLite store: notes and the mirrored toolbar state. |
| `server/agent.js` | The agent's side, shared by `feedback` and `mcp`. |
| `server/proxy.js` | The `share` proxy: key gate, HTML injection, WebSocket splice. |
| `bin/` | `serve`, `install`, `feedback`, `mcp` and `share`. |
| `integrations/` | The Vite, Astro and Next.js plugins and `<ShowAndTell />`. They share the loader snippet (`server/loader-tag.js`), project naming (`server/project-name.js`) and the in-process server (`server/dev-server.js`). |
| `dist/show-and-tell.js` | The prebuilt toolbar, served per request. |

## Building the toolbar

```bash
pnpm install
pnpm build    # → dist/show-and-tell.js, then checks it parses and has every layer
pnpm test     # server, API, CLI, critique, MCP, plugins, apply, export, share proxy (binds local ports; gh and cloudflared are faked)
```

Optional real-browser checks use Playwright and an isolated temporary store:

```bash
# With Playwright installed locally and its Chromium browser available:
SHOW_AND_TELL_BROWSER_TESTS=1 node --test --no-warnings test/browser.test.mjs
```

Set `SHOW_AND_TELL_PLAYWRIGHT` to an existing Playwright module path if it is
installed elsewhere. `SHOW_AND_TELL_SCREENSHOTS` saves the review captures to a
directory. The browser checks cover immediate saves, delayed naming, clearing
only your notes, question panels, failed saves, connection recovery and touch
controls at 320, 360, 390 and 820 wide. They are skipped in the default suite.

Agentation is pinned on purpose. To move to a newer version, bump the pin, run
`pnpm build`, and check:

1. `build.mjs` still finds every integration point (it fails loudly if not).
2. The props `entry.jsx` passes (`endpoint`, `webhookUrl`, `copyToClipboard`,
   `onSessionCreated`) still exist in `node_modules/agentation/dist/index.d.ts`.
   A renamed prop fails silently: the toolbar mounts and never syncs.
3. The bundle size is in the same range. A big swing means the component
   changed shape.
4. A real round on the demo page works: leave a note, read it, resolve it.

## Names from before the rename

This tool was called `agentation-kit` before it became Show and tell. The old
names still work, so nothing already set up breaks:

- the `agentation-kit` command (the same program as `show-and-tell`);
- `AGENTATION_KIT_*` environment variables (now `SHOW_AND_TELL_*`);
- `agentationKit`, `withAgentationKit` and `<AgentationKit />` (now
  `showAndTell`, `withShowAndTell` and `<ShowAndTell />`);
- loader blocks marked `agentation-kit:start`: `install --remove` and the
  commit filter still find and remove them;
- the data folder `~/.agentation-kit`, which a machine that already has one
  keeps using. New machines get `~/.show-and-tell`.

Inside the page some names still carry "agentation" (`data-agentation-root`,
the `--agentation-color-*` properties, storage keys that start with
`agentation`). They belong to the Agentation component the toolbar is built
on, or to stored data that must keep its key, and are not meant to be typed.

## Credits

show-and-tell is built on [Agentation](https://www.npmjs.com/package/agentation)
by Benji Taylor. The core idea is Agentation's: point at an element on a running
page, say what should change, and hand an agent a structured note it can act on.
So is the plumbing: the toolbar component, element capture and selectors, the
annotation model, and the session endpoint protocol this kit's server speaks.
What this repo adds is the review layer around it (text edit, inbox, agent
replies, viewport monitor, route handling), a local server and store, and the
terminal loop for the agent.

## Licence

Show and tell's own code is under the MIT licence ([`LICENSE`](LICENSE)).

`dist/show-and-tell.js` bundles Agentation, which is © Benji Taylor under the
PolyForm Shield License 1.0.0 (copy in [`toolbar/AGENTATION-LICENSE`](toolbar/AGENTATION-LICENSE)).
That licence allows use, modification and distribution with the licence
included, but not using it to offer a product or service that competes with
Agentation. The MIT licence above does not cover Agentation's code; anything
built from this bundle carries the PolyForm Shield terms too. See
[`NOTICE.md`](NOTICE.md).
