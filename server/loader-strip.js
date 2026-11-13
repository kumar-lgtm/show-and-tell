// The block `install` adds, and how to take it out byte for byte. Shared by
// `install --remove` and the git clean filter (server/git-filter.js) that keeps
// the block out of commits while it stays in the working file.
export const START = 'show-and-tell:start';
export const END = 'show-and-tell:end';
// Blocks written before the tool was renamed. Still found and removed.
const LEGACY = [['agentation-kit:start', 'agentation-kit:end']];
const PAIRS = [[START, END], ...LEGACY];

/** Is a loader block (current or from before the rename) in this text? */
export function hasLoader(text) { return PAIRS.some(([start]) => text.includes(start)); }

/** text without the loader block. Throws (with `label` in the message) on damaged markers. */
export function stripLoader(text, label = 'file') {
  for (const [start, end] of PAIRS) text = stripPair(text, label, start, end);
  return text;
}

function stripPair(text, label, START, END) {
  const s = text.indexOf(START);
  if (s < 0) return text;
  const e = text.indexOf(END, s);
  if (e < 0) throw new Error(`${label}: found ${START} without ${END} — fix by hand`);
  // Span = the comment that opens START through the comment that closes END.
  let from = Math.max(text.lastIndexOf('<!--', s), text.lastIndexOf('{/*', s));
  const closer = text.slice(e).search(/-->|\*\/\}/);
  if (from < 0 || closer < 0) throw new Error(`${label}: marker comments are damaged — fix by hand`);
  let to = e + closer + 3; // both closers are 3 chars
  // A block on its own lines takes its indentation and newline with it.
  const lineStart = text.lastIndexOf('\n', from) + 1;
  const eolAfter = text.startsWith('\r\n', to) ? 2 : text[to] === '\n' ? 1 : 0;
  if (/^\s*$/.test(text.slice(lineStart, from)) && eolAfter) { from = lineStart; to += eolAfter; }
  return text.slice(0, from) + text.slice(to);
}
