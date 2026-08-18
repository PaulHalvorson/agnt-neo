import { google } from 'googleapis';
import { oauthFor, loadTokens, saveToken } from './config.js';

/** Build a bare OAuth2 client for a workspace (no credentials attached). */
export function makeOAuthClient(config, key, redirectUri) {
  const { clientId, clientSecret } = oauthFor(config, key);
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Build an OAuth2 client for a workspace with its stored refresh token attached,
 * ready to make API calls. Persists refreshed tokens automatically.
 */
export function authedClient(config, key) {
  const client = makeOAuthClient(config, key);
  const tokens = loadTokens();
  const stored = tokens[key];
  if (!stored || !stored.refresh_token) {
    const ws = config.workspaces[key];
    throw new Error(
      `Workspace "${key}" (${ws?.email || 'unknown account'}) is not authorized yet. ` +
      `Run:  npm run authorize -- ${key}`
    );
  }
  client.setCredentials(stored);
  client.on('tokens', (fresh) => {
    const merged = { ...stored, ...fresh };
    if (!merged.refresh_token && stored.refresh_token) merged.refresh_token = stored.refresh_token;
    saveToken(key, merged);
  });
  return client;
}
