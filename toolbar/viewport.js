import { createHost, markChrome } from './ui.js';
export const devices = { mobile: [390, 844], tablet: [820, 1180], desktop: [1440, 900] };
export function viewport() {
  const width = window.innerWidth, height = window.innerHeight;
  return { width, height, name: width < 768 ? 'mobile' : width < 1200 ? 'tablet' : 'desktop' };
}
export function belongsToViewport(annotation) {
  const v = annotation.viewport;
  return !v || (v.name || (v.width < 768 ? 'mobile' : v.width < 1200 ? 'tablet' : 'desktop')) === viewport().name;
}
export function simulatedChild() {
  try { return window.parent !== window && window.parent.__AGENTATION_KIT_SIMULATOR__?.frame?.contentWindow === window; } catch { return false; }
}
export function createViewportSimulator() {
  let ui = null, frame = null, current = 'desktop', pageStyle = null, shell = null;
  let inertNodes = [];
  function close() {
    if (!ui) return;
    frame?.contentWindow?.__AGENTATION_KIT_EDIT__?.toggle(false);
    ui.host.remove(); ui = null; frame = null;
    pageStyle?.remove();
    for (const node of inertNodes) node.inert = false; inertNodes = [];
    document.documentElement.classList.remove('sk-simulating');
    window.__AGENTATION_KIT_SIMULATOR__ = null;
    document.dispatchEvent(new CustomEvent('agentation-kit:annotations-refresh'));
    window.__AGENTATION_KIT_REVIEW__?.focusViewport();
  }
  function choose(name, target = null) {
    if (!devices[name]) return;
    if (simulatedChild()) return window.parent.__AGENTATION_KIT_SIMULATOR__.choose(name, target);
    const reload = !!ui;
    current = name;
    if (!ui) {
      window.__AGENTATION_KIT_EDIT__?.toggle(false);
      ui = createHost(`
        .stage {position:fixed;inset:0;z-index:2147483646;background:#EFE7D8;display:flex;flex-direction:column;align-items:center;font:500 13px var(--sk-font);color:#1D1A2F}
        .tools {height:56px;flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 8px;max-width:100%;box-sizing:border-box;flex-wrap:wrap;justify-content:center}
        button {font:inherit;min-height:36px;padding:0 12px;background:transparent;color:inherit;border:0;border-radius:10px;cursor:pointer}
        button[aria-pressed=true] {background:white;box-shadow:0 1px 4px #0002}
        button:focus-visible {outline:2px solid #1D1A2F;outline-offset:2px}
        .canvas {overflow:auto;width:100%;flex:1;display:grid;justify-items:center;align-items:start;padding:12px;box-sizing:border-box}
        iframe {border:0;background:white;flex:none;box-shadow:0 3px 28px #0002;border-radius:8px;max-width:none}
        .size {font-variant-numeric:tabular-nums;color:#5E516C;padding:0 6px}
      `);
      const content = document.createElement('div'); content.innerHTML = '<div class="stage"><div class="tools" role="toolbar" aria-label="Viewport simulator"><button data-device="mobile">Mobile</button><button data-device="tablet">Tablet</button><button data-device="desktop">Desktop</button><span class="size" id="size"></span><button id="exit" aria-label="Exit viewport simulator">Exit ✕</button></div><div class="canvas" id="canvas"></div></div>'; ui.root.append(content);
      frame = markChrome(document.createElement('iframe'));
      frame.title = 'Page at simulated viewport';
      window.__AGENTATION_KIT_SIMULATOR__ = { frame, choose, close, target };
      // Same origin + explicit parent ownership allow this frame's toolbar to mount.
      frame.src = location.href;
      shell = document.createElement('div');
      shell.style.position = 'relative';
      shell.append(frame);ui.el('canvas').append(shell);
      frame.style.transformOrigin = 'top left';
      for (const node of document.body.children) if (node !== ui.host && !node.inert) { node.inert = true; inertNodes.push(node); }
      ui.el('exit').onclick = close;
      ui.root.querySelectorAll('[data-device]').forEach(b => b.onclick = () => choose(b.dataset.device));
      document.documentElement.classList.add('sk-simulating');
      pageStyle = document.createElement('style'); pageStyle.textContent = 'html.sk-simulating{overflow:hidden!important}';
      document.head.append(pageStyle);
      ui.el('exit').focus();
    }
    window.__AGENTATION_KIT_SIMULATOR__.target = target;
    const [w,h] = devices[name];
    frame.style.width = w + 'px'; frame.style.height = h + 'px';
    if (reload) frame.src = location.href;
    fit();
    ui.root.querySelectorAll('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.device === name)));
    frame.addEventListener('load', () => frame.contentWindow?.dispatchEvent(new Event('resize')), { once: true });
  }
  function fit() {
    if (!frame) return;
    const [w,h] = devices[current];
    const scale = Math.min(1, (innerWidth-32)/w, (innerHeight-88)/h);
    frame.style.transform = `scale(${scale})`;
    shell.style.width = w*scale+'px'; shell.style.height = h*scale+'px';
    ui.el('size').textContent = `${w} × ${h}${scale<1 ? ' · '+Math.round(scale*100)+'%' : ''}`;
  }
  window.addEventListener('resize', fit);
  return { choose, close, get current() { return current; } };
}
