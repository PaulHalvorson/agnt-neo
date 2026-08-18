#!/usr/bin/env node
// Interactive one-time authorization for a workspace.
// Usage:  npm run authorize -- <workspace>
//   e.g.  npm run authorize -- arcretreat
//
// Opens a Google sign-in in your browser, captures the redirect on a local
// loopback port, and stores a refresh token in tokens.json next to your config.

import http from 'node:http';
import { URL } from 'node:url';
import { exec } from 'node:child_process';
import { google } from 'googleapis';
import { loadConfig, oauthFor, saveToken, configPath } from '../src/config.js';

const key = process.argv[2];
const config = loadConfig();

if (!key || !config.workspaces[key]) {
  console.error(`Usage: npm run authorize -- <workspace>`);
  console.error(`Configured workspaces: ${config.keys.join(', ')}`);
  console.error(`Config file: ${configPath()}`);
  process.exit(1);
}

const ws = config.workspaces[key];
const { clientId, clientSecret } = oauthFor(config, key);

let oauth;
let done = false;

function finish(code) {
  if (done) return;
  done = true;
  setTimeout(() => { server.close(); process.exit(code); }, 300);
}

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"`
    : process.platform === 'darwin' ? `open "${url}"`
    : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith('/oauth2callback')) { res.writeHead(404); res.end('Not found'); return; }

    const error = url.searchParams.get('error');
    if (error) {
      res.end(`Authorization failed: ${error}. You can close this tab.`);
      console.error(`\nAuthorization failed: ${error}`);
      return finish(1);
    }

    const code = url.searchParams.get('code');
    const { tokens } = await oauth.getToken(code);

    if (!tokens.refresh_token) {
      res.end(
        'Authorized, but Google did not return a refresh token. ' +
        'Revoke this app at https://myaccount.google.com/permissions and run authorize again.'
      );
      console.error(
        `\nWarning: no refresh_token returned for "${key}". ` +
        `Revoke access at https://myaccount.google.com/permissions, then re-run authorize.`
      );
    }

    saveToken(key, tokens);
    res.end(`Authorized ${ws.email || key}. You can close this tab and return to the terminal.`);
    console.error(`\nSaved token for "${key}" (${ws.email || ''}).`);
    finish(0);
  } catch (e) {
    res.end(`Error: ${e.message}`);
    console.error(`\nError exchanging code: ${e.message}`);
    finish(1);
  }
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  oauth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oauth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: config.scopes,
    login_hint: ws.email,
  });

  console.error(`\nAuthorizing workspace "${key}" (${ws.email || ''}).`);
  console.error(`If a browser does not open, paste this URL into one:\n\n${authUrl}\n`);
  console.error(`Sign in as ${ws.email || 'the correct account'} and approve access. Waiting...`);
  openBrowser(authUrl);
});
