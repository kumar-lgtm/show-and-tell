/**
 * The page's copy, in the order a reader meets it, shaped by its structure:
 * landmarks (header, nav, main, sections, footer) → headings → text and the
 * attribute copy people also read (alt, aria-label, title, placeholder, copy in
 * data-* attributes). The server joins this with the copy it finds in source
 * (server/copy-place.js), so copy edit mode can show every string where it
 * lives on the page, and the strings that never sit in the DOM at once (a random
 * pick from an array, a canvas label) beside the place they show up.
 *
 * Read only. It never writes to the page, so it is safe before hydration.
 */

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "TEXTAREA", "SELECT", "IFRAME", "OBJECT", "EMBED", "CANVAS", "VIDEO", "AUDIO"]);
const INLINE = new Set(["B", "I", "EM", "STRONG", "SPAN", "A", "BR", "U", "SUB", "SUP", "MARK", "SMALL", "CODE", "ABBR", "TIME", "S", "DEL", "INS", "KBD", "WBR", "Q", "VAR", "SAMP", "BDI", "BDO", "FONT", "LABEL"]);
const LANDMARK_TAGS = { HEADER: "header", NAV: "nav", MAIN: "main", SECTION: "section", ARTICLE: "article", ASIDE: "aside", FOOTER: "footer", FORM: "form", DIALOG: "dialog" };
const LANDMARK_ROLES = new Set(["banner", "navigation", "main", "region", "complementary", "contentinfo", "form", "search", "dialog", "article"]);
const SKIP_ZONE = "#agentation-root, [data-agentation-root], .sk-edit-ui, [data-sk-no-edit], [data-agentation-kit-chrome], [data-feedback-toolbar]";
const COPY_ATTRS = ["alt", "title", "aria-label", "aria-description", "aria-roledescription", "aria-valuetext", "placeholder"];
const SVG_TEXT = new Set(["text", "tspan", "textPath", "title", "desc"]);

const collapse = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/**
 * The text as a reader sees the words: a <br> or a block-level child breaks
 * words apart ("BECOME<br>NO ONE." is "BECOME NO ONE.", not "BECOMENO ONE.").
 * Not innerText: that applies text-transform and drops hidden text, and the
 * source holds the text as typed.
 */
export function textOf(node) {
  let out = "";
  for (const n of node.childNodes) {
    if (n.nodeType === 3) { out += n.nodeValue; continue; }
    if (n.nodeType !== 1) continue;
    if (n.tagName === "BR") { out += " "; continue; }
    // An inline icon's <title> is not part of the sentence beside it.
    if (n.localName === "svg" && n.namespaceURI?.endsWith("svg")) continue;
    let display = "inline";
    try { display = getComputedStyle(n).display || "inline"; } catch { /* detached */ }
    const inner = textOf(n);
    out += /^inline($|-block)|contents/.test(display) ? inner : ` ${inner} `;
  }
  return out;
}

/** Copy in a data-* attribute: words with spaces, not an id or a token list. */
export function looksLikeCopy(value) {
  const v = collapse(value);
  if (!/\s/.test(v) || !/\p{L}{2,}/u.test(v)) return false;
  // `card wide featured` is a token list; a sentence has punctuation or capitals.
  return !/^[a-z0-9_-]+(\s+[a-z0-9_-]+)*$/.test(v);
}

function selectorOf(el) {
  const parts = [];
  for (let n = el, d = 0; n && n.nodeType === 1 && d < 4; d++, n = n.parentElement) {
    if (n.tagName === "BODY" || n.tagName === "HTML") break;
    if (n.id) { parts.unshift(`#${CSS.escape(n.id)}`); break; }
    let part = n.tagName.toLowerCase();
    const cls = (n.getAttribute("class") || "").trim().split(/\s+/).filter((c) => c && !c.startsWith("sk-"))[0];
    if (cls) part += `.${CSS.escape(cls)}`;
    parts.unshift(part);
  }
  return parts.join(" > ");
}

function landmarkKind(el) {
  const role = el.getAttribute("role");
  if (role && LANDMARK_ROLES.has(role)) return role;
  const k = LANDMARK_TAGS[el.tagName];
  if (!k) return null;
  // A <section> or <form> is a region only with a name; we still use it, unnamed sections structure the page too.
  return k;
}

function labelOf(el) {
  const own = el.getAttribute("aria-label");
  if (own) return collapse(own);
  const by = el.getAttribute("aria-labelledby");
  if (by) {
    const t = by.split(/\s+/).map((id) => { const n = el.ownerDocument.getElementById(id); return n ? textOf(n) : ""; }).join(" ");
    if (collapse(t)) return collapse(t);
  }
  const h = el.querySelector("h1, h2, h3, h4, h5, h6, [role=heading]");
  if (h && collapse(textOf(h))) return collapse(textOf(h));
  return el.id ? `#${el.id}` : "";
}

/** Hidden from everyone (display:none, hidden) vs hidden only from screen readers. */
function visibility(el) {
  if (el.closest("[hidden], [inert]")) return "hidden";
  let style;
  try { style = getComputedStyle(el); } catch { return "shown"; }
  if (style.display === "none" || style.visibility === "hidden") return "hidden";
  if (el.closest("[aria-hidden=true]")) return "decorative";
  return "shown";
}

function isLeaf(el) {
  if (!collapse(el.textContent)) return false;
  for (const c of el.children) {
    if (INLINE.has(c.tagName) || (c.namespaceURI?.endsWith("svg") && SVG_TEXT.has(c.localName))) continue;
    // An icon or an image beside the words holds no copy: "<li><svg/> Email support</li>" is one piece of text.
    if ((c.namespaceURI?.endsWith("svg") && c.localName === "svg") || !collapse(c.textContent)) continue;
    return false;
  }
  return true;
}

/** A flex/grid row of inline pieces is several pieces of copy (see edit-mode.js isRowOfPieces). */
function isRow(el) {
  if (el.children.length < 2) return false;
  for (const c of el.childNodes) if (c.nodeType === 3 && collapse(c.nodeValue)) return false;
  let display = "";
  try { display = getComputedStyle(el).display || ""; } catch { /* detached */ }
  return /flex|grid/.test(display) && Array.from(el.children).filter((c) => collapse(c.textContent)).length > 1;
}

/**
 * @param {Document} [doc]
 * @returns {{url: string, title: string, items: object[], resources: string[]}}
 *   items: {type: 'landmark'|'heading'|'text'|'attr', depth, ...}
 *   A landmark carries `id` and `parent` (the landmark it sits in, 0 for none);
 *   everything else carries `lm`, the landmark it belongs to. Depth alone cannot
 *   say that a paragraph after a closed <section> is back in <main>.
 */
export function collectOutline(doc = document) {
  const items = [];
  const head = [];
  let lmSeq = 1; // 1 is the document head
  if (collapse(doc.title)) head.push({ type: "text", depth: 1, lm: 1, tag: "title", text: collapse(doc.title), selector: "title", visibility: "meta" });
  for (const m of doc.querySelectorAll("meta[name=description], meta[property^='og:'], meta[name^='twitter:']")) {
    const k = m.getAttribute("name") || m.getAttribute("property") || "";
    if (!/title|description|site_name/.test(k)) continue;
    const v = collapse(m.getAttribute("content"));
    if (v) head.push({ type: "attr", depth: 1, lm: 1, tag: "meta", attr: "content", name: k, text: v, selector: `meta[${m.hasAttribute("name") ? "name" : "property"}="${k}"]`, visibility: "meta" });
  }
  if (head.length) items.push({ type: "landmark", depth: 0, id: 1, parent: 0, kind: "head", label: "Page title and sharing" }, ...head);

  const depthOf = new Map(); // landmark element → depth
  const idOf = new Map();    // landmark element → id
  const landmarkAbove = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) if (depthOf.has(p)) return p;
    return null;
  };
  const taken = new WeakSet(); // leaves already emitted (their descendants are part of them)

  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      if (SKIP_TAGS.has(el.tagName) || el.matches(SKIP_ZONE)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let el = walker.nextNode(); el; el = walker.nextNode()) {
    const parentLandmark = landmarkAbove(el);
    const depth = parentLandmark ? depthOf.get(parentLandmark) + 1 : 1;
    const kind = landmarkKind(el);
    const outer = parentLandmark ? idOf.get(parentLandmark) : 0;
    if (kind) {
      depthOf.set(el, depth);
      idOf.set(el, ++lmSeq);
      items.push({ type: "landmark", depth: depth - 1, id: lmSeq, parent: outer, kind, label: labelOf(el), selector: selectorOf(el), visibility: visibility(el) });
    }
    // A landmark's own label and text belong to it, not to what holds it.
    const lm = kind ? lmSeq : outer;
    // Attribute copy on any element.
    for (const name of COPY_ATTRS) {
      const v = el.getAttribute(name);
      if (v && collapse(v)) items.push({ type: "attr", depth, lm, tag: el.tagName.toLowerCase(), attr: name, text: collapse(v), selector: selectorOf(el), visibility: visibility(el) });
    }
    for (const a of el.attributes) {
      if (!a.name.startsWith("data-") || a.name.startsWith("data-sk-") || !looksLikeCopy(a.value)) continue;
      items.push({ type: "attr", depth, lm, tag: el.tagName.toLowerCase(), attr: a.name, text: collapse(a.value), selector: selectorOf(el), visibility: visibility(el) });
    }
    if (el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type) && collapse(el.value)) {
      items.push({ type: "attr", depth, lm, tag: "input", attr: "value", text: collapse(el.value), selector: selectorOf(el), visibility: visibility(el) });
    }
    // Text: the outermost leaf (block of inline text), split rows into pieces.
    if (el.parentElement && taken.has(el.parentElement)) { taken.add(el); continue; }
    if (!isLeaf(el) || isRow(el)) continue;
    taken.add(el);
    const heading = /^H[1-6]$/.test(el.tagName) ? Number(el.tagName[1]) : el.getAttribute("role") === "heading" ? Number(el.getAttribute("aria-level") || 2) : 0;
    const pieces = [];
    for (const n of el.childNodes) {
      const t = n.nodeType === 3 ? collapse(n.nodeValue) : n.nodeType === 1 ? collapse(textOf(n)) : "";
      if (t) pieces.push(t);
    }
    items.push({
      type: heading ? "heading" : "text", depth, lm, level: heading || undefined,
      tag: el.tagName.toLowerCase(), text: collapse(textOf(el)), pieces: pieces.length > 1 ? pieces : undefined,
      selector: selectorOf(el), editId: el.getAttribute("data-sk-edit") || undefined, visibility: visibility(el),
    });
  }
  // Scripts the page ran, so the server can narrow source-only copy to this page.
  let resources = [];
  try {
    resources = performance.getEntriesByType("resource").map((e) => e.name).filter((u) => /\.(m?[jt]sx?|cjs|vue|svelte|astro)(\?|$)/i.test(u));
  } catch { /* no performance API */ }
  for (const s of doc.scripts) if (s.src) resources.push(s.src);
  return { url: location.href, title: collapse(doc.title), items, resources: [...new Set(resources)] };
}
