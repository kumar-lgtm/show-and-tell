/**
 * Whole-sentence view of a spoken review, shared by the toolbar model and every
 * agent-facing reader. Pure: no Node or DOM APIs, so the toolbar bundle can
 * import it as well.
 *
 * Pointing cuts speech at the moment the target changes, so a single sentence
 * ("make this a little bit larger") can land in two passages ("blue make" /
 * "this a little bit larger"). Read alone, each fragment is meaningless. This
 * joins the passages in speech order, keeps every word, and writes an inline
 * marker exactly where the target changed:
 *
 *   Let's change this free trial button to [→ T2 Start free trial] blue make
 *   [→ T3 Starter] this a little bit larger.
 *
 * Markers are generated text; passage text is the reviewer's (untrusted) words
 * and is never interpreted. Callers still fence the result for their surface.
 */

const ws = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const clip = (value, max) => { const s = ws(value); return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s; };
const TERMINAL = /[.!?…]/;
const CLOSERS = /["'’”)\]]/;

/**
 * @param {Array<{id:string,text:string,startMs?:number,needsReview?:boolean,target:{id?:string,label?:string,kind?:string}}>} passages
 *   in any order; they are sorted by speech time with input order as the tiebreak.
 * @returns {{targets:Array<{ref:string,id:string,label:string,kind:string}>, sentences:Array<{text:string,passageIds:string[],targetRefs:string[]}>, words:string}}
 *   `words` is the marker-free text, for checking that nothing was dropped.
 */
export function voiceSentences(passages) {
  const ordered = passages.map((p, index) => ({ p, index }))
    .sort((a, b) => (num(a.p.startMs) - num(b.p.startMs)) || (a.index - b.index))
    .map(({ p }) => p);
  const targets = [], refs = new Map();
  const refFor = (target = {}) => {
    const key = target.id || `${target.kind || 'general'}:${target.label || ''}`;
    if (!refs.has(key)) {
      const ref = `T${refs.size + 1}`;
      refs.set(key, ref);
      targets.push({ ref, id: String(target.id || key), label: target.kind === 'general' ? 'General' : clip(target.label || target.kind || 'Target', 160), kind: target.kind || 'general' });
    }
    return refs.get(key);
  };
  const sentences = [];
  let current = null, lastRef = null;
  const open = () => { if (!current) current = { parts: [], passageIds: new Set(), targetRefs: new Set() }; return current; };
  const close = () => {
    if (current && current.parts.some((x) => !x.marker)) {
      sentences.push({ text: current.parts.map((x) => x.text).join(' '), passageIds: [...current.passageIds], targetRefs: [...current.targetRefs] });
      current = null;
    }
  };
  for (const passage of ordered) {
    const text = ws(passage.text);
    if (!text) continue;
    const ref = refFor(passage.target);
    if (ref !== lastRef) {
      const target = targets.find((t) => t.ref === ref);
      const note = passage.needsReview ? ' (check timing)' : '';
      open().parts.push({ marker: true, text: `[→ ${ref} ${clip(target.label.replace(/[[\]]/g, ''), 60) || 'Target'}${note}]` });
      lastRef = ref;
    }
    // Split the passage at sentence ends. A passage that ends mid-sentence
    // leaves the sentence open for the next passage: that is the whole point.
    let start = 0;
    for (let i = 0; i < text.length; i++) {
      if (!TERMINAL.test(text[i])) continue;
      let end = i + 1;
      while (end < text.length && (TERMINAL.test(text[end]) || CLOSERS.test(text[end]))) end++;
      if (end < text.length && text[end] !== ' ') { i = end - 1; continue; } // "3.5", "e.g.x"
      const piece = text.slice(start, end).trim();
      if (piece) { const s = open(); s.parts.push({ text: piece }); s.passageIds.add(passage.id); s.targetRefs.add(ref); }
      close();
      start = end; i = end - 1;
    }
    const rest = text.slice(start).trim();
    if (rest) { const s = open(); s.parts.push({ text: rest }); s.passageIds.add(passage.id); s.targetRefs.add(ref); }
  }
  close();
  // A trailing marker with no words after it cannot exist (markers precede
  // text), so every marker sits inside a sentence.
  return { targets, sentences, words: ordered.map((p) => ws(p.text)).filter(Boolean).join(' ') };
}

/** Remove generated markers. Used by tests to prove no word was dropped. */
export function stripMarkers(text) {
  return ws(String(text).replace(/\[→ T\d+ [^\]]*\]/g, ' '));
}

function num(value) { return Number.isFinite(value) ? value : Infinity; }
