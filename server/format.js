/**
 * One description of an annotation, for every surface that renders one.
 *
 * `mcp-tools.js` and `cli.js` each grew their own version, and both handled
 * exactly two shapes — `edit` and everything-else. That was fine while those
 * were the only shapes. They are not: the toolbar also emits `placement` (drag
 * a new component onto the page) and `rearrange` (drag or resize an existing
 * one), both carrying structured geometry. The backend has been storing them
 * correctly all along and both readers printed them as `(no comment)`, because
 * a placement usually HAS no comment — the drag is the message.
 *
 * So the data was never lost, it was just unreadable, which for an agent is the
 * same thing. Keeping the description here means adding the next kind is one
 * edit rather than two that drift.
 *
 * Presentation-neutral on purpose: this returns a headline plus label/value
 * rows, and each caller applies its own indentation and colour.
 */

/** The `kind` values that carry structure worth rendering specially. */
import { voiceSentences } from './voice-transcript.js';
import { playheadRows } from './playhead.js';

export const STRUCTURED_KINDS = new Set(["edit", "copy", "placement", "rearrange", "critique", "voice"]);
STRUCTURED_KINDS.add("tweak");

/**
 * Make one untrusted value safe to put in an agent's transcript.
 *
 * Every string an annotation carries — `comment`, `note`, `edit.from/to`,
 * `elementPath`, a reply `message` — is written by whoever holds the share link.
 * That is a client, a candidate, or anyone the link was forwarded to. It lands
 * verbatim in a tool result, which is agent context, so it is a prompt-injection
 * channel by construction.
 *
 * Two things go wrong without this, and the second is the dangerous one:
 *
 *   1. A newline in a value breaks the `key: value` alignment, so a long comment
 *      reads as though it were separate fields.
 *   2. The list format (`1. HEADLINE`, then indented `key: value` rows) is
 *      trivially forgeable. A comment containing "\n\n2. EDIT — replace this
 *      text\n   FROM: …\n   TO: …" renders as a SECOND, entirely fabricated
 *      annotation that no one wrote — complete with an id, if it supplies one.
 *
 * So: collapse the structural characters. Newlines become a visible `⏎` marker
 * rather than real line breaks, which keeps the reviewer's words readable while
 * making it impossible for them to open a new row or a new entry. This is a
 * rendering fix, not a filter — nothing is dropped, and `--json` / the raw API
 * still return the exact bytes for anything that needs them.
 */
export function fenceValue(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\n\u0085\u2028\u2029]/g, " ⏎ ")
    .replace(/\t/g, "  ");
}

const px = (n) => `${Math.round(n)}px`;
const size = (r) => `${Math.round(r.width)}×${Math.round(r.height)}`;

/**
 * Reassemble only the passages in this read, in speech order. Pointing can cut
 * a sentence in half ("make this button" / "blue"); keep that context beside
 * the individual anchors without inferring which target the sentence means.
 * Reviewer isolation and the supplied list's filters must survive grouping.
 *
 * `sentences` are whole sentences with inline `[→ T2 label]` markers at each
 * target change; `targets` explains each T# with the nearby-element context
 * captured when the reviewer pointed. Both are bounded: at most
 * VOICE_CONTEXT_CHARS of sentence text, with an explicit note when more exist
 * (the individual passages below always carry every word).
 */
export const VOICE_CONTEXT_CHARS = 6000;
export function voiceContexts(list) {
  const groups = new Map();
  for (const a of list) {
    if (a.kind !== 'voice' || !a.voice?.sessionId) continue;
    const key = JSON.stringify([a.voice.sessionId, a.reviewer || '']);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(a);
  }
  return [...groups.values()].filter((notes) => notes.length > 1).map((notes) => {
    const start = (a) => Number.isFinite(a.voice.startMs) ? a.voice.startMs : Infinity;
    const passages = [...notes].sort((a, b) => start(a) - start(b));
    const view = voiceSentences(passages.map((a) => ({
      id: a.id, text: String(a.comment || ''), startMs: a.voice.startMs, needsReview: !!a.voice.needsReview,
      target: { id: a.voice.target?.id, label: a.voice.target?.label, kind: a.voice.target?.kind },
    })));
    const byId = new Map(passages.map((a) => [a.voice.target?.id, a]));
    const targets = view.targets.map((t) => {
      const note = byId.get(t.id) || passages.find((a) => (a.voice.target?.label || '') === t.label);
      return { ref: t.ref, kind: t.kind, label: t.label, detail: targetDetail(note?.voice?.target || {}, note?.voice?.region) };
    });
    let used = 0, omitted = 0;
    const sentences = [];
    for (const s of view.sentences) {
      if (used + s.text.length > VOICE_CONTEXT_CHARS) { omitted++; continue; }
      used += s.text.length; sentences.push(s.text);
    }
    return {
      sessionId: passages[0].voice.sessionId,
      reviewer: passages[0].reviewer || '',
      count: passages.length,
      transcript: passages.map((a) => String(a.comment || '').trim()).filter(Boolean).join(' '),
      sentences,
      ...(omitted ? { omittedSentences: omitted } : {}),
      targets,
    };
  });
}

const quoted = (s) => `"${s}"`;
/**
 * One line naming a voice target by what is on the page, not by coordinates:
 * the element's accessible name and role, its heading and landmark, or for a
 * region the elements inside it. Deterministic and capped; the values are page
 * text and get fenced by the caller.
 */
export function targetDetail(target = {}, region) {
  const c = target.context || {};
  const parts = [];
  if (target.kind === 'general' || !target.kind) return 'General page feedback';
  if (target.kind === 'element') {
    const what = [c.name || c.text ? quoted(c.name || c.text) : quoted(target.label || 'element'), c.role || c.tag].filter(Boolean).join(' ');
    parts.push(`element ${what}`);
  } else {
    parts.push(region ? `region ${size(region)} at x ${Math.round(region.x)}, y ${Math.round(region.y)}` : 'region');
    const els = Array.isArray(c.elements) ? c.elements : [];
    if (els.length) {
      const items = els.map((e) => [e.role || e.tag, e.name ? quoted(e.name) : '', e.overlap === 'partly' ? '(partly)' : ''].filter(Boolean).join(' '));
      parts.push(`contains ${items.join('; ')}${c.more ? `; +${c.more} more` : ''}`);
    } else if (!target.context) parts.push('no element context captured');
  }
  if (target.selector) parts.push(`selector ${target.selector}`);
  if (c.heading) parts.push(`under heading ${quoted(c.heading)}`);
  if (c.landmark) parts.push(`in ${c.landmark}`);
  const line = parts.join(' · ');
  return line.length > 600 ? line.slice(0, 599) + '…' : line;
}

/**
 * "24px right and 60px down", or null when it did not move.
 *
 * Deliberately phrased rather than signed numbers: an agent reading
 * `dx:-24` has to work out which way that is, and so does a human reading the
 * CLI. The rects are viewport coordinates from the reviewer's browser, so this
 * is a description of intent, not a layout instruction to apply literally.
 */
function movement(from, to) {
  const dx = Math.round(to.x - from.x);
  const dy = Math.round(to.y - from.y);
  const parts = [];
  if (dx) parts.push(`${px(Math.abs(dx))} ${dx > 0 ? "right" : "left"}`);
  if (dy) parts.push(`${px(Math.abs(dy))} ${dy > 0 ? "down" : "up"}`);
  return parts.length ? parts.join(" and ") : null;
}

function rearrangeRows(r) {
  const rows = [];
  if (r.selector) rows.push(["selector", r.selector]);
  const from = r.originalRect;
  const to = r.currentRect;
  if (from && to) {
    const moved = movement(from, to);
    if (moved) rows.push(["moved", moved]);
    if (Math.round(from.width) !== Math.round(to.width)
      || Math.round(from.height) !== Math.round(to.height)) {
      rows.push(["resized", `${size(from)} → ${size(to)}`]);
    }
    // A drag that lands back where it started is still a real signal — the
    // reviewer meant to say something. Saying so beats printing nothing.
    if (!moved && !rows.some(([k]) => k === "resized")) {
      rows.push(["note", "dragged, but ended at its original position and size"]);
    }
  }
  return rows;
}

function placementRows(p, a) {
  const rows = [];
  if (p.width && p.height) rows.push(["size", `${size(p)} at the drop point`]);
  if (Number.isFinite(a?.x) && Number.isFinite(a?.y)) {
    rows.push(["dropped at", `x ${Math.round(a.x)}, y ${Math.round(a.y)} in the viewport`]);
  }
  if (Number.isFinite(p.scrollY)) rows.push(["page scroll", px(p.scrollY)]);
  if (p.text) rows.push(["label", p.text]);
  return rows;
}

/**
 * What the reviewer said about a layout change — and, when they said nothing,
 * the fact that they didn't.
 *
 * ⚠️ `comment` on a placement or rearrange is NOT the reviewer talking. The
 * toolbar generates it ("Move Hero section (section) — from (12,340) 400×200 to
 * (36,240) 400×200") and rewrites it every time the drag is refined, so printing
 * it as `said` attributes coordinates to a person. Their words, if any, are in
 * `note`, which is asked for by the layout-intent prompt and which the toolbar
 * never writes.
 *
 * Saying "not explained" out loud matters more than it looks: the geometry is
 * viewport coordinates from someone else's browser, so a bare drag is a hint,
 * not an instruction. An agent that cannot tell "they explained this" from "they
 * didn't" will treat both as a spec and apply pixel values that mean nothing on
 * any other screen.
 */
function saidRows(a) {
  if (a.note) return [["said", a.note]];
  return [["said", "— not explained; the drag is the only signal, so treat it as intent, not pixels"]];
}

/**
 * What the reviewer said when they checked the agent's fix (toolbar/check.js,
 * POST /annotations/:id/verdict). A reopened note leads with it: the agent
 * closed this once, and what it said then is the context for trying again.
 */
export function verdictRows(a = {}) {
  const v = a.verdict, from = a.reopenedFrom, rows = [];
  const open = a.status === "pending" || a.status === "acknowledged";
  if (from && open) {
    const was = from.status === "dismissed" ? "set it aside" : "resolved it";
    rows.push(["reopened", `the reviewer checked it and it is not right yet. You ${was}${from.resolution ? `: ${from.resolution}` : ""}`]);
    if (v?.verdict === "not-yet" && v.message) rows.push(["still off", v.message]);
  } else if (v?.verdict === "looks-right" && a.status === "resolved") {
    rows.push(["verdict", "looks right: the reviewer checked the fix"]);
  } else if (v?.verdict === "agree" && a.status === "dismissed") {
    rows.push(["verdict", "the reviewer agreed with setting it aside"]);
  } else if (from) {
    rows.push(["reopened", `earlier, by the reviewer, after you ${from.status === "dismissed" ? "set it aside" : "resolved it"}`]);
  }
  return rows;
}

/**
 * The critique redesign's additions (show-and-tell.pen 9.4), as rows: the fix
 * the agent suggested, what the reviewer decided about a critique note, and on
 * a reviewer note, the critique note it came from or the measurement it carries.
 * Kept together so a new branch above picks all of them up with one call.
 */
function critiqueRows(a) {
  const rows = [];
  const s = a.suggestion;
  if (s && (s.kind === "text" || s.kind === "tweak")) {
    const from = s.from != null && s.from !== "" ? `"${s.from}" → ` : "";
    rows.push(["suggested", s.kind === "text" ? `text: ${from}"${s.to}"` : `tweak: ${s.property} ${s.from ? `${s.from} → ` : "→ "}${s.to}`]);
  }
  const d = a.decision;
  if (d && d.decision) {
    const by = d.reviewer ? ` · ${d.reviewer}` : "";
    if (d.decision === "fix") {
      const how = d.draft ? `the suggested change is in their ${d.draft === "text" ? "Edit text" : "Tweak"} drafts; it reaches you as an edit on Send`
        : d.noteId ? `in the reviewer's round as ${d.noteId}${d.comment ? ", in their words" : ""}` : "in the reviewer's round";
      rows.push(["decision", `fix it: ${how}${by}`]);
    } else if (d.decision === "not-an-issue") {
      rows.push(["decision", `not an issue${d.reason ? `: ${d.reason}` : " (no reason given)"}${by}`]);
    } else if (d.decision === "discuss") {
      rows.push(["decision", `discuss: see the thread${by}`]);
    }
  }
  if (a.fromCritique) rows.push(["from critique", `${a.fromCritique} (the reviewer chose Fix it on your critique note)`]);
  const m = a.measure;
  if (m && m.rule) {
    const at = Array.isArray(m.widths) && m.widths.length ? ` at ${m.widths.join(", ")}px` : "";
    rows.push(["measured", `${m.value ?? ""}${m.value ? " · " : ""}${m.rule}${at} (in the reviewer's browser)`]);
  }
  return rows;
}

/**
 * A tweak from Tweak mode (toolbar/tweak.js): one property on one element,
 * before and after, the scale token it moved onto and where the rule lives.
 *   tweak: a.cta padding 12px 20px → 16px 24px (--space-4 · --space-5), rule in styles.css .cta
 * A value off the project's scale says so: the reviewer chose it on purpose.
 */
// Stored rows predate validation (sessions.js cleanTweak), so read defensively.
const tokenWords = (token, on) => (token != null && token !== "" ? String(token).split(" · ").join(", ") : on ? "a value the page already uses" : "off scale");
function tweakNote(a) {
  const t = a.tweak;
  const rs = t.ruleSource && typeof t.ruleSource === "object" ? t.ruleSource : null;
  const rule = rs ? [rs.href, rs.selector].filter(Boolean).join(" ") + (rs.inherited ? " (inherited)" : "") : "";
  const scale = t.token ? ` (${t.token})` : t.onScale ? " (a value the page already uses)" : " (off scale)";
  const headline = `tweak: ${t.selector || a.elementPath || "element"} ${t.property || "?"} ${t.from ?? ""} → ${t.to ?? ""}${scale}${rule ? `, rule in ${rule}` : ""}`;
  const rows = [];
  if (a.elementPath) rows.push(["selector", a.elementPath]);
  rows.push(["property", String(t.property ?? "")]);
  rows.push(["from", String(t.from ?? "")]);
  rows.push(["to", String(t.to ?? "")]);
  rows.push(["scale", `now ${tokenWords(t.token, t.onScale)}, was ${tokenWords(t.fromToken, t.fromOnScale)}${t.scale === "tokens" ? " · scale: the project's custom properties" : t.scale ? " · scale: values the page already uses" : ""}`]);
  rows.push(["rule", rule || "no matching rule found in the page's stylesheets"]);
  return { headline, rows };
}

/**
 * @param {object} a  an annotation as returned by `annotationView`
 * @returns {{headline: string, rows: Array<[string, string]>, actionable: boolean}}
 *   `actionable` is false for a plain opinion — the caller can use it to decide
 *   whether the entry describes a change or merely asks for one.
 */
export function describeAnnotation(a = {}) {
  let headline;
  let rows = [];
  let actionable = true;

  if (a.kind === 'voice' && a.voice) {
    headline = `VOICE — ${a.comment || '(empty passage)'}`;
    actionable = false;
    const v = a.voice, target = v.target || {};
    rows.push(['target', target.kind === 'general' ? 'General page feedback' : target.label || target.kind || 'unspecified']);
    if (target.selector || a.elementPath) rows.push(['selector', target.selector || a.elementPath]);
    if (target.context && target.kind !== 'general') rows.push(['on page', targetDetail({ ...target, selector: undefined })]);
    if (Number.isFinite(v.startMs) && Number.isFinite(v.endMs)) rows.push(['speech', `${(v.startMs / 1000).toFixed(2)}–${(v.endMs / 1000).toFixed(2)}s`]);
    if (v.region) rows.push(['region', `${size(v.region)} at x ${Math.round(v.region.x)}, y ${Math.round(v.region.y)} in the captured viewport`]);
    if (v.image) rows.push(['image', 'Region screenshot included in the JSON annotation at voice.image']);
    if (v.needsReview) rows.push(['alignment', 'Speech crossed an anchor boundary; confirm the intended target before acting']);
    else if (v.timingApproximate) rows.push(['alignment', 'Passage was split after transcription; speech timing is approximate']);
    if (v.sessionId) rows.push(['voice session', v.sessionId]);
    if (v.passageId) rows.push(['passage', v.passageId]);
  } else if (a.kind === "edit" && a.edit) {
    // A diff, not an opinion: FROM/TO is the difference between "go read the
    // page and work out what they meant" and a change that applies directly.
    headline = "EDIT — replace this text";
    if (a.elementPath) rows.push(["selector", a.elementPath]);
    rows.push(["FROM", a.edit.from ?? ""]);
    rows.push(["TO", a.edit.to ?? ""]);
  } else if (a.kind === "tweak" && a.tweak) {
    ({ headline, rows } = tweakNote(a));
  } else if (a.kind === "copy" && a.copy) {
    // From copy edit mode: the exact span is in the note, so `apply` writes it
    // without searching. FROM is the text as the view showed it.
    headline = "COPY — replace this text at its source";
    const u = a.copy.unit || {};
    rows.push(["at", `${u.file || "?"}:${u.line || "?"}${u.path ? ` ${u.path}` : ""}`]);
    rows.push(["kind", `${u.kind || "?"}${u.attr ? ` [${u.attr}]` : ""}${a.copy.batch ? ` · batch ${a.copy.batch}` : ""}`]);
    rows.push(["FROM", a.copy.from ?? ""]);
    rows.push(["TO", a.copy.to ?? ""]);
  } else if (a.kind === "placement" && a.placement) {
    const what = a.placement.componentType || "component";
    headline = `ADD — place a ${what} here`;
    if (a.elementPath) rows.push(["near", a.elementPath]);
    rows = rows.concat(placementRows(a.placement, a));
    rows = rows.concat(saidRows(a));
  } else if (a.kind === "critique" || a.author === "agent") {
    // Read back, this must not look like something asking to be done — it is
    // the agent's own opinion waiting on the OWNER. `actionable: false` says so,
    // and the arrow direction is the fastest way to see it in a mixed list.
    headline = `CRITIQUE → ${a.comment || "(no comment)"}`;
    actionable = false;
    if (a.severity) rows.push(["severity", a.severity]);
    if (a.intent) rows.push(["intent", a.intent]);
    // The selector is stored in `element_path` and echoed in the payload; either
    // way it is the only positioning an agent could give, so say when it is
    // missing rather than printing an empty row that reads like a bug.
    rows.push(["anchor", a.elementPath || a.selector || "page-level (no marker)"]);
    if (a.element) rows.push(["element", a.element]);
    if (a.replies?.at(-1)?.from === "reviewer") {
      rows.push(["waiting", "the reviewer replied to your note. Answer it, or resolve it if settled"]);
    }
  } else if (a.kind === "rearrange" && a.rearrange) {
    const label = a.rearrange.label || a.rearrange.tagName || "element";
    headline = `MOVE — ${label}`;
    rows = rows.concat(rearrangeRows(a.rearrange));
    rows = rows.concat(saidRows(a));
  } else {
    // A measured finding the reviewer chose Fix it on: a fact with its number,
    // never the agent's opinion, so it says where it came from.
    headline = a.source === "measured" ? `MEASURED — ${a.comment || "(no comment)"}` : a.comment || "(no comment)";
    actionable = false;
    if (a.elementPath) rows.push(["selector", a.elementPath]);
    if (a.element) rows.push(["element", a.element]);
    // A kind we don't render specially is worth naming — it is the signal that
    // this file needs a new branch, not that the annotation is empty.
    if (a.kind && a.kind !== "feedback") rows.push(["kind", a.kind]);
    if (a.intent) rows.push(["intent", a.intent]);
    if (a.severity) rows.push(["severity", a.severity]);
  }

  rows = rows.concat(verdictRows(a));
  rows = rows.concat(critiqueRows(a));

  // Fenced at the single exit rather than at each site above: the branches keep
  // growing, and a new one that forgets to fence is a silent injection hole.
  // Generated values (movement phrasing, sizes) pass through unchanged — they
  // contain no newlines — so this costs nothing to apply uniformly.
  if (a.viewport?.width && a.viewport?.height) rows.push(["viewport", `${a.viewport.name || "captured"} · ${a.viewport.width}×${a.viewport.height}`]);
  // A page with its own timeline: when the note was left, and what was playing then (playhead.js).
  rows = rows.concat(playheadRows(a.playhead));
  return {
    headline: fenceValue(headline),
    rows: rows.map(([k, v]) => [k, fenceValue(v)]),
    actionable,
  };
}
