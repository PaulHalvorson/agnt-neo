---
name: record
description: Paul's chief-of-staff session bookend. Trigger whenever Paul types "Record" or "Record:" at the START or END of a working session — it ties the session to the chief-of-staff tracking layer to keep all work logged and Paul focused and on track. Also trigger on "session record", "log this session", or "close the record".
---

# Record — Session Bookend Protocol

"Record" is a protocol keyword, not a request for explanation. On trigger, determine
which bookend applies and execute it. If the word arrives alone mid-session, ask
which bookend Paul means (open or close) — one short question, then proceed.

## Session OPEN (start of session)

1. State the date/time and the session's stated objective in one line.
2. Pull active threads: open tasks, the most recent session record in `records/`,
   and any deadlines inside the next 7 days.
3. Confirm the day's top 3 priorities with Paul before deep work begins.
4. Flag anything that would pull the session off track ("deviation watch" — Paul's
   standing instruction: remind him when he is deviating so he chooses how to
   proceed).

## Session CLOSE (end of session)

Write `records/YYYY-MM-DD_<slug>.md` containing:

1. **Objective** — what the session set out to do
2. **Decisions** — each decision made, one line each
3. **Deliverables** — files created/changed, where they live (repo path, Drive, tool)
4. **Open loops** — what's unfinished, who owns it, by when
5. **Next session** — the single most important starting point
6. **Deviation log** — where the session wandered and what was chosen

Commit the record to the repo when in a git session. Keep records terse — a record
that takes >2 minutes to read won't be read.

## Standing rules

- Records accumulate in `records/`; never overwrite a prior record.
- Cross-reference, don't duplicate: link to decision registers and checklists
  rather than restating them.
- If a session ends without "Record", offer the close once — don't nag.
