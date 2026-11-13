# Show and tell on a Ghost theme

- **Run Ghost locally.** Use Ghost's own local install (`ghost install local`), or the project's own preview site if it has one. If the project documents how to start it (a Node version, a start command, a port), follow that: older Ghost versions crash on newer Node. A local Ghost usually serves `localhost:2368`.
- **The active theme may be a copy.** A local Ghost runs whatever theme is active in its database. That is often a copy of the theme folder under `content/themes/`, not the repo you edit. Sync the current source into it the way the project does (a watch or `rsync` script), and note the previously active theme so you can switch back.
- **Where the toolbar line goes:**
  - Install into the active theme's `default.hbs`: `st install <theme dir>` finds it.
  - If the theme repo is shared or has uncommitted work, install into the preview's copy of `default.hbs` instead, and keep `--src` on the theme repo so the pointers resolve to real source.
- **Content** comes from the local database, not the live site. Notes about a post's text belong to the post, not the theme.
- **Corner widgets:** Ghost Portal's subscribe button sits bottom-right. The toolbar lifts itself clear of it until the reviewer drags it.
