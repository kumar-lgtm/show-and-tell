// Post-build checks. esbuild tree-shakes anything unreachable, so a layer
// accidentally unwired in entry.jsx vanishes silently and the bundle still
// "works" — it just stops doing one of the things it exists to do.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../dist/show-and-tell.js', import.meta.url));
const src = readFileSync(file, 'utf8');
const fail = (m) => { console.error('✗ ' + m); process.exit(1); };

console.log(`→ dist/show-and-tell.js  ${src.length} bytes`);
// Upstream's own dist is ~549 KB; ours adds React and the review layers. Much
// smaller means the component tree-shook away and the toolbar renders nothing.
if (src.length < 300000) fail('suspiciously small — the component probably did not get bundled');
try { new Function(src); } catch (e) { fail('does not parse: ' + e.message); }
for (const needle of ['__AGENTATION_KIT_AGENTATION__', '/sessions', 'sk-measured-dismissed', 'agentation-kit:critique-count', '/decision', 'show-and-tell-measure', 'sk-layoutasked_', 'sk-replyseen_', 'feedback-toolbar-reviewer', '__AGENTATION_KIT_SYNC_NEW__', '__AGENTATION_KIT_OWNS__', '?reviewer=', '__AGENTATION_KIT_HEALTH__', '__AGENTATION_KIT_VOICE__', '/voice/transcribe', 'Dictate note', '.reviewer||window.__AGENTATION_KIT_REVIEWER__', '__AGENTATION_KIT_TWEAK__', 'agentation-kit:tweak-change']) {
  if (!src.includes(needle)) fail('missing ' + needle);
}
// One marker system (ui.js markerLayer): the reviewer's markers ask our layer
// where to sit, carry their note id, and Hide markers reaches the agent's.
for (const needle of ['__AGENTATION_KIT_MARKER_AT__', 'data-kit-note', 'agentation-kit:markers', '__AGENTATION_KIT_MARKERS_SHOWN__', 'agentationKitChrome', '--agentation-color-blue: ${']) {
  if (!src.includes(needle)) fail('missing ' + needle);
}
// Upstream Settings and Layout palette are sentence case, with no marker colour picker.
for (const gone of ['"Marker Color"', '"Output Detail"', '"Hide Until Restart"', '"Layout Mode"', '"Manage MCP & Webhooks"', '"Wireframe New Page"']) {
  if (src.includes(gone)) fail('still has ' + gone);
}
// Typing in a field inside a shadow root is typing (build.mjs, N1): the
// component's three key handlers read the composed path, not e.target.
if (src.split('"input,textarea,select"').length - 1 !== 3) fail('typing check seam: expected 3 composed-path checks');
if (src.includes('tagName==="TEXTAREA"||') && /\.tagName==="INPUT"\|\|\w+\.tagName==="TEXTAREA"\|\|\w+\.isContentEditable/.test(src)) fail('a key handler still decides typing from e.target');
// The toolbar excludes its own chrome from annotation by this attribute; a
// rename upstream would make our panels annotatable as if they were the page.
if (!src.includes('data-feedback-toolbar')) fail('missing data-feedback-toolbar exclusion');
console.log('→ parses, and carries the config global, session client and review layers');
