import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { INK, FONT } from './brand.js';
const here = (p) => fileURLToPath(new URL(p, import.meta.url));
// Small, checked integration seams in the PINNED dependency. Never mutate node_modules.
// Fail loudly on upgrade rather than quietly dropping viewport or inbox sync.
function once(source, needle, replacement) {
  if(source.split(needle).length!==2)throw new Error('Agentation integration seam changed: '+needle.slice(0,90));
  return source.replace(needle,replacement);
}
await build({entryPoints:[here('entry.jsx')],bundle:true,minify:true,format:'iife',target:'es2020',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},outfile:here('../dist/show-and-tell.js'),plugins:[{
  name:'show-and-tell-seams',setup(build){build.onLoad({filter:/agentation\/dist\/index\.mjs$/},async args=>{
    let source=await readFile(args.path,'utf8');
    // The brand on the pinned component (toolbar/brand.js): its near-black
    // surfaces become ink and its system font stacks the brand stack. Counted,
    // so an upgrade that renames either fails here instead of shipping a bar
    // in two blacks.
    const recolour=(from,to,min)=>{const n=source.split(from).length-1;if(n<min)throw new Error('Agentation brand seam changed: '+from+' ('+n+')');source=source.replaceAll(from,to);};
    recolour('#1a1a1a',INK,15);recolour('#1c1c1c',INK,1);
    // The component's CSS sits in single-quoted strings: FONT has no single quote.
    if(FONT.includes("'"))throw new Error('brand FONT must not contain a single quote');
    recolour('font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif','font-family: '+FONT,3);
    recolour('font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif','font-family: '+FONT,3);
    source=once(source,'async function syncAnnotation(endpoint, sessionId, annotation) {','async function syncAnnotation(endpoint, sessionId, annotation) {\n annotation = { ...annotation, viewport: annotation.viewport || window.__AGENTATION_KIT_VIEWPORT__?.(), reviewer: annotation.reviewer || window.__AGENTATION_KIT_REVIEWER__?.() || undefined };');
    // Several reviewers (reviewer.js): a note the reviewer just added syncs at
    // once, and the name prompt opens beside it (syncNew). It used to wait for
    // the answer, so a tab closed with the prompt open lost the note. Only this
    // interactive path asks: the other syncAnnotation callers re-sync stored
    // notes and layout drags on load, and asking there would prompt on page
    // load; they sign with the name if known.
    source=once(source,'syncAnnotation(endpoint, currentSessionId, newAnnotation).then(','(window.__AGENTATION_KIT_SYNC_NEW__ || ((send) => send()))(() => syncAnnotation(endpoint, currentSessionId, newAnnotation), newAnnotation).then(');
    // Every DELETE says who is asking, so the server can refuse to delete
    // another reviewer's note (DELETE /annotations/:id?reviewer=<name>).
    source=once(source,'  const response = await fetch(`${endpoint}/annotations/${annotationId}`, {\n    method: "DELETE"',
      '  const kitReviewer = window.__AGENTATION_KIT_REVIEWER__?.();\n  const response = await fetch(`${endpoint}/annotations/${annotationId}${kitReviewer ? `?reviewer=${encodeURIComponent(kitReviewer)}` : ""}`, {\n    method: "DELETE"');
    // A marker's own delete on someone else's note: theirs to withdraw.
    source=once(source,'      const deletedAnnotation = annotations[deletedIndex];',
      '      const deletedAnnotation = annotations[deletedIndex];\n      if (deletedAnnotation && window.__AGENTATION_KIT_OWNS__ && !window.__AGENTATION_KIT_OWNS__(deletedAnnotation)) { window.__AGENTATION_KIT_NOT_YOURS__?.(deletedAnnotation); return; }');
    source=once(source,'(a) => !exitingMarkers.has(a.id) && a.kind !== "placement" && a.kind !== "rearrange"','(a) => !exitingMarkers.has(a.id) && a.kind !== "placement" && a.kind !== "rearrange" && a.kind !== "edit" && (!window.__AGENTATION_KIT_VIEWPORT_MATCH__ || window.__AGENTATION_KIT_VIEWPORT_MATCH__(a))');
    for (const prefix of ['DESIGN_PREFIX','REARRANGE_PREFIX','WIREFRAME_PREFIX']) {
      const key='${'+prefix+'}${pathname}';
      if(source.split(key).length !== 4)throw new Error('Layout storage seam changed: '+prefix);
      source=source.replaceAll(key,key+'@${window.__AGENTATION_KIT_VIEWPORT__?.().name || "desktop"}');
    }
    source=once(source,'  const [isActive, setIsActive] = useState6(false);',`  const [isActive, setIsActive] = useState6(false);
  const [isTextEditMode, setIsTextEditMode] = useState6(false);
  const isFeedbackActive = isActive && !isTextEditMode;`);
    // Suspend the native selection effects, including hover, click and area
    // drag, while leaving the toolbar expanded and text selection untouched.
    const selectionStart = '  useEffect6(() => {\n    if (!isActive) return;\n    const textElementsSelector = [';
    const selectionEnd = '  const fireWebhook = useCallback5(';
    const start = source.indexOf(selectionStart), end = source.indexOf(selectionEnd, start);
    if (start < 0 || end < start) throw new Error('Agentation selection seam changed');
    let selection = source.slice(start,end).replace(/\bisActive\b/g,'isFeedbackActive');
    // A voice review owns Point/Interact while recording. Interact must pass
    // host actions through without the native annotation picker intercepting.
    for (const handler of ['handleMouseMove','handleMouseDown','handleClick','handleMouseUp']) {
      const needle = `const ${handler} = (e) => {`;
      selection = selection.replaceAll(needle, needle + '\n      if (window.__AGENTATION_KIT_VOICE_RECORDING__) return;');
    }
    if (!selection.includes('__AGENTATION_KIT_VOICE_RECORDING__')) throw new Error('Voice selection seam changed');
    source = source.slice(0,start) + selection + source.slice(end);
    source=once(source,'      isActive && /* @__PURE__ */ jsxs13(', '      isFeedbackActive && /* @__PURE__ */ jsxs13(');
    source=once(source,'  const prevDraggingRef = useRef6(false);',`
  useEffect6(() => {
    const edit = () => {
      const active = !!window.__AGENTATION_KIT_EDIT__?.active;
      setIsTextEditMode(active);
      if (active) {
        setHoverInfo(null); setPendingMultiSelectElements([]);
        setIsDragging(false); mouseDownPosRef.current = null; dragStartRef.current = null;
        if (highlightsContainerRef.current) highlightsContainerRef.current.innerHTML = '';
        setIsDrawMode(false); setIsDesignMode(false); setActiveDesignComponent(null);
      }
    };
    const voice = e => { if (e.detail?.active && e.detail?.kind === 'session') { setHoverInfo(null); setPendingAnnotation(null); setPendingMultiSelectElements([]); setIsDragging(false); mouseDownPosRef.current = null; dragStartRef.current = null; } };
    document.addEventListener('agentation-kit:voice-capture', voice);
    document.addEventListener('agentation-kit:edit-change', edit); edit();
    return () => { document.removeEventListener('agentation-kit:edit-change', edit); document.removeEventListener('agentation-kit:voice-capture', voice); };
  }, []);
  useEffect6(() => {
    if (!isActive) window.__AGENTATION_KIT_EDIT__?.toggle(false);
  }, [isActive]);
  useEffect6(() => {
    const move = e => setToolbarPosition(e.detail);
    const refresh = async () => {
      if (!endpoint || !currentSessionId) return;
      try { const session = await getSession(endpoint, currentSessionId);
        setAnnotations(session.annotations.filter(a => isRenderableAnnotation(a) && a.status !== 'dismissed' && a.status !== 'resolved'));
      } catch {}
    };
    document.addEventListener('agentation-kit:toolbar-position', move);
    document.addEventListener('agentation-kit:annotations-refresh', refresh);
    return () => { document.removeEventListener('agentation-kit:toolbar-position', move); document.removeEventListener('agentation-kit:annotations-refresh', refresh); };
  }, [endpoint, currentSessionId]);
  const prevDraggingRef = useRef6(false);`);
    // Tweak (tweak.js) suspends the comment picker exactly as Edit text does:
    // the same isTextEditMode flag, set by either mode, and both turn off
    // when the toolbar collapses.
    source=once(source,'      const active = !!window.__AGENTATION_KIT_EDIT__?.active;','      const active = !!window.__AGENTATION_KIT_EDIT__?.active || !!window.__AGENTATION_KIT_TWEAK__?.active;');
    source=once(source,"    document.addEventListener('agentation-kit:edit-change', edit); edit();","    document.addEventListener('agentation-kit:edit-change', edit); document.addEventListener('agentation-kit:tweak-change', edit); edit();");
    source=once(source,"document.removeEventListener('agentation-kit:edit-change', edit);","document.removeEventListener('agentation-kit:edit-change', edit); document.removeEventListener('agentation-kit:tweak-change', edit);");
    source=once(source,'    if (!isActive) window.__AGENTATION_KIT_EDIT__?.toggle(false);','    if (!isActive) { window.__AGENTATION_KIT_EDIT__?.toggle(false); window.__AGENTATION_KIT_TWEAK__?.toggle(false); }');
    // A tweak is an inbox note with before and after, like a text edit: no marker.
    source=once(source,'a.kind !== "edit" && (!window.__AGENTATION_KIT_VIEWPORT_MATCH__','a.kind !== "edit" && a.kind !== "tweak" && (!window.__AGENTATION_KIT_VIEWPORT_MATCH__');
    // Client-side routes (see entry.jsx). The session effect already lists
    // `pathname` as a dependency, but nothing re-renders on pushState, and a
    // boolean ref made it run exactly once. A route tick forces the render; a
    // per-path ref lets the effect run once PER PAGE, and clearing the current
    // id first stops a note left mid-switch landing on the previous page.
    source=once(source,'    if (!endpoint || !mounted || sessionInitializedRef.current) return;\n    sessionInitializedRef.current = true;',
      '    if (!endpoint || !mounted || sessionInitializedRef.current === pathname) return;\n    if (sessionInitializedRef.current) setCurrentSessionId(null);\n    sessionInitializedRef.current = pathname;');
    source=once(source,'  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";',
      '  const [, setKitRoute] = useState6(0);\n  useEffect6(() => {\n    const onRoute = () => setKitRoute((n) => n + 1);\n    document.addEventListener("agentation-kit:route", onRoute);\n    return () => document.removeEventListener("agentation-kit:route", onRoute);\n  }, []);\n  const pathname = typeof window !== "undefined" ? (window.__AGENTATION_KIT_PAGE_KEY__ ? window.__AGENTATION_KIT_PAGE_KEY__() : window.location.pathname) : "/";');
    // A session request carries the page key when the host routes by query (page-key.js), so the
    // server can tell two stories on one /iframe.html apart.
    source=once(source,'    body: JSON.stringify({ url })\n  });\n  if (!response.ok) {\n    throw new Error(`Failed to create session:',
      '    body: JSON.stringify({ url, ...(window.__AGENTATION_KIT_SESSION_KEY_OF__?.(url) ? { pageKey: window.__AGENTATION_KIT_SESSION_KEY_OF__(url) } : {}) })\n  });\n  if (!response.ok) {\n    throw new Error(`Failed to create session:');
    // Clear all deleted EVERY note on the page, everyone's, one click (or the
    // bare X key) away. With our layer it clears only the notes this reviewer
    // owns (reviewer.js ownsNote), after a second press within a few seconds,
    // and leaves other reviewers' notes and the shared layout drags alone (a
    // drag is rejected from the inbox). Returning false tells the X path,
    // which wiped layout drags after the call, that it must not.
    source=once(source,'    if (count === 0 && drawStrokes.length === 0 && !hasDesign) return;\n    onAnnotationsClear?.(annotations);',
      `    if (count === 0 && drawStrokes.length === 0 && !hasDesign) return;
    if (window.__AGENTATION_KIT_OWNS__ && window.__AGENTATION_KIT_CONFIRM_CLEAR__) {
      const kitMine = annotations.filter((a) => window.__AGENTATION_KIT_OWNS__(a));
      if (!window.__AGENTATION_KIT_CONFIRM_CLEAR__(kitMine.length, count - kitMine.length)) return false;
      onAnnotationsClear?.(kitMine);
      fireWebhook("annotations.clear", { annotations: kitMine });
      // A refusal (403 not mine, 409 already closed) is not an error to the
      // reviewer: re-read the page so a note the server kept comes back.
      if (endpoint) Promise.allSettled(kitMine.map((a) => deleteAnnotation(endpoint, a.id))).then((r) => { if (r.some((x) => x.status === "rejected")) document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh")); });
      const kitGone = new Set(kitMine.map((a) => a.id));
      setDrawStrokes([]);
      const kitCanvas = drawCanvasRef.current;
      if (kitCanvas) kitCanvas.getContext("2d")?.clearRect(0, 0, kitCanvas.width, kitCanvas.height);
      setAnimatedMarkers((prev) => new Set([...prev].filter((id) => !kitGone.has(id))));
      setAnnotations((prev) => prev.filter((a) => !kitGone.has(a.id)));
      setCleared(true);
      originalSetTimeout(() => setCleared(false), 1500);
      return false;
    }
    onAnnotationsClear?.(annotations);`);
    source=once(source,'          clearAll();\n          if (designPlacements.length > 0) setDesignPlacements([]);',
      '          if (clearAll() === false) return;\n          if (designPlacements.length > 0) setDesignPlacements([]);');
    // The position clamp assumes the stock 337px bar, which strands a narrower
    // one short of the screen edge. Ask our layer for the measured width, and
    // for where the visible shell starts inside it: collapsed, the shell is a
    // 44px button at the wrapper's right end, and clamping the wrapper's left
    // edge left that button past a narrowed screen's right edge.
    for (const [needle,swap,label] of [['const wrapperWidth = 337;','const wrapperWidth = window.__AGENTATION_KIT_TOOLBAR_WIDTH__?.() ?? 337;','width'],['const contentOffset = wrapperWidth - contentWidth;','const contentOffset = window.__AGENTATION_KIT_TOOLBAR_WIDTH__ ? (window.__AGENTATION_KIT_TOOLBAR_OFFSET__?.() ?? 0) : wrapperWidth - contentWidth;','offset']]) {
      if(source.split(needle).length!==3)throw new Error('Toolbar clamp seam changed: '+label);
      source=source.replaceAll(needle,swap);
    }
    // One marker system (ui.js): a reviewer marker sits by the live element
    // its note is about, so it follows the page when a docked panel reflows
    // it. The stock x is a percentage of the window from when the note was
    // made, which strands it 160px from its paragraph once a side sheet opens.
    // data-kit-note lets the reflow pass find each marker node.
    source=once(source,'      "data-annotation-marker": true,\n      style: {\n        left: `${annotation.x}%`,\n        top: annotation.y,\n        backgroundColor',
      '      "data-annotation-marker": true,\n      "data-kit-note": annotation.id,\n      style: {\n        ...(window.__AGENTATION_KIT_MARKER_AT__?.(annotation) || { left: `${annotation.x}%`, top: annotation.y }),\n        backgroundColor');
    source=once(source,'      "data-annotation-marker": true,\n      style: {\n        left: `${annotation.x}%`,\n        top: annotation.y\n      },',
      '      "data-annotation-marker": true,\n      style: window.__AGENTATION_KIT_MARKER_AT__?.(annotation) || {\n        left: `${annotation.x}%`,\n        top: annotation.y\n      },');
    // Hide markers (H, More), a collapsed bar and layout mode hide the agent's
    // markers too (critique.js): one switch for every marker on the page.
    source=once(source,'  const shouldShowMarkers = isActive && showMarkers && !isDesignMode;',
      '  const shouldShowMarkers = isActive && showMarkers && !isDesignMode;\n  useEffect6(() => {\n    window.__AGENTATION_KIT_MARKERS_SHOWN__ = shouldShowMarkers;\n    document.dispatchEvent(new CustomEvent("agentation-kit:markers", { detail: { shown: shouldShowMarkers } }));\n  }, [shouldShowMarkers]);');
    // The collapsed toggle: a plain comment bubble (the Comment mode's icon),
    // not a list with a sparkle.
    source=once(source,'jsx14(IconListSparkle, { size: 24 }),',
      'jsx14("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: jsx14("path", { d: "M4 5h16v11H9.5L5 19.5V16H4z" }) }),');
    // Settings: no marker colour picker. There is one accent (chrome.css.js
    // pins it whatever an old setting says), so a 7-colour picker only
    // offered colours the toolbar would then ignore.
    {
      const label = 'className: `${styles_module_default9.settingsLabel} ${styles_module_default9.settingsLabelMarker}`';
      const divider = '/* @__PURE__ */ jsx13("div", { className: styles_module_default9.divider }),';
      const tail = 'color.id\n                )) })\n              ] }),';
      const at = source.indexOf(label);
      if (at < 0 || source.indexOf(label, at + 1) >= 0) throw new Error('Agentation integration seam changed: marker colour label');
      const from = source.lastIndexOf(divider, at), to = source.indexOf(tail, at);
      if (from < 0 || to < 0 || at - from > 600 || to - at > 1600) throw new Error('Agentation integration seam changed: marker colour section');
      source = source.slice(0, from) + source.slice(to + tail.length);
    }
    // No decorative dot beside Manage MCP & webhooks; the status is a word on its page.
    source=once(source,'                      endpoint && connectionStatus !== "disconnected" && /* @__PURE__ */ jsx13(\n                        "span",\n                        {\n                          className: `${styles_module_default9.mcpNavIndicator} ${styles_module_default9[connectionStatus]}`\n                        }\n                      ),\n','');
    source=once(source,'                  endpoint && /* @__PURE__ */ jsx13(\n                    "div",\n                    {\n                      className: `${styles_module_default9.mcpStatusDot} ${styles_module_default9[connectionStatus]}`,\n                      title: connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting..." : "Disconnected"\n                    }\n                  )',
      '                  endpoint && /* @__PURE__ */ jsx13(\n                    "span",\n                    {\n                      style: { fontSize: 12, opacity: 0.6 },\n                      children: connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting…" : "Not connected"\n                    }\n                  )');
    // Sentence case for the upstream Settings and Layout palette. Each string
    // must occur exactly as often as listed, or the build stops.
    for (const [from, to, times] of [
      ['Output Detail', 'Output detail', 1], ['React Components', 'React components', 1], ['Hide Until Restart', 'Hide until restart', 1],
      ['Manage MCP & Webhooks', 'MCP and webhooks', 2], ['MCP Connection', 'MCP connection', 1], ['Auto-Send', 'Auto-send', 1],
      ['Layout Mode', 'Layout mode', 1], ['Wireframe New Page', 'Wireframe a new page', 1], ['Wireframe Mode', 'Wireframe mode', 1],
      ['Toggle Opacity', 'Toggle opacity', 1], ['Start Over', 'Start over', 1], ['Send Annotations', 'Send annotations', 1],
      ['Code Block', 'Code block', 1], ['File Upload', 'File upload', 1], ['Date Picker', 'Date picker', 1], ['Product Card', 'Product card', 1],
      ['Main Content', 'Main content', 2],
    ]) {
      const quoted = JSON.stringify(from);
      if (source.split(quoted).length !== times + 1) throw new Error('Agentation integration seam changed: label ' + from);
      source = source.replaceAll(quoted, JSON.stringify(to));
    }
    // Typing in our own fields (UX review 2, N1). The component's single-key
    // shortcuts (P, L, H, C, X, S, and Backspace in layout) skip a focused
    // input by checking e.target, which a shadow root retargets to its host
    // div: typing "help" in the inbox Answer field opened Layout mode, hid the
    // markers and, at a second x, cleared the reviewer's notes. The first node
    // of the composed path is the real field. SELECT counts too.
    {
      const typing = (t) => `const kitTyping = e.composedPath?.()[0] || ${t};\n      `;
      const is = 'kitTyping.matches?.("input,textarea,select") || !!kitTyping.isContentEditable';
      for (const [needle, swap, n, label] of [
        ['const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;', typing('target') + 'const isTyping = ' + is + ';', 2, 'toolbar and placement keys'],
        ['if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable) return;', typing('t') + 'if (' + is + ') return;', 1, 'rearrange keys'],
      ]) {
        if (source.split(needle).length !== n + 1) throw new Error('Agentation integration seam changed: typing check, ' + label);
        source = source.replaceAll(needle, swap);
      }
    }
    return {contents:source,loader:'js'};
  });}
}]});
