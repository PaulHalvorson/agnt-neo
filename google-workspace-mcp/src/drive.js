import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { authedClient } from './auth.js';

const FIELDS =
  'id, name, mimeType, size, modifiedTime, createdTime, owners(emailAddress), parents, webViewLink, trashed';

const EXPORT_MAP = {
  'application/vnd.google-apps.document': 'text/plain',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

const MAX_TEXT = 200 * 1024;

function isProbablyText(mime = '') {
  return /^text\//.test(mime) ||
    /(json|xml|csv|javascript|x-sh|yaml|markdown|html|svg|x-www-form)/.test(mime);
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max) + `\n\n...[truncated at ${max} characters]`;
}

export function driveFor(config, key) {
  return google.drive({ version: 'v3', auth: authedClient(config, key) });
}

export async function search(config, key, { query, q, pageSize = 25, orderBy, includeTrashed = false } = {}) {
  const drive = driveFor(config, key);
  let qStr = q;
  if (!qStr) {
    const parts = [];
    if (query) {
      const safe = String(query).replace(/'/g, "\\'");
      parts.push(`(name contains '${safe}' or fullText contains '${safe}')`);
    }
    if (!includeTrashed) parts.push('trashed = false');
    qStr = parts.join(' and ') || 'trashed = false';
  }
  const res = await drive.files.list({
    q: qStr,
    pageSize: Math.min(Number(pageSize) || 25, 100),
    orderBy: orderBy || 'modifiedTime desc',
    fields: `files(${FIELDS}), nextPageToken`,
    corpora: 'allDrives',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });
  return res.data;
}

export async function listFolder(config, key, { folderId = 'root', pageSize = 50, includeTrashed = false } = {}) {
  const drive = driveFor(config, key);
  const parts = [`'${folderId}' in parents`];
  if (!includeTrashed) parts.push('trashed = false');
  const res = await drive.files.list({
    q: parts.join(' and '),
    pageSize: Math.min(Number(pageSize) || 50, 200),
    orderBy: 'folder,name',
    fields: `files(${FIELDS}), nextPageToken`,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  return res.data;
}

export async function getMetadata(config, key, { fileId } = {}) {
  if (!fileId) throw new Error('fileId is required.');
  const drive = driveFor(config, key);
  const res = await drive.files.get({
    fileId,
    fields: `${FIELDS}, description, fileExtension, md5Checksum, iconLink`,
    supportsAllDrives: true,
  });
  return res.data;
}

export async function readFile(config, key, { fileId, maxBytes = MAX_TEXT } = {}) {
  if (!fileId) throw new Error('fileId is required.');
  const drive = driveFor(config, key);
  const meta = (await drive.files.get({ fileId, fields: 'id, name, mimeType', supportsAllDrives: true })).data;
  const mime = meta.mimeType || '';

  if (mime.startsWith('application/vnd.google-apps')) {
    const exportMime = EXPORT_MAP[mime];
    if (!exportMime) throw new Error(`Cannot read Google-native file of type "${mime}" as text.`);
    const res = await drive.files.export({ fileId, mimeType: exportMime }, { responseType: 'text' });
    return { name: meta.name, sourceMimeType: mime, exportedAs: exportMime, content: truncate(String(res.data), maxBytes) };
  }

  const res = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' });
  const buf = Buffer.from(res.data);
  if (isProbablyText(mime)) {
    return { name: meta.name, mimeType: mime, content: truncate(buf.toString('utf8'), maxBytes) };
  }
  return {
    name: meta.name,
    mimeType: mime,
    bytes: buf.length,
    note: 'Binary file — use drive_download_file to save it to a local path.',
  };
}

export async function uploadFile(config, key, { name, filePath, content, mimeType, parentFolderId } = {}) {
  const drive = driveFor(config, key);
  const requestBody = {};
  let media;

  if (filePath) {
    if (!fs.existsSync(filePath)) throw new Error(`Local file not found: ${filePath}`);
    requestBody.name = name || path.basename(filePath);
    media = { mimeType: mimeType || undefined, body: fs.createReadStream(filePath) };
  } else if (content != null) {
    requestBody.name = name || 'untitled.txt';
    media = { mimeType: mimeType || 'text/plain', body: String(content) };
  } else {
    throw new Error('Provide either "filePath" (a local file) or "content" (inline text) to upload.');
  }
  if (parentFolderId) requestBody.parents = [parentFolderId];

  const res = await drive.files.create({ requestBody, media, fields: FIELDS, supportsAllDrives: true });
  return res.data;
}

export async function createFolder(config, key, { name, parentFolderId } = {}) {
  if (!name) throw new Error('name is required.');
  const drive = driveFor(config, key);
  const requestBody = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentFolderId) requestBody.parents = [parentFolderId];
  const res = await drive.files.create({ requestBody, fields: FIELDS, supportsAllDrives: true });
  return res.data;
}

export async function downloadFile(config, key, { fileId, destPath } = {}) {
  if (!fileId || !destPath) throw new Error('fileId and destPath are required.');
  const drive = driveFor(config, key);
  const meta = (await drive.files.get({ fileId, fields: 'name, mimeType', supportsAllDrives: true })).data;
  const mime = meta.mimeType || '';

  if (mime.startsWith('application/vnd.google-apps')) {
    const exportMime = EXPORT_MAP[mime];
    if (!exportMime) throw new Error(`Cannot download Google-native file "${mime}"; no export format available.`);
    const res = await drive.files.export({ fileId, mimeType: exportMime }, { responseType: 'arraybuffer' });
    const buf = Buffer.from(res.data);
    fs.writeFileSync(destPath, buf);
    return { savedTo: destPath, bytes: buf.length, exportedAs: exportMime };
  }

  const res = await drive.files.get({ fileId, alt: 'media', supportsAllDrives: true }, { responseType: 'arraybuffer' });
  const buf = Buffer.from(res.data);
  fs.writeFileSync(destPath, buf);
  return { savedTo: destPath, bytes: buf.length };
}
