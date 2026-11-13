// <ShowAndTell />: the gated loader as a React element, for frameworks that
// can't inject HTML from config (Next.js). Put it in the root layout's <body>
// (app router) or pages/_document (pages router).
//
// It renders nothing unless NODE_ENV is "development", so it is inert in
// production and can stay committed. Inside development the script still only
// runs on a localhost / 127.0.0.1 page.
//
// React is a peer dependency (yours): no JSX here, so no build step.
import { createElement } from 'react';
import { loaderGate, DEFAULT_PORT } from '../server/loader-tag.js';

/**
 * @param {{ port?: number, name?: string }} [props]
 *   port: must match the review server's port (default 55930).
 *   name: the project name the review server runs under (the `name` given to
 *   withShowAndTell, or your package.json name, sanitised). Sent as
 *   ?name= so a server for another project refuses this page.
 */
export function ShowAndTell({ port = DEFAULT_PORT, name } = {}) {
  if (process.env.NODE_ENV !== 'development') return null;
  return createElement('script', {
    id: 'show-and-tell-loader',
    dangerouslySetInnerHTML: { __html: loaderGate({ port, name, hint: `start the dev server with the show-and-tell plugin, or run show-and-tell serve (port ${port})` }) },
  });
}

export default ShowAndTell;
/** The component's name before the tool was renamed. */
export const AgentationKit = ShowAndTell;
