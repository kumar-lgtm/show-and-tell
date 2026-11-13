# The explainer video

Two cuts of the same 98-second film, "Retire the red arrow":

| File | Format |
| --- | --- |
| [`show-and-tell-landscape.mp4`](show-and-tell-landscape.mp4) | 1920 × 1080, 24 fps, H.264 + AAC |
| [`show-and-tell-vertical.mp4`](show-and-tell-vertical.mp4) | 1080 × 1920, 24 fps, H.264 + AAC, recomposed for portrait |

Posters are the `.jpg` files beside them. Captions are in [`captions.vtt`](captions.vtt) (timed by sentence length within each line, so approximate). The words are in
[`transcript.md`](transcript.md). The page that plays them is
[`docs/index.html`](../index.html).

## What is real and what is staged

- **Fieldnote**, the pricing page being reviewed, is fictional. It is the demo
  page in `example/fieldnote.html`.
- The **All text** scene is a capture of the real view, taken from
  `node scripts/prototype.mjs`.
- The other toolbar scenes (comment, rewrite, talk, send, check) are drawn from
  the product's design, not recorded from the running toolbar.
- In the **Talk** scene the speech bubbles stand in for the reviewer's voice.
  The transcript appears after Stop, as in the product, not while you speak.
- The four notes in the **Send** scene are staged. Their file and line numbers
  are the real ones in `example/fieldnote.html`.
- "Less time, less usage" is a claim about the workflow (fewer rounds, no
  re-explaining). It has not been measured.
- The chat box and the "built-in annotator" are generic drawings. No other
  product is named or shown. The comparison in that scene (comments only, no
  voice, no in-place text edits, one app) is a general claim about built-in
  annotation tools; check it against the specific tool before you quote it.

## What it is made of

- **Narration:** synthesised locally with Kokoro (voice `af_heart`).
- **Music:** a solo piano bed generated locally with ACE-Step (Apache-2.0) under
  the first 30 seconds, then a track from the HeyGen music catalog, licensed for
  videos made with HeyGen or HyperFrames under the maker's account. If you
  re-cut the film, bring your own music.
- **Sound effects:** Pixabay Content License.
- **Type:** Bricolage Grotesque, DM Sans and DM Mono (SIL Open Font License 1.1),
  the same files the toolbar uses.
- Built with [HyperFrames](https://hyperframes.heygen.com). The editable
  projects are not in this repository.
