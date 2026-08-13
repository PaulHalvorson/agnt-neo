import { google } from 'googleapis';
import { authedClient } from './auth.js';

const MAX_TEXT = 200 * 1024;

export function gmailFor(config, key) {
  return google.gmail({ version: 'v1', auth: authedClient(config, key) });
}

function header(headers, name) {
  const h = (headers || []).find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : null;
}

function decodeB64Url(data) {
  return Buffer.from(String(data).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

function encodeB64Url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Walk the MIME tree and pull out the best text representation. */
function extractText(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body?.data) return decodeB64Url(payload.body.data);
  if (Array.isArray(payload.parts)) {
    const plain = payload.parts.find((p) => p.mimeType === 'text/plain' && p.body?.data);
    if (plain) return decodeB64Url(plain.body.data);
    for (const part of payload.parts) {
      const t = extractText(part);
      if (t) return t;
    }
    const html = payload.parts.find((p) => p.mimeType === 'text/html' && p.body?.data);
    if (html) return decodeB64Url(html.body.data);
  }
  if (payload.mimeType === 'text/html' && payload.body?.data) return decodeB64Url(payload.body.data);
  return '';
}

export async function searchMessages(config, key, { query, q, maxResults = 20 } = {}) {
  const gmail = gmailFor(config, key);
  const list = await gmail.users.messages.list({
    userId: 'me',
    q: q || query || '',
    maxResults: Math.min(Number(maxResults) || 20, 100),
  });
  const ids = list.data.messages || [];
  const messages = [];
  for (const m of ids) {
    const md = await gmail.users.messages.get({
      userId: 'me',
      id: m.id,
      format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Date'],
    });
    const h = md.data.payload?.headers;
    messages.push({
      id: m.id,
      threadId: m.threadId,
      from: header(h, 'From'),
      to: header(h, 'To'),
      subject: header(h, 'Subject'),
      date: header(h, 'Date'),
      snippet: md.data.snippet,
    });
  }
  return { count: messages.length, messages };
}

export async function readMessage(config, key, { messageId, maxBytes = MAX_TEXT } = {}) {
  if (!messageId) throw new Error('messageId is required.');
  const gmail = gmailFor(config, key);
  const res = await gmail.users.messages.get({ userId: 'me', id: messageId, format: 'full' });
  const h = res.data.payload?.headers;
  let body = extractText(res.data.payload) || res.data.snippet || '';
  if (body.length > maxBytes) body = body.slice(0, maxBytes) + '\n\n...[truncated]';
  return {
    id: messageId,
    threadId: res.data.threadId,
    from: header(h, 'From'),
    to: header(h, 'To'),
    cc: header(h, 'Cc'),
    subject: header(h, 'Subject'),
    date: header(h, 'Date'),
    body,
  };
}

export async function sendMessage(config, key, { to, subject, body, cc, bcc } = {}) {
  if (!to || !subject) throw new Error('to and subject are required.');
  const gmail = gmailFor(config, key);
  const lines = [`To: ${to}`];
  if (cc) lines.push(`Cc: ${cc}`);
  if (bcc) lines.push(`Bcc: ${bcc}`);
  lines.push('MIME-Version: 1.0');
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push(`Subject: ${subject}`);
  lines.push('');
  lines.push(body || '');
  const raw = encodeB64Url(lines.join('\r\n'));
  const res = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return { id: res.data.id, threadId: res.data.threadId, labelIds: res.data.labelIds };
}
