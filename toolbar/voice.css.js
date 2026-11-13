import { Z } from './ui.js';
// NO BACKTICKS in this stylesheet: it is a JS template literal (see ui.js).
export const voiceCSS = `
[hidden]{display:none!important}
button,select{font:inherit;color:var(--sk-text);background:var(--sk-raised);border:1px solid var(--sk-hairline);border-radius:6px;min-height:44px;padding:8px 12px;cursor:pointer}
button:hover{background:var(--sk-hover)}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
button.primary{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:8px 14px}
button.quiet{background:transparent;border-color:transparent;color:var(--sk-text-2)}
button.quiet:hover{background:var(--sk-hover);color:var(--sk-text)}
.icon{width:44px;min-width:44px;padding:10px;display:inline-grid;place-items:center}
.icon svg{width:18px;height:18px}
p{margin:0 0 12px}
.muted{color:var(--sk-text-2)}
.hint{font-size:12px;line-height:1.45;color:var(--sk-text-2)}
.status{white-space:pre-wrap;margin:0 0 12px;line-height:1.5;font-size:12.5px;color:var(--sk-text)}

/* Panel: setup, transcription, dictation result and the transcript editor. */
.panel{right:16px;bottom:84px;width:460px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 112px);display:flex;flex-direction:column;font-size:13px}
.hd{flex:none;gap:8px;min-height:0;font-size:13px;padding:11px 12px}
/* One panel header across the bar's panels (UX review 4, N13): a 13px/600
   title and a 28px drawn X, 44px on touch, as in critique.js. The title is
   focusable so Stop can hand focus to it (F-Return). */
.hd strong{flex:1;font-size:13px;font-weight:600;line-height:1.4;outline:none}
.hd strong:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px;border-radius:2px}
.hd .icon{margin:-4px -4px -4px auto;width:28px;min-width:28px;height:28px;min-height:28px;padding:0;border-radius:6px;color:var(--sk-text-3);background:transparent;border-color:transparent}
.hd .icon:hover{color:var(--sk-text);background:var(--sk-hover)}
.hd .icon svg{width:16px;height:16px}
.body{overflow:auto;min-height:0;padding:14px}
.foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;border-top:1px solid var(--sk-hairline);padding:10px 12px;flex:none}
.foot .primary{margin-left:auto}
.meta{display:flex;flex-wrap:wrap;gap:4px 6px;font-size:12px;color:var(--sk-text-2);margin:0 0 12px}
.meta span+span::before{content:"·";margin-right:6px;color:var(--sk-text-3)}

/* Setup: three steps, each with a drawn icon. */
.lead{font-size:14px;font-weight:600;margin:0 0 4px}
.steps{list-style:none;margin:14px 0 16px;padding:0;display:grid;gap:10px}
.steps li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start}
.steps svg{width:18px;height:18px;margin:2px 0 0 4px;color:var(--sk-accent)}
.steps b{display:block;font-weight:600;font-size:13px}
.steps span{color:var(--sk-text-2);font-size:12.5px;line-height:1.45}
.disclosure{background:var(--sk-raised);border-radius:6px;padding:10px 12px;margin:0 0 12px}
.disclosure p{margin:0 0 4px;font-size:12.5px}
.disclosure p:last-child{margin:0}

/* Target chip: the one place a target is named, everywhere it appears. */
.chip{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%;border-radius:5px;padding:3px 8px;font-size:12px;line-height:1.4;color:var(--sk-text);background:color-mix(in srgb,var(--sk-accent) 16%,transparent);border:1px solid color-mix(in srgb,var(--sk-accent) 40%,transparent)}
.chip.general{background:var(--sk-raised);border-color:var(--sk-hairline)}
.chip svg{width:13px;height:13px;flex:none;color:var(--sk-text-2)}
.chip span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* One transcript, read as sentences, with markers where the target changed. */
details.whole{background:var(--sk-raised);border-radius:6px;margin:0 0 14px}
details.whole summary{cursor:pointer;padding:9px 12px;font-size:12.5px;font-weight:600;list-style:none;display:flex;align-items:center;gap:6px;min-height:40px}
details.whole summary::-webkit-details-marker{display:none}
details.whole summary svg{width:14px;height:14px;transition:transform .15s ease;color:var(--sk-text-2)}
details.whole[open] summary svg{transform:rotate(90deg)}
.sentences{margin:0;padding:0 12px 12px 30px;font-size:13.5px;line-height:1.75}
.sentences li{margin:0 0 6px}
.sentences .chip{vertical-align:1px;padding:0 6px;margin:0 2px}

/* Passages: a card per target stretch. */
.passage{border:1px solid var(--sk-hairline);border-radius:8px;padding:10px;margin:0 0 10px}
.passage.saved-row{opacity:.7}
.passage-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;min-width:0}
.passage-head .time{margin-left:auto;font-variant-numeric:tabular-nums;color:var(--sk-text-3);font-size:12px;flex:none}
.saved{display:inline-flex;align-items:center;gap:4px;color:var(--sk-text-2);font-size:12px;flex:none}
.saved svg{width:13px;height:13px;color:var(--sk-accent)}
.warn{display:flex;gap:6px;align-items:flex-start;font-size:12px;line-height:1.45;color:var(--sk-text-2);margin:0 0 8px}
.warn svg{width:14px;height:14px;flex:none;margin-top:1px}
.near{font-size:12px;color:var(--sk-text-2);margin:-2px 0 8px;overflow-wrap:anywhere}
.passage textarea{font-size:14px;line-height:1.6;min-height:72px;resize:vertical;padding:8px 10px}
.passage-tools{display:flex;gap:6px;align-items:center;margin-top:8px}
.passage-tools label{font-size:12px;color:var(--sk-text-2);flex:none}
.passage-tools select{min-width:0;flex:1;padding:6px 8px;font-size:12.5px}
.passage-tools button{font-size:12.5px;padding:6px 10px}
.thumb{display:block;max-width:100%;max-height:120px;border-radius:4px;margin:0 0 8px}
.empty{padding:20px 0}

/* Recording dock: sits on the toolbar, like the panels do. */
.dock{position:fixed;z-index:${Z.notice};bottom:80px;right:16px;width:420px;max-width:calc(100vw - 24px);box-sizing:border-box;background:var(--sk-surface);box-shadow:var(--sk-ring);border-radius:8px;font:13px/1.5 var(--sk-font);color:var(--sk-text);padding:10px}
.dock-top{display:flex;gap:10px;align-items:center}
.rec{position:relative;width:28px;height:28px;flex:none;display:grid;place-items:center;border-radius:50%;color:var(--sk-on-accent);background:var(--sk-accent)}
.rec svg{width:15px;height:15px}
.rec::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--sk-accent);opacity:.5;animation:voice-ring 1.6s ease-out infinite}
@keyframes voice-ring{from{transform:scale(.8);opacity:.6}to{transform:scale(1.25);opacity:0}}
.timer{font-variant-numeric:tabular-nums;font-weight:600;font-size:14px}
.timer small{font-weight:400;color:var(--sk-text-3);font-size:12px;margin-left:3px}
.dock-top .primary{margin-left:auto}
.now{display:flex;align-items:center;gap:8px;margin:10px 0 8px;min-width:0}
.now .label{color:var(--sk-text-2);font-size:12px;flex:none}
.now .chip{flex:0 1 auto}
.kbd{margin-left:auto;flex:none;font-size:12px;color:var(--sk-text-3)}
.dock-tools{display:flex;gap:6px;align-items:center}
.dock-tools button{padding:7px 11px}
.dock-tools .general[aria-pressed=true]{background:var(--sk-hover);border-color:var(--sk-text-3)}
.segment{display:flex;border:1px solid var(--sk-hairline);border-radius:6px;overflow:hidden;flex:1}
.segment button{flex:1;border:0;border-radius:0;background:transparent;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.segment button+button{border-left:1px solid var(--sk-hairline)}
.segment button svg{width:15px;height:15px}
.segment button[aria-pressed=true]{background:var(--sk-accent);color:var(--sk-on-accent)}
.dock-tools .icon[aria-pressed=true]{background:color-mix(in srgb,var(--sk-accent) 18%,transparent);border-color:color-mix(in srgb,var(--sk-accent) 45%,transparent)}
.dock .status{font-size:12px;color:var(--sk-text-2);margin:8px 2px 0;white-space:normal}
.dock.dictating .dock-top{min-height:44px}
.dock.dictating .what{color:var(--sk-text-2)}

/* Where the current words attach on the page, while recording. */
.outline{position:fixed;pointer-events:none;z-index:${Z.marker};border:2px solid #FF5436;border-radius:4px;box-shadow:0 0 0 4px #FF543622}
.outline span{position:absolute;left:-2px;bottom:100%;margin-bottom:4px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#FF5436;color:#1D1A2F;font:600 12px/1.5 var(--sk-font);padding:1px 7px;border-radius:4px}
.outline.below span{bottom:auto;top:100%;margin:4px 0 0}
/* Markers sit at a target's top-left: the label moves to the top-right
   rather than cover them (UX review 4, N14). */
.outline.right span{left:auto;right:-2px}
.region{position:fixed;pointer-events:none;border:2px solid #FF5436;background:#FF54361a;z-index:${Z.marker};border-radius:3px}

.notice{position:fixed;z-index:${Z.toast};right:16px;bottom:86px;max-width:calc(100vw - 32px);width:350px;background:var(--sk-surface);color:var(--sk-text);box-shadow:var(--sk-ring);padding:6px 6px 6px 12px;border-radius:8px;font:13px/1.5 var(--sk-font);display:flex;align-items:center;gap:8px}
.notice span{flex:1}
.notice button{order:2;background:transparent;border-color:transparent;color:var(--sk-text-2)}

@media(pointer:coarse){.kbd{display:none}}
@media(pointer:coarse),(max-width:640px){.hd{padding:4px 4px 4px 12px}.hd .icon{margin:0 0 0 auto;width:44px;min-width:44px;height:44px;min-height:44px}}
@media(prefers-reduced-motion:reduce){.rec::after{animation:none;opacity:0}details.whole summary svg{transition:none}}
@media(max-width:600px){
  .panel{bottom:80px;right:12px;max-height:calc(100dvh - 104px);width:calc(100vw - 24px);font-size:15px}
  .body{padding:12px}
  .passage textarea{font-size:15px}
  .sentences{font-size:14.5px}
  .passage-tools label{display:none}
  .passage-tools select,.passage-tools button,.hint,.chip,.time{font-size:12.5px}
  .dock{left:12px;right:12px;width:auto;font-size:14px}
  .foot button{font-size:13.5px}
}
`;
