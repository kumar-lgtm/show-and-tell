---
name: show-and-tell
description: Show and tell, a review toolbar for a local dev server. The person reviewing points at the page and says, types or edits what should change, and you (the coding agent) get notes with file:line source pointers, fix the code, and close each note while they watch. Use it for review and revision rounds on anything with a local dev server, whether the project was vibe-coded or hand-built (Vite, Next.js, Astro, SvelteKit, CRA, plain HTML, Ghost, Storybook). Triggers: "/show-and-tell", "show and tell on this app", "let me give feedback on the page", "review round", "feedback round on localhost", "I'll point at what to change", "voice feedback", "let me edit the copy in place", "critique this page and let me decide". Not for a public link or a static file with no dev server; use your usual publishing tool for those.
---

# Show and tell

The person reviewing **shows** and **tells**:
- **Shows:** they click an element or drag a box over part of the page.
- **Tells:** they type a note, talk while pointing, rewrite text in place, or nudge a style.

You get ordinary notes with targets and source pointers. You fix the source and close each note. They see your replies and resolutions live in the toolbar, check your fixes, and reopen anything that isn't right. That loop of point, fix, check and repeat is the point of the tool: it replaces screenshots, "the button on the left, no, the other one", and long chat messages describing a page.

Below, **the reviewer** is the person giving feedback (usually the person you're working for), and **you** are the agent changing the code.

## Setup

The skill lives inside the Show and tell repo, at `skill/show-and-tell/`. `KIT` is that repo's checkout. The CLI is still named `show-and-tell`.

```bash
KIT="$(cd -P "<this skill's directory>" && cd ../.. && pwd)"   # -P follows the symlink the skill is usually installed through; or use the clone's path, if the skill was copied elsewhere
st() { node --no-warnings "$KIT/bin/show-and-tell.mjs" "$@"; }   # a function, not $ST: zsh doesn't word-split variables
S="$KIT/skill/show-and-tell/scripts"
```

**Requirements:**
- Node 22.5 or newer (it uses `node:sqlite`).
- Optionally `rg` (ripgrep), for `find: file:line` pointers.
- Nothing to install: the toolbar ships prebuilt in `$KIT/dist/`.

If `node "$KIT/bin/show-and-tell.mjs" --help` fails, check `node --version` first.

**Names and checkouts:**
- `<name>` is a stable `[a-z0-9-]` slug per project, for example `acme-site`. Reuse it every round. It keeps each project's notes and toolbar state separate.
- Run the kit from a clean checkout of its default branch. The project under review is separate: edit it wherever its own rules say, and point `--src` at it.

**Ports and sandboxes:** the review server, the voice bridge and the kit's browser tests bind local ports, and `serve` writes `~/.show-and-tell/`. If your tool runs commands in a sandbox that blocks local ports, run these as background processes with that restriction lifted, using your tool's own mechanism. `st servers` reads the store from disk, so it works even where `curl` to localhost can't.

## Quick start: the usual round

For most projects, a round is five steps.

1. **Dev server.** Find or start the project's dev server and note its origin, e.g. `http://localhost:5173`.
2. **Review server.** Start it in the background:
   ```bash
   st serve --origin http://localhost:5173 --name <name> --src <project dir>
   ```
3. **Load the toolbar.** Run `st install <project dir> --name <name>`. This adds a dev-only line, which the clean filter keeps out of commits.
4. **Tell the reviewer it's live.** Give them the URL and a short guide (see **What to tell the reviewer** below).
5. **Wait for the round, then work it.** Wait in the background:
   ```bash
   st feedback <name> wait --timeout 3600 --src <project dir>
   ```
   When it returns, triage, fix, verify and resolve (steps 6–9 below), and then wait again.

The rest of this file covers the parts that make a round go well: preflight, reading notes properly, asking instead of guessing, verifying before closing, and cleaning up.

## Before you start (preflight)

Write these down; cleanup depends on them.

1. **Dev server:** its origin, and whether you started it.
2. **A plugin already there?** If the project's config has `show-and-tell/vite`, `show-and-tell/astro` or `withShowAndTell`, the review server runs inside the dev server.
   - Don't run `serve` or `install`: a second server or loader line would fight the plugin.
   - `<name>` is the plugin's `name` option, else the sanitised `package.json` name. The dev server's log prints it.
3. **A review server already running?** Run `st servers`.
   - One for this `<name>` and origin: reuse it.
   - Another project's on the port you wanted: never stop it. Pick a free `--port` and pass it to both `serve` and `install`.
4. **What you start:** keep a list (voice bridge, review server, dev server, loader file). At the end you stop and remove only those.

## Run a round

1. **Voice is built in.** There is nothing to start. The first time the reviewer opens Talk or a note's microphone, the review server starts a local speech model (faster-whisper, on this computer, free) and the panel says **Getting ready** until it answers.
   - **First run on a machine** takes a few minutes: it builds `~/.show-and-tell/voice-venv` and downloads the Whisper `base` model. Tell the reviewer, or warm it up yourself beforehand with `bash "$S/voice-server.sh"` (wait for `READY <url>`; a bridge it finds already running is reused and isn't yours to stop).
   - **It needs** macOS or Linux and Python 3.10 to 3.13 (or `uv`). Without them the panel says so and offers **Type a note instead**; it never invents text.
   - **Options:** `SHOW_AND_TELL_VOICE=off` turns it off, `SHOW_AND_TELL_VOICE_PORT` moves it off 55945, and `SHOW_AND_TELL_TRANSCRIBE_URL` uses a transcription service of your own instead.
2. **Review server** (skip it with a plugin). Run in the background:
   ```bash
   SHOW_AND_TELL_TRANSCRIBE_URL=http://127.0.0.1:55945/v1/audio/transcriptions \
     st serve --origin http://localhost:5173 --name <name> --src <project dir>     # [--port 55930] [--critique]
   ```
   - Leave out the variable when there's no voice.
   - `--src` is also what All text reads.
   - `--critique` turns on **From the agent**, for your own notes (see Options).
3. **Load the toolbar** (skip it with a plugin):
   - **Any project:** `st install <project dir or file> --name <name>`, plus `--port` if it isn't the default.
     - **Where it goes:** it finds `app/layout.*`, `pages/_document.*`, `index.html`, `public/index.html`, `src/app.html`, `src/layouts/*.astro` or `default.hbs`. Otherwise, pass the file that renders `<head>`.
     - **When it runs:** only on localhost, or only when `NODE_ENV=development` for JSX.
     - **Port check:** it warns when the server on that port belongs to another project.
     - **Commits:** on a git-tracked file it registers a local clean filter, so commits leave the line out and you can commit mid-round.
   - **Vite, Astro or Next.js, if they want it permanently:** use the plugin, documented in `$KIT/README.md` under "Framework plugins". For voice, set `SHOW_AND_TELL_TRANSCRIBE_URL` in the dev server's environment. Ask before adding a dependency to their project.
   - **Ghost themes:** read `references/ghost.md` first.
   - **Storybook:** see Options.
4. **Tell the reviewer it's live** (next section).
5. **Wait for the round** in the background:
   ```bash
   st feedback <name> wait --timeout 3600 --src <project dir>
   ```
   - **When it returns:** when they press Send or answer one of your questions. On Send it prints the whole open list with source pointers; on an answer, the answered notes and a count of the rest.
   - **Exit code 3:** it timed out with nothing new. Start it again.
   - **Re-reading:** `st feedback <name> list --src <project dir>` prints the list again. `list --agent` is different: it shows your own critique notes and their decisions.
6. **Say back how you read the batch before you edit anything.** Triage it as a whole. Each item gives:
   - **Pointers:** `find: file:line`, `in source:` and `at:`. Treat them as leads, not answers. A string can repeat across components, variants or routes, and only one of them is the one they saw. Check the route, component and state they were on.
   - **The viewport** they were at.
   - **On a film or anything with a timeline:** `time:` (when the note was left), `in:` (the timed part the target sits inside), `on screen:` and `sound:` (everything playing then, each with its span and file). The selector alone doesn't say when, and a full-frame layer can sit over the scene they meant, so read `on screen:` as well. `noted while playing` means they reacted mid-playback: the moment may be a beat earlier.
   - **For voice:** whole sentences with `[→ T2 …]` markers. The words after a marker were spoken while that target was selected, and a legend names each target by its text, role and heading. "(check timing)" means the target boundary is approximate, so read the sentence as a whole.
   - **Several notes on one target** can ask for different things. Voice splits a thought at every pause, and later rounds or other reviewers add more. Read each one.
   - **`tweak:` notes** name one property on one element: before → after, the scale token, and the rule that sets it. For example: `tweak: a.cta padding 12px 20px → 16px 24px (--space-4 · --space-5), rule in styles.css .cta`. Change that rule with the token, not the raw value. `off scale` means they picked the value on purpose.
   - **`reopened:` / `still off:`** means they checked an earlier fix and it isn't right yet. Read what you said then, and what's still off, before trying again.
   - **`from critique:`** means they chose Fix it on one of your critique notes. It's their instruction now.
7. **If a note is unclear, ask instead of guessing:**
   ```bash
   st feedback <name> reply <id> "Monthly or annual price?"
   ```
   Their question badge lights up and they answer in the page. Run `wait` again; it returns when they answer. One clear question beats a wrong fix and another round.
   - **Notes about an idea, not a measurement** ("make it feel procedurally generated", "frame it as protection from smart glasses"): say what you'll do before you do it, and wait for the go-ahead:
     ```bash
     st feedback <name> reply <id> "Here's what I'll do: a different job, city and age on every platform, fresh on each load." --plan
     ```
     They get **Go ahead**, or say what to change. A copy edit, a tweak or an exact instruction doesn't need one. A concept note closed on a literal reading is the note most likely to come back reopened.
8. **Fix it, check it, then close it.** For each note: interpret, locate, change, verify, resolve.
   - **Verify** what they'll see: the route, the interaction and the viewport they were at, plus the checks the change calls for (the project's tests, a type check, a build).
     - For a layout note, reproduce it at their viewport and fix the cause. A phone symptom can need a shared layout fix, not a phone-only override. Check the sizes either side.
     - Say what you checked. If you could check only the source, or only the browser, say which.
   - **Close** with what changed, concretely, and with a screenshot when they'll check it by eye:
     ```bash
     st feedback <name> resolve <id> "what changed" --shot
     st feedback <name> resolve <id> "what changed"
     st feedback <name> dismiss <id> "why not"
     st feedback <name> resolve <id>,<id> "one change covered both"
     st feedback <name> resolve <id> "what changed" --same-target
     ```
     `--same-target` closes every open voice note spoken at that target. Use it only after reading them all, and only when one change answers all of them. Leave the rest open with a reply.
     - **`--shot`** loads the page in headless Chromium at their viewport, outlines the target and attaches the picture, and Check shows it beside your words. For a note with a `time:` it stops the page at that moment first, at the piece's own size, and fails rather than photograph another frame. It needs Playwright (`SHOW_AND_TELL_PLAYWRIGHT` can point at an installed one), or pass `--shot-file <png>` with a picture you took yourself. If the picture fails, the note stays open. `st feedback <name> shot <id>` takes a *before* first. Look at the picture before you resolve: if it doesn't show the change, neither will their page.
   - **Blocked?** Leave the note open and reply with the question or what's in the way. Never resolve a note you haven't applied.
   - **Text rounds:** `apply` does the mechanical part, in two steps:
     ```bash
     st feedback <name> apply --src <project dir>          # dry run: each diff, plus what it skipped and why
     st feedback <name> apply --src <project dir> --yes    # writes, then resolves each applied note
     ```
     - **The dry run** writes nothing. It skips, with the reason:
       - an old text found more than once, or not at all;
       - new text that could break the file: `<`, `>`, `{` or `}` in JSX or HTML, or a quote that could end the string it sits in.

       Fix those by hand.
     - **`--yes`:** show them the diff before you run it. It resolves as it writes, so check the page afterwards. If something's wrong, fix it and reply on the note to say so.
     - **All text** saves `COPY` notes (`at: file:line path`, one batch per Save). `apply` writes each one at its exact span without searching, and skips (with the reason) any whose text has changed since. `st copy --src <dir>` prints the same map of every string, by file and owner.
     - **A whole row captured as one edit** (a nav's wordmark, statement and CTA glued together) still applies: `apply` narrows it to the words that changed.
9. **Repeat steps 5–8** until they say the round is done. After you resolve, the reviewer can press **Check**, which walks them through each change and offers Looks right or Not yet. Not yet reopens the note into their next round, marked `reopened:`.
   - **Their tab can be older than your fix** when the dev server doesn't live-reload (a static server, unversioned scripts). The toolbar notices which of its files changed and offers **Reload and check**, which re-fetches them first. So don't tell them "it's done, refresh": they'll see the prompt. If they say something still hasn't changed, ask whether the page says it's out of date before you look for another cause.
10. **Clean up what you started, and only that.**
    - **The toolbar line:** if you installed it, run `st install <dir> --remove`, then `st install <dir> --check` (exit 0 means it's gone). Add `--storybook` to both if that is how you installed it. It restores the file byte for byte and drops the commit filter. The filter stays while another worktree still has the line.
    - **Processes:** stop the ones you started. A reused bridge, review server or dev server stays up, and so do other people's edits.
    - **Notes** stay under `<name>`. `list --all` shows the resolved ones too.

## What to tell the reviewer

Give them the URL and this short guide. Adjust it to the modes they'll use.

- The toolbar starts as a round button in the bottom-right corner. Click it, or press ⌘⇧F (Ctrl⇧F elsewhere), to open it.
- One mode is on at a time. Names and keys are in the tooltips, and on a phone the mode button opens a sheet.
  - **Comment (N):** click anything and type.
  - **Talk (V):** speak while pointing. Clicking or boxing something anchors the next words to it; Esc goes back to general feedback.
  - **Edit text (T):** click any text and rewrite it. **All text** (Shift T) opens every string on the page and in its scripts, full page.
  - **Tweak (D):** click an element and nudge its size, weight, spacing, colour or corners on the project's own scale.
- **Send** is the one labelled button. It ends the round, and then reads Sent until there's something new.
- **Inbox:** your questions show up there under **Needs you**, and they answer in the page.
- **On a film:** pointing pauses it where they pressed, and adding the note starts it again.
- **Check:** once you've fixed things, Check walks them through each change, with your screenshot when there is one. If their page is older than the fixes, it says **Reload and check**.
- **Plans:** for a note about an idea, you may say what you'll do first. They press **Go ahead**, or say what to change.
- **From the agent:** if you turned on critique, your notes arrive here and they pick **Fix it** or **Not an issue**.

## Options

- **Critique (your own notes on the page):** for when the reviewer wants your eye first.
  ```bash
  st feedback <name> annotate <page url> "<comment>" --selector <css> --severity blocking|important|suggestion
  ```
  - **A change they can accept:** add `--suggest-text "<new text>"` or `--suggest-tweak "<property>=<value>"`. They can preview it and accept it into their drafts.
  - **Visibility:** they see critique notes only when the server runs with `--critique`.
  - **Their decisions:** `list --agent` shows Fix it, or Not an issue with a reason, and `wait` wakes on one.
  - **`MEASURED` notes** are facts their browser measured (tap targets, clipped text, contrast), with the number and the rule.
- **Storybook:** `serve … --framed --route-key id` files notes per story, and `install <dir> --storybook` targets `.storybook/preview-head.html`.
- **A film or a HyperFrames composition:** nothing to turn on. Point `--origin` at the preview server and have the reviewer open the composition's own preview URL, not the Studio that frames it.
  - **What the reviewer gets:** pointing pauses the film at that moment and Add gives it back; Talk pauses it and leaves play to them; Check takes them back to each note's moment.
  - **What you get:** the `time:` rows above, on comments, text edits, tweaks and each voice passage.
  - **Other pages with a timeline** describe it with `window.__SHOW_AND_TELL__.timeline` (`$KIT/README.md`, "A film, or any page with a timeline").
  - **Generated compositions:** when the project builds its HTML from a timeline script, `find:` and `in:` name the generated file. Change the script, then rebuild.
- **MCP instead of the CLI:** `st mcp --project <name> --src <dir>` gives the same tools over stdio, for Claude Code, Codex, Cursor and other MCP clients. `apply` and `export` stay CLI-only.
- **A remote reviewer** (a client, a teammate, a phone on another network): `st share --origin … --name <name> --tunnel` runs a key-gated proxy that injects the toolbar. This exposes their dev server, so only do it when they ask. Send the key separately from the link.
- **Several reviewers:** each one sets their name in the toolbar. Notes, drafts and Check are per reviewer; see "Several reviewers" in `$KIT/README.md`.
- **Export a round:** `st feedback <name> export --format md`. `--github` or `--pr <n>` posts to GitHub, and only when they say so.
- **Other transcription services:** any OpenAI-compatible endpoint works. Set these:
  - `SHOW_AND_TELL_TRANSCRIBE_URL`;
  - `SHOW_AND_TELL_TRANSCRIBE_KEY`: from the environment or a secret manager, never inline in a command or a file;
  - `SHOW_AND_TELL_TRANSCRIBE_MODEL`.

  Local voice has a 30-minute daily budget per project; `SHOW_AND_TELL_VOICE_DAILY_SECONDS` changes it.

## Gotchas

- **Toolbar shows "offline":** the review server isn't running, or its `--port` doesn't match the installed line.
- **403 from the review server:** the page's origin isn't the `--origin` you passed. `localhost` and `127.0.0.1` both count.
- **Ports:** 55930 is the review server, and is often taken by another project's (check `st servers`). 55940 is `share`, and 55945 the voice bridge.
- **Panels and the page:**
  - On a wide screen, panels float over the page and never push it around. A panel moves aside, or narrows, rather than cover the element the reviewer is working on.
  - On a phone, panels are bottom sheets that leave room to scroll past them.
  - If the app has its own fixed header or footer, mark it with `data-show-and-tell-reserve="top|bottom"` so the toolbar stays clear of it.
- **Corner widgets:** the toolbar starts collapsed in the bottom-right, and lifts itself clear of fixed corner widgets (chat bubbles, subscribe buttons) until the reviewer drags it.
- **Device mode:** a browser's device toolbar is fine. The bar stays on screen and in its corner as the width changes.
- **Microphone access needs a secure context.** `localhost` and `127.0.0.1` count; a LAN IP doesn't. Use `share --tunnel` for another device.
- **Kit tests:** `cd "$KIT" && pnpm test` and `pnpm test:browser`. The browser tests need Chromium, and both bind local ports, so they need the port restriction lifted.
