import { createHost, markChrome, slotPanel, placeNearToolbar, setWorking, clearWorking, placeToast, reserveSurface, scheduleInsets, freeArea, revealRect, focusLost, focusMode, WIDE } from './ui.js';
import { viewport } from './viewport.js';
import { sessionKeyOf } from './page-key.js';
import { reviewerName, ensureReviewer, rememberOwn } from './reviewer.js';
import { createSession, addAnchor, addPlayhead, transcriptToPassages, updatePassage, reassignPassage, splitPassage, removePassage, exportNotes, transcriptSentences } from './voice-model.js';
import { playhead, targetAt } from './playhead.js';
import { selectorFor, elementContext, regionContext, elementLabel, nearText } from './voice-context.js';
import { voiceCSS } from './voice.css.js';

const paths = { mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6M14.5 8.5h.01"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
  page:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',element:'<path d="M5 3l14 7-6 2-2 6z"/>',region:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',point:'<path d="M5 3l14 7-6 2-2 6z"/>',interact:'<path d="M9 11V5a2 2 0 0 1 4 0v5M13 9.5a2 2 0 0 1 4 0V12M17 11a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L5 15a2 2 0 0 1 3-2.6L9 13.5"/>',
  warn:'<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',chevron:'<path d="m9 6 6 6-6 6"/>',speak:'<path d="M4 6h16v10H9l-5 4z"/>',review:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>' };
const svg = key => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[key] || paths.mic}</svg>`;
const displayPage = raw => {try{const u=new URL(raw,location.href);return u.pathname+u.search;}catch{return String(raw||'/');}};
const clock = ms => `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
const el = (tag,cls,text) => { const n=document.createElement(tag); if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n; };
const button = (label,fn,icon) => { const b=el('button',icon?'icon':'',icon?undefined:label);b.type='button';b.title=label;b.setAttribute('aria-label',label);if(icon)b.innerHTML=svg(icon);b.onclick=fn;return b; };
// Phones have no Esc key: say what to tap instead (UX review finding 25).
const coarse = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
function chromeEvent(e) { return e.composedPath().some(n=>n instanceof Element && (n.matches('[data-feedback-toolbar],[data-agentation-root],#agentation-root,[data-sk-no-edit]') || n.closest('[data-feedback-toolbar],[data-agentation-root],#agentation-root'))); }
const kindIcon = a => a?.kind==='region'?'region':a?.kind==='element'?'element':'page';
function chip(a,label){const c=el('span','chip'+(a?.kind==='general'||!a?.kind?' general':''));c.innerHTML=svg(kindIcon(a));c.append(el('span','',label||a?.label||'General'));c.title=label||a?.label||'General';return c;}
// Inline [→ T2 label] markers become chips; the words between them stay text.
function sentenceNodes(text,targets){const out=[];let last=0;for(const m of text.matchAll(/\[→ (T\d+) ([^\]]*)\]/g)){if(m.index>last)out.push(document.createTextNode(text.slice(last,m.index)));const t=targets.get(m[1]);const check=m[2].endsWith('(check timing)');const c=chip(t||{kind:'element'},(t?.kind==='general'?'General':t?.label||m[2])+(check?' · check timing':''));c.classList.add('marker');c.setAttribute('aria-label',`Target changes to ${t?.label||m[2]}${check?', timing approximate':''}`);out.push(c);last=m.index+m[0].length;}if(last<text.length)out.push(document.createTextNode(text.slice(last)));return out;}
function nativeInsert(area, text, start, end) { const old=area.value;if(start>0&&!/\s/.test(old[start-1])&&!/^[\s.,!?;:]/.test(text))text=' '+text;if(end<old.length&&!/\s/.test(old[end])&&!/[\s]$/.test(text))text+=' ';const value=old.slice(0,start)+text+old.slice(end);const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;setter.call(area,value);area.dispatchEvent(new Event('input',{bubbles:true,composed:true}));area.dispatchEvent(new Event('change',{bubbles:true,composed:true}));area.focus();area.setSelectionRange(start+text.length,start+text.length); }

export function createVoice({endpoint,sessionId,config={}}) {
  let capability=null,capPromise=null,session=null,state='idle',message='',record=null,abort=null,mode='point',drag=null,screen=null,screenVideo=null,screenStatus='',dictation=null,requestGeneration=0,tick=null,saved=new Set(),saveFailures=new Map(),saving=false,recovered=false,noticeTimer=null,headFocus=false;
  // Retained audio belongs to its capture. Dictation can never replace a voice-session retry payload.
  const sessionAudios=new Map();
  const ui=createHost(voiceCSS);ui.host.dataset.voiceUi='';
  const panel=el('section','panel');panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Voice feedback');ui.root.append(panel);
  const dock=el('section','dock');dock.hidden=true;dock.setAttribute('aria-label','Voice feedback recording');ui.root.append(dock);
  const region=el('div','region');region.hidden=true;ui.root.append(region);
  const outline=el('div','outline');outline.hidden=true;outline.append(el('span'));ui.root.append(outline);
  const notice=el('div','notice');notice.hidden=true;notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');ui.root.append(notice);
  const slot=slotPanel('voice',visible=>{panel.hidden=!visible;if(visible)requestAnimationFrame(()=>placeNearToolbar(panel,460));else{previewTarget(null);scheduleInsets();}});
  reserveSurface(dock,'bottom');addEventListener('resize',()=>{if(!panel.hidden)placeNearToolbar(panel,460);});
  // Side sheets float over the page (ui.js placeNearToolbar), so setup,
  // recording and review never reflow it, and the whole Talk pass holds still
  // (UX review 5, #18) without reserving a column.
  const storageKey=(name=reviewerName())=>`feedback-toolbar-voice:${endpoint}:${name.toLowerCase()}`;
  const persist=()=>{if(!session)return;try{localStorage.setItem(storageKey(session.reviewer||''),JSON.stringify({version:1,session,saved:[...saved],state,at:Date.now()}));}catch{message='Browser storage is full. Keep this tab open or download the draft.';}};
  // Setup opened takes focus to Start recording (UX review 5, #11): it was ten
  // Tab stops away, behind the steps and the disclosure. While the speech
  // service is still being checked the button is disabled, so the heading
  // holds focus until it is ready.
  let wantStart=false,stopFirst=false;
  function startFocus(b,title){if(!wantStart||panel.hidden)return;if(b.disabled){title.focus({preventScroll:true});return;}wantStart=false;b.focus({preventScroll:true});}
  // Start recording hides the setup panel and its focused button with it:
  // focus goes to the dock's Stop as it renders (UX review 5, #9), unless the
  // reviewer has moved on while the microphone was being asked for.
  function focusStop(){if(focusLost()||panel.contains(ui.root.activeElement))stopFirst=true;}
  function notify(text){clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.hidden=true;scheduleInsets();},6500);notice.replaceChildren(button('Dismiss',()=>{notice.hidden=true;scheduleInsets();},'close'),el('span','',text));notice.hidden=false;placeToast(notice,350);}
  // The built-in local model (server/voice-local.js) starts the first time
  // someone opens Talk or dictation. Until it is ready the answer is not
  // final, so it is asked again; `prepare` is what starts it.
  const warming=c=>!!c?.local&&(c.local.state==='idle'||c.local.state==='starting');
  const providerName=c=>c?.provider==='local-whisper'?'On this computer':c?.provider||'Not configured';
  // Always ask what is possible first (a hosted server answers that and has no
  // prepare route). Only the built-in model is ever told to start, and a
  // server that cannot start it yet is asked again each time Talk is opened.
  let prepPromise=null;
  async function capabilities({prepare=false}={}){
    if(capability&&(!capability.local||capability.local.state==='ready'))return capability;
    if(!capPromise)capPromise=fetch(`${endpoint}/voice/capabilities`).then(async r=>{const c=await r.json();if(!r.ok)throw new Error(c.error||'Speech service is unavailable.');return capability=c;}).finally(()=>capPromise=null);
    const c=await capPromise;
    if(prepare&&c.local&&c.local.state!=='ready'){
      if(!prepPromise)prepPromise=fetch(`${endpoint}/voice/prepare`,{method:'POST'}).then(async r=>{if(!r.ok)return;const p=await r.json();if(p?.local&&capability){capability.local=p.local;capability.enabled=!!p.enabled;}}).catch(()=>{}).finally(()=>prepPromise=null);
      await prepPromise;
    }
    return capability||c;
  }
  let warmTimer=0;
  // While a panel that needs the model is open, keep asking until it is ready (or says why it can't be).
  function warmUp(again){clearTimeout(warmTimer);if(!warming(capability))return;warmTimer=setTimeout(async()=>{if(panel.hidden||!['setup','dictation-disclosure'].includes(state)){return;}try{await capabilities();}catch{}again();warmUp(again);},2000);}
  function show(){notice.hidden=true;slot.want(true,{bump:true});render();}
  async function open(){if(abort){state='transcribing';show();return;}if(record){dock.hidden=false;return;}if(session){state='editor';show();return;}if(dictation){showDictationResult();return;}state='setup';message='';wantStart=true;show();try{await capabilities({prepare:true});}catch(e){message=e.message;}render();warmUp(render);}
  function restore(){if(session)return;try{const draft=JSON.parse(localStorage.getItem(storageKey())||'null');if(draft?.version===1&&draft.session){const ids=new Set(draft.saved||[]);if(draft.session.passages?.length&&draft.session.passages.every(p=>ids.has(p.id))){localStorage.removeItem(storageKey());return;}session=draft.session;saved=ids;recovered=true;state='editor';message=`Recovered your transcript and pointing history from ${displayPage(session.page)}. Targets keep their original pages. Live audio cannot be recovered after a reload.`;}}catch{/* corrupt browser draft does not block recording */}}
  restore();
  document.addEventListener('agentation-kit:reviewer-change',()=>{if(record||saving||state==='transcribing'||state==='requesting'){notify('The current voice draft keeps its original reviewer. Finish or discard it before starting another.');return;}if(!record){session=null;saved=new Set();restore();render();}});
  async function startCapture(kind,area=null){
    if(record||abort||state==='requesting'||state==='transcribing'){notify('Finish the current recording first.');return;}
    let c;try{c=await capabilities({prepare:true});if(!c.enabled)throw new Error(c.local?.message||(warming(c)?'Local transcription is still starting. Try again in a moment.':c.disclosure)||'Speech transcription is not configured.');if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error('Audio recording is not available in this browser.');}catch(e){message=e.message;render();notify(message);return;}
    const generation=++requestGeneration;state='requesting';message='Allow microphone access to begin.';render();
    let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});if(generation!==requestGeneration){stream.getTracks().forEach(t=>t.stop());return;}
      const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported?.(m));const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:{});const start=performance.now();
      if(kind==='session'){session=createSession({page:location.href,viewport:viewport(),reviewer:reviewerName()});saved=new Set();saveFailures.clear();recovered=false;mode='point';}
      const chunks=[];let bytes=0;record={recorder,stream,start,kind,area,chunks,durationMs:0,stopReason:'',generation,ownerSessionId:kind==='session'?session.id:null};
      recorder.ondataavailable=e=>{if(e.data?.size){chunks.push(e.data);bytes+=e.data.size;if(bytes>(c.limits?.maxBytes||16777216)&&record?.recorder===recorder)stop('Recording reached the audio size limit.');}};
      recorder.onerror=()=>{message='The microphone stopped unexpectedly. Your available audio and draft are kept.';stop(message);};
      recorder.onstop=()=>finish(record?.recorder===recorder?record:{recorder,stream,start,kind,area,chunks,durationMs:performance.now()-start,generation});
      recorder.start(1000);state='recording';message='';window.__AGENTATION_KIT_VOICE_RECORDING__=true;window.__AGENTATION_KIT_VOICE_KIND__=kind;document.dispatchEvent(new CustomEvent('agentation-kit:voice-capture',{detail:{active:true,kind}}));updatePoint();slot.want(false);tick=setInterval(()=>{if(record?.recorder!==recorder)return;record.durationMs=performance.now()-start;trackPlayhead();if(record.durationMs>=Math.min(c.limits?.maxDurationMs||300000,300000))stop('Five-minute recording limit reached.');else renderDock();},250);if(kind==='session')focusStop();renderDock();persist();
    }catch(e){stream?.getTracks().forEach(t=>t.stop());if(generation!==requestGeneration)return;state=kind==='session'?'setup':'idle';message=e.name==='NotAllowedError'?'Microphone access was denied. Your existing text is kept.':`Could not start the microphone. ${e.message||''}`;if(kind==='session')show();else notify(message);render();}
  }
  function updatePoint(){window.__AGENTATION_KIT_VOICE_POINT__=!!(record?.kind==='session'&&mode==='point');}
  function stop(reason=''){if(!record){if(state==='requesting'){requestGeneration++;state=session?'editor':'setup';message='Microphone request cancelled.';render();}return;}
    // Stop hides the dock, and the focused Stop button with it: focus would
    // fall to BODY (UX review 4, F-Return). The review panel's heading takes
    // it instead, unless the reviewer had already moved on to the page.
    if(record.kind==='session'){const at=ui.root.activeElement;headFocus=!!at&&dock.contains(at)||document.activeElement===document.body||!document.activeElement;}
    record.durationMs=Math.min(performance.now()-record.start,300000);record.stopReason=reason;window.__AGENTATION_KIT_VOICE_POINT__=false;window.__AGENTATION_KIT_VOICE_RECORDING__=false;document.dispatchEvent(new CustomEvent('agentation-kit:voice-capture',{detail:{active:false}}));clearInterval(tick);region.hidden=true;drag=null;window.__AGENTATION_KIT_POINTER_DRAG__=false;state='transcribing';message=reason||'Transcribing your recording…';renderDock();try{record.recorder.stop();}catch{finish(record);}record?.stream.getTracks().forEach(t=>t.stop());stopScreen();}
  async function finish(capture){if(!capture||capture.finished)return;if(capture.generation!==requestGeneration){capture.stream?.getTracks().forEach(t=>t.stop());if(record===capture)record=null;return;}capture.finished=true;capture.stream.getTracks().forEach(t=>t.stop());if(record===capture)record=null;placeOutline();capture.audio=new Blob(capture.chunks,{type:capture.recorder.mimeType||capture.chunks[0]?.type||'audio/webm'});capture.chunks=[];if(capture.kind==='session')sessionAudios.set(capture.ownerSessionId,capture);dock.hidden=true;if(capture.kind==='session')show();if(!capture.audio.size){state=capture.kind==='session'?'editor':'idle';message='No audio was captured. Your draft is kept.';render();if(capture.kind!=='session')notify(message);return;}await transcribe(capture);}
  async function transcribe(capture){const generation=capture.generation;if(generation!==requestGeneration||abort)return;if(capture.kind==='session'&&capture.ownerSessionId!==session?.id){notify('That recording belongs to another voice draft. Open its original draft to retry.');return;}if(!capture.audio?.size){notify('The audio for this recording is unavailable. Your transcript and targets are kept.');return;}state='transcribing';message='Transcribing your recording…';render();const controller=new AbortController();abort=controller;try{if(capability?.mimeTypes?.includes('audio/wav')&&!capability.mimeTypes.includes(capture.audio.type.split(';')[0])&&capture.audio.type!=='audio/wav')capture.audio=await wavAudio(capture.audio);if(generation!==requestGeneration)return;const form=new FormData();form.append('audio',capture.audio,'recording.'+(capture.audio.type==='audio/wav'?'wav':capture.audio.type.includes('mp4')?'m4a':'webm'));form.append('durationMs',String(Math.round(capture.durationMs)));const response=await fetch(`${endpoint}/voice/transcribe`,{method:'POST',body:form,signal:controller.signal});const data=await response.json();if(!response.ok)throw new Error(data.error||`Transcription failed (${response.status}).`);if(generation!==requestGeneration)return;if(!data.text?.trim()&&!data.segments?.some(s=>s.text?.trim()))throw new Error('No speech was detected. Your draft is kept.');
      if(capture.kind==='dictation'){const d=capture.area;const text=(data.text||data.segments.map(s=>s.text).join(' ')).trim();if(d.area.isConnected&&d.area.value===d.before){dictation=null;nativeInsert(d.area,text,d.start,d.end);message='Dictation added. Review your text before sending.';}else{dictation={...d,text};message='Your text changed while transcribing. Insert the transcript when you are ready.';}state='idle';notify(message);if(dictation)showDictationResult();}
      else{session=transcriptToPassages(session,data.segments?.length?data.segments:[{id:'whole',startMs:0,endMs:capture.durationMs,text:data.text}]);session={...session,provider:data.provider,timing:data.timing};state='editor';message=capture.stopReason||'';persist();render();}
    }catch(e){if(generation!==requestGeneration)return;state=capture.kind==='session'?'editor':'idle';message=e.name==='AbortError'?'Transcription cancelled. Your audio remains in this tab.':`${e.message} Your audio remains in this tab for retry.`;if(capture.kind==='dictation'){dictation={...capture.area,capture};showDictationResult();}else{session={...session,retryDurationMs:capture.durationMs};persist();render();}}
    finally{if(abort===controller)abort=null;}
  }
  function showDictationResult(){state='dictation';show();}
  function discard(){if(saving){notify('Wait for the current save to finish. Your draft is kept.');return;}const discardKey=storageKey(session?.reviewer||reviewerName());if(record)stop();requestGeneration++;abort?.abort();abort=null;stopScreen();if(session)sessionAudios.delete(session.id);session=null;saved=new Set();state='idle';message='';try{localStorage.removeItem(discardKey);}catch{}slot.want(false);render();}
  // Where the page's own timeline is, kept beside the recording so each passage can say when (voice-model.js).
  function trackPlayhead(){if(!session||record?.kind!=='session')return;const at=playhead();if(!at)return;const next=addPlayhead(session,at,performance.now()-record.start);if(next!==session){session=next;persist();}}
  function addTarget(target){if(!session||!record)return;trackPlayhead();session=addAnchor(session,target,performance.now()-record.start);persist();renderDock();if(target.kind!=='general')revealTarget();}
  function general(){if(!record||!session)return;addTarget({kind:'general',label:'General',page:location.href,viewport:viewport()});}
  function renderDock(){dock.hidden=!(record&&state==='recording');if(dock.hidden){outline.hidden=true;return;}
    const elapsed=performance.now()-record.start;
    // Tick: update the clock in place so focus and hover survive.
    const timer=dock.querySelector('.timer');if(timer&&dock.dataset.kind===record.kind&&dock.dataset.paint===paintKey()){timer.firstChild.textContent=clock(elapsed);placeDock();return;}
    const was=dock.contains(ui.root.activeElement)?ui.root.activeElement.getAttribute('aria-label'):null;dock.dataset.kind=record.kind;dock.dataset.paint=paintKey();dock.className='dock'+(record.kind==='dictation'?' dictating':'');dock.replaceChildren();
    const top=el('div','dock-top');const rec=el('span','rec');rec.innerHTML=svg('mic');rec.setAttribute('aria-hidden','true');const t=el('span','timer',clock(elapsed));t.append(el('small','','/ 5:00'));t.setAttribute('aria-label','Recording time');top.append(rec,t);
    const stopButton=button('Stop',()=>stop());stopButton.className='primary';stopButton.innerHTML=svg('stop')+'<span>Stop</span>';stopButton.setAttribute('aria-label','Stop');
    if(record.kind==='dictation'){top.append(el('span','what','Dictating note'),stopButton);dock.append(top);placeDock();return;}
    top.append(stopButton);dock.append(top);
    const active=session?.anchors.find(a=>a.id===session.activeAnchorId);
    const now=el('div','now');now.append(el('span','label','Talking about'),chip(active,active?.kind==='general'?'General page feedback':active?.label));if(active&&active.kind!=='general')now.append(el('span','kbd','Esc returns to General'));dock.append(now);
    const tools=el('div','dock-tools');const g=button('General',general);g.className='general';g.setAttribute('aria-pressed',String(!active||active.kind==='general'));g.title='Talk about the whole page';tools.append(g);
    const seg=el('div','segment');seg.setAttribute('role','group');seg.setAttribute('aria-label','What a click does');
    for(const value of ['point','interact']){const label=value==='point'?'Point':'Interact';const b=button(label,()=>{mode=value;updatePoint();drag=null;window.__AGENTATION_KIT_POINTER_DRAG__=false;region.hidden=true;renderDock();});b.innerHTML=svg(value)+`<span>${label}</span>`;b.title=value==='point'?'Clicks and drags choose what you are talking about':'Clicks use the page normally';b.setAttribute('aria-pressed',String(mode===value));seg.append(b);}
    tools.append(seg);const shot=button(screen?'Disable region screenshots':'Enable region screenshots',toggleScreen,'image');shot.setAttribute('aria-pressed',String(!!screen));tools.append(shot);dock.append(tools);
    const hint=screenStatus||(mode==='point'?(coarse()?'Tap an element or drag a region to point at it while you talk.':'Click an element or drag a region to point at it while you talk.'):'Use the page normally. Your current target stays selected.')+(coarse()&&active&&active.kind!=='general'?' Tap General to go back.':'');dock.append(el('div','status',hint));if(was)[...dock.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===was)?.focus({preventScroll:true});if(stopFirst){stopFirst=false;stopButton.focus({preventScroll:true});}placeDock();}
  const paintKey=()=>JSON.stringify([mode,!!screen,screenStatus,session?.activeAnchorId,session?.anchors.length]);
  // The dock belongs to the toolbar: right-aligned with it, just above it.
  function placeDock(){const bar=document.querySelector('[data-agentation-toolbar]')?.getBoundingClientRect();if(!bar?.width){dock.style.bottom='80px';placeOutline();return;}dock.style.bottom=Math.max(12,innerHeight-bar.top+10)+'px';if(innerWidth>600){const w=Math.min(420,innerWidth-24);dock.style.right=Math.max(12,innerWidth-bar.right)+'px';dock.style.left='auto';dock.style.width=w+'px';}else{dock.style.left=dock.style.right='12px';dock.style.width='auto';}placeOutline();scheduleInsets();}
  // Outline the current target so the reviewer sees where their words attach.
  // Only while recording (or previewing a target from the editor): Stop leaves
  // the recording in place until the audio is in, and an insets or scroll
  // pass in that gap re-showed the box, which then stayed at its old place
  // on the review panel's reflowed page (UX review 4, N1).
  function placeOutline(){const a=preview||(record?.kind==='session'&&state==='recording'&&session?.anchors.find(x=>x.id===session.activeAnchorId));if(!a||a.kind==='general'||(a.page&&a.page!==location.href)){outline.hidden=true;return;}let r=null;if(a.kind==='element'){try{const n=document.querySelector(a.selector);if(n)r=n.getBoundingClientRect();}catch{}}else if(a.rect){r={left:a.rect.x-(scrollX-(a.rect.scrollX??scrollX)),top:a.rect.y-(scrollY-(a.rect.scrollY??scrollY)),width:a.rect.width,height:a.rect.height};}if(!r||!r.width){outline.hidden=true;return;}Object.assign(outline.style,{left:r.left-3+'px',top:r.top-3+'px',width:r.width+6+'px',height:r.height+6+'px'});outline.classList.toggle('below',r.top<28);outline.classList.remove('right');outline.firstChild.textContent=a.label;outline.hidden=false;if(underMarker(outline.firstChild.getBoundingClientRect()))outline.classList.add('right');}
  // A marker (the reviewer's or the agent's) under the target's label.
  function underMarker(r){for(const m of document.querySelectorAll('[data-annotation-marker],.sk-crit-dot')){if(m.hidden)continue;const q=m.getBoundingClientRect();if(q.width&&q.left<r.right+4&&q.right>r.left-4&&q.top<r.bottom+4&&q.bottom>r.top-4)return true;}return false;}
  addEventListener('scroll',()=>{if(record||preview)placeOutline();},{capture:true,passive:true});document.addEventListener('agentation-kit:insets',()=>{if(record||preview)placeOutline();});
  // Reassigning a target in the editor shows it on the page, in the free area.
  let preview=null,working=null;const outlineRect=()=>outline.hidden?null:outline.getBoundingClientRect();function previewTarget(a){preview=a&&a.kind!=='general'?a:null;placeOutline();if(preview&&!outline.hidden){let n=null;if(preview.kind==='element'){try{n=document.querySelector(preview.selector);}catch{}}working=n||outlineRect;setWorking(working);}else if(working){clearWorking(working);working=null;}if(preview&&!outline.hidden)revealRect(outline.getBoundingClientRect());placeOutline();}
  // A pointed target must not sit under the dock or any other review surface.
  function revealTarget(){requestAnimationFrame(()=>{placeOutline();if(!outline.hidden){const r=outline.getBoundingClientRect();const f=freeArea();if(r.bottom>f.bottom||r.top<f.top){revealRect(r);placeOutline();}}});}addEventListener('resize',()=>{if(record)placeDock();else if(preview)placeOutline();});document.addEventListener('agentation-kit:toolbar-position',()=>requestAnimationFrame(()=>{if(record)placeDock();}));
  function render(){if(panel.hidden&&!slot.wants)return;const keepFocus=headFocus||(!!ui.root.activeElement&&ui.root.activeElement===panel.querySelector('.hd strong'));panel.replaceChildren();requestAnimationFrame(()=>{if(!panel.hidden)placeNearToolbar(panel,460);});const header=el('div','hd');const title=el('strong','',state==='dictation'?'Dictate note':state==='editor'?'Review voice feedback':'Talk and point');title.tabIndex=-1;title.setAttribute('role','heading');title.setAttribute('aria-level','2');header.append(title,button('Close voice panel',hide,'close'));panel.append(header);
    if(keepFocus){const go=()=>{if(title.isConnected&&!panel.hidden){title.focus({preventScroll:true});headFocus=false;}};go();if(headFocus)requestAnimationFrame(go);}const body=el('div','body');panel.append(body);if(message){const s=el('p','status',message);s.setAttribute('role','status');body.append(s);}const footer=el('div','foot');panel.append(footer);
    if(state==='setup'||state==='requesting'){body.append(el('p','lead','Talk through your feedback and point as you go.'));const steps=el('ol','steps');for(const [icon,title,text] of [['speak','Talk','You start in General: page-level feedback.'],['point','Point',coarse()?'Tap an element or drag a region. Your next words attach to it. Tap General to go back.':'Click an element or drag a region. Your next words attach to it. Esc returns to General.'],['review','Review','Edit the transcript and its targets before anything is saved.']]){const li=el('li');li.innerHTML=svg(icon);const d=el('div');d.append(el('b','',title),el('span','',text));li.append(d);steps.append(li);}body.append(steps);const disclosure=el('div','disclosure');disclosure.append(el('p','',capability?`Transcription: ${warming(capability)?'Getting ready':capability.local?.state==='unavailable'?'Not available':providerName(capability)}`:'Checking speech service…'),el('p','hint',(capability?.local&&capability.local.state!=='ready'&&capability.local.message)||capability?.disclosure||'Audio is sent to the configured speech provider only after you stop recording.'));if(warming(capability)){disclosure.setAttribute('role','status');}// No speech provider: the primary action must still lead somewhere (UX review
      // finding 3). A disabled Start recording made this panel a dead end.
      // Still starting is not "no provider": Start recording waits, disabled, and enables itself when the model is ready.
      const noProvider=state==='setup'&&(capability?!capability.enabled&&!warming(capability):!!message);
      body.append(disclosure);if(!noProvider)body.append(el('p','hint','The microphone starts when you choose Start recording. Region screenshots are optional and ask separately. Up to 5 minutes.'));footer.append(button('Cancel',()=>{if(state==='requesting')stop();hide();}));
      if(noProvider){const typeInstead=button('Type a note instead',toComment);typeInstead.className='primary';footer.append(typeInstead);startFocus(typeInstead,title);return;}
      footer.append(button(state==='requesting'?'Waiting for microphone…':'Start recording',async()=>{await ensureReviewer('Your voice feedback will be signed with your name.');await startCapture('session');}));footer.lastChild.className='primary';if(state!=='requesting')footer.lastChild.innerHTML=svg('mic')+'<span>Start recording</span>';footer.lastChild.disabled=state==='requesting'||!capability?.enabled;startFocus(footer.lastChild,title);return;}
    if(state==='transcribing'){body.append(el('p','muted','Keep this tab open. Your recording stays in memory if transcription fails.'));footer.append(button('Cancel transcription',()=>abort?.abort()));return;}
    if(state==='dictation'){if(dictation?.text){const ta=el('textarea');ta.value=dictation.text;ta.setAttribute('aria-label','Dictation transcript');body.append(ta);footer.append(button('Copy transcript',()=>navigator.clipboard?.writeText(ta.value)),button('Insert at current caret',()=>{if(!dictation.area.isConnected){notify('The original note is no longer open. Copy your transcript first.');return;}nativeInsert(dictation.area,ta.value,dictation.area.selectionStart,dictation.area.selectionEnd);dictation=null;slot.want(false);}));footer.lastChild.className='primary';}else if(dictation?.capture?.audio)footer.append(button('Retry transcription',()=>transcribe({...dictation.capture,generation:requestGeneration})));footer.prepend(button('Discard audio',()=>{dictation=null;slot.want(false);}));return;}
    if(state==='editor'&&session){const meta=el('p','meta');const last=session.passages.at(-1);meta.append(el('span','',(()=>{const pg=displayPage(session.page);let here=false;try{here=new URL(session.page,location.href).pathname===location.pathname;}catch{}return here?'Recorded on this page':`Recorded on ${pg}`;})()),el('span','',session.reviewer||'Unnamed reviewer'));if(last)meta.append(el('span','',clock(last.endMs||0)));body.append(meta);if(recovered)body.append(el('p','hint','Recovered draft. Audio is unavailable after a reload.'));if(!session.passages.length){body.append(el('p','empty','No transcript yet. Your pointing history is kept.'));if(sessionAudios.get(session.id)?.audio)footer.append(button('Retry transcription',()=>transcribe({...sessionAudios.get(session.id),generation:requestGeneration})));}
      const view=session.passages.length>1?transcriptSentences(session):null;if(view?.sentences.length&&view.targets.length>1){const whole=el('details','whole');whole.open=true;const sum=el('summary');sum.innerHTML=svg('chevron');sum.append(el('span','','Read as one transcript'));const list=el('ol','sentences');const refs=new Map(view.targets.map(t=>[t.ref,session.anchors.find(a=>a.id===t.id)||t]));for(const s of view.sentences){const li=el('li');li.append(...sentenceNodes(s.text,refs));list.append(li);}whole.append(sum,list);body.append(whole);}
      for(const [index,p]of session.passages.entries()){const isSaved=saved.has(p.id);const row=el('article','passage'+(isSaved?' saved-row':''));const a=session.anchors.find(a=>a.id===p.anchorId)||session.anchors[0];const ph=el('div','passage-head');ph.append(chip(a,a?.kind==='general'?'General':a?.label));if(isSaved){const s=el('span','saved');s.innerHTML=svg('check');s.append('Saved');ph.append(s);}ph.append(el('span','time',`${clock(p.startMs||0)}–${clock(p.endMs||0)}`));row.append(ph);const near=nearText(a);if(near)row.append(el('p','near',near));if(a?.page&&a.page!==location.href)row.append(el('p','hint',`Target page: ${displayPage(a.page)}`));if(p.needsReview||p.timingApproximate||p.timingUncertain){const w=el('p','warn');w.innerHTML=svg('warn');w.append(el('span','','Timing overlaps a target change. Check this target before saving.'));row.append(w);}if(a?.image?.dataUrl){const img=el('img','thumb');img.src=a.image.dataUrl;img.alt='Captured region at the time you pointed';row.append(img);}const ta=el('textarea');ta.value=p.text;ta.maxLength=8192;ta.setAttribute('aria-label',`Passage ${index+1}`);ta.disabled=saving||isSaved;ta.oninput=()=>{session=updatePassage(session,p.id,ta.value);persist();};ta.onkeydown=e=>e.stopPropagation();row.append(ta);const tools=el('div','passage-tools');const select=el('select');select.id=`voice-target-${index}`;const lab=el('label','','Target');lab.htmlFor=select.id;select.setAttribute('aria-label',`Target for passage ${index+1}`);for(const a of session.anchors){const option=el('option','',(a.kind==='general'?'General':a.label)+(a.page!==session.page?' · '+displayPage(a.page):''));option.value=a.id;select.append(option);}select.value=p.anchorId;select.disabled=saving||isSaved;select.onfocus=()=>previewTarget(session.anchors.find(x=>x.id===select.value));select.onchange=()=>{session=reassignPassage(session,p.id,select.value);persist();render();previewTarget(session.anchors.find(x=>x.id===select.value));};tools.append(lab,select);const split=button('Split at caret',()=>{if(ta.selectionStart<=0||ta.selectionStart>=ta.value.length){notify('Place the caret between words to split this passage.');return;}session=splitPassage(session,p.id,ta.selectionStart);persist();render();});split.disabled=saving||isSaved;const del=button('Delete passage',()=>{session=removePassage(session,p.id);persist();render();},'trash');del.disabled=saving||isSaved;tools.append(split,del);row.append(tools);if(saveFailures.has(p.id))row.append(el('p','status',saveFailures.get(p.id)));body.append(row);}
      const discardButton=button('Discard draft',discard);discardButton.className='quiet';discardButton.disabled=saving;footer.append(discardButton,button('Download manifest',download,'download'));const complete=saved.size===session.passages.length&&saved.size;const save=button(complete?'Done':saving?'Saving…':saved.size?'Retry unsaved notes':'Save feedback',complete?discard:saveNotes);save.className='primary';save.disabled=saving||(!complete&&!session.passages.some(p=>p.text.trim()&&!saved.has(p.id)));footer.append(save);}
  }
  // What the reviewer pointed at, in page words: shown under each target.
  async function saveNotes(){
    if(saving||!session)return;
    const draft=session,operationId=draft.id;
    let notes;
    try{notes=exportNotes(draft);}catch(e){message=e.message;render();return;}
    saving=true;message='';saveFailures.clear();render();
    try{
      for(const note of notes){
        const passageId=note.voice.passageId;
        if(saved.has(passageId))continue;
        // The passage knows when; this page knows what was on screen then, and which timed part the target sits in.
        // The fuller record only when the note still fits (exportNotes checked its size without it).
        if(note.playhead&&note.url===location.href){const full=playhead(targetAt(note.elementPath,note.playhead.time),note.playhead.time);const next=full&&(note.playhead.playing?{...full,playing:true}:full);if(next&&JSON.stringify({...note,playhead:next}).length<=63*1024)note.playhead=next;}
        try{
          const page=note.url||draft.page;
          const response=await fetch(`${endpoint}/sessions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:page,...(sessionKeyOf(page)?{pageKey:sessionKeyOf(page)}:{})})});
          if(!response.ok)throw new Error(`Could not resolve page (${response.status}).`);
          const targetSession=await response.json();
          const res=await fetch(`${endpoint}/sessions/${encodeURIComponent(targetSession.id)}/annotations`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(note)});
          if(!res.ok)throw new Error(`Save failed (${res.status}). Your passage is kept.`);
          const created=await res.json();rememberOwn(note.id,created.id);
          if(session?.id===operationId){saved.add(passageId);persist();}
        }catch(e){if(session?.id===operationId)saveFailures.set(passageId,e.message);}
      }
      if(session?.id===operationId){message=saveFailures.size?`${saved.size} saved. ${saveFailures.size} could not save. Retry will send only unsaved passages.`:`Saved ${saved.size} feedback ${saved.size===1?'note':'notes'}.`;persist();}
      window.__AGENTATION_KIT_REVIEW__?.refresh();document.dispatchEvent(new CustomEvent('agentation-kit:voice-saved'));
    }finally{saving=false;render();}
  }
  function download(){if(!session)return;const file=new Blob([JSON.stringify({version:1,...session,transcript:session.passages.length?transcriptSentences(session):undefined,saveStatus:{savedPassageIds:[...saved],failed:[...saveFailures]}},null,2)],{type:'application/json'});const url=URL.createObjectURL(file);const a=el('a');a.href=url;a.download=`voice-feedback-${session.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function toggleScreen(){const owner=record;if(!owner)return;if(screen){stopScreen();screenStatus='Region screenshots off.';renderDock();return;}if(!navigator.mediaDevices?.getDisplayMedia){screenStatus='Screenshots are unavailable in this browser. Regions still work.';renderDock();return;}try{const handle=crypto.randomUUID();navigator.mediaDevices.setCaptureHandleConfig?.({handle,exposeOrigin:true,permittedOrigins:[location.origin]});const stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser'},audio:false,preferCurrentTab:true,selfBrowserSurface:'include',surfaceSwitching:'exclude'});if(record!==owner||state!=='recording'){stream.getTracks().forEach(t=>t.stop());return;}const track=stream.getVideoTracks()[0],settings=track?.getSettings();if(settings?.displaySurface!=='browser'||track?.getCaptureHandle?.()?.handle!==handle){stream.getTracks().forEach(t=>t.stop());throw new Error('This browser could not verify a capture of this exact tab. Screenshot capture is off.');}screen=stream;screenVideo=el('video');screenVideo.muted=true;screenVideo.srcObject=screen;await screenVideo.play();track.onended=()=>{stopScreen();screenStatus='Screen sharing ended. Regions still work.';renderDock();};screenStatus='Screenshots enabled. Share this tab at its original size.';}catch(e){screenStatus=e.name==='NotAllowedError'?'Screen sharing was declined. Regions still work.':`${e.message||'Screen capture unavailable.'} Regions still work.`;}renderDock();}
  function stopScreen(){if(screen)for(const t of screen.getTracks()){t.onended=null;t.stop();}screen=null;if(screenVideo){screenVideo.srcObject=null;screenVideo=null;}}
  function captureRegion(rect){if(!screen||!screenVideo)return null;const width=screenVideo.videoWidth,height=screenVideo.videoHeight;if(!width||!height||Math.abs(width/height-innerWidth/innerHeight)>.04){screenStatus='Capture geometry differs from this tab. Region saved without an image.';return null;}const scale=width/innerWidth,canvas=el('canvas');const max=420;const shrink=Math.min(1,max/Math.max(rect.width,rect.height));canvas.width=Math.max(1,Math.round(rect.width*shrink));canvas.height=Math.max(1,Math.round(rect.height*shrink));const ctx=canvas.getContext('2d');try{ctx.drawImage(screenVideo,rect.x*scale,rect.y*scale,rect.width*scale,rect.height*scale,0,0,canvas.width,canvas.height);let quality=.65,dataUrl=canvas.toDataURL('image/jpeg',quality);while(dataUrl.length>42000&&quality>.15){quality-=.1;dataUrl=canvas.toDataURL('image/jpeg',quality);}if(dataUrl.length>44000){screenStatus='Region image was too large. Region geometry is saved.';return null;}return{dataUrl,width:canvas.width,height:canvas.height,mimeType:'image/jpeg',capturedAtMs:Math.round(performance.now()-record.start)};}catch{screenStatus='Screenshot unavailable. Region geometry is saved.';return null;}}
  function pointerDown(e){if(!window.__AGENTATION_KIT_VOICE_POINT__||chromeEvent(e)||e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();const target=e.composedPath().find(n=>n instanceof Element);drag={x:e.clientX,y:e.clientY,target,pointerId:e.pointerId,scrollX,scrollY};window.__AGENTATION_KIT_POINTER_DRAG__=true;}
  function pointerMove(e){if(!drag)return;e.preventDefault();e.stopImmediatePropagation();const r={x:Math.min(drag.x,e.clientX),y:Math.min(drag.y,e.clientY),width:Math.abs(e.clientX-drag.x),height:Math.abs(e.clientY-drag.y)};region.hidden=r.width<8&&r.height<8;Object.assign(region.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});}
  // A region is named by what it holds when that is clear, else by its size.
  function regionLabel(rect,c){const first=c?.elements?.find(e=>e.name);const size=`${Math.round(rect.width)} × ${Math.round(rect.height)}`;return first?`Region: ${first.name.slice(0,60)}${c.elements.length>1||c.more?` +${c.elements.length-1+(c.more||0)}`:''}`:`Region ${size}`;}
  function pointerUp(e){if(!drag)return;e.preventDefault();e.stopImmediatePropagation();const d=drag;drag=null;window.__AGENTATION_KIT_POINTER_DRAG__=false;region.hidden=true;const rect={x:Math.min(d.x,e.clientX),y:Math.min(d.y,e.clientY),width:Math.abs(e.clientX-d.x),height:Math.abs(e.clientY-d.y),scrollX:d.scrollX,scrollY:d.scrollY};if(rect.width>8&&rect.height>8){let context;try{context=regionContext(rect);}catch{context=undefined;}addTarget({kind:'region',label:regionLabel(rect,context),rect,page:location.href,viewport:viewport(),image:captureRegion(rect),context});}else{const n=d.target;if(!n?.isConnected)return;const r=n.getBoundingClientRect();let context;try{context=elementContext(n);}catch{context=undefined;}addTarget({kind:'element',label:elementLabel(n),context,selector:selectorFor(n),rect:{x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.max(1,r.width),height:Math.max(1,r.height),scrollX,scrollY},page:location.href,viewport:viewport()});}}
  window.addEventListener('pointerdown',pointerDown,true);window.addEventListener('pointermove',pointerMove,true);window.addEventListener('pointerup',pointerUp,true);window.addEventListener('pointercancel',()=>{drag=null;window.__AGENTATION_KIT_POINTER_DRAG__=false;region.hidden=true;},true);window.addEventListener('click',e=>{if(window.__AGENTATION_KIT_VOICE_POINT__&&!chromeEvent(e)){e.preventDefault();e.stopImmediatePropagation();}},true);
  window.addEventListener('keydown',e=>{if(!record||record.kind!=='session'||e.key!=='Escape'||e.composedPath().some(n=>n instanceof Element&&n.matches('input,textarea,[contenteditable=true],[role=dialog]')))return;e.preventDefault();e.stopImmediatePropagation();if(drag){drag=null;window.__AGENTATION_KIT_POINTER_DRAG__=false;region.hidden=true;}else general();},true);
  // Talk is never a trap (UX review finding 3). With the panel open and nothing
  // recording, Esc, V again, another mode's key (N, T, D) and the other mode
  // buttons all close it. Window capture runs before the bar's own document
  // listener, so the other mode still switches once the panel is out of the
  // way; V and the Talk button stop here, or the bar would open it again.
  // A recording keeps its Esc above (back to General) and its Stop button.
  // Closing the panel takes its focused control with it: focus goes to the
  // mode button (Comment again, or the phone's one mode button), never the
  // page (UX review 5, #10).
  function hide(){wantStart=false;if(!slot.wants)return;const had=panel.contains(ui.root.activeElement)||focusLost();slot.want(false);if(had&&focusLost())focusMode();}
  function close(){if(record)return;if(state==='requesting')stop();hide();}
  function toComment(){close();window.__AGENTATION_KIT_TWEAK__?.toggle(false);const edit=window.__AGENTATION_KIT_EDIT__;if(edit?.active)edit.toggle(false);}
  const panelUp=()=>!record&&slot.visible&&!panel.hidden;
  const typingIn=e=>e.composedPath().some(n=>n instanceof Element&&n.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'));
  const barOpen=()=>!!document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]');
  window.addEventListener('keydown',e=>{if(record||!slot.wants||e.metaKey||e.ctrlKey||e.altKey||e.repeat)return;
    if(e.key==='Escape'){if(!panelUp())return;e.preventDefault();e.stopImmediatePropagation();
      // A first Esc in the transcript editor only leaves the text.
      const field=e.composedPath().find(n=>n instanceof Element&&n.matches('textarea,input,select'));if(field&&state==='editor'&&panel.contains(field)){const h=panel.querySelector('.hd strong');if(h)h.focus({preventScroll:true});else field.blur();return;}close();return;}
    if(e.shiftKey||typingIn(e)||!barOpen())return;const k=e.key.toUpperCase();
    if(k==='V'&&panelUp()){e.preventDefault();e.stopImmediatePropagation();close();return;}
    if(k==='N'||(k==='T'&&window.__AGENTATION_KIT_EDIT__)||(k==='D'&&window.__AGENTATION_KIT_TWEAK__))close();},true);
  window.addEventListener('click',e=>{if(record||!slot.wants)return;const path=e.composedPath();
    const modeButton=path.find(n=>n instanceof Element&&n.matches('[data-mode]'));
    if(modeButton){if(modeButton.dataset.mode==='voice'){if(!panelUp())return;e.preventDefault();e.stopImmediatePropagation();close();return;}close();return;}
    // The phone's mode sheet: any choice but Talk leaves Talk.
    const item=path.find(n=>n instanceof Element&&n.matches('[role=menuitemradio]'));
    if(item&&path.some(n=>n instanceof Element&&n.matches('[role=menu][aria-label="Feedback mode"]'))&&!/^Talk\b/.test((item.querySelector('.two span')||item).textContent.trim()))close();},true);
  document.addEventListener('agentation-kit:route',()=>{if(record){if(record.kind==='session')general();stop('Page changed. Recording stopped safely; review the captured page context.');}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&record)stop('Recording stopped because this tab became hidden.');});
  window.addEventListener('pagehide',()=>{persist();if(record)stop('Page navigation stopped recording.');});
  window.addEventListener('beforeunload',e=>{if(record||state==='transcribing'){persist();e.preventDefault();e.returnValue='';}});
  // Existing comment/reply surfaces live both in Agentation's DOM and our open shadow roots.
  // Never decorate settings or transcript editors. A MutationObserver follows lazy panels.
  // `present` is which fields each root showed at its last pass, by a stable
  // key: a field that is new since then is a form that just opened (reveal
  // it), while one a layer re-rendered in place keeps its key (leave the
  // scroll alone, the reviewer may have scrolled away on purpose).
  const decorated=new WeakSet(),observed=new WeakSet(),present=new WeakMap();
  const fieldKey=a=>a.dataset.focus||a.id||a.getAttribute('aria-label')||a.placeholder||'';
  function decorate(root){if(!root||root===ui.root)return;if(!observed.has(root)){observed.add(root);new MutationObserver(()=>queueMicrotask(()=>decorate(root))).observe(root,{childList:true,subtree:true});}
    const was=present.get(root)||new Set(),now=new Set();present.set(root,now);
    for(const area of root.querySelectorAll('textarea')){if(!area.closest('[data-annotation-popup]'))now.add(fieldKey(area));if(decorated.has(area)||area.closest('[data-voice-editor]')||/webhook|url/i.test(area.placeholder||'')||area.getAttribute('aria-label')==='Webhook URL')continue;const host=root.host;const isFeedback=host?.matches('.sk-edit-ui')||area.closest('[data-agentation-root],#agentation-root,[data-feedback-toolbar]');if(!isFeedback)continue;decorated.add(area);let caret=null;const b=button('Dictate note',()=>{const at=caret;caret=null;dictate(area,at);},'mic');b.onpointerdown=e=>{e.preventDefault();caret={before:area.value,start:area.selectionStart,end:area.selectionEnd};};b.dataset.voiceDictate='';markChrome(b);
      // The toolbar's comment popup does not set a text colour on the element
      // the button lands in, so "inherit" picked up the PAGE's body colour:
      // near-black on the dark popup, an invisible 44px gap (UX review finding 4).
      // There it takes the popup's own text colour for the theme and sits beside
      // the textarea (popup-style.js narrows the field), as the Check card does.
      const popup=area.closest('[data-annotation-popup]');// The popup's own theme class is the authority: it is what paints it.
      const light=()=>/light___/.test(popup.className);const ink=()=>popup?(light()?'rgba(0,0,0,.6)':'rgba(255,255,255,.72)'):'inherit';
      b.style.cssText='width:44px;height:44px;min-width:44px;min-height:44px;flex:none;border:0;border-radius:6px;background:transparent;color:'+ink()+';opacity:'+(popup?'1':'.72')+';display:grid;place-items:center;cursor:pointer;margin:0;padding:0';
      b.onmouseenter=()=>{b.style.opacity='1';b.style.background='rgba(127,127,127,.16)';if(popup)b.style.color=light()?'rgba(0,0,0,.85)':'rgba(255,255,255,.95)';};b.onmouseleave=()=>{b.style.opacity=popup?'1':'.72';b.style.background='transparent';b.style.color=ink();};
      // One layout everywhere (UX review 2, N10): the field and its mic in a
      // row, as in the Check card. A form that already has its row (.field in
      // check.js and replies.js) keeps it; any other field is wrapped in one
      // here, so the inbox Answer and From the agent's forms match without a
      // second 44px row under the field.
      if(popup||area.parentElement?.classList.contains('field'))area.after(b);else fieldRow(area,b);
      if(!popup){area.addEventListener('focus',()=>requestAnimationFrame(()=>revealForm(area)));if(!was.has(fieldKey(area))||area.getRootNode().activeElement===area)requestAnimationFrame(()=>revealForm(area));}
      if(popup){area.dataset.voiceDictated='';const fit=()=>{if(!b.isConnected||!area.isConnected)return;b.style.top=area.offsetTop+Math.max(0,(Math.min(area.offsetHeight,88)-44)/2)+'px';b.style.left=area.offsetLeft+area.offsetWidth+6+'px';};fit();if(typeof ResizeObserver==='function'){const ro=new ResizeObserver(fit);ro.observe(area);ro.observe(popup);}requestAnimationFrame(fit);}}
    for(const node of root.querySelectorAll('*'))if(node.shadowRoot&&node!==ui.host)decorate(node.shadowRoot);
  }
  // Wrap a field and its mic in a row. Moving a focused field blurs it, so
  // focus and the caret come back with it.
  function fieldRow(area,b){const r=area.getRootNode(),had=r.activeElement===area,s=area.selectionStart,e=area.selectionEnd;const row=document.createElement('div');row.dataset.voiceField='';row.style.cssText='display:flex;gap:6px;align-items:flex-start;min-width:0';area.before(row);area.style.flex='1';area.style.minWidth='0';row.append(area,b);if(had){area.focus({preventScroll:true});try{area.setSelectionRange(s,e);}catch{}}}
  // An opened form shows whole inside its sheet: the field and the row of
  // buttons under it (Send answer, Not an issue). At 390 the inbox Answer form
  // opened with Send answer below the sheet's bottom edge. Only the sheet's own
  // scroller moves, never the page.
  function scrollerOf(n){for(let p=n.parentNode;p&&p!==document.body&&p!==document.documentElement;p=p.parentNode||p.host){if(!(p instanceof Element))continue;const o=getComputedStyle(p).overflowY;if((o==='auto'||o==='scroll')&&p.scrollHeight>p.clientHeight+1)return p;}return null;}
  function revealForm(area){if(!area.isConnected)return;const box=area.closest('[data-voice-field],.field')||area,next=box.nextElementSibling;const sc=scrollerOf(box);if(!sc)return;const v=sc.getBoundingClientRect(),a=box.getBoundingClientRect(),z=next&&next.getClientRects().length?next.getBoundingClientRect():a;const top=Math.min(a.top,z.top),bottom=Math.max(a.bottom,z.bottom),pad=8;let d=0;if(bottom>v.bottom-pad)d=bottom-(v.bottom-pad);if(top-d<v.top+pad)d=top-(v.top+pad);if(Math.abs(d)>=1)sc.scrollTop+=d;}
  async function dictate(area,caret=null){notice.hidden=true;if(record||abort||state==='requesting'||state==='transcribing'){notify('Finish the current recording first.');return;}if(dictation){showDictationResult();return;}const before=caret?.before??area.value,start=caret?.start??area.selectionStart,end=caret?.end??area.selectionEnd;let c;try{c=await capabilities({prepare:true});}catch(e){notify(e.message);return;}state='dictation-disclosure';panel.replaceChildren();const hd=el('div','hd');hd.append(el('strong','','Dictate note'),button('Close',()=>slot.want(false),'close'));const body=el('div','body');body.append(el('p','',`Transcription: ${warming(c)?'Getting ready':c.local?.state==='unavailable'?'Not available':providerName(c)}`),el('p','disclosure',(c.local&&c.local.state!=='ready'&&c.local.message)||c.disclosure||'Your audio is sent to the configured speech provider after you stop recording.'),el('p','hint','Dictation inserts text at the saved caret. It does not send your note.'));const foot=el('div','foot');const instead=button('Talk and point instead',()=>{slot.want(false);open();});instead.className='quiet';instead.title='Record longer feedback and point at the page while you talk';foot.append(instead,button('Cancel',()=>slot.want(false)),button('Start dictation',()=>startCapture('dictation',{area,before,start,end})));foot.lastChild.className='primary';foot.lastChild.disabled=!c.enabled;panel.append(hd,body,foot);slot.want(true,{bump:true});warmUp(()=>{if(state==='dictation-disclosure'&&!panel.hidden)dictate(area,{before,start,end});});}
  decorate(document);setInterval(()=>decorate(document),1500);
  const api={open,close,stop,discard,setSession(id){sessionId=id;},get state(){return state;},get draft(){return session;},get recording(){return !!record;},get mode(){return mode;},get hasAudio(){return !!(sessionAudios.get(session?.id)?.audio||dictation?.capture?.audio);},get savedPassageIds(){return [...saved];}};
  return api;
}

// The hosted speech bridge accepts PCM WAV so it can validate the actual audio
// duration before charging a budget. Decode locally, mix to mono and resample to
// 16 kHz; no audio is written to localStorage or annotation metadata.
async function wavAudio(source) {
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)throw new Error('This browser cannot prepare audio for the configured speech provider.');
  const ctx=new Audio();
  try {
    const decoded=await ctx.decodeAudioData(await source.arrayBuffer());
    const length=Math.min(Math.ceil(decoded.duration*16000),300000*16),samples=new Float32Array(length);
    const channels=Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i));
    for(let i=0;i<length;i++){const position=i*decoded.sampleRate/16000,index=Math.floor(position),fraction=position-index;let value=0;for(const ch of channels)value+=(ch[index]||0)*(1-fraction)+(ch[index+1]||0)*fraction;samples[i]=value/channels.length;}
    const bytes=new ArrayBuffer(44+length*2),view=new DataView(bytes);const str=(offset,s)=>{for(let i=0;i<s.length;i++)view.setUint8(offset+i,s.charCodeAt(i));};
    str(0,'RIFF');view.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,length*2,true);
    for(let i=0;i<length;i++){const value=Math.max(-1,Math.min(1,samples[i]));view.setInt16(44+i*2,value<0?value*32768:value*32767,true);}
    return new Blob([bytes],{type:'audio/wav'});
  } finally { await ctx.close(); }
}
