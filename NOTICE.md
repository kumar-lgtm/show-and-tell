# Third-party notice

`dist/show-and-tell.js` is built from, and includes, **Agentation 3.0.2**
(https://www.npmjs.com/package/agentation), Copyright (c) 2026 Benji Taylor,
licensed under the PolyForm Shield License 1.0.0. The full licence text is in
`toolbar/AGENTATION-LICENSE` and must travel with any copy of the bundle.

`toolbar/build.mjs` modifies the Agentation source in memory at build time (it
never edits `node_modules`). The resulting bundle is a derivative work under that
licence.

The bundle also includes React and React DOM (MIT, Copyright (c) Meta Platforms, Inc.).

## Fonts

`server/fonts/` holds three typefaces, served to the toolbar by the review
server, each under the SIL Open Font License 1.1 (https://openfontlicense.org):

- **DM Sans** (`dm-sans.woff2`), Copyright 2014 The DM Sans Project Authors.
- **DM Mono** (`dm-mono.woff2`), Copyright 2020 The DM Mono Project Authors.
- **Bricolage Grotesque** (`bricolage-grotesque.woff2`), Copyright 2022 The
  Bricolage Grotesque Project Authors.

They are the Latin subsets published by Fontsource, unmodified. `docs/assets/fonts/` holds
copies of the same three files for the demo page (`docs/index.html`). In the page
they are declared under the family names "ST Sans", "ST Mono" and "ST Display"
so nothing on the page under review can pick them up by accident.

## Explainer video

`docs/video/` holds two cuts of the explainer film. Their narration, music and
sound sources and licences are listed in `docs/video/README.md`.
