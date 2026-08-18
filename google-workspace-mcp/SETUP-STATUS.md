# Setup Status & Handoff — google-workspace-mcp

_Record captured 2026-08-13. Paused by user ("complete for now")._

This file records exactly what was built, what is done, what remains, and how to
resume — so the setup can be continued later without retracing any steps.

---

## Goal

Let Claude connect to the Google **Drive / Gmail / Calendar** of three Google
Workspaces on demand, switching per request:

| Key | Workspace | Sign-in account | Notes |
| --- | --- | --- | --- |
| `triadsynergy` | Triad Synergy | `drpaul@triadsynergy.com` | Also already connected to Claude via the built-in Google connector |
| `arclegacyfund` | ARC Legacy Fund | `contact@arclegacyfund.org` | Not yet authorized |
| `arcretreat` *(default)* | ARC Retreat | `retreat@arcretreat.org` | Blocked — see below |

Related but separate: the Windows **Drive F:** mount (Google Drive for Desktop) —
see the "Windows Drive F:" section of `README.md`.

---

## ✅ Done

- **Connector built, tested, committed, pushed** — this repo, opened as **PR #1**
  (`Add google-workspace-mcp: multi-Workspace Google (Drive/Gmail/Calendar) connector`).
  14 tools across Drive/Gmail/Calendar with a per-request `workspace` selector.
- **Cloned to the user's PC** at `C:\Users\DRPAU\agnt-neo\google-workspace-mcp`;
  `npm install` completed.
- **Google Cloud project `workspace-mcp` created** (owned by `retreat@arcretreat.org`),
  with **Drive API, Gmail API, Calendar API enabled**.
- **OAuth consent screen configured** (External) with all three emails added as
  **test users**.
- **Desktop OAuth client created** ("Desktop client 1", client id begins
  `971768069343-...`).
- **`config.json` created** at `%APPDATA%\google-workspace-mcp\config.json` with the
  three workspaces and the OAuth client id/secret filled in.
- PR activity monitoring and scheduled check-ins **turned off** at user's request.

---

## ⏳ Not finished

**No account has completed the `authorize` sign-in yet**, so `tokens.json` has no
tokens and live Google calls won't work until at least one account is authorized.

Blockers encountered:

1. **arcretreat — hard blocked.** Google forces 2‑Step Verification tied to a
   **recovery phone the user cannot access**, and the user is **not** the
   super-admin of arcretreat.org (regular user only). Re-consent (`prompt=consent`)
   always triggers this challenge, so OAuth cannot complete for this account until
   its 2‑step is resolved.
2. **triadsynergy — one `invalid_client` error**, then the Google sign-in page kept
   **going stale** (email field clearing) during troubleshooting. Not fully retried
   from a clean state.
3. **arclegacyfund — not attempted.**

---

## ▶️ How to resume (per account)

From PowerShell:

```powershell
cd "$env:USERPROFILE\agnt-neo\google-workspace-mcp"
node bin/authorize.js triadsynergy      # or: arclegacyfund / arcretreat
```

Then in the fresh browser tab:
- On the domain-locked sign-in box (it already shows `@triadsynergy.com`), type
  **only the username** — e.g. `drpaul` — then **Next**. Do **not** type the full
  address (that doubles the domain and is rejected).
- Pass **"Google hasn't verified this app" → Advanced → Go to Workspace MCP
  (unsafe) → Allow** (keep all scopes checked).
- Success prints **`Saved token for '<key>'.`** in PowerShell.

Tips:
- Always use the tab opened by the **current** run (each run uses a new loopback
  port; a `127.0.0.1 refused to connect` means the run that owned that port already
  exited — start fresh).
- If `invalid_client` returns: re-copy the **client secret** from Google Cloud
  (APIs & Services → Credentials → Desktop client 1 → copy icon; or "+ Add secret"
  for a fresh one) into `config.json`, save, retry.
- To make plain `npm` work in PowerShell (optional):
  `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` → Y.

Verify what's authorized any time:
```powershell
node -e "import('./src/config.js').then(m=>console.log('Signed in:',Object.keys(m.loadTokens())))"
```

---

## Register with Claude (after at least one account is authorized)

- **Claude Desktop:** merge the block from `claude-desktop-config.example.json` into
  `%APPDATA%\Claude\claude_desktop_config.json` (full path to `src\server.js`,
  backslashes escaped `\\`), then restart.
- **Claude Code:** `claude mcp add google-workspace -- node <full path>\src\server.js`

---

## arcretreat workaround (route it through arclegacyfund)

Since arcretreat can't complete OAuth, but the user has an active *browser* session
to it, the plan is to funnel its data into arclegacyfund and connect that account
instead. Full step-by-step is in the chat; summary:

1. **Gmail:** in arcretreat Gmail → Forwarding → forward to
   `contact@arclegacyfund.org` (verify via arclegacyfund inbox). In arclegacyfund,
   filter `to:retreat@arcretreat.org` → apply label **ARC Retreat**. (Forwarding
   covers future mail; changing this setting may itself hit the 2‑step wall.)
2. **Drive:** in arcretreat Drive, select top-level folders → Share with
   `contact@arclegacyfund.org` (Editor/Viewer). They appear under "Shared with me"
   in arclegacyfund; add shortcuts to My Drive. (May be blocked if arcretreat.org
   disallows external sharing.)
3. Then reach both via the **arclegacyfund** workspace in the connector.

**Cleanest long-term fix for arcretreat:** its Workspace super-admin generates
backup codes (or resets 2‑step) for `retreat@arcretreat.org` at admin.google.com →
Directory → Users → Security; then `node bin/authorize.js arcretreat`.

---

## Secrets (never committed — git-ignored)

- `%APPDATA%\google-workspace-mcp\config.json` — OAuth client id/secret
- `%APPDATA%\google-workspace-mcp\tokens.json` — refresh tokens (once authorized)
