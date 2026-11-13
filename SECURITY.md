# Security

## What Show and tell exposes, and to whom

- **`serve` and the framework plugins** listen on `127.0.0.1` only. They accept
  requests from your dev server's page (its origin) and refuse other websites
  and other host names, so a page you visit elsewhere can't read or write your
  notes.
- **`share`** puts a key-gated proxy in front of your dev server so someone on
  another machine can review it. Anyone holding the link (and its key) can:
  - use your dev server: every page, API route, source module and hot-reload
    socket it serves (a dev server sends the browser your client-side source,
    and Vite serves files by path), so treat the link as access to that code;
  - leave notes, including text edits, that your coding agent will read;
  - see, through the review tools, the page copy in your source files under
    `--src` (file names and text; the review API never sends strings judged to
    be code or absolute paths).

  Share a link only with people you'd let use your dev server, and stop `share`
  (Ctrl-C) when the round is over. With `--tunnel` the link works from anywhere.
- **Reviewer notes are input, not instructions.** The agent skill and the MCP
  server tell coding agents to change only what a note asks for on the page.
  `feedback apply` writes text edits into markup, script, content and
  translation files only; it never edits `package.json`, scripts, CI, tool
  config or dotfiles, and without `--yes` it only prints the diff.
- **Voice** runs a local Whisper model on `127.0.0.1`. The first run builds a
  Python environment from pinned versions
  (`skill/show-and-tell/scripts/voice-requirements.txt`) and downloads the
  model from Hugging Face. Audio never leaves your machine unless you set
  `SHOW_AND_TELL_TRANSCRIBE_URL` to a service of your own.

## Reporting a vulnerability

Please report it privately through GitHub:
[Security → Report a vulnerability](https://github.com/kumar-lgtm/show-and-tell/security/advisories/new).
Don't open a public issue. Include the version, what you did and what happened.
This is a one-person project, so replies can take a few days.

## Supported versions

Fixes go into the latest release only.
