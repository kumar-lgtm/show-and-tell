# The Show and tell brand, in the toolbar

The source is a design file kept outside this repo; `toolbar/brand-art.js` holds the generated art.
Every value the toolbar draws comes from one module, `toolbar/brand.js`.

## The rules

- **Ink and chalk.** The tool surface is ink (`#1D1A2F`) with chalk text
  (`#FFF4E0`). The light theme is paper (`#FFFCF5`) with ink text.
- **One accent: tomato** (`#FF5436`). Primary actions, the reviewer's own
  markers and the selected mode. Text on tomato is ink (5.6:1), never white
  (3.1:1). Tomato as text on ink uses the tint `#FF9C87`; on paper, `#A92B15`.
- **Yellow is keyboard focus** (`#FFC72C`) and nothing else, so focus and
  action never compete. Yellow is 1.5:1 on paper, so the light theme's ring is
  ink.
- **Status is an icon and a word**, never colour alone. The selected mode says
  its name on the bar.
- **Type.** DM Sans for the interface, Bricolage Grotesque for panel titles, DM
  Mono for selectors and `file:line` only. Text is 12px or larger; sentence case.
- **Shape.** 10px controls, 16px panels and the bar, pills for chips. 44px
  targets on touch.
- **Bub** (the mascot) is the agent on the bar: ready, working (holding a
  pencil) or asleep (offline). A question or a failure keeps a plain icon and a
  word, because those need reading, not charm. Bub is never a control's only
  label and is never recoloured.
- **The mark** is the Comment mode and the closed bar. Its outline follows the
  text colour; the bubble is always tomato.

## Where it is applied

| Layer | File | How |
|---|---|---|
| Our panels (shadow roots) | `toolbar/ui.js` `baseCSS()` | `--sk-*` custom properties built from `brand.js` |
| The bar and the component's chrome (light DOM) | `toolbar/review-tools.js`, `toolbar/chrome.css.js` | literal brand values; `chrome.css.js` imports the constants |
| The pinned Agentation component | `toolbar/build.mjs` | a counted find-and-replace at build time: its near-black becomes ink, its system font stacks become the brand stack. The build fails if the counts drop |
| Fonts | `server/fonts/`, served at `<endpoint>/fonts/` | `brand.js installFonts()` declares them in the page as "ST Sans", "ST Display", "ST Mono" with `font-display: swap`. Where they can't load (a hosted page, a strict CSP) the system stack shows |
| Art | `toolbar/brand-art.js` | generated; see below |

`test/brand.test.mjs` measures the contrast of every text step on both
surfaces and fails if the old indigo or a white-on-tomato pair comes back.

## Regenerating the art

`toolbar/brand-art.js` is generated from four SVGs exported from the pen file
(`scripts/brand/svg/`: the mark `mA21m`, and Bub `sqUcx` ready, `N7SwQ1`
working, `BpTuw` asleep). To update: in Pen, export those nodes as SVG into
`scripts/brand/svg/`, then

```bash
node scripts/brand/generate-art.mjs scripts/brand/svg toolbar/brand-art.js
pnpm build
```

The generator strips ids and clip paths so several copies can share a page.
