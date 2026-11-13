#!/usr/bin/env node
// The command's name before the tool became Show and tell. Kept so scripts,
// skills and package.json entries that call it keep working; it is the same
// program as bin/show-and-tell.mjs.
await import('./show-and-tell.mjs');
