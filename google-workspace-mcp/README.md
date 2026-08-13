# google-workspace-mcp

A small **local MCP server** that lets Claude (Desktop or Claude Code) reach into
the Google Drive of **any one of three Google Workspaces on demand**:

| Key | Workspace | Sign-in account |
| --- | --- | --- |
| `triadsynergy` | Triad Synergy | `drpaul@triadsynergy.com` |
| `arclegacyfund` | ARC Legacy Fund | `contact@arclegacyfund.org` |
| `arcretreat` | ARC Retreat *(default)* | `retreat@arcretreat.org` |

In any chat you just say *"use ARC Retreat"* (or Legacy Fund, or Triad) and the
tools target that account's Drive. No account switching in settings.

> **How this relates to "Drive F:"** — There are two separate things:
> 1. **Drive F:** is the Windows *file* mount created by **Google Drive for Desktop** (see [§7](#7-the-windows-drive-f-mount-separate-thing)). That's what puts your files in File Explorer under `F:`.
> 2. **This MCP server** is what lets *Claude* read/search/upload those same Drives across all three accounts at once. It can even upload files straight off your `F:` drive.
> You can run either or both. Together they give you "F: everywhere."

---

## What it can do

Tools exposed to Claude (every tool takes an optional `workspace` argument):

- `list_workspaces` — show the three workspaces and which are signed in
- `drive_search` — search by name / full text
- `drive_list_folder` — list a folder's contents (`root` = top of My Drive)
- `drive_get_metadata` — details for one file
- `drive_read_file` — read a file as text (Docs/Sheets/Slides auto-exported)
- `drive_upload_file` — upload a local file **or** inline text
- `drive_create_folder` — make a folder
- `drive_download_file` — save a Drive file to a local path

---

## Prerequisites

- **Node.js 18+** on the machine that runs Claude Desktop / Claude Code.
- You are an **admin (or normal user) of each Workspace** you want to connect.
- Install dependencies once:
  ```bash
  cd google-workspace-mcp
  npm install
  ```

---

## 1. Create one Google OAuth client (one-time, ~5 min)

You need a single **"Desktop app"** OAuth client. All three accounts will use it.

1. Go to <https://console.cloud.google.com/> and create (or pick) a project — e.g. `workspace-mcp`.
2. **Enable the Drive API:** APIs & Services → Library → search **Google Drive API** → **Enable**.
3. **Configure the consent screen:** APIs & Services → OAuth consent screen.
   - User type: **External** (works across all three domains). *(See the token-expiry note in [§6](#6-important-token-lifetime).)*
   - Fill in app name + your email; add the Drive scope `.../auth/drive` if prompted.
   - Under **Test users**, add all three emails: `drpaul@triadsynergy.com`, `contact@arclegacyfund.org`, `retreat@arcretreat.org`.
4. **Create the client:** APIs & Services → Credentials → **Create credentials → OAuth client ID** → Application type **Desktop app** → Create.
5. Copy the **Client ID** and **Client secret** — you'll paste them into the config next.

> A **Desktop app** client accepts loopback redirects (`http://127.0.0.1:<port>`)
> automatically, so there is nothing else to register.

---

## 2. Create your config file

Find your config directory (create it if needed):

- **Windows:** `%APPDATA%\google-workspace-mcp\` → `C:\Users\YOU\AppData\Roaming\google-workspace-mcp\`
- **macOS/Linux:** `~/.config/google-workspace-mcp/`

Copy [`config.example.json`](./config.example.json) into that folder as **`config.json`**
and fill in the client id/secret from step 1:

```json
{
  "defaultWorkspace": "arcretreat",
  "oauth": {
    "clientId": "1234....apps.googleusercontent.com",
    "clientSecret": "GOCSPX-...."
  },
  "scopes": ["https://www.googleapis.com/auth/drive"],
  "workspaces": {
    "triadsynergy":  { "label": "Triad Synergy",   "email": "drpaul@triadsynergy.com" },
    "arclegacyfund": { "label": "ARC Legacy Fund",  "email": "contact@arclegacyfund.org" },
    "arcretreat":    { "label": "ARC Retreat",      "email": "retreat@arcretreat.org" }
  }
}
```

*(Prefer a different location? Point `GWS_MCP_CONFIG` at your `config.json`. This
file holds a secret — keep it out of git; the repo's `.gitignore` already ignores
`config.json` and `tokens.json`.)*

---

## 3. Authorize each workspace (one-time per account)

Run these from the `google-workspace-mcp/` folder. Each opens a browser — **sign in
as the matching account** and approve:

```bash
npm run authorize -- arcretreat        # sign in as retreat@arcretreat.org
npm run authorize -- arclegacyfund     # sign in as contact@arclegacyfund.org
npm run authorize -- triadsynergy      # sign in as drpaul@triadsynergy.com
```

Each stores a refresh token in `tokens.json` next to your config. You'll see an
"unverified app" screen (expected for your own app) — click **Advanced → Go to
\<app\> (unsafe)** to continue. Re-run any time to re-authorize.

Verify:
```bash
node -e "import('./src/config.js').then(m=>{const c=m.loadConfig();console.log('Signed in:',Object.keys(m.loadTokens()))})"
```

---

## 4. Register with Claude

### Claude Desktop
Edit `claude_desktop_config.json` (Settings → Developer → Edit Config, or
`%APPDATA%\Claude\claude_desktop_config.json` on Windows) and merge the
`google-workspace` block from [`claude-desktop-config.example.json`](./claude-desktop-config.example.json).
Use the **full path** to `src/server.js` and (on Windows) escape backslashes as `\\`.
Restart Claude Desktop. You should see the `google-workspace` tools appear.

### Claude Code (CLI)
```bash
claude mcp add google-workspace -- node /full/path/to/agnt-neo/google-workspace-mcp/src/server.js
```
(Set `GWS_MCP_CONFIG` in the environment if your config isn't in the default dir.)

---

## 5. Using it

Just name the workspace in plain language:

- *"In **ARC Retreat**, search Drive for the 2025 retreat schedule."*
- *"List the root folder of **arclegacyfund** Drive."*
- *"Upload `F:\\Reports\\Q3.pdf` to **Triad Synergy** Drive."*
- *"Read that file and summarize it."*

If you don't name one, it uses the default (`arcretreat`). Ask Claude to run
`list_workspaces` any time to see what's connected.

---

## 6. Important: token lifetime

Because the OAuth app above is **External + "Testing"**, Google expires refresh
tokens after **7 days** — you'd re-run `npm run authorize` weekly. Two ways to
avoid that:

- **Publish the app** (OAuth consent screen → **Publish app**). Tokens then last
  indefinitely. Google may show a verification warning for the Drive scope; for
  personal admin use you can proceed past it.
- **Per-domain internal clients (no expiry, no warning):** since you're the admin
  of each domain, create a separate OAuth client *inside each Workspace's own
  Google Cloud project* set to **Internal** user type, and give each workspace its
  own `oauth` block in `config.json`:
  ```json
  "arcretreat": {
    "label": "ARC Retreat",
    "email": "retreat@arcretreat.org",
    "oauth": { "clientId": "...", "clientSecret": "..." }
  }
  ```

---

## 7. The Windows "Drive F:" mount (separate thing)

To get your Drives as drive letter **F:** in File Explorer:

1. Install **Google Drive for Desktop** from <https://google.com/drive/download>.
2. Sign in — the app holds **up to 4 accounts**, so add all three (Triad, Legacy
   Fund, Retreat). They share one mount.
3. Drive tray icon → ⚙ Preferences → ⚙ → **Google Drive streaming** → set
   **Drive letter = F:** → Save.

This MCP server and the F: mount are independent, but complementary: the server's
`drive_upload_file`/`drive_download_file` tools can read and write files right on
the `F:` drive.

---

## Security notes

- `config.json` (client secret) and `tokens.json` (refresh tokens) are **secrets**.
  They live in your user config dir and are git-ignored. Don't share or commit them.
- The default scope is full Drive (`.../auth/drive`) so uploads work. For read-only
  access, change `scopes` to `["https://www.googleapis.com/auth/drive.readonly"]`
  and re-authorize.
- To revoke: <https://myaccount.google.com/permissions> for each account, then
  delete its entry from `tokens.json`.
