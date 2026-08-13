#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, loadTokens, resolveWorkspace } from './config.js';
import * as drive from './drive.js';
import * as gmail from './gmail.js';
import * as calendar from './calendar.js';

const config = loadConfig();

const workspaceProp = {
  type: 'string',
  enum: config.keys,
  description:
    `Which Google Workspace to target. One of: ` +
    config.keys.map((k) => `"${k}" (${config.workspaces[k].label || config.workspaces[k].email || ''})`).join(', ') +
    `. Defaults to "${config.defaultWorkspace}".`,
};

function ok(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] };
}
function fail(message) {
  return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}

const tools = [
  {
    name: 'list_workspaces',
    description:
      'List the configured Google Workspaces (Triad Synergy, ARC Legacy Fund, ARC Retreat) and whether each is authorized. ' +
      'Call this first to see valid workspace keys and which one is the default.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'drive_search',
    description: 'Search Drive files by text (matches file name and full text) within a workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        query: { type: 'string', description: 'Text to search for in file names and contents.' },
        q: { type: 'string', description: 'Advanced: a raw Google Drive query string, e.g. "mimeType=\'application/pdf\'". Overrides "query".' },
        pageSize: { type: 'number', description: 'Max results (default 25, max 100).' },
        orderBy: { type: 'string', description: 'Sort order, e.g. "modifiedTime desc" (default) or "name".' },
        includeTrashed: { type: 'boolean', description: 'Include trashed files (default false).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'drive_list_folder',
    description: 'List the direct contents of a Drive folder within a workspace. Use folderId "root" (default) for the top level of My Drive.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        folderId: { type: 'string', description: 'Folder id to list (default "root").' },
        pageSize: { type: 'number', description: 'Max results (default 50, max 200).' },
        includeTrashed: { type: 'boolean', description: 'Include trashed files (default false).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'drive_get_metadata',
    description: 'Get metadata for a single Drive file (name, type, size, owners, parents, links) within a workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        fileId: { type: 'string', description: 'The Drive file id.' },
      },
      required: ['fileId'],
      additionalProperties: false,
    },
  },
  {
    name: 'drive_read_file',
    description:
      'Read a file\'s contents as text within a workspace. Google Docs/Sheets/Slides are exported to text/CSV automatically. ' +
      'Binary files return a note instead — use drive_download_file for those.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        fileId: { type: 'string', description: 'The Drive file id.' },
        maxBytes: { type: 'number', description: 'Max characters to return (default 204800).' },
      },
      required: ['fileId'],
      additionalProperties: false,
    },
  },
  {
    name: 'drive_upload_file',
    description:
      'Upload/create a file in a workspace\'s Drive. Provide either "filePath" (a file on this machine, e.g. under the F: mount) or "content" (inline text).',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        name: { type: 'string', description: 'Name for the new Drive file. Defaults to the local file name, or "untitled.txt".' },
        filePath: { type: 'string', description: 'Absolute path to a local file to upload.' },
        content: { type: 'string', description: 'Inline text content to upload (used if filePath is omitted).' },
        mimeType: { type: 'string', description: 'MIME type, e.g. "application/pdf". Optional.' },
        parentFolderId: { type: 'string', description: 'Destination folder id. Optional (defaults to My Drive root).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'drive_create_folder',
    description: 'Create a new folder in a workspace\'s Drive.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        name: { type: 'string', description: 'Folder name.' },
        parentFolderId: { type: 'string', description: 'Parent folder id. Optional (defaults to My Drive root).' },
      },
      required: ['name'],
      additionalProperties: false,
    },
  },
  {
    name: 'drive_download_file',
    description: 'Download a Drive file to a local path on this machine within a workspace. Google-native files are exported to text/CSV.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        fileId: { type: 'string', description: 'The Drive file id.' },
        destPath: { type: 'string', description: 'Absolute local path to save the file to.' },
      },
      required: ['fileId', 'destPath'],
      additionalProperties: false,
    },
  },

  {
    name: 'gmail_search',
    description: 'Search Gmail for a workspace account using Gmail search syntax (e.g. "from:jane subject:invoice newer_than:7d"). Returns matching messages with sender, subject, date, and snippet.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        query: { type: 'string', description: 'Gmail search query, e.g. "from:board@ newer_than:30d".' },
        q: { type: 'string', description: 'Alias for query (raw Gmail search string).' },
        maxResults: { type: 'number', description: 'Max messages (default 20, max 100).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'gmail_read_message',
    description: 'Read a single Gmail message (headers + plain-text body) for a workspace account.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        messageId: { type: 'string', description: 'The Gmail message id (from gmail_search).' },
        maxBytes: { type: 'number', description: 'Max characters of body to return (default 204800).' },
      },
      required: ['messageId'],
      additionalProperties: false,
    },
  },
  {
    name: 'gmail_send_message',
    description: 'Send a plain-text email FROM a workspace account. Sends immediately — confirm recipient and content with the user before calling.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        to: { type: 'string', description: 'Recipient(s), comma-separated.' },
        subject: { type: 'string', description: 'Subject line.' },
        body: { type: 'string', description: 'Plain-text body.' },
        cc: { type: 'string', description: 'CC recipient(s), comma-separated. Optional.' },
        bcc: { type: 'string', description: 'BCC recipient(s), comma-separated. Optional.' },
      },
      required: ['to', 'subject', 'body'],
      additionalProperties: false,
    },
  },

  {
    name: 'calendar_list_calendars',
    description: 'List the calendars available to a workspace account (id, name, access role).',
    inputSchema: {
      type: 'object',
      properties: { workspace: workspaceProp },
      additionalProperties: false,
    },
  },
  {
    name: 'calendar_list_events',
    description: 'List/search calendar events for a workspace account within an optional time window.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        calendarId: { type: 'string', description: 'Calendar id (default "primary").' },
        timeMin: { type: 'string', description: 'ISO start of window, e.g. "2026-08-01T00:00:00Z". Optional.' },
        timeMax: { type: 'string', description: 'ISO end of window. Optional.' },
        q: { type: 'string', description: 'Free-text search over events. Optional.' },
        maxResults: { type: 'number', description: 'Max events (default 25, max 250).' },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'calendar_create_event',
    description: 'Create a calendar event on a workspace account. Use "YYYY-MM-DD" for all-day, or an ISO dateTime for timed events. Creates immediately — confirm details with the user before calling.',
    inputSchema: {
      type: 'object',
      properties: {
        workspace: workspaceProp,
        calendarId: { type: 'string', description: 'Calendar id (default "primary").' },
        summary: { type: 'string', description: 'Event title.' },
        description: { type: 'string', description: 'Event description. Optional.' },
        location: { type: 'string', description: 'Event location. Optional.' },
        start: { type: 'string', description: '"YYYY-MM-DD" (all-day) or ISO dateTime, e.g. "2026-08-20T14:00:00".' },
        end: { type: 'string', description: '"YYYY-MM-DD" (all-day) or ISO dateTime.' },
        timeZone: { type: 'string', description: 'IANA time zone for timed events, e.g. "America/Chicago". Optional.' },
        attendees: { type: 'array', items: { type: 'string' }, description: 'Attendee email addresses. Optional.' },
      },
      required: ['summary', 'start', 'end'],
      additionalProperties: false,
    },
  },
];

async function dispatch(name, args) {
  if (name === 'list_workspaces') {
    const tokens = loadTokens();
    return ok({
      defaultWorkspace: config.defaultWorkspace,
      workspaces: config.keys.map((k) => ({
        key: k,
        label: config.workspaces[k].label || null,
        email: config.workspaces[k].email || null,
        authorized: Boolean(tokens[k]?.refresh_token),
        default: k === config.defaultWorkspace,
      })),
    });
  }

  const key = resolveWorkspace(config, args.workspace);
  switch (name) {
    case 'drive_search': return ok(await drive.search(config, key, args));
    case 'drive_list_folder': return ok(await drive.listFolder(config, key, args));
    case 'drive_get_metadata': return ok(await drive.getMetadata(config, key, args));
    case 'drive_read_file': return ok(await drive.readFile(config, key, args));
    case 'drive_upload_file': return ok(await drive.uploadFile(config, key, args));
    case 'drive_create_folder': return ok(await drive.createFolder(config, key, args));
    case 'drive_download_file': return ok(await drive.downloadFile(config, key, args));
    case 'gmail_search': return ok(await gmail.searchMessages(config, key, args));
    case 'gmail_read_message': return ok(await gmail.readMessage(config, key, args));
    case 'gmail_send_message': return ok(await gmail.sendMessage(config, key, args));
    case 'calendar_list_calendars': return ok(await calendar.listCalendars(config, key, args));
    case 'calendar_list_events': return ok(await calendar.listEvents(config, key, args));
    case 'calendar_create_event': return ok(await calendar.createEvent(config, key, args));
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: 'google-workspace-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    return await dispatch(name, args);
  } catch (e) {
    return fail(e.message);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
// Protocol uses stdout; all logging must go to stderr.
console.error(
  `google-workspace-mcp running (stdio). Workspaces: ${config.keys.join(', ')}. Default: ${config.defaultWorkspace}.`
);
