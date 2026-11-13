/**
 * The two snippets that run before the toolbar bundle: its config global and
 * the localStorage bridge.
 *
 * WHY A BRIDGE: the toolbar keeps some state (text-edit drafts, the "Send to
 * agent" round marker) in localStorage. The bridge mirrors every `agentation*`
 * key to the sidecar's JSON store, so the agent-side CLI can read it and a
 * fresh browser sees it. Order is load-bearing: config, bridge, then bundle.
 */

/** `kvUrl` must be absolute, so it works from any page path. */
export function kvBridge(kvUrl) {
  return `<script>
(function(){
  var KV = ${JSON.stringify(kvUrl)};
  var MINE = function(k){ return typeof k === "string" && k.indexOf("agentation") === 0; };
  var LS; try { LS = window.localStorage; } catch (e) { return; }
  if (!LS || typeof Storage === "undefined") return;
  // Patch the prototype, scoped to localStorage. Assigning setItem/removeItem
  // on the localStorage object made them own properties, so an app doing
  // Object.keys(localStorage) (or for…in) saw two junk "keys".
  var proto = Storage.prototype, set = proto.setItem, del = proto.removeItem;
  if (proto.__agentationKitBridge) return;
  // The toolbar reads this to tell "saved" from "falling back to this browser"
  // (toolbar/connection.js): the seed's HTTP status, then any failed write.
  var report = function(status){
    window.__AGENTATION_KIT_KV_STATUS__ = status;
    try { document.dispatchEvent(new CustomEvent("agentation-kit:kv-status", { detail: { status: status } })); } catch (e) {}
  };
  // Seed synchronously: the bundle is deferred and reads localStorage as it
  // initialises, so an async seed would race it.
  try {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", KV + "?prefix=agentation", false);
    xhr.send(null);
    report(xhr.status);
    if (xhr.status === 200) {
      JSON.parse(xhr.responseText).items.forEach(function(i){ set.call(LS, i.key, i.value); });
    }
  } catch (e) { report(0); }
  var sent = function(r){ report(r.ok ? 200 : r.status); };
  var failed = function(){ report(0); };
  proto.setItem = function(k, v){
    set.call(this, k, v);
    if (this === LS && MINE(k)) fetch(KV, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, value: String(v) }) }).then(sent, failed);
  };
  proto.removeItem = function(k){
    del.call(this, k);
    if (this === LS && MINE(k)) fetch(KV + "?key=" + encodeURIComponent(k), { method: "DELETE" }).then(sent, failed);
  };
  try { Object.defineProperty(proto, "__agentationKitBridge", { value: true }); } catch (e) {}
})();
</script>`;
}

/** The global the bundle reads at boot (see toolbar/entry.jsx). */
export function agentationConfig(config) {
  return `<script>window.__AGENTATION_KIT_AGENTATION__=${JSON.stringify(config)};</script>`;
}
