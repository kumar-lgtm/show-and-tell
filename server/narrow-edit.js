// When a text edit's FROM isn't in the source as a whole, the change itself
// usually is. An edit captured on a container (a nav whose wordmark, statement
// and CTA are separate elements) arrives as their texts glued together:
//   FROM "pollut.ai®Personal misinformation as a servicePollute me ↗"
//   TO   "pollut.ai®Hallucination as a servicePollute me ↗"
// The source has "Personal misinformation as a service" in one element, never
// the glued string. This returns smaller FROM → TO pairs to try instead, widest
// first: the changed words plus as many whole neighbouring words as still sit
// in the same run of text, down to just the changed words.
//
// No Node imports: pure string work, shared by apply.js and the pointers.

const collapse = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const WORDCH = /[\p{L}\p{N}_'’-]/u;

/**
 * @returns {Array<{from: string, to: string}>} candidates, widest context first.
 *   Empty when FROM and TO don't share a prefix or suffix (nothing to narrow).
 */
export function narrowCandidates(rawFrom, rawTo, { maxContext = 3 } = {}) {
  const F = collapse(rawFrom), T = collapse(rawTo);
  if (!F || F === T) return [];
  // Common prefix / suffix, by character.
  let p = 0;
  while (p < F.length && p < T.length && F[p] === T[p]) p++;
  let s = 0;
  while (s < F.length - p && s < T.length - p && F[F.length - 1 - s] === T[T.length - 1 - s]) s++;
  if (p === 0 && s === 0) return [];
  // Grow the changed span out to whole words (never split "misinformation").
  let a = p, b = F.length - s;
  while (a > 0 && WORDCH.test(F[a - 1])) a--;
  while (b < F.length && WORDCH.test(F[b])) b++;
  const lead = F.slice(0, a), tail = F.slice(b);
  const core = F.slice(a, b);
  const coreTo = T.slice(a, T.length - (F.length - b));
  if (!collapse(core) && !collapse(coreTo)) return [];
  // Neighbouring words count as context only when whitespace separates them
  // from the change: "®Personal" means the ® lives in another element.
  const leftWords = /\s$/.test(lead) ? lead.trim().split(' ') : [];
  const rightWords = /^\s/.test(tail) ? tail.trim().split(' ') : [];
  // A neighbour glued to the next element ("servicePollute") won't match the
  // source; the narrower candidates that leave it out will. The caller keeps
  // the first candidate found exactly once.
  const out = [];
  const seen = new Set();
  const pairs = [];
  for (let kl = Math.min(maxContext, leftWords.length); kl >= 0; kl--) {
    for (let kr = Math.min(maxContext, rightWords.length); kr >= 0; kr--) pairs.push([kl, kr]);
  }
  pairs.sort((x, y) => (y[0] + y[1]) - (x[0] + x[1]));
  for (const [kl, kr] of pairs) {
    const L = leftWords.slice(leftWords.length - kl);
    const R = rightWords.slice(0, kr);
    const from = collapse([...L, core, ...R].join(' '));
    const to = collapse([...L, coreTo, ...R].join(' '));
    if (!from || from === F || seen.has(from)) continue;
    seen.add(from);
    out.push({ from, to });
  }
  return out;
}
