import { google } from 'googleapis';
import { authedClient } from './auth.js';

export function calendarFor(config, key) {
  return google.calendar({ version: 'v3', auth: authedClient(config, key) });
}

/** Accept "YYYY-MM-DD" (all-day) or an ISO dateTime string. */
function toEventTime(value, timeZone) {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: value };
  const t = { dateTime: value };
  if (timeZone) t.timeZone = timeZone;
  return t;
}

export async function listCalendars(config, key) {
  const cal = calendarFor(config, key);
  const res = await cal.calendarList.list({ maxResults: 100 });
  return (res.data.items || []).map((c) => ({
    id: c.id,
    summary: c.summary,
    primary: c.primary || false,
    accessRole: c.accessRole,
    timeZone: c.timeZone,
  }));
}

export async function listEvents(config, key, { calendarId = 'primary', timeMin, timeMax, q, maxResults = 25 } = {}) {
  const cal = calendarFor(config, key);
  const res = await cal.events.list({
    calendarId,
    timeMin: timeMin || undefined,
    timeMax: timeMax || undefined,
    q: q || undefined,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: Math.min(Number(maxResults) || 25, 250),
  });
  return (res.data.items || []).map((e) => ({
    id: e.id,
    summary: e.summary,
    status: e.status,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    location: e.location,
    description: e.description,
    attendees: (e.attendees || []).map((a) => a.email),
    htmlLink: e.htmlLink,
  }));
}

export async function createEvent(config, key, {
  calendarId = 'primary', summary, description, location, start, end, timeZone, attendees,
} = {}) {
  if (!summary || !start || !end) throw new Error('summary, start, and end are required.');
  const cal = calendarFor(config, key);
  const requestBody = {
    summary,
    description,
    location,
    start: toEventTime(start, timeZone),
    end: toEventTime(end, timeZone),
  };
  if (Array.isArray(attendees) && attendees.length) {
    requestBody.attendees = attendees.map((email) => ({ email }));
  }
  const res = await cal.events.insert({ calendarId, requestBody, sendUpdates: 'none' });
  return { id: res.data.id, htmlLink: res.data.htmlLink, status: res.data.status };
}
