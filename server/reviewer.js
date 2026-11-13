/**
 * The reviewer's name, as the server stores it.
 *
 * It arrives from any browser that can reach the review server (a note's
 * `reviewer`, a reply's `name`, the round marker's `reviewer`), and it is
 * printed into the agent's terminal and the inbox. So it is one short line of
 * printable text, or nothing: control characters (including ANSI escapes and
 * newlines that would forge extra lines in `feedback list`) become spaces, and
 * anything past MAX_REVIEWER is cut. toolbar/reviewer.js applies the same rule.
 */
export const MAX_REVIEWER = 40;

/** A clean name, or null when there is nothing usable. */
export function cleanReviewer(raw) {
  if (typeof raw !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const name = raw.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_REVIEWER).trim();
  return name || null;
}

/** The `agentation-round` KV value with its `reviewer` cleaned; other values pass through. */
export function cleanRoundValue(value) {
  let round;
  try { round = JSON.parse(value); } catch { return value; }
  if (!round || typeof round !== 'object' || Array.isArray(round) || !('reviewer' in round)) return value;
  const reviewer = cleanReviewer(round.reviewer);
  if (reviewer) round.reviewer = reviewer; else delete round.reviewer;
  return JSON.stringify(round);
}
