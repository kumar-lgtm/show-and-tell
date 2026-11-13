/**
 * What a voice anchor points at, in page terms: names, roles and nearby text.
 *
 * Geometry alone is unreliable on a dense page ("Region 640 × 120" could be
 * anything), so each anchor also records the element's accessible name, role,
 * nearest heading and landmark, and for a dragged region the elements it
 * contains or crosses. Everything is short, capped plain text; the model
 * (voice-model.js) sanitises it again before it is saved.
 */

const CHROME = '[data-feedback-toolbar],[data-agentation-root],#agentation-root,[data-sk-no-edit]';
const INTERACTIVE = 'a[href],button,input,select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=tab],[role=menuitem],[role=switch]';
const HEADING = 'h1,h2,h3,h4,h5,h6,[role=heading]';
const LANDMARKS = { main: 'main', nav: 'navigation', header: 'banner', footer: 'contentinfo', aside: 'complementary', form: 'form', search: 'search', dialog: 'dialog' };
const ROLE_LANDMARKS = new Set(['main', 'navigation', 'banner', 'contentinfo', 'complementary', 'form', 'search', 'region', 'dialog']);
const MAX_SCAN = 4000;

const squash = (s, max = 80) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t; };

export function selectorFor(node) {
  if (node.id) return '#' + CSS.escape(node.id);
  const parts = [];
  for (let n = node; n && n !== document.body && parts.length < 5; n = n.parentElement) {
    let p = n.tagName.toLowerCase();
    if (n.id) { parts.unshift('#' + CSS.escape(n.id)); break; }
    const siblings = [...(n.parentElement?.children || [])].filter((x) => x.tagName === n.tagName);
    if (siblings.length > 1) p += `:nth-of-type(${siblings.indexOf(n) + 1})`;
    parts.unshift(p);
  }
  return parts.join(' > ') || 'body';
}

export function roleOf(node) {
  const explicit = node.getAttribute('role');
  if (explicit) return explicit.split(/\s+/)[0].toLowerCase();
  const tag = node.tagName.toLowerCase();
  if (/^h[1-6]$/.test(tag)) return 'heading';
  if (tag === 'a') return node.hasAttribute('href') ? 'link' : '';
  if (tag === 'button' || tag === 'summary') return 'button';
  if (tag === 'img') return node.getAttribute('alt') === '' ? '' : 'img';
  if (tag === 'textarea') return 'textbox';
  if (tag === 'select') return 'combobox';
  if (tag === 'input') {
    const type = (node.getAttribute('type') || 'text').toLowerCase();
    return { checkbox: 'checkbox', radio: 'radio', button: 'button', submit: 'button', reset: 'button', range: 'slider', search: 'searchbox' }[type] || 'textbox';
  }
  if (tag === 'li') return 'listitem';
  if (LANDMARKS[tag]) return LANDMARKS[tag];
  return '';
}

/** A practical accessible name: aria-labelledby, aria-label, label, alt, then text. */
export function accessibleName(node) {
  const by = node.getAttribute('aria-labelledby');
  if (by) { const t = by.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' '); if (t.trim()) return squash(t); }
  const label = node.getAttribute('aria-label');
  if (label?.trim()) return squash(label);
  if (node.labels?.length) return squash([...node.labels].map((l) => l.textContent).join(' '));
  const alt = node.getAttribute('alt');
  if (alt?.trim()) return squash(alt);
  if (/^(input|textarea|select)$/i.test(node.tagName)) return squash(node.getAttribute('placeholder') || node.getAttribute('title') || '');
  const text = node.innerText ?? node.textContent;
  if (text?.trim()) return squash(text);
  return squash(node.getAttribute('title') || '');
}

/** Text written directly in this node (not in its children): a paragraph's own words. */
function ownText(node) {
  let t = '';
  for (const c of node.childNodes) if (c.nodeType === 3) t += c.textContent;
  return t.trim();
}

function chrome(node) { return !!node.closest?.(CHROME); }

export function nearestHeading(node) {
  if (node.matches?.(HEADING)) return '';
  const headings = [...document.querySelectorAll(HEADING)].slice(0, 500).filter((h) => !chrome(h));
  let found = null;
  for (const h of headings) {
    if (h === node || h.contains(node)) continue;
    // DOCUMENT_POSITION_FOLLOWING (4): node comes after h.
    if (h.compareDocumentPosition(node) & 4) found = h; else break;
  }
  return found ? squash(found.innerText || found.textContent, 120) : '';
}

export function landmarkOf(node) {
  for (let n = node.parentElement; n && n !== document.documentElement; n = n.parentElement) {
    const role = n.getAttribute('role') || LANDMARKS[n.tagName.toLowerCase()];
    if (!role || !ROLE_LANDMARKS.has(role)) continue;
    if (role === 'region' && !n.getAttribute('aria-label') && !n.getAttribute('aria-labelledby')) continue;
    const name = n.getAttribute('aria-label') || '';
    return squash(name ? `${role}: ${name}` : role, 80);
  }
  return '';
}

/** The element itself plus where it lives. Its label stays short even for a big card. */
export function elementContext(node) {
  const context = { tag: node.tagName.toLowerCase(), role: roleOf(node), name: accessibleName(node), heading: nearestHeading(node), landmark: landmarkOf(node) };
  const own = ownText(node);
  if (own && squash(own, 160) !== context.name) context.text = squash(own, 160);
  return context;
}

function visible(node, r) {
  if (!r.width || !r.height) return false;
  const s = getComputedStyle(node);
  return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) !== 0;
}

/**
 * Elements a dragged region contains or crosses, in reading order. Interactive
 * controls, headings and images count as one item each (their inner spans are
 * not listed again); other elements count when they carry their own text.
 * Very large containers are skipped: they are context, not the target.
 */
export function regionContext(rect, max = 8) {
  const area = rect.width * rect.height;
  const picked = [];
  let scanned = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode(n) {
      if (n.matches(CHROME) || /^(script|style|noscript|template|svg)$/i.test(n.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n = walker.nextNode(); n && scanned < MAX_SCAN; n = walker.nextNode()) {
    scanned++;
    const r = n.getBoundingClientRect();
    const ix = Math.min(r.right, rect.x + rect.width) - Math.max(r.left, rect.x);
    const iy = Math.min(r.bottom, rect.y + rect.height) - Math.max(r.top, rect.y);
    if (ix <= 0 || iy <= 0 || !visible(n, r)) continue;
    const atomic = n.matches(INTERACTIVE) || n.matches(HEADING) || n.tagName === 'IMG';
    const texty = !atomic && ownText(n).length > 1;
    if (!atomic && !texty) continue;
    if (!atomic && r.width * r.height > area * 6) continue;
    const inside = ix >= r.width - 1 && iy >= r.height - 1;
    picked.push({ n, overlap: inside ? 'inside' : 'partly', share: (ix * iy) / (r.width * r.height) });
    if (atomic) {
      // Skip this control's own descendants: the button is the item, not its span.
      let last = n; while (last.lastElementChild) last = last.lastElementChild; walker.currentNode = last;
    }
  }
  const ranked = [...picked].sort((a, b) => (a.overlap === b.overlap ? b.share - a.share : a.overlap === 'inside' ? -1 : 1)).slice(0, max);
  const keep = new Set(ranked.map((x) => x.n));
  const elements = picked.filter((x) => keep.has(x.n)).map(({ n, overlap }) => ({
    tag: n.tagName.toLowerCase(), role: roleOf(n), name: n.matches(INTERACTIVE) || n.matches(HEADING) || n.tagName === 'IMG' ? accessibleName(n) : squash(ownText(n)), selector: selectorFor(n), overlap,
  }));
  const centre = document.elementsFromPoint?.(rect.x + rect.width / 2, rect.y + rect.height / 2)?.find((x) => !chrome(x));
  return { elements, total: picked.length, ...(centre ? { heading: nearestHeading(centre), landmark: landmarkOf(centre) } : {}) };
}

/** A short label for an element anchor: its name, else its tag. Never a whole card's text. */
export function elementLabel(node) {
  return squash(node.getAttribute('aria-label') || accessibleName(node) || node.tagName.toLowerCase(), 90) || node.tagName.toLowerCase();
}

/**
 * The line under a passage's target chip in the Talk review. An element says
 * what it is and the heading it sits under; a region names what it contains.
 * The bare role ("heading") read as a stray word (UX review 5, #17), so it
 * says "Near:" first.
 */
export function nearText(a) {
  const c = a?.context;
  if (!c) return '';
  if (a.kind === 'region') {
    const names = (c.elements || []).map((e) => e.name).filter(Boolean).slice(0, 3);
    const more = (c.elements || []).length - names.length + (c.more || 0);
    return names.length ? `Contains ${names.map((n) => `“${n}”`).join(', ')}${more > 0 ? ` and ${more} more` : ''}` : '';
  }
  const bits = [c.role || c.tag, c.heading ? `under “${c.heading}”` : ''].filter(Boolean);
  return bits.length ? 'Near: ' + bits.join(', ') : '';
}
