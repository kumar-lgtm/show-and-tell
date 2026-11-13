import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.argv[2], out = process.argv[3];
const inner = (f) => { let s = readFileSync(`${dir}/${f}.svg`, 'utf8').trim(); if (s.includes('`')) throw new Error('backtick'); const vb = s.match(/viewBox="([^"]+)"/)[1]; s = s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<defs>.*?<\/defs>/s, '').replace(/ clip-path="[^"]*"/g, ''); return { vb, s }; };
const sticker = (f) => { const { vb, s } = inner(f); return `<svg data-art="bub" viewBox="${vb}" width="24" height="24" aria-hidden="true" focusable="false" style="border-radius:50%;overflow:hidden;flex:none">${s}</svg>`; };
const mark = inner('mA21m');
const src = `/**
 * Brand art, generated from Pencil/show-and-tell.pen (Classroom board UkaSo).
 * Do not edit by hand: re-export the nodes as SVG and run the generator
 * (see docs/brand.md).
 *
 *   MARK   the Show and tell mark (node mA21m). Its outline is currentColor,
 *          so it reads on ink and on paper; the bubble is always tomato.
 *   BUB    the mascot as a round sticker, one pose per agent state:
 *          ready (sqUcx), working (N7SwQ1), asleep (BpTuw).
 *
 * Each is a complete, self-contained <svg> with no ids, so several can sit in
 * one document (or one shadow root) without clashing.
 */
export const MARK = ${JSON.stringify(`<svg data-art="mark" viewBox="${mark.vb}" width="18" height="18" aria-hidden="true" focusable="false" style="flex:none">${mark.s.replace('fill="#fff4e0"', 'fill="currentColor"')}</svg>`)};
export const BUB = {
  ready: ${JSON.stringify(sticker('sqUcx'))},
  working: ${JSON.stringify(sticker('N7SwQ1'))},
  asleep: ${JSON.stringify(sticker('BpTuw'))},
};
`;
writeFileSync(out, src);
