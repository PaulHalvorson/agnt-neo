import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_SCOPES = ['https://www.googleapis.com/auth/drive'];

/** Directory that holds config.json + tokens.json. Override with GWS_MCP_DIR. */
export function defaultConfigDir() {
  if (process.env.GWS_MCP_DIR) return process.env.GWS_MCP_DIR;
  const base = process.platform === 'win32'
    ? (process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'))
    : (process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'));
  return path.join(base, 'google-workspace-mcp');
}

/** Full path to config.json. Override with GWS_MCP_CONFIG. */
export function configPath() {
  return process.env.GWS_MCP_CONFIG || path.join(defaultConfigDir(), 'config.json');
}

function tokensPath() {
  return path.join(path.dirname(configPath()), 'tokens.json');
}

export function loadConfig() {
  const p = configPath();
  if (!fs.existsSync(p)) {
    throw new Error(
      `Config not found at ${p}.\n` +
      `Copy config.example.json there and fill in your OAuth client id/secret and workspaces. See README.md.`
    );
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse config at ${p}: ${e.message}`);
  }

  const workspaces = raw.workspaces || {};
  const keys = Object.keys(workspaces);
  if (keys.length === 0) throw new Error(`No workspaces defined in ${p}.`);

  const defaultOauth = {
    clientId: process.env.GWS_MCP_CLIENT_ID || raw.oauth?.clientId,
    clientSecret: process.env.GWS_MCP_CLIENT_SECRET || raw.oauth?.clientSecret,
  };

  const scopes = Array.isArray(raw.scopes) && raw.scopes.length ? raw.scopes : DEFAULT_SCOPES;
  const defaultWorkspace = raw.defaultWorkspace && workspaces[raw.defaultWorkspace]
    ? raw.defaultWorkspace
    : keys[0];

  return { path: p, workspaces, defaultWorkspace, defaultOauth, scopes, keys };
}

/** Resolve the OAuth client (id/secret) for a workspace, falling back to the shared client. */
export function oauthFor(config, key) {
  const ws = config.workspaces[key];
  if (!ws) throw new Error(`Unknown workspace "${key}". Known: ${config.keys.join(', ')}`);
  const clientId = ws.oauth?.clientId || config.defaultOauth.clientId;
  const clientSecret = ws.oauth?.clientSecret || config.defaultOauth.clientSecret;
  if (!clientId || !clientSecret) {
    throw new Error(
      `No OAuth client configured for workspace "${key}". ` +
      `Set a top-level "oauth" block, a per-workspace "oauth" block, or GWS_MCP_CLIENT_ID/GWS_MCP_CLIENT_SECRET.`
    );
  }
  return { clientId, clientSecret };
}

export function loadTokens() {
  const p = tokensPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

export function saveToken(key, token) {
  const p = tokensPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const all = loadTokens();
  all[key] = token;
  fs.writeFileSync(p, JSON.stringify(all, null, 2), { mode: 0o600 });
}

/**
 * Turn a user-supplied workspace hint into a known key.
 * Accepts the key, the label, or the email (case-insensitive). Falls back to the default.
 */
export function resolveWorkspace(config, requested) {
  const key = requested || config.defaultWorkspace;
  if (config.workspaces[key]) return key;
  const needle = String(key).toLowerCase();
  const found = config.keys.find((k) =>
    k.toLowerCase() === needle ||
    String(config.workspaces[k].label || '').toLowerCase() === needle ||
    String(config.workspaces[k].email || '').toLowerCase() === needle
  );
  if (found) return found;
  throw new Error(`Unknown workspace "${key}". Known: ${config.keys.join(', ')}`);
}
