(()=>{var ow=Object.create;var z0=Object.defineProperty;var rw=Object.getOwnPropertyDescriptor;var iw=Object.getOwnPropertyNames;var sw=Object.getPrototypeOf,aw=Object.prototype.hasOwnProperty;var oi=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var lw=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of iw(t))!aw.call(e,r)&&r!==n&&z0(e,r,{get:()=>t[r],enumerable:!(o=rw(t,r))||o.enumerable});return e};var vn=(e,t,n)=>(n=e!=null?ow(sw(e)):{},lw(t||!e||!e.__esModule?z0(n,"default",{value:e,enumerable:!0}):n,e));var Rg=oi(Xt=>{"use strict";var fl=Symbol.for("react.element"),iv=Symbol.for("react.portal"),sv=Symbol.for("react.fragment"),av=Symbol.for("react.strict_mode"),lv=Symbol.for("react.profiler"),cv=Symbol.for("react.provider"),dv=Symbol.for("react.context"),uv=Symbol.for("react.forward_ref"),pv=Symbol.for("react.suspense"),fv=Symbol.for("react.memo"),hv=Symbol.for("react.lazy"),kg=Symbol.iterator;function mv(e){return e===null||typeof e!="object"?null:(e=kg&&e[kg]||e["@@iterator"],typeof e=="function"?e:null)}var Eg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Tg=Object.assign,Mg={};function ra(e,t,n){this.props=e,this.context=t,this.refs=Mg,this.updater=n||Eg}ra.prototype.isReactComponent={};ra.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};ra.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ng(){}Ng.prototype=ra.prototype;function Xp(e,t,n){this.props=e,this.context=t,this.refs=Mg,this.updater=n||Eg}var Qp=Xp.prototype=new Ng;Qp.constructor=Xp;Tg(Qp,ra.prototype);Qp.isPureReactComponent=!0;var Sg=Array.isArray,Ig=Object.prototype.hasOwnProperty,Jp={current:null},Ag={key:!0,ref:!0,__self:!0,__source:!0};function Lg(e,t,n){var o,r={},i=null,s=null;if(t!=null)for(o in t.ref!==void 0&&(s=t.ref),t.key!==void 0&&(i=""+t.key),t)Ig.call(t,o)&&!Ag.hasOwnProperty(o)&&(r[o]=t[o]);var a=arguments.length-2;if(a===1)r.children=n;else if(1<a){for(var l=Array(a),d=0;d<a;d++)l[d]=arguments[d+2];r.children=l}if(e&&e.defaultProps)for(o in a=e.defaultProps,a)r[o]===void 0&&(r[o]=a[o]);return{$$typeof:fl,type:e,key:i,ref:s,props:r,_owner:Jp.current}}function gv(e,t){return{$$typeof:fl,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Zp(e){return typeof e=="object"&&e!==null&&e.$$typeof===fl}function _v(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Cg=/\/+/g;function Gp(e,t){return typeof e=="object"&&e!==null&&e.key!=null?_v(""+e.key):t.toString(36)}function nd(e,t,n,o,r){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(i){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case fl:case iv:s=!0}}if(s)return s=e,r=r(s),e=o===""?"."+Gp(s,0):o,Sg(r)?(n="",e!=null&&(n=e.replace(Cg,"$&/")+"/"),nd(r,t,n,"",function(d){return d})):r!=null&&(Zp(r)&&(r=gv(r,n+(!r.key||s&&s.key===r.key?"":(""+r.key).replace(Cg,"$&/")+"/")+e)),t.push(r)),1;if(s=0,o=o===""?".":o+":",Sg(e))for(var a=0;a<e.length;a++){i=e[a];var l=o+Gp(i,a);s+=nd(i,t,n,l,r)}else if(l=mv(e),typeof l=="function")for(e=l.call(e),a=0;!(i=e.next()).done;)i=i.value,l=o+Gp(i,a++),s+=nd(i,t,n,l,r);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return s}function td(e,t,n){if(e==null)return e;var o=[],r=0;return nd(e,o,"","",function(i){return t.call(n,i,r++)}),o}function yv(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var Io={current:null},od={transition:null},xv={ReactCurrentDispatcher:Io,ReactCurrentBatchConfig:od,ReactCurrentOwner:Jp};function $g(){throw Error("act(...) is not supported in production builds of React.")}Xt.Children={map:td,forEach:function(e,t,n){td(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return td(e,function(){t++}),t},toArray:function(e){return td(e,function(t){return t})||[]},only:function(e){if(!Zp(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Xt.Component=ra;Xt.Fragment=sv;Xt.Profiler=lv;Xt.PureComponent=Xp;Xt.StrictMode=av;Xt.Suspense=pv;Xt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=xv;Xt.act=$g;Xt.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var o=Tg({},e.props),r=e.key,i=e.ref,s=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,s=Jp.current),t.key!==void 0&&(r=""+t.key),e.type&&e.type.defaultProps)var a=e.type.defaultProps;for(l in t)Ig.call(t,l)&&!Ag.hasOwnProperty(l)&&(o[l]=t[l]===void 0&&a!==void 0?a[l]:t[l])}var l=arguments.length-2;if(l===1)o.children=n;else if(1<l){a=Array(l);for(var d=0;d<l;d++)a[d]=arguments[d+2];o.children=a}return{$$typeof:fl,type:e.type,key:r,ref:i,props:o,_owner:s}};Xt.createContext=function(e){return e={$$typeof:dv,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:cv,_context:e},e.Consumer=e};Xt.createElement=Lg;Xt.createFactory=function(e){var t=Lg.bind(null,e);return t.type=e,t};Xt.createRef=function(){return{current:null}};Xt.forwardRef=function(e){return{$$typeof:uv,render:e}};Xt.isValidElement=Zp;Xt.lazy=function(e){return{$$typeof:hv,_payload:{_status:-1,_result:e},_init:yv}};Xt.memo=function(e,t){return{$$typeof:fv,type:e,compare:t===void 0?null:t}};Xt.startTransition=function(e){var t=od.transition;od.transition={};try{e()}finally{od.transition=t}};Xt.unstable_act=$g;Xt.useCallback=function(e,t){return Io.current.useCallback(e,t)};Xt.useContext=function(e){return Io.current.useContext(e)};Xt.useDebugValue=function(){};Xt.useDeferredValue=function(e){return Io.current.useDeferredValue(e)};Xt.useEffect=function(e,t){return Io.current.useEffect(e,t)};Xt.useId=function(){return Io.current.useId()};Xt.useImperativeHandle=function(e,t,n){return Io.current.useImperativeHandle(e,t,n)};Xt.useInsertionEffect=function(e,t){return Io.current.useInsertionEffect(e,t)};Xt.useLayoutEffect=function(e,t){return Io.current.useLayoutEffect(e,t)};Xt.useMemo=function(e,t){return Io.current.useMemo(e,t)};Xt.useReducer=function(e,t,n){return Io.current.useReducer(e,t,n)};Xt.useRef=function(e){return Io.current.useRef(e)};Xt.useState=function(e){return Io.current.useState(e)};Xt.useSyncExternalStore=function(e,t,n){return Io.current.useSyncExternalStore(e,t,n)};Xt.useTransition=function(){return Io.current.useTransition()};Xt.version="18.3.1"});var rr=oi((W9,Og)=>{"use strict";Og.exports=Rg()});var qg=oi(kn=>{"use strict";function of(e,t){var n=e.length;e.push(t);e:for(;0<n;){var o=n-1>>>1,r=e[o];if(0<rd(r,t))e[o]=t,e[n]=r,n=o;else break e}}function Sr(e){return e.length===0?null:e[0]}function sd(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var o=0,r=e.length,i=r>>>1;o<i;){var s=2*(o+1)-1,a=e[s],l=s+1,d=e[l];if(0>rd(a,n))l<r&&0>rd(d,a)?(e[o]=d,e[l]=n,o=l):(e[o]=a,e[s]=n,o=s);else if(l<r&&0>rd(d,n))e[o]=d,e[l]=n,o=l;else break e}}return t}function rd(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}typeof performance=="object"&&typeof performance.now=="function"?(Pg=performance,kn.unstable_now=function(){return Pg.now()}):(ef=Date,Dg=ef.now(),kn.unstable_now=function(){return ef.now()-Dg});var Pg,ef,Dg,Hr=[],Ti=[],wv=1,ir=null,wo=3,ad=!1,hs=!1,ml=!1,Bg=typeof setTimeout=="function"?setTimeout:null,Wg=typeof clearTimeout=="function"?clearTimeout:null,zg=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function rf(e){for(var t=Sr(Ti);t!==null;){if(t.callback===null)sd(Ti);else if(t.startTime<=e)sd(Ti),t.sortIndex=t.expirationTime,of(Hr,t);else break;t=Sr(Ti)}}function sf(e){if(ml=!1,rf(e),!hs)if(Sr(Hr)!==null)hs=!0,lf(af);else{var t=Sr(Ti);t!==null&&cf(sf,t.startTime-e)}}function af(e,t){hs=!1,ml&&(ml=!1,Wg(gl),gl=-1),ad=!0;var n=wo;try{for(rf(t),ir=Sr(Hr);ir!==null&&(!(ir.expirationTime>t)||e&&!Ug());){var o=ir.callback;if(typeof o=="function"){ir.callback=null,wo=ir.priorityLevel;var r=o(ir.expirationTime<=t);t=kn.unstable_now(),typeof r=="function"?ir.callback=r:ir===Sr(Hr)&&sd(Hr),rf(t)}else sd(Hr);ir=Sr(Hr)}if(ir!==null)var i=!0;else{var s=Sr(Ti);s!==null&&cf(sf,s.startTime-t),i=!1}return i}finally{ir=null,wo=n,ad=!1}}var ld=!1,id=null,gl=-1,Hg=5,jg=-1;function Ug(){return!(kn.unstable_now()-jg<Hg)}function tf(){if(id!==null){var e=kn.unstable_now();jg=e;var t=!0;try{t=id(!0,e)}finally{t?hl():(ld=!1,id=null)}}else ld=!1}var hl;typeof zg=="function"?hl=function(){zg(tf)}:typeof MessageChannel<"u"?(nf=new MessageChannel,Fg=nf.port2,nf.port1.onmessage=tf,hl=function(){Fg.postMessage(null)}):hl=function(){Bg(tf,0)};var nf,Fg;function lf(e){id=e,ld||(ld=!0,hl())}function cf(e,t){gl=Bg(function(){e(kn.unstable_now())},t)}kn.unstable_IdlePriority=5;kn.unstable_ImmediatePriority=1;kn.unstable_LowPriority=4;kn.unstable_NormalPriority=3;kn.unstable_Profiling=null;kn.unstable_UserBlockingPriority=2;kn.unstable_cancelCallback=function(e){e.callback=null};kn.unstable_continueExecution=function(){hs||ad||(hs=!0,lf(af))};kn.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Hg=0<e?Math.floor(1e3/e):5};kn.unstable_getCurrentPriorityLevel=function(){return wo};kn.unstable_getFirstCallbackNode=function(){return Sr(Hr)};kn.unstable_next=function(e){switch(wo){case 1:case 2:case 3:var t=3;break;default:t=wo}var n=wo;wo=t;try{return e()}finally{wo=n}};kn.unstable_pauseExecution=function(){};kn.unstable_requestPaint=function(){};kn.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=wo;wo=e;try{return t()}finally{wo=n}};kn.unstable_scheduleCallback=function(e,t,n){var o=kn.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?o+n:o):n=o,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,e={id:wv++,callback:t,priorityLevel:e,startTime:n,expirationTime:r,sortIndex:-1},n>o?(e.sortIndex=n,of(Ti,e),Sr(Hr)===null&&e===Sr(Ti)&&(ml?(Wg(gl),gl=-1):ml=!0,cf(sf,n-o))):(e.sortIndex=r,of(Hr,e),hs||ad||(hs=!0,lf(af))),e};kn.unstable_shouldYield=Ug;kn.unstable_wrapCallback=function(e){var t=wo;return function(){var n=wo;wo=t;try{return e.apply(this,arguments)}finally{wo=n}}}});var Yg=oi((j9,Kg)=>{"use strict";Kg.exports=qg()});var Qy=oi(Jo=>{"use strict";var vv=rr(),Xo=Yg();function Be(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var e_=new Set,zl={};function Ts(e,t){Ca(e,t),Ca(e+"Capture",t)}function Ca(e,t){for(zl[e]=t,e=0;e<t.length;e++)e_.add(t[e])}var pi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Lf=Object.prototype.hasOwnProperty,bv=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Vg={},Gg={};function kv(e){return Lf.call(Gg,e)?!0:Lf.call(Vg,e)?!1:bv.test(e)?Gg[e]=!0:(Vg[e]=!0,!1)}function Sv(e,t,n,o){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return o?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function Cv(e,t,n,o){if(t===null||typeof t>"u"||Sv(e,t,n,o))return!0;if(o)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function $o(e,t,n,o,r,i,s){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=o,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=s}var xo={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){xo[e]=new $o(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];xo[t]=new $o(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){xo[e]=new $o(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){xo[e]=new $o(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){xo[e]=new $o(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){xo[e]=new $o(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){xo[e]=new $o(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){xo[e]=new $o(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){xo[e]=new $o(e,5,!1,e.toLowerCase(),null,!1,!1)});var Sh=/[\-:]([a-z])/g;function Ch(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Sh,Ch);xo[t]=new $o(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Sh,Ch);xo[t]=new $o(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Sh,Ch);xo[t]=new $o(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){xo[e]=new $o(e,1,!1,e.toLowerCase(),null,!1,!1)});xo.xlinkHref=new $o("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){xo[e]=new $o(e,1,!1,e.toLowerCase(),null,!0,!0)});function Eh(e,t,n,o){var r=xo.hasOwnProperty(t)?xo[t]:null;(r!==null?r.type!==0:o||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(Cv(t,n,r,o)&&(n=null),o||r===null?kv(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):r.mustUseProperty?e[r.propertyName]=n===null?r.type===3?!1:"":n:(t=r.attributeName,o=r.attributeNamespace,n===null?e.removeAttribute(t):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,o?e.setAttributeNS(o,t,n):e.setAttribute(t,n))))}var gi=vv.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,cd=Symbol.for("react.element"),aa=Symbol.for("react.portal"),la=Symbol.for("react.fragment"),Th=Symbol.for("react.strict_mode"),$f=Symbol.for("react.profiler"),t_=Symbol.for("react.provider"),n_=Symbol.for("react.context"),Mh=Symbol.for("react.forward_ref"),Rf=Symbol.for("react.suspense"),Of=Symbol.for("react.suspense_list"),Nh=Symbol.for("react.memo"),Ni=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var o_=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var Xg=Symbol.iterator;function _l(e){return e===null||typeof e!="object"?null:(e=Xg&&e[Xg]||e["@@iterator"],typeof e=="function"?e:null)}var Dn=Object.assign,df;function Cl(e){if(df===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);df=t&&t[1]||""}return`
`+df+e}var uf=!1;function pf(e,t){if(!e||uf)return"";uf=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(d){var o=d}Reflect.construct(e,[],t)}else{try{t.call()}catch(d){o=d}e.call(t.prototype)}else{try{throw Error()}catch(d){o=d}e()}}catch(d){if(d&&o&&typeof d.stack=="string"){for(var r=d.stack.split(`
`),i=o.stack.split(`
`),s=r.length-1,a=i.length-1;1<=s&&0<=a&&r[s]!==i[a];)a--;for(;1<=s&&0<=a;s--,a--)if(r[s]!==i[a]){if(s!==1||a!==1)do if(s--,a--,0>a||r[s]!==i[a]){var l=`
`+r[s].replace(" at new "," at ");return e.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",e.displayName)),l}while(1<=s&&0<=a);break}}}finally{uf=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Cl(e):""}function Ev(e){switch(e.tag){case 5:return Cl(e.type);case 16:return Cl("Lazy");case 13:return Cl("Suspense");case 19:return Cl("SuspenseList");case 0:case 2:case 15:return e=pf(e.type,!1),e;case 11:return e=pf(e.type.render,!1),e;case 1:return e=pf(e.type,!0),e;default:return""}}function Pf(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case la:return"Fragment";case aa:return"Portal";case $f:return"Profiler";case Th:return"StrictMode";case Rf:return"Suspense";case Of:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case n_:return(e.displayName||"Context")+".Consumer";case t_:return(e._context.displayName||"Context")+".Provider";case Mh:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Nh:return t=e.displayName||null,t!==null?t:Pf(e.type)||"Memo";case Ni:t=e._payload,e=e._init;try{return Pf(e(t))}catch{}}return null}function Tv(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Pf(t);case 8:return t===Th?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function ji(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function r_(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Mv(e){var t=r_(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),o=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(s){o=""+s,i.call(this,s)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return o},setValue:function(s){o=""+s},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function dd(e){e._valueTracker||(e._valueTracker=Mv(e))}function i_(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),o="";return e&&(o=r_(e)?e.checked?"true":"false":e.value),e=o,e!==n?(t.setValue(e),!0):!1}function zd(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function Df(e,t){var n=t.checked;return Dn({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function Qg(e,t){var n=t.defaultValue==null?"":t.defaultValue,o=t.checked!=null?t.checked:t.defaultChecked;n=ji(t.value!=null?t.value:n),e._wrapperState={initialChecked:o,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function s_(e,t){t=t.checked,t!=null&&Eh(e,"checked",t,!1)}function zf(e,t){s_(e,t);var n=ji(t.value),o=t.type;if(n!=null)o==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(o==="submit"||o==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Ff(e,t.type,n):t.hasOwnProperty("defaultValue")&&Ff(e,t.type,ji(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Jg(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var o=t.type;if(!(o!=="submit"&&o!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Ff(e,t,n){(t!=="number"||zd(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var El=Array.isArray;function xa(e,t,n,o){if(e=e.options,t){t={};for(var r=0;r<n.length;r++)t["$"+n[r]]=!0;for(n=0;n<e.length;n++)r=t.hasOwnProperty("$"+e[n].value),e[n].selected!==r&&(e[n].selected=r),r&&o&&(e[n].defaultSelected=!0)}else{for(n=""+ji(n),t=null,r=0;r<e.length;r++){if(e[r].value===n){e[r].selected=!0,o&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Bf(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(Be(91));return Dn({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Zg(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(Be(92));if(El(n)){if(1<n.length)throw Error(Be(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:ji(n)}}function a_(e,t){var n=ji(t.value),o=ji(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),o!=null&&(e.defaultValue=""+o)}function e1(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function l_(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Wf(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?l_(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var ud,c_=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,o,r){MSApp.execUnsafeLocalFunction(function(){return e(t,n,o,r)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(ud=ud||document.createElement("div"),ud.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=ud.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Fl(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Nl={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Nv=["Webkit","ms","Moz","O"];Object.keys(Nl).forEach(function(e){Nv.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Nl[t]=Nl[e]})});function d_(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Nl.hasOwnProperty(e)&&Nl[e]?(""+t).trim():t+"px"}function u_(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var o=n.indexOf("--")===0,r=d_(n,t[n],o);n==="float"&&(n="cssFloat"),o?e.setProperty(n,r):e[n]=r}}var Iv=Dn({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Hf(e,t){if(t){if(Iv[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(Be(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(Be(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(Be(61))}if(t.style!=null&&typeof t.style!="object")throw Error(Be(62))}}function jf(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Uf=null;function Ih(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var qf=null,wa=null,va=null;function t1(e){if(e=oc(e)){if(typeof qf!="function")throw Error(Be(280));var t=e.stateNode;t&&(t=pu(t),qf(e.stateNode,e.type,t))}}function p_(e){wa?va?va.push(e):va=[e]:wa=e}function f_(){if(wa){var e=wa,t=va;if(va=wa=null,t1(e),t)for(e=0;e<t.length;e++)t1(t[e])}}function h_(e,t){return e(t)}function m_(){}var ff=!1;function g_(e,t,n){if(ff)return e(t,n);ff=!0;try{return h_(e,t,n)}finally{ff=!1,(wa!==null||va!==null)&&(m_(),f_())}}function Bl(e,t){var n=e.stateNode;if(n===null)return null;var o=pu(n);if(o===null)return null;n=o[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(Be(231,t,typeof n));return n}var Kf=!1;if(pi)try{ia={},Object.defineProperty(ia,"passive",{get:function(){Kf=!0}}),window.addEventListener("test",ia,ia),window.removeEventListener("test",ia,ia)}catch{Kf=!1}var ia;function Av(e,t,n,o,r,i,s,a,l){var d=Array.prototype.slice.call(arguments,3);try{t.apply(n,d)}catch(c){this.onError(c)}}var Il=!1,Fd=null,Bd=!1,Yf=null,Lv={onError:function(e){Il=!0,Fd=e}};function $v(e,t,n,o,r,i,s,a,l){Il=!1,Fd=null,Av.apply(Lv,arguments)}function Rv(e,t,n,o,r,i,s,a,l){if($v.apply(this,arguments),Il){if(Il){var d=Fd;Il=!1,Fd=null}else throw Error(Be(198));Bd||(Bd=!0,Yf=d)}}function Ms(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function __(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function n1(e){if(Ms(e)!==e)throw Error(Be(188))}function Ov(e){var t=e.alternate;if(!t){if(t=Ms(e),t===null)throw Error(Be(188));return t!==e?null:e}for(var n=e,o=t;;){var r=n.return;if(r===null)break;var i=r.alternate;if(i===null){if(o=r.return,o!==null){n=o;continue}break}if(r.child===i.child){for(i=r.child;i;){if(i===n)return n1(r),e;if(i===o)return n1(r),t;i=i.sibling}throw Error(Be(188))}if(n.return!==o.return)n=r,o=i;else{for(var s=!1,a=r.child;a;){if(a===n){s=!0,n=r,o=i;break}if(a===o){s=!0,o=r,n=i;break}a=a.sibling}if(!s){for(a=i.child;a;){if(a===n){s=!0,n=i,o=r;break}if(a===o){s=!0,o=i,n=r;break}a=a.sibling}if(!s)throw Error(Be(189))}}if(n.alternate!==o)throw Error(Be(190))}if(n.tag!==3)throw Error(Be(188));return n.stateNode.current===n?e:t}function y_(e){return e=Ov(e),e!==null?x_(e):null}function x_(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=x_(e);if(t!==null)return t;e=e.sibling}return null}var w_=Xo.unstable_scheduleCallback,o1=Xo.unstable_cancelCallback,Pv=Xo.unstable_shouldYield,Dv=Xo.unstable_requestPaint,Jn=Xo.unstable_now,zv=Xo.unstable_getCurrentPriorityLevel,Ah=Xo.unstable_ImmediatePriority,v_=Xo.unstable_UserBlockingPriority,Wd=Xo.unstable_NormalPriority,Fv=Xo.unstable_LowPriority,b_=Xo.unstable_IdlePriority,lu=null,Kr=null;function Bv(e){if(Kr&&typeof Kr.onCommitFiberRoot=="function")try{Kr.onCommitFiberRoot(lu,e,void 0,(e.current.flags&128)===128)}catch{}}var Nr=Math.clz32?Math.clz32:jv,Wv=Math.log,Hv=Math.LN2;function jv(e){return e>>>=0,e===0?32:31-(Wv(e)/Hv|0)|0}var pd=64,fd=4194304;function Tl(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Hd(e,t){var n=e.pendingLanes;if(n===0)return 0;var o=0,r=e.suspendedLanes,i=e.pingedLanes,s=n&268435455;if(s!==0){var a=s&~r;a!==0?o=Tl(a):(i&=s,i!==0&&(o=Tl(i)))}else s=n&~r,s!==0?o=Tl(s):i!==0&&(o=Tl(i));if(o===0)return 0;if(t!==0&&t!==o&&!(t&r)&&(r=o&-o,i=t&-t,r>=i||r===16&&(i&4194240)!==0))return t;if(o&4&&(o|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=o;0<t;)n=31-Nr(t),r=1<<n,o|=e[n],t&=~r;return o}function Uv(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function qv(e,t){for(var n=e.suspendedLanes,o=e.pingedLanes,r=e.expirationTimes,i=e.pendingLanes;0<i;){var s=31-Nr(i),a=1<<s,l=r[s];l===-1?(!(a&n)||a&o)&&(r[s]=Uv(a,t)):l<=t&&(e.expiredLanes|=a),i&=~a}}function Vf(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function k_(){var e=pd;return pd<<=1,!(pd&4194240)&&(pd=64),e}function hf(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function tc(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Nr(t),e[t]=n}function Kv(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var o=e.eventTimes;for(e=e.expirationTimes;0<n;){var r=31-Nr(n),i=1<<r;t[r]=0,o[r]=-1,e[r]=-1,n&=~i}}function Lh(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var o=31-Nr(n),r=1<<o;r&t|e[o]&t&&(e[o]|=t),n&=~r}}var fn=0;function S_(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var C_,$h,E_,T_,M_,Gf=!1,hd=[],Oi=null,Pi=null,Di=null,Wl=new Map,Hl=new Map,Ai=[],Yv="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function r1(e,t){switch(e){case"focusin":case"focusout":Oi=null;break;case"dragenter":case"dragleave":Pi=null;break;case"mouseover":case"mouseout":Di=null;break;case"pointerover":case"pointerout":Wl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Hl.delete(t.pointerId)}}function yl(e,t,n,o,r,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:o,nativeEvent:i,targetContainers:[r]},t!==null&&(t=oc(t),t!==null&&$h(t)),e):(e.eventSystemFlags|=o,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function Vv(e,t,n,o,r){switch(t){case"focusin":return Oi=yl(Oi,e,t,n,o,r),!0;case"dragenter":return Pi=yl(Pi,e,t,n,o,r),!0;case"mouseover":return Di=yl(Di,e,t,n,o,r),!0;case"pointerover":var i=r.pointerId;return Wl.set(i,yl(Wl.get(i)||null,e,t,n,o,r)),!0;case"gotpointercapture":return i=r.pointerId,Hl.set(i,yl(Hl.get(i)||null,e,t,n,o,r)),!0}return!1}function N_(e){var t=_s(e.target);if(t!==null){var n=Ms(t);if(n!==null){if(t=n.tag,t===13){if(t=__(n),t!==null){e.blockedOn=t,M_(e.priority,function(){E_(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Md(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Xf(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var o=new n.constructor(n.type,n);Uf=o,n.target.dispatchEvent(o),Uf=null}else return t=oc(n),t!==null&&$h(t),e.blockedOn=n,!1;t.shift()}return!0}function i1(e,t,n){Md(e)&&n.delete(t)}function Gv(){Gf=!1,Oi!==null&&Md(Oi)&&(Oi=null),Pi!==null&&Md(Pi)&&(Pi=null),Di!==null&&Md(Di)&&(Di=null),Wl.forEach(i1),Hl.forEach(i1)}function xl(e,t){e.blockedOn===t&&(e.blockedOn=null,Gf||(Gf=!0,Xo.unstable_scheduleCallback(Xo.unstable_NormalPriority,Gv)))}function jl(e){function t(r){return xl(r,e)}if(0<hd.length){xl(hd[0],e);for(var n=1;n<hd.length;n++){var o=hd[n];o.blockedOn===e&&(o.blockedOn=null)}}for(Oi!==null&&xl(Oi,e),Pi!==null&&xl(Pi,e),Di!==null&&xl(Di,e),Wl.forEach(t),Hl.forEach(t),n=0;n<Ai.length;n++)o=Ai[n],o.blockedOn===e&&(o.blockedOn=null);for(;0<Ai.length&&(n=Ai[0],n.blockedOn===null);)N_(n),n.blockedOn===null&&Ai.shift()}var ba=gi.ReactCurrentBatchConfig,jd=!0;function Xv(e,t,n,o){var r=fn,i=ba.transition;ba.transition=null;try{fn=1,Rh(e,t,n,o)}finally{fn=r,ba.transition=i}}function Qv(e,t,n,o){var r=fn,i=ba.transition;ba.transition=null;try{fn=4,Rh(e,t,n,o)}finally{fn=r,ba.transition=i}}function Rh(e,t,n,o){if(jd){var r=Xf(e,t,n,o);if(r===null)vf(e,t,o,Ud,n),r1(e,o);else if(Vv(r,e,t,n,o))o.stopPropagation();else if(r1(e,o),t&4&&-1<Yv.indexOf(e)){for(;r!==null;){var i=oc(r);if(i!==null&&C_(i),i=Xf(e,t,n,o),i===null&&vf(e,t,o,Ud,n),i===r)break;r=i}r!==null&&o.stopPropagation()}else vf(e,t,o,null,n)}}var Ud=null;function Xf(e,t,n,o){if(Ud=null,e=Ih(o),e=_s(e),e!==null)if(t=Ms(e),t===null)e=null;else if(n=t.tag,n===13){if(e=__(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Ud=e,null}function I_(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(zv()){case Ah:return 1;case v_:return 4;case Wd:case Fv:return 16;case b_:return 536870912;default:return 16}default:return 16}}var $i=null,Oh=null,Nd=null;function A_(){if(Nd)return Nd;var e,t=Oh,n=t.length,o,r="value"in $i?$i.value:$i.textContent,i=r.length;for(e=0;e<n&&t[e]===r[e];e++);var s=n-e;for(o=1;o<=s&&t[n-o]===r[i-o];o++);return Nd=r.slice(e,1<o?1-o:void 0)}function Id(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function md(){return!0}function s1(){return!1}function Qo(e){function t(n,o,r,i,s){this._reactName=n,this._targetInst=r,this.type=o,this.nativeEvent=i,this.target=s,this.currentTarget=null;for(var a in e)e.hasOwnProperty(a)&&(n=e[a],this[a]=n?n(i):i[a]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?md:s1,this.isPropagationStopped=s1,this}return Dn(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=md)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=md)},persist:function(){},isPersistent:md}),t}var La={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ph=Qo(La),nc=Dn({},La,{view:0,detail:0}),Jv=Qo(nc),mf,gf,wl,cu=Dn({},nc,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Dh,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==wl&&(wl&&e.type==="mousemove"?(mf=e.screenX-wl.screenX,gf=e.screenY-wl.screenY):gf=mf=0,wl=e),mf)},movementY:function(e){return"movementY"in e?e.movementY:gf}}),a1=Qo(cu),Zv=Dn({},cu,{dataTransfer:0}),eb=Qo(Zv),tb=Dn({},nc,{relatedTarget:0}),_f=Qo(tb),nb=Dn({},La,{animationName:0,elapsedTime:0,pseudoElement:0}),ob=Qo(nb),rb=Dn({},La,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),ib=Qo(rb),sb=Dn({},La,{data:0}),l1=Qo(sb),ab={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},lb={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},cb={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function db(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=cb[e])?!!t[e]:!1}function Dh(){return db}var ub=Dn({},nc,{key:function(e){if(e.key){var t=ab[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Id(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?lb[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Dh,charCode:function(e){return e.type==="keypress"?Id(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Id(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),pb=Qo(ub),fb=Dn({},cu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),c1=Qo(fb),hb=Dn({},nc,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Dh}),mb=Qo(hb),gb=Dn({},La,{propertyName:0,elapsedTime:0,pseudoElement:0}),_b=Qo(gb),yb=Dn({},cu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),xb=Qo(yb),wb=[9,13,27,32],zh=pi&&"CompositionEvent"in window,Al=null;pi&&"documentMode"in document&&(Al=document.documentMode);var vb=pi&&"TextEvent"in window&&!Al,L_=pi&&(!zh||Al&&8<Al&&11>=Al),d1=" ",u1=!1;function $_(e,t){switch(e){case"keyup":return wb.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function R_(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var ca=!1;function bb(e,t){switch(e){case"compositionend":return R_(t);case"keypress":return t.which!==32?null:(u1=!0,d1);case"textInput":return e=t.data,e===d1&&u1?null:e;default:return null}}function kb(e,t){if(ca)return e==="compositionend"||!zh&&$_(e,t)?(e=A_(),Nd=Oh=$i=null,ca=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return L_&&t.locale!=="ko"?null:t.data;default:return null}}var Sb={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function p1(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Sb[e.type]:t==="textarea"}function O_(e,t,n,o){p_(o),t=qd(t,"onChange"),0<t.length&&(n=new Ph("onChange","change",null,n,o),e.push({event:n,listeners:t}))}var Ll=null,Ul=null;function Cb(e){K_(e,0)}function du(e){var t=pa(e);if(i_(t))return e}function Eb(e,t){if(e==="change")return t}var P_=!1;pi&&(pi?(_d="oninput"in document,_d||(yf=document.createElement("div"),yf.setAttribute("oninput","return;"),_d=typeof yf.oninput=="function"),gd=_d):gd=!1,P_=gd&&(!document.documentMode||9<document.documentMode));var gd,_d,yf;function f1(){Ll&&(Ll.detachEvent("onpropertychange",D_),Ul=Ll=null)}function D_(e){if(e.propertyName==="value"&&du(Ul)){var t=[];O_(t,Ul,e,Ih(e)),g_(Cb,t)}}function Tb(e,t,n){e==="focusin"?(f1(),Ll=t,Ul=n,Ll.attachEvent("onpropertychange",D_)):e==="focusout"&&f1()}function Mb(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return du(Ul)}function Nb(e,t){if(e==="click")return du(t)}function Ib(e,t){if(e==="input"||e==="change")return du(t)}function Ab(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Ar=typeof Object.is=="function"?Object.is:Ab;function ql(e,t){if(Ar(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),o=Object.keys(t);if(n.length!==o.length)return!1;for(o=0;o<n.length;o++){var r=n[o];if(!Lf.call(t,r)||!Ar(e[r],t[r]))return!1}return!0}function h1(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function m1(e,t){var n=h1(e);e=0;for(var o;n;){if(n.nodeType===3){if(o=e+n.textContent.length,e<=t&&o>=t)return{node:n,offset:t-e};e=o}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=h1(n)}}function z_(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?z_(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function F_(){for(var e=window,t=zd();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=zd(e.document)}return t}function Fh(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function Lb(e){var t=F_(),n=e.focusedElem,o=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&z_(n.ownerDocument.documentElement,n)){if(o!==null&&Fh(n)){if(t=o.start,e=o.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var r=n.textContent.length,i=Math.min(o.start,r);o=o.end===void 0?i:Math.min(o.end,r),!e.extend&&i>o&&(r=o,o=i,i=r),r=m1(n,i);var s=m1(n,o);r&&s&&(e.rangeCount!==1||e.anchorNode!==r.node||e.anchorOffset!==r.offset||e.focusNode!==s.node||e.focusOffset!==s.offset)&&(t=t.createRange(),t.setStart(r.node,r.offset),e.removeAllRanges(),i>o?(e.addRange(t),e.extend(s.node,s.offset)):(t.setEnd(s.node,s.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var $b=pi&&"documentMode"in document&&11>=document.documentMode,da=null,Qf=null,$l=null,Jf=!1;function g1(e,t,n){var o=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Jf||da==null||da!==zd(o)||(o=da,"selectionStart"in o&&Fh(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),$l&&ql($l,o)||($l=o,o=qd(Qf,"onSelect"),0<o.length&&(t=new Ph("onSelect","select",null,t,n),e.push({event:t,listeners:o}),t.target=da)))}function yd(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var ua={animationend:yd("Animation","AnimationEnd"),animationiteration:yd("Animation","AnimationIteration"),animationstart:yd("Animation","AnimationStart"),transitionend:yd("Transition","TransitionEnd")},xf={},B_={};pi&&(B_=document.createElement("div").style,"AnimationEvent"in window||(delete ua.animationend.animation,delete ua.animationiteration.animation,delete ua.animationstart.animation),"TransitionEvent"in window||delete ua.transitionend.transition);function uu(e){if(xf[e])return xf[e];if(!ua[e])return e;var t=ua[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in B_)return xf[e]=t[n];return e}var W_=uu("animationend"),H_=uu("animationiteration"),j_=uu("animationstart"),U_=uu("transitionend"),q_=new Map,_1="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function qi(e,t){q_.set(e,t),Ts(t,[e])}for(xd=0;xd<_1.length;xd++)wd=_1[xd],y1=wd.toLowerCase(),x1=wd[0].toUpperCase()+wd.slice(1),qi(y1,"on"+x1);var wd,y1,x1,xd;qi(W_,"onAnimationEnd");qi(H_,"onAnimationIteration");qi(j_,"onAnimationStart");qi("dblclick","onDoubleClick");qi("focusin","onFocus");qi("focusout","onBlur");qi(U_,"onTransitionEnd");Ca("onMouseEnter",["mouseout","mouseover"]);Ca("onMouseLeave",["mouseout","mouseover"]);Ca("onPointerEnter",["pointerout","pointerover"]);Ca("onPointerLeave",["pointerout","pointerover"]);Ts("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ts("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ts("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ts("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ts("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ts("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ml="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Rb=new Set("cancel close invalid load scroll toggle".split(" ").concat(Ml));function w1(e,t,n){var o=e.type||"unknown-event";e.currentTarget=n,Rv(o,t,void 0,e),e.currentTarget=null}function K_(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var o=e[n],r=o.event;o=o.listeners;e:{var i=void 0;if(t)for(var s=o.length-1;0<=s;s--){var a=o[s],l=a.instance,d=a.currentTarget;if(a=a.listener,l!==i&&r.isPropagationStopped())break e;w1(r,a,d),i=l}else for(s=0;s<o.length;s++){if(a=o[s],l=a.instance,d=a.currentTarget,a=a.listener,l!==i&&r.isPropagationStopped())break e;w1(r,a,d),i=l}}}if(Bd)throw e=Yf,Bd=!1,Yf=null,e}function En(e,t){var n=t[oh];n===void 0&&(n=t[oh]=new Set);var o=e+"__bubble";n.has(o)||(Y_(t,e,2,!1),n.add(o))}function wf(e,t,n){var o=0;t&&(o|=4),Y_(n,e,o,t)}var vd="_reactListening"+Math.random().toString(36).slice(2);function Kl(e){if(!e[vd]){e[vd]=!0,e_.forEach(function(n){n!=="selectionchange"&&(Rb.has(n)||wf(n,!1,e),wf(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[vd]||(t[vd]=!0,wf("selectionchange",!1,t))}}function Y_(e,t,n,o){switch(I_(t)){case 1:var r=Xv;break;case 4:r=Qv;break;default:r=Rh}n=r.bind(null,t,n,e),r=void 0,!Kf||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),o?r!==void 0?e.addEventListener(t,n,{capture:!0,passive:r}):e.addEventListener(t,n,!0):r!==void 0?e.addEventListener(t,n,{passive:r}):e.addEventListener(t,n,!1)}function vf(e,t,n,o,r){var i=o;if(!(t&1)&&!(t&2)&&o!==null)e:for(;;){if(o===null)return;var s=o.tag;if(s===3||s===4){var a=o.stateNode.containerInfo;if(a===r||a.nodeType===8&&a.parentNode===r)break;if(s===4)for(s=o.return;s!==null;){var l=s.tag;if((l===3||l===4)&&(l=s.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;s=s.return}for(;a!==null;){if(s=_s(a),s===null)return;if(l=s.tag,l===5||l===6){o=i=s;continue e}a=a.parentNode}}o=o.return}g_(function(){var d=i,c=Ih(n),p=[];e:{var f=q_.get(e);if(f!==void 0){var C=Ph,w=e;switch(e){case"keypress":if(Id(n)===0)break e;case"keydown":case"keyup":C=pb;break;case"focusin":w="focus",C=_f;break;case"focusout":w="blur",C=_f;break;case"beforeblur":case"afterblur":C=_f;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":C=a1;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":C=eb;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":C=mb;break;case W_:case H_:case j_:C=ob;break;case U_:C=_b;break;case"scroll":C=Jv;break;case"wheel":C=xb;break;case"copy":case"cut":case"paste":C=ib;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":C=c1}var m=(t&4)!==0,S=!m&&e==="scroll",g=m?f!==null?f+"Capture":null:f;m=[];for(var y=d,E;y!==null;){E=y;var A=E.stateNode;if(E.tag===5&&A!==null&&(E=A,g!==null&&(A=Bl(y,g),A!=null&&m.push(Yl(y,A,E)))),S)break;y=y.return}0<m.length&&(f=new C(f,w,null,n,c),p.push({event:f,listeners:m}))}}if(!(t&7)){e:{if(f=e==="mouseover"||e==="pointerover",C=e==="mouseout"||e==="pointerout",f&&n!==Uf&&(w=n.relatedTarget||n.fromElement)&&(_s(w)||w[fi]))break e;if((C||f)&&(f=c.window===c?c:(f=c.ownerDocument)?f.defaultView||f.parentWindow:window,C?(w=n.relatedTarget||n.toElement,C=d,w=w?_s(w):null,w!==null&&(S=Ms(w),w!==S||w.tag!==5&&w.tag!==6)&&(w=null)):(C=null,w=d),C!==w)){if(m=a1,A="onMouseLeave",g="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(m=c1,A="onPointerLeave",g="onPointerEnter",y="pointer"),S=C==null?f:pa(C),E=w==null?f:pa(w),f=new m(A,y+"leave",C,n,c),f.target=S,f.relatedTarget=E,A=null,_s(c)===d&&(m=new m(g,y+"enter",w,n,c),m.target=E,m.relatedTarget=S,A=m),S=A,C&&w)t:{for(m=C,g=w,y=0,E=m;E;E=sa(E))y++;for(E=0,A=g;A;A=sa(A))E++;for(;0<y-E;)m=sa(m),y--;for(;0<E-y;)g=sa(g),E--;for(;y--;){if(m===g||g!==null&&m===g.alternate)break t;m=sa(m),g=sa(g)}m=null}else m=null;C!==null&&v1(p,f,C,m,!1),w!==null&&S!==null&&v1(p,S,w,m,!0)}}e:{if(f=d?pa(d):window,C=f.nodeName&&f.nodeName.toLowerCase(),C==="select"||C==="input"&&f.type==="file")var Q=Eb;else if(p1(f))if(P_)Q=Ib;else{Q=Mb;var G=Tb}else(C=f.nodeName)&&C.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(Q=Nb);if(Q&&(Q=Q(e,d))){O_(p,Q,n,c);break e}G&&G(e,f,d),e==="focusout"&&(G=f._wrapperState)&&G.controlled&&f.type==="number"&&Ff(f,"number",f.value)}switch(G=d?pa(d):window,e){case"focusin":(p1(G)||G.contentEditable==="true")&&(da=G,Qf=d,$l=null);break;case"focusout":$l=Qf=da=null;break;case"mousedown":Jf=!0;break;case"contextmenu":case"mouseup":case"dragend":Jf=!1,g1(p,n,c);break;case"selectionchange":if($b)break;case"keydown":case"keyup":g1(p,n,c)}var D;if(zh)e:{switch(e){case"compositionstart":var le="onCompositionStart";break e;case"compositionend":le="onCompositionEnd";break e;case"compositionupdate":le="onCompositionUpdate";break e}le=void 0}else ca?$_(e,n)&&(le="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(le="onCompositionStart");le&&(L_&&n.locale!=="ko"&&(ca||le!=="onCompositionStart"?le==="onCompositionEnd"&&ca&&(D=A_()):($i=c,Oh="value"in $i?$i.value:$i.textContent,ca=!0)),G=qd(d,le),0<G.length&&(le=new l1(le,e,null,n,c),p.push({event:le,listeners:G}),D?le.data=D:(D=R_(n),D!==null&&(le.data=D)))),(D=vb?bb(e,n):kb(e,n))&&(d=qd(d,"onBeforeInput"),0<d.length&&(c=new l1("onBeforeInput","beforeinput",null,n,c),p.push({event:c,listeners:d}),c.data=D))}K_(p,t)})}function Yl(e,t,n){return{instance:e,listener:t,currentTarget:n}}function qd(e,t){for(var n=t+"Capture",o=[];e!==null;){var r=e,i=r.stateNode;r.tag===5&&i!==null&&(r=i,i=Bl(e,n),i!=null&&o.unshift(Yl(e,i,r)),i=Bl(e,t),i!=null&&o.push(Yl(e,i,r))),e=e.return}return o}function sa(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function v1(e,t,n,o,r){for(var i=t._reactName,s=[];n!==null&&n!==o;){var a=n,l=a.alternate,d=a.stateNode;if(l!==null&&l===o)break;a.tag===5&&d!==null&&(a=d,r?(l=Bl(n,i),l!=null&&s.unshift(Yl(n,l,a))):r||(l=Bl(n,i),l!=null&&s.push(Yl(n,l,a)))),n=n.return}s.length!==0&&e.push({event:t,listeners:s})}var Ob=/\r\n?/g,Pb=/\u0000|\uFFFD/g;function b1(e){return(typeof e=="string"?e:""+e).replace(Ob,`
`).replace(Pb,"")}function bd(e,t,n){if(t=b1(t),b1(e)!==t&&n)throw Error(Be(425))}function Kd(){}var Zf=null,eh=null;function th(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var nh=typeof setTimeout=="function"?setTimeout:void 0,Db=typeof clearTimeout=="function"?clearTimeout:void 0,k1=typeof Promise=="function"?Promise:void 0,zb=typeof queueMicrotask=="function"?queueMicrotask:typeof k1<"u"?function(e){return k1.resolve(null).then(e).catch(Fb)}:nh;function Fb(e){setTimeout(function(){throw e})}function bf(e,t){var n=t,o=0;do{var r=n.nextSibling;if(e.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(o===0){e.removeChild(r),jl(t);return}o--}else n!=="$"&&n!=="$?"&&n!=="$!"||o++;n=r}while(n);jl(t)}function zi(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function S1(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var $a=Math.random().toString(36).slice(2),qr="__reactFiber$"+$a,Vl="__reactProps$"+$a,fi="__reactContainer$"+$a,oh="__reactEvents$"+$a,Bb="__reactListeners$"+$a,Wb="__reactHandles$"+$a;function _s(e){var t=e[qr];if(t)return t;for(var n=e.parentNode;n;){if(t=n[fi]||n[qr]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=S1(e);e!==null;){if(n=e[qr])return n;e=S1(e)}return t}e=n,n=e.parentNode}return null}function oc(e){return e=e[qr]||e[fi],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function pa(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(Be(33))}function pu(e){return e[Vl]||null}var rh=[],fa=-1;function Ki(e){return{current:e}}function Tn(e){0>fa||(e.current=rh[fa],rh[fa]=null,fa--)}function Sn(e,t){fa++,rh[fa]=e.current,e.current=t}var Ui={},So=Ki(Ui),Bo=Ki(!1),bs=Ui;function Ea(e,t){var n=e.type.contextTypes;if(!n)return Ui;var o=e.stateNode;if(o&&o.__reactInternalMemoizedUnmaskedChildContext===t)return o.__reactInternalMemoizedMaskedChildContext;var r={},i;for(i in n)r[i]=t[i];return o&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=r),r}function Wo(e){return e=e.childContextTypes,e!=null}function Yd(){Tn(Bo),Tn(So)}function C1(e,t,n){if(So.current!==Ui)throw Error(Be(168));Sn(So,t),Sn(Bo,n)}function V_(e,t,n){var o=e.stateNode;if(t=t.childContextTypes,typeof o.getChildContext!="function")return n;o=o.getChildContext();for(var r in o)if(!(r in t))throw Error(Be(108,Tv(e)||"Unknown",r));return Dn({},n,o)}function Vd(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Ui,bs=So.current,Sn(So,e),Sn(Bo,Bo.current),!0}function E1(e,t,n){var o=e.stateNode;if(!o)throw Error(Be(169));n?(e=V_(e,t,bs),o.__reactInternalMemoizedMergedChildContext=e,Tn(Bo),Tn(So),Sn(So,e)):Tn(Bo),Sn(Bo,n)}var li=null,fu=!1,kf=!1;function G_(e){li===null?li=[e]:li.push(e)}function Hb(e){fu=!0,G_(e)}function Yi(){if(!kf&&li!==null){kf=!0;var e=0,t=fn;try{var n=li;for(fn=1;e<n.length;e++){var o=n[e];do o=o(!0);while(o!==null)}li=null,fu=!1}catch(r){throw li!==null&&(li=li.slice(e+1)),w_(Ah,Yi),r}finally{fn=t,kf=!1}}return null}var ha=[],ma=0,Gd=null,Xd=0,sr=[],ar=0,ks=null,ci=1,di="";function ms(e,t){ha[ma++]=Xd,ha[ma++]=Gd,Gd=e,Xd=t}function X_(e,t,n){sr[ar++]=ci,sr[ar++]=di,sr[ar++]=ks,ks=e;var o=ci;e=di;var r=32-Nr(o)-1;o&=~(1<<r),n+=1;var i=32-Nr(t)+r;if(30<i){var s=r-r%5;i=(o&(1<<s)-1).toString(32),o>>=s,r-=s,ci=1<<32-Nr(t)+r|n<<r|o,di=i+e}else ci=1<<i|n<<r|o,di=e}function Bh(e){e.return!==null&&(ms(e,1),X_(e,1,0))}function Wh(e){for(;e===Gd;)Gd=ha[--ma],ha[ma]=null,Xd=ha[--ma],ha[ma]=null;for(;e===ks;)ks=sr[--ar],sr[ar]=null,di=sr[--ar],sr[ar]=null,ci=sr[--ar],sr[ar]=null}var Go=null,Vo=null,Ln=!1,Mr=null;function Q_(e,t){var n=lr(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function T1(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Go=e,Vo=zi(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Go=e,Vo=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=ks!==null?{id:ci,overflow:di}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=lr(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Go=e,Vo=null,!0):!1;default:return!1}}function ih(e){return(e.mode&1)!==0&&(e.flags&128)===0}function sh(e){if(Ln){var t=Vo;if(t){var n=t;if(!T1(e,t)){if(ih(e))throw Error(Be(418));t=zi(n.nextSibling);var o=Go;t&&T1(e,t)?Q_(o,n):(e.flags=e.flags&-4097|2,Ln=!1,Go=e)}}else{if(ih(e))throw Error(Be(418));e.flags=e.flags&-4097|2,Ln=!1,Go=e}}}function M1(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Go=e}function kd(e){if(e!==Go)return!1;if(!Ln)return M1(e),Ln=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!th(e.type,e.memoizedProps)),t&&(t=Vo)){if(ih(e))throw J_(),Error(Be(418));for(;t;)Q_(e,t),t=zi(t.nextSibling)}if(M1(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(Be(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){Vo=zi(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}Vo=null}}else Vo=Go?zi(e.stateNode.nextSibling):null;return!0}function J_(){for(var e=Vo;e;)e=zi(e.nextSibling)}function Ta(){Vo=Go=null,Ln=!1}function Hh(e){Mr===null?Mr=[e]:Mr.push(e)}var jb=gi.ReactCurrentBatchConfig;function vl(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(Be(309));var o=n.stateNode}if(!o)throw Error(Be(147,e));var r=o,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(s){var a=r.refs;s===null?delete a[i]:a[i]=s},t._stringRef=i,t)}if(typeof e!="string")throw Error(Be(284));if(!n._owner)throw Error(Be(290,e))}return e}function Sd(e,t){throw e=Object.prototype.toString.call(t),Error(Be(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function N1(e){var t=e._init;return t(e._payload)}function Z_(e){function t(g,y){if(e){var E=g.deletions;E===null?(g.deletions=[y],g.flags|=16):E.push(y)}}function n(g,y){if(!e)return null;for(;y!==null;)t(g,y),y=y.sibling;return null}function o(g,y){for(g=new Map;y!==null;)y.key!==null?g.set(y.key,y):g.set(y.index,y),y=y.sibling;return g}function r(g,y){return g=Hi(g,y),g.index=0,g.sibling=null,g}function i(g,y,E){return g.index=E,e?(E=g.alternate,E!==null?(E=E.index,E<y?(g.flags|=2,y):E):(g.flags|=2,y)):(g.flags|=1048576,y)}function s(g){return e&&g.alternate===null&&(g.flags|=2),g}function a(g,y,E,A){return y===null||y.tag!==6?(y=If(E,g.mode,A),y.return=g,y):(y=r(y,E),y.return=g,y)}function l(g,y,E,A){var Q=E.type;return Q===la?c(g,y,E.props.children,A,E.key):y!==null&&(y.elementType===Q||typeof Q=="object"&&Q!==null&&Q.$$typeof===Ni&&N1(Q)===y.type)?(A=r(y,E.props),A.ref=vl(g,y,E),A.return=g,A):(A=Dd(E.type,E.key,E.props,null,g.mode,A),A.ref=vl(g,y,E),A.return=g,A)}function d(g,y,E,A){return y===null||y.tag!==4||y.stateNode.containerInfo!==E.containerInfo||y.stateNode.implementation!==E.implementation?(y=Af(E,g.mode,A),y.return=g,y):(y=r(y,E.children||[]),y.return=g,y)}function c(g,y,E,A,Q){return y===null||y.tag!==7?(y=vs(E,g.mode,A,Q),y.return=g,y):(y=r(y,E),y.return=g,y)}function p(g,y,E){if(typeof y=="string"&&y!==""||typeof y=="number")return y=If(""+y,g.mode,E),y.return=g,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case cd:return E=Dd(y.type,y.key,y.props,null,g.mode,E),E.ref=vl(g,null,y),E.return=g,E;case aa:return y=Af(y,g.mode,E),y.return=g,y;case Ni:var A=y._init;return p(g,A(y._payload),E)}if(El(y)||_l(y))return y=vs(y,g.mode,E,null),y.return=g,y;Sd(g,y)}return null}function f(g,y,E,A){var Q=y!==null?y.key:null;if(typeof E=="string"&&E!==""||typeof E=="number")return Q!==null?null:a(g,y,""+E,A);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case cd:return E.key===Q?l(g,y,E,A):null;case aa:return E.key===Q?d(g,y,E,A):null;case Ni:return Q=E._init,f(g,y,Q(E._payload),A)}if(El(E)||_l(E))return Q!==null?null:c(g,y,E,A,null);Sd(g,E)}return null}function C(g,y,E,A,Q){if(typeof A=="string"&&A!==""||typeof A=="number")return g=g.get(E)||null,a(y,g,""+A,Q);if(typeof A=="object"&&A!==null){switch(A.$$typeof){case cd:return g=g.get(A.key===null?E:A.key)||null,l(y,g,A,Q);case aa:return g=g.get(A.key===null?E:A.key)||null,d(y,g,A,Q);case Ni:var G=A._init;return C(g,y,E,G(A._payload),Q)}if(El(A)||_l(A))return g=g.get(E)||null,c(y,g,A,Q,null);Sd(y,A)}return null}function w(g,y,E,A){for(var Q=null,G=null,D=y,le=y=0,K=null;D!==null&&le<E.length;le++){D.index>le?(K=D,D=null):K=D.sibling;var W=f(g,D,E[le],A);if(W===null){D===null&&(D=K);break}e&&D&&W.alternate===null&&t(g,D),y=i(W,y,le),G===null?Q=W:G.sibling=W,G=W,D=K}if(le===E.length)return n(g,D),Ln&&ms(g,le),Q;if(D===null){for(;le<E.length;le++)D=p(g,E[le],A),D!==null&&(y=i(D,y,le),G===null?Q=D:G.sibling=D,G=D);return Ln&&ms(g,le),Q}for(D=o(g,D);le<E.length;le++)K=C(D,g,le,E[le],A),K!==null&&(e&&K.alternate!==null&&D.delete(K.key===null?le:K.key),y=i(K,y,le),G===null?Q=K:G.sibling=K,G=K);return e&&D.forEach(function(Y){return t(g,Y)}),Ln&&ms(g,le),Q}function m(g,y,E,A){var Q=_l(E);if(typeof Q!="function")throw Error(Be(150));if(E=Q.call(E),E==null)throw Error(Be(151));for(var G=Q=null,D=y,le=y=0,K=null,W=E.next();D!==null&&!W.done;le++,W=E.next()){D.index>le?(K=D,D=null):K=D.sibling;var Y=f(g,D,W.value,A);if(Y===null){D===null&&(D=K);break}e&&D&&Y.alternate===null&&t(g,D),y=i(Y,y,le),G===null?Q=Y:G.sibling=Y,G=Y,D=K}if(W.done)return n(g,D),Ln&&ms(g,le),Q;if(D===null){for(;!W.done;le++,W=E.next())W=p(g,W.value,A),W!==null&&(y=i(W,y,le),G===null?Q=W:G.sibling=W,G=W);return Ln&&ms(g,le),Q}for(D=o(g,D);!W.done;le++,W=E.next())W=C(D,g,le,W.value,A),W!==null&&(e&&W.alternate!==null&&D.delete(W.key===null?le:W.key),y=i(W,y,le),G===null?Q=W:G.sibling=W,G=W);return e&&D.forEach(function(he){return t(g,he)}),Ln&&ms(g,le),Q}function S(g,y,E,A){if(typeof E=="object"&&E!==null&&E.type===la&&E.key===null&&(E=E.props.children),typeof E=="object"&&E!==null){switch(E.$$typeof){case cd:e:{for(var Q=E.key,G=y;G!==null;){if(G.key===Q){if(Q=E.type,Q===la){if(G.tag===7){n(g,G.sibling),y=r(G,E.props.children),y.return=g,g=y;break e}}else if(G.elementType===Q||typeof Q=="object"&&Q!==null&&Q.$$typeof===Ni&&N1(Q)===G.type){n(g,G.sibling),y=r(G,E.props),y.ref=vl(g,G,E),y.return=g,g=y;break e}n(g,G);break}else t(g,G);G=G.sibling}E.type===la?(y=vs(E.props.children,g.mode,A,E.key),y.return=g,g=y):(A=Dd(E.type,E.key,E.props,null,g.mode,A),A.ref=vl(g,y,E),A.return=g,g=A)}return s(g);case aa:e:{for(G=E.key;y!==null;){if(y.key===G)if(y.tag===4&&y.stateNode.containerInfo===E.containerInfo&&y.stateNode.implementation===E.implementation){n(g,y.sibling),y=r(y,E.children||[]),y.return=g,g=y;break e}else{n(g,y);break}else t(g,y);y=y.sibling}y=Af(E,g.mode,A),y.return=g,g=y}return s(g);case Ni:return G=E._init,S(g,y,G(E._payload),A)}if(El(E))return w(g,y,E,A);if(_l(E))return m(g,y,E,A);Sd(g,E)}return typeof E=="string"&&E!==""||typeof E=="number"?(E=""+E,y!==null&&y.tag===6?(n(g,y.sibling),y=r(y,E),y.return=g,g=y):(n(g,y),y=If(E,g.mode,A),y.return=g,g=y),s(g)):n(g,y)}return S}var Ma=Z_(!0),ey=Z_(!1),Qd=Ki(null),Jd=null,ga=null,jh=null;function Uh(){jh=ga=Jd=null}function qh(e){var t=Qd.current;Tn(Qd),e._currentValue=t}function ah(e,t,n){for(;e!==null;){var o=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,o!==null&&(o.childLanes|=t)):o!==null&&(o.childLanes&t)!==t&&(o.childLanes|=t),e===n)break;e=e.return}}function ka(e,t){Jd=e,jh=ga=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(Fo=!0),e.firstContext=null)}function dr(e){var t=e._currentValue;if(jh!==e)if(e={context:e,memoizedValue:t,next:null},ga===null){if(Jd===null)throw Error(Be(308));ga=e,Jd.dependencies={lanes:0,firstContext:e}}else ga=ga.next=e;return t}var ys=null;function Kh(e){ys===null?ys=[e]:ys.push(e)}function ty(e,t,n,o){var r=t.interleaved;return r===null?(n.next=n,Kh(t)):(n.next=r.next,r.next=n),t.interleaved=n,hi(e,o)}function hi(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Ii=!1;function Yh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function ny(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function ui(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Fi(e,t,n){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,rn&2){var r=o.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),o.pending=t,hi(e,n)}return r=o.interleaved,r===null?(t.next=t,Kh(o)):(t.next=r.next,r.next=t),o.interleaved=t,hi(e,n)}function Ad(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var o=t.lanes;o&=e.pendingLanes,n|=o,t.lanes=n,Lh(e,n)}}function I1(e,t){var n=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,n===o)){var r=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var s={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?r=i=s:i=i.next=s,n=n.next}while(n!==null);i===null?r=i=t:i=i.next=t}else r=i=t;n={baseState:o.baseState,firstBaseUpdate:r,lastBaseUpdate:i,shared:o.shared,effects:o.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function Zd(e,t,n,o){var r=e.updateQueue;Ii=!1;var i=r.firstBaseUpdate,s=r.lastBaseUpdate,a=r.shared.pending;if(a!==null){r.shared.pending=null;var l=a,d=l.next;l.next=null,s===null?i=d:s.next=d,s=l;var c=e.alternate;c!==null&&(c=c.updateQueue,a=c.lastBaseUpdate,a!==s&&(a===null?c.firstBaseUpdate=d:a.next=d,c.lastBaseUpdate=l))}if(i!==null){var p=r.baseState;s=0,c=d=l=null,a=i;do{var f=a.lane,C=a.eventTime;if((o&f)===f){c!==null&&(c=c.next={eventTime:C,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var w=e,m=a;switch(f=t,C=n,m.tag){case 1:if(w=m.payload,typeof w=="function"){p=w.call(C,p,f);break e}p=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=m.payload,f=typeof w=="function"?w.call(C,p,f):w,f==null)break e;p=Dn({},p,f);break e;case 2:Ii=!0}}a.callback!==null&&a.lane!==0&&(e.flags|=64,f=r.effects,f===null?r.effects=[a]:f.push(a))}else C={eventTime:C,lane:f,tag:a.tag,payload:a.payload,callback:a.callback,next:null},c===null?(d=c=C,l=p):c=c.next=C,s|=f;if(a=a.next,a===null){if(a=r.shared.pending,a===null)break;f=a,a=f.next,f.next=null,r.lastBaseUpdate=f,r.shared.pending=null}}while(!0);if(c===null&&(l=p),r.baseState=l,r.firstBaseUpdate=d,r.lastBaseUpdate=c,t=r.shared.interleaved,t!==null){r=t;do s|=r.lane,r=r.next;while(r!==t)}else i===null&&(r.shared.lanes=0);Cs|=s,e.lanes=s,e.memoizedState=p}}function A1(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var o=e[t],r=o.callback;if(r!==null){if(o.callback=null,o=n,typeof r!="function")throw Error(Be(191,r));r.call(o)}}}var rc={},Yr=Ki(rc),Gl=Ki(rc),Xl=Ki(rc);function xs(e){if(e===rc)throw Error(Be(174));return e}function Vh(e,t){switch(Sn(Xl,t),Sn(Gl,e),Sn(Yr,rc),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Wf(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Wf(t,e)}Tn(Yr),Sn(Yr,t)}function Na(){Tn(Yr),Tn(Gl),Tn(Xl)}function oy(e){xs(Xl.current);var t=xs(Yr.current),n=Wf(t,e.type);t!==n&&(Sn(Gl,e),Sn(Yr,n))}function Gh(e){Gl.current===e&&(Tn(Yr),Tn(Gl))}var On=Ki(0);function eu(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Sf=[];function Xh(){for(var e=0;e<Sf.length;e++)Sf[e]._workInProgressVersionPrimary=null;Sf.length=0}var Ld=gi.ReactCurrentDispatcher,Cf=gi.ReactCurrentBatchConfig,Ss=0,Pn=null,ao=null,po=null,tu=!1,Rl=!1,Ql=0,Ub=0;function vo(){throw Error(Be(321))}function Qh(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Ar(e[n],t[n]))return!1;return!0}function Jh(e,t,n,o,r,i){if(Ss=i,Pn=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Ld.current=e===null||e.memoizedState===null?Vb:Gb,e=n(o,r),Rl){i=0;do{if(Rl=!1,Ql=0,25<=i)throw Error(Be(301));i+=1,po=ao=null,t.updateQueue=null,Ld.current=Xb,e=n(o,r)}while(Rl)}if(Ld.current=nu,t=ao!==null&&ao.next!==null,Ss=0,po=ao=Pn=null,tu=!1,t)throw Error(Be(300));return e}function Zh(){var e=Ql!==0;return Ql=0,e}function Ur(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return po===null?Pn.memoizedState=po=e:po=po.next=e,po}function ur(){if(ao===null){var e=Pn.alternate;e=e!==null?e.memoizedState:null}else e=ao.next;var t=po===null?Pn.memoizedState:po.next;if(t!==null)po=t,ao=e;else{if(e===null)throw Error(Be(310));ao=e,e={memoizedState:ao.memoizedState,baseState:ao.baseState,baseQueue:ao.baseQueue,queue:ao.queue,next:null},po===null?Pn.memoizedState=po=e:po=po.next=e}return po}function Jl(e,t){return typeof t=="function"?t(e):t}function Ef(e){var t=ur(),n=t.queue;if(n===null)throw Error(Be(311));n.lastRenderedReducer=e;var o=ao,r=o.baseQueue,i=n.pending;if(i!==null){if(r!==null){var s=r.next;r.next=i.next,i.next=s}o.baseQueue=r=i,n.pending=null}if(r!==null){i=r.next,o=o.baseState;var a=s=null,l=null,d=i;do{var c=d.lane;if((Ss&c)===c)l!==null&&(l=l.next={lane:0,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),o=d.hasEagerState?d.eagerState:e(o,d.action);else{var p={lane:c,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null};l===null?(a=l=p,s=o):l=l.next=p,Pn.lanes|=c,Cs|=c}d=d.next}while(d!==null&&d!==i);l===null?s=o:l.next=a,Ar(o,t.memoizedState)||(Fo=!0),t.memoizedState=o,t.baseState=s,t.baseQueue=l,n.lastRenderedState=o}if(e=n.interleaved,e!==null){r=e;do i=r.lane,Pn.lanes|=i,Cs|=i,r=r.next;while(r!==e)}else r===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function Tf(e){var t=ur(),n=t.queue;if(n===null)throw Error(Be(311));n.lastRenderedReducer=e;var o=n.dispatch,r=n.pending,i=t.memoizedState;if(r!==null){n.pending=null;var s=r=r.next;do i=e(i,s.action),s=s.next;while(s!==r);Ar(i,t.memoizedState)||(Fo=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,o]}function ry(){}function iy(e,t){var n=Pn,o=ur(),r=t(),i=!Ar(o.memoizedState,r);if(i&&(o.memoizedState=r,Fo=!0),o=o.queue,em(ly.bind(null,n,o,e),[e]),o.getSnapshot!==t||i||po!==null&&po.memoizedState.tag&1){if(n.flags|=2048,Zl(9,ay.bind(null,n,o,r,t),void 0,null),fo===null)throw Error(Be(349));Ss&30||sy(n,t,r)}return r}function sy(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=Pn.updateQueue,t===null?(t={lastEffect:null,stores:null},Pn.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function ay(e,t,n,o){t.value=n,t.getSnapshot=o,cy(t)&&dy(e)}function ly(e,t,n){return n(function(){cy(t)&&dy(e)})}function cy(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Ar(e,n)}catch{return!0}}function dy(e){var t=hi(e,1);t!==null&&Ir(t,e,1,-1)}function L1(e){var t=Ur();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Jl,lastRenderedState:e},t.queue=e,e=e.dispatch=Yb.bind(null,Pn,e),[t.memoizedState,e]}function Zl(e,t,n,o){return e={tag:e,create:t,destroy:n,deps:o,next:null},t=Pn.updateQueue,t===null?(t={lastEffect:null,stores:null},Pn.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(o=n.next,n.next=e,e.next=o,t.lastEffect=e)),e}function uy(){return ur().memoizedState}function $d(e,t,n,o){var r=Ur();Pn.flags|=e,r.memoizedState=Zl(1|t,n,void 0,o===void 0?null:o)}function hu(e,t,n,o){var r=ur();o=o===void 0?null:o;var i=void 0;if(ao!==null){var s=ao.memoizedState;if(i=s.destroy,o!==null&&Qh(o,s.deps)){r.memoizedState=Zl(t,n,i,o);return}}Pn.flags|=e,r.memoizedState=Zl(1|t,n,i,o)}function $1(e,t){return $d(8390656,8,e,t)}function em(e,t){return hu(2048,8,e,t)}function py(e,t){return hu(4,2,e,t)}function fy(e,t){return hu(4,4,e,t)}function hy(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function my(e,t,n){return n=n!=null?n.concat([e]):null,hu(4,4,hy.bind(null,t,e),n)}function tm(){}function gy(e,t){var n=ur();t=t===void 0?null:t;var o=n.memoizedState;return o!==null&&t!==null&&Qh(t,o[1])?o[0]:(n.memoizedState=[e,t],e)}function _y(e,t){var n=ur();t=t===void 0?null:t;var o=n.memoizedState;return o!==null&&t!==null&&Qh(t,o[1])?o[0]:(e=e(),n.memoizedState=[e,t],e)}function yy(e,t,n){return Ss&21?(Ar(n,t)||(n=k_(),Pn.lanes|=n,Cs|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Fo=!0),e.memoizedState=n)}function qb(e,t){var n=fn;fn=n!==0&&4>n?n:4,e(!0);var o=Cf.transition;Cf.transition={};try{e(!1),t()}finally{fn=n,Cf.transition=o}}function xy(){return ur().memoizedState}function Kb(e,t,n){var o=Wi(e);if(n={lane:o,action:n,hasEagerState:!1,eagerState:null,next:null},wy(e))vy(t,n);else if(n=ty(e,t,n,o),n!==null){var r=Lo();Ir(n,e,o,r),by(n,t,o)}}function Yb(e,t,n){var o=Wi(e),r={lane:o,action:n,hasEagerState:!1,eagerState:null,next:null};if(wy(e))vy(t,r);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var s=t.lastRenderedState,a=i(s,n);if(r.hasEagerState=!0,r.eagerState=a,Ar(a,s)){var l=t.interleaved;l===null?(r.next=r,Kh(t)):(r.next=l.next,l.next=r),t.interleaved=r;return}}catch{}finally{}n=ty(e,t,r,o),n!==null&&(r=Lo(),Ir(n,e,o,r),by(n,t,o))}}function wy(e){var t=e.alternate;return e===Pn||t!==null&&t===Pn}function vy(e,t){Rl=tu=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function by(e,t,n){if(n&4194240){var o=t.lanes;o&=e.pendingLanes,n|=o,t.lanes=n,Lh(e,n)}}var nu={readContext:dr,useCallback:vo,useContext:vo,useEffect:vo,useImperativeHandle:vo,useInsertionEffect:vo,useLayoutEffect:vo,useMemo:vo,useReducer:vo,useRef:vo,useState:vo,useDebugValue:vo,useDeferredValue:vo,useTransition:vo,useMutableSource:vo,useSyncExternalStore:vo,useId:vo,unstable_isNewReconciler:!1},Vb={readContext:dr,useCallback:function(e,t){return Ur().memoizedState=[e,t===void 0?null:t],e},useContext:dr,useEffect:$1,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,$d(4194308,4,hy.bind(null,t,e),n)},useLayoutEffect:function(e,t){return $d(4194308,4,e,t)},useInsertionEffect:function(e,t){return $d(4,2,e,t)},useMemo:function(e,t){var n=Ur();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var o=Ur();return t=n!==void 0?n(t):t,o.memoizedState=o.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},o.queue=e,e=e.dispatch=Kb.bind(null,Pn,e),[o.memoizedState,e]},useRef:function(e){var t=Ur();return e={current:e},t.memoizedState=e},useState:L1,useDebugValue:tm,useDeferredValue:function(e){return Ur().memoizedState=e},useTransition:function(){var e=L1(!1),t=e[0];return e=qb.bind(null,e[1]),Ur().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var o=Pn,r=Ur();if(Ln){if(n===void 0)throw Error(Be(407));n=n()}else{if(n=t(),fo===null)throw Error(Be(349));Ss&30||sy(o,t,n)}r.memoizedState=n;var i={value:n,getSnapshot:t};return r.queue=i,$1(ly.bind(null,o,i,e),[e]),o.flags|=2048,Zl(9,ay.bind(null,o,i,n,t),void 0,null),n},useId:function(){var e=Ur(),t=fo.identifierPrefix;if(Ln){var n=di,o=ci;n=(o&~(1<<32-Nr(o)-1)).toString(32)+n,t=":"+t+"R"+n,n=Ql++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Ub++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},Gb={readContext:dr,useCallback:gy,useContext:dr,useEffect:em,useImperativeHandle:my,useInsertionEffect:py,useLayoutEffect:fy,useMemo:_y,useReducer:Ef,useRef:uy,useState:function(){return Ef(Jl)},useDebugValue:tm,useDeferredValue:function(e){var t=ur();return yy(t,ao.memoizedState,e)},useTransition:function(){var e=Ef(Jl)[0],t=ur().memoizedState;return[e,t]},useMutableSource:ry,useSyncExternalStore:iy,useId:xy,unstable_isNewReconciler:!1},Xb={readContext:dr,useCallback:gy,useContext:dr,useEffect:em,useImperativeHandle:my,useInsertionEffect:py,useLayoutEffect:fy,useMemo:_y,useReducer:Tf,useRef:uy,useState:function(){return Tf(Jl)},useDebugValue:tm,useDeferredValue:function(e){var t=ur();return ao===null?t.memoizedState=e:yy(t,ao.memoizedState,e)},useTransition:function(){var e=Tf(Jl)[0],t=ur().memoizedState;return[e,t]},useMutableSource:ry,useSyncExternalStore:iy,useId:xy,unstable_isNewReconciler:!1};function Er(e,t){if(e&&e.defaultProps){t=Dn({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function lh(e,t,n,o){t=e.memoizedState,n=n(o,t),n=n==null?t:Dn({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var mu={isMounted:function(e){return(e=e._reactInternals)?Ms(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var o=Lo(),r=Wi(e),i=ui(o,r);i.payload=t,n!=null&&(i.callback=n),t=Fi(e,i,r),t!==null&&(Ir(t,e,r,o),Ad(t,e,r))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var o=Lo(),r=Wi(e),i=ui(o,r);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Fi(e,i,r),t!==null&&(Ir(t,e,r,o),Ad(t,e,r))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Lo(),o=Wi(e),r=ui(n,o);r.tag=2,t!=null&&(r.callback=t),t=Fi(e,r,o),t!==null&&(Ir(t,e,o,n),Ad(t,e,o))}};function R1(e,t,n,o,r,i,s){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,i,s):t.prototype&&t.prototype.isPureReactComponent?!ql(n,o)||!ql(r,i):!0}function ky(e,t,n){var o=!1,r=Ui,i=t.contextType;return typeof i=="object"&&i!==null?i=dr(i):(r=Wo(t)?bs:So.current,o=t.contextTypes,i=(o=o!=null)?Ea(e,r):Ui),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=mu,e.stateNode=t,t._reactInternals=e,o&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=r,e.__reactInternalMemoizedMaskedChildContext=i),t}function O1(e,t,n,o){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,o),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,o),t.state!==e&&mu.enqueueReplaceState(t,t.state,null)}function ch(e,t,n,o){var r=e.stateNode;r.props=n,r.state=e.memoizedState,r.refs={},Yh(e);var i=t.contextType;typeof i=="object"&&i!==null?r.context=dr(i):(i=Wo(t)?bs:So.current,r.context=Ea(e,i)),r.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(lh(e,t,i,n),r.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(t=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),t!==r.state&&mu.enqueueReplaceState(r,r.state,null),Zd(e,n,r,o),r.state=e.memoizedState),typeof r.componentDidMount=="function"&&(e.flags|=4194308)}function Ia(e,t){try{var n="",o=t;do n+=Ev(o),o=o.return;while(o);var r=n}catch(i){r=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:r,digest:null}}function Mf(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function dh(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Qb=typeof WeakMap=="function"?WeakMap:Map;function Sy(e,t,n){n=ui(-1,n),n.tag=3,n.payload={element:null};var o=t.value;return n.callback=function(){ru||(ru=!0,wh=o),dh(e,t)},n}function Cy(e,t,n){n=ui(-1,n),n.tag=3;var o=e.type.getDerivedStateFromError;if(typeof o=="function"){var r=t.value;n.payload=function(){return o(r)},n.callback=function(){dh(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){dh(e,t),typeof o!="function"&&(Bi===null?Bi=new Set([this]):Bi.add(this));var s=t.stack;this.componentDidCatch(t.value,{componentStack:s!==null?s:""})}),n}function P1(e,t,n){var o=e.pingCache;if(o===null){o=e.pingCache=new Qb;var r=new Set;o.set(t,r)}else r=o.get(t),r===void 0&&(r=new Set,o.set(t,r));r.has(n)||(r.add(n),e=u4.bind(null,e,t,n),t.then(e,e))}function D1(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function z1(e,t,n,o,r){return e.mode&1?(e.flags|=65536,e.lanes=r,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=ui(-1,1),t.tag=2,Fi(n,t,1))),n.lanes|=1),e)}var Jb=gi.ReactCurrentOwner,Fo=!1;function Ao(e,t,n,o){t.child=e===null?ey(t,null,n,o):Ma(t,e.child,n,o)}function F1(e,t,n,o,r){n=n.render;var i=t.ref;return ka(t,r),o=Jh(e,t,n,o,i,r),n=Zh(),e!==null&&!Fo?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~r,mi(e,t,r)):(Ln&&n&&Bh(t),t.flags|=1,Ao(e,t,o,r),t.child)}function B1(e,t,n,o,r){if(e===null){var i=n.type;return typeof i=="function"&&!cm(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,Ey(e,t,i,o,r)):(e=Dd(n.type,null,o,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!(e.lanes&r)){var s=i.memoizedProps;if(n=n.compare,n=n!==null?n:ql,n(s,o)&&e.ref===t.ref)return mi(e,t,r)}return t.flags|=1,e=Hi(i,o),e.ref=t.ref,e.return=t,t.child=e}function Ey(e,t,n,o,r){if(e!==null){var i=e.memoizedProps;if(ql(i,o)&&e.ref===t.ref)if(Fo=!1,t.pendingProps=o=i,(e.lanes&r)!==0)e.flags&131072&&(Fo=!0);else return t.lanes=e.lanes,mi(e,t,r)}return uh(e,t,n,o,r)}function Ty(e,t,n){var o=t.pendingProps,r=o.children,i=e!==null?e.memoizedState:null;if(o.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},Sn(ya,Yo),Yo|=n;else{if(!(n&1073741824))return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,Sn(ya,Yo),Yo|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},o=i!==null?i.baseLanes:n,Sn(ya,Yo),Yo|=o}else i!==null?(o=i.baseLanes|n,t.memoizedState=null):o=n,Sn(ya,Yo),Yo|=o;return Ao(e,t,r,n),t.child}function My(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function uh(e,t,n,o,r){var i=Wo(n)?bs:So.current;return i=Ea(t,i),ka(t,r),n=Jh(e,t,n,o,i,r),o=Zh(),e!==null&&!Fo?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~r,mi(e,t,r)):(Ln&&o&&Bh(t),t.flags|=1,Ao(e,t,n,r),t.child)}function W1(e,t,n,o,r){if(Wo(n)){var i=!0;Vd(t)}else i=!1;if(ka(t,r),t.stateNode===null)Rd(e,t),ky(t,n,o),ch(t,n,o,r),o=!0;else if(e===null){var s=t.stateNode,a=t.memoizedProps;s.props=a;var l=s.context,d=n.contextType;typeof d=="object"&&d!==null?d=dr(d):(d=Wo(n)?bs:So.current,d=Ea(t,d));var c=n.getDerivedStateFromProps,p=typeof c=="function"||typeof s.getSnapshotBeforeUpdate=="function";p||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(a!==o||l!==d)&&O1(t,s,o,d),Ii=!1;var f=t.memoizedState;s.state=f,Zd(t,o,s,r),l=t.memoizedState,a!==o||f!==l||Bo.current||Ii?(typeof c=="function"&&(lh(t,n,c,o),l=t.memoizedState),(a=Ii||R1(t,n,a,o,f,l,d))?(p||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=o,t.memoizedState=l),s.props=o,s.state=l,s.context=d,o=a):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),o=!1)}else{s=t.stateNode,ny(e,t),a=t.memoizedProps,d=t.type===t.elementType?a:Er(t.type,a),s.props=d,p=t.pendingProps,f=s.context,l=n.contextType,typeof l=="object"&&l!==null?l=dr(l):(l=Wo(n)?bs:So.current,l=Ea(t,l));var C=n.getDerivedStateFromProps;(c=typeof C=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(a!==p||f!==l)&&O1(t,s,o,l),Ii=!1,f=t.memoizedState,s.state=f,Zd(t,o,s,r);var w=t.memoizedState;a!==p||f!==w||Bo.current||Ii?(typeof C=="function"&&(lh(t,n,C,o),w=t.memoizedState),(d=Ii||R1(t,n,d,o,f,w,l)||!1)?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(o,w,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(o,w,l)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||a===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=o,t.memoizedState=w),s.props=o,s.state=w,s.context=l,o=d):(typeof s.componentDidUpdate!="function"||a===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),o=!1)}return ph(e,t,n,o,i,r)}function ph(e,t,n,o,r,i){My(e,t);var s=(t.flags&128)!==0;if(!o&&!s)return r&&E1(t,n,!1),mi(e,t,i);o=t.stateNode,Jb.current=t;var a=s&&typeof n.getDerivedStateFromError!="function"?null:o.render();return t.flags|=1,e!==null&&s?(t.child=Ma(t,e.child,null,i),t.child=Ma(t,null,a,i)):Ao(e,t,a,i),t.memoizedState=o.state,r&&E1(t,n,!0),t.child}function Ny(e){var t=e.stateNode;t.pendingContext?C1(e,t.pendingContext,t.pendingContext!==t.context):t.context&&C1(e,t.context,!1),Vh(e,t.containerInfo)}function H1(e,t,n,o,r){return Ta(),Hh(r),t.flags|=256,Ao(e,t,n,o),t.child}var fh={dehydrated:null,treeContext:null,retryLane:0};function hh(e){return{baseLanes:e,cachePool:null,transitions:null}}function Iy(e,t,n){var o=t.pendingProps,r=On.current,i=!1,s=(t.flags&128)!==0,a;if((a=s)||(a=e!==null&&e.memoizedState===null?!1:(r&2)!==0),a?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(r|=1),Sn(On,r&1),e===null)return sh(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(s=o.children,e=o.fallback,i?(o=t.mode,i=t.child,s={mode:"hidden",children:s},!(o&1)&&i!==null?(i.childLanes=0,i.pendingProps=s):i=yu(s,o,0,null),e=vs(e,o,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=hh(n),t.memoizedState=fh,e):nm(t,s));if(r=e.memoizedState,r!==null&&(a=r.dehydrated,a!==null))return Zb(e,t,s,o,a,r,n);if(i){i=o.fallback,s=t.mode,r=e.child,a=r.sibling;var l={mode:"hidden",children:o.children};return!(s&1)&&t.child!==r?(o=t.child,o.childLanes=0,o.pendingProps=l,t.deletions=null):(o=Hi(r,l),o.subtreeFlags=r.subtreeFlags&14680064),a!==null?i=Hi(a,i):(i=vs(i,s,n,null),i.flags|=2),i.return=t,o.return=t,o.sibling=i,t.child=o,o=i,i=t.child,s=e.child.memoizedState,s=s===null?hh(n):{baseLanes:s.baseLanes|n,cachePool:null,transitions:s.transitions},i.memoizedState=s,i.childLanes=e.childLanes&~n,t.memoizedState=fh,o}return i=e.child,e=i.sibling,o=Hi(i,{mode:"visible",children:o.children}),!(t.mode&1)&&(o.lanes=n),o.return=t,o.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=o,t.memoizedState=null,o}function nm(e,t){return t=yu({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Cd(e,t,n,o){return o!==null&&Hh(o),Ma(t,e.child,null,n),e=nm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Zb(e,t,n,o,r,i,s){if(n)return t.flags&256?(t.flags&=-257,o=Mf(Error(Be(422))),Cd(e,t,s,o)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=o.fallback,r=t.mode,o=yu({mode:"visible",children:o.children},r,0,null),i=vs(i,r,s,null),i.flags|=2,o.return=t,i.return=t,o.sibling=i,t.child=o,t.mode&1&&Ma(t,e.child,null,s),t.child.memoizedState=hh(s),t.memoizedState=fh,i);if(!(t.mode&1))return Cd(e,t,s,null);if(r.data==="$!"){if(o=r.nextSibling&&r.nextSibling.dataset,o)var a=o.dgst;return o=a,i=Error(Be(419)),o=Mf(i,o,void 0),Cd(e,t,s,o)}if(a=(s&e.childLanes)!==0,Fo||a){if(o=fo,o!==null){switch(s&-s){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(o.suspendedLanes|s)?0:r,r!==0&&r!==i.retryLane&&(i.retryLane=r,hi(e,r),Ir(o,e,r,-1))}return lm(),o=Mf(Error(Be(421))),Cd(e,t,s,o)}return r.data==="$?"?(t.flags|=128,t.child=e.child,t=p4.bind(null,e),r._reactRetry=t,null):(e=i.treeContext,Vo=zi(r.nextSibling),Go=t,Ln=!0,Mr=null,e!==null&&(sr[ar++]=ci,sr[ar++]=di,sr[ar++]=ks,ci=e.id,di=e.overflow,ks=t),t=nm(t,o.children),t.flags|=4096,t)}function j1(e,t,n){e.lanes|=t;var o=e.alternate;o!==null&&(o.lanes|=t),ah(e.return,t,n)}function Nf(e,t,n,o,r){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:o,tail:n,tailMode:r}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=o,i.tail=n,i.tailMode=r)}function Ay(e,t,n){var o=t.pendingProps,r=o.revealOrder,i=o.tail;if(Ao(e,t,o.children,n),o=On.current,o&2)o=o&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&j1(e,n,t);else if(e.tag===19)j1(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}o&=1}if(Sn(On,o),!(t.mode&1))t.memoizedState=null;else switch(r){case"forwards":for(n=t.child,r=null;n!==null;)e=n.alternate,e!==null&&eu(e)===null&&(r=n),n=n.sibling;n=r,n===null?(r=t.child,t.child=null):(r=n.sibling,n.sibling=null),Nf(t,!1,r,n,i);break;case"backwards":for(n=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&eu(e)===null){t.child=r;break}e=r.sibling,r.sibling=n,n=r,r=e}Nf(t,!0,n,null,i);break;case"together":Nf(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Rd(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function mi(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Cs|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(Be(153));if(t.child!==null){for(e=t.child,n=Hi(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Hi(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function e4(e,t,n){switch(t.tag){case 3:Ny(t),Ta();break;case 5:oy(t);break;case 1:Wo(t.type)&&Vd(t);break;case 4:Vh(t,t.stateNode.containerInfo);break;case 10:var o=t.type._context,r=t.memoizedProps.value;Sn(Qd,o._currentValue),o._currentValue=r;break;case 13:if(o=t.memoizedState,o!==null)return o.dehydrated!==null?(Sn(On,On.current&1),t.flags|=128,null):n&t.child.childLanes?Iy(e,t,n):(Sn(On,On.current&1),e=mi(e,t,n),e!==null?e.sibling:null);Sn(On,On.current&1);break;case 19:if(o=(n&t.childLanes)!==0,e.flags&128){if(o)return Ay(e,t,n);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Sn(On,On.current),o)break;return null;case 22:case 23:return t.lanes=0,Ty(e,t,n)}return mi(e,t,n)}var Ly,mh,$y,Ry;Ly=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};mh=function(){};$y=function(e,t,n,o){var r=e.memoizedProps;if(r!==o){e=t.stateNode,xs(Yr.current);var i=null;switch(n){case"input":r=Df(e,r),o=Df(e,o),i=[];break;case"select":r=Dn({},r,{value:void 0}),o=Dn({},o,{value:void 0}),i=[];break;case"textarea":r=Bf(e,r),o=Bf(e,o),i=[];break;default:typeof r.onClick!="function"&&typeof o.onClick=="function"&&(e.onclick=Kd)}Hf(n,o);var s;n=null;for(d in r)if(!o.hasOwnProperty(d)&&r.hasOwnProperty(d)&&r[d]!=null)if(d==="style"){var a=r[d];for(s in a)a.hasOwnProperty(s)&&(n||(n={}),n[s]="")}else d!=="dangerouslySetInnerHTML"&&d!=="children"&&d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&d!=="autoFocus"&&(zl.hasOwnProperty(d)?i||(i=[]):(i=i||[]).push(d,null));for(d in o){var l=o[d];if(a=r?.[d],o.hasOwnProperty(d)&&l!==a&&(l!=null||a!=null))if(d==="style")if(a){for(s in a)!a.hasOwnProperty(s)||l&&l.hasOwnProperty(s)||(n||(n={}),n[s]="");for(s in l)l.hasOwnProperty(s)&&a[s]!==l[s]&&(n||(n={}),n[s]=l[s])}else n||(i||(i=[]),i.push(d,n)),n=l;else d==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,a=a?a.__html:void 0,l!=null&&a!==l&&(i=i||[]).push(d,l)):d==="children"?typeof l!="string"&&typeof l!="number"||(i=i||[]).push(d,""+l):d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&(zl.hasOwnProperty(d)?(l!=null&&d==="onScroll"&&En("scroll",e),i||a===l||(i=[])):(i=i||[]).push(d,l))}n&&(i=i||[]).push("style",n);var d=i;(t.updateQueue=d)&&(t.flags|=4)}};Ry=function(e,t,n,o){n!==o&&(t.flags|=4)};function bl(e,t){if(!Ln)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var o=null;n!==null;)n.alternate!==null&&(o=n),n=n.sibling;o===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null}}function bo(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,o=0;if(t)for(var r=e.child;r!==null;)n|=r.lanes|r.childLanes,o|=r.subtreeFlags&14680064,o|=r.flags&14680064,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)n|=r.lanes|r.childLanes,o|=r.subtreeFlags,o|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=o,e.childLanes=n,t}function t4(e,t,n){var o=t.pendingProps;switch(Wh(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return bo(t),null;case 1:return Wo(t.type)&&Yd(),bo(t),null;case 3:return o=t.stateNode,Na(),Tn(Bo),Tn(So),Xh(),o.pendingContext&&(o.context=o.pendingContext,o.pendingContext=null),(e===null||e.child===null)&&(kd(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Mr!==null&&(kh(Mr),Mr=null))),mh(e,t),bo(t),null;case 5:Gh(t);var r=xs(Xl.current);if(n=t.type,e!==null&&t.stateNode!=null)$y(e,t,n,o,r),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!o){if(t.stateNode===null)throw Error(Be(166));return bo(t),null}if(e=xs(Yr.current),kd(t)){o=t.stateNode,n=t.type;var i=t.memoizedProps;switch(o[qr]=t,o[Vl]=i,e=(t.mode&1)!==0,n){case"dialog":En("cancel",o),En("close",o);break;case"iframe":case"object":case"embed":En("load",o);break;case"video":case"audio":for(r=0;r<Ml.length;r++)En(Ml[r],o);break;case"source":En("error",o);break;case"img":case"image":case"link":En("error",o),En("load",o);break;case"details":En("toggle",o);break;case"input":Qg(o,i),En("invalid",o);break;case"select":o._wrapperState={wasMultiple:!!i.multiple},En("invalid",o);break;case"textarea":Zg(o,i),En("invalid",o)}Hf(n,i),r=null;for(var s in i)if(i.hasOwnProperty(s)){var a=i[s];s==="children"?typeof a=="string"?o.textContent!==a&&(i.suppressHydrationWarning!==!0&&bd(o.textContent,a,e),r=["children",a]):typeof a=="number"&&o.textContent!==""+a&&(i.suppressHydrationWarning!==!0&&bd(o.textContent,a,e),r=["children",""+a]):zl.hasOwnProperty(s)&&a!=null&&s==="onScroll"&&En("scroll",o)}switch(n){case"input":dd(o),Jg(o,i,!0);break;case"textarea":dd(o),e1(o);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(o.onclick=Kd)}o=r,t.updateQueue=o,o!==null&&(t.flags|=4)}else{s=r.nodeType===9?r:r.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=l_(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=s.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof o.is=="string"?e=s.createElement(n,{is:o.is}):(e=s.createElement(n),n==="select"&&(s=e,o.multiple?s.multiple=!0:o.size&&(s.size=o.size))):e=s.createElementNS(e,n),e[qr]=t,e[Vl]=o,Ly(e,t,!1,!1),t.stateNode=e;e:{switch(s=jf(n,o),n){case"dialog":En("cancel",e),En("close",e),r=o;break;case"iframe":case"object":case"embed":En("load",e),r=o;break;case"video":case"audio":for(r=0;r<Ml.length;r++)En(Ml[r],e);r=o;break;case"source":En("error",e),r=o;break;case"img":case"image":case"link":En("error",e),En("load",e),r=o;break;case"details":En("toggle",e),r=o;break;case"input":Qg(e,o),r=Df(e,o),En("invalid",e);break;case"option":r=o;break;case"select":e._wrapperState={wasMultiple:!!o.multiple},r=Dn({},o,{value:void 0}),En("invalid",e);break;case"textarea":Zg(e,o),r=Bf(e,o),En("invalid",e);break;default:r=o}Hf(n,r),a=r;for(i in a)if(a.hasOwnProperty(i)){var l=a[i];i==="style"?u_(e,l):i==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&c_(e,l)):i==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&Fl(e,l):typeof l=="number"&&Fl(e,""+l):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(zl.hasOwnProperty(i)?l!=null&&i==="onScroll"&&En("scroll",e):l!=null&&Eh(e,i,l,s))}switch(n){case"input":dd(e),Jg(e,o,!1);break;case"textarea":dd(e),e1(e);break;case"option":o.value!=null&&e.setAttribute("value",""+ji(o.value));break;case"select":e.multiple=!!o.multiple,i=o.value,i!=null?xa(e,!!o.multiple,i,!1):o.defaultValue!=null&&xa(e,!!o.multiple,o.defaultValue,!0);break;default:typeof r.onClick=="function"&&(e.onclick=Kd)}switch(n){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break e;case"img":o=!0;break e;default:o=!1}}o&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return bo(t),null;case 6:if(e&&t.stateNode!=null)Ry(e,t,e.memoizedProps,o);else{if(typeof o!="string"&&t.stateNode===null)throw Error(Be(166));if(n=xs(Xl.current),xs(Yr.current),kd(t)){if(o=t.stateNode,n=t.memoizedProps,o[qr]=t,(i=o.nodeValue!==n)&&(e=Go,e!==null))switch(e.tag){case 3:bd(o.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&bd(o.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else o=(n.nodeType===9?n:n.ownerDocument).createTextNode(o),o[qr]=t,t.stateNode=o}return bo(t),null;case 13:if(Tn(On),o=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(Ln&&Vo!==null&&t.mode&1&&!(t.flags&128))J_(),Ta(),t.flags|=98560,i=!1;else if(i=kd(t),o!==null&&o.dehydrated!==null){if(e===null){if(!i)throw Error(Be(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(Be(317));i[qr]=t}else Ta(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;bo(t),i=!1}else Mr!==null&&(kh(Mr),Mr=null),i=!0;if(!i)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(o=o!==null,o!==(e!==null&&e.memoizedState!==null)&&o&&(t.child.flags|=8192,t.mode&1&&(e===null||On.current&1?lo===0&&(lo=3):lm())),t.updateQueue!==null&&(t.flags|=4),bo(t),null);case 4:return Na(),mh(e,t),e===null&&Kl(t.stateNode.containerInfo),bo(t),null;case 10:return qh(t.type._context),bo(t),null;case 17:return Wo(t.type)&&Yd(),bo(t),null;case 19:if(Tn(On),i=t.memoizedState,i===null)return bo(t),null;if(o=(t.flags&128)!==0,s=i.rendering,s===null)if(o)bl(i,!1);else{if(lo!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(s=eu(e),s!==null){for(t.flags|=128,bl(i,!1),o=s.updateQueue,o!==null&&(t.updateQueue=o,t.flags|=4),t.subtreeFlags=0,o=n,n=t.child;n!==null;)i=n,e=o,i.flags&=14680066,s=i.alternate,s===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=s.childLanes,i.lanes=s.lanes,i.child=s.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=s.memoizedProps,i.memoizedState=s.memoizedState,i.updateQueue=s.updateQueue,i.type=s.type,e=s.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return Sn(On,On.current&1|2),t.child}e=e.sibling}i.tail!==null&&Jn()>Aa&&(t.flags|=128,o=!0,bl(i,!1),t.lanes=4194304)}else{if(!o)if(e=eu(s),e!==null){if(t.flags|=128,o=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),bl(i,!0),i.tail===null&&i.tailMode==="hidden"&&!s.alternate&&!Ln)return bo(t),null}else 2*Jn()-i.renderingStartTime>Aa&&n!==1073741824&&(t.flags|=128,o=!0,bl(i,!1),t.lanes=4194304);i.isBackwards?(s.sibling=t.child,t.child=s):(n=i.last,n!==null?n.sibling=s:t.child=s,i.last=s)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=Jn(),t.sibling=null,n=On.current,Sn(On,o?n&1|2:n&1),t):(bo(t),null);case 22:case 23:return am(),o=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==o&&(t.flags|=8192),o&&t.mode&1?Yo&1073741824&&(bo(t),t.subtreeFlags&6&&(t.flags|=8192)):bo(t),null;case 24:return null;case 25:return null}throw Error(Be(156,t.tag))}function n4(e,t){switch(Wh(t),t.tag){case 1:return Wo(t.type)&&Yd(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Na(),Tn(Bo),Tn(So),Xh(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return Gh(t),null;case 13:if(Tn(On),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(Be(340));Ta()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Tn(On),null;case 4:return Na(),null;case 10:return qh(t.type._context),null;case 22:case 23:return am(),null;case 24:return null;default:return null}}var Ed=!1,ko=!1,o4=typeof WeakSet=="function"?WeakSet:Set,ft=null;function _a(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(o){Un(e,t,o)}else n.current=null}function gh(e,t,n){try{n()}catch(o){Un(e,t,o)}}var U1=!1;function r4(e,t){if(Zf=jd,e=F_(),Fh(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var r=o.anchorOffset,i=o.focusNode;o=o.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var s=0,a=-1,l=-1,d=0,c=0,p=e,f=null;t:for(;;){for(var C;p!==n||r!==0&&p.nodeType!==3||(a=s+r),p!==i||o!==0&&p.nodeType!==3||(l=s+o),p.nodeType===3&&(s+=p.nodeValue.length),(C=p.firstChild)!==null;)f=p,p=C;for(;;){if(p===e)break t;if(f===n&&++d===r&&(a=s),f===i&&++c===o&&(l=s),(C=p.nextSibling)!==null)break;p=f,f=p.parentNode}p=C}n=a===-1||l===-1?null:{start:a,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(eh={focusedElem:e,selectionRange:n},jd=!1,ft=t;ft!==null;)if(t=ft,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,ft=e;else for(;ft!==null;){t=ft;try{var w=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var m=w.memoizedProps,S=w.memoizedState,g=t.stateNode,y=g.getSnapshotBeforeUpdate(t.elementType===t.type?m:Er(t.type,m),S);g.__reactInternalSnapshotBeforeUpdate=y}break;case 3:var E=t.stateNode.containerInfo;E.nodeType===1?E.textContent="":E.nodeType===9&&E.documentElement&&E.removeChild(E.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(Be(163))}}catch(A){Un(t,t.return,A)}if(e=t.sibling,e!==null){e.return=t.return,ft=e;break}ft=t.return}return w=U1,U1=!1,w}function Ol(e,t,n){var o=t.updateQueue;if(o=o!==null?o.lastEffect:null,o!==null){var r=o=o.next;do{if((r.tag&e)===e){var i=r.destroy;r.destroy=void 0,i!==void 0&&gh(t,n,i)}r=r.next}while(r!==o)}}function gu(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var o=n.create;n.destroy=o()}n=n.next}while(n!==t)}}function _h(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function Oy(e){var t=e.alternate;t!==null&&(e.alternate=null,Oy(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[qr],delete t[Vl],delete t[oh],delete t[Bb],delete t[Wb])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Py(e){return e.tag===5||e.tag===3||e.tag===4}function q1(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Py(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function yh(e,t,n){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Kd));else if(o!==4&&(e=e.child,e!==null))for(yh(e,t,n),e=e.sibling;e!==null;)yh(e,t,n),e=e.sibling}function xh(e,t,n){var o=e.tag;if(o===5||o===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(o!==4&&(e=e.child,e!==null))for(xh(e,t,n),e=e.sibling;e!==null;)xh(e,t,n),e=e.sibling}var _o=null,Tr=!1;function Mi(e,t,n){for(n=n.child;n!==null;)Dy(e,t,n),n=n.sibling}function Dy(e,t,n){if(Kr&&typeof Kr.onCommitFiberUnmount=="function")try{Kr.onCommitFiberUnmount(lu,n)}catch{}switch(n.tag){case 5:ko||_a(n,t);case 6:var o=_o,r=Tr;_o=null,Mi(e,t,n),_o=o,Tr=r,_o!==null&&(Tr?(e=_o,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):_o.removeChild(n.stateNode));break;case 18:_o!==null&&(Tr?(e=_o,n=n.stateNode,e.nodeType===8?bf(e.parentNode,n):e.nodeType===1&&bf(e,n),jl(e)):bf(_o,n.stateNode));break;case 4:o=_o,r=Tr,_o=n.stateNode.containerInfo,Tr=!0,Mi(e,t,n),_o=o,Tr=r;break;case 0:case 11:case 14:case 15:if(!ko&&(o=n.updateQueue,o!==null&&(o=o.lastEffect,o!==null))){r=o=o.next;do{var i=r,s=i.destroy;i=i.tag,s!==void 0&&(i&2||i&4)&&gh(n,t,s),r=r.next}while(r!==o)}Mi(e,t,n);break;case 1:if(!ko&&(_a(n,t),o=n.stateNode,typeof o.componentWillUnmount=="function"))try{o.props=n.memoizedProps,o.state=n.memoizedState,o.componentWillUnmount()}catch(a){Un(n,t,a)}Mi(e,t,n);break;case 21:Mi(e,t,n);break;case 22:n.mode&1?(ko=(o=ko)||n.memoizedState!==null,Mi(e,t,n),ko=o):Mi(e,t,n);break;default:Mi(e,t,n)}}function K1(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new o4),t.forEach(function(o){var r=f4.bind(null,e,o);n.has(o)||(n.add(o),o.then(r,r))})}}function Cr(e,t){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var r=n[o];try{var i=e,s=t,a=s;e:for(;a!==null;){switch(a.tag){case 5:_o=a.stateNode,Tr=!1;break e;case 3:_o=a.stateNode.containerInfo,Tr=!0;break e;case 4:_o=a.stateNode.containerInfo,Tr=!0;break e}a=a.return}if(_o===null)throw Error(Be(160));Dy(i,s,r),_o=null,Tr=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(d){Un(r,t,d)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)zy(t,e),t=t.sibling}function zy(e,t){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(Cr(t,e),jr(e),o&4){try{Ol(3,e,e.return),gu(3,e)}catch(m){Un(e,e.return,m)}try{Ol(5,e,e.return)}catch(m){Un(e,e.return,m)}}break;case 1:Cr(t,e),jr(e),o&512&&n!==null&&_a(n,n.return);break;case 5:if(Cr(t,e),jr(e),o&512&&n!==null&&_a(n,n.return),e.flags&32){var r=e.stateNode;try{Fl(r,"")}catch(m){Un(e,e.return,m)}}if(o&4&&(r=e.stateNode,r!=null)){var i=e.memoizedProps,s=n!==null?n.memoizedProps:i,a=e.type,l=e.updateQueue;if(e.updateQueue=null,l!==null)try{a==="input"&&i.type==="radio"&&i.name!=null&&s_(r,i),jf(a,s);var d=jf(a,i);for(s=0;s<l.length;s+=2){var c=l[s],p=l[s+1];c==="style"?u_(r,p):c==="dangerouslySetInnerHTML"?c_(r,p):c==="children"?Fl(r,p):Eh(r,c,p,d)}switch(a){case"input":zf(r,i);break;case"textarea":a_(r,i);break;case"select":var f=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!i.multiple;var C=i.value;C!=null?xa(r,!!i.multiple,C,!1):f!==!!i.multiple&&(i.defaultValue!=null?xa(r,!!i.multiple,i.defaultValue,!0):xa(r,!!i.multiple,i.multiple?[]:"",!1))}r[Vl]=i}catch(m){Un(e,e.return,m)}}break;case 6:if(Cr(t,e),jr(e),o&4){if(e.stateNode===null)throw Error(Be(162));r=e.stateNode,i=e.memoizedProps;try{r.nodeValue=i}catch(m){Un(e,e.return,m)}}break;case 3:if(Cr(t,e),jr(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{jl(t.containerInfo)}catch(m){Un(e,e.return,m)}break;case 4:Cr(t,e),jr(e);break;case 13:Cr(t,e),jr(e),r=e.child,r.flags&8192&&(i=r.memoizedState!==null,r.stateNode.isHidden=i,!i||r.alternate!==null&&r.alternate.memoizedState!==null||(im=Jn())),o&4&&K1(e);break;case 22:if(c=n!==null&&n.memoizedState!==null,e.mode&1?(ko=(d=ko)||c,Cr(t,e),ko=d):Cr(t,e),jr(e),o&8192){if(d=e.memoizedState!==null,(e.stateNode.isHidden=d)&&!c&&e.mode&1)for(ft=e,c=e.child;c!==null;){for(p=ft=c;ft!==null;){switch(f=ft,C=f.child,f.tag){case 0:case 11:case 14:case 15:Ol(4,f,f.return);break;case 1:_a(f,f.return);var w=f.stateNode;if(typeof w.componentWillUnmount=="function"){o=f,n=f.return;try{t=o,w.props=t.memoizedProps,w.state=t.memoizedState,w.componentWillUnmount()}catch(m){Un(o,n,m)}}break;case 5:_a(f,f.return);break;case 22:if(f.memoizedState!==null){V1(p);continue}}C!==null?(C.return=f,ft=C):V1(p)}c=c.sibling}e:for(c=null,p=e;;){if(p.tag===5){if(c===null){c=p;try{r=p.stateNode,d?(i=r.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(a=p.stateNode,l=p.memoizedProps.style,s=l!=null&&l.hasOwnProperty("display")?l.display:null,a.style.display=d_("display",s))}catch(m){Un(e,e.return,m)}}}else if(p.tag===6){if(c===null)try{p.stateNode.nodeValue=d?"":p.memoizedProps}catch(m){Un(e,e.return,m)}}else if((p.tag!==22&&p.tag!==23||p.memoizedState===null||p===e)&&p.child!==null){p.child.return=p,p=p.child;continue}if(p===e)break e;for(;p.sibling===null;){if(p.return===null||p.return===e)break e;c===p&&(c=null),p=p.return}c===p&&(c=null),p.sibling.return=p.return,p=p.sibling}}break;case 19:Cr(t,e),jr(e),o&4&&K1(e);break;case 21:break;default:Cr(t,e),jr(e)}}function jr(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Py(n)){var o=n;break e}n=n.return}throw Error(Be(160))}switch(o.tag){case 5:var r=o.stateNode;o.flags&32&&(Fl(r,""),o.flags&=-33);var i=q1(e);xh(e,i,r);break;case 3:case 4:var s=o.stateNode.containerInfo,a=q1(e);yh(e,a,s);break;default:throw Error(Be(161))}}catch(l){Un(e,e.return,l)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function i4(e,t,n){ft=e,Fy(e,t,n)}function Fy(e,t,n){for(var o=(e.mode&1)!==0;ft!==null;){var r=ft,i=r.child;if(r.tag===22&&o){var s=r.memoizedState!==null||Ed;if(!s){var a=r.alternate,l=a!==null&&a.memoizedState!==null||ko;a=Ed;var d=ko;if(Ed=s,(ko=l)&&!d)for(ft=r;ft!==null;)s=ft,l=s.child,s.tag===22&&s.memoizedState!==null?G1(r):l!==null?(l.return=s,ft=l):G1(r);for(;i!==null;)ft=i,Fy(i,t,n),i=i.sibling;ft=r,Ed=a,ko=d}Y1(e,t,n)}else r.subtreeFlags&8772&&i!==null?(i.return=r,ft=i):Y1(e,t,n)}}function Y1(e){for(;ft!==null;){var t=ft;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:ko||gu(5,t);break;case 1:var o=t.stateNode;if(t.flags&4&&!ko)if(n===null)o.componentDidMount();else{var r=t.elementType===t.type?n.memoizedProps:Er(t.type,n.memoizedProps);o.componentDidUpdate(r,n.memoizedState,o.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&A1(t,i,o);break;case 3:var s=t.updateQueue;if(s!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}A1(t,s,n)}break;case 5:var a=t.stateNode;if(n===null&&t.flags&4){n=a;var l=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var d=t.alternate;if(d!==null){var c=d.memoizedState;if(c!==null){var p=c.dehydrated;p!==null&&jl(p)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(Be(163))}ko||t.flags&512&&_h(t)}catch(f){Un(t,t.return,f)}}if(t===e){ft=null;break}if(n=t.sibling,n!==null){n.return=t.return,ft=n;break}ft=t.return}}function V1(e){for(;ft!==null;){var t=ft;if(t===e){ft=null;break}var n=t.sibling;if(n!==null){n.return=t.return,ft=n;break}ft=t.return}}function G1(e){for(;ft!==null;){var t=ft;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{gu(4,t)}catch(l){Un(t,n,l)}break;case 1:var o=t.stateNode;if(typeof o.componentDidMount=="function"){var r=t.return;try{o.componentDidMount()}catch(l){Un(t,r,l)}}var i=t.return;try{_h(t)}catch(l){Un(t,i,l)}break;case 5:var s=t.return;try{_h(t)}catch(l){Un(t,s,l)}}}catch(l){Un(t,t.return,l)}if(t===e){ft=null;break}var a=t.sibling;if(a!==null){a.return=t.return,ft=a;break}ft=t.return}}var s4=Math.ceil,ou=gi.ReactCurrentDispatcher,om=gi.ReactCurrentOwner,cr=gi.ReactCurrentBatchConfig,rn=0,fo=null,to=null,yo=0,Yo=0,ya=Ki(0),lo=0,ec=null,Cs=0,_u=0,rm=0,Pl=null,zo=null,im=0,Aa=1/0,ai=null,ru=!1,wh=null,Bi=null,Td=!1,Ri=null,iu=0,Dl=0,vh=null,Od=-1,Pd=0;function Lo(){return rn&6?Jn():Od!==-1?Od:Od=Jn()}function Wi(e){return e.mode&1?rn&2&&yo!==0?yo&-yo:jb.transition!==null?(Pd===0&&(Pd=k_()),Pd):(e=fn,e!==0||(e=window.event,e=e===void 0?16:I_(e.type)),e):1}function Ir(e,t,n,o){if(50<Dl)throw Dl=0,vh=null,Error(Be(185));tc(e,n,o),(!(rn&2)||e!==fo)&&(e===fo&&(!(rn&2)&&(_u|=n),lo===4&&Li(e,yo)),Ho(e,o),n===1&&rn===0&&!(t.mode&1)&&(Aa=Jn()+500,fu&&Yi()))}function Ho(e,t){var n=e.callbackNode;qv(e,t);var o=Hd(e,e===fo?yo:0);if(o===0)n!==null&&o1(n),e.callbackNode=null,e.callbackPriority=0;else if(t=o&-o,e.callbackPriority!==t){if(n!=null&&o1(n),t===1)e.tag===0?Hb(X1.bind(null,e)):G_(X1.bind(null,e)),zb(function(){!(rn&6)&&Yi()}),n=null;else{switch(S_(o)){case 1:n=Ah;break;case 4:n=v_;break;case 16:n=Wd;break;case 536870912:n=b_;break;default:n=Wd}n=Yy(n,By.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function By(e,t){if(Od=-1,Pd=0,rn&6)throw Error(Be(327));var n=e.callbackNode;if(Sa()&&e.callbackNode!==n)return null;var o=Hd(e,e===fo?yo:0);if(o===0)return null;if(o&30||o&e.expiredLanes||t)t=su(e,o);else{t=o;var r=rn;rn|=2;var i=Hy();(fo!==e||yo!==t)&&(ai=null,Aa=Jn()+500,ws(e,t));do try{c4();break}catch(a){Wy(e,a)}while(!0);Uh(),ou.current=i,rn=r,to!==null?t=0:(fo=null,yo=0,t=lo)}if(t!==0){if(t===2&&(r=Vf(e),r!==0&&(o=r,t=bh(e,r))),t===1)throw n=ec,ws(e,0),Li(e,o),Ho(e,Jn()),n;if(t===6)Li(e,o);else{if(r=e.current.alternate,!(o&30)&&!a4(r)&&(t=su(e,o),t===2&&(i=Vf(e),i!==0&&(o=i,t=bh(e,i))),t===1))throw n=ec,ws(e,0),Li(e,o),Ho(e,Jn()),n;switch(e.finishedWork=r,e.finishedLanes=o,t){case 0:case 1:throw Error(Be(345));case 2:gs(e,zo,ai);break;case 3:if(Li(e,o),(o&130023424)===o&&(t=im+500-Jn(),10<t)){if(Hd(e,0)!==0)break;if(r=e.suspendedLanes,(r&o)!==o){Lo(),e.pingedLanes|=e.suspendedLanes&r;break}e.timeoutHandle=nh(gs.bind(null,e,zo,ai),t);break}gs(e,zo,ai);break;case 4:if(Li(e,o),(o&4194240)===o)break;for(t=e.eventTimes,r=-1;0<o;){var s=31-Nr(o);i=1<<s,s=t[s],s>r&&(r=s),o&=~i}if(o=r,o=Jn()-o,o=(120>o?120:480>o?480:1080>o?1080:1920>o?1920:3e3>o?3e3:4320>o?4320:1960*s4(o/1960))-o,10<o){e.timeoutHandle=nh(gs.bind(null,e,zo,ai),o);break}gs(e,zo,ai);break;case 5:gs(e,zo,ai);break;default:throw Error(Be(329))}}}return Ho(e,Jn()),e.callbackNode===n?By.bind(null,e):null}function bh(e,t){var n=Pl;return e.current.memoizedState.isDehydrated&&(ws(e,t).flags|=256),e=su(e,t),e!==2&&(t=zo,zo=n,t!==null&&kh(t)),e}function kh(e){zo===null?zo=e:zo.push.apply(zo,e)}function a4(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var o=0;o<n.length;o++){var r=n[o],i=r.getSnapshot;r=r.value;try{if(!Ar(i(),r))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Li(e,t){for(t&=~rm,t&=~_u,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Nr(t),o=1<<n;e[n]=-1,t&=~o}}function X1(e){if(rn&6)throw Error(Be(327));Sa();var t=Hd(e,0);if(!(t&1))return Ho(e,Jn()),null;var n=su(e,t);if(e.tag!==0&&n===2){var o=Vf(e);o!==0&&(t=o,n=bh(e,o))}if(n===1)throw n=ec,ws(e,0),Li(e,t),Ho(e,Jn()),n;if(n===6)throw Error(Be(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,gs(e,zo,ai),Ho(e,Jn()),null}function sm(e,t){var n=rn;rn|=1;try{return e(t)}finally{rn=n,rn===0&&(Aa=Jn()+500,fu&&Yi())}}function Es(e){Ri!==null&&Ri.tag===0&&!(rn&6)&&Sa();var t=rn;rn|=1;var n=cr.transition,o=fn;try{if(cr.transition=null,fn=1,e)return e()}finally{fn=o,cr.transition=n,rn=t,!(rn&6)&&Yi()}}function am(){Yo=ya.current,Tn(ya)}function ws(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Db(n)),to!==null)for(n=to.return;n!==null;){var o=n;switch(Wh(o),o.tag){case 1:o=o.type.childContextTypes,o!=null&&Yd();break;case 3:Na(),Tn(Bo),Tn(So),Xh();break;case 5:Gh(o);break;case 4:Na();break;case 13:Tn(On);break;case 19:Tn(On);break;case 10:qh(o.type._context);break;case 22:case 23:am()}n=n.return}if(fo=e,to=e=Hi(e.current,null),yo=Yo=t,lo=0,ec=null,rm=_u=Cs=0,zo=Pl=null,ys!==null){for(t=0;t<ys.length;t++)if(n=ys[t],o=n.interleaved,o!==null){n.interleaved=null;var r=o.next,i=n.pending;if(i!==null){var s=i.next;i.next=r,o.next=s}n.pending=o}ys=null}return e}function Wy(e,t){do{var n=to;try{if(Uh(),Ld.current=nu,tu){for(var o=Pn.memoizedState;o!==null;){var r=o.queue;r!==null&&(r.pending=null),o=o.next}tu=!1}if(Ss=0,po=ao=Pn=null,Rl=!1,Ql=0,om.current=null,n===null||n.return===null){lo=1,ec=t,to=null;break}e:{var i=e,s=n.return,a=n,l=t;if(t=yo,a.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var d=l,c=a,p=c.tag;if(!(c.mode&1)&&(p===0||p===11||p===15)){var f=c.alternate;f?(c.updateQueue=f.updateQueue,c.memoizedState=f.memoizedState,c.lanes=f.lanes):(c.updateQueue=null,c.memoizedState=null)}var C=D1(s);if(C!==null){C.flags&=-257,z1(C,s,a,i,t),C.mode&1&&P1(i,d,t),t=C,l=d;var w=t.updateQueue;if(w===null){var m=new Set;m.add(l),t.updateQueue=m}else w.add(l);break e}else{if(!(t&1)){P1(i,d,t),lm();break e}l=Error(Be(426))}}else if(Ln&&a.mode&1){var S=D1(s);if(S!==null){!(S.flags&65536)&&(S.flags|=256),z1(S,s,a,i,t),Hh(Ia(l,a));break e}}i=l=Ia(l,a),lo!==4&&(lo=2),Pl===null?Pl=[i]:Pl.push(i),i=s;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var g=Sy(i,l,t);I1(i,g);break e;case 1:a=l;var y=i.type,E=i.stateNode;if(!(i.flags&128)&&(typeof y.getDerivedStateFromError=="function"||E!==null&&typeof E.componentDidCatch=="function"&&(Bi===null||!Bi.has(E)))){i.flags|=65536,t&=-t,i.lanes|=t;var A=Cy(i,a,t);I1(i,A);break e}}i=i.return}while(i!==null)}Uy(n)}catch(Q){t=Q,to===n&&n!==null&&(to=n=n.return);continue}break}while(!0)}function Hy(){var e=ou.current;return ou.current=nu,e===null?nu:e}function lm(){(lo===0||lo===3||lo===2)&&(lo=4),fo===null||!(Cs&268435455)&&!(_u&268435455)||Li(fo,yo)}function su(e,t){var n=rn;rn|=2;var o=Hy();(fo!==e||yo!==t)&&(ai=null,ws(e,t));do try{l4();break}catch(r){Wy(e,r)}while(!0);if(Uh(),rn=n,ou.current=o,to!==null)throw Error(Be(261));return fo=null,yo=0,lo}function l4(){for(;to!==null;)jy(to)}function c4(){for(;to!==null&&!Pv();)jy(to)}function jy(e){var t=Ky(e.alternate,e,Yo);e.memoizedProps=e.pendingProps,t===null?Uy(e):to=t,om.current=null}function Uy(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=n4(n,t),n!==null){n.flags&=32767,to=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{lo=6,to=null;return}}else if(n=t4(n,t,Yo),n!==null){to=n;return}if(t=t.sibling,t!==null){to=t;return}to=t=e}while(t!==null);lo===0&&(lo=5)}function gs(e,t,n){var o=fn,r=cr.transition;try{cr.transition=null,fn=1,d4(e,t,n,o)}finally{cr.transition=r,fn=o}return null}function d4(e,t,n,o){do Sa();while(Ri!==null);if(rn&6)throw Error(Be(327));n=e.finishedWork;var r=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(Be(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(Kv(e,i),e===fo&&(to=fo=null,yo=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Td||(Td=!0,Yy(Wd,function(){return Sa(),null})),i=(n.flags&15990)!==0,n.subtreeFlags&15990||i){i=cr.transition,cr.transition=null;var s=fn;fn=1;var a=rn;rn|=4,om.current=null,r4(e,n),zy(n,e),Lb(eh),jd=!!Zf,eh=Zf=null,e.current=n,i4(n,e,r),Dv(),rn=a,fn=s,cr.transition=i}else e.current=n;if(Td&&(Td=!1,Ri=e,iu=r),i=e.pendingLanes,i===0&&(Bi=null),Bv(n.stateNode,o),Ho(e,Jn()),t!==null)for(o=e.onRecoverableError,n=0;n<t.length;n++)r=t[n],o(r.value,{componentStack:r.stack,digest:r.digest});if(ru)throw ru=!1,e=wh,wh=null,e;return iu&1&&e.tag!==0&&Sa(),i=e.pendingLanes,i&1?e===vh?Dl++:(Dl=0,vh=e):Dl=0,Yi(),null}function Sa(){if(Ri!==null){var e=S_(iu),t=cr.transition,n=fn;try{if(cr.transition=null,fn=16>e?16:e,Ri===null)var o=!1;else{if(e=Ri,Ri=null,iu=0,rn&6)throw Error(Be(331));var r=rn;for(rn|=4,ft=e.current;ft!==null;){var i=ft,s=i.child;if(ft.flags&16){var a=i.deletions;if(a!==null){for(var l=0;l<a.length;l++){var d=a[l];for(ft=d;ft!==null;){var c=ft;switch(c.tag){case 0:case 11:case 15:Ol(8,c,i)}var p=c.child;if(p!==null)p.return=c,ft=p;else for(;ft!==null;){c=ft;var f=c.sibling,C=c.return;if(Oy(c),c===d){ft=null;break}if(f!==null){f.return=C,ft=f;break}ft=C}}}var w=i.alternate;if(w!==null){var m=w.child;if(m!==null){w.child=null;do{var S=m.sibling;m.sibling=null,m=S}while(m!==null)}}ft=i}}if(i.subtreeFlags&2064&&s!==null)s.return=i,ft=s;else e:for(;ft!==null;){if(i=ft,i.flags&2048)switch(i.tag){case 0:case 11:case 15:Ol(9,i,i.return)}var g=i.sibling;if(g!==null){g.return=i.return,ft=g;break e}ft=i.return}}var y=e.current;for(ft=y;ft!==null;){s=ft;var E=s.child;if(s.subtreeFlags&2064&&E!==null)E.return=s,ft=E;else e:for(s=y;ft!==null;){if(a=ft,a.flags&2048)try{switch(a.tag){case 0:case 11:case 15:gu(9,a)}}catch(Q){Un(a,a.return,Q)}if(a===s){ft=null;break e}var A=a.sibling;if(A!==null){A.return=a.return,ft=A;break e}ft=a.return}}if(rn=r,Yi(),Kr&&typeof Kr.onPostCommitFiberRoot=="function")try{Kr.onPostCommitFiberRoot(lu,e)}catch{}o=!0}return o}finally{fn=n,cr.transition=t}}return!1}function Q1(e,t,n){t=Ia(n,t),t=Sy(e,t,1),e=Fi(e,t,1),t=Lo(),e!==null&&(tc(e,1,t),Ho(e,t))}function Un(e,t,n){if(e.tag===3)Q1(e,e,n);else for(;t!==null;){if(t.tag===3){Q1(t,e,n);break}else if(t.tag===1){var o=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Bi===null||!Bi.has(o))){e=Ia(n,e),e=Cy(t,e,1),t=Fi(t,e,1),e=Lo(),t!==null&&(tc(t,1,e),Ho(t,e));break}}t=t.return}}function u4(e,t,n){var o=e.pingCache;o!==null&&o.delete(t),t=Lo(),e.pingedLanes|=e.suspendedLanes&n,fo===e&&(yo&n)===n&&(lo===4||lo===3&&(yo&130023424)===yo&&500>Jn()-im?ws(e,0):rm|=n),Ho(e,t)}function qy(e,t){t===0&&(e.mode&1?(t=fd,fd<<=1,!(fd&130023424)&&(fd=4194304)):t=1);var n=Lo();e=hi(e,t),e!==null&&(tc(e,t,n),Ho(e,n))}function p4(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),qy(e,n)}function f4(e,t){var n=0;switch(e.tag){case 13:var o=e.stateNode,r=e.memoizedState;r!==null&&(n=r.retryLane);break;case 19:o=e.stateNode;break;default:throw Error(Be(314))}o!==null&&o.delete(t),qy(e,n)}var Ky;Ky=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||Bo.current)Fo=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return Fo=!1,e4(e,t,n);Fo=!!(e.flags&131072)}else Fo=!1,Ln&&t.flags&1048576&&X_(t,Xd,t.index);switch(t.lanes=0,t.tag){case 2:var o=t.type;Rd(e,t),e=t.pendingProps;var r=Ea(t,So.current);ka(t,n),r=Jh(null,t,o,e,r,n);var i=Zh();return t.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Wo(o)?(i=!0,Vd(t)):i=!1,t.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Yh(t),r.updater=mu,t.stateNode=r,r._reactInternals=t,ch(t,o,e,n),t=ph(null,t,o,!0,i,n)):(t.tag=0,Ln&&i&&Bh(t),Ao(null,t,r,n),t=t.child),t;case 16:o=t.elementType;e:{switch(Rd(e,t),e=t.pendingProps,r=o._init,o=r(o._payload),t.type=o,r=t.tag=m4(o),e=Er(o,e),r){case 0:t=uh(null,t,o,e,n);break e;case 1:t=W1(null,t,o,e,n);break e;case 11:t=F1(null,t,o,e,n);break e;case 14:t=B1(null,t,o,Er(o.type,e),n);break e}throw Error(Be(306,o,""))}return t;case 0:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:Er(o,r),uh(e,t,o,r,n);case 1:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:Er(o,r),W1(e,t,o,r,n);case 3:e:{if(Ny(t),e===null)throw Error(Be(387));o=t.pendingProps,i=t.memoizedState,r=i.element,ny(e,t),Zd(t,o,null,n);var s=t.memoizedState;if(o=s.element,i.isDehydrated)if(i={element:o,isDehydrated:!1,cache:s.cache,pendingSuspenseBoundaries:s.pendingSuspenseBoundaries,transitions:s.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){r=Ia(Error(Be(423)),t),t=H1(e,t,o,n,r);break e}else if(o!==r){r=Ia(Error(Be(424)),t),t=H1(e,t,o,n,r);break e}else for(Vo=zi(t.stateNode.containerInfo.firstChild),Go=t,Ln=!0,Mr=null,n=ey(t,null,o,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Ta(),o===r){t=mi(e,t,n);break e}Ao(e,t,o,n)}t=t.child}return t;case 5:return oy(t),e===null&&sh(t),o=t.type,r=t.pendingProps,i=e!==null?e.memoizedProps:null,s=r.children,th(o,r)?s=null:i!==null&&th(o,i)&&(t.flags|=32),My(e,t),Ao(e,t,s,n),t.child;case 6:return e===null&&sh(t),null;case 13:return Iy(e,t,n);case 4:return Vh(t,t.stateNode.containerInfo),o=t.pendingProps,e===null?t.child=Ma(t,null,o,n):Ao(e,t,o,n),t.child;case 11:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:Er(o,r),F1(e,t,o,r,n);case 7:return Ao(e,t,t.pendingProps,n),t.child;case 8:return Ao(e,t,t.pendingProps.children,n),t.child;case 12:return Ao(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(o=t.type._context,r=t.pendingProps,i=t.memoizedProps,s=r.value,Sn(Qd,o._currentValue),o._currentValue=s,i!==null)if(Ar(i.value,s)){if(i.children===r.children&&!Bo.current){t=mi(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var a=i.dependencies;if(a!==null){s=i.child;for(var l=a.firstContext;l!==null;){if(l.context===o){if(i.tag===1){l=ui(-1,n&-n),l.tag=2;var d=i.updateQueue;if(d!==null){d=d.shared;var c=d.pending;c===null?l.next=l:(l.next=c.next,c.next=l),d.pending=l}}i.lanes|=n,l=i.alternate,l!==null&&(l.lanes|=n),ah(i.return,n,t),a.lanes|=n;break}l=l.next}}else if(i.tag===10)s=i.type===t.type?null:i.child;else if(i.tag===18){if(s=i.return,s===null)throw Error(Be(341));s.lanes|=n,a=s.alternate,a!==null&&(a.lanes|=n),ah(s,n,t),s=i.sibling}else s=i.child;if(s!==null)s.return=i;else for(s=i;s!==null;){if(s===t){s=null;break}if(i=s.sibling,i!==null){i.return=s.return,s=i;break}s=s.return}i=s}Ao(e,t,r.children,n),t=t.child}return t;case 9:return r=t.type,o=t.pendingProps.children,ka(t,n),r=dr(r),o=o(r),t.flags|=1,Ao(e,t,o,n),t.child;case 14:return o=t.type,r=Er(o,t.pendingProps),r=Er(o.type,r),B1(e,t,o,r,n);case 15:return Ey(e,t,t.type,t.pendingProps,n);case 17:return o=t.type,r=t.pendingProps,r=t.elementType===o?r:Er(o,r),Rd(e,t),t.tag=1,Wo(o)?(e=!0,Vd(t)):e=!1,ka(t,n),ky(t,o,r),ch(t,o,r,n),ph(null,t,o,!0,e,n);case 19:return Ay(e,t,n);case 22:return Ty(e,t,n)}throw Error(Be(156,t.tag))};function Yy(e,t){return w_(e,t)}function h4(e,t,n,o){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function lr(e,t,n,o){return new h4(e,t,n,o)}function cm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function m4(e){if(typeof e=="function")return cm(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Mh)return 11;if(e===Nh)return 14}return 2}function Hi(e,t){var n=e.alternate;return n===null?(n=lr(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Dd(e,t,n,o,r,i){var s=2;if(o=e,typeof e=="function")cm(e)&&(s=1);else if(typeof e=="string")s=5;else e:switch(e){case la:return vs(n.children,r,i,t);case Th:s=8,r|=8;break;case $f:return e=lr(12,n,t,r|2),e.elementType=$f,e.lanes=i,e;case Rf:return e=lr(13,n,t,r),e.elementType=Rf,e.lanes=i,e;case Of:return e=lr(19,n,t,r),e.elementType=Of,e.lanes=i,e;case o_:return yu(n,r,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case t_:s=10;break e;case n_:s=9;break e;case Mh:s=11;break e;case Nh:s=14;break e;case Ni:s=16,o=null;break e}throw Error(Be(130,e==null?e:typeof e,""))}return t=lr(s,n,t,r),t.elementType=e,t.type=o,t.lanes=i,t}function vs(e,t,n,o){return e=lr(7,e,o,t),e.lanes=n,e}function yu(e,t,n,o){return e=lr(22,e,o,t),e.elementType=o_,e.lanes=n,e.stateNode={isHidden:!1},e}function If(e,t,n){return e=lr(6,e,null,t),e.lanes=n,e}function Af(e,t,n){return t=lr(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function g4(e,t,n,o,r){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=hf(0),this.expirationTimes=hf(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=hf(0),this.identifierPrefix=o,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function dm(e,t,n,o,r,i,s,a,l){return e=new g4(e,t,n,a,l),t===1?(t=1,i===!0&&(t|=8)):t=0,i=lr(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:o,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Yh(i),e}function _4(e,t,n){var o=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:aa,key:o==null?null:""+o,children:e,containerInfo:t,implementation:n}}function Vy(e){if(!e)return Ui;e=e._reactInternals;e:{if(Ms(e)!==e||e.tag!==1)throw Error(Be(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Wo(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(Be(171))}if(e.tag===1){var n=e.type;if(Wo(n))return V_(e,n,t)}return t}function Gy(e,t,n,o,r,i,s,a,l){return e=dm(n,o,!0,e,r,i,s,a,l),e.context=Vy(null),n=e.current,o=Lo(),r=Wi(n),i=ui(o,r),i.callback=t??null,Fi(n,i,r),e.current.lanes=r,tc(e,r,o),Ho(e,o),e}function xu(e,t,n,o){var r=t.current,i=Lo(),s=Wi(r);return n=Vy(n),t.context===null?t.context=n:t.pendingContext=n,t=ui(i,s),t.payload={element:e},o=o===void 0?null:o,o!==null&&(t.callback=o),e=Fi(r,t,s),e!==null&&(Ir(e,r,s,i),Ad(e,r,s)),s}function au(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function J1(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function um(e,t){J1(e,t),(e=e.alternate)&&J1(e,t)}function y4(){return null}var Xy=typeof reportError=="function"?reportError:function(e){console.error(e)};function pm(e){this._internalRoot=e}wu.prototype.render=pm.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(Be(409));xu(e,t,null,null)};wu.prototype.unmount=pm.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Es(function(){xu(null,e,null,null)}),t[fi]=null}};function wu(e){this._internalRoot=e}wu.prototype.unstable_scheduleHydration=function(e){if(e){var t=T_();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Ai.length&&t!==0&&t<Ai[n].priority;n++);Ai.splice(n,0,e),n===0&&N_(e)}};function fm(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function vu(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Z1(){}function x4(e,t,n,o,r){if(r){if(typeof o=="function"){var i=o;o=function(){var d=au(s);i.call(d)}}var s=Gy(t,o,e,0,null,!1,!1,"",Z1);return e._reactRootContainer=s,e[fi]=s.current,Kl(e.nodeType===8?e.parentNode:e),Es(),s}for(;r=e.lastChild;)e.removeChild(r);if(typeof o=="function"){var a=o;o=function(){var d=au(l);a.call(d)}}var l=dm(e,0,!1,null,null,!1,!1,"",Z1);return e._reactRootContainer=l,e[fi]=l.current,Kl(e.nodeType===8?e.parentNode:e),Es(function(){xu(t,l,n,o)}),l}function bu(e,t,n,o,r){var i=n._reactRootContainer;if(i){var s=i;if(typeof r=="function"){var a=r;r=function(){var l=au(s);a.call(l)}}xu(t,s,e,r)}else s=x4(n,t,e,r,o);return au(s)}C_=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=Tl(t.pendingLanes);n!==0&&(Lh(t,n|1),Ho(t,Jn()),!(rn&6)&&(Aa=Jn()+500,Yi()))}break;case 13:Es(function(){var o=hi(e,1);if(o!==null){var r=Lo();Ir(o,e,1,r)}}),um(e,1)}};$h=function(e){if(e.tag===13){var t=hi(e,134217728);if(t!==null){var n=Lo();Ir(t,e,134217728,n)}um(e,134217728)}};E_=function(e){if(e.tag===13){var t=Wi(e),n=hi(e,t);if(n!==null){var o=Lo();Ir(n,e,t,o)}um(e,t)}};T_=function(){return fn};M_=function(e,t){var n=fn;try{return fn=e,t()}finally{fn=n}};qf=function(e,t,n){switch(t){case"input":if(zf(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var o=n[t];if(o!==e&&o.form===e.form){var r=pu(o);if(!r)throw Error(Be(90));i_(o),zf(o,r)}}}break;case"textarea":a_(e,n);break;case"select":t=n.value,t!=null&&xa(e,!!n.multiple,t,!1)}};h_=sm;m_=Es;var w4={usingClientEntryPoint:!1,Events:[oc,pa,pu,p_,f_,sm]},kl={findFiberByHostInstance:_s,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},v4={bundleType:kl.bundleType,version:kl.version,rendererPackageName:kl.rendererPackageName,rendererConfig:kl.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:gi.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=y_(e),e===null?null:e.stateNode},findFiberByHostInstance:kl.findFiberByHostInstance||y4,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Sl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Sl.isDisabled&&Sl.supportsFiber))try{lu=Sl.inject(v4),Kr=Sl}catch{}var Sl;Jo.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=w4;Jo.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!fm(t))throw Error(Be(200));return _4(e,t,null,n)};Jo.createRoot=function(e,t){if(!fm(e))throw Error(Be(299));var n=!1,o="",r=Xy;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(o=t.identifierPrefix),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=dm(e,1,!1,null,null,n,!1,o,r),e[fi]=t.current,Kl(e.nodeType===8?e.parentNode:e),new pm(t)};Jo.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(Be(188)):(e=Object.keys(e).join(","),Error(Be(268,e)));return e=y_(t),e=e===null?null:e.stateNode,e};Jo.flushSync=function(e){return Es(e)};Jo.hydrate=function(e,t,n){if(!vu(t))throw Error(Be(200));return bu(null,e,t,!0,n)};Jo.hydrateRoot=function(e,t,n){if(!fm(e))throw Error(Be(405));var o=n!=null&&n.hydratedSources||null,r=!1,i="",s=Xy;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(s=n.onRecoverableError)),t=Gy(t,null,e,1,n??null,r,!1,i,s),e[fi]=t.current,Kl(e),o)for(e=0;e<o.length;e++)n=o[e],r=n._getVersion,r=r(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,r]:t.mutableSourceEagerHydrationData.push(n,r);return new wu(t)};Jo.render=function(e,t,n){if(!vu(t))throw Error(Be(200));return bu(null,e,t,!1,n)};Jo.unmountComponentAtNode=function(e){if(!vu(e))throw Error(Be(40));return e._reactRootContainer?(Es(function(){bu(null,null,e,!1,function(){e._reactRootContainer=null,e[fi]=null})}),!0):!1};Jo.unstable_batchedUpdates=sm;Jo.unstable_renderSubtreeIntoContainer=function(e,t,n,o){if(!vu(n))throw Error(Be(200));if(e==null||e._reactInternals===void 0)throw Error(Be(38));return bu(e,t,n,!1,o)};Jo.version="18.3.1-next-f1338f8080-20240426"});var ku=oi((q9,Zy)=>{"use strict";function Jy(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Jy)}catch(e){console.error(e)}}Jy(),Zy.exports=Qy()});var t2=oi(hm=>{"use strict";var e2=ku();hm.createRoot=e2.createRoot,hm.hydrateRoot=e2.hydrateRoot;var K9});var o2=oi(Su=>{"use strict";var b4=rr(),k4=Symbol.for("react.element"),S4=Symbol.for("react.fragment"),C4=Object.prototype.hasOwnProperty,E4=b4.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,T4={key:!0,ref:!0,__self:!0,__source:!0};function n2(e,t,n){var o,r={},i=null,s=null;n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(s=t.ref);for(o in t)C4.call(t,o)&&!T4.hasOwnProperty(o)&&(r[o]=t[o]);if(e&&e.defaultProps)for(o in t=e.defaultProps,t)r[o]===void 0&&(r[o]=t[o]);return{$$typeof:k4,type:e,key:i,ref:s,props:r,_owner:E4.current}}Su.Fragment=S4;Su.jsx=n2;Su.jsxs=n2});var Ro=oi((G9,r2)=>{"use strict";r2.exports=o2()});var F0=typeof window<"u"&&(window.__AGENTATION_KIT_AGENTATION__||window.__SHAREKIT_AGENTATION__)||{};function Us(e){let t;try{t=new URL(e,typeof location<"u"?location.href:"https://agentation-kit.invalid/")}catch{return e||"/"}let n=F0.routeKey;if(!n)return t.pathname;if(n==="search")return t.pathname+t.search;let o=new URLSearchParams;for(let i of Array.isArray(n)?n:[n])t.searchParams.has(i)&&o.set(i,t.searchParams.get(i));let r=o.toString();return r?`${t.pathname}?${r}`:t.pathname}var Dr=()=>Us(location.href),zr=e=>F0.routeKey?Us(e):null;typeof window<"u"&&(window.__AGENTATION_KIT_PAGE_KEY__=Dr,window.__AGENTATION_KIT_SESSION_KEY_OF__=zr);var Fr="#1D1A2F",B0="#2A2640",bp="#FFF4E0",Oc="#FFFCF5",qs="#FF5436",Ks=Fr,Pc="#FF9C87",Dc="#A92B15",W0="#573227",Ys="#FFC72C";var Br="255,244,224",To="29,26,47",co='"ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',H0='"ST Display", "Bricolage Grotesque", '+co,zc='"ST Mono", "DM Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',kp={control:"10px",field:"10px",panel:"16px",pill:"999px"},cw=[{family:"ST Sans",file:"dm-sans.woff2",weight:"100 1000"},{family:"ST Display",file:"bricolage-grotesque.woff2",weight:"200 800"},{family:"ST Mono",file:"dm-mono.woff2",weight:"400"}];function j0(e){if(typeof document>"u"||!e)return null;let t=document.head.querySelector("style[data-sk-fonts]");if(t)return t;let n=String(e).replace(/\/$/,"")+"/fonts/",o=document.createElement("style");return o.setAttribute("data-sk-fonts",""),o.textContent=cw.map(r=>'@font-face{font-family:"'+r.family+'";src:url("'+n+r.file+'") format("woff2");font-weight:'+r.weight+";font-style:normal;font-display:swap}").join(""),document.head.append(o),o}var Sp="feedback-toolbar-reviewer",q0=40;function Fc(e){return typeof e!="string"?"":e.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g," ").replace(/\s+/g," ").trim().slice(0,q0).trim()}function _n(){try{return Fc(localStorage.getItem(Sp)||"")}catch{return""}}function dw(e){let t=Fc(e);try{t?localStorage.setItem(Sp,t):localStorage.removeItem(Sp)}catch{}return document.dispatchEvent(new CustomEvent("agentation-kit:reviewer-change",{detail:{name:t}})),t}var as=e=>Fc(e||"").toLowerCase(),br=e=>as(e)===as(_n()),Bc=e=>!as(e?.reviewer)||br(e.reviewer),Cp="sk-own-notes",nl="sk-unsigned-notes",rl=e=>{try{let t=JSON.parse(localStorage.getItem(e)||"[]");return Array.isArray(t)?t:[]}catch{return[]}},Tp=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t.slice(-500)))}catch{}};function Vs(...e){let t=rl(Cp),n=!1;for(let o of e)o&&!t.includes(String(o))&&(t.push(String(o)),n=!0);n&&Tp(Cp,t)}var U0=e=>!!e&&rl(Cp).includes(String(e));function ls(e){return e?as(e.reviewer)?br(e.reviewer):U0(e.id)||U0(e.clientId)?!0:!_n():!1}var Ep="",tl=null;async function ol(){if(tl)return await tl,ol();let e=_n(),t=rl(nl);if(!(!e||!t.length||!Ep)){tl=(async()=>{let n=new Set;await Promise.all(t.map(async o=>{try{let r=await fetch(`${Ep}/annotations/${encodeURIComponent(o)}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({reviewer:e})});(r.ok&&as((await r.json()).reviewer)===as(e)||r.status===404||r.status===409)&&n.add(o)}catch{}})),Tp(nl,rl(nl).filter(o=>!n.has(o))),document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"))})();try{await tl}finally{tl=null}}}function uw(e,t){Vs(t?.id);let n=io(),o=e();return Promise.resolve(o).then(r=>{Vs(t?.id,r?.id),r?.id&&!as(r.reviewer)&&(Tp(nl,[...rl(nl),String(r.id)]),n.then(()=>ol()))}).catch(r=>{window.__AGENTATION_KIT_SAVE_FAILED__?.(r)}),o}var Mp=!1,ss=null,is=null;function pw(){let{host:e,root:t,el:n}=An(`
    .panel { right: 16px; bottom: 84px; width: 300px; max-width: calc(100vw - 32px); z-index: ${un.panel}; }
    .hint { margin: 0 0 8px; font-size: 12px; color: var(--sk-text-2); }
    input { width: 100%; font: inherit; font-size: 13px; color: var(--sk-text);
      background: var(--sk-raised); border: 1px solid var(--sk-hairline); border-radius: 6px;
      padding: 7px 9px; outline: none; min-height: 34px; }
    input:focus { border-color: var(--sk-focus); background: var(--sk-hover); }
    .row { display: flex; gap: 6px; align-items: center; justify-content: flex-end; margin-top: 9px; }
    @media (pointer: coarse) { input, button { min-height: 44px; } }
  `);e.style.display="none",t.append(Object.assign(document.createElement("div"),{innerHTML:`
    <form class="panel" role="dialog" aria-labelledby="sk-rv-title" id="form">
      <div class="hd"><span id="sk-rv-title">Who is reviewing?</span></div>
      <div class="body">
        <p class="hint" id="hint">Your name goes on your notes, so the agent and other reviewers know who said what.</p>
        <input id="name" name="name" autocomplete="name" maxlength="${q0}" placeholder="Your name" aria-label="Your name">
        <div class="row">
          <button type="button" class="ghost" id="skip">Not now</button>
          <button type="submit" class="primary" id="save">Save</button>
        </div>
      </div>
    </form>`}).firstElementChild);let o=i=>{r.want(!1);let s=ss;ss=null,s?.resolve(i)};n("form").addEventListener("submit",i=>{i.preventDefault();let s=Fc(n("name").value);if(!s){n("name").focus();return}o(dw(s))}),n("skip").addEventListener("click",()=>{Mp=!0,o(_n())}),n("name").addEventListener("keydown",i=>{i.key==="Escape"&&(i.preventDefault(),n("skip").click()),i.stopPropagation()});let r=Vn("reviewer",i=>{e.style.display=i?"":"none",i&&Gn(t.getElementById("form"),300)});return{host:e,root:t,el:n,slotted:r}}function K0(e){if(is||(is=pw()),is.el("name").value=_n(),is.el("sk-rv-title").textContent=_n()?"Change your name":"Who is reviewing?",is.el("hint").textContent=e||"Your name goes on your notes, so the agent and other reviewers know who said what.",is.slotted.want(!0,{bump:!0}),setTimeout(()=>is.el("name").focus(),0),!ss){let t;ss={promise:new Promise(o=>{t=o}),resolve:t}}return ss.promise}function io(e){let t=_n();return t||Mp?Promise.resolve(t):ss?ss.promise:K0(e)}function Y0(){return Mp=!1,K0(_n()?"Notes you already left keep the name they were sent with.":"")}function V0(e){Ep=e||"",window.__AGENTATION_KIT_REVIEWER__=_n,window.__AGENTATION_KIT_ASK_REVIEWER__=io,window.__AGENTATION_KIT_SYNC_NEW__=uw,window.__AGENTATION_KIT_OWNS__=ls,document.addEventListener("agentation-kit:reviewer-change",()=>{ol()}),document.addEventListener("agentation-kit:health",t=>{t.detail?.ok&&ol()}),ol()}var Wc='<svg data-art="mark" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false" style="flex:none"><path transform="translate(0 0.1104)" d="M19.801 6.951c-.213-1.015-.464-2.044-.839-3.008-.968-2.544-3.04-3.943-5.519-3.943-1.01 0-1.993 .213-2.892 .417-1.747 .412-3.735 .913-5.514 1.39-1.487 .399-2.567 .964-3.392 1.812-1.08 1.112-1.645 2.614-1.645 4.356 0 .904 .167 1.728 .352 2.539 .325 1.432 .779 2.707 1.724 3.698 1.084 1.145 2.725 1.863 4.3 1.863 .491 0 .969-.056 1.441-.157 1.506-.325 3.207-.802 4.574-1.108 .051-.009 .093 0 .13 .032 .306 .283 .7 .886 .783 1.298l.556 2.702c.111 .528 .718 .62 .927 .199l.815-1.478c.042-.075 .121-.084 .172-.019l1.575 1.988c.209 .264 .561 .329 .811 .134l.858-.695c.245-.19 .273-.542 .074-.792l-1.539-1.97c-.046-.051-.032-.101 .042-.12l1.566-.361c.445-.112 .491-.709 .084-.909l-2.248-1.117c-.046-.023-.046-.064 0-.088 1.826-1.065 3.003-2.863 3.003-5.023 0-.565-.088-1.116-.199-1.64z" fill="currentColor"/><path transform="translate(0.9917 1.0696)" d="M17.354 4.078c-.746-2.604-2.516-4.078-4.972-4.078-.793 0-1.557 .162-2.271 .32-1.96 .458-4.129 1.001-5.954 1.487-2.679 .714-4.157 2.618-4.157 5.181 0 .825 .162 1.617 .343 2.382 .278 1.214 .681 2.414 1.534 3.29 .94 .959 2.326 1.538 3.614 1.538 .338 0 .681-.037 1.01-.106 1.594-.348 3.499-.844 4.847-1.191 .367-.088 .765 .204 1.001 .454l-.241-1.613c-.046-.319 .2-.495 .473-.407 .695 .236 1.631 .583 2.271 .838 1.969-.848 3.183-2.599 3.183-4.61 0-1.242-.347-2.392-.681-3.485z" fill="#fc4226"/></svg>',Hc={ready:'<svg data-art="bub" viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" focusable="false" style="border-radius:50%;overflow:hidden;flex:none"><g><circle cx="14" cy="14" r="14" fill="#fff4e0"/><path transform="translate(3.5592 5.9657)" d="M19.661 4.463c-.774 0-1.403 .573-1.477 1.41l-.103 .103c-.689-3.463-3.734-5.976-7.457-5.976-3.338 0-6.261 2.091-7.319 4.781l-.082-.141c.048-.947-.688-1.624-1.547-1.624-.851 0-1.676 .684-1.676 1.824 0 1.61 1.299 3.29 2.531 4.056 .089 1.254 .585 2.62 1.232 3.445-.433 .907-.899 2.206-.899 2.709 0 .318 .241 .496 .518 .496 .411 0 2.124-.807 3.038-1.214 .341 .204 .726 .385 1.055 .503-.544 .481-.921 1.214-.921 1.969 0 .947 .673 1.491 1.365 1.491 1.195 0 2.291-1.554 2.616-2.808 .685 .011 1.41-.078 1.932-.197-.078 .197-.115 .404-.115 .659 0 .992 .796 1.636 1.532 1.636 1.118 0 2.147-1.229 2.147-2.383 0-.552-.226-1.051-.519-1.292 1.244-1.003 2.191-2.438 2.524-3.945 1.636-.625 3.172-2.505 3.172-3.966 0-.926-.681-1.536-1.547-1.536z" fill="#160f35"/><path transform="translate(21.736 10.917)" d="M1.484 0c-.566 0-1.018 .444-1.047 1.055-.134 .251-.315 .51-.433 .695 .14 .855 .137 1.958-.004 2.661 1.34-.677 2.502-2.291 2.502-3.39 0-.618-.448-1.021-1.018-1.021z" fill="#fd4c2d"/><path transform="translate(4.081 6.4727)" d="M10.102 0c-3.323 0-6.231 2.243-6.997 4.988 .052 .17 .103 .404-.022 .433-.174 .022-.659-.781-.874-1.177 .063-.758-.466-1.25-1.047-1.25-.622 0-1.162 .518-1.162 1.321 0 1.45 1.28 3.123 2.516 3.804 .048 1.369 .615 2.823 1.307 3.674-.404 .87-.903 2.247-.974 2.68-.007 .063 .034 .085 .093 .07 .744-.255 2.131-.877 2.979-1.247 .584 .377 1.358 .71 1.961 .829 .111 .041 .1 .174 .007 .2-.688 .236-1.328 1.162-1.328 1.968 0 .637 .396 1.033 .836 1.033 .914 0 1.984-1.443 2.191-2.776 .015-.063 .052-.088 .111-.085 1.106 .052 2.331-.151 3.138-.44 .122-.048 .2 .074 .111 .163-.366 .322-.585 .766-.585 1.25 0 .711 .526 1.151 1 1.151 .828 0 1.65-1.036 1.65-1.909 0-.596-.389-1.073-.814-1.14-.078-.022-.082-.126-.015-.166 1.895-1.284 3.038-3.449 3.038-5.821 0-4.352-3.182-7.553-7.12-7.553z" fill="#fd4c2d"/><ellipse transform="matrix(0.989539 -0.144262 0.144262 0.989539 8.468 13.3584)" cx="1.34" cy="1.008" rx="1.34" ry="1.008" fill="#fe9177"/><ellipse transform="matrix(0.989539 -0.144262 0.144262 0.989539 17.6446 12.1002)" cx="1.29" cy="1.008" rx="1.29" ry="1.008" fill="#fe8e72"/><path transform="translate(12.4466 12.1166)" d="M3.698 .01c-1.099 .341-2.231 .504-3.301 .478-.292-.008-.411 .159-.396 .429 .108 1.921 1.158 2.705 2.132 2.705 1.003 0 2.057-.825 2.057-2.587 0-.296-.022-.558-.066-.747-.041-.204-.219-.326-.426-.278z" fill="#150e33"/><path transform="translate(13.1361 13.474)" d="M1.665 0c-.747 0-1.424 .381-1.665 .847 .237 .618 .862 1.025 1.451 1.025 .74 0 1.435-.581 1.543-1.287-.278-.359-.803-.585-1.329-.585z" fill="#fe6d6d"/><path transform="translate(9.4127 10.7023)" d="M1.662 0c-.881 0-1.595 .785-1.661 1.625-.011 .188 .122 .329 .288 .329 .13 0 .252-.082 .3-.226 .178-.581 .622-.992 1.11-.992 .407 0 .777 .274 .97 .633 .063 .115 .174 .174 .277 .174 .193 0 .318-.178 .27-.355-.185-.688-.866-1.188-1.554-1.188z" fill="#150f35"/><path transform="translate(16.0028 9.903)" d="M1.566 0c-.825 0-1.498 .696-1.565 1.502-.015 .204 .111 .345 .27 .345 .13 0 .245-.074 .293-.219 .17-.544 .603-.873 1.021-.873 .385 0 .755 .285 .94 .633 .063 .107 .17 .163 .27 .163 .2 0 .333-.193 .281-.378-.181-.67-.836-1.173-1.51-1.173z" fill="#150f35"/><path transform="translate(5.4891 4.4509)" d="M1.06 .127c-.078-.115-.211-.144-.344-.118-.296 .063-.622 .288-.699 .518-.034 .096-.015 .189 .04 .266 .352 .537 .94 1.081 1.41 1.332 .115 .06 .23 .045 .326-.011 .17-.103 .333-.262 .407-.422 .055-.103 .037-.233-.059-.314-.43-.385-.814-.825-1.081-1.251z" fill="#fcc30f"/><path transform="translate(18.1353 3.739)" d="M1.699 .724c.077-.122 .04-.277-.052-.377-.185-.204-.555-.37-.807-.344-.118 .014-.211 .085-.266 .181-.315 .522-.555 1.236-.574 1.71-.004 .125 .067 .225 .17 .277 .182 .093 .4 .156 .578 .159 .118 .008 .225-.066 .27-.185 .192-.529 .444-1.025 .681-1.421z" fill="#35a6fc"/><path transform="translate(22.0498 6.5393)" d="M2.158 .736c.078-.118 .056-.266-.037-.37-.177-.199-.499-.366-.732-.366-.13 0-.241 .07-.304 .174-.281 .474-.685 .944-1.006 1.251-.1 .1-.1 .255-.026 .362 .111 .163 .299 .319 .466 .378 .089 .033 .196 .011 .277-.041 .526-.351 1.07-.907 1.362-1.388z" fill="#fcc30f"/><path transform="translate(22.7873 17.0453)" d="M2.161 1.28c.096-.159 .059-.329-.115-.407-.466-.218-.918-.522-1.258-.807-.122-.096-.278-.081-.389 .004-.166 .126-.322 .307-.381 .474-.041 .096-.011 .211 .07 .285 .419 .418 1.044 .854 1.525 .969 .241 .045 .44-.263 .548-.518z" fill="#35a6fc"/><path transform="translate(21.1189 21.1434)" d="M2.02 1.56c.111-.13 .088-.333-.063-.433-.426-.319-.855-.729-1.162-1.051-.1-.096-.248-.096-.355-.026-.167 .1-.33 .24-.404 .37-.055 .081-.044 .192 .015 .274 .348 .514 .91 1.058 1.328 1.225 .245 .096 .493-.163 .641-.359z" fill="#fcc30f"/><path transform="translate(3 17.2405)" d="M2.106 .785c.126-.096 .126-.255 .048-.374-.1-.166-.263-.322-.411-.388-.077-.037-.174-.026-.251 .011-.585 .303-1.203 .884-1.458 1.362-.063 .111-.034 .24 .052 .325 .162 .167 .399 .315 .595 .352 .119 .026 .245-.022 .319-.119 .336-.447 .736-.877 1.106-1.169z" fill="#35a6fc"/></g></svg>',working:'<svg data-art="bub" viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" focusable="false" style="border-radius:50%;overflow:hidden;flex:none"><g><circle cx="14" cy="14" r="14" fill="#fff4e0"/><path transform="translate(4.685 3.2471)" d="M18.65 9.159c0-5.112-3.932-9.159-9.128-9.159-5.132 0-9.493 4.402-9.493 9.89 0 1.719 .473 3.299 1.263 4.315l-1.256 2.86c-.125 .286 .098 .432 .324 .345l2.738-1.18c.453 .366 .957 .668 1.403 .888-.637 .894-1.371 2.102-1.371 2.951 0 .842 1.009 1.037 1.994 1.037 1.207 0 1.966-.279 1.966-.898 0-.324-.174-.599-.334-.738l.633-1.399c.954 .153 2.029 .153 2.38 .105-.201 .661-.438 1.423-.438 1.907 0 .73 .877 .897 1.702 .897 .908 0 1.569-.222 1.667-.657l.059 .014c.71 .536 1.618 1.172 1.868 1.172 .129 0 .185-.083 .185-.25 0-.609-.39-2.652-.553-3.163-.07-.251-.341-.589-.512-.801 2.892-1.447 4.903-4.562 4.903-8.136z" fill="#fd4727"/><circle transform="matrix(0.823051 -0.567967 0.567967 0.823051 19.0705 14.4017)" cx="1.073" cy="1.073" r="1.073" fill="#ff8574"/><path transform="translate(11.9733 10.9653)" d="M.188 0l-.188 .08 .786 1.149 .592 .062c-.08-.668-.626-1.305-1.19-1.291z" fill="#ff8574"/><path transform="translate(9.9098 11.4875)" d="M2.311 0l-.898 .595-1.413 .978 .985 1.59c.856 .018 1.848-.069 2.217 .268 .316 .268 .459 .672 .459 1.062 0 .668-.331 1.218-.707 1.482l3.463 5.126c.157 .007 .55 .045 .783-.104 .317-.202 .421-.686 .428-.933 .285 .136 .647 .174 .856 .094 .219-.087 .365-.362 .407-.508l-.887-1.444c-1.166 .021-1.848-.954-1.897-1.706-.014-.327 .091-.609 .153-.737l-3.949-5.763z" fill="#fcc41a"/><path transform="translate(16.3406 21.2695)" d="M2.495 0c-.101 .216-.313 .407-.536 .432-.268 .031-.633-.105-.745-.157-.041 .313-.201 .678-.431 .852-.223 .164-.644 .181-.783 .199l.129 .247 1.841 1.343c.236-.362 .682-.591 1.009-.64z" fill="#fde0b6"/><path transform="translate(8.2634 9.0134)" d="M2.565 .317c-.212-.286-.592-.387-.964-.268-.557 .181-1.221 .643-1.493 1.075-.16 .254-.135 .567 .028 .818l.536 .765 2.405-1.573-.512-.817z" fill="#fc806e"/><path transform="translate(8.9041 10.1477)" d="M2.436 0l-2.436 1.58 .981 1.319 2.37-1.57-.915-1.329z" fill="#6d7e90"/><path transform="translate(16.2084 13.2518)" d="M1.305 0c-.484 .087-.95 .282-1.305 .355l.296 .752c.174 .4 .633 .532 1.019 .365 .317-.136 .394-.442 .345-.724-.042-.282-.205-.567-.355-.748z" fill="#fc8479"/><ellipse transform="matrix(0.955564 0.294784 -0.294784 0.955564 13.5935 8.7063)" cx="1.345" cy="1.825" rx="1.345" ry="1.825" fill="#110932"/><ellipse transform="matrix(0.863109 0.505017 -0.505017 0.863109 19.4528 10.2717)" cx="1.224" cy="1.787" rx="1.224" ry="1.787" fill="#110932"/><ellipse transform="matrix(0.605636 0.795742 -0.795742 0.605636 14.5961 9.1137)" cx="0.471" cy="0.842" rx="0.471" ry="0.842" fill="#ffffff"/><circle transform="translate(14.5125 10.7615)" cx="0.367" cy="0.367" r="0.367" fill="#ffffff"/><ellipse transform="matrix(0.605636 0.795742 -0.795742 0.605636 19.9374 10.8499)" cx="0.43" cy="0.815" rx="0.43" ry="0.815" fill="#ffffff"/><circle transform="matrix(0.787023 0.616923 -0.616923 0.787023 20.0382 12.2559)" cx="0.328" cy="0.328" r="0.328" fill="#ffffff"/><path transform="translate(20.0154 21.875)" d="M.908 0l-.209 .592-.699 .442 .64 .386 .265 .786 .358-.807 .571-.4-.599-.362-.327-.637z" fill="#fcc41a"/><path transform="translate(4.4559 3)" d="M19.088 9.406c0-5.31-4.068-9.406-9.337-9.406-5.272 0-9.729 4.461-9.729 10.137 0 1.677 .442 3.292 1.225 4.322l-1.184 2.739c-.229 .518 .209 .818 .606 .664l2.627-1.131c.362 .286 .78 .543 1.11 .717-.619 .856-1.259 1.959-1.259 2.868 0 1.009 1.127 1.252 2.206 1.252 1.423 0 2.185-.393 2.185-1.113 0-.338-.156-.623-.289-.759l.477-1.152c.651 .101 1.448 .126 2.001 .105-.184 .584-.39 1.232-.39 1.681 0 .891 .992 1.092 1.925 1.092 .842 0 1.541-.195 1.75-.501 .783 .554 1.535 1.079 1.845 1.079 .236 0 .354-.167 .354-.438 0-.658-.393-2.729-.525-3.244-.063-.243-.264-.501-.39-.664 2.882-1.5 4.792-4.688 4.792-8.248zM11.262 21.053c-.908 0-1.493-.194-1.493-.709 0-.463 .254-1.285 .393-1.73 .251-.024 .508-.066 .7-.097l.925 1.36c.045 .07 .132 .15 .202 .199l.703 .542c-.122 .286-.825 .435-1.43 .435zM14.717 20.462c-.365 .049-.737 .317-.87 .553l-1.694-1.277c.668 .01 .946-.449 1.047-.978 .533 .209 .943 .105 1.124-.282 .136 .588 .303 1.396 .393 1.984zM14.174 18.158c-.062 .178-.229 .355-.417 .369-.212 .014-.491-.077-.651-.136l-3.849-5.804c-.048-.362-.275-.647-.487-.801l-1.782-2.616c.237-.174 .533-.352 .745-.453l3.793 5.596c-.118 .219-.167 .48-.146 .717 .084 1.075 1.044 1.844 1.973 1.861l.821 1.267zM12.901 18.537c-.052 .296-.157 .627-.359 .777-.163 .114-.449 .118-.609 .1l-3.274-4.924c.417-.341 .644-.887 .661-1.374l3.581 5.421zM9.313 18.242c-.637 .007-1.315-.087-1.813-.157l-.741 1.67c.163 .164 .327 .415 .327 .683 0 .542-.811 .716-1.733 .716-.957 0-1.796-.226-1.796-.845 0-.877 .909-2.259 1.497-3.024-.585-.303-1.222-.707-1.671-1.055l-2.867 1.197c-.042 .018-.059-.007-.042-.048l1.302-2.948c-.825-1.166-1.278-2.665-1.278-4.294 0-5.331 4.218-9.667 9.253-9.667 5.001 0 8.92 3.904 8.92 8.936 0 3.508-1.984 6.682-4.639 7.858l-.237-.369c.766-.087 1.517-.567 1.737-1.002 .101-.216-.056-.306-.174-.199-.501 .519-1.208 .818-1.876 .818-.79 0-1.427-.459-1.611-.967 .035-.188 .188-.289 .334-.31 .226-.035 .174-.31-.045-.31-.164 0-.321 .084-.404 .167-.059-.643 .331-1.092 1.072-1.158 .727-.06 1.413-.258 1.795-.47 .234-.132 .066-.439-.167-.334-.435 .236-1.03 .372-1.604 .421-.504 .038-.905 .209-1.089 .431l-5.223-7.715c-.282-.407-.728-.515-1.156-.393-.584 .185-1.308 .686-1.604 1.166-.212 .341-.188 .717 .024 1.037l2.214 3.313c-.227-.032-.456-.105-.634-.146-.271-.053-.379 .275-.149 .365 .57 .233 1.353 .289 2.025 .254 .995-.077 1.628 .261 1.681 1.027-.146-.077-.345-.094-.488-.06-.191 .056-.146 .324 .042 .324 .185 0 .362 .073 .397 .202-.101 .755-.94 1.267-1.879 1.267-.769 0-1.493-.303-1.98-.669-.209-.139-.338-.007-.226 .174 .368 .515 1.371 .877 2.202 .877 .522 0 1.02-.128 1.333-.306l2.266 3.445c-.324 .059-.829 .094-1.295 .098zM8.297 11.56c-.546-.167-1.242-.041-1.761-.094l-.926-1.36 1.204-.801zM5.429 9.817l-.299-.418c.675-.543 1.49-1.092 2.161-1.402l.299 .424c-.716 .408-1.503 .933-2.161 1.396zM4.991 9.159l-.313-.407c.664-.546 1.514-1.093 2.168-1.402l.303 .417c-.738 .425-1.525 .947-2.158 1.392zM4.493 8.449l-.393-.595c-.16-.23-.146-.484 .004-.692 .306-.414 .96-.853 1.475-.968 .261-.059 .505 .028 .644 .233l.431 .644c-.727 .418-1.506 .919-2.161 1.378z" fill="#110932"/><path transform="translate(14.5363 8.1452)" d="M.03 .089c-.049 .083-.039 .194 .038 .267 .278 .3 .661 .623 .974 .78 .272 .122 .463-.223 .23-.376-.31-.181-.637-.459-.842-.678-.119-.119-.32-.101-.4 .007z" fill="#110932"/><path transform="translate(19.1875 10.017)" d="M1.28 .012c-.337 .133-.762 .202-1.085 .216-.265 .035-.261 .421 .02 .421 .394-.007 .926-.135 1.218-.278 .234-.139 .08-.435-.153-.359z" fill="#110932"/><path transform="translate(15.3839 12.8481)" d="M2.404 .578c.199-.066 .167-.327-.038-.362-.414-.077-.807 .097-1.18 .25-.382 .154-.734 .039-.814-.313-.076-.25-.424-.177-.365 .101 .09 .366 .428 .588 .713 .626l.226 .63c.199 .508 .738 .717 1.218 .533 .355-.146 .484-.463 .47-.783-.007-.279-.115-.526-.23-.682zM1.99 1.754c-.292 .118-.63 .003-.769-.313l-.216-.578c.164-.035 .352-.097 .488-.146 .094 .122 .181 .292 .24 .411 .014 .02 .045 .01 .038-.018-.024-.146-.094-.33-.157-.449 .119-.055 .272-.101 .387-.097 .156 .177 .289 .421 .313 .661 .024 .251-.094 .442-.324 .529z" fill="#110932"/><path transform="translate(19.8486 21.7181)" d="M1.928 .891c-.216-.066-.366-.129-.446-.327l-.146-.393c-.104-.24-.421-.223-.501 .024l-.129 .383c-.059 .171-.209 .258-.417 .32-.373 .105-.373 .484-.07 .585 .285 .087 .439 .177 .494 .379l.112 .383c.111 .313 .459 .296 .546-.021l.101-.379c.045-.192 .205-.32 .456-.401 .323-.114 .295-.48 0-.553zM1.785 1.194c-.334 .104-.532 .278-.602 .564l-.091 .351c-.01 .031-.034 .031-.045 0l-.097-.341c-.077-.275-.341-.477-.578-.557-.031-.01-.028-.038 .004-.045 .327-.076 .536-.257 .605-.522l.077-.254c.01-.024 .031-.021 .041 .007l.101 .306c.08 .247 .327 .404 .571 .449 .038 .007 .038 .032 .014 .042z" fill="#110932"/></g></svg>',asleep:'<svg data-art="bub" viewBox="0 0 28 28" width="24" height="24" aria-hidden="true" focusable="false" style="border-radius:50%;overflow:hidden;flex:none"><g><circle cx="14" cy="14" r="14" fill="#fff4e0"/><path transform="translate(20.7532 16.7869)" d="M.795 0c.633 .489 1.23 1.165 1.23 1.83 0 .784-.572 1.061-1.054 1.061-.41 0-.806-.216-.971-.395 .36-.72 .683-1.662 .795-2.496z" fill="#fd4628"/><path transform="translate(20.7532 16.7869)" d="M.932-.178q.56 .432 .897 .894 .421 .578 .421 1.114 0 .646-.428 .999-.18 .147-.416 .221-.209 .066-.435 .066-.334 0-.669-.15-.297-.132-.468-.318-.023-.025-.038-.056-.014-.031-.019-.065-.005-.034 .001-.068 .005-.034 .021-.064 .274-.549 .477-1.174 .218-.668 .295-1.251 .006-.044 .029-.083 .022-.039 .058-.066 .036-.027 .079-.039 .043-.011 .088-.005 .014 .002 .029 .006 .014 .003 .027 .009 .014 .006 .027 .013 .013 .008 .024 .017zM.657 .178l.138-.178 .223 .03q-.083 .624-.313 1.331-.214 .656-.504 1.235l-.201-.1 .166-.153q.108 .117 .32 .212 .247 .111 .485 .111 .339 0 .564-.185 .264-.217 .264-.651 0-.389-.334-.848-.299-.411-.808-.804z" fill="#100e31"/><path transform="translate(5.2187 7.3727)" d="M8.177 0c-4.452 0-8.177 3.693-8.177 8.35 0 1.197 .255 2.341 .705 3.348-.137 .417-.198 .953 .09 1.344 .233 .328 .625 .432 .981 .396l.418 .507-1.187 2.499c-.086 .169 .011 .288 .133 .263 1.075-.223 2.366-.737 3.29-1.23 .942 .478 2 .73 3.1 .762 .043 .809 .741 1.388 1.449 1.388 .816 0 1.64-.615 1.902-1.413 .292-.564 1.381-.852 1.69-.464 .101 .683 .712 1.18 1.299 1.18 1.139 0 2.121-1.27 2.121-2.456 0-.773-.5-1.349-1.183-1.439 1.039-1.312 1.575-2.959 1.575-4.685 0-4.657-3.75-8.35-8.206-8.35z" fill="#fd4628"/><path transform="translate(5.2187 7.3727)" d="M.484 11.7q-.728-1.563-.728-3.35 0-1.761 .671-3.363 .645-1.541 1.819-2.73 1.169-1.182 2.679-1.831 1.559-.67 3.252-.67 1.695 0 3.258 .67 1.515 .649 2.689 1.831 1.18 1.189 1.828 2.729 .675 1.604 .675 3.364 0 1.409-.431 2.683-.428 1.266-1.203 2.168-.032 .037-.075 .059-.043 .022-.091 .025-.049 .004-.095-.011-.046-.015-.083-.047-.036-.031-.058-.075-.022-.043-.026-.091-.003-.048 .012-.094 .015-.046 .046-.083 .714-.83 1.111-2.007 .406-1.198 .406-2.527 0-1.662-.637-3.175-.612-1.453-1.725-2.575-1.107-1.115-2.535-1.726-1.471-.63-3.066-.63-1.593 0-3.059 .63-1.424 .611-2.526 1.726-1.107 1.121-1.716 2.575-.632 1.512-.632 3.175 0 1.679 .682 3.144 .02 .044 .022 .092 .002 .049-.014 .094-.017 .046-.05 .082-.033 .035-.076 .056-.044 .02-.093 .022-.048 .002-.094-.014-.045-.017-.081-.05-.036-.032-.056-.076z" fill="#100e31"/><path transform="translate(6.1777 20.8107)" d="M6.564 3.045q-.843-.025-1.686-.236-.81-.203-1.515-.552l.108-.218 .112 .216q-.778 .403-1.687 .74-.931 .344-1.666 .494-.136 .028-.251-.024-.12-.054-.179-.174-.049-.098-.043-.215 .006-.104 .053-.203l1.202-2.472 .219 .106-.189 .154-.413-.507q-.031-.038-.045-.084-.014-.046-.009-.095 .005-.048 .028-.09 .023-.043 .06-.074 .038-.03 .084-.044 .047-.014 .095-.009 .048 .005 .091 .028 .042 .023 .073 .06l.414 .507q.022 .027 .035 .059 .014 .032 .018 .067 .004 .034-.002 .069-.006 .034-.021 .065l-1.2 2.469q-.006 .012-.006 .019 0-.01-.008-.026-.018-.037-.057-.054-.028-.013-.047-.009 .699-.143 1.595-.474 .881-.326 1.632-.715 .026-.014 .053-.02 .028-.007 .057-.008 .028 0 .056 .007 .028 .006 .054 .019 .658 .325 1.418 .515 .791 .199 1.581 .222 .048 .001 .093 .021 .044 .02 .077 .055 .033 .035 .05 .081 .018 .045 .016 .093-.001 .049-.021 .093-.02 .044-.055 .077-.035 .034-.081 .051-.045 .017-.093 .016z" fill="#100e31"/><path transform="translate(16.1935 22.5008)" d="M1.721 .209q-.726 .431-1.637 .767-.045 .017-.093 .015-.049-.002-.093-.022-.044-.02-.077-.056-.033-.035-.049-.081-.017-.045-.015-.093 .002-.049 .022-.093 .02-.044 .056-.077 .035-.033 .081-.049 .869-.322 1.556-.729 .042-.025 .09-.032 .048-.007 .095 .005 .047 .012 .086 .041 .038 .029 .063 .071 .025 .041 .032 .089 .007 .048-.005 .095-.012 .047-.041 .086-.03 .039-.071 .063z" fill="#100e31"/><ellipse transform="matrix(0.653537 0.756895 -0.756895 0.653537 14.942 20.9318)" cx="1.523" cy="1.85" rx="1.523" ry="1.85" fill="#fd4628"/><path transform="matrix(0.653537 0.756895 -0.756895 0.653537 14.942 20.9318)" d="M3.278 1.85q0 .39-.118 .753-.13 .398-.381 .703-.255 .31-.595 .473-.317 .153-.661 .153-.343 0-.661-.153-.339-.163-.595-.473-.251-.305-.38-.703-.119-.363-.119-.753 0-.389 .119-.753 .129-.398 .38-.702 .256-.311 .595-.474 .318-.153 .661-.153 .344 0 .661 .153 .34 .163 .595 .474 .251 .304 .381 .702 .118 .364 .118 .753zM2.815 1.85q0-.316-.096-.609-.102-.315-.298-.552-.19-.231-.438-.35-.222-.107-.46-.107-.238 0-.46 .107-.247 .119-.438 .35-.195 .237-.298 .552-.095 .293-.095 .609 0 .316 .095 .61 .103 .314 .298 .551 .191 .232 .438 .351 .222 .107 .46 .107 .238 0 .46-.107 .248-.119 .438-.351 .196-.237 .298-.551 .096-.294 .096-.61z" fill="#100e31"/><ellipse transform="matrix(0.850974 0.525207 -0.525207 0.850974 19.3423 19.786)" cx="1.523" cy="2.087" rx="1.523" ry="2.087" fill="#fd4628"/><path transform="matrix(0.850974 0.525207 -0.525207 0.850974 19.3423 19.786)" d="M3.278 2.087q0 .43-.116 .832-.128 .441-.375 .78-.254 .347-.593 .531-.322 .175-.671 .175-.349 0-.671-.175-.339-.184-.593-.531-.247-.339-.375-.78-.116-.402-.116-.832 0-.431 .116-.833 .128-.441 .375-.779 .254-.348 .593-.532 .322-.175 .671-.175 .349 0 .671 .175 .339 .184 .593 .532 .247 .338 .375 .779 .116 .402 .116 .833zM2.815 2.087q0-.366-.098-.704-.105-.363-.304-.635-.192-.264-.44-.398-.218-.118-.45-.118-.232 0-.45 .118-.247 .134-.44 .398-.199 .272-.303 .635-.098 .338-.098 .704 0 .365 .098 .703 .104 .363 .303 .635 .193 .264 .44 .398 .218 .118 .45 .118 .232 0 .45-.118 .248-.134 .44-.398 .199-.272 .304-.635 .098-.338 .098-.703z" fill="#100e31"/><path transform="translate(5.7437 17.6319)" d="M1.151 0c-.594 .489-1.151 1.363-1.151 2.1 0 .716 .485 1.1 .989 1.1 .813 0 1.629-1.068 1.834-1.92" fill="#fd4628"/><path transform="translate(5.7437 17.6319)" d="M1.298 .179q-.439 .361-.744 .893-.322 .561-.322 1.028 0 .415 .238 .655 .212 .214 .519 .214 .23 0 .484-.149 .25-.146 .487-.414 .229-.258 .4-.576 .167-.312 .238-.604 .01-.045 .037-.082 .028-.037 .067-.061 .039-.025 .085-.032 .045-.007 .09 .004 .045 .011 .082 .038 .037 .027 .061 .066 .024 .039 .032 .085 .007 .046-.004 .09-.084 .351-.28 .715-.196 .366-.461 .665-.286 .322-.601 .506-.362 .212-.717 .212-.237 0-.454-.088-.224-.091-.394-.262-.178-.179-.273-.424-.1-.255-.1-.558 0-.591 .384-1.258 .347-.605 .851-1.021 .036-.029 .08-.043 .044-.013 .09-.009 .046 .005 .086 .026 .041 .022 .071 .058 .029 .035 .042 .079 .014 .044 .009 .09-.004 .046-.026 .087-.021 .04-.057 .07z" fill="#100e31"/><ellipse transform="matrix(0.960216 -0.279258 0.279258 0.960216 9.4016 16.3312)" cx="1.116" cy="0.698" rx="1.116" ry="0.698" fill="#ff8976"/><ellipse transform="matrix(0.965504 -0.260388 0.260388 0.965504 18.1288 13.9178)" cx="1.108" cy="0.698" rx="1.108" ry="0.698" fill="#ff8976"/><path transform="translate(10.6594 14.1546)" d="M.205 .484q.16 .181 .417 .279 .259 .098 .516 .072 .369-.041 .649-.295 .273-.248 .307-.569 .006-.054 .032-.102 .026-.048 .068-.082 .043-.034 .095-.049 .052-.016 .106-.01 .054 .006 .102 .032 .048 .026 .082 .068 .034 .043 .05 .095 .015 .052 .009 .106-.028 .264-.159 .506-.124 .228-.324 .41-.196 .178-.441 .29-.25 .114-.521 .145-.386 .039-.766-.106-.382-.145-.632-.428-.036-.04-.054-.092-.017-.051-.014-.106 .003-.054 .027-.103 .024-.049 .065-.085 .041-.036 .092-.053 .052-.018 .106-.015 .054 .004 .103 .027 .049 .024 .085 .065z" fill="#100e31"/><path transform="translate(16.5567 12.5724)" d="M.208 .391q.154 .18 .403 .273 .247 .092 .49 .064l.032 .272-.042-.271q.303-.046 .519-.263 .212-.213 .228-.482 .003-.054 .026-.103 .024-.049 .065-.085 .04-.036 .092-.054 .051-.018 .105-.015 .055 .003 .104 .027 .049 .023 .085 .064 .036 .041 .054 .092 .018 .051 .015 .106-.014 .238-.119 .459-.099 .208-.268 .377-.343 .344-.823 .418l-.005 .001h-.005q-.375 .043-.745-.095-.382-.142-.627-.43-.035-.042-.052-.094-.017-.051-.013-.106 .005-.054 .029-.102 .025-.049 .067-.084 .041-.035 .093-.052 .052-.017 .106-.013 .054 .005 .102 .03 .049 .024 .084 .066z" fill="#100e31"/><path transform="translate(14.3272 14.6904)" d="M.185 .352q.108 .126 .306 .179 .195 .052 .395 .014 .242-.047 .416-.216 .165-.16 .181-.35 .005-.048 .027-.091 .022-.043 .059-.074 .037-.031 .083-.046 .047-.015 .095-.011 .048 .005 .091 .027 .043 .022 .074 .059 .032 .037 .046 .083 .015 .047 .011 .095-.032 .37-.328 .658-.278 .27-.664 .344-.308 .059-.612-.022-.343-.091-.55-.332-.031-.036-.046-.082-.015-.046-.012-.095 .004-.048 .026-.091 .022-.044 .058-.075 .037-.032 .083-.047 .046-.015 .094-.011 .049 .003 .092 .025 .043 .022 .075 .059z" fill="#100e31"/><path transform="translate(10.6594 14.1546)" d="M.182 .504q.166 .187 .429 .287 .266 .101 .53 .074 .379-.042 .666-.303 .281-.256 .317-.588 .005-.048 .028-.091 .024-.042 .061-.073 .038-.03 .084-.044 .047-.013 .095-.008 .048 .005 .091 .028 .042 .023 .073 .061 .03 .038 .044 .084 .013 .047 .008 .095-.027 .258-.156 .495-.121 .223-.318 .402-.192 .175-.432 .285-.246 .112-.512 .142-.379 .038-.752-.104-.376-.142-.62-.419-.033-.037-.048-.083-.016-.045-.013-.094 .003-.048 .024-.092 .021-.043 .058-.075 .036-.032 .082-.048 .046-.016 .094-.013 .048 .003 .092 .024 .043 .022 .075 .058z" fill="#100e31"/><path transform="translate(17.6139 6.2435)" d="M-.07-.031l.943-.241q.054-.014 .109-.006 .055 .008 .103 .037 .048 .028 .082 .073 .033 .044 .047 .098 .006 .025 .008 .051 .002 .025-.001 .051-.003 .025-.011 .05-.007 .024-.019 .047l-.64 1.234-.249-.13-.074-.27 .975-.266q.053-.015 .109-.008 .055 .007 .104 .035 .048 .027 .082 .071 .035 .045 .049 .098 .015 .054 .008 .11-.007 .055-.035 .103-.027 .049-.072 .083-.044 .034-.098 .049l-.974 .266q-.025 .007-.051 .009-.027 .002-.053-.001-.026-.002-.051-.01-.025-.007-.048-.02-.05-.025-.086-.068-.036-.043-.052-.096-.017-.053-.012-.109 .004-.055 .03-.105l.64-1.233 .249 .129 .07 .272-.942 .241q-.055 .014-.11 .006-.055-.008-.103-.037-.048-.028-.082-.073-.033-.044-.047-.099-.014-.054-.006-.109 .008-.055 .037-.103 .028-.048 .073-.082 .044-.033 .098-.047z" fill="#100e31"/><path transform="translate(19.4227 4.442)" d="M-.075-.019l.914-.251q.054-.015 .109-.008 .055 .006 .104 .034 .048 .028 .083 .072 .034 .044 .049 .097 .007 .025 .009 .05 .002 .025 0 .05-.002 .025-.009 .05-.007 .024-.018 .047l-.626 1.298-.252-.122-.067-.272 .996-.245q.054-.013 .109-.005 .055 .009 .103 .038 .048 .029 .081 .074 .033 .045 .046 .099 .014 .054 .005 .109-.008 .055-.037 .103-.029 .048-.074 .081-.045 .033-.099 .046l-.996 .245q-.024 .005-.048 .007-.024 .002-.049-.001-.024-.002-.047-.009-.023-.007-.045-.017-.05-.024-.088-.066-.037-.042-.055-.094-.019-.053-.015-.109 .003-.055 .027-.106l.626-1.298 .252 .122 .075 .27-.913 .252q-.054 .015-.11 .008-.055-.007-.104-.034-.048-.028-.082-.072-.035-.044-.049-.098-.015-.054-.008-.109 .006-.055 .034-.104 .028-.048 .072-.083 .044-.034 .097-.049z" fill="#100e31"/><path transform="translate(21.4975 3)" d="M-.07-.031l.943-.241q.054-.014 .109-.006 .055 .008 .103 .037 .048 .028 .082 .073 .033 .044 .047 .098 .006 .024 .008 .049 .002 .024-.001 .049-.002 .024-.009 .048-.007 .024-.017 .046l-.665 1.377-.253-.122-.071-.271 1.007-.263q.054-.014 .109-.006 .056 .007 .104 .036 .048 .028 .081 .072 .034 .045 .048 .099 .014 .054 .007 .109-.008 .056-.036 .104-.028 .048-.073 .081-.044 .034-.098 .048l-1.007 .263q-.024 .006-.049 .008-.025 .002-.049-.001-.025-.002-.049-.009-.024-.006-.046-.017-.05-.024-.088-.066-.037-.042-.055-.094-.018-.053-.015-.109 .003-.056 .027-.106l.666-1.377 .252 .122 .07 .272-.942 .241q-.055 .014-.11 .006-.055-.008-.103-.037-.048-.028-.082-.073-.033-.044-.047-.099-.014-.054-.006-.109 .008-.055 .037-.103 .028-.048 .073-.082 .044-.033 .098-.047z" fill="#100e31"/></g></svg>'};var G0=e=>'url("data:image/svg+xml,'+encodeURIComponent(Wc.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" ').replace(/currentColor/g,e))+'")';function fw(){return`
    /* One accent: the toolbar's own tokens, whatever the marker colour setting says. */
    [data-agentation-root], [data-agentation-root][data-agentation-accent], [data-agentation-toolbar] {
      --agentation-color-accent: ${qs} !important;
      --agentation-color-blue: ${qs} !important;
    }
    html [data-agentation-toolbar] .sk-review-controls button[aria-pressed=true] {
      background: ${W0} !important; color: ${bp} !important;
    }
    /* Light theme: a pale tomato fill with ink text. */
    html [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] .sk-review-controls button[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme="light"] .sk-review-controls button[aria-pressed=true] { background: #FFDDD1 !important; color: ${Fr} !important; }
    /* Send stays the solid primary while its sheet is open, in both themes. */
    html [data-agentation-root][data-agentation-theme] [data-agentation-toolbar] .sk-review-controls button.sk-send[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme] .sk-review-controls button.sk-send[aria-pressed=true],
    html [data-agentation-root] .sk-review-controls .sk-send[aria-pressed=true],
    html [data-agentation-toolbar] .sk-review-controls .sk-send[aria-pressed=true] { background: ${qs} !important; color: ${Ks} !important; }
    /* Nothing new to send, sheet open: the neutral pressed fill, not a dimmed
       accent. Its label was white at .75 on #FF5436, 3.67:1 (UX review 5, #7). */
    html [data-agentation-root][data-agentation-theme] [data-agentation-toolbar] .sk-review-controls button.sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-root][data-agentation-theme] .sk-review-controls button.sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-root] .sk-review-controls .sk-send:not([data-state=ready])[aria-pressed=true],
    html [data-agentation-toolbar] .sk-review-controls .sk-send:not([data-state=ready])[aria-pressed=true] { background: rgba(128,128,128,.28) !important; color: inherit !important; opacity: 1 !important; }
    html [data-agentation-root] textarea:focus-visible,
    html [data-agentation-toolbar] button:focus-visible,
    html [data-agentation-root] button:focus-visible { outline: 2px solid ${Ys} !important; outline-offset: 1px; }
    /* Yellow is 1.5:1 on paper: the light theme's ring is ink. */
    html [data-agentation-root][data-agentation-theme="light"] textarea:focus-visible,
    html [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] button:focus-visible,
    html [data-agentation-root][data-agentation-theme="light"] button:focus-visible { outline-color: ${Fr} !important; }
    [data-agentation-root] [class*="styles-module__autoSendLabel___"][class*="styles-module__active___"] { color: ${Pc} !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__autoSendLabel___"][class*="styles-module__active___"] { color: ${Dc} !important; }

    /* The brand on the component's own chrome. Its surfaces are recoloured at
       build time (build.mjs); these are the parts a find-and-replace cannot
       reach. Text on tomato is ink: white is 3.1:1 there. */
    [data-agentation-root], [data-agentation-root] textarea, [data-agentation-root] button, [data-agentation-root] input { font-family: ${co}; }
    [data-agentation-root] [data-annotation-marker],
    [data-agentation-toolbar] [class*="styles-module__badge___"],
    [data-agentation-toolbar] [class*="styles-module__buttonBadge___"] { color: ${Ks} !important; font-weight: 700 !important; }
    [data-agentation-root] [data-annotation-popup] [class*="styles-module__submit___"] { color: ${Ks} !important; font-weight: 600 !important; border-radius: 10px !important; padding: 7px 14px !important; font-size: 13px !important; }
    [data-agentation-root] [data-annotation-popup] [class*="styles-module__cancel___"] { border-radius: 10px !important; padding: 7px 12px !important; font-size: 13px !important; }
    [data-agentation-root] [data-annotation-popup] { box-shadow: 0 8px 28px rgba(12,10,24,.36), 0 0 0 1px rgba(${Br},.16) !important; }
    [data-agentation-root] [data-annotation-popup][class*="styles-module__light___"] { background: ${Oc} !important; box-shadow: 0 2px 8px rgba(${To},.1), 0 8px 24px rgba(${To},.12), 0 0 0 1px rgba(${To},.1) !important; }
    [data-agentation-root] [data-annotation-popup] textarea { border-radius: 10px !important; }
    [data-agentation-root] [data-annotation-popup] textarea:focus { border-color: ${Ys} !important; }
    [data-agentation-root] [data-annotation-popup][class*="styles-module__light___"] textarea:focus { border-color: ${Fr} !important; }
    [data-agentation-root] [class*="styles-module__stylesBlock___"],
    [data-agentation-root] [class*="styles-module__hoverReactPath___"] { font-family: ${zc} !important; }
    /* Settings' header credits the library this toolbar builds on, in words:
       its wordmark alone read as if the tool were Agentation. */
    [data-agentation-root] [class*="styles-module__settingsBrand___"] svg { display: none; }
    [data-agentation-root] [class*="styles-module__settingsBrand___"]::before { content: "Built on Agentation"; font: 500 12px/1.4 ${co}; color: rgba(${Br},.74); text-decoration: underline; text-underline-offset: 2px; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsBrand___"]::before { color: rgba(${To},.74); }
    /* The closed bar is the mark, not a generic list icon. */
    [data-agentation-toolbar] [class*="styles-module__toggleContent___"] svg { opacity: 0; }
    [data-agentation-toolbar] [class*="styles-module__toggleContent___"] { background: ${G0(bp)} center / 24px 24px no-repeat; }
    [data-agentation-root][data-agentation-theme="light"] [data-agentation-toolbar] [class*="styles-module__toggleContent___"] { background-image: ${G0(Fr)}; }

    /* Upstream text under 12px. */
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"],
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a,
    [data-agentation-root] [class*="styles-module__learnMoreLink___"],
    [data-agentation-root] [class*="styles-module__settingsVersion___"],
    [data-agentation-root] [class*="styles-module__automationDescription___"],
    [data-agentation-root] [class*="styles-module__helpTooltip"],
    [data-agentation-root] [class*="styles-module__paletteSectionTitle___"],
    [data-agentation-root] [class*="styles-module__autoSendLabel___"],
    [data-agentation-root] [class*="styles-module__settingsOption___"],
    [data-agentation-root] [class*="styles-module__sliderLabel___"],
    [data-agentation-root] [class*="styles-module__hoverTooltip___"],
    [data-agentation-root] [class*="styles-module__hoverReactPath___"] { font-size: 12px !important; line-height: 1.4 !important; }
    /* Marker numbers and the collapsed toggle's count, which were 11 and 10px. */
    [data-agentation-root] [data-annotation-marker],
    [data-agentation-toolbar] [class*="styles-module__badge___"] { font-size: 12px !important; }

    /* The agent's markers: a 44px target on touch, drawn at 22px. */
    .sk-crit-dot::before { content: ""; position: absolute; inset: -11px; }
    @media (pointer: fine) { .sk-crit-dot::before { display: none; } }
    /* The marker sits just left of what it points at, so its target grows
       away from that text: 44px square, flush with the marker's right edge.
       Grown 11px on every side, it covered the paragraph's first word, and a
       tap there opened From the agent (UX review 4, N15). Its bottom edge is
       the marker's too: centred, it still reached 11px down into the first
       line (UX review 5, N15). */
    /* Placed, the marker says how far its target grows each way (ui.js
       layoutMarkers, --sk-hit): only into space with no line of text, its
       target's or a neighbour's. Under a heading, up and left took taps on
       the heading's last word (UX review 6, N2). */
    @media (pointer: coarse) { .sk-crit-dot::before { inset: var(--sk-hit, calc(100% - 44px) 0 0 calc(100% - 44px)); } }
    /* The reviewer's markers, the same way (N13). */
    @media (pointer: coarse) {
      [data-agentation-root] [data-annotation-marker]::before { content: ""; position: absolute; inset: var(--sk-hit, -11px); border-radius: 50%; }
    }

    /* Settings on touch: a sheet above the bar, 44px rows (N14). */
    @media (pointer: coarse) {
      html [data-agentation-root] [class*="styles-module__settingsPanel___"] {
        left: var(--sk-sheet-left, -8px) !important; right: var(--sk-sheet-right, -8px) !important; width: auto !important; min-width: 0 !important; max-width: none !important;
        box-sizing: border-box; max-height: 55vh; max-height: 55dvh; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
        border-radius: 12px; padding: 6px 0;
      }
      html [data-agentation-root] [class*="styles-module__settingsPanel___"]::before,
      html [data-agentation-root] [class*="styles-module__settingsPanel___"]::after { display: none; }
      [data-agentation-root] [class*="styles-module__settingsPanelContainer___"] { padding: 0 12px; }
      [data-agentation-root] [class*="styles-module__automationsPage___"] { padding: 0 12px 4px; }
      [data-agentation-root] [class*="styles-module__settingsHeader___"],
      [data-agentation-root] [class*="styles-module__settingsNavLink___"],
      [data-agentation-root] [class*="styles-module__settingsBackButton___"] { height: auto !important; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsRow___"] { min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__settingsRowMarginTop___"],
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] { margin-top: 0; }
      [data-agentation-root] [class*="styles-module__settingsBrand___"] { display: inline-flex; align-items: center; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__themeToggle___"] { width: 44px !important; height: 44px !important; }
      [data-agentation-root] [class*="styles-module__cycleButton___"] { min-height: 44px; }
      /* Switches and checkboxes keep their drawn size; the real input, which
         is transparent and on top, becomes the 44px target, and a
         checkbox's label is 44px tall. */
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__switchInput___"],
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxInput___"] {
        inset: auto; top: 50%; left: 50%; width: 44px; height: 44px; margin: 0; transform: translate(-50%, -50%);
      }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] .checkbox-field,
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] { height: auto; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__settingsPanel___"] .checkbox-field label,
      [data-agentation-root] [class*="styles-module__settingsPanel___"] [class*="styles-module__checkboxField___"] label { display: flex; align-items: center; min-height: 44px; }
      [data-agentation-root] [class*="styles-module__autoSendLabel___"] { display: inline-flex; align-items: center; min-height: 44px; }
    }
    /* The popup's computed-styles block: machine text, but 12px and no purple. */
    [data-agentation-root] [class*="styles-module__stylesBlock___"],
    [data-agentation-root] [class*="styles-module__styleLine___"] { font-size: 12px !important; }
    [data-agentation-root] [class*="styles-module__styleProperty___"] { color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__styleProperty___"] { color: rgba(0,0,0,.62) !important; }
    /* Upstream Settings' secondary text clears 4.5:1 in both themes. */
    [data-agentation-root] [class*="styles-module__settingsVersion___"],
    [data-agentation-root] [class*="styles-module__settingsLabel___"] { opacity: 1 !important; }
    [data-agentation-root] [class*="styles-module__settingsVersion___"] { color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsVersion___"] { color: rgba(0,0,0,.62) !important; }
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] { font-weight: 400 !important; opacity: 1 !important; color: rgba(255,255,255,.62) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__paletteHeaderDesc___"] { color: rgba(0,0,0,.62) !important; }
    /* Light theme: the rest of upstream's secondary text at 4.5:1 (UX review 5,
       #5). Settings labels were .5 (3.98:1), its checkbox labels .5 on #1D1A2F's
       ink (3.34:1), the Layout palette's section heads .4 (2.85:1), "Wireframe
       a new page" and the comment popup's Cancel .5. The active wireframe
       toggle keeps its white. (Upstream's dimmer disabled-row label never
       applied: its own panel rule outranks it, so every row reads alike.)
       "MCP and webhooks" and its subpage's help were left at .5 (UX review 6,
       N7); the link keeps upstream's darker hover. */
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsNavLink___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__automationDescription___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsLabel___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsPanel___"] [class*="styles-module__label___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasToggle___"]:not([class*="styles-module__active___"]) [class*="styles-module__canvasToggleLabel___"],
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cancel___"] { color: rgba(0,0,0,.62) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cancel___"]:hover,
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__settingsNavLink___"]:hover { color: rgba(0,0,0,.85) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__paletteSectionTitle___"] { color: rgba(0,0,0,.6) !important; }
    /* The tooltip's key hint ("Esc"): opacity .5 left it at 4.47:1 dark and
       3.09:1 light (#6). A colour, not an opacity, as our own tooltip does. */
    [data-agentation-root] [class*="styles-module__buttonTooltip___"] [class*="styles-module__shortcut___"] { opacity: 1 !important; color: rgba(255,255,255,.65) !important; }
    [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__buttonTooltip___"] [class*="styles-module__shortcut___"] { color: rgba(0,0,0,.6) !important; }
    /* The Layout palette's "?" help icons were .2 alpha, about 1.3:1. An icon
       needs 3:1, so .55 in both themes, and full strength on hover. */
    html [data-agentation-root] [class*="styles-module__canvasPurposeHelp___"] svg { color: rgba(255,255,255,.55) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasPurposeHelp___"] svg { color: rgba(0,0,0,.55) !important; }
    html [data-agentation-root] [class*="styles-module__canvasPurposeHelp___"]:hover svg { color: rgba(255,255,255,.85) !important; }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__canvasPurposeHelp___"]:hover svg { color: rgba(0,0,0,.85) !important; }
    /* While the question notice is up, the bar's tooltips open above it, not
       over it (#3). replies.js sets the lift; our own tooltip reads the notice. */
    [data-agentation-toolbar] [class*="styles-module__buttonTooltip___"] { margin-bottom: var(--sk-tip-lift, 0px); }
    /* A solid underline: a dotted one is a dot pattern too (N9). */
    [data-agentation-root] [class*="styles-module__learnMoreLink___"],
    [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a { text-decoration-style: solid !important; }
    /* The Layout palette on touch: a sheet like Settings, 44px rows. */
    @media (pointer: coarse) {
      html [data-agentation-root] [class*="styles-module__palette___"] {
        left: var(--sk-sheet-left, -8px) !important; right: var(--sk-sheet-right, -8px) !important; width: auto !important; min-width: 0 !important; max-width: none !important;
        max-height: 55vh; max-height: 55dvh; overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box;
      }
      [data-agentation-root] [class*="styles-module__paletteItem___"] { min-height: 44px !important; }
      [data-agentation-root] [class*="styles-module__learnMoreLink___"] { display: inline-flex; align-items: center; min-height: 44px; }
      /* The palette's "Learn more." sits in a sentence: its 44px target is
         drawn around it, so the line keeps its height (R8). */
      [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a { position: relative; }
      [data-agentation-root] [class*="styles-module__paletteHeaderDesc___"] a::after { content: ""; position: absolute; left: -6px; right: -6px; top: 50%; height: 44px; transform: translateY(-50%); }
    }
    /* No dot patterns (N9). The wireframe icon keeps its frame, not the 3x3
       grid of dots inside it. */
    [data-agentation-root] [class*="styles-module__canvasToggleIcon___"] svg circle { display: none; }
    /* Output detail: four short bars in a row, filled up to the chosen level. */
    html [data-agentation-root] [class*="styles-module__cycleDots___"] { flex-direction: row; align-items: center; gap: 2px; }
    html [data-agentation-root] [class*="styles-module__cycleDot___"] { width: 8px; height: 3px; border-radius: 1px; transform: none; }
    html [data-agentation-root] [class*="styles-module__cycleDot___"]:has(~ [class*="styles-module__active___"]) { background: rgba(255,255,255,.7); }
    html [data-agentation-root][data-agentation-theme="light"] [class*="styles-module__cycleDot___"]:has(~ [class*="styles-module__active___"]) { background: rgba(0,0,0,.55); }
    .sk-crit-dot[hidden] { display: none !important; }
    .sk-crit-dot:focus-visible { outline: 2px solid ${Fr}; outline-offset: 2px; box-shadow: 0 0 0 4px ${Ys}; }
  `}var X0=12;function hw(e,t){return{left:Math.round(X0-e.left)+"px",right:Math.round(X0-(t-e.right))+"px"}}function mw(){let e=()=>{let t=document.querySelector("[data-agentation-toolbar]"),n=t?.querySelector('[class*="styles-module__toolbarContainer___"]')?.getBoundingClientRect();if(!n?.width)return;let o=hw(n,document.documentElement.clientWidth||innerWidth);t.style.getPropertyValue("--sk-sheet-left")!==o.left&&t.style.setProperty("--sk-sheet-left",o.left),t.style.getPropertyValue("--sk-sheet-right")!==o.right&&t.style.setProperty("--sk-sheet-right",o.right)};addEventListener("resize",e),document.addEventListener("agentation-kit:toolbar-position",()=>requestAnimationFrame(e)),typeof setInterval=="function"&&setInterval(e,250),e()}var il=null,Q0=!1;function J0(){typeof document>"u"||!document.head||(!Q0&&typeof addEventListener=="function"&&(Q0=!0,mw()),!il?.isConnected&&(il=document.createElement("style"),il.dataset.agentationKitChrome="",il.textContent=fw(),document.head.append(il)))}function so(e,t="save"){return e===413?`Too long to ${t}. Shorten it and try again.`:e===409?`The review server could not ${t} this (its stored copy of this note is out of step). Your text is kept; try again, or tell the agent.`:e===403?"The review server refused this. Your text is kept.":e?`Could not ${t} (${e}). Your text is kept; try again.`:`Could not ${t}: the review server did not answer. Your text is kept; try again when it is back.`}var ig=e=>Number(String(e?.message||"").match(/: (\d{3})$/)?.[1]||0),un={marker:2147483640,panel:2147483644,notice:2147483645,toast:2147483646},Yc=new Map,gw=0,Np=!1,Ip=!1;function _w(){if(Np){Ip=!0;return}Np=!0;try{do{Ip=!1;let e=[...Yc.values()].filter(o=>o.wants),t=o=>o.sort((r,i)=>i.ts-r.ts)[0],n=t(e.filter(o=>!o.passive))||t(e.filter(o=>o.passive))||null;for(let o of Yc.values()){let r=o===n;if(o.visible!==r){o.visible=r;try{o.show(r)}catch{}}}}while(Ip)}finally{Np=!1}document.dispatchEvent(new CustomEvent("agentation-kit:slot",{detail:{panel:Mo()}}))}function Mo(){for(let[e,t]of Yc)if(t.visible)return e;return null}function Vn(e,t){let n={wants:!1,passive:!1,ts:0,visible:!1,show:t};return Yc.set(e,n),{want(o,{passive:r=!1,bump:i=!1}={}){o&&(!n.wants||i)&&(n.ts=++gw),n.wants=!!o,n.passive=r,_w()},get visible(){return n.visible},get wants(){return n.wants}}}function sl(e,t){let n=String(t||"").trim();if(!n)return e;let o=String(e).trim().split(/\s+/).pop().toLowerCase();return o&&n.toLowerCase().includes(o)?n:`${e}: ${n}`}var yw='[data-annotation-popup],[class*="settingsPanel___"],[class*="palette___"]';function Z0(e){if(!e?.isConnected||e.hidden)return!1;let t=e.getBoundingClientRect();if(!t.width||!t.height)return!1;let n=getComputedStyle(e);return n.display!=="none"&&n.visibility!=="hidden"&&Number(n.opacity)>.05}function Ci({slots:e=[],hosts:t=[]}={}){let n=Mo();if(n&&!e.includes(n))return!0;for(let o of document.querySelectorAll(yw))if(Z0(o))return!0;for(let o of document.querySelectorAll(".sk-edit-ui"))if(!(t.includes(o)||!o.shadowRoot||o.style.display==="none")){for(let r of o.shadowRoot.querySelectorAll("[role=dialog], .dock"))if(Z0(r))return!0}return!1}var Xc=900,Vc=new Map,cs=null,eg="",Ap=0,xw=0,Rp=36;function al(e){if(!e?.isConnected)return null;let t=e.getBoundingClientRect();return t.width>0&&t.height>0?t:null}function Xs(){return document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']")}function Op(){let e=al(Xs());return e?(e.top+e.bottom)/2>innerHeight/2?{top:0,bottom:Math.max(0,innerHeight-e.top+Rp)}:{top:Math.max(0,e.bottom+12),bottom:0}:{top:0,bottom:0}}function Qs(e,t){e&&(Vc.set(e,t),bn())}function Ko(e){Vc.delete(e)&&bn()}function sg(){let e=0,t=0;for(let n of document.querySelectorAll("[data-show-and-tell-reserve], [data-agentation-reserve]")){let o=al(n);if(!o)continue;let r=n.getAttribute("data-show-and-tell-reserve")||n.getAttribute("data-agentation-reserve");r==="top"&&o.top<=1?e=Math.max(e,o.bottom):r==="bottom"&&o.bottom>=innerHeight-1&&(t=Math.max(t,innerHeight-o.top))}return{top:Math.round(e),bottom:Math.round(t)}}function ag(){let e=Op(),t=0,n=e.bottom;for(let[o,r]of Vc){let i=al(o);if(!i){o.isConnected||Vc.delete(o);continue}r==="right"?t=Math.max(t,innerWidth-i.left+12):n=Math.max(n,innerHeight-i.top+8)}return{top:Math.round(e.top),right:Math.round(t),bottom:Math.round(Math.min(n,innerHeight*.8))}}function bn(){Ap||(Ap=requestAnimationFrame(()=>{Ap=0,ww()}))}function ww(){if(window.__AGENTATION_KIT_POINTER_DRAG__){setTimeout(bn,120);return}let e=ag(),t=JSON.stringify(e);if(t===eg)return;if(eg=t,!e.top&&!e.right&&!e.bottom){cs?.remove(),cs=null,tg(e);return}cs?.remove();let n=sg(),o=getComputedStyle(document.documentElement),r=s=>parseFloat(o[s])||0,i={top:r("paddingTop"),right:r("paddingRight"),bottom:r("paddingBottom")};cs=document.createElement("style"),cs.dataset.agentationKitInsets="",cs.textContent="html{"+(e.top?"padding-top:"+(i.top+e.top)+"px!important;":"")+(e.right?"padding-right:"+(i.right+e.right)+"px!important;":"")+(e.bottom?"padding-bottom:"+(i.bottom+e.bottom)+"px!important;":"")+"scroll-padding:"+Math.max(e.top,n.top)+"px "+e.right+"px "+Math.max(e.bottom,n.bottom)+"px 0!important}",document.head.append(cs),tg(e)}function tg(e){window.__AGENTATION_KIT_INSETS__=e,document.dispatchEvent(new CustomEvent("agentation-kit:insets",{detail:e}))}typeof window<"u"&&typeof window.addEventListener=="function"&&typeof document?.addEventListener=="function"&&typeof requestAnimationFrame=="function"&&(window.addEventListener("resize",bn),document.addEventListener("agentation-kit:toolbar-position",bn),xw=setInterval(bn,500));function Ei(){let e=ag(),t=sg();return{left:0,top:Math.max(e.top,t.top),right:innerWidth-e.right,bottom:innerHeight-Math.max(e.bottom,t.bottom)}}function ri(e){let t=Ei(),n=0;return e.bottom>t.bottom&&(n=e.bottom-t.bottom+8),e.top+-n<t.top&&(n=e.top-t.top-8),n?(scrollBy({top:n,behavior:"instant"}),n):0}var Gs=null,$p=new Map;function Js(e){Gs=e||null;for(let[t,n]of $p)t.isConnected&&al(t)&&Gn(t,n)}function vw(e){try{let t=document.createRange();t.selectNodeContents(e);let n=t.getBoundingClientRect();if(n.width&&n.height)return n}catch{}return e.getBoundingClientRect()}function lg(){try{if(typeof Gs=="function")return Gs()||null;if(Gs?.isConnected)return vw(Gs)}catch{}return null}function Zs(e){Gs===e&&Js(null)}function bw(e,t=lg(),n=innerWidth){if(!t||!t.width)return"right";let o=(s,a)=>Math.max(0,Math.min(t.right,a)-Math.max(t.left,s)),r=o(n-16-e-8,n),i=o(0,16+e+8);return r>i?"left":"right"}function Gn(e,t=320){if(!e)return;let n=Op();if(e.style.position="fixed",innerWidth>=Xc){let o=Math.min(t,innerWidth-24),r=bw(o),i=lg();if(i?.width){let s=r==="left"?i.left-16-8:innerWidth-16-8-i.right;s<o&&s>=300&&(o=Math.floor(s))}Object.assign(e.style,{width:o+"px",left:r==="left"?"16px":"auto",right:r==="left"?"auto":"16px",top:"auto",bottom:Math.max(16,n.bottom)+"px",maxHeight:Math.max(160,innerHeight-Math.max(16,n.bottom)-Math.max(16,n.top))+"px"}),e.dataset.sheet="side",e.dataset.side=r,$p.set(e,t),Ko(e)}else Object.assign(e.style,{width:"auto",left:"12px",right:"12px",top:"auto",bottom:Math.max(12,n.bottom-Rp+8)+"px",maxHeight:Math.round(innerHeight*.55)+"px"}),e.dataset.sheet="bottom",delete e.dataset.side,$p.delete(e),Qs(e,"bottom");bn()}function uo(e,t=320){if(!e)return;let n=Op(),o=Math.min(t,innerWidth-24),r=al(Xs());Object.assign(e.style,{position:"fixed",width:o+"px",top:"auto",bottom:Math.max(16,n.bottom-Rp+10)+"px",left:Math.max(12,Math.min((r?r.right:innerWidth-16)-o,innerWidth-o-12))+"px",right:"auto"}),Qs(e,"bottom")}function Xn(e){return e.setAttribute("data-feedback-toolbar",""),e}function ps(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function No(){let e=ps();return!e||e===document.body||e===document.documentElement||!e.isConnected||!e.getClientRects().length}var Gc=e=>!!e&&e.isConnected&&!e.disabled&&!e.hidden&&e.getClientRects().length>0&&!e.closest?.("[inert]");function kr(...e){for(let t of e.flat()){let n=typeof t=="string"?document.querySelector(t):typeof t=="function"?t():t;if(Gc(n))return n.focus({preventScroll:!0}),n}return null}function Pp(){let e=document.querySelector("[data-agentation-toolbar]");return e&&[...e.querySelectorAll('.sk-modes button[aria-pressed="true"], [data-review=mode]')].find(Gc)||null}var ea=()=>kr(Pp);function cg(e,{rows:t,rowKey:n,when:o=()=>!0,fallback:r=()=>null}={}){let i=null,s=c=>c.dataset?.focus||c.getAttribute?.("aria-label")||c.id||(c.textContent||"").trim().slice(0,60),a=c=>{if(!(c instanceof Element)||!e.contains(c))return null;let p=t?c.closest(t):null;return{row:p?n(p):null,control:p===c?"":s(c)}},l=()=>{i=null};e.addEventListener("focusin",c=>{i=a(c.composedPath()[0])}),document.addEventListener("focusin",()=>{let c=ps();c&&c!==document.body&&!e.contains(c)&&l()},!0),addEventListener("pointerdown",c=>{c.composedPath().includes(e)||l()},!0);function d(){if(!i)return null;let c=e,p=null;if(i.row!==null){if(p=[...e.querySelectorAll(t)].find(C=>n(C)===i.row&&Gc(C))||null,!p)return null;if(c=p,!i.control)return p.tabIndex=-1,p}let f=[...c.querySelectorAll("button,textarea,input,select,a[href],[tabindex]")].find(C=>s(C)===i.control&&Gc(C));return f||(p?(p.tabIndex=-1,p):null)}return{get key(){return i},forget:l,set(c){i=c},target:d,restore(){if(!i||!o()||!No())return null;let c=kr(d,r);return c&&(c.closest?.(t||"*")||c).scrollIntoView?.({block:"nearest"}),c}}}var jc=null;function Qc(e,{ms:t=1500,when:n=()=>!0}={}){jc?.stop();let o=performance.now()+t,r=null,i=!1,s=0,a=!0,l={stop(){a=!1,cancelAnimationFrame(s),removeEventListener("pointerdown",l.stop,!0),document.removeEventListener("focusin",d,!0),jc===l&&(jc=null)},check(){if(a){if(performance.now()>o){l.stop();return}if(No()&&n()){i=!0;try{r=kr(e)||r}finally{i=!1}}}}},d=()=>{if(i)return;let p=ps();p&&p!==r&&p!==document.body&&l.stop()},c=()=>{l.check(),a&&(s=requestAnimationFrame(c))};return addEventListener("pointerdown",l.stop,!0),document.addEventListener("focusin",d,!0),jc=l,s=requestAnimationFrame(c),l}var ii='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',kw="feedback-toolbar-theme";function Sw(){let t=document.querySelector("[data-agentation-root]")?.getAttribute("data-agentation-theme");if(t==="dark"||t==="light")return t;try{let n=localStorage.getItem(kw);if(n==="dark"||n==="light")return n}catch{}return"dark"}function Cw(e){let t=()=>{e.dataset.skTheme=Sw()};t();let n=document.querySelector("[data-agentation-root]");if(!n||typeof MutationObserver>"u")return()=>{};let o=new MutationObserver(t);return o.observe(n,{attributes:!0,attributeFilter:["data-agentation-theme"]}),()=>o.disconnect()}function Ew(){return`
    :host { all: initial; }
    /* "all: initial" resets box-sizing to CONTENT-BOX, so any "width: 100%"
       with padding overflows its panel. This one line is why the reply
       textarea used to sit past its own border. */
    *, *::before, *::after { box-sizing: border-box; }

    :host {
      --sk-font: ${co};
      --sk-display: ${H0};
      --sk-mono: ${zc};
      /* Dark is the base, matching the toolbar: ink, with chalk text. */
      --sk-surface: ${Fr};
      --sk-raised: ${B0};
      --sk-text: rgba(${Br},0.94);
      /* Every text step reads at 4.5:1 or more at 12px, on the surface and
         on raised rows (test/brand.test.mjs measures it). */
      --sk-text-2: rgba(${Br},0.74);
      --sk-text-3: rgba(${Br},0.64);
      --sk-hairline: rgba(${Br},0.12);
      --sk-hover: rgba(${Br},0.1);
      --sk-ring: 0 8px 28px rgba(12,10,24,0.36), 0 0 0 1px rgba(${Br},0.14);
      --sk-accent: ${qs};
      /* Ink on tomato is 5.6:1; white is 3.1:1. */
      --sk-on-accent: ${Ks};
      /* Accent as TEXT on the dark surface. */
      --sk-accent-text: ${Pc};
      /* Keyboard focus is yellow and nothing else is, so it never competes
         with the accent. */
      --sk-focus: ${Ys};
      --sk-r-control: ${kp.control};
      --sk-r-panel: ${kp.panel};
    }
    :host([data-sk-theme=light]) {
      --sk-surface: ${Oc};
      --sk-raised: rgba(${To},0.045);
      --sk-text: rgba(${To},0.94);
      --sk-text-2: rgba(${To},0.74);
      --sk-text-3: rgba(${To},0.66);
      --sk-hairline: rgba(${To},0.12);
      --sk-hover: rgba(${To},0.07);
      --sk-ring: 0 2px 8px rgba(${To},0.1), 0 8px 24px rgba(${To},0.1), 0 0 0 1px rgba(${To},0.1);
      --sk-accent-text: ${Dc};
      /* Yellow is 1.5:1 on paper: the ring is ink there. */
      --sk-focus: ${Fr};
    }

    .panel {
      position: fixed; z-index: ${un.panel};
      font: 400 13px/1.5 var(--sk-font);
      background: var(--sk-surface); color: var(--sk-text);
      /* Ring, not border \u2014 the toolbar has no border box, which is what makes
         it read as floating rather than as a card. */
      border: none; border-radius: var(--sk-r-panel); box-shadow: var(--sk-ring);
      overflow: hidden;
      transition: opacity .12s ease, transform .12s ease;
    }

    .hd {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 12px 10px 14px; border-bottom: 1px solid var(--sk-hairline);
      font-size: 12px; font-weight: 600; color: var(--sk-text);
    }
    .hd .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sk-accent); flex: none; }
    .hd .grow { margin-left: auto; font-size: 12px; font-weight: 400; color: var(--sk-text-3); }
    .iconbtn {
      border: 0; background: none; cursor: pointer; padding: 3px 5px; border-radius: 4px;
      font: inherit; font-size: 13px; line-height: 1; color: var(--sk-text-3);
    }
    .iconbtn:hover { background: var(--sk-hover); color: var(--sk-text); }
    /* One panel header (UX review 4, N13): the inbox and Send panel, From the
       agent and Agent activity all title at 13px/600 and close with the same
       drawn X, 28px square, 44px on a phone or touch screen. */
    .hd .sk-title { font: 700 15px/1.25 var(--sk-display); letter-spacing: -0.01em; color: var(--sk-text); }
    .sk-x {
      flex: none; margin-left: auto; display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; min-width: 28px; min-height: 28px; padding: 0;
      border: 0; border-radius: 8px; background: none; color: var(--sk-text-3); cursor: pointer;
    }
    .sk-x:hover { background: var(--sk-hover); color: var(--sk-text); }
    .sk-x svg { width: 16px; height: 16px; flex: none; }
    @media (pointer: coarse), (max-width: 640px) { .sk-x { width: 44px; height: 44px; min-width: 44px; min-height: 44px; } }

    .body { padding: 12px 14px 14px; }

    textarea {
      width: 100%; min-height: 56px; resize: vertical;
      font: inherit; font-size: 13px; color: var(--sk-text);
      background: var(--sk-raised); border: 1px solid var(--sk-hairline);
      border-radius: var(--sk-r-control); padding: 8px 10px; outline: none;
    }
    textarea::placeholder { color: var(--sk-text-3); }
    textarea:focus { border-color: var(--sk-focus); background: var(--sk-hover); }

    button.primary {
      font: inherit; font-size: 13px; font-weight: 600;
      background: var(--sk-accent); color: var(--sk-on-accent);
      border: 0; border-radius: var(--sk-r-control); padding: 8px 14px; cursor: pointer;
    }
    button.primary:hover { filter: brightness(1.06); }
    button.primary[disabled] { opacity: .4; cursor: default; filter: none; }
    button.ghost {
      font: inherit; font-size: 12px; color: var(--sk-text-3);
      border: 0; background: none; cursor: pointer; padding: 6px 8px; border-radius: 8px;
    }
    button.ghost:hover { background: var(--sk-hover); color: var(--sk-text); }

    .chip {
      font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 999px;
      border: 1px solid var(--sk-hairline); background: transparent;
      color: var(--sk-text-2); cursor: pointer;
    }
    .chip:hover { background: var(--sk-hover); color: var(--sk-text); }
    .chip[aria-pressed=true] {
      background: color-mix(in srgb, var(--sk-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--sk-accent) 45%, transparent);
      color: var(--sk-text); font-weight: 600;
    }

    .status { font-size: 12px; color: var(--sk-text-3); font-variant-numeric: tabular-nums; }

    /* One focus ring in every shadow root (UX review 5, #4): From the agent
       showed the browser's own, blue on a desktop and orange on a phone. A
       panel can still restyle its own (the menus fill the row instead). */
    button:focus-visible, textarea:focus-visible, input:focus-visible, select:focus-visible,
    summary:focus-visible, a:focus-visible { outline: 2px solid var(--sk-focus); outline-offset: 2px; }
  `}function ta(){return`
    .thread { max-height: min(240px, 34vh); overflow-y: auto;
      display: flex; flex-direction: column; gap: 6px; scrollbar-width: thin; }
    .m { border-radius: 6px; padding: 7px 9px; font-size: 12.5px; }
    /* The agent speaks in the accent tint, the reviewer on the raised surface \u2014
       the asymmetry every messaging UI uses, so who-said-what survives being
       skimmed without reading the labels. */
    .m.agent { background: color-mix(in srgb, var(--sk-accent) 16%, transparent);
      border: 1px solid color-mix(in srgb, var(--sk-accent) 32%, transparent); }
    .m.reviewer { background: var(--sk-raised); border: 1px solid var(--sk-hairline); }
    /* Sentence case, as written: a name is a name, not a label. */
    .who { font-size: 11px; font-weight: 500; color: var(--sk-text-2); margin-bottom: 2px; }
  `}function si(e,t,n="reviewer"){e.textContent="";for(let o of t||[]){let r=o.from==="agent"?"agent":"reviewer",i=document.createElement("div");i.className=`m ${r}`;let s=document.createElement("div");s.className="who";let a=r==="reviewer"&&o.name&&!br(o.name);s.textContent=a?o.name:r===n?"You":r==="agent"?"Agent":o.name||"Reviewer";let l=document.createElement("div");l.textContent=o.message??"",i.append(s,l),e.append(i)}e.scrollTop=e.scrollHeight}var qo=22,us=3,Tw=44,Uc=(e,t,n=.5)=>Math.min(e.right,t.right)-Math.max(e.left,t.left)>n&&Math.min(e.bottom,t.bottom)-Math.max(e.top,t.top)>n;function Mw(e=[]){let t=[];for(let n of[...e].sort((o,r)=>o.top-r.top||o.left-r.left)){let o=(n.top+n.bottom)/2,r=t.find(i=>o>i.top&&o<i.bottom);r?Object.assign(r,{left:Math.min(r.left,n.left),right:Math.max(r.right,n.right),top:Math.min(r.top,n.top),bottom:Math.max(r.bottom,n.bottom)}):t.push({left:n.left,top:n.top,right:n.right,bottom:n.bottom})}return t}function Nw(e,t=qo,n=[],o=0,r=0,i=null){let s=Iw(e,t,n,o,r);if(!i)return s;let a=t/2,l=qo/2,d=i.touch||0,c=Number.isFinite(i.right)?i.right:1/0,p=Mw(i.own||[]),f=p[0],C=p[p.length-1],w={right:e.left+us+.5,bottom:e.top+us+.5},m=D=>[D.left,D.top,D.right,D.bottom].join(),S=new Set((i.own||[]).map(m)),g=D=>(i.near||[]).every(le=>Uc(D,le)?S.has(m(le))?Math.min(D.right,le.right)<=w.right&&Math.min(D.bottom,le.bottom)<=w.bottom:!1:!0),y={left:o,right:c,top:0},E=Math.min(e.top,f?f.top:e.top)-2-l,A=[];e.left+us-t>=o+2&&A.push([e.left+us-a,e.top+us-l,1]),A.push([Math.max(e.left,o+2)+a,E,1]),f&&(f.right-t>e.left+1&&A.push([f.right-a,E,-1]),A.push([f.right+4+a,(f.top+f.bottom)/2,1]),C!==f&&A.push([C.right+4+a,(C.top+C.bottom)/2,1]));let Q=null;for(let[D,le,K]of A){let W=D;for(let Oe=!0,Pe=0;Oe&&Pe<40;Pe++){Oe=!1;for(let je of n){let $e=(t+je.width)/2+4;Math.abs(W-je.x)<$e&&Math.abs(le-je.y)<qo+2&&(W=je.x+K*$e,Oe=!0)}}let Y={x:Math.round(W),y:Math.round(le),width:t},he={left:Y.x-a,right:Y.x+a,top:Y.y-l,bottom:Y.y+l};if(he.top<2||he.left<o+1||he.right>c-1||!g(he))continue;if(!d)return Y;let Ce=ng(he,d,g,y);if(Ce.whole)return{...Y,hit:Ce.grow};(!Q||Ce.area>Q.area)&&(Q={spot:{...Y,hit:Ce.grow},area:Ce.area})}if(Q)return Q.spot;if(!d)return s;let G={left:s.x-a,right:s.x+a,top:s.y-l,bottom:s.y+l};return{...s,hit:ng(G,d,g,y).grow}}function ng(e,t,n,o={}){let r=e.right-e.left,i=e.bottom-e.top,s=Math.max(0,t-r),a=Math.max(0,t-i),{left:l=-1/0,right:d=1/0,top:c=-1/0}=o,p=(g,y,E,A)=>({left:e.left-A,right:e.right+y,top:e.top-g,bottom:e.bottom+E}),f=g=>g.left>=l-.5&&g.right<=d+.5&&g.top>=c-.5,C=null;for(let g=0;g<=a;g++)for(let y=0;y<=s;y++){let E=p(g,s-y,a-g,y);if(!f(E)||!n(E))continue;let A=Math.abs(2*g-a)+Math.abs(2*y-s);(!C||A<C.score)&&(C={score:A,grow:{top:g,right:s-y,bottom:a-g,left:y}})}if(C)return{whole:!0,grow:C.grow,area:t*t};let w=(g,y)=>{let E=0;for(;E<y;){let A={top:0,right:0,bottom:0,left:0,[g]:E+1},Q=p(A.top,A.right,A.bottom,A.left);if(!f(Q)||!n(Q))break;E++}return E},m={top:w("top",a),right:w("right",s),bottom:w("bottom",a),left:w("left",s)},S=(g,y,E)=>{if(g+y<=E)return[g,y];let A=E/2,Q=Math.min(g,Math.max(A,E-y));return[Math.round(Q),Math.round(E-Q)]};for([m.top,m.bottom]=S(m.top,m.bottom,a),[m.left,m.right]=S(m.left,m.right,s);!n(p(m.top,m.right,m.bottom,m.left))&&(m.top||m.right||m.bottom||m.left);)for(let g of["top","right","bottom","left"])m[g]&&m[g]--;return{whole:!1,grow:m,area:(r+m.left+m.right)*(i+m.top+m.bottom)}}function Iw(e,t=qo,n=[],o=0,r=0){let i=t/2,s=e.left+us-i,a=e.top+us-qo/2;if(s-i<o+2){s=Math.max(e.left,o+2)+i;let l=e.top-Math.max(qo/2,r)-2;l>=qo/2+2&&(a=l)}a=Math.max(a,qo/2+2);for(let l=!0,d=0;l&&d<40;d++){l=!1;for(let c of n){let p=(t+c.width)/2+4;Math.abs(s-c.x)<p&&Math.abs(a-c.y)<qo+2&&(s=c.x+p,l=!0)}}return{x:Math.round(s),y:Math.round(a),width:t}}var og="script,style,noscript,template,svg,[data-feedback-toolbar],[data-agentation-root],.sk-edit-ui,.sk-crit-dot";function Aw(e,t=64,n=400){let o=e.getBoundingClientRect(),r={left:o.left-t,top:o.top-t,right:o.right+t,bottom:o.bottom+t},i=document.createRange(),s=p=>({left:p.left+scrollX,top:p.top+scrollY,right:p.right+scrollX,bottom:p.bottom+scrollY}),a=n,l=(p,f,C=!0)=>{let w=m=>{for(let S of m.childNodes){if(a<=0)return;if(S.nodeType===3){if(!S.data.trim())continue;a--,i.selectNodeContents(S);for(let g of i.getClientRects())g.width&&g.height&&Uc(g,r,0)&&f.push(s(g))}else if(C&&S.nodeType===1&&!S.matches(og)){let g=S.getBoundingClientRect();if((g.width||g.height)&&!Uc(g,r,0))continue;w(S)}}};w(p)},d=[];l(e,d);let c=[...d];for(let p=e,f=0;p&&p!==document.body&&p.parentElement&&f<4;p=p.parentElement,f++){let C=[];for(let w=p.previousElementSibling,m=0;w&&m<2;w=w.previousElementSibling,m++)C.push(w);for(let w=p.nextElementSibling,m=0;w&&m<2;w=w.nextElementSibling,m++)C.push(w);for(let w of C)if(!w.matches(og)){let m=w.getBoundingClientRect();(!(m.width||m.height)||Uc(m,r,0))&&l(w,c)}l(p.parentElement,c,!1)}return{own:d,near:c}}var qc=[],Kc=new Map,Lp=0;function Dp(e,t){let n=qc.findIndex(o=>o.name===e);n>=0?qc.splice(n,1,{name:e,entries:t}):qc.push({name:e,entries:t}),ds()}function ds(){Lp||typeof requestAnimationFrame!="function"||(Lp=requestAnimationFrame(()=>{Lp=0,na()}))}function na(){let e=[],t=new Set,n=typeof matchMedia=="function"&&matchMedia("(pointer: coarse)").matches,o=scrollX+(document.documentElement.clientWidth||innerWidth);for(let r of qc){let i=[];try{i=r.entries()||[]}catch{}for(let s of i){let a=s.target?.isConnected?s.target.getBoundingClientRect():null;if(!a||!a.width&&!a.height){s.missing?.();continue}let l=null;try{l={...Aw(s.target),right:o,touch:n?Tw:0}}catch{}let d=Nw({left:a.left+scrollX,top:a.top+scrollY},s.width||s.el?.offsetWidth||qo,e,scrollX,n&&s.touchReach||0,l);if(e.push(d),t.add(s.key),Kc.set(s.key,d),s.el){s.el.style.left=d.x+"px",s.el.style.top=d.y+"px";let c=d.hit;c?s.el.style.setProperty("--sk-hit",`${-c.top}px ${-c.right}px ${-c.bottom}px ${-c.left}px`):s.el.style.removeProperty("--sk-hit")}}}for(let r of Kc.keys())t.has(r)||Kc.delete(r)}var dg=new Map,rg=new Map;function Lw(e){if(!e)return null;let t=rg.get(e.id);if(t?.isConnected)return t;if(e.isFixed||e.isMultiSelect||e.elementBoundingBoxes?.length)return null;let n=e.selector||e.fullPath||e.elementPath;if(!n||/⟨shadow⟩|^region |^\[/.test(n))return null;let o;try{o=[...document.querySelectorAll(n)].filter(d=>!d.closest("[data-feedback-toolbar]"))}catch{return null}if(!o.length)return null;let r=e.boundingBox,i=(Number(e.x)||0)/100*(e.viewport?.width||innerWidth),s=Number(e.y)||0,a=null,l=1/0;for(let d of o){let c=d.getBoundingClientRect(),p=r?Math.abs(c.width-r.width)+Math.abs(c.height-r.height)+Math.abs(c.left-r.x)+Math.abs(c.top+scrollY-r.y):Math.max(0,c.left-i,i-c.right)+Math.max(0,c.top+scrollY-s,s-c.bottom-scrollY);p<l&&(l=p,a=d)}return a&&rg.set(e.id,a),a}function $w(){let e=[];for(let t of document.querySelectorAll("[data-agentation-root] [data-kit-note]")){let n=dg.get(t.getAttribute("data-kit-note"));!n||n.isFixed||e.push({key:"note:"+n.id,target:Lw(n),el:t,width:qo,touchReach:22,missing:()=>{t.style.left=n.x+"%",t.style.top=n.y+"px"}})}return e}var zp=()=>typeof window>"u"||window.__AGENTATION_KIT_MARKERS_SHOWN__!==!1;if(typeof window<"u"&&typeof document?.addEventListener=="function"&&typeof requestAnimationFrame=="function"){J0(),Dp("notes",$w),window.__AGENTATION_KIT_MARKER_AT__=e=>{if(!e?.id||e.isFixed)return null;dg.set(e.id,e),ds();let t=Kc.get("note:"+e.id);return t?{left:t.x+"px",top:t.y}:null};for(let e of["agentation-kit:insets","agentation-kit:slot","agentation-kit:markers","agentation-kit:edit-change","agentation-kit:tweak-change"])document.addEventListener(e,ds);if(window.addEventListener("resize",ds),window.addEventListener("load",ds),document.fonts?.ready?.then(ds),typeof ResizeObserver=="function"){let e=new ResizeObserver(ds);e.observe(document.documentElement);let t=()=>document.body&&e.observe(document.body);document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0})}}function ug(){return{position:"absolute",minWidth:qo+"px",height:qo+"px",borderRadius:"6px",border:"none",padding:"0 5px",display:"flex",alignItems:"center",justifyContent:"center",transform:"translate(-50%, -50%)",background:"#1D1A2F",color:"#fff",font:`600 12px/1 ${co}`,boxShadow:"0 2px 6px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.12)",cursor:"pointer",userSelect:"none",zIndex:"99998"}}function An(e){let t=document.createElement("div");t.setAttribute("data-sk-no-edit",""),t.className="sk-edit-ui",Xn(t);let n=t.attachShadow({mode:"open"}),o=document.createElement("style");return o.textContent=Ew()+e,n.append(o),document.body.appendChild(t),Cw(t),{host:t,root:n,el:r=>n.getElementById(r)}}var Wp='[data-agentation-toolbar] [class*="toolbarContainer"]',Hp='[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]',Bp='[data-agentation-root] [class*="palette___"]:not([class*="exit"])',Rw="[data-agentation-toolbar] [data-review=more]",pg="Open review toolbar",fg="Meta+Shift+F Control+Shift+F",ll=e=>!!e&&/collapsed/.test(e.className),fs=e=>!!e&&!e.hidden&&e.getClientRects().length>0;function hg(e=document.querySelector(Wp)){e&&(ll(e)?(e.getAttribute("aria-label")!==pg&&e.setAttribute("aria-label",pg),e.getAttribute("aria-keyshortcuts")!==fg&&e.setAttribute("aria-keyshortcuts",fg)):(e.hasAttribute("aria-label")&&e.removeAttribute("aria-label"),e.hasAttribute("aria-keyshortcuts")&&e.removeAttribute("aria-keyshortcuts")))}function jp(){let e=document.querySelector("[data-agentation-toolbar]");return e&&(Pp()||[...e.querySelectorAll(".sk-review-controls button:not([data-review=grip])")].find(fs))||null}function Ow(){let e=document.querySelector(Rw);return fs(e)?e:jp()}function gg(e){let t=e==="settings"?Hp:Bp,n=e==="settings"?"Settings":"Layout moves",o=0,r=()=>{let i=document.querySelector(t);if(!i||!fs(i)){++o<40&&requestAnimationFrame(r);return}i.hasAttribute("tabindex")||(i.tabIndex=-1),i.getAttribute("role")||i.setAttribute("role","dialog"),i.getAttribute("aria-label")||i.setAttribute("aria-label",n),i.contains(document.activeElement)||i.focus({preventScroll:!0})};requestAnimationFrame(r)}function Pw(){let e=document.querySelector(Hp),t=document.querySelector('[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="Settings"]');if(!e||!t)return!1;let n=e.contains(document.activeElement);return t.click(),(n||document.activeElement===document.body)&&requestAnimationFrame(()=>{let o=document.querySelector("[data-agentation-toolbar] [data-review=more]");(fs(o)?o:fs(t)?t:null)?.focus({preventScroll:!0})}),!0}function Dw(e){if(!(e.defaultPrevented||e.isComposing)){if(e.key==="Escape"&&!e.metaKey&&!e.ctrlKey&&!e.altKey){if(document.querySelector(Hp)&&Pw()){e.preventDefault(),e.stopImmediatePropagation();return}let t=document.querySelector(Bp);if(t&&fs(t)&&(t.contains(document.activeElement)||No())){let o=performance.now()+600,r=()=>{let s=document.querySelector(Bp);return!s||!fs(s)},i=()=>{if(!(performance.now()>o)){if(!r()){requestAnimationFrame(i);return}(No()||t.contains(document.activeElement))&&Ow()?.focus({preventScroll:!0})}};requestAnimationFrame(i)}return}if((e.key==="Enter"||e.key===" ")&&!e.metaKey&&!e.ctrlKey&&!e.altKey&&!e.repeat){let t=e.composedPath()[0];if(!(t instanceof Element)||!t.matches(Wp)||!ll(t))return;e.preventDefault(),e.stopImmediatePropagation(),t.click(),requestAnimationFrame(()=>requestAnimationFrame(()=>{ll(t)||jp()?.focus({preventScroll:!0})}))}}}var mg=!1;function _g(){if(mg||typeof window>"u")return;mg=!0,window.addEventListener("keydown",Dw,!0);let e=null,t=null,n=()=>{let o=document.querySelector(Wp);if(o!==e&&(t?.disconnect(),e=o,o)){let r=ll(o);t=new MutationObserver(()=>{hg(o);let i=ll(o);i&&!r&&(document.activeElement===document.body||o.contains(document.activeElement))&&o.focus({preventScroll:!0}),r=i}),t.observe(o,{attributes:!0,attributeFilter:["class"]})}hg(o)};n(),setInterval(n,1e3),document.addEventListener("agentation-kit:slot",n),document.addEventListener("agentation-kit:note-added",()=>{document.querySelector("[data-annotation-popup]")&&Fp()}),window.addEventListener("keydown",o=>{o.key==="Escape"&&!o.isComposing&&zw(o)&&Fp()},!0),window.addEventListener("click",o=>{o.isTrusted&&o.composedPath().some(r=>r instanceof Element&&r.matches('[data-annotation-popup] [class*="cancel___"]'))&&Fp()},!0)}var zw=e=>e.composedPath().some(t=>t instanceof Element&&t.matches("[data-annotation-popup]"));function Fp(){Qc(()=>jp(),{ms:1500,when:()=>!document.querySelector("[data-annotation-popup]")})}var Up={mobile:[390,844],tablet:[820,1180],desktop:[1440,900]};function Qn(){let e=window.innerWidth,t=window.innerHeight;return{width:e,height:t,name:e<768?"mobile":e<1200?"tablet":"desktop"}}function Jc(e){let t=e.viewport;return!t||(t.name||(t.width<768?"mobile":t.width<1200?"tablet":"desktop"))===Qn().name}function Zc(){try{return window.parent!==window&&window.parent.__AGENTATION_KIT_SIMULATOR__?.frame?.contentWindow===window}catch{return!1}}function yg(){let e=null,t=null,n="desktop",o=null,r=null,i=[];function s(){if(e){t?.contentWindow?.__AGENTATION_KIT_EDIT__?.toggle(!1),e.host.remove(),e=null,t=null,o?.remove();for(let d of i)d.inert=!1;i=[],document.documentElement.classList.remove("sk-simulating"),window.__AGENTATION_KIT_SIMULATOR__=null,document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh")),window.__AGENTATION_KIT_REVIEW__?.focusViewport()}}function a(d,c=null){if(!Up[d])return;if(Zc())return window.parent.__AGENTATION_KIT_SIMULATOR__.choose(d,c);let p=!!e;if(n=d,!e){window.__AGENTATION_KIT_EDIT__?.toggle(!1),e=An(`
        .stage {position:fixed;inset:0;z-index:2147483646;background:#EFE7D8;display:flex;flex-direction:column;align-items:center;font:500 13px var(--sk-font);color:#1D1A2F}
        .tools {height:56px;flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 8px;max-width:100%;box-sizing:border-box;flex-wrap:wrap;justify-content:center}
        button {font:inherit;min-height:36px;padding:0 12px;background:transparent;color:inherit;border:0;border-radius:10px;cursor:pointer}
        button[aria-pressed=true] {background:white;box-shadow:0 1px 4px #0002}
        button:focus-visible {outline:2px solid #1D1A2F;outline-offset:2px}
        .canvas {overflow:auto;width:100%;flex:1;display:grid;justify-items:center;align-items:start;padding:12px;box-sizing:border-box}
        iframe {border:0;background:white;flex:none;box-shadow:0 3px 28px #0002;border-radius:8px;max-width:none}
        .size {font-variant-numeric:tabular-nums;color:#5E516C;padding:0 6px}
      `);let w=document.createElement("div");w.innerHTML='<div class="stage"><div class="tools" role="toolbar" aria-label="Viewport simulator"><button data-device="mobile">Mobile</button><button data-device="tablet">Tablet</button><button data-device="desktop">Desktop</button><span class="size" id="size"></span><button id="exit" aria-label="Exit viewport simulator">Exit \u2715</button></div><div class="canvas" id="canvas"></div></div>',e.root.append(w),t=Xn(document.createElement("iframe")),t.title="Page at simulated viewport",window.__AGENTATION_KIT_SIMULATOR__={frame:t,choose:a,close:s,target:c},t.src=location.href,r=document.createElement("div"),r.style.position="relative",r.append(t),e.el("canvas").append(r),t.style.transformOrigin="top left";for(let m of document.body.children)m!==e.host&&!m.inert&&(m.inert=!0,i.push(m));e.el("exit").onclick=s,e.root.querySelectorAll("[data-device]").forEach(m=>m.onclick=()=>a(m.dataset.device)),document.documentElement.classList.add("sk-simulating"),o=document.createElement("style"),o.textContent="html.sk-simulating{overflow:hidden!important}",document.head.append(o),e.el("exit").focus()}window.__AGENTATION_KIT_SIMULATOR__.target=c;let[f,C]=Up[d];t.style.width=f+"px",t.style.height=C+"px",p&&(t.src=location.href),l(),e.root.querySelectorAll("[data-device]").forEach(w=>w.setAttribute("aria-pressed",String(w.dataset.device===d))),t.addEventListener("load",()=>t.contentWindow?.dispatchEvent(new Event("resize")),{once:!0})}function l(){if(!t)return;let[d,c]=Up[n],p=Math.min(1,(innerWidth-32)/d,(innerHeight-88)/c);t.style.transform=`scale(${p})`,r.style.width=d*p+"px",r.style.height=c*p+"px",e.el("size").textContent=`${d} \xD7 ${c}${p<1?" \xB7 "+Math.round(p*100)+"%":""}`}return window.addEventListener("resize",l),{choose:a,close:s,get current(){return n}}}var Fw=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","TEXTAREA","SELECT","IFRAME","OBJECT","EMBED","CANVAS","VIDEO","AUDIO"]),Bw=new Set(["B","I","EM","STRONG","SPAN","A","BR","U","SUB","SUP","MARK","SMALL","CODE","ABBR","TIME","S","DEL","INS","KBD","WBR","Q","VAR","SAMP","BDI","BDO","FONT","LABEL"]),Ww={HEADER:"header",NAV:"nav",MAIN:"main",SECTION:"section",ARTICLE:"article",ASIDE:"aside",FOOTER:"footer",FORM:"form",DIALOG:"dialog"},Hw=new Set(["banner","navigation","main","region","complementary","contentinfo","form","search","dialog","article"]),jw="#agentation-root, [data-agentation-root], .sk-edit-ui, [data-sk-no-edit], [data-agentation-kit-chrome], [data-feedback-toolbar]",Uw=["alt","title","aria-label","aria-description","aria-roledescription","aria-valuetext","placeholder"],qw=new Set(["text","tspan","textPath","title","desc"]),jn=e=>String(e??"").replace(/\s+/g," ").trim();function oa(e){let t="";for(let n of e.childNodes){if(n.nodeType===3){t+=n.nodeValue;continue}if(n.nodeType!==1)continue;if(n.tagName==="BR"){t+=" ";continue}if(n.localName==="svg"&&n.namespaceURI?.endsWith("svg"))continue;let o="inline";try{o=getComputedStyle(n).display||"inline"}catch{}let r=oa(n);t+=/^inline($|-block)|contents/.test(o)?r:` ${r} `}return t}function Kw(e){let t=jn(e);return!/\s/.test(t)||!/\p{L}{2,}/u.test(t)?!1:!/^[a-z0-9_-]+(\s+[a-z0-9_-]+)*$/.test(t)}function cl(e){let t=[];for(let n=e,o=0;n&&n.nodeType===1&&o<4&&!(n.tagName==="BODY"||n.tagName==="HTML");o++,n=n.parentElement){if(n.id){t.unshift(`#${CSS.escape(n.id)}`);break}let r=n.tagName.toLowerCase(),i=(n.getAttribute("class")||"").trim().split(/\s+/).filter(s=>s&&!s.startsWith("sk-"))[0];i&&(r+=`.${CSS.escape(i)}`),t.unshift(r)}return t.join(" > ")}function Yw(e){let t=e.getAttribute("role");if(t&&Hw.has(t))return t;let n=Ww[e.tagName];return n||null}function Vw(e){let t=e.getAttribute("aria-label");if(t)return jn(t);let n=e.getAttribute("aria-labelledby");if(n){let r=n.split(/\s+/).map(i=>{let s=e.ownerDocument.getElementById(i);return s?oa(s):""}).join(" ");if(jn(r))return jn(r)}let o=e.querySelector("h1, h2, h3, h4, h5, h6, [role=heading]");return o&&jn(oa(o))?jn(oa(o)):e.id?`#${e.id}`:""}function dl(e){if(e.closest("[hidden], [inert]"))return"hidden";let t;try{t=getComputedStyle(e)}catch{return"shown"}return t.display==="none"||t.visibility==="hidden"?"hidden":e.closest("[aria-hidden=true]")?"decorative":"shown"}function Gw(e){if(!jn(e.textContent))return!1;for(let t of e.children)if(!(Bw.has(t.tagName)||t.namespaceURI?.endsWith("svg")&&qw.has(t.localName))&&!(t.namespaceURI?.endsWith("svg")&&t.localName==="svg"||!jn(t.textContent)))return!1;return!0}function Xw(e){if(e.children.length<2)return!1;for(let n of e.childNodes)if(n.nodeType===3&&jn(n.nodeValue))return!1;let t="";try{t=getComputedStyle(e).display||""}catch{}return/flex|grid/.test(t)&&Array.from(e.children).filter(n=>jn(n.textContent)).length>1}function xg(e=document){let t=[],n=[],o=1;jn(e.title)&&n.push({type:"text",depth:1,lm:1,tag:"title",text:jn(e.title),selector:"title",visibility:"meta"});for(let c of e.querySelectorAll("meta[name=description], meta[property^='og:'], meta[name^='twitter:']")){let p=c.getAttribute("name")||c.getAttribute("property")||"";if(!/title|description|site_name/.test(p))continue;let f=jn(c.getAttribute("content"));f&&n.push({type:"attr",depth:1,lm:1,tag:"meta",attr:"content",name:p,text:f,selector:`meta[${c.hasAttribute("name")?"name":"property"}="${p}"]`,visibility:"meta"})}n.length&&t.push({type:"landmark",depth:0,id:1,parent:0,kind:"head",label:"Page title and sharing"},...n);let r=new Map,i=new Map,s=c=>{for(let p=c.parentElement;p;p=p.parentElement)if(r.has(p))return p;return null},a=new WeakSet,l=e.createTreeWalker(e.body,NodeFilter.SHOW_ELEMENT,{acceptNode(c){return Fw.has(c.tagName)||c.matches(jw)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(let c=l.nextNode();c;c=l.nextNode()){let p=s(c),f=p?r.get(p)+1:1,C=Yw(c),w=p?i.get(p):0;C&&(r.set(c,f),i.set(c,++o),t.push({type:"landmark",depth:f-1,id:o,parent:w,kind:C,label:Vw(c),selector:cl(c),visibility:dl(c)}));let m=C?o:w;for(let y of Uw){let E=c.getAttribute(y);E&&jn(E)&&t.push({type:"attr",depth:f,lm:m,tag:c.tagName.toLowerCase(),attr:y,text:jn(E),selector:cl(c),visibility:dl(c)})}for(let y of c.attributes)!y.name.startsWith("data-")||y.name.startsWith("data-sk-")||!Kw(y.value)||t.push({type:"attr",depth:f,lm:m,tag:c.tagName.toLowerCase(),attr:y.name,text:jn(y.value),selector:cl(c),visibility:dl(c)});if(c.tagName==="INPUT"&&/^(button|submit|reset)$/i.test(c.type)&&jn(c.value)&&t.push({type:"attr",depth:f,lm:m,tag:"input",attr:"value",text:jn(c.value),selector:cl(c),visibility:dl(c)}),c.parentElement&&a.has(c.parentElement)){a.add(c);continue}if(!Gw(c)||Xw(c))continue;a.add(c);let S=/^H[1-6]$/.test(c.tagName)?Number(c.tagName[1]):c.getAttribute("role")==="heading"?Number(c.getAttribute("aria-level")||2):0,g=[];for(let y of c.childNodes){let E=y.nodeType===3?jn(y.nodeValue):y.nodeType===1?jn(oa(y)):"";E&&g.push(E)}t.push({type:S?"heading":"text",depth:f,lm:m,level:S||void 0,tag:c.tagName.toLowerCase(),text:jn(oa(c)),pieces:g.length>1?g:void 0,selector:cl(c),editId:c.getAttribute("data-sk-edit")||void 0,visibility:dl(c)})}let d=[];try{d=performance.getEntriesByType("resource").map(c=>c.name).filter(c=>/\.(m?[jt]sx?|cjs|vue|svelte|astro)(\?|$)/i.test(c))}catch{}for(let c of e.scripts)c.src&&d.push(c.src);return{url:location.href,title:jn(e.title),items:t,resources:[...new Set(d)]}}async function ul(e){if(!e)return{ok:!1,error:"no review server"};let t=null;try{t=window.open("","_blank")}catch{}try{let n=xg(document),o=await fetch(`${e}/copy-map/snapshot`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({outline:n,sessionId:window.__AGENTATION_KIT_AGENTATION_SESSION__||null,reviewer:_n()||null,viewport:Qn()})});if(!o.ok)throw new Error(`review server answered ${o.status}`);let{view:r}=await o.json(),i=`${e}/${r}`;if(t){try{t.opener=null}catch{}t.location.href=i}else t=window.open(i,"_blank","noopener");return{ok:!0,url:i,blocked:!t}}catch(n){try{t?.close()}catch{}return{ok:!1,error:n.message}}}var Qw={grip:'<path d="M9.5 6v12M14.5 6v12"/>',edit:'<path d="M4 5h16M12 5v15M8 20h8"/>',inbox:'<path d="M4 5h16v15H4zM4 14h5l2 3h2l2-3h5"/>',locate:'<circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',voice:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',viewport:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',"viewport-tablet":'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>',"viewport-mobile":'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',done:'<path d="M4 12l16-8-6 16-3-7z"/>',more:'<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="2.6"/>',comment:'<path d="M4 5h16v11H9.5L5 19.5V16H4z"/>',tweak:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',updown:'<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',layout:'<path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5"/>',pause:'<path d="M9 5v14M15 5v14"/>',markers:'<path d="M3 3l18 18M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.8M6.6 6.6C4.5 8 3.1 10 2.5 12c1 2.5 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',markdown:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h4"/>',clear:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',"agent-listening":'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',"agent-offline":'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 12h7"/>',"agent-working":'<circle cx="12" cy="12" r="8" opacity=".25"/><path d="M20 12a8 8 0 0 0-8-8"/>',"agent-complete":'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',"agent-needs-input":'<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2M12 13.6h.01"/>',"agent-failed":'<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',commit:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',revise:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>',reject:'<path d="M6 6l12 12M18 6L6 18"/>',chevron:'<path d="M6 15l6-6 6 6"/>',critique:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',checks:'<path d="M5.2 16.5a7.5 7.5 0 1 1 13.6 0"/><path d="M12 13.5l3.2-3.6"/>'},Yp=e=>{try{return new URL(e,location.href).pathname}catch{return""}},wg=e=>{try{let t=JSON.parse(localStorage.getItem("agentation-round"));return t?.link===Yp(e)?t:null}catch{return null}},Jw=e=>wg(e)?.ts||0,vg="feedback-toolbar-inbox-filter",Zw=()=>{try{return localStorage.getItem(vg)==="mine"?"mine":"all"}catch{return"all"}},ev=e=>{let t=new Date(e),n=t.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});return t.toDateString()===new Date().toDateString()?n:t.toLocaleDateString([],{month:"short",day:"numeric"})+", "+n},tv=e=>e.status==="dismissed"&&/^(Cleared by |Undone by .*: Fix it taken back\.$)/.test(e.resolution||""),qp=e=>e.author!=="agent"&&!tv(e),Do=e=>!["resolved","dismissed"].includes(e.status),Vp=e=>Do(e)&&e.author!=="agent"&&e.replies?.length>0&&e.replies[e.replies.length-1].from==="agent",Kp=e=>e.filter(t=>Vp(t)&&Bc(t));function nv(e,t=!1){return[t?"":e.kind==="edit"?"Text edit":e.kind==="tweak"?"Tweak":"Comment",e.viewport?.name].filter(Boolean).join(" \xB7 ")}var ed=e=>Us(e),ov={comment:Wc,"agent-listening":Hc.ready,"agent-working":Hc.working,"agent-offline":Hc.asleep},Wr=e=>ov[e]||`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${Qw[e]||""}</svg>`,pl="feedback-toolbar-placed";function rv({fresh:e=0,n:t=0,has:n=0,pages:o=1,sentAt:r=0,qs:i=0,drafts:s=0,tweaks:a=0}={}){let l=o>1?" across "+o+" pages":"",d=!e&&t>0,c=(C,w,m)=>C+(C===1?w:m),p;e?p=[{b:c(e," new note"," new notes")},n?`${l}. The agent reads ${e===1?"it":"them"} with the ${n} it already has.`:`${l} for the agent.`]:d?p=["The agent has ",{b:c(t," note"," notes")},l+". Nothing new to send."]:p=["No notes yet."];let f=[];return s&&f.push(c(s," text edit"," text edits")+" will be saved first."),a&&f.push(c(a," tweak"," tweaks")+" will be saved first."),i&&f.push(c(i," question is"," questions are")+" waiting on your answer."+(e?" You can send now and answer later.":"")),{went:d,lead:p,facts:f,send:{label:e?`Send ${e}`:d||r?"Send again":"Send to agent",kind:d?"ghost":"primary",disabled:!t}}}function bg({endpoint:e,sessionId:t,editMode:n,copyView:o=!0}){let r=o!==!1&&!!e,i=[],s=[],a=null,l=!1,d=!1,c="",p=null,f=!1,C=Jw(e),w=wg(e)?.reviewer||"",m=0,S=Zw(),g=new Set,y=new Map,E=u=>[u.id,u.clientId].filter(Boolean).map(String),A=()=>s.length?s.flatMap(u=>u.annotations.map(v=>({...v,page:u.url,here:u.id===t}))):i.map(u=>({...u,page:location.href,here:!0})),Q=u=>new Set(u.flatMap(E)),G=()=>{let u=A();if(!y.size)return u;let v=Q(u);return u.concat([...y.values()].filter($=>!E($).some(V=>v.has(V))).map($=>({...$,page:location.href,here:!0})))};function D(u){if(!u?.id||u.author==="agent"||["resolved","dismissed"].includes(u.status))return;document.dispatchEvent(new CustomEvent("agentation-kit:note-added"));let v=String(u.clientId||u.id);E(u).some($=>Q(A()).has($))||y.set(v,{...y.get(v),...u,reviewer:u.reviewer||_n()||void 0,status:u.status||"pending",timestamp:Number(u.timestamp)||Number(u.createdAt)||Date.now(),seen:Date.now()}),O(),a==="inbox"&&!p&&!f&&wn(),tn(!0),setTimeout(()=>tn(!0),700)}let le=yg(),K=An(`
    [hidden],.panel[data-deferred]{display:none!important}
    .panel{position:fixed;right:20px;bottom:122px;width:320px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 150px);overflow:auto;z-index:${un.panel};font:13px/1.5 var(--sk-font)}
    .panel.strip{width:max-content}.panel.strip .hd{border-bottom:0;padding:6px 6px 6px 11px;white-space:nowrap}.panel.strip .body{display:none}
    .hd #commit-all,.hd #all-copy{padding:3px 9px;min-height:26px;font-size:12px}.hd #toggle{display:grid;place-items:center;width:26px;height:26px;min-height:26px;padding:0}.hd #toggle[aria-expanded=true] svg{transform:rotate(180deg)}
    .hd{position:sticky;top:0;background:var(--sk-surface);z-index:2}
    .body{padding:12px}.hint{color:var(--sk-text-2);margin:0 0 12px}.empty{padding:24px 6px;text-align:center}
    .row{padding:7px 0 9px;border-bottom:1px solid var(--sk-hairline)}.row:last-child{border-bottom:0}
    /* An answered row holds focus (F-Answer): its ring clears the text it surrounds. */
    .row[tabindex="-1"]:focus{outline:2px solid var(--sk-focus);outline-offset:4px;border-radius:4px}
    /* Brought into view, a row leaves room for that ring (6px) below and above it (UX review 6, N9). */
    .row{scroll-margin-block:8px}
    .meta{display:flex;align-items:center;gap:6px;color:var(--sk-text-2);font-size:12px;min-height:26px;margin-bottom:3px}.meta .tools{margin-left:auto;display:flex;align-items:center;gap:1px;flex:none}.meta .tools button{padding:0;width:26px;min-height:26px;display:grid;place-items:center}.meta .label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .copy{white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0;font-size:13px}.row:not(.open) .copy{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}.row[data-expandable]{cursor:pointer}
    /* Before and After are words, not a coloured bar down one side: the old
       text keeps its strike-through, the new text reads at full strength. */
    .diff{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:2px 8px;align-items:baseline;margin:0}.diff>div{display:contents}
    .diff small{font-size:12px;color:var(--sk-text-3)}.diff .txt{white-space:pre-wrap;overflow-wrap:anywhere;min-width:0}
    .before .txt{color:var(--sk-text-2);text-decoration:line-through;text-decoration-thickness:1px}.after .txt{font-size:12.5px}
    .row:not(.open) .before .txt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.row:not(.open) .after .txt{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
    .actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}button{min-height:32px}button:focus-visible,textarea:focus-visible,select:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    .actions button{padding:4px 10px;font:inherit}
    label{display:block;margin:10px 0 4px;color:var(--sk-text-2)}textarea{width:100%;min-height:90px;box-sizing:border-box;resize:vertical}
    .message{padding:9px 12px;color:var(--sk-text-2);overflow-wrap:anywhere}.message.error{color:#df8989}:host([data-sk-theme=light]) .message.error{color:#c53030}
    .why{margin:8px 0 0;color:var(--sk-text-2)}
    .devices{display:grid;gap:8px}.devices button{text-align:left;display:flex;justify-content:space-between;padding:10px 12px}
    select{font:inherit;background:var(--sk-surface);color:var(--sk-text);padding:6px;border:1px solid var(--sk-hairline);border-radius:8px;max-width:100%}
    .sec{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--sk-text-2);margin:14px 0 0;padding-bottom:4px;border-bottom:1px solid var(--sk-hairline)}.sec:first-child{margin-top:0}
    .sec .n{font-weight:500;color:var(--sk-text-3)}
    .meta .label.page{color:var(--sk-text-2);overflow-wrap:anywhere}.meta .q{color:var(--sk-text);font-weight:600}
    .tweak-what{margin:2px 0 3px;font:12px/1.4 var(--sk-mono);overflow-wrap:anywhere}
    .who-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 0 10px;color:var(--sk-text-2);font-size:12px}.who-bar .me{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.who-bar .ghost{padding:2px 6px;min-height:26px;font-size:12px}.who-bar .chips{display:flex;gap:4px;margin-left:auto}.who-bar .chip{min-height:26px}
    .meta .by{color:var(--sk-text);font-weight:500}.meta .label.with-by{display:flex}.meta .label.with-by .txt{min-width:0;overflow:hidden;text-overflow:ellipsis}.meta .label.with-by .sep{flex:none;white-space:pre}.meta .label.with-by .by{flex:none;max-width:60%;overflow:hidden;text-overflow:ellipsis}
    .row.from-agent{display:flex;align-items:center;justify-content:space-between;gap:12px}.row.from-agent .copy{margin:0}
    .summary{margin:0 0 12px;font-size:12.5px}.summary b{font-weight:600}.sent{display:flex;align-items:flex-start;gap:6px}.sent svg{flex:none;width:14px;height:14px;margin-top:2px}
    /* The notice's shape and type (voice.css.js .notice). A guard or a heads-up
       is not an error: its lead is the text colour. Red is for a real failure,
       a note that did not save (UX review 6, N8). */
    .toast{position:fixed;z-index:${un.toast};max-width:min(320px,calc(100vw - 24px));padding:9px 12px;border-radius:8px;font:12px/1.45 var(--sk-font);background:var(--sk-surface);color:var(--sk-text);box-shadow:0 4px 18px rgba(0,0,0,.25),0 0 0 1px var(--sk-hairline)}
    .toast strong{color:var(--sk-text);font-weight:600}.toast.fail strong{color:#df8989}:host([data-sk-theme=light]) .toast.fail strong{color:#c53030}
${ta()}
    /* Text is 12px or more (ui.js's shared sizes go to 11px). */
    .hd .grow,.chip,.status,.who{font-size:12px}
    @media (pointer:coarse){button{min-height:44px}.who-bar .chip,.who-bar .ghost{min-height:44px}.meta .tools button{width:44px;min-height:44px}.hd #commit-all,.hd #all-copy,.hd #toggle{min-height:44px}.hd #toggle{width:44px;height:44px;min-width:44px;display:grid;place-items:center}.panel.strip .hd{padding:3px 3px 3px 12px}}
  `),W=document.createElement("section");W.className="panel",W.hidden=!0,W.setAttribute("aria-label","Review tools"),W.innerHTML='<div class="hd"><span id="title" class="title sk-title">Feedback inbox</span><span class="grow" id="count"></span><button id="all-copy" class="ghost" hidden title="Edit every string, full page (Shift T)" aria-keyshortcuts="Shift+T">All text</button><button id="commit-all" class="primary" hidden>Save</button><button id="toggle" class="iconbtn" hidden></button><button id="close" class="sk-x" aria-label="Close review panel" title="Close">'+ii+'</button></div><div class="message" id="message" role="status" aria-live="polite"></div><div class="body" id="body"></div>',K.root.append(W),K.el("close").onclick=()=>we(null),K.el("toggle").innerHTML=Wr("chevron"),K.el("toggle").onclick=()=>{l=!l,wn()};let Y=()=>ei(async()=>{let u=await ul(e);if(!u.ok)throw new Error(`Couldn\u2019t open All text: ${u.error}.`);if(u.blocked)throw new Error(`The browser blocked the new tab. Open ${u.url}`)});K.el("all-copy").onclick=Y,document.addEventListener("keydown",u=>{u.key!=="T"||!u.shiftKey||u.metaKey||u.ctrlKey||u.altKey||!r||u.composedPath().some(v=>v instanceof Element&&v.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'))||(u.preventDefault(),u.stopPropagation(),Y())},!0),K.el("commit-all").onclick=()=>ei(async()=>{let u=Jt().length,v=await n.commit();if(v.failed||v.count<u)throw new Error("Could not save. Your drafts are kept; retry when connected.")});let he=document.createElement("div");he.className="toast",he.hidden=!0,he.setAttribute("role","alert"),K.root.append(he);let Ce=null;function Oe(u,v=5e3,$=!1){he.replaceChildren(u),he.hidden=!1,he.classList.toggle("fail",$);let V=document.querySelector("[data-agentation-toolbar]")?.getBoundingClientRect(),ue=Math.min(320,innerWidth-24);he.style.left=Math.max(12,Math.min((V?V.right:innerWidth-12)-ue,innerWidth-ue-12))+"px",he.style.top="auto",he.style.bottom=Math.max(12,innerHeight-(V?V.top:innerHeight-70)+10)+"px",clearTimeout(Ce),Ce=setTimeout(()=>{he.hidden=!0},v)}window.__AGENTATION_KIT_CONFIRM_CLEAR__=(u,v=0)=>{let $=document.createElement("div"),V=document.createElement("strong"),ue=v?" Notes from other reviewers stay.":"";if(!u)return m=0,V.textContent=v?"None of the notes on this page are yours.":"Nothing to clear on this page.",$.append(V,document.createTextNode(v?" Clear removes only your own notes.":"")),Oe($),!1;let pe=Date.now();return m&&pe-m<5e3?(m=0,he.hidden=!0,!0):(m=pe,V.textContent=u===1?"Clear your note on this page?":"Clear your "+u+" notes on this page?",$.append(V,document.createTextNode(" Press Clear again within 5 seconds."+ue+" To drop one note, delete it in the inbox instead.")),Oe($),!1)};function Pe(){let u=[...document.querySelectorAll("[data-annotation-popup]")].find($=>{if(!$.isConnected||$.hidden||/exit___/.test($.className))return!1;let V=$.getBoundingClientRect(),ue=getComputedStyle($);return V.width>0&&V.height>0&&ue.display!=="none"&&ue.visibility!=="hidden"});if(!u)return!0;let v=u.querySelector("textarea");if((v?.value||"").trim()){let $=document.createElement("div"),V=document.createElement("strong");return V.textContent="Finish or cancel the note first.",$.append(V),Oe($,4e3),v.focus({preventScroll:!0}),!1}return u.querySelector('[class*="cancel___"]')?.click(),!0}let je=u=>u?.parentElement?.querySelector(':scope>[class*="buttonTooltip"]')?.firstChild?.textContent?.trim()==="Exit";document.addEventListener("click",u=>{let v=u.target?.closest?.('[data-agentation-toolbar] [class*="controlsContent"] button');!v||!je(v)||Pe()||(u.preventDefault(),u.stopPropagation())},!0),window.__AGENTATION_KIT_SAVE_FAILED__=u=>{let v=document.createElement("div"),$=document.createElement("strong");$.textContent="Your note was not saved to the review server.",v.append($,document.createTextNode(" "+so(ig(u)).replace("Your text is kept","It is kept on this page").replace("Shorten it and try again.","Edit it shorter from its marker to retry."))),Oe(v,9e3,!0)},window.__AGENTATION_KIT_NOT_YOURS__=u=>{let v=document.createElement("div"),$=document.createElement("strong");$.textContent=u?.reviewer?"This note is "+u.reviewer+"\u2019s.":"This note is not yours.",v.append($,document.createTextNode(" Only the reviewer who left it can delete it.")),Oe(v)};let $e=null,rt=null,Ve=!1,gt=!1,U=[{key:"comment",name:"Comment",hint:"Click anything and type a note.",shortcut:"N"},{key:"voice",name:"Talk",hint:"Talk while you point. Your words stay with what you point at.",shortcut:"V"},{key:"edit",name:"Edit text",hint:"Rewrite text in place, or open all page text full screen.",shortcut:"T"},{key:"tweak",name:"Tweak",hint:"Change size, spacing and colour, using sizes the page already has.",shortcut:"D"}],oe=()=>window.__AGENTATION_KIT_TWEAK__,de=u=>u.key==="tweak"?!!oe():u.key==="voice"?!!window.__AGENTATION_KIT_VOICE__:!0,Re=()=>!!window.__AGENTATION_KIT_VOICE_RECORDING__||Mo()==="voice";function ze(){return Re()?"voice":n?.active?"edit":oe()?.active?"tweak":"comment"}function Ke(u){if(u!=="comment"&&u!==ze()&&!Pe())return;ke(!1),Lt(!1);let v=window.__AGENTATION_KIT_VOICE__;if(u==="voice"&&Mo()==="voice"&&!window.__AGENTATION_KIT_VOICE_RECORDING__){v?.close?.(),O();return}if(u!=="voice"&&!window.__AGENTATION_KIT_VOICE_RECORDING__&&v?.close?.(),u==="edit"){oe()?.toggle(!1),n?.toggle(),we(n?.active?"edits":null);return}if(u==="voice"){oe()?.toggle(!1),n?.active&&n.toggle(!1),window.__AGENTATION_KIT_VOICE__?.open(),O();return}n?.active&&n.toggle(!1),oe()?.toggle(u==="tweak"),O()}let Et=u=>u.composedPath().some(v=>v instanceof Element&&v.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')),dn=()=>!!document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]');document.addEventListener("keydown",u=>{if(u.metaKey||u.ctrlKey||u.altKey||u.shiftKey||u.repeat)return;let v=U.find($=>$.shortcut===u.key.toUpperCase());!v||!de(v)||!dn()||Et(u)||v.key==="edit"&&!n||(u.preventDefault(),u.stopPropagation(),Ke(v.key))},!0);let Ye=(u,v,$)=>{let V=document.createElement("button");return V.className=u,V.dataset.review=v,V.dataset.tip=$,V.setAttribute("aria-label",$),V.innerHTML=Wr(v),V};function Rt(){document.querySelectorAll('[data-agentation-root] a[class*="settingsBrand"]').forEach(Ee=>Ee.setAttribute("aria-label","Built on Agentation: opens agentation.com"));let u=document.querySelector('[data-agentation-root] textarea[placeholder="Webhook URL"]');if(u&&!u.getAttribute("aria-label")){u.id||(u.id="sk-webhook-url"),u.setAttribute("aria-label","Webhook URL");let Ee=document.createElement("label");Ee.htmlFor=u.id,Ee.textContent="Webhook URL",Ee.style.cssText="display:block;font:12px "+co+";margin:4px 0;color:inherit",u.before(Ee)}let v=document.querySelector('[data-agentation-toolbar] [class*="controlsContent"]');if(!v||$e?.isConnected)return;let $=v.querySelector("button")?.className||"";$e=Xn(document.createElement("div")),$e.className="sk-review-controls",$e.append(Ye($,"grip","Move toolbar"));let V=document.createElement("div");V.className="sk-modes",V.setAttribute("role","group"),V.setAttribute("aria-label","Feedback mode");for(let Ee of U){let tt=Ye($,Ee.key,Ee.name);tt.dataset.mode=Ee.key,tt.dataset.key=Ee.shortcut;let $t=document.createElement("span");$t.className="sk-label",$t.textContent=Ee.name,$t.setAttribute("aria-hidden","true"),tt.append($t),tt.setAttribute("aria-keyshortcuts",Ee.shortcut),tt.setAttribute("aria-pressed","false"),tt.onclick=Cn=>{Cn.stopPropagation(),Ke(Ee.key)},V.append(tt)}let ue=Ye($+" sk-mode-pick","mode","Change mode");ue.setAttribute("aria-haspopup","menu"),ue.setAttribute("aria-expanded","false"),ue.onclick=Ee=>{Ee.stopPropagation(),!(!gt&&!Pe())&&Lt(!gt)};let pe=document.createElement("span");pe.className="sk-divider",pe.setAttribute("aria-hidden","true");let be=Ye($,"inbox","Feedback inbox");be.setAttribute("aria-pressed","false"),be.onclick=Ee=>{Ee.stopPropagation(),!(a!=="inbox"&&!Pe())&&(ke(!1),Lt(!1),we(a==="inbox"?null:"inbox"))};let et=Ye($+" sk-agent","agent","Agent status");et.hidden=!0,et.setAttribute("aria-haspopup","dialog"),et.onclick=Ee=>{Ee.stopPropagation(),!(Mo()!=="agent-work"&&!Pe())&&(ke(!1),Lt(!1),window.__AGENTATION_KIT_AGENT_WORK__?.toggle?.())};let kt=Ye($+" sk-send","done","Send feedback to the agent");kt.setAttribute("aria-pressed","false"),kt.onclick=Ee=>{Ee.stopPropagation(),!(a!=="done"&&!Pe())&&(ke(!1),Lt(!1),we(a==="done"?null:"done"))},$e.append(V,ue,pe,be,et,kt),rt=Xn(document.createElement("div")),rt.className="sk-review-controls sk-review-end";let _t=Ye($,"more","More tools");if(_t.setAttribute("aria-haspopup","menu"),_t.setAttribute("aria-expanded","false"),_t.onclick=Ee=>{Ee.stopPropagation(),!(!Ve&&!Pe())&&(Lt(!1),ke(!Ve))},rt.append(_t),v.prepend($e),v.insertBefore(rt,v.querySelector(':scope>[class*="divider"]')||v.lastElementChild),v.querySelectorAll("button:not([aria-label])").forEach(Ee=>{let tt=Ee.parentElement.querySelector('[class*="buttonTooltip"]');tt&&Ee.setAttribute("aria-label",tt.childNodes[0]?.textContent?.trim()||tt.textContent.trim())}),!n){let Ee=$e.querySelector("[data-mode=edit]");Ee.disabled=!0,Ee.dataset.tip=window.__AGENTATION_KIT_EDIT_STANDDOWN__||"Text editing unavailable",delete Ee.dataset.key}for(let Ee of[$e,rt])Ee.addEventListener("pointerover",Xe),Ee.addEventListener("pointerout",it),Ee.addEventListener("focusin",Pt),Ee.addEventListener("focusout",Ge),Ee.addEventListener("pointerdown",Ge,!0);qe();let at=$e.querySelector("[data-review=grip]");at.style.touchAction="none",at.style.cursor="grab";let Je=null;at.onpointerdown=Ee=>{if(Ee.button!==0)return;Nn(),ke(!1),Lt(!1),Ee.preventDefault(),Ee.stopPropagation();let tt=document.querySelector("[data-agentation-toolbar]").getBoundingClientRect();Je={x:Ee.clientX,y:Ee.clientY,left:tt.left,top:tt.top},at.setPointerCapture(Ee.pointerId)},at.onpointermove=Ee=>{Je&&At(Je.left+Ee.clientX-Je.x,Je.top+Ee.clientY-Je.y)},at.onpointerup=at.onpointercancel=()=>{Je=null},at.onkeydown=Ee=>{if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home"].includes(Ee.key))return;Ee.preventDefault(),Ee.stopPropagation(),Nn();let tt=document.querySelector("[data-agentation-toolbar]").getBoundingClientRect(),$t=Ee.shiftKey?40:10;At(Ee.key==="Home"?innerWidth-tt.width-20:tt.left+(Ee.key==="ArrowRight"?$t:Ee.key==="ArrowLeft"?-$t:0),Ee.key==="Home"?innerHeight-tt.height-20:tt.top+(Ee.key==="ArrowDown"?$t:Ee.key==="ArrowUp"?-$t:0))},ce(window.__AGENTATION_KIT_AGENT_WORK_STATUS__),ie(),O()}let Ft=document.createElement("style");Ft.textContent=`
    .menu{position:fixed;z-index:${un.panel};width:max-content;min-width:232px;max-width:calc(100vw - 24px);padding:6px;background:var(--sk-surface);color:var(--sk-text);border-radius:14px;box-shadow:var(--sk-ring);font:400 13px/1.4 var(--sk-font)}
    .menu button{display:flex;align-items:center;gap:10px;width:100%;min-height:34px;padding:6px 10px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
    .menu button:hover,.menu button:focus-visible{background:var(--sk-hover);outline:none}
    /* The keyboard's place in the menu is a ring, not only the hover tint (UX review 6, N11). */
    .menu button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:-2px}
    .menu button svg{flex:none;width:16px;height:16px;color:var(--sk-text-2)}.menu button svg[data-art]{width:18px;height:18px;color:var(--sk-text)}
    .menu .k,.menu .v{margin-left:auto;padding-left:16px;color:var(--sk-text-3);font-size:12px}
    .menu .v{color:var(--sk-text-2)}
    .menu hr{border:0;border-top:1px solid var(--sk-hairline);margin:5px 4px}
    .menu .danger,.menu .danger svg{color:#FF8FB3}
    /* Light: the dark theme's danger pink is 2.4:1 on white; this is 5.9:1 (N6). */
    :host([data-sk-theme=light]) .menu .danger,:host([data-sk-theme=light]) .menu .danger svg{color:#B0204A}
    .menu .two{display:grid;gap:2px}.menu .two small{color:var(--sk-text-2);font-size:12px;line-height:1.35}
    .menu.sheet button{align-items:flex-start;padding:10px}.menu.sheet button svg{margin-top:1px}
    .menu .tick{margin-left:auto;padding-left:12px;visibility:hidden}.menu [aria-checked=true] .tick{visibility:visible;color:var(--sk-text)}
    @media (pointer:coarse){.menu button{min-height:44px}.menu .k{display:none}}
    /* The bar's tooltip, drawn like the component's own ("Exit Esc"). */
    .tip{position:fixed;z-index:${un.toast};padding:6px 10px;background:#1D1A2F;color:rgba(255,244,224,.94);font:500 12px/1.3 var(--sk-font);border-radius:8px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(12,10,24,.3),0 0 0 1px rgba(255,244,224,.14)}
    .tip::after{content:"";position:absolute;left:var(--x,50%);top:calc(100% - 4px);width:8px;height:8px;background:inherit;border-radius:0 0 2px 0;transform:translateX(-50%) rotate(45deg)}
    .tip.below::after{top:-4px;border-radius:2px 0 0 0}
    /* The key hint is quieter than the name but still 4.5:1 (N6): dark .65, light .6. */
    .tip .k{margin-left:4px;color:rgba(255,244,224,.68)}
    :host([data-sk-theme=light]) .tip{background:#FFFCF5;color:rgba(29,26,47,.94);box-shadow:0 2px 8px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04)}
    :host([data-sk-theme=light]) .tip .k{color:rgba(29,26,47,.66)}
  `,K.root.append(Ft);let lt=document.createElement("div");lt.className="menu",lt.setAttribute("role","menu"),lt.setAttribute("aria-label","More tools"),lt.hidden=!0;let ht=document.createElement("div");ht.className="menu sheet",ht.setAttribute("role","menu"),ht.setAttribute("aria-label","Feedback mode"),ht.hidden=!0,K.root.append(lt,ht);for(let u of[lt,ht])u.addEventListener("keydown",v=>{if(v.metaKey||v.ctrlKey||v.altKey)return;let $=[...u.querySelectorAll("button")].filter(be=>!be.disabled&&!be.hidden);if(!$.length)return;let V=$.indexOf(K.root.activeElement),ue=$.length-1,pe={ArrowDown:V<0||V===ue?0:V+1,ArrowUp:V<=0?ue:V-1,Home:0,End:ue}[v.key];pe!==void 0&&(v.preventDefault(),v.stopPropagation(),$[pe].focus())}),u.addEventListener("focusin",v=>{for(let $ of u.querySelectorAll("button"))$.tabIndex=$===v.target?0:-1});let Ze=document.createElement("div");Ze.className="tip",Ze.setAttribute("aria-hidden","true"),Ze.hidden=!0,Ze.dataset.barTip="",K.root.append(Ze);let qt=null,Zt=0,en=0,on=u=>{let v=u.target?.closest?.("button[data-tip]");return v&&!v.hidden?v:null},R=()=>!!document.querySelector('[data-agentation-toolbar] [class*="settingsPanel_"][class*="enter"]');function re(u){if(Ze.replaceChildren(document.createTextNode(u.dataset.tip)),u.dataset.key){let kt=document.createElement("span");kt.className="k",kt.textContent=u.dataset.key,Ze.append(kt)}Ze.hidden=!1;let v=u.getBoundingClientRect(),$=Ze.offsetWidth,V=Ze.offsetHeight,ue=Math.round(Math.max(8,Math.min(v.left+v.width/2-$/2,innerWidth-$-8))),pe=v.top-14-V<8;Ze.classList.toggle("below",pe);let be=pe?v.bottom+14:v.top-14-V,et=ae();et&&!pe&&ue<et.right&&ue+$>et.left&&be<et.bottom&&be+V>et.top&&(be=Math.max(8,et.top-6-V)),Ze.style.left=ue+"px",Ze.style.top=Math.round(be)+"px",Ze.style.setProperty("--x",Math.round(v.left+v.width/2-ue)+"px")}function ae(){let u=document.querySelector("[data-replies-ui]")?.shadowRoot?.querySelector("[data-question-notice]");if(!u||u.hidden)return null;let v=u.getBoundingClientRect();return v.width?v:null}function ve(u,v){if(clearTimeout(Zt),Ve||gt||R())return;let $=()=>{!u.isConnected||u.hidden||(qt=u,re(u),en=Date.now())};v||Date.now()-en<400?$():Zt=setTimeout($,850)}function Ge(){clearTimeout(Zt),Ze.hidden||(en=Date.now()),Ze.hidden=!0,qt=null}function Xe(u){if(u.pointerType==="touch")return;let v=on(u);v&&v!==qt&&ve(v,!1)}function it(u){let v=on(u);v&&!v.contains(u.relatedTarget)&&Ge()}function Pt(u){let v=on(u);v&&v.matches(":focus-visible")&&ve(v,!0)}addEventListener("scroll",Ge,{passive:!0,capture:!0});let Qe='[data-agentation-toolbar] [class*="controlsContent"] [class*="buttonWrapper"]';function bt(u){let v=u.getBoundingClientRect();if(!v.width||!v.height)return!1;let $=[v.left+.5,v.left+v.width/4,v.left+v.width/2,v.right-v.width/4,v.right-.5],V=[v.top+.5,v.top+v.height/2,v.bottom-.5];for(let ue of $)for(let pe of V){let be=document.elementFromPoint(ue,pe);if(be?.closest?.(".sk-edit-ui")&&!be.closest("[data-agentation-root]"))return!0}return!1}let j=0;function q(){for(let u of document.querySelectorAll(Qe+'>[class*="buttonTooltip"]')){let v=u.parentElement.matches(":hover")&&bt(u);u.hasAttribute("data-sk-covered")!==v&&u.toggleAttribute("data-sk-covered",v)}}function J(){if(j)return;let u=()=>{q(),j=document.querySelector(Qe+":hover")?requestAnimationFrame(u):0};u()}document.addEventListener("pointerover",u=>{u.target?.closest?.(Qe)&&J()},!0),document.addEventListener("agentation-kit:slot",J),document.addEventListener("keydown",u=>{u.key==="Escape"&&Ge()},!0);let ye=null;function Ae(){let u=document.querySelector("[data-agentation-toolbar]");if(!u)return;let v=u.querySelector('[class*="controlsContent"]');if(v){let $=/hidden/.test(v.className);v.inert!==$&&(v.inert=$),$&&Ge()}for(let $ of u.querySelectorAll('[class*="settingsPanel_"]')){let V=!/enter/.test($.className);$.inert!==V&&($.inert=V)}}function qe(){let u=document.querySelector("[data-agentation-toolbar]");if(u){if(ye?.bar!==u){ye?.obs.disconnect();let v=new MutationObserver(Ae);v.observe(u,{subtree:!0,childList:!0,attributes:!0,attributeFilter:["class"]}),ye={bar:u,obs:v}}Ae()}}let me=u=>document.querySelector(`[data-agentation-toolbar] [class*="controlsContent"] button[aria-label="${u}"]`);function Me(u,v,$,V,{key:ue="",value:pe="",danger:be=!1,checked:et=null,hint:kt=""}={}){let _t=document.createElement("button");if(_t.type="button",_t.setAttribute("role",et===null?"menuitem":"menuitemradio"),et!==null&&_t.setAttribute("aria-checked",String(et)),be&&(_t.className="danger"),_t.innerHTML=Wr(v),kt){let at=document.createElement("span");at.className="two";let Je=document.createElement("span");Je.textContent=$;let Ee=document.createElement("small");Ee.textContent=kt,at.append(Je,Ee),_t.append(at)}else _t.append(document.createTextNode($));if(pe){let at=document.createElement("span");at.className="v",at.textContent=pe,_t.append(at)}if(ue){let at=document.createElement("span");at.className="k",at.textContent=ue,_t.append(at)}if(et!==null){let at=document.createElement("span");at.className="tick",at.innerHTML=Wr("commit"),_t.append(at)}return _t.onclick=at=>{at.stopPropagation(),V()},u.append(_t),_t}function Ue(){lt.replaceChildren();let u=(et,kt)=>()=>{ke(!1),me(et)?.click(),kt&&gg(kt),requestAnimationFrame(O)},v=et=>me(et)?.dataset.active==="true",$=Qn().name;Me(lt,$==="desktop"?"viewport":"viewport-"+$,"Viewport",()=>{ke(!1),we("viewport")},{value:$[0].toUpperCase()+$.slice(1)}),me("Layout mode")&&Me(lt,"layout","Layout moves",u("Layout mode","layout"),v("Layout mode")?{value:"On"}:{key:"L"}),me("Pause animations")&&Me(lt,"pause","Pause animations",u("Pause animations"),v("Pause animations")?{value:"On"}:{key:"P"}),window.__AGENTATION_KIT_CRITIQUE__?.runChecks&&Me(lt,"checks","Run checks",()=>{ke(!1),window.__AGENTATION_KIT_CRITIQUE__.runChecks()});let V=me("Show markers")?"Show markers":"Hide markers";me(V)&&Me(lt,"markers",V,u(V),{key:"H"}),lt.append(document.createElement("hr")),me("Copy feedback")&&Me(lt,"markdown","Notes as Markdown",u("Copy feedback"),{key:"C"});let ue=me("Send Annotations");ue&&!ue.disabled&&ue.offsetParent!==null&&Me(lt,"done","Send to webhook",u("Send Annotations"),{key:"S"});let pe=G().filter(et=>et.here&&Do(et)&&ls(et)).length,be=m&&Date.now()-m<5e3;me("Clear all")&&Me(lt,"clear",be?`Press again to clear ${pe===1?"your note":pe?`your ${pe} notes`:"your notes"}`:pe?`Clear my ${pe} ${pe===1?"note":"notes"}`:"Clear my notes",u("Clear all"),{key:"X",danger:!0}),lt.append(document.createElement("hr")),me("Settings")&&Me(lt,"settings","Settings",u("Settings","settings"))}function It(){ht.replaceChildren();let u=ze();for(let v of U)de(v)&&(v.key!=="edit"||n)&&Me(ht,v.key,v.name,()=>Ke(v.key),{hint:v.hint,checked:u===v.key})}function jt(u){let v=Xs()?.getBoundingClientRect();if(v?.width)if(u.style.top="auto",u.style.bottom=Math.round(innerHeight-v.top+8)+"px",innerWidth<600)Object.assign(u.style,{left:"12px",right:"12px",width:"auto"});else{u.style.width="",u.style.right="auto";let $=u.getBoundingClientRect().width||240;u.style.left=Math.round(Math.max(12,Math.min(v.right-$,innerWidth-$-12)))+"px"}}let Qt=Vn("more",u=>{lt.hidden=!(u&&Ve),!u&&Ve?(Ve=!1,Ot()):u&&jt(lt)}),Kt=Vn("mode-sheet",u=>{ht.hidden=!(u&&gt),!u&&gt?(gt=!1,Ot()):u&&jt(ht)});function Ot(){rt?.querySelector("[data-review=more]")?.setAttribute("aria-expanded",String(Ve)),$e?.querySelector("[data-review=mode]")?.setAttribute("aria-expanded",String(gt))}function ke(u){if(u===Ve)return;let v=!u&&lt.contains(K.root.activeElement);Ve=u,Ve&&(Ue(),he.hidden=!0,Ge()),Qt.want(Ve,{bump:!0}),Ot(),Ve&&Qt.visible&&(jt(lt),lt.querySelector("button")?.focus()),v&&kr(rt?.querySelector("[data-review=more]"))}function Lt(u){if(u===gt)return;let v=!u&&ht.contains(K.root.activeElement);gt=u,gt&&(It(),Ge()),Kt.want(gt,{bump:!0}),Ot(),gt&&Kt.visible&&(jt(ht),ht.querySelector("[aria-checked=true]")?.focus()),v&&kr($e?.querySelector("[data-review=mode]"))}function At(u,v){let $=document.querySelector("[data-agentation-toolbar]").getBoundingClientRect(),V=T(),ue=V.left-$.left,pe={x:Math.max(12-ue,Math.min(u,innerWidth-12-ue-V.width)),y:Math.max(12,Math.min(v,innerHeight-$.height-12))};document.dispatchEvent(new CustomEvent("agentation-kit:toolbar-position",{detail:pe})),requestAnimationFrame(an);try{localStorage.setItem("feedback-toolbar-position",JSON.stringify(pe))}catch{}}window.__AGENTATION_KIT_TOOLBAR_WIDTH__=()=>document.querySelector("[data-agentation-toolbar]")?.getBoundingClientRect().width||337;function T(){let u=document.querySelector("[data-agentation-toolbar]");return(u?.querySelector('[class*="toolbarContainer"]')||u).getBoundingClientRect()}window.__AGENTATION_KIT_TOOLBAR_OFFSET__=()=>{let u=document.querySelector("[data-agentation-toolbar]");return u?Math.max(0,T().left-u.getBoundingClientRect().left):0};function L(){let u=document.querySelector("[data-agentation-toolbar]"),v=u?.querySelector('[class*="controlsContent"]');if(!v||!dn())return;let $=$e?.querySelector("[data-review=mode]");$&&I($);let V=1/0,ue=-1/0;for(let et of v.children){let kt=et.getBoundingClientRect();kt.width&&(V=Math.min(V,kt.left),ue=Math.max(ue,kt.right))}if(V===1/0)return;let pe=Math.min(Math.ceil(ue-V+12),innerWidth-40),be=parseFloat(u.style.getPropertyValue("--sk-toolbar-width"))||0;Math.abs(be-pe)>1&&u.style.setProperty("--sk-toolbar-width",pe+"px"),requestAnimationFrame(()=>{let et=u.getBoundingClientRect(),kt=!1;try{kt=!!localStorage.getItem(pl)}catch{}!kt&&Math.abs(et.right-(innerWidth-20))>1?At(innerWidth-20-et.width,et.top):(et.left<11||et.right>innerWidth-19)&&At(Math.min(et.left,innerWidth-et.width-20),et.top),Math.abs(be-pe)>1&&an()})}let z=document.createElement("style");z.textContent=`
    [data-agentation-toolbar]{--sk-toolbar-width:420px;--sk-toolbar-height:52px;width:var(--sk-toolbar-width)!important;font-family:${co}!important}
    [data-agentation-toolbar] button{font-family:inherit}
    /* A fixed control layout prevents rewrapping while the shell opens. Only
       the small shell changes size; icons keep their size and position. */
    [data-agentation-toolbar] [class*="toolbarContainer"]{box-sizing:border-box;min-height:0;padding:0!important;animation:none;box-shadow:0 8px 28px rgba(12,10,24,.34),0 0 0 1px rgba(255,244,224,.16)!important;transition:width 280ms cubic-bezier(.22,1,.36,1),height 280ms cubic-bezier(.22,1,.36,1)}
    /* Clip only while the shell shrinks, so the full-width controls row can't
       show past it. Once it's a circle the count badge overhangs its corner,
       and a permanent clip cut the badge off. The badge waits for the clip. */
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"]{width:44px!important;height:44px!important;animation:sk-toolbar-conceal 280ms linear}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"] [class*="badge"]{transition-delay:280ms}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]{width:var(--sk-toolbar-width)!important;height:var(--sk-toolbar-height)!important;border-radius:16px!important;animation:sk-toolbar-reveal 280ms linear}
    [data-agentation-theme=light] [data-agentation-toolbar] [class*="toolbarContainer"],[data-agentation-toolbar] [class*="toolbarContainer"][class*="light"]{box-shadow:0 2px 8px rgba(29,26,47,.1),0 8px 24px rgba(29,26,47,.12),0 0 0 1px rgba(29,26,47,.1)!important}
    @keyframes sk-toolbar-reveal{from,to{overflow:hidden}}
    @keyframes sk-toolbar-conceal{from,to{overflow:hidden}}
    [data-agentation-toolbar] [class*="controlsContent"]{position:absolute;right:6px;top:50%;width:calc(var(--sk-toolbar-width) - 12px);max-width:none!important;flex-shrink:0;flex-wrap:nowrap;justify-content:flex-end;filter:none!important;transform:translateY(-50%);transition:opacity 120ms ease-out,transform 180ms ease-out}
    [data-agentation-toolbar] [class*="controlsContent"][class*="hidden"]{opacity:0;transform:translate(8px,-50%)}
    [data-agentation-toolbar] [class*="controlsContent"][class*="visible"]{opacity:1;transform:translate(0,-50%);transition-delay:70ms}
    /* Host pages' bare button rules leak in (the Ghost theme gives every
       button min 44x44 under 1024px wide). Zero the minimums; rules below
       re-raise them for our dock. */
    [data-agentation-toolbar] button,[data-agentation-root] button{min-width:0;min-height:0}
    /* Order, not DOM position: React owns the component's own nodes. Its tools
       stay mounted, hidden, and More clicks them; only its close stays. */
    .sk-review-controls{display:flex;align-items:center;gap:2px;flex-shrink:0;order:1!important}
    .sk-review-end{order:30!important}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="divider"]{order:40}
    [data-agentation-toolbar] [class*="controlsContent"]>:last-child{order:50}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]:not(:last-child){display:none!important}
    .sk-modes{display:flex;align-items:center;gap:2px}
    .sk-divider{flex:none;width:1px;height:22px;margin:0 6px;background:rgba(128,128,128,.36)}
    .sk-review-controls button{display:flex!important;align-items:center;justify-content:center;gap:7px;min-width:36px;min-height:36px;position:relative;white-space:nowrap;border-radius:10px!important}
    [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]>button{width:36px;height:36px;border-radius:10px}
    /* The mode that is on says its name: shape, fill and a word, not colour alone. */
    .sk-modes button .sk-label{display:none;font:600 13px/1 ${co}}
    .sk-modes button[aria-pressed=true] .sk-label{display:inline}
    .sk-modes button[aria-pressed=true]{width:auto!important;padding:0 12px 0 10px!important;box-shadow:inset 0 0 0 1.5px #FF5436}
    .sk-review-controls button[hidden]{display:none!important}
    .sk-review-controls button[aria-pressed=true]{background:#573227!important;color:#FFF4E0!important}
    [data-agentation-theme=light] .sk-review-controls button[aria-pressed=true]{background:#FFDDD1!important;color:#1D1A2F!important}
    .sk-review-controls .sk-send[aria-pressed=true]{background:#FF5436!important;color:#1D1A2F!important}
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="collapsed"]:focus-visible{outline:2px solid #FFC72C!important;outline-offset:2px}
    .sk-review-controls [data-review=grip]{width:20px!important;min-width:20px;flex-shrink:0}
    .sk-review-controls .sk-send{width:auto!important;margin-left:4px;padding:0 14px 0 12px!important;border-radius:10px!important;background:#FF5436!important;color:#1D1A2F!important;font:600 13px/1 ${co}}
    .sk-review-controls .sk-send[data-state=ready]:hover{background:#FF6A4F!important}
    /* As wide as "Send 1" in every state, so the bar keeps its width when Send becomes Send 1 or Sent. */
    .sk-review-controls .sk-send{min-width:92px;font-variant-numeric:tabular-nums}
    .sk-review-controls .sk-send[data-state=empty],.sk-review-controls .sk-send[data-state=sent]{background:rgba(128,128,128,.16)!important;color:inherit!important;opacity:.75}
    .sk-review-controls .sk-send svg,.sk-review-controls .sk-agent svg{width:16px;height:16px}
    .sk-review-controls .sk-agent{width:auto!important;padding:0 8px!important;font:500 12px/1 ${co}}
    /* Bub is the agent: listening, working (a pencil, and a small bob) or away. */
    .sk-review-controls .sk-agent svg[data-art]{width:24px;height:24px}
    .sk-review-controls .sk-agent[data-state=listening],.sk-review-controls .sk-agent[data-state=offline]{padding:0 6px!important}
    .sk-review-controls .sk-agent[data-state=offline] svg[data-art]{opacity:.82}
    .sk-review-controls .sk-agent[data-state=working] svg[data-art]{animation:sk-bob 1.4s ease-in-out infinite}@keyframes sk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    
    .sk-review-controls .sk-agent[data-state=complete] svg{color:#FF9C87}[data-agentation-theme=light] .sk-review-controls .sk-agent[data-state=complete] svg{color:#A92B15}
    .sk-review-controls .sk-agent[data-state=failed] svg{color:#ec8e8e}
    .sk-review-controls .sk-spin{animation:sk-turn 1s linear infinite}@keyframes sk-turn{to{transform:rotate(360deg)}}
    .sk-review-controls .sk-mode-pick{display:none!important}
    .sk-review-controls .sk-badge{position:absolute;top:1px;right:1px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#FF5436;color:#1D1A2F;font:700 12px/16px ${co};text-align:center;pointer-events:none}
    [data-agentation-root] textarea:focus-visible,[data-agentation-toolbar] button:focus-visible{outline:2px solid #FFC72C!important;outline-offset:1px}
    /* A component tooltip one of our layers covers stays hidden (N1, below). */
    [data-agentation-toolbar] [class*="buttonTooltip"][data-sk-covered]{opacity:0!important;visibility:hidden!important;transition:none!important}
    /* Open, the shell is a container, not a control: clicking it to open left
       it focused, and the next key press drew a ring round the whole bar. The
       collapsed shell is the open button and keeps its ring. */
    [data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]:focus-visible{outline:none}
    /* Touch: every control on the bar is a 44px target, ours and the
       component's own close. */
    @media(pointer:coarse){
      .sk-review-controls button{min-width:44px;min-height:44px}
      [data-agentation-toolbar] [class*="controlsContent"]>[class*="buttonWrapper"]:not([class*="sendButtonWrapper"])>button{width:44px!important;height:44px!important;min-width:44px;min-height:44px}
      .sk-review-controls [data-review=grip]{width:32px!important;min-width:32px}
      [data-agentation-toolbar]{--sk-toolbar-height:60px}
    }
    /* Phone: the current mode is one named button; the sheet explains all four. */
    @media(max-width:600px),(pointer:coarse) and (max-width:640px){
      .sk-modes,.sk-divider,.sk-review-controls [data-review=grip]{display:none!important}
      .sk-review-controls button{gap:6px}
      .sk-review-controls .sk-mode-pick{display:flex!important;width:auto!important;padding:0 10px!important;font:600 13px/1 ${co}}
      .sk-mode-pick svg{width:16px;height:16px}
      /* Its name is text, not an icon: 4.5:1 in light too. The component's
         rgba(0,0,0,.5) is 3.98:1 on the white bar (UX review 4, N6). */
      [data-agentation-theme=light] .sk-review-controls .sk-mode-pick{color:rgba(0,0,0,.75)!important}
      .sk-review-controls .sk-agent .sk-label{display:none}
      /* Room is short: the agent shows on the bar only when it has news. */
      .sk-review-controls .sk-agent:not([data-state=working]):not([data-state=needs-input]):not([data-state=failed]){display:none!important}
      [data-agentation-toolbar] [class*="controlsContent"]>[class*="divider"]{display:none}
      .sk-review-controls .sk-send{margin-left:2px;padding:0 10px!important;min-width:85px}
    }
    @media(max-width:400px){.sk-review-controls .sk-mode-pick .sk-label + svg{display:none}}
    /* The mode button is as wide as its longest name (sizePick): at 360 that
       left it a pixel past the bar's edge, so it gives up 2px of padding a side. */
    /* Sent keeps its check there, as on a desktop ("\u2713 Sent"): one state, one
       look (UX review 6, N13). Its padding gives the width back. */
    @media(max-width:380px){.sk-review-controls .sk-send:not([data-state=sent]) svg{display:none}.sk-review-controls .sk-send{min-width:44px}.sk-review-controls .sk-send[data-state=sent]{gap:4px;padding:0 8px 0 6px!important}.sk-review-controls .sk-mode-pick{padding:0 8px!important}}
    @media(max-width:350px){.sk-review-controls .sk-mode-pick .sk-label{display:none}}
    @media(prefers-reduced-motion:reduce){
      [data-agentation-toolbar] [class*="toolbarContainer"],[data-agentation-toolbar] [class*="controlsContent"]{transition:none!important;animation:none!important}
      .sk-review-controls .sk-spin,.sk-review-controls .sk-agent svg[data-art]{animation:none!important}
    }
  `,document.head.append(z);let Z=u=>Math.max(Number(u.reopenedAt)||0,Number(u.revisedAt)||0,Number(u.timestamp)||Date.parse(u.createdAt||u.created_at||"")||0),te=()=>{let u=Jt(),v=new Set(u.map($=>$.annotationId).filter(Boolean));return u.length+(oe()?.count||0)+G().filter($=>Do($)&&!Vp($)&&!v.has($.id)&&Z($)>C).length},Ne=(u,v,$,V="")=>{let ue=v+"|"+$+"|"+V;if(u.dataset.paint===ue)return!1;if(u.dataset.paint=ue,u.innerHTML=Wr(v).replace("<svg",`<svg class="${V}"`),$){let pe=document.createElement("span");pe.className="sk-label",pe.textContent=$,u.append(pe)}return!0},h=null;function I(u){let v=u.querySelector(".sk-label");if(!v||!v.getClientRects().length||(h||(h=document.createElement("canvas").getContext("2d")),!h))return;h.font=getComputedStyle(v).font;let V=Math.max(...U.filter(ue=>de(ue)&&(ue.key!=="edit"||n)).map(ue=>h.measureText(ue.name).width)).toFixed(2)+"px";v.style.minWidth!==V&&(v.style.minWidth=V,v.style.textAlign="left")}function O(){if(!$e)return;let u=$t=>$e.querySelector($t)||rt?.querySelector($t),v=ze();for(let $t of U){let Cn=u(`[data-mode=${$t.key}]`);Cn&&(Cn.hidden=!de($t),Cn.setAttribute("aria-pressed",String(v===$t.key)))}let $=U.find($t=>$t.key===v),V=u("[data-review=mode]");Ne(V,v,$.name)&&V.insertAdjacentHTML("beforeend",Wr("updown")),V.setAttribute("aria-label",`Mode: ${$.name}. Change mode`),V.dataset.tip="Change mode",I(V);let ue=($t,Cn)=>{let Ut=$t.querySelector(".sk-badge");Cn&&!Ut&&(Ut=document.createElement("span"),Ut.className="sk-badge",$t.append(Ut)),Ut&&(Cn?Ut.textContent=String(Cn):Ut.remove())},pe=u("[data-review=inbox]");pe.setAttribute("aria-pressed",String(a==="inbox"));let be=Kp(G()).length,et=typeof B<"u"&&B?b:0;ue(pe,be+et),pe.setAttribute("aria-label","Feedback inbox"+(be?", "+be+(be===1?" question":" questions")+" for you":"")+(et?", "+et+" from the agent to decide":"")),pe.dataset.tip=be?`Inbox: ${be} ${be===1?"question":"questions"} for you`:"Inbox";let kt=u("[data-mode=edit]"),_t=Jt().length;ue(kt,_t),_t?kt.setAttribute("aria-description",_t+(_t===1?" unsaved edit":" unsaved edits")):kt.removeAttribute("aria-description");let at=u("[data-mode=tweak]");if(at&&oe()){let $t=oe().count||0;ue(at,$t),$t?at.setAttribute("aria-description",$t+($t===1?" unsaved tweak":" unsaved tweaks")):at.removeAttribute("aria-description")}let Je=u("[data-review=done]"),Ee=te(),tt=Ee?"ready":C?"sent":"empty";Je.dataset.state=tt,Ne(Je,tt==="sent"?"commit":"done",Ee?`Send ${Ee}`:tt==="sent"?"Sent":"Send"),Je.setAttribute("aria-pressed",String(a==="done")),Je.setAttribute("aria-label",Ee?`Send ${Ee} ${Ee===1?"note":"notes"} to the agent`:tt==="sent"?"Sent to the agent. Nothing new to send":"Send to the agent. Nothing to send yet"),Je.dataset.tip=Ee?"Send to the agent":tt==="sent"?"Sent. Add a note or edit text to send again":"Nothing to send yet. Add a note or edit some text first",qt&&!Ze.hidden&&re(qt),requestAnimationFrame(L)}let ee={working:"Working","needs-input":"Needs input",failed:"Failed"},se={listening:"Agent listening",working:"Agent working",complete:"Changes ready","needs-input":"Agent needs input",failed:"Agent run failed",offline:"Agent offline"};function ce(u){let v=$e?.querySelector("[data-review=agent]");if(!v)return;if(!u||!window.__AGENTATION_KIT_AGENT_WORK__){v.hidden=!0;return}v.hidden=!1,v.dataset.state=u.state,Ne(v,"agent-"+u.state,ee[u.state]||"");let $=sl(se[u.state]||"Agent",u.message);v.dataset.tip=$,v.setAttribute("aria-label",$),requestAnimationFrame(L)}document.addEventListener("agentation-kit:agent-work",u=>ce(u.detail)),document.addEventListener("agentation-kit:voice-capture",()=>O()),document.addEventListener("agentation-kit:slot",()=>O()),document.addEventListener("agentation-kit:tweak-change",()=>O());let b=0,B=!1;function ie(){let u=$e?.querySelector("[data-review=agent]");if(!u)return;let v=$e.querySelector("[data-review=critique]");v||(v=Ye($e.querySelector("[data-review=inbox]")?.className||"","critique","From the agent"),v.hidden=!0,v.setAttribute("aria-haspopup","dialog"),v.onclick=pe=>{pe.stopPropagation(),!(Mo()!=="critique"&&!Pe())&&(ke(!1),Lt(!1),window.__AGENTATION_KIT_CRITIQUE__?.toggle())},u.after(v),$e.addEventListener("click",pe=>{!b||!pe.target.closest?.("[data-review=agent]")||["needs-input","failed"].includes(u.dataset.state)||(pe.stopPropagation(),!(Mo()!=="critique"&&!Pe())&&(ke(!1),Lt(!1),window.__AGENTATION_KIT_CRITIQUE__?.toggle()))},!0));let $=matchMedia("(max-width:600px),(pointer:coarse) and (max-width:640px)").matches,V=!u.hidden&&!($&&!["working","needs-input","failed"].includes(u.dataset.state));B=$&&!V&&b>0,v.hidden=V||$||!b;for(let pe of[u,v]){let be=pe.querySelector(".sk-crit-badge"),et=pe===(V?u:v)&&b;et&&!be&&(be=document.createElement("span"),be.className="sk-badge sk-crit-badge",pe.append(be)),be&&(et?be.textContent=String(b):be.remove())}let ue=b?`From the agent: ${b} to decide`:"From the agent";v.dataset.tip=ue,v.setAttribute("aria-label",ue),V&&b?u.setAttribute("aria-description",`${b} critique ${b===1?"note":"notes"} to decide`):u.removeAttribute("aria-description"),O(),a==="inbox"&&!p&&!f&&wn()}document.addEventListener("agentation-kit:critique-count",u=>{b=u.detail?.count||0,ie()}),document.addEventListener("agentation-kit:agent-work",()=>ie()),addEventListener("resize",()=>ie(),{passive:!0});let ne=0;function Le(){let u=document.querySelector("[data-agentation-toolbar]");if(!u||window.__AGENTATION_KIT_POINTER_DRAG__)return;let v=T(),$=u.getBoundingClientRect();if(!v.width)return;let V=Math.abs(v.width-ne)<1;if(ne=v.width,!V)return;let ue=!1;try{ue=!!localStorage.getItem(pl)}catch{}let pe=v.left-$.left;!ue&&Math.abs(v.right-(innerWidth-20))>1?At(innerWidth-20-pe-v.width,$.top):(v.left<11||v.right>innerWidth-11||$.top<11||$.bottom>innerHeight-11)&&At($.left,$.top)}setInterval(()=>{document.visibilityState==="visible"&&(L(),Le())},400),new MutationObserver(Rt).observe(document.body,{childList:!0,subtree:!0}),Rt();let fe=cg(W,{rows:"article.row[data-annotation],article.row[data-draft],article.row[data-batch]",rowKey:u=>u.dataset.annotation?"a:"+u.dataset.annotation:u.dataset.draft?"d:"+u.dataset.draft:"b:"+u.dataset.batch,when:()=>!!a&&!W.hidden&&!W.hasAttribute("data-deferred"),fallback:()=>K.el("close")}),Fe=Vn("review",u=>{W.toggleAttribute("data-deferred",!u),u&&a?requestAnimationFrame(an):pt()});function we(u,{keepFocus:v=!1}={}){!u&&n?.active&&(u="edits"),a=u,l=a!=="edits",p=null,c="",W.hidden=!a,O(),Fe.want(!!a,{passive:a==="edits",bump:!0}),a?(wn(),a!=="viewport"&&tn()):v||$e?.querySelector("[data-review=inbox]")?.focus(),a||pt()}function pt(){document.dispatchEvent(new CustomEvent("agentation-kit:review-chrome",{detail:{panel:a&&!W.hidden&&!W.hasAttribute("data-deferred")?W.getBoundingClientRect():null}}))}let Tt=u=>u.composedPath().some(v=>v.nodeType===1&&v.matches("[data-agentation-root],[data-agentation-toolbar],[data-feedback-toolbar],.sk-edit-ui"));document.addEventListener("pointerdown",u=>{Tt(u)||(ke(!1),Lt(!1),!(!a||p||f)&&(a!=="edits"?we(null,{keepFocus:!0}):l&&(l=!1,wn())))},!0);function dt(u){!u||u===t||(t=u,i=[],a&&!p&&!f?tn():tn(!0))}let yt=!1;async function tn(u=!1){if(d||f||!t){(d||f)&&(yt=!0);return}d=!u,u||no();try{let v=await fetch(`${e}/sessions?author=all`).catch(()=>null);if(v?.ok)s=((await v.json()).sessions||[]).map(V=>({...V,annotations:(V.annotations||[]).filter(qp)})),i=s.find(V=>V.id===t)?.annotations||[],s.length<200&&n?.reconcile(new Map(s.flatMap(V=>V.annotations.map(ue=>[ue.id,ue.status]))))&&wn();else{let V=await fetch(`${e}/sessions/${t}?author=all`);if(!V.ok)throw new Error("offline");s=[],i=((await V.json()).annotations||[]).filter(qp)}{let V=await fetch(`${e.replace(/\/__ag$/,"")}/__kv?prefix=agentation-round`).catch(()=>null),ue=V?.ok?((await V.json()).items||[]).find(pe=>pe.key==="agentation-round"):null;try{let pe=ue&&JSON.parse(ue.value);pe?.link===Yp(e)&&pe.ts>C&&(C=pe.ts,w=pe.reviewer||"")}catch{}}c="";let $=Q(A());for(let[V,ue]of y)(E(ue).some(pe=>$.has(pe))||Date.now()-ue.seen>15e3)&&y.delete(V)}catch{u||(c="Feedback could not load. Retry when connected.")}d=!1,O(),yt&&(yt=!1,setTimeout(()=>tn(!0),0)),!(u&&!a)&&(!p&&!f?wn():no())}setInterval(()=>{document.visibilityState==="visible"&&!a&&tn(!0)},3e4),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&tn(!a)}),tn(!0);function an(){!a||W.hasAttribute("data-deferred")||document.querySelector("[data-agentation-toolbar]")&&(W.classList.contains("strip")?(W.style.maxHeight="",uo(W,Math.min(520,innerWidth-24)),W.style.width="max-content",W.style.maxWidth=innerWidth-24+"px",uo(W,Math.min(Math.ceil(W.getBoundingClientRect().width),innerWidth-24))):Gn(W,320),pt())}document.addEventListener("transitionend",u=>{u.propertyName==="width"&&u.target?.matches?.('[data-agentation-toolbar] [class*="toolbarContainer"]')&&an()},!0),window.addEventListener("resize",()=>requestAnimationFrame(()=>{let u=document.querySelector("[data-agentation-toolbar]")?.getBoundingClientRect();if(u){let v=!1;try{v=!!localStorage.getItem(pl)}catch{}if(v)At(u.left,u.top);else{let $=T();At(innerWidth-20-($.left-u.left)-$.width,innerHeight-20-u.height)}}an(),Bn()}));function Nn(){try{localStorage.setItem(pl,"1")}catch{}}function Bn(){let u=!1;try{u=!!localStorage.getItem(pl)}catch{}if(u||Ve||a||Mo()||window.__AGENTATION_KIT_VOICE_RECORDING__)return;let v=document.querySelector("[data-agentation-toolbar]");if(!v)return;let $=v.getBoundingClientRect();if(!$.width||!$.height)return;let V=v.querySelector('[class*="toolbarContainer"]')?.getBoundingClientRect()||$,ue=v.closest("body > *"),pe=1/0;for(let et=V.left+4;et<V.right;et+=Math.min(16,Math.max(4,(V.width-8)/3)))for(let kt of[V.top+4,V.top+V.height/2,V.bottom-4]){let _t=document.elementFromPoint(et,kt);if(!_t||v.contains(_t)||ue?.contains(_t)||W.contains(_t))continue;let at=_t;for(;at&&at!==document.body&&at!==document.documentElement&&!/^(fixed|sticky)$/.test(getComputedStyle(at).position);)at=at.parentElement;if(!at||at===document.body||at===document.documentElement)continue;let Je=at.getBoundingClientRect();if(Je.height>innerHeight/2||Je.width>innerWidth*.6){let Ee=_t.closest('a,button,input,select,textarea,[role="button"],[role="link"]');if(!Ee||!at.contains(Ee)||(Je=Ee.getBoundingClientRect(),Je.height>innerHeight/3))continue}pe=Math.min(pe,Je.top)}if(pe===1/0)return;let be=Math.round($.top-(V.bottom-pe+12));be<12||(document.dispatchEvent(new CustomEvent("agentation-kit:toolbar-position",{detail:{x:Math.max(12,Math.min($.left,innerWidth-$.width-12)),y:be}})),requestAnimationFrame(an))}let mr=null;document.addEventListener("pointerdown",u=>{mr=u.button===0&&u.target.closest?.("[data-agentation-toolbar]")?{x:u.clientX,y:u.clientY}:null},!0),document.addEventListener("pointermove",u=>{mr&&u.buttons&1&&Math.hypot(u.clientX-mr.x,u.clientY-mr.y)>6&&(mr=null,Nn())},!0),document.addEventListener("pointerup",()=>{mr=null},!0),document.addEventListener("agentation-kit:slot",u=>{u.detail?.panel||setTimeout(Bn,80)});for(let u of[300,1500,4e3,8e3])setTimeout(Bn,u);let mo=()=>window.__AGENTATION_KIT_HEALTH__?.ok===!1;function no(){let u=!c&&mo();K.el("message").textContent=c||(u?"Review server not reachable. Notes aren\u2019t being saved.":d?"Loading feedback\u2026":f?"Saving\u2026":""),K.el("message").className="message"+(c||u?" error":""),K.el("message").hidden=!c&&!u&&!d&&!f,W.setAttribute("aria-busy",String(d||f))}document.addEventListener("agentation-kit:health",()=>{a&&no()});function Yt(u,v,$="ghost"){let V=document.createElement("button");return V.className=$,V.textContent=u,V.onclick=v,V}function Wn(u,v,$){let V=document.createElement("div");V.className="diff";for(let[ue,pe,be]of[["before","Before",v],["after","After",$]]){let et=document.createElement("div");et.className=ue;let kt=document.createElement("small");kt.textContent=pe;let _t=document.createElement("span");_t.className="txt",_t.textContent=be??"",et.append(kt,_t),V.append(et)}u.append(V)}function gr(u,v){let $=document.createElement("p");$.className="hint tweak-what",$.textContent=`${v.selector||"element"} \xB7 ${v.property||""}`,u.append($),Wn(u,v.from,`${v.to??""}${v.token?` (${v.token})`:v.onScale?"":" (off scale)"}`)}function Ji(u){let v=document.createElement("article");v.className="row",v.dataset.batch=u[0].copy.batch;let $=u.filter(Do).length,V=u.filter(pe=>pe.status==="resolved").length,ue=document.createElement("span");ue.className="status",ue.textContent=$?V?`${V} of ${u.length} done`:"Saved":V===u.length?"Done":`${V} of ${u.length} done`,v.append(Cc(Zr(`All text \xB7 ${u.length} edit${u.length===1?"":"s"}`,ue,Or("revise","Edit in All text",Y)),u[0]));for(let pe of u){let be=document.createElement("p");be.className="hint";let et=pe.copy.unit||{};if(be.textContent=`${et.file||""}${et.line?`:${et.line}`:""}${Do(pe)?"":` \xB7 ${pe.status==="resolved"?"Done":"Set aside"}${pe.resolution?`: ${pe.resolution}`:""}`}`,v.append(be),Wn(v,pe.copy.from,pe.copy.to),pe.replies?.length){let kt=document.createElement("div");kt.className="thread",si(kt,pe.replies,"reviewer"),v.append(kt)}}return _r(v,u[0].copy.batch),v}function Jt(){return(n?.pendingEdits()||[]).filter(u=>!u.annotationId||u.dirty)}function wn(){Zi(),fe.restore()}function Zi(){if(!a)return;requestAnimationFrame(an);let u=K.el("body");u.replaceChildren(),no();let v=a==="edits";if(W.classList.toggle("strip",v&&!l),K.el("title").textContent=a==="viewport"?"Viewport simulator":v?"Text edits":a==="done"?"Send to agent":"Feedback inbox",K.el("count").textContent="",K.el("close").hidden=v,K.el("commit-all").hidden=!0,K.el("all-copy").hidden=!v||!r,K.el("toggle").hidden=!0,a==="viewport"){let Ee=document.createElement("p");Ee.className="hint",Ee.textContent="Render the page at its real responsive width. Feedback stays with the viewport it was captured in.",u.append(Ee);let tt=document.createElement("div");tt.className="devices",u.append(tt);for(let[$t,Cn]of[["mobile","390 \xD7 844"],["tablet","820 \xD7 1180"],["desktop","1440 \xD7 900"]])tt.append(Yt($t[0].toUpperCase()+$t.slice(1)+" \xB7 "+Cn,()=>{we(null),le.choose($t)}));return}c&&u.append(Yt("Retry",()=>tn()));let $=Jt();if(a==="done")return E0(u,$);let V=new Set($.map(Ee=>Ee.annotationId).filter(Boolean)),ue=Ee=>S!=="mine"||ls(Ee),pe=a==="edits"?[]:Kp(G()),be=new Set(pe.map(Ee=>Ee.id));if(a==="inbox")return jo(u,$,pe,ue,V,be);let et=i.filter(Ee=>!V.has(Ee.id)&&!be.has(Ee.id)&&(Ee.kind==="edit"||Ee.kind==="copy")&&ue(Ee)),kt=$.length+et.length,_t=et.filter(Do).length,at=[];$.length&&at.push($.length+($.length===1?" edit":" edits")),_t&&at.push(_t+" saved"),K.el("title").textContent=at.join(" \xB7 ")||(kt?"Text edits":"Click any text to edit"),K.el("count").textContent="",K.el("commit-all").hidden=!$.length,K.el("commit-all").textContent=`Save ${$.length}`,kt||(l=!1),W.classList.toggle("strip",!l);let Je=K.el("toggle");Je.hidden=!kt,Je.setAttribute("aria-expanded",String(l)),Je.setAttribute("aria-label",l?"Hide text edits":"Show text edits"),Je.title=Je.getAttribute("aria-label");for(let Ee of $)u.append(Co(Ee));es(u,et,!0)}function jo(u,v,$,V,ue,pe){T0(u);let be=G().filter(tt=>!ue.has(tt.id)&&!pe.has(tt.id)&&V(tt)),et=be.filter(tt=>Do(tt)&&Z(tt)>C),kt=be.filter(tt=>Do(tt)&&Z(tt)<=C),_t=be.filter(tt=>!Do(tt)).sort((tt,$t)=>Z($t)-Z(tt)).slice(0,20),at=b&&window.__AGENTATION_KIT_CRITIQUE__?b:0,Je=oe()?.drafts?.()||[],Ee=$.length+at+v.length+Je.length+et.length+kt.length;if(K.el("count").textContent=Ee?`${Ee} open`:"",!Ee&&!_t.length&&!d){let tt=document.createElement("p");tt.className="empty hint",tt.textContent=S==="mine"&&G().length?"None of the feedback here is yours yet. Switch to Everyone to see the rest.":"No feedback yet. Click anything on the page to comment, or press T to edit text.",u.append(tt);return}if($.length||at){if(Jr(u,"Needs you",$.length+at),at){let tt=document.createElement("div");tt.className="row from-agent";let $t=document.createElement("p");$t.className="copy",$t.textContent=`From the agent: ${at} ${at===1?"note":"notes"} to decide`,tt.append($t,Yt("Decide",()=>{we(null,{keepFocus:!0}),window.__AGENTATION_KIT_CRITIQUE__.open()},"primary")),u.append(tt)}for(let tt of $)u.append(C0(tt))}if(v.length||et.length||Je.length){Jr(u,"Not sent yet",v.length+et.length+Je.length);for(let tt of v)u.append(Co(tt));for(let tt of Je)u.append(Ds(tt));es(u,et,!1)}kt.length&&(Jr(u,"With the agent",kt.length),es(u,kt,!1)),_t.length&&(Jr(u,"Done",_t.length),S0(u.lastChild),es(u,_t,!1))}function Ds(u){let v=document.createElement("article");v.className="row";let $=Yt("Review",()=>{we(null,{keepFocus:!0}),Ke("tweak"),oe()?.review?.()},"ghost");v.append(Zr("Tweak \xB7 draft",$));let V=document.createElement("p");return V.className="hint tweak-what",V.textContent=`${u.selector||"element"} \xB7 ${u.property||""}`,v.append(V),Wn(v,u.from??"",u.to??""),v}function Co(u){let v=document.createElement("article");return v.className="row",v.dataset.draft=u.id,v.append(Zr("Text edit \xB7 draft",Or("commit","Save",()=>ei(async()=>{if(!(await n.commit(u.id)).count)throw new Error("Could not save. Your draft is kept; retry when connected.")})),Or("revise","Edit",()=>Uo(v,u)),Or("reject","Delete",()=>{n.reject(u.id),wn()}),In(()=>Eo({node:u.node})))),Wn(v,u.from,u.to),yr(v,()=>Uo(v,u)),_r(v,u.id),v}function es(u,v,$){let V=new Map,ue=[];for(let pe of v){let be=pe.kind==="copy"&&pe.copy?.batch;if(!be){ue.push(pe);continue}V.has(be)||(V.set(be,[]),ue.push({batch:be})),V.get(be).push(pe)}for(let pe of[...ue].reverse())u.append(pe.batch?Ji(V.get(pe.batch)):pe.here===!1?Sc(pe):pp(pe,$))}function pp(u,v){let $=document.createElement("article");$.className="row",$.dataset.annotation=u.id;let V=document.createElement("span");V.className="status",V.textContent=Ga(u);let ue=Do(u),pe=ls(u);if($.append(Cc(Zr(nv(u,v),V,...ue&&pe?[...u.tweak?[]:[Or("revise","Edit",()=>Ec($,u))],Z(u)>C?Or("reject","Delete",()=>Tc($,u,!1)):Or("reject","Withdraw",()=>Tc($,u,!0))]:[],In(()=>Eo(u))),u)),u.edit)Wn($,u.edit.from,u.edit.to);else if(u.tweak)gr($,u.tweak);else{let be=document.createElement("p");be.className="copy",be.textContent=u.note||u.comment||`${u.kind} change`,$.append(be)}if(u.resolution&&!Do(u)&&Ga(u)!=="Withdrawn"){let be=document.createElement("p");be.className="hint",be.textContent=(u.status==="resolved"?"Done: ":"Set aside: ")+u.resolution,$.append(be)}if(u.replies?.length){let be=document.createElement("div");be.className="thread",si(be,u.replies,"reviewer"),$.append(be)}return ue&&pe&&!u.tweak&&yr($,()=>Ec($,u)),_r($,u.id),$}function Sc(u){let v=document.createElement("article");v.className="row",v.dataset.annotation=u.id;let $=Yt("",()=>fp(u),"ghost locate");$.innerHTML=Wr("locate"),$.title="Open this page",$.setAttribute("aria-label","Open "+ed(u.page));let V=Zr(ed(u.page),$);if(V.querySelector(".label").classList.add("page"),v.append(Cc(V,u)),u.edit)Wn(v,u.edit.from,u.edit.to);else if(u.tweak)gr(v,u.tweak);else{let ue=document.createElement("p");ue.className="copy",ue.textContent=u.note||u.comment||`${u.kind} change`,v.append(ue)}if(u.resolution&&!Do(u)&&Ga(u)!=="Withdrawn"){let ue=document.createElement("p");ue.className="hint",ue.textContent=(u.status==="resolved"?"Done: ":"Set aside: ")+u.resolution,v.append(ue)}if(u.replies?.length){let ue=document.createElement("div");ue.className="thread",si(ue,u.replies,"reviewer"),v.append(ue)}return _r(v,u.id),v}function S0(u){let v=window.__AGENTATION_KIT_CHECK__,$=v?.count()||0;if(!$)return;let V=Yt(`Check ${$}`,()=>{we(null,{keepFocus:!0}),v.start()});V.dataset.check="",V.style.cssText="margin-left:auto;padding:2px 8px;font-size:12px;color:var(--sk-text)",V.title="Check what the agent changed, one at a time",u.append(V)}function Jr(u,v,$){let V=document.createElement("h3");V.className="sec",V.textContent=v+" ";let ue=document.createElement("span");ue.className="n",ue.textContent=String($),V.append(ue),u.append(V)}function C0(u){let v=document.createElement("article");v.className="row question",v.dataset.annotation=u.id;let $=String(u.element||"").trim(),V=!$||$==="Page feedback",ue=u.here?V?"about this page":$:(V?"about ":$+" on ")+ed(u.page),pe=Zr(ue,In(()=>u.here?Eo(u):fp(u))),be=pe.querySelector(".label");be.classList.add("page"),be.title=ue;let et=document.createElement("span");if(et.className="q",et.textContent="Question",be.prepend(et,document.createTextNode(" \xB7 ")),v.append(pe),v.classList.add("open"),u.edit)Wn(v,u.edit.from,u.edit.to);else if(u.tweak)gr(v,u.tweak);else{let at=document.createElement("p");at.className="copy",at.textContent=u.note||u.comment||`${u.kind} change`,v.append(at)}let kt=document.createElement("div");kt.className="thread",si(kt,u.replies,"reviewer"),v.append(kt);let _t=document.createElement("div");return _t.className="actions",_t.append(Yt("Answer",()=>{p=u.id;let at=[...v.children].slice(0,3);v.replaceChildren(...at);let Je=document.createElement("textarea");Je.id="sk-review-answer";let Ee=document.createElement("label");Ee.htmlFor=Je.id,Ee.textContent="Your answer",Je.value=Va.get(u.id)||"",Je.oninput=()=>{Je.value?Va.set(u.id,Je.value):Va.delete(u.id)};let tt=document.createElement("div");tt.className="actions",tt.append(Yt("Send answer",()=>{let $t=Je.value.trim();if(!$t){c="Write an answer first.",no();return}v.tabIndex=-1,v.focus({preventScroll:!0}),fe.set({row:"a:"+u.id,control:""});let Cn=Qc(()=>fe.target()||K.el("close"),{ms:5e3,when:()=>a==="inbox"&&!W.hidden});ei(async()=>{let Ut=await io();await Wt(`annotations/${u.id}/reply`,"POST",{message:$t,...Ut?{name:Ut}:{}}),Va.delete(u.id),p=null}).then(()=>{c&&Je.isConnected&&(Cn.stop(),Je.focus())})},"primary"),Yt("Cancel",()=>{p=null,c="",wn()})),Je.onkeydown=$t=>{$t.key==="Enter"&&($t.metaKey||$t.ctrlKey)&&($t.preventDefault(),tt.firstChild.click())},v.append(Ee,Je,tt),Je.focus()},"primary")),v.append(_t),v}let Va=new Map;function fp(u){try{let v=new URL(u.page,location.href);if(v.origin===location.origin){location.assign(v.href);return}}catch{}c="That page is on a different address.",no()}function E0(u,v){let $=G().filter(Do),V=new Set($.map(Ut=>ed(Ut.page))).size,ue=Kp($).length,pe=document.createElement("p");pe.className="summary";let be=oe()?.count||0,et=$.length+v.length+be,kt=te(),_t=new Set(v.map(Ut=>Ut.annotationId).filter(Boolean)),at=$.filter(Ut=>!_t.has(Ut.id)&&(Vp(Ut)||Z(Ut)<=C)).length,Je=rv({fresh:kt,n:et,has:at,pages:V,sentAt:C,qs:ue,drafts:v.length,tweaks:be}),Ee=Je.went;pe.append(...Je.lead.map(Ut=>typeof Ut=="string"?document.createTextNode(Ut):Object.assign(document.createElement("b"),{textContent:Ut.b}))),u.append(pe);for(let Ut of Je.facts){let tr=document.createElement("p");tr.className="hint",tr.textContent=Ut,u.append(tr)}if(C){let Ut=document.createElement("p");Ut.className="hint sent",Ut.innerHTML=Wr("commit"),Ut.append(document.createTextNode("Last sent "+(w&&!br(w)?"by "+w+", ":"")+ev(C)+". Questions come back to the inbox.")),u.append(Ut)}let tt=document.createElement("div");tt.className="actions";let $t=!1,Cn=Yt(Je.send.label,()=>ei(async()=>{if(v.length){let xr=await n.commit();if(xr.failed||xr.count<v.length)throw new Error("Some text edits could not be saved. Nothing was sent; retry when connected.")}if(oe()?.count&&(await oe().save()).failed)throw new Error("Some tweaks could not be saved. Nothing was sent; retry when connected.");let Ut=await io(),tr=null;for(let xr=0;!tr;xr++){let ti=await fetch(`${e}/sessions?author=all`);if(!ti.ok)throw new Error("Feedback could not be loaded. Nothing was sent; retry when connected.");let Xa=((await ti.json()).sessions||[]).flatMap(Pr=>Pr.annotations||[]),zs=Q(Xa);if(![...y.values()].filter(Pr=>!E(Pr).some(hp=>zs.has(hp))).length)tr=Xa.filter(qp).filter(Do);else{if(xr>=24)throw new Error("A note is still saving. Nothing was sent; try again in a moment.");await new Promise(Pr=>setTimeout(Pr,200))}}C=Date.now(),w=Ut;try{localStorage.setItem("agentation-round",JSON.stringify({ts:C,link:Yp(e),page:Dr(),open:tr.length,pages:V,questions:ue,noteIds:tr.map(xr=>xr.id),...Ut?{reviewer:Ut}:{}}))}catch{}document.dispatchEvent(new CustomEvent("agentation-kit:round-done",{detail:{ts:C}})),$t=!0,kr($e?.querySelector("[data-review=done]"))}).then(()=>{$t&&!c&&a==="done"&&we(null,{keepFocus:!0})}),Je.send.kind);if(tt.append(...Ee?[Yt("Keep reviewing",()=>we(null),"primary"),Cn]:[Cn,Yt("Keep reviewing",()=>we(null))]),u.append(tt),Je.send.disabled){Cn.disabled=!0;let Ut=document.createElement("p");Ut.className="why",Ut.id="sk-send-why",Ut.textContent="Nothing new to send. Add a note or edit some text first.",Cn.setAttribute("aria-describedby",Ut.id),u.append(Ut)}}function Cc(u,v){if(!v.reviewer)return u;let $=document.createElement("span");$.className="by",$.textContent=br(v.reviewer)?"You":v.reviewer,$.title=v.reviewer;let V=u.querySelector(".label"),ue=document.createElement("span");ue.className="txt",ue.append(...V.childNodes);let pe=ue.textContent;return V.title=(pe?pe+" \xB7 ":"")+v.reviewer,V.classList.add("with-by"),pe&&V.append(ue,Object.assign(document.createElement("span"),{className:"sep",textContent:" \xB7 "})),V.append($),u}function T0(u){let v=document.createElement("div");v.className="who-bar";let $=document.createElement("span");$.className="me";let V=_n();$.textContent=V?"Reviewing as "+V:"No name set";let ue=Yt(V?"Change":"Add your name",()=>Y0()),pe=document.createElement("span");pe.className="chips",pe.setAttribute("role","group"),pe.setAttribute("aria-label","Show feedback from");for(let[be,et]of[["mine","Mine"],["all","Everyone"]]){let kt=Yt(et,()=>{S=be;try{localStorage.setItem(vg,be)}catch{}wn()},"chip");kt.setAttribute("aria-pressed",String(S===be)),pe.append(kt)}v.append($,ue,pe),u.append(v)}function Zr(u,...v){let $=document.createElement("div");$.className="meta";let V=document.createElement("span");V.className="label",V.textContent=u;let ue=document.createElement("span");return ue.className="tools",ue.append(...v),$.append(V,ue),$}function Or(u,v,$,V="ghost"){let ue=Yt("",$,V);return ue.innerHTML=Wr(u),ue.title=v,ue.setAttribute("aria-label",v),ue}function _r(u,v){u.dataset.expandable="",u.classList.toggle("open",g.has(v)),u.onclick=$=>{f||p||$.target.closest("button,textarea,input,label,a,select")||(g.has(v)?g.delete(v):g.add(v),u.classList.toggle("open",g.has(v)),requestAnimationFrame(an))}}function In(u){let v=Yt("",u,"ghost locate");return v.innerHTML=Wr("locate"),v.title="Jump to location",v.setAttribute("aria-label","Jump to location"),v}function yr(u,v){u.classList.add("editable"),u.ondblclick=$=>{f||p||$.target.closest("button,textarea,input,label")||($.preventDefault(),v())}}function Uo(u,v){p=v.id,oo(u,v.to,async $=>{n.revise(v.id,$),p=null,wn()},"Save draft")}function oo(u,v,$,V="Save changes"){u.replaceChildren();let ue=document.createElement("textarea");ue.id="sk-review-edit-value",ue.value=v;let pe=document.createElement("label");pe.htmlFor=ue.id,pe.textContent="Revised text",u.append(pe,ue);let be=document.createElement("div");be.className="actions",be.append(Yt(V,()=>ei(()=>$(ue.value)),"primary"),Yt("Cancel",()=>{p=null,c="",wn()})),u.append(be),ue.focus()}function Ec(u,v){p=v.id,oo(u,v.edit?.to??v.note??v.comment,async $=>{let V=v.edit?{edit:{to:$},comment:`Change to: "${$}"`}:v.kind==="placement"||v.kind==="rearrange"?{note:$}:{comment:$};await Wt(`annotations/${v.id}`,"PATCH",V),v.edit&&n?.revise(v.edit.id,$,!0),p=null})}function Tc(u,v,$){p=v.id,[...u.querySelector(".tools").querySelectorAll("button")].forEach(be=>{be.getAttribute("aria-label")!=="Jump to location"&&(be.hidden=!0)});let ue=document.createElement("div");ue.className="actions",u.append(ue);let pe=document.createElement("p");pe.className="hint",pe.textContent=$?"Withdraw this note? The agent will leave it. It stays under Done.":"Delete this note? It was not sent, so the agent never sees it.",ue.append(pe,Yt("Keep note",()=>{p=null,wn()}),Yt($?"Withdraw note":"Delete note",()=>ei(async()=>{if($)await Wt(`annotations/${v.id}/withdraw`,"POST",{});else{let be=_n();await Wt(`annotations/${v.id}${be?`?reviewer=${encodeURIComponent(be)}`:""}`,"DELETE")}n?.clearCommitted(v.id,"dismissed"),p=null}),"ghost"))}function Ga(u){return u.status==="resolved"?"Done":u.status==="dismissed"?/^Withdrawn by the reviewer/.test(u.resolution||"")?"Withdrawn":"Set aside":Z(u)>C?"Not sent":"Sent"}async function Wt(u,v,$){let V;try{V=await fetch(`${e}/${u}`,{method:v,headers:{"Content-Type":"application/json"},body:JSON.stringify($)})}catch{throw new Error(so(0))}if(!V.ok)throw new Error(so(V.status));return V.json()}async function ei(u){if(f)return;f=!0,c="",no();let v=K.root.activeElement;W.querySelectorAll("button").forEach($=>{$===v?$.setAttribute("aria-disabled","true"):$.disabled=!0});try{await u(),document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"))}catch($){c=$.message}finally{f=!1,W.querySelectorAll("button").forEach($=>{$.disabled=!1,$.removeAttribute("aria-disabled")}),c||await tn(),no()}}function Eo(u){if(!Jc(u)){le.choose(u.viewport?.name||(u.viewport.width<768?"mobile":u.viewport.width<1200?"tablet":"desktop"),u);return}let v=u.node;try{v||(v=document.querySelector(u.elementPath||u.selector))}catch{}if(v){we(null),v.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"center"});let $=v.style.outline;v.style.outline="2px solid #FF5436",v.style.outlineOffset="2px",setTimeout(()=>v.style.outline=$,1800)}else c="This element is no longer on the page. The original feedback is kept in the inbox.",no()}return document.addEventListener("agentation-kit:edit-change",()=>{O(),!n?.active&&a==="edits"?we(null,{keepFocus:!0}):n?.active&&!a?we("edits"):a==="edits"&&!p&&!f&&wn()}),document.addEventListener("agentation-kit:annotations-refresh",()=>{a&&tn()}),document.addEventListener("agentation-kit:reviewer-change",()=>{O(),a&&!p&&!f&&wn()}),document.addEventListener("keydown",u=>{if(u.key==="Escape"){if(Ve||gt){ke(!1),Lt(!1),u.stopPropagation();return}if(a&&a!=="edits"&&K.root.activeElement?.matches?.("textarea,input")){K.root.activeElement.blur(),K.el("close")?.focus(),u.stopPropagation();return}if(a==="edits"){if(l)p=null,l=!1,wn(),u.stopPropagation();else if(document.activeElement?.matches?.("[data-sk-edit]")){let v=document.activeElement;ea()||v.blur(),u.stopPropagation()}return}a&&(we(null),u.stopPropagation())}},!0),document.addEventListener("agentation-kit:route",()=>{a&&!p&&!f&&wn()}),{open:we,refresh:tn,locate:Eo,setSession:dt,added:D,ingest:u=>{u?.id&&u.author!=="agent"&&u.createdAt&&!y.size&&!E(u).some(v=>Q(A()).has(v))&&D(u),a&&!p&&!f?tn():tn(!0)},focusViewport:()=>{ke(!1),we("viewport")}}}var B5=vn(rr(),1),W5=vn(t2(),1);var X=vn(rr(),1),N2=vn(ku(),1),zn=vn(rr(),1),ot=vn(Ro(),1),$n=vn(Ro(),1),Gr=vn(rr(),1),L2=vn(ku(),1),Ls=vn(Ro(),1),Nm=vn(Ro(),1),sn=vn(rr(),1),x=vn(Ro(),1),xn=vn(Ro(),1),Fn=vn(rr(),1),_=vn(Ro(),1),zt=vn(rr(),1),nn=vn(Ro(),1),K2=vn(rr(),1),Zo=vn(Ro(),1),pc=vn(Ro(),1),Y2=vn(rr(),1),Fa=vn(Ro(),1),Ba=vn(Ro(),1),mt=vn(Ro(),1),Ie=vn(Ro(),1),M4=`.styles-module__popup___IhzrD svg[fill=none] {
  fill: none !important;
}
.styles-module__popup___IhzrD svg[fill=none] :not([fill]) {
  fill: none !important;
}

@keyframes styles-module__popupEnter___AuQDN {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
}
@keyframes styles-module__popupExit___JJKQX {
  from {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) scale(0.95) translateY(4px);
  }
}
@keyframes styles-module__shake___jdbWe {
  0%, 100% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(0);
  }
  20% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-3px);
  }
  40% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(3px);
  }
  60% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(-2px);
  }
  80% {
    transform: translateX(-50%) scale(1) translateY(0) translateX(2px);
  }
}
.styles-module__popup___IhzrD {
  position: fixed;
  transform: translateX(-50%);
  width: 280px;
  padding: 0.75rem 1rem 14px;
  background: #1D1A2F;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  z-index: 100001;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  will-change: transform, opacity;
  opacity: 0;
}
.styles-module__popup___IhzrD.styles-module__enter___L7U7N {
  animation: styles-module__popupEnter___AuQDN 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w {
  opacity: 1;
  transform: translateX(-50%) scale(1) translateY(0);
}
.styles-module__popup___IhzrD.styles-module__exit___5eGjE {
  animation: styles-module__popupExit___JJKQX 0.15s ease-in forwards;
}
.styles-module__popup___IhzrD.styles-module__entered___COX-w.styles-module__shake___jdbWe {
  animation: styles-module__shake___jdbWe 0.25s ease-out;
}

.styles-module__header___wWsSi {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5625rem;
}

.styles-module__element___fTV2z {
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.styles-module__headerToggle___WpW0b {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  text-align: left;
}
.styles-module__headerToggle___WpW0b .styles-module__element___fTV2z {
  flex: 1;
}

.styles-module__chevron___ZZJlR {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}
.styles-module__chevron___ZZJlR.styles-module__expanded___2Hxgv {
  transform: rotate(90deg);
}

.styles-module__stylesWrapper___pnHgy {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.styles-module__stylesWrapper___pnHgy.styles-module__expanded___2Hxgv {
  grid-template-rows: 1fr;
}

.styles-module__stylesInner___YYZe2 {
  overflow: hidden;
}

.styles-module__stylesBlock___VfQKn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.6875rem;
  line-height: 1.5;
}

.styles-module__styleLine___1YQiD {
  color: rgba(255, 255, 255, 0.85);
  word-break: break-word;
}

.styles-module__styleProperty___84L1i {
  color: #c792ea;
}

.styles-module__styleValue___q51-h {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__timestamp___Dtpsv {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  font-variant-numeric: tabular-nums;
  margin-left: 0.5rem;
  flex-shrink: 0;
}

.styles-module__quote___mcMmQ {
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  line-height: 1.45;
}

.styles-module__textarea___jrSae {
  box-sizing: border-box;
  width: 100%;
  padding: 0.5rem 0.625rem;
  font-size: 0.8125rem;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
}
.styles-module__textarea___jrSae:focus {
  border-color: var(--agentation-color-blue);
}
.styles-module__textarea___jrSae.styles-module__green___99l3h:focus {
  border-color: var(--agentation-color-green);
}
.styles-module__textarea___jrSae::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__textarea___jrSae::-webkit-scrollbar {
  width: 6px;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-track {
  background: transparent;
}
.styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.styles-module__actions___D6x3f {
  display: flex;
  justify-content: flex-end;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.styles-module__cancel___hRjnL,
.styles-module__submit___K-mIR {
  padding: 0.4rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.styles-module__cancel___hRjnL {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__cancel___hRjnL:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.styles-module__submit___K-mIR {
  color: white;
}
.styles-module__submit___K-mIR:hover:not(:disabled) {
  filter: brightness(0.9);
}
.styles-module__submit___K-mIR:disabled {
  cursor: not-allowed;
}

.styles-module__deleteWrapper___oSjdo {
  margin-right: auto;
}

.styles-module__deleteButton___4VuAE {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
}
.styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__deleteButton___4VuAE:active {
  transform: scale(0.92);
}

.styles-module__light___6AaSQ.styles-module__popup___IhzrD {
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.styles-module__light___6AaSQ .styles-module__element___fTV2z {
  color: rgba(0, 0, 0, 0.6);
}
.styles-module__light___6AaSQ .styles-module__timestamp___Dtpsv {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__chevron___ZZJlR {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__stylesBlock___VfQKn {
  background: rgba(0, 0, 0, 0.03);
}
.styles-module__light___6AaSQ .styles-module__styleLine___1YQiD {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__styleProperty___84L1i {
  color: #7c3aed;
}
.styles-module__light___6AaSQ .styles-module__styleValue___q51-h {
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__quote___mcMmQ {
  color: rgba(0, 0, 0, 0.55);
  background: rgba(0, 0, 0, 0.04);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae {
  background: rgba(0, 0, 0, 0.03);
  color: #1D1A2F;
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::placeholder {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__textarea___jrSae::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___6AaSQ .styles-module__cancel___hRjnL:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.75);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE {
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___6AaSQ .styles-module__deleteButton___4VuAE:hover {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}`,N4={popup:"styles-module__popup___IhzrD",enter:"styles-module__enter___L7U7N",popupEnter:"styles-module__popupEnter___AuQDN",entered:"styles-module__entered___COX-w",exit:"styles-module__exit___5eGjE",popupExit:"styles-module__popupExit___JJKQX",shake:"styles-module__shake___jdbWe",header:"styles-module__header___wWsSi",element:"styles-module__element___fTV2z",headerToggle:"styles-module__headerToggle___WpW0b",chevron:"styles-module__chevron___ZZJlR",expanded:"styles-module__expanded___2Hxgv",stylesWrapper:"styles-module__stylesWrapper___pnHgy",stylesInner:"styles-module__stylesInner___YYZe2",stylesBlock:"styles-module__stylesBlock___VfQKn",styleLine:"styles-module__styleLine___1YQiD",styleProperty:"styles-module__styleProperty___84L1i",styleValue:"styles-module__styleValue___q51-h",timestamp:"styles-module__timestamp___Dtpsv",quote:"styles-module__quote___mcMmQ",textarea:"styles-module__textarea___jrSae",green:"styles-module__green___99l3h",actions:"styles-module__actions___D6x3f",cancel:"styles-module__cancel___hRjnL",submit:"styles-module__submit___K-mIR",deleteWrapper:"styles-module__deleteWrapper___oSjdo",deleteButton:"styles-module__deleteButton___4VuAE",light:"styles-module__light___6AaSQ"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-annotation-popup-css-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-annotation-popup-css-styles",document.head.appendChild(e)),e.textContent=M4}var yn=N4,I4=`.icon-transitions-module__iconState___uqK9J {
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: center;
}

.icon-transitions-module__iconStateFast___HxlMm {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: center;
}

.icon-transitions-module__iconFade___nPwXg {
  transition: opacity 0.2s ease;
}

.icon-transitions-module__iconFadeFast___Ofb2t {
  transition: opacity 0.15s ease;
}

.icon-transitions-module__visible___PlHsU {
  opacity: 1 !important;
}

.icon-transitions-module__visibleScaled___8Qog- {
  opacity: 1 !important;
  transform: scale(1);
}

.icon-transitions-module__hidden___ETykt {
  opacity: 0 !important;
}

.icon-transitions-module__hiddenScaled___JXn-m {
  opacity: 0 !important;
  transform: scale(0.8);
}

.icon-transitions-module__sending___uaLN- {
  opacity: 0.5 !important;
  transform: scale(0.8);
}`,A4={iconState:"icon-transitions-module__iconState___uqK9J",iconStateFast:"icon-transitions-module__iconStateFast___HxlMm",iconFade:"icon-transitions-module__iconFade___nPwXg",iconFadeFast:"icon-transitions-module__iconFadeFast___Ofb2t",visible:"icon-transitions-module__visible___PlHsU",visibleScaled:"icon-transitions-module__visibleScaled___8Qog-",hidden:"icon-transitions-module__hidden___ETykt",hiddenScaled:"icon-transitions-module__hiddenScaled___JXn-m",sending:"icon-transitions-module__sending___uaLN-"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-components-icon-transitions");e||(e=document.createElement("style"),e.id="feedback-tool-styles-components-icon-transitions",document.head.appendChild(e)),e.textContent=I4}var gn=A4;var L4=({size:e=16})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",children:(0,ot.jsx)("path",{d:"M8 3v10M3 8h10",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})});var $4=({size:e=20,...t})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg",...t,children:[(0,ot.jsx)("circle",{cx:"10",cy:"10",r:"5.375",stroke:"currentColor",strokeWidth:"1.25"}),(0,ot.jsx)("path",{d:"M8.5 8.5C8.73 7.85 9.31 7.49 10 7.5C10.86 7.51 11.5 8.13 11.5 9C11.5 10.08 10 10.5 10 10.5V10.75",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("circle",{cx:"10",cy:"12.625",r:"0.625",fill:"currentColor"})]});var R4=({size:e=24,copied:t=!1,tint:n})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",style:n?{color:n,transition:"color 0.3s ease"}:void 0,children:[(0,ot.jsxs)("g",{className:`${gn.iconState} ${t?gn.hiddenScaled:gn.visibleScaled}`,children:[(0,ot.jsx)("path",{d:"M4.75 11.25C4.75 10.4216 5.42157 9.75 6.25 9.75H12.75C13.5784 9.75 14.25 10.4216 14.25 11.25V17.75C14.25 18.5784 13.5784 19.25 12.75 19.25H6.25C5.42157 19.25 4.75 18.5784 4.75 17.75V11.25Z",stroke:"currentColor",strokeWidth:"1.5"}),(0,ot.jsx)("path",{d:"M17.25 14.25H17.75C18.5784 14.25 19.25 13.5784 19.25 12.75V6.25C19.25 5.42157 18.5784 4.75 17.75 4.75H11.25C10.4216 4.75 9.75 5.42157 9.75 6.25V6.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),(0,ot.jsxs)("g",{className:`${gn.iconState} ${t?gn.visibleScaled:gn.hiddenScaled}`,children:[(0,ot.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]})]}),O4=({size:e=24,state:t="idle"})=>{let n=t==="idle",o=t==="sent",r=t==="failed",i=t==="sending";return(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsx)("g",{className:`${gn.iconStateFast} ${n?gn.visibleScaled:i?gn.sending:gn.hiddenScaled}`,children:(0,ot.jsx)("path",{d:"M9.875 14.125L12.3506 19.6951C12.7184 20.5227 13.9091 20.4741 14.2083 19.6193L18.8139 6.46032C19.0907 5.6695 18.3305 4.90933 17.5397 5.18611L4.38072 9.79174C3.52589 10.0909 3.47731 11.2816 4.30494 11.6494L9.875 14.125ZM9.875 14.125L13.375 10.625",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),(0,ot.jsxs)("g",{className:`${gn.iconStateFast} ${o?gn.visibleScaled:gn.hiddenScaled}`,children:[(0,ot.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M15 10L11 14.25L9.25 12.25",stroke:"var(--agentation-color-green)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,ot.jsxs)("g",{className:`${gn.iconStateFast} ${r?gn.visibleScaled:gn.hiddenScaled}`,children:[(0,ot.jsx)("path",{d:"M12 20C7.58172 20 4 16.4182 4 12C4 7.58172 7.58172 4 12 4C16.4182 4 20 7.58172 20 12C20 16.4182 16.4182 20 12 20Z",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M12 8V12",stroke:"var(--agentation-color-red)",strokeWidth:"1.5",strokeLinecap:"round"}),(0,ot.jsx)("circle",{cx:"12",cy:"15",r:"0.5",fill:"var(--agentation-color-red)",stroke:"var(--agentation-color-red)",strokeWidth:"1"})]})]})};var P4=({size:e=24,isOpen:t=!0})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsxs)("g",{className:`${gn.iconFade} ${t?gn.visible:gn.hidden}`,children:[(0,ot.jsx)("path",{d:"M3.91752 12.7539C3.65127 12.2996 3.65037 11.7515 3.9149 11.2962C4.9042 9.59346 7.72688 5.49994 12 5.49994C16.2731 5.49994 19.0958 9.59346 20.0851 11.2962C20.3496 11.7515 20.3487 12.2996 20.0825 12.7539C19.0908 14.4459 16.2694 18.4999 12 18.4999C7.73064 18.4999 4.90918 14.4459 3.91752 12.7539Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M12 14.8261C13.5608 14.8261 14.8261 13.5608 14.8261 12C14.8261 10.4392 13.5608 9.17392 12 9.17392C10.4392 9.17392 9.17391 10.4392 9.17391 12C9.17391 13.5608 10.4392 14.8261 12 14.8261Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,ot.jsxs)("g",{className:`${gn.iconFade} ${t?gn.hidden:gn.visible}`,children:[(0,ot.jsx)("path",{d:"M18.6025 9.28503C18.9174 8.9701 19.4364 8.99481 19.7015 9.35271C20.1484 9.95606 20.4943 10.507 20.7342 10.9199C21.134 11.6086 21.1329 12.4454 20.7303 13.1328C20.2144 14.013 19.2151 15.5225 17.7723 16.8193C16.3293 18.1162 14.3852 19.2497 12.0008 19.25C11.4192 19.25 10.8638 19.1823 10.3355 19.0613C9.77966 18.934 9.63498 18.2525 10.0382 17.8493C10.2412 17.6463 10.5374 17.573 10.8188 17.6302C11.1993 17.7076 11.5935 17.75 12.0008 17.75C13.8848 17.7497 15.4867 16.8568 16.7693 15.7041C18.0522 14.5511 18.9606 13.1867 19.4363 12.375C19.5656 12.1543 19.5659 11.8943 19.4373 11.6729C19.2235 11.3049 18.921 10.8242 18.5364 10.3003C18.3085 9.98991 18.3302 9.5573 18.6025 9.28503ZM12.0008 4.75C12.5814 4.75006 13.1358 4.81803 13.6632 4.93953C14.2182 5.06741 14.362 5.74812 13.9593 6.15091C13.7558 6.35435 13.4589 6.42748 13.1771 6.36984C12.7983 6.29239 12.4061 6.25006 12.0008 6.25C10.1167 6.25 8.51415 7.15145 7.23028 8.31543C5.94678 9.47919 5.03918 10.8555 4.56426 11.6729C4.43551 11.8945 4.43582 12.1542 4.56524 12.375C4.77587 12.7343 5.07189 13.2012 5.44718 13.7105C5.67623 14.0213 5.65493 14.4552 5.38193 14.7282C5.0671 15.0431 4.54833 15.0189 4.28292 14.6614C3.84652 14.0736 3.50813 13.5369 3.27129 13.1328C2.86831 12.4451 2.86717 11.6088 3.26739 10.9199C3.78185 10.0345 4.77959 8.51239 6.22247 7.2041C7.66547 5.89584 9.61202 4.75 12.0008 4.75Z",fill:"currentColor"}),(0,ot.jsx)("path",{d:"M5 19L19 5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]})]}),D4=({size:e=24,isPaused:t=!1})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsxs)("g",{className:`${gn.iconFadeFast} ${t?gn.hidden:gn.visible}`,children:[(0,ot.jsx)("path",{d:"M8 6L8 18",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"}),(0,ot.jsx)("path",{d:"M16 18L16 6",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}),(0,ot.jsx)("path",{className:`${gn.iconFadeFast} ${t?gn.visible:gn.hidden}`,d:"M17.75 10.701C18.75 11.2783 18.75 12.7217 17.75 13.299L8.75 18.4952C7.75 19.0725 6.5 18.3509 6.5 17.1962L6.5 6.80384C6.5 5.64914 7.75 4.92746 8.75 5.50481L17.75 10.701Z",stroke:"currentColor",strokeWidth:"1.5"})]});var z4=({size:e=16})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsx)("path",{d:"M10.6504 5.81117C10.9939 4.39628 13.0061 4.39628 13.3496 5.81117C13.5715 6.72517 14.6187 7.15891 15.4219 6.66952C16.6652 5.91193 18.0881 7.33479 17.3305 8.57815C16.8411 9.38134 17.2748 10.4285 18.1888 10.6504C19.6037 10.9939 19.6037 13.0061 18.1888 13.3496C17.2748 13.5715 16.8411 14.6187 17.3305 15.4219C18.0881 16.6652 16.6652 18.0881 15.4219 17.3305C14.6187 16.8411 13.5715 17.2748 13.3496 18.1888C13.0061 19.6037 10.9939 19.6037 10.6504 18.1888C10.4285 17.2748 9.38135 16.8411 8.57815 17.3305C7.33479 18.0881 5.91193 16.6652 6.66952 15.4219C7.15891 14.6187 6.72517 13.5715 5.81117 13.3496C4.39628 13.0061 4.39628 10.9939 5.81117 10.6504C6.72517 10.4285 7.15891 9.38134 6.66952 8.57815C5.91193 7.33479 7.33479 5.91192 8.57815 6.66952C9.38135 7.15891 10.4285 6.72517 10.6504 5.81117Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("circle",{cx:"12",cy:"12",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]});var F4=({size:e=16})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:(0,ot.jsx)("path",{d:"M13.5 4C14.7426 4 15.75 5.00736 15.75 6.25V7H18.5C18.9142 7 19.25 7.33579 19.25 7.75C19.25 8.16421 18.9142 8.5 18.5 8.5H17.9678L17.6328 16.2217C17.61 16.7475 17.5912 17.1861 17.5469 17.543C17.5015 17.9087 17.4225 18.2506 17.2461 18.5723C16.9747 19.0671 16.5579 19.4671 16.0518 19.7168C15.7227 19.8791 15.3772 19.9422 15.0098 19.9717C14.6514 20.0004 14.2126 20 13.6865 20H10.3135C9.78735 20 9.34856 20.0004 8.99023 19.9717C8.62278 19.9422 8.27729 19.8791 7.94824 19.7168C7.44205 19.4671 7.02532 19.0671 6.75391 18.5723C6.57751 18.2506 6.49853 17.9087 6.45312 17.543C6.40883 17.1861 6.39005 16.7475 6.36719 16.2217L6.03223 8.5H5.5C5.08579 8.5 4.75 8.16421 4.75 7.75C4.75 7.33579 5.08579 7 5.5 7H8.25V6.25C8.25 5.00736 9.25736 4 10.5 4H13.5ZM7.86621 16.1562C7.89013 16.7063 7.90624 17.0751 7.94141 17.3584C7.97545 17.6326 8.02151 17.7644 8.06934 17.8516C8.19271 18.0763 8.38239 18.2577 8.6123 18.3711C8.70153 18.4151 8.83504 18.4545 9.11035 18.4766C9.39482 18.4994 9.76335 18.5 10.3135 18.5H13.6865C14.2367 18.5 14.6052 18.4994 14.8896 18.4766C15.165 18.4545 15.2985 18.4151 15.3877 18.3711C15.6176 18.2577 15.8073 18.0763 15.9307 17.8516C15.9785 17.7644 16.0245 17.6326 16.0586 17.3584C16.0938 17.0751 16.1099 16.7063 16.1338 16.1562L16.4668 8.5H7.5332L7.86621 16.1562ZM9.97656 10.75C10.3906 10.7371 10.7371 11.0626 10.75 11.4766L10.875 15.4766C10.8879 15.8906 10.5624 16.2371 10.1484 16.25C9.73443 16.2629 9.38794 15.9374 9.375 15.5234L9.25 11.5234C9.23706 11.1094 9.56255 10.7629 9.97656 10.75ZM14.0244 10.75C14.4384 10.7635 14.7635 11.1105 14.75 11.5244L14.6201 15.5244C14.6066 15.9384 14.2596 16.2634 13.8457 16.25C13.4317 16.2365 13.1067 15.8896 13.1201 15.4756L13.251 11.4756C13.2645 11.0617 13.6105 10.7366 14.0244 10.75ZM10.5 5.5C10.0858 5.5 9.75 5.83579 9.75 6.25V7H14.25V6.25C14.25 5.83579 13.9142 5.5 13.5 5.5H10.5Z",fill:"currentColor"})});var I2=({size:e=16})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsxs)("g",{clipPath:"url(#clip0_2_53)",children:[(0,ot.jsx)("path",{d:"M16.25 16.25L7.75 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M7.75 16.25L16.25 7.75",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),(0,ot.jsx)("defs",{children:(0,ot.jsx)("clipPath",{id:"clip0_2_53",children:(0,ot.jsx)("rect",{width:"24",height:"24",fill:"white"})})})]}),B4=({size:e=24})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:(0,ot.jsx)("path",{d:"M16.7198 6.21973C17.0127 5.92683 17.4874 5.92683 17.7803 6.21973C18.0732 6.51262 18.0732 6.9874 17.7803 7.28027L13.0606 12L17.7803 16.7197C18.0732 17.0126 18.0732 17.4874 17.7803 17.7803C17.4875 18.0731 17.0127 18.0731 16.7198 17.7803L12.0001 13.0605L7.28033 17.7803C6.98746 18.0731 6.51268 18.0731 6.21979 17.7803C5.92689 17.4874 5.92689 17.0126 6.21979 16.7197L10.9395 12L6.21979 7.28027C5.92689 6.98738 5.92689 6.51262 6.21979 6.21973C6.51268 5.92683 6.98744 5.92683 7.28033 6.21973L12.0001 10.9395L16.7198 6.21973Z",fill:"currentColor"})}),W4=({size:e=16})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",children:[(0,ot.jsx)("path",{d:"M9.99999 12.7082C11.4958 12.7082 12.7083 11.4956 12.7083 9.99984C12.7083 8.50407 11.4958 7.2915 9.99999 7.2915C8.50422 7.2915 7.29166 8.50407 7.29166 9.99984C7.29166 11.4956 8.50422 12.7082 9.99999 12.7082Z",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M10 3.9585V5.05698",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M10 14.9429V16.0414",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M5.7269 5.72656L6.50682 6.50649",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M13.4932 13.4932L14.2731 14.2731",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M3.95834 10H5.05683",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M14.9432 10H16.0417",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M5.7269 14.2731L6.50682 13.4932",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"}),(0,ot.jsx)("path",{d:"M13.4932 6.50649L14.2731 5.72656",stroke:"currentColor",strokeWidth:"1.25",strokeLinecap:"round",strokeLinejoin:"round"})]}),H4=({size:e=16})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 20 20",fill:"none",children:(0,ot.jsx)("path",{d:"M15.5 10.4955C15.4037 11.5379 15.0124 12.5314 14.3721 13.3596C13.7317 14.1878 12.8688 14.8165 11.8841 15.1722C10.8995 15.5278 9.83397 15.5957 8.81217 15.3679C7.79038 15.1401 6.8546 14.6259 6.11434 13.8857C5.37408 13.1454 4.85995 12.2096 4.63211 11.1878C4.40427 10.166 4.47215 9.10048 4.82781 8.11585C5.18346 7.13123 5.81218 6.26825 6.64039 5.62791C7.4686 4.98756 8.46206 4.59634 9.5045 4.5C8.89418 5.32569 8.60049 6.34302 8.67685 7.36695C8.75321 8.39087 9.19454 9.35339 9.92058 10.0794C10.6466 10.8055 11.6091 11.2468 12.6331 11.3231C13.657 11.3995 14.6743 11.1058 15.5 10.4955Z",stroke:"currentColor",strokeWidth:"1.13793",strokeLinecap:"round",strokeLinejoin:"round"})}),j4=({size:e=16})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,ot.jsx)("path",{d:"M11.3799 6.9572L9.05645 4.63375M11.3799 6.9572L6.74949 11.5699C6.61925 11.6996 6.45577 11.791 6.277 11.8339L4.29549 12.3092C3.93194 12.3964 3.60478 12.0683 3.69297 11.705L4.16585 9.75693C4.20893 9.57947 4.29978 9.4172 4.42854 9.28771L9.05645 4.63375M11.3799 6.9572L12.3455 5.98759C12.9839 5.34655 12.9839 4.31002 12.3455 3.66897C11.7033 3.02415 10.6594 3.02415 10.0172 3.66897L9.06126 4.62892L9.05645 4.63375",stroke:"currentColor",strokeWidth:"0.9",strokeLinecap:"round",strokeLinejoin:"round"})}),U4=({size:e=24})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,ot.jsx)("path",{d:"M13.5 4C14.7426 4 15.75 5.00736 15.75 6.25V7H18.5C18.9142 7 19.25 7.33579 19.25 7.75C19.25 8.16421 18.9142 8.5 18.5 8.5H17.9678L17.6328 16.2217C17.61 16.7475 17.5912 17.1861 17.5469 17.543C17.5015 17.9087 17.4225 18.2506 17.2461 18.5723C16.9747 19.0671 16.5579 19.4671 16.0518 19.7168C15.7227 19.8791 15.3772 19.9422 15.0098 19.9717C14.6514 20.0004 14.2126 20 13.6865 20H10.3135C9.78735 20 9.34856 20.0004 8.99023 19.9717C8.62278 19.9422 8.27729 19.8791 7.94824 19.7168C7.44205 19.4671 7.02532 19.0671 6.75391 18.5723C6.57751 18.2506 6.49853 17.9087 6.45312 17.543C6.40883 17.1861 6.39005 16.7475 6.36719 16.2217L6.03223 8.5H5.5C5.08579 8.5 4.75 8.16421 4.75 7.75C4.75 7.33579 5.08579 7 5.5 7H8.25V6.25C8.25 5.00736 9.25736 4 10.5 4H13.5ZM7.86621 16.1562C7.89013 16.7063 7.90624 17.0751 7.94141 17.3584C7.97545 17.6326 8.02151 17.7644 8.06934 17.8516C8.19271 18.0763 8.38239 18.2577 8.6123 18.3711C8.70153 18.4151 8.83504 18.4545 9.11035 18.4766C9.39482 18.4994 9.76335 18.5 10.3135 18.5H13.6865C14.2367 18.5 14.6052 18.4994 14.8896 18.4766C15.165 18.4545 15.2985 18.4151 15.3877 18.3711C15.6176 18.2577 15.8073 18.0763 15.9307 17.8516C15.9785 17.7644 16.0245 17.6326 16.0586 17.3584C16.0938 17.0751 16.1099 16.7063 16.1338 16.1562L16.4668 8.5H7.5332L7.86621 16.1562ZM9.97656 10.75C10.3906 10.7371 10.7371 11.0626 10.75 11.4766L10.875 15.4766C10.8879 15.8906 10.5624 16.2371 10.1484 16.25C9.73443 16.2629 9.38794 15.9374 9.375 15.5234L9.25 11.5234C9.23706 11.1094 9.56255 10.7629 9.97656 10.75ZM14.0244 10.75C14.4383 10.7635 14.7635 11.1105 14.75 11.5244L14.6201 15.5244C14.6066 15.9384 14.2596 16.2634 13.8457 16.25C13.4317 16.2365 13.1067 15.8896 13.1201 15.4756L13.251 11.4756C13.2645 11.0617 13.6105 10.7366 14.0244 10.75ZM10.5 5.5C10.0858 5.5 9.75 5.83579 9.75 6.25V7H14.25V6.25C14.25 5.83579 13.9142 5.5 13.5 5.5H10.5Z",fill:"currentColor"})}),q4=({size:e=16})=>(0,ot.jsx)("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,ot.jsx)("path",{d:"M8.5 3.5L4 8L8.5 12.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})});var K4=({size:e=24})=>(0,ot.jsxs)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",children:[(0,ot.jsx)("rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",stroke:"currentColor",strokeWidth:"1.5"}),(0,ot.jsx)("line",{x1:"3",y1:"9",x2:"21",y2:"9",stroke:"currentColor",strokeWidth:"1.5"}),(0,ot.jsx)("line",{x1:"9",y1:"9",x2:"9",y2:"21",stroke:"currentColor",strokeWidth:"1.5"})]}),A2=["data-feedback-toolbar","data-annotation-popup","data-annotation-marker"],mm=A2.flatMap(e=>[`:not([${e}])`,`:not([${e}] *)`]).join(""),Mm="feedback-freeze-styles",gm="__agentation_freeze";function Y4(){if(typeof window>"u")return{frozen:!1,installed:!0,origSetTimeout:setTimeout,origSetInterval:setInterval,origRAF:t=>0,pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]};let e=window;return e[gm]||(e[gm]={frozen:!1,installed:!1,origSetTimeout:null,origSetInterval:null,origRAF:null,pausedAnimations:[],frozenTimeoutQueue:[],frozenRAFQueue:[]}),e[gm]}var Gt=Y4();typeof window<"u"&&!Gt.installed&&(Gt.origSetTimeout=window.setTimeout.bind(window),Gt.origSetInterval=window.setInterval.bind(window),Gt.origRAF=window.requestAnimationFrame.bind(window),window.setTimeout=(e,t,...n)=>typeof e=="string"?Gt.origSetTimeout(e,t):Gt.origSetTimeout((...o)=>{Gt.frozen?Gt.frozenTimeoutQueue.push(()=>e(...o)):e(...o)},t,...n),window.setInterval=(e,t,...n)=>typeof e=="string"?Gt.origSetInterval(e,t):Gt.origSetInterval((...o)=>{Gt.frozen||e(...o)},t,...n),window.requestAnimationFrame=e=>Gt.origRAF(t=>{Gt.frozen?Gt.frozenRAFQueue.push(e):e(t)}),Gt.installed=!0);var Ct=Gt.origSetTimeout,V4=Gt.origSetInterval,Da=Gt.origRAF;function G4(e){return e?A2.some(t=>!!e.closest?.(`[${t}]`)):!1}function X4(){if(typeof document>"u"||Gt.frozen)return;Gt.frozen=!0,Gt.frozenTimeoutQueue=[],Gt.frozenRAFQueue=[];let e=document.getElementById(Mm);e||(e=document.createElement("style"),e.id=Mm),e.textContent=`
    *${mm},
    *${mm}::before,
    *${mm}::after {
      animation-play-state: paused !important;
      transition: none !important;
    }
  `,document.head.appendChild(e),Gt.pausedAnimations=[];try{document.getAnimations().forEach(t=>{if(t.playState!=="running")return;let n=t.effect?.target;G4(n)||(t.pause(),Gt.pausedAnimations.push(t))})}catch{}document.querySelectorAll("video").forEach(t=>{t.paused||(t.dataset.wasPaused="false",t.pause())})}function i2(){if(typeof document>"u"||!Gt.frozen)return;Gt.frozen=!1;let e=Gt.frozenTimeoutQueue;Gt.frozenTimeoutQueue=[];for(let n of e)Gt.origSetTimeout(()=>{if(Gt.frozen){Gt.frozenTimeoutQueue.push(n);return}try{n()}catch(o){console.warn("[agentation] Error replaying queued timeout:",o)}},0);let t=Gt.frozenRAFQueue;Gt.frozenRAFQueue=[];for(let n of t)Gt.origRAF(o=>{if(Gt.frozen){Gt.frozenRAFQueue.push(n);return}n(o)});for(let n of Gt.pausedAnimations)try{n.play()}catch(o){console.warn("[agentation] Error resuming animation:",o)}Gt.pausedAnimations=[],document.getElementById(Mm)?.remove(),document.querySelectorAll("video").forEach(n=>{n.dataset.wasPaused==="false"&&(n.play().catch(()=>{}),delete n.dataset.wasPaused)})}function _m(e){if(!e)return;let t=n=>n.stopImmediatePropagation();document.addEventListener("focusin",t,!0),document.addEventListener("focusout",t,!0);try{e.focus()}finally{document.removeEventListener("focusin",t,!0),document.removeEventListener("focusout",t,!0)}}var zu=(0,zn.forwardRef)(function({element:t,timestamp:n,selectedText:o,placeholder:r="What should change?",initialValue:i="",submitLabel:s="Add",onSubmit:a,onCancel:l,onDelete:d,style:c,accentColor:p="#3c82f7",isExiting:f=!1,lightMode:C=!1,computedStyles:w},m){let[S,g]=(0,zn.useState)(i),[y,E]=(0,zn.useState)(!1),[A,Q]=(0,zn.useState)("initial"),[G,D]=(0,zn.useState)(!1),[le,K]=(0,zn.useState)(!1),W=(0,zn.useRef)(null),Y=(0,zn.useRef)(null),he=(0,zn.useRef)(null),Ce=(0,zn.useRef)(null);(0,zn.useEffect)(()=>{f&&A!=="exit"&&Q("exit")},[f,A]),(0,zn.useEffect)(()=>{Ct(()=>{Q("enter")},0);let Ve=Ct(()=>{Q("entered")},200),gt=Ct(()=>{let U=W.current;U&&(_m(U),U.selectionStart=U.selectionEnd=U.value.length,U.scrollTop=U.scrollHeight)},50);return()=>{clearTimeout(Ve),clearTimeout(gt),he.current&&clearTimeout(he.current),Ce.current&&clearTimeout(Ce.current)}},[]);let Oe=(0,zn.useCallback)(()=>{Ce.current&&clearTimeout(Ce.current),E(!0),Ce.current=Ct(()=>{E(!1),_m(W.current)},250)},[]);(0,zn.useImperativeHandle)(m,()=>({shake:Oe}),[Oe]);let Pe=(0,zn.useCallback)(()=>{Q("exit"),he.current=Ct(()=>{l()},150)},[l]),je=(0,zn.useCallback)(()=>{S.trim()&&a(S.trim())},[S,a]),$e=(0,zn.useCallback)(Ve=>{Ve.stopPropagation(),!Ve.nativeEvent.isComposing&&(Ve.key==="Enter"&&!Ve.shiftKey&&(Ve.preventDefault(),je()),Ve.key==="Escape"&&Pe())},[je,Pe]),rt=[yn.popup,C?yn.light:"",A==="enter"?yn.enter:"",A==="entered"?yn.entered:"",A==="exit"?yn.exit:"",y?yn.shake:""].filter(Boolean).join(" ");return(0,$n.jsxs)("div",{ref:Y,className:rt,"data-annotation-popup":!0,style:c,onClick:Ve=>Ve.stopPropagation(),children:[(0,$n.jsxs)("div",{className:yn.header,children:[w&&Object.keys(w).length>0?(0,$n.jsxs)("button",{className:yn.headerToggle,onClick:()=>{let Ve=le;K(!le),Ve&&Ct(()=>_m(W.current),0)},type:"button",children:[(0,$n.jsx)("svg",{className:`${yn.chevron} ${le?yn.expanded:""}`,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,$n.jsx)("path",{d:"M5.5 10.25L9 7.25L5.75 4",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),(0,$n.jsx)("span",{className:yn.element,children:t})]}):(0,$n.jsx)("span",{className:yn.element,children:t}),n&&(0,$n.jsx)("span",{className:yn.timestamp,children:n})]}),w&&Object.keys(w).length>0&&(0,$n.jsx)("div",{className:`${yn.stylesWrapper} ${le?yn.expanded:""}`,children:(0,$n.jsx)("div",{className:yn.stylesInner,children:(0,$n.jsx)("div",{className:yn.stylesBlock,children:Object.entries(w).map(([Ve,gt])=>(0,$n.jsxs)("div",{className:yn.styleLine,children:[(0,$n.jsx)("span",{className:yn.styleProperty,children:Ve.replace(/([A-Z])/g,"-$1").toLowerCase()}),": ",(0,$n.jsx)("span",{className:yn.styleValue,children:gt}),";"]},Ve))})})}),o&&(0,$n.jsxs)("div",{className:yn.quote,children:["\u201C",o.slice(0,80),o.length>80?"...":"","\u201D"]}),(0,$n.jsx)("textarea",{ref:W,className:yn.textarea,style:{borderColor:G?p:void 0},placeholder:r,value:S,onChange:Ve=>g(Ve.target.value),onFocus:()=>D(!0),onBlur:()=>D(!1),rows:2,onKeyDown:$e}),(0,$n.jsxs)("div",{className:yn.actions,children:[d&&(0,$n.jsx)("div",{className:yn.deleteWrapper,children:(0,$n.jsx)("button",{className:yn.deleteButton,onClick:d,type:"button",children:(0,$n.jsx)(U4,{size:22})})}),(0,$n.jsx)("button",{className:yn.cancel,onClick:Pe,children:"Cancel"}),(0,$n.jsx)("button",{className:yn.submit,style:{backgroundColor:p,opacity:S.trim()?1:.4},onClick:je,disabled:!S.trim(),children:s})]})]})}),Q4=({content:e,children:t,...n})=>{let[o,r]=(0,Gr.useState)(!1),[i,s]=(0,Gr.useState)(!1),[a,l]=(0,Gr.useState)({top:0,right:0}),d=(0,Gr.useRef)(null),c=(0,Gr.useRef)(null),p=(0,Gr.useRef)(null),f=()=>{if(d.current){let m=d.current.getBoundingClientRect();l({top:m.top+m.height/2,right:window.innerWidth-m.left+8})}},C=()=>{s(!0),p.current&&(clearTimeout(p.current),p.current=null),f(),c.current=Ct(()=>{r(!0)},500)},w=()=>{c.current&&(clearTimeout(c.current),c.current=null),r(!1),p.current=Ct(()=>{s(!1)},150)};return(0,Gr.useEffect)(()=>()=>{c.current&&clearTimeout(c.current),p.current&&clearTimeout(p.current)},[]),(0,Ls.jsxs)(Ls.Fragment,{children:[(0,Ls.jsx)("span",{ref:d,onMouseEnter:C,onMouseLeave:w,...n,children:t}),i&&(0,L2.createPortal)((0,Ls.jsx)("div",{"data-feedback-toolbar":!0,style:{position:"fixed",top:a.top,right:a.right,transform:"translateY(-50%)",padding:"6px 10px",background:"#383838",color:"rgba(255, 255, 255, 0.7)",fontSize:"11px",fontWeight:400,lineHeight:"14px",borderRadius:"10px",width:"180px",textAlign:"left",zIndex:100020,pointerEvents:"none",boxShadow:"0px 1px 8px rgba(0, 0, 0, 0.28)",opacity:o?1:0,transition:"opacity 0.15s ease"},children:e}),document.body)]})},J4=`.styles-module__tooltip___mcXL2 {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: help;
}

.styles-module__tooltipIcon___Nq2nD {
  transform: translateY(0.5px);
  color: #fff;
  opacity: 0.2;
  transition: opacity 0.15s ease;
  will-change: transform;
}
.styles-module__tooltip___mcXL2:hover .styles-module__tooltipIcon___Nq2nD {
  opacity: 0.5;
}
[data-agentation-theme=light] .styles-module__tooltipIcon___Nq2nD {
  color: #000;
}`,Z4={tooltip:"styles-module__tooltip___mcXL2",tooltipIcon:"styles-module__tooltipIcon___Nq2nD"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-help-tooltip-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-help-tooltip-styles",document.head.appendChild(e)),e.textContent=J4}var s2=Z4,As=({content:e})=>(0,Nm.jsx)(Q4,{className:s2.tooltip,content:e,children:(0,Nm.jsx)($4,{className:s2.tooltipIcon})}),ct={navigation:{width:800,height:56},hero:{width:800,height:320},header:{width:800,height:80},section:{width:800,height:400},sidebar:{width:240,height:400},footer:{width:800,height:160},modal:{width:480,height:300},card:{width:280,height:240},text:{width:400,height:120},image:{width:320,height:200},video:{width:480,height:270},table:{width:560,height:220},grid:{width:600,height:300},list:{width:300,height:180},chart:{width:400,height:240},button:{width:140,height:40},input:{width:280,height:56},form:{width:360,height:320},tabs:{width:480,height:240},dropdown:{width:200,height:200},toggle:{width:44,height:24},search:{width:320,height:44},avatar:{width:48,height:48},badge:{width:80,height:28},breadcrumb:{width:300,height:24},pagination:{width:300,height:36},progress:{width:240,height:8},divider:{width:600,height:1},accordion:{width:400,height:200},carousel:{width:600,height:300},toast:{width:320,height:64},tooltip:{width:180,height:40},pricing:{width:300,height:360},testimonial:{width:360,height:200},cta:{width:600,height:160},alert:{width:400,height:56},banner:{width:800,height:48},stat:{width:200,height:120},stepper:{width:480,height:48},tag:{width:72,height:28},rating:{width:160,height:28},map:{width:480,height:300},timeline:{width:360,height:320},fileUpload:{width:360,height:180},codeBlock:{width:480,height:200},calendar:{width:300,height:300},notification:{width:360,height:72},productCard:{width:280,height:360},profile:{width:280,height:200},drawer:{width:320,height:400},popover:{width:240,height:160},logo:{width:120,height:40},faq:{width:560,height:320},gallery:{width:560,height:360},checkbox:{width:20,height:20},radio:{width:20,height:20},slider:{width:240,height:32},datePicker:{width:300,height:320},skeleton:{width:320,height:120},chip:{width:96,height:32},icon:{width:24,height:24},spinner:{width:32,height:32},feature:{width:360,height:200},team:{width:560,height:280},login:{width:360,height:360},contact:{width:400,height:320}},$2=[{section:"Layout",items:[{type:"navigation",label:"Navigation",...ct.navigation},{type:"header",label:"Header",...ct.header},{type:"hero",label:"Hero",...ct.hero},{type:"section",label:"Section",...ct.section},{type:"sidebar",label:"Sidebar",...ct.sidebar},{type:"footer",label:"Footer",...ct.footer},{type:"modal",label:"Modal",...ct.modal},{type:"banner",label:"Banner",...ct.banner},{type:"drawer",label:"Drawer",...ct.drawer},{type:"popover",label:"Popover",...ct.popover},{type:"divider",label:"Divider",...ct.divider}]},{section:"Content",items:[{type:"card",label:"Card",...ct.card},{type:"text",label:"Text",...ct.text},{type:"image",label:"Image",...ct.image},{type:"video",label:"Video",...ct.video},{type:"table",label:"Table",...ct.table},{type:"grid",label:"Grid",...ct.grid},{type:"list",label:"List",...ct.list},{type:"chart",label:"Chart",...ct.chart},{type:"codeBlock",label:"Code block",...ct.codeBlock},{type:"map",label:"Map",...ct.map},{type:"timeline",label:"Timeline",...ct.timeline},{type:"calendar",label:"Calendar",...ct.calendar},{type:"accordion",label:"Accordion",...ct.accordion},{type:"carousel",label:"Carousel",...ct.carousel},{type:"logo",label:"Logo",...ct.logo},{type:"faq",label:"FAQ",...ct.faq},{type:"gallery",label:"Gallery",...ct.gallery}]},{section:"Controls",items:[{type:"button",label:"Button",...ct.button},{type:"input",label:"Input",...ct.input},{type:"search",label:"Search",...ct.search},{type:"form",label:"Form",...ct.form},{type:"tabs",label:"Tabs",...ct.tabs},{type:"dropdown",label:"Dropdown",...ct.dropdown},{type:"toggle",label:"Toggle",...ct.toggle},{type:"stepper",label:"Stepper",...ct.stepper},{type:"rating",label:"Rating",...ct.rating},{type:"fileUpload",label:"File upload",...ct.fileUpload},{type:"checkbox",label:"Checkbox",...ct.checkbox},{type:"radio",label:"Radio",...ct.radio},{type:"slider",label:"Slider",...ct.slider},{type:"datePicker",label:"Date picker",...ct.datePicker}]},{section:"Elements",items:[{type:"avatar",label:"Avatar",...ct.avatar},{type:"badge",label:"Badge",...ct.badge},{type:"tag",label:"Tag",...ct.tag},{type:"breadcrumb",label:"Breadcrumb",...ct.breadcrumb},{type:"pagination",label:"Pagination",...ct.pagination},{type:"progress",label:"Progress",...ct.progress},{type:"alert",label:"Alert",...ct.alert},{type:"toast",label:"Toast",...ct.toast},{type:"notification",label:"Notification",...ct.notification},{type:"tooltip",label:"Tooltip",...ct.tooltip},{type:"stat",label:"Stat",...ct.stat},{type:"skeleton",label:"Skeleton",...ct.skeleton},{type:"chip",label:"Chip",...ct.chip},{type:"icon",label:"Icon",...ct.icon},{type:"spinner",label:"Spinner",...ct.spinner}]},{section:"Blocks",items:[{type:"pricing",label:"Pricing",...ct.pricing},{type:"testimonial",label:"Testimonial",...ct.testimonial},{type:"cta",label:"CTA",...ct.cta},{type:"productCard",label:"Product card",...ct.productCard},{type:"profile",label:"Profile",...ct.profile},{type:"feature",label:"Feature",...ct.feature},{type:"team",label:"Team",...ct.team},{type:"login",label:"Login",...ct.login},{type:"contact",label:"Contact",...ct.contact}]}],Lr={};for(let e of $2)for(let t of e.items)Lr[t.type]=t;function Se({w:e,h:t=3,strong:n}){return(0,x.jsx)("div",{style:{width:typeof e=="number"?`${e}px`:e,height:t,borderRadius:2,background:n?"var(--agd-bar-strong)":"var(--agd-bar)",flexShrink:0}})}function hn({w:e,h:t,radius:n=3,style:o}){return(0,x.jsx)("div",{style:{width:typeof e=="number"?`${e}px`:e,height:typeof t=="number"?`${t}px`:t,borderRadius:n,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0,...o}})}function Po({size:e}){return(0,x.jsx)("div",{style:{width:e,height:e,borderRadius:"50%",border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",flexShrink:0}})}function ek({width:e,height:t}){let n=Math.max(8,t*.2);return(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",height:"100%",padding:`0 ${n}px`,gap:e*.02},children:[(0,x.jsx)(hn,{w:Math.max(20,t*.5),h:Math.max(12,t*.4),radius:2}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",gap:e*.03,marginLeft:e*.04},children:[(0,x.jsx)(Se,{w:e*.06}),(0,x.jsx)(Se,{w:e*.07}),(0,x.jsx)(Se,{w:e*.05}),(0,x.jsx)(Se,{w:e*.06})]}),(0,x.jsx)(hn,{w:e*.1,h:Math.min(28,t*.5),radius:4})]})}function tk({width:e,height:t,text:n}){return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.05},children:[n?(0,x.jsx)("span",{style:{fontSize:Math.min(20,t*.08),fontWeight:600,color:"var(--agd-text-3)",textAlign:"center",maxWidth:"80%"},children:n}):(0,x.jsx)(Se,{w:e*.5,h:Math.max(6,t*.04),strong:!0}),(0,x.jsx)(Se,{w:e*.6}),(0,x.jsx)(Se,{w:e*.4}),(0,x.jsx)(hn,{w:Math.min(140,e*.2),h:Math.min(36,t*.12),radius:6,style:{marginTop:t*.06}})]})}function nk({width:e,height:t}){let n=Math.max(3,Math.floor(t/36));return(0,x.jsxs)("div",{style:{padding:e*.08,display:"flex",flexDirection:"column",gap:t*.03},children:[(0,x.jsx)(Se,{w:e*.6,h:4,strong:!0}),Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,x.jsx)(hn,{w:10,h:10,radius:2}),(0,x.jsx)(Se,{w:e*(.4+r*17%30/100)})]},r))]})}function ok({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/160)));return(0,x.jsx)("div",{style:{display:"flex",padding:`${t*.12}px ${e*.03}px`,gap:e*.05},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsx)(Se,{w:"60%",h:3,strong:!0}),(0,x.jsx)(Se,{w:"80%",h:2}),(0,x.jsx)(Se,{w:"70%",h:2}),(0,x.jsx)(Se,{w:"60%",h:2})]},r))})}function rk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsxs)("div",{style:{padding:"10px 12px",borderBottom:"1px solid var(--agd-stroke)",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,x.jsx)(Se,{w:e*.3,h:4,strong:!0}),(0,x.jsx)("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),(0,x.jsxs)("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[(0,x.jsx)(Se,{w:"90%"}),(0,x.jsx)(Se,{w:"70%"}),(0,x.jsx)(Se,{w:"80%"})]}),(0,x.jsxs)("div",{style:{padding:"10px 12px",borderTop:"1px solid var(--agd-stroke)",display:"flex",justifyContent:"flex-end",gap:8},children:[(0,x.jsx)(hn,{w:70,h:26,radius:4}),(0,x.jsx)(hn,{w:70,h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})}function ik({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsx)("div",{style:{height:"40%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),(0,x.jsxs)("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,x.jsx)(Se,{w:"70%",h:4,strong:!0}),(0,x.jsx)(Se,{w:"95%",h:2}),(0,x.jsx)(Se,{w:"85%",h:2}),(0,x.jsx)(Se,{w:"50%",h:2})]})]})}function sk({width:e,height:t,text:n}){if(n)return(0,x.jsx)("div",{style:{padding:4,fontSize:Math.min(14,t*.3),lineHeight:1.5,color:"var(--agd-text-3)",wordBreak:"break-word",overflow:"hidden"},children:n});let o=Math.max(2,Math.floor(t/18));return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:6,padding:4},children:[(0,x.jsx)(Se,{w:e*.6,h:5,strong:!0}),Array.from({length:o},(r,i)=>(0,x.jsx)(Se,{w:`${70+i*13%25}%`,h:2},i))]})}function ak({width:e,height:t}){return(0,x.jsx)("div",{style:{height:"100%",position:"relative"},children:(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,preserveAspectRatio:"none",fill:"none",children:[(0,x.jsx)("line",{x1:"0",y1:"0",x2:e,y2:t,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,x.jsx)("line",{x1:e,y1:"0",x2:"0",y2:t,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,x.jsx)("circle",{cx:e*.3,cy:t*.3,r:Math.min(e,t)*.08,fill:"var(--agd-fill)",stroke:"var(--agd-stroke)",strokeWidth:"0.8"})]})})}function lk({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(e/100))),o=Math.max(2,Math.min(6,Math.floor(t/32)));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsx)("div",{style:{display:"flex",borderBottom:"1px solid var(--agd-stroke)",padding:"6px 0"},children:Array.from({length:n},(r,i)=>(0,x.jsx)("div",{style:{flex:1,padding:"0 8px"},children:(0,x.jsx)(Se,{w:"70%",h:3,strong:!0})},i))}),Array.from({length:o},(r,i)=>(0,x.jsx)("div",{style:{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.03)",padding:"6px 0"},children:Array.from({length:n},(s,a)=>(0,x.jsx)("div",{style:{flex:1,padding:"0 8px"},children:(0,x.jsx)(Se,{w:`${50+(i*7+a*13)%40}%`,h:2})},a))},i))]})}function ck({width:e,height:t}){let n=Math.max(2,Math.floor(t/28));return(0,x.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:4,padding:4},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"4px 0"},children:[(0,x.jsx)(Po,{size:8}),(0,x.jsx)(Se,{w:`${55+r*17%35}%`,h:2})]},r))})}function dk({width:e,height:t,text:n}){return(0,x.jsx)("div",{style:{height:"100%",borderRadius:Math.min(8,t/3),border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:n?(0,x.jsx)("span",{style:{fontSize:Math.min(13,t*.4),fontWeight:500,color:"var(--agd-text-3)",letterSpacing:"-0.01em"},children:n}):(0,x.jsx)(Se,{w:Math.max(20,e*.5),h:3,strong:!0})})}function uk({width:e,height:t}){return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:4,height:"100%",justifyContent:"center"},children:[(0,x.jsx)(Se,{w:Math.min(80,e*.3),h:2}),(0,x.jsx)("div",{style:{height:Math.min(36,t*.6),borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",paddingLeft:8},children:(0,x.jsx)(Se,{w:"40%",h:2})})]})}function pk({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(t/56)));return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:t*.04,padding:8},children:[Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsx)(Se,{w:60+r*17%30,h:2}),(0,x.jsx)(hn,{w:"100%",h:28,radius:4})]},r)),(0,x.jsx)(hn,{w:Math.min(120,e*.35),h:30,radius:6,style:{marginTop:8,alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}function fk({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120)));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsx)("div",{style:{display:"flex",gap:2,borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:n},(o,r)=>(0,x.jsx)("div",{style:{padding:"8px 12px",borderBottom:r===0?"2px solid var(--agd-bar-strong)":"none"},children:(0,x.jsx)(Se,{w:60,h:3,strong:r===0})},r))}),(0,x.jsxs)("div",{style:{flex:1,padding:12,display:"flex",flexDirection:"column",gap:6},children:[(0,x.jsx)(Se,{w:"80%",h:2}),(0,x.jsx)(Se,{w:"65%",h:2}),(0,x.jsx)(Se,{w:"75%",h:2})]})]})}function hk({width:e,height:t}){let n=Math.min(e,t)/2;return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("circle",{cx:e/2,cy:t/2,r:n-1,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"1.5",strokeDasharray:"3 2"}),(0,x.jsx)("circle",{cx:e/2,cy:t*.38,r:n*.28,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"}),(0,x.jsx)("path",{d:`M${e/2-n*.55} ${t*.78} C${e/2-n*.55} ${t*.55} ${e/2+n*.55} ${t*.55} ${e/2+n*.55} ${t*.78}`,stroke:"var(--agd-stroke)",fill:"var(--agd-fill)",strokeWidth:"0.8"})]})}function mk({width:e,height:t}){return(0,x.jsx)("div",{style:{height:"100%",borderRadius:t/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)(Se,{w:Math.max(16,e*.5),h:2,strong:!0})})}function gk({width:e,height:t}){return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.08},children:[(0,x.jsx)(Se,{w:e*.5,h:Math.max(5,t*.06),strong:!0}),(0,x.jsx)(Se,{w:e*.35})]})}function _k({width:e,height:t}){return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",gap:t*.04,padding:e*.04},children:[(0,x.jsx)(Se,{w:e*.3,h:4,strong:!0}),(0,x.jsx)(Se,{w:e*.7}),(0,x.jsx)(Se,{w:e*.5}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",gap:e*.03,marginTop:t*.06},children:[(0,x.jsx)(hn,{w:"33%",h:"100%",radius:4}),(0,x.jsx)(hn,{w:"33%",h:"100%",radius:4}),(0,x.jsx)(hn,{w:"33%",h:"100%",radius:4})]})]})}function yk({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/140))),o=Math.max(1,Math.min(3,Math.floor(t/120)));return(0,x.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${n}, 1fr)`,gridTemplateRows:`repeat(${o}, 1fr)`,gap:6,height:"100%"},children:Array.from({length:n*o},(r,i)=>(0,x.jsx)(hn,{w:"100%",h:"100%",radius:4},i))})}function xk({width:e,height:t}){let n=Math.max(2,Math.floor((t-32)/28));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsx)("div",{style:{padding:"6px 8px",borderBottom:"1px solid var(--agd-stroke)"},children:(0,x.jsx)(Se,{w:e*.5,h:3,strong:!0})}),(0,x.jsx)("div",{style:{flex:1,padding:4,display:"flex",flexDirection:"column",gap:2},children:Array.from({length:n},(o,r)=>(0,x.jsx)("div",{style:{padding:"4px 6px",borderRadius:3,background:r===0?"var(--agd-fill)":"transparent"},children:(0,x.jsx)(Se,{w:`${50+r*17%35}%`,h:2,strong:r===0})},r))})]})}function wk({width:e,height:t}){let n=Math.min(e,t)/2;return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("rect",{x:"1",y:"1",width:e-2,height:t-2,rx:n,stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,x.jsx)("circle",{cx:e-n,cy:t/2,r:n*.7,fill:"var(--agd-bar)"})]})}function vk({width:e,height:t}){let n=Math.min(t/2,20);return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:n,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${n*.6}px`,gap:6},children:[(0,x.jsx)(Po,{size:Math.min(14,t*.4)}),(0,x.jsx)(Se,{w:"50%",h:2})]})}function bk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,x.jsx)(Po,{size:Math.min(20,t*.5)}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:"60%",h:3,strong:!0}),(0,x.jsx)(Se,{w:"80%",h:2})]}),(0,x.jsx)("div",{style:{width:14,height:14,border:"1px solid var(--agd-stroke)",borderRadius:3,flexShrink:0}})]})}function kk({width:e,height:t}){return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("rect",{x:"0",y:"0",width:e,height:t,rx:t/2,stroke:"var(--agd-stroke)",strokeWidth:"0.8"}),(0,x.jsx)("rect",{x:"1",y:"1",width:e*.65,height:t-2,rx:(t-2)/2,fill:"var(--agd-bar)"})]})}function Sk({width:e,height:t}){let n=Math.max(3,Math.min(7,Math.floor(e/50))),o=e/(n*2);return(0,x.jsx)("div",{style:{height:"100%",display:"flex",alignItems:"flex-end",justifyContent:"space-around",padding:"0 4px",borderBottom:"1px solid var(--agd-stroke)"},children:Array.from({length:n},(r,i)=>{let s=30+(i*37+17)%55;return(0,x.jsx)(hn,{w:o,h:`${s}%`,radius:2},i)})})}function Ck({width:e,height:t}){let n=Math.min(e,t)*.12;return(0,x.jsxs)("div",{style:{height:"100%",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,x.jsx)(hn,{w:"100%",h:"100%",radius:4}),(0,x.jsx)("div",{style:{position:"absolute",width:n*2,height:n*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)("div",{style:{width:0,height:0,borderLeft:`${n*.6}px solid var(--agd-bar-strong)`,borderTop:`${n*.4}px solid transparent`,borderBottom:`${n*.4}px solid transparent`,marginLeft:n*.15}})})]})}function Ek({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,x.jsx)("div",{style:{flex:1,width:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)(Se,{w:"60%",h:2})}),(0,x.jsx)("div",{style:{width:8,height:8,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-5}})]})}function Tk({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/80)));return(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",height:"100%",gap:4},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[r>0&&(0,x.jsx)("span",{style:{color:"var(--agd-stroke)",fontSize:10},children:"/"}),(0,x.jsx)(Se,{w:40+r*13%20,h:2,strong:r===n-1})]},r))})}function Mk({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(e/40))),o=Math.min(28,t*.8);return(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:4},children:Array.from({length:n},(r,i)=>(0,x.jsx)(hn,{w:o,h:o,radius:4,style:i===1?{background:"var(--agd-bar)"}:void 0},i))})}function Nk({width:e}){return(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",height:"100%"},children:(0,x.jsx)("div",{style:{width:"100%",height:1,background:"var(--agd-stroke)"}})})}function Ik({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(t/40)));return(0,x.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:r===0?2:1},children:[(0,x.jsx)(Se,{w:`${40+r*17%25}%`,h:3,strong:!0}),(0,x.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:r===0?"\u25BC":"\u25B6"})]},r))})}function Ak({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:6},children:[(0,x.jsxs)("div",{style:{flex:1,display:"flex",gap:6,alignItems:"center"},children:[(0,x.jsx)("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"\u2039"}),(0,x.jsx)(hn,{w:"100%",h:"100%",radius:4}),(0,x.jsx)("span",{style:{fontSize:12,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,x.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:4},children:[(0,x.jsx)(Po,{size:5}),(0,x.jsx)(Po,{size:5}),(0,x.jsx)(Po,{size:5})]})]})}function Lk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:10,gap:t*.04},children:[(0,x.jsx)(Se,{w:e*.4,h:3,strong:!0}),(0,x.jsx)(Se,{w:e*.3,h:6,strong:!0}),(0,x.jsx)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4,width:"100%",padding:"8px 0"},children:Array.from({length:4},(n,o)=>(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:4},children:[(0,x.jsx)(Po,{size:5}),(0,x.jsx)(Se,{w:`${50+o*17%35}%`,h:2})]},o))}),(0,x.jsx)(hn,{w:e*.7,h:Math.min(32,t*.1),radius:6,style:{background:"var(--agd-bar)"}})]})}function $k({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:10,gap:8},children:[(0,x.jsx)("span",{style:{fontSize:18,lineHeight:1,color:"var(--agd-stroke)",fontFamily:"serif"},children:"\u201C"}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsx)(Se,{w:"90%",h:2}),(0,x.jsx)(Se,{w:"75%",h:2}),(0,x.jsx)(Se,{w:"60%",h:2})]}),(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,x.jsx)(Po,{size:20}),(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:2},children:[(0,x.jsx)(Se,{w:60,h:3,strong:!0}),(0,x.jsx)(Se,{w:40,h:2})]})]})]})}function Rk({width:e,height:t}){return(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:t*.08},children:[(0,x.jsx)(Se,{w:e*.5,h:Math.max(4,t*.05),strong:!0}),(0,x.jsx)(Se,{w:e*.35}),(0,x.jsx)(hn,{w:Math.min(140,e*.25),h:Math.min(32,t*.15),radius:6,style:{marginTop:t*.04,background:"var(--agd-bar)"}})]})}function Ok({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,x.jsx)("div",{style:{width:16,height:16,borderRadius:"50%",border:"1.5px solid var(--agd-bar-strong)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,x.jsx)("div",{style:{width:2,height:6,background:"var(--agd-bar-strong)",borderRadius:1}})}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:"40%",h:3,strong:!0}),(0,x.jsx)(Se,{w:"70%",h:2})]})]})}function Pk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:"0 12px"},children:[(0,x.jsx)(Se,{w:e*.4,h:3,strong:!0}),(0,x.jsx)(hn,{w:60,h:Math.min(24,t*.6),radius:4})]})}function Dk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,x.jsx)(Se,{w:e*.5,h:2}),(0,x.jsx)(Se,{w:e*.4,h:Math.max(8,t*.18),strong:!0}),(0,x.jsx)(Se,{w:e*.3,h:2})]})}function zk({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(e/100))),o=Math.min(12,t*.35);return(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",height:"100%",padding:"0 8px"},children:Array.from({length:n},(r,i)=>(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:0,flex:1},children:[(0,x.jsx)("div",{style:{width:o,height:o,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:i===0?"var(--agd-bar)":"transparent",flexShrink:0}}),i<n-1&&(0,x.jsx)("div",{style:{flex:1,height:1,background:"var(--agd-stroke)",margin:"0 4px"}})]},i))})}function Fk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:4,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",justifyContent:"center",gap:4,padding:"0 6px"},children:[(0,x.jsx)(Se,{w:Math.max(16,e*.5),h:2,strong:!0}),(0,x.jsx)("div",{style:{width:8,height:8,borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0}})]})}function Bk({width:e,height:t}){let o=Math.min(t*.7,e/7.5);return(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",gap:o*.2},children:Array.from({length:5},(r,i)=>(0,x.jsx)("svg",{width:o,height:o,viewBox:"0 0 16 16",fill:"none",children:(0,x.jsx)("path",{d:"M8 1.5l2 4 4.5.7-3.25 3.1.75 4.5L8 11.4l-4 2.4.75-4.5L1.5 6.2 6 5.5z",stroke:"var(--agd-stroke)",strokeWidth:"0.8",fill:i<3?"var(--agd-bar)":"none"})},i))})}function Wk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",position:"relative",borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",overflow:"hidden"},children:[(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",style:{position:"absolute",inset:0},children:[(0,x.jsx)("line",{x1:0,y1:t*.3,x2:e,y2:t*.7,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".2"}),(0,x.jsx)("line",{x1:0,y1:t*.6,x2:e,y2:t*.2,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"}),(0,x.jsx)("line",{x1:e*.4,y1:0,x2:e*.6,y2:t,stroke:"var(--agd-stroke)",strokeWidth:"0.5",opacity:".15"})]}),(0,x.jsx)("div",{style:{position:"absolute",left:"50%",top:"40%",transform:"translate(-50%, -100%)"},children:(0,x.jsxs)("svg",{width:"16",height:"22",viewBox:"0 0 16 22",fill:"none",children:[(0,x.jsx)("path",{d:"M8 0C3.6 0 0 3.6 0 8c0 6 8 14 8 14s8-8 8-14c0-4.4-3.6-8-8-8z",fill:"var(--agd-bar)",opacity:".4"}),(0,x.jsx)("circle",{cx:"8",cy:"8",r:"3",fill:"var(--agd-fill)"})]})})]})}function Hk({width:e,height:t}){let n=Math.max(3,Math.min(5,Math.floor(t/60)));return(0,x.jsxs)("div",{style:{display:"flex",height:"100%",padding:"8px 0"},children:[(0,x.jsx)("div",{style:{width:16,display:"flex",flexDirection:"column",alignItems:"center"},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",flex:1},children:[(0,x.jsx)(Po,{size:8}),r<n-1&&(0,x.jsx)("div",{style:{flex:1,width:1,background:"var(--agd-stroke)"}})]},r))}),(0,x.jsx)("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingLeft:8},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:`${35+r*13%25}%`,h:3,strong:!0}),(0,x.jsx)(Se,{w:`${50+r*17%30}%`,h:2})]},r))})]})}function jk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"2px dashed var(--agd-stroke)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,x.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[(0,x.jsx)("path",{d:"M12 16V4m0 0l-4 4m4-4l4 4",stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,x.jsx)("path",{d:"M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2",stroke:"var(--agd-stroke)",strokeWidth:"1.5"})]}),(0,x.jsx)(Se,{w:e*.4,h:2}),(0,x.jsx)(Se,{w:e*.25,h:2})]})}function Uk({width:e,height:t}){let n=Math.max(3,Math.min(8,Math.floor(t/20)));return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:6,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",padding:8,display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsxs)("div",{style:{display:"flex",gap:3,marginBottom:4},children:[(0,x.jsx)(Po,{size:6}),(0,x.jsx)(Po,{size:6}),(0,x.jsx)(Po,{size:6})]}),Array.from({length:n},(o,r)=>(0,x.jsx)("div",{style:{display:"flex",gap:6,paddingLeft:r>0&&r<n-1?12:0},children:(0,x.jsx)(Se,{w:`${25+r*23%50}%`,h:2,strong:r===0})},r))]})}function qk({width:e,height:t}){let r=Math.min((e-16)/7,(t-40)/6);return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px"},children:[(0,x.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"\u2039"}),(0,x.jsx)(Se,{w:e*.3,h:3,strong:!0}),(0,x.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,x.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:2,padding:"0 4px",flex:1},children:[Array.from({length:7},(i,s)=>(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:r*.6},children:(0,x.jsx)(Se,{w:r*.5,h:2})},`h${s}`)),Array.from({length:7*5},(i,s)=>(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:r},children:(0,x.jsx)("div",{style:{width:r*.6,height:r*.6,borderRadius:"50%",background:s===12?"var(--agd-bar)":"transparent",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)("div",{style:{width:2,height:2,borderRadius:1,background:"var(--agd-bar-strong)",opacity:s===12?1:.3}})})},s))]})]})}function Kk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 10px",gap:8},children:[(0,x.jsx)(Po,{size:Math.min(32,t*.55)}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:"50%",h:3,strong:!0}),(0,x.jsx)(Se,{w:"75%",h:2})]}),(0,x.jsx)(Se,{w:30,h:2})]})}function Yk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[(0,x.jsx)("div",{style:{height:"50%",background:"var(--agd-fill)",borderBottom:"1px dashed var(--agd-stroke)"}}),(0,x.jsxs)("div",{style:{flex:1,padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,x.jsx)(Se,{w:"65%",h:4,strong:!0}),(0,x.jsx)(Se,{w:"40%",h:3}),(0,x.jsx)("div",{style:{flex:1}}),(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,x.jsx)(Se,{w:"30%",h:5,strong:!0}),(0,x.jsx)(hn,{w:Math.min(70,e*.3),h:26,radius:4,style:{background:"var(--agd-bar)"}})]})]})]})}function Vk({width:e,height:t}){let n=Math.min(48,t*.3);return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:t*.06},children:[(0,x.jsx)(Po,{size:n}),(0,x.jsx)(Se,{w:e*.45,h:4,strong:!0}),(0,x.jsx)(Se,{w:e*.3,h:2}),(0,x.jsxs)("div",{style:{display:"flex",gap:e*.08,marginTop:t*.04},children:[(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,x.jsx)(Se,{w:20,h:3,strong:!0}),(0,x.jsx)(Se,{w:28,h:2})]}),(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,x.jsx)(Se,{w:20,h:3,strong:!0}),(0,x.jsx)(Se,{w:28,h:2})]}),(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,x.jsx)(Se,{w:20,h:3,strong:!0}),(0,x.jsx)(Se,{w:28,h:2})]})]})]})}function Gk({width:e,height:t}){let n=Math.max(e*.6,80),o=Math.max(3,Math.floor(t/40));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex"},children:[(0,x.jsx)("div",{style:{width:e-n,background:"var(--agd-fill)",opacity:.3}}),(0,x.jsxs)("div",{style:{flex:1,borderLeft:"1px solid var(--agd-stroke)",display:"flex",flexDirection:"column",padding:e*.04},children:[(0,x.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t*.06},children:[(0,x.jsx)(Se,{w:n*.4,h:4,strong:!0}),(0,x.jsx)("div",{style:{width:12,height:12,border:"1px solid var(--agd-stroke)",borderRadius:3}})]}),Array.from({length:o},(r,i)=>(0,x.jsx)("div",{style:{padding:"6px 0"},children:(0,x.jsx)(Se,{w:`${50+i*17%35}%`,h:2,strong:i===0})},i))]})]})}function Xk({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center"},children:[(0,x.jsxs)("div",{style:{flex:1,width:"100%",borderRadius:8,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",padding:10,display:"flex",flexDirection:"column",gap:5},children:[(0,x.jsx)(Se,{w:"70%",h:3,strong:!0}),(0,x.jsx)(Se,{w:"90%",h:2}),(0,x.jsx)(Se,{w:"60%",h:2})]}),(0,x.jsx)("div",{style:{width:10,height:10,background:"var(--agd-fill)",border:"1px dashed var(--agd-stroke)",borderTop:"none",borderLeft:"none",transform:"rotate(45deg)",marginTop:-6}})]})}function Qk({width:e,height:t}){let n=Math.min(t*.7,e*.3);return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:e*.08},children:[(0,x.jsx)(hn,{w:n,h:n,radius:n*.25}),(0,x.jsx)(Se,{w:e*.45,h:Math.max(4,t*.2),strong:!0})]})}function Jk({width:e,height:t}){let n=Math.max(2,Math.min(5,Math.floor(t/56)));return(0,x.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{borderBottom:"1px solid var(--agd-stroke)",padding:"8px 6px",display:"flex",alignItems:"center",justifyContent:"space-between",flex:r===0?2:1},children:[(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:6},children:[(0,x.jsx)("span",{style:{fontSize:9,fontWeight:700,color:"var(--agd-stroke)"},children:"Q"}),(0,x.jsx)(Se,{w:e*(.3+r*13%25/100),h:3,strong:!0})]}),(0,x.jsx)("span",{style:{fontSize:8,color:"var(--agd-stroke)"},children:r===0?"\u25BC":"\u25B6"})]},r))})}function Zk({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120))),o=Math.max(1,Math.min(3,Math.floor(t/120)));return(0,x.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${n}, 1fr)`,gridTemplateRows:`repeat(${o}, 1fr)`,gap:4,height:"100%"},children:Array.from({length:n*o},(r,i)=>(0,x.jsx)("div",{style:{borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",position:"relative",overflow:"hidden"},children:(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:"0 0 100 100",preserveAspectRatio:"none",fill:"none",children:[(0,x.jsx)("line",{x1:"0",y1:"0",x2:"100",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"}),(0,x.jsx)("line",{x1:"100",y1:"0",x2:"0",y2:"100",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})},i))})}function e3({width:e,height:t}){let n=Math.min(e,t);return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("rect",{x:"1",y:(t-n+2)/2,width:n-2,height:n-2,rx:n*.15,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,x.jsx)("path",{d:`M${n*.25} ${t/2}l${n*.2} ${n*.2} ${n*.3}-${n*.35}`,stroke:"var(--agd-bar)",strokeWidth:"1.5",fill:"none",strokeLinecap:"round",strokeLinejoin:"round"})]})}function t3({width:e,height:t}){let n=Math.min(e,t)/2-1;return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("circle",{cx:e/2,cy:t/2,r:n,stroke:"var(--agd-stroke)",strokeWidth:"1.5"}),(0,x.jsx)("circle",{cx:e/2,cy:t/2,r:n*.45,fill:"var(--agd-bar)"})]})}function n3({width:e,height:t}){let n=Math.max(2,t*.12),o=Math.min(t*.35,10),r=e*.55;return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",alignItems:"center",position:"relative"},children:[(0,x.jsx)("div",{style:{width:"100%",height:n,borderRadius:n/2,background:"var(--agd-fill)",border:"1px solid var(--agd-stroke)",position:"relative"},children:(0,x.jsx)("div",{style:{width:r,height:"100%",borderRadius:n/2,background:"var(--agd-bar)"}})}),(0,x.jsx)("div",{style:{position:"absolute",left:r-o,width:o*2,height:o*2,borderRadius:"50%",border:"1.5px solid var(--agd-stroke)",background:"var(--agd-fill)"}})]})}function o3({width:e,height:t}){let n=Math.min(36,t*.15),o=7,r=4,i=Math.min((e-16)/o,(t-n-40)/(r+1));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsxs)("div",{style:{height:n,borderRadius:4,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:"0 8px",justifyContent:"space-between"},children:[(0,x.jsx)(Se,{w:"40%",h:2}),(0,x.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 16 16",fill:"none",children:[(0,x.jsx)("rect",{x:"2",y:"3",width:"12",height:"11",rx:"1",stroke:"var(--agd-stroke)",strokeWidth:"1"}),(0,x.jsx)("line",{x1:"2",y1:"6",x2:"14",y2:"6",stroke:"var(--agd-stroke)",strokeWidth:"0.5"})]})]}),(0,x.jsxs)("div",{style:{flex:1,borderRadius:6,border:"1px dashed var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",flexDirection:"column"},children:[(0,x.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 6px"},children:[(0,x.jsx)("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"\u2039"}),(0,x.jsx)(Se,{w:e*.25,h:2,strong:!0}),(0,x.jsx)("span",{style:{fontSize:7,color:"var(--agd-stroke)"},children:"\u203A"})]}),(0,x.jsx)("div",{style:{display:"grid",gridTemplateColumns:`repeat(${o}, 1fr)`,gap:1,padding:"0 4px",flex:1},children:Array.from({length:o*r},(s,a)=>(0,x.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",height:i},children:(0,x.jsx)("div",{style:{width:i*.5,height:i*.5,borderRadius:"50%",background:a===10?"var(--agd-bar)":"transparent"},children:(0,x.jsx)("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)("div",{style:{width:1.5,height:1.5,borderRadius:1,background:"var(--agd-bar-strong)",opacity:a===10?1:.25}})})})},a))})]})]})}function r3({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",gap:t*.08,padding:4},children:[(0,x.jsx)("div",{style:{width:"100%",height:t*.2,borderRadius:4,background:"var(--agd-fill)"}}),(0,x.jsx)("div",{style:{width:"70%",height:Math.max(6,t*.1),borderRadius:3,background:"var(--agd-fill)"}}),(0,x.jsx)("div",{style:{width:"90%",height:Math.max(4,t*.06),borderRadius:3,background:"var(--agd-fill)"}}),(0,x.jsx)("div",{style:{width:"50%",height:Math.max(4,t*.06),borderRadius:3,background:"var(--agd-fill)"}})]})}function i3({width:e,height:t}){return(0,x.jsx)("div",{style:{height:"100%",display:"flex",alignItems:"center",gap:6},children:(0,x.jsxs)("div",{style:{height:"100%",flex:1,borderRadius:t/2,border:"1px solid var(--agd-stroke)",background:"var(--agd-fill)",display:"flex",alignItems:"center",padding:`0 ${t*.3}px`,gap:4},children:[(0,x.jsx)(Se,{w:"60%",h:2,strong:!0}),(0,x.jsx)("div",{style:{width:Math.max(6,t*.3),height:Math.max(6,t*.3),borderRadius:"50%",border:"1px solid var(--agd-stroke)",flexShrink:0,marginLeft:"auto"}})]})})}function s3({width:e,height:t}){let n=Math.min(e,t);return(0,x.jsx)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:(0,x.jsx)("path",{d:`M${e/2} ${(t-n)/2+n*.1}l${n*.12} ${n*.25} ${n*.28} ${n*.04}-${n*.2} ${n*.2} ${n*.05} ${n*.28}-${n*.25}-${n*.12}-${n*.25} ${n*.12} ${n*.05}-${n*.28}-${n*.2}-${n*.2} ${n*.28}-${n*.04}z`,stroke:"var(--agd-stroke)",strokeWidth:"1",fill:"var(--agd-fill)"})})}function a3({width:e,height:t}){let n=Math.min(e,t)/2-2;return(0,x.jsxs)("svg",{width:"100%",height:"100%",viewBox:`0 0 ${e} ${t}`,fill:"none",children:[(0,x.jsx)("circle",{cx:e/2,cy:t/2,r:n,stroke:"var(--agd-stroke)",strokeWidth:"1.5",opacity:".2"}),(0,x.jsx)("path",{d:`M${e/2} ${t/2-n}a${n} ${n} 0 0 1 ${n} ${n}`,stroke:"var(--agd-bar-strong)",strokeWidth:"1.5",strokeLinecap:"round"})]})}function l3({width:e,height:t}){let n=Math.min(36,t*.25,e*.12),o=Math.max(1,Math.min(3,Math.floor(t/80)));return(0,x.jsx)("div",{style:{display:"flex",flexDirection:"column",height:"100%",justifyContent:"space-around",padding:8},children:Array.from({length:o},(r,i)=>(0,x.jsxs)("div",{style:{display:"flex",gap:e*.04,alignItems:"flex-start"},children:[(0,x.jsx)(hn,{w:n,h:n,radius:n*.25}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:4},children:[(0,x.jsx)(Se,{w:`${40+i*13%20}%`,h:3,strong:!0}),(0,x.jsx)(Se,{w:`${60+i*17%25}%`,h:2})]})]},i))})}function c3({width:e,height:t}){let n=Math.max(2,Math.min(4,Math.floor(e/120))),o=Math.min(36,t*.25);return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:t*.06,padding:t*.06},children:[(0,x.jsx)(Se,{w:e*.3,h:4,strong:!0}),(0,x.jsx)("div",{style:{display:"flex",gap:e*.06,justifyContent:"center",flex:1,alignItems:"center"},children:Array.from({length:n},(r,i)=>(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:6},children:[(0,x.jsx)(Po,{size:o}),(0,x.jsx)(Se,{w:e*.12,h:3,strong:!0}),(0,x.jsx)(Se,{w:e*.08,h:2})]},i))})]})}function d3({width:e,height:t}){let n=Math.max(2,Math.min(3,Math.floor(t/80)));return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",padding:e*.06,gap:t*.04},children:[(0,x.jsx)(Se,{w:e*.5,h:Math.max(5,t*.04),strong:!0}),(0,x.jsx)(Se,{w:e*.35,h:2}),(0,x.jsx)("div",{style:{width:"100%",display:"flex",flexDirection:"column",gap:t*.03,marginTop:t*.04},children:Array.from({length:n},(o,r)=>(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:Math.min(60,e*.2),h:2}),(0,x.jsx)(hn,{w:"100%",h:Math.min(32,t*.1),radius:4})]},r))}),(0,x.jsx)(hn,{w:"100%",h:Math.min(36,t*.12),radius:6,style:{marginTop:t*.03,background:"var(--agd-bar)"}}),(0,x.jsx)(Se,{w:e*.4,h:2})]})}function u3({width:e,height:t}){return(0,x.jsxs)("div",{style:{height:"100%",display:"flex",flexDirection:"column",padding:e*.04,gap:t*.03},children:[(0,x.jsx)(Se,{w:e*.4,h:4,strong:!0}),(0,x.jsx)(Se,{w:e*.6,h:2}),(0,x.jsxs)("div",{style:{display:"flex",gap:6,marginTop:t*.03},children:[(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:50,h:2}),(0,x.jsx)(hn,{w:"100%",h:Math.min(28,t*.1),radius:4})]}),(0,x.jsxs)("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:40,h:2}),(0,x.jsx)(hn,{w:"100%",h:Math.min(28,t*.1),radius:4})]})]}),(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3},children:[(0,x.jsx)(Se,{w:50,h:2}),(0,x.jsx)(hn,{w:"100%",h:Math.min(28,t*.1),radius:4})]}),(0,x.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:3,flex:1},children:[(0,x.jsx)(Se,{w:60,h:2}),(0,x.jsx)(hn,{w:"100%",h:"100%",radius:4})]}),(0,x.jsx)(hn,{w:Math.min(120,e*.3),h:Math.min(30,t*.1),radius:6,style:{alignSelf:"flex-end",background:"var(--agd-bar)"}})]})}var p3={navigation:ek,hero:tk,sidebar:nk,footer:ok,modal:rk,card:ik,text:sk,image:ak,table:lk,list:ck,button:dk,input:uk,form:pk,tabs:fk,avatar:hk,badge:mk,header:gk,section:_k,grid:yk,dropdown:xk,toggle:wk,search:vk,toast:bk,progress:kk,chart:Sk,video:Ck,tooltip:Ek,breadcrumb:Tk,pagination:Mk,divider:Nk,accordion:Ik,carousel:Ak,pricing:Lk,testimonial:$k,cta:Rk,alert:Ok,banner:Pk,stat:Dk,stepper:zk,tag:Fk,rating:Bk,map:Wk,timeline:Hk,fileUpload:jk,codeBlock:Uk,calendar:qk,notification:Kk,productCard:Yk,profile:Vk,drawer:Gk,popover:Xk,logo:Qk,faq:Jk,gallery:Zk,checkbox:e3,radio:t3,slider:n3,datePicker:o3,skeleton:r3,chip:i3,icon:s3,spinner:a3,feature:l3,team:c3,login:d3,contact:u3};function f3({type:e,width:t,height:n,text:o}){let r=p3[e];return r?(0,x.jsx)("div",{style:{width:"100%",height:"100%",padding:8,position:"relative",pointerEvents:"none"},children:(0,x.jsx)(r,{width:t,height:n,text:o})}):(0,x.jsx)("div",{style:{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,x.jsx)("span",{style:{fontSize:10,fontWeight:600,color:"var(--agd-text-3)",textTransform:"uppercase",letterSpacing:"0.06em",opacity:.5},children:e})})}var h3=`svg[fill=none] {
  fill: none !important;
}

.styles-module__overlayExiting___iEmYr {
  opacity: 0 !important;
  transition: opacity 0.25s ease !important;
  pointer-events: none !important;
}

.styles-module__overlay___aWh-q {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: auto;
  cursor: default;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
  --agd-stroke: rgba(59, 130, 246, 0.35);
  --agd-fill: rgba(59, 130, 246, 0.06);
  --agd-bar: rgba(59, 130, 246, 0.18);
  --agd-bar-strong: rgba(59, 130, 246, 0.28);
  --agd-text-3: rgba(255, 255, 255, 0.6);
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q.styles-module__light___ORIft {
  --agd-surface: #fff;
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) {
  --agd-surface: #141414;
}
.styles-module__overlay___aWh-q.styles-module__wireframe___itvQU {
  --agd-stroke: rgba(249, 115, 22, 0.35);
  --agd-fill: rgba(249, 115, 22, 0.06);
  --agd-bar: rgba(249, 115, 22, 0.18);
  --agd-bar-strong: rgba(249, 115, 22, 0.28);
}
.styles-module__overlay___aWh-q.styles-module__placing___45yD8 {
  cursor: crosshair;
}
.styles-module__overlay___aWh-q.styles-module__passthrough___xaFeE {
  pointer-events: none;
}

.styles-module__blankCanvas___t2Eue {
  position: fixed;
  inset: 0;
  z-index: 99994;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__visible___OKKqX {
  opacity: var(--canvas-opacity, 1);
  pointer-events: auto;
}
.styles-module__blankCanvas___t2Eue::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 12px 12px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.styles-module__blankCanvas___t2Eue.styles-module__gridActive___OZ-cf::after {
  opacity: 1;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.22) 1px, transparent 1px);
}

.styles-module__paletteHeader___-Q5gQ {
  padding: 0 1rem 0.375rem;
}

.styles-module__paletteHeaderTitle___oHqZC {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: -0.0094em;
}
.styles-module__light___ORIft .styles-module__paletteHeaderTitle___oHqZC {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__paletteHeaderDesc___6i74T {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 2px;
  line-height: 14px;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T {
  color: rgba(0, 0, 0, 0.45);
}
.styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__paletteHeaderDesc___6i74T a:hover {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
.styles-module__light___ORIft .styles-module__paletteHeaderDesc___6i74T a:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__wireframePurposeWrap___To-tS {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s ease, opacity 0.15s ease;
  opacity: 1;
}
.styles-module__wireframePurposeWrap___To-tS.styles-module__collapsed___Ms9vS {
  grid-template-rows: 0fr;
  opacity: 0;
}

.styles-module__wireframePurposeInner___Lrahs {
  overflow: hidden;
}

.styles-module__wireframePurposeInput___7EtBN {
  display: block;
  width: calc(100% - 2rem);
  margin: 0.25rem 1rem 0.375rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.8125rem;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
.styles-module__light___ORIft .styles-module__wireframePurposeInput___7EtBN:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__canvasToggle___-QqSy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin: 0.25rem 1rem 0.25rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.styles-module__canvasToggle___-QqSy:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
}
.styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy {
  border-color: rgba(0, 0, 0, 0.08);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy:hover {
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.12);
}
.styles-module__light___ORIft .styles-module__canvasToggle___-QqSy.styles-module__active___hosp7 {
  background: #f97316;
  border-color: transparent;
  border-style: solid;
  box-shadow: none;
}

.styles-module__canvasToggleIcon___7pJ82 {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.35);
}
.styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}
.styles-module__light___ORIft .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(0, 0, 0, 0.25);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleIcon___7pJ82 {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__canvasToggleLabel___OanpY {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: -0.0094em;
}
.styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}
.styles-module__light___ORIft .styles-module__canvasToggleLabel___OanpY {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__canvasToggleLabel___OanpY {
  color: #fff;
}

.styles-module__canvasPurposeWrap___hj6zk {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.2s ease, opacity 0.15s ease;
  opacity: 1;
}
.styles-module__canvasPurposeWrap___hj6zk.styles-module__collapsed___Ms9vS {
  grid-template-rows: 0fr;
  opacity: 0;
}

.styles-module__canvasPurposeInner___VWiyu {
  overflow: hidden;
}

.styles-module__canvasPurposeToggle___byDH2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin: 0.375rem 1rem 0.375rem 1.1875rem;
}
.styles-module__canvasPurposeToggle___byDH2 input[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.styles-module__canvasPurposeCheck___xqd7l {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.25s ease, border-color 0.25s ease;
}
.styles-module__canvasPurposeCheck___xqd7l svg {
  color: #1D1A2F;
  opacity: 1;
  transition: opacity 0.15s ease;
}
.styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgb(255, 255, 255);
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l {
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #fff;
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH {
  border-color: #1D1A2F;
  background: #1D1A2F;
}
.styles-module__light___ORIft .styles-module__canvasPurposeCheck___xqd7l.styles-module__checked___-1JGH svg {
  color: #fff;
}

.styles-module__canvasPurposeLabel___Zu-tD {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.styles-module__light___ORIft .styles-module__canvasPurposeLabel___Zu-tD {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__canvasPurposeHelp___jijwR {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}
.styles-module__canvasPurposeHelp___jijwR svg {
  color: rgba(255, 255, 255, 0.2);
  transform: translateY(2px);
  transition: color 0.15s ease;
}
.styles-module__canvasPurposeHelp___jijwR:hover svg {
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__light___ORIft .styles-module__canvasPurposeHelp___jijwR svg {
  color: rgba(0, 0, 0, 0.2);
}
.styles-module__light___ORIft .styles-module__canvasPurposeHelp___jijwR:hover svg {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__placement___zcxv8 {
  position: absolute;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.08);
  cursor: grab;
  transition: box-shadow 0.15s, border-color 0.15s, opacity 0.15s ease, transform 0.15s ease;
  user-select: none;
  pointer-events: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  animation: styles-module__placementEnter___TdRhf 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.styles-module__placement___zcxv8:active {
  cursor: grabbing;
}
.styles-module__placement___zcxv8:hover {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #3c82f7;
  border-style: solid;
  background: rgba(59, 130, 246, 0.1);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8 {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.08);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8:hover {
  border-color: rgba(249, 115, 22, 0.5);
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.12);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__wireframe___itvQU .styles-module__placement___zcxv8.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15), 0 2px 8px rgba(249, 115, 22, 0.15);
}
.styles-module__placement___zcxv8.styles-module__dragging___le6KZ {
  opacity: 0.85;
  z-index: 50;
}
.styles-module__placement___zcxv8.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__placementContent___f64A4 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.styles-module__placementLabel___0KvWl {
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 10px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.7);
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 255, 255, 0.5);
}
.styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__placementLabel___0KvWl {
  color: rgba(249, 115, 22, 0.7);
}
.styles-module__wireframe___itvQU .styles-module__selected___6yrp6 .styles-module__placementLabel___0KvWl {
  color: #f97316;
}

.styles-module__placementAnnotation___78pTr {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(0, 0, 0, 0.5);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__placementAnnotation___78pTr.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__sectionAnnotation___aUIs0 {
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  font-weight: 450;
  color: rgba(59, 130, 246, 0.6);
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.6);
  opacity: 0;
  transform: translateY(-2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.styles-module__sectionAnnotation___aUIs0.styles-module__annotationVisible___mrUyA {
  opacity: 1;
  transform: translateY(0);
}

.styles-module__handle___Ikbxm {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #fff;
  border: 1.5px solid #3c82f7;
  border-radius: 2px;
  z-index: 12;
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: scale(0.3);
  pointer-events: none;
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.styles-module__placement___zcxv8:hover .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:hover .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:hover .styles-module__handle___Ikbxm, .styles-module__placement___zcxv8:active .styles-module__handle___Ikbxm, .styles-module__sectionOutline___s0hy-:active .styles-module__handle___Ikbxm, .styles-module__ghostOutline___po-kO:active .styles-module__handle___Ikbxm, .styles-module__selected___6yrp6 .styles-module__handle___Ikbxm {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__sectionOutline___s0hy- .styles-module__handle___Ikbxm {
  border-color: inherit;
}
.styles-module__wireframe___itvQU .styles-module__handle___Ikbxm {
  border-color: #f97316;
}

.styles-module__handleNw___4TMIj {
  top: -4px;
  left: -4px;
  cursor: nw-resize;
}

.styles-module__handleNe___mnsTh {
  top: -4px;
  right: -4px;
  cursor: ne-resize;
}

.styles-module__handleSe___oSFnk {
  bottom: -4px;
  right: -4px;
  cursor: se-resize;
}

.styles-module__handleSw___pi--Z {
  bottom: -4px;
  left: -4px;
  cursor: sw-resize;
}

.styles-module__handleN___aBA-Q, .styles-module__handleE___0hM5u, .styles-module__handleS___JjDRv, .styles-module__handleW___ERWGQ {
  opacity: 0 !important;
  pointer-events: none !important;
}

.styles-module__edgeHandle___XxXdT {
  position: absolute;
  z-index: 11;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__edgeHandle___XxXdT::after {
  content: "";
  position: absolute;
  border-radius: 4px;
  background: #3c82f7;
}
.styles-module__wireframe___itvQU .styles-module__edgeHandle___XxXdT::after {
  background: #f97316;
}
.styles-module__edgeHandle___XxXdT::after {
  opacity: 0;
  transition: opacity 0.1s ease, transform 0.1s ease;
  transform: scale(0.8);
}
.styles-module__edgeHandle___XxXdT:hover::after {
  opacity: 0.85;
  transform: scale(1);
}
.styles-module__edgeHandle___XxXdT svg {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.1s ease;
  filter: drop-shadow(0 0 2px var(--agd-surface));
}
.styles-module__edgeHandle___XxXdT:hover svg {
  opacity: 1;
}

.styles-module__edgeN___-JJDj, .styles-module__edgeS___66lMX {
  left: 12px;
  right: 12px;
  height: 12px;
  cursor: n-resize;
}
.styles-module__edgeN___-JJDj::after, .styles-module__edgeS___66lMX::after {
  width: 24px;
  height: 4px;
}

.styles-module__edgeN___-JJDj {
  top: -6px;
}

.styles-module__edgeS___66lMX {
  bottom: -6px;
  cursor: s-resize;
}

.styles-module__edgeE___1bGDa, .styles-module__edgeW___lHQNo {
  top: 12px;
  bottom: 12px;
  width: 12px;
  cursor: e-resize;
}
.styles-module__edgeE___1bGDa::after, .styles-module__edgeW___lHQNo::after {
  width: 4px;
  height: 24px;
}

.styles-module__edgeE___1bGDa {
  right: -6px;
}

.styles-module__edgeW___lHQNo {
  left: -6px;
  cursor: w-resize;
}

.styles-module__deleteButton___LkGCb {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  line-height: 1;
  z-index: 15;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.8);
  will-change: opacity, transform;
  transition: opacity 0.2s ease-out, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.12s ease, color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}
.styles-module__placement___zcxv8:hover .styles-module__deleteButton___LkGCb, .styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-:hover .styles-module__deleteButton___LkGCb, .styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO:hover .styles-module__deleteButton___LkGCb, .styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 .styles-module__deleteButton___LkGCb {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
}
.styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb {
  background: rgba(40, 40, 40, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.styles-module__overlay___aWh-q:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover, .styles-module__rearrangeOverlay___-3R3t:not(.styles-module__light___ORIft) .styles-module__deleteButton___LkGCb:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.styles-module__drawBox___BrVAa {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 2px solid #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.15);
}

.styles-module__selectBox___Iu8kB {
  position: fixed;
  pointer-events: none;
  z-index: 99996;
  border: 1px dashed #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 2px;
}

.styles-module__sizeIndicator___7zJ4y {
  position: fixed;
  pointer-events: none;
  z-index: 100001;
  font-size: 10px;
  color: #fff;
  background: #3c82f7;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 500;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.styles-module__guideLine___DUQY2 {
  pointer-events: none;
  z-index: 100001;
  background: #f0f;
  opacity: 0.5;
}

.styles-module__dragPreview___onPbU {
  position: fixed;
  z-index: 100002;
  pointer-events: none;
  border: 1.5px dashed #3c82f7;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 600;
  color: #3c82f7;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transition: width 0.08s ease, height 0.08s ease, opacity 0.08s ease;
}

.styles-module__dragPreviewWireframe___jsg0G {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.styles-module__palette___C7iSH {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  width: 256px;
  overflow: hidden;
  background: #1D1A2F;
  border: none;
  border-radius: 1rem;
  padding: 13px 0 16px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  z-index: 100001;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  cursor: default;
  opacity: 0;
  filter: blur(5px);
}
.styles-module__palette___C7iSH .styles-module__paletteItem___6TlnA,
.styles-module__palette___C7iSH .styles-module__paletteItemLabel___6ncO4,
.styles-module__palette___C7iSH .styles-module__paletteSectionTitle___PqnjX,
.styles-module__palette___C7iSH .styles-module__paletteFooter___QYnAG {
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__palette___C7iSH.styles-module__enter___6LYk5 {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__palette___C7iSH.styles-module__exit___iSGRw {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
.styles-module__palette___C7iSH.styles-module__light___ORIft {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.styles-module__paletteSection___V8DEA {
  padding: 0 1rem;
}
.styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteSection___V8DEA + .styles-module__paletteSection___V8DEA {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteSectionTitle___PqnjX {
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  padding: 0 0 3px 3px;
}
.styles-module__light___ORIft .styles-module__paletteSectionTitle___PqnjX {
  color: rgba(0, 0, 0, 0.4);
}

.styles-module__paletteItem___6TlnA {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.25rem;
  margin-bottom: 1px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  border: 1px solid transparent;
  user-select: none;
  min-height: 24px;
}
.styles-module__paletteItem___6TlnA:hover {
  background: rgba(255, 255, 255, 0.1);
}
.styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__active___hosp7 {
  background: #3c82f7;
  border-color: transparent;
}
.styles-module__light___ORIft .styles-module__paletteItem___6TlnA.styles-module__wireframe___itvQU.styles-module__active___hosp7 {
  background: #f97316;
}

.styles-module__paletteItemIcon___0NPQK {
  width: 20px;
  height: 16px;
  border-radius: 2px;
  border: 1px dashed rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.45);
}
.styles-module__paletteItemIcon___0NPQK svg {
  display: block;
  width: 20px;
  height: 16px;
}
.styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.styles-module__light___ORIft .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  color: rgba(0, 0, 0, 0.4);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemIcon___0NPQK {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__paletteItemLabel___6ncO4 {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: -0.0094em;
  line-height: 1;
  min-width: 0;
}
.styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}
.styles-module__light___ORIft .styles-module__paletteItemLabel___6ncO4 {
  color: rgba(0, 0, 0, 0.7);
}
.styles-module__light___ORIft .styles-module__active___hosp7 .styles-module__paletteItemLabel___6ncO4 {
  color: #fff;
  font-weight: 600;
}

.styles-module__placeScroll___7sClM {
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 0.25rem;
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px);
}
.styles-module__placeScroll___7sClM.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM.styles-module__fadeTop___KT9tF.styles-module__fadeBottom___x3ShT {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%);
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar {
  width: 3px;
}
.styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}
.styles-module__light___ORIft .styles-module__placeScroll___7sClM::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

.styles-module__paletteFooterWrap___71-fI {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__paletteFooterWrap___71-fI.styles-module__footerHidden___fJUik {
  grid-template-rows: 0fr;
}

.styles-module__paletteFooterInnerContent___VC26h {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__footerHidden___fJUik .styles-module__paletteFooterInnerContent___VC26h {
  opacity: 0;
  transform: translateY(4px);
}

.styles-module__paletteFooterInner___dfylY {
  overflow: hidden;
}

.styles-module__paletteFooter___QYnAG {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  padding: 0 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__light___ORIft .styles-module__paletteFooter___QYnAG {
  border-top-color: rgba(0, 0, 0, 0.07);
}

.styles-module__paletteFooterCount___D3Fia {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterCount___D3Fia {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__paletteFooterClear___ybBoa {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s ease;
}
.styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa {
  color: rgba(0, 0, 0, 0.5);
}
.styles-module__light___ORIft .styles-module__paletteFooterClear___ybBoa:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__paletteFooterActions___fLzv8 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.styles-module__rollingWrap___S75jM {
  display: inline-block;
  overflow: hidden;
  height: 1.15em;
  position: relative;
  vertical-align: bottom;
}

.styles-module__rollingNum___1RKDx {
  position: absolute;
  left: 0;
  top: 0;
}

.styles-module__exitUp___AFDRW {
  animation: styles-module__numExitUp___FRQqx 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterUp___CPlXb {
  animation: styles-module__numEnterUp___2Yd-w 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__exitDown___-1yAy {
  animation: styles-module__numExitDown___xm5by 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

.styles-module__enterDown___DDuFR {
  animation: styles-module__numEnterDown___hpxBk 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
}

@keyframes styles-module__numExitUp___FRQqx {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterUp___2Yd-w {
  from {
    transform: translateY(110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes styles-module__numExitDown___xm5by {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(110%);
    opacity: 0;
  }
}
@keyframes styles-module__numEnterDown___hpxBk {
  from {
    transform: translateY(-110%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.styles-module__rearrangeOverlay___-3R3t {
  position: fixed;
  inset: 0;
  z-index: 99995;
  pointer-events: none;
  cursor: default;
  user-select: none;
  animation: styles-module__overlayFadeIn___aECVy 0.15s ease;
}

.styles-module__hoverHighlight___8eT-v {
  position: fixed;
  pointer-events: none;
  z-index: 99994;
  border: 2px dashed rgba(59, 130, 246, 0.5);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.06);
  animation: styles-module__highlightFadeIn___Lg7KY 0.12s ease;
}

.styles-module__sectionOutline___s0hy- {
  position: fixed;
  border: 2px solid;
  border-radius: 4px;
  cursor: grab;
}
.styles-module__sectionOutline___s0hy-:active {
  cursor: grabbing;
}
.styles-module__sectionOutline___s0hy- {
  transition: box-shadow 0.15s, border-color 0.3s, background-color 0.3s, border-style 0s;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}
.styles-module__sectionOutline___s0hy-:hover {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6 {
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__selected___6yrp6:hover {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) {
  border: 1.5px dashed rgba(150, 150, 150, 0.35);
  background-color: transparent !important;
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover {
  border-color: rgba(150, 150, 150, 0.6);
  box-shadow: none;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionLabel___F80HQ {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionLabel___F80HQ {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__movedBadge___s8z-q,
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6) .styles-module__sectionDimensions___RcJSL {
  opacity: 0;
  transition: opacity 0.15s ease;
}
.styles-module__sectionOutline___s0hy-.styles-module__settled___b5U5o:not(.styles-module__selected___6yrp6):hover .styles-module__sectionDimensions___RcJSL {
  opacity: 1;
}
.styles-module__sectionOutline___s0hy-.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__sectionLabel___F80HQ {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  max-width: calc(100% - 8px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__movedBadge___s8z-q {
  position: absolute;
  bottom: 22px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: #22c55e;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.styles-module__movedBadge___s8z-q.styles-module__badgeVisible___npbdS {
  opacity: 1;
  transform: scale(1);
  transition: opacity 0.2s cubic-bezier(0.34, 1.2, 0.64, 1), transform 0.2s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.styles-module__resizedBadge___u51V8 {
  background: #3c82f7;
  bottom: 40px;
}

.styles-module__sectionDimensions___RcJSL {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.styles-module__light___ORIft .styles-module__sectionDimensions___RcJSL {
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.7);
}

.styles-module__wireframeNotice___4GJyB {
  position: fixed;
  bottom: 16px;
  left: 24px;
  z-index: 99995;
  font-size: 9.5px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.4);
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: auto;
  animation: styles-module__overlayFadeIn___aECVy 0.3s ease;
  line-height: 1.5;
  max-width: 280px;
}

.styles-module__wireframeOpacityRow___CJXzi {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.styles-module__wireframeOpacityLabel___afkfT {
  font-size: 9px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.32);
  letter-spacing: 0.02em;
  white-space: nowrap;
  user-select: none;
}

.styles-module__wireframeOpacitySlider___YcoEs {
  -webkit-appearance: none;
  appearance: none;
  width: 56px;
  height: 4px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs:hover {
  background: rgba(0, 0, 0, 0.13);
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  cursor: pointer;
  transition: background 0.15s ease;
}
.styles-module__wireframeOpacitySlider___YcoEs::-webkit-slider-thumb:hover {
  background: rgb(224.4209205021, 95.3548117155, 5.7790794979);
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #f97316;
  border: none;
  cursor: pointer;
}
.styles-module__wireframeOpacitySlider___YcoEs::-moz-range-track {
  background: rgba(0, 0, 0, 0.08);
  height: 4px;
  border-radius: 2px;
}

.styles-module__wireframeNoticeTitleRow___PJqyG {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 2px;
}

.styles-module__wireframeNoticeTitle___okr08 {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.55);
}

.styles-module__wireframeNoticeDivider___PNKQ6 {
  width: 1px;
  height: 8px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 8px;
  flex-shrink: 0;
}

.styles-module__wireframeStartOver___YFk-I {
  font-size: 9.5px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  text-decoration: none;
  transition: color 0.12s ease;
  white-space: nowrap;
}
.styles-module__wireframeStartOver___YFk-I:hover {
  color: rgba(0, 0, 0, 0.6);
}

.styles-module__ghostOutline___po-kO {
  position: fixed;
  border: 1.5px dashed rgba(59, 130, 246, 0.4);
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.04);
  cursor: grab;
  opacity: 0.5;
  user-select: none;
  pointer-events: auto;
  animation: styles-module__ghostEnter___EC3Mb 0.25s ease;
  transition: box-shadow 0.15s, border-color 0.3s, opacity 0.25s;
}
.styles-module__ghostOutline___po-kO:active {
  cursor: grabbing;
}
.styles-module__ghostOutline___po-kO:hover {
  opacity: 0.7;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
}
.styles-module__ghostOutline___po-kO.styles-module__selected___6yrp6 {
  opacity: 1;
  border-style: solid;
  border-width: 2px;
  border-color: #3c82f7;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.15);
}
.styles-module__ghostOutline___po-kO.styles-module__exiting___YrM8F {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  animation: none;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.styles-module__ghostBadge___tsQUK {
  position: absolute;
  bottom: calc(100% + 4px);
  left: -1px;
  font-size: 9px;
  font-weight: 600;
  color: rgba(59, 130, 246, 0.9);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 1px 5px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: 0.02em;
  line-height: 1.2;
  animation: styles-module__badgeSlideIn___typJ7 0.2s ease both;
}

@keyframes styles-module__badgeSlideIn___typJ7 {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__ghostBadgeExtra___6CVoD {
  display: inline;
  animation: styles-module__badgeExtraIn___i4W8F 0.2s ease both;
}

@keyframes styles-module__badgeExtraIn___i4W8F {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.styles-module__originalOutline___Y6DD1 {
  position: fixed;
  border: 1.5px dashed rgba(150, 150, 150, 0.3);
  border-radius: 4px;
  background: transparent;
  pointer-events: none;
  user-select: none;
  animation: styles-module__sectionEnter___-8BXT 0.2s ease;
}

.styles-module__originalLabel___HqI9g {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 9px;
  font-weight: 500;
  color: rgba(150, 150, 150, 0.5);
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: rgba(150, 150, 150, 0.08);
}

.styles-module__connectorSvg___Lovld {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__connectorLine___XeWh- {
  transition: opacity 0.2s ease;
  animation: styles-module__connectorDraw___8sK5I 0.3s ease both;
}

.styles-module__connectorDot___yvf7C {
  transform-box: fill-box;
  transform-origin: center;
  animation: styles-module__connectorDotIn___NwTUq 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
}

@keyframes styles-module__connectorDraw___8sK5I {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__connectorDotIn___NwTUq {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.styles-module__connectorExiting___2lLOs {
  animation: styles-module__connectorOut___5QoPl 0.2s ease forwards;
}
.styles-module__connectorExiting___2lLOs .styles-module__connectorDot___yvf7C {
  animation: styles-module__connectorDotOut___FEq7e 0.2s ease forwards;
}

@keyframes styles-module__connectorOut___5QoPl {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__connectorDotOut___FEq7e {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0);
    opacity: 0;
  }
}
@keyframes styles-module__placementEnter___TdRhf {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__sectionEnter___-8BXT {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__highlightFadeIn___Lg7KY {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__overlayFadeIn___aECVy {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__ghostEnter___EC3Mb {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 0.6;
    transform: scale(1);
  }
}`,m3={overlayExiting:"styles-module__overlayExiting___iEmYr",overlay:"styles-module__overlay___aWh-q",overlayFadeIn:"styles-module__overlayFadeIn___aECVy",light:"styles-module__light___ORIft",wireframe:"styles-module__wireframe___itvQU",placing:"styles-module__placing___45yD8",passthrough:"styles-module__passthrough___xaFeE",blankCanvas:"styles-module__blankCanvas___t2Eue",visible:"styles-module__visible___OKKqX",gridActive:"styles-module__gridActive___OZ-cf",paletteHeader:"styles-module__paletteHeader___-Q5gQ",paletteHeaderTitle:"styles-module__paletteHeaderTitle___oHqZC",paletteHeaderDesc:"styles-module__paletteHeaderDesc___6i74T",wireframePurposeWrap:"styles-module__wireframePurposeWrap___To-tS",collapsed:"styles-module__collapsed___Ms9vS",wireframePurposeInner:"styles-module__wireframePurposeInner___Lrahs",wireframePurposeInput:"styles-module__wireframePurposeInput___7EtBN",canvasToggle:"styles-module__canvasToggle___-QqSy",active:"styles-module__active___hosp7",canvasToggleIcon:"styles-module__canvasToggleIcon___7pJ82",canvasToggleLabel:"styles-module__canvasToggleLabel___OanpY",canvasPurposeWrap:"styles-module__canvasPurposeWrap___hj6zk",canvasPurposeInner:"styles-module__canvasPurposeInner___VWiyu",canvasPurposeToggle:"styles-module__canvasPurposeToggle___byDH2",canvasPurposeCheck:"styles-module__canvasPurposeCheck___xqd7l",checked:"styles-module__checked___-1JGH",canvasPurposeLabel:"styles-module__canvasPurposeLabel___Zu-tD",canvasPurposeHelp:"styles-module__canvasPurposeHelp___jijwR",placement:"styles-module__placement___zcxv8",placementEnter:"styles-module__placementEnter___TdRhf",selected:"styles-module__selected___6yrp6",dragging:"styles-module__dragging___le6KZ",exiting:"styles-module__exiting___YrM8F",placementContent:"styles-module__placementContent___f64A4",placementLabel:"styles-module__placementLabel___0KvWl",placementAnnotation:"styles-module__placementAnnotation___78pTr",annotationVisible:"styles-module__annotationVisible___mrUyA",sectionAnnotation:"styles-module__sectionAnnotation___aUIs0",handle:"styles-module__handle___Ikbxm",sectionOutline:"styles-module__sectionOutline___s0hy-",ghostOutline:"styles-module__ghostOutline___po-kO",handleNw:"styles-module__handleNw___4TMIj",handleNe:"styles-module__handleNe___mnsTh",handleSe:"styles-module__handleSe___oSFnk",handleSw:"styles-module__handleSw___pi--Z",handleN:"styles-module__handleN___aBA-Q",handleE:"styles-module__handleE___0hM5u",handleS:"styles-module__handleS___JjDRv",handleW:"styles-module__handleW___ERWGQ",edgeHandle:"styles-module__edgeHandle___XxXdT",edgeN:"styles-module__edgeN___-JJDj",edgeS:"styles-module__edgeS___66lMX",edgeE:"styles-module__edgeE___1bGDa",edgeW:"styles-module__edgeW___lHQNo",deleteButton:"styles-module__deleteButton___LkGCb",rearrangeOverlay:"styles-module__rearrangeOverlay___-3R3t",drawBox:"styles-module__drawBox___BrVAa",selectBox:"styles-module__selectBox___Iu8kB",sizeIndicator:"styles-module__sizeIndicator___7zJ4y",guideLine:"styles-module__guideLine___DUQY2",dragPreview:"styles-module__dragPreview___onPbU",dragPreviewWireframe:"styles-module__dragPreviewWireframe___jsg0G",palette:"styles-module__palette___C7iSH",paletteItem:"styles-module__paletteItem___6TlnA",paletteItemLabel:"styles-module__paletteItemLabel___6ncO4",paletteSectionTitle:"styles-module__paletteSectionTitle___PqnjX",paletteFooter:"styles-module__paletteFooter___QYnAG",enter:"styles-module__enter___6LYk5",exit:"styles-module__exit___iSGRw",paletteSection:"styles-module__paletteSection___V8DEA",paletteItemIcon:"styles-module__paletteItemIcon___0NPQK",placeScroll:"styles-module__placeScroll___7sClM",fadeTop:"styles-module__fadeTop___KT9tF",fadeBottom:"styles-module__fadeBottom___x3ShT",paletteFooterWrap:"styles-module__paletteFooterWrap___71-fI",footerHidden:"styles-module__footerHidden___fJUik",paletteFooterInnerContent:"styles-module__paletteFooterInnerContent___VC26h",paletteFooterInner:"styles-module__paletteFooterInner___dfylY",paletteFooterCount:"styles-module__paletteFooterCount___D3Fia",paletteFooterClear:"styles-module__paletteFooterClear___ybBoa",paletteFooterActions:"styles-module__paletteFooterActions___fLzv8",rollingWrap:"styles-module__rollingWrap___S75jM",rollingNum:"styles-module__rollingNum___1RKDx",exitUp:"styles-module__exitUp___AFDRW",numExitUp:"styles-module__numExitUp___FRQqx",enterUp:"styles-module__enterUp___CPlXb",numEnterUp:"styles-module__numEnterUp___2Yd-w",exitDown:"styles-module__exitDown___-1yAy",numExitDown:"styles-module__numExitDown___xm5by",enterDown:"styles-module__enterDown___DDuFR",numEnterDown:"styles-module__numEnterDown___hpxBk",hoverHighlight:"styles-module__hoverHighlight___8eT-v",highlightFadeIn:"styles-module__highlightFadeIn___Lg7KY",sectionEnter:"styles-module__sectionEnter___-8BXT",settled:"styles-module__settled___b5U5o",sectionLabel:"styles-module__sectionLabel___F80HQ",movedBadge:"styles-module__movedBadge___s8z-q",sectionDimensions:"styles-module__sectionDimensions___RcJSL",badgeVisible:"styles-module__badgeVisible___npbdS",resizedBadge:"styles-module__resizedBadge___u51V8",wireframeNotice:"styles-module__wireframeNotice___4GJyB",wireframeOpacityRow:"styles-module__wireframeOpacityRow___CJXzi",wireframeOpacityLabel:"styles-module__wireframeOpacityLabel___afkfT",wireframeOpacitySlider:"styles-module__wireframeOpacitySlider___YcoEs",wireframeNoticeTitleRow:"styles-module__wireframeNoticeTitleRow___PJqyG",wireframeNoticeTitle:"styles-module__wireframeNoticeTitle___okr08",wireframeNoticeDivider:"styles-module__wireframeNoticeDivider___PNKQ6",wireframeStartOver:"styles-module__wireframeStartOver___YFk-I",ghostEnter:"styles-module__ghostEnter___EC3Mb",ghostBadge:"styles-module__ghostBadge___tsQUK",badgeSlideIn:"styles-module__badgeSlideIn___typJ7",ghostBadgeExtra:"styles-module__ghostBadgeExtra___6CVoD",badgeExtraIn:"styles-module__badgeExtraIn___i4W8F",originalOutline:"styles-module__originalOutline___Y6DD1",originalLabel:"styles-module__originalLabel___HqI9g",connectorSvg:"styles-module__connectorSvg___Lovld",connectorLine:"styles-module__connectorLine___XeWh-",connectorDraw:"styles-module__connectorDraw___8sK5I",connectorDot:"styles-module__connectorDot___yvf7C",connectorDotIn:"styles-module__connectorDotIn___NwTUq",connectorExiting:"styles-module__connectorExiting___2lLOs",connectorOut:"styles-module__connectorOut___5QoPl",connectorDotOut:"styles-module__connectorDotOut___FEq7e"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-design-mode-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-design-mode-styles",document.head.appendChild(e)),e.textContent=h3}var xe=m3,Ra=24,Cu=5;function a2(e,t,n,o,r){let i=1/0,s=1/0,a=e.x,l=e.x+e.width,d=e.x+e.width/2,c=e.y,p=e.y+e.height,f=e.y+e.height/2,C=!o,w=C?[a,l,d]:[...o.left?[a]:[],...o.right?[l]:[]],m=C?[c,p,f]:[...o.top?[c]:[],...o.bottom?[p]:[]],S=[];for(let Y of t)n.has(Y.id)||S.push(Y);r&&S.push(...r);for(let Y of S){let he=Y.x,Ce=Y.x+Y.width,Oe=Y.x+Y.width/2,Pe=Y.y,je=Y.y+Y.height,$e=Y.y+Y.height/2;for(let rt of w)for(let Ve of[he,Ce,Oe]){let gt=Ve-rt;Math.abs(gt)<Cu&&Math.abs(gt)<Math.abs(i)&&(i=gt)}for(let rt of m)for(let Ve of[Pe,je,$e]){let gt=Ve-rt;Math.abs(gt)<Cu&&Math.abs(gt)<Math.abs(s)&&(s=gt)}}let g=Math.abs(i)<Cu?i:0,y=Math.abs(s)<Cu?s:0,E=[],A=new Set,Q=a+g,G=l+g,D=d+g,le=c+y,K=p+y,W=f+y;for(let Y of S){let he=Y.x,Ce=Y.x+Y.width,Oe=Y.x+Y.width/2,Pe=Y.y,je=Y.y+Y.height,$e=Y.y+Y.height/2;for(let rt of[he,Oe,Ce])for(let Ve of[Q,D,G])if(Math.abs(Ve-rt)<.5){let gt=`x:${Math.round(rt)}`;A.has(gt)||(A.add(gt),E.push({axis:"x",pos:rt}))}for(let rt of[Pe,$e,je])for(let Ve of[le,W,K])if(Math.abs(Ve-rt)<.5){let gt=`y:${Math.round(rt)}`;A.has(gt)||(A.add(gt),E.push({axis:"y",pos:rt}))}}return{dx:g,dy:y,guides:E}}function l2(){return`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}function g3({placements:e,onChange:t,activeComponent:n,onActiveComponentChange:o,isDarkMode:r,exiting:i,onInteractionChange:s,className:a,passthrough:l,extraSnapRects:d,onSelectionChange:c,deselectSignal:p,onDragMove:f,onDragEnd:C,clearSignal:w,wireframe:m}){let[S,g]=(0,sn.useState)(new Set),[y,E]=(0,sn.useState)(null),[A,Q]=(0,sn.useState)(null),[G,D]=(0,sn.useState)(null),[le,K]=(0,sn.useState)([]),[W,Y]=(0,sn.useState)(null),[he,Ce]=(0,sn.useState)(!1),Oe=(0,sn.useRef)(!1),[Pe,je]=(0,sn.useState)(new Set),$e=(0,sn.useRef)(new Map),rt=(0,sn.useRef)(null),Ve=(0,sn.useRef)(null),gt=(0,sn.useRef)(e);gt.current=e;let U=(0,sn.useRef)(c);U.current=c;let oe=(0,sn.useRef)(f);oe.current=f;let de=(0,sn.useRef)(C);de.current=C;let Re=(0,sn.useRef)(p);(0,sn.useEffect)(()=>{p!==Re.current&&(Re.current=p,g(new Set))},[p]);let ze=(0,sn.useRef)(w);(0,sn.useEffect)(()=>{if(w!==void 0&&w!==ze.current){ze.current=w;let R=new Set(gt.current.map(re=>re.id));R.size>0&&(je(R),g(new Set),Ve.current=null,Ct(()=>{t([]),je(new Set)},180))}},[w,t]),(0,sn.useEffect)(()=>{let R=re=>{let ae=re.target,ve=re.composedPath?.()[0]||ae;if(!(ve.matches?.("input,textarea,select")||ve.isContentEditable)){if((re.key==="Backspace"||re.key==="Delete")&&S.size>0){re.preventDefault();let Xe=new Set(S);je(Xe),g(new Set),Ct(()=>{t(gt.current.filter(it=>!Xe.has(it.id))),je(new Set)},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(re.key)&&S.size>0){re.preventDefault();let Xe=re.shiftKey?20:1,it=re.key==="ArrowLeft"?-Xe:re.key==="ArrowRight"?Xe:0,Pt=re.key==="ArrowUp"?-Xe:re.key==="ArrowDown"?Xe:0;t(e.map(Qe=>S.has(Qe.id)?{...Qe,x:Math.max(0,Qe.x+it),y:Math.max(0,Qe.y+Pt)}:Qe));return}if(re.key==="Escape"){n?o(null):S.size>0&&g(new Set);return}}};return document.addEventListener("keydown",R),()=>document.removeEventListener("keydown",R)},[S,n,e,t,o]);let Ke=(0,sn.useCallback)(R=>{if(R.button!==0||l||R.target.closest(`.${xe.placement}`))return;R.preventDefault(),R.stopPropagation();let ae=window.scrollY,ve=R.clientX,Ge=R.clientY;if(n){Ve.current="place",s?.(!0);let Xe=!1,it=ve,Pt=Ge,Qe=j=>{it=j.clientX,Pt=j.clientY;let q=Math.abs(it-ve),J=Math.abs(Pt-Ge);if((q>5||J>5)&&(Xe=!0),Xe){let ye=Math.min(ve,it),Ae=Math.min(Ge,Pt),qe=Math.abs(it-ve),me=Math.abs(Pt-Ge);E({x:ye,y:Ae,w:qe,h:me}),D({x:j.clientX+12,y:j.clientY+12,text:`${Math.round(qe)} \xD7 ${Math.round(me)}`})}},bt=j=>{window.removeEventListener("mousemove",Qe),window.removeEventListener("mouseup",bt),E(null),D(null),Ve.current=null,s?.(!1);let q=ct[n],J,ye,Ae,qe;Xe?(J=Math.min(ve,it),ye=Math.min(Ge,Pt)+ae,Ae=Math.max(Ra,Math.abs(it-ve)),qe=Math.max(Ra,Math.abs(Pt-Ge))):(Ae=q.width,qe=q.height,J=ve-Ae/2,ye=Ge+ae-qe/2),J=Math.max(0,J),ye=Math.max(0,ye);let me={id:l2(),type:n,x:J,y:ye,width:Ae,height:qe,scrollY:ae,timestamp:Date.now()},Me=[...e,me];t(Me),g(new Set([me.id])),o(null)};window.addEventListener("mousemove",Qe),window.addEventListener("mouseup",bt)}else{R.shiftKey||g(new Set),Ve.current="select";let Xe=!1,it=Qe=>{let bt=Math.abs(Qe.clientX-ve),j=Math.abs(Qe.clientY-Ge);if((bt>4||j>4)&&(Xe=!0),Xe){let q=Math.min(ve,Qe.clientX),J=Math.min(Ge,Qe.clientY);Q({x:q,y:J,w:Math.abs(Qe.clientX-ve),h:Math.abs(Qe.clientY-Ge)})}},Pt=Qe=>{if(window.removeEventListener("mousemove",it),window.removeEventListener("mouseup",Pt),Ve.current=null,Xe){let bt=Math.min(ve,Qe.clientX),j=Math.min(Ge,Qe.clientY)+ae,q=Math.abs(Qe.clientX-ve),J=Math.abs(Qe.clientY-Ge),ye=new Set(R.shiftKey?S:new Set);for(let Ae of e){let qe=Ae.y-ae;Ae.x+Ae.width>bt&&Ae.x<bt+q&&Ae.y+Ae.height>j&&Ae.y<j+J&&ye.add(Ae.id)}g(ye)}Q(null)};window.addEventListener("mousemove",it),window.addEventListener("mouseup",Pt)}},[n,l,e,t,S]),Et=(0,sn.useCallback)((R,re)=>{if(R.button!==0)return;let ae=R.target;if(ae.closest(`.${xe.handle}`)||ae.closest(`.${xe.deleteButton}`))return;R.preventDefault(),R.stopPropagation();let ve;R.shiftKey?(ve=new Set(S),ve.has(re)?ve.delete(re):ve.add(re)):S.has(re)?ve=new Set(S):ve=new Set([re]),g(ve),(ve.size!==S.size||[...ve].some(Me=>!S.has(Me)))&&U.current?.(ve,R.shiftKey);let Xe=window.scrollY,it=R.clientX,Pt=R.clientY,Qe=new Map;for(let Me of e)ve.has(Me.id)&&Qe.set(Me.id,{x:Me.x,y:Me.y});Ve.current="move",s?.(!0);let bt=!1,j=!1,q=e,J=0,ye=0,Ae=new Map;for(let Me of e)Qe.has(Me.id)&&Ae.set(Me.id,{w:Me.width,h:Me.height});let qe=Me=>{let Ue=Me.clientX-it,It=Me.clientY-Pt;if((Math.abs(Ue)>2||Math.abs(It)>2)&&(bt=!0),!bt)return;if(Me.altKey&&!j){j=!0;let Z=[];for(let te of e)Qe.has(te.id)&&Z.push({...te,id:l2(),timestamp:Date.now()});q=[...e,...Z]}let jt=1/0,Qt=1/0,Kt=-1/0,Ot=-1/0;for(let[Z,te]of Qe){let Ne=Ae.get(Z);Ne&&(jt=Math.min(jt,te.x+Ue),Qt=Math.min(Qt,te.y+It),Kt=Math.max(Kt,te.x+Ue+Ne.w),Ot=Math.max(Ot,te.y+It+Ne.h))}let ke={x:jt,y:Qt,width:Kt-jt,height:Ot-Qt},{dx:Lt,dy:At,guides:T}=a2(ke,q,new Set(Qe.keys()),void 0,d);K(T);let L=Ue+Lt,z=It+At;J=L,ye=z,t(q.map(Z=>{let te=Qe.get(Z.id);return te?{...Z,x:Math.max(0,te.x+L),y:Math.max(0,te.y+z)}:Z})),oe.current?.(L,z)},me=()=>{window.removeEventListener("mousemove",qe),window.removeEventListener("mouseup",me),Ve.current=null,s?.(!1),K([]),de.current?.(J,ye,bt)};window.addEventListener("mousemove",qe),window.addEventListener("mouseup",me)},[S,e,t,s]),dn=(0,sn.useCallback)((R,re,ae)=>{R.preventDefault(),R.stopPropagation();let ve=e.find(ye=>ye.id===re);if(!ve)return;g(new Set([re])),Ve.current="resize",s?.(!0);let Ge=R.clientX,Xe=R.clientY,it=ve.width,Pt=ve.height,Qe=ve.x,bt=ve.y,j={left:ae.includes("w"),right:ae.includes("e"),top:ae.includes("n"),bottom:ae.includes("s")},q=ye=>{let Ae=ye.clientX-Ge,qe=ye.clientY-Xe,me=it,Me=Pt,Ue=Qe,It=bt;ae.includes("e")&&(me=Math.max(Ra,it+Ae)),ae.includes("w")&&(me=Math.max(Ra,it-Ae),Ue=Qe+it-me),ae.includes("s")&&(Me=Math.max(Ra,Pt+qe)),ae.includes("n")&&(Me=Math.max(Ra,Pt-qe),It=bt+Pt-Me);let jt={x:Ue,y:It,width:me,height:Me},{dx:Qt,dy:Kt,guides:Ot}=a2(jt,gt.current,new Set([re]),j,d);K(Ot),Qt!==0&&(j.right?me+=Qt:j.left&&(Ue+=Qt,me-=Qt)),Kt!==0&&(j.bottom?Me+=Kt:j.top&&(It+=Kt,Me-=Kt)),t(gt.current.map(ke=>ke.id===re?{...ke,x:Ue,y:It,width:me,height:Me}:ke)),D({x:ye.clientX+12,y:ye.clientY+12,text:`${Math.round(me)} \xD7 ${Math.round(Me)}`})},J=()=>{window.removeEventListener("mousemove",q),window.removeEventListener("mouseup",J),D(null),Ve.current=null,s?.(!1),K([])};window.addEventListener("mousemove",q),window.addEventListener("mouseup",J)},[e,t,s]),Ye=(0,sn.useCallback)(R=>{Ve.current=null,je(re=>{let ae=new Set(re);return ae.add(R),ae}),g(re=>{let ae=new Set(re);return ae.delete(R),ae}),Ct(()=>{t(gt.current.filter(re=>re.id!==R)),je(re=>{let ae=new Set(re);return ae.delete(R),ae})},180)},[t]),Rt=new Set(["text","hero","button","badge","cta","toast","modal","card","navigation","tabs","input","search","breadcrumb","pricing","testimonial","alert","banner","tag","notification","stat","productCard"]),Ft={hero:"Headline text",button:"Button label",badge:"Badge label",cta:"Call to action text",toast:"Notification message",modal:"Dialog title",card:"Card title",navigation:"Brand / nav items",tabs:"Tab labels",input:"Placeholder text",search:"Search placeholder",pricing:"Plan name or price",testimonial:"Quote text",alert:"Alert message",banner:"Banner text",tag:"Tag label",notification:"Notification message",stat:"Metric value",productCard:"Product name"},lt=(0,sn.useCallback)(R=>{let re=e.find(ae=>ae.id===R);re&&(Oe.current=!!re.text,Y(R),Ce(!1))},[e]),ht=(0,sn.useCallback)(()=>{W&&(Ce(!0),Ct(()=>{Y(null),Ce(!1)},150))},[W]);(0,sn.useEffect)(()=>{i&&W&&ht()},[i]);let Ze=(0,sn.useCallback)(R=>{W&&(t(e.map(re=>re.id===W?{...re,text:R.trim()||void 0}:re)),ht())},[W,e,t,ht]),qt=typeof window<"u"?window.scrollY:0,Zt=["nw","ne","se","sw"],en=m?"#f97316":"#3c82f7",on=[{dir:"n",cls:xe.edgeN,arrow:(0,xn.jsx)("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:(0,xn.jsx)("path",{d:"M4 0.5L1 4.5h6z",fill:en})})},{dir:"e",cls:xe.edgeE,arrow:(0,xn.jsx)("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:(0,xn.jsx)("path",{d:"M5.5 4L1.5 1v6z",fill:en})})},{dir:"s",cls:xe.edgeS,arrow:(0,xn.jsx)("svg",{width:"8",height:"6",viewBox:"0 0 8 6",fill:"none",children:(0,xn.jsx)("path",{d:"M4 5.5L1 1.5h6z",fill:en})})},{dir:"w",cls:xe.edgeW,arrow:(0,xn.jsx)("svg",{width:"6",height:"8",viewBox:"0 0 6 8",fill:"none",children:(0,xn.jsx)("path",{d:"M0.5 4L4.5 1v6z",fill:en})})}];return(0,xn.jsxs)(xn.Fragment,{children:[(0,xn.jsx)("div",{ref:rt,className:`${xe.overlay} ${r?"":xe.light} ${n?xe.placing:""} ${l?xe.passthrough:""} ${i?xe.overlayExiting:""} ${m?xe.wireframe:""}${a?` ${a}`:""}`,"data-feedback-toolbar":!0,onMouseDown:Ke,children:e.map(R=>{let re=S.has(R.id),ae=Lr[R.type]?.label||R.type,ve=R.y-qt;return(0,xn.jsxs)("div",{"data-design-placement":R.id,className:`${xe.placement} ${re?xe.selected:""} ${Pe.has(R.id)?xe.exiting:""}`,style:{left:R.x,top:ve,width:R.width,height:R.height,position:"fixed"},onMouseDown:Ge=>Et(Ge,R.id),onDoubleClick:()=>lt(R.id),children:[(0,xn.jsx)("span",{className:xe.placementLabel,children:ae}),(0,xn.jsx)("span",{className:`${xe.placementAnnotation} ${R.text?xe.annotationVisible:""}`,children:(R.text&&$e.current.set(R.id,R.text),R.text||$e.current.get(R.id)||"")}),(0,xn.jsx)("div",{className:xe.placementContent,children:(0,xn.jsx)(f3,{type:R.type,width:R.width,height:R.height,text:R.text})}),(0,xn.jsx)("div",{className:xe.deleteButton,onMouseDown:Ge=>Ge.stopPropagation(),onClick:()=>Ye(R.id),children:"\u2715"}),Zt.map(Ge=>(0,xn.jsx)("div",{className:`${xe.handle} ${xe[`handle${Ge.charAt(0).toUpperCase()}${Ge.slice(1)}`]}`,onMouseDown:Xe=>dn(Xe,R.id,Ge)},Ge)),on.map(({dir:Ge,cls:Xe,arrow:it})=>(0,xn.jsx)("div",{className:`${xe.edgeHandle} ${Xe}`,onMouseDown:Pt=>dn(Pt,R.id,Ge),children:it},Ge))]},R.id)})}),W&&(()=>{let R=e.find(bt=>bt.id===W);if(!R)return null;let re=R.y-qt,ae=R.x+R.width/2,ve=re-8,Ge=re+R.height+8,Xe=ve>200,it=Ge<window.innerHeight-100,Pt=Math.max(160,Math.min(window.innerWidth-160,ae)),Qe;return Xe?Qe={left:Pt,bottom:window.innerHeight-ve}:it?Qe={left:Pt,top:Ge}:Qe={left:Pt,top:Math.max(80,window.innerHeight/2-80)},(0,xn.jsx)(zu,{element:Lr[R.type]?.label||R.type,placeholder:Ft[R.type]||"Label or content text",initialValue:R.text??"",submitLabel:Oe.current?"Save":"Set",onSubmit:Ze,onCancel:ht,onDelete:Oe.current?()=>{Ze("")}:void 0,isExiting:he,lightMode:!r,style:Qe})})(),y&&(0,xn.jsx)("div",{className:xe.drawBox,style:{left:y.x,top:y.y,width:y.w,height:y.h},"data-feedback-toolbar":!0}),A&&(0,xn.jsx)("div",{className:xe.selectBox,style:{left:A.x,top:A.y,width:A.w,height:A.h},"data-feedback-toolbar":!0}),G&&(0,xn.jsx)("div",{className:xe.sizeIndicator,style:{left:G.x,top:G.y},"data-feedback-toolbar":!0,children:G.text}),le.map((R,re)=>(0,xn.jsx)("div",{className:xe.guideLine,style:R.axis==="x"?{position:"fixed",left:R.pos,top:0,width:1,bottom:0}:{position:"fixed",left:0,top:R.pos-qt,right:0,height:1},"data-feedback-toolbar":!0},`${R.axis}-${R.pos}-${re}`))]})}function _3(e){if(!e)return"";let t=e.scrollTop>2,n=e.scrollTop+e.clientHeight<e.scrollHeight-2;return`${t?xe.fadeTop:""} ${n?xe.fadeBottom:""}`}var N="currentColor",_e="0.5";function y3({type:e}){switch(e){case"navigation":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"4",width:"18",height:"8",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2.5",y:"7",width:"3",height:"1.5",rx:".5",fill:N,opacity:".4"}),(0,_.jsx)("rect",{x:"7",y:"7",width:"2.5",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"11",y:"7",width:"2.5",height:"1.5",rx:".5",fill:N,opacity:".25"})]});case"header":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3",y:"5.5",width:"8",height:"2",rx:".5",fill:N,opacity:".35"}),(0,_.jsx)("rect",{x:"3",y:"9",width:"12",height:"1",rx:".5",fill:N,opacity:".15"})]});case"hero":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"5",width:"10",height:"1.5",rx:".5",fill:N,opacity:".35"}),(0,_.jsx)("rect",{x:"7",y:"8",width:"6",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"7.5",y:"10.5",width:"5",height:"2.5",rx:"1",stroke:N,strokeWidth:_e})]});case"section":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"1",width:"18",height:"14",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3",y:"4",width:"6",height:"1",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"3",y:"6.5",width:"14",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"3",y:"9",width:"10",height:"1",rx:".5",fill:N,opacity:".15"})]});case"sidebar":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2.5",y:"4",width:"4",height:"1",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"2.5",y:"6.5",width:"3.5",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"2.5",y:"9",width:"4",height:"1",rx:".5",fill:N,opacity:".15"})]});case"footer":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"7",width:"18",height:"8",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3",y:"9.5",width:"4",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"9.5",width:"4",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"15",y:"9.5",width:"3",height:"1",rx:".5",fill:N,opacity:".2"})]});case"modal":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"4.5",width:"7",height:"1",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"5",y:"7",width:"10",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"11",y:"11",width:"5",height:"2",rx:".75",stroke:N,strokeWidth:_e})]});case"divider":return(0,_.jsx)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:(0,_.jsx)("line",{x1:"2",y1:"8",x2:"18",y2:"8",stroke:N,strokeWidth:"0.5",opacity:".3"})});case"card":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"5.5",rx:"1",fill:N,opacity:".04"}),(0,_.jsx)("rect",{x:"4",y:"8.5",width:"8",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"4",y:"11",width:"11",height:"1",rx:".5",fill:N,opacity:".12"})]});case"text":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"4",width:"14",height:"1.5",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"2",y:"7",width:"11",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"2",y:"9.5",width:"13",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"2",y:"12",width:"8",height:"1",rx:".5",fill:N,opacity:".12"})]});case"image":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"2",y1:"2",x2:"18",y2:"14",stroke:N,strokeWidth:".3",opacity:".25"}),(0,_.jsx)("line",{x1:"18",y1:"2",x2:"2",y2:"14",stroke:N,strokeWidth:".3",opacity:".25"})]});case"video":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M8.5 5.5v5l4.5-2.5z",stroke:N,strokeWidth:_e,fill:N,opacity:".15"})]});case"table":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"1",y1:"5.5",x2:"19",y2:"5.5",stroke:N,strokeWidth:".3",opacity:".25"}),(0,_.jsx)("line",{x1:"1",y1:"9",x2:"19",y2:"9",stroke:N,strokeWidth:".3",opacity:".25"}),(0,_.jsx)("line",{x1:"7",y1:"2",x2:"7",y2:"14",stroke:N,strokeWidth:".3",opacity:".25"}),(0,_.jsx)("line",{x1:"13",y1:"2",x2:"13",y2:"14",stroke:N,strokeWidth:".3",opacity:".25"})]});case"grid":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"11.5",y:"2",width:"7",height:"5.5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"1.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"11.5",y:"9.5",width:"7",height:"5.5",rx:"1",stroke:N,strokeWidth:_e})]});case"list":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"3.5",cy:"4.5",r:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"4",width:"10",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"3.5",cy:"8",r:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"7.5",width:"8",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"3.5",cy:"11.5",r:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"11",width:"11",height:"1",rx:".5",fill:N,opacity:".2"})]});case"chart":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"9",width:"2.5",height:"4",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"7",y:"6",width:"2.5",height:"7",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"11",y:"3",width:"2.5",height:"10",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"15",y:"5",width:"2.5",height:"8",rx:".5",fill:N,opacity:".2"})]});case"accordion":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1.5",y:"2",width:"17",height:"4",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3",y:"3.5",width:"6",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"1.5",y:"7.5",width:"17",height:"3",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"1.5",y:"12",width:"17",height:"3",rx:"1",stroke:N,strokeWidth:_e})]});case"carousel":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"2",width:"14",height:"10",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M1.5 7L3 8.5 1.5 10",stroke:N,strokeWidth:_e,opacity:".35"}),(0,_.jsx)("path",{d:"M18.5 7L17 8.5 18.5 10",stroke:N,strokeWidth:_e,opacity:".35"}),(0,_.jsx)("circle",{cx:"8.5",cy:"14",r:".6",fill:N,opacity:".35"}),(0,_.jsx)("circle",{cx:"10",cy:"14",r:".6",fill:N,opacity:".15"}),(0,_.jsx)("circle",{cx:"11.5",cy:"14",r:".6",fill:N,opacity:".15"})]});case"button":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"2",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"7.5",width:"7",height:"1",rx:".5",fill:N,opacity:".25"})]});case"input":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"4",width:"5.5",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"2",y:"6.5",width:"16",height:"5.5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3.5",y:"8.5",width:"7",height:"1",rx:".5",fill:N,opacity:".12"})]});case"search":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"4.5",width:"16",height:"7",rx:"3.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"6",cy:"8",r:"2",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("line",{x1:"7.5",y1:"9.5",x2:"9",y2:"11",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("rect",{x:"9.5",y:"7.5",width:"6",height:"1",rx:".5",fill:N,opacity:".12"})]});case"form":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1.5",width:"5.5",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"2",y:"3.5",width:"16",height:"3",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2",y:"8",width:"7",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"2",y:"10",width:"16",height:"3",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"12",y:"14",width:"6",height:"2",rx:".75",stroke:N,strokeWidth:_e})]});case"tabs":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"5",width:"18",height:"10",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"1",y:"2",width:"6",height:"3.5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2.5",y:"3.25",width:"3",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"7",y:"2",width:"6",height:"3.5",rx:".75",stroke:N,strokeWidth:_e})]});case"dropdown":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"4",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3.5",y:"3.5",width:"7",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("path",{d:"M15 3.5l1.5 1.5L18 3.5",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("rect",{x:"2",y:"7",width:"16",height:"7",rx:"1",stroke:N,strokeWidth:_e,strokeDasharray:"2 1",opacity:".3"})]});case"toggle":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"4",y:"5",width:"12",height:"6",rx:"3",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"13",cy:"8",r:"2",fill:N,opacity:".3"})]});case"avatar":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"10",cy:"8",r:"6",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"10",cy:"6.5",r:"2",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M6.5 13c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5",stroke:N,strokeWidth:_e})]});case"badge":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"3",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:N,opacity:".25"})]});case"breadcrumb":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1.5",y:"7",width:"3.5",height:"1",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("path",{d:"M6.5 7l1 1-1 1",stroke:N,strokeWidth:_e,opacity:".2"}),(0,_.jsx)("rect",{x:"9",y:"7",width:"3.5",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("path",{d:"M14 7l1 1-1 1",stroke:N,strokeWidth:_e,opacity:".2"}),(0,_.jsx)("rect",{x:"16.5",y:"7",width:"2",height:"1",rx:".5",fill:N,opacity:".15"})]});case"pagination":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"11",y:"5.5",width:"3.5",height:"5",rx:"1",fill:N,opacity:".15",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"15.5",y:"5.5",width:"3.5",height:"5",rx:"1",stroke:N,strokeWidth:_e})]});case"progress":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"7",width:"16",height:"2",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2",y:"7",width:"10",height:"2",rx:"1",fill:N,opacity:".2"})]});case"toast":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"5",cy:"8",r:"1.5",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("rect",{x:"8",y:"6.5",width:"7",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"8",y:"9",width:"5",height:"1",rx:".5",fill:N,opacity:".12"})]});case"tooltip":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"3",width:"14",height:"7",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5.5",y:"5.5",width:"9",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("path",{d:"M9 10l1 2.5 1-2.5",stroke:N,strokeWidth:_e})]});case"pricing":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"7",y:"5.5",width:"6",height:"2",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"5",y:"9",width:"10",height:"1",rx:".5",fill:N,opacity:".1"}),(0,_.jsx)("rect",{x:"5",y:"11",width:"10",height:"1",rx:".5",fill:N,opacity:".1"}),(0,_.jsx)("rect",{x:"6",y:"13",width:"8",height:"1.5",rx:".5",fill:N,opacity:".2"})]});case"testimonial":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("text",{x:"4",y:"5.5",fontSize:"4",fill:N,opacity:".2",fontFamily:"serif",children:"\u201C"}),(0,_.jsx)("rect",{x:"4",y:"7",width:"12",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"4",y:"9",width:"9",height:"1",rx:".5",fill:N,opacity:".12"}),(0,_.jsx)("circle",{cx:"5.5",cy:"12.5",r:"1.5",stroke:N,strokeWidth:_e,opacity:".25"}),(0,_.jsx)("rect",{x:"8",y:"12",width:"5",height:"1",rx:".5",fill:N,opacity:".15"})]});case"cta":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"2",width:"18",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"4.5",width:"10",height:"1.5",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"6",y:"7.5",width:"8",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"7",y:"10",width:"6",height:"2.5",rx:"1",stroke:N,strokeWidth:_e})]});case"alert":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"4",width:"16",height:"8",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"6",cy:"8",r:"2",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("line",{x1:"6",y1:"7",x2:"6",y2:"8.5",stroke:N,strokeWidth:"0.6",opacity:".5"}),(0,_.jsx)("circle",{cx:"6",cy:"9.3",r:".3",fill:N,opacity:".5"}),(0,_.jsx)("rect",{x:"9.5",y:"7",width:"6",height:"1",rx:".5",fill:N,opacity:".2"})]});case"banner":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"5",width:"18",height:"6",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"4",y:"7.5",width:"8",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"14",y:"7",width:"3.5",height:"2",rx:".75",stroke:N,strokeWidth:_e})]});case"stat":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6",y:"4.5",width:"8",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"5",y:"7",width:"10",height:"2.5",rx:".5",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"7",y:"11",width:"6",height:"1",rx:".5",fill:N,opacity:".12"})]});case"stepper":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"4",cy:"8",r:"2",fill:N,opacity:".2",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"6",y1:"8",x2:"8",y2:"8",stroke:N,strokeWidth:".4",opacity:".3"}),(0,_.jsx)("circle",{cx:"10",cy:"8",r:"2",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"12",y1:"8",x2:"14",y2:"8",stroke:N,strokeWidth:".4",opacity:".3"}),(0,_.jsx)("circle",{cx:"16",cy:"8",r:"2",stroke:N,strokeWidth:_e})]});case"tag":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"5",width:"14",height:"6",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5.5",y:"7.5",width:"6",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("line",{x1:"14",y1:"6.5",x2:"15.5",y2:"9.5",stroke:N,strokeWidth:_e,opacity:".2"}),(0,_.jsx)("line",{x1:"15.5",y1:"6.5",x2:"14",y2:"9.5",stroke:N,strokeWidth:_e,opacity:".2"})]});case"rating":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("path",{d:"M4 5.5l1 2 2.2.3-1.6 1.5.4 2.2L4 10.3l-2 1.2.4-2.2L.8 7.8 3 7.5z",fill:N,opacity:".25"}),(0,_.jsx)("path",{d:"M10 5.5l1 2 2.2.3-1.6 1.5.4 2.2L10 10.3l-2 1.2.4-2.2L6.8 7.8 9 7.5z",fill:N,opacity:".25"}),(0,_.jsx)("path",{d:"M16 5.5l1 2 2.2.3-1.6 1.5.4 2.2L16 10.3l-2 1.2.4-2.2-1.6-1.5 2.2-.3z",stroke:N,strokeWidth:_e,opacity:".25"})]});case"map":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"2",y1:"6",x2:"18",y2:"10",stroke:N,strokeWidth:".3",opacity:".15"}),(0,_.jsx)("line",{x1:"7",y1:"2",x2:"11",y2:"14",stroke:N,strokeWidth:".3",opacity:".15"}),(0,_.jsx)("path",{d:"M10 5c-1.7 0-3 1.3-3 3 0 2.5 3 5 3 5s3-2.5 3-5c0-1.7-1.3-3-3-3z",fill:N,opacity:".15",stroke:N,strokeWidth:_e})]});case"timeline":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("line",{x1:"5",y1:"2",x2:"5",y2:"14",stroke:N,strokeWidth:".4",opacity:".25"}),(0,_.jsx)("circle",{cx:"5",cy:"4",r:"1.5",fill:N,opacity:".2",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"8",y:"3",width:"8",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("circle",{cx:"5",cy:"8.5",r:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"8",y:"7.5",width:"6",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("circle",{cx:"5",cy:"13",r:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"8",y:"12",width:"7",height:"1",rx:".5",fill:N,opacity:".15"})]});case"fileUpload":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"2",width:"14",height:"12",rx:"1.5",stroke:N,strokeWidth:_e,strokeDasharray:"2 1"}),(0,_.jsx)("path",{d:"M10 10V5.5m0 0L7.5 8m2.5-2.5L12.5 8",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("rect",{x:"7",y:"11.5",width:"6",height:"1",rx:".5",fill:N,opacity:".15"})]});case"codeBlock":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"4",cy:"4",r:".6",fill:N,opacity:".3"}),(0,_.jsx)("circle",{cx:"5.5",cy:"4",r:".6",fill:N,opacity:".3"}),(0,_.jsx)("circle",{cx:"7",cy:"4",r:".6",fill:N,opacity:".3"}),(0,_.jsx)("rect",{x:"4",y:"7",width:"7",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"6",y:"9",width:"5",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"4",y:"11",width:"8",height:"1",rx:".5",fill:N,opacity:".12"})]});case"calendar":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"3",width:"16",height:"12",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("line",{x1:"2",y1:"6.5",x2:"18",y2:"6.5",stroke:N,strokeWidth:".4",opacity:".25"}),(0,_.jsx)("rect",{x:"5",y:"4",width:"1",height:"1.5",rx:".3",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"14",y:"4",width:"1",height:"1.5",rx:".3",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"7",cy:"9",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"10",cy:"9",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"13",cy:"9",r:".6",fill:N,opacity:".3"}),(0,_.jsx)("circle",{cx:"7",cy:"12",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"10",cy:"12",r:".6",fill:N,opacity:".2"})]});case"notification":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"3",width:"16",height:"10",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"5.5",cy:"8",r:"2",stroke:N,strokeWidth:_e,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"6",width:"6",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"8.5",width:"4.5",height:"1",rx:".5",fill:N,opacity:".12"}),(0,_.jsx)("circle",{cx:"16.5",cy:"4.5",r:"1.5",fill:N,opacity:".25"})]});case"productCard":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3",y:"1",width:"14",height:"6",rx:"1",fill:N,opacity:".04"}),(0,_.jsx)("rect",{x:"5",y:"8.5",width:"7",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"5",y:"10.5",width:"4",height:"1.5",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"12",y:"12",width:"4",height:"2",rx:".75",stroke:N,strokeWidth:_e})]});case"profile":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"10",cy:"5",r:"3",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"10",width:"10",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"7",y:"12.5",width:"6",height:"1",rx:".5",fill:N,opacity:".12"})]});case"drawer":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"9",y:"1",width:"10",height:"14",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"10.5",y:"4",width:"5",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"10.5",y:"6.5",width:"7",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"10.5",y:"9",width:"6",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"1",y:"1",width:"7",height:"14",rx:"1",stroke:N,strokeWidth:_e,opacity:".15"})]});case"popover":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"2",width:"14",height:"9",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"4.5",width:"8",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"5",y:"7",width:"6",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("path",{d:"M9 11l1 2.5 1-2.5",stroke:N,strokeWidth:_e})]});case"logo":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"3",width:"10",height:"10",rx:"2",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M5 9.5l2-4 2 4",stroke:N,strokeWidth:_e,opacity:".3"}),(0,_.jsx)("rect",{x:"14",y:"6",width:"4",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"14",y:"8.5",width:"3",height:"1",rx:".5",fill:N,opacity:".12"})]});case"faq":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("text",{x:"2.5",y:"5.5",fontSize:"4",fill:N,opacity:".3",fontWeight:"bold",children:"?"}),(0,_.jsx)("rect",{x:"7",y:"3",width:"10",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"7",y:"5.5",width:"8",height:"1",rx:".5",fill:N,opacity:".12"}),(0,_.jsx)("text",{x:"2.5",y:"11.5",fontSize:"4",fill:N,opacity:".3",fontWeight:"bold",children:"?"}),(0,_.jsx)("rect",{x:"7",y:"9",width:"9",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"7",y:"11.5",width:"7",height:"1",rx:".5",fill:N,opacity:".12"})]});case"gallery":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"7.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"13.5",y:"1.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"1.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"7.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"13.5",y:"9.5",width:"5",height:"5",rx:".75",stroke:N,strokeWidth:_e})]});case"checkbox":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"5",y:"4",width:"8",height:"8",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M7.5 8l1.5 1.5 3-3",stroke:N,strokeWidth:_e,opacity:".35"})]});case"radio":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"10",cy:"8",r:"4",stroke:N,strokeWidth:_e}),(0,_.jsx)("circle",{cx:"10",cy:"8",r:"2",fill:N,opacity:".3"})]});case"slider":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"7.5",width:"16",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"2",y:"7.5",width:"10",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("circle",{cx:"12",cy:"8",r:"2.5",stroke:N,strokeWidth:_e})]});case"datePicker":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"5",rx:"1",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"3.5",y:"3",width:"5",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"14",y:"2.5",width:"2.5",height:"2",rx:".5",fill:N,opacity:".12"}),(0,_.jsx)("rect",{x:"2",y:"7",width:"16",height:"8",rx:"1",stroke:N,strokeWidth:_e,strokeDasharray:"2 1",opacity:".3"}),(0,_.jsx)("circle",{cx:"6",cy:"10",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"10",cy:"10",r:".6",fill:N,opacity:".3"}),(0,_.jsx)("circle",{cx:"14",cy:"10",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"6",cy:"13",r:".6",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"10",cy:"13",r:".6",fill:N,opacity:".2"})]});case"skeleton":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"16",height:"3",rx:"1",fill:N,opacity:".08"}),(0,_.jsx)("rect",{x:"2",y:"7",width:"10",height:"2",rx:".75",fill:N,opacity:".08"}),(0,_.jsx)("rect",{x:"2",y:"11",width:"13",height:"2",rx:".75",fill:N,opacity:".08"})]});case"chip":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"1.5",y:"5",width:"10",height:"6",rx:"3",fill:N,opacity:".08",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"4",y:"7.5",width:"4",height:"1",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("line",{x1:"9.5",y1:"6.5",x2:"10.5",y2:"9.5",stroke:N,strokeWidth:_e,opacity:".2"}),(0,_.jsx)("line",{x1:"10.5",y1:"6.5",x2:"9.5",y2:"9.5",stroke:N,strokeWidth:_e,opacity:".2"}),(0,_.jsx)("rect",{x:"13",y:"5",width:"5.5",height:"6",rx:"3",stroke:N,strokeWidth:_e,opacity:".25"})]});case"icon":return(0,_.jsx)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:(0,_.jsx)("path",{d:"M10 3l1.5 3 3.5.5-2.5 2.5.5 3.5L10 11l-3 1.5.5-3.5L5 6.5l3.5-.5z",stroke:N,strokeWidth:_e,opacity:".3"})});case"spinner":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"10",cy:"8",r:"5",stroke:N,strokeWidth:_e,opacity:".12"}),(0,_.jsx)("path",{d:"M10 3a5 5 0 0 1 5 5",stroke:N,strokeWidth:_e,opacity:".35",strokeLinecap:"round"})]});case"feature":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"2",width:"5",height:"5",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("path",{d:"M4.5 3.5v3m-1.5-1.5h3",stroke:N,strokeWidth:_e,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"2.5",width:"8",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"5.5",width:"6",height:"1",rx:".5",fill:N,opacity:".12"}),(0,_.jsx)("rect",{x:"2",y:"10",width:"5",height:"5",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"9",y:"10.5",width:"7",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"9",y:"13.5",width:"5",height:"1",rx:".5",fill:N,opacity:".12"})]});case"team":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("circle",{cx:"5",cy:"5",r:"2.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"2.5",y:"9",width:"5",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"15",cy:"5",r:"2.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"12.5",y:"9",width:"5",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("circle",{cx:"10",cy:"5",r:"2.5",stroke:N,strokeWidth:_e,opacity:".5"}),(0,_.jsx)("rect",{x:"7.5",y:"9",width:"5",height:"1",rx:".5",fill:N,opacity:".15"}),(0,_.jsx)("rect",{x:"4",y:"12",width:"12",height:"1",rx:".5",fill:N,opacity:".1"})]});case"login":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"3",y:"1",width:"14",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6",y:"3",width:"8",height:"1.5",rx:".5",fill:N,opacity:".25"}),(0,_.jsx)("rect",{x:"5",y:"5.5",width:"10",height:"3",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"5",y:"9.5",width:"10",height:"3",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"6.5",y:"13.5",width:"7",height:"2",rx:".75",fill:N,opacity:".2"})]});case"contact":return(0,_.jsxs)("svg",{viewBox:"0 0 20 16",width:"20",height:"16",fill:"none",children:[(0,_.jsx)("rect",{x:"2",y:"1",width:"16",height:"14",rx:"1.5",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"4",y:"3",width:"5",height:"1",rx:".5",fill:N,opacity:".2"}),(0,_.jsx)("rect",{x:"4",y:"5",width:"12",height:"2.5",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"4",y:"8.5",width:"12",height:"4",rx:".75",stroke:N,strokeWidth:_e}),(0,_.jsx)("rect",{x:"11",y:"13.5",width:"5",height:"1.5",rx:".5",fill:N,opacity:".2"})]});default:return null}}function x3({activeType:e,onSelect:t,onDragStart:n,scrollRef:o,fadeClass:r,blankCanvas:i}){return(0,_.jsx)("div",{ref:o,className:`${xe.placeScroll} ${r||""}`,children:$2.map(s=>(0,_.jsxs)("div",{className:xe.paletteSection,children:[(0,_.jsx)("div",{className:xe.paletteSectionTitle,children:s.section}),s.items.map(a=>(0,_.jsxs)("div",{className:`${xe.paletteItem} ${e===a.type?xe.active:""} ${i?xe.wireframe:""}`,onClick:()=>t(a.type),onMouseDown:l=>{l.button===0&&n(a.type,l)},children:[(0,_.jsx)("div",{className:xe.paletteItemIcon,children:(0,_.jsx)(y3,{type:a.type})}),(0,_.jsx)("span",{className:xe.paletteItemLabel,children:a.label})]},a.type))]},s.section))})}function w3({value:e,suffix:t}){let[n,o]=(0,Fn.useState)(null),[r,i]=(0,Fn.useState)(t),[s,a]=(0,Fn.useState)("up"),l=(0,Fn.useRef)(e),d=(0,Fn.useRef)(t),c=(0,Fn.useRef)(),p=n!==null&&r!==t;return(0,Fn.useEffect)(()=>{if(e!==l.current){if(e===0){l.current=e,d.current=t,o(null);return}a(e>l.current?"up":"down"),o(l.current),i(d.current),l.current=e,d.current=t,clearTimeout(c.current),c.current=Ct(()=>o(null),250)}else d.current=t},[e,t]),n===null?(0,_.jsxs)(_.Fragment,{children:[e,t?` ${t}`:""]}):p?(0,_.jsxs)("span",{className:xe.rollingWrap,children:[(0,_.jsxs)("span",{style:{visibility:"hidden"},children:[e," ",t]}),(0,_.jsxs)("span",{className:`${xe.rollingNum} ${s==="up"?xe.exitUp:xe.exitDown}`,children:[n," ",r]},`o${n}-${e}`),(0,_.jsxs)("span",{className:`${xe.rollingNum} ${s==="up"?xe.enterUp:xe.enterDown}`,children:[e," ",t]},`n${e}`)]}):(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)("span",{className:xe.rollingWrap,children:[(0,_.jsx)("span",{style:{visibility:"hidden"},children:e}),(0,_.jsx)("span",{className:`${xe.rollingNum} ${s==="up"?xe.exitUp:xe.exitDown}`,children:n},`o${n}-${e}`),(0,_.jsx)("span",{className:`${xe.rollingNum} ${s==="up"?xe.enterUp:xe.enterDown}`,children:e},`n${e}`)]}),t?` ${t}`:""]})}function v3({activeType:e,onSelect:t,isDarkMode:n,sectionCount:o,onDetectSections:r,visible:i,onExited:s,placementCount:a,onClearPlacements:l,onDragStart:d,blankCanvas:c,onBlankCanvasChange:p,wireframePurpose:f,onWireframePurposeChange:C,Tooltip:w}){let[m,S]=(0,Fn.useState)(!1),[g,y]=(0,Fn.useState)("exit"),[E,A]=(0,Fn.useState)(!1),[Q,G]=(0,Fn.useState)(!0),D=(0,Fn.useRef)(0),le=(0,Fn.useRef)(""),K=(0,Fn.useRef)(0),W=(0,Fn.useRef)(),Y=(0,Fn.useRef)(null),[he,Ce]=(0,Fn.useState)("");(0,Fn.useEffect)(()=>(i?(S(!0),clearTimeout(W.current),cancelAnimationFrame(K.current),K.current=Da(()=>{K.current=Da(()=>{y("enter")})})):(cancelAnimationFrame(K.current),y("exit"),clearTimeout(W.current),W.current=Ct(()=>{S(!1),s?.()},200)),()=>cancelAnimationFrame(K.current)),[i]);let Oe=a>0||o>0,Pe=a+o;if(Pe>0&&(D.current=Pe,le.current=c?Pe===1?"Component":"Components":Pe===1?"Change":"Changes"),(0,Fn.useEffect)(()=>{if(Oe)E?G(!1):(G(!0),A(!0),Da(()=>{Da(()=>{G(!1)})}));else{G(!0);let $e=Ct(()=>A(!1),300);return()=>clearTimeout($e)}},[Oe]),(0,Fn.useEffect)(()=>{if(!m)return;let $e=Y.current;if(!$e)return;let rt=()=>Ce(_3($e));rt(),$e.addEventListener("scroll",rt,{passive:!0});let Ve=new ResizeObserver(rt);return Ve.observe($e),()=>{$e.removeEventListener("scroll",rt),Ve.disconnect()}},[m]),!m)return null;let je=[];return a>0&&je.push("placed"),o>0&&je.push("captured"),(0,_.jsxs)("div",{className:`${xe.palette} ${xe[g]} ${n?"":xe.light}`,"data-feedback-toolbar":!0,"data-agentation-palette":!0,onClick:$e=>$e.stopPropagation(),onMouseDown:$e=>$e.stopPropagation(),onTransitionEnd:$e=>{$e.target===$e.currentTarget&&(i||(clearTimeout(W.current),S(!1),y("exit"),s?.()))},children:[(0,_.jsxs)("div",{className:xe.paletteHeader,children:[(0,_.jsx)("div",{className:xe.paletteHeaderTitle,children:"Layout mode"}),(0,_.jsxs)("div",{className:xe.paletteHeaderDesc,children:["Rearrange and resize existing elements, add new components, and explore layout ideas. Agent results may vary."," ",(0,_.jsx)("a",{href:"https://agentation.dev/features#layout-mode",target:"_blank",rel:"noopener noreferrer",children:"Learn more."})]})]}),(0,_.jsxs)("div",{className:`${xe.canvasToggle} ${c?xe.active:""}`,onClick:()=>p(!c),children:[(0,_.jsx)("span",{className:xe.canvasToggleIcon,children:(0,_.jsxs)("svg",{viewBox:"0 0 14 14",width:"14",height:"14",fill:"none",children:[(0,_.jsx)("rect",{x:"1",y:"1",width:"12",height:"12",rx:"2",stroke:"currentColor",strokeWidth:"1"}),(0,_.jsx)("circle",{cx:"4.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"7",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"9.5",cy:"4.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"4.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"7",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"9.5",cy:"7",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"4.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"7",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"}),(0,_.jsx)("circle",{cx:"9.5",cy:"9.5",r:"0.8",fill:"currentColor",opacity:".6"})]})}),(0,_.jsx)("span",{className:xe.canvasToggleLabel,children:"Wireframe a new page"})]}),(0,_.jsx)("div",{className:`${xe.wireframePurposeWrap} ${c?"":xe.collapsed}`,children:(0,_.jsx)("div",{className:xe.wireframePurposeInner,children:(0,_.jsx)("textarea",{className:xe.wireframePurposeInput,placeholder:"Describe this page to provide additional context for your agent.",value:f,onChange:$e=>C($e.target.value),rows:2})})}),(0,_.jsx)(x3,{activeType:e,onSelect:t,onDragStart:d,scrollRef:Y,fadeClass:he,blankCanvas:c}),E&&(0,_.jsx)("div",{className:`${xe.paletteFooterWrap} ${Q?xe.footerHidden:""}`,children:(0,_.jsx)("div",{className:xe.paletteFooterInner,children:(0,_.jsx)("div",{className:xe.paletteFooterInnerContent,children:(0,_.jsxs)("div",{className:xe.paletteFooter,children:[(0,_.jsx)("span",{className:xe.paletteFooterCount,children:(0,_.jsx)(w3,{value:D.current,suffix:le.current})}),(0,_.jsx)("button",{className:xe.paletteFooterClear,onClick:l,children:"Clear"})]})})})})]})}function Wa(e){if(e.parentElement)return e.parentElement;let t=e.getRootNode();return t instanceof ShadowRoot?t.host:null}function Oo(e,t){let n=e;for(;n;){if(n.matches(t))return n;n=Wa(n)}return null}function b3(e,t=4){let n=[],o=e,r=0;for(;o&&r<t;){let i=o.tagName.toLowerCase();if(i==="html"||i==="body")break;let s=i;if(o.id)s=`#${o.id}`;else if(o.className&&typeof o.className=="string"){let l=o.className.split(/\s+/).find(d=>d.length>2&&!d.match(/^[a-z]{1,2}$/)&&!d.match(/[A-Z0-9]{5,}/));l&&(s=`.${l.split("_")[0]}`)}let a=Wa(o);!o.parentElement&&a&&(s=`\u27E8shadow\u27E9 ${s}`),n.unshift(s),o=a,r++}return n.join(" > ")}function za(e){let t=b3(e);if(e.dataset.element)return{name:e.dataset.element,path:t};let n=e.tagName.toLowerCase();if(["path","circle","rect","line","g"].includes(n)){let o=Oo(e,"svg");if(o){let r=Wa(o);if(r instanceof HTMLElement)return{name:`graphic in ${za(r).name}`,path:t}}return{name:"graphic element",path:t}}if(n==="svg"){let o=Wa(e);if(o?.tagName.toLowerCase()==="button"){let r=o.textContent?.trim();return{name:r?`icon in "${r}" button`:"button icon",path:t}}return{name:"icon",path:t}}if(n==="button"){let o=e.textContent?.trim(),r=e.getAttribute("aria-label");return r?{name:`button [${r}]`,path:t}:{name:o?`button "${o.slice(0,25)}"`:"button",path:t}}if(n==="a"){let o=e.textContent?.trim(),r=e.getAttribute("href");return o?{name:`link "${o.slice(0,25)}"`,path:t}:r?{name:`link to ${r.slice(0,30)}`,path:t}:{name:"link",path:t}}if(n==="input"){let o=e.getAttribute("type")||"text",r=e.getAttribute("placeholder"),i=e.getAttribute("name");return r?{name:`input "${r}"`,path:t}:i?{name:`input [${i}]`,path:t}:{name:`${o} input`,path:t}}if(["h1","h2","h3","h4","h5","h6"].includes(n)){let o=e.textContent?.trim();return{name:o?`${n} "${o.slice(0,35)}"`:n,path:t}}if(n==="p"){let o=e.textContent?.trim();return o?{name:`paragraph: "${o.slice(0,40)}${o.length>40?"...":""}"`,path:t}:{name:"paragraph",path:t}}if(n==="span"||n==="label"){let o=e.textContent?.trim();return o&&o.length<40?{name:`"${o}"`,path:t}:{name:n,path:t}}if(n==="li"){let o=e.textContent?.trim();return o&&o.length<40?{name:`list item: "${o.slice(0,35)}"`,path:t}:{name:"list item",path:t}}if(n==="blockquote")return{name:"blockquote",path:t};if(n==="code"){let o=e.textContent?.trim();return o&&o.length<30?{name:`code: \`${o}\``,path:t}:{name:"code",path:t}}if(n==="pre")return{name:"code block",path:t};if(n==="img"){let o=e.getAttribute("alt");return{name:o?`image "${o.slice(0,30)}"`:"image",path:t}}if(n==="video")return{name:"video",path:t};if(["div","section","article","nav","header","footer","aside","main"].includes(n)){let o=e.className,r=e.getAttribute("role"),i=e.getAttribute("aria-label");if(i)return{name:`${n} [${i}]`,path:t};if(r)return{name:`${r}`,path:t};if(typeof o=="string"&&o){let s=o.split(/[\s_-]+/).map(a=>a.replace(/[A-Z0-9]{5,}.*$/,"")).filter(a=>a.length>2&&!/^[a-z]{1,2}$/.test(a)).slice(0,2);if(s.length>0)return{name:s.join(" "),path:t}}return{name:n==="div"?"container":n,path:t}}return{name:n,path:t}}function ic(e){let t=[],n=e.textContent?.trim();n&&n.length<100&&t.push(n);let o=e.previousElementSibling;if(o){let i=o.textContent?.trim();i&&i.length<50&&t.unshift(`[before: "${i.slice(0,40)}"]`)}let r=e.nextElementSibling;if(r){let i=r.textContent?.trim();i&&i.length<50&&t.push(`[after: "${i.slice(0,40)}"]`)}return t.join(" ")}function Eu(e){let t=Wa(e);if(!t)return"";let r=(e.getRootNode()instanceof ShadowRoot&&e.parentElement?Array.from(e.parentElement.children):Array.from(t.children)).filter(c=>c!==e&&c instanceof HTMLElement);if(r.length===0)return"";let i=r.slice(0,4).map(c=>{let p=c.tagName.toLowerCase(),f=c.className,C="";if(typeof f=="string"&&f){let w=f.split(/\s+/).map(m=>m.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(m=>m.length>2&&!/^[a-z]{1,2}$/.test(m));w&&(C=`.${w}`)}if(p==="button"||p==="a"){let w=c.textContent?.trim().slice(0,15);if(w)return`${p}${C} "${w}"`}return`${p}${C}`}),a=t.tagName.toLowerCase();if(typeof t.className=="string"&&t.className){let c=t.className.split(/\s+/).map(p=>p.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(p=>p.length>2&&!/^[a-z]{1,2}$/.test(p));c&&(a=`.${c}`)}let l=t.children.length,d=l>i.length+1?` (${l} total in ${a})`:"";return i.join(", ")+d}function sc(e){let t=e.className;return typeof t!="string"||!t?"":t.split(/\s+/).filter(o=>o.length>0).map(o=>{let r=o.match(/^([a-zA-Z][a-zA-Z0-9_-]*?)(?:_[a-zA-Z0-9]{5,})?$/);return r?r[1]:o}).filter((o,r,i)=>i.indexOf(o)===r).join(", ")}var R2=new Set(["none","normal","auto","0px","rgba(0, 0, 0, 0)","transparent","static","visible"]),k3=new Set(["p","span","h1","h2","h3","h4","h5","h6","label","li","td","th","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","a","time","cite","q"]),S3=new Set(["input","textarea","select"]),C3=new Set(["img","video","canvas","svg"]),E3=new Set(["div","section","article","nav","header","footer","aside","main","ul","ol","form","fieldset"]);function Tu(e){if(typeof window>"u")return{};let t=window.getComputedStyle(e),n={},o=e.tagName.toLowerCase(),r;k3.has(o)?r=["color","fontSize","fontWeight","fontFamily","lineHeight"]:o==="button"||o==="a"&&e.getAttribute("role")==="button"?r=["backgroundColor","color","padding","borderRadius","fontSize"]:S3.has(o)?r=["backgroundColor","color","padding","borderRadius","fontSize"]:C3.has(o)?r=["width","height","objectFit","borderRadius"]:E3.has(o)?r=["display","padding","margin","gap","backgroundColor"]:r=["color","fontSize","margin","padding","backgroundColor"];for(let i of r){let s=i.replace(/([A-Z])/g,"-$1").toLowerCase(),a=t.getPropertyValue(s);a&&!R2.has(a)&&(n[i]=a)}return n}var T3=["color","backgroundColor","borderColor","fontSize","fontWeight","fontFamily","lineHeight","letterSpacing","textAlign","width","height","padding","margin","border","borderRadius","display","position","top","right","bottom","left","zIndex","flexDirection","justifyContent","alignItems","gap","opacity","visibility","overflow","boxShadow","transform"];function Mu(e){if(typeof window>"u")return"";let t=window.getComputedStyle(e),n=[];for(let o of T3){let r=o.replace(/([A-Z])/g,"-$1").toLowerCase(),i=t.getPropertyValue(r);i&&!R2.has(i)&&n.push(`${r}: ${i}`)}return n.join("; ")}function M3(e){if(!e)return;let t={},n=e.split(";").map(o=>o.trim()).filter(Boolean);for(let o of n){let r=o.indexOf(":");if(r>0){let i=o.slice(0,r).trim(),s=o.slice(r+1).trim();i&&s&&(t[i]=s)}}return Object.keys(t).length>0?t:void 0}function Nu(e){let t=[],n=e.getAttribute("role"),o=e.getAttribute("aria-label"),r=e.getAttribute("aria-describedby"),i=e.getAttribute("tabindex"),s=e.getAttribute("aria-hidden");return n&&t.push(`role="${n}"`),o&&t.push(`aria-label="${o}"`),r&&t.push(`aria-describedby="${r}"`),i&&t.push(`tabindex=${i}`),s==="true"&&t.push("aria-hidden"),e.matches("a, button, input, select, textarea, [tabindex]")&&t.push("focusable"),t.join(", ")}function Iu(e){let t=[],n=e;for(;n&&n.tagName.toLowerCase()!=="html";){let o=n.tagName.toLowerCase(),r=o;if(n.id)r=`${o}#${n.id}`;else if(n.className&&typeof n.className=="string"){let s=n.className.split(/\s+/).map(a=>a.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(a=>a.length>2);s&&(r=`${o}.${s}`)}let i=Wa(n);!n.parentElement&&i&&(r=`\u27E8shadow\u27E9 ${r}`),t.unshift(r),n=i}return t.join(" > ")}var N3=new Set(["nav","header","main","section","article","footer","aside"]),Im={banner:"Header",navigation:"Navigation",main:"Main content",contentinfo:"Footer",complementary:"Sidebar",region:"Section"},c2={nav:"Navigation",header:"Header",main:"Main content",section:"Section",article:"Article",footer:"Footer",aside:"Sidebar"},I3=new Set(["script","style","noscript","link","meta"]),A3=40;function O2(e){let t=e;for(;t&&t!==document.body&&t!==document.documentElement;){let n=window.getComputedStyle(t).position;if(n==="fixed"||n==="sticky")return!0;t=t.parentElement}return!1}function $s(e){let t=e.tagName.toLowerCase();if(["nav","header","footer","main"].includes(t)&&document.querySelectorAll(t).length===1)return t;if(e.id)return`#${CSS.escape(e.id)}`;if(e.className&&typeof e.className=="string"){let r=e.className.split(/\s+/).filter(i=>i.length>0).find(i=>i.length>2&&!/^[a-zA-Z0-9]{6,}$/.test(i)&&!/^[a-z]{1,2}$/.test(i));if(r){let i=`${t}.${CSS.escape(r)}`;if(document.querySelectorAll(i).length===1)return i}}let n=e.parentElement;if(n){let r=Array.from(n.children).indexOf(e)+1;return`${n===document.body?"body":$s(n)} > ${t}:nth-child(${r})`}return t}function Fu(e){let t=e.tagName.toLowerCase(),n=e.getAttribute("aria-label");if(n)return n;let o=e.getAttribute("role");if(o&&Im[o])return Im[o];if(c2[t])return c2[t];let r=e.querySelector("h1, h2, h3, h4, h5, h6");if(r){let s=r.textContent?.trim();if(s&&s.length<=50)return s;if(s)return s.slice(0,47)+"..."}let{name:i}=za(e);return i.charAt(0).toUpperCase()+i.slice(1)}function P2(e){let t=e.className;return typeof t!="string"||!t?null:t.split(/\s+/).map(o=>o.replace(/[_][a-zA-Z0-9]{5,}.*$/,"")).find(o=>o.length>2&&!/^[a-z]{1,2}$/.test(o))||null}function D2(e){let t=e.textContent?.trim();if(!t)return null;let n=t.replace(/\s+/g," ");return n.length<=30?n:n.slice(0,30)+"\u2026"}function L3(){let e=document.querySelector("main")||document.body,t=Array.from(e.children),n=t;e!==document.body&&t.length<3&&(n=Array.from(document.body.children));let o=[];return n.forEach((r,i)=>{if(!(r instanceof HTMLElement))return;let s=r.tagName.toLowerCase();if(I3.has(s)||r.hasAttribute("data-feedback-toolbar")||r.closest("[data-feedback-toolbar]"))return;let a=window.getComputedStyle(r);if(a.display==="none"||a.visibility==="hidden")return;let l=r.getBoundingClientRect();if(l.height<A3)return;let d=N3.has(s),c=r.getAttribute("role")&&Im[r.getAttribute("role")],p=s==="div"&&l.height>=60;if(!d&&!c&&!p)return;let f=window.scrollY,C=O2(r),w={x:l.x,y:C?l.y:l.y+f,width:l.width,height:l.height};o.push({id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:Fu(r),tagName:s,selector:$s(r),role:r.getAttribute("role"),className:P2(r),textSnippet:D2(r),originalRect:w,currentRect:{...w},originalIndex:i,isFixed:C})}),o}function $3(e){let t=window.scrollY,n=e.getBoundingClientRect(),o=O2(e),r={x:n.x,y:o?n.y:n.y+t,width:n.width,height:n.height},i=e.parentElement,s=0;return i&&(s=Array.from(i.children).indexOf(e)),{id:`rs-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,label:Fu(e),tagName:e.tagName.toLowerCase(),selector:$s(e),role:e.getAttribute("role"),className:P2(e),textSnippet:D2(e),originalRect:r,currentRect:{...r},originalIndex:s,isFixed:o}}var d2={bg:"rgba(59, 130, 246, 0.08)",border:"rgba(59, 130, 246, 0.5)",pill:"#3b82f6"},u2=["nw","n","ne","e","se","s","sw","w"],Au=24,p2=16,Lu=5;function f2(e,t,n,o){let r=1/0,i=1/0,s=e.x,a=e.x+e.width,l=e.x+e.width/2,d=e.y,c=e.y+e.height,p=e.y+e.height/2,f=[];for(let D of t)n.has(D.id)||f.push(D.currentRect);o&&f.push(...o);for(let D of f){let le=D.x,K=D.x+D.width,W=D.x+D.width/2,Y=D.y,he=D.y+D.height,Ce=D.y+D.height/2;for(let Oe of[s,a,l])for(let Pe of[le,K,W]){let je=Pe-Oe;Math.abs(je)<Lu&&Math.abs(je)<Math.abs(r)&&(r=je)}for(let Oe of[d,c,p])for(let Pe of[Y,he,Ce]){let je=Pe-Oe;Math.abs(je)<Lu&&Math.abs(je)<Math.abs(i)&&(i=je)}}let C=Math.abs(r)<Lu?r:0,w=Math.abs(i)<Lu?i:0,m=[],S=new Set,g=s+C,y=a+C,E=l+C,A=d+w,Q=c+w,G=p+w;for(let D of f){let le=D.x,K=D.x+D.width,W=D.x+D.width/2,Y=D.y,he=D.y+D.height,Ce=D.y+D.height/2;for(let Oe of[le,W,K])for(let Pe of[g,E,y])if(Math.abs(Pe-Oe)<.5){let je=`x:${Math.round(Oe)}`;S.has(je)||(S.add(je),m.push({axis:"x",pos:Oe}))}for(let Oe of[Y,Ce,he])for(let Pe of[A,G,Q])if(Math.abs(Pe-Oe)<.5){let je=`y:${Math.round(Oe)}`;S.has(je)||(S.add(je),m.push({axis:"y",pos:Oe}))}}return{dx:C,dy:w,guides:m}}var R3=new Set(["script","style","noscript","link","meta","br","hr"]);function h2(e){let t=e;for(;t&&t!==document.body&&t!==document.documentElement;){if(t.closest("[data-feedback-toolbar]"))return null;if(R3.has(t.tagName.toLowerCase())){t=t.parentElement;continue}let n=t.getBoundingClientRect();if(n.width>=p2&&n.height>=p2)return t;t=t.parentElement}return null}function O3({rearrangeState:e,onChange:t,isDarkMode:n,exiting:o,className:r,blankCanvas:i,extraSnapRects:s,onSelectionChange:a,deselectSignal:l,onDragMove:d,onDragEnd:c,clearSignal:p}){let{sections:f}=e,C=(0,zt.useRef)(e);C.current=e;let[w,m]=(0,zt.useState)(new Set),[S,g]=(0,zt.useState)(!1),y=(0,zt.useRef)(p);(0,zt.useEffect)(()=>{p!==void 0&&p!==y.current&&(y.current=p,f.length>0&&g(!0))},[p,f.length]);let E=(0,zt.useRef)(l);(0,zt.useEffect)(()=>{l!==E.current&&(E.current=l,m(new Set))},[l]);let[A,Q]=(0,zt.useState)(null),[G,D]=(0,zt.useState)(!1),le=(0,zt.useRef)(!1),K=(0,zt.useCallback)(j=>{let q=f.find(J=>J.id===j);q&&(le.current=!!q.note,Q(j),D(!1))},[f]),W=(0,zt.useCallback)(()=>{A&&(D(!0),Ct(()=>{Q(null),D(!1)},150))},[A]),Y=(0,zt.useCallback)(j=>{A&&(t({...e,sections:f.map(q=>q.id===A?{...q,note:j.trim()||void 0}:q)}),W())},[A,f,e,t,W]);(0,zt.useEffect)(()=>{o&&A&&W()},[o]);let[he,Ce]=(0,zt.useState)(new Set),Oe=(0,zt.useRef)(new Map),[Pe,je]=(0,zt.useState)(null),[$e,rt]=(0,zt.useState)(null),[Ve,gt]=(0,zt.useState)([]),[U,oe]=(0,zt.useState)(0),de=(0,zt.useRef)(null),Re=(0,zt.useRef)(new Set),ze=(0,zt.useRef)(new Map),[Ke,Et]=(0,zt.useState)(new Map),[dn,Ye]=(0,zt.useState)(new Map),Rt=(0,zt.useRef)(new Set),Ft=(0,zt.useRef)(new Map),lt=(0,zt.useRef)(a);lt.current=a;let ht=(0,zt.useRef)(d);ht.current=d;let Ze=(0,zt.useRef)(c);Ze.current=c,(0,zt.useEffect)(()=>{i&&m(new Set)},[i]);let[qt,Zt]=(0,zt.useState)(()=>!e.sections.some(j=>{let q=j.originalRect,J=j.currentRect;return Math.abs(q.x-J.x)>1||Math.abs(q.y-J.y)>1||Math.abs(q.width-J.width)>1||Math.abs(q.height-J.height)>1}));(0,zt.useEffect)(()=>{if(!qt){let j=Ct(()=>Zt(!0),380);return()=>clearTimeout(j)}},[]);let en=(0,zt.useRef)(new Set);(0,zt.useEffect)(()=>{en.current=new Set(f.map(j=>j.selector))},[f]),(0,zt.useEffect)(()=>{let j=()=>oe(window.scrollY);return j(),window.addEventListener("scroll",j,{passive:!0}),window.addEventListener("resize",j,{passive:!0}),()=>{window.removeEventListener("scroll",j),window.removeEventListener("resize",j)}},[]),(0,zt.useEffect)(()=>{let j=q=>{if(de.current){je(null);return}let J=document.elementFromPoint(q.clientX,q.clientY);if(!J){je(null);return}if(J.closest("[data-feedback-toolbar]")){je(null);return}if(J.closest("[data-design-placement]")){je(null);return}if(J.closest("[data-annotation-popup]")){je(null);return}let ye=h2(J);if(!ye){je(null);return}for(let qe of en.current)try{let me=document.querySelector(qe);if(me&&(me===ye||ye.contains(me))){je(null);return}}catch{}let Ae=ye.getBoundingClientRect();je({x:Ae.x,y:Ae.y,w:Ae.width,h:Ae.height})};return document.addEventListener("mousemove",j,{passive:!0}),()=>document.removeEventListener("mousemove",j)},[f]),(0,zt.useEffect)(()=>{let j=document.body.style.userSelect;return document.body.style.userSelect="none",()=>{document.body.style.userSelect=j}},[]),(0,zt.useEffect)(()=>{let j=q=>{if(de.current||q.button!==0)return;let J=q.target;if(!J||J.closest("[data-feedback-toolbar]")||J.closest("[data-design-placement]")||J.closest("[data-annotation-popup]"))return;let ye=h2(J),Ae=!1;if(ye)for(let me of en.current)try{let Me=document.querySelector(me);if(Me&&(Me===ye||ye.contains(Me))){Ae=!0;break}}catch{}let qe=!!(q.shiftKey||q.metaKey||q.ctrlKey);if(ye&&!Ae){q.preventDefault(),q.stopPropagation();let me=$3(ye),Me=[...f,me],Ue=[...e.originalOrder,me.id];t({...e,sections:Me,originalOrder:Ue});let It=new Set([me.id]);m(It),lt.current?.(It,qe),je(null);let jt=q.clientX,Qt=q.clientY,Kt={x:me.currentRect.x,y:me.currentRect.y},Ot=me.originalRect,ke=!1,Lt=0,At=0;de.current="move";let T=z=>{let Z=z.clientX-jt,te=z.clientY-Qt;if(!ke&&(Math.abs(Z)>2||Math.abs(te)>2)&&(ke=!0),!ke)return;let Ne={x:Kt.x+Z,y:Kt.y+te,width:me.currentRect.width,height:me.currentRect.height},h=f2(Ne,Me,new Set([me.id]),s);gt(h.guides);let I=Z+h.dx,O=te+h.dy;Lt=I,At=O;let ee=document.querySelector(`[data-rearrange-section="${me.id}"]`);ee&&(ee.style.transform=`translate(${I}px, ${O}px)`),Et(new Map([[me.id,{x:Kt.x+I,y:Kt.y+O,width:me.currentRect.width,height:me.currentRect.height}]])),ht.current?.(I,O)},L=()=>{window.removeEventListener("mousemove",T),window.removeEventListener("mouseup",L),de.current=null,gt([]),Et(new Map);let z=document.querySelector(`[data-rearrange-section="${me.id}"]`);z&&(z.style.transform=""),ke&&t({...e,sections:Me.map(Z=>Z.id===me.id?{...Z,currentRect:{...Z.currentRect,x:Math.max(0,Kt.x+Lt),y:Math.max(0,Kt.y+At)}}:Z),originalOrder:Ue}),Ze.current?.(Lt,At,ke)};window.addEventListener("mousemove",T),window.addEventListener("mouseup",L)}else if(Ae&&ye){q.preventDefault();for(let me of f)try{let Me=document.querySelector(me.selector);if(Me&&Me===ye){let Ue=new Set([me.id]);m(Ue),lt.current?.(Ue,qe);return}}catch{}qe||(m(new Set),lt.current?.(new Set,!1))}else qe||(m(new Set),lt.current?.(new Set,!1))};return document.addEventListener("mousedown",j,!0),()=>document.removeEventListener("mousedown",j,!0)},[f,e,t]),(0,zt.useEffect)(()=>{let j=q=>{let J=q.target,ye=q.composedPath?.()[0]||J;if(!(ye.matches?.("input,textarea,select")||ye.isContentEditable)){if((q.key==="Backspace"||q.key==="Delete")&&w.size>0){q.preventDefault();let Ae=new Set(w);Ce(qe=>{let me=new Set(qe);for(let Me of Ae)me.add(Me);return me}),m(new Set),Ct(()=>{let qe=C.current;t({...qe,sections:qe.sections.filter(me=>!Ae.has(me.id)),originalOrder:qe.originalOrder.filter(me=>!Ae.has(me))}),Ce(me=>{let Me=new Set(me);for(let Ue of Ae)Me.delete(Ue);return Me})},180);return}if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(q.key)&&w.size>0){q.preventDefault();let Ae=q.shiftKey?20:1,qe=q.key==="ArrowLeft"?-Ae:q.key==="ArrowRight"?Ae:0,me=q.key==="ArrowUp"?-Ae:q.key==="ArrowDown"?Ae:0;t({...e,sections:f.map(Me=>w.has(Me.id)?{...Me,currentRect:{...Me.currentRect,x:Math.max(0,Me.currentRect.x+qe),y:Math.max(0,Me.currentRect.y+me)}}:Me)});return}q.key==="Escape"&&w.size>0&&m(new Set)}};return document.addEventListener("keydown",j),()=>document.removeEventListener("keydown",j)},[w,f,e,t]);let on=(0,zt.useCallback)((j,q)=>{if(j.button!==0)return;let J=j.target;if(J.closest(`.${xe.handle}`)||J.closest(`.${xe.deleteButton}`))return;j.preventDefault(),j.stopPropagation();let ye;j.shiftKey||j.metaKey||j.ctrlKey?(ye=new Set(w),ye.has(q)?ye.delete(q):ye.add(q)):w.has(q)?ye=new Set(w):ye=new Set([q]),m(ye),(ye.size!==w.size||[...ye].some(ke=>!w.has(ke)))&&lt.current?.(ye,!!(j.shiftKey||j.metaKey||j.ctrlKey));let qe=j.clientX,me=j.clientY,Me=new Map;for(let ke of f)ye.has(ke.id)&&Me.set(ke.id,{x:ke.currentRect.x,y:ke.currentRect.y});de.current="move";let Ue=!1,It=0,jt=0,Qt=new Map;for(let ke of f)if(ye.has(ke.id)){let Lt=document.querySelector(`[data-rearrange-section="${ke.id}"]`);Qt.set(ke.id,{outlineEl:Lt,curW:ke.currentRect.width,curH:ke.currentRect.height})}let Kt=ke=>{let Lt=ke.clientX-qe,At=ke.clientY-me;if(Lt===0&&At===0)return;Ue=!0;let T=1/0,L=1/0,z=-1/0,Z=-1/0;for(let[O,{curW:ee,curH:se}]of Qt){let ce=Me.get(O);if(!ce)continue;let b=ce.x+Lt,B=ce.y+At;T=Math.min(T,b),L=Math.min(L,B),z=Math.max(z,b+ee),Z=Math.max(Z,B+se)}let te=f2({x:T,y:L,width:z-T,height:Z-L},f,ye,s),Ne=Lt+te.dx,h=At+te.dy;It=Ne,jt=h,gt(te.guides);for(let[,{outlineEl:O}]of Qt)O&&(O.style.transform=`translate(${Ne}px, ${h}px)`);let I=new Map;for(let[O,{curW:ee,curH:se}]of Qt){let ce=Me.get(O);if(ce){let b={x:Math.max(0,ce.x+Ne),y:Math.max(0,ce.y+h),width:ee,height:se};I.set(O,b)}}Et(I),ht.current?.(Ne,h)},Ot=ke=>{window.removeEventListener("mousemove",Kt),window.removeEventListener("mouseup",Ot),de.current=null,gt([]),Et(new Map);for(let[,{outlineEl:Lt}]of Qt)Lt&&(Lt.style.transform="");if(Ue){let Lt=ke.clientX-qe,At=ke.clientY-me;if(Math.abs(Lt)<5&&Math.abs(At)<5)t({...e,sections:f.map(T=>{let L=Me.get(T.id);return L?{...T,currentRect:{...T.currentRect,x:L.x,y:L.y}}:T})});else{t({...e,sections:f.map(T=>{let L=Me.get(T.id);return L?{...T,currentRect:{...T.currentRect,x:Math.max(0,L.x+It),y:Math.max(0,L.y+jt)}}:T})}),Ze.current?.(It,jt,!0);return}}Ze.current?.(0,0,!1)};window.addEventListener("mousemove",Kt),window.addEventListener("mouseup",Ot)},[w,f,e,t]),R=(0,zt.useCallback)((j,q,J)=>{j.preventDefault(),j.stopPropagation();let ye=f.find(Ot=>Ot.id===q);if(!ye)return;m(new Set([q])),de.current="resize";let Ae=j.clientX,qe=j.clientY,me={...ye.currentRect},Me=ye.originalRect,Ue=me.width/me.height,It={...me},jt=document.querySelector(`[data-rearrange-section="${q}"]`),Qt=Ot=>{let ke=Ot.clientX-Ae,Lt=Ot.clientY-qe,At=me.x,T=me.y,L=me.width,z=me.height;if(J.includes("e")&&(L=Math.max(Au,me.width+ke)),J.includes("w")&&(L=Math.max(Au,me.width-ke),At=me.x+me.width-L),J.includes("s")&&(z=Math.max(Au,me.height+Lt)),J.includes("n")&&(z=Math.max(Au,me.height-Lt),T=me.y+me.height-z),Ot.shiftKey)if(J.length===2){let te=Math.abs(L-me.width),Ne=Math.abs(z-me.height);te>Ne?z=L/Ue:L=z*Ue,J.includes("w")&&(At=me.x+me.width-L),J.includes("n")&&(T=me.y+me.height-z)}else J==="e"||J==="w"?z=L/Ue:L=z*Ue,J==="w"&&(At=me.x+me.width-L),J==="n"&&(T=me.y+me.height-z);It={x:At,y:T,width:L,height:z},jt&&(jt.style.left=`${At}px`,jt.style.top=`${T-U}px`,jt.style.width=`${L}px`,jt.style.height=`${z}px`),rt({x:Ot.clientX+12,y:Ot.clientY+12,text:`${Math.round(L)} \xD7 ${Math.round(z)}`}),Et(new Map([[q,It]]))},Kt=()=>{window.removeEventListener("mousemove",Qt),window.removeEventListener("mouseup",Kt),rt(null),de.current=null,Et(new Map),t({...e,sections:f.map(Ot=>Ot.id===q?{...Ot,currentRect:It}:Ot)})};window.addEventListener("mousemove",Qt),window.addEventListener("mouseup",Kt)},[f,e,t,U]),re=(0,zt.useCallback)(j=>{Ce(q=>{let J=new Set(q);return J.add(j),J}),m(q=>{let J=new Set(q);return J.delete(j),J}),Ct(()=>{let q=C.current;t({...q,sections:q.sections.filter(J=>J.id!==j),originalOrder:q.originalOrder.filter(J=>J!==j)}),Ce(J=>{let ye=new Set(J);return ye.delete(j),ye})},180)},[t]),ae=j=>{let q=j.originalRect,J=j.currentRect;return Math.abs(q.x-J.x)>1||Math.abs(q.y-J.y)>1||Math.abs(q.width-J.width)>1||Math.abs(q.height-J.height)>1},ve=j=>{let q=j.originalRect,J=j.currentRect;return Math.abs(q.x-J.x)>1||Math.abs(q.y-J.y)>1},Ge=j=>{let q=j.originalRect,J=j.currentRect;return Math.abs(q.width-J.width)>1||Math.abs(q.height-J.height)>1};for(let j of f)ze.current.has(j.id)||(ve(j)?ze.current.set(j.id,"move"):Ge(j)&&ze.current.set(j.id,"resize"));for(let j of ze.current.keys())f.some(q=>q.id===j)||ze.current.delete(j);let Xe=f.filter(j=>{try{if(he.has(j.id)||w.has(j.id))return!0;let q=document.querySelector(j.selector);if(!q)return!1;let J=q.getBoundingClientRect(),ye=j.originalRect;return Math.abs(J.width-ye.width)+Math.abs(J.height-ye.height)<200}catch{return!1}}),it=Xe.filter(j=>ae(j)),Pt=Xe.filter(j=>!ae(j)),Qe=new Set(it.map(j=>j.id));for(let j of Re.current)Qe.has(j)||Re.current.delete(j);let bt=[...Qe].sort().join(",");for(let j of it)Ft.current.set(j.id,{currentRect:j.currentRect,originalRect:j.originalRect,isFixed:j.isFixed});return(0,zt.useEffect)(()=>{let j=Rt.current;Rt.current=Qe;let q=new Map;for(let J of j)if(!Qe.has(J)){if(!f.some(Ae=>Ae.id===J))continue;let ye=Ft.current.get(J);ye&&(q.set(J,{orig:ye.originalRect,target:ye.currentRect,isFixed:ye.isFixed}),Ft.current.delete(J))}if(q.size>0){Ye(ye=>{let Ae=new Map(ye);for(let[qe,me]of q)Ae.set(qe,me);return Ae});let J=Ct(()=>{Ye(ye=>{let Ae=new Map(ye);for(let qe of q.keys())Ae.delete(qe);return Ae})},250);return()=>clearTimeout(J)}},[bt,f]),(0,nn.jsxs)(nn.Fragment,{children:[(0,nn.jsxs)("div",{className:`${xe.rearrangeOverlay} ${n?"":xe.light} ${o?xe.overlayExiting:""}${r?` ${r}`:""}`,"data-feedback-toolbar":!0,children:[Pe&&(0,nn.jsx)("div",{className:xe.hoverHighlight,style:{left:Pe.x,top:Pe.y,width:Pe.w,height:Pe.h}}),Pt.map(j=>{let q=j.currentRect,J=j.isFixed?q.y:q.y-U,ye=d2,Ae=w.has(j.id);return(0,nn.jsxs)("div",{"data-rearrange-section":j.id,className:`${xe.sectionOutline} ${Ae?xe.selected:""} ${S||o||he.has(j.id)?xe.exiting:""}`,style:{left:q.x,top:J,width:q.width,height:q.height,borderColor:ye.border,backgroundColor:ye.bg,...qt?{}:{opacity:0,animation:"none",transition:"none"}},onMouseDown:qe=>on(qe,j.id),onDoubleClick:()=>K(j.id),children:[(0,nn.jsx)("span",{className:xe.sectionLabel,style:{backgroundColor:ye.pill},children:j.label}),(0,nn.jsx)("span",{className:`${xe.sectionAnnotation} ${j.note?xe.annotationVisible:""}`,children:(j.note&&Oe.current.set(j.id,j.note),j.note||Oe.current.get(j.id)||"")}),(0,nn.jsxs)("span",{className:xe.sectionDimensions,children:[Math.round(q.width)," \xD7 ",Math.round(q.height)]}),(0,nn.jsx)("div",{className:xe.deleteButton,onMouseDown:qe=>qe.stopPropagation(),onClick:()=>re(j.id),children:"\u2715"}),u2.map(qe=>(0,nn.jsx)("div",{className:`${xe.handle} ${xe[`handle${qe.charAt(0).toUpperCase()}${qe.slice(1)}`]}`,onMouseDown:me=>R(me,j.id,qe)},qe))]},j.id)}),it.map(j=>{let q=j.currentRect,J=j.isFixed?q.y:q.y-U,ye=w.has(j.id),Ae=ve(j),qe=Ge(j);if(i&&!ye)return null;let Me=!Re.current.has(j.id);return Me&&Re.current.add(j.id),(0,nn.jsxs)("div",{"data-rearrange-section":j.id,className:`${xe.ghostOutline} ${ye?xe.selected:""} ${S||o||he.has(j.id)?xe.exiting:""}`,style:{left:q.x,top:J,width:q.width,height:q.height,...qt?{}:{opacity:0,animation:"none",transition:"none"},...Me?{}:{animation:"none"}},onMouseDown:Ue=>on(Ue,j.id),onDoubleClick:()=>K(j.id),children:[(0,nn.jsx)("span",{className:xe.sectionLabel,style:{backgroundColor:d2.pill},children:j.label}),(0,nn.jsx)("span",{className:`${xe.sectionAnnotation} ${j.note?xe.annotationVisible:""}`,children:(j.note&&Oe.current.set(j.id,j.note),j.note||Oe.current.get(j.id)||"")}),(0,nn.jsxs)("span",{className:xe.sectionDimensions,children:[Math.round(q.width)," \xD7 ",Math.round(q.height)]}),(0,nn.jsx)("div",{className:xe.deleteButton,onMouseDown:Ue=>Ue.stopPropagation(),onClick:()=>re(j.id),children:"\u2715"}),u2.map(Ue=>(0,nn.jsx)("div",{className:`${xe.handle} ${xe[`handle${Ue.charAt(0).toUpperCase()}${Ue.slice(1)}`]}`,onMouseDown:It=>R(It,j.id,Ue)},Ue)),(0,nn.jsx)("span",{className:xe.ghostBadge,children:(()=>{let Ue=ze.current.get(j.id);if(Ae&&qe){let[It,jt]=Ue==="resize"?["Resize","Move"]:["Move","Resize"];return(0,nn.jsxs)(nn.Fragment,{children:["Suggested ",It," ",(0,nn.jsxs)("span",{className:xe.ghostBadgeExtra,children:["& ",jt]})]})}return`Suggested ${qe?"Resize":"Move"}`})()})]},j.id)})]}),!i&&(()=>{let j=[];for(let q of it){let J=Ke.get(q.id);j.push({id:q.id,orig:q.originalRect,target:J||q.currentRect,isFixed:q.isFixed,isSelected:w.has(q.id),isExiting:he.has(q.id)})}for(let[q,J]of Ke)if(!j.some(ye=>ye.id===q)){let ye=f.find(Ae=>Ae.id===q);ye&&j.push({id:q,orig:ye.originalRect,target:J,isFixed:ye.isFixed,isSelected:w.has(q)})}for(let[q,J]of dn)j.some(ye=>ye.id===q)||j.push({id:q,orig:J.orig,target:J.target,isFixed:J.isFixed,isSelected:!1,isExiting:!0});return j.length===0?null:(0,nn.jsxs)("svg",{className:`${xe.connectorSvg} ${S||o?xe.connectorExiting:""}`,children:[j.map(({id:q,orig:J,target:ye,isFixed:Ae,isSelected:qe,isExiting:me})=>{let Me=J.x+J.width/2,Ue=(Ae?J.y:J.y-U)+J.height/2,It=ye.x+ye.width/2,jt=(Ae?ye.y:ye.y-U)+ye.height/2,Qt=It-Me,Kt=jt-Ue,Ot=Math.sqrt(Qt*Qt+Kt*Kt);if(Ot<2)return null;let ke=Math.min(1,Ot/40),Lt=Math.min(Ot*.3,60),At=Ot>0?-Kt/Ot:0,T=Ot>0?Qt/Ot:0,L=(Me+It)/2+At*Lt,z=(Ue+jt)/2+T*Lt,Z=Ke.has(q),te=Z||qe?1:.4,Ne=Z||qe?1:.5;return(0,nn.jsxs)("g",{className:me?xe.connectorExiting:"",children:[(0,nn.jsx)("path",{className:xe.connectorLine,d:`M ${Me} ${Ue} Q ${L} ${z} ${It} ${jt}`,fill:"none",stroke:"rgba(59, 130, 246, 0.45)",strokeWidth:"1.5",opacity:te*ke}),(0,nn.jsx)("circle",{className:xe.connectorDot,cx:Me,cy:Ue,r:4*ke,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:Ne*ke,filter:"url(#connDotShadow)"}),(0,nn.jsx)("circle",{className:xe.connectorDot,cx:It,cy:jt,r:4*ke,fill:"rgba(59, 130, 246, 0.8)",stroke:"#fff",strokeWidth:"1.5",opacity:Ne*ke,filter:"url(#connDotShadow)"})]},`conn-${q}`)}),(0,nn.jsx)("defs",{children:(0,nn.jsx)("filter",{id:"connDotShadow",x:"-50%",y:"-50%",width:"200%",height:"200%",children:(0,nn.jsx)("feDropShadow",{dx:"0",dy:"0.5",stdDeviation:"1",floodOpacity:"0.15"})})})]})})(),A&&(()=>{let j=f.find(jt=>jt.id===A);if(!j)return null;let q=j.currentRect,J=j.isFixed?q.y:q.y-U,ye=q.x+q.width/2,Ae=J-8,qe=J+q.height+8,me=Ae>200,Me=qe<window.innerHeight-100,Ue=Math.max(160,Math.min(window.innerWidth-160,ye)),It;return me?It={left:Ue,bottom:window.innerHeight-Ae}:Me?It={left:Ue,top:qe}:It={left:Ue,top:Math.max(80,window.innerHeight/2-80)},(0,nn.jsx)(zu,{element:j.label,placeholder:"Add a note about this section",initialValue:j.note??"",submitLabel:le.current?"Save":"Set",onSubmit:Y,onCancel:W,onDelete:le.current?()=>{Y("")}:void 0,isExiting:G,lightMode:!n,style:It})})(),$e&&(0,nn.jsx)("div",{className:xe.sizeIndicator,style:{left:$e.x,top:$e.y},"data-feedback-toolbar":!0,children:$e.text}),Ve.map((j,q)=>(0,nn.jsx)("div",{className:xe.guideLine,style:j.axis==="x"?{position:"fixed",left:j.pos,top:0,width:1,height:"100vh"}:{position:"fixed",left:0,top:j.pos-U,width:"100vw",height:1}},`${j.axis}-${j.pos}-${q}`))]})}var Am=new Set(["script","style","noscript","link","meta","br","hr"]);function P3(){let e=document.querySelector("main")||document.body,t=[],n=Array.from(e.children),o=e!==document.body&&n.length<3?Array.from(document.body.children):n;for(let r of o){if(!(r instanceof HTMLElement)||Am.has(r.tagName.toLowerCase())||r.hasAttribute("data-feedback-toolbar"))continue;let i=window.getComputedStyle(r);if(i.display==="none"||i.visibility==="hidden")continue;let s=r.getBoundingClientRect();if(!(s.height<10||s.width<10)){t.push({label:Fu(r),selector:$s(r),top:s.top,bottom:s.bottom,left:s.left,right:s.right,area:s.width*s.height});for(let a of Array.from(r.children)){if(!(a instanceof HTMLElement)||Am.has(a.tagName.toLowerCase())||a.hasAttribute("data-feedback-toolbar"))continue;let l=window.getComputedStyle(a);if(l.display==="none"||l.visibility==="hidden")continue;let d=a.getBoundingClientRect();d.height<10||d.width<10||t.push({label:Fu(a),selector:$s(a),top:d.top,bottom:d.bottom,left:d.left,right:d.right,area:d.width*d.height})}}}return t}function D3(e){let t=window.scrollY;return e.map(({label:n,selector:o,rect:r})=>{let i=r.y-t;return{label:n,selector:o,top:i,bottom:i+r.height,left:r.x,right:r.x+r.width,area:r.width*r.height}})}function z3(e){let t=window.scrollY,n=e.y-t,o=e.x;return{top:n,bottom:n+e.height,left:o,right:o+e.width,area:e.width*e.height}}function Lm(e,t){let n=t?D3(t):P3(),o=z3(e),r=null,i=null,s=null,a=null,l=null;for(let w of n){if(Math.abs(w.left-o.left)<2&&Math.abs(w.top-o.top)<2&&Math.abs(w.right-w.left-e.width)<2&&Math.abs(w.bottom-w.top-e.height)<2)continue;w.left<=o.left+2&&w.right>=o.right-2&&w.top<=o.top+2&&w.bottom>=o.bottom-2&&w.area>o.area*1.5&&(!l||w.area<l._area)&&(l={label:w.label,selector:w.selector,_area:w.area});let m=o.right>w.left+5&&o.left<w.right-5,S=o.bottom>w.top+5&&o.top<w.bottom-5;if(m&&w.bottom<=o.top+5){let g=Math.round(o.top-w.bottom);(!r||g<r._dist)&&(r={label:w.label,selector:w.selector,gap:Math.max(0,g),_dist:g})}if(m&&w.top>=o.bottom-5){let g=Math.round(w.top-o.bottom);(!i||g<i._dist)&&(i={label:w.label,selector:w.selector,gap:Math.max(0,g),_dist:g})}if(S&&w.right<=o.left+5){let g=Math.round(o.left-w.right);(!s||g<s._dist)&&(s={label:w.label,selector:w.selector,gap:Math.max(0,g),_dist:g})}if(S&&w.left>=o.right-5){let g=Math.round(w.left-o.right);(!a||g<a._dist)&&(a={label:w.label,selector:w.selector,gap:Math.max(0,g),_dist:g})}}let d=window.innerWidth,c=window.innerHeight,p=B3(e,d),f=w=>w?{label:w.label,selector:w.selector,gap:w.gap}:null,C=F3(o,e,d,c,l?{label:l.label,selector:l.selector,_area:l._area}:null,n);return{above:f(r),below:f(i),left:f(s),right:f(a),alignment:p,containedIn:l?{label:l.label,selector:l.selector}:null,outOfBounds:C}}function F3(e,t,n,o,r,i){let s={},a=!1,l=[];if(e.left<-2&&l.push("left"),e.right>n+2&&l.push("right"),e.top<-2&&l.push("top"),e.bottom>o+2&&l.push("bottom"),l.length>0&&(s.viewport=l,a=!0),r){let d=i.find(c=>c.label===r.label&&c.selector===r.selector&&Math.abs(c.area-r._area)<10);if(d){let c=[];e.left<d.left-2&&c.push("left"),e.right>d.right+2&&c.push("right"),e.top<d.top-2&&c.push("top"),e.bottom>d.bottom+2&&c.push("bottom"),c.length>0&&(s.container={label:r.label,edges:c},a=!0)}}return a?s:null}function B3(e,t){if(e.width/t>.85)return"full-width";let o=e.x+e.width/2,r=t/2,i=o-r,s=t*.08;return Math.abs(i)<s?"center":i<0?"left":"right"}function z2(e){switch(e){case"full-width":return"full-width";case"center":return"centered";case"left":return"left-aligned";case"right":return"right-aligned"}}function F2(e,t={}){let n=[];e.above&&n.push(`Below \`${e.above.label}\`${e.above.gap>0?` (${e.above.gap}px gap)`:""}`),e.below&&n.push(`Above \`${e.below.label}\`${e.below.gap>0?` (${e.below.gap}px gap)`:""}`),t.includeLeftRight&&(e.left&&n.push(`Right of \`${e.left.label}\`${e.left.gap>0?` (${e.left.gap}px gap)`:""}`),e.right&&n.push(`Left of \`${e.right.label}\`${e.right.gap>0?` (${e.right.gap}px gap)`:""}`));let o=z2(e.alignment);return e.containedIn?n.push(`${o.charAt(0).toUpperCase()+o.slice(1)} in \`${e.containedIn.label}\``):n.push(`${o.charAt(0).toUpperCase()+o.slice(1)} in page`),t.includePixelRef&&t.pixelRef&&n.push(`Pixel ref: \`${t.pixelRef}\``),e.outOfBounds&&(e.outOfBounds.viewport&&n.push(`**Outside viewport** (${e.outOfBounds.viewport.join(", ")} edge${e.outOfBounds.viewport.length>1?"s":""})`),e.outOfBounds.container&&n.push(`**Outside \`${e.outOfBounds.container.label}\`** (${e.outOfBounds.container.edges.join(", ")} edge${e.outOfBounds.container.edges.length>1?"s":""})`)),n}function W3(e,t,n){let o=[];e.above&&o.push(`below \`${e.above.label}\``),e.below&&o.push(`above \`${e.below.label}\``),e.left&&o.push(`right of \`${e.left.label}\``),e.right&&o.push(`left of \`${e.right.label}\``),e.containedIn&&o.push(`inside \`${e.containedIn.label}\``),o.push(z2(e.alignment)),e.outOfBounds?.viewport&&o.push(`**outside viewport** (${e.outOfBounds.viewport.join(", ")})`),e.outOfBounds?.container&&o.push(`**outside \`${e.outOfBounds.container.label}\`** (${e.outOfBounds.container.edges.join(", ")})`);let r=n?`, ${Math.round(n.width)}\xD7${Math.round(n.height)}px`:"";return`at (${Math.round(t.x)}, ${Math.round(t.y)})${r}: ${o.join(", ")}`}var m2=15;function g2(e){if(e.length<2)return[];let t=[],n=new Set;for(let o=0;o<e.length;o++){if(n.has(o))continue;let r=[o];for(let i=o+1;i<e.length;i++)n.has(i)||Math.abs(e[o].rect.y-e[i].rect.y)<m2&&r.push(i);if(r.length>=2){let i=r.map(l=>e[l]);i.sort((l,d)=>l.rect.x-d.rect.x);let s=[];for(let l=0;l<i.length-1;l++)s.push(Math.round(i[l+1].rect.x-(i[l].rect.x+i[l].rect.width)));let a=Math.round(i.reduce((l,d)=>l+d.rect.y,0)/i.length);t.push({labels:i.map(l=>l.label),type:"row",sharedEdge:a,gaps:s,avgGap:s.length?Math.round(s.reduce((l,d)=>l+d,0)/s.length):0}),r.forEach(l=>n.add(l))}}for(let o=0;o<e.length;o++){if(n.has(o))continue;let r=[o];for(let i=o+1;i<e.length;i++)n.has(i)||Math.abs(e[o].rect.x-e[i].rect.x)<m2&&r.push(i);if(r.length>=2){let i=r.map(l=>e[l]);i.sort((l,d)=>l.rect.y-d.rect.y);let s=[];for(let l=0;l<i.length-1;l++)s.push(Math.round(i[l+1].rect.y-(i[l].rect.y+i[l].rect.height)));let a=Math.round(i.reduce((l,d)=>l+d.rect.x,0)/i.length);t.push({labels:i.map(l=>l.label),type:"column",sharedEdge:a,gaps:s,avgGap:s.length?Math.round(s.reduce((l,d)=>l+d,0)/s.length):0}),r.forEach(l=>n.add(l))}}return t}function H3(e){if(e.length<2)return[];let t=g2(e.map(s=>({label:s.label,rect:s.originalRect}))),n=g2(e.map(s=>({label:s.label,rect:s.currentRect}))),o=[],r=new Set;for(let s of t){let a=new Set(s.labels),l=null,d=0;for(let c of n){let p=c.labels.filter(f=>a.has(f)).length;p>=2&&p>d&&(l=c,d=p)}if(l){let c=l.labels.filter(f=>a.has(f)),p=c.join(", ");if(l.type!==s.type){let f=s.type==="row"?"y":"x",C=l.type==="row"?"y":"x";o.push(`**${p}**: ${s.type} (${f}\u2248${s.sharedEdge}, ${s.avgGap}px gaps) \u2192 ${l.type} (${C}\u2248${l.sharedEdge}, ${l.avgGap}px gaps)`)}else if(Math.abs(s.sharedEdge-l.sharedEdge)>20||Math.abs(s.avgGap-l.avgGap)>5){let f=s.type==="row"?"y":"x",C=Math.abs(s.sharedEdge-l.sharedEdge)>20?` ${f}: ${s.sharedEdge} \u2192 ${l.sharedEdge}`:"",w=Math.abs(s.avgGap-l.avgGap)>5?` gaps: ${s.avgGap}px \u2192 ${l.avgGap}px`:"";o.push(`**${p}**: ${s.type} shifted \u2014${C}${w}`)}c.forEach(f=>r.add(f))}else{let c=s.labels.join(", "),p=s.type==="row"?"y":"x";o.push(`**${c}**: ${s.type} (${p}\u2248${s.sharedEdge}) dissolved`),s.labels.forEach(f=>r.add(f))}}for(let s of n){if(s.labels.every(d=>r.has(d))||s.labels.filter(d=>!r.has(d)).length<2)continue;if(!t.some(d=>d.labels.filter(p=>s.labels.includes(p)).length>=2)){let d=s.type==="row"?"y":"x";o.push(`**${s.labels.join(", ")}**: new ${s.type} (${d}\u2248${s.sharedEdge}, ${s.avgGap}px gaps)`),s.labels.forEach(c=>r.add(c))}}let i=e.filter(s=>!r.has(s.label));if(i.length>=2){let s={};for(let a of i){let l=Math.round(a.currentRect.x/5)*5;(s[l]??(s[l]=[])).push(a.label)}for(let[a,l]of Object.entries(s))l.length>=2&&o.push(`**${l.join(", ")}**: shared left edge at x\u2248${a}`)}return o}function B2(e){if(typeof document>"u")return{viewport:e,contentArea:null};let t=[],n=new Set,o=a=>{n.has(a)||a instanceof HTMLElement&&(a.hasAttribute("data-feedback-toolbar")||Am.has(a.tagName.toLowerCase())||(n.add(a),t.push(a)))},r=document.querySelector("main");r&&o(r);let i=document.querySelector("[role='main']");i&&o(i);for(let a of Array.from(document.body.children))if(o(a),a.children){for(let l of Array.from(a.children))if(o(l),l.children)for(let d of Array.from(l.children))o(d)}let s=null;for(let a of t){let l=a.getBoundingClientRect();if(l.height<50)continue;let d=getComputedStyle(a);if(d.maxWidth&&d.maxWidth!=="none"&&d.maxWidth!=="0px"){(!s||l.width<s.rect.width)&&(s={el:a,rect:l});continue}!s&&l.width<e.width-20&&l.width>100&&(s={el:a,rect:l})}if(s){let{el:a,rect:l}=s;return{viewport:e,contentArea:{width:Math.round(l.width),left:Math.round(l.left),right:Math.round(l.right),centerX:Math.round(l.left+l.width/2),selector:$s(a)}}}return{viewport:e,contentArea:null}}function j3(e){if(typeof document>"u")return null;let t=document.querySelector(e);if(!t?.parentElement)return null;let n=getComputedStyle(t.parentElement),o={parentDisplay:n.display,parentSelector:$s(t.parentElement)};return n.display.includes("flex")&&(o.flexDirection=n.flexDirection),n.display.includes("grid")&&n.gridTemplateColumns!=="none"&&(o.gridCols=n.gridTemplateColumns),n.gap&&n.gap!=="normal"&&n.gap!=="0px"&&(o.gap=n.gap),o}function W2(e,t){let n=t.contentArea,o=n?n.width:t.viewport.width,r=n?n.left:0,i=n?n.centerX:Math.round(t.viewport.width/2),s=Math.round(e.x-r),a=Math.round(r+o-(e.x+e.width)),l=(e.width/o*100).toFixed(1),d=e.x+e.width/2,c=Math.abs(d-i)<20,p=e.width/o>.95,f=[];return p?f.push("`width: 100%` of container"):f.push(`left \`${s}px\` in container, right \`${a}px\`, width \`${l}%\` (\`${Math.round(e.width)}px\`)`),c&&!p&&f.push("centered \u2014 `margin-inline: auto`"),f.join(" \u2014 ")}function H2(e){let{viewport:t,contentArea:n}=e,o=`### Reference Frame
`;if(o+=`- Viewport: \`${t.width}\xD7${t.height}px\`
`,n){let r=n;o+=`- Content area: \`${r.width}px\` wide, left edge at \`x=${r.left}\`, right at \`x=${r.right}\` (\`${r.selector}\`)
`,o+=`- Pixel \u2192 CSS translation:
`,o+=`  - **Horizontal position in container**: \`element.x - ${r.left}\` \u2192 use as \`margin-left\` or \`left\`
`,o+=`  - **Width as % of container**: \`element.width / ${r.width} \xD7 100\` \u2192 use as \`width: X%\`
`,o+="  - **Vertical gap between elements**: `nextElement.y - (prevElement.y + prevElement.height)` \u2192 use as `margin-top` or `gap`\n",o+=`  - **Centered**: if \`|element.centerX - ${r.centerX}| < 20px\` \u2192 use \`margin-inline: auto\`
`}else o+=`- No distinct content container \u2014 elements positioned relative to full viewport
`,o+=`- Pixel \u2192 CSS translation:
`,o+=`  - **Width as % of viewport**: \`element.width / ${t.width} \xD7 100\` \u2192 use as \`width: X%\`
`,o+=`  - **Centered**: if \`|(element.x + element.width/2) - ${Math.round(t.width/2)}| < 20px\` \u2192 use \`margin-inline: auto\`
`;return o+=`
`,o}function U3(e){let t=j3(e);if(!t)return null;let n=`\`${t.parentDisplay}\``;return t.flexDirection&&(n+=`, flex-direction: \`${t.flexDirection}\``),t.gridCols&&(n+=`, grid-template-columns: \`${t.gridCols}\``),t.gap&&(n+=`, gap: \`${t.gap}\``),`Parent: ${n} (\`${t.parentSelector}\`)`}function _2(e,t,n,o="standard"){if(e.length===0)return"";let r=[...e].sort((S,g)=>Math.abs(S.y-g.y)<20?S.x-g.x:S.y-g.y),i="";if(n?.blankCanvas?(i+=`## Wireframe: New Page

`,n.wireframePurpose&&(i+=`> **Purpose:** ${n.wireframePurpose}
>
`),i+=`> ${e.length} component${e.length!==1?"s":""} placed \u2014 this is a standalone wireframe, not related to the current page.
>
> This wireframe is a rough sketch for exploring ideas.

`):i+=`## Design Layout

> ${e.length} component${e.length!==1?"s":""} placed

`,o==="compact")return i+=`### Components
`,r.forEach((S,g)=>{let y=Lr[S.type]?.label||S.type;i+=`${g+1}. **${y}** \u2014 \`${Math.round(S.width)}\xD7${Math.round(S.height)}px\` at \`(${Math.round(S.x)}, ${Math.round(S.y)})\`
`}),i;let s=B2(t);i+=H2(s),i+=`### Components
`,r.forEach((S,g)=>{let y=Lr[S.type]?.label||S.type,E={x:S.x,y:S.y,width:S.width,height:S.height};i+=`${g+1}. **${y}** \u2014 \`${Math.round(S.width)}\xD7${Math.round(S.height)}px\` at \`(${Math.round(S.x)}, ${Math.round(S.y)})\`
`;let A=Lm(E),G=F2(A,{includeLeftRight:o==="detailed"||o==="forensic"});for(let le of G)i+=`   - ${le}
`;let D=W2(E,s);D&&(i+=`   - CSS: ${D}
`)}),i+=`
### Layout Analysis
`;let a=[];for(let S of r){let g=a.find(y=>Math.abs(y.y-S.y)<30);g?g.items.push(S):a.push({y:S.y,items:[S]})}if(a.sort((S,g)=>S.y-g.y),a.forEach((S,g)=>{S.items.sort((E,A)=>E.x-A.x);let y=S.items.map(E=>Lr[E.type]?.label||E.type);if(S.items.length===1){let A=S.items[0].width>t.width*.8;i+=`- Row ${g+1} (y\u2248${Math.round(S.y)}): ${y[0]}${A?" \u2014 full width":""}
`}else i+=`- Row ${g+1} (y\u2248${Math.round(S.y)}): ${y.join(" | ")} \u2014 ${S.items.length} items side by side
`}),o==="detailed"||o==="forensic"){i+=`
### Spacing & Gaps
`;for(let S=0;S<r.length-1;S++){let g=r[S],y=r[S+1],E=Lr[g.type]?.label||g.type,A=Lr[y.type]?.label||y.type,Q=Math.round(y.y-(g.y+g.height)),G=Math.round(y.x-(g.x+g.width));Math.abs(g.y-y.y)<30?i+=`- ${E} \u2192 ${A}: \`${G}px\` horizontal gap
`:i+=`- ${E} \u2192 ${A}: \`${Q}px\` vertical gap
`}if(o==="forensic"&&r.length>2){i+=`
### All Pairwise Gaps
`;for(let S=0;S<r.length;S++)for(let g=S+1;g<r.length;g++){let y=r[S],E=r[g],A=Lr[y.type]?.label||y.type,Q=Lr[E.type]?.label||E.type,G=Math.round(E.y-(y.y+y.height)),D=Math.round(E.x-(y.x+y.width));i+=`- ${A} \u2194 ${Q}: h=\`${D}px\` v=\`${G}px\`
`}}o==="forensic"&&(i+=`
### Z-Order (placement order)
`,e.forEach((S,g)=>{let y=Lr[S.type]?.label||S.type;i+=`${g}. ${y} at \`(${Math.round(S.x)}, ${Math.round(S.y)})\`
`}))}i+=`
### Suggested Implementation
`;let l=r.some(S=>S.type==="navigation"),d=r.some(S=>S.type==="hero"),c=r.some(S=>S.type==="sidebar"),p=r.some(S=>S.type==="footer"),f=r.filter(S=>S.type==="card"),C=r.filter(S=>S.type==="form"),w=r.filter(S=>S.type==="table"),m=r.filter(S=>S.type==="modal");if(l&&(i+=`- Top navigation bar with logo + nav links + CTA
`),d&&(i+=`- Hero section with heading, subtext, and call-to-action
`),c&&(i+=`- Sidebar layout \u2014 use CSS Grid with sidebar + main content area
`),f.length>1?i+=`- ${f.length}-column card grid \u2014 use CSS Grid or Flexbox
`:f.length===1&&(i+=`- Card component with image + content area
`),C.length>0&&(i+=`- ${C.length} form${C.length>1?"s":""} \u2014 add proper labels, validation, and submit handling
`),w.length>0&&(i+=`- Data table \u2014 consider sortable columns and pagination
`),m.length>0&&(i+=`- Modal dialog \u2014 add overlay backdrop and focus trapping
`),p&&(i+=`- Multi-column footer with links
`),o==="detailed"||o==="forensic"){if(i+=`
### CSS Suggestions
`,c){let S=r.find(g=>g.type==="sidebar");i+=`- \`display: grid; grid-template-columns: ${Math.round(S.width)}px 1fr;\`
`}if(f.length>1){let S=Math.round(f[0].width);i+=`- \`display: grid; grid-template-columns: repeat(${f.length}, ${S}px); gap: 16px;\`
`}l&&(i+="- Navigation: `position: sticky; top: 0; z-index: 50;`\n")}return i}function y2(e,t="standard",n){let{sections:o}=e,r=[];for(let c of o){let p=c.originalRect,f=c.currentRect,C=Math.abs(p.x-f.x)>1||Math.abs(p.y-f.y)>1,w=Math.abs(p.width-f.width)>1||Math.abs(p.height-f.height)>1;if(!C&&!w){t==="forensic"&&r.push({section:c,posMoved:!1,sizeChanged:!1});continue}r.push({section:c,posMoved:C,sizeChanged:w})}if(r.length===0||t!=="forensic"&&r.every(c=>!c.posMoved&&!c.sizeChanged))return"";let i=`## Suggested Layout Changes

`,s=n?n.width:typeof window<"u"?window.innerWidth:0,a=n?n.height:typeof window<"u"?window.innerHeight:0,l=B2({width:s,height:a});t!=="compact"&&(i+=H2(l)),t==="forensic"&&(i+=`> Detected at: \`${new Date(e.detectedAt).toISOString()}\`
`,i+=`> Total sections: ${o.length}

`);let d=c=>o.map(p=>({label:p.label,selector:p.selector,rect:c==="original"?p.originalRect:p.currentRect}));i+=`**Changes:**
`;for(let{section:c,posMoved:p,sizeChanged:f}of r){let C=c.originalRect,w=c.currentRect;if(!p&&!f){i+=`- ${c.label} \u2014 unchanged at (${Math.round(w.x)}, ${Math.round(w.y)}) ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`;continue}if(t==="compact"){p&&f?i+=`- Suggested: move **${c.label}** to (${Math.round(w.x)}, ${Math.round(w.y)}) ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`:p?i+=`- Suggested: move **${c.label}** to (${Math.round(w.x)}, ${Math.round(w.y)})
`:i+=`- Suggested: resize **${c.label}** to ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`;continue}if(p&&f?i+=`- Suggested: move and resize **${c.label}**
`:p?i+=`- Suggested: move **${c.label}**
`:i+=`- Suggested: resize **${c.label}** from ${Math.round(C.width)}\xD7${Math.round(C.height)}px to ${Math.round(w.width)}\xD7${Math.round(w.height)}px
`,p){let S=Lm(C,d("original")),g=Lm(w,d("current")),y=f?{width:C.width,height:C.height}:void 0;i+=`  - Currently ${W3(S,{x:C.x,y:C.y},y)}
`;let E=f?{width:w.width,height:w.height}:void 0,A=`at (${Math.round(w.x)}, ${Math.round(w.y)})`,Q=E?`, ${Math.round(E.width)}\xD7${Math.round(E.height)}px`:"",D=F2(g,{includeLeftRight:t==="detailed"||t==="forensic"});if(D.length>0){i+=`  - Suggested position ${A}${Q}: ${D[0]}
`;for(let K=1;K<D.length;K++)i+=`    ${D[K]}
`}else i+=`  - Suggested position ${A}${Q}
`;let le=W2(w,l);le&&(i+=`  - CSS: ${le}
`)}let m=U3(c.selector);if(m&&(i+=`  - ${m}
`),i+=`  - Selector: \`${c.selector}\`
`,t==="detailed"||t==="forensic"){let S=c.className?`${c.tagName}.${c.className.split(" ")[0]}`:c.tagName;S!==c.selector&&(i+=`  - Element: \`${S}\`
`),c.role&&(i+=`  - Role: \`${c.role}\`
`),t==="forensic"&&c.textSnippet&&(i+=`  - Text: "${c.textSnippet}"
`)}t==="forensic"&&(i+=`  - Original rect: \`{ x: ${Math.round(C.x)}, y: ${Math.round(C.y)}, w: ${Math.round(C.width)}, h: ${Math.round(C.height)} }\`
`,i+=`  - Current rect: \`{ x: ${Math.round(w.x)}, y: ${Math.round(w.y)}, w: ${Math.round(w.width)}, h: ${Math.round(w.height)} }\`
`)}if(t!=="compact"){let c=r.filter(f=>f.posMoved).map(f=>({label:f.section.label,originalRect:f.section.originalRect,currentRect:f.section.currentRect})),p=H3(c);if(p.length>0){i+=`
### Layout Summary
`;for(let f of p)i+=`- ${f}
`}}if(t!=="compact"&&o.length>1){i+=`
### All Sections (current positions)
`;let c=[...o].sort((p,f)=>Math.abs(p.currentRect.y-f.currentRect.y)<20?p.currentRect.x-f.currentRect.x:p.currentRect.y-f.currentRect.y);for(let p of c){let f=p.currentRect,C=Math.abs(f.x-p.originalRect.x)>1||Math.abs(f.y-p.originalRect.y)>1||Math.abs(f.width-p.originalRect.width)>1||Math.abs(f.height-p.originalRect.height)>1;i+=`- ${p.label}: \`${Math.round(f.width)}\xD7${Math.round(f.height)}px\` at \`(${Math.round(f.x)}, ${Math.round(f.y)})\`${C?" \u2190 suggested":""}
`}}return i}var $m="feedback-annotations-",j2=7;function Bu(e){return`${$m}${e}`}function ym(e){if(typeof window>"u")return[];try{let t=localStorage.getItem(Bu(e));if(!t)return[];let n=JSON.parse(t),o=Date.now()-j2*24*60*60*1e3;return n.filter(r=>!r.timestamp||r.timestamp>o)}catch{return[]}}function U2(e,t){if(!(typeof window>"u"))try{localStorage.setItem(Bu(e),JSON.stringify(t))}catch{}}function q3(){let e=new Map;if(typeof window>"u")return e;try{let t=Date.now()-j2*24*60*60*1e3;for(let n=0;n<localStorage.length;n++){let o=localStorage.key(n);if(o?.startsWith($m)){let r=o.slice($m.length),i=localStorage.getItem(o);if(i){let a=JSON.parse(i).filter(l=>!l.timestamp||l.timestamp>t);a.length>0&&e.set(r,a)}}}}catch{}return e}function ac(e,t,n){let o=t.map(r=>({...r,_syncedTo:n}));U2(e,o)}var Pm="agentation-design-";function K3(e){if(typeof window>"u")return[];try{let t=localStorage.getItem(`${Pm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`);return t?JSON.parse(t):[]}catch{return[]}}function Y3(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${Pm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`,JSON.stringify(t))}catch{}}function V3(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${Pm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`)}catch{}}var Dm="agentation-rearrange-";function G3(e){if(typeof window>"u")return null;try{let t=localStorage.getItem(`${Dm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`);return t?JSON.parse(t):null}catch{return null}}function X3(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${Dm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`,JSON.stringify(t))}catch{}}function Q3(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${Dm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`)}catch{}}var zm="agentation-wireframe-";function J3(e){if(typeof window>"u")return null;try{let t=localStorage.getItem(`${zm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`);return t?JSON.parse(t):null}catch{return null}}function x2(e,t){if(!(typeof window>"u"))try{localStorage.setItem(`${zm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`,JSON.stringify(t))}catch{}}function $u(e){if(!(typeof window>"u"))try{localStorage.removeItem(`${zm}${e}@${window.__AGENTATION_KIT_VIEWPORT__?.().name||"desktop"}`)}catch{}}var q2="agentation-session-";function Fm(e){return`${q2}${e}`}function Z3(e){if(typeof window>"u")return null;try{return localStorage.getItem(Fm(e))}catch{return null}}function xm(e,t){if(!(typeof window>"u"))try{localStorage.setItem(Fm(e),t)}catch{}}function e6(e){if(!(typeof window>"u"))try{localStorage.removeItem(Fm(e))}catch{}}var Rm=`${q2}toolbar-hidden`;function t6(){if(typeof window>"u")return!1;try{return sessionStorage.getItem(Rm)==="1"}catch{return!1}}function n6(e){if(!(typeof window>"u"))try{e?sessionStorage.setItem(Rm,"1"):sessionStorage.removeItem(Rm)}catch{}}async function wm(e,t){let n=await fetch(`${e}/sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t,...window.__AGENTATION_KIT_SESSION_KEY_OF__?.(t)?{pageKey:window.__AGENTATION_KIT_SESSION_KEY_OF__(t)}:{}})});if(!n.ok)throw new Error(`Failed to create session: ${n.status}`);return n.json()}async function vm(e,t){let n=await fetch(`${e}/sessions/${t}`);if(!n.ok)throw new Error(`Failed to get session: ${n.status}`);return n.json()}async function Oa(e,t,n){n={...n,viewport:n.viewport||window.__AGENTATION_KIT_VIEWPORT__?.(),reviewer:n.reviewer||window.__AGENTATION_KIT_REVIEWER__?.()||void 0};let o=await fetch(`${e}/sessions/${t}/annotations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!o.ok)throw new Error(`Failed to sync annotation: ${o.status}`);return o.json()}async function w2(e,t,n){let o=await fetch(`${e}/annotations/${t}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!o.ok)throw new Error(`Failed to update annotation: ${o.status}`);return o.json()}async function _i(e,t){let n=window.__AGENTATION_KIT_REVIEWER__?.(),o=await fetch(`${e}/annotations/${t}${n?`?reviewer=${encodeURIComponent(n)}`:""}`,{method:"DELETE"});if(!o.ok)throw new Error(`Failed to delete annotation: ${o.status}`)}var ln={FunctionComponent:0,ClassComponent:1,IndeterminateComponent:2,HostRoot:3,HostPortal:4,HostComponent:5,HostText:6,Fragment:7,Mode:8,ContextConsumer:9,ContextProvider:10,ForwardRef:11,Profiler:12,SuspenseComponent:13,MemoComponent:14,SimpleMemoComponent:15,LazyComponent:16,IncompleteClassComponent:17,DehydratedFragment:18,SuspenseListComponent:19,ScopeComponent:21,OffscreenComponent:22,LegacyHiddenComponent:23,CacheComponent:24,TracingMarkerComponent:25,HostHoistable:26,HostSingleton:27,IncompleteFunctionComponent:28,Throw:29,ViewTransitionComponent:30,ActivityComponent:31},v2=new Set(["Component","PureComponent","Fragment","Suspense","Profiler","StrictMode","Routes","Route","Outlet","Root","ErrorBoundaryHandler","HotReload","Hot"]),b2=[/Boundary$/,/BoundaryHandler$/,/Provider$/,/Consumer$/,/^(Inner|Outer)/,/Router$/,/^Client(Page|Segment|Root)/,/^Segment(ViewNode|Node)$/,/^LayoutSegment/,/^Server(Root|Component|Render)/,/^RSC/,/Context$/,/^Hot(Reload)?$/,/^(Dev|React)(Overlay|Tools|Root)/,/Overlay$/,/Handler$/,/^With[A-Z]/,/Wrapper$/,/^Root$/],o6=[/Page$/,/View$/,/Screen$/,/Section$/,/Card$/,/List$/,/Item$/,/Form$/,/Modal$/,/Dialog$/,/Button$/,/Nav$/,/Header$/,/Footer$/,/Layout$/,/Panel$/,/Tab$/,/Menu$/];function r6(e){let t=e?.mode??"filtered",n=v2;if(e?.skipExact){let o=e.skipExact instanceof Set?e.skipExact:new Set(e.skipExact);n=new Set([...v2,...o])}return{maxComponents:e?.maxComponents??6,maxDepth:e?.maxDepth??30,mode:t,skipExact:n,skipPatterns:e?.skipPatterns?[...b2,...e.skipPatterns]:b2,userPatterns:e?.userPatterns??o6,filter:e?.filter}}function i6(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").replace(/([A-Z])([A-Z][a-z])/g,"$1-$2").toLowerCase()}function s6(e,t=10){let n=new Set,o=e,r=0;for(;o&&r<t;)o.className&&typeof o.className=="string"&&o.className.split(/\s+/).forEach(i=>{if(i.length>1){let s=i.replace(/[_][a-zA-Z0-9]{5,}.*$/,"").toLowerCase();s.length>1&&n.add(s)}}),o=o.parentElement,r++;return n}function a6(e,t){let n=i6(e);for(let o of t){if(o===n)return!0;let r=n.split("-").filter(s=>s.length>2),i=o.split("-").filter(s=>s.length>2);for(let s of r)for(let a of i)if(s===a||s.includes(a)||a.includes(s))return!0}return!1}function l6(e,t,n,o){if(n.filter)return n.filter(e,t);switch(n.mode){case"all":return!0;case"filtered":return!(n.skipExact.has(e)||n.skipPatterns.some(r=>r.test(e)));case"smart":return n.skipExact.has(e)||n.skipPatterns.some(r=>r.test(e))?!1:!!(o&&a6(e,o)||n.userPatterns.some(r=>r.test(e)));default:return!0}}var Pa=null,c6=new WeakMap;function bm(e){return Object.keys(e).some(t=>t.startsWith("__reactFiber$")||t.startsWith("__reactInternalInstance$")||t.startsWith("__reactProps$"))}function d6(){if(Pa!==null)return Pa;if(typeof document>"u")return!1;if(document.body&&bm(document.body))return Pa=!0,!0;let e=["#root","#app","#__next","[data-reactroot]"];for(let t of e){let n=document.querySelector(t);if(n&&bm(n))return Pa=!0,!0}if(document.body){for(let t of document.body.children)if(bm(t))return Pa=!0,!0}return Pa=!1,!1}var lc={map:c6};function u6(e){return Object.keys(e).find(n=>n.startsWith("__reactFiber$")||n.startsWith("__reactInternalInstance$"))||null}function p6(e){let t=u6(e);return t?e[t]:null}function Ns(e){return e?e.displayName?e.displayName:e.name?e.name:null:null}function f6(e){let{tag:t,type:n,elementType:o}=e;if(t===ln.HostComponent||t===ln.HostText||t===ln.HostHoistable||t===ln.HostSingleton||t===ln.Fragment||t===ln.Mode||t===ln.Profiler||t===ln.DehydratedFragment||t===ln.HostRoot||t===ln.HostPortal||t===ln.ScopeComponent||t===ln.OffscreenComponent||t===ln.LegacyHiddenComponent||t===ln.CacheComponent||t===ln.TracingMarkerComponent||t===ln.Throw||t===ln.ViewTransitionComponent||t===ln.ActivityComponent)return null;if(t===ln.ForwardRef){let r=o;if(r?.render){let i=Ns(r.render);if(i)return i}return r?.displayName?r.displayName:Ns(n)}if(t===ln.MemoComponent||t===ln.SimpleMemoComponent){let r=o;if(r?.type){let i=Ns(r.type);if(i)return i}return r?.displayName?r.displayName:Ns(n)}if(t===ln.ContextProvider){let r=n;return r?._context?.displayName?`${r._context.displayName}.Provider`:null}if(t===ln.ContextConsumer){let r=n;return r?.displayName?`${r.displayName}.Consumer`:null}if(t===ln.LazyComponent){let r=o;return r?._status===1&&r._result?Ns(r._result):null}return t===ln.SuspenseComponent||t===ln.SuspenseListComponent?null:t===ln.IncompleteClassComponent||t===ln.IncompleteFunctionComponent||t===ln.FunctionComponent||t===ln.ClassComponent||t===ln.IndeterminateComponent?Ns(n):null}function h6(e){return e.length<=2||e.length<=3&&e===e.toLowerCase()}function m6(e,t){let n=r6(t),o=n.mode==="all";if(o){let l=lc.map.get(e);if(l!==void 0)return l}if(!d6()){let l={path:null,components:[]};return o&&lc.map.set(e,l),l}let r=n.mode==="smart"?s6(e):void 0,i=[];try{let l=p6(e),d=0;for(;l&&d<n.maxDepth&&i.length<n.maxComponents;){let c=f6(l);c&&!h6(c)&&l6(c,d,n,r)&&i.push(c),l=l.return,d++}}catch{let l={path:null,components:[]};return o&&lc.map.set(e,l),l}if(i.length===0){let l={path:null,components:[]};return o&&lc.map.set(e,l),l}let a={path:i.slice().reverse().map(l=>`<${l}>`).join(" "),components:i};return o&&lc.map.set(e,a),a}var cc={FunctionComponent:0,ClassComponent:1,IndeterminateComponent:2,HostRoot:3,HostPortal:4,HostComponent:5,HostText:6,Fragment:7,Mode:8,ContextConsumer:9,ContextProvider:10,ForwardRef:11,Profiler:12,SuspenseComponent:13,MemoComponent:14,SimpleMemoComponent:15,LazyComponent:16};function g6(e){if(!e||typeof e!="object")return null;let t=Object.keys(e),n=t.find(i=>i.startsWith("__reactFiber$"));if(n)return e[n]||null;let o=t.find(i=>i.startsWith("__reactInternalInstance$"));if(o)return e[o]||null;let r=t.find(i=>{if(!i.startsWith("__react"))return!1;let s=e[i];return s&&typeof s=="object"&&"_debugSource"in s});return r&&e[r]||null}function uc(e){if(!e.type||typeof e.type=="string")return null;if(typeof e.type=="object"||typeof e.type=="function"){let t=e.type;if(t.displayName)return t.displayName;if(t.name)return t.name}return null}function _6(e,t=50){let n=e,o=0;for(;n&&o<t;){if(n._debugSource)return{source:n._debugSource,componentName:uc(n)};if(n._debugOwner?._debugSource)return{source:n._debugOwner._debugSource,componentName:uc(n._debugOwner)};n=n.return,o++}return null}function y6(e){let t=e,n=0,o=50;for(;t&&n<o;){let r=t,i=["_debugSource","__source","_source","debugSource"];for(let s of i){let a=r[s];if(a&&typeof a=="object"&&"fileName"in a)return{source:a,componentName:uc(t)}}if(t.memoizedProps){let s=t.memoizedProps;if(s.__source&&typeof s.__source=="object"){let a=s.__source;if(a.fileName&&a.lineNumber)return{source:{fileName:a.fileName,lineNumber:a.lineNumber,columnNumber:a.columnNumber},componentName:uc(t)}}}t=t.return,n++}return null}var Ru=new Map;function x6(e){let t=e.tag,n=e.type,o=e.elementType;if(typeof n=="string"||n==null||typeof n=="function"&&n.prototype?.isReactComponent)return null;if((t===cc.FunctionComponent||t===cc.IndeterminateComponent)&&typeof n=="function")return n;if(t===cc.ForwardRef&&o){let r=o.render;if(typeof r=="function")return r}if((t===cc.MemoComponent||t===cc.SimpleMemoComponent)&&o){let r=o.type;if(typeof r=="function")return r}return typeof n=="function"?n:null}function w6(){let e=K2.default,t=e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;if(t&&"H"in t)return{get:()=>t.H,set:o=>{t.H=o}};let n=e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;if(n){let o=n.ReactCurrentDispatcher;if(o&&"current"in o)return{get:()=>o.current,set:r=>{o.current=r}}}return null}function v6(e){let t=e.split(`
`),n=[/source-location/,/\/dist\/index\./,/node_modules\//,/react-dom/,/react\.development/,/react\.production/,/chunk-[A-Z0-9]+/i,/react-stack-bottom-frame/,/react-reconciler/,/scheduler/,/<anonymous>/],o=/^\s*at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)\)?$/,r=/^[^@]*@(.+?):(\d+):(\d+)$/;for(let i of t){let s=i.trim();if(!s||n.some(l=>l.test(s)))continue;let a=o.exec(s)||r.exec(s);if(a)return{fileName:a[1],line:parseInt(a[2],10),column:parseInt(a[3],10)}}return null}function b6(e){let t=e;return t=t.replace(/[?#].*$/,""),t=t.replace(/^turbopack:\/\/\/\[project\]\//,""),t=t.replace(/^webpack-internal:\/\/\/\.\//,""),t=t.replace(/^webpack-internal:\/\/\//,""),t=t.replace(/^webpack:\/\/\/\.\//,""),t=t.replace(/^webpack:\/\/\//,""),t=t.replace(/^turbopack:\/\/\//,""),t=t.replace(/^https?:\/\/[^/]+\//,""),t=t.replace(/^file:\/\/\//,"/"),t=t.replace(/^\([^)]+\)\/\.\//,""),t=t.replace(/^\.\//,""),t}function k6(e){let t=x6(e);if(!t)return null;if(Ru.has(t))return Ru.get(t);let n=w6();if(!n)return Ru.set(t,null),null;let o=n.get(),r=null;try{let i=new Proxy({},{get(){throw new Error("probe")}});n.set(i);try{t({})}catch(s){if(s instanceof Error&&s.message==="probe"&&s.stack){let a=v6(s.stack);a&&(r={fileName:b6(a.fileName),lineNumber:a.line,columnNumber:a.column,componentName:uc(e)||void 0})}}}finally{n.set(o)}return Ru.set(t,r),r}function S6(e,t=15){let n=e,o=0;for(;n&&o<t;){let r=k6(n);if(r)return r;n=n.return,o++}return null}function Om(e){let t=g6(e);if(!t)return{found:!1,reason:"no-fiber",isReactApp:!1,isProduction:!1};let n=_6(t);if(n||(n=y6(t)),n?.source)return{found:!0,source:{fileName:n.source.fileName,lineNumber:n.source.lineNumber,columnNumber:n.source.columnNumber,componentName:n.componentName||void 0},isReactApp:!0,isProduction:!1};let o=S6(t);return o?{found:!0,source:o,isReactApp:!0,isProduction:!1}:{found:!1,reason:"no-debug-source",isReactApp:!0,isProduction:!1}}function C6(e,t="path"){let{fileName:n,lineNumber:o,columnNumber:r}=e,i=`${n}:${o}`;return r!==void 0&&(i+=`:${r}`),t==="vscode"?`vscode://file${n.startsWith("/")?"":"/"}${i}`:i}function E6(e,t=10){let n=e,o=0;for(;n&&o<t;){let r=Om(n);if(r.found)return r;n=n.parentElement,o++}return Om(e)}var T6=`.styles-module__toolbar___wNsdK svg[fill=none],
.styles-module__markersLayer___-25j1 svg[fill=none],
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] {
  fill: none !important;
}
.styles-module__toolbar___wNsdK svg[fill=none] :not([fill]),
.styles-module__markersLayer___-25j1 svg[fill=none] :not([fill]),
.styles-module__fixedMarkersLayer___ffyX6 svg[fill=none] :not([fill]) {
  fill: none !important;
}

.styles-module__controlsContent___9GJWU :where(button, input, select, textarea, label) {
  background: unset;
  border: unset;
  border-radius: unset;
  padding: unset;
  margin: unset;
  color: unset;
  font-family: unset;
  font-weight: unset;
  font-style: unset;
  line-height: unset;
  letter-spacing: unset;
  text-transform: unset;
  text-decoration: unset;
  box-shadow: unset;
  outline: unset;
}

@keyframes styles-module__toolbarEnter___u8RRu {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
@keyframes styles-module__toolbarHide___y8kaT {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
@keyframes styles-module__badgeEnter___mVQLj {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleIn___c-r1K {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__scaleOut___Wctwz {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.85);
  }
}
@keyframes styles-module__slideUp___kgD36 {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes styles-module__slideDown___zcdje {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.85) translateY(8px);
  }
}
@keyframes styles-module__fadeIn___b9qmf {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes styles-module__fadeOut___6Ut6- {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
@keyframes styles-module__hoverHighlightIn___6WYHY {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__hoverTooltipIn___FYGQx {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.styles-module__disableTransitions___EopxO :is(*, *::before, *::after) {
  transition: none !important;
}

.styles-module__toolbar___wNsdK {
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  width: 337px;
  z-index: 100000;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  pointer-events: none;
  transition: left 0s, top 0s, right 0s, bottom 0s;
}

:where(.styles-module__toolbar___wNsdK) {
  bottom: 1.25rem;
  right: 1.25rem;
}

.styles-module__toolbarContainer___dIhma {
  position: relative;
  user-select: none;
  margin-left: auto;
  align-self: flex-end;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1D1A2F;
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__toolbarContainer___dIhma.styles-module__entrance___sgHd8 {
  animation: styles-module__toolbarEnter___u8RRu 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}
.styles-module__toolbarContainer___dIhma.styles-module__hiding___1td44 {
  animation: styles-module__toolbarHide___y8kaT 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
  pointer-events: none;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn {
  width: 44px;
  height: 44px;
  border-radius: 22px;
  padding: 0;
  cursor: pointer;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn svg {
  margin-top: -1px;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #2a2a2a;
}
.styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:active {
  transform: scale(0.95);
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx {
  height: 44px;
  border-radius: 1.5rem;
  padding: 0.375rem;
  width: 297px;
}
.styles-module__toolbarContainer___dIhma.styles-module__expanded___ofKPx.styles-module__serverConnected___Gfbou {
  width: 337px;
}

.styles-module__toggleContent___0yfyP {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.1s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__toggleContent___0yfyP.styles-module__visible___KHwEW {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.styles-module__toggleContent___0yfyP.styles-module__hidden___Ae8H4 {
  opacity: 0;
  pointer-events: none;
}

.styles-module__controlsContent___9GJWU {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: filter 0.8s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1), transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__controlsContent___9GJWU.styles-module__visible___KHwEW {
  opacity: 1;
  filter: blur(0px);
  transform: scale(1);
  visibility: visible;
  pointer-events: auto;
}
.styles-module__controlsContent___9GJWU.styles-module__hidden___Ae8H4 {
  pointer-events: none;
  opacity: 0;
  filter: blur(10px);
  transform: scale(0.4);
}

.styles-module__badge___2XsgF {
  position: absolute;
  top: -13px;
  right: -13px;
  user-select: none;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.2s ease;
  transform: scale(1);
}
.styles-module__badge___2XsgF.styles-module__fadeOut___6Ut6- {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}
.styles-module__badge___2XsgF.styles-module__entrance___sgHd8 {
  animation: styles-module__badgeEnter___mVQLj 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) 0.4s both;
}

.styles-module__controlButton___8Q0jc {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease, opacity 0.2s ease;
}
.styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}
.styles-module__controlButton___8Q0jc:active:not(:disabled) {
  transform: scale(0.92);
}
.styles-module__controlButton___8Q0jc:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background-color: color-mix(in srgb, var(--agentation-color-blue) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}
.styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
  color: var(--agentation-color-red);
}
.styles-module__controlButton___8Q0jc[data-no-hover=true], .styles-module__controlButton___8Q0jc.styles-module__statusShowing___te6iu {
  cursor: default;
  pointer-events: none;
  background: transparent !important;
}
.styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
  cursor: default;
}
.styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background-color: color-mix(in srgb, var(--agentation-color-red) 25%, transparent);
}

.styles-module__buttonBadge___NeFWb {
  position: absolute;
  top: 0px;
  right: 0px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: var(--agentation-color-accent);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 2px #1D1A2F, 0 1px 3px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}
[data-agentation-theme=light] .styles-module__buttonBadge___NeFWb {
  box-shadow: 0 0 0 2px #fff, 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes styles-module__mcpIndicatorPulseConnected___EDodZ {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpIndicatorPulseConnecting___cCYte {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-yellow) 50%, transparent);
  }
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--agentation-color-yellow) 0%, transparent);
  }
}
.styles-module__mcpIndicator___zGJeL {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  pointer-events: none;
  transition: background-color 0.3s ease, opacity 0.15s ease, transform 0.15s ease;
  opacity: 1;
  transform: scale(1);
}
.styles-module__mcpIndicator___zGJeL.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpIndicatorPulseConnected___EDodZ 2.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpIndicatorPulseConnecting___cCYte 1.5s ease-in-out infinite;
}
.styles-module__mcpIndicator___zGJeL.styles-module__hidden___Ae8H4 {
  opacity: 0;
  transform: scale(0);
  animation: none;
}

@keyframes styles-module__connectionPulse___-Zycw {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}
.styles-module__connectionIndicatorWrapper___L-e-3 {
  width: 8px;
  height: 34px;
  margin-left: 6px;
  margin-right: 6px;
}

.styles-module__connectionIndicator___afk9p {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease, background-color 0.3s ease;
  cursor: default;
}

.styles-module__connectionIndicatorVisible___C-i5B {
  opacity: 1;
}

.styles-module__connectionIndicatorConnected___IY8pR {
  background-color: var(--agentation-color-green);
  animation: styles-module__connectionPulse___-Zycw 2.5s ease-in-out infinite;
}

.styles-module__connectionIndicatorDisconnected___kmpaZ {
  background-color: var(--agentation-color-red);
  animation: none;
}

.styles-module__connectionIndicatorConnecting___QmSLH {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__connectionPulse___-Zycw 1s ease-in-out infinite;
}

.styles-module__buttonWrapper___rBcdv {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
  transition-delay: 0.85s;
}
.styles-module__buttonWrapper___rBcdv:has(.styles-module__controlButton___8Q0jc:disabled):hover .styles-module__buttonTooltip___Burd9 {
  opacity: 0;
  visibility: hidden;
}

.styles-module__tooltipsInSession___-0lHH .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transition-delay: 0s;
}

.styles-module__sendButtonWrapper___UUxG6 {
  width: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
  margin-left: -0.375rem;
  transition: width 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1), margin 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6 .styles-module__controlButton___8Q0jc {
  transform: scale(0.8);
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU {
  width: 34px;
  opacity: 1;
  overflow: visible;
  pointer-events: auto;
  margin-left: 0;
}
.styles-module__sendButtonWrapper___UUxG6.styles-module__sendButtonVisible___WPSQU .styles-module__controlButton___8Q0jc {
  transform: scale(1);
}

.styles-module__buttonTooltip___Burd9 {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  padding: 6px 10px;
  background: #1D1A2F;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 100001;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: opacity 0.135s ease, transform 0.135s ease, visibility 0.135s ease;
}
.styles-module__buttonTooltip___Burd9::after {
  content: "";
  position: absolute;
  top: calc(100% - 4px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #1D1A2F;
  border-radius: 0 0 2px 0;
}

.styles-module__shortcut___lEAQk {
  margin-left: 4px;
  opacity: 0.5;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9 {
  bottom: auto;
  top: calc(100% + 14px);
  transform: translateX(-50%) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonTooltip___Burd9::after {
  top: -4px;
  bottom: auto;
  border-radius: 2px 0 0 0;
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapper___rBcdv:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-50%) scale(1);
}

.styles-module__tooltipsHidden___VtLJG .styles-module__buttonTooltip___Burd9 {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}

.styles-module__tooltipVisible___0jcCv,
.styles-module__tooltipsHidden___VtLJG .styles-module__tooltipVisible___0jcCv {
  opacity: 1 !important;
  visibility: visible !important;
  transform: translateX(-50%) scale(1) !important;
  transition-delay: 0s !important;
}

.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(-12px) scale(0.95);
}
.styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9::after {
  left: 16px;
}
.styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignLeft___myzIp:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(-12px) scale(1);
}

.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  left: 50%;
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9::after {
  left: auto;
  right: 8px;
}
.styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(0.95);
}
.styles-module__tooltipBelow___m6ats .styles-module__buttonWrapperAlignRight___HCQFR:hover .styles-module__buttonTooltip___Burd9 {
  transform: translateX(calc(-100% + 12px)) scale(1);
}

.styles-module__divider___c--s1 {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 0.125rem;
}

.styles-module__overlay___Q1O9y {
  position: fixed;
  inset: 0;
  z-index: 99997;
  pointer-events: none;
}
.styles-module__overlay___Q1O9y > * {
  pointer-events: auto;
}

.styles-module__hoverHighlight___ogakW {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-accent) 50%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-accent) 4%, transparent);
  pointer-events: none !important;
  box-sizing: border-box;
  will-change: opacity;
  contain: layout style;
}
.styles-module__hoverHighlight___ogakW.styles-module__enter___WFIki {
  animation: styles-module__hoverHighlightIn___6WYHY 0.12s ease-out forwards;
}

.styles-module__multiSelectOutline___cSJ-m {
  position: fixed;
  border: 2px dashed color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-green) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__multiSelectOutline___cSJ-m.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__singleSelectOutline___QhX-O {
  position: fixed;
  border: 2px solid color-mix(in srgb, var(--agentation-color-blue) 60%, transparent);
  border-radius: 4px;
  pointer-events: none !important;
  background-color: color-mix(in srgb, var(--agentation-color-blue) 5%, transparent);
  box-sizing: border-box;
  will-change: opacity;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__enter___WFIki {
  animation: styles-module__fadeIn___b9qmf 0.15s ease-out forwards;
}
.styles-module__singleSelectOutline___QhX-O.styles-module__exit___fyOJ0 {
  animation: styles-module__fadeOut___6Ut6- 0.15s ease-out forwards;
}

.styles-module__hoverTooltip___bvLk7 {
  position: fixed;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #fff;
  background: rgba(0, 0, 0, 0.85);
  padding: 0.35rem 0.6rem;
  border-radius: 0.375rem;
  pointer-events: none !important;
  white-space: nowrap;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.styles-module__hoverTooltip___bvLk7.styles-module__enter___WFIki {
  animation: styles-module__hoverTooltipIn___FYGQx 0.1s ease-out forwards;
}

.styles-module__hoverReactPath___gx1IJ {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__hoverElementName___QMLMl {
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markersLayer___-25j1 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__markersLayer___-25j1 > * {
  pointer-events: auto;
}

.styles-module__fixedMarkersLayer___ffyX6 {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99998;
  pointer-events: none;
}
.styles-module__fixedMarkersLayer___ffyX6 > * {
  pointer-events: auto;
}

.styles-module__marker___6sQrs {
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___6sQrs:hover {
  z-index: 2;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7) {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__marker___6sQrs.styles-module__enter___WFIki {
  animation: styles-module__markerIn___5FaAP 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___6sQrs.styles-module__exit___fyOJ0 {
  animation: styles-module__markerOut___GU5jX 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs.styles-module__clearing___FQ--7 {
  animation: styles-module__markerOut___GU5jX 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___6sQrs:not(.styles-module__enter___WFIki):not(.styles-module__exit___fyOJ0):not(.styles-module__clearing___FQ--7):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___6sQrs.styles-module__pending___2IHLC {
  position: fixed;
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___6sQrs.styles-module__fixed___dBMHC {
  position: fixed;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___6sQrs.styles-module__multiSelect___YWiuz.styles-module__pending___2IHLC {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___6sQrs.styles-module__hovered___ZgXIy {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___nCTxD {
  display: block;
  animation: styles-module__renumberRoll___Wgbq3 0.2s ease-out;
}

@keyframes styles-module__renumberRoll___Wgbq3 {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__markerTooltip___aLJID {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1D1A2F;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;
}
.styles-module__markerTooltip___aLJID.styles-module__enter___WFIki {
  animation: styles-module__tooltipIn___0N31w 0.1s ease-out forwards;
}

.styles-module__markerQuote___FHmrz {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markerNote___QkrrS {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

.styles-module__markerHint___2iF-6 {
  display: block;
  font-size: 0.625rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.375rem;
  white-space: nowrap;
}

.styles-module__settingsPanel___OxX3Y {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1D1A2F;
  border-radius: 1rem;
  padding: 13px 0 16px;
  min-width: 205px;
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y::before, .styles-module__settingsPanel___OxX3Y::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___OxX3Y::before {
  left: 0;
  background: linear-gradient(to right, #1D1A2F 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y::after {
  right: 0;
  background: linear-gradient(to left, #1D1A2F 0%, transparent 100%);
}
.styles-module__settingsPanel___OxX3Y .styles-module__settingsHeader___pwDY9,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrand___0gJeM,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsBrandSlash___uTG18,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsVersion___TUcFq,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsSection___m-YM2,
.styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleButton___FMKfw,
.styles-module__settingsPanel___OxX3Y .styles-module__cycleDot___nPgLY,
.styles-module__settingsPanel___OxX3Y .styles-module__dropdownButton___16NPz,
.styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa,
.styles-module__settingsPanel___OxX3Y .styles-module__customCheckbox___U39ax,
.styles-module__settingsPanel___OxX3Y .styles-module__sliderLabel___U8sPr,
.styles-module__settingsPanel___OxX3Y .styles-module__slider___GLdxp,
.styles-module__settingsPanel___OxX3Y .styles-module__themeToggle___2rUjA {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__enter___WFIki {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__settingsPanel___OxX3Y.styles-module__exit___fyOJ0 {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y {
  background: #1D1A2F;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12 {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___OxX3Y .styles-module__toggleLabel___Xm8Aa {
  color: rgba(255, 255, 255, 0.85);
}

.styles-module__settingsPanelContainer___Xksv8 {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 1rem;
}

.styles-module__settingsPage___6YfHH {
  min-width: 100%;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___6YfHH.styles-module__slideLeft___Ps01J {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 3px 1rem 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___uvCq6.styles-module__slideIn___4-qXe {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsNavLink___wCzJt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(255, 255, 255, 0.9);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover {
  color: rgba(0, 0, 0, 0.8);
}
.styles-module__settingsNavLink___wCzJt svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___wCzJt:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___wCzJt:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___ZWwhj {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__mcpNavIndicator___cl9pO {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___cl9pO.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s ease-in-out infinite;
}

.styles-module__settingsBackButton___bIe2j {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0 12px 0;
  margin: -6px 0 0.5rem 0;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(255, 255, 255, 0.07);
}
.styles-module__settingsBackButton___bIe2j:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsBackButton___bIe2j:hover {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___InP0r {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___InP0r {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___NKlmo {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___NKlmo {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___8xv-x {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: underline dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___8xv-x:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___8xv-x:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendRow___UblX5 {
  display: flex;
  align-items: center;
  gap: 8px;
}

.styles-module__autoSendLabel___icDc2 {
  font-size: 0.6875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___icDc2.styles-module__active___-zoN6 {
  color: var(--agentation-color-blue);
}

.styles-module__webhookUrlInput___2375C {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___2375C:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__settingsHeader___pwDY9 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  margin-bottom: 0.5rem;
  padding-bottom: 9px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.styles-module__settingsBrand___0gJeM {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
  text-decoration: none;
}

.styles-module__settingsBrandSlash___uTG18 {
  color: var(--agentation-color-accent);
  transition: color 0.2s ease;
}

.styles-module__settingsVersion___TUcFq {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.styles-module__settingsSection___m-YM2 + .styles-module__settingsSection___m-YM2 {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.styles-module__settingsSection___m-YM2.styles-module__settingsSectionExtraPadding___jdhFV {
  padding-top: calc(0.5rem + 4px);
}

.styles-module__settingsSectionGrow___h-5HZ {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___3sdhc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___3sdhc.styles-module__settingsRowMarginTop___zA0Sp {
  margin-top: 8px;
}

.styles-module__dropdownContainer___BVnxe {
  position: relative;
}

.styles-module__dropdownButton___16NPz {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownButton___16NPz:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownButton___16NPz svg {
  opacity: 0.6;
}

.styles-module__cycleButton___FMKfw {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___FMKfw {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___FMKfw:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___EgS0V .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.2);
}
.styles-module__settingsRowDisabled___EgS0V .styles-module__toggleSwitch___l4Ygm {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes styles-module__cycleTextIn___Q6zJf {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.styles-module__cycleButtonText___fD1LR {
  display: inline-block;
  animation: styles-module__cycleTextIn___Q6zJf 0.2s ease-out;
}

.styles-module__cycleDots___LWuoQ {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___nPgLY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___nPgLY.styles-module__active___-zoN6 {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__dropdownMenu___k73ER {
  position: absolute;
  right: 0;
  top: calc(100% + 0.25rem);
  background: #1D1A2F;
  border-radius: 0.5rem;
  padding: 0.25rem;
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 10;
  animation: styles-module__scaleIn___c-r1K 0.15s ease-out;
}

.styles-module__dropdownItem___ylsLj {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
  letter-spacing: -0.0094em;
}
.styles-module__dropdownItem___ylsLj:hover {
  background: rgba(255, 255, 255, 0.08);
}
.styles-module__dropdownItem___ylsLj.styles-module__selected___OwRqP {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
}

.styles-module__settingsLabel___8UjfX {
  font-size: 0.8125rem;
  font-weight: 400;
  letter-spacing: -0.0094em;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 0.125rem;
}
[data-agentation-theme=light] .styles-module__settingsLabel___8UjfX {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__settingsLabelMarker___ewdtV {
  padding-top: 3px;
  margin-bottom: 10px;
}

.styles-module__settingsOptions___LyrBA {
  display: flex;
  gap: 0.25rem;
}

.styles-module__settingsOption___UNa12 {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  font-size: 0.6875rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.styles-module__settingsOption___UNa12:hover {
  background: rgba(0, 0, 0, 0.05);
}
.styles-module__settingsOption___UNa12.styles-module__selected___OwRqP {
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
  color: var(--agentation-color-blue);
}

.styles-module__sliderContainer___ducXj {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.styles-module__slider___GLdxp {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.styles-module__slider___GLdxp::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.styles-module__slider___GLdxp:hover::-webkit-slider-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.styles-module__slider___GLdxp:hover::-moz-range-thumb {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.styles-module__sliderLabels___FhLDB {
  display: flex;
  justify-content: space-between;
}

.styles-module__sliderLabel___U8sPr {
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: color 0.15s ease;
}
.styles-module__sliderLabel___U8sPr:hover {
  color: rgba(255, 255, 255, 0.7);
}
.styles-module__sliderLabel___U8sPr.styles-module__active___-zoN6 {
  color: rgba(255, 255, 255, 0.9);
}

.styles-module__colorOptions___iHCNX {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.375rem;
  margin-bottom: 1px;
}

.styles-module__colorOption___IodiY {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  background-color: var(--swatch);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___IodiY {
    background-color: var(--swatch-p3);
  }
}
.styles-module__colorOption___IodiY:hover {
  transform: scale(1.15);
}
.styles-module__colorOption___IodiY.styles-module__selected___OwRqP {
  transform: scale(0.83);
}

.styles-module__colorOptionRing___U2xpo {
  display: flex;
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 50%;
  transition: border-color 0.3s ease;
}
.styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
  border-color: var(--swatch);
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOptionRing___U2xpo.styles-module__selected___OwRqP {
    border-color: var(--swatch-p3);
  }
}

.styles-module__settingsToggle___fBrFn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.styles-module__settingsToggle___fBrFn + .styles-module__settingsToggle___fBrFn {
  margin-top: calc(0.5rem + 6px);
}
.styles-module__settingsToggle___fBrFn input[type=checkbox] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.styles-module__settingsToggle___fBrFn.styles-module__settingsToggleMarginBottom___MZUyF {
  margin-bottom: calc(0.5rem + 6px);
}

.styles-module__customCheckbox___U39ax {
  position: relative;
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.25s ease, border-color 0.25s ease;
}
.styles-module__customCheckbox___U39ax svg {
  color: #1D1A2F;
  opacity: 1;
  transition: opacity 0.15s ease;
}
input[type=checkbox]:checked + .styles-module__customCheckbox___U39ax {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgb(255, 255, 255);
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax {
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: #fff;
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax.styles-module__checked___mnZLo {
  border-color: #1D1A2F;
  background: #1D1A2F;
}
[data-agentation-theme=light] .styles-module__customCheckbox___U39ax.styles-module__checked___mnZLo svg {
  color: #fff;
}

.styles-module__toggleLabel___Xm8Aa {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: -0.0094em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
[data-agentation-theme=light] .styles-module__toggleLabel___Xm8Aa {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__toggleSwitch___l4Ygm {
  position: relative;
  display: inline-block;
  width: 24px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.styles-module__toggleSwitch___l4Ygm input {
  opacity: 0;
  width: 0;
  height: 0;
}
.styles-module__toggleSwitch___l4Ygm input:checked + .styles-module__toggleSlider___wprIn {
  background-color: var(--agentation-color-blue);
}
.styles-module__toggleSwitch___l4Ygm input:checked + .styles-module__toggleSlider___wprIn::before {
  transform: translateX(8px);
}
.styles-module__toggleSwitch___l4Ygm.styles-module__disabled___332Jw {
  opacity: 0.4;
}
.styles-module__toggleSwitch___l4Ygm.styles-module__disabled___332Jw .styles-module__toggleSlider___wprIn {
  cursor: not-allowed;
}

.styles-module__toggleSlider___wprIn {
  position: absolute;
  cursor: pointer;
  inset: 0;
  border-radius: 16px;
  background: #484848;
}
[data-agentation-theme=light] .styles-module__toggleSlider___wprIn {
  background: #dddddd;
}
.styles-module__toggleSlider___wprIn::before {
  content: "";
  position: absolute;
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes styles-module__mcpPulse___uNggr {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___fov9B {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
.styles-module__mcpStatusDot___ibgkc {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connecting___uo-CW {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___uNggr 1.5s infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__connected___7c28g {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___uNggr 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___ibgkc.styles-module__disconnected___cHPxR {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___fov9B 2s infinite;
}

.styles-module__drawCanvas___7cG9U {
  position: fixed;
  inset: 0;
  z-index: 99996;
  pointer-events: none !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6 {
  pointer-events: auto !important;
  cursor: crosshair !important;
}
.styles-module__drawCanvas___7cG9U.styles-module__active___-zoN6[data-stroke-hover] {
  cursor: pointer !important;
}

.styles-module__dragSelection___kZLq2 {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 60%, transparent);
  border-radius: 4px;
  background-color: color-mix(in srgb, var(--agentation-color-green) 8%, transparent);
  pointer-events: none;
  z-index: 99997;
  will-change: transform, width, height;
  contain: layout style;
}

.styles-module__dragCount___KM90j {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--agentation-color-green);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}

.styles-module__highlightsContainer___-0xzG {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 99996;
}

.styles-module__selectedElementHighlight___fyVlI {
  position: fixed;
  top: 0;
  left: 0;
  border: 2px solid color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  border-radius: 4px;
  background: color-mix(in srgb, var(--agentation-color-green) 6%, transparent);
  pointer-events: none;
  will-change: transform, width, height;
  contain: layout style;
}

[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__toolbarContainer___dIhma.styles-module__collapsed___Rydsn:hover {
  background: #f5f5f5;
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc:hover:not(:disabled):not([data-active=true]):not([data-failed=true]):not([data-auto-sync=true]):not([data-error=true]):not([data-no-hover=true]) {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-active=true] {
  color: var(--agentation-color-blue);
  background: color-mix(in srgb, var(--agentation-color-blue) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-error=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-danger]:hover:not(:disabled):not([data-active=true]):not([data-failed=true]) {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-auto-sync=true] {
  color: var(--agentation-color-green);
  background: transparent;
}
[data-agentation-theme=light] .styles-module__controlButton___8Q0jc[data-failed=true] {
  color: var(--agentation-color-red);
  background: color-mix(in srgb, var(--agentation-color-red) 15%, transparent);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9 {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__buttonTooltip___Burd9::after {
  background: #fff;
}
[data-agentation-theme=light] .styles-module__divider___c--s1 {
  background: rgba(0, 0, 0, 0.1);
}`,M6={toolbar:"styles-module__toolbar___wNsdK",markersLayer:"styles-module__markersLayer___-25j1",fixedMarkersLayer:"styles-module__fixedMarkersLayer___ffyX6",controlsContent:"styles-module__controlsContent___9GJWU",disableTransitions:"styles-module__disableTransitions___EopxO",toolbarContainer:"styles-module__toolbarContainer___dIhma",entrance:"styles-module__entrance___sgHd8",toolbarEnter:"styles-module__toolbarEnter___u8RRu",hiding:"styles-module__hiding___1td44",toolbarHide:"styles-module__toolbarHide___y8kaT",collapsed:"styles-module__collapsed___Rydsn",expanded:"styles-module__expanded___ofKPx",serverConnected:"styles-module__serverConnected___Gfbou",toggleContent:"styles-module__toggleContent___0yfyP",visible:"styles-module__visible___KHwEW",hidden:"styles-module__hidden___Ae8H4",badge:"styles-module__badge___2XsgF",fadeOut:"styles-module__fadeOut___6Ut6-",badgeEnter:"styles-module__badgeEnter___mVQLj",controlButton:"styles-module__controlButton___8Q0jc",statusShowing:"styles-module__statusShowing___te6iu",buttonBadge:"styles-module__buttonBadge___NeFWb",mcpIndicator:"styles-module__mcpIndicator___zGJeL",connected:"styles-module__connected___7c28g",mcpIndicatorPulseConnected:"styles-module__mcpIndicatorPulseConnected___EDodZ",connecting:"styles-module__connecting___uo-CW",mcpIndicatorPulseConnecting:"styles-module__mcpIndicatorPulseConnecting___cCYte",connectionIndicatorWrapper:"styles-module__connectionIndicatorWrapper___L-e-3",connectionIndicator:"styles-module__connectionIndicator___afk9p",connectionIndicatorVisible:"styles-module__connectionIndicatorVisible___C-i5B",connectionIndicatorConnected:"styles-module__connectionIndicatorConnected___IY8pR",connectionPulse:"styles-module__connectionPulse___-Zycw",connectionIndicatorDisconnected:"styles-module__connectionIndicatorDisconnected___kmpaZ",connectionIndicatorConnecting:"styles-module__connectionIndicatorConnecting___QmSLH",buttonWrapper:"styles-module__buttonWrapper___rBcdv",buttonTooltip:"styles-module__buttonTooltip___Burd9",tooltipsInSession:"styles-module__tooltipsInSession___-0lHH",sendButtonWrapper:"styles-module__sendButtonWrapper___UUxG6",sendButtonVisible:"styles-module__sendButtonVisible___WPSQU",shortcut:"styles-module__shortcut___lEAQk",tooltipBelow:"styles-module__tooltipBelow___m6ats",tooltipsHidden:"styles-module__tooltipsHidden___VtLJG",tooltipVisible:"styles-module__tooltipVisible___0jcCv",buttonWrapperAlignLeft:"styles-module__buttonWrapperAlignLeft___myzIp",buttonWrapperAlignRight:"styles-module__buttonWrapperAlignRight___HCQFR",divider:"styles-module__divider___c--s1",overlay:"styles-module__overlay___Q1O9y",hoverHighlight:"styles-module__hoverHighlight___ogakW",enter:"styles-module__enter___WFIki",hoverHighlightIn:"styles-module__hoverHighlightIn___6WYHY",multiSelectOutline:"styles-module__multiSelectOutline___cSJ-m",fadeIn:"styles-module__fadeIn___b9qmf",exit:"styles-module__exit___fyOJ0",singleSelectOutline:"styles-module__singleSelectOutline___QhX-O",hoverTooltip:"styles-module__hoverTooltip___bvLk7",hoverTooltipIn:"styles-module__hoverTooltipIn___FYGQx",hoverReactPath:"styles-module__hoverReactPath___gx1IJ",hoverElementName:"styles-module__hoverElementName___QMLMl",marker:"styles-module__marker___6sQrs",clearing:"styles-module__clearing___FQ--7",markerIn:"styles-module__markerIn___5FaAP",markerOut:"styles-module__markerOut___GU5jX",pending:"styles-module__pending___2IHLC",fixed:"styles-module__fixed___dBMHC",multiSelect:"styles-module__multiSelect___YWiuz",hovered:"styles-module__hovered___ZgXIy",renumber:"styles-module__renumber___nCTxD",renumberRoll:"styles-module__renumberRoll___Wgbq3",markerTooltip:"styles-module__markerTooltip___aLJID",tooltipIn:"styles-module__tooltipIn___0N31w",markerQuote:"styles-module__markerQuote___FHmrz",markerNote:"styles-module__markerNote___QkrrS",markerHint:"styles-module__markerHint___2iF-6",settingsPanel:"styles-module__settingsPanel___OxX3Y",settingsHeader:"styles-module__settingsHeader___pwDY9",settingsBrand:"styles-module__settingsBrand___0gJeM",settingsBrandSlash:"styles-module__settingsBrandSlash___uTG18",settingsVersion:"styles-module__settingsVersion___TUcFq",settingsSection:"styles-module__settingsSection___m-YM2",settingsLabel:"styles-module__settingsLabel___8UjfX",cycleButton:"styles-module__cycleButton___FMKfw",cycleDot:"styles-module__cycleDot___nPgLY",dropdownButton:"styles-module__dropdownButton___16NPz",toggleLabel:"styles-module__toggleLabel___Xm8Aa",customCheckbox:"styles-module__customCheckbox___U39ax",sliderLabel:"styles-module__sliderLabel___U8sPr",slider:"styles-module__slider___GLdxp",themeToggle:"styles-module__themeToggle___2rUjA",settingsOption:"styles-module__settingsOption___UNa12",selected:"styles-module__selected___OwRqP",settingsPanelContainer:"styles-module__settingsPanelContainer___Xksv8",settingsPage:"styles-module__settingsPage___6YfHH",slideLeft:"styles-module__slideLeft___Ps01J",automationsPage:"styles-module__automationsPage___uvCq6",slideIn:"styles-module__slideIn___4-qXe",settingsNavLink:"styles-module__settingsNavLink___wCzJt",settingsNavLinkRight:"styles-module__settingsNavLinkRight___ZWwhj",mcpNavIndicator:"styles-module__mcpNavIndicator___cl9pO",mcpPulse:"styles-module__mcpPulse___uNggr",settingsBackButton:"styles-module__settingsBackButton___bIe2j",automationHeader:"styles-module__automationHeader___InP0r",automationDescription:"styles-module__automationDescription___NKlmo",learnMoreLink:"styles-module__learnMoreLink___8xv-x",autoSendRow:"styles-module__autoSendRow___UblX5",autoSendLabel:"styles-module__autoSendLabel___icDc2",active:"styles-module__active___-zoN6",webhookUrlInput:"styles-module__webhookUrlInput___2375C",settingsSectionExtraPadding:"styles-module__settingsSectionExtraPadding___jdhFV",settingsSectionGrow:"styles-module__settingsSectionGrow___h-5HZ",settingsRow:"styles-module__settingsRow___3sdhc",settingsRowMarginTop:"styles-module__settingsRowMarginTop___zA0Sp",dropdownContainer:"styles-module__dropdownContainer___BVnxe",settingsRowDisabled:"styles-module__settingsRowDisabled___EgS0V",toggleSwitch:"styles-module__toggleSwitch___l4Ygm",cycleButtonText:"styles-module__cycleButtonText___fD1LR",cycleTextIn:"styles-module__cycleTextIn___Q6zJf",cycleDots:"styles-module__cycleDots___LWuoQ",dropdownMenu:"styles-module__dropdownMenu___k73ER",scaleIn:"styles-module__scaleIn___c-r1K",dropdownItem:"styles-module__dropdownItem___ylsLj",settingsLabelMarker:"styles-module__settingsLabelMarker___ewdtV",settingsOptions:"styles-module__settingsOptions___LyrBA",sliderContainer:"styles-module__sliderContainer___ducXj",sliderLabels:"styles-module__sliderLabels___FhLDB",colorOptions:"styles-module__colorOptions___iHCNX",colorOption:"styles-module__colorOption___IodiY",colorOptionRing:"styles-module__colorOptionRing___U2xpo",settingsToggle:"styles-module__settingsToggle___fBrFn",settingsToggleMarginBottom:"styles-module__settingsToggleMarginBottom___MZUyF",checked:"styles-module__checked___mnZLo",toggleSlider:"styles-module__toggleSlider___wprIn",disabled:"styles-module__disabled___332Jw",mcpStatusDot:"styles-module__mcpStatusDot___ibgkc",disconnected:"styles-module__disconnected___cHPxR",mcpPulseError:"styles-module__mcpPulseError___fov9B",drawCanvas:"styles-module__drawCanvas___7cG9U",dragSelection:"styles-module__dragSelection___kZLq2",dragCount:"styles-module__dragCount___KM90j",highlightsContainer:"styles-module__highlightsContainer___-0xzG",selectedElementHighlight:"styles-module__selectedElementHighlight___fyVlI",scaleOut:"styles-module__scaleOut___Wctwz",slideUp:"styles-module__slideUp___kgD36",slideDown:"styles-module__slideDown___zcdje"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-page-toolbar-css-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-page-toolbar-css-styles",document.head.appendChild(e)),e.textContent=T6}var Te=M6,dc=[{value:"compact",label:"Compact"},{value:"standard",label:"Standard"},{value:"detailed",label:"Detailed"},{value:"forensic",label:"Forensic"}];function k2(e,t,n="standard"){if(e.length===0)return"";let o=typeof window<"u"?`${window.innerWidth}\xD7${window.innerHeight}`:"unknown",r=`## Page Feedback: ${t}
`;return n==="forensic"?(r+=`
**Environment:**
`,r+=`- Viewport: ${o}
`,typeof window<"u"&&(r+=`- URL: ${window.location.href}
`,r+=`- User Agent: ${navigator.userAgent}
`,r+=`- Timestamp: ${new Date().toISOString()}
`,r+=`- Device Pixel Ratio: ${window.devicePixelRatio}
`),r+=`
---
`):n!=="compact"&&(r+=`**Viewport:** ${o}
`),r+=`
`,e.forEach((i,s)=>{n==="compact"?(r+=`${s+1}. **${i.element}**${i.sourceFile?` (${i.sourceFile})`:""}: ${i.comment}`,i.selectedText&&(r+=` (re: "${i.selectedText.slice(0,30)}${i.selectedText.length>30?"...":""}")`),r+=`
`):n==="forensic"?(r+=`### ${s+1}. ${i.element}
`,i.isMultiSelect&&i.fullPath&&(r+=`*Forensic data shown for first element of selection*
`),i.fullPath&&(r+=`**Full DOM Path:** ${i.fullPath}
`),i.cssClasses&&(r+=`**CSS Classes:** ${i.cssClasses}
`),i.boundingBox&&(r+=`**Position:** x:${Math.round(i.boundingBox.x)}, y:${Math.round(i.boundingBox.y)} (${Math.round(i.boundingBox.width)}\xD7${Math.round(i.boundingBox.height)}px)
`),r+=`**Annotation at:** ${i.x.toFixed(1)}% from left, ${Math.round(i.y)}px from top
`,i.selectedText&&(r+=`**Selected text:** "${i.selectedText}"
`),i.nearbyText&&!i.selectedText&&(r+=`**Context:** ${i.nearbyText.slice(0,100)}
`),i.computedStyles&&(r+=`**Computed Styles:** ${i.computedStyles}
`),i.accessibility&&(r+=`**Accessibility:** ${i.accessibility}
`),i.nearbyElements&&(r+=`**Nearby Elements:** ${i.nearbyElements}
`),i.sourceFile&&(r+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(r+=`**React:** ${i.reactComponents}
`),r+=`**Feedback:** ${i.comment}

`):(r+=`### ${s+1}. ${i.element}
`,r+=`**Location:** ${i.elementPath}
`,i.sourceFile&&(r+=`**Source:** ${i.sourceFile}
`),i.reactComponents&&(r+=`**React:** ${i.reactComponents}
`),n==="detailed"&&(i.cssClasses&&(r+=`**Classes:** ${i.cssClasses}
`),i.boundingBox&&(r+=`**Position:** ${Math.round(i.boundingBox.x)}px, ${Math.round(i.boundingBox.y)}px (${Math.round(i.boundingBox.width)}\xD7${Math.round(i.boundingBox.height)}px)
`)),i.selectedText&&(r+=`**Selected text:** "${i.selectedText}"
`),n==="detailed"&&i.nearbyText&&!i.selectedText&&(r+=`**Context:** ${i.nearbyText.slice(0,100)}
`),r+=`**Feedback:** ${i.comment}

`)}),r.trim()}var N6=`@keyframes styles-module__markerIn___x4G8D {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes styles-module__markerOut___6VhQN {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
}
@keyframes styles-module__tooltipIn___aJslQ {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(2px) scale(0.891);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(0.909);
  }
}
@keyframes styles-module__renumberRoll___akV9B {
  0% {
    transform: translateX(-40%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.styles-module__marker___9CKF7 {
  position: absolute;
  width: 22px;
  height: 22px;
  background: var(--agentation-color-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 600;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(0, 0, 0, 0.04);
  user-select: none;
  will-change: transform, opacity;
  contain: layout style;
  z-index: 1;
}
.styles-module__marker___9CKF7:hover {
  z-index: 2;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K) {
  transition: background-color 0.15s ease, transform 0.1s ease;
}
.styles-module__marker___9CKF7.styles-module__enter___8kI3q {
  animation: styles-module__markerIn___x4G8D 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.styles-module__marker___9CKF7.styles-module__exit___KBdR3 {
  animation: styles-module__markerOut___6VhQN 0.2s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7.styles-module__clearing___8rM7K {
  animation: styles-module__markerOut___6VhQN 0.15s ease-out both;
  pointer-events: none;
}
.styles-module__marker___9CKF7:not(.styles-module__enter___8kI3q):not(.styles-module__exit___KBdR3):not(.styles-module__clearing___8rM7K):hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.styles-module__marker___9CKF7.styles-module__pending___BiY-U {
  position: fixed;
  background-color: var(--agentation-color-blue);
  cursor: default;
}
.styles-module__marker___9CKF7.styles-module__fixed___aKrQO {
  position: fixed;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC {
  background-color: var(--agentation-color-green);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 0.75rem;
}
.styles-module__marker___9CKF7.styles-module__multiSelect___CPfTC.styles-module__pending___BiY-U {
  background-color: var(--agentation-color-green);
}
.styles-module__marker___9CKF7.styles-module__hovered___-mg2N {
  background-color: var(--agentation-color-red);
}

.styles-module__renumber___16lvD {
  display: block;
  animation: styles-module__renumberRoll___akV9B 0.2s ease-out;
}

.styles-module__markerTooltip___-VUm- {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.909);
  z-index: 100002;
  background: #1D1A2F;
  padding: 8px 0.75rem;
  border-radius: 0.75rem;
  font-family: "ST Sans", "DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 400;
  color: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
  min-width: 120px;
  max-width: 200px;
  pointer-events: none;
  cursor: default;
}
.styles-module__markerTooltip___-VUm-.styles-module__enter___8kI3q {
  animation: styles-module__tooltipIn___aJslQ 0.1s ease-out forwards;
}

.styles-module__markerQuote___tQake {
  display: block;
  font-size: 12px;
  font-style: italic;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.3125rem;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.styles-module__markerNote___Rh4eI {
  display: block;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-bottom: 2px;
}

[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
}
[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- .styles-module__markerQuote___tQake {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__markerTooltip___-VUm- .styles-module__markerNote___Rh4eI {
  color: rgba(0, 0, 0, 0.85);
}`,I6={marker:"styles-module__marker___9CKF7",enter:"styles-module__enter___8kI3q",exit:"styles-module__exit___KBdR3",clearing:"styles-module__clearing___8rM7K",markerIn:"styles-module__markerIn___x4G8D",markerOut:"styles-module__markerOut___6VhQN",pending:"styles-module__pending___BiY-U",fixed:"styles-module__fixed___aKrQO",multiSelect:"styles-module__multiSelect___CPfTC",hovered:"styles-module__hovered___-mg2N",renumber:"styles-module__renumber___16lvD",renumberRoll:"styles-module__renumberRoll___akV9B",markerTooltip:"styles-module__markerTooltip___-VUm-",tooltipIn:"styles-module__tooltipIn___aJslQ",markerQuote:"styles-module__markerQuote___tQake",markerNote:"styles-module__markerNote___Rh4eI"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-annotation-marker-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-annotation-marker-styles",document.head.appendChild(e)),e.textContent=N6}var Zn=I6;function S2({annotation:e,globalIndex:t,layerIndex:n,layerSize:o,isExiting:r,isClearing:i,isAnimated:s,isHovered:a,isDeleting:l,isEditingAny:d,renumberFrom:c,markerClickBehavior:p,tooltipStyle:f,onHoverEnter:C,onHoverLeave:w,onClick:m,onContextMenu:S}){let g=(a||l)&&!d,y=g&&p==="delete",E=e.isMultiSelect,A=E?"var(--agentation-color-green)":"var(--agentation-color-accent)",Q=r?Zn.exit:i?Zn.clearing:s?"":Zn.enter,G=r?`${(o-1-n)*20}ms`:`${n*20}ms`;return(0,Zo.jsxs)("div",{className:`${Zn.marker} ${E?Zn.multiSelect:""} ${Q} ${y?Zn.hovered:""}`,"data-annotation-marker":!0,"data-kit-note":e.id,style:{...window.__AGENTATION_KIT_MARKER_AT__?.(e)||{left:`${e.x}%`,top:e.y},backgroundColor:y?void 0:A,animationDelay:G},onMouseEnter:()=>C(e),onMouseLeave:w,onClick:D=>{D.stopPropagation(),r||m(e)},onContextMenu:S?D=>{p==="delete"&&(D.preventDefault(),D.stopPropagation(),r||S(e))}:void 0,children:[g?y?(0,Zo.jsx)(I2,{size:E?18:16}):(0,Zo.jsx)(j4,{size:16}):(0,Zo.jsx)("span",{className:c!==null&&t>=c?Zn.renumber:void 0,children:t+1}),a&&!d&&(0,Zo.jsxs)("div",{className:`${Zn.markerTooltip} ${Zn.enter}`,style:f,children:[(0,Zo.jsxs)("span",{className:Zn.markerQuote,children:[e.element,e.selectedText&&` "${e.selectedText.slice(0,30)}${e.selectedText.length>30?"...":""}"`]}),(0,Zo.jsx)("span",{className:Zn.markerNote,children:e.comment})]})]})}function A6({x:e,y:t,isMultiSelect:n,isExiting:o}){return(0,Zo.jsx)("div",{className:`${Zn.marker} ${Zn.pending} ${n?Zn.multiSelect:""} ${o?Zn.exit:Zn.enter}`,style:{left:`${e}%`,top:t,backgroundColor:n?"var(--agentation-color-green)":"var(--agentation-color-accent)"},children:(0,Zo.jsx)(L4,{size:12})})}function C2({annotation:e,fixed:t}){let n=e.isMultiSelect;return(0,Zo.jsx)("div",{className:`${Zn.marker} ${t?Zn.fixed:""} ${Zn.hovered} ${n?Zn.multiSelect:""} ${Zn.exit}`,"data-annotation-marker":!0,style:window.__AGENTATION_KIT_MARKER_AT__?.(e)||{left:`${e.x}%`,top:e.y},children:(0,Zo.jsx)(I2,{size:n?12:10})})}var L6=`.styles-module__switchContainer___Ka-AB {
  display: flex;
  align-items: center;
  position: relative;
  padding: 2px;
  width: 24px;
  height: 16px;
  border-radius: 8px;
  background-color: #cdcdcd;
  transition: background-color 0.15s, opacity 0.15s;
}
[data-agentation-theme=dark] .styles-module__switchContainer___Ka-AB {
  background-color: #484848;
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:checked) {
  background-color: var(--agentation-color-blue);
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:disabled) {
  opacity: 0.3;
}

.styles-module__switchInput___kYDSD {
  position: absolute;
  z-index: 1;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}
.styles-module__switchInput___kYDSD:disabled {
  cursor: not-allowed;
}

.styles-module__switchThumb___4sCPH {
  border-radius: 50%;
  width: 12px;
  height: 12px;
  background-color: #fff;
  transition: transform 0.15s;
}
.styles-module__switchContainer___Ka-AB:has(.styles-module__switchInput___kYDSD:checked) .styles-module__switchThumb___4sCPH {
  transform: translateX(8px);
}`,$6={switchContainer:"styles-module__switchContainer___Ka-AB",switchInput:"styles-module__switchInput___kYDSD",switchThumb:"styles-module__switchThumb___4sCPH"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-switch-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-switch-styles",document.head.appendChild(e)),e.textContent=L6}var km=$6,Sm=({className:e="",...t})=>(0,pc.jsxs)("div",{className:`${km.switchContainer} ${e}`,children:[(0,pc.jsx)("input",{className:km.switchInput,type:"checkbox",...t}),(0,pc.jsx)("div",{className:km.switchThumb})]}),R6=`.styles-module__checkboxContainer___joqZk {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: 1px solid rgba(26, 26, 26, 0.2);
  border-radius: 4px;
  width: 14px;
  height: 14px;
  background-color: #fff;
  transition: background-color 0.2s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: #252525;
}
.styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #1D1A2F;
}
[data-agentation-theme=dark] .styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) {
  background-color: #fff;
}

.styles-module__checkboxInput___ECzzO {
  position: absolute;
  z-index: 1;
  inset: -1px;
  border-radius: inherit;
  opacity: 0;
  cursor: pointer;
}

.styles-module__checkboxCheck___fUXpr {
  color: #fafafa;
}
[data-agentation-theme=dark] .styles-module__checkboxCheck___fUXpr {
  color: #1D1A2F;
}

.styles-module__checkboxCheckPath___cDyh8 {
  stroke-dasharray: 9.29px;
  stroke-dashoffset: 9.29px;
  color: #fafafa;
  transition: stroke-dashoffset 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__checkboxCheckPath___cDyh8 {
  color: #1D1A2F;
}
.styles-module__checkboxContainer___joqZk:has(.styles-module__checkboxInput___ECzzO:checked) .styles-module__checkboxCheckPath___cDyh8 {
  transition-duration: 0.2s;
  stroke-dashoffset: 0;
}`,O6={checkboxContainer:"styles-module__checkboxContainer___joqZk",checkboxInput:"styles-module__checkboxInput___ECzzO",checkboxCheck:"styles-module__checkboxCheck___fUXpr",checkboxCheckPath:"styles-module__checkboxCheckPath___cDyh8"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-checkbox-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-checkbox-styles",document.head.appendChild(e)),e.textContent=R6}var Ou=O6,P6=({className:e="",...t})=>(0,Fa.jsxs)("div",{className:`${Ou.checkboxContainer} ${e}`,children:[(0,Fa.jsx)("input",{className:Ou.checkboxInput,type:"checkbox",...t}),(0,Fa.jsx)("svg",{className:Ou.checkboxCheck,width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:(0,Fa.jsx)("path",{className:Ou.checkboxCheckPath,d:"M3.94 7L6.13 9.19L10.5 4.81",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]}),D6=`.styles-module__container___w8eAF {
  display: flex;
  align-items: center;
  height: 24px;
}

.styles-module__label___J5mxE {
  padding-inline: 8px 2px;
  line-height: 20px;
  font-size: 13px;
  letter-spacing: -0.15px;
  color: rgba(26, 26, 26, 0.5);
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__label___J5mxE {
  color: rgba(255, 255, 255, 0.5);
}`,z6={container:"styles-module__container___w8eAF",label:"styles-module__label___J5mxE"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-checkbox-field-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-checkbox-field-styles",document.head.appendChild(e)),e.textContent=D6}var E2=z6,T2=({className:e="",label:t,tooltip:n,checked:o,onChange:r,...i})=>{let s=(0,Y2.useId)();return(0,Ba.jsxs)("div",{className:`${E2.container} ${e}`,...i,children:[(0,Ba.jsx)(P6,{id:s,onChange:r,checked:o}),(0,Ba.jsx)("label",{className:E2.label,htmlFor:s,children:t}),n&&(0,Ba.jsx)(As,{content:n})]})},F6=`@keyframes styles-module__cycleTextIn___VBNTi {
  0% {
    opacity: 0;
    transform: translateY(-6px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes styles-module__scaleIn___QpQ8E {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes styles-module__mcpPulse___5Q3Jj {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-green) 0%, transparent);
  }
}
@keyframes styles-module__mcpPulseError___VHxhx {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 50%, transparent);
  }
  70% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--agentation-color-red) 0%, transparent);
  }
}
@keyframes styles-module__themeIconIn___qUWMV {
  0% {
    opacity: 0;
    transform: scale(0.8) rotate(-30deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
.styles-module__settingsPanel___qNkn- {
  position: absolute;
  right: 5px;
  bottom: calc(100% + 0.5rem);
  z-index: 1;
  overflow: hidden;
  background: #1D1A2F;
  border-radius: 16px;
  padding: 12px 0;
  width: 100%;
  max-width: 253px;
  min-width: 205px;
  cursor: default;
  opacity: 1;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}
.styles-module__settingsPanel___qNkn-::before, .styles-module__settingsPanel___qNkn-::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 16px;
  z-index: 2;
  pointer-events: none;
}
.styles-module__settingsPanel___qNkn-::before {
  left: 0;
  background: linear-gradient(to right, #1D1A2F 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn-::after {
  right: 0;
  background: linear-gradient(to left, #1D1A2F 0%, transparent 100%);
}
.styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP,
.styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM,
.styles-module__settingsPanel___qNkn- .styles-module__settingsBrandSlash___Q-AU9,
.styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9,
.styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4,
.styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ,
.styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3,
.styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY,
.styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8,
.styles-module__settingsPanel___qNkn- .styles-module__sliderLabel___6K5v1,
.styles-module__settingsPanel___qNkn- .styles-module__slider___v5z-c,
.styles-module__settingsPanel___qNkn- .styles-module__themeToggle___3imlT {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}
.styles-module__settingsPanel___qNkn-.styles-module__enter___wginS {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0px);
  transition: opacity 0.2s ease, transform 0.2s ease, filter 0.2s ease;
}
.styles-module__settingsPanel___qNkn-.styles-module__exit___A4iJc {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
  filter: blur(5px);
  pointer-events: none;
  transition: opacity 0.1s ease, transform 0.1s ease, filter 0.1s ease;
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- {
  background: #1D1A2F;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.6);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH- {
  color: rgba(255, 255, 255, 0.85);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-:hover {
  background: rgba(255, 255, 255, 0.1);
}
[data-agentation-theme=dark] .styles-module__settingsPanel___qNkn- .styles-module__settingsOption___JoyH-.styles-module__selected___k1-Vq {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.styles-module__settingsPanelContainer___5it-H {
  overflow: visible;
  position: relative;
  display: flex;
  padding: 0 16px;
}

.styles-module__settingsPage___BMn-3 {
  min-width: 100%;
  flex-basis: 0;
  flex-shrink: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transition-delay: 0s;
  opacity: 1;
}

.styles-module__settingsPage___BMn-3.styles-module__slideLeft___qUvW4 {
  transform: translateX(-24px);
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0 {
  position: absolute;
  top: 0;
  left: 24px;
  width: 100%;
  height: 100%;
  padding: 0 16px 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, opacity 0.2s ease;
  opacity: 0;
  pointer-events: none;
}

.styles-module__automationsPage___N7By0.styles-module__slideIn___uXDSu {
  transform: translateX(-24px);
  opacity: 1;
  pointer-events: auto;
}

.styles-module__settingsHeader___Fn1DP {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
}

.styles-module__settingsBrand___OoKlM {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.0094em;
  color: #fff;
  text-decoration: none;
}

.styles-module__settingsBrandSlash___Q-AU9 {
  color: var(--agentation-color-accent);
  transition: color 0.2s ease;
}

.styles-module__settingsVersion___rXmL9 {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  margin-left: auto;
  letter-spacing: -0.0094em;
}

.styles-module__themeToggle___3imlT {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.4);
  transition: background-color 0.15s ease, color 0.15s ease;
  cursor: pointer;
}
.styles-module__themeToggle___3imlT:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__themeToggle___3imlT:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.7);
}

.styles-module__themeIconWrapper___pyaYa {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 20px;
  height: 20px;
}

.styles-module__themeIcon___w7lAm {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: styles-module__themeIconIn___qUWMV 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.styles-module__settingsSectionGrow___eZTRw {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.styles-module__settingsRow___y-tDE {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
}
.styles-module__settingsRow___y-tDE.styles-module__settingsRowMarginTop___uLpGb {
  margin-top: 8px;
}

.styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(255, 255, 255, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsRowDisabled___ydl3Q .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.2);
}

.styles-module__settingsLabel___VCVOQ {
  display: flex;
  align-items: center;
  column-gap: 2px;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.15px;
  color: rgba(255, 255, 255, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__cycleButton___XMBx3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  letter-spacing: -0.0094em;
}
[data-agentation-theme=light] .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
.styles-module__cycleButton___XMBx3:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.styles-module__cycleButtonText___mbbnD {
  display: inline-block;
  animation: styles-module__cycleTextIn___VBNTi 0.2s ease-out;
}

.styles-module__cycleDots___ehp6i {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.styles-module__cycleDot___zgSXY {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.667);
  transition: background-color 0.25s ease-out, transform 0.25s ease-out;
}
.styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: #fff;
  transform: scale(1);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}

.styles-module__colorOptions___pbxZx {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  height: 26px;
}

.styles-module__colorOption___Co955 {
  padding: 0;
  position: relative;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: #fff;
  cursor: pointer;
}
[data-agentation-theme=dark] .styles-module__colorOption___Co955 {
  background-color: #1D1A2F;
}
.styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background-color: var(--swatch);
  transition: opacity 0.2s, transform 0.2s;
}
@supports (color: color(display-p3 0 0 0)) {
  .styles-module__colorOption___Co955::before, .styles-module__colorOption___Co955::after {
    --color: var(--swatch-p3);
  }
}
.styles-module__colorOption___Co955::after {
  z-index: -1;
  transform: scale(1.2);
  opacity: 0;
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::before {
  transform: scale(0.8);
}
.styles-module__colorOption___Co955.styles-module__selected___k1-Vq::after {
  opacity: 1;
}

.styles-module__settingsNavLink___uYIwM {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.15s ease;
  cursor: pointer;
}
.styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(255, 255, 255, 0.9);
}
.styles-module__settingsNavLink___uYIwM svg {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s ease;
}
.styles-module__settingsNavLink___uYIwM:hover svg {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover {
  color: rgba(0, 0, 0, 0.8);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM svg {
  color: rgba(0, 0, 0, 0.25);
}
[data-agentation-theme=light] .styles-module__settingsNavLink___uYIwM:hover svg {
  color: rgba(0, 0, 0, 0.8);
}

.styles-module__settingsNavLinkRight___XBUzC {
  display: flex;
  align-items: center;
  gap: 6px;
}

.styles-module__settingsBackButton___fflll {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  background: transparent;
  font-family: inherit;
  line-height: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.15px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll svg {
  opacity: 0.4;
  flex-shrink: 0;
  transition: opacity 0.15s ease, transform 0.18s cubic-bezier(0.32, 0.72, 0, 1);
}
.styles-module__settingsBackButton___fflll:hover svg {
  opacity: 1;
}
[data-agentation-theme=light] .styles-module__settingsBackButton___fflll {
  color: rgba(0, 0, 0, 0.85);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

.styles-module__automationHeader___Avra9 {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: #fff;
}
[data-agentation-theme=light] .styles-module__automationHeader___Avra9 {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__automationDescription___vFTmJ {
  font-size: 0.6875rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
  line-height: 14px;
}
[data-agentation-theme=light] .styles-module__automationDescription___vFTmJ {
  color: rgba(0, 0, 0, 0.5);
}

.styles-module__learnMoreLink___cG7OI {
  color: rgba(255, 255, 255, 0.8);
  text-decoration-line: underline;
  text-decoration-style: dotted;
  text-decoration-color: rgba(255, 255, 255, 0.2);
  text-underline-offset: 2px;
  transition: color 0.15s ease;
}
.styles-module__learnMoreLink___cG7OI:hover {
  color: #fff;
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI {
  color: rgba(0, 0, 0, 0.6);
  text-decoration-color: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__learnMoreLink___cG7OI:hover {
  color: rgba(0, 0, 0, 0.85);
}

.styles-module__autoSendContainer___VpkXk {
  display: flex;
  align-items: center;
}

.styles-module__autoSendLabel___ngNdC {
  padding-inline-end: 8px;
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.15s, opacity 0.15s;
  cursor: pointer;
}
.styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: #66b8ff;
  color: color(display-p3 0.4 0.72 1);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__autoSendLabel___ngNdC.styles-module__active___dpAhM {
  color: var(--agentation-color-blue);
}
.styles-module__autoSendLabel___ngNdC.styles-module__disabled___9AZYS {
  opacity: 0.3;
  cursor: not-allowed;
}

.styles-module__mcpStatusDot___8AMxP {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpStatusDot___8AMxP.styles-module__disconnected___mvmvQ {
  background-color: var(--agentation-color-red);
  animation: styles-module__mcpPulseError___VHxhx 2s infinite;
}

.styles-module__mcpNavIndicator___auBHI {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connected___WyFkx {
  background-color: var(--agentation-color-green);
  animation: styles-module__mcpPulse___5Q3Jj 2.5s ease-in-out infinite;
}
.styles-module__mcpNavIndicator___auBHI.styles-module__connecting___QEO1r {
  background-color: var(--agentation-color-yellow);
  animation: styles-module__mcpPulse___5Q3Jj 1.5s ease-in-out infinite;
}

.styles-module__webhookUrlInput___WDDDC {
  display: block;
  width: 100%;
  flex: 1;
  min-height: 60px;
  box-sizing: border-box;
  margin-top: 11px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 400;
  color: #fff;
  outline: none;
  resize: none;
  user-select: text;
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC::placeholder {
  color: rgba(0, 0, 0, 0.3);
}
[data-agentation-theme=light] .styles-module__webhookUrlInput___WDDDC:focus {
  border-color: rgba(0, 0, 0, 0.25);
  background: rgba(0, 0, 0, 0.05);
}

[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::before {
  background: linear-gradient(to right, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn-::after {
  background: linear-gradient(to left, #fff 0%, transparent 100%);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsHeader___Fn1DP {
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsBrand___OoKlM {
  color: #E5484D;
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsVersion___rXmL9 {
  color: rgba(0, 0, 0, 0.4);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsSection___n5V-4 {
  border-top-color: rgba(0, 0, 0, 0.08);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__settingsLabel___VCVOQ {
  color: rgba(0, 0, 0, 0.5);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleButton___XMBx3 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY {
  background: rgba(0, 0, 0, 0.2);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__cycleDot___zgSXY.styles-module__active___dpAhM {
  background: rgba(0, 0, 0, 0.7);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8 {
  color: rgba(0, 0, 0, 0.85);
}
[data-agentation-theme=light] .styles-module__settingsPanel___qNkn- .styles-module__dropdownButton___mKHe8:hover {
  background: rgba(0, 0, 0, 0.05);
}

.styles-module__checkboxField___ZrSqv:not(:first-child) {
  margin-top: 8px;
}

.styles-module__divider___h6Yux {
  margin-block: 8px;
  width: 100%;
  height: 1px;
  background-color: rgba(26, 26, 26, 0.07);
}
[data-agentation-theme=dark] .styles-module__divider___h6Yux {
  background-color: rgba(255, 255, 255, 0.07);
}`,B6={settingsPanel:"styles-module__settingsPanel___qNkn-",settingsHeader:"styles-module__settingsHeader___Fn1DP",settingsBrand:"styles-module__settingsBrand___OoKlM",settingsBrandSlash:"styles-module__settingsBrandSlash___Q-AU9",settingsVersion:"styles-module__settingsVersion___rXmL9",settingsSection:"styles-module__settingsSection___n5V-4",settingsLabel:"styles-module__settingsLabel___VCVOQ",cycleButton:"styles-module__cycleButton___XMBx3",cycleDot:"styles-module__cycleDot___zgSXY",dropdownButton:"styles-module__dropdownButton___mKHe8",sliderLabel:"styles-module__sliderLabel___6K5v1",slider:"styles-module__slider___v5z-c",themeToggle:"styles-module__themeToggle___3imlT",enter:"styles-module__enter___wginS",exit:"styles-module__exit___A4iJc",settingsOption:"styles-module__settingsOption___JoyH-",selected:"styles-module__selected___k1-Vq",settingsPanelContainer:"styles-module__settingsPanelContainer___5it-H",settingsPage:"styles-module__settingsPage___BMn-3",slideLeft:"styles-module__slideLeft___qUvW4",automationsPage:"styles-module__automationsPage___N7By0",slideIn:"styles-module__slideIn___uXDSu",themeIconWrapper:"styles-module__themeIconWrapper___pyaYa",themeIcon:"styles-module__themeIcon___w7lAm",themeIconIn:"styles-module__themeIconIn___qUWMV",settingsSectionGrow:"styles-module__settingsSectionGrow___eZTRw",settingsRow:"styles-module__settingsRow___y-tDE",settingsRowMarginTop:"styles-module__settingsRowMarginTop___uLpGb",settingsRowDisabled:"styles-module__settingsRowDisabled___ydl3Q",cycleButtonText:"styles-module__cycleButtonText___mbbnD",cycleTextIn:"styles-module__cycleTextIn___VBNTi",cycleDots:"styles-module__cycleDots___ehp6i",active:"styles-module__active___dpAhM",colorOptions:"styles-module__colorOptions___pbxZx",colorOption:"styles-module__colorOption___Co955",settingsNavLink:"styles-module__settingsNavLink___uYIwM",settingsNavLinkRight:"styles-module__settingsNavLinkRight___XBUzC",settingsBackButton:"styles-module__settingsBackButton___fflll",automationHeader:"styles-module__automationHeader___Avra9",automationDescription:"styles-module__automationDescription___vFTmJ",learnMoreLink:"styles-module__learnMoreLink___cG7OI",autoSendContainer:"styles-module__autoSendContainer___VpkXk",autoSendLabel:"styles-module__autoSendLabel___ngNdC",disabled:"styles-module__disabled___9AZYS",mcpStatusDot:"styles-module__mcpStatusDot___8AMxP",connecting:"styles-module__connecting___QEO1r",mcpPulse:"styles-module__mcpPulse___5Q3Jj",connected:"styles-module__connected___WyFkx",disconnected:"styles-module__disconnected___mvmvQ",mcpPulseError:"styles-module__mcpPulseError___VHxhx",mcpNavIndicator:"styles-module__mcpNavIndicator___auBHI",webhookUrlInput:"styles-module__webhookUrlInput___WDDDC",checkboxField:"styles-module__checkboxField___ZrSqv",divider:"styles-module__divider___h6Yux",scaleIn:"styles-module__scaleIn___QpQ8E"};if(typeof document<"u"){let e=document.getElementById("feedback-tool-styles-settings-panel-styles");e||(e=document.createElement("style"),e.id="feedback-tool-styles-settings-panel-styles",document.head.appendChild(e)),e.textContent=F6}var St=B6;function W6({settings:e,onSettingsChange:t,isDarkMode:n,onToggleTheme:o,isDevMode:r,connectionStatus:i,endpoint:s,isVisible:a,toolbarNearBottom:l,settingsPage:d,onSettingsPageChange:c,onHideToolbar:p}){return(0,mt.jsx)("div",{className:`${St.settingsPanel} ${a?St.enter:St.exit}`,style:l?{bottom:"auto",top:"calc(100% + 0.5rem)"}:void 0,"data-agentation-settings-panel":!0,children:(0,mt.jsxs)("div",{className:St.settingsPanelContainer,children:[(0,mt.jsxs)("div",{className:`${St.settingsPage} ${d==="automations"?St.slideLeft:""}`,children:[(0,mt.jsxs)("div",{className:St.settingsHeader,children:[(0,mt.jsx)("a",{className:St.settingsBrand,href:"https://agentation.com",target:"_blank",rel:"noopener noreferrer",children:(0,mt.jsx)("svg",{width:"72",height:"16",viewBox:"0 0 676 151",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,mt.jsx)("path",{d:"M79.6666 100.561L104.863 15.5213C107.828 4.03448 99.1201 -3.00582 88.7449 1.25541L3.52015 39.6065C1.48217 40.5329 0 42.7562 0 45.1647C0 48.6848 2.77907 51.4639 6.29922 51.4639C7.22558 51.4639 8.15193 51.2786 9.07829 50.9081L93.7472 12.7422C97.2674 11.0748 93.7472 8.29572 92.6356 12.1864L67.624 97.2259C66.5123 100.931 69.4767 105.193 73.7379 105.193C76.517 105.193 79.1108 103.155 79.6666 100.561ZM663.641 100.005C665.679 107.231 677.537 104.081 675.499 96.8553L666.05 66.2856C663.456 57.7631 655.489 55.7251 648.82 61.098L618.991 86.6654C617.324 87.9623 621.029 89.815 621.214 88.1476L625.846 61.6538C626.958 55.3546 624.179 50.5375 615.841 50.5375L579.158 51.0934C576.008 51.0934 578.417 53.8724 578.417 57.022C578.417 60.1716 580.825 61.6538 583.975 61.6538L616.212 60.9127C616.397 60.9127 614.544 59.6158 614.544 59.8011L609.727 88.7034C607.875 99.6344 617.694 102.784 626.031 95.7437L655.86 70.1763L654.192 69.6205L663.641 100.005ZM571.191 89.0739C555.443 88.7034 562.298 61.4685 578.787 61.8391C594.72 62.0243 587.124 89.2592 571.191 89.0739ZM571.006 100.375C601.575 100.931 611.024 51.6492 579.158 51.0934C547.847 50.5375 540.065 99.8197 571.006 100.375ZM521.909 46.4616C525.985 46.4616 529.505 42.9414 529.505 38.6802C529.505 34.4189 525.985 31.0841 521.909 31.0841C517.833 31.0841 514.127 34.6042 514.127 38.6802C514.127 42.7562 517.648 46.4616 521.909 46.4616ZM472.256 103.525C493.192 103.71 515.98 73.3259 519.13 62.3949L509.866 60.9127C505.234 73.3259 497.638 101.672 519.871 102.043C536.545 102.228 552.479 85.3685 563.595 70.1763C564.151 69.2499 564.706 68.1383 564.706 66.8414C564.706 63.6918 563.965 61.098 560.816 61.098C558.963 61.098 557.296 62.0243 556.184 63.5065C546.365 77.0313 530.802 90.9266 522.094 90.7414C511.904 90.5561 517.462 71.4732 519.871 64.9887C523.391 55.7251 512.831 53.5019 509.681 60.9127C506.531 68.6941 488.19 92.4088 475.035 92.2235C467.439 92.0383 464.29 83.8863 472.441 59.9864L486.707 17.7445C487.634 14.4097 485.41 10.519 481.334 10.519C478.741 10.519 476.517 12.1864 475.962 14.4097L461.696 56.4662C451.506 86.4801 455.211 103.155 472.256 103.525ZM447.43 42.5709L496.527 41.4593C499.306 41.4593 501.529 39.0507 501.529 36.2717C501.529 33.3073 499.306 31.0841 496.341 31.0841L447.245 32.1957C444.466 32.1957 442.242 34.4189 442.242 37.3833C442.242 40.1624 444.466 42.5709 447.43 42.5709ZM422.974 106.304C435.387 106.489 457.249 94.8173 472.441 53.8724C473.553 50.7228 472.071 48.3143 468.365 48.3143C466.142 48.3143 464.29 49.6112 463.548 51.6492C450.394 87.2212 431.682 96.1142 424.456 95.929C419.454 95.929 417.972 93.3352 418.713 85.5538C419.454 78.1429 410.376 74.9933 406.114 81.1073C401.297 87.777 394.442 94.2615 385.549 94.0763C370.172 93.891 376.471 67.0267 399.815 67.3972C408.338 67.5825 414.452 71.4732 417.045 76.6608C417.786 78.3282 419.454 79.6251 421.492 79.6251C424.271 79.6251 426.679 77.2166 426.679 74.4375C426.679 73.6964 426.494 72.9553 426.124 72.2143C421.862 63.6918 412.414 57.3926 400 57.2073C363.502 56.6515 353.497 104.451 383.326 104.822C397.036 105.193 410.005 94.0763 413.34 85.9243C412.599 86.8507 408.338 86.6654 408.523 84.4422C407.411 97.4111 410.931 106.119 422.974 106.304ZM335.897 104.266C335.897 115.012 347.569 117.606 347.569 103.34C347.569 89.0739 358.5 54.4282 361.464 45.1647L396.666 43.6825C405.929 43.1267 404.262 33.1221 397.036 33.3073L364.984 34.4189L368.875 22.7469C369.801 20.1531 370.542 17.9298 370.542 16.2624C370.542 13.4833 368.504 11.8159 365.911 11.8159C362.946 11.8159 360.352 12.7422 357.573 21.0794L352.942 35.16L330.153 36.0864C326.263 36.4569 323.483 38.1244 323.483 41.6445C323.483 45.5352 326.448 47.0174 330.709 46.8321L349.421 45.9058C345.901 56.6515 335.897 90.7414 335.897 104.266ZM186.939 78.6988C193.979 56.4662 212.877 54.984 212.877 62.9507C212.877 68.3236 203.984 77.0313 186.939 78.6988ZM113.942 150.955C142.844 152.437 159.704 111.492 160.63 80.5515C161.556 73.3259 153.96 70.3616 148.773 75.7344C141.918 83.1453 129.505 93.1499 119.685 93.1499C103.011 93.1499 116.165 59.8011 143.956 59.8011C149.514 59.8011 153.59 61.6538 156.184 64.0623C160.815 68.3236 170.82 62.0243 165.818 56.0957C161.927 51.4639 155.072 48.129 144.882 48.129C102.455 48.129 83.7426 105.007 116.721 105.007C134.692 105.007 151.367 88.3329 155.257 82.7747C154.516 83.5158 149.329 81.2925 149.699 79.4398L149.143 83.5158C148.958 107.045 134.322 141.506 116.536 139.838C113.386 139.468 112.089 137.43 112.089 134.836C112.089 128.907 122.094 119.273 145.067 113.53C159.518 109.824 152.293 101.487 143.4 104.081C111.163 113.53 99.6759 127.425 99.6759 137.8C99.6759 145.026 105.605 150.584 113.942 150.955ZM194.72 109.454C214.359 109.454 239 95.3732 251.228 77.9577C250.301 82.96 246.596 96.8553 246.596 101.487C246.596 110.01 254.748 109.454 261.232 102.784L288.097 75.5491L290.32 85.7391C293.284 99.4491 299.213 104.822 308.847 104.822C326.263 104.822 342.196 85.7391 349.421 74.8081L344.049 63.6918C339.787 74.8081 321.631 92.5941 311.626 92.5941C306.994 92.5941 304.771 89.815 303.289 83.7011L300.325 71.2879C297.916 60.7275 289.023 58.3189 279.018 68.1383L261.788 84.8127L264.382 69.991C266.235 59.2453 255.674 58.1337 250.116 65.915C241.779 77.0313 216.767 97.7817 196.387 97.7817C187.865 97.7817 185.456 93.7057 185.456 88.3329C230.848 84.998 239.185 47.2027 208.986 47.2027C172.858 47.2027 157.11 109.454 194.72 109.454Z",fill:"currentColor"})})}),(0,mt.jsxs)("p",{className:St.settingsVersion,children:["v","3.0.2"]}),(0,mt.jsx)("button",{className:St.themeToggle,onClick:o,title:n?"Switch to light mode":"Switch to dark mode",children:(0,mt.jsx)("span",{className:St.themeIconWrapper,children:(0,mt.jsx)("span",{className:St.themeIcon,children:n?(0,mt.jsx)(W4,{size:20}):(0,mt.jsx)(H4,{size:20})},n?"sun":"moon")})})]}),(0,mt.jsx)("div",{className:St.divider}),(0,mt.jsxs)("div",{className:St.settingsSection,children:[(0,mt.jsxs)("div",{className:St.settingsRow,children:[(0,mt.jsxs)("div",{className:St.settingsLabel,children:["Output detail",(0,mt.jsx)(As,{content:"Controls how much detail is included in the copied output"})]}),(0,mt.jsxs)("button",{className:St.cycleButton,onClick:()=>{let C=(dc.findIndex(w=>w.value===e.outputDetail)+1)%dc.length;t({outputDetail:dc[C].value})},children:[(0,mt.jsx)("span",{className:St.cycleButtonText,children:dc.find(f=>f.value===e.outputDetail)?.label},e.outputDetail),(0,mt.jsx)("span",{className:St.cycleDots,children:dc.map(f=>(0,mt.jsx)("span",{className:`${St.cycleDot} ${e.outputDetail===f.value?St.active:""}`},f.value))})]})]}),(0,mt.jsxs)("div",{className:`${St.settingsRow} ${St.settingsRowMarginTop} ${r?"":St.settingsRowDisabled}`,children:[(0,mt.jsxs)("div",{className:St.settingsLabel,children:["React components",(0,mt.jsx)(As,{content:r?"Include React component names in annotations":"Disabled \u2014 production builds minify component names, making detection unreliable. Use in development mode."})]}),(0,mt.jsx)(Sm,{checked:r&&e.reactEnabled,onChange:f=>t({reactEnabled:f.target.checked}),disabled:!r})]}),(0,mt.jsxs)("div",{className:`${St.settingsRow} ${St.settingsRowMarginTop}`,children:[(0,mt.jsxs)("div",{className:St.settingsLabel,children:["Hide until restart",(0,mt.jsx)(As,{content:"Hides the toolbar until you open a new tab"})]}),(0,mt.jsx)(Sm,{checked:!1,onChange:f=>{f.target.checked&&p()}})]})]}),(0,mt.jsx)("div",{className:St.divider}),(0,mt.jsxs)("div",{className:St.settingsSection,children:[(0,mt.jsx)(T2,{className:"checkbox-field",label:"Clear on copy/send",checked:e.autoClearAfterCopy,onChange:f=>t({autoClearAfterCopy:f.target.checked}),tooltip:"Automatically clear annotations after copying"}),(0,mt.jsx)(T2,{className:St.checkboxField,label:"Block page interactions",checked:e.blockInteractions,onChange:f=>t({blockInteractions:f.target.checked})})]}),(0,mt.jsx)("div",{className:St.divider}),(0,mt.jsxs)("button",{className:St.settingsNavLink,onClick:()=>c("automations"),children:[(0,mt.jsx)("span",{children:"MCP and webhooks"}),(0,mt.jsxs)("span",{className:St.settingsNavLinkRight,children:[(0,mt.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,mt.jsx)("path",{d:"M7.5 12.5L12 8L7.5 3.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})]})]})]}),(0,mt.jsxs)("div",{className:`${St.settingsPage} ${St.automationsPage} ${d==="automations"?St.slideIn:""}`,children:[(0,mt.jsxs)("button",{className:St.settingsBackButton,onClick:()=>c("main"),children:[(0,mt.jsx)(q4,{size:16}),(0,mt.jsx)("span",{children:"MCP and webhooks"})]}),(0,mt.jsx)("div",{className:St.divider}),(0,mt.jsxs)("div",{className:St.settingsSection,children:[(0,mt.jsxs)("div",{className:St.settingsRow,children:[(0,mt.jsxs)("span",{className:St.automationHeader,children:["MCP connection",(0,mt.jsx)(As,{content:"Connect via Model Context Protocol to let AI agents like Claude Code receive annotations in real-time."})]}),s&&(0,mt.jsx)("span",{style:{fontSize:12,opacity:.6},children:i==="connected"?"Connected":i==="connecting"?"Connecting\u2026":"Not connected"})]}),(0,mt.jsxs)("p",{className:St.automationDescription,style:{paddingBottom:6},children:["MCP connection allows agents to receive and act on annotations."," ",(0,mt.jsx)("a",{href:"https://agentation.dev/mcp",target:"_blank",rel:"noopener noreferrer",className:St.learnMoreLink,children:"Learn more"})]})]}),(0,mt.jsx)("div",{className:St.divider}),(0,mt.jsxs)("div",{className:`${St.settingsSection} ${St.settingsSectionGrow}`,children:[(0,mt.jsxs)("div",{className:St.settingsRow,children:[(0,mt.jsxs)("span",{className:St.automationHeader,children:["Webhooks",(0,mt.jsx)(As,{content:"Send annotation data to any URL endpoint when annotations change. Useful for custom integrations."})]}),(0,mt.jsxs)("div",{className:St.autoSendContainer,children:[(0,mt.jsx)("label",{htmlFor:"agentation-auto-send",className:`${St.autoSendLabel} ${e.webhooksEnabled?St.active:""} ${e.webhookUrl?"":St.disabled}`,children:"Auto-send"}),(0,mt.jsx)(Sm,{id:"agentation-auto-send",checked:e.webhooksEnabled,onChange:f=>t({webhooksEnabled:f.target.checked}),disabled:!e.webhookUrl})]})]}),(0,mt.jsx)("p",{className:St.automationDescription,children:"The webhook URL will receive live annotation changes and annotation data."}),(0,mt.jsx)("textarea",{className:St.webhookUrlInput,placeholder:"Webhook URL",value:e.webhookUrl,onKeyDown:f=>f.stopPropagation(),onChange:f=>t({webhookUrl:f.target.value})})]})]})]})})}function Cm(e,t="filtered"){let{name:n,path:o}=za(e);if(t==="off")return{name:n,elementName:n,path:o,reactComponents:null};let r=m6(e,{mode:t});return{name:r.path?`${r.path} ${n}`:n,elementName:n,path:o,reactComponents:r.path}}var M2=!1,Em={outputDetail:"standard",autoClearAfterCopy:!1,annotationColorId:"blue",blockInteractions:!0,reactEnabled:!0,markerClickBehavior:"edit",webhookUrl:"",webhooksEnabled:!0},Vr=e=>{if(!e||!e.trim())return!1;try{let t=new URL(e.trim());return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},H6={compact:"off",standard:"filtered",detailed:"smart",forensic:"all"},Du=[{id:"indigo",label:"Indigo",srgb:"#6155F5",p3:"color(display-p3 0.38 0.33 0.96)"},{id:"blue",label:"Blue",srgb:"#0088FF",p3:"color(display-p3 0.00 0.53 1.00)"},{id:"cyan",label:"Cyan",srgb:"#00C3D0",p3:"color(display-p3 0.00 0.76 0.82)"},{id:"green",label:"Green",srgb:"#34C759",p3:"color(display-p3 0.20 0.78 0.35)"},{id:"yellow",label:"Yellow",srgb:"#FFCC00",p3:"color(display-p3 1.00 0.80 0.00)"},{id:"orange",label:"Orange",srgb:"#FF8D28",p3:"color(display-p3 1.00 0.55 0.16)"},{id:"red",label:"Red",srgb:"#FF383C",p3:"color(display-p3 1.00 0.22 0.24)"}],j6=()=>{if(typeof document>"u"||document.getElementById("agentation-color-tokens"))return;let e=document.createElement("style");e.id="agentation-color-tokens",e.textContent=[...Du.map(t=>`
      [data-agentation-accent="${t.id}"] {
        --agentation-color-accent: ${t.srgb};
      }

      @supports (color: color(display-p3 0 0 0)) {
        [data-agentation-accent="${t.id}"] {
          --agentation-color-accent: ${t.p3};
        }
      }
    `),`:root {
      ${Du.map(t=>`--agentation-color-${t.id}: ${t.srgb};`).join(`
`)}
    }`,`@supports (color: color(display-p3 0 0 0)) {
      :root {
        ${Du.map(t=>`--agentation-color-${t.id}: ${t.p3};`).join(`
`)}
      }
    }`].join(""),document.head.appendChild(e)};j6();function Is(e,t){let n=document.elementFromPoint(e,t);if(!n)return null;for(;n?.shadowRoot;){let o=n.shadowRoot.elementFromPoint(e,t);if(!o||o===n)break;n=o}return n}function Tm(e){let t=e;for(;t&&t!==document.body;){let o=window.getComputedStyle(t).position;if(o==="fixed"||o==="sticky")return!0;t=t.parentElement}return!1}function Vi(e){return e.status!=="resolved"&&e.status!=="dismissed"}function Pu(e){let t=Om(e),n=t.found?t:E6(e);if(n.found&&n.source)return C6(n.source,"path")}function V2({demoAnnotations:e,demoDelay:t=1e3,enableDemoMode:n=!1,onAnnotationAdd:o,onAnnotationDelete:r,onAnnotationUpdate:i,onAnnotationsClear:s,onCopy:a,onSubmit:l,copyToClipboard:d=!0,endpoint:c,sessionId:p,onSessionCreated:f,webhookUrl:C,className:w}={}){let[m,S]=(0,X.useState)(!1),[g,y]=(0,X.useState)(!1),E=m&&!g,[A,Q]=(0,X.useState)([]),[G,D]=(0,X.useState)(!0),[le,K]=(0,X.useState)(()=>t6()),[W,Y]=(0,X.useState)(!1),he=(0,X.useRef)(null);(0,X.useEffect)(()=>{let k=P=>{let F=he.current;F&&F.contains(P.target)&&P.stopPropagation()},M=["mousedown","click","pointerdown"];return M.forEach(P=>document.body.addEventListener(P,k)),()=>{M.forEach(P=>document.body.removeEventListener(P,k))}},[]);let[Ce,Oe]=(0,X.useState)(!1),[Pe,je]=(0,X.useState)(!1),[$e,rt]=(0,X.useState)(null),[Ve,gt]=(0,X.useState)({x:0,y:0}),[U,oe]=(0,X.useState)(null),[de,Re]=(0,X.useState)(!1),[ze,Ke]=(0,X.useState)("idle"),[Et,dn]=(0,X.useState)(!1),[Ye,Rt]=(0,X.useState)(!1),[Ft,lt]=(0,X.useState)(null),[ht,Ze]=(0,X.useState)(null),[qt,Zt]=(0,X.useState)([]),[en,on]=(0,X.useState)(null),[R,re]=(0,X.useState)(null),[ae,ve]=(0,X.useState)(null),[Ge,Xe]=(0,X.useState)(null),[it,Pt]=(0,X.useState)([]),[Qe,bt]=(0,X.useState)(0),[j,q]=(0,X.useState)(!1),[J,ye]=(0,X.useState)(!1),[Ae,qe]=(0,X.useState)(!1),[me,Me]=(0,X.useState)(!1),[Ue,It]=(0,X.useState)(!1),[jt,Qt]=(0,X.useState)("main"),[Kt,Ot]=(0,X.useState)(!1),[ke,Lt]=(0,X.useState)(!1),[At,T]=(0,X.useState)(!1),[L,z]=(0,X.useState)([]),[Z,te]=(0,X.useState)(null),Ne=(0,X.useRef)(!1),[h,I]=(0,X.useState)(!1),[O,ee]=(0,X.useState)(!1),[se,ce]=(0,X.useState)(1),[b,B]=(0,X.useState)("new-page"),[ie,ne]=(0,X.useState)(""),[Le,De]=(0,X.useState)(!1),[fe,Fe]=(0,X.useState)(null),we=(0,X.useRef)(!1),pt=(0,X.useRef)({rearrange:null,placements:[]}),Tt=(0,X.useRef)({rearrange:null,placements:[]}),[dt,yt]=(0,X.useState)(0),[tn,an]=(0,X.useState)(0),[Nn,Bn]=(0,X.useState)(0),[mr,mo]=(0,X.useState)(0),no=(0,X.useRef)(new Set),Yt=(0,X.useRef)(new Set),Wn=(0,X.useRef)(null),gr=(0,X.useRef)(),Ji=ke&&m&&!At&&h;(0,X.useEffect)(()=>{if(Ji){ee(!1);let k=Da(()=>{ee(!0)});return()=>cancelAnimationFrame(k)}else ee(!1)},[Ji]);let Jt=(0,X.useRef)(new Map),wn=(0,X.useRef)(new Map),Zi=(0,X.useRef)(),[jo,Ds]=(0,X.useState)(!1),[Co,es]=(0,X.useState)([]),pp=(0,X.useRef)(Co);pp.current=Co;let[Sc,S0]=(0,X.useState)(null),Jr=(0,X.useRef)(null),C0=(0,X.useRef)(!1),Va=(0,X.useRef)([]),fp=(0,X.useRef)(0),E0=(0,X.useRef)(null),Cc=(0,X.useRef)(null),T0=(0,X.useRef)(1),[Zr,Or]=(0,X.useState)(!1),_r=(0,X.useRef)(null),[In,yr]=(0,X.useState)([]),Uo=(0,X.useRef)({cmd:!1,shift:!1}),oo=()=>{Ot(!0)},Ec=()=>{Ot(!1)},Tc=()=>{Zr||(_r.current=Ct(()=>Or(!0),850))},Ga=()=>{_r.current&&(clearTimeout(_r.current),_r.current=null),Or(!1),Ec()};(0,X.useEffect)(()=>()=>{_r.current&&clearTimeout(_r.current)},[]);let[Wt,ei]=(0,X.useState)(()=>{try{let k=JSON.parse(localStorage.getItem("feedback-toolbar-settings")??"");return{...Em,...k,annotationColorId:Du.find(M=>M.id===k.annotationColorId)?k.annotationColorId:Em.annotationColorId}}catch{return Em}}),[Eo,u]=(0,X.useState)(!0),[v,$]=(0,X.useState)(!1),V=()=>{he.current?.classList.add(Te.disableTransitions),u(k=>!k),Da(()=>{he.current?.classList.remove(Te.disableTransitions)})},ue=!1,pe=ue&&Wt.reactEnabled?H6[Wt.outputDetail]:"off",[be,et]=(0,X.useState)(p??null),kt=(0,X.useRef)(!1),[_t,at]=(0,X.useState)(c?"connecting":"disconnected"),[Je,Ee]=(0,X.useState)(null),[tt,$t]=(0,X.useState)(!1),[Cn,Ut]=(0,X.useState)(null),tr=(0,X.useRef)(!1),[xr,ti]=(0,X.useState)(new Set),[Xa,zs]=(0,X.useState)(new Set),[Fs,Pr]=(0,X.useState)(!1),[hp,Bs]=(0,X.useState)(!1),[ni,Mc]=(0,X.useState)(!1),bi=(0,X.useRef)(null),nr=(0,X.useRef)(null),Qa=(0,X.useRef)(null),ts=(0,X.useRef)(null),Nc=(0,X.useRef)(!1),M0=(0,X.useRef)(0),Ic=(0,X.useRef)(null),N0=(0,X.useRef)(null),mp=8,q5=50,I0=(0,X.useRef)(null),A0=(0,X.useRef)(null),Ja=(0,X.useRef)(null),[,K5]=(0,X.useState)(0);(0,X.useEffect)(()=>{let k=()=>K5(M=>M+1);return document.addEventListener("agentation-kit:route",k),()=>document.removeEventListener("agentation-kit:route",k)},[]);let Nt=typeof window<"u"?window.__AGENTATION_KIT_PAGE_KEY__?window.__AGENTATION_KIT_PAGE_KEY__():window.location.pathname:"/";(0,X.useEffect)(()=>{if(me)It(!0);else{Ot(!1),Qt("main");let k=Ct(()=>It(!1),0);return()=>clearTimeout(k)}},[me]);let Ws=m&&G&&!ke;(0,X.useEffect)(()=>{window.__AGENTATION_KIT_MARKERS_SHOWN__=Ws,document.dispatchEvent(new CustomEvent("agentation-kit:markers",{detail:{shown:Ws}}))},[Ws]),(0,X.useEffect)(()=>{if(Ws){je(!1),Oe(!0),ti(new Set);let k=Ct(()=>{ti(M=>{let P=new Set(M);return A.forEach(F=>P.add(F.id)),P})},350);return()=>clearTimeout(k)}else if(Ce){je(!0);let k=Ct(()=>{Oe(!1),je(!1)},250);return()=>clearTimeout(k)}},[Ws]),(0,X.useEffect)(()=>{ye(!0),bt(window.scrollY);let k=ym(Nt);Q(k.filter(Vi)),M2||($(!0),M2=!0,Ct(()=>$(!1),750));try{let M=localStorage.getItem("feedback-toolbar-theme");M!==null&&u(M==="dark")}catch{}try{let M=localStorage.getItem("feedback-toolbar-position");if(M){let P=JSON.parse(M);typeof P.x=="number"&&typeof P.y=="number"&&Ee(P)}}catch{}},[Nt]),(0,X.useEffect)(()=>{J&&localStorage.setItem("feedback-toolbar-settings",JSON.stringify(Wt))},[Wt,J]),(0,X.useEffect)(()=>{J&&localStorage.setItem("feedback-toolbar-theme",Eo?"dark":"light")},[Eo,J]),(0,X.useEffect)(()=>{let k=()=>{let P=!!window.__AGENTATION_KIT_EDIT__?.active||!!window.__AGENTATION_KIT_TWEAK__?.active;y(P),P&&(rt(null),yr([]),Mc(!1),bi.current=null,nr.current=null,ts.current&&(ts.current.innerHTML=""),Ds(!1),Lt(!1),te(null))},M=P=>{P.detail?.active&&P.detail?.kind==="session"&&(rt(null),oe(null),yr([]),Mc(!1),bi.current=null,nr.current=null)};return document.addEventListener("agentation-kit:voice-capture",M),document.addEventListener("agentation-kit:edit-change",k),document.addEventListener("agentation-kit:tweak-change",k),k(),()=>{document.removeEventListener("agentation-kit:edit-change",k),document.removeEventListener("agentation-kit:tweak-change",k),document.removeEventListener("agentation-kit:voice-capture",M)}},[]),(0,X.useEffect)(()=>{m||(window.__AGENTATION_KIT_EDIT__?.toggle(!1),window.__AGENTATION_KIT_TWEAK__?.toggle(!1))},[m]),(0,X.useEffect)(()=>{let k=P=>Ee(P.detail),M=async()=>{if(!(!c||!be))try{let P=await vm(c,be);Q(P.annotations.filter(F=>Vi(F)&&F.status!=="dismissed"&&F.status!=="resolved"))}catch{}};return document.addEventListener("agentation-kit:toolbar-position",k),document.addEventListener("agentation-kit:annotations-refresh",M),()=>{document.removeEventListener("agentation-kit:toolbar-position",k),document.removeEventListener("agentation-kit:annotations-refresh",M)}},[c,be]);let L0=(0,X.useRef)(!1);(0,X.useEffect)(()=>{let k=L0.current;L0.current=tt,k&&!tt&&Je&&J&&localStorage.setItem("feedback-toolbar-position",JSON.stringify(Je))},[tt,Je,J]),(0,X.useEffect)(()=>{if(!c||!J||kt.current===Nt)return;kt.current&&et(null),kt.current=Nt,at("connecting"),(async()=>{try{let M=Z3(Nt),P=p||M,F=!1;if(P)try{let H=await vm(c,P);et(H.id),at("connected"),xm(Nt,H.id),F=!0;let ge=ym(Nt),We=new Set(H.annotations.map(st=>st.id)),He=ge.filter(st=>!We.has(st.id));if(He.length>0){let wt=`${typeof window<"u"?window.location.origin:""}${Nt}`,Bt=(await Promise.allSettled(He.map(Mt=>Oa(c,H.id,{...Mt,sessionId:H.id,url:wt})))).map((Mt,ut)=>Mt.status==="fulfilled"?Mt.value:(console.warn("[Agentation] Failed to sync annotation:",Mt.reason),He[ut])),Vt=[...H.annotations,...Bt];Q(Vt.filter(Vi)),ac(Nt,Vt.filter(Vi),H.id)}else Q(H.annotations.filter(Vi)),ac(Nt,H.annotations.filter(Vi),H.id)}catch(H){console.warn("[Agentation] Could not join session, creating new:",H),e6(Nt)}if(!F){let H=typeof window<"u"?window.location.href:"/",ge=await wm(c,H);et(ge.id),at("connected"),xm(Nt,ge.id),f?.(ge.id);let We=q3(),He=typeof window<"u"?window.location.origin:"",st=[];for(let[wt,vt]of We){let Bt=vt.filter(ut=>!ut._syncedTo);if(Bt.length===0)continue;let Vt=`${He}${wt}`,Mt=wt===Nt;st.push((async()=>{try{let ut=Mt?ge:await wm(c,Vt),ro=(await Promise.allSettled(Bt.map(pn=>Oa(c,ut.id,{...pn,sessionId:ut.id,url:Vt})))).map((pn,Yn)=>pn.status==="fulfilled"?pn.value:(console.warn("[Agentation] Failed to sync annotation:",pn.reason),Bt[Yn])).filter(Vi);if(ac(wt,ro,ut.id),Mt){let pn=new Set(Bt.map(Yn=>Yn.id));Q(Yn=>{let Dt=Yn.filter(Ht=>!pn.has(Ht.id));return[...ro,...Dt]})}}catch(ut){console.warn(`[Agentation] Failed to sync annotations for ${wt}:`,ut)}})())}await Promise.allSettled(st)}}catch(M){at("disconnected"),console.warn("[Agentation] Failed to initialize session, using local storage:",M)}})()},[c,p,J,f,Nt]),(0,X.useEffect)(()=>{if(!c||!J)return;let k=async()=>{try{(await fetch(`${c}/health`)).ok?at("connected"):at("disconnected")}catch{at("disconnected")}};k();let M=V4(k,1e4);return()=>clearInterval(M)},[c,J]),(0,X.useEffect)(()=>{if(!c||!J||!be)return;let k=new EventSource(`${c}/sessions/${be}/events`),M=["resolved","dismissed"],P=F=>{try{let H=JSON.parse(F.data);if(M.includes(H.payload?.status)){let ge=H.payload.id,We=H.payload.kind;if(We==="placement"){for(let[He,st]of Jt.current)if(st===ge){Jt.current.delete(He),z(wt=>wt.filter(vt=>vt.id!==He));break}}else if(We==="rearrange"){for(let[He,st]of wn.current)if(st===ge){wn.current.delete(He),Fe(wt=>{if(!wt)return null;let vt=wt.sections.filter(Bt=>Bt.id!==He);return vt.length===0?null:{...wt,sections:vt}});break}}else zs(He=>new Set(He).add(ge)),Ct(()=>{Q(He=>He.filter(st=>st.id!==ge)),zs(He=>{let st=new Set(He);return st.delete(ge),st})},150)}}catch{}};return k.addEventListener("annotation.updated",P),()=>{k.removeEventListener("annotation.updated",P),k.close()}},[c,J,be]),(0,X.useEffect)(()=>{if(!c||!J)return;let k=N0.current==="disconnected",M=_t==="connected";N0.current=_t,k&&M&&(async()=>{try{let F=ym(Nt);if(F.length===0)return;let ge=`${typeof window<"u"?window.location.origin:""}${Nt}`,We=be,He=[];if(We)try{He=(await vm(c,We)).annotations}catch{We=null}We||(We=(await wm(c,ge)).id,et(We),xm(Nt,We));let st=new Set(He.map(vt=>vt.id)),wt=F.filter(vt=>!st.has(vt.id));if(wt.length>0){let Bt=(await Promise.allSettled(wt.map(ut=>Oa(c,We,{...ut,sessionId:We,url:ge})))).map((ut,Kn)=>ut.status==="fulfilled"?ut.value:(console.warn("[Agentation] Failed to sync annotation on reconnect:",ut.reason),wt[Kn])),Mt=[...He,...Bt].filter(Vi);Q(Mt),ac(Nt,Mt,We)}}catch(F){console.warn("[Agentation] Failed to sync on reconnect:",F)}})()},[_t,c,J,be,Nt]);let Y5=(0,X.useCallback)(()=>{W||(Y(!0),Me(!1),S(!1),Ct(()=>{n6(!0),K(!0),Y(!1)},400))},[W]);(0,X.useEffect)(()=>{if(!n||!J||!e||e.length===0||A.length>0)return;let k=[];return k.push(Ct(()=>{S(!0)},t-200)),e.forEach((M,P)=>{let F=t+P*300;k.push(Ct(()=>{let H=document.querySelector(M.selector);if(!H)return;let ge=H.getBoundingClientRect(),{name:We,path:He}=za(H),st={id:`demo-${Date.now()}-${P}`,x:(ge.left+ge.width/2)/window.innerWidth*100,y:ge.top+ge.height/2+window.scrollY,comment:M.comment,element:We,elementPath:He,timestamp:Date.now(),selectedText:M.selectedText,boundingBox:{x:ge.left,y:ge.top+window.scrollY,width:ge.width,height:ge.height},nearbyText:ic(H),cssClasses:sc(H)};Q(wt=>[...wt,st])},F))}),()=>{k.forEach(clearTimeout)}},[n,J,e,t]),(0,X.useEffect)(()=>{let k=()=>{bt(window.scrollY),q(!0),Ja.current&&clearTimeout(Ja.current),Ja.current=Ct(()=>{q(!1)},150)};return window.addEventListener("scroll",k,{passive:!0}),()=>{window.removeEventListener("scroll",k),Ja.current&&clearTimeout(Ja.current)}},[]),(0,X.useEffect)(()=>{J&&A.length>0?be?ac(Nt,A,be):U2(Nt,A):J&&A.length===0&&localStorage.removeItem(Bu(Nt))},[A,Nt,J,be]),(0,X.useEffect)(()=>{if(J&&!Ne.current){Ne.current=!0;let k=K3(Nt);k.length>0&&z(k)}},[J,Nt]),(0,X.useEffect)(()=>{J&&Ne.current&&!h&&(L.length>0?Y3(Nt,L):V3(Nt))},[L,Nt,J,h]),(0,X.useEffect)(()=>{if(J&&!we.current){we.current=!0;let k=G3(Nt);if(k){let M={...k,sections:k.sections.map(P=>({...P,currentRect:P.currentRect??{...P.originalRect}}))};Fe(M)}}},[J,Nt]),(0,X.useEffect)(()=>{J&&we.current&&!h&&(fe?X3(Nt,fe):Q3(Nt))},[fe,Nt,J,h]);let gp=(0,X.useRef)(!1);(0,X.useEffect)(()=>{if(J&&!gp.current){gp.current=!0;let k=J3(Nt);k&&(Tt.current={rearrange:k.rearrange,placements:k.placements||[]},k.purpose&&ne(k.purpose))}},[J,Nt]),(0,X.useEffect)(()=>{if(!J||!gp.current)return;let k=Tt.current;h?(fe?.sections?.length??0)>0||L.length>0||ie?x2(Nt,{rearrange:fe,placements:L,purpose:ie}):$u(Nt):(k.rearrange?.sections?.length??0)>0||k.placements.length>0||ie?x2(Nt,{rearrange:k.rearrange,placements:k.placements,purpose:ie}):$u(Nt)},[fe,L,ie,h,Nt,J]),(0,X.useEffect)(()=>{ke&&!fe&&Fe({sections:[],originalOrder:[],detectedAt:Date.now()})},[ke,fe]),(0,X.useEffect)(()=>{if(!c||!be)return;let k=Jt.current,M=new Set(L.map(P=>P.id));for(let P of L){if(k.has(P.id))continue;k.set(P.id,"");let F=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:Nt;Oa(c,be,{id:P.id,x:P.x/window.innerWidth*100,y:P.y,comment:`Place ${P.type} at (${Math.round(P.x)}, ${Math.round(P.y)}), ${P.width}\xD7${P.height}px${P.text?` \u2014 "${P.text}"`:""}`,element:`[design:${P.type}]`,elementPath:"[placement]",timestamp:P.timestamp,url:F,intent:"change",severity:"important",kind:"placement",placement:{componentType:P.type,width:P.width,height:P.height,scrollY:P.scrollY,text:P.text}}).then(H=>{k.has(P.id)&&k.set(P.id,H.id)}).catch(H=>{console.warn("[Agentation] Failed to sync placement annotation:",H),k.delete(P.id)})}for(let[P,F]of k)M.has(P)||(k.delete(P),F&&_i(c,F).catch(()=>{}))},[L,c,be,Nt]),(0,X.useEffect)(()=>{if(!(!c||!be))return Zi.current&&clearTimeout(Zi.current),Zi.current=Ct(()=>{let k=wn.current;if(!fe||fe.sections.length===0){for(let[,F]of k)F&&_i(c,F).catch(()=>{});k.clear();return}let M=new Set(fe.sections.map(F=>F.id)),P=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:Nt;for(let F of fe.sections){let H=F.originalRect,ge=F.currentRect;if(!(Math.abs(H.x-ge.x)>1||Math.abs(H.y-ge.y)>1||Math.abs(H.width-ge.width)>1||Math.abs(H.height-ge.height)>1)){let st=k.get(F.id);st&&(k.delete(F.id),_i(c,st).catch(()=>{}));continue}let He=k.get(F.id);He?w2(c,He,{comment:`Move ${F.label} section (${F.tagName}) \u2014 from (${Math.round(H.x)},${Math.round(H.y)}) ${Math.round(H.width)}\xD7${Math.round(H.height)} to (${Math.round(ge.x)},${Math.round(ge.y)}) ${Math.round(ge.width)}\xD7${Math.round(ge.height)}`}).catch(st=>{console.warn("[Agentation] Failed to update rearrange annotation:",st)}):(k.set(F.id,""),Oa(c,be,{id:F.id,x:ge.x/window.innerWidth*100,y:ge.y,comment:`Move ${F.label} section (${F.tagName}) \u2014 from (${Math.round(H.x)},${Math.round(H.y)}) ${Math.round(H.width)}\xD7${Math.round(H.height)} to (${Math.round(ge.x)},${Math.round(ge.y)}) ${Math.round(ge.width)}\xD7${Math.round(ge.height)}`,element:F.selector,elementPath:"[rearrange]",timestamp:Date.now(),url:P,intent:"change",severity:"important",kind:"rearrange",rearrange:{selector:F.selector,label:F.label,tagName:F.tagName,originalRect:H,currentRect:ge}}).then(st=>{k.has(F.id)&&k.set(F.id,st.id)}).catch(st=>{console.warn("[Agentation] Failed to sync rearrange annotation:",st),k.delete(F.id)}))}for(let[F,H]of k)M.has(F)||(k.delete(F),H&&_i(c,H).catch(()=>{}))},300),()=>{Zi.current&&clearTimeout(Zi.current)}},[fe,c,be,Nt]);let Hs=(0,X.useRef)(new Map);(0,X.useLayoutEffect)(()=>{let k=fe?.sections??[],M=new Set;if((ke||At)&&m)for(let P of k){M.add(P.id);try{let F=document.querySelector(P.selector);if(!F)continue;if(!Hs.current.has(P.id)){let H={transform:F.style.transform,transformOrigin:F.style.transformOrigin,opacity:F.style.opacity,position:F.style.position,zIndex:F.style.zIndex,display:F.style.display},ge=[],We=F.parentElement;for(;We&&We!==document.body;){let st=getComputedStyle(We);(st.overflow!=="visible"||st.overflowX!=="visible"||st.overflowY!=="visible")&&(ge.push({el:We,overflow:We.style.overflow}),We.style.overflow="visible"),We=We.parentElement}getComputedStyle(F).display==="inline"&&(F.style.display="inline-block"),Hs.current.set(P.id,{el:F,origStyles:H,ancestors:ge}),F.style.transformOrigin="top left",F.style.zIndex="9999"}}catch{}}for(let[P,F]of Hs.current)if(!M.has(P)){let{el:H,origStyles:ge,ancestors:We}=F;H.style.transition="transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",H.style.transform=ge.transform,H.style.transformOrigin=ge.transformOrigin,H.style.opacity=ge.opacity,H.style.position=ge.position,H.style.zIndex=ge.zIndex,Hs.current.delete(P),Ct(()=>{H.style.transition="",H.style.display=ge.display;for(let He of We)He.el.style.overflow=He.overflow},450)}},[fe,ke,At,m]),(0,X.useEffect)(()=>()=>{for(let[,k]of Hs.current){let{el:M,origStyles:P,ancestors:F}=k;M.style.transition="transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)",M.style.transform=P.transform,M.style.transformOrigin=P.transformOrigin,M.style.opacity=P.opacity,M.style.position=P.position,M.style.zIndex=P.zIndex,Ct(()=>{M.style.transition="",M.style.display=P.display;for(let H of F)H.el.style.overflow=H.overflow},450)}Hs.current.clear()},[]);let Ac=(0,X.useCallback)(()=>{T(!0),Lt(!1),te(null),clearTimeout(gr.current),gr.current=Ct(()=>{T(!1)},300)},[]),$0=(0,X.useCallback)(()=>{ke&&(T(!0),Lt(!1),te(null),clearTimeout(gr.current),gr.current=Ct(()=>{T(!1)},300)),S(!1)},[ke]),R0=(0,X.useCallback)(()=>{Ae||(X4(),qe(!0))},[Ae]),Lc=(0,X.useCallback)(()=>{Ae&&(i2(),qe(!1))},[Ae]),_p=(0,X.useCallback)(()=>{Ae?Lc():R0()},[Ae,R0,Lc]),O0=(0,X.useCallback)(()=>{if(In.length===0)return;let k=In[0],M=k.element,P=In.length>1,F=In.map(H=>H.element.getBoundingClientRect());if(P){let H={left:Math.min(...F.map(ut=>ut.left)),top:Math.min(...F.map(ut=>ut.top)),right:Math.max(...F.map(ut=>ut.right)),bottom:Math.max(...F.map(ut=>ut.bottom))},ge=In.slice(0,5).map(ut=>ut.name).join(", "),We=In.length>5?` +${In.length-5} more`:"",He=F.map(ut=>({x:ut.left,y:ut.top+window.scrollY,width:ut.width,height:ut.height})),wt=In[In.length-1].element,vt=F[F.length-1],Bt=vt.left+vt.width/2,Vt=vt.top+vt.height/2,Mt=Tm(wt);oe({x:Bt/window.innerWidth*100,y:Mt?Vt:Vt+window.scrollY,clientY:Vt,element:`${In.length} elements: ${ge}${We}`,elementPath:"multi-select",boundingBox:{x:H.left,y:H.top+window.scrollY,width:H.right-H.left,height:H.bottom-H.top},isMultiSelect:!0,isFixed:Mt,elementBoundingBoxes:He,multiSelectElements:In.map(ut=>ut.element),targetElement:wt,fullPath:Iu(M),accessibility:Nu(M),computedStyles:Mu(M),computedStylesObj:Tu(M),nearbyElements:Eu(M),cssClasses:sc(M),nearbyText:ic(M),sourceFile:Pu(M)})}else{let H=F[0],ge=Tm(M);oe({x:H.left/window.innerWidth*100,y:ge?H.top:H.top+window.scrollY,clientY:H.top,element:k.name,elementPath:k.path,boundingBox:{x:H.left,y:ge?H.top:H.top+window.scrollY,width:H.width,height:H.height},isFixed:ge,fullPath:Iu(M),accessibility:Nu(M),computedStyles:Mu(M),computedStylesObj:Tu(M),nearbyElements:Eu(M),cssClasses:sc(M),nearbyText:ic(M),reactComponents:k.reactComponents,sourceFile:Pu(M)})}yr([]),rt(null)},[In]);(0,X.useEffect)(()=>{m||(oe(null),ve(null),Xe(null),Pt([]),rt(null),Me(!1),yr([]),Uo.current={cmd:!1,shift:!1},Ae&&Lc())},[m,Ae,Lc]),(0,X.useEffect)(()=>()=>{i2()},[]),(0,X.useEffect)(()=>{if(!E)return;let k=["p","span","h1","h2","h3","h4","h5","h6","li","td","th","label","blockquote","figcaption","caption","legend","dt","dd","pre","code","em","strong","b","i","u","s","a","time","address","cite","q","abbr","dfn","mark","small","sub","sup","[contenteditable]"].join(", "),M=":not([data-agentation-root]):not([data-agentation-root] *)",P=document.createElement("style");return P.id="feedback-cursor-styles",P.textContent=`
      body ${M} {
        cursor: crosshair !important;
      }

      body :is(${k})${M} {
        cursor: text !important;
      }
    `,document.head.appendChild(P),()=>{let F=document.getElementById("feedback-cursor-styles");F&&F.remove()}},[E]),(0,X.useEffect)(()=>{if(Sc!==null&&E)return document.documentElement.setAttribute("data-drawing-hover",""),()=>document.documentElement.removeAttribute("data-drawing-hover")},[Sc,E]),(0,X.useEffect)(()=>{if(!E||U||jo||ke)return;let k=M=>{if(window.__AGENTATION_KIT_VOICE_RECORDING__)return;let P=M.composedPath()[0]||M.target;if(Oo(P,"[data-feedback-toolbar]")){rt(null);return}let F=Is(M.clientX,M.clientY);if(!F||Oo(F,"[data-feedback-toolbar]")){rt(null);return}let{name:H,elementName:ge,path:We,reactComponents:He}=Cm(F,pe),st=F.getBoundingClientRect();rt({element:H,elementName:ge,elementPath:We,rect:st,reactComponents:He}),gt({x:M.clientX,y:M.clientY})};return document.addEventListener("mousemove",k),()=>document.removeEventListener("mousemove",k)},[E,U,jo,ke,pe,Co]);let $c=(0,X.useCallback)(k=>{if(ve(k),lt(null),Ze(null),Zt([]),k.elementBoundingBoxes?.length){let M=[];for(let P of k.elementBoundingBoxes){let F=P.x+P.width/2,H=P.y+P.height/2-window.scrollY,ge=Is(F,H);ge&&M.push(ge)}Pt(M),Xe(null)}else if(k.boundingBox){let M=k.boundingBox,P=M.x+M.width/2,F=k.isFixed?M.y+M.height/2:M.y+M.height/2-window.scrollY,H=Is(P,F);if(H){let ge=H.getBoundingClientRect(),We=ge.width/M.width,He=ge.height/M.height;We<.5||He<.5?Xe(null):Xe(H)}else Xe(null);Pt([])}else Xe(null),Pt([])},[]);(0,X.useEffect)(()=>{if(!E||jo||ke)return;let k=M=>{if(window.__AGENTATION_KIT_VOICE_RECORDING__)return;if(Nc.current){Nc.current=!1;return}let P=M.composedPath()[0]||M.target;if(Oo(P,"[data-feedback-toolbar]")||Oo(P,"[data-annotation-popup]")||Oo(P,"[data-annotation-marker]"))return;if(M.metaKey&&M.shiftKey&&!U&&!ae){M.preventDefault(),M.stopPropagation();let mn=Is(M.clientX,M.clientY);if(!mn)return;let ro=mn.getBoundingClientRect(),{name:pn,path:Yn,reactComponents:Dt}=Cm(mn,pe),Ht=In.findIndex(Rn=>Rn.element===mn);Ht>=0?yr(Rn=>Rn.filter((Hn,vr)=>vr!==Ht)):yr(Rn=>[...Rn,{element:mn,rect:ro,name:pn,path:Yn,reactComponents:Dt??void 0}]);return}let F=Oo(P,"button, a, input, select, textarea, [role='button'], [onclick]");if(Wt.blockInteractions&&F&&(M.preventDefault(),M.stopPropagation()),U){if(F&&!Wt.blockInteractions)return;M.preventDefault(),I0.current?.shake();return}if(ae){if(F&&!Wt.blockInteractions)return;M.preventDefault(),A0.current?.shake();return}M.preventDefault();let H=Is(M.clientX,M.clientY);if(!H)return;let{name:ge,path:We,reactComponents:He}=Cm(H,pe),st=H.getBoundingClientRect(),wt=M.clientX/window.innerWidth*100,vt=Tm(H),Bt=vt?M.clientY:M.clientY+window.scrollY,Vt=window.getSelection(),Mt;Vt&&Vt.toString().trim().length>0&&(Mt=Vt.toString().trim().slice(0,500));let ut=Tu(H),Kn=Mu(H);oe({x:wt,y:Bt,clientY:M.clientY,element:ge,elementPath:We,selectedText:Mt,boundingBox:{x:st.left,y:vt?st.top:st.top+window.scrollY,width:st.width,height:st.height},nearbyText:ic(H),cssClasses:sc(H),isFixed:vt,fullPath:Iu(H),accessibility:Nu(H),computedStyles:Kn,computedStylesObj:ut,nearbyElements:Eu(H),reactComponents:He??void 0,sourceFile:Pu(H),targetElement:H}),rt(null)};return document.addEventListener("click",k,!0),()=>document.removeEventListener("click",k,!0)},[E,jo,ke,U,ae,Wt.blockInteractions,pe,In]),(0,X.useEffect)(()=>{if(!E)return;let k=F=>{F.key==="Meta"&&(Uo.current.cmd=!0),F.key==="Shift"&&(Uo.current.shift=!0)},M=F=>{let H=Uo.current.cmd&&Uo.current.shift;F.key==="Meta"&&(Uo.current.cmd=!1),F.key==="Shift"&&(Uo.current.shift=!1);let ge=Uo.current.cmd&&Uo.current.shift;H&&!ge&&In.length>0&&O0()},P=()=>{Uo.current={cmd:!1,shift:!1},yr([])};return document.addEventListener("keydown",k),document.addEventListener("keyup",M),window.addEventListener("blur",P),()=>{document.removeEventListener("keydown",k),document.removeEventListener("keyup",M),window.removeEventListener("blur",P)}},[E,In,O0]),(0,X.useEffect)(()=>{if(!E||U||jo||ke)return;let k=M=>{if(window.__AGENTATION_KIT_VOICE_RECORDING__)return;let P=M.composedPath()[0]||M.target;Oo(P,"[data-feedback-toolbar]")||Oo(P,"[data-annotation-marker]")||Oo(P,"[data-annotation-popup]")||new Set(["P","SPAN","H1","H2","H3","H4","H5","H6","LI","TD","TH","LABEL","BLOCKQUOTE","FIGCAPTION","CAPTION","LEGEND","DT","DD","PRE","CODE","EM","STRONG","B","I","U","S","A","TIME","ADDRESS","CITE","Q","ABBR","DFN","MARK","SMALL","SUB","SUP"]).has(P.tagName)||P.isContentEditable||(M.preventDefault(),bi.current={x:M.clientX,y:M.clientY})};return document.addEventListener("mousedown",k),()=>document.removeEventListener("mousedown",k)},[E,U,jo,ke]),(0,X.useEffect)(()=>{if(!E||U)return;let k=M=>{if(window.__AGENTATION_KIT_VOICE_RECORDING__||!bi.current)return;let P=M.clientX-bi.current.x,F=M.clientY-bi.current.y,H=P*P+F*F,ge=mp*mp;if(!ni&&H>=ge&&(nr.current=bi.current,Mc(!0),M.preventDefault()),(ni||H>=ge)&&nr.current){if(Qa.current){let Dt=Math.min(nr.current.x,M.clientX),Ht=Math.min(nr.current.y,M.clientY),Rn=Math.abs(M.clientX-nr.current.x),Hn=Math.abs(M.clientY-nr.current.y);Qa.current.style.transform=`translate(${Dt}px, ${Ht}px)`,Qa.current.style.width=`${Rn}px`,Qa.current.style.height=`${Hn}px`}let We=Date.now();if(We-M0.current<q5)return;M0.current=We;let He=nr.current.x,st=nr.current.y,wt=Math.min(He,M.clientX),vt=Math.min(st,M.clientY),Bt=Math.max(He,M.clientX),Vt=Math.max(st,M.clientY),Mt=(wt+Bt)/2,ut=(vt+Vt)/2,Kn=new Set,mn=[[wt,vt],[Bt,vt],[wt,Vt],[Bt,Vt],[Mt,ut],[Mt,vt],[Mt,Vt],[wt,ut],[Bt,ut]];for(let[Dt,Ht]of mn){let Rn=document.elementsFromPoint(Dt,Ht);for(let Hn of Rn)Hn instanceof HTMLElement&&Kn.add(Hn)}let ro=document.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th, div, span, section, article, aside, nav");for(let Dt of ro)if(Dt instanceof HTMLElement){let Ht=Dt.getBoundingClientRect(),Rn=Ht.left+Ht.width/2,Hn=Ht.top+Ht.height/2,vr=Rn>=wt&&Rn<=Bt&&Hn>=vt&&Hn<=Vt,or=Math.min(Ht.right,Bt)-Math.max(Ht.left,wt),go=Math.min(Ht.bottom,Vt)-Math.max(Ht.top,vt),el=or>0&&go>0?or*go:0,os=Ht.width*Ht.height,ki=os>0?el/os:0;(vr||ki>.5)&&Kn.add(Dt)}let pn=[],Yn=new Set(["BUTTON","A","INPUT","IMG","P","H1","H2","H3","H4","H5","H6","LI","LABEL","TD","TH","SECTION","ARTICLE","ASIDE","NAV"]);for(let Dt of Kn){if(Oo(Dt,"[data-feedback-toolbar]")||Oo(Dt,"[data-annotation-marker]"))continue;let Ht=Dt.getBoundingClientRect();if(!(Ht.width>window.innerWidth*.8&&Ht.height>window.innerHeight*.5)&&!(Ht.width<10||Ht.height<10)&&Ht.left<Bt&&Ht.right>wt&&Ht.top<Vt&&Ht.bottom>vt){let Rn=Dt.tagName,Hn=Yn.has(Rn);if(!Hn&&(Rn==="DIV"||Rn==="SPAN")){let vr=Dt.textContent&&Dt.textContent.trim().length>0,or=Dt.onclick!==null||Dt.getAttribute("role")==="button"||Dt.getAttribute("role")==="link"||Dt.classList.contains("clickable")||Dt.hasAttribute("data-clickable");(vr||or)&&!Dt.querySelector("p, h1, h2, h3, h4, h5, h6, button, a")&&(Hn=!0)}if(Hn){let vr=!1;for(let or of pn)if(or.left<=Ht.left&&or.right>=Ht.right&&or.top<=Ht.top&&or.bottom>=Ht.bottom){vr=!0;break}vr||pn.push(Ht)}}}if(ts.current){let Dt=ts.current;for(;Dt.children.length>pn.length;)Dt.removeChild(Dt.lastChild);pn.forEach((Ht,Rn)=>{let Hn=Dt.children[Rn];Hn||(Hn=document.createElement("div"),Hn.className=Te.selectedElementHighlight,Dt.appendChild(Hn)),Hn.style.transform=`translate(${Ht.left}px, ${Ht.top}px)`,Hn.style.width=`${Ht.width}px`,Hn.style.height=`${Ht.height}px`})}}};return document.addEventListener("mousemove",k,{passive:!0}),()=>document.removeEventListener("mousemove",k)},[E,U,ni,mp]),(0,X.useEffect)(()=>{if(!E)return;let k=M=>{if(window.__AGENTATION_KIT_VOICE_RECORDING__)return;let P=ni,F=nr.current;if(ni&&F){Nc.current=!0;let H=Math.min(F.x,M.clientX),ge=Math.min(F.y,M.clientY),We=Math.max(F.x,M.clientX),He=Math.max(F.y,M.clientY),st=[];document.querySelectorAll("button, a, input, img, p, h1, h2, h3, h4, h5, h6, li, label, td, th").forEach(Mt=>{if(!(Mt instanceof HTMLElement)||Oo(Mt,"[data-feedback-toolbar]")||Oo(Mt,"[data-annotation-marker]"))return;let ut=Mt.getBoundingClientRect();ut.width>window.innerWidth*.8&&ut.height>window.innerHeight*.5||ut.width<10||ut.height<10||ut.left<We&&ut.right>H&&ut.top<He&&ut.bottom>ge&&st.push({element:Mt,rect:ut})});let vt=st.filter(({element:Mt})=>!st.some(({element:ut})=>ut!==Mt&&Mt.contains(ut))),Bt=M.clientX/window.innerWidth*100,Vt=M.clientY+window.scrollY;if(vt.length>0){let Mt=vt.reduce((Yn,{rect:Dt})=>({left:Math.min(Yn.left,Dt.left),top:Math.min(Yn.top,Dt.top),right:Math.max(Yn.right,Dt.right),bottom:Math.max(Yn.bottom,Dt.bottom)}),{left:1/0,top:1/0,right:-1/0,bottom:-1/0}),ut=vt.slice(0,5).map(({element:Yn})=>za(Yn).name).join(", "),Kn=vt.length>5?` +${vt.length-5} more`:"",mn=vt[0].element,ro=Tu(mn),pn=Mu(mn);oe({x:Bt,y:Vt,clientY:M.clientY,element:`${vt.length} elements: ${ut}${Kn}`,elementPath:"multi-select",boundingBox:{x:Mt.left,y:Mt.top+window.scrollY,width:Mt.right-Mt.left,height:Mt.bottom-Mt.top},isMultiSelect:!0,fullPath:Iu(mn),accessibility:Nu(mn),computedStyles:pn,computedStylesObj:ro,nearbyElements:Eu(mn),cssClasses:sc(mn),nearbyText:ic(mn),sourceFile:Pu(mn)})}else{let Mt=Math.abs(We-H),ut=Math.abs(He-ge);Mt>20&&ut>20&&oe({x:Bt,y:Vt,clientY:M.clientY,element:"Area selection",elementPath:`region at (${Math.round(H)}, ${Math.round(ge)})`,boundingBox:{x:H,y:ge+window.scrollY,width:Mt,height:ut},isMultiSelect:!0})}rt(null)}else P&&(Nc.current=!0);bi.current=null,nr.current=null,Mc(!1),ts.current&&(ts.current.innerHTML="")};return document.addEventListener("mouseup",k),()=>document.removeEventListener("mouseup",k)},[E,ni]);let wr=(0,X.useCallback)(async(k,M,P)=>{let F=Wt.webhookUrl||C;if(!F||!Wt.webhooksEnabled&&!P)return!1;try{return(await fetch(F,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event:k,timestamp:Date.now(),url:typeof window<"u"?window.location.href:void 0,...M})})).ok}catch(H){return console.warn("[Agentation] Webhook failed:",H),!1}},[C,Wt.webhookUrl,Wt.webhooksEnabled]),V5=(0,X.useCallback)(k=>{if(!U)return;let M={id:Date.now().toString(),x:U.x,y:U.y,comment:k,element:U.element,elementPath:U.elementPath,timestamp:Date.now(),selectedText:U.selectedText,boundingBox:U.boundingBox,nearbyText:U.nearbyText,cssClasses:U.cssClasses,isMultiSelect:U.isMultiSelect,isFixed:U.isFixed,fullPath:U.fullPath,accessibility:U.accessibility,computedStyles:U.computedStyles,nearbyElements:U.nearbyElements,reactComponents:U.reactComponents,sourceFile:U.sourceFile,elementBoundingBoxes:U.elementBoundingBoxes,...c&&be?{sessionId:be,url:typeof window<"u"?window.location.href:void 0,status:"pending"}:{}};Q(P=>[...P,M]),Ic.current=M.id,Ct(()=>{Ic.current=null},300),Ct(()=>{ti(P=>new Set(P).add(M.id))},250),o?.(M),wr("annotation.add",{annotation:M}),Pr(!0),Ct(()=>{oe(null),Pr(!1)},150),window.getSelection()?.removeAllRanges(),c&&be&&(window.__AGENTATION_KIT_SYNC_NEW__||(P=>P()))(()=>Oa(c,be,M),M).then(P=>{P.id!==M.id&&(Q(F=>F.map(H=>H.id===M.id?{...H,id:P.id}:H)),ti(F=>{let H=new Set(F);return H.delete(M.id),H.add(P.id),H}))}).catch(P=>{console.warn("[Agentation] Failed to sync annotation:",P)})},[U,o,wr,c,be]),yp=(0,X.useCallback)(()=>{Pr(!0),Ct(()=>{oe(null),Pr(!1)},150)},[]),xp=(0,X.useCallback)(k=>{let M=A.findIndex(F=>F.id===k),P=A[M];if(P&&window.__AGENTATION_KIT_OWNS__&&!window.__AGENTATION_KIT_OWNS__(P)){window.__AGENTATION_KIT_NOT_YOURS__?.(P);return}ae?.id===k&&(Bs(!0),Ct(()=>{ve(null),Xe(null),Pt([]),Bs(!1)},150)),on(k),zs(F=>new Set(F).add(k)),P&&(r?.(P),wr("annotation.delete",{annotation:P})),c&&_i(c,k).catch(F=>{console.warn("[Agentation] Failed to delete annotation from server:",F)}),Ct(()=>{Q(F=>F.filter(H=>H.id!==k)),zs(F=>{let H=new Set(F);return H.delete(k),H}),on(null),M<A.length-1&&(re(M),Ct(()=>re(null),200))},150)},[A,ae,r,wr,c]),Rc=(0,X.useCallback)(k=>{if(!k){lt(null),Ze(null),Zt([]);return}if(lt(k.id),k.elementBoundingBoxes?.length){let M=[];for(let P of k.elementBoundingBoxes){let F=P.x+P.width/2,H=P.y+P.height/2-window.scrollY,We=document.elementsFromPoint(F,H).find(He=>!He.closest("[data-annotation-marker]")&&!He.closest("[data-agentation-root]"));We&&M.push(We)}Zt(M),Ze(null)}else if(k.boundingBox){let M=k.boundingBox,P=M.x+M.width/2,F=k.isFixed?M.y+M.height/2:M.y+M.height/2-window.scrollY,H=Is(P,F);if(H){let ge=H.getBoundingClientRect(),We=ge.width/M.width,He=ge.height/M.height;We<.5||He<.5?Ze(null):Ze(H)}else Ze(null);Zt([])}else Ze(null),Zt([])},[]),G5=(0,X.useCallback)(k=>{if(!ae)return;let M={...ae,comment:k};Q(P=>P.map(F=>F.id===ae.id?M:F)),i?.(M),wr("annotation.update",{annotation:M}),c&&w2(c,ae.id,{comment:k}).catch(P=>{console.warn("[Agentation] Failed to update annotation on server:",P)}),Bs(!0),Ct(()=>{ve(null),Xe(null),Pt([]),Bs(!1)},150)},[ae,i,wr,c]),X5=(0,X.useCallback)(()=>{Bs(!0),Ct(()=>{ve(null),Xe(null),Pt([]),Bs(!1)},150)},[]),ns=(0,X.useCallback)(()=>{let k=A.length,M=L.length>0||!!fe;if(k===0&&Co.length===0&&!M)return;if(window.__AGENTATION_KIT_OWNS__&&window.__AGENTATION_KIT_CONFIRM_CLEAR__){let H=A.filter(He=>window.__AGENTATION_KIT_OWNS__(He));if(!window.__AGENTATION_KIT_CONFIRM_CLEAR__(H.length,k-H.length))return!1;s?.(H),wr("annotations.clear",{annotations:H}),c&&Promise.allSettled(H.map(He=>_i(c,He.id))).then(He=>{He.some(st=>st.status==="rejected")&&document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"))});let ge=new Set(H.map(He=>He.id));es([]);let We=Jr.current;return We&&We.getContext("2d")?.clearRect(0,0,We.width,We.height),ti(He=>new Set([...He].filter(st=>!ge.has(st)))),Q(He=>He.filter(st=>!ge.has(st.id))),dn(!0),Ct(()=>dn(!1),1500),!1}if(s?.(A),wr("annotations.clear",{annotations:A}),c){Promise.all(A.map(H=>_i(c,H.id).catch(ge=>{console.warn("[Agentation] Failed to delete annotation from server:",ge)})));for(let[,H]of Jt.current)H&&_i(c,H).catch(()=>{});Jt.current.clear();for(let[,H]of wn.current)H&&_i(c,H).catch(()=>{});wn.current.clear()}Rt(!0),dn(!0),es([]);let P=Jr.current;if(P){let H=P.getContext("2d");H&&H.clearRect(0,0,P.width,P.height)}(L.length>0||fe)&&(Bn(H=>H+1),mo(H=>H+1),Ct(()=>{z([]),Fe(null)},200)),h&&I(!1),ie&&ne(""),Tt.current={rearrange:null,placements:[]},$u(Nt);let F=k*30+200;Ct(()=>{Q([]),ti(new Set),localStorage.removeItem(Bu(Nt)),Rt(!1)},F),Ct(()=>dn(!1),1500)},[Nt,A,Co,L,fe,h,ie,s,wr,c]),wp=(0,X.useCallback)(async()=>{let k=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:Nt,M=ke&&h,P;if(M){if(L.length===0&&!fe&&!ie)return;P=""}else{if(P=k2(A,k,Wt.outputDetail),!P&&Co.length===0&&L.length===0&&!fe)return;P||(P=`## Page Feedback: ${k}
`)}if(!M&&Co.length>0){let F=new Set;for(let He of A)He.drawingIndex!=null&&F.add(He.drawingIndex);let H=Jr.current;H&&(H.style.visibility="hidden");let ge=[],We=window.scrollY;for(let He=0;He<Co.length;He++){if(F.has(He))continue;let st=Co[He];if(st.points.length<2)continue;let wt=st.fixed?st.points:st.points.map(eo=>({x:eo.x,y:eo.y-We})),vt=1/0,Bt=1/0,Vt=-1/0,Mt=-1/0;for(let eo of wt)vt=Math.min(vt,eo.x),Bt=Math.min(Bt,eo.y),Vt=Math.max(Vt,eo.x),Mt=Math.max(Mt,eo.y);let ut=Vt-vt,Kn=Mt-Bt,mn=Math.hypot(ut,Kn),ro=wt[0],pn=wt[wt.length-1],Yn=Math.hypot(pn.x-ro.x,pn.y-ro.y),Dt,Ht=Yn<mn*.35,Rn=ut/Math.max(Kn,1);if(Ht&&mn>20){let eo=Math.max(ut,Kn)*.15,Si=0;for(let rs of wt){let Z5=rs.x-vt<eo,ew=Vt-rs.x<eo,tw=rs.y-Bt<eo,nw=Mt-rs.y<eo;(Z5||ew)&&(tw||nw)&&Si++}Dt=Si>wt.length*.15?"box":"circle"}else Rn>3&&Kn<40?Dt="underline":Yn>mn*.5?Dt="arrow":Dt="drawing";let Hn=Math.min(10,wt.length),vr=Math.max(1,Math.floor(wt.length/Hn)),or=new Set,go=[],el=[ro];for(let eo=vr;eo<wt.length-1;eo+=vr)el.push(wt[eo]);el.push(pn);for(let eo of el){let Si=Is(eo.x,eo.y);if(!Si||or.has(Si)||Oo(Si,"[data-feedback-toolbar]"))continue;or.add(Si);let{name:rs}=za(Si);go.includes(rs)||go.push(rs)}let os=`${Math.round(vt)},${Math.round(Bt)} \u2192 ${Math.round(Vt)},${Math.round(Mt)}`,ki;(Dt==="circle"||Dt==="box")&&go.length>0?ki=`${Dt==="box"?"Boxed":"Circled"} **${go[0]}**${go.length>1?` (and ${go.slice(1).join(", ")})`:""} (region: ${os})`:Dt==="underline"&&go.length>0?ki=`Underlined **${go[0]}** (${os})`:Dt==="arrow"&&go.length>=2?ki=`Arrow from **${go[0]}** to **${go[go.length-1]}** (${Math.round(ro.x)},${Math.round(ro.y)} \u2192 ${Math.round(pn.x)},${Math.round(pn.y)})`:go.length>0?ki=`${Dt==="arrow"?"Arrow":"Drawing"} near **${go.join("**, **")}** (region: ${os})`:ki=`Drawing at ${os}`,ge.push(ki)}H&&(H.style.visibility=""),ge.length>0&&(P+=`
**Drawings:**
`,ge.forEach((He,st)=>{P+=`${st+1}. ${He}
`}))}if((L.length>0||M&&ie)&&(P+=`
`+_2(L,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:h,wireframePurpose:ie||void 0},Wt.outputDetail)),fe){let F=y2(fe,Wt.outputDetail,{width:window.innerWidth,height:window.innerHeight});F&&(P+=`
`+F)}if(d)try{await navigator.clipboard.writeText(P)}catch{}a?.(P),Re(!0),Ct(()=>Re(!1),2e3),Wt.autoClearAfterCopy&&Ct(()=>ns(),500)},[A,Co,L,fe,h,ke,b,ie,Nt,Wt.outputDetail,pe,Wt.autoClearAfterCopy,ns,d,a]),vp=(0,X.useCallback)(async()=>{let k=typeof window<"u"?window.location.pathname+window.location.search+window.location.hash:Nt,M=k2(A,k,Wt.outputDetail);if(!M&&L.length===0&&!fe)return;if(M||(M=`## Page Feedback: ${k}
`),L.length>0&&(M+=`
`+_2(L,{width:window.innerWidth,height:window.innerHeight},{blankCanvas:h,wireframePurpose:ie||void 0},Wt.outputDetail)),fe){let F=y2(fe,Wt.outputDetail,{width:window.innerWidth,height:window.innerHeight});F&&(M+=`
`+F)}l&&l(M,A),Ke("sending"),await new Promise(F=>Ct(F,150));let P=await wr("submit",{output:M,annotations:A},!0);Ke(P?"sent":"failed"),Ct(()=>Ke("idle"),2500),P&&Wt.autoClearAfterCopy&&Ct(()=>ns(),500)},[l,wr,A,L,fe,h,b,Nt,Wt.outputDetail,pe,Wt.autoClearAfterCopy,ns]);(0,X.useEffect)(()=>{if(!Cn)return;let k=10,M=F=>{let H=F.clientX-Cn.x,ge=F.clientY-Cn.y,We=Math.sqrt(H*H+ge*ge);if(!tt&&We>k&&$t(!0),tt||We>k){let He=Cn.toolbarX+H,st=Cn.toolbarY+ge,wt=20,vt=window.__AGENTATION_KIT_TOOLBAR_WIDTH__?.()??337,Bt=44,Vt=m?_t==="connected"?297:257:44,Mt=window.__AGENTATION_KIT_TOOLBAR_WIDTH__?window.__AGENTATION_KIT_TOOLBAR_OFFSET__?.()??0:vt-Vt,ut=wt-Mt,Kn=window.innerWidth-wt-vt;He=Math.max(ut,Math.min(Kn,He)),st=Math.max(wt,Math.min(window.innerHeight-Bt-wt,st)),Ee({x:He,y:st})}},P=()=>{tt&&(tr.current=!0),$t(!1),Ut(null)};return document.addEventListener("mousemove",M),document.addEventListener("mouseup",P),()=>{document.removeEventListener("mousemove",M),document.removeEventListener("mouseup",P)}},[Cn,tt,m,_t]);let Q5=(0,X.useCallback)(k=>{if(k.target.closest("button")||k.target.closest("[data-agentation-settings-panel]"))return;let M=k.currentTarget.parentElement;if(!M)return;let P=M.getBoundingClientRect(),F=Je?.x??P.left,H=Je?.y??P.top;Ut({x:k.clientX,y:k.clientY,toolbarX:F,toolbarY:H})},[Je]);if((0,X.useEffect)(()=>{if(!Je)return;let k=()=>{let P=window.__AGENTATION_KIT_TOOLBAR_WIDTH__?.()??337,F=44,H=Je.x,ge=Je.y,We=m?_t==="connected"?297:257:44,st=20-(window.__AGENTATION_KIT_TOOLBAR_WIDTH__?window.__AGENTATION_KIT_TOOLBAR_OFFSET__?.()??0:P-We),wt=window.innerWidth-20-P;H=Math.max(st,Math.min(wt,H)),ge=Math.max(20,Math.min(window.innerHeight-F-20,ge)),(H!==Je.x||ge!==Je.y)&&Ee({x:H,y:ge})};return k(),window.addEventListener("resize",k),()=>window.removeEventListener("resize",k)},[Je,m,_t]),(0,X.useEffect)(()=>{let k=M=>{let P=M.target,F=M.composedPath?.()[0]||P,H=F.matches?.("input,textarea,select")||!!F.isContentEditable;if(M.key==="Escape"){if(ke){Z?te(null):Ac();return}if(jo){Ds(!1);return}if(In.length>0){yr([]);return}U||m&&(oo(),S(!1))}if((M.metaKey||M.ctrlKey)&&M.shiftKey&&(M.key==="f"||M.key==="F")){M.preventDefault(),oo(),m?$0():S(!0);return}if(!(H||M.metaKey||M.ctrlKey)){if((M.key==="p"||M.key==="P")&&(M.preventDefault(),oo(),_p()),(M.key==="l"||M.key==="L")&&(M.preventDefault(),oo(),jo&&Ds(!1),me&&Me(!1),U&&yp(),ke?Ac():Lt(!0)),(M.key==="h"||M.key==="H")&&A.length>0&&(M.preventDefault(),oo(),D(ge=>!ge)),(M.key==="c"||M.key==="C")&&(A.length>0||L.length>0||fe)&&(M.preventDefault(),oo(),wp()),(M.key==="x"||M.key==="X")&&(A.length>0||L.length>0||fe)){if(M.preventDefault(),oo(),ns()===!1)return;L.length>0&&z([]),fe&&Fe(null)}if(M.key==="s"||M.key==="S"){let ge=Vr(Wt.webhookUrl)||Vr(C||"");A.length>0&&ge&&ze==="idle"&&(M.preventDefault(),oo(),vp())}}};return document.addEventListener("keydown",k),()=>document.removeEventListener("keydown",k)},[m,jo,ke,Z,L,fe,U,A.length,Wt.webhookUrl,C,ze,vp,_p,wp,ns,In]),!J||le)return null;let Za=A.length>0,js=A.filter(k=>!Xa.has(k.id)&&k.kind!=="placement"&&k.kind!=="rearrange"&&k.kind!=="edit"&&k.kind!=="tweak"&&(!window.__AGENTATION_KIT_VIEWPORT_MATCH__||window.__AGENTATION_KIT_VIEWPORT_MATCH__(k))),J5=js.length>0,P0=A.filter(k=>Xa.has(k.id)),D0=k=>{let ge=k.x/100*window.innerWidth,We=typeof k.y=="string"?parseFloat(k.y):k.y,He={};window.innerHeight-We-22-10<80&&(He.top="auto",He.bottom="calc(100% + 10px)");let wt=ge-200/2,vt=10;if(wt<vt){let Bt=vt-wt;He.left=`calc(50% + ${Bt}px)`}else if(wt+200>window.innerWidth-vt){let Bt=wt+200-(window.innerWidth-vt);He.left=`calc(50% - ${Bt}px)`}return He};return(0,N2.createPortal)((0,Ie.jsxs)("div",{ref:he,style:{display:"contents"},"data-agentation-theme":Eo?"dark":"light","data-agentation-accent":Wt.annotationColorId,"data-agentation-root":"",children:[(0,Ie.jsx)("div",{className:`${Te.toolbar}${w?` ${w}`:""}`,"data-feedback-toolbar":!0,"data-agentation-toolbar":!0,style:Je?{left:Je.x,top:Je.y,right:"auto",bottom:"auto"}:void 0,children:(0,Ie.jsxs)("div",{className:`${Te.toolbarContainer} ${m?Te.expanded:Te.collapsed} ${v?Te.entrance:""} ${W?Te.hiding:""} ${!Wt.webhooksEnabled&&(Vr(Wt.webhookUrl)||Vr(C||""))?Te.serverConnected:""}`,onClick:m?void 0:k=>{if(tr.current){tr.current=!1,k.preventDefault();return}S(!0)},onMouseDown:Q5,role:m?void 0:"button",tabIndex:m?-1:0,title:m?void 0:"Start feedback mode",children:[(0,Ie.jsxs)("div",{className:`${Te.toggleContent} ${m?Te.hidden:Te.visible}`,children:[(0,Ie.jsx)("svg",{width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,Ie.jsx)("path",{d:"M4 5h16v11H9.5L5 19.5V16H4z"})}),J5&&(0,Ie.jsx)("span",{className:`${Te.badge} ${m?Te.fadeOut:""} ${v?Te.entrance:""}`,children:js.length})]}),(0,Ie.jsxs)("div",{className:`${Te.controlsContent} ${m?Te.visible:Te.hidden} ${Je&&Je.y<100?Te.tooltipBelow:""} ${Kt||me?Te.tooltipsHidden:""} ${Zr?Te.tooltipsInSession:""}`,onMouseEnter:Tc,onMouseLeave:Ga,children:[(0,Ie.jsxs)("div",{className:`${Te.buttonWrapper} ${Je&&Je.x<120?Te.buttonWrapperAlignLeft:""}`,children:[(0,Ie.jsx)("button",{className:Te.controlButton,onClick:k=>{k.stopPropagation(),oo(),_p()},"data-active":Ae,children:(0,Ie.jsx)(D4,{size:24,isPaused:Ae})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:[Ae?"Resume animations":"Pause animations",(0,Ie.jsx)("span",{className:Te.shortcut,children:"P"})]})]}),(0,Ie.jsxs)("div",{className:Te.buttonWrapper,children:[(0,Ie.jsx)("button",{className:`${Te.controlButton} ${Eo?"":Te.light}`,onClick:k=>{k.stopPropagation(),oo(),jo&&Ds(!1),me&&Me(!1),U&&yp(),ke?Ac():Lt(!0)},"data-active":ke,style:ke&&h?{color:"#f97316",background:"rgba(249, 115, 22, 0.25)"}:void 0,children:(0,Ie.jsx)(K4,{size:21})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:[ke?"Exit layout mode":"Layout mode",(0,Ie.jsx)("span",{className:Te.shortcut,children:"L"})]})]}),(0,Ie.jsxs)("div",{className:Te.buttonWrapper,children:[(0,Ie.jsx)("button",{className:Te.controlButton,onClick:k=>{k.stopPropagation(),oo(),D(!G)},disabled:!Za||ke,children:(0,Ie.jsx)(P4,{size:24,isOpen:G})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:[G?"Hide markers":"Show markers",(0,Ie.jsx)("span",{className:Te.shortcut,children:"H"})]})]}),(0,Ie.jsxs)("div",{className:Te.buttonWrapper,children:[(0,Ie.jsx)("button",{className:`${Te.controlButton} ${de?Te.statusShowing:""}`,onClick:k=>{k.stopPropagation(),oo(),wp()},disabled:ke&&h?L.length===0&&!fe?.sections?.length:!Za&&Co.length===0&&L.length===0&&!fe?.sections?.length,"data-active":de,children:(0,Ie.jsx)(R4,{size:24,copied:de,tint:ke&&h&&(L.length>0||fe?.sections?.length)?"#f97316":void 0})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:[ke&&h?"Copy layout":"Copy feedback",(0,Ie.jsx)("span",{className:Te.shortcut,children:"C"})]})]}),(0,Ie.jsxs)("div",{className:`${Te.buttonWrapper} ${Te.sendButtonWrapper} ${m&&!Wt.webhooksEnabled&&(Vr(Wt.webhookUrl)||Vr(C||""))?Te.sendButtonVisible:""}`,children:[(0,Ie.jsxs)("button",{className:`${Te.controlButton} ${ze==="sent"||ze==="failed"?Te.statusShowing:""}`,onClick:k=>{k.stopPropagation(),oo(),vp()},disabled:!Za||!Vr(Wt.webhookUrl)&&!Vr(C||"")||ze==="sending","data-no-hover":ze==="sent"||ze==="failed",tabIndex:Vr(Wt.webhookUrl)||Vr(C||"")?0:-1,children:[(0,Ie.jsx)(O4,{size:24,state:ze}),Za&&ze==="idle"&&(0,Ie.jsx)("span",{className:Te.buttonBadge,children:A.length})]}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:["Send annotations",(0,Ie.jsx)("span",{className:Te.shortcut,children:"S"})]})]}),(0,Ie.jsxs)("div",{className:Te.buttonWrapper,children:[(0,Ie.jsx)("button",{className:Te.controlButton,onClick:k=>{k.stopPropagation(),oo(),ns()},disabled:!Za&&Co.length===0&&L.length===0&&!fe?.sections?.length,"data-danger":!0,children:(0,Ie.jsx)(F4,{size:24})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:["Clear all",(0,Ie.jsx)("span",{className:Te.shortcut,children:"X"})]})]}),(0,Ie.jsxs)("div",{className:Te.buttonWrapper,children:[(0,Ie.jsx)("button",{className:Te.controlButton,onClick:k=>{k.stopPropagation(),oo(),ke&&Ac(),Me(!me)},children:(0,Ie.jsx)(z4,{size:24})}),c&&_t!=="disconnected"&&(0,Ie.jsx)("span",{className:`${Te.mcpIndicator} ${Te[_t]} ${me?Te.hidden:""}`,title:_t==="connected"?"MCP Connected":"MCP Connecting..."}),(0,Ie.jsx)("span",{className:Te.buttonTooltip,children:"Settings"})]}),(0,Ie.jsx)("div",{className:Te.divider}),(0,Ie.jsxs)("div",{className:`${Te.buttonWrapper} ${Je&&typeof window<"u"&&Je.x>window.innerWidth-120?Te.buttonWrapperAlignRight:""}`,children:[(0,Ie.jsx)("button",{className:Te.controlButton,onClick:k=>{k.stopPropagation(),oo(),$0()},children:(0,Ie.jsx)(B4,{size:24})}),(0,Ie.jsxs)("span",{className:Te.buttonTooltip,children:["Exit",(0,Ie.jsx)("span",{className:Te.shortcut,children:"Esc"})]})]})]}),(0,Ie.jsx)(v3,{visible:ke&&m,activeType:Z,onSelect:k=>{te(Z===k?null:k)},isDarkMode:Eo,sectionCount:fe?.sections.length??0,onDetectSections:()=>{let k=L3(),M=fe?.sections??[],P=new Set(M.map(We=>We.selector)),F=k.filter(We=>!P.has(We.selector)),H=[...M,...F],ge=[...fe?.originalOrder??[],...F.map(We=>We.id)];Fe({sections:H,originalOrder:ge,detectedAt:Date.now()})},placementCount:L.length,onClearPlacements:()=>{Bn(k=>k+1),mo(k=>k+1),Ct(()=>{Fe({sections:[],originalOrder:[],detectedAt:Date.now()})},200)},blankCanvas:h,onBlankCanvasChange:k=>{let M={sections:[],originalOrder:[],detectedAt:Date.now()};k?(pt.current={rearrange:fe,placements:L},Fe(Tt.current.rearrange||M),z(Tt.current.placements),te(null)):(Tt.current={rearrange:fe,placements:L},Fe(pt.current.rearrange||M),z(pt.current.placements)),I(k)},wireframePurpose:ie,onWireframePurposeChange:ne,Tooltip:As,onDragStart:(k,M)=>{M.preventDefault();let P=ct[k],F=null,H=!1,ge=M.clientX,We=M.clientY,st=M.target.closest("[data-feedback-toolbar]")?.getBoundingClientRect().top??window.innerHeight,wt=Bt=>{let Vt=Bt.clientX-ge,Mt=Bt.clientY-We;if(!H&&(Math.abs(Vt)>4||Math.abs(Mt)>4)&&(H=!0,F=document.createElement("div"),F.className=`${xe.dragPreview}${h?` ${xe.dragPreviewWireframe}`:""}`,document.body.appendChild(F)),!F)return;let ut=Math.max(0,st-Bt.clientY),Kn=Math.min(1,ut/180),mn=1-Math.pow(1-Kn,2),ro=28,pn=20,Yn=Math.min(140,P.width*.18),Dt=Math.min(90,P.height*.18),Ht=ro+(Yn-ro)*mn,Rn=pn+(Dt-pn)*mn;F.style.width=`${Ht}px`,F.style.height=`${Rn}px`,F.style.left=`${Bt.clientX-Ht/2}px`,F.style.top=`${Bt.clientY-Rn/2}px`,F.style.opacity=`${.5+.5*mn}`,F.textContent=mn>.25?k:""},vt=Bt=>{if(window.removeEventListener("mousemove",wt),window.removeEventListener("mouseup",vt),F&&document.body.removeChild(F),H){let Vt=P.width,Mt=P.height,ut=window.scrollY,Kn=Math.max(0,Bt.clientX-Vt/2),mn=Math.max(0,Bt.clientY+ut-Mt/2),ro={id:`dp-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,type:k,x:Kn,y:mn,width:Vt,height:Mt,scrollY:ut,timestamp:Date.now()};z(pn=>[...pn,ro]),te(null),no.current=new Set,yt(pn=>pn+1)}};window.addEventListener("mousemove",wt),window.addEventListener("mouseup",vt)}}),(0,Ie.jsx)(W6,{settings:Wt,onSettingsChange:k=>ei(M=>({...M,...k})),isDarkMode:Eo,onToggleTheme:V,isDevMode:ue,connectionStatus:_t,endpoint:c,isVisible:Ue,toolbarNearBottom:!!Je&&Je.y<230,settingsPage:jt,onSettingsPageChange:Qt,onHideToolbar:Y5})]})}),(ke||At)&&(0,Ie.jsx)("div",{className:`${xe.blankCanvas} ${O?xe.visible:""} ${Le?xe.gridActive:""}`,style:{"--canvas-opacity":se},"data-feedback-toolbar":!0}),ke&&h&&O&&(0,Ie.jsxs)("div",{className:xe.wireframeNotice,"data-feedback-toolbar":!0,children:[(0,Ie.jsxs)("div",{className:xe.wireframeOpacityRow,children:[(0,Ie.jsx)("span",{className:xe.wireframeOpacityLabel,children:"Toggle opacity"}),(0,Ie.jsx)("input",{type:"range",className:xe.wireframeOpacitySlider,min:0,max:1,step:.01,value:se,onChange:k=>ce(Number(k.target.value))})]}),(0,Ie.jsxs)("div",{className:xe.wireframeNoticeTitleRow,children:[(0,Ie.jsx)("span",{className:xe.wireframeNoticeTitle,children:"Wireframe mode"}),(0,Ie.jsx)("span",{className:xe.wireframeNoticeDivider}),(0,Ie.jsx)("button",{className:xe.wireframeStartOver,onClick:()=>{Bn(k=>k+1),Fe({sections:[],originalOrder:[],detectedAt:Date.now()}),Tt.current={rearrange:null,placements:[]},ne(""),$u(Nt)},children:"Start over"})]}),"Drag components onto the canvas.",(0,Ie.jsx)("br",{}),"Copied output will only include the wireframed layout."]}),(ke||At)&&(0,Ie.jsx)(g3,{placements:L,onChange:z,activeComponent:At?null:Z,onActiveComponentChange:te,isDarkMode:Eo,exiting:At,onInteractionChange:De,passthrough:!Z,extraSnapRects:fe?.sections.map(k=>k.currentRect),deselectSignal:dt,clearSignal:Nn,wireframe:h,onSelectionChange:(k,M)=>{no.current=k,M||(Yt.current=new Set,an(P=>P+1))},onDragMove:(k,M)=>{let P=Yt.current;if(!(!P.size||!fe)){if(!Wn.current){Wn.current=new Map;for(let F of fe.sections)P.has(F.id)&&Wn.current.set(F.id,{x:F.currentRect.x,y:F.currentRect.y})}for(let F of fe.sections){if(!P.has(F.id)||!Wn.current.get(F.id))continue;let ge=document.querySelector(`[data-rearrange-section="${F.id}"]`);ge&&(ge.style.transform=`translate(${k}px, ${M}px)`)}}},onDragEnd:(k,M,P)=>{let F=Yt.current,H=Wn.current;if(Wn.current=null,!(!F.size||!fe||!H)){for(let ge of F){let We=document.querySelector(`[data-rearrange-section="${ge}"]`);We&&(We.style.transform="")}P&&Fe(ge=>ge&&{...ge,sections:ge.sections.map(We=>{let He=H.get(We.id);return He?{...We,currentRect:{...We.currentRect,x:Math.max(0,He.x+k),y:Math.max(0,He.y+M)}}:We})})}}}),(ke||At)&&fe&&(0,Ie.jsx)(O3,{rearrangeState:fe,onChange:Fe,isDarkMode:Eo,exiting:At,blankCanvas:h,extraSnapRects:L.map(k=>({x:k.x,y:k.y,width:k.width,height:k.height})),clearSignal:mr,deselectSignal:tn,onSelectionChange:(k,M)=>{Yt.current=k,M||(no.current=new Set,yt(P=>P+1))},onDragMove:(k,M)=>{let P=no.current;if(P.size){if(!Wn.current){Wn.current=new Map;for(let F of L)P.has(F.id)&&Wn.current.set(F.id,{x:F.x,y:F.y})}for(let F of P){let H=document.querySelector(`[data-design-placement="${F}"]`);H&&(H.style.transform=`translate(${k}px, ${M}px)`)}}},onDragEnd:(k,M,P)=>{let F=no.current,H=Wn.current;if(Wn.current=null,!(!F.size||!H)){for(let ge of F){let We=document.querySelector(`[data-design-placement="${ge}"]`);We&&(We.style.transform="")}P&&z(ge=>ge.map(We=>{let He=H.get(We.id);return He?{...We,x:Math.max(0,He.x+k),y:Math.max(0,He.y+M)}:We}))}}}),(0,Ie.jsx)("canvas",{ref:Jr,className:`${Te.drawCanvas} ${jo?Te.active:""}`,style:{opacity:Ws?1:0,transition:"opacity 0.15s ease"},"data-feedback-toolbar":!0}),(0,Ie.jsxs)("div",{className:Te.markersLayer,"data-feedback-toolbar":!0,children:[Ce&&js.filter(k=>!k.isFixed).map((k,M,P)=>(0,Ie.jsx)(S2,{annotation:k,globalIndex:js.findIndex(F=>F.id===k.id),layerIndex:M,layerSize:P.length,isExiting:Pe,isClearing:Ye,isAnimated:xr.has(k.id),isHovered:!Pe&&Ft===k.id,isDeleting:en===k.id,isEditingAny:!!ae,renumberFrom:R,markerClickBehavior:Wt.markerClickBehavior,tooltipStyle:D0(k),onHoverEnter:F=>!Pe&&F.id!==Ic.current&&Rc(F),onHoverLeave:()=>Rc(null),onClick:F=>Wt.markerClickBehavior==="delete"?xp(F.id):$c(F),onContextMenu:$c},k.id)),Ce&&!Pe&&P0.filter(k=>!k.isFixed).map(k=>(0,Ie.jsx)(C2,{annotation:k},k.id))]}),(0,Ie.jsxs)("div",{className:Te.fixedMarkersLayer,"data-feedback-toolbar":!0,children:[Ce&&js.filter(k=>k.isFixed).map((k,M,P)=>(0,Ie.jsx)(S2,{annotation:k,globalIndex:js.findIndex(F=>F.id===k.id),layerIndex:M,layerSize:P.length,isExiting:Pe,isClearing:Ye,isAnimated:xr.has(k.id),isHovered:!Pe&&Ft===k.id,isDeleting:en===k.id,isEditingAny:!!ae,renumberFrom:R,markerClickBehavior:Wt.markerClickBehavior,tooltipStyle:D0(k),onHoverEnter:F=>!Pe&&F.id!==Ic.current&&Rc(F),onHoverLeave:()=>Rc(null),onClick:F=>Wt.markerClickBehavior==="delete"?xp(F.id):$c(F),onContextMenu:$c},k.id)),Ce&&!Pe&&P0.filter(k=>k.isFixed).map(k=>(0,Ie.jsx)(C2,{annotation:k,fixed:!0},k.id))]}),E&&(0,Ie.jsxs)("div",{className:Te.overlay,"data-feedback-toolbar":!0,style:U||ae?{zIndex:99999}:void 0,children:[$e?.rect&&!U&&!j&&!ni&&(0,Ie.jsx)("div",{className:`${Te.hoverHighlight} ${Te.enter}`,style:{left:$e.rect.left,top:$e.rect.top,width:$e.rect.width,height:$e.rect.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 50%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 4%, transparent)"}}),In.filter(k=>document.contains(k.element)).map((k,M)=>{let P=k.element.getBoundingClientRect(),F=In.length>1;return(0,Ie.jsx)("div",{className:F?Te.multiSelectOutline:Te.singleSelectOutline,style:{position:"fixed",left:P.left,top:P.top,width:P.width,height:P.height,...F?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}},M)}),Ft&&!U&&(()=>{let k=A.find(H=>H.id===Ft);if(!k?.boundingBox)return null;if(k.elementBoundingBoxes?.length)return qt.length>0?qt.filter(H=>document.contains(H)).map((H,ge)=>{let We=H.getBoundingClientRect();return(0,Ie.jsx)("div",{className:`${Te.multiSelectOutline} ${Te.enter}`,style:{left:We.left,top:We.top,width:We.width,height:We.height}},`hover-outline-live-${ge}`)}):k.elementBoundingBoxes.map((H,ge)=>(0,Ie.jsx)("div",{className:`${Te.multiSelectOutline} ${Te.enter}`,style:{left:H.x,top:H.y-Qe,width:H.width,height:H.height}},`hover-outline-${ge}`));let M=ht&&document.contains(ht)?ht.getBoundingClientRect():null,P=M?{x:M.left,y:M.top,width:M.width,height:M.height}:{x:k.boundingBox.x,y:k.isFixed?k.boundingBox.y:k.boundingBox.y-Qe,width:k.boundingBox.width,height:k.boundingBox.height},F=k.isMultiSelect;return(0,Ie.jsx)("div",{className:`${F?Te.multiSelectOutline:Te.singleSelectOutline} ${Te.enter}`,style:{left:P.x,top:P.y,width:P.width,height:P.height,...F?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}})})(),$e&&!U&&!j&&!ni&&(0,Ie.jsxs)("div",{className:`${Te.hoverTooltip} ${Te.enter}`,style:{left:Math.max(8,Math.min(Ve.x,window.innerWidth-100)),top:Math.max(Ve.y-($e.reactComponents?48:32),8)},children:[$e.reactComponents&&(0,Ie.jsx)("div",{className:Te.hoverReactPath,children:$e.reactComponents}),(0,Ie.jsx)("div",{className:Te.hoverElementName,children:$e.elementName})]}),U&&(0,Ie.jsxs)(Ie.Fragment,{children:[U.multiSelectElements?.length?U.multiSelectElements.filter(k=>document.contains(k)).map((k,M)=>{let P=k.getBoundingClientRect();return(0,Ie.jsx)("div",{className:`${Te.multiSelectOutline} ${Fs?Te.exit:Te.enter}`,style:{left:P.left,top:P.top,width:P.width,height:P.height}},`pending-multi-${M}`)}):U.targetElement&&document.contains(U.targetElement)?(()=>{let k=U.targetElement.getBoundingClientRect();return(0,Ie.jsx)("div",{className:`${Te.singleSelectOutline} ${Fs?Te.exit:Te.enter}`,style:{left:k.left,top:k.top,width:k.width,height:k.height,borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}})})():U.boundingBox&&(0,Ie.jsx)("div",{className:`${U.isMultiSelect?Te.multiSelectOutline:Te.singleSelectOutline} ${Fs?Te.exit:Te.enter}`,style:{left:U.boundingBox.x,top:U.boundingBox.y-Qe,width:U.boundingBox.width,height:U.boundingBox.height,...U.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}),(()=>{let k=U.x,M=U.isFixed?U.y:U.y-Qe;return(0,Ie.jsxs)(Ie.Fragment,{children:[(0,Ie.jsx)(A6,{x:k,y:M,isMultiSelect:U.isMultiSelect,isExiting:Fs}),(0,Ie.jsx)(zu,{ref:I0,element:U.element,selectedText:U.selectedText,computedStyles:U.computedStylesObj,placeholder:U.element==="Area selection"?"What should change in this area?":U.isMultiSelect?"Feedback for this group of elements...":"What should change?",onSubmit:V5,onCancel:yp,isExiting:Fs,lightMode:!Eo,accentColor:U.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)",style:{left:Math.max(160,Math.min(window.innerWidth-160,k/100*window.innerWidth)),...M>window.innerHeight-290?{bottom:window.innerHeight-M+20}:{top:M+20}}})]})})()]}),ae&&(0,Ie.jsxs)(Ie.Fragment,{children:[ae.elementBoundingBoxes?.length?it.length>0?it.filter(k=>document.contains(k)).map((k,M)=>{let P=k.getBoundingClientRect();return(0,Ie.jsx)("div",{className:`${Te.multiSelectOutline} ${Te.enter}`,style:{left:P.left,top:P.top,width:P.width,height:P.height}},`edit-multi-live-${M}`)}):ae.elementBoundingBoxes.map((k,M)=>(0,Ie.jsx)("div",{className:`${Te.multiSelectOutline} ${Te.enter}`,style:{left:k.x,top:k.y-Qe,width:k.width,height:k.height}},`edit-multi-${M}`)):(()=>{let k=Ge&&document.contains(Ge)?Ge.getBoundingClientRect():null,M=k?{x:k.left,y:k.top,width:k.width,height:k.height}:ae.boundingBox?{x:ae.boundingBox.x,y:ae.isFixed?ae.boundingBox.y:ae.boundingBox.y-Qe,width:ae.boundingBox.width,height:ae.boundingBox.height}:null;return M?(0,Ie.jsx)("div",{className:`${ae.isMultiSelect?Te.multiSelectOutline:Te.singleSelectOutline} ${Te.enter}`,style:{left:M.x,top:M.y,width:M.width,height:M.height,...ae.isMultiSelect?{}:{borderColor:"color-mix(in srgb, var(--agentation-color-accent) 60%, transparent)",backgroundColor:"color-mix(in srgb, var(--agentation-color-accent) 5%, transparent)"}}}):null})(),(0,Ie.jsx)(zu,{ref:A0,element:ae.element,selectedText:ae.selectedText,computedStyles:M3(ae.computedStyles),placeholder:"Edit your feedback...",initialValue:ae.comment,submitLabel:"Save",onSubmit:G5,onCancel:X5,onDelete:()=>xp(ae.id),isExiting:hp,lightMode:!Eo,accentColor:ae.isMultiSelect?"var(--agentation-color-green)":"var(--agentation-color-accent)",style:(()=>{let k=ae.isFixed?ae.y:ae.y-Qe;return{left:Math.max(160,Math.min(window.innerWidth-160,ae.x/100*window.innerWidth)),...k>window.innerHeight-290?{bottom:window.innerHeight-k+20}:{top:k+20}}})()})]}),ni&&(0,Ie.jsxs)(Ie.Fragment,{children:[(0,Ie.jsx)("div",{ref:Qa,className:Te.dragSelection}),(0,Ie.jsx)("div",{ref:ts,className:Te.highlightsContainer})]})]})]}),document.body)}function Bm(e){let t=m=>typeof m=="number"&&Number.isFinite(m)?m:void 0,n=(m,S,...g)=>{try{return typeof m?.[S]=="function"?m[S](...g):void 0}catch{return}},o;try{o=e.__SHOW_AND_TELL__?.timeline}catch{o=null}if(o&&typeof o.time=="function")return{source:"host",time:()=>t(n(o,"time")),duration:()=>t(n(o,"duration")),playing:()=>!!n(o,"playing"),fps:()=>t(typeof o.fps=="function"?n(o,"fps"):o.fps),pause:()=>{n(o,"pause")},play:()=>{n(o,"play")},seek:m=>n(o,"seek",m),settled:()=>n(o,"settled"),clips:m=>n(o,"clips",m),within:m=>n(o,"within",m),stage:()=>n(o,"stage")};let r;try{r=e.__player}catch{r=null}if(!r||typeof r.getTime!="function"||typeof r.seek!="function")return null;let i=e.document,s=i.querySelector("[data-composition-id]"),a=m=>m!=null&&/^\s*-?\d*\.?\d+\s*$/.test(m)?parseFloat(m):void 0,l=(m,S)=>a(m.getAttribute(S)),d=m=>{for(let S=m.parentElement;S;S=S.parentElement)if(S.hasAttribute("data-composition-id"))return S;return null},c=(m,S)=>{let g=m.getAttribute("data-start"),y=a(g);if(y!==void 0)return y;let E=/^\s*(\S+?)(?:\s+([+-])\s*(\d*\.?\d+))?\s*$/.exec(g||"");if(!E||(S||[]).indexOf(m)>=0)return;let A=i.getElementById(E[1]);if(!A||A===m||d(A)!==d(m))return;let Q=(S||[]).concat([m]),G=c(A,Q),D=p(A,Q);return G===void 0||!(D>0)?void 0:G+D+(E[2]==="-"?-1:1)*(E[3]?parseFloat(E[3]):0)};function p(m,S){let g=l(m,"data-duration")??l(m,"data-hf-authored-duration");if(g!==void 0)return g;let y=l(m,"data-end"),E=y===void 0?void 0:c(m,S);if(y!==void 0&&E!==void 0)return y-E;let A=m.tagName.toLowerCase();return A==="img"?3:(A==="video"||A==="audio")&&typeof m.duration=="number"&&Number.isFinite(m.duration)?m.duration:void 0}let f=m=>{let S=c(m);if(S===void 0||m.getAttribute("data-hf-media-start-basis")==="global")return S;for(let g=d(m);g&&g!==s;g=d(g)){let y=c(g);if(y===void 0)return;S+=y}return S},C=m=>m.nodeType===1&&m.hasAttribute("data-start")&&f(m)!==void 0&&p(m)>0,w=m=>{let S=m.tagName.toLowerCase(),g=f(m),y=m.getAttribute("data-composition-src")||m.getAttribute("data-composition-file")||(S==="audio"||S==="video"?m.getAttribute("src"):"")||"";return{id:m.id||m.getAttribute("data-composition-id")||S,kind:S==="audio"?"audio":S==="video"?"video":m.hasAttribute("data-composition-id")?"scene":"clip",start:g,end:g+p(m),...y?{src:y}:{}}};return{source:"hyperframes",time:()=>t(n(r,"getTime")),duration:()=>t(n(r,"getDuration")),playing:()=>!!n(r,"isPlaying"),fps:()=>{},pause:()=>{n(r,"pause")},play:()=>{n(r,"play")},seek:m=>n(r,"seek",m),settled:()=>n(e,"__hfWaitForSeekCompletion"),clips:m=>{if(!s)return[];let S=t(n(r,"getDuration")),g=S!==void 0&&m>=S?S-1e-6:m;return[...s.children].filter(C).map(w).filter(y=>g>=y.start&&g<y.end)},within:m=>{let S=[];for(let g=m;g&&g!==s&&g.nodeType===1;g=g.parentElement)C(g)&&S.unshift(w(g));return S},stage:()=>s?{width:l(s,"data-width"),height:l(s,"data-height")}:void 0}}var U6=7*24*3600,Hu=e=>{let t=Number(e);return e!=null&&e!==""&&Number.isFinite(t)&&t>=0&&t<=U6?Math.round(t*1e3)/1e3:void 0},Wu=(e,t)=>e==null||typeof e=="object"?"":String(e).replace(/[\p{Cc}\p{Cf}\s]+/gu," ").trim().slice(0,t),q6=new Set(["scene","clip","video","audio","image","text","caption"]);function K6(e){if(!e||typeof e!="object")return null;let t=Wu(e.id,80),n=Hu(e.start),o=Hu(e.end);if(!t)return null;let r=Wu(e.kind,16).toLowerCase(),i=Wu(e.src,200);return{id:t,kind:q6.has(r)?r:"clip",...n!==void 0?{start:n}:{},...o!==void 0&&o>=(n??0)?{end:o}:{},...i?{src:i}:{}}}var G2=(e,t)=>Array.isArray(e)?e.slice(0,t*4).map(K6).filter(Boolean).slice(0,t):[];function X2(e){if(!e||typeof e!="object"||Array.isArray(e))return;let t=Hu(e.time);if(t===void 0)return;let n={time:t},o=Hu(e.duration);o&&(n.duration=o);let r=Number(e.fps);Number.isFinite(r)&&r>0&&r<=1e3&&(n.fps=Math.round(r*1e3)/1e3,n.frame=Math.floor(t*r+1e-6)),e.playing===!0&&(n.playing=!0);let i=Math.round(Number(e.stage?.width)),s=Math.round(Number(e.stage?.height));i>=16&&s>=16&&i<=16384&&s<=16384&&(n.stage={width:i,height:s});let a=G2(e.clips,24),l=G2(e.within,6);a.length&&(n.clips=a),l.length&&(n.within=l);let d=Wu(e.source,24);return d&&(n.source=d),n}function Q2(e,t,n){let o=Bm(e);if(!o)return;let r=n??o.time();return X2({time:r,duration:o.duration(),playing:n==null&&o.playing(),fps:o.fps(),stage:o.stage(),clips:r==null?[]:o.clips(r),within:t?o.within(t):[],source:o.source})}var Y6=e=>`${Number(e).toFixed(2)} s`;var Wm=e=>{let t=X2(e);return t?`at ${Y6(t.time)}`:""};var pr=()=>{try{return Bm(window)}catch{return null}};function $r(e,t){try{return Q2(window,e||null,t)}catch{return}}function J2(e,t){let n;return Promise.race([Promise.resolve(e).then(()=>"done",()=>"failed"),new Promise(o=>{n=setTimeout(()=>o("late"),t)})]).finally(()=>clearTimeout(n))}var Hm=new Set,Ha=!1,ju,Gi=0,V6=60,jm=.15;function ex(e){let t=pr();t&&(Gi&&(clearTimeout(Gi),Gi=0,Ha=!0),t.playing()&&(t.pause(),Ha=!0,ju=t.time()),Hm.add(e))}function G6(e){Ha&&(ju=e)}function tx(e){!Hm.delete(e)||Hm.size||Ha&&(Ha=!1,Gi=setTimeout(()=>{Gi=0;let t=pr();if(!t||t.playing())return;let n=t.time();ju!==void 0&&n!==void 0&&Math.abs(n-ju)>jm||t.play()},V6))}function nx(){Ha=!1,Gi&&(clearTimeout(Gi),Gi=0);let e=pr();e?.playing()&&e.pause()}var fc=null,hc=null,X6=1500,Q6="[data-feedback-toolbar],[data-agentation-root],[data-agentation-kit-chrome],#agentation-root";function J6(e){let t=e.composedPath?.()||[];if(t.some(r=>r instanceof Element&&r.matches(Q6)))return;let n=pr();if(!n)return;let o=n.time();o!==void 0&&(fc={time:o,playing:n.playing(),at:performance.now(),target:t.find(r=>r instanceof Element)||null})}var Z6=()=>[...document.querySelectorAll("[data-annotation-popup]")].some(e=>e.isConnected&&!e.hidden&&!/exit___/.test(String(e.className)));function e8(){let e=!1,t=()=>{if(!e&&!pr())return;let n=Z6();if(n===e)return;if(e=n,!n){hc=null,tx("note");return}let o=pr();if(!o){hc=null;return}let r=fc&&performance.now()-fc.at<X6?fc:null;fc=null;let i=r?r.playing:o.playing();ex("note");let s=r?.time;if(r?.playing&&Math.abs((o.time()??r.time)-r.time)>.001){try{Promise.resolve(o.seek(r.time)).catch(()=>{})}catch{}let l=o.time();l!==void 0&&l<=r.time&&r.time-l<=jm&&(s=l),G6(s)}let a=$r(null,s);hc=a?{snap:i?{...a,playing:!0}:a,target:r?.target||null}:null};new MutationObserver(t).observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class"]})}function Um(e,t,n){let o=[];try{o=e?[...document.querySelectorAll(e)].slice(0,200):[]}catch{}if(!o.length)return null;if(n?.isConnected){let s=o.find(a=>a===n||a.contains(n)||n.contains(a));if(s)return s}if(o.length===1||t==null)return o[0];let r=pr(),i=s=>{let a=r?.within(s)||[];return a.length>0&&a.every(l=>l.start<=t&&t<=l.end)};return o.find(i)||o[0]}function ox(e){if(!pr())return;let t=hc;hc=null;let n=t?.snap.time,o=$r(Um(e?.elementPath,n??pr()?.time(),t?.target),n);if(o)return t?.snap.playing?{...o,playing:!0}:o}var t8=e=>new Promise(t=>setTimeout(t,e)),n8=4e3,o8=4e3;async function rx(e,{wait:t=n8,seekMs:n=o8}={}){if(e=Number(e),!Number.isFinite(e))return!1;let o=pr(),r=()=>o&&o.time()!==void 0&&window.__playerReady!==!1;for(let s=performance.now()+t;!r()&&performance.now()<s;o=pr())await t8(80);if(!r())return!1;if(nx(),Math.abs(o.time()-e)>.005){let s;try{s=o.seek(e)}catch{return!1}if(await J2(s,n)!=="done")return!1;await J2(Promise.resolve().then(()=>o.settled()),n)}let i=pr()?.time();return i!==void 0&&Math.abs(i-e)<=jm}var Z2=!1;function ix(){if(Z2)return;Z2=!0,addEventListener("pointerdown",J6,!0),e8(),document.addEventListener("agentation-kit:voice-capture",t=>{t.detail?.active&&t.detail?.kind==="session"&&nx()});let e=(t,n)=>n?ex(t):tx(t);document.addEventListener("agentation-kit:edit-change",()=>e("edit",!!window.__AGENTATION_KIT_EDIT__?.active)),document.addEventListener("agentation-kit:tweak-change",t=>e("tweak",!!(t.detail?.active??window.__AGENTATION_KIT_TWEAK__?.active))),window.__SHOW_AND_TELL__={...window.__SHOW_AND_TELL__||{},playhead:()=>$r()}}var qn="agentation-edit_",yi="agentation-editpending_",r8=new Set(["SCRIPT","STYLE","NOSCRIPT","INPUT","TEXTAREA","SELECT","OPTION","LABEL","SVG","PATH","VIDEO","AUDIO","SOURCE","IMG","PICTURE","CANVAS","IFRAME","TRACK","OBJECT","EMBED"]),sx=new Set(["B","I","EM","STRONG","SPAN","A","BR","U","SUB","SUP","MARK","SMALL","CODE","ABBR","TIME","S","DEL","INS","KBD","WBR","Q","VAR","SAMP","BDI","BDO"]),Uu="#agentation-root, [data-agentation-root], .sk-edit-ui, [data-sk-no-edit]",Vu=e=>(e||"").replace(/\s+/g," ").trim();function Ym(e){return new DOMParser().parseFromString(String(e??""),"text/html")}function qm(e,t){let n=e.childNodes.length===1?e.firstChild:null;n&&n.nodeType===3?n.nodeValue=t:e.textContent=t}function qu(e,t){if(e.innerHTML===t)return;let n=Ym(t).body,o=e.childNodes.length===1?e.firstChild:null;if(o&&o.nodeType===3&&n.childNodes.length===1&&n.firstChild.nodeType===3){o.nodeValue=n.firstChild.nodeValue;return}e.innerHTML=t}var i8=/^(?:https?:|mailto:|tel:)/i,s8=new Set([...sx,"FONT"]),a8=new Set(["class","title","lang","dir"]),l8={A:["href"],FONT:["color","face","size"]},c8=new Set(["color","background-color","font-weight","font-style","font-size","font-family","text-decoration","text-transform","letter-spacing"]);function d8(e){return String(e||"").split(";").map(t=>t.trim()).filter(Boolean).filter(t=>{let n=t.slice(0,t.indexOf(":")).trim().toLowerCase();return c8.has(n)?!/url\s*\(|expression\s*\(/i.test(t):!1}).join("; ")}function Ku(e){let t=Ym(e),n=(r,i)=>{for(let s of[...r.childNodes]){if(s.nodeType===3){i.appendChild(document.createTextNode(s.nodeValue));continue}if(s.nodeType!==1)continue;if(!s8.has(s.tagName)){n(s,i);continue}let a=document.createElement(s.tagName.toLowerCase()),l=l8[s.tagName]||[];for(let d of[...s.attributes]){let c=d.name.toLowerCase();if(c==="style"){let p=d8(d.value);p&&a.setAttribute("style",p)}else c==="href"?l.includes("href")&&i8.test(d.value.trim())&&a.setAttribute("href",d.value.trim()):(a8.has(c)||l.includes(c))&&a.setAttribute(c,d.value)}n(s,a),i.appendChild(a)}},o=document.createElement("div");return n(t.body,o),o.innerHTML}function Yu(e){return Vu(Ym(e).body.textContent)}function Km(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=t+((t<<1)+(t<<4)+(t<<7)+(t<<8)+(t<<24))>>>0;return("0000000"+t.toString(16)).slice(-8)}function u8(e){let t=e.closest("[data-anchor]");if(t)return t.getAttribute("data-anchor");let n=e.closest("[id]");if(n)return n.id;let o=e.closest("section, article, main, header, footer, nav, aside");return o?o.tagName.toLowerCase():"page"}var p8=new Set(["sk-editing"]);function f8(e){let t=[],n=e;for(let o=0;n&&n.nodeType===1&&o<4&&!(n.tagName==="BODY"||n.tagName==="HTML");o++,n=n.parentElement){if(n.id){t.unshift(`#${n.id}`);break}let r=n.tagName.toLowerCase(),i=(n.getAttribute("class")||"").trim().split(/\s+/).filter(s=>s&&!p8.has(s)&&!s.startsWith("sk-"))[0];i&&(r+=`.${i}`),t.unshift(r)}return t.join(" > ")}function h8(e){let t=()=>typeof requestIdleCallback=="function"?requestIdleCallback(()=>e(),{timeout:2e3}):setTimeout(e,200),n=()=>requestAnimationFrame(()=>requestAnimationFrame(t));document.readyState==="complete"?n():addEventListener("load",n,{once:!0})}function m8(e){if(!Vu(e.textContent))return!1;for(let t of e.children)if(!sx.has(t.tagName))return!1;return!0}function g8(e){if(e.children.length<2||_8(e))return!1;let t="";try{t=getComputedStyle(e).display||""}catch{}return/flex|grid/.test(t)?Array.from(e.children).filter(n=>Vu(n.textContent)).length>1:!1}function _8(e){for(let t of e.childNodes)if(t.nodeType===3&&Vu(t.nodeValue))return!0;return!1}function ax({endpoint:e,sessionId:t,onCommitted:n,integrated:o=!1}){let r=`${Dr()}:${Qn().name}:`,i=new Map,s=new Map,a=!1,l=null,d=new WeakSet,c=!1,p=(U,oe)=>{try{localStorage.setItem(U,oe)}catch{}},f=U=>{try{return localStorage.getItem(U)}catch{return null}},C=U=>{try{localStorage.removeItem(U)}catch{}},w=!1;function m(){let U=`${qn}${Km(r)}-`;try{for(let oe=0;oe<localStorage.length;oe++)if(localStorage.key(oe)?.startsWith(U))return!0}catch{}return!1}let S=()=>w&&(a||m());function g(){let U=new Set,oe=Object.create(null);for(let[de,Re]of s)Re.isConnected||(s.delete(de),i.delete(de));for(let de of document.body.querySelectorAll("*")){if(s.has(de.getAttribute("data-sk-edit"))||de.isContentEditable||de.closest("[contenteditable=true]")||r8.has(de.tagName)||de.closest(Uu)||!m8(de)||de.parentElement&&de.parentElement.closest("[data-sk-edit]"))continue;let Re=`${Km(r)}-${u8(de)}-${Km(Yu(de.innerHTML))}`;if(g8(de)&&f(qn+Re)==null)continue;oe[Re]=(oe[Re]||0)+1;let ze=oe[Re]===1?Re:`${Re}~${oe[Re]}`,Ke=ze;for(;s.has(Ke);)Ke=`${ze}~${++oe[Re]}`;de.setAttribute("data-sk-edit",Ke),i.set(Ke,de.innerHTML),s.set(Ke,de),U.add(Ke)}return U}function y(U){for(let[oe,de]of s){if(U&&!U.has(oe))continue;let Re=f(qn+oe);if(Re)try{let ze=JSON.parse(Re);typeof ze.html=="string"&&qu(de,Ku(ze.html))}catch{}}}function E(){let U=[];for(let[oe,de]of s){let Re=Yu(i.get(oe)||""),ze=Yu(de.innerHTML);if(Re!==ze){if(!f(qn+oe)){i.set(oe,de.innerHTML);continue}A(oe)&&U.push({id:oe,from:Re,to:ze,node:de,annotationId:f(yi+oe),dirty:JSON.parse(f(qn+oe)||"{}")?.submittedTo!==ze})}}return U}function A(U){try{let oe=JSON.parse(f(qn+U)||"null");return!oe?.reviewer||br(oe.reviewer)}catch{return!0}}function Q(U){let oe=U.getAttribute("data-sk-edit");if(oe){try{if(JSON.parse(f(qn+oe)||"null")?.html===Ku(U.innerHTML))return}catch{}if(U.innerHTML===i.get(oe))C(qn+oe);else{let de=JSON.parse(f(qn+oe)||"{}");de.reviewer&&!br(de.reviewer)&&(C(yi+oe),de={});let Re=_n(),ze=de.playhead||$r(U);p(qn+oe,JSON.stringify({...de,id:oe,clientId:de.clientId||crypto.randomUUID(),...Re?{reviewer:Re}:{},...ze?{playhead:ze}:{},html:Ku(U.innerHTML),ts:Date.now()}))}W()}}let G=!1;async function D(U){if(G)return{count:0};G=!0;let oe=E().filter(Ke=>!U||Ke.id===U);if(!oe.length||!e||!t)return G=!1,{count:0};let de=await io(),Re=0,ze=0;for(let Ke of oe){let Et=f(yi+Ke.id);try{let dn=await fetch(Et?`${e}/annotations/${Et}`:`${e}/sessions/${t}/annotations`,{method:Et?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:JSON.parse(f(qn+Ke.id)||"{}").clientId||crypto.randomUUID(),kind:"edit",viewport:Qn(),playhead:JSON.parse(f(qn+Ke.id)||"{}").playhead||$r(Ke.node),url:location.href,comment:`Change to: "${Ke.to}"`,element:Ke.node.tagName.toLowerCase(),elementPath:f8(Ke.node),intent:"edit",edit:{id:Ke.id,from:Ke.from,to:Ke.to},...de?{reviewer:de}:{}})});if(dn.ok){let Ye=await dn.json();p(yi+Ke.id,Ye.id);let Rt=JSON.parse(f(qn+Ke.id)||"{}");p(qn+Ke.id,JSON.stringify({...Rt,submittedTo:Ke.to})),Re++}else ze++}catch{ze++}}return W(),G=!1,Re&&document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh")),n?.(Re),{count:Re,failed:ze}}function le(U,oe="resolved"){for(let de=localStorage.length-1;de>=0;de--){let Re=localStorage.key(de);if(!Re||!Re.startsWith(yi)||f(Re)!==U)continue;let ze=Re.slice(yi.length);C(Re),C(qn+ze);let Ke=s.get(ze);return Ke&&oe==="dismissed"?qu(Ke,i.get(ze)):Ke&&i.set(ze,Ke.innerHTML),W(),!0}return!1}function K(){let U=document.createElement("div");U.className="sk-edit-ui",U.setAttribute("data-sk-no-edit",""),Xn(U);let oe=U.attachShadow({mode:"open"});oe.innerHTML=`
      <style>
        :host { all: initial; }
        .bar { position: fixed; left: 16px; bottom: 16px; z-index: 2147483645;
          display: flex; align-items: center; gap: 9px;
          font: 500 13px/1.3 "ST Sans", "DM Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
          padding: 9px 14px; border-radius: 999px; background: rgba(29,26,47,.96);
          color: #FFF4E0; border: 1px solid rgba(255,244,224,.16);
          box-shadow: 0 6px 22px rgba(0,0,0,.32); backdrop-filter: blur(8px);
          max-width: calc(100vw - 32px); }
        .bar.idle { cursor: pointer; }
        .bar.idle:hover { background: rgba(42,38,64,.98); }
        button { font: inherit; font-weight: 600; cursor: pointer; border-radius: 999px;
          border: 1px solid rgba(255,255,255,.2); background: transparent; color: inherit;
          padding: 6px 13px; white-space: nowrap; }
        button:hover { background: rgba(255,255,255,.12); }
        button:focus-visible { outline: 2px solid #FFC72C; outline-offset: 2px; }
        .go { background: #FF5436; color: #1D1A2F; border-color: #FF5436; }
        .go:hover { background: #FF6A4F; }
        .go[disabled] { opacity: .4; cursor: default; background: transparent;
          color: #FFF4E0; border-color: rgba(255,244,224,.2); }
        .n { opacity: .7; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ok { color: #86efac; }
        .pen { opacity: .9; }
        /* Editing needs the room; idle does not. */
        .live { display: none; gap: 9px; align-items: center; }
        .bar.on .live { display: flex; }
        .bar.on .idle-label { display: none; }
        @media (max-width: 460px) {
          .bar { left: 12px; bottom: 12px; padding: 8px 12px; font-size: 12.5px; }
          button { padding: 6px 11px; }
        }
      </style>
      <div class="bar idle" id="bar">
        <span class="idle-label"><span class="pen">\u270E</span> Edit text</span>
        <span class="live">
          <span class="n" id="count">Edit mode</span>
          <button class="go" id="commit" disabled>Save</button>
          <button id="done">Done</button>
        </span>
      </div>`,document.body.appendChild(U);let de=oe.getElementById("bar"),Re=oe.getElementById("count"),ze=oe.getElementById("commit");return de.addEventListener("click",Ke=>{a||(Ke.stopPropagation(),Y(!0))}),oe.getElementById("done").addEventListener("click",Ke=>{Ke.stopPropagation(),Y(!1)}),ze.addEventListener("click",async Ke=>{Ke.stopPropagation(),ze.disabled=!0,ze.textContent="Saving\u2026";let{count:Et}=await D();ze.textContent="Save",Re.innerHTML=Et?`<span class="ok">\u2713 ${Et} saved</span>`:"Edit mode",setTimeout(W,2600)}),{host:U,root:oe,bar:de,countEl:Re,commitEl:ze}}function W(){if(document.dispatchEvent(new CustomEvent("agentation-kit:edit-change")),!l)return;let U=E(),oe=U.filter(de=>!f(yi+de.id));if(l.commitEl.disabled=oe.length===0,!l.countEl.querySelector(".ok")){let de=U.length-oe.length;l.countEl.textContent=U.length===0?"Edit mode":`${oe.length} to save${de?` \xB7 ${de} awaiting agent`:""}`}}function Y(U){a=U===void 0?!a:U,a&&(w=!0),a&&(g(),y(),he(),io()),document.body.classList.toggle("sk-editing",a);for(let oe of s.values())a?oe.setAttribute("contenteditable","true"):oe.removeAttribute("contenteditable"),oe.spellcheck=!1;if(!l&&!o&&(l=K()),!l){W();return}l.bar.classList.toggle("on",a),l.bar.classList.toggle("idle",!a),W()}function he(){let U=document.createElement("style");U.textContent=`
      body.sk-editing [data-sk-edit] { border-radius: 5px; cursor: text;
        box-shadow: 0 0 0 1px rgba(255,84,54,.28); transition: box-shadow .12s, background .12s; }
      body.sk-editing [data-sk-edit]:hover { background: rgba(255,84,54,.07); }
      body.sk-editing [data-sk-edit]:focus { outline: none; background: rgba(255,84,54,.08);
        box-shadow: 0 0 0 2px rgba(255,84,54,.9); }`,c||document.head.appendChild(U);for(let oe of s.values()){if(d.has(oe))continue;d.add(oe);let de=!1;oe.addEventListener("input",()=>{a&&(de=!0,Q(oe))}),oe.addEventListener("blur",()=>{de&&Q(oe)}),oe.addEventListener("paste",Re=>{Re.preventDefault();let ze=(Re.clipboardData||window.clipboardData).getData("text/plain");try{document.execCommand("insertText",!1,ze)}catch{}})}if(!c){c=!0;for(let oe of["mousedown","click"])window.addEventListener(oe,de=>{if(!a)return;let Re=de.target;Re&&Re.closest&&Re.closest("[data-sk-edit]")&&(de.stopPropagation(),oe==="click"&&Re.closest("a,button")&&de.preventDefault())},!0)}}h8(()=>{if(w=!0,!!S()){if(g(),y(),he(),a)for(let U of s.values())U.setAttribute("contenteditable","true");W()}});let Ce=!1;new MutationObserver(U=>{if(Ce||!S()||!U.some(de=>!(de.target.closest?.(Uu)||de.target.parentElement?.closest(Uu))))return;Ce=!0;let oe=()=>{Ce=!1;let de=g();if(y(de),he(),a)for(let Re of s.values())Re.setAttribute("contenteditable","true");de.size&&W()};a?requestAnimationFrame(oe):setTimeout(oe,250)}).observe(document.body,{childList:!0,subtree:!0}),l=o?null:K(),W(),window.addEventListener("resize",Oe),document.addEventListener("agentation-kit:route",Oe);function Oe(){let U=`${Dr()}:${Qn().name}:`;if(U!==r){for(let[oe,de]of s)f(qn+oe)&&qu(de,i.get(oe)),de.removeAttribute("data-sk-edit"),de.removeAttribute("contenteditable");if(s.clear(),i.clear(),r=U,S()&&(g(),y(),he()),a)for(let oe of s.values())oe.setAttribute("contenteditable","true");W()}}function Pe(U){if(f(yi+U)){let de=JSON.parse(f(qn+U)||"{}");if(typeof de.submittedTo!="string")return!1;let Re=s.get(U);if(Re)return qm(Re,de.submittedTo),Q(Re),!0;let ze=document.createElement("div");return ze.textContent=de.submittedTo,p(qn+U,JSON.stringify({...de,html:Ku(ze.innerHTML),ts:Date.now()})),W(),!0}let oe=s.get(U);return oe&&qu(oe,i.get(U)),C(qn+U),W(),!0}function je(U,oe,de=!1){let Re=s.get(U);if(Re&&(qm(Re,oe),Q(Re),de)){let ze=JSON.parse(f(qn+U)||"{}");p(qn+U,JSON.stringify({...ze,submittedTo:oe}))}}function $e(U,oe){if(!U?.isConnected||typeof oe!="string"||U.closest(Uu))return null;w=!0,g(),y(),he();let de=U.hasAttribute("data-sk-edit")?U:null;if(!de){let Re=U.querySelectorAll("[data-sk-edit]");Re.length===1&&(de=Re[0])}return de?(a&&de.setAttribute("contenteditable","true"),qm(de,oe),Q(de),de.getAttribute("data-sk-edit")):null}function rt(U,oe){let de=null;try{de=JSON.parse(f(qn+U)||"null")}catch{return!1}if(!de||de.reviewer&&!br(de.reviewer))return!1;let Re=ze=>String(ze??"").replace(/\s+/g," ").trim();return Re(Yu(de.html||""))!==Re(oe)?!1:Pe(U)}function Ve(U){U&&(t=U)}function gt(U){let oe=0;for(let de=localStorage.length-1;de>=0;de--){let Re=localStorage.key(de);if(!Re||!Re.startsWith(yi))continue;let ze=f(Re);if(!ze)continue;let Ke=U.has(ze)?U.get(ze):"dismissed";(Ke==="dismissed"||Ke==="resolved")&&le(ze,Ke)&&oe++}return oe}return{toggle:Y,commit:D,pendingEdits:E,clearCommitted:le,reject:Pe,withdrawDraft:rt,revise:je,draftText:$e,setSession:Ve,reconcile:gt,get active(){return a},rescan:()=>{g(),y()}}}var lx="sk-replyseen_";function y8(e,t=0){return t&&t===e?e===1?"The agent has a plan for your note":`The agent has ${e} plans for you`:e===1?"1 question from the agent":`${e} questions from the agent`}var cx=e=>!!e?.reply?.plan,x8="Go ahead.";function w8(){let e=document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']");return e?/expanded/.test(e.className)?"open":"closed":"none"}function dx({endpoint:e}){let t=new Map,n=new Map,o=!1,r=null,i=(K,W)=>{try{return localStorage.getItem(lx+K)===String(W)}catch{return!1}},s=(K,W)=>{try{localStorage.setItem(lx+K,String(W))}catch{}};function a(){let{host:K,root:W,el:Y}=An(`
      [hidden] { display: none !important; }
      /* Placed beside the toolbar in the shared panel slot (ui.js), so it can
         never open under the inbox or the Send panel. These are the fallback. */
      .panel { right: 16px; bottom: 176px; width: 328px; max-width: calc(100vw - 24px);
        display: flex; flex-direction: column; }
      .panel .body { overflow-y: auto; }
      .panel { --sk-accent: #FF5436; }
      .hd #title { flex: 1; }
      .iconbtn { min-width: 28px; min-height: 28px; display: inline-flex; align-items: center; justify-content: center; }
      .iconbtn svg { width: 16px; height: 16px; flex: none; }
      /* The annotation the question is ABOUT: a label and the quote, muted and
         clipped to two lines. It is context, not the message. No side bar: a
         one-side rule is not how this tool marks anything (review finding 9). */
      .about { margin-bottom: 9px; }
      .about .lbl { display: block; font-size: 12px; color: var(--sk-text-3); margin-bottom: 1px; }
      .ctx { font-size: 12px; color: var(--sk-text-2);
        display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .tw { position: relative; margin-bottom: 9px; }
      /* Capped and scrolled rather than grown: the panel is pinned above the
         toolbar, so an unbounded thread pushes the answer box \u2014 the one control
         that must stay reachable \u2014 off the screen. */
${ta()}
      .who { font-size: 12px; }
      /* Scrolled-to-newest is right, but only if the top edge admits there is
         more above it \u2014 otherwise the oldest message is a headless fragment and
         nothing on screen says it can be scrolled. */
      .fade { position: absolute; left: 0; right: 0; top: 0; height: 26px; pointer-events: none;
        background: linear-gradient(var(--sk-surface), transparent); opacity: 0; transition: opacity .12s; }
      .earlier { position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
        font: inherit; font-size: 12px; font-weight: 600; padding: 2px 9px; border: 0;
        border-radius: 999px; background: var(--sk-text); color: var(--sk-surface);
        cursor: pointer; opacity: 0; pointer-events: none; transition: opacity .12s; }
      .tw.scrolled .fade, .tw.scrolled .earlier { opacity: 1; }
      .tw.scrolled .earlier { pointer-events: auto; }
      /* The answer box and its dictate button side by side, as in the Check card. */
      .field { display: flex; gap: 6px; align-items: flex-start; }
      .field textarea { flex: 1; min-width: 0; }
      .row { display: flex; gap: 7px; align-items: center; margin-top: 8px; }
      .row .primary { flex: 1; }
      .row .secondary { font: inherit; font-size: 13px; font-weight: 500; padding: 6px 12px; min-height: 32px; border: 0; border-radius: 6px;
        cursor: pointer; background: transparent; color: var(--sk-text); box-shadow: inset 0 0 0 1px rgba(255,255,255,.18); }
      :host([data-sk-theme=light]) .row .secondary { box-shadow: inset 0 0 0 1px rgba(0,0,0,.16); }
      .row .secondary:hover { background: var(--sk-hover); }
      .row .secondary[disabled] { opacity: .4; cursor: default; }
      .status { font-size: 12px; }

      /* The passive line: one row above the bar, never a sheet. */
      .notice { position: fixed; z-index: 2147483644; display: flex; align-items: center; gap: 6px;
        font: 400 13px/1.4 var(--sk-font); color: var(--sk-text); background: var(--sk-surface);
        box-shadow: var(--sk-ring); border-radius: 8px; padding: 4px 4px 4px 12px; }
      /* Sized to its line, up to the screen less the 12px insets (#2). */
      .notice { max-width: calc(100vw - 24px); box-sizing: border-box; }
      .notice .msg { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .notice .answer { font: inherit; font-size: 13px; font-weight: 600; color: var(--sk-text);
        background: var(--sk-raised); border: 0; border-radius: 6px; padding: 6px 10px; cursor: pointer; min-height: 32px; }
      .notice .answer:hover { background: var(--sk-hover); }
      button:focus-visible, textarea:focus-visible { outline:2px solid var(--sk-focus); outline-offset: 2px; }

      /* Phones: every target is 44px. */
      @media (pointer: coarse) {
        .iconbtn { min-width: 44px; min-height: 44px; font-size: 15px; }
        button.primary, .notice .answer, .row .secondary { min-height: 44px; }
        .earlier { min-height: 32px; }
      }
    `);return K.dataset.repliesUi="",W.append(Object.assign(document.createElement("div"),{innerHTML:`
      <div class="panel" role="dialog" aria-label="Reply from the agent" hidden>
        <div class="hd"><span id="title">Agent asked a question</span>
          <button class="iconbtn" id="setaside" aria-label="Close" title="Close. The question stays in your inbox.">${ii}</button></div>
        <div class="body">
          <div class="about"><span class="lbl">About your note</span><div class="ctx" id="ctx"></div></div>
          <div class="tw" id="tw">
            <div class="thread" id="thread"></div>
            <div class="fade"></div>
            <button class="earlier" id="earlier">\u2191 earlier</button>
          </div>
          <div class="field"><textarea id="answer" placeholder="Answer so the agent can carry on"></textarea></div>
          <div class="row">
            <button class="primary" id="goahead" hidden>Go ahead</button>
            <button class="primary" id="send">Send answer</button>
            <span class="status" id="nav"></span>
          </div>
        </div>
      </div>
      <div class="notice" data-question-notice role="status" aria-live="polite" hidden>
        <span class="msg" id="nmsg"></span>
        <button class="answer" id="nanswer">Answer</button>
        <button class="iconbtn" id="nhide" aria-label="Hide until the next question" title="Hide until the next question. It stays in your inbox.">${ii}</button>
      </div>`})),Y("setaside").addEventListener("click",he=>{he.stopPropagation(),C()}),Y("send").addEventListener("click",()=>D()),Y("goahead").addEventListener("click",()=>D(x8)),Y("nanswer").addEventListener("click",he=>{he.stopPropagation(),f()}),Y("nhide").addEventListener("click",he=>{he.stopPropagation(),o=!0,g()}),Y("earlier").addEventListener("click",()=>{Y("thread").scrollTo({top:0,behavior:"smooth"})}),Y("thread").addEventListener("scroll",()=>{Y("tw").classList.toggle("scrolled",Y("thread").scrollTop>4)}),Y("answer").addEventListener("input",()=>{r?.current&&n.set(r.current,Y("answer").value),G()}),Y("answer").addEventListener("keydown",he=>{he.key==="Enter"&&!he.shiftKey&&(he.preventDefault(),D()),he.key!=="Escape"&&he.stopPropagation()}),{host:K,root:W,el:Y,panel:W.querySelector(".panel"),notice:W.querySelector(".notice")}}let l=()=>r||(r=a()),d=Vn("question",K=>{r&&(r.panel.hidden=!K,K?requestAnimationFrame(c):(Ko(r.panel),bn()))}),c=()=>{r&&d.visible&&Gn(r.panel,328)},p=()=>[...t.entries()];function f(){p().length&&(l(),m(),d.want(!0,{bump:!0}),Q(),requestAnimationFrame(()=>{c(),d.visible&&r.el(r.el("goahead").hidden?"answer":"goahead").focus({preventScroll:!0})}))}function C(){r?.current&&n.set(r.current,r.el("answer").value),d.wants&&d.want(!1),g()}let w=()=>Ci({slots:["question"],hosts:r?[r.host]:[]});function m(){!r||r.notice.hidden||(r.notice.hidden=!0,S(null),Ko(r.notice),bn())}function S(K){let W=document.querySelector("[data-agentation-toolbar]");if(!W)return;let Y="";if(K){let he=[...W.querySelectorAll('[class*="buttonWrapper"]')].map(Oe=>Oe.getBoundingClientRect()).find(Oe=>Oe.width),Ce=he?he.top:W.querySelector('[class*="toolbarContainer"]')?.getBoundingClientRect().top;Ce!=null&&Ce>K.top&&(Y=Math.max(0,Math.ceil(Ce-14-(K.top-6)))+"px")}W.style.getPropertyValue("--sk-tip-lift")!==Y&&(Y?W.style.setProperty("--sk-tip-lift",Y):W.style.removeProperty("--sk-tip-lift"))}function g(){if(!r)return;let K=p(),W=w8();if(d.wants&&(W==="closed"||!K.length)&&d.want(!1),d.wants&&!d.visible&&Mo()!=="reviewer"&&d.want(!1),d.wants&&d.visible&&w()&&(r.current&&n.set(r.current,r.el("answer").value),d.want(!1)),!(K.length&&!o&&W!=="closed"&&!d.wants&&!w())){m();return}let he=y8(K.length,K.filter(([,Oe])=>cx(Oe)).length);r.el("nmsg").textContent!==he&&(r.el("nmsg").textContent=he,r.noticeWidth=0),r.el("nanswer").setAttribute("aria-label",K.length===1?"Answer the agent's question":`Answer the agent's ${K.length} questions`);let Ce=r.notice.hidden;r.notice.hidden=!1,innerWidth>=Xc&&!r.noticeWidth&&(r.notice.style.width="max-content",r.noticeWidth=Math.ceil(r.notice.getBoundingClientRect().width)),uo(r.notice,innerWidth<Xc?innerWidth:r.noticeWidth||320),S(r.notice.getBoundingClientRect()),Ce&&bn()}let y=0,E=()=>{y||(y=requestAnimationFrame(()=>{y=0,g()}))};document.addEventListener("agentation-kit:slot",E),document.addEventListener("agentation-kit:insets",E),document.addEventListener("agentation-kit:toolbar-position",()=>{E(),requestAnimationFrame(c)}),addEventListener("resize",()=>{E(),requestAnimationFrame(c)}),addEventListener("pointerup",()=>{setTimeout(g,60),setTimeout(c,60)},{passive:!0}),addEventListener("keyup",()=>setTimeout(g,30),{passive:!0}),setInterval(()=>{t.size&&g()},300),addEventListener("keydown",K=>{K.key!=="Escape"||!r||!d.visible||r.panel.hidden||(K.preventDefault(),K.stopImmediatePropagation(),C())},!0);function A(K){let W=r.el("thread");si(W,K.replies?.length?K.replies:K.reply?[K.reply]:[],"reviewer"),r.el("tw").classList.toggle("scrolled",W.scrollTop>4)}function Q(){l();let K=p();if(!K.length){r.current=null,d.wants&&d.want(!1),g();return}if(!d.wants){g();return}let[W,Y]=K[0],he=cx(Y);r.el("title").textContent=he?"The agent's plan":"Agent asked a question",r.el("ctx").textContent=Y.comment?`\u201C${Y.comment}\u201D`:"Your note",r.el("answer").placeholder=he?"Or say what to change":"Answer so the agent can carry on",r.el("goahead").hidden=!he,A(Y),r.current!==W&&(r.el("answer").value=n.get(W)||""),r.el("send").disabled=!1,r.el("goahead").disabled=!1,G();let Ce=K.length-1;r.el("nav").textContent=Ce?`+${Ce} more`:"",r.current=W}function G(){if(!r)return;let K=!r.el("goahead").hidden,W=!!r.el("answer").value.trim();r.el("send").className=K?"secondary":"primary",r.el("send").textContent=K?"Send changes":"Send answer",K&&(r.el("send").disabled=!W)}async function D(K){let W=r?.current,Y=(typeof K=="string"?K:r.el("answer").value).trim();if(!W||!Y||!e)return;r.el("send").disabled=!0,r.el("goahead").disabled=!0,r.el("nav").textContent="Sending\u2026";let he=await io();try{let Ce=await fetch(`${e}/annotations/${W}/reply`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:Y,...he?{name:he}:{}})});if(!Ce.ok)throw Object.assign(new Error(String(Ce.status)),{status:Ce.status});let Oe=t.get(W);Oe?.reply?.ts&&s(W,Oe.reply.ts),t.delete(W),n.delete(W),r.el("nav").textContent="\u2713 Sent",setTimeout(()=>{r.current===W&&(r.current=null),Q()},1200)}catch(Ce){r.el("send").disabled=!1,r.el("goahead").disabled=!1,G(),r.el("nav").textContent=so(Ce?.status||0,"send")}}function le(K){if(!K?.id)return;if(K.status==="resolved"||K.status==="dismissed"){t.delete(K.id)&&(n.delete(K.id),Q());return}if(!K.reply){t.delete(K.id)&&(n.delete(K.id),Q());return}if(!Bc(K)||i(K.id,K.reply.ts))return;let W=t.get(K.id);(!W||W.reply?.ts!==K.reply.ts)&&(o=!1),t.set(K.id,{comment:K.comment||"",reply:K.reply,replies:Array.isArray(K.replies)?K.replies:null,answered:!1}),Q()}return{ingest:le,pending:()=>p().length,open:f,close:C,get visible(){return!!(r&&d.visible&&!r.panel.hidden)}}}var Xm=[[390,844],[820,1180],[1440,900]],v8=["target","overflow","contrast"],b8="show-and-tell-measure";function Vm(e){let t=String(e||"").trim().toLowerCase();if(t==="transparent")return{r:0,g:0,b:0,a:0};let n=/^#([0-9a-f]{3,8})$/.exec(t);if(n){let a=n[1];if((a.length===3||a.length===4)&&(a=a.split("").map(d=>d+d).join("")),a.length!==6&&a.length!==8)return null;let l=d=>parseInt(a.slice(d,d+2),16);return{r:l(0),g:l(2),b:l(4),a:a.length===8?l(6)/255:1}}if(n=/^rgba?\(([^)]+)\)$/.exec(t),!n)return null;let o=n[1].replace(/\s*\/\s*/," / ").split(/[\s,]+/).filter(a=>a&&a!=="/");if(o.length<3)return null;let r=a=>a.endsWith("%")?parseFloat(a)/100*255:parseFloat(a),i=o[3]==null?1:o[3].endsWith("%")?parseFloat(o[3])/100:parseFloat(o[3]),s={r:r(o[0]),g:r(o[1]),b:r(o[2]),a:i};return[s.r,s.g,s.b,s.a].every(Number.isFinite)?s:null}function gx(e,t){let n=e.a+t.a*(1-e.a);if(!n)return{r:0,g:0,b:0,a:0};let o=r=>(e[r]*e.a+t[r]*t.a*(1-e.a))/n;return{r:o("r"),g:o("g"),b:o("b"),a:n}}function ux({r:e,g:t,b:n}){let o=r=>{let i=r/255;return i<=.04045?i/12.92:((i+.055)/1.055)**2.4};return .2126*o(e)+.7152*o(t)+.0722*o(n)}function _x(e,t){let[n,o]=[ux(e),ux(t)].sort((r,i)=>i-r);return(n+.05)/(o+.05)}var k8=(e,t)=>e>=24||e>=18.66&&Number(t)>=700,S8=(e,t)=>k8(e,t)?3:4.5;function Qu({r:e,g:t,b:n}){let o=r=>Math.round(Math.max(0,Math.min(255,r))).toString(16).padStart(2,"0");return`#${o(e)}${o(t)}${o(n)}`}var C8=e=>`${(Math.floor(e*10)/10).toFixed(1)}:1`;function E8(e,t,n){let o=null;for(let r of[{r:0,g:0,b:0},{r:255,g:255,b:255}])for(let i=.02;i<=1.0001;i+=.02){let s={r:e.r+(r.r-e.r)*i,g:e.g+(r.g-e.g)*i,b:e.b+(r.b-e.b)*i,a:1};if(_x(s,t)>=n+.05){(!o||i<o.t)&&(o={t:i,c:s});break}}return o?Qu(o.c):null}function T8({coarse:e=!1,width:t=1440}={}){return e||t<=640?{min:44,rule:"Touch targets: 44 \xD7 44px"}:{min:24,rule:"Pointer targets (WCAG 2.5.8): 24 \xD7 24px"}}var Gm="[data-feedback-toolbar], #agentation-root, [data-agentation-root], [data-agentation-toolbar], .sk-edit-ui, [data-sk-no-edit]",px="a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem]",M8=new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","SVG","PATH","HEAD","TITLE","META","LINK","OPTION","IFRAME"]),N8=new Set(["IMG","PICTURE","VIDEO","CANVAS","SVG"]),I8=4e3,fx=30,hx=e=>String(e||"").replace(/\s+/g," ").trim();function Gu(e){let t=e.getAttribute?.("aria-label")||e.getAttribute?.("alt")||hx(e.textContent)||e.getAttribute?.("title")||e.getAttribute?.("placeholder")||e.tagName?.toLowerCase()||"element",n=hx(t);return n.length>44?n.slice(0,43)+"\u2026":n}function Xu(e){let t=e.ownerDocument,n=t.defaultView,o=s=>n.CSS?.escape?n.CSS.escape(s):String(s).replace(/[^\w-]/g,"\\$&"),r=s=>{try{return t.querySelectorAll("#"+o(s)).length===1}catch{return!1}},i=[];for(let s=e;s&&s.nodeType===1&&s!==t.body&&s!==t.documentElement;s=s.parentElement){if(s.id&&r(s.id))return i.unshift("#"+o(s.id)),i.join(" > ");let a=s.tagName.toLowerCase(),l=s.parentElement?[...s.parentElement.children].filter(d=>d.tagName===s.tagName):[];l.length>1&&(a+=`:nth-of-type(${l.indexOf(s)+1})`),i.unshift(a)}return i.unshift("body"),i.join(" > ")}function mx(e,t){let n=e.getBoundingClientRect();return n.width<1||n.height<1||e.checkVisibility&&!e.checkVisibility({opacityProperty:!0,visibilityProperty:!0})||t.getComputedStyle(e).visibility!=="visible"?null:n}var A8=e=>[...e.childNodes].some(t=>t.nodeType===3&&t.textContent.trim());function L8(e,t){if(e.tagName!=="A"||!t.display.startsWith("inline")||t.display==="inline-block"||t.display==="inline-flex")return!1;let n=e.parentElement;return!!n&&[...n.childNodes].some(o=>o!==e&&o.nodeType===3&&o.textContent.trim())}function $8(e,t,n,o){let r=o.left+Math.min(o.width/2,24),i=o.top+Math.min(o.height/2,12);if(r>=0&&i>=0&&r<t.innerWidth&&i<t.innerHeight&&n.elementsFromPoint)for(let d of n.elementsFromPoint(r,i)){if(d===e||e.contains(d)||d.closest(Gm))continue;if(d.contains(e))break;if(N8.has(d.tagName.toUpperCase()))return{unknown:"image"};let c=t.getComputedStyle(d).backgroundImage;if(c&&c!=="none")return{unknown:/gradient/.test(c)?"gradient":"image"};if(Vm(t.getComputedStyle(d).backgroundColor)?.a)return{unknown:"overlap"}}let s=[],a=1;for(let d=e;d&&d.nodeType===1;d=d.parentElement){let c=t.getComputedStyle(d);if(a*=Number(c.opacity)||(c.opacity==="0"?0:1),c.backgroundImage&&c.backgroundImage!=="none")return{unknown:/gradient/.test(c.backgroundImage)?"gradient":"image"};if(c.filter&&c.filter!=="none"||c.mixBlendMode&&c.mixBlendMode!=="normal"||c.backdropFilter&&c.backdropFilter!=="none")return{unknown:"filter"};let p=Vm(c.backgroundColor);if(!p)return{unknown:"colour"};if(p.a>0&&(s.push(p),p.a>=1))break}let l={r:255,g:255,b:255,a:1};for(let d=s.length-1;d>=0;d--)l=gx(s[d],l);return{color:l,opacity:a}}function yx(e,t,{coarse:n=!1,width:o=t.innerWidth}={}){let r=[],i=[],s={target:0,overflow:0,contrast:0},a={target:0,overflow:0,contrast:0},l=f=>{a[f.check]++<fx&&r.push(f)},{min:d,rule:c}=T8({coarse:n,width:o});for(let f of e.querySelectorAll(px)){if(f.closest(Gm)||f.parentElement?.closest(px))continue;let C=mx(f,t);if(!C)continue;let w=t.getComputedStyle(f);if(L8(f,w))continue;s.target++;let m=Math.round(C.width),S=Math.round(C.height);if(m>=d&&S>=d)continue;let g=S<d&&m<d?"both":S<d?"height":"width";l({check:"target",selector:Xu(f),label:Gu(f),rule:c,value:g==="both"?`${m} \xD7 ${S}px`:g==="height"?`${S}px tall`:`${m}px wide`,size:{width:m,height:S},need:d,suggestion:{kind:"tweak",property:g==="width"?"min-width":"min-height",from:`${g==="width"?m:S}px`,to:`${d}px`}})}let p=0;for(let f of e.body?e.body.querySelectorAll("*"):[]){if(++p>I8)break;if(M8.has(f.tagName.toUpperCase())||!A8(f)||f.closest(Gm))continue;let C=mx(f,t);if(!C)continue;let w=t.getComputedStyle(f);if(f.clientWidth>0){s.overflow++;let D=Y=>Y==="hidden"||Y==="clip",le=f.scrollWidth>f.clientWidth+1,K=f.scrollHeight>f.clientHeight+1,W=w.textOverflow==="ellipsis"&&le?"truncated with an ellipsis":w.webkitLineClamp&&w.webkitLineClamp!=="none"&&K?`clamped to ${w.webkitLineClamp} lines`:D(w.overflowX)&&le?"clipped at the side":D(w.overflowY)&&K?"clipped at the bottom":"";W&&l({check:"overflow",selector:Xu(f),label:Gu(f),rule:"Text fits its box: nothing clipped or cut off",how:W,value:le?`${f.scrollWidth}px of text in ${f.clientWidth}px`:`${f.scrollHeight}px of text in ${f.clientHeight}px`})}let m=Vm(w.color),S=parseFloat(w.fontSize)||16,g=Number(w.fontWeight)||400,y=m?$8(f,t,e,C):{unknown:"colour"};if(y.unknown){i.length<fx&&i.push({check:"contrast",selector:Xu(f),label:Gu(f),reason:y.unknown});continue}s.contrast++;let E=gx({...m,a:m.a*y.opacity},y.color),A=_x(E,y.color),Q=S8(S,g);if(A>=Q)continue;let G=E8(E,y.color,Q);l({check:"contrast",selector:Xu(f),label:Gu(f),ratio:A,need:Q,value:`${C8(A)} contrast`,rule:`Text contrast: ${Q}:1${Q===3?" for large text":""}`,detail:`${Qu(E)} on ${Qu(y.color)}, ${Math.round(S*10)/10}px${g>=700?" bold":""} text`,...G?{suggestion:{kind:"tweak",property:"color",from:Qu(m),to:G}}:{}})}return{findings:r,unknown:i,checked:s}}function R8(e){let t=new Map,n=new Map;for(let i of e){for(let s of i.findings||[]){let a=s.check+"|"+s.selector,l=t.get(a);l?((s.need||0)>(l.need||0)&&Object.assign(l,{...s,widths:l.widths}),l.widths.push(i.width)):t.set(a,{...s,widths:[i.width]})}for(let s of i.unknown||[]){let a=s.check+"|"+s.selector;n.has(a)||n.set(a,{...s,widths:[]}),n.get(a).widths.push(i.width)}}let o=new Map;for(let i of t.values()){i.widths.sort((a,l)=>a-l);let s=[i.check,i.label,i.rule,i.value,i.widths.join(",")].join("|");o.has(s)||o.set(s,{...i,selectors:[]}),o.get(s).selectors.push(i.selector)}let r={target:0,overflow:1,contrast:2};return{findings:[...o.values()].sort((i,s)=>r[i.check]-r[s.check]),unknown:[...n.values()]}}function mc(e){let t=[...new Set(e)].sort((n,o)=>n-o);return t.length<2?String(t[0]??""):`${t.slice(0,-1).join(", ")} and ${t.at(-1)}`}function O8(e,t,n){let o=new Set(e.map(i=>i.check)),r=[];return!o.has("contrast")&&n.contrast&&r.push(t.length?"contrast on every text pair that could be measured":"contrast on every text pair"),!o.has("overflow")&&n.overflow&&r.push("no overflow or clipped text"),!o.has("target")&&n.target&&r.push("every target is big enough"),r.length?`Passed: ${r.join(", ")}`:""}var P8=e=>new Promise(t=>e.requestAnimationFrame(()=>e.requestAnimationFrame(t)));function D8(e,t,{timeout:n=1e4,mark:o=r=>r}={}){return new Promise(r=>{let i=o(document.createElement("iframe"));i.name=b8,i.title=`Measuring at ${e}px`,i.setAttribute("aria-hidden","true"),i.tabIndex=-1,Object.assign(i.style,{position:"fixed",left:"-30000px",top:"0",width:e+"px",height:t+"px",border:"0",opacity:"0",pointerEvents:"none"});let s=!1,a=d=>{s||(s=!0,clearTimeout(l),i.remove(),r({width:e,...d}))},l=setTimeout(()=>a({ok:!1,error:"did not load in time"}),n);i.addEventListener("load",async()=>{try{let d=i.contentWindow,c=i.contentDocument;if(!c?.body)return a({ok:!1,error:"could not be read"});await P8(d),await new Promise(p=>setTimeout(p,300)),a({ok:!0,...yx(c,d,{coarse:!1,width:e})})}catch{a({ok:!1,error:"could not be read"})}},{once:!0}),i.src=location.href,document.body.append(i)})}async function xx({frames:e=!0,sizes:t=Xm,timeout:n,mark:o}={}){let r=innerWidth,i=matchMedia("(pointer: coarse)").matches,s={width:r,ok:!0,...yx(document,window,{coarse:i,width:r})},a=e?await Promise.all(t.filter(([p])=>p!==r).map(([p,f])=>D8(p,f,{timeout:n,mark:o}))):[],l=[s,...a.filter(p=>p.ok)],d=R8(l),c={target:0,overflow:0,contrast:0};for(let p of l)for(let f of v8)c[f]+=p.checked?.[f]||0;return{at:Date.now(),width:r,widths:l.map(p=>p.width),skipped:a.filter(p=>!p.ok).map(p=>({width:p.width,error:p.error})),...d,checked:c,passed:O8(d.findings,d.unknown,c)}}var wx={blocking:"Blocking",important:"Important",suggestion:"Suggestion"},z8=6e3,vx="sk-measured-dismissed",F8={alert:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v4.8M12 15.9h.01"/>',bulb:'<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',chat:'<path d="M20 11.5a7.5 7.5 0 0 1-11 6.6L4 19.5l1.4-4.3A7.5 7.5 0 1 1 20 11.5z"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',gauge:'<path d="M5.2 16.5a7.5 7.5 0 1 1 13.6 0"/><path d="M12 13.5l3.2-3.6"/>',rerun:'<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4"/>',text:'<path d="M5 6h14M12 6v13M9 19h6"/>',tweak:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',passed:'<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12.3 2.4 2.4 4.6-4.9"/>',moved:'<path d="M6 5v6a4 4 0 0 0 4 4h9M15.5 11.5 19 15l-3.5 3.5"/>',chevron:'<path d="M6 9l6 6 6-6"/>',unknown:'<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.5a2.4 2.4 0 1 1 3.3 2.2c-.6.3-1 .8-1 1.5M12 16.2h.01"/>'},fr=e=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${F8[e]||""}</svg>`,Ju=e=>e.severity==="blocking"||e.severity==="suggestion"?e.severity:"important",gc=e=>`\u201C${e}\u201D`,Qm=e=>String(e||"").replace(/\s+/g," ").trim();function B8(e){let t=o=>Number(o.createdAt??o.timestamp??0),n=[...e].sort((o,r)=>t(o)-t(r));return new Map(n.map((o,r)=>[o.id,`A${r+1}`]))}function bx(e,t){let n=o=>Number(String(t.get(o.id)||"").slice(1))||1/0;return[...e].sort((o,r)=>n(o)-n(r))}function xt(e,t,n){let o=document.createElement(e);return t&&(o.className=t),n!=null&&(o.textContent=n),o}function ho(e,t,n,o){let r=xt("button",e,t);return r.type="button",o&&r.setAttribute("aria-label",o),r.addEventListener("click",i=>{i.stopPropagation(),n(i)}),r}function kx({endpoint:e,opinion:t=!0,toolbar:n=!0}){let o=[],r=[],i=!1,s=null,a=new Map,l=new Map,d=new Map,c=new Map,p=new Map,f=null,C=null,w=null,m=!1,S=!1,g=null;async function y(){if(!e||!t){Ue();return}try{let h=await fetch(`${e}/sessions?author=agent`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:window.location.href,...zr(window.location.href)?{pageKey:zr(window.location.href)}:{}})});if(!h.ok)return;let O=((await h.json()).annotations||[]).filter(ce=>ce.author==="agent");l=B8(O);let ee=O.filter(ce=>ce.status!=="resolved"&&ce.status!=="dismissed"),se=o.filter(ce=>d.has(ce.id)&&!ee.some(b=>b.id===ce.id));o=bx([...ee,...se],l),r=bx(O.filter(ce=>(ce.status==="resolved"||ce.status==="dismissed")&&ce.decision&&ce.decision.decision!=="discuss"&&!d.has(ce.id)),l),Ue()}catch{}}function E(h){if(!h)return null;try{let I=document.querySelector(h);return!I||I.closest("[data-sk-no-edit], #agentation-root, [data-feedback-toolbar]")?null:I}catch{return null}}let A=h=>E(h.selector||h.elementPath),Q="feedback-critique-draft:",G="feedback-critique-draft-by:",D={get:h=>{try{return localStorage.getItem(h)}catch{return null}},set:(h,I)=>{try{localStorage.setItem(h,I)}catch{}},drop:h=>{try{localStorage.removeItem(h)}catch{}}};function le(h,I,O){if(!I){D.drop(Q+h);return}D.set(Q+h,JSON.stringify({id:I,text:O})),D.set(G+I,h)}function K(h){let I=h.id,O=D.get(Q+I);if(D.drop(Q+I),!O)return;let ee=null;try{ee=JSON.parse(O)}catch{ee=null}(!ee||typeof ee!="object")&&(ee={id:O,text:h.suggestion?.to});let se=D.get(G+ee.id);!ee.id||se&&se!==I||(window.__AGENTATION_KIT_EDIT__?.withdrawDraft?.(ee.id,ee.text),D.drop(G+ee.id))}let W=()=>{try{return new Set(JSON.parse(localStorage.getItem(vx)||"[]"))}catch{return new Set}},Y=h=>`${location.pathname}|${h.check}|${h.selectors[0]}`;function he(h,I){let O=W();I?O.add(Y(h)):O.delete(Y(h));try{localStorage.setItem(vx,JSON.stringify([...O].slice(-200)))}catch{}}let Ce=()=>{if(!w)return[];let h=W();return w.findings.filter(I=>!h.has(Y(I))||d.has(I.id))},Oe=h=>!d.has(h.id),Pe=()=>o.filter(Oe).length+Ce().filter(Oe).length,je=-1;function $e(){let h=Pe();h!==je&&(je=h,document.dispatchEvent(new CustomEvent("agentation-kit:critique-count",{detail:{count:h}})),window.__AGENTATION_KIT_CRITIQUE_COUNT__=h)}let rt=Vn("critique",h=>{s&&(s.panel.hidden=!h,h?(Ue(),requestAnimationFrame(Ve)):(Ke(),ze(null),Ko(s.panel)),g?.setAttribute("aria-expanded",String(h)))}),Ve=()=>{s&&!s.panel.hidden&&Gn(s.panel,384)};function gt(){let{host:h,root:I,el:O}=An(`
      .panel { display: flex; flex-direction: column; --sk-danger: #f0797c; --sk-hairline-2: rgba(255,255,255,0.16); }
      :host([data-sk-theme=light]) .panel { --sk-danger: #cd2b31; --sk-hairline-2: rgba(0,0,0,0.16); }
      .panel[hidden] { display: none; }
      .hd { flex: none; gap: 8px; padding: 11px 12px; }
      .hd .sub { font-size: 12px; font-weight: 400; color: var(--sk-text-3); }
      svg { width: 16px; height: 16px; flex: none; }
      .bar { flex: none; display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--sk-hairline); font-size: 12px; color: var(--sk-text-2); }
      .bar .grow { flex: 1; min-width: 0; display: flex; gap: 7px; align-items: center; }
      button.sec { font: inherit; font-size: 12.5px; font-weight: 600; color: var(--sk-text); background: transparent; border: 0;
        box-shadow: inset 0 0 0 1px var(--sk-hairline-2); border-radius: 6px; padding: 6px 11px; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; white-space: nowrap; }
      button.sec:hover { background: var(--sk-hover); }
      button.sec[disabled] { opacity: .45; cursor: default; background: transparent; }
      button.ghost { font-size: 12.5px; font-weight: 500; color: var(--sk-text-2); padding: 6px 10px; }
      button.primary { white-space: nowrap; }
      .list { flex: 1 1 auto; min-height: 0; overflow-y: auto; scrollbar-width: thin; }
      .group { display: flex; gap: 7px; align-items: baseline; padding: 10px 12px 4px; font-size: 12px; font-weight: 600; color: var(--sk-text); }
      .group span { font-weight: 400; color: var(--sk-text-3); }
      .group.fold { width: 100%; border: 0; border-top: 1px solid var(--sk-hairline); background: none; cursor: pointer; text-align: left; font: inherit; font-size: 12px; font-weight: 600; color: var(--sk-text-2); padding: 10px 12px; min-height: 36px; }
      .group.fold:hover { color: var(--sk-text); }
      .group.fold { display: flex; align-items: center; }
      .group.fold .chev { margin-left: auto; display: inline-flex; transition: transform .12s; }
      .group.fold[aria-expanded=true] .chev { transform: rotate(180deg); }
      @media (prefers-reduced-motion: reduce) { .group.fold .chev { transition: none; } }
      .what.earlier { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; color: var(--sk-text-2); }
      .what.earlier .num { font-weight: 600; color: var(--sk-text); min-width: 22px; }
      .what.earlier .grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      @media (pointer: coarse) { .group.fold, .what.earlier .undo { min-height: 44px; } }
      .note { padding: 10px 12px 11px; border-bottom: 1px solid var(--sk-hairline); }
      .note.on { background: var(--sk-raised); }
      .top { display: flex; align-items: center; gap: 8px; min-height: 22px; }
      .n { flex: none; display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 4px;
        border-radius: 5px; font-size: 12px; font-weight: 600; box-shadow: inset 0 0 0 1.5px var(--sk-text); color: var(--sk-text); }
      .n.page { box-shadow: inset 0 0 0 1px var(--sk-hairline-2); color: var(--sk-text-3); }
      .n svg { width: 14px; height: 14px; }
      .word { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--sk-text-2); }
      .word.blocking { color: var(--sk-danger); }
      .word.handled { color: var(--sk-text-2); }
      .word svg { width: 14px; height: 14px; }
      .top .iconbtn { margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; }
      .top .iconbtn[aria-expanded=true] { color: var(--sk-accent-text); }
      .txt { margin: 6px 0 0; font-size: 13px; color: var(--sk-text); overflow-wrap: anywhere; }
      .title2 { font-size: 13px; font-weight: 600; color: var(--sk-text); }
      .meta { margin-top: 4px; font-size: 12px; color: var(--sk-text-3); }
      .verbs { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .note.done .txt, .note.done .title2 { color: var(--sk-text-3); }
      .what { display: flex; align-items: center; gap: 7px; margin-top: 8px; font-size: 12px; font-weight: 500; color: var(--sk-text-2); }
      .what .undo { margin-left: auto; color: var(--sk-accent-text); font-weight: 600; }
      .form { margin-top: 9px; }
      .form textarea { min-height: 52px; }
      .sugg { margin-top: 10px; padding: 9px 10px 10px; border-radius: 8px; box-shadow: inset 0 0 0 1px var(--sk-hairline-2); }
      .sugg .head { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--sk-text-2); }
      .seg { margin-left: auto; display: inline-flex; padding: 2px; gap: 2px; border-radius: 7px; background: var(--sk-hover); }
      .seg button { font: inherit; font-size: 12px; font-weight: 500; color: var(--sk-text-2); background: none; border: 0; border-radius: 5px; padding: 4px 10px; cursor: pointer; }
      .seg button[aria-pressed=true] { background: var(--sk-surface); color: var(--sk-text); font-weight: 600; box-shadow: 0 0 0 1px var(--sk-hairline-2); }
      .sugg .before { margin-top: 7px; font-size: 12.5px; color: var(--sk-text-3); }
      .sugg .after { margin-top: 4px; font-size: 13px; font-weight: 600; color: var(--sk-text); }
      .sugg .tw { margin-top: 7px; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; font-size: 12.5px; }
      .sugg .tw .k { color: var(--sk-text-3); }
      .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
      .passed { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 12px; border: 0; border-bottom: 1px solid var(--sk-hairline);
        background: none; color: var(--sk-text-2); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
      .passed .chev { margin-left: auto; transition: transform .12s; }
      .passed[aria-expanded=true] .chev { transform: rotate(180deg); }
      .passlist { padding: 0 12px 9px 36px; font-size: 12px; color: var(--sk-text-3); border-bottom: 1px solid var(--sk-hairline); }
      .empty { padding: 14px 12px; font-size: 12.5px; color: var(--sk-text-3); }
      .reply { margin-top: 10px; }
      .reply .row { display: flex; gap: 7px; align-items: center; margin-top: 7px; justify-content: flex-end; }
      .thread { margin-bottom: 8px; }
${ta()}
      /* Phone and touch: a bottom sheet (placeNearToolbar), 44px targets, and
         the two decisions side by side at full width. */
      @media (pointer: coarse), (max-width: 640px) {
        button.primary, button.sec, button.ghost { min-height: 44px; }
        .verbs { flex-wrap: nowrap; }
        .verbs button { flex: 1 1 0; justify-content: center; }
        .verbs button.ghost { box-shadow: inset 0 0 0 1px var(--sk-hairline-2); color: var(--sk-text); }
        .seg button { min-height: 44px; min-width: 64px; }
        .seg { padding: 2px; }
        .top .iconbtn { width: 44px; height: 44px; }
        .passed { min-height: 44px; }
      }
    `);return I.append(Object.assign(document.createElement("div"),{innerHTML:`
      <section class="panel" role="dialog" aria-label="From the agent" hidden>
        <div class="hd"><span class="title sk-title" id="title"></span><span class="sub" id="todo"></span>
          <button class="sk-x" id="close" type="button" aria-label="Close">${ii}</button></div>
        <div class="bar" id="sum"></div>
        <div class="bar" id="checks"></div>
        <div class="list" id="list"></div>
      </section>`}).firstElementChild),O("close").addEventListener("click",()=>At()),I.addEventListener("keydown",ee=>{if(ee.key==="Escape"){ee.stopPropagation();let se=ee.composedPath()[0]?.dataset?.focus||"",ce=se.endsWith(":form")?se.slice(0,-5):null;if(ce&&c.has(ce)){me(ce+(c.get(ce)==="way"?":way":":decide")),c.delete(ce),Ue();return}At();return}ee.composedPath()[0]?.matches?.("textarea")&&ee.stopPropagation()}),{host:h,root:I,el:O,panel:I.querySelector(".panel")}}function U(){for(let[,O]of a)O.dot.remove();a=new Map;let h=zp(),I=(O,ee,se,ce)=>{let b=ee.getBoundingClientRect();if(!b.width&&!b.height)return null;let B=document.createElement("button");return B.className="sk-crit-dot",B.type="button",B.innerHTML=se,B.title=ce||"",B.setAttribute("aria-label",ce||"Note from the agent"),B.setAttribute("data-sk-no-edit",""),Xn(B),Object.assign(B.style,ug(),{left:`${window.scrollX+b.left}px`,top:`${window.scrollY+b.top}px`,transition:"opacity .3s ease",opacity:d.has(O)?"0.3":"1"}),B.hidden=!h,B.addEventListener("click",()=>{f=null,Kt(O)}),document.body.appendChild(B),a.set(O,{dot:B,target:ee}),B};if(!o.length&&!Ce().length){na();return}for(let O of o){let ee=A(O);ee&&I(O.id,ee,l.get(O.id)||"A",`${l.get(O.id)?l.get(O.id)+", ":""}${wx[Ju(O)]}: ${O.comment||""}`)}for(let O of Ce()){let ee=E(O.selectors[0]);ee&&I(O.id,ee,fr("gauge").replace("<svg",'<svg width="14" height="14"'),`Measured: ${it(O)}`)}na()}Dp("critique",()=>[...a].map(([h,I])=>({key:"crit:"+h,target:I.target,el:I.dot})));let oe=null,de=null,Re=null;function ze(h){if(de=h,!h){oe?.remove(),oe=null,Re&&Zs(Re),Re=null;return}oe||(oe=Xn(document.createElement("div")),oe.setAttribute("data-sk-no-edit",""),oe.className="sk-crit-ring",Object.assign(oe.style,{position:"absolute",left:"0",top:"0",pointerEvents:"none",zIndex:String(un.marker-1)}),document.body.append(oe)),oe.replaceChildren(),h.selectors.map(E).filter(Boolean).forEach((O,ee)=>{let se=O.getBoundingClientRect(),ce=document.createElement("div");if(Object.assign(ce.style,{position:"absolute",left:`${scrollX+se.left-4}px`,top:`${scrollY+se.top-4}px`,width:`${se.width+8}px`,height:`${se.height+8}px`,borderRadius:"8px",boxShadow:"0 0 0 2px #FF5436, 0 0 0 5px rgba(255,84,54,.18)",background:h.tone==="preview"?"rgba(255,84,54,.06)":"transparent"}),oe.append(ce),h.label&&ee===0){let b=document.createElement("div");b.textContent=h.label,Object.assign(b.style,{position:"absolute",font:"600 12px/1 "+co,color:"#1D1A2F",background:"#FF5436",padding:"5px 8px",borderRadius:"5px",whiteSpace:"nowrap",...h.tone==="preview"?{left:`${scrollX+se.left-4}px`,top:`${Math.max(0,scrollY+se.top-30)}px`}:{left:`${scrollX+se.right+10}px`,top:`${scrollY+se.top+se.height/2-11}px`}}),oe.append(b)}});let I=h.selectors.map(E).find(Boolean);Re&&Re!==I&&Zs(Re),Re=I||null,I&&Js(I)}function Ke(){if(C){try{C.restore?.()}catch{}C=null,de?.tone==="preview"&&ze(null)}}function Et(h,I){return h.suggestion.from?h.suggestion.from:C?.id===h.id&&C.before!=null?C.before:Qm(I?.textContent)}function dn(h,I){let O=A(h);if(!O||(C&&C.id!==h.id&&Ke(),C?.id===h.id&&C.mode===I))return;let ee=h.suggestion;if(C?.id===h.id)try{C.restore?.()}catch{}let se=Qm(O.textContent),ce=null;if(I==="after")if(ee.kind==="text"){let b=[...O.childNodes];O.textContent=ee.to,ce=()=>O.replaceChildren(...b)}else{let b=O.getAttribute("style");O.style.setProperty(ee.property,ee.to,"important"),ce=()=>{b==null?O.removeAttribute("style"):O.setAttribute("style",b)}}C={id:h.id,mode:I,restore:ce,before:se},O.scrollIntoView?.({block:"nearest"}),ze({selectors:[h.selector||h.elementPath],label:I==="after"?"Preview, not saved":"",tone:"preview"}),Ue()}async function Ye(h,I){let O=await fetch(`${e}${h}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(I)});if(!O.ok)throw Object.assign(new Error(String(O.status)),{status:O.status});return O.json()}function Rt(h){let I=h?.getBoundingClientRect();return{...I&&I.width?{x:(I.left+I.width/2)/innerWidth*100,y:scrollY+I.top+Math.min(I.height/2,16)}:{},viewport:Qn(),url:location.href}}function Ft(){window.__AGENTATION_KIT_REVIEW__?.refresh?.(),document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh"))}let lt="";function ht(h,I,O,{detail:ee="",kind:se="moved"}={}){qt(h)&&me(h+":undo"),clearTimeout(d.get(h)?.timer),c.delete(h),p.delete(h+":reason"),p.delete(h+":way"),f===h&&(f=null),C?.id===h&&Ke();let ce=setTimeout(()=>{d.delete(h),o=o.filter(b=>b.id!==h),w&&(w.findings=w.findings.filter(b=>b.id!==h)),Ue()},z8);d.set(h,{status:I,what:ee||I,undo:O,timer:ce,kind:se}),Ue()}async function Ze(h){let I=d.get(h);if(!I)return;let O=qt(h);clearTimeout(I.timer);try{await I.undo?.()}catch(ee){lt=so(ee?.status||0,"undo")}d.delete(h),O&&me(h+":fix"),Ue()}let qt=h=>!!s?.root.activeElement?.closest?.(`[data-id="${CSS.escape(h)}"]`);async function Zt(h,I={}){let O=await io();try{let ee=await Ye(`/annotations/${h.id}/decision`,{decision:"fix",...I,...O?{reviewer:O}:{},...I.draft?{}:{note:Rt(A(h))}});I.draft||Ft(),ht(h.id,I.draft?`In your ${I.draft==="text"?"Edit text":"Tweak"} drafts`:"Added to your round",async()=>{await Ye(`/annotations/${h.id}/decision`,{decision:"undo",...O?{reviewer:O}:{}}),I.onUndo?.(),ee.fixNote&&Ft()})}catch(ee){lt=so(ee?.status||0,"save"),Ue()}}async function en(h,I){let O=await io();try{await Ye(`/annotations/${h.id}/decision`,{decision:"not-an-issue",...I?{reason:I}:{},...O?{reviewer:O}:{}}),ht(h.id,"Not an issue",()=>Ye(`/annotations/${h.id}/decision`,{decision:"undo",...O?{reviewer:O}:{}}),{detail:I?`Not an issue: ${I}`:"",kind:"dismissed"})}catch(ee){lt=so(ee?.status||0,"save"),Ue()}}async function on(){for(let h of o.filter(I=>Oe(I)&&Ju(I)==="blocking"))await Zt(h)}async function R(h){let I=h.suggestion,O=A(h);if(Ke(),I.kind==="text"){let ee=window.__AGENTATION_KIT_EDIT__,se=O&&ee?.draftText?.(O,I.to);if(se)return le(h.id,se,I.to),Zt(h,{draft:"text",onUndo:()=>K(h)})}else{let ee=window.__AGENTATION_KIT_TWEAK__;if(O&&typeof ee?.draft=="function"){let se=ee.draft({element:O,selector:h.selector||h.elementPath,property:I.property,from:I.from??getComputedStyle(O).getPropertyValue(I.property),to:I.to});if(se)return Zt(h,{draft:"tweak",onUndo:()=>ee.undraft?.(se)})}}return Zt(h,{comment:`${Qm(h.comment)} Suggested change: ${re(I,O)}.`})}let re=(h,I)=>h.kind==="text"?`change the text to ${gc(h.to)}`:`set ${h.property} to ${h.to}${h.from||I?` (now ${h.from||getComputedStyle(I).getPropertyValue(h.property).trim()})`:""}`;async function ae(h,{useFix:I=!1}={}){let O=window.__AGENTATION_KIT_AGENTATION_SESSION__;if(!e||!O){lt="Not connected to the review server yet. Try again in a moment.",Ue();return}let ee=await io(),se=E(h.selectors[0]),ce=window.__AGENTATION_KIT_TWEAK__,b=w?`at ${mc(h.widths)}px`:"";if(I&&se&&h.suggestion&&typeof ce?.draft=="function"){let ie=ce.draft({element:se,selector:h.selectors[0],property:h.suggestion.property,from:h.suggestion.from,to:h.suggestion.to});if(ie){ht(h.id,"In your Tweak drafts",()=>ce.undraft?.(ie));return}}let B=I&&h.suggestion?` Fix: set ${h.suggestion.property} to ${h.suggestion.to} (now ${h.suggestion.from}).`:"";try{let ie=await Ye(`/sessions/${encodeURIComponent(O)}/annotations`,{id:crypto.randomUUID(),kind:"feedback",intent:"fix",severity:"important",comment:`${it(h)}${h.selectors.length>1?` (${h.selectors.length} elements)`:""}. ${h.rule}.${B}`,element:se?.tagName.toLowerCase()||"",elementPath:h.selectors[0],source:"measured",measure:{check:h.check,value:h.value,rule:h.rule,widths:h.widths,selectors:h.selectors,...h.detail?{detail:h.detail}:{},where:b},...I&&h.suggestion?{suggestion:h.suggestion}:{},...Rt(se),...ee?{reviewer:ee}:{}});Ft(),ht(h.id,"Added to your round",async()=>{await Ye(`/annotations/${ie.id}/withdraw`,{}),Ft()})}catch(ie){lt=so(ie?.status||0,"save"),Ue()}}function ve(h){he(h,!0),ht(h.id,"Not an issue",()=>he(h,!1),{detail:"Not an issue (on this browser)",kind:"dismissed"})}async function Ge(h,I,O,ee){let se=I.value.trim();if(!se||!e)return;ee.disabled=!0,O.textContent="Sending\u2026";let ce=await io();try{let b=await Ye(`/annotations/${h.id}/reply`,{message:se,...ce?{name:ce}:{}});o=o.map(B=>B.id===h.id?{...B,replies:b.replies}:B),p.delete(h.id+":reply"),Ye(`/annotations/${h.id}/decision`,{decision:"discuss",...ce?{reviewer:ce}:{}}).catch(()=>{}),Ue()}catch(b){ee.disabled=!1,O.textContent=so(b?.status||0,"send")}}async function Xe(){if(!m){m=!0,Ke(),ze(null),Ue();try{let h=await xx({mark:Xn});h.findings.forEach((I,O)=>{I.id=`measured-${h.at}-${O}`}),w=h,S=!1,s&&(s.el("list").scrollTop=0)}catch{lt="Checks could not run on this page."}m=!1,Ue()}}function it(h){let I=h.selectors.length>1?`${h.selectors.length} \xD7 ${gc(h.label)}`:gc(h.label),O=h.selectors.length>1?"are":"is";return h.check==="target"?`${I} ${O} ${h.value}`:h.check==="overflow"?`Text is ${h.how} in ${gc(h.label)}`:`${I} ${h.selectors.length>1?"have":"has"} ${h.value}`}function Pt(h){let O=Xm.every(([se])=>h.widths.includes(se))?`at all three widths${h.widths.length>3?" and this one":""}`:`at ${mc(h.widths)}`;return[h.check==="overflow"?h.value:h.detail,O].filter(Boolean).join(", ").replace(/^./,se=>se.toUpperCase())+"."}function Qe(h,I,O=!0){let ee=d.get(I),se=xt("div","what");O?(se.innerHTML=fr(ee.kind==="dismissed"?"passed":"moved"),se.append(xt("span","",ee.what))):ee.what!==ee.status&&se.append(xt("span","",ee.what));let ce=ho("ghost undo","Undo",()=>Ze(I));ce.dataset.focus=I+":undo",se.append(ce),h.append(se)}function bt(h,I,O){let ee=xt("div","form"),se=I.id+":"+c.get(I.id),ce=xt("textarea");ce.placeholder=c.get(I.id)==="way"?"How would you fix it? This goes in your round.":"Why not? Optional; the agent reads it.",ce.setAttribute("aria-label",c.get(I.id)==="way"?"Your fix":"Reason it is not an issue"),ce.dataset.focus=I.id+":form",ce.value=p.get(se)||"",ce.addEventListener("input",()=>p.set(se,ce.value)),ce.addEventListener("keydown",B=>{B.key==="Enter"&&(B.metaKey||B.ctrlKey)&&(B.preventDefault(),O(ce.value.trim()))});let b=xt("div","verbs");b.append(ho("ghost","Cancel",()=>{me(I.id+(c.get(I.id)==="way"?":way":":decide")),c.delete(I.id),p.delete(se),Ue()})),b.append(c.get(I.id)==="way"?ho("primary","Add to my round",()=>{ce.value.trim()?O(ce.value.trim()):ce.focus()}):ho("sec","Not an issue",()=>O(ce.value.trim()))),ee.append(ce,b),h.append(ee)}function j(h,I){let O=I.suggestion,ee=A(I),se=xt("div","sugg"),ce=xt("div","head");if(ce.innerHTML=fr(O.kind==="text"?"text":"tweak"),ce.append(xt("span","",O.kind==="text"?"Suggested text":"Suggested tweak")),ee){let b=xt("div","seg");b.setAttribute("role","group"),b.setAttribute("aria-label","Preview the suggested change on the page");let B=C?.id===I.id?C.mode:"before";for(let[ie,ne]of[["before","Before"],["after","After"]]){let Le=ho("",ne,()=>dn(I,ie));Le.setAttribute("aria-pressed",String(B===ie)),b.append(Le)}ce.append(b)}if(se.append(ce),O.kind==="text")se.append(xt("div","before",Et(I,ee)),xt("div","after",O.to));else{let b=xt("div","tw"),B=O.from||(ee?getComputedStyle(ee).getPropertyValue(O.property).trim():"");b.append(xt("span","k",O.property),xt("span","mono",`${B?B+" \u2192 ":""}${O.to}`)),se.append(b)}ee||se.append(xt("div","meta","Its target isn't on this page, so it can't be previewed.")),h.append(se)}function q(h,I){let O=xt("div","reply"),ee=xt("div","thread");ee.hidden=!I.replies?.length,si(ee,I.replies||[],"reviewer");let se=xt("textarea");se.placeholder="Reply: agree, push back, or ask for detail",se.setAttribute("aria-label","Reply to the agent"),se.dataset.focus=I.id+":reply",se.value=p.get(I.id+":reply")||"",se.addEventListener("input",()=>p.set(I.id+":reply",se.value));let ce=xt("div","row"),b=xt("span","status"),B=ho("primary","Send reply",()=>Ge(I,se,b,B));se.addEventListener("keydown",ie=>{ie.key==="Enter"&&!ie.shiftKey&&(ie.preventDefault(),Ge(I,se,b,B))}),ce.append(b,B),O.append(ee,se,ce),h.append(O)}function J(h){let I=Ju(h),O=d.has(h.id),ee=xt("article",`note${O?" done":""}${f===h.id||C?.id===h.id?" on":""}`);ee.dataset.id=h.id;let se=xt("div","top"),ce=xt("span",`n${a.has(h.id)?"":" page"}`,l.get(h.id)||"");ce.setAttribute("aria-hidden","true");let b=xt("span",O?"word handled":`word ${I}`);if(b.innerHTML=fr(O?d.get(h.id).kind==="dismissed"?"passed":"moved":I==="suggestion"?"bulb":"alert"),b.append(O?d.get(h.id).status:wx[I]),se.append(ce,b),!O){let B=ho("iconbtn","",()=>{f=f===h.id?null:h.id,Ue()},h.replies?.length?`Discuss (${h.replies.length} in thread)`:"Discuss");B.innerHTML=fr("chat"),B.setAttribute("aria-expanded",String(f===h.id)),se.append(B)}if(ee.append(se,xt("p","txt",h.comment||"")),a.has(h.id)||ee.append(xt("div","meta",h.selector||h.elementPath?"Not found on this page":"About the whole page")),O)return Qe(ee,h.id,!1),ee;if(h.suggestion&&j(ee,h),c.has(h.id))bt(ee,h,B=>c.get(h.id)==="way"?Zt(h,{comment:B}):en(h,B));else{let B=xt("div","verbs");if(B.append(ho("ghost","Not an issue",()=>{c.set(h.id,"reason"),me(h.id+":form"),Ue()})),h.suggestion){let ie=ho("sec","Fix it my way",()=>{c.set(h.id,"way"),me(h.id+":form"),Ue()});ie.dataset.focus=h.id+":way",B.append(ie),B.append(ho("primary","Use this change",()=>R(h)))}else B.append(ho("primary","Fix it",()=>Zt(h)));Me(B,h.id),ee.append(B)}return f===h.id&&q(ee,h),ee}function ye(h){let I=d.has(h.id),O=xt("article",`note${I?" done":""}${de?.id===h.id?" on":""}`);O.dataset.id=h.id;let ee=xt("div","top"),se=xt("span","n");if(se.innerHTML=fr("gauge"),se.setAttribute("aria-hidden","true"),ee.append(se,xt("span","title2",it(h))),O.append(ee),O.append(xt("div","meta",Pt(h)),xt("div","meta",`${h.rule}.`)),O.addEventListener("pointerenter",()=>{C||ze({id:h.id,selectors:h.selectors,label:h.check==="contrast"?h.value.replace(" contrast",""):h.value.replace(/ (tall|wide)$/,""),tone:"measure"})}),O.addEventListener("pointerleave",()=>{de?.id===h.id&&ze(null)}),I)return Qe(O,h.id),O;let ce=xt("div","verbs");return ce.append(ho("ghost","Not an issue",()=>ve(h))),h.suggestion?ce.append(ho("primary",`Use ${h.suggestion.property} ${h.suggestion.to}`,()=>ae(h,{useFix:!0}))):ce.append(ho("primary","Fix it",()=>ae(h))),Me(ce,h.id),O.append(ce),O}function Ae(h){let I=xt("article","note"),O=xt("div","top"),ee=xt("span","n page");ee.innerHTML=fr("unknown");let se={image:"is over an image",gradient:"is over a gradient",filter:"is under a filter or blend",overlap:"sits over another element",colour:"uses a colour this browser can't read as sRGB"}[h.reason]||"can't be measured";return O.append(ee,xt("span","title2",`${gc(h.label)} ${se}`)),I.append(O,xt("div","meta","Its contrast can't be measured honestly here. Check it by eye.")),I}let qe=null,me=h=>{qe=h};function Me(h,I){let O=h.querySelectorAll("button");O[0]&&(O[0].dataset.focus=I+":decide");let ee=h.querySelector("button.primary");ee&&(ee.dataset.focus=I+":fix")}function Ue(){if($e(),U(),z(),de&&de.tone!=="preview"&&!Ce().some(dt=>dt.id===de.id)&&ze(null),!s||s.panel.hidden)return;let h=s.root.activeElement,I=h?.dataset?.focus?{key:h.dataset.focus,start:h.selectionStart,end:h.selectionEnd}:null,O=s.el("list").scrollTop,ee=o.filter(Oe);s.el("title").textContent=t?"From the agent":"Checks";let se=Pe();s.el("todo").textContent=se?`${se} to decide`:o.length||Ce().length?"All decided":"";let ce=s.el("sum");ce.replaceChildren(),ce.hidden=!t||!o.length;let b={blocking:0,important:0,suggestion:0};for(let dt of ee)b[Ju(dt)]++;let B=Object.entries(b).filter(([,dt])=>dt).map(([dt,yt])=>`${yt} ${dt}`),ie=xt("span","grow",B.length?B.join(", "):"Every note decided");ce.append(ie),b.blocking&&ce.append(ho("sec","Fix all blocking",()=>on()));let ne=s.el("checks");ne.replaceChildren();let Le=xt("span","grow");Le.innerHTML=fr("gauge");let De;m?De="Measuring at this width, 390, 820 and 1440\u2026":w?(De=`Checked at ${w.widths.length>1?mc(w.widths):`${w.width} (this window) only`}, ${Qt(w.at)}`,w.skipped.length&&(De+=`. ${mc(w.skipped.map(yt=>yt.width))} didn't load in a frame, so ${w.skipped.length===1?"it was":"they were"} skipped`)):De="Measure tap targets, clipped text and contrast in this browser.",Le.append(xt("span","",De));let fe=ho("sec",m?"Running\u2026":w?"Run again":"Run checks",()=>Xe());fe.insertAdjacentHTML("afterbegin",fr("rerun")),fe.disabled=m,ne.append(Le,fe);let Fe=s.el("list");Fe.replaceChildren(),lt&&(Fe.append(xt("div","empty",lt)),lt="");let we=Ce();if(w){let dt=xt("div","group","Measured ");dt.append(xt("span","",String(we.filter(Oe).length))),Fe.append(dt);for(let yt of we)Fe.append(ye(yt));if(we.length||Fe.append(xt("div","empty","Nothing failed.")),w.passed){let yt=xt("button","passed");if(yt.type="button",yt.innerHTML=fr("passed"),yt.append(xt("span","",w.passed)),yt.insertAdjacentHTML("beforeend",fr("chevron").replace("<svg",'<svg class="chev"')),yt.setAttribute("aria-expanded",String(S)),yt.addEventListener("click",()=>{S=!S,Ue()}),Fe.append(yt),S){let tn=w.checked;Fe.append(xt("div","passlist",`${tn.target} targets, ${tn.overflow} text boxes and ${tn.contrast} text colours checked across ${w.widths.length} ${w.widths.length===1?"width":"widths"}.`))}}if(w.unknown.length){let yt=xt("div","group","Couldn\u2019t measure ");yt.append(xt("span","",String(w.unknown.length))),Fe.append(yt);for(let tn of w.unknown)Fe.append(Ae(tn))}}if(t){if(w){let dt=xt("div","group","Opinion ");dt.append(xt("span","",String(ee.length))),Fe.append(dt)}for(let dt of o)Fe.append(J(dt));if(!o.length&&!r.length&&Fe.append(xt("div","empty","No notes from the agent on this page.")),r.length){let dt=ho("group fold",`Decided ${r.length}`,()=>{i=!i,me("fold"),Ue(),i&&It()});if(dt.setAttribute("aria-expanded",String(i)),dt.dataset.focus="fold",dt.insertAdjacentHTML("beforeend",`<span class="chev">${fr("chevron")}</span>`),Fe.append(dt),i)for(let yt of r)Fe.append(jt(yt))}}Fe.scrollTop=O;let pt=qe,Tt=qe||I?.key;if(qe=null,Tt){let dt=s.root.querySelector(`[data-focus="${CSS.escape(Tt)}"]`);if(dt){if(dt.focus(),I?.key===Tt)try{dt.setSelectionRange(I.start,I.end)}catch{}pt===Tt&&(dt.closest("[data-id]")||dt).scrollIntoView({block:"nearest"})}}h&&No()&&s.el("close")?.focus({preventScroll:!0}),requestAnimationFrame(Ve)}function It(){requestAnimationFrame(()=>{let h=s?.root.querySelectorAll(".what.earlier");h?.length&&(h[h.length-1].scrollIntoView({block:"nearest"}),s.root.querySelector("[data-focus=fold]")?.scrollIntoView({block:"nearest"}))})}function jt(h){let I=xt("div","what earlier");I.dataset.id=h.id;let O=h.decision||{},ee=O.decision==="fix"?O.draft?"In your drafts":"Added to your round":`Not an issue${O.reason?`: ${O.reason}`:""}`,se=l.get(h.id);I.append(xt("span","num",se||""),xt("span","grow",`${ee} \xB7 ${String(h.comment||"").slice(0,80)}`));let ce=ho("ghost undo","Undo",async()=>{let b=s?.root.activeElement===ce;ce.disabled=!0;let B=!0;try{await Ye(`/annotations/${h.id}/decision`,{decision:"undo",..._n()?{reviewer:_n()}:{}}),K(h),Ft()}catch(ie){B=!1,lt=ie?.status===409?"The agent already acted on that, so it can't be taken back.":so(ie?.status||0,"undo")}if(b&&me(B?h.id+":decide":h.id+":earlier"),!B){ce.disabled=!1,Ue();return}await y()});return ce.dataset.focus=h.id+":earlier",ce.setAttribute("aria-label",se?`Undo the decision on ${se}`:"Undo the decision"),I.append(ce),I}let Qt=h=>{let I=Math.round((Date.now()-h)/1e3);return I<45?"just now":I<3600?`${Math.round(I/60)} min ago`:"earlier"};function Kt(h){let I=a.get(h)?.target;I&&Js(I),Lt(),requestAnimationFrame(()=>{let O=s?.root.querySelector(`[data-id="${CSS.escape(h)}"]`);O?.scrollIntoView({block:"nearest"}),O?.classList.add("on")})}let Ot=null,ke='[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]';function Lt(){let h=ps();h&&h!==document.body&&!s?.root.contains(h)&&(Ot=h),s||(s=gt()),rt.want(!0,{bump:!0}),rt.visible&&(s.panel.hidden=!1,Ue(),requestAnimationFrame(()=>s.el("close")?.focus({preventScroll:!0})))}function At(){let h=!!s&&(!!s.root.activeElement||No());Ke(),ze(null);for(let I of a.values())Zs(I.target);rt.want(!1),h&&No()&&kr(Ot,`${ke} [data-review=agent]`,`${ke} [data-review=critique]`,`${ke} [data-review=inbox]`,g)}let T=()=>!!s&&rt.visible&&!s.panel.hidden,L=()=>T()?At():Lt();addEventListener("keydown",h=>{if(h.key!=="Escape"||h.defaultPrevented||!T())return;let I=h.composedPath();if(I.includes(s.host))return;let O=I[0];O instanceof Element&&O.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')||Ci({slots:["critique"],hosts:[s.host]})||(h.stopPropagation(),At())},!0);function z(){if(n)return;let h=Pe();if(!g){if(!h)return;g=Xn(document.createElement("button")),g.type="button",g.setAttribute("data-sk-no-edit",""),g.className="sk-crit-launch",Object.assign(g.style,{position:"fixed",right:"16px",bottom:"16px",zIndex:String(un.panel),minHeight:"44px",padding:"0 14px",border:"0",borderRadius:"10px",background:"#1D1A2F",color:"#FFF4E0",font:"600 13px/1 "+co,boxShadow:"0 4px 20px rgba(0,0,0,.3)",cursor:"pointer"}),g.addEventListener("click",L),document.body.append(g)}g.hidden=!h&&!T(),g.textContent=h?`From the agent \xB7 ${h} to decide`:"From the agent"}function Z(h){if(!h?.id||!t)return;let I=o.some(O=>O.id===h.id);if(h.author==="agent"&&!I&&h.status!=="resolved"&&h.status!=="dismissed"){y();return}I&&!d.has(h.id)&&(h.status==="resolved"||h.status==="dismissed")&&(o=o.filter(O=>O.id!==h.id),f===h.id&&(f=null),C?.id===h.id&&Ke(),Ue())}let te=()=>{de&&ze(de),Ve()};addEventListener("resize",te,{passive:!0});let Ne=0;return addEventListener("scroll",()=>{Ne||(Ne=requestAnimationFrame(()=>{Ne=0,na(),te()}))},{passive:!0,capture:!0}),document.addEventListener("agentation-kit:insets",()=>requestAnimationFrame(te)),document.addEventListener("agentation-kit:markers",()=>{let h=zp();for(let[,I]of a)I.dot.hidden=!h;na()}),y(),{ingest:Z,reload:()=>(Ke(),ze(null),w=null,y()),toggle:L,open:Lt,close:At,runChecks:()=>(Lt(),Xe()),count:()=>Pe(),get isOpen(){return T()}}}var Cx=new Set(["placement","rearrange"]),Sx="sk-layoutasked_",W8=10*60*1e3,H8=[["change","Change"],["fix","Broken"],["question","Exploring"],["approve","Approve"]];function j8(e,t,n=Date.now()){return!(!e?.id||!Cx.has(e.kind)||e.status==="resolved"||e.status==="dismissed"||e.note||!(n-Number(e.createdAt||0)<W8)||t(e.id))}function Ex({endpoint:e}){let t=new Map,n=null,o="change",r=C=>{try{return localStorage.getItem(Sx+C)==="1"}catch{return!1}},i=C=>{try{localStorage.setItem(Sx+C,"1")}catch{}};function s(C,w){let m=String(w||"");if(C==="placement"){let g=m.match(/^Place\s+(\w[\w-]*)/i);return g?`You placed a ${g[1]} here.`:"You placed a new component here."}let S=m.match(/^Move\s+(.+?)\s+section/i);return S?`You moved ${S[1]}.`:"You moved something on the page."}function a(){let{host:C,root:w,el:m}=An(`
      /* \u26A0\uFE0F Bottom CENTRE, not bottom right.
         It sat at right:16/bottom:84 \u2014 directly on top of Layout Mode's own
         palette, which occupies the full right edge whenever layout mode is
         open. So the question about the drag covered the panel you make drags
         with, and answering it meant losing your place. Centre clears the
         palette on the right and our own "Edit text" pill on the left. */
      .panel { left: 50%; transform: translateX(-50%); bottom: 84px;
        width: 320px; max-width: calc(100vw - 24px); }
      /* Green: this is a confirmation flow, not an alert. The move already
         saved; nothing here can go wrong. */
      .panel { --sk-accent: #30A46C; }
      .hd { padding: 7px 9px 7px 11px; }
      /* Not the shared .grow class \u2014 that one restyles font and colour for the
         header's status text, which is wrong for an icon button. */
      .hd .iconbtn { margin-left: auto; }
      .body { padding: 8px 11px 9px; }
      /* One muted line, not a boxed callout. The reviewer knows what they just
         dragged \u2014 this only has to say WHICH drag is being asked about, and a
         framed box around six words was pure height. */
      .what { font-size: 11.5px; color: var(--sk-text-2); margin-bottom: 7px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      /* nowrap: four one-word chips fit one row at 320px, and letting them wrap
         is how this panel grew a row it did not need. */
      .chips { display: flex; flex-wrap: nowrap; gap: 4px; margin-bottom: 7px; }
      .chip { font-size: 11px; padding: 3px 8px; white-space: nowrap; }
      /* Single line to start, grows as they type. A 56px box that is empty most
         of the time reads as a form to fill in rather than a quick aside. */
      textarea { min-height: 32px; font-size: 12px; padding: 6px 8px; }
      .row { display: flex; gap: 6px; align-items: center; margin-top: 7px; }
      .row .grow { margin-left: auto; }
      button.primary { padding: 5px 11px; font-size: 12px; }
      /* Withdrawing is destructive, so it does not get accent weight or a spot
         under the thumb \u2014 it is a quiet ghost at the far end, red only on hover. */
      button.danger { color: var(--sk-text-3); }
      button.danger:hover { background: color-mix(in srgb, #E5484D 16%, transparent); color: #E5484D; }
      button.ghost[disabled] { opacity: .4; cursor: default; background: none; }
    `);w.append(Object.assign(document.createElement("div"),{innerHTML:`
      <div class="panel" role="dialog" aria-label="Explain this layout change">
        <div class="hd"><span class="dot"></span><span id="title">Why this change?</span>
          <button class="iconbtn" id="skipx" aria-label="Skip" title="Skip \u2014 the change is saved either way">\u2715</button></div>
        <div class="body">
          <div class="what" id="what"></div>
          <div class="chips" id="chips"></div>
          <textarea id="why" rows="1" placeholder="Optional \u2014 e.g. pricing above the fold"></textarea>
          <div class="row">
            <button class="primary" id="send">Save</button>
            <span class="status" id="nav"></span>
            <button class="ghost danger grow" id="remove"
              title="Remove this change from the page and from the feedback list">Remove</button>
          </div>
        </div>
      </div>`}).firstElementChild);for(let[S,g]of H8){let y=document.createElement("button");y.className="chip",y.type="button",y.dataset.intent=S,y.setAttribute("aria-pressed",String(S===o)),y.textContent=g,y.addEventListener("click",()=>{o=S;for(let E of m("chips").children)E.setAttribute("aria-pressed",String(E.dataset.intent===o))}),m("chips").append(y)}return m("skipx").addEventListener("click",()=>d()),m("send").addEventListener("click",()=>p()),m("remove").addEventListener("click",()=>c()),m("why").addEventListener("keydown",S=>{S.key==="Enter"&&!S.shiftKey&&(S.preventDefault(),p()),S.stopPropagation()}),{host:C,root:w,el:m}}function l(){let C=[...t.entries()];if(!C.length){n&&(n.host.style.display="none",n.current=null);return}n||(n=a()),n.host.style.display="";let[w,m]=C[0];n.el("what").textContent=s(m.kind,m.comment),n.el("why").value="",o="change";for(let S of n.el("chips").children)S.setAttribute("aria-pressed",String(S.dataset.intent===o));n.el("send").disabled=!1,n.el("remove").disabled=!1,n.el("nav").textContent=C.length>1?`+${C.length-1} more`:"",n.current=w;try{n.el("why").focus({preventScroll:!0})}catch{}}function d(){let C=n?.current;C&&(i(C),t.delete(C),l())}async function c(){let C=n?.current;if(C){n.el("remove").disabled=!0,n.el("nav").textContent="Removing\u2026";try{let w=await fetch(`${e}/annotations/${C}/withdraw`,{method:"POST"});if(!w.ok)throw new Error(String(w.status));i(C),t.delete(C),n.el("nav").textContent="\u2713 Removed",setTimeout(l,700)}catch{n.el("remove").disabled=!1,n.el("nav").textContent="Could not remove \u2014 try again"}}}async function p(){let C=n?.current,w=n.el("why").value.trim();if(C){if(!w)return d();n.el("send").disabled=!0,n.el("nav").textContent="Saving\u2026";try{let m=await fetch(`${e}/annotations/${C}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:w,intent:o})});if(!m.ok)throw new Error(String(m.status));i(C),t.delete(C),n.el("nav").textContent="\u2713 Saved",setTimeout(l,900)}catch{n.el("send").disabled=!1,n.el("nav").textContent="Could not save \u2014 try again"}}}function f(C){if(!C?.id||!Cx.has(C.kind))return;if(C.status==="resolved"||C.status==="dismissed"||C.note){t.delete(C.id)&&l();return}t.has(C.id)||j8(C,r)&&(t.set(C.id,{kind:C.kind,comment:C.comment||""}),l())}return{ingest:f,pending:()=>t.size}}var U8=1e4,Jm="Review server not reachable \u2014 notes aren\u2019t being saved";async function q8(e,t){if(!e)return"The review server did not answer. Start it again (show-and-tell serve); notes stay in this browser until then.";let n="";try{n=(await e.clone().json())?.error||""}catch{}return e.status===403?`The review server refused this page${n?`: ${n}`:"."}`:e.status===404?`The review server has no ${t} for this page (404). It may be another project's server.`:`The review server failed (${e.status})${n?`: ${n}`:"."}`}function Tx({endpoint:e,expectedName:t,recoverSession:n}){let o={ok:!0,reason:""};if(window.__AGENTATION_KIT_HEALTH__=o,!e)return{report(){},check(){}};let r=e.replace(/\/__ag$/,""),i=new Map,s="",a=null;function l(){let{host:m,root:S,el:g}=An(`
      [hidden] { display: none !important; }
      .panel.notice { z-index: ${un.notice}; display: flex; gap: 9px; align-items: flex-start;
        padding: 9px 9px 9px 11px; width: 300px; max-width: calc(100vw - 24px);
        right: 16px; bottom: 84px; }
      .notice .sign { flex: none; width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; background: #E5484D; }
      .notice .txt { min-width: 0; flex: 1; }
      .notice strong { display: block; font-size: 12.5px; font-weight: 600; color: var(--sk-text); }
      .notice .why { margin: 2px 0 0; font-size: 12px; color: var(--sk-text-2); overflow-wrap: anywhere; }
      .notice .iconbtn { flex: none; min-width: 28px; min-height: 28px; }
      .flag { position: fixed; z-index: ${un.notice}; width: 14px; height: 14px; padding: 0; border: 0;
        border-radius: 50%; background: #E5484D; box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.3);
        cursor: pointer; }
      .flag::before { content: ""; position: absolute; inset: -15px; }
      @media (pointer: coarse) { .notice .iconbtn { min-width: 44px; min-height: 44px; } }
    `);return S.append(Object.assign(document.createElement("div"),{innerHTML:`
      <div class="panel notice" id="notice" role="alert">
        <span class="sign" aria-hidden="true"></span>
        <div class="txt"><strong id="title"></strong><p class="why" id="why"></p></div>
        <button class="iconbtn" id="dismiss" aria-label="Dismiss">\u2715</button>
      </div>
      <button class="flag" id="flag" hidden></button>`})),g("title").textContent=Jm,g("dismiss").addEventListener("click",y=>{y.stopPropagation(),s=o.reason,d()}),g("flag").addEventListener("click",y=>{y.stopPropagation(),s="",d()}),g("flag").setAttribute("aria-label",Jm+". Show details"),g("flag").title=Jm,{host:m,root:S,el:g}}function d(){if(o.ok){a&&(a.host.style.display="none");return}a||(a=l()),a.host.style.display="",a.el("why").textContent=o.reason;let m=a.el("notice"),S=a.el("flag");m.hidden=s===o.reason||!!Mo(),m.hidden||uo(m,300);let g=document.querySelector("[data-agentation-toolbar] [class*='toolbarContainer']")?.getBoundingClientRect();S.hidden=!g?.width,g?.width&&(S.style.left=`${g.left-1}px`,S.style.top=`${g.top-1}px`)}function c(){let m=[...i.values()][0]||"",S=!m;(S!==o.ok||m!==o.reason)&&(S&&(s=""),o.ok=S,o.reason=m,document.dispatchEvent(new CustomEvent("agentation-kit:health",{detail:{...o}}))),d()}async function p(m,S,g="review routes"){S&&S.ok?i.delete(m):i.set(m,await q8(S,g)),c()}async function f(){let m=await fetch(`${e}/health`,{cache:"no-store"}).catch(()=>null);await p("health",m),m?.ok&&(i.has("sessions")&&await n?.(),i.has("kv")&&await p("kv",await fetch(`${r}/__kv?prefix=agentation-round`).catch(()=>null),"note store"),c())}let C=m=>{m!==void 0&&(m>=200&&m<300?i.delete("kv"):i.set("kv",m?`The note store refused this page (${m}). Notes stay in this browser only.`:"The note store did not answer. Notes stay in this browser only."),c())};C(window.__AGENTATION_KIT_KV_STATUS__),document.addEventListener("agentation-kit:kv-status",m=>C(m.detail?.status)),t&&fetch(`${r}/`,{cache:"no-store"}).then(m=>m.ok?m.json():null).then(m=>{m?.name&&m.name!==t&&(i.set("name",`This page expects the review server for \u201C${t}\u201D, but the one answering is \u201C${m.name}\u201D.`),c())}).catch(()=>{}),f(),setInterval(()=>{document.visibilityState==="visible"&&f()},U8),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&f()});let w=()=>{o.ok||requestAnimationFrame(d)};return addEventListener("resize",w),addEventListener("pointerup",()=>setTimeout(w,320),{passive:!0}),document.addEventListener("agentation-kit:toolbar-position",w),document.addEventListener("agentation-kit:slot",w),setInterval(w,1e3),{report:p,check:f}}var Zm=e=>String(e??"").replace(/\s+/g," ").trim(),Mx=(e,t)=>{let n=Zm(e);return n.length>t?n.slice(0,t-1).trimEnd()+"\u2026":n},Nx=/[.!?…]/,K8=/["'’”)\]]/;function Ax(e){let t=e.map((c,p)=>({p:c,index:p})).sort((c,p)=>Ix(c.p.startMs)-Ix(p.p.startMs)||c.index-p.index).map(({p:c})=>c),n=[],o=new Map,r=(c={})=>{let p=c.id||`${c.kind||"general"}:${c.label||""}`;if(!o.has(p)){let f=`T${o.size+1}`;o.set(p,f),n.push({ref:f,id:String(c.id||p),label:c.kind==="general"?"General":Mx(c.label||c.kind||"Target",160),kind:c.kind||"general"})}return o.get(p)},i=[],s=null,a=null,l=()=>(s||(s={parts:[],passageIds:new Set,targetRefs:new Set}),s),d=()=>{s&&s.parts.some(c=>!c.marker)&&(i.push({text:s.parts.map(c=>c.text).join(" "),passageIds:[...s.passageIds],targetRefs:[...s.targetRefs]}),s=null)};for(let c of t){let p=Zm(c.text);if(!p)continue;let f=r(c.target);if(f!==a){let m=n.find(g=>g.ref===f),S=c.needsReview?" (check timing)":"";l().parts.push({marker:!0,text:`[\u2192 ${f} ${Mx(m.label.replace(/[[\]]/g,""),60)||"Target"}${S}]`}),a=f}let C=0;for(let m=0;m<p.length;m++){if(!Nx.test(p[m]))continue;let S=m+1;for(;S<p.length&&(Nx.test(p[S])||K8.test(p[S]));)S++;if(S<p.length&&p[S]!==" "){m=S-1;continue}let g=p.slice(C,S).trim();if(g){let y=l();y.parts.push({text:g}),y.passageIds.add(c.id),y.targetRefs.add(f)}d(),C=S,m=S-1}let w=p.slice(C).trim();if(w){let m=l();m.parts.push({text:w}),m.passageIds.add(c.id),m.targetRefs.add(f)}}return d(),{targets:n,sentences:i,words:t.map(c=>Zm(c.text)).filter(Boolean).join(" ")}}function Ix(e){return Number.isFinite(e)?e:1/0}var t0=1,Y8=8,Lx=4*1024,$x=48*1024,Zu=8*1024,V8=new Set(["general","element","region"]),Rs=e=>e==null?e:JSON.parse(JSON.stringify(e)),G8=()=>globalThis.crypto?.randomUUID?.()||`voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;function Rr(e,t,n=2048,{empty:o=!1}={}){if(typeof e!="string")throw new TypeError(`${t} must be text`);let r=e.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,"");if(!o&&!r.trim()||r.length>n)throw new RangeError(`${t} is empty or too long`);return r}function Os(e,t="time"){if(!Number.isFinite(e)||e<0)throw new RangeError(`${t} must be a non-negative finite number`);return e}function Px(e){let t=Rr(e,"page");if(!t.startsWith("/")&&!/^https?:\/\//i.test(t))throw new TypeError("page must be an HTTP URL or a root-relative path");if(t.startsWith("//"))throw new TypeError("page must not be a protocol-relative URL");return t}function Dx(e={}){let t={};for(let n of["width","height"])if(e[n]!=null){if(!Number.isFinite(e[n])||e[n]<=0||e[n]>32768)throw new RangeError(`viewport ${n} is invalid`);t[n]=e[n]}e.name!=null&&(t.name=Rr(e.name,"viewport name",80));for(let n of["scrollX","scrollY","devicePixelRatio","scale"])if(e[n]!=null){if(!Number.isFinite(e[n])||(n==="devicePixelRatio"||n==="scale")&&e[n]<=0)throw new RangeError(`viewport ${n} is invalid`);t[n]=e[n]}return t}function X8(e){if(!e||typeof e!="object")throw new TypeError("region needs a rectangle");let t={};for(let n of["x","y","width","height"]){if(!Number.isFinite(e[n])||e[n]<0||(n==="width"||n==="height")&&!e[n])throw new RangeError(`rectangle ${n} is invalid`);t[n]=e[n]}for(let n of["scrollX","scrollY"])if(e[n]!=null){if(!Number.isFinite(e[n]))throw new RangeError(`rectangle ${n} is invalid`);t[n]=e[n]}return t}function Q8(e){if(e==null)return;let t=o=>{let r=Rr(o,"image",$x);if(!/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(r)&&!/^https:\/\//i.test(r)&&!/^\/(?!\/)/.test(r))throw new TypeError("image must be a JPEG, PNG or WebP data URL, HTTPS URL or local path");return r};if(typeof e=="string")return t(e);if(!e||typeof e!="object"||Array.isArray(e))throw new TypeError("image is invalid");let n={};if(e.dataUrl!=null)n.dataUrl=t(e.dataUrl);else if(e.url!=null)n.url=t(e.url);else throw new TypeError("image needs dataUrl or url");for(let o of["width","height"])if(e[o]!=null){if(!Number.isFinite(e[o])||e[o]<=0||e[o]>32768)throw new RangeError(`image ${o} is invalid`);n[o]=e[o]}if(e.mimeType!=null){if(!/^image\/(?:jpeg|png|webp)$/.test(e.mimeType))throw new TypeError("image MIME type is invalid");n.mimeType=e.mimeType}if(e.capturedAtMs!=null&&(n.capturedAtMs=Os(e.capturedAtMs,"capture time")),JSON.stringify(n).length>$x)throw new RangeError("image metadata is too large");return n}function e0(e,t){if(e==null)return;let n=String(e).replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim();if(n)return n.length>t?n.slice(0,t-1).trimEnd()+"\u2026":n}var zx=/^[a-z][a-z0-9-]{0,31}$/,Fx=/^[a-z][a-z-]{0,31}$/;function J8(e){if(!e||typeof e!="object")return null;let t={},n=String(e.tag||"").toLowerCase();zx.test(n)&&(t.tag=n);let o=String(e.role||"").toLowerCase();Fx.test(o)&&(t.role=o);let r=e0(e.name,80);r&&(t.name=r);let i=e0(e.selector,300);return i&&(t.selector=i),(e.overlap==="inside"||e.overlap==="partly")&&(t.overlap=e.overlap),t.tag||t.name?t:null}function Z8(e,t){if(e==null||t==="general")return;if(typeof e!="object"||Array.isArray(e))throw new TypeError("anchor context is invalid");let n={},o=String(e.tag||"").toLowerCase();t==="element"&&zx.test(o)&&(n.tag=o);let r=String(e.role||"").toLowerCase();t==="element"&&Fx.test(r)&&(n.role=r);for(let[i,s]of[["name",120],["text",160],["heading",120],["landmark",80]]){let a=e0(e[i],s);a&&(n[i]=a)}if(t==="region"&&Array.isArray(e.elements)){let i=e.elements.map(J8).filter(Boolean);n.elements=i.slice(0,Y8);let s=Number.isInteger(e.total)&&e.total>=i.length?e.total:i.length;s>n.elements.length&&(n.more=Math.min(s-n.elements.length,9999))}for(;JSON.stringify(n).length>Lx&&n.elements?.length;)n.elements.pop(),n.more=(n.more||0)+1;return JSON.stringify(n).length>Lx&&delete n.text,Object.keys(n).length?n:void 0}function n0(e){if(!e||e.version!==t0||!Array.isArray(e.anchors)||!Array.isArray(e.events)||!Array.isArray(e.passages)||!e.anchors.length||!e.events.length)throw new TypeError("invalid voice session");return e}function ja(e){return n0(e),Rs({id:e.id,version:e.version,page:e.page,viewport:e.viewport,reviewer:e.reviewer,startedAt:e.startedAt,currentPage:e.currentPage,currentViewport:e.currentViewport,activeAnchorId:e.activeAnchorId,anchors:e.anchors,events:e.events,passages:e.passages,editSequence:e.editSequence||0,...Array.isArray(e.playheads)&&e.playheads.length?{playheads:e.playheads}:{}})}var e7=600,t7=.12,Bx=(e,t)=>Math.max(0,e.playing?e.time+(t-e.tMs)/1e3:e.time);function Wx(e,t,n){let o=Number(t?.time);if(!e||!Number.isFinite(o)||o<0||!Number.isFinite(n)||n<0)return e;let r=Array.isArray(e.playheads)?e.playheads:[],i=r.at(-1),s=!!t.playing;return i&&(n<i.tMs||i.playing===s&&Math.abs(Bx(i,n)-o)<t7)||r.length>=e7?e:{...e,playheads:[...r,{tMs:Math.round(n),time:Math.round(o*1e3)/1e3,playing:s}]}}function n7(e,t){let n=e?.playheads;if(!Array.isArray(n)||!n.length)return;let o=n[0];for(let r of n)if(r.tMs<=t)o=r;else break;return{time:Math.round(Bx(o,Math.max(t,o.tMs))*1e3)/1e3,playing:!!o.playing}}function Hx({id:e=G8(),page:t="/",viewport:n={},reviewer:o="",startedAt:r=Date.now()}={}){e=Rr(e,"session id",128),t=Px(t),n=Dx(n),o=Rr(o,"reviewer",40,{empty:!0}),Os(r,"startedAt");let i={id:`${e}:a0`,kind:"general",label:"General",page:t,viewport:n};return{id:e,version:t0,page:t,viewport:Rs(n),reviewer:o,startedAt:r,currentPage:t,currentViewport:Rs(n),activeAnchorId:i.id,anchors:[i],events:[{id:`${e}:e0`,type:"anchor",tMs:0,anchorId:i.id,page:t}],passages:[],editSequence:0}}function jx(e,t,n){let o=ja(e);if(Os(n),n<o.events.at(-1).tMs)throw new RangeError("anchor events must be monotonic");if(!t||!V8.has(t.kind))throw new TypeError("anchor kind must be general, element or region");let r=Px(t.page??o.currentPage),i=Dx(t.viewport??o.currentViewport),s=t.kind,a={kind:s,label:s==="general"?"General":Rr(t.label||(s==="region"?"Region":""),"target label",160),page:r,viewport:i};s==="element"&&(a.selector=Rr(t.selector,"selector")),(s==="region"||t.rect!=null)&&(a.rect=X8(t.rect));let l=Q8(t.image);if(l!=null&&s!=="region")throw new TypeError("only region anchors carry an image");l!=null&&(a.image=l);let d=Z8(t.context,s);d&&(a.context=d);let c=f=>JSON.stringify(f.viewport)===JSON.stringify(i),p=s==="region"?null:o.anchors.find(f=>f.kind===s&&f.page===r&&c(f)&&(s==="general"||f.selector===a.selector));return p?a.id=p.id:(a.id=`${o.id}:a${o.anchors.length}`,o.anchors.push(a)),o.events.push({id:`${o.id}:e${o.events.length}`,type:"anchor",tMs:n,anchorId:a.id,page:r}),o.activeAnchorId=a.id,o.currentPage=r,o.currentViewport=i,o}function Rx(e,t,n){let o=new Map;for(let i=0;i<e.events.length;i++){let s=e.events[i],a=e.events[i+1]?.tMs??1/0,l=Math.max(0,Math.min(n,a)-Math.max(t,s.tMs));l&&o.set(s.anchorId,(o.get(s.anchorId)||0)+l)}if(!o.size){let i=e.events.filter(s=>s.tMs<=t).at(-1)||e.events[0];o.set(i.anchorId,0)}let r=[...o].sort((i,s)=>s[1]-i[1]);return{anchorId:r[0][0],candidateAnchorIds:r.map(([i])=>i),needsReview:r.length>1}}function Ox(e){return e.some(t=>/^\s/.test(t.text))?e.map(t=>t.text).join("").trim():e.map(t=>t.text.trim()).join(" ").replace(/\s+([.,!?;:%…\)\]\}])/g,"$1").replace(/([\(\[\{])\s+/g,"$1").replace(/\s+(['’](?:s|re|ve|ll|d|m|t)\b)/gi,"$1").trim()}function o7(e,t){if(!e||typeof e!="object")throw new TypeError("transcript segment is invalid");let n=Os(e.startMs,"segment start"),o=Os(e.endMs,"segment end");if(o<n)throw new RangeError("segment ends before it starts");let r={sourceSegmentId:String(e.id??t).slice(0,128),startMs:n,endMs:o,text:Rr(e.text,"transcript text",Zu,{empty:!0}),timingUncertain:e.timingUncertain===!0};if(e.words!=null){if(!Array.isArray(e.words))throw new TypeError("segment words must be an array");r.words=e.words.map(i=>{let s=Os(i.startMs,"word start"),a=Os(i.endMs,"word end");if(a<s||s<n||a>o)throw new RangeError("word time falls outside its segment");return{text:Rr(i.text,"word text",Zu),startMs:s,endMs:a}});for(let i=1;i<r.words.length;i++)if(r.words[i].startMs<r.words[i-1].startMs)throw new RangeError("word times must be ordered")}return r}function Ux(e,t){let n=ja(e);if(!Array.isArray(t))throw new TypeError("transcript segments must be an array");let o=[];return t.map(o7).forEach((r,i)=>{if(!r.text.trim())return;let s=Rx(n,r.startMs,r.endMs),a=[],l=r.words?.length&&Ox(r.words).replace(/\s/g,"")===r.text.replace(/\s/g,"");if(l&&s.needsReview)for(let d of r.words){let c=Rx(n,d.startMs,d.endMs),p=a.at(-1);p&&p.anchorId===c.anchorId?(p.words.push(d),p.endMs=d.endMs,p.needsReview||(p.needsReview=c.needsReview),p.candidateAnchorIds=[...new Set([...p.candidateAnchorIds,...c.candidateAnchorIds])]):a.push({...c,words:[d],startMs:d.startMs,endMs:d.endMs})}else a.push({...s,text:r.text,startMs:r.startMs,endMs:r.endMs});a.forEach((d,c)=>o.push({id:`${n.id}:p${i}.${c}`,sourceSegmentId:r.sourceSegmentId,text:d.text??Ox(d.words),startMs:d.startMs,endMs:d.endMs,anchorId:d.anchorId,needsReview:d.needsReview,candidateAnchorIds:d.candidateAnchorIds,...r.timingUncertain||r.words?.length&&!l&&s.needsReview?{timingApproximate:!0}:{}}))}),n.passages=o,n}function ep(e,t){let n=e.passages.findIndex(o=>o.id===t);if(n<0)throw new RangeError("passage not found");return n}function qx(e,t,n){let o=ja(e),r=ep(o,t);return o.passages[r].text=Rr(n,"passage text",Zu,{empty:!0}),o.passages[r].edited=!0,o}function Kx(e,t,n){let o=ja(e),r=ep(o,t);if(!o.anchors.some(i=>i.id===n))throw new RangeError("anchor not found");return Object.assign(o.passages[r],{anchorId:n,needsReview:!1,manuallyAssigned:!0}),o}function Yx(e,t,n){let o=ja(e),r=ep(o,t),i=o.passages[r];if(!Number.isInteger(n)||n<=0||n>=i.text.length)throw new RangeError("split must be inside the passage");let s=i.text.slice(0,n).trim(),a=i.text.slice(n).trim();if(!s||!a)throw new RangeError("split must leave text on both sides");o.editSequence++;let l={...i,edited:!0,timingApproximate:!0};return o.passages.splice(r,1,{...l,text:s},{...l,id:`${t}:split${o.editSequence}`,text:a,splitFrom:t}),o}function Vx(e,t){let n=ja(e),o=ep(n,t);return n.passages.splice(o,1),n}function Gx(e){return n0(e),e.passages.filter(t=>t.text.trim()).map(t=>{Rr(t.text,"passage text",Zu);let n=e.anchors.find(l=>l.id===t.anchorId);if(!n)throw new RangeError("passage anchor not found");let o={id:n.id,kind:n.kind,label:n.label,page:n.page};n.selector&&(o.selector=n.selector),n.context&&(o.context=Rs(n.context));let r={version:t0,sessionId:e.id,passageId:t.id,startMs:t.startMs,endMs:t.endMs,target:o,...n.rect?{region:Rs(n.rect)}:{},...n.image?{image:Rs(n.image)}:{},...t.needsReview?{needsReview:!0,candidateAnchorIds:[...t.candidateAnchorIds]}:{},...t.timingApproximate?{timingApproximate:!0}:{}},i=`voice:${t.id}`,s={id:i,clientId:i,kind:"voice",comment:t.text,element:n.kind==="general"?"Page feedback":n.label,elementPath:n.selector||"",url:n.page,viewport:Rs(n.viewport),...e.reviewer?{reviewer:e.reviewer}:{},timestamp:e.startedAt+t.startMs,voice:r},a=n7(e,t.startMs);if(a&&(s.playhead=a),JSON.stringify(s).length>63*1024)throw new RangeError("voice note is too large; reduce its screenshot or split the text");return s})}function o0(e){return n0(e),Ax(e.passages.map(t=>{let n=e.anchors.find(o=>o.id===t.anchorId)||e.anchors[0];return{id:t.id,text:t.text,startMs:t.startMs,needsReview:!!t.needsReview,target:{id:n.id,label:n.label,kind:n.kind}}}))}var Qx="[data-feedback-toolbar],[data-agentation-root],#agentation-root,[data-sk-no-edit]",Xx="a[href],button,input,select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=tab],[role=menuitem],[role=switch]",tp="h1,h2,h3,h4,h5,h6,[role=heading]",r0={main:"main",nav:"navigation",header:"banner",footer:"contentinfo",aside:"complementary",form:"form",search:"search",dialog:"dialog"},r7=new Set(["main","navigation","banner","contentinfo","complementary","form","search","region","dialog"]),i7=4e3,er=(e,t=80)=>{let n=String(e||"").replace(/\s+/g," ").trim();return n.length>t?n.slice(0,t-1).trimEnd()+"\u2026":n};function s0(e){if(e.id)return"#"+CSS.escape(e.id);let t=[];for(let n=e;n&&n!==document.body&&t.length<5;n=n.parentElement){let o=n.tagName.toLowerCase();if(n.id){t.unshift("#"+CSS.escape(n.id));break}let r=[...n.parentElement?.children||[]].filter(i=>i.tagName===n.tagName);r.length>1&&(o+=`:nth-of-type(${r.indexOf(n)+1})`),t.unshift(o)}return t.join(" > ")||"body"}function Jx(e){let t=e.getAttribute("role");if(t)return t.split(/\s+/)[0].toLowerCase();let n=e.tagName.toLowerCase();if(/^h[1-6]$/.test(n))return"heading";if(n==="a")return e.hasAttribute("href")?"link":"";if(n==="button"||n==="summary")return"button";if(n==="img")return e.getAttribute("alt")===""?"":"img";if(n==="textarea")return"textbox";if(n==="select")return"combobox";if(n==="input"){let o=(e.getAttribute("type")||"text").toLowerCase();return{checkbox:"checkbox",radio:"radio",button:"button",submit:"button",reset:"button",range:"slider",search:"searchbox"}[o]||"textbox"}return n==="li"?"listitem":r0[n]?r0[n]:""}function a0(e){let t=e.getAttribute("aria-labelledby");if(t){let i=t.split(/\s+/).map(s=>document.getElementById(s)?.textContent||"").join(" ");if(i.trim())return er(i)}let n=e.getAttribute("aria-label");if(n?.trim())return er(n);if(e.labels?.length)return er([...e.labels].map(i=>i.textContent).join(" "));let o=e.getAttribute("alt");if(o?.trim())return er(o);if(/^(input|textarea|select)$/i.test(e.tagName))return er(e.getAttribute("placeholder")||e.getAttribute("title")||"");let r=e.innerText??e.textContent;return r?.trim()?er(r):er(e.getAttribute("title")||"")}function i0(e){let t="";for(let n of e.childNodes)n.nodeType===3&&(t+=n.textContent);return t.trim()}function Zx(e){return!!e.closest?.(Qx)}function e5(e){if(e.matches?.(tp))return"";let t=[...document.querySelectorAll(tp)].slice(0,500).filter(o=>!Zx(o)),n=null;for(let o of t)if(!(o===e||o.contains(e)))if(o.compareDocumentPosition(e)&4)n=o;else break;return n?er(n.innerText||n.textContent,120):""}function t5(e){for(let t=e.parentElement;t&&t!==document.documentElement;t=t.parentElement){let n=t.getAttribute("role")||r0[t.tagName.toLowerCase()];if(!n||!r7.has(n)||n==="region"&&!t.getAttribute("aria-label")&&!t.getAttribute("aria-labelledby"))continue;let o=t.getAttribute("aria-label")||"";return er(o?`${n}: ${o}`:n,80)}return""}function n5(e){let t={tag:e.tagName.toLowerCase(),role:Jx(e),name:a0(e),heading:e5(e),landmark:t5(e)},n=i0(e);return n&&er(n,160)!==t.name&&(t.text=er(n,160)),t}function s7(e,t){if(!t.width||!t.height)return!1;let n=getComputedStyle(e);return n.visibility!=="hidden"&&n.display!=="none"&&Number(n.opacity)!==0}function o5(e,t=8){let n=e.width*e.height,o=[],r=0,i=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT,{acceptNode(c){return c.matches(Qx)||/^(script|style|noscript|template|svg)$/i.test(c.tagName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});for(let c=i.nextNode();c&&r<i7;c=i.nextNode()){r++;let p=c.getBoundingClientRect(),f=Math.min(p.right,e.x+e.width)-Math.max(p.left,e.x),C=Math.min(p.bottom,e.y+e.height)-Math.max(p.top,e.y);if(f<=0||C<=0||!s7(c,p))continue;let w=c.matches(Xx)||c.matches(tp)||c.tagName==="IMG",m=!w&&i0(c).length>1;if(!w&&!m||!w&&p.width*p.height>n*6)continue;let S=f>=p.width-1&&C>=p.height-1;if(o.push({n:c,overlap:S?"inside":"partly",share:f*C/(p.width*p.height)}),w){let g=c;for(;g.lastElementChild;)g=g.lastElementChild;i.currentNode=g}}let s=[...o].sort((c,p)=>c.overlap===p.overlap?p.share-c.share:c.overlap==="inside"?-1:1).slice(0,t),a=new Set(s.map(c=>c.n)),l=o.filter(c=>a.has(c.n)).map(({n:c,overlap:p})=>({tag:c.tagName.toLowerCase(),role:Jx(c),name:c.matches(Xx)||c.matches(tp)||c.tagName==="IMG"?a0(c):er(i0(c)),selector:s0(c),overlap:p})),d=document.elementsFromPoint?.(e.x+e.width/2,e.y+e.height/2)?.find(c=>!Zx(c));return{elements:l,total:o.length,...d?{heading:e5(d),landmark:t5(d)}:{}}}function r5(e){return er(e.getAttribute("aria-label")||a0(e)||e.tagName.toLowerCase(),90)||e.tagName.toLowerCase()}function i5(e){let t=e?.context;if(!t)return"";if(e.kind==="region"){let o=(t.elements||[]).map(i=>i.name).filter(Boolean).slice(0,3),r=(t.elements||[]).length-o.length+(t.more||0);return o.length?`Contains ${o.map(i=>`\u201C${i}\u201D`).join(", ")}${r>0?` and ${r} more`:""}`:""}let n=[t.role||t.tag,t.heading?`under \u201C${t.heading}\u201D`:""].filter(Boolean);return n.length?"Near: "+n.join(", "):""}var s5=`
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
.meta span+span::before{content:"\xB7";margin-right:6px;color:var(--sk-text-3)}

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
.dock{position:fixed;z-index:${un.notice};bottom:80px;right:16px;width:420px;max-width:calc(100vw - 24px);box-sizing:border-box;background:var(--sk-surface);box-shadow:var(--sk-ring);border-radius:8px;font:13px/1.5 var(--sk-font);color:var(--sk-text);padding:10px}
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
.outline{position:fixed;pointer-events:none;z-index:${un.marker};border:2px solid #FF5436;border-radius:4px;box-shadow:0 0 0 4px #FF543622}
.outline span{position:absolute;left:-2px;bottom:100%;margin-bottom:4px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:#FF5436;color:#1D1A2F;font:600 12px/1.5 var(--sk-font);padding:1px 7px;border-radius:4px}
.outline.below span{bottom:auto;top:100%;margin:4px 0 0}
/* Markers sit at a target's top-left: the label moves to the top-right
   rather than cover them (UX review 4, N14). */
.outline.right span{left:auto;right:-2px}
.region{position:fixed;pointer-events:none;border:2px solid #FF5436;background:#FF54361a;z-index:${un.marker};border-radius:3px}

.notice{position:fixed;z-index:${un.toast};right:16px;bottom:86px;max-width:calc(100vw - 32px);width:350px;background:var(--sk-surface);color:var(--sk-text);box-shadow:var(--sk-ring);padding:6px 6px 6px 12px;border-radius:8px;font:13px/1.5 var(--sk-font);display:flex;align-items:center;gap:8px}
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
`;var a5={mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6M14.5 8.5h.01"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',page:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',element:'<path d="M5 3l14 7-6 2-2 6z"/>',region:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',point:'<path d="M5 3l14 7-6 2-2 6z"/>',interact:'<path d="M9 11V5a2 2 0 0 1 4 0v5M13 9.5a2 2 0 0 1 4 0V12M17 11a2 2 0 0 1 4 0v4a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L5 15a2 2 0 0 1 3-2.6L9 13.5"/>',warn:'<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17h.01"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',chevron:'<path d="m9 6 6 6-6 6"/>',speak:'<path d="M4 6h16v10H9l-5 4z"/>',review:'<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>'},Xr=e=>`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a5[e]||a5.mic}</svg>`,np=e=>{try{let t=new URL(e,location.href);return t.pathname+t.search}catch{return String(e||"/")}},_c=e=>`${Math.floor(e/6e4)}:${String(Math.floor(e/1e3)%60).padStart(2,"0")}`,nt=(e,t,n)=>{let o=document.createElement(e);return t&&(o.className=t),n!==void 0&&(o.textContent=n),o},Mn=(e,t,n)=>{let o=nt("button",n?"icon":"",n?void 0:e);return o.type="button",o.title=e,o.setAttribute("aria-label",e),n&&(o.innerHTML=Xr(n)),o.onclick=t,o},l0=()=>typeof matchMedia=="function"&&matchMedia("(pointer: coarse)").matches;function l5(e){return e.composedPath().some(t=>t instanceof Element&&(t.matches("[data-feedback-toolbar],[data-agentation-root],#agentation-root,[data-sk-no-edit]")||t.closest("[data-feedback-toolbar],[data-agentation-root],#agentation-root")))}var a7=e=>e?.kind==="region"?"region":e?.kind==="element"?"element":"page";function c0(e,t){let n=nt("span","chip"+(e?.kind==="general"||!e?.kind?" general":""));return n.innerHTML=Xr(a7(e)),n.append(nt("span","",t||e?.label||"General")),n.title=t||e?.label||"General",n}function l7(e,t){let n=[],o=0;for(let r of e.matchAll(/\[→ (T\d+) ([^\]]*)\]/g)){r.index>o&&n.push(document.createTextNode(e.slice(o,r.index)));let i=t.get(r[1]),s=r[2].endsWith("(check timing)"),a=c0(i||{kind:"element"},(i?.kind==="general"?"General":i?.label||r[2])+(s?" \xB7 check timing":""));a.classList.add("marker"),a.setAttribute("aria-label",`Target changes to ${i?.label||r[2]}${s?", timing approximate":""}`),n.push(a),o=r.index+r[0].length}return o<e.length&&n.push(document.createTextNode(e.slice(o))),n}function c5(e,t,n,o){let r=e.value;n>0&&!/\s/.test(r[n-1])&&!/^[\s.,!?;:]/.test(t)&&(t=" "+t),o<r.length&&!/\s/.test(r[o])&&!/[\s]$/.test(t)&&(t+=" ");let i=r.slice(0,n)+t+r.slice(o);Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set.call(e,i),e.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),e.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),e.focus(),e.setSelectionRange(n+t.length,n+t.length)}function d5({endpoint:e,sessionId:t,config:n={}}){let o=null,r=null,i=null,s="idle",a="",l=null,d=null,c="point",p=null,f=null,C=null,w="",m=null,S=0,g=null,y=new Set,E=new Map,A=!1,Q=!1,G=null,D=!1,le=new Map,K=An(s5);K.host.dataset.voiceUi="";let W=nt("section","panel");W.hidden=!0,W.setAttribute("role","dialog"),W.setAttribute("aria-label","Voice feedback"),K.root.append(W);let Y=nt("section","dock");Y.hidden=!0,Y.setAttribute("aria-label","Voice feedback recording"),K.root.append(Y);let he=nt("div","region");he.hidden=!0,K.root.append(he);let Ce=nt("div","outline");Ce.hidden=!0,Ce.append(nt("span")),K.root.append(Ce);let Oe=nt("div","notice");Oe.hidden=!0,Oe.setAttribute("role","status"),Oe.setAttribute("aria-live","polite"),K.root.append(Oe);let Pe=Vn("voice",b=>{W.hidden=!b,b?requestAnimationFrame(()=>Gn(W,460)):(q(null),bn())});Qs(Y,"bottom"),addEventListener("resize",()=>{W.hidden||Gn(W,460)});let je=(b=_n())=>`feedback-toolbar-voice:${e}:${b.toLowerCase()}`,$e=()=>{if(i)try{localStorage.setItem(je(i.reviewer||""),JSON.stringify({version:1,session:i,saved:[...y],state:s,at:Date.now()}))}catch{a="Browser storage is full. Keep this tab open or download the draft."}},rt=!1,Ve=!1;function gt(b,B){if(!(!rt||W.hidden)){if(b.disabled){B.focus({preventScroll:!0});return}rt=!1,b.focus({preventScroll:!0})}}function U(){(No()||W.contains(K.root.activeElement))&&(Ve=!0)}function oe(b){clearTimeout(G),G=setTimeout(()=>{Oe.hidden=!0,bn()},6500),Oe.replaceChildren(Mn("Dismiss",()=>{Oe.hidden=!0,bn()},"close"),nt("span","",b)),Oe.hidden=!1,uo(Oe,350)}let de=b=>!!b?.local&&(b.local.state==="idle"||b.local.state==="starting"),Re=b=>b?.provider==="local-whisper"?"On this computer":b?.provider||"Not configured",ze=null;async function Ke({prepare:b=!1}={}){if(o&&(!o.local||o.local.state==="ready"))return o;r||(r=fetch(`${e}/voice/capabilities`).then(async ie=>{let ne=await ie.json();if(!ie.ok)throw new Error(ne.error||"Speech service is unavailable.");return o=ne}).finally(()=>r=null));let B=await r;return b&&B.local&&B.local.state!=="ready"&&(ze||(ze=fetch(`${e}/voice/prepare`,{method:"POST"}).then(async ie=>{if(!ie.ok)return;let ne=await ie.json();ne?.local&&o&&(o.local=ne.local,o.enabled=!!ne.enabled)}).catch(()=>{}).finally(()=>ze=null)),await ze),o||B}let Et=0;function dn(b){clearTimeout(Et),de(o)&&(Et=setTimeout(async()=>{if(!(W.hidden||!["setup","dictation-disclosure"].includes(s))){try{await Ke()}catch{}b(),dn(b)}},2e3))}function Ye(){Oe.hidden=!0,Pe.want(!0,{bump:!0}),ye()}async function Rt(){if(d){s="transcribing",Ye();return}if(l){Y.hidden=!1;return}if(i){s="editor",Ye();return}if(m){en();return}s="setup",a="",rt=!0,Ye();try{await Ke({prepare:!0})}catch(b){a=b.message}ye(),dn(ye)}function Ft(){if(!i)try{let b=JSON.parse(localStorage.getItem(je())||"null");if(b?.version===1&&b.session){let B=new Set(b.saved||[]);if(b.session.passages?.length&&b.session.passages.every(ie=>B.has(ie.id))){localStorage.removeItem(je());return}i=b.session,y=B,Q=!0,s="editor",a=`Recovered your transcript and pointing history from ${np(i.page)}. Targets keep their original pages. Live audio cannot be recovered after a reload.`}}catch{}}Ft(),document.addEventListener("agentation-kit:reviewer-change",()=>{if(l||A||s==="transcribing"||s==="requesting"){oe("The current voice draft keeps its original reviewer. Finish or discard it before starting another.");return}l||(i=null,y=new Set,Ft(),ye())});async function lt(b,B=null){if(l||d||s==="requesting"||s==="transcribing"){oe("Finish the current recording first.");return}let ie;try{if(ie=await Ke({prepare:!0}),!ie.enabled)throw new Error(ie.local?.message||(de(ie)?"Local transcription is still starting. Try again in a moment.":ie.disclosure)||"Speech transcription is not configured.");if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw new Error("Audio recording is not available in this browser.")}catch(De){a=De.message,ye(),oe(a);return}let ne=++S;s="requesting",a="Allow microphone access to begin.",ye();let Le;try{if(Le=await navigator.mediaDevices.getUserMedia({audio:!0}),ne!==S){Le.getTracks().forEach(Tt=>Tt.stop());return}let De=["audio/webm;codecs=opus","audio/mp4","audio/webm"].find(Tt=>MediaRecorder.isTypeSupported?.(Tt)),fe=new MediaRecorder(Le,De?{mimeType:De}:{}),Fe=performance.now();b==="session"&&(i=Hx({page:location.href,viewport:Qn(),reviewer:_n()}),y=new Set,E.clear(),Q=!1,c="point");let we=[],pt=0;l={recorder:fe,stream:Le,start:Fe,kind:b,area:B,chunks:we,durationMs:0,stopReason:"",generation:ne,ownerSessionId:b==="session"?i.id:null},fe.ondataavailable=Tt=>{Tt.data?.size&&(we.push(Tt.data),pt+=Tt.data.size,pt>(ie.limits?.maxBytes||16777216)&&l?.recorder===fe&&Ze("Recording reached the audio size limit."))},fe.onerror=()=>{a="The microphone stopped unexpectedly. Your available audio and draft are kept.",Ze(a)},fe.onstop=()=>qt(l?.recorder===fe?l:{recorder:fe,stream:Le,start:Fe,kind:b,area:B,chunks:we,durationMs:performance.now()-Fe,generation:ne}),fe.start(1e3),s="recording",a="",window.__AGENTATION_KIT_VOICE_RECORDING__=!0,window.__AGENTATION_KIT_VOICE_KIND__=b,document.dispatchEvent(new CustomEvent("agentation-kit:voice-capture",{detail:{active:!0,kind:b}})),ht(),Pe.want(!1),g=setInterval(()=>{l?.recorder===fe&&(l.durationMs=performance.now()-Fe,R(),l.durationMs>=Math.min(ie.limits?.maxDurationMs||3e5,3e5)?Ze("Five-minute recording limit reached."):ve())},250),b==="session"&&U(),ve(),$e()}catch(De){if(Le?.getTracks().forEach(fe=>fe.stop()),ne!==S)return;s=b==="session"?"setup":"idle",a=De.name==="NotAllowedError"?"Microphone access was denied. Your existing text is kept.":`Could not start the microphone. ${De.message||""}`,b==="session"?Ye():oe(a),ye()}}function ht(){window.__AGENTATION_KIT_VOICE_POINT__=l?.kind==="session"&&c==="point"}function Ze(b=""){if(!l){s==="requesting"&&(S++,s=i?"editor":"setup",a="Microphone request cancelled.",ye());return}if(l.kind==="session"){let B=K.root.activeElement;D=!!B&&Y.contains(B)||document.activeElement===document.body||!document.activeElement}l.durationMs=Math.min(performance.now()-l.start,3e5),l.stopReason=b,window.__AGENTATION_KIT_VOICE_POINT__=!1,window.__AGENTATION_KIT_VOICE_RECORDING__=!1,document.dispatchEvent(new CustomEvent("agentation-kit:voice-capture",{detail:{active:!1}})),clearInterval(g),he.hidden=!0,p=null,window.__AGENTATION_KIT_POINTER_DRAG__=!1,s="transcribing",a=b||"Transcribing your recording\u2026",ve();try{l.recorder.stop()}catch{qt(l)}l?.stream.getTracks().forEach(B=>B.stop()),Me()}async function qt(b){if(!(!b||b.finished)){if(b.generation!==S){b.stream?.getTracks().forEach(B=>B.stop()),l===b&&(l=null);return}if(b.finished=!0,b.stream.getTracks().forEach(B=>B.stop()),l===b&&(l=null),it(),b.audio=new Blob(b.chunks,{type:b.recorder.mimeType||b.chunks[0]?.type||"audio/webm"}),b.chunks=[],b.kind==="session"&&le.set(b.ownerSessionId,b),Y.hidden=!0,b.kind==="session"&&Ye(),!b.audio.size){s=b.kind==="session"?"editor":"idle",a="No audio was captured. Your draft is kept.",ye(),b.kind!=="session"&&oe(a);return}await Zt(b)}}async function Zt(b){let B=b.generation;if(B!==S||d)return;if(b.kind==="session"&&b.ownerSessionId!==i?.id){oe("That recording belongs to another voice draft. Open its original draft to retry.");return}if(!b.audio?.size){oe("The audio for this recording is unavailable. Your transcript and targets are kept.");return}s="transcribing",a="Transcribing your recording\u2026",ye();let ie=new AbortController;d=ie;try{if(o?.mimeTypes?.includes("audio/wav")&&!o.mimeTypes.includes(b.audio.type.split(";")[0])&&b.audio.type!=="audio/wav"&&(b.audio=await c7(b.audio)),B!==S)return;let ne=new FormData;ne.append("audio",b.audio,"recording."+(b.audio.type==="audio/wav"?"wav":b.audio.type.includes("mp4")?"m4a":"webm")),ne.append("durationMs",String(Math.round(b.durationMs)));let Le=await fetch(`${e}/voice/transcribe`,{method:"POST",body:ne,signal:ie.signal}),De=await Le.json();if(!Le.ok)throw new Error(De.error||`Transcription failed (${Le.status}).`);if(B!==S)return;if(!De.text?.trim()&&!De.segments?.some(fe=>fe.text?.trim()))throw new Error("No speech was detected. Your draft is kept.");if(b.kind==="dictation"){let fe=b.area,Fe=(De.text||De.segments.map(we=>we.text).join(" ")).trim();fe.area.isConnected&&fe.area.value===fe.before?(m=null,c5(fe.area,Fe,fe.start,fe.end),a="Dictation added. Review your text before sending."):(m={...fe,text:Fe},a="Your text changed while transcribing. Insert the transcript when you are ready."),s="idle",oe(a),m&&en()}else i=Ux(i,De.segments?.length?De.segments:[{id:"whole",startMs:0,endMs:b.durationMs,text:De.text}]),i={...i,provider:De.provider,timing:De.timing},s="editor",a=b.stopReason||"",$e(),ye()}catch(ne){if(B!==S)return;s=b.kind==="session"?"editor":"idle",a=ne.name==="AbortError"?"Transcription cancelled. Your audio remains in this tab.":`${ne.message} Your audio remains in this tab for retry.`,b.kind==="dictation"?(m={...b.area,capture:b},en()):(i={...i,retryDurationMs:b.durationMs},$e(),ye())}finally{d===ie&&(d=null)}}function en(){s="dictation",Ye()}function on(){if(A){oe("Wait for the current save to finish. Your draft is kept.");return}let b=je(i?.reviewer||_n());l&&Ze(),S++,d?.abort(),d=null,Me(),i&&le.delete(i.id),i=null,y=new Set,s="idle",a="";try{localStorage.removeItem(b)}catch{}Pe.want(!1),ye()}function R(){if(!i||l?.kind!=="session")return;let b=$r();if(!b)return;let B=Wx(i,b,performance.now()-l.start);B!==i&&(i=B,$e())}function re(b){!i||!l||(R(),i=jx(i,b,performance.now()-l.start),$e(),ve(),b.kind!=="general"&&J())}function ae(){!l||!i||re({kind:"general",label:"General",page:location.href,viewport:Qn()})}function ve(){if(Y.hidden=!(l&&s==="recording"),Y.hidden){Ce.hidden=!0;return}let b=performance.now()-l.start,B=Y.querySelector(".timer");if(B&&Y.dataset.kind===l.kind&&Y.dataset.paint===Ge()){B.firstChild.textContent=_c(b),Xe();return}let ie=Y.contains(K.root.activeElement)?K.root.activeElement.getAttribute("aria-label"):null;Y.dataset.kind=l.kind,Y.dataset.paint=Ge(),Y.className="dock"+(l.kind==="dictation"?" dictating":""),Y.replaceChildren();let ne=nt("div","dock-top"),Le=nt("span","rec");Le.innerHTML=Xr("mic"),Le.setAttribute("aria-hidden","true");let De=nt("span","timer",_c(b));De.append(nt("small","","/ 5:00")),De.setAttribute("aria-label","Recording time"),ne.append(Le,De);let fe=Mn("Stop",()=>Ze());if(fe.className="primary",fe.innerHTML=Xr("stop")+"<span>Stop</span>",fe.setAttribute("aria-label","Stop"),l.kind==="dictation"){ne.append(nt("span","what","Dictating note"),fe),Y.append(ne),Xe();return}ne.append(fe),Y.append(ne);let Fe=i?.anchors.find(an=>an.id===i.activeAnchorId),we=nt("div","now");we.append(nt("span","label","Talking about"),c0(Fe,Fe?.kind==="general"?"General page feedback":Fe?.label)),Fe&&Fe.kind!=="general"&&we.append(nt("span","kbd","Esc returns to General")),Y.append(we);let pt=nt("div","dock-tools"),Tt=Mn("General",ae);Tt.className="general",Tt.setAttribute("aria-pressed",String(!Fe||Fe.kind==="general")),Tt.title="Talk about the whole page",pt.append(Tt);let dt=nt("div","segment");dt.setAttribute("role","group"),dt.setAttribute("aria-label","What a click does");for(let an of["point","interact"]){let Nn=an==="point"?"Point":"Interact",Bn=Mn(Nn,()=>{c=an,ht(),p=null,window.__AGENTATION_KIT_POINTER_DRAG__=!1,he.hidden=!0,ve()});Bn.innerHTML=Xr(an)+`<span>${Nn}</span>`,Bn.title=an==="point"?"Clicks and drags choose what you are talking about":"Clicks use the page normally",Bn.setAttribute("aria-pressed",String(c===an)),dt.append(Bn)}pt.append(dt);let yt=Mn(f?"Disable region screenshots":"Enable region screenshots",me,"image");yt.setAttribute("aria-pressed",String(!!f)),pt.append(yt),Y.append(pt);let tn=w||(c==="point"?l0()?"Tap an element or drag a region to point at it while you talk.":"Click an element or drag a region to point at it while you talk.":"Use the page normally. Your current target stays selected.")+(l0()&&Fe&&Fe.kind!=="general"?" Tap General to go back.":"");Y.append(nt("div","status",tn)),ie&&[...Y.querySelectorAll("button")].find(an=>an.getAttribute("aria-label")===ie)?.focus({preventScroll:!0}),Ve&&(Ve=!1,fe.focus({preventScroll:!0})),Xe()}let Ge=()=>JSON.stringify([c,!!f,w,i?.activeAnchorId,i?.anchors.length]);function Xe(){let b=document.querySelector("[data-agentation-toolbar]")?.getBoundingClientRect();if(!b?.width){Y.style.bottom="80px",it();return}if(Y.style.bottom=Math.max(12,innerHeight-b.top+10)+"px",innerWidth>600){let B=Math.min(420,innerWidth-24);Y.style.right=Math.max(12,innerWidth-b.right)+"px",Y.style.left="auto",Y.style.width=B+"px"}else Y.style.left=Y.style.right="12px",Y.style.width="auto";it(),bn()}function it(){let b=Qe||l?.kind==="session"&&s==="recording"&&i?.anchors.find(ie=>ie.id===i.activeAnchorId);if(!b||b.kind==="general"||b.page&&b.page!==location.href){Ce.hidden=!0;return}let B=null;if(b.kind==="element")try{let ie=document.querySelector(b.selector);ie&&(B=ie.getBoundingClientRect())}catch{}else b.rect&&(B={left:b.rect.x-(scrollX-(b.rect.scrollX??scrollX)),top:b.rect.y-(scrollY-(b.rect.scrollY??scrollY)),width:b.rect.width,height:b.rect.height});if(!B||!B.width){Ce.hidden=!0;return}Object.assign(Ce.style,{left:B.left-3+"px",top:B.top-3+"px",width:B.width+6+"px",height:B.height+6+"px"}),Ce.classList.toggle("below",B.top<28),Ce.classList.remove("right"),Ce.firstChild.textContent=b.label,Ce.hidden=!1,Pt(Ce.firstChild.getBoundingClientRect())&&Ce.classList.add("right")}function Pt(b){for(let B of document.querySelectorAll("[data-annotation-marker],.sk-crit-dot")){if(B.hidden)continue;let ie=B.getBoundingClientRect();if(ie.width&&ie.left<b.right+4&&ie.right>b.left-4&&ie.top<b.bottom+4&&ie.bottom>b.top-4)return!0}return!1}addEventListener("scroll",()=>{(l||Qe)&&it()},{capture:!0,passive:!0}),document.addEventListener("agentation-kit:insets",()=>{(l||Qe)&&it()});let Qe=null,bt=null,j=()=>Ce.hidden?null:Ce.getBoundingClientRect();function q(b){if(Qe=b&&b.kind!=="general"?b:null,it(),Qe&&!Ce.hidden){let B=null;if(Qe.kind==="element")try{B=document.querySelector(Qe.selector)}catch{}bt=B||j,Js(bt)}else bt&&(Zs(bt),bt=null);Qe&&!Ce.hidden&&ri(Ce.getBoundingClientRect()),it()}function J(){requestAnimationFrame(()=>{if(it(),!Ce.hidden){let b=Ce.getBoundingClientRect(),B=Ei();(b.bottom>B.bottom||b.top<B.top)&&(ri(b),it())}})}addEventListener("resize",()=>{l?Xe():Qe&&it()}),document.addEventListener("agentation-kit:toolbar-position",()=>requestAnimationFrame(()=>{l&&Xe()}));function ye(){if(W.hidden&&!Pe.wants)return;let b=D||!!K.root.activeElement&&K.root.activeElement===W.querySelector(".hd strong");W.replaceChildren(),requestAnimationFrame(()=>{W.hidden||Gn(W,460)});let B=nt("div","hd"),ie=nt("strong","",s==="dictation"?"Dictate note":s==="editor"?"Review voice feedback":"Talk and point");if(ie.tabIndex=-1,ie.setAttribute("role","heading"),ie.setAttribute("aria-level","2"),B.append(ie,Mn("Close voice panel",Ot,"close")),W.append(B),b){let De=()=>{ie.isConnected&&!W.hidden&&(ie.focus({preventScroll:!0}),D=!1)};De(),D&&requestAnimationFrame(De)}let ne=nt("div","body");if(W.append(ne),a){let De=nt("p","status",a);De.setAttribute("role","status"),ne.append(De)}let Le=nt("div","foot");if(W.append(Le),s==="setup"||s==="requesting"){ne.append(nt("p","lead","Talk through your feedback and point as you go."));let De=nt("ol","steps");for(let[we,pt,Tt]of[["speak","Talk","You start in General: page-level feedback."],["point","Point",l0()?"Tap an element or drag a region. Your next words attach to it. Tap General to go back.":"Click an element or drag a region. Your next words attach to it. Esc returns to General."],["review","Review","Edit the transcript and its targets before anything is saved."]]){let dt=nt("li");dt.innerHTML=Xr(we);let yt=nt("div");yt.append(nt("b","",pt),nt("span","",Tt)),dt.append(yt),De.append(dt)}ne.append(De);let fe=nt("div","disclosure");fe.append(nt("p","",o?`Transcription: ${de(o)?"Getting ready":o.local?.state==="unavailable"?"Not available":Re(o)}`:"Checking speech service\u2026"),nt("p","hint",o?.local&&o.local.state!=="ready"&&o.local.message||o?.disclosure||"Audio is sent to the configured speech provider only after you stop recording.")),de(o)&&fe.setAttribute("role","status");let Fe=s==="setup"&&(o?!o.enabled&&!de(o):!!a);if(ne.append(fe),Fe||ne.append(nt("p","hint","The microphone starts when you choose Start recording. Region screenshots are optional and ask separately. Up to 5 minutes.")),Le.append(Mn("Cancel",()=>{s==="requesting"&&Ze(),Ot()})),Fe){let we=Mn("Type a note instead",Lt);we.className="primary",Le.append(we),gt(we,ie);return}Le.append(Mn(s==="requesting"?"Waiting for microphone\u2026":"Start recording",async()=>{await io("Your voice feedback will be signed with your name."),await lt("session")})),Le.lastChild.className="primary",s!=="requesting"&&(Le.lastChild.innerHTML=Xr("mic")+"<span>Start recording</span>"),Le.lastChild.disabled=s==="requesting"||!o?.enabled,gt(Le.lastChild,ie);return}if(s==="transcribing"){ne.append(nt("p","muted","Keep this tab open. Your recording stays in memory if transcription fails.")),Le.append(Mn("Cancel transcription",()=>d?.abort()));return}if(s==="dictation"){if(m?.text){let De=nt("textarea");De.value=m.text,De.setAttribute("aria-label","Dictation transcript"),ne.append(De),Le.append(Mn("Copy transcript",()=>navigator.clipboard?.writeText(De.value)),Mn("Insert at current caret",()=>{if(!m.area.isConnected){oe("The original note is no longer open. Copy your transcript first.");return}c5(m.area,De.value,m.area.selectionStart,m.area.selectionEnd),m=null,Pe.want(!1)})),Le.lastChild.className="primary"}else m?.capture?.audio&&Le.append(Mn("Retry transcription",()=>Zt({...m.capture,generation:S})));Le.prepend(Mn("Discard audio",()=>{m=null,Pe.want(!1)}));return}if(s==="editor"&&i){let De=nt("p","meta"),fe=i.passages.at(-1);De.append(nt("span","",(()=>{let dt=np(i.page),yt=!1;try{yt=new URL(i.page,location.href).pathname===location.pathname}catch{}return yt?"Recorded on this page":`Recorded on ${dt}`})()),nt("span","",i.reviewer||"Unnamed reviewer")),fe&&De.append(nt("span","",_c(fe.endMs||0))),ne.append(De),Q&&ne.append(nt("p","hint","Recovered draft. Audio is unavailable after a reload.")),i.passages.length||(ne.append(nt("p","empty","No transcript yet. Your pointing history is kept.")),le.get(i.id)?.audio&&Le.append(Mn("Retry transcription",()=>Zt({...le.get(i.id),generation:S}))));let Fe=i.passages.length>1?o0(i):null;if(Fe?.sentences.length&&Fe.targets.length>1){let dt=nt("details","whole");dt.open=!0;let yt=nt("summary");yt.innerHTML=Xr("chevron"),yt.append(nt("span","","Read as one transcript"));let tn=nt("ol","sentences"),an=new Map(Fe.targets.map(Nn=>[Nn.ref,i.anchors.find(Bn=>Bn.id===Nn.id)||Nn]));for(let Nn of Fe.sentences){let Bn=nt("li");Bn.append(...l7(Nn.text,an)),tn.append(Bn)}dt.append(yt,tn),ne.append(dt)}for(let[dt,yt]of i.passages.entries()){let tn=y.has(yt.id),an=nt("article","passage"+(tn?" saved-row":"")),Nn=i.anchors.find(Jt=>Jt.id===yt.anchorId)||i.anchors[0],Bn=nt("div","passage-head");if(Bn.append(c0(Nn,Nn?.kind==="general"?"General":Nn?.label)),tn){let Jt=nt("span","saved");Jt.innerHTML=Xr("check"),Jt.append("Saved"),Bn.append(Jt)}Bn.append(nt("span","time",`${_c(yt.startMs||0)}\u2013${_c(yt.endMs||0)}`)),an.append(Bn);let mr=i5(Nn);if(mr&&an.append(nt("p","near",mr)),Nn?.page&&Nn.page!==location.href&&an.append(nt("p","hint",`Target page: ${np(Nn.page)}`)),yt.needsReview||yt.timingApproximate||yt.timingUncertain){let Jt=nt("p","warn");Jt.innerHTML=Xr("warn"),Jt.append(nt("span","","Timing overlaps a target change. Check this target before saving.")),an.append(Jt)}if(Nn?.image?.dataUrl){let Jt=nt("img","thumb");Jt.src=Nn.image.dataUrl,Jt.alt="Captured region at the time you pointed",an.append(Jt)}let mo=nt("textarea");mo.value=yt.text,mo.maxLength=8192,mo.setAttribute("aria-label",`Passage ${dt+1}`),mo.disabled=A||tn,mo.oninput=()=>{i=qx(i,yt.id,mo.value),$e()},mo.onkeydown=Jt=>Jt.stopPropagation(),an.append(mo);let no=nt("div","passage-tools"),Yt=nt("select");Yt.id=`voice-target-${dt}`;let Wn=nt("label","","Target");Wn.htmlFor=Yt.id,Yt.setAttribute("aria-label",`Target for passage ${dt+1}`);for(let Jt of i.anchors){let wn=nt("option","",(Jt.kind==="general"?"General":Jt.label)+(Jt.page!==i.page?" \xB7 "+np(Jt.page):""));wn.value=Jt.id,Yt.append(wn)}Yt.value=yt.anchorId,Yt.disabled=A||tn,Yt.onfocus=()=>q(i.anchors.find(Jt=>Jt.id===Yt.value)),Yt.onchange=()=>{i=Kx(i,yt.id,Yt.value),$e(),ye(),q(i.anchors.find(Jt=>Jt.id===Yt.value))},no.append(Wn,Yt);let gr=Mn("Split at caret",()=>{if(mo.selectionStart<=0||mo.selectionStart>=mo.value.length){oe("Place the caret between words to split this passage.");return}i=Yx(i,yt.id,mo.selectionStart),$e(),ye()});gr.disabled=A||tn;let Ji=Mn("Delete passage",()=>{i=Vx(i,yt.id),$e(),ye()},"trash");Ji.disabled=A||tn,no.append(gr,Ji),an.append(no),E.has(yt.id)&&an.append(nt("p","status",E.get(yt.id))),ne.append(an)}let we=Mn("Discard draft",on);we.className="quiet",we.disabled=A,Le.append(we,Mn("Download manifest",qe,"download"));let pt=y.size===i.passages.length&&y.size,Tt=Mn(pt?"Done":A?"Saving\u2026":y.size?"Retry unsaved notes":"Save feedback",pt?on:Ae);Tt.className="primary",Tt.disabled=A||!pt&&!i.passages.some(dt=>dt.text.trim()&&!y.has(dt.id)),Le.append(Tt)}}async function Ae(){if(A||!i)return;let b=i,B=b.id,ie;try{ie=Gx(b)}catch(ne){a=ne.message,ye();return}A=!0,a="",E.clear(),ye();try{for(let ne of ie){let Le=ne.voice.passageId;if(!y.has(Le)){if(ne.playhead&&ne.url===location.href){let De=$r(Um(ne.elementPath,ne.playhead.time),ne.playhead.time),fe=De&&(ne.playhead.playing?{...De,playing:!0}:De);fe&&JSON.stringify({...ne,playhead:fe}).length<=63*1024&&(ne.playhead=fe)}try{let De=ne.url||b.page,fe=await fetch(`${e}/sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:De,...zr(De)?{pageKey:zr(De)}:{}})});if(!fe.ok)throw new Error(`Could not resolve page (${fe.status}).`);let Fe=await fe.json(),we=await fetch(`${e}/sessions/${encodeURIComponent(Fe.id)}/annotations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ne)});if(!we.ok)throw new Error(`Save failed (${we.status}). Your passage is kept.`);let pt=await we.json();Vs(ne.id,pt.id),i?.id===B&&(y.add(Le),$e())}catch(De){i?.id===B&&E.set(Le,De.message)}}}i?.id===B&&(a=E.size?`${y.size} saved. ${E.size} could not save. Retry will send only unsaved passages.`:`Saved ${y.size} feedback ${y.size===1?"note":"notes"}.`,$e()),window.__AGENTATION_KIT_REVIEW__?.refresh(),document.dispatchEvent(new CustomEvent("agentation-kit:voice-saved"))}finally{A=!1,ye()}}function qe(){if(!i)return;let b=new Blob([JSON.stringify({version:1,...i,transcript:i.passages.length?o0(i):void 0,saveStatus:{savedPassageIds:[...y],failed:[...E]}},null,2)],{type:"application/json"}),B=URL.createObjectURL(b),ie=nt("a");ie.href=B,ie.download=`voice-feedback-${i.id}.json`,ie.click(),setTimeout(()=>URL.revokeObjectURL(B),1e3)}async function me(){let b=l;if(b){if(f){Me(),w="Region screenshots off.",ve();return}if(!navigator.mediaDevices?.getDisplayMedia){w="Screenshots are unavailable in this browser. Regions still work.",ve();return}try{let B=crypto.randomUUID();navigator.mediaDevices.setCaptureHandleConfig?.({handle:B,exposeOrigin:!0,permittedOrigins:[location.origin]});let ie=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:"browser"},audio:!1,preferCurrentTab:!0,selfBrowserSurface:"include",surfaceSwitching:"exclude"});if(l!==b||s!=="recording"){ie.getTracks().forEach(De=>De.stop());return}let ne=ie.getVideoTracks()[0];if(ne?.getSettings()?.displaySurface!=="browser"||ne?.getCaptureHandle?.()?.handle!==B)throw ie.getTracks().forEach(De=>De.stop()),new Error("This browser could not verify a capture of this exact tab. Screenshot capture is off.");f=ie,C=nt("video"),C.muted=!0,C.srcObject=f,await C.play(),ne.onended=()=>{Me(),w="Screen sharing ended. Regions still work.",ve()},w="Screenshots enabled. Share this tab at its original size."}catch(B){w=B.name==="NotAllowedError"?"Screen sharing was declined. Regions still work.":`${B.message||"Screen capture unavailable."} Regions still work.`}ve()}}function Me(){if(f)for(let b of f.getTracks())b.onended=null,b.stop();f=null,C&&(C.srcObject=null,C=null)}function Ue(b){if(!f||!C)return null;let B=C.videoWidth,ie=C.videoHeight;if(!B||!ie||Math.abs(B/ie-innerWidth/innerHeight)>.04)return w="Capture geometry differs from this tab. Region saved without an image.",null;let ne=B/innerWidth,Le=nt("canvas"),fe=Math.min(1,420/Math.max(b.width,b.height));Le.width=Math.max(1,Math.round(b.width*fe)),Le.height=Math.max(1,Math.round(b.height*fe));let Fe=Le.getContext("2d");try{Fe.drawImage(C,b.x*ne,b.y*ne,b.width*ne,b.height*ne,0,0,Le.width,Le.height);let we=.65,pt=Le.toDataURL("image/jpeg",we);for(;pt.length>42e3&&we>.15;)we-=.1,pt=Le.toDataURL("image/jpeg",we);return pt.length>44e3?(w="Region image was too large. Region geometry is saved.",null):{dataUrl:pt,width:Le.width,height:Le.height,mimeType:"image/jpeg",capturedAtMs:Math.round(performance.now()-l.start)}}catch{return w="Screenshot unavailable. Region geometry is saved.",null}}function It(b){if(!window.__AGENTATION_KIT_VOICE_POINT__||l5(b)||b.button!==0)return;b.preventDefault(),b.stopImmediatePropagation();let B=b.composedPath().find(ie=>ie instanceof Element);p={x:b.clientX,y:b.clientY,target:B,pointerId:b.pointerId,scrollX,scrollY},window.__AGENTATION_KIT_POINTER_DRAG__=!0}function jt(b){if(!p)return;b.preventDefault(),b.stopImmediatePropagation();let B={x:Math.min(p.x,b.clientX),y:Math.min(p.y,b.clientY),width:Math.abs(b.clientX-p.x),height:Math.abs(b.clientY-p.y)};he.hidden=B.width<8&&B.height<8,Object.assign(he.style,{left:B.x+"px",top:B.y+"px",width:B.width+"px",height:B.height+"px"})}function Qt(b,B){let ie=B?.elements?.find(Le=>Le.name),ne=`${Math.round(b.width)} \xD7 ${Math.round(b.height)}`;return ie?`Region: ${ie.name.slice(0,60)}${B.elements.length>1||B.more?` +${B.elements.length-1+(B.more||0)}`:""}`:`Region ${ne}`}function Kt(b){if(!p)return;b.preventDefault(),b.stopImmediatePropagation();let B=p;p=null,window.__AGENTATION_KIT_POINTER_DRAG__=!1,he.hidden=!0;let ie={x:Math.min(B.x,b.clientX),y:Math.min(B.y,b.clientY),width:Math.abs(b.clientX-B.x),height:Math.abs(b.clientY-B.y),scrollX:B.scrollX,scrollY:B.scrollY};if(ie.width>8&&ie.height>8){let ne;try{ne=o5(ie)}catch{ne=void 0}re({kind:"region",label:Qt(ie,ne),rect:ie,page:location.href,viewport:Qn(),image:Ue(ie),context:ne})}else{let ne=B.target;if(!ne?.isConnected)return;let Le=ne.getBoundingClientRect(),De;try{De=n5(ne)}catch{De=void 0}re({kind:"element",label:r5(ne),context:De,selector:s0(ne),rect:{x:Math.max(0,Le.x),y:Math.max(0,Le.y),width:Math.max(1,Le.width),height:Math.max(1,Le.height),scrollX,scrollY},page:location.href,viewport:Qn()})}}window.addEventListener("pointerdown",It,!0),window.addEventListener("pointermove",jt,!0),window.addEventListener("pointerup",Kt,!0),window.addEventListener("pointercancel",()=>{p=null,window.__AGENTATION_KIT_POINTER_DRAG__=!1,he.hidden=!0},!0),window.addEventListener("click",b=>{window.__AGENTATION_KIT_VOICE_POINT__&&!l5(b)&&(b.preventDefault(),b.stopImmediatePropagation())},!0),window.addEventListener("keydown",b=>{!l||l.kind!=="session"||b.key!=="Escape"||b.composedPath().some(B=>B instanceof Element&&B.matches("input,textarea,[contenteditable=true],[role=dialog]"))||(b.preventDefault(),b.stopImmediatePropagation(),p?(p=null,window.__AGENTATION_KIT_POINTER_DRAG__=!1,he.hidden=!0):ae())},!0);function Ot(){if(rt=!1,!Pe.wants)return;let b=W.contains(K.root.activeElement)||No();Pe.want(!1),b&&No()&&ea()}function ke(){l||(s==="requesting"&&Ze(),Ot())}function Lt(){ke(),window.__AGENTATION_KIT_TWEAK__?.toggle(!1);let b=window.__AGENTATION_KIT_EDIT__;b?.active&&b.toggle(!1)}let At=()=>!l&&Pe.visible&&!W.hidden,T=b=>b.composedPath().some(B=>B instanceof Element&&B.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')),L=()=>!!document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"]');window.addEventListener("keydown",b=>{if(l||!Pe.wants||b.metaKey||b.ctrlKey||b.altKey||b.repeat)return;if(b.key==="Escape"){if(!At())return;b.preventDefault(),b.stopImmediatePropagation();let ie=b.composedPath().find(ne=>ne instanceof Element&&ne.matches("textarea,input,select"));if(ie&&s==="editor"&&W.contains(ie)){let ne=W.querySelector(".hd strong");ne?ne.focus({preventScroll:!0}):ie.blur();return}ke();return}if(b.shiftKey||T(b)||!L())return;let B=b.key.toUpperCase();if(B==="V"&&At()){b.preventDefault(),b.stopImmediatePropagation(),ke();return}(B==="N"||B==="T"&&window.__AGENTATION_KIT_EDIT__||B==="D"&&window.__AGENTATION_KIT_TWEAK__)&&ke()},!0),window.addEventListener("click",b=>{if(l||!Pe.wants)return;let B=b.composedPath(),ie=B.find(Le=>Le instanceof Element&&Le.matches("[data-mode]"));if(ie){if(ie.dataset.mode==="voice"){if(!At())return;b.preventDefault(),b.stopImmediatePropagation(),ke();return}ke();return}let ne=B.find(Le=>Le instanceof Element&&Le.matches("[role=menuitemradio]"));ne&&B.some(Le=>Le instanceof Element&&Le.matches('[role=menu][aria-label="Feedback mode"]'))&&!/^Talk\b/.test((ne.querySelector(".two span")||ne).textContent.trim())&&ke()},!0),document.addEventListener("agentation-kit:route",()=>{l&&(l.kind==="session"&&ae(),Ze("Page changed. Recording stopped safely; review the captured page context."))}),document.addEventListener("visibilitychange",()=>{document.hidden&&l&&Ze("Recording stopped because this tab became hidden.")}),window.addEventListener("pagehide",()=>{$e(),l&&Ze("Page navigation stopped recording.")}),window.addEventListener("beforeunload",b=>{(l||s==="transcribing")&&($e(),b.preventDefault(),b.returnValue="")});let z=new WeakSet,Z=new WeakSet,te=new WeakMap,Ne=b=>b.dataset.focus||b.id||b.getAttribute("aria-label")||b.placeholder||"";function h(b){if(!b||b===K.root)return;Z.has(b)||(Z.add(b),new MutationObserver(()=>queueMicrotask(()=>h(b))).observe(b,{childList:!0,subtree:!0}));let B=te.get(b)||new Set,ie=new Set;te.set(b,ie);for(let ne of b.querySelectorAll("textarea")){if(ne.closest("[data-annotation-popup]")||ie.add(Ne(ne)),z.has(ne)||ne.closest("[data-voice-editor]")||/webhook|url/i.test(ne.placeholder||"")||ne.getAttribute("aria-label")==="Webhook URL"||!(b.host?.matches(".sk-edit-ui")||ne.closest("[data-agentation-root],#agentation-root,[data-feedback-toolbar]")))continue;z.add(ne);let fe=null,Fe=Mn("Dictate note",()=>{let dt=fe;fe=null,se(ne,dt)},"mic");Fe.onpointerdown=dt=>{dt.preventDefault(),fe={before:ne.value,start:ne.selectionStart,end:ne.selectionEnd}},Fe.dataset.voiceDictate="",Xn(Fe);let we=ne.closest("[data-annotation-popup]"),pt=()=>/light___/.test(we.className),Tt=()=>we?pt()?"rgba(0,0,0,.6)":"rgba(255,255,255,.72)":"inherit";if(Fe.style.cssText="width:44px;height:44px;min-width:44px;min-height:44px;flex:none;border:0;border-radius:6px;background:transparent;color:"+Tt()+";opacity:"+(we?"1":".72")+";display:grid;place-items:center;cursor:pointer;margin:0;padding:0",Fe.onmouseenter=()=>{Fe.style.opacity="1",Fe.style.background="rgba(127,127,127,.16)",we&&(Fe.style.color=pt()?"rgba(0,0,0,.85)":"rgba(255,255,255,.95)")},Fe.onmouseleave=()=>{Fe.style.opacity=we?"1":".72",Fe.style.background="transparent",Fe.style.color=Tt()},we||ne.parentElement?.classList.contains("field")?ne.after(Fe):I(ne,Fe),we||(ne.addEventListener("focus",()=>requestAnimationFrame(()=>ee(ne))),(!B.has(Ne(ne))||ne.getRootNode().activeElement===ne)&&requestAnimationFrame(()=>ee(ne))),we){ne.dataset.voiceDictated="";let dt=()=>{!Fe.isConnected||!ne.isConnected||(Fe.style.top=ne.offsetTop+Math.max(0,(Math.min(ne.offsetHeight,88)-44)/2)+"px",Fe.style.left=ne.offsetLeft+ne.offsetWidth+6+"px")};if(dt(),typeof ResizeObserver=="function"){let yt=new ResizeObserver(dt);yt.observe(ne),yt.observe(we)}requestAnimationFrame(dt)}}for(let ne of b.querySelectorAll("*"))ne.shadowRoot&&ne!==K.host&&h(ne.shadowRoot)}function I(b,B){let ie=b.getRootNode(),ne=ie.activeElement===b,Le=b.selectionStart,De=b.selectionEnd,fe=document.createElement("div");if(fe.dataset.voiceField="",fe.style.cssText="display:flex;gap:6px;align-items:flex-start;min-width:0",b.before(fe),b.style.flex="1",b.style.minWidth="0",fe.append(b,B),ne){b.focus({preventScroll:!0});try{b.setSelectionRange(Le,De)}catch{}}}function O(b){for(let B=b.parentNode;B&&B!==document.body&&B!==document.documentElement;B=B.parentNode||B.host){if(!(B instanceof Element))continue;let ie=getComputedStyle(B).overflowY;if((ie==="auto"||ie==="scroll")&&B.scrollHeight>B.clientHeight+1)return B}return null}function ee(b){if(!b.isConnected)return;let B=b.closest("[data-voice-field],.field")||b,ie=B.nextElementSibling,ne=O(B);if(!ne)return;let Le=ne.getBoundingClientRect(),De=B.getBoundingClientRect(),fe=ie&&ie.getClientRects().length?ie.getBoundingClientRect():De,Fe=Math.min(De.top,fe.top),we=Math.max(De.bottom,fe.bottom),pt=8,Tt=0;we>Le.bottom-pt&&(Tt=we-(Le.bottom-pt)),Fe-Tt<Le.top+pt&&(Tt=Fe-(Le.top+pt)),Math.abs(Tt)>=1&&(ne.scrollTop+=Tt)}async function se(b,B=null){if(Oe.hidden=!0,l||d||s==="requesting"||s==="transcribing"){oe("Finish the current recording first.");return}if(m){en();return}let ie=B?.before??b.value,ne=B?.start??b.selectionStart,Le=B?.end??b.selectionEnd,De;try{De=await Ke({prepare:!0})}catch(Tt){oe(Tt.message);return}s="dictation-disclosure",W.replaceChildren();let fe=nt("div","hd");fe.append(nt("strong","","Dictate note"),Mn("Close",()=>Pe.want(!1),"close"));let Fe=nt("div","body");Fe.append(nt("p","",`Transcription: ${de(De)?"Getting ready":De.local?.state==="unavailable"?"Not available":Re(De)}`),nt("p","disclosure",De.local&&De.local.state!=="ready"&&De.local.message||De.disclosure||"Your audio is sent to the configured speech provider after you stop recording."),nt("p","hint","Dictation inserts text at the saved caret. It does not send your note."));let we=nt("div","foot"),pt=Mn("Talk and point instead",()=>{Pe.want(!1),Rt()});pt.className="quiet",pt.title="Record longer feedback and point at the page while you talk",we.append(pt,Mn("Cancel",()=>Pe.want(!1)),Mn("Start dictation",()=>lt("dictation",{area:b,before:ie,start:ne,end:Le}))),we.lastChild.className="primary",we.lastChild.disabled=!De.enabled,W.append(fe,Fe,we),Pe.want(!0,{bump:!0}),dn(()=>{s==="dictation-disclosure"&&!W.hidden&&se(b,{before:ie,start:ne,end:Le})})}return h(document),setInterval(()=>h(document),1500),{open:Rt,close:ke,stop:Ze,discard:on,setSession(b){t=b},get state(){return s},get draft(){return i},get recording(){return!!l},get mode(){return c},get hasAudio(){return!!(le.get(i?.id)?.audio||m?.capture?.audio)},get savedPassageIds(){return[...y]}}}async function c7(e){let t=window.AudioContext||window.webkitAudioContext;if(!t)throw new Error("This browser cannot prepare audio for the configured speech provider.");let n=new t;try{let o=await n.decodeAudioData(await e.arrayBuffer()),r=Math.min(Math.ceil(o.duration*16e3),3e5*16),i=new Float32Array(r),s=Array.from({length:o.numberOfChannels},(c,p)=>o.getChannelData(p));for(let c=0;c<r;c++){let p=c*o.sampleRate/16e3,f=Math.floor(p),C=p-f,w=0;for(let m of s)w+=(m[f]||0)*(1-C)+(m[f+1]||0)*C;i[c]=w/s.length}let a=new ArrayBuffer(44+r*2),l=new DataView(a),d=(c,p)=>{for(let f=0;f<p.length;f++)l.setUint8(c+f,p.charCodeAt(f))};d(0,"RIFF"),l.setUint32(4,36+r*2,!0),d(8,"WAVE"),d(12,"fmt "),l.setUint32(16,16,!0),l.setUint16(20,1,!0),l.setUint16(22,1,!0),l.setUint32(24,16e3,!0),l.setUint32(28,32e3,!0),l.setUint16(32,2,!0),l.setUint16(34,16,!0),d(36,"data"),l.setUint32(40,r*2,!0);for(let c=0;c<r;c++){let p=Math.max(-1,Math.min(1,i[c]));l.setInt16(44+c*2,p<0?p*32768:p*32767,!0)}return new Blob([a],{type:"audio/wav"})}finally{await n.close()}}var d7=`
[data-annotation-popup] textarea[data-voice-dictated] { width: calc(100% - 50px) !important; }
[data-annotation-popup] [data-voice-dictate] { position: absolute; }
@media (pointer: coarse) {
  [data-annotation-popup] [class*="actions___"] button { min-height: 44px; min-width: 44px; }
}
@media (pointer: coarse) and (max-width: 639px) {
  html [data-annotation-popup] { width: min(312px, calc(100vw - 40px)) !important; max-width: calc(100vw - 40px) !important; box-sizing: border-box; }
}
`,yc=20;function u7(e,t=innerWidth){let n=parseFloat(String(e.style.translate||"0").split(" ")[0])||0;if(t>=640)return n&&(e.style.translate=""),0;let o=e.getBoundingClientRect();if(!o.width)return n;let r=o.left-n,i=o.right-n,s=0;return r<yc?s=yc-r:i>t-yc&&(s=Math.max(yc-r,t-yc-i)),Math.abs(s-n)>.5&&(e.style.translate=s?s+"px 0":""),s}var u5=0;function p7(){u5||typeof setInterval!="function"||(u5=setInterval(()=>{for(let e of document.querySelectorAll("[data-annotation-popup]"))u7(e)},120))}var Ps=null;function p5(){return p7(),Ps?.isConnected||typeof document>"u"||(Ps=Xn(document.createElement("style")),Ps.dataset.agentationKitPopup="",Ps.textContent=d7,document.head.append(Ps)),Ps}var f5={listening:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7.5 9.5 3 2.5-3 2.5M13 15h4"/>',offline:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8.5 12h7"/>',working:'<circle cx="12" cy="12" r="8" opacity=".25"/><path d="M20 12a8 8 0 0 0-8-8"/>',complete:'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',"needs-input":'<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/><path d="M10 9a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.2M12 13.6h.01"/>',failed:'<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',queued:'<path d="M4 8h16M4 12h16M4 16h10"/>',"step-done":'<path d="m6 12.5 4 4L18 8"/>',"step-active":'<circle cx="12" cy="12" r="7" opacity=".25"/><path d="M19 12a7 7 0 0 0-7-7"/>',"step-pending":'<circle cx="12" cy="12" r="6.5"/>',"step-failed":'<path d="m7 7 10 10M17 7 7 17"/>',resolved:'<path d="m6 12.5 4 4L18 8"/>',rejected:'<path d="M6 12h12"/>'},Ua=(e,t="")=>`<svg class="${t}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${f5[e]||f5.listening}</svg>`,h5={listening:"Agent listening",working:"Agent working",complete:"Changes ready","needs-input":"Agent needs input",failed:"Agent run failed",offline:"Agent listener offline"},f7=new Set(Object.keys(h5)),h7=new Set(["done","active","pending","failed"]),m7=new Set(["resolved","needs-input","rejected"]),g7={resolved:"Done","needs-input":"Needs your input",rejected:"Set aside"},op=(e,t)=>{let n=String(e??"").replace(/\s+/g," ").trim();return n.length>t?n.slice(0,t-1)+"\u2026":n};function _7(e,t,n){let o=String(t||"").trim(),r=i=>String(i||"").trim().replace(/[\s.!?…:]+$/u,"").toLowerCase();return!o||r(o)===r(e)||sl(e,o)===o&&/offline|listening/i.test(o)&&(n==="offline"||n==="listening")?"":o}function y7(e){if(!Array.isArray(e))return null;let t=e.slice(0,8).filter(n=>n&&typeof n.label=="string"&&n.label.trim()).map(n=>({label:op(n.label,120),state:h7.has(n.state)?n.state:"pending"}));return t.length?t:null}function x7(e){if(!Array.isArray(e))return null;let t=e.slice(0,12).filter(n=>n&&typeof n.summary=="string"&&n.summary.trim()).map(n=>({noteId:op(n.noteId,128),summary:op(n.summary,200),status:m7.has(n.status)?n.status:"resolved"}));return t.length?t:null}function m5({endpoint:e,hint:t,livePage:n=!1}){let o=An(`
    [hidden]{display:none!important}
    :host{--aw-accent:#FF9C87}
    :host([data-sk-theme=light]){--aw-accent:var(--sk-accent)}
    .activity{position:fixed;right:16px;bottom:20px;z-index:${un.notice};display:flex;align-items:center;gap:7px;box-sizing:border-box;min-width:36px;height:36px;max-width:calc(100vw - 32px);border:0;border-radius:18px;padding:0 10px;background:var(--sk-surface);color:var(--sk-text-2);box-shadow:var(--sk-ring);cursor:pointer;font:500 12px/1 var(--sk-font);transition:color .15s ease}
    .activity:hover{color:var(--sk-text)}
    .activity:focus-visible{outline:2px solid var(--sk-focus);outline-offset:3px}
    .activity svg{flex:none;width:16px;height:16px}
    .activity[data-state=offline]{color:var(--sk-text-3);box-shadow:0 0 0 1px var(--sk-hairline);background:var(--sk-surface)}
    .activity[data-state=working]{color:var(--sk-text)}
    .activity[data-state=working] svg,.activity[data-state=complete] svg{color:var(--aw-accent)}
    .activity[data-state=complete],.activity[data-state=needs-input],.activity[data-state=failed]{color:var(--sk-text)}
    .activity .label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:240px;line-height:1.3}
    .activity .count{font-variant-numeric:tabular-nums;color:var(--sk-text-2);margin-right:2px}
    .spin{animation:agent-work-turn 1s linear infinite;transform-origin:50% 50%}
    @keyframes agent-work-turn{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){.spin{animation:none}}
    @media(pointer:coarse){.activity{height:44px;min-width:44px;border-radius:22px;padding:0 13px}}
    .work-panel{width:320px;max-width:calc(100vw - 24px);box-sizing:border-box;display:flex;flex-direction:column}
    .work-panel .hd{padding:4px 4px 4px 12px;min-height:44px}
    .work-panel .hd svg{width:16px;height:16px;flex:none}
    .work-panel .hd[data-state=working] .state,.work-panel .hd[data-state=complete] .state{color:var(--aw-accent)}
    .work-panel .hd strong{flex:1}
    .work-panel .body{padding:12px;overflow:auto;min-height:0}
    .work-panel p{margin:0 0 10px;overflow-wrap:anywhere;line-height:1.5}
    .work-panel .msg{font-size:13px;color:var(--sk-text)}
    .work-panel h3{margin:12px 0 6px;font-size:12px;font-weight:600;color:var(--sk-text-2)}
    .work-panel ol,.work-panel ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}
    .work-panel li{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;font-size:12.5px;line-height:1.45;overflow-wrap:anywhere}
    .work-panel li svg{width:16px;height:16px;margin-top:1px}
    .work-panel li[data-state=done],.work-panel li[data-state=pending]{color:var(--sk-text-2)}
    .work-panel li[data-state=pending] svg{color:var(--sk-text-3)}
    .work-panel li[data-state=active]{color:var(--sk-text);font-weight:500}
    .work-panel li[data-state=active] svg,.work-panel li[data-state=resolved] svg{color:var(--aw-accent)}
    .work-panel li small{display:block;color:var(--sk-text-3);font-size:12px}
    .callout{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;background:var(--sk-raised);border-radius:6px;padding:8px 10px;margin:12px 0 0;font-size:12.5px;line-height:1.45}
    .callout svg{width:16px;height:16px;margin-top:1px;color:var(--sk-text-2)}
    .work-panel .hint{font-size:12px;color:var(--sk-text-3);margin:12px 0 0}
    .work-panel .actions{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--sk-hairline)}
    .work-panel .actions button{min-height:36px}
    .work-panel .actions .secondary{font:inherit;font-size:12.5px;color:var(--sk-text);background:var(--sk-raised);border:1px solid var(--sk-hairline);border-radius:6px;padding:7px 12px;cursor:pointer}
    .work-panel .actions .secondary:hover{background:var(--sk-hover)}
    .work-panel button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    @media(pointer:coarse){.work-panel .actions button{min-height:44px;min-width:44px}}
  `);o.host.dataset.agentWorkUi="";let r=(Ye,Rt,Ft)=>{let lt=document.createElement(Ye);return Rt&&(lt.className=Rt),Ft!==void 0&&(lt.textContent=Ft),lt},i=r("button","activity");i.type="button",i.hidden=!0;let s=r("span");s.setAttribute("aria-hidden","true"),s.style.display="contents";let a=r("span","label");i.append(s,a),i.setAttribute("aria-haspopup","dialog"),i.setAttribute("aria-expanded","false"),i.setAttribute("aria-controls","agent-work-panel");let l=r("span");l.setAttribute("role","status"),l.setAttribute("aria-live","polite"),Object.assign(l.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clipPath:"inset(50%)"});let d=r("section","panel work-panel");d.id="agent-work-panel",d.hidden=!0,d.setAttribute("role","dialog"),d.setAttribute("aria-label","Agent activity");let c=r("div","hd"),p=r("span");p.style.display="contents";let f=r("strong","sk-title"),C=r("button","x sk-x");C.type="button",C.innerHTML=ii,C.setAttribute("aria-label","Close agent activity"),C.title="Close",c.append(p,f,C);let w=r("div","body"),m=r("p","msg"),S=r("h3","","Progress"),g=r("ol"),y=r("h3","","What changed"),E=r("ul"),A=r("div","callout");A.innerHTML=Ua("queued");let Q=r("span","","Your next round is queued. One agent works at a time.");A.append(Q);let G=r("div","callout");G.innerHTML=Ua("listening"),G.append(r("span","","You are recording voice feedback. Stop and save it before reloading; reloading ends the recording."));let D=r("p","hint");w.append(m,S,g,y,E,A,G,D);let le=r("div","actions"),K=r("button","secondary","Close");K.type="button";let W=r("button","primary","Reload preview");W.type="button",W.hidden=!0,W.onclick=()=>{Pe()||location.reload()},le.append(K,W),d.append(c,w,le),o.root.append(i,l,d),Qs(i,"bottom");let Y=Vn("agent-work",Ye=>{d.hidden=!Ye,i.setAttribute("aria-expanded",String(Ye)),Ye&&requestAnimationFrame(()=>{Gn(d,320),d.contains(ps())||C.focus({preventScroll:!0})})}),he=()=>{let Ye=document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"] [data-review=agent]');return Ye&&!Ye.hidden?Ye:null},Ce=()=>{Y.want(!1),kr(he(),i,'[data-agentation-toolbar] [class*="toolbarContainer"][class*="expanded"] [data-review=inbox]')};K.onclick=Ce,C.onclick=Ce;let Oe=Ye=>{if(Ye.key!=="Escape"||d.hidden)return;let Rt=Ye.composedPath()[0];!Ye.composedPath().includes(d)&&Rt instanceof Element&&Rt.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')||(Ye.stopPropagation(),Ce())};addEventListener("keydown",Oe,!0),i.onclick=()=>Y.want(d.hidden,{bump:!0});let Pe=()=>!!window.__AGENTATION_KIT_VOICE_RECORDING__&&window.__AGENTATION_KIT_VOICE_KIND__==="session",je=0,$e=null,rt=typeof ResizeObserver=="function"?new ResizeObserver(()=>Ve()):null;function Ve(){je||(je=requestAnimationFrame(()=>{je=0;let Ye=document.querySelector('[data-agentation-toolbar] [class*="toolbarContainer"]');rt&&Ye&&$e!==Ye&&($e&&rt.unobserve($e),rt.observe(Ye),$e=Ye);let Rt=Ye?.getBoundingClientRect();i.style.display=he()?"none":"";let Ft=i.getBoundingClientRect().height||36,lt=8;if(!Rt||!Rt.width){Object.assign(i.style,{left:"auto",right:"16px",top:"auto",bottom:"20px"}),a.style.maxWidth="";return}let ht=Rt.bottom-Math.min(Rt.height,56)/2,Ze=Math.round(Math.max(12,Math.min(innerHeight-Ft-12,ht-Ft/2))),qt=Rt.left-lt-12,Zt=innerWidth-Rt.right-lt-12,en=qt>=Math.min(120,Zt)||qt>=44,on=Math.max(0,en?qt:Zt),R=!!Mo()||!!window.__AGENTATION_KIT_VOICE_RECORDING__;if(on<110&&!a.hidden&&!R){a.style.maxWidth=Math.max(0,Math.min(280,Rt.width-44))+"px",Object.assign(i.style,{left:Math.round(Math.max(12,Rt.left))+"px",right:"auto",top:Math.round(Rt.top-Ft-lt)+"px",bottom:"auto"}),d.hidden||Gn(d,320);return}a.style.maxWidth=on>=110?Math.min(240,on-44)+"px":"0px",Object.assign(i.style,en?{left:"auto",right:Math.round(innerWidth-Rt.left+lt)+"px",top:Ze+"px",bottom:"auto"}:{left:Math.round(Rt.right+lt)+"px",right:"auto",top:Ze+"px",bottom:"auto"}),d.hidden||Gn(d,320),bn()}))}addEventListener("resize",Ve),document.addEventListener("agentation-kit:toolbar-position",Ve),document.addEventListener("agentation-kit:slot",Ve);let gt=setInterval(()=>{let Ye=he()?"none":"";i.style.display!==Ye&&Ve()},400),U={state:"offline",message:"Checking local listener."},oe="",de=!1,Re=!0;function ze(Ye){let Rt={...Ye,state:f7.has(Ye?.state)?Ye.state:"offline",message:op(Ye?.message,400)},Ft=y7(Ye?.steps),lt=x7(Ye?.changes);U=Rt,window.__AGENTATION_KIT_AGENT_WORK_STATUS__=U;let ht=U.state,Ze=h5[ht];i.hidden=!1,i.dataset.state=ht,s.innerHTML=Ua(ht,ht==="working"?"spin":"");let qt=Ft?.find(ve=>ve.state==="active"),Zt=Ft&&ht==="working"?`${Ft.filter(ve=>ve.state==="done").length+(qt?1:0)} of ${Ft.length}`:"",en=ht==="working"?qt?.label||U.message||"Working":ht==="complete"?"Changes ready":ht==="needs-input"||ht==="failed"?Ze:"";a.replaceChildren(),Zt&&a.append(r("span","count",Zt)),a.append(en),a.hidden=!en;let on=U.queued?" Another round is queued.":"",R=`${sl(Ze,U.message)}${on}`.trim();i.title=R,i.setAttribute("aria-label",R);let re=`${Ze}.${on}${ht==="complete"?" Reload the preview to review the changes.":""}`;oe!==re&&(l.textContent=re,oe=re),c.dataset.state=ht,p.innerHTML=Ua(ht,ht==="working"?"state spin":"state"),f.textContent=Ze,m.textContent=_7(Ze,U.message,ht),m.hidden=!m.textContent,g.replaceChildren(),S.hidden=g.hidden=!Ft;for(let ve of Ft||[]){let Ge=r("li");Ge.dataset.state=ve.state,Ge.innerHTML=Ua("step-"+ve.state,ve.state==="active"&&ht==="working"?"spin":"");let Xe=r("span");Xe.append(r("span","",ve.label)),ve.state!=="pending"&&ve.state!=="done"&&Xe.append(r("small","",ve.state==="active"?"In progress":"Failed")),Ge.append(Xe),Ge.setAttribute("aria-label",`${ve.label}: ${{done:"done",active:"in progress",pending:"not started",failed:"failed"}[ve.state]}`),g.append(Ge)}E.replaceChildren(),y.hidden=E.hidden=!lt;for(let ve of lt||[]){let Ge=r("li");Ge.dataset.state=ve.status,Ge.innerHTML=Ua(ve.status==="needs-input"?"needs-input":ve.status);let Xe=r("span");Xe.append(r("span","",ve.summary)),Xe.append(r("small","",g7[ve.status])),Ge.append(Xe),E.append(Ge)}A.hidden=!U.queued;let ae=Pe();G.hidden=!(ae&&ht==="complete"),D.textContent=ht==="offline"?"Your feedback is saved. Start the local listener to apply it automatically, or ask your agent to read the round.":ht==="failed"?"Your notes are kept. Send to agent again to retry.":ht==="needs-input"?"Open the inbox to answer the agent.":typeof t=="string"&&t.trim()?t.trim().slice(0,200):"Send to agent starts a local run. Changes stay local for review.",W.hidden=n||ht!=="complete",W.disabled=ae,W.title=ae?"Stop recording first: reloading ends it":"Reload to see the changes",Ve(),document.dispatchEvent(new CustomEvent("agentation-kit:agent-work",{detail:U}))}async function Ke(){if(!(!Re||de)){de=!0;try{let Ye=await fetch(`${e}/agent-work`,{cache:"no-store"});if(!Ye.ok)throw new Error;let Rt=await Ye.json();Re&&ze(Rt)}catch{Re&&ze({state:"offline",message:"The local agent listener is not reachable. Your feedback is kept."})}finally{de=!1}}}let Et=()=>ze(U),dn=setInterval(Ke,2e3);return document.addEventListener("agentation-kit:round-done",Ke),document.addEventListener("agentation-kit:voice-capture",Et),Ke(),{check:Ke,toggle(){Y.want(d.hidden,{bump:!0})},destroy(){Re=!1,clearInterval(dn),clearInterval(gt),rt?.disconnect(),document.removeEventListener("agentation-kit:round-done",Ke),document.removeEventListener("agentation-kit:voice-capture",Et),removeEventListener("resize",Ve),removeEventListener("keydown",Oe,!0),document.removeEventListener("agentation-kit:toolbar-position",Ve),document.removeEventListener("agentation-kit:slot",Ve),Y.want(!1),o.host.remove()}}}var w7={check:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3"/>',done:'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',prev:'<path d="M15 6l-6 6 6 6"/>',next:'<path d="M9 6l6 6-6 6"/>',close:'<path d="M6 6l12 12M18 6L6 18"/>',tick:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',reopen:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'},xc=(e,t=16)=>`<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${w7[e]||""}</svg>`,v7=e=>{try{return new URL(e,location.href).pathname}catch{return""}},b7=e=>{try{let t=JSON.parse(localStorage.getItem("agentation-round"));return t?.link===v7(e)&&Number(t.ts)||0}catch{return 0}},g5="feedback-toolbar-check-closed",k7=e=>e.status==="resolved"||e.status==="dismissed",S7=e=>/^(Cleared by |Withdrawn by the reviewer|Undone by .*: Fix it taken back\.$)/.test(e.resolution||"");function C7(e,t){if(!e||e.author==="agent"||!k7(e)||S7(e)||!t)return!1;let n=Number(e.updatedAt)||0;return n>t&&!(e.verdict&&Number(e.verdict.at)>=n)}function E7(e){let t=n=>n.status==="dismissed"?1:0;return[...e].sort((n,o)=>t(n)-t(o)||(Number(n.updatedAt)||0)-(Number(o.updatedAt)||0))}function T7(e){let t=e.filter(o=>o.status==="resolved").length,n=e.length-t;return[t?`${t} changed`:"",n?`${n} set aside`:""].filter(Boolean).join(", ")}function M7(e){let t=[];return e["looks-right"]&&t.push(`${e["looks-right"]} ${e["looks-right"]===1?"looks":"look"} right`),e["not-yet"]&&t.push(`${e["not-yet"]} reopened`),e.agree&&t.push(`${e.agree} set aside`),e.skipped&&t.push(`${e.skipped} not checked`),t.join(", ")||"Nothing checked"}function N7(e){let t=n=>n&&typeof n=="object"?Object.entries(n).map(([o,r])=>`${o} ${r}`).join(", "):n==null?"":String(n);for(let n of[e.edit,e.copy,e.tweak]){if(!n||n.from==null&&n.to==null)continue;let o={from:t(n.from),to:t(n.to)};return n===e.tweak&&n.property&&typeof n.from!="object"&&typeof n.to!="object"&&(o.property=String(n.property)),o}return null}function _5(e){return String(e.note||e.comment||"").trim()||`${e.kind||"Note"} with no text`}function I7(e){return["before","after"].map(t=>e?.shots?.[t]).filter(t=>t&&typeof t.file=="string"&&/^(before|after)-\d+\.(png|jpg)$/.test(t.file))}function y5({endpoint:e,fresh:t=null}){let n=[],o=[],r=0,i=new Map,s="idle",a=!1,l=!1,d="",c=null,p=null,f=null,C=An(`
    [hidden]{display:none!important}
    .panel{position:fixed;z-index:${un.panel};font:400 13px/1.45 var(--sk-font)}
    .strip{display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100vw - 24px);padding:6px 6px 6px 12px;white-space:nowrap}
    .strip .say{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:500}
    .strip .say svg{flex:none;color:var(--sk-text-2)}
    button{font:inherit;cursor:pointer;border:0;border-radius:6px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
    button:focus-visible,textarea:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    button.primary{padding:6px 12px;font-size:13px}
    button.secondary{padding:6px 12px;font-size:13px;font-weight:500;background:transparent;color:var(--sk-text);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
    :host([data-sk-theme=light]) button.secondary{box-shadow:inset 0 0 0 1px rgba(0,0,0,.16)}
    button.secondary:hover{background:var(--sk-hover)}
    button.quiet{padding:6px 10px;font-size:13px;background:none;color:var(--sk-text-2)}button.quiet:hover{background:var(--sk-hover);color:var(--sk-text)}
    .iconbtn{width:32px;height:32px;padding:0;display:grid;place-items:center;color:var(--sk-text-2)}
    .iconbtn[disabled]{opacity:.35;cursor:default}
    .card{display:flex;flex-direction:column;max-height:calc(100dvh - 140px)}
    .card .top{display:flex;align-items:center;gap:2px;padding:6px 6px 0 14px}
    .card .count{margin-right:auto;font-size:12px;font-weight:500;color:var(--sk-text-2);font-variant-numeric:tabular-nums}
    .card .main{padding:6px 14px 12px;overflow-y:auto;min-height:0}
    .card .lbl{font-size:12px;color:var(--sk-text-2);margin:8px 0 2px}.card .lbl:first-child{margin-top:2px}
    .card .txt{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
    .card .ba{display:flex;align-items:center;gap:10px;margin:4px 0 10px;padding:8px 10px;border-radius:6px;background:var(--sk-raised);overflow-wrap:anywhere}
    .card .ba .from{color:var(--sk-text-2);text-decoration:line-through;text-decoration-thickness:1px}
    .card .ba .to{font-weight:600}.card .ba svg{flex:none;color:var(--sk-text-3)}.card .ba .prop{color:var(--sk-text-2)}
    .card .where{margin:10px 0 0;font-size:12px;color:var(--sk-text-2)}.card .where code{font:12px ui-monospace,SFMono-Regular,Menlo,monospace}
    .card .stamp{display:flex;align-items:center;gap:6px;margin:10px 0 0;font-size:12px;color:var(--sk-text)}
    .card .field{display:flex;align-items:flex-start;gap:4px;margin-top:10px}
    .card .field textarea{flex:1;min-height:44px;max-height:160px;resize:none;font-size:13px;line-height:1.45;padding:8px 10px}
    .card .err{margin:8px 0 0;font-size:12px;color:#ec8e8e}
    .card .stale{display:flex;align-items:center;gap:8px;margin:10px 0 0;padding:8px 8px 8px 10px;border-radius:6px;background:var(--sk-raised);font-size:12px}
    .card .stale span{flex:1;min-width:0}
    .card .shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:8px;margin:6px 0 0}
    .card .shot{position:relative;display:block;border-radius:6px;overflow:hidden;background:var(--sk-raised);text-decoration:none;color:inherit}
    .card .shot:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    .card .shot img{display:block;width:100%;height:auto;max-height:220px;object-fit:contain}
    .card .shotfig{margin:0;min-width:0}.card .shotfig .lbl{margin:0 0 4px}
    .card .shotnote{margin:6px 0 0;font-size:12px;color:var(--sk-text-2)}
    .card .foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--sk-hairline)}
    @media (max-width:600px),(pointer:coarse){
      button,.iconbtn{min-height:44px}.iconbtn{width:44px;height:44px}
      .card .foot{display:grid;grid-template-columns:1fr 1fr}
      .card .foot button{width:100%}
      .strip{padding:4px 4px 4px 12px}
    }
  `);C.host.dataset.checkUi="";let w=document.createElement("section");w.className="panel strip",w.hidden=!0,w.setAttribute("aria-label","Check the fix");let m=document.createElement("section");m.className="panel card",m.hidden=!0,m.setAttribute("role","dialog"),m.setAttribute("aria-label","Check the fix"),C.root.append(w,m);let S=Xn(document.createElement("div"));S.dataset.checkRing="",Object.assign(S.style,{position:"fixed",pointerEvents:"none",zIndex:String(un.marker),border:"2px solid #FF5436",borderRadius:"6px",background:"rgba(255,84,54,.08)",display:"none",boxSizing:"border-box"}),document.body.append(S);let g=()=>Ci({slots:["check-strip"],hosts:[C.host]}),y=Vn("check-strip",R=>{w.hidden=!R||g(),w.hidden||requestAnimationFrame(oe)});function E(){if(!y.visible)return;let R=g();w.hidden!==R&&(w.hidden=R,bn(),R||requestAnimationFrame(oe))}let A=0,Q=()=>{A||(A=requestAnimationFrame(()=>{A=0,E()}))};document.addEventListener("agentation-kit:slot",Q),document.addEventListener("agentation-kit:insets",Q),document.addEventListener("agentation-kit:tweak-change",Q),addEventListener("pointerup",()=>setTimeout(E,60),{passive:!0}),addEventListener("keyup",()=>setTimeout(E,30),{passive:!0}),setInterval(()=>{y.visible&&E()},300);let G=Vn("check",R=>{m.hidden=!R,R?requestAnimationFrame(()=>{Ze(),en()}):S.style.display="none"}),D=(R,re,ae)=>{let ve=document.createElement(R);return re&&(ve.className=re),ae!=null&&(ve.textContent=ae),ve},le=(R,re,ae,ve)=>{let Ge=D("button",R);return Ge.type="button",ve&&(Ge.innerHTML=xc(ve)),re&&Ge.append(document.createTextNode(re)),Ge.onclick=Xe=>{Xe.stopPropagation(),ae()},Ge},K=(R,re,ae)=>{let ve=le("iconbtn","",ae,R);return ve.title=re,ve.setAttribute("aria-label",re),ve},W=()=>window.__AGENTATION_KIT_AGENTATION_SESSION__,Y=()=>E7(n.filter(R=>ls(R)&&C7(R,b7(e))));async function he(){if(e){try{let R=await fetch(`${e}/sessions?author=all`);if(!R.ok)return;n=((await R.json()).sessions||[]).flatMap(re=>(re.annotations||[]).filter(ae=>ae.author!=="agent").map(ae=>({...ae,page:re.url,here:re.id===W()})))}catch{return}if(rt(),f&&s!=="card"){let R=f===!0?void 0:f;f=null,de(R)||de()}}}let Ce=0,Oe=()=>{clearTimeout(Ce),Ce=setTimeout(he,300)},Pe=()=>{try{return JSON.parse(localStorage.getItem(g5))||{}}catch{return{}}},je=R=>R.reduce((re,ae)=>Math.max(re,Number(ae.updatedAt)||0),0),$e=()=>c?.state==="complete";function rt(){if(s==="card")return;if(s==="done"){y.want(!0,{passive:!0}),Ve();return}let R=Y(),re=Pe(),ae=je(R)>(Number(re.at)||0)||$e()&&(Number(c.updatedAt)||1)>(Number(re.work)||0);if(!((R.length>0||$e())&&ae)){y.want(!1);return}w.replaceChildren();let Ge=D("span","say");Ge.innerHTML=xc("done"),Ge.append(document.createTextNode(R.length?T7(R):"Changes ready")),w.append(Ge);let Xe=R.length&&t?.olderThan(je(R));if(Xe){let it=le("primary",`Reload and check ${R.length}`,()=>gt(),"reopen");it.dataset.checkReload="",it.title=`This page loaded before the changes (${t.stale.map(Pt=>Pt.file).join(", ")})`,w.append(it)}else if(R.length){let it=le("primary",`Check ${R.length}`,()=>de(),"check");it.dataset.checkStart="",it.setAttribute("aria-label",`Check ${R.length} ${R.length===1?"change":"changes"}`),w.append(it)}$e()&&!Xe&&w.append(le("secondary","Reload page",()=>t?t.reload():location.reload())),w.append(K("close","Close",()=>{try{localStorage.setItem(g5,JSON.stringify({at:je(R),work:$e()?Number(c.updatedAt)||1:0}))}catch{}y.want(!1)})),y.want(!0,{passive:!0}),y.visible&&requestAnimationFrame(oe)}function Ve(){let R={"looks-right":0,"not-yet":0,agree:0,skipped:0};for(let ae of o){let ve=i.get(ae.id);ve?R[ve]++:R.skipped++}w.replaceChildren();let re=D("span","say");re.innerHTML=xc("tick"),re.append(document.createTextNode(M7(R))),re.setAttribute("role","status"),w.append(re,K("close","Close",()=>{s="idle",o=[],i=new Map,y.want(!1),rt()})),y.visible&&requestAnimationFrame(oe)}async function gt(R){let re=await(t?t.reload({then:"check",id:R}):(location.reload(),""));re&&(s==="card"?(d=re,Et(),Ze()):U(re))}function U(R){let re=w.querySelector(".say");if(!re)return;let ae=re.lastChild?.textContent;re.lastChild&&(re.lastChild.textContent=R),setTimeout(()=>{re.isConnected&&re.lastChild?.textContent===R&&(re.lastChild.textContent=ae)},5e3)}function oe(){w.hidden||(uo(w,Math.min(560,innerWidth-24)),w.style.width="max-content",uo(w,Math.min(w.getBoundingClientRect().width||400,innerWidth-24)))}function de(R){let re=Y();return re.length?(o=re,i=new Map,a=!1,d="",r=Math.max(0,R?o.findIndex(ae=>ae.id===R):0),s="card",y.want(!1),Et(),G.want(!0,{bump:!0}),requestAnimationFrame(()=>m.querySelector(".foot .primary")?.focus({preventScroll:!0})),!0):!1}function Re(){a=!1,d="",G.want(!1),S.style.display="none",p=null,s=o.length&&o.every(R=>i.has(R.id))?"done":"idle",s==="idle"&&(o=[],i=new Map),rt()}function ze(R){!o.length||l||(r=(r+R+o.length)%o.length,a=!1,d="",Et(),Ze(),en())}let Ke=()=>o[r];function Et(){let R=Ke();if(!R)return;let re=R.status==="dismissed",ae=i.get(R.id);m.replaceChildren();let ve=D("div","top"),Ge=D("span","count",`${r+1} of ${o.length}${re?", set aside":""}`);ve.append(Ge,K("prev","Previous change",()=>ze(-1)),K("next","Next change",()=>ze(1)),K("close","Close",Re)),o.length<2&&ve.querySelectorAll(".iconbtn").forEach((q,J)=>{J<2&&(q.disabled=!0)});let Xe=D("div","main"),it=N7(R),Pt=it&&(["edit","copy","tweak"].includes(R.kind)||/^Change to: /.test(_5(R)));if(Xe.append(D("p","lbl",R.playhead?`You asked, ${Wm(R.playhead)}`:"You asked")),Pt||Xe.append(D("p","txt",_5(R))),it){let q=D("div","ba");it.property&&q.append(D("span","prop",it.property)),q.append(D("span","from",it.from||"(empty)")),q.insertAdjacentHTML("beforeend",xc("arrow",14)),q.append(D("span","to",it.to||"(empty)")),q.setAttribute("aria-label",`${it.property?it.property+". ":""}Before: ${it.from}. After: ${it.to}.`),Xe.append(q)}Xe.append(D("p","lbl",re?"The agent set this aside":"The agent"),D("p","txt",R.resolution||(re?"Set aside without a reason.":"Marked done without a note.")));let Qe=I7(R);if(Qe.length){let q=D("div","shots");for(let qe of Qe){let me=`${e}/shots/${encodeURIComponent(R.id)}/${encodeURIComponent(qe.file)}`,Me=D("a","shot");Me.href=me,Me.target="_blank",Me.rel="noopener",Me.title="Open full size";let Ue=D("img");Ue.src=me,Ue.loading="lazy",Ue.decoding="async",Ue.alt=`${qe.kind==="before"?"Before":"After"} the change, as the agent saw it`,qe.width&&qe.height&&(Ue.width=qe.width,Ue.height=qe.height),Ue.onload=()=>Ze(),Me.append(Ue);let It=D("figure","shotfig");It.append(D("p","lbl",Qe.length>1?qe.kind==="before"?"Before":"After":qe.kind==="before"?"Before, as the agent saw it":"After, as the agent saw it"),Me),q.append(It)}let J=Qe.find(qe=>qe.viewport)?.viewport,ye=Qe.some(qe=>qe.found===!1),Ae=Qe.find(qe=>Number.isFinite(qe.time)&&!qe.untimed);Xe.append(q,D("p","shotnote",`A fresh load${J?` at ${J.width} \xD7 ${J.height}`:""}${Ae?`, stopped ${Wm({time:Ae.time})}`:""}${ye?". The agent could not find the element, so this is the whole screen":""}. Open it for full size.`))}if(R.here&&t?.olderThan(Number(R.updatedAt)||0)){let q=D("div","stale");q.dataset.checkStale="",q.append(D("span","","This page loaded before this change, so it may still show the old version.")),q.append(le("secondary","Reload",()=>gt(R.id))),Xe.append(q)}if(R.here)ht(R)||Xe.append(D("p","where","Not on the page right now, so there is nothing to outline. Check it where it shows."));else{let q=D("p","where","This change is on ");q.append(D("code","",Us(R.page))),q.append(document.createTextNode(".")),Xe.append(q)}if(ae){let q=D("p","stamp");q.innerHTML=xc(ae==="not-yet"?"reopen":"tick",14),q.append(document.createTextNode(ae==="looks-right"?"You said this looks right.":ae==="agree"?"You agreed to set it aside.":"Reopened for your next Send.")),Xe.append(q)}let bt=null;if(a){let q=D("div","field");bt=D("textarea"),bt.id="sk-check-reply",bt.rows=2,bt.placeholder=re?"Why it should be done":"What\u2019s still off?",bt.setAttribute("aria-label",re?"Why it should be done":"What\u2019s still off"),bt.oninput=()=>{bt.style.height="auto",bt.style.height=Math.min(160,bt.scrollHeight+2)+"px",Ze()},bt.onkeydown=J=>{J.key==="Enter"&&(J.metaKey||J.ctrlKey)&&(J.preventDefault(),lt(bt.value))},q.append(bt),Xe.append(q)}d&&Xe.append(D("p","err",d));let j=D("div","foot");if(a){j.append(le("quiet","Cancel",()=>{a=!1,d="",Et(),Ze()}));let q=le("primary","Reopen",()=>lt(bt.value),"reopen");q.dataset.checkReopen="",j.append(q)}else if(ae)j.append(le("primary","Next",()=>dn()));else{j.append(le("secondary",re?"Disagree, reopen":"Not yet",()=>{a=!0,d="",Et(),Ze(),m.querySelector("textarea")?.focus()}));let q=le("primary",re?"Agree":"Looks right",()=>Ft(re?"agree":"looks-right"),re?"":"tick");q.setAttribute("aria-keyshortcuts","Enter"),q.title=`${re?"Agree":"Looks right"} (Enter)`,j.append(q)}l&&j.querySelectorAll("button").forEach(q=>{q.disabled=!0}),m.append(ve,Xe,j),bt&&a&&queueMicrotask(()=>bt.focus())}function dn(){let R=o.findIndex((ae,ve)=>ve>r&&!i.has(ae.id)),re=R<0?o.findIndex(ae=>!i.has(ae.id)):R;if(re<0){Re();return}r=re,a=!1,Et(),Ze(),en(),m.querySelector(".foot .primary")?.focus({preventScroll:!0})}async function Ye(R,re){let ae;try{ae=await fetch(`${e}/annotations/${encodeURIComponent(R.id)}/verdict`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...re,..._n()?{reviewer:_n()}:{}})})}catch{throw new Error(so(0))}if(!ae.ok){let ve=await ae.json().catch(()=>({}));throw new Error(ae.status===409||ae.status===403||ae.status===422?ve.error?ve.error[0].toUpperCase()+ve.error.slice(1)+".":so(ae.status):so(ae.status))}return ae.json()}async function Rt(R,re){let ae=Ke();if(!(!ae||l)){l=!0,d="",Et();try{let ve=await Ye(ae,{verdict:R,...re?{message:re}:{}});i.set(ae.id,R);let Ge=n.findIndex(Xe=>Xe.id===ae.id);Ge>=0&&(n[Ge]={...n[Ge],...ve}),o[r]={...ae,...ve},a=!1,l=!1,R==="not-yet"&&window.__AGENTATION_KIT_REVIEW__?.refresh(!0),document.dispatchEvent(new CustomEvent("agentation-kit:check",{detail:{id:ae.id,verdict:R}})),dn()}catch(ve){l=!1,d=ve.message,Et(),Ze()}}}let Ft=R=>Rt(R);function lt(R){let re=String(R||"").trim();if(!re){d=Ke()?.status==="dismissed"?"Say why it should be done, so the agent knows.":"Say what\u2019s still off, so the agent knows what to change.",Et(),Ze(),m.querySelector("textarea")?.focus();return}Rt("not-yet",re)}function ht(R){if(!R?.here)return null;for(let re of[R.elementPath,R.selector,R.voice?.target?.selector])if(re)try{let ae=document.querySelector(re);if(ae&&!ae.closest("[data-feedback-toolbar],[data-agentation-root]"))return ae}catch{}return null}function Ze(){if(m.hidden)return;let R=innerWidth<600;uo(m,R?innerWidth-24:Math.min(400,innerWidth-24));let re=window.visualViewport;if(re&&re.height<innerHeight-80&&document.activeElement===C.host)m.style.bottom=Math.round(innerHeight-re.height-re.offsetTop+8)+"px";else if(R){let ae=Xs()?.getBoundingClientRect();ae?.width&&(m.style.bottom=Math.round(innerHeight-ae.top+6)+"px")}m.style.maxHeight=Math.round(R?innerHeight*.55:innerHeight-140)+"px",bn()}function qt(){if(!p?.isConnected||m.hidden){S.style.display="none";return}let R=p.getBoundingClientRect();if(!R.width&&!R.height){S.style.display="none";return}Object.assign(S.style,{display:"block",left:R.left-4+"px",top:R.top-4+"px",width:R.width+8+"px",height:R.height+8+"px"})}let Zt=0;function en(){let R=Ke(),re=++Zt;if(R?.here&&R.playhead&&Number.isFinite(R.playhead.time)&&rx(R.playhead.time).then(ae=>{if(!ae||re!==Zt||m.hidden||Ke()?.id!==R.id)return;let ve=!!p;p=ht(Ke()),!!p!==ve&&!a&&(Et(),Ze()),qt()}),p=ht(R),!p){qt();return}requestAnimationFrame(()=>requestAnimationFrame(()=>{p&&ri(p.getBoundingClientRect()),qt()}))}addEventListener("scroll",()=>{m.hidden||qt()},{capture:!0,passive:!0}),addEventListener("resize",()=>{m.hidden||(Ze(),qt()),w.hidden||oe()}),window.visualViewport?.addEventListener("resize",()=>{m.hidden||Ze()}),setInterval(()=>{m.hidden||qt()},400);let on=R=>R.composedPath().some(re=>re instanceof Element&&re.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]'));return addEventListener("keydown",R=>{if(!(m.hidden||R.metaKey||R.ctrlKey||R.altKey)){if(R.key==="Escape"){R.preventDefault(),R.stopPropagation(),a?(a=!1,d="",Et(),Ze(),m.querySelector(".foot .primary")?.focus()):Re();return}if(!on(R)){if(R.key==="ArrowLeft"||R.key==="ArrowRight"){R.preventDefault(),R.stopPropagation(),ze(R.key==="ArrowLeft"?-1:1);return}if(R.key==="Enter"&&!R.shiftKey){if(R.composedPath()[0]?.tagName==="BUTTON")return;let re=m.querySelector(".foot .primary");if(!re||re.disabled)return;R.preventDefault(),R.stopPropagation(),re.click()}}}},!0),document.addEventListener("agentation-kit:agent-work",R=>{let re=c?.state;c=R.detail,c?.state==="complete"&&re!=="complete"?he():s!=="card"&&rt()}),document.addEventListener("agentation-kit:round-done",()=>{s==="done"&&(s="idle",o=[],i=new Map),rt()}),document.addEventListener("agentation-kit:fresh",()=>{s==="card"?!a&&!l&&(Et(),Ze()):rt()}),document.addEventListener("agentation-kit:route",()=>{Oe(),m.hidden||(Et(),en())}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&he()}),setInterval(()=>{document.visibilityState==="visible"&&s!=="card"&&he()},3e4),c=window.__AGENTATION_KIT_AGENT_WORK_STATUS__||null,he(),{count:()=>Y().length,start:de,stop:Re,refresh:he,get state(){return s},resume(R){f=R||!0,he()},ingest(R){R?.id&&R.author!=="agent"&&R.status&&Oe()}}}var A7=4e3,L7=/^\/(__show-and-tell|__ag\/|@vite\/|@id\/|@react-refresh|@fs\/.*\/node_modules\/|node_modules\/|_next\/|__webpack|favicon\.ico$)/,x5="feedback-toolbar-fresh-closed",d0="agentation-kit:check-after-reload";function $7({perf:e=performance,loc:t=location,doc:n=document,cachedAt:o=new Map,entries:r=e.getEntriesByType("resource")}={}){let i=t.origin,s=e.timeOrigin,a=new Map,l=new Map,d=(p,f,C=!1)=>{let w;try{w=new URL(p,t.href)}catch{return}if(w.origin!==i)return;let m;try{m=decodeURIComponent(w.pathname)}catch{return}if(!C&&L7.test(m))return;let S=a.get(m);(!S||f>S.at)&&a.set(m,{path:m,at:Math.round(f),...C?{doc:!0}:{}}),C||(l.has(m)||l.set(m,new Set),l.get(m).add(w.href))},c=Date.parse(n.lastModified||"");d(t.href,Number.isFinite(c)&&c<s-1500?c:s,!0);for(let p of r){let f=p.transferSize===0&&p.decodedBodySize>0;d(p.name,f?o.get(p.name)??s:s+p.startTime)}return{loaded:[...a.values()],urls:l}}function R7(e,t,n=40){return e.filter(o=>o.transferSize===0&&o.decodedBodySize>0&&!t.has(o.name)).slice(0,n)}function O7(e){let t=n=>n.file.split("/").pop();return e.length?e.length===1?t(e[0]):e.length===2?`${t(e[0])} and ${t(e[1])}`:`${t(e[0])} and ${e.length-1} more`:""}function w5({win:e=window,doc:t=document}={}){let n=e.__AGENTATION_KIT_VOICE__;if(e.__AGENTATION_KIT_VOICE_RECORDING__||n?.recording)return"Stop and save the recording first: reloading ends it.";if(n&&(["transcribing","requesting"].includes(n.state)||n.hasAudio&&!n.draft?.passages?.length))return"Wait for the transcript first: the recording is only kept in this tab until then.";let o=Number(e.__AGENTATION_KIT_TWEAK__?.count)||0;if(o)return`Save or discard your ${o===1?"tweak":`${o} tweaks`} first: reloading loses ${o===1?"it":"them"}.`;for(let r of t.querySelectorAll("[data-feedback-toolbar]"))for(let i of[r,r.shadowRoot].filter(Boolean))for(let s of i.querySelectorAll("textarea"))if(s.value.trim())return"Send or clear what you are typing first: reloading loses it.";return""}function v5({endpoint:e}){let t=[],n=new Map,o=0,r=!1,i=!1,s="",a=new Map,l=new Set,d=new Map,c=Y=>{(!d.has(Y.name)||d.get(Y.name).startTime<=Y.startTime)&&d.set(Y.name,Y)};try{for(let Y of performance.getEntriesByType("resource"))c(Y);new PerformanceObserver(Y=>{for(let he of Y.getEntries())c(he)}).observe({type:"resource",buffered:!0})}catch{}let p=An(`
    [hidden]{display:none!important}
    .panel{position:fixed;z-index:${un.panel};font:400 13px/1.45 var(--sk-font)}
    .strip{display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100vw - 24px);padding:6px 6px 6px 12px;white-space:nowrap}
    .strip .say{display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:500}
    .strip .say span{overflow:hidden;text-overflow:ellipsis}
    .strip .say svg{flex:none;color:var(--sk-text-2)}
    button{font:inherit;cursor:pointer;border:0;border-radius:6px;min-height:32px;display:inline-flex;align-items:center;justify-content:center;gap:6px}
    button:focus-visible{outline:2px solid var(--sk-focus);outline-offset:2px}
    button.primary{padding:6px 12px;font-size:13px}
    .iconbtn{width:32px;height:32px;padding:0;display:grid;place-items:center;color:var(--sk-text-2);background:none}
    .iconbtn:hover{background:var(--sk-hover);color:var(--sk-text)}
    @media (max-width:600px),(pointer:coarse){button,.iconbtn{min-height:44px}.iconbtn{width:44px;height:44px}.strip{padding:4px 4px 4px 12px}}
  `);p.host.dataset.freshUi="";let f=document.createElement("section");f.className="panel strip",f.hidden=!0,f.setAttribute("aria-label","This page is out of date"),p.root.append(f);let C=Y=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${Y}</svg>`,w=C('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),m=C('<path d="M6 6l12 12M18 6L6 18"/>'),S=()=>Ci({slots:["fresh"],hosts:[p.host]}),g=Vn("fresh",Y=>{f.hidden=!Y||S(),f.hidden||requestAnimationFrame(y),bn()}),y=()=>{f.hidden||(f.style.width="max-content",uo(f,Math.min(f.getBoundingClientRect().width||400,innerWidth-24)))};function E(){if(!g.visible)return;let Y=S();f.hidden!==Y&&(f.hidden=Y,bn(),Y||requestAnimationFrame(y))}setInterval(E,300),document.addEventListener("agentation-kit:insets",()=>requestAnimationFrame(E)),addEventListener("pointerup",()=>setTimeout(E,60),{passive:!0}),addEventListener("keyup",()=>setTimeout(E,30),{passive:!0});let A=()=>t.reduce((Y,he)=>Math.max(Y,he.changedAt),0),Q=()=>{try{return Number(sessionStorage.getItem(x5))||0}catch{return 0}},G=()=>(window.__AGENTATION_KIT_CHECK__?.count?.()||0)>0||window.__AGENTATION_KIT_CHECK__?.state==="card";function D(){if(!(t.length>0&&A()>Q()&&!G())){g.wants&&g.want(!1);return}f.replaceChildren();let he=document.createElement("span");he.className="say",he.setAttribute("role","status"),he.innerHTML=w;let Ce=document.createElement("span");Ce.textContent=s||`${O7(t)} changed${innerWidth<600?"":" since this page loaded"}`,he.title=t.map(je=>je.file).join(`
`),he.append(Ce);let Oe=document.createElement("button");Oe.type="button",Oe.className="primary",Oe.textContent="Reload",Oe.dataset.freshReload="",Oe.onclick=je=>{je.stopPropagation(),W()};let Pe=document.createElement("button");Pe.type="button",Pe.className="iconbtn",Pe.innerHTML=m,Pe.title="Hide until something else changes",Pe.setAttribute("aria-label","Hide until something else changes"),Pe.onclick=je=>{je.stopPropagation();try{sessionStorage.setItem(x5,String(A()))}catch{}s="",g.want(!1)},f.append(he,Oe,Pe),g.wants?requestAnimationFrame(y):g.want(!0,{passive:!0})}async function le(){for(let Y of R7([...d.values()],l)){l.add(Y.name);try{if(new URL(Y.name).origin!==location.origin)continue;let he=await fetch(Y.name,{cache:"only-if-cached",mode:"same-origin"}),Ce=Date.parse(he.headers.get("last-modified")||"");Number.isFinite(Ce)&&a.set(Y.name,Ce)}catch{}}}async function K(){if(!(i||r||!e||document.visibilityState!=="visible")){r=!0;try{await le();let Y=$7({cachedAt:a,entries:[...d.values()]});n=Y.urls;let he=await fetch(`${e}/freshness`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({loaded:Y.loaded})});if(he.status===404||he.status===405){i=!0;return}if(!he.ok)return;let Ce=(await he.json()).stale||[],Oe=Ce.length!==t.length||Ce.some((Pe,je)=>Pe.file!==t[je]?.file||Pe.changedAt!==t[je]?.changedAt);t=Ce,Oe&&document.dispatchEvent(new CustomEvent("agentation-kit:fresh",{detail:{stale:t}})),D()}catch{}finally{r=!1}}}async function W({then:Y,id:he}={}){let Ce=w5();if(Ce)return s=Ce,D(),setTimeout(()=>{s===Ce&&(s="",D())},5e3),Ce;let Oe=[];for(let je of t)for(let $e of n.get(je.path)||[])Oe.push(fetch($e,{cache:"reload",credentials:"same-origin"}).catch(()=>{}));await Promise.race([Promise.allSettled(Oe),new Promise(je=>setTimeout(je,3e3))]);let Pe=w5();if(Pe)return s=Pe,D(),setTimeout(()=>{s===Pe&&(s="",D())},5e3),Pe;try{Y&&sessionStorage.setItem(d0,JSON.stringify({then:Y,id:he||null,at:Date.now()}))}catch{}return location.reload(),""}o=setInterval(K,A7),document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&K()}),addEventListener("focus",()=>K());for(let Y of["agentation-kit:check","agentation-kit:slot"])document.addEventListener(Y,()=>{t.length&&D()});return addEventListener("resize",()=>{f.hidden||y()}),setTimeout(K,1500),{get stale(){return t},olderThan(Y){return Y?t.some(he=>he.at<Y):t.length>0},check:K,reload:W,stop(){clearInterval(o),i=!0,g.want(!1)}}}function b5(){try{let e=sessionStorage.getItem(d0);if(!e)return null;sessionStorage.removeItem(d0);let t=JSON.parse(e);return t&&Date.now()-(Number(t.at)||0)<6e4?t:null}catch{return null}}var p0=[{key:"font-size",group:"Type",label:"Size",kind:"length",scale:"type",longhands:["font-size"]},{key:"font-weight",group:"Type",label:"Weight",kind:"number",scale:"weight",longhands:["font-weight"]},{key:"padding",group:"Spacing",label:"Padding",kind:"length",scale:"space",longhands:["padding-top","padding-right","padding-bottom","padding-left"]},{key:"gap",group:"Spacing",label:"Gap",kind:"length",scale:"space",longhands:["row-gap","column-gap"]},{key:"background-color",group:"Colour",label:"Fill",kind:"colour",scale:"colour",longhands:["background-color"]},{key:"color",group:"Colour",label:"Text",kind:"colour",scale:"colour",longhands:["color"]},{key:"border-radius",group:"Corners",label:"Radius",kind:"length",scale:"radius",longhands:["border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius"]}],xi=e=>p0.find(t=>t.key===e),P7=/^--(sk-|agentation|feedback-)/,D7=/^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i,z7=/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,F7=new Set(["black","white","red","green","blue","gray","grey","orange","yellow","purple","pink","navy","teal","silver","maroon","olive","lime","aqua","fuchsia","currentcolor"]),B7=/^-?(?:\d+\.?\d*|\.\d+)(px|rem|em|ch|ex|vw|vh|vmin|vmax|svh|dvh|lh|pt|pc|cm|mm|in|q|%)$/i,W7=/^-?(?:\d+\.?\d*|\.\d+)$/,H7=/^(?:calc|clamp|min|max)\(/i;function u0(e,t=()=>null,{isColour:n}={},o=0){let r=String(e??"").trim();if(!r||o>8)return null;let i=/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(r);if(i){let s=t(i[1]);return s!=null?u0(s,t,{isColour:n},o+1):i[2]?u0(i[2],t,{isColour:n},o+1):null}return z7.test(r)||D7.test(r)||F7.has(r.toLowerCase())?"colour":r==="0"||B7.test(r)?"length":W7.test(r)?"number":H7.test(r)?/\d(px|rem|em|vw|vh|%)/i.test(r)||/var\(/.test(r)?"length":null:n?.(r)?"colour":null}function k5(e,t={}){let n=new Map;for(let i of e||[]){let s=/(^|,)\s*(:root|html)\s*(,|$)/i.test(i.selector||"");for(let[a,l]of i.props||[]){if(!a.startsWith("--")||P7.test(a))continue;let d=n.get(a);d&&d.root&&!s||n.set(a,{value:String(l).trim(),selector:i.selector,root:s})}}let o=i=>n.get(i)?.value??null,r=[];for(let[i,s]of n){let a=u0(s.value,o,t);a&&r.push({name:i,value:s.value,selector:s.selector,kind:a})}return r}function S5(e){let t={length:[],colour:[],number:[]};for(let n of e||[])t[n.kind]?.push(n);return t}var j7={type:{yes:/(^|-)(font|text|fs|type|size-text|heading|body)(-|$)|font-?size/i,no:/weight|line|leading|tracking|letter|family/i},space:{yes:/(^|-)(space|spacing|gap|pad|padding|gutter|inset|sp|size|s)(-|$)|spacing|space/i,no:/radius|round|corner|font|text|weight|line|leading|shadow|border|width|height|max|min|container|breakpoint|bp|screen|duration|delay|z-?index|blur|opacity|icon/i},radius:{yes:/radius|round|corner|rounded/i,no:/^$/},weight:{yes:/weight|(^|-)fw(-|$)/i,no:/^$/}};function C5(e,t,n=()=>null){let o=e==="colour"?t.colour:e==="weight"?t.number:t.length,r=j7[e],i=(o||[]).filter(l=>!r||r.yes.test(l.name.slice(2))&&!r.no.test(l.name.slice(2))),s=[];for(let l of i){let d=n(l);d==null||typeof d=="number"&&!Number.isFinite(d)||e==="weight"&&!(d>=1&&d<=1e3)||s.push({token:l.name,value:e==="colour"?String(d):d,raw:l.value})}e!=="colour"?s.sort((l,d)=>l.value-d.value||l.token.localeCompare(d.token,void 0,{numeric:!0})):s.sort((l,d)=>l.token.localeCompare(d.token,void 0,{numeric:!0}));let a=new Set;return s.filter(l=>{let d=String(l.value);return a.has(d)?!1:(a.add(d),!0)})}function E5(e,{max:t=10,numeric:n=!0}={}){let o=[...e||new Map].filter(([r])=>r!==""&&r!=null).sort((r,i)=>i[1]-r[1]).slice(0,t).map(([r])=>r);return n?o.map(Number).filter(Number.isFinite).sort((r,i)=>r-i).map(r=>({token:null,value:r})):o.map(r=>({token:null,value:String(r)}))}function T5(e,t=16){let n=String(e??"").trim().toLowerCase();if(n==="0"||n==="none"||n==="normal")return 0;let o=/^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em)?$/.exec(n);if(!o)return NaN;let r=parseFloat(o[1]);return o[2]==="rem"||o[2]==="em"?r*t:r}var U7=.5;function rp(e,t){if(e==null)return null;if(typeof e=="number")return(t||[]).find(o=>typeof o.value=="number"&&Math.abs(o.value-e)<U7)||null;let n=hr(e);return(t||[]).find(o=>hr(o.value)===n)||null}function hr(e){return String(e??"").trim().toLowerCase().replace(/\s+/g,"").replace(/^rgba\(([^,]+),([^,]+),([^,]+),1\)$/,"rgb($1,$2,$3)")}var qa=e=>{let t=hr(e);return!t||t==="transparent"||/^rgba\([^)]*,0\)$/.test(t)};function M5(e){if(qa(e))return"none";let t=null,n=1,o=/^rgba?\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)(?:,\s*([\d.]+))?\)$/i.exec(String(e??"").trim());o&&(t=[o[1],o[2],o[3]].map(Number),o[4]!=null&&(n=Number(o[4])));let r=/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(e??"").trim());if(r){let d=r[1].length===3?[...r[1]].map(c=>c+c).join(""):r[1];t=[0,2,4].map(c=>parseInt(d.slice(c,c+2),16))}if(!t)return"";let i=t.map(d=>d*n+26*(1-n)),s=d=>(d/=255,d<=.03928?d/12.92:((d+.055)/1.055)**2.4),a=.2126*s(i[0])+.7152*s(i[1])+.0722*s(i[2]),l=s(26);return(Math.max(a,l)+.05)/(Math.min(a,l)+.05)<1.8?"dark":""}function N5(e){let t=/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(String(e??"").trim());return t?"#"+[t[1],t[2],t[3]].map(o=>Number(o).toString(16).padStart(2,"0")).join("")+(t[4]!=null&&Number(t[4])<1?Math.round(Number(t[4])*255).toString(16).padStart(2,"0"):""):String(e??"")}function wc(e){if(qa(e))return"None";let t=/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/i.exec(String(e??"").trim());if(!t)return String(e??"");let n="#"+[t[1],t[2],t[3]].map(r=>Number(r).toString(16).padStart(2,"0")).join(""),o=t[4]==null?1:Number(t[4]);return o<1?`${n} \xB7 ${Math.round(o*100)}%`:n}var q7=e=>`${Math.round(e*100)/100}px`;function I5(e){let[t,n,o,r]=e.map(i=>typeof i=="number"?q7(i):String(i));return t===n&&n===o&&o===r?t:t===o&&n===r?`${t} ${n}`:n===r?`${t} ${n} ${o}`:`${t} ${n} ${o} ${r}`}var K7={100:"thin",200:"extra light",300:"light",400:"regular",500:"medium",600:"semibold",700:"bold",800:"extra bold",900:"black"},f0=e=>K7[Math.round(Number(e)/100)*100]||String(e),Ka=e=>String(e||"").replace(/^--/,"");function A5(e){let t=String(e||"").replace(/:where\([^)]*\)/g,"").replace(/::?[\w-]+(\([^)]*\))?/g,i=>i.startsWith("::")?" t ":/^:(not|is|has)\(/.test(i)?i.slice(i.indexOf("(")+1,-1):" .c "),n=(t.match(/#[\w-]+/g)||[]).length,o=(t.match(/\.[\w-]+|\[[^\]]*\]/g)||[]).length,r=(t.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]/g," ").match(/(^|[\s>+~(,])[a-z][\w-]*/gi)||[]).length;return[n,o,r]}var h0=(e,t)=>e[0]-t[0]||e[1]-t[1]||e[2]-t[2];function Y7(e){return e?[e.href,e.selector].filter(Boolean).join(" "):""}function L5(e={}){let t=e.token?` (${e.token})`:e.onScale?" (a value the page already uses)":e.to!=null?" (off scale)":"",n=Y7(e.ruleSource);return`${e.selector||"element"} ${e.property||"?"} ${e.from??""} \u2192 ${e.to??""}${t}${n?`, rule in ${n}`:""}`}var m0="ui-monospace,SFMono-Regular,Menlo,monospace",D5={close:'<path d="M6 6l12 12M18 6L6 18"/>',reset:'<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1.6-7.3L4 10"/>',undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',down:'<path d="M6 9l6 6 6-6"/>',check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'},ip=(e,t=16)=>`<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${D5[e]}</svg>`,y0="[data-feedback-toolbar],[data-agentation-root],[data-agentation-toolbar],#agentation-root,.sk-edit-ui",V7=e=>String(e||"").replace(/\s+/g," ").trim(),vc=e=>Math.round(e*100)/100,wi=e=>`${vc(e)}px`,$5=e=>String(vc(e)),Qr=()=>innerWidth<600||matchMedia("(pointer:coarse)").matches&&innerWidth<640,G7=new Set(["font-size","font-weight","color"]),g0={"font-size":["font-size","font"],"font-weight":["font-weight","font"],padding:["padding","padding-top","padding-right","padding-bottom","padding-left","padding-block","padding-inline","padding-block-start","padding-block-end","padding-inline-start","padding-inline-end"],gap:["gap","row-gap","column-gap","grid-gap"],"background-color":["background-color","background"],color:["color"],"border-radius":["border-radius","border-top-left-radius","border-top-right-radius","border-bottom-right-radius","border-bottom-left-radius"]},X7=/:(hover|focus|focus-visible|focus-within|active)\b/;function Ya(e){if(!e||e.nodeType!==1)return"";if(e.id)return"#"+e.id;let t=[...e.classList].find(n=>n&&!n.startsWith("sk-"));return e.tagName.toLowerCase()+(t?"."+t:"")}function Q7(e){let t=[];for(let n=e,o=0;n&&n.nodeType===1&&o<4&&!(n.tagName==="BODY"||n.tagName==="HTML"||(t.unshift(Ya(n)),n.id));o++,n=n.parentElement);return t.join(" > ")}function _0(e){let t=V7(e.getAttribute?.("aria-label")||e.innerText||e.textContent||e.getAttribute?.("alt")||"");return t.length>44?t.slice(0,43)+"\u2026":t}function J7(){let e=[],t=(n,o)=>{for(let r of n)if(r.selectorText!=null&&r.style)e.push({selector:r.selectorText,style:r.style,sheet:o});else if(r.cssRules){if(r.media&&r.conditionText!=null&&r.constructor?.name==="CSSMediaRule"&&!matchMedia(r.conditionText).matches||r.constructor?.name==="CSSSupportsRule"&&!CSS.supports(r.conditionText))continue;t(r.cssRules,o)}};for(let n of document.styleSheets){let o=n.ownerNode;if(o&&((o.id||"").startsWith("feedback-tool-styles")||o.hasAttribute?.("data-agentation-kit-insets")||o.closest?.(y0)))continue;let r;try{r=n.cssRules}catch{continue}r&&t(r,n)}return e}function Z7(e){let t=[];for(let n=0;n<e.length;n++){let o=e[n];o.startsWith("--")&&t.push([o,e.getPropertyValue(o)])}return t}function e9(e){if(e?.href)try{let t=new URL(e.href);return(t.origin===location.origin?t.pathname.replace(/^\//,""):t.href)||t.href}catch{return e.href}return`<style> on ${location.pathname}`}function t9(){let e=Xn(document.createElement("div"));e.setAttribute("aria-hidden","true"),e.style.cssText="position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none;",document.body.append(e);let t=getComputedStyle(document.documentElement),n=i=>t.getPropertyValue(i.name).trim()||i.value,o=i=>{if(!CSS.supports("width",i))return null;e.style.width=i;let s=getComputedStyle(e).width;return e.style.width="",s.endsWith("px")?vc(parseFloat(s)):null},r=i=>{if(!CSS.supports("color",i))return null;e.style.color=i;let s=getComputedStyle(e).color;return e.style.color="",hr(s)};return{length:i=>o(n(i)),colour:i=>r(n(i)),number:i=>{let s=parseFloat(n(i));return Number.isFinite(s)?s:null},freeLength:o,freeColour:r,colourVia:(i,s,a)=>{if(!CSS.supports(i,s))return null;e.style.setProperty(i,s);let l=getComputedStyle(e).getPropertyValue(a);return e.style.removeProperty(i),l?hr(l):null},done:()=>e.remove()}}function n9(){let e={type:new Map,space:new Map,radius:new Map,weight:new Map,colour:new Map},t=(r,i)=>r.set(i,(r.get(i)||0)+1),n=r=>Math.round(r*2)/2,o=0;for(let r of document.body.querySelectorAll("*")){if(++o>2500)break;if(r.closest(y0)||/^(SCRIPT|STYLE|LINK|META|TEMPLATE|NOSCRIPT)$/.test(r.tagName)||!r.getClientRects().length)continue;let i=getComputedStyle(r);t(e.type,n(parseFloat(i.fontSize))),t(e.weight,Number(i.fontWeight));for(let a of["paddingTop","paddingRight","paddingBottom","paddingLeft"]){let l=n(parseFloat(i[a]));l&&t(e.space,l)}if(/flex|grid/.test(i.display))for(let a of["rowGap","columnGap"]){let l=n(parseFloat(i[a]));l&&t(e.space,l)}let s=n(parseFloat(i.borderTopLeftRadius));s&&t(e.radius,s),t(e.colour,hr(i.color)),qa(i.backgroundColor)||t(e.colour,hr(i.backgroundColor))}return e}function R5(){let e=J7(),t=k5(e.map(s=>({selector:s.selector,props:Z7(s.style)})).filter(s=>s.props.length),{isColour:s=>CSS.supports("color",s)}),n=S5(t),o=t9(),r=null,i={rules:e,res:o};for(let s of["type","space","radius","weight","colour"]){let a=C5(s,n,s==="colour"?o.colour:s==="weight"?o.number:o.length),l="tokens";if(a.length||(r||(r=n9()),a=E5(r[s],{numeric:s!=="colour",max:s==="colour"?12:10}),l="page"),(s==="space"||s==="radius")&&!a.some(d=>d.value===0)&&a.unshift({token:null,value:0,label:"none"}),s==="weight")for(let d of a)d.label||(d.label=f0(d.value));i[s]={list:a,source:l}}return i}function o9(e,t){let n=getComputedStyle(e),o=r=>{let i=parseFloat(r);return Number.isFinite(i)?vc(i):0};switch(t.key){case"font-size":return[o(n.fontSize)];case"font-weight":return[Number(n.fontWeight)||400];case"padding":return[o(n.paddingTop),o(n.paddingRight),o(n.paddingBottom),o(n.paddingLeft)];case"gap":return[o(n.rowGap),o(n.columnGap)];case"background-color":return[hr(n.backgroundColor)];case"color":return[hr(n.color)];case"border-radius":return[o(n.borderTopLeftRadius),o(n.borderTopRightRadius),o(n.borderBottomRightRadius),o(n.borderBottomLeftRadius)]}return[]}function sp(e,t){return e.key==="padding"?[{part:"v",label:"top and bottom",value:t[0]},{part:"h",label:"left and right",value:t[1]}]:[{part:"all",label:"",value:t[0]}]}function r9(e,t,n,o){return e.key==="padding"?n==="v"?[o,t[1],o,t[3]]:[t[0],o,t[2],o]:e.key==="gap"?[o,o]:e.key==="border-radius"?[o,o,o,o]:[o]}function O5(e,t){return e.kind==="colour"?N5(t[0]):e.key==="font-weight"?String(t[0]):e.key==="font-size"?wi(t[0]):e.key==="gap"?t[0]===t[1]?wi(t[0]):`${wi(t[0])} ${wi(t[1])}`:I5(t)}function P5(e,t){if(e.key==="gap")return t[0]===t[1]?[t[0]]:t;if(t.length===4){let[n,o,r,i]=t;return n===o&&o===r&&r===i?[n]:n===r&&o===i?[n,o]:o===i?[n,o,r]:t}return t}var i9=(e,t)=>e.length===t.length&&e.every((n,o)=>typeof n=="number"?Math.abs(n-t[o])<.01:hr(n)===hr(t[o]));function z5({endpoint:e,sessionId:t}){let n=!1,o=null,r=null,i=null,s=null,a="strip",l=!1,d="",c=0,p=new WeakMap,f=0,C=T=>(p.has(T)||p.set(T,++f),p.get(T)),w=new Map,m=[],S=new Map,g=An(`
    [hidden]{display:none!important}
    .mono{font-family:${m0};font-size:12px}
    .hl{position:fixed;z-index:${un.marker};pointer-events:none;border-radius:4px;box-shadow:0 0 0 2px var(--sk-accent);transition:none}
    .hl.sel{box-shadow:0 0 0 2px var(--sk-accent),0 0 0 5px color-mix(in srgb,var(--sk-accent) 22%,transparent)}
    .lbl{position:fixed;z-index:${un.marker};pointer-events:none;display:flex;gap:7px;align-items:baseline;max-width:min(360px,calc(100vw - 24px));padding:3px 8px;border-radius:4px;background:#1D1A2F;color:rgba(255,255,255,.88);font:500 12px/1.45 var(--sk-font);white-space:nowrap;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.25)}
    .lbl .mono{color:rgba(255,255,255,.55);flex:none}.lbl .w{overflow:hidden;text-overflow:ellipsis}
    .panel{font-size:12.5px}
    .tw{width:300px;display:flex;flex-direction:column}.tw.glide{transition:left .2s ease,top .2s ease}
    .tw .hd{gap:8px;padding:8px 6px 8px 12px;font-weight:500}.tw .hd .mono{color:var(--sk-text-2);flex:none}
    .tw .hd .w{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
    .iconbtn{display:grid;place-items:center;width:28px;height:28px;padding:0;flex:none}
    .tw .body{overflow:auto;padding:2px 10px 10px;scrollbar-width:thin;flex:1;min-height:0}
    .grp{margin:10px 0 4px;font-size:12px;font-weight:600;color:var(--sk-text-2)}
    .prop{display:grid;grid-template-columns:62px minmax(0,1fr) 28px;align-items:center;gap:6px;min-height:38px}
    .prop .name{font-size:12.5px;line-height:1.25}.prop .chg{display:block;font-size:12px;color:var(--sk-text-3)}
    .field{display:flex;align-items:center;gap:8px;min-width:0;min-height:32px;padding:4px 8px;border:0;border-radius:6px;background:var(--sk-raised);box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text);font:inherit;font-size:12.5px;text-align:left;cursor:pointer}
    .field:hover{background:var(--sk-hover)}.field[aria-expanded=true]{box-shadow:inset 0 0 0 1px var(--sk-accent)}
    .field:focus-visible,.opt:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--sk-focus);outline-offset:1px}
    .tok{flex:1;min-width:0;overflow:hidden;line-height:1.3;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}
    .tok.on{font-family:${m0};font-size:12px;color:#FF9C87}:host([data-sk-theme=light]) .tok.on{color:var(--sk-accent)}
    .tok.off{color:var(--sk-text-3)}
    .val{color:var(--sk-text-2);font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
    .field svg{flex:none;color:var(--sk-text-3)}
    .sw{width:14px;height:14px;border-radius:3px;flex:none;box-shadow:inset 0 0 0 1px rgba(128,128,128,.45)}
    /* No fill is a slash, not a dark square; a dark colour gets a light ring on the dark panel (UX review 5, #16). */
    .sw.none{background:linear-gradient(to top right,transparent calc(50% - .75px),var(--sk-text-2) calc(50% - .75px),var(--sk-text-2) calc(50% + .75px),transparent calc(50% + .75px))}
    :host(:not([data-sk-theme=light])) .sw.dark{box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
    .ft{display:flex;align-items:center;gap:6px;padding:8px 12px;border-top:1px solid var(--sk-hairline);font-size:12px;color:var(--sk-text-2)}
    .ft.acts{justify-content:flex-end;padding:8px}.ft.acts .n{margin-right:auto;padding-left:4px;color:var(--sk-text)}
    .ft svg{flex:none}
    button.ghost,button.primary{font-size:12.5px;min-height:32px;padding:5px 12px}
    button.ghost.ring{box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text)}
    .strip{display:flex;align-items:center;gap:4px;padding:5px 5px 5px 12px;width:max-content;white-space:nowrap}
    .strip .n{margin-right:6px;font-weight:500}.strip .hint{color:var(--sk-text-2);padding-right:7px}
    .err{padding:8px 12px;color:#df8989;font-size:12px;overflow-wrap:anywhere}
    .pick{position:fixed;z-index:${un.panel};width:240px;display:flex;flex-direction:column;padding:6px;font-size:12.5px}
    .pick .ph{padding:2px 6px 6px;font-size:12px;font-weight:600;color:var(--sk-text-2)}.pick .ph.note{font-weight:400;padding-top:0}
    .pick .seg{display:flex;gap:2px;margin:0 0 6px;padding:2px;border-radius:6px;background:var(--sk-raised)}
    .pick .seg button{flex:1;border:0;border-radius:4px;background:none;color:var(--sk-text-2);font:inherit;font-size:12px;min-height:28px;cursor:pointer}
    .pick .seg button[aria-pressed=true]{background:var(--sk-hover);color:var(--sk-text)}
    .pick .opts{overflow:auto;min-height:0;scrollbar-width:thin}
    /* The list scrolls, so it clips: a ring drawn outside an option lost its
       top and sides and read as a bar down one side. Inset, it shows whole. */
    .pick .opt:focus-visible{outline-offset:-2px}
    .opt{display:flex;align-items:center;gap:8px;width:100%;min-height:32px;padding:5px 8px;border:0;border-radius:5px;background:none;color:var(--sk-text);font:inherit;text-align:left;cursor:pointer}
    .opt:hover,.opt.cur{background:var(--sk-hover)}.opt .ck{width:14px;flex:none;visibility:hidden}.opt[aria-selected=true] .ck{visibility:visible}
    .opt .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.opt .nm.mono{font-size:12px}
    .pick hr{border:0;border-top:1px solid var(--sk-hairline);margin:5px 2px}
    .was{display:flex;justify-content:space-between;gap:8px;color:var(--sk-text-2)}
    .free{display:flex;gap:6px;align-items:center;padding:4px 2px 0}
    .free input{flex:1;min-width:0;min-height:30px;padding:4px 8px;border:0;border-radius:5px;background:var(--sk-raised);box-shadow:inset 0 0 0 1px var(--sk-hairline);color:var(--sk-text);font:12px/1.3 ${m0}}
    .free .ghost{min-height:30px;padding:4px 9px}
    .rv{width:340px;display:flex;flex-direction:column}.rv .body{overflow:auto;padding:8px 10px;flex:1;min-height:0}
    .rv .el{display:flex;gap:8px;align-items:baseline;margin:6px 2px 6px;min-width:0}.rv .el:first-child{margin-top:0}
    .rv .el button{border:0;background:none;padding:0;color:var(--sk-text);font:inherit;font-weight:500;cursor:pointer;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
    .rv .el .mono{color:var(--sk-text-2);flex:none}
    .tk{display:grid;grid-template-columns:minmax(0,1fr) 28px;gap:2px 6px;align-items:center;margin:0 0 6px;padding:8px 6px 8px 10px;border-radius:6px;background:var(--sk-raised)}
    .tk .ln{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;min-width:0}
    .tk .ln .mono{color:var(--sk-text-2)}.tk .to{font-weight:600}.tk .from{color:var(--sk-text-2)}
    .tk .sub{grid-column:1/-1;font-size:12px;color:var(--sk-text-2);overflow-wrap:anywhere}
    .tk .sub .mono{font-size:12px}
    @media (pointer:coarse){
      .field,.opt,.pick .seg button,.free input,.free .ghost,button.ghost,button.primary{min-height:44px}
      .iconbtn{width:44px;height:44px}.prop{grid-template-columns:62px minmax(0,1fr) 44px;min-height:48px}
      .tk{grid-template-columns:minmax(0,1fr) 44px}
    }
  `),{root:y}=g,E=document.createElement("div");E.className="hl",E.hidden=!0;let A=document.createElement("div");A.className="hl sel",A.hidden=!0;let Q=document.createElement("div");Q.className="lbl",Q.hidden=!0;let G=document.createElement("section");G.className="panel tw",G.hidden=!0,G.setAttribute("role","dialog");let D=document.createElement("section");D.className="panel",D.hidden=!0,D.setAttribute("aria-label","Tweaks");let le=document.createElement("div");le.className="panel pick",le.hidden=!0,le.setAttribute("role","dialog"),y.append(E,A,Q,G,D,le),y.addEventListener("keydown",T=>{T.composedPath()[0]?.matches?.("input")&&T.stopPropagation()});function K(T){let L=S.get(T);if(!L){let z=document.createElement("div"),Z=T.getAttribute("style");Z!=null&&z.setAttribute("style",Z),L={attr:Z,orig:z,painted:new Map},S.set(T,L)}return L}function W(T,L){let z=S.get(T);if(z){for(let Z of L)z.painted.delete(Z);z.attr==null?T.removeAttribute("style"):T.setAttribute("style",z.attr);for(let[Z,te]of z.painted)T.style.setProperty(Z,te,"important");z.painted.size||S.delete(T)}}function Y(T){let L=xi(T.property),z=L.kind==="colour"?T.toVals:T.toVals.map(te=>L.key==="font-weight"?String(te):wi(te)),Z=K(T.el);L.longhands.forEach((te,Ne)=>{let h=z[Math.min(Ne,z.length-1)];Z.painted.set(te,h),T.el.style.setProperty(te,h,"important")})}function he(T,L){W(T,L.longhands)}function Ce(){for(let T of[...S.keys()])W(T,[...S.get(T).painted.keys()])}let Oe=(T,L)=>`${C(T)}|${L}`,Pe=(T,L=i)=>L?.[T.scale]||{list:[],source:"page"};function je(T,L,z=i){let Z=Pe(T,z),te=P5(T,L).map(h=>rp(h,Z.list)),Ne=te.map(h=>h?.token||null);return{token:Ne.some(Boolean)?Ne.map(h=>h||"off scale").join(" \xB7 "):null,onScale:te.every(Boolean),source:Z.source,hits:te}}function $e(T,L,z){let Z=null,te=null;for(let Ne of T){let h=z.find(O=>Ne.style.getPropertyValue(O));if(!h)continue;let I=Ne.style.getPropertyValue(h);for(let O of Ne.selector.split(/,(?![^(]*\))/)){let ee=O.trim();if(!ee)continue;let se=!1;try{se=L.matches(ee)}catch{}if(!se)continue;let ce={sp:A5(ee),selector:ee,sheet:Ne.sheet,name:h,value:I,transient:X7.test(ee)};(!Z||h0(ce.sp,Z.sp)>=0)&&(Z=ce),!ce.transient&&(!te||h0(ce.sp,te.sp)>=0)&&(te=ce)}}return{any:Z,rest:te}}function rt(T,L){let z=o9(T,L);if(L.kind!=="colour"||!i)return z;let Z=!1;try{Z=T.matches(":hover,:active,:focus")}catch{}if(!Z)return z;let{any:te,rest:Ne}=$e(i.rules,T,g0[L.key]);if(!te?.transient||!Ne)return z;let h=i.res.colourVia(Ne.name,Ne.value,L.longhands[0]);return h?[h]:z}function Ve(T,L){let z=S.get(T),Z=L.longhands.some(se=>z?.painted.has(se)),te=se=>z?z.orig.style.getPropertyValue(se):T.style.getPropertyValue(se);if((Z?L.longhands:g0[L.key]).some(te))return{href:"style attribute",selector:Ya(T)};let Ne=g0[L.key],h=i?.rules||[],I=se=>$e(h,se,Ne).rest,O=I(T),ee=!1;if(!O&&G7.has(L.key))for(let se=T.parentElement;se&&!O;se=se.parentElement)O=I(se),ee=!!O;return O?{href:e9(O.sheet),selector:O.selector,...ee?{inherited:!0}:{}}:null}function gt(T,L,z){let Z=Oe(T,L.key),te=w.get(Z)||null,Ne=te?te.fromVals:rt(T,L);if(m.push({key:Z,prev:te&&{...te}}),i9(z,Ne))w.delete(Z),he(T,L);else{let h=te?{...te,toVals:z}:{key:Z,el:T,playhead:$r(T),property:L.key,fromVals:Ne,toVals:z,selector:Ya(T),path:Q7(T),words:_0(T),ruleSource:Ve(T,L),scales:i};w.set(Z,h),Y(h)}ke()}function U(T,L){let z=Oe(T,L.key),Z=w.get(z);Z&&(m.push({key:z,prev:{...Z}}),w.delete(z),he(T,L),ke())}function oe(){let T=m.pop();if(!T)return;let L=w.get(T.key),z=T.prev?.el||L?.el,Z=xi((T.prev||L)?.property);if(!z||!Z)return ke();T.prev?(w.set(T.key,T.prev),Y(T.prev)):(w.delete(T.key),he(z,Z)),ke()}function de(){for(let T of[...w.values()])he(T.el,xi(T.property));w.clear(),m.length=0,ke()}function Re(T){let L=xi(T.property),z=je(L,T.toVals,T.scales),Z=je(L,T.fromVals,T.scales);return{selector:T.selector,property:T.property,from:O5(L,T.fromVals),to:O5(L,T.toVals),token:z.token,fromToken:Z.token,onScale:z.onScale,fromOnScale:Z.onScale,scale:z.source==="tokens"?"tokens":"page values",ruleSource:T.ruleSource}}async function ze(){if(l)return{count:0,failed:0};let T=[...w.values()];if(!T.length)return{count:0,failed:0};if(!e||!t)return d="Not connected to the review server. Your tweaks are kept; try again when it is back.",ke(),{count:0,failed:T.length};l=!0,d="",ke();let L=await io(),z=0,Z=0,te=null;for(let Ne of T){let h=Re(Ne),I=crypto.randomUUID();try{let O=await fetch(`${e}/sessions/${t}/annotations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:I,kind:"tweak",intent:"change",viewport:Qn(),url:location.href,timestamp:Date.now(),comment:`Tweak: ${L5(h)}`,element:Ne.el.tagName.toLowerCase(),elementPath:Ne.path,...Ne.words?{selectedText:Ne.words}:{},tweak:h,...Ne.playhead?{playhead:Ne.playhead}:{},...L?{reviewer:L}:{}})});if(O.ok){let ee=await O.json().catch(()=>({}));Vs(I,ee.id),w.delete(Ne.key),z++;for(let se=m.length-1;se>=0;se--)m[se].key===Ne.key&&m.splice(se,1)}else Z++,te=O.status}catch{Z++,te=0}}return l=!1,Z&&(d=so(te,"save").replace("Your text is kept","Your tweaks are kept")),z&&document.dispatchEvent(new CustomEvent("agentation-kit:annotations-refresh")),!w.size&&a==="review"&&(a="strip"),ke(),{count:z,failed:Z}}let Ke=Vn("tweak",T=>{D.hidden=!T,T?Ft():Ko(D)}),Et=()=>w.size,dn=T=>`${T} ${T===1?"tweak":"tweaks"}`;function Ye(T,L,z,Z){let te=document.createElement("button");return te.type="button",te.className=T,D5[L]?(te.innerHTML=ip(L),te.setAttribute("aria-label",Z),te.title=Z):te.textContent=L,te.onclick=Ne=>{Ne.stopPropagation(),z()},te}function Rt(){if(!n){Ke.want(!1);return}if(r&&Qr()&&a!=="review"){Ke.want(!1);return}if(r&&!Et()&&a!=="review"){Ke.want(!1);return}Ke.want(!0,{passive:a!=="review",bump:a==="review"})}function Ft(){if(D.hidden)return;if(D.replaceChildren(),a==="review"&&Et())return lt();a="strip",D.className="panel strip",D.setAttribute("aria-label","Tweaks");let T=Et(),L=document.createElement("span");if(L.className=T?"n":"hint",L.textContent=l?"Saving\u2026":T?dn(T):"Click anything to tweak",D.append(L),T){let z=Ye("iconbtn","undo",oe,"Undo last tweak");z.disabled=!m.length||l;let Z=Ye("ghost ring","Review",()=>{a="review",r&&bt(),Rt(),Ft()}),te=Ye("primary",`Save ${T}`,ze);te.disabled=l,D.append(z,Z,te)}if(D.style.whiteSpace=d?"normal":"",d){let z=document.createElement("span");z.className="err",z.setAttribute("role","alert"),z.textContent=d,D.append(z)}uo(D,Math.min(520,innerWidth-24)),D.style.width="max-content",D.style.maxWidth=innerWidth-24+"px",uo(D,Math.min(Math.ceil(D.getBoundingClientRect().width),innerWidth-24))}function lt(){D.className="panel rv",D.setAttribute("aria-label","Review tweaks");let T=document.createElement("div");T.className="hd";let L=document.createElement("span");L.textContent=`Review ${dn(Et())}`,L.style.flex="1",T.append(L,Ye("iconbtn","close",()=>{a="strip",Rt(),Ft()},"Close review"));let z=document.createElement("div");z.className="body";let Z=new Map;for(let h of w.values())Z.has(h.el)||Z.set(h.el,[]),Z.get(h.el).push(h);for(let[h,I]of Z){let O=document.createElement("div");O.className="el";let ee=document.createElement("span");ee.className="mono",ee.textContent=I[0].selector;let se=Ye("",I[0].words||"Show element",()=>{a="strip",Pt(h)});se.title="Show this element",O.append(ee,se),z.append(O);for(let ce of I){let b=Re(ce),B=xi(ce.property),ie=document.createElement("div");ie.className="tk",ie.dataset.tweak=ce.key;let ne=document.createElement("div");ne.className="ln";let Le=document.createElement("span");Le.className="mono",Le.textContent=b.property;let De=document.createElement("span");De.className="from",De.textContent=b.from;let fe=document.createElement("span");fe.setAttribute("aria-label","to"),fe.textContent="\u2192";let Fe=document.createElement("span");Fe.className="to",Fe.textContent=b.to,ne.append(Le,De,fe,Fe);let we=document.createElement("div");we.className="sub",we.textContent=ht(b),ie.append(ne,Ye("iconbtn","reset",()=>U(h,B),`Reset ${B.label.toLowerCase()}`),we),z.append(ie)}}let te=document.createElement("div");te.className="ft acts";let Ne=Ye("primary",l?"Saving\u2026":`Save ${Et()}`,ze);if(Ne.disabled=l,te.append(Ye("ghost","Undo all",de),Ne),D.append(T,z),d){let h=document.createElement("div");h.className="err",h.setAttribute("role","alert"),h.textContent=d,D.append(h)}D.append(te),D.style.whiteSpace="",Gn(D,340)}function ht(T){return T.token&&T.onScale?`Uses ${T.token.split(" \xB7 ").map(Ka).join(", ")}`:T.token?"Partly off scale":T.onScale?"Uses a value the page already has":"Off scale"}function Ze(T){let L=T.composedPath?T.composedPath():[T.target];if(L.some(te=>te.nodeType===1&&te.matches?.(y0)))return null;let z=L.find(te=>te.nodeType===1);if(!z||z===document.documentElement||z===document.body)return null;let Z=z.closest?.("svg");return Z&&(z=Z.parentElement||Z),z===document.body?null:z}function qt(T,L){Object.assign(T.style,{left:L.left-2+"px",top:L.top-2+"px",width:L.width+4+"px",height:L.height+4+"px"})}function Zt(T,L){Q.replaceChildren();let z=document.createElement("span");z.className="mono",z.textContent=Ya(T);let Z=document.createElement("span");Z.className="w",Z.textContent=_0(T),Q.append(z),Z.textContent&&Q.append(Z),Q.hidden=!1;let te=Q.getBoundingClientRect(),Ne=Ei(),h=L.bottom+8+te.height<=Ne.bottom;Q.style.top=(h?L.bottom+8:Math.max(Ne.top+4,L.top-te.height-8))+"px",Q.style.left=Math.max(8,Math.min(L.left,innerWidth-te.width-8))+"px"}function en(){if(c=0,!!n){if(o&&o.isConnected&&o!==r){let T=o.getBoundingClientRect();qt(E,T),E.hidden=!1,Zt(o,T)}else E.hidden=!0,Q.hidden=!0;r?.isConnected?(qt(A,r.getBoundingClientRect()),A.hidden=!1):A.hidden=!0}}let on=()=>{c||(c=requestAnimationFrame(en))},R=T=>{if(T.pointerType==="touch")return;let L=Ze(T);L!==o&&(o=L,on())},re=T=>{Ze(T)&&(T.preventDefault(),T.stopPropagation(),T.stopImmediatePropagation?.())},ae=T=>{let L=Ze(T);L&&(T.preventDefault(),T.stopPropagation(),T.stopImmediatePropagation?.(),s&&It(),Pt(L))},ve=()=>{if(on(),!r||G.hidden||Qr())return;let T=r.getBoundingClientRect();T.bottom>0&&T.top<innerHeight&&(Me(),s&&Ot())},Ge=T=>{if(!(T.key!=="Escape"||!n)){if(s)It(!0);else if(r)bt();else if(a==="review")a="strip",Rt(),Ft();else return;T.preventDefault(),T.stopPropagation(),T.stopImmediatePropagation?.()}},Xe=()=>{on(),r&&!G.hidden&&!Qr()&&Me(),s&&Ot()};function it(T){let L=T?"addEventListener":"removeEventListener";document[L]("agentation-kit:insets",Xe),document[L]("pointermove",R,!0);for(let z of["pointerdown","mousedown","mouseup","pointerup","dblclick","auxclick"])document[L](z,re,!0);document[L]("click",ae,!0),window[L]("scroll",ve,!0),window[L]("resize",ve),window[L]("keydown",Ge,!0)}function Pt(T){T?.isConnected&&(i||(i=R5()),r=T,o=null,s=null,le.hidden=!0,Ae=null,j(),Rt(),Qr()&&(requestAnimationFrame(()=>ri(T.getBoundingClientRect())),setTimeout(()=>r===T&&ri(T.getBoundingClientRect()),160)),on(),G.querySelector(".field")?.focus({preventScroll:!0}))}let Qe=!1;document.addEventListener("agentation-kit:slot",T=>{let L=!!T.detail?.panel&&!["tweak","check-strip","question"].includes(T.detail.panel);L!==Qe&&(Qe=L,Qe?(le.hidden=!0,s=null,G.hidden=!0,Ko(G)):r&&j())});function bt(){let T=G.contains(y.activeElement)||le.contains(y.activeElement);r=null,s=null,le.hidden=!0,G.hidden=!0,Ko(G),Rt(),D.hidden||Ft(),on(),T&&No()&&ea()}function j(){if(!r)return;let T=r;G.replaceChildren(),G.setAttribute("aria-label",`Tweak ${Ya(T)}`);let L=document.createElement("div");L.className="hd";let z=document.createElement("span");z.className="mono",z.textContent=Ya(T);let Z=document.createElement("span");Z.className="w",Z.textContent=_0(T),L.append(z,Z,Ye("iconbtn","close",bt,"Close tweak panel"));let te=document.createElement("div");te.className="body";let Ne=getComputedStyle(T),h="";for(let I of p0)if(!(I.key==="gap"&&!/flex|grid/.test(Ne.display))){if(I.group!==h){h=I.group;let O=document.createElement("div");O.className="grp",O.textContent=h,te.append(O)}te.append(ye(T,I))}if(G.append(L,te),Qr()){let I=document.createElement("div");I.className="ft acts";let O=document.createElement("span");if(O.className="n",O.textContent=Et()?dn(Et()):"Live on this page only until you save.",I.append(O),Et()){let ee=Ye("primary",l?"Saving\u2026":`Save ${Et()}`,ze);ee.disabled=l,I.append(Ye("ghost ring","Review",()=>{a="review",bt()}),ee)}G.append(I)}else{let I=document.createElement("div");I.className="ft",I.innerHTML=ip("info",14),I.append(document.createTextNode("Live on this page only until you save.")),G.append(I)}if(d){let I=document.createElement("div");I.className="err",I.setAttribute("role","alert"),I.textContent=d,G.append(I)}Qe||(G.hidden=!1,Me())}function q(T,L){let z=je(T,L),Z=P5(T,L);if(T.kind==="colour"){if(qa(L[0]))return{tok:"None",on:!1,off:!1,val:"",swatch:L[0]};let h=wc(L[0]);return{tok:z.token?Ka(z.token):h,on:!!z.token,off:!z.onScale,val:z.token?h:z.onScale?"":"Off scale",swatch:L[0]}}let te;z.onScale?z.token?te=z.token.split(" \xB7 ").map(Ka).join(" \xB7 "):T.key==="font-weight"?te=f0(L[0]):te=Z.every(h=>h===0)?"none":"":te="Off scale";let Ne=T.key==="padding"&&Z.length>1?Z.map($5).join(" \xD7 "):T.key==="font-weight"?String(L[0]):Z.length>1?Z.map($5).join(" "):Z[0]===0?"0":wi(Z[0]);return te||(te=Ne,Ne=""),{tok:te,on:!!z.token&&z.onScale,off:!z.onScale,val:Ne}}function J(T){let L=document.createElement("span"),z=M5(T);return L.className="sw"+(z?" "+z:""),z!=="none"&&(L.style.background=T),L}function ye(T,L){let z=w.get(Oe(T,L.key)),Z=z?z.toVals:rt(T,L),te=document.createElement("div");te.className="prop",te.dataset.prop=L.key;let Ne=document.createElement("div");if(Ne.className="name",Ne.textContent=L.label,z){let ce=document.createElement("span");ce.className="chg",ce.textContent="Changed",Ne.append(ce)}let h=document.createElement("button");h.type="button",h.className="field",h.setAttribute("aria-haspopup","dialog"),h.setAttribute("aria-expanded",String(s?.prop===L.key));let I=q(L,Z);I.swatch&&h.append(J(I.swatch));let O=document.createElement("span");O.className="tok"+(I.on?" on":I.off?" off":""),O.textContent=I.tok;let ee=document.createElement("span");ee.className="val",ee.textContent=I.val,h.append(O,ee),h.insertAdjacentHTML("beforeend",ip("down",14)),h.setAttribute("aria-label",`${L.label}: ${[I.tok,I.val].filter(Boolean).join(", ")}${z?", changed":""}. Change`),h.onclick=ce=>{ce.stopPropagation(),s?.prop===L.key?It():Ue(L,h)};let se=Ye("iconbtn","reset",()=>{U(T,L)},`Reset ${L.label.toLowerCase()}`);return se.hidden=!z,te.append(Ne,h,se),te}let Ae=null;function qe(){let T=r.getBoundingClientRect(),L=Ae.rect,z=Ei(),Z=10,te=(ce,b,B,ie)=>{let ne=ce-B,Le=b-ie;return ne*Le>0&&Math.min(Math.abs(ne),Math.abs(Le))>1};if(te(T.left,T.right,L.left,L.right)||te(T.top,T.bottom,L.top,L.bottom))return!1;if(Object.assign(G.style,Ae.style),Ae.side==="above"){let ce=Math.floor(T.top-Z-parseFloat(Ae.style.top));if(ce<160)return!1;G.style.maxHeight=Math.min(parseFloat(Ae.style.maxHeight),ce)+"px"}let Ne=Math.floor(z.bottom-8-parseFloat(Ae.style.top));if(Ne<160)return!1;Ne<parseFloat(G.style.maxHeight)&&(G.style.maxHeight=Ne+"px");let h=G.getBoundingClientRect(),I=ce=>T.right<=ce.left||T.left>=ce.right||T.bottom<=ce.top||T.top>=ce.bottom,O=h.left>=z.left+4&&h.right<=z.right-4&&h.top>=z.top&&h.bottom<=z.bottom;if(I(h)&&O)return!0;let ee={below:()=>({top:T.bottom+Z}),right:()=>({left:T.right+Z}),left:()=>({left:T.left-Z-h.width})}[Ae.side]?.();if(!ee)return!1;let se={left:ee.left??h.left,top:ee.top??h.top};return se.right=se.left+h.width,se.bottom=se.top+h.height,se.left<z.left+8||se.right>z.right-8||se.top<z.top+8||se.bottom>z.bottom-8||!I(se)?!1:(Object.assign(Ae.style,{left:Math.round(se.left)+"px",top:Math.round(se.top)+"px"}),Object.assign(G.style,Ae.style),!0)}let me=0;function Me(){if(!r||G.hidden||Ae?.el===r&&!Qr()&&qe())return;if(Ae?.el===r&&!Qr()&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&(G.classList.add("glide"),clearTimeout(me),me=setTimeout(()=>G.classList.remove("glide"),260)),Ae=null,G.style.maxHeight="",Qr()){G.style.width="",Gn(G,300),requestAnimationFrame(()=>r&&ri(r.getBoundingClientRect()));return}Ko(G);let T=Math.min(300,innerWidth-24);Object.assign(G.style,{position:"fixed",width:T+"px",right:"auto",bottom:"auto"}),G.dataset.sheet="";let L=r.getBoundingClientRect(),z=Ei(),Z=10,te=G.scrollHeight,Ne=Le=>Math.max(z.left+12,Math.min(Le,z.right-T-12)),h=(Le,De)=>Math.max(z.top+8,Math.min(Le,z.bottom-De-8)),I={below:z.bottom-L.bottom-Z-8,above:L.top-z.top-Z-8,right:z.right-L.right-Z-12,left:L.left-z.left-Z-12},O=z.bottom-z.top-16,ee=()=>({left:Ne(L.left),top:L.bottom+Z,h:I.below}),se=()=>({left:Ne(L.left),top:Math.max(z.top+8,L.top-Z-Math.min(te,I.above)),h:I.above}),b=[["below",I.below>=te,ee],["above",I.above>=te,se],["below",I.below>=300&&I.below>=I.above,ee],["right",I.right>=T,()=>({left:L.right+Z,top:h(L.top,Math.min(te,O)),h:O})],["left",I.left>=T,()=>({left:L.left-Z-T,top:h(L.top,Math.min(te,O)),h:O})],["above",I.above>=220,se],["below",I.below>=220,ee]].find(Le=>Le[1]);if(!b){Gn(G,300);return}let B=b[2]();G.dataset.side=b[0];let ie={position:"fixed",width:T+"px",right:"auto",bottom:"auto",left:Math.round(B.left)+"px",top:Math.round(B.top)+"px",maxHeight:Math.max(160,Math.floor(Math.min(B.h,O)))+"px"};Object.assign(G.style,ie);let ne=r.getBoundingClientRect();Ae={el:r,side:b[0],style:ie,rect:{left:ne.left,right:ne.right,top:ne.top,bottom:ne.bottom}}}function Ue(T,L){s={prop:T.key,part:sp(T,[0,0])[0].part,field:L},jt(!0),G.querySelectorAll(".field").forEach(z=>z.setAttribute("aria-expanded",String(z===L)))}function It(T=!1){let L=s?.field;s=null,le.hidden=!0,G.querySelectorAll(".field").forEach(z=>z.setAttribute("aria-expanded","false")),T&&L?.isConnected&&L.focus()}function jt(T=!1){if(!s||!r)return;let L=r,z=xi(s.prop),Z=w.get(Oe(L,z.key)),te=Z?Z.toVals:rt(L,z),Ne=Z?Z.fromVals:te,h=sp(z,te),I=h.find(we=>we.part===s.part)||h[0],O=sp(z,Ne).find(we=>we.part===I.part),ee=Pe(z);le.replaceChildren(),le.setAttribute("aria-label",`${z.label}${I.label?", "+I.label:""}`);let se=document.createElement("div");if(se.className="ph",se.textContent=`${z.label}${I.label?", "+I.label:""}`,le.append(se),ee.source!=="tokens"){let we=document.createElement("div");we.className="ph note",we.textContent="No scale in the stylesheets, so these are values the page already uses.",le.append(we)}if(h.length>1){let we=document.createElement("div");we.className="seg",we.setAttribute("role","group"),we.setAttribute("aria-label","Sides");for(let pt of h){let Tt=Ye("",pt.label[0].toUpperCase()+pt.label.slice(1),()=>{s.part=pt.part,jt()});Tt.setAttribute("aria-pressed",String(pt===I)),we.append(Tt)}le.append(we)}let ce=document.createElement("div");ce.className="opts",ce.setAttribute("role","listbox"),ce.setAttribute("aria-label",ee.source==="tokens"?"The project\u2019s scale":"Values this page uses");let b=rp(I.value,ee.list);for(let we of ee.list){let pt=document.createElement("button");pt.type="button",pt.className="opt",pt.setAttribute("role","option"),pt.setAttribute("aria-selected",String(we===b)),pt.dataset.value=String(we.value),pt.innerHTML=`<span class="ck">${ip("check",14)}</span>`,z.kind==="colour"&&pt.append(J(we.value));let Tt=document.createElement("span");Tt.className="nm"+(we.token?" mono":""),Tt.textContent=we.token?Ka(we.token):we.label||(z.kind==="colour"?wc(we.value):wi(we.value));let dt=document.createElement("span");dt.className="val",dt.textContent=z.kind==="colour"?we.token?wc(we.value):"":z.key==="font-weight"?String(we.value):we.token?wi(we.value):"",pt.append(Tt,dt),pt.onclick=yt=>{yt.stopPropagation(),Kt(z,I.part,we.value)},ce.append(pt)}ce.onkeydown=we=>{if(!["ArrowDown","ArrowUp","Home","End"].includes(we.key))return;we.preventDefault(),we.stopPropagation();let pt=[...ce.querySelectorAll(".opt")],Tt=pt.indexOf(y.activeElement),dt=we.key==="Home"?0:we.key==="End"?pt.length-1:Math.max(0,Math.min(pt.length-1,Tt+(we.key==="ArrowDown"?1:-1)));pt[dt]?.focus()},le.append(ce,document.createElement("hr"));let B=rp(O.value,ee.list),ie=document.createElement("button");ie.type="button",ie.className="opt was";let ne=document.createElement("span");ne.textContent=`Reset to ${z.kind==="colour"?wc(O.value):z.key==="font-weight"?O.value:wi(O.value)}`;let Le=document.createElement("span");Le.textContent=B?B.token?Ka(B.token):"":z.kind==="colour"&&qa(O.value)?"":"Off scale",ie.append(ne,Le),ie.onclick=we=>{we.stopPropagation(),Kt(z,I.part,O.value)},le.append(ie);let De=document.createElement("form");De.className="free";let fe=document.createElement("input");fe.setAttribute("aria-label","Custom value"),fe.placeholder=z.kind==="colour"?"#1e63dd":z.key==="font-weight"?"550":"18px";let Fe=document.createElement("button");Fe.type="submit",Fe.className="ghost ring",Fe.textContent="Use",De.append(fe,Fe),De.onsubmit=we=>{we.preventDefault(),we.stopPropagation();let pt=Qt(z,fe.value);if(pt==null){fe.setCustomValidity("Not a value this property takes"),fe.reportValidity();return}Kt(z,I.part,pt)},fe.oninput=()=>fe.setCustomValidity(""),le.append(De),le.hidden=!1,Ot(),T&&(ce.querySelector("[aria-selected=true]")||ce.querySelector(".opt")||fe).focus({preventScroll:!0})}function Qt(T,L){let z=String(L||"").trim();if(!z)return null;if(T.kind==="colour")return i.res.freeColour(z);if(T.key==="font-weight"){let Ne=Number(z);return Ne>=1&&Ne<=1e3?Ne:null}let Z=parseFloat(getComputedStyle(document.documentElement).fontSize)||16,te=T5(z,Z);return Number.isFinite(te)||(te=i.res.freeLength(z)??NaN),Number.isFinite(te)&&te>=0&&te<=2e3?vc(te):null}function Kt(T,L,z){if(!r)return;let Z=w.get(Oe(r,T.key)),te=Z?Z.toVals:rt(r,T);gt(r,T,r9(T,te,L,z)),sp(T,te).length<2&&It(!0)}function Ot(){if(!s||le.hidden||!s.field?.isConnected)return;let T=G.getBoundingClientRect(),L=s.field.getBoundingClientRect(),z=r.getBoundingClientRect(),Z=Ei(),te=Math.min(240,T.width-16);le.style.width=te+"px",le.style.maxHeight="";let Ne=Math.min(le.scrollHeight,360),h=Math.max(Z.top+8,Math.min(L.top-8,Z.bottom-Ne-8)),I=b=>!(b+te<z.left||b>z.right||h+Ne<z.top||h>z.bottom),O=T.right+8,ee=T.left-8-te,se=null;if(!Qr()&&O+te<=Z.right-8&&!I(O)?se=O:!Qr()&&ee>=Z.left+8&&!I(ee)&&(se=ee),se!=null){Object.assign(le.style,{left:se+"px",top:h+"px",maxHeight:Math.min(360,Z.bottom-h-8)+"px"});return}let ce=Math.max(T.top+40,Math.min(L.bottom+4,T.bottom-Math.min(Ne,T.height-48)-8));Object.assign(le.style,{left:T.left+(T.width-te)/2+"px",top:ce+"px",maxHeight:Math.max(140,T.bottom-ce-8)+"px"})}function ke(){if(r&&!G.hidden){let T=y.activeElement?.closest?.(".prop")?.dataset.prop;j(),s?(s.field=G.querySelector(`.prop[data-prop="${s.prop}"] .field`),jt()):T&&G.querySelector(`.prop[data-prop="${T}"] .field`)?.focus({preventScroll:!0})}!Et()&&a==="review"&&(a="strip"),Rt(),D.hidden||Ft(),on(),document.dispatchEvent(new CustomEvent("agentation-kit:tweak-change",{detail:{active:n,count:Et()}}))}function Lt(T){let L=T===void 0?!n:!!T;if(L!==n){if(n=L,n){window.__AGENTATION_KIT_EDIT__?.active&&window.__AGENTATION_KIT_EDIT__.toggle(!1),i=null,d="";for(let z of w.values())z.el.isConnected&&Y(z);it(!0)}else{it(!1),r=null,o=null,s=null,a="strip";for(let z of[G,le,E,A,Q])z.hidden=!0;Ko(G),Ko(D),Ce(),i?.res.done(),i=null}ke(),bn()}}document.addEventListener("transitionend",T=>{T.propertyName==="width"&&!D.hidden&&a==="strip"&&T.target?.matches?.('[data-agentation-toolbar] [class*="toolbarContainer"]')&&Ft()},!0),document.addEventListener("agentation-kit:edit-change",()=>{n&&window.__AGENTATION_KIT_EDIT__?.active&&Lt(!1)}),document.addEventListener("agentation-kit:route",()=>{r&&!r.isConnected&&bt();for(let[T,L]of w)L.el.isConnected||w.delete(T);ke()});let At={get active(){return n},get count(){return Et()},toggle:Lt,save:ze,undo:oe,select:Pt,close:bt,drafts:()=>[...w.values()].map(Re),draft({element:T,property:L,to:z}){let Z=xi(L);if(!Z||!T?.isConnected||z==null)return null;i||(i=R5());let te;if(Z.kind==="colour"){if(!CSS.supports("color",String(z)))return null;te=[String(z)]}else{let Ne=String(z).trim().split(/\s+/);if(!Ne.every(h=>/^-?\d*\.?\d+(px)?$/.test(h)||Z.key==="font-weight"&&/^\d{3}$/.test(h)))return null;te=Ne.map(Number.parseFloat)}if(Z.longhands.length===4&&te.length<4){let[Ne,h=Ne,I=Ne,O=h]=te;te=[Ne,h,I,O]}else Z.longhands.length===2&&te.length===1&&(te=[te[0],te[0]]);return gt(T,Z,te),Oe(T,Z.key)},undraft(T){let L=w.get(T);L&&U(L.el,xi(L.property))},review(){a="review",bt()},setSession(T){T&&(t=T)}};return window.__AGENTATION_KIT_TWEAK__=At,document.dispatchEvent(new CustomEvent("agentation-kit:tweak-change",{detail:{active:n,count:0}})),At}var cn=typeof window<"u"&&(window.__AGENTATION_KIT_AGENTATION__||window.__SHAREKIT_AGENTATION__)||{};function Xi(e){if(e)try{return new URL(e,window.location.origin).toString().replace(/\/$/,"")}catch{return}}function F5(){if(window.top!==window.self&&!Zc()&&!cn.framed||window.name==="show-and-tell-measure"||(window.__AGENTATION_KIT_VIEWPORT__=Qn,window.__AGENTATION_KIT_VIEWPORT_MATCH__=Jc,ix(),j0(Xi(cn.endpoint)),V0(Xi(cn.endpoint)),document.getElementById("agentation-root")))return;if(s9(),cp=Tx({endpoint:Xi(cn.endpoint),expectedName:cn.name||(typeof window.__AGENTATION_KIT__=="string"?window.__AGENTATION_KIT__:""),recoverSession:()=>bc().then(t=>t&&H5(t))}),window.__AGENTATION_KIT_CONNECTION__=cp,cn.agentWork&&(window.__AGENTATION_KIT_AGENT_WORK__=m5({endpoint:Xi(cn.endpoint),...typeof cn.agentWork=="object"?{hint:cn.agentWork.hint,livePage:!!cn.agentWork.livePage}:{}})),document.addEventListener("agentation-kit:health",t=>{t.detail?.ok&&!up&&bc().then(n=>n&&kc(n))}),cn.toolbar===!1){window.__AGENTATION_KIT_TOOLBAR_OFF__=!0,bc().then(t=>t&&kc(t));return}let e=document.createElement("div");e.id="agentation-root",document.body.appendChild(e),(0,W5.createRoot)(e).render(B5.default.createElement(V2,{endpoint:Xi(cn.endpoint),onAnnotationAdd:t=>{t.viewport||(t.viewport=Qn());let n=t.playhead?null:ox(t);n&&(t.playhead=n),vi?.added(t)},onAnnotationUpdate:()=>vi?.refresh(),onAnnotationDelete:()=>vi?.refresh(),onAnnotationsClear:t=>{for(let n of t||[])Qi?.clearCommitted(n.id,"dismissed");vi?.refresh()},webhookUrl:cn.webhookUrl||void 0,copyToClipboard:cn.copyToClipboard!==!1,onSessionCreated:t=>{window.__AGENTATION_KIT_AGENTATION_SESSION__=t,document.dispatchEvent(new CustomEvent("agentation-kit:agentation-session",{detail:{sessionId:t}})),kc(t)}})),_g(),bc().then(t=>t&&kc(t))}async function bc(){let e=Xi(cn.endpoint);if(!e)return null;try{let t=await fetch(`${e}/sessions`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:window.location.href,...zr(window.location.href)?{pageKey:zr(window.location.href)}:{}})});return cp?.report("sessions",t,"sessions"),t.ok?(await t.json()).id??null:null}catch{return cp?.report("sessions",null),null}}var x0=typeof location<"u"?Dr():"/";function w0(){Dr()!==x0&&(x0=Dr(),document.dispatchEvent(new CustomEvent("agentation-kit:route",{detail:{pathname:x0}})))}function s9(){if(!window.__AGENTATION_KIT_ROUTES__){window.__AGENTATION_KIT_ROUTES__=!0;for(let e of["pushState","replaceState"]){let t=history[e];history[e]=function(...n){let o=t.apply(this,n);return queueMicrotask(w0),o}}addEventListener("popstate",w0),setInterval(w0,1e3),document.addEventListener("agentation-kit:route",()=>{dp?.reload(),bc().then(e=>e&&H5(e))})}}function H5(e){if(!up)return kc(e);e!==window.__AGENTATION_KIT_AGENTATION_SESSION__&&(window.__AGENTATION_KIT_AGENTATION_SESSION__=e,Qi?.setSession(e),j5?.setSession(e),vi?.setSession(e),k0?.setSession(e),U5(e),document.dispatchEvent(new CustomEvent("agentation-kit:agentation-session",{detail:{sessionId:e}})))}var cp=null,Qi=null,j5=null,v0=null,dp=null,b0=null,ap=null,vi=null,k0=null,lp=null,up=!1;function kc(e){if(up||!e)return;up=!0,window.__AGENTATION_KIT_AGENTATION_SESSION__=e;let t=Xi(cn.endpoint);cn.edit===!1?window.__AGENTATION_KIT_EDIT_STANDDOWN__="disabled for this link":document.querySelector("[data-editid]")?window.__AGENTATION_KIT_EDIT_STANDDOWN__="page has its own editor ([data-editid])":(Qi=ax({endpoint:t,sessionId:e,integrated:cn.toolbar!==!1}),window.__AGENTATION_KIT_EDIT__=Qi,document.addEventListener("agentation-kit:edit-toggle",o=>Qi.toggle(o.detail?.on)));let n=cn.copyView!==!1;if(n&&(window.__AGENTATION_KIT_COPY__={open:()=>ul(t)},window.__SHOW_AND_TELL__={...window.__SHOW_AND_TELL__||{},allText:()=>ul(t)}),cn.toolbar!==!1){p5(),cn.tweak!==!1&&(j5=z5({endpoint:t,sessionId:e})),vi=bg({endpoint:t,sessionId:e,editMode:Qi,copyView:n}),window.__AGENTATION_KIT_REVIEW__=vi,cn.voice!==!1&&(k0=d5({endpoint:t,sessionId:e,config:cn.voice||{}}),window.__AGENTATION_KIT_VOICE__=k0);let o=cn.fresh!==!1?v5({endpoint:t}):null;window.__AGENTATION_KIT_FRESH__=o,lp=y5({endpoint:t,fresh:o}),window.__AGENTATION_KIT_CHECK__=lp;let r=b5();if(r?.then==="check"&&lp.resume(r.id),Zc()&&window.parent.__AGENTATION_KIT_SIMULATOR__.target){let i=window.parent.__AGENTATION_KIT_SIMULATOR__.target;window.parent.__AGENTATION_KIT_SIMULATOR__.target=null,setTimeout(()=>vi.locate(i),300)}}v0=dx({endpoint:t}),window.__AGENTATION_KIT_REPLIES__=v0,(cn.critique!==!1||cn.toolbar!==!1)&&(dp=kx({endpoint:t,opinion:cn.critique!==!1,toolbar:cn.toolbar!==!1}),window.__AGENTATION_KIT_CRITIQUE__=dp),cn.layoutIntent!==!1&&cn.toolbar!==!1&&(b0=Ex({endpoint:t}),window.__AGENTATION_KIT_LAYOUT_INTENT__=b0),U5(e)}function U5(e){let t=Xi(cn.endpoint);if(t){ap?.close();try{ap=new EventSource(`${t}/sessions/${e}/events`);let n=i=>{try{let a=JSON.parse(i.data).payload||{},{id:l,status:d}=a;Qi&&l&&(d==="resolved"||d==="dismissed")&&Qi.clearCommitted(l,d),vi?.ingest(a),lp?.ingest(a),v0.ingest(a),dp?.ingest(a),b0?.ingest(a)}catch{}},o=new Set,r=i=>{let s=`${i.lastEventId||""}:${i.data}`;o.has(s)||(o.add(s),o.size>200&&o.clear(),n(i))};ap.addEventListener("annotation.updated",r),ap.onmessage=r}catch{}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",F5):F5();})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
