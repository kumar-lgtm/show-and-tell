#!/usr/bin/env node
// Local-only, same-origin prototype. All review data stays in .prototype-data.
import '../server/env.js';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
process.env.AGENTATION_KIT_STORE ||= resolve(root, '.prototype-data');
const { createReviewApp } = await import('../server/app.js');
const port = Number(process.env.PORT || 8877);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be between1024 and65535');
const origin = `http://127.0.0.1:${port}`;
const name = 'show-and-tell-demo';
const app = createReviewApp({name, base:'/__review', hosts:[`127.0.0.1:${port}`,`localhost:${port}`], origins:[origin,origin.replace('127.0.0.1','localhost')], config:{critique:true,voice:true,agentWork:true}, src:resolve(root,'example'), voiceLocal:true});
const server = createServer((req,res) => {
  const url = new URL(req.url, origin);
  if (url.pathname.startsWith('/__review/')) return app.handler(req,res,url.pathname.slice('/__review'.length));
  if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405);res.end();return;}
  if (url.pathname === '/favicon.ico') {res.writeHead(204);res.end();return;}
  const html = readFileSync(resolve(root,'example/fieldnote.html'),'utf8').replace('</head>','<script src="/__review/loader.js?name='+name+'" defer></script></head>');
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?'':html);
});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port${port} is already in use. Set PORT to another local port.`:e.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
  console.log(`Show and tell demo (Fieldnote pricing): ${origin}`);
  console.log(`Notes: ${process.env.AGENTATION_KIT_STORE}`);
  console.log(`Agent: node bin/show-and-tell.mjs feedback ${name} list --src example`);
  if (!process.env.AGENTATION_KIT_TRANSCRIBE_URL) console.log('Transcription: built in. The local speech model starts the first time you open Talk.');
});
const stop=()=>{server.closeAllConnections();server.close(()=>process.exit(0));};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
