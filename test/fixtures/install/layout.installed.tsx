export default function L({children}){
  return (
    <html>
      <body>
        {children}
        {/* show-and-tell:start — local review toolbar; remove before committing */}
        {process.env.NODE_ENV === "development" && <script dangerouslySetInnerHTML={{ __html: "if([\"localhost\",\"127.0.0.1\"].indexOf(location.hostname)>=0){var s=document.createElement(\"script\");s.src=\"http://127.0.0.1:41234/loader.js?name=demo\";s.onerror=function(){var d=document.createElement(\"button\");d.textContent=\"Review toolbar offline: run show-and-tell serve (port 41234) \\u00d7\";d.title=\"Dismiss\";d.style.cssText=\"position:fixed;right:12px;bottom:12px;z-index:2147483647;font:12px system-ui;padding:7px 11px;border:0;border-radius:6px;background:#1a1a1a;color:#fff;opacity:.9;cursor:pointer\";d.onclick=function(){d.remove()};document.body.appendChild(d)};document.head.appendChild(s);}" }} />}
        {/* show-and-tell:end */}
      </body>
    </html>
  );
}
