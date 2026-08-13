#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, loadTokens, resolveWorkspace } from './config.js';
import * as drive from './drive.js';

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
