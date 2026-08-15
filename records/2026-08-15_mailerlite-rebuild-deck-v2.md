# Session Record — 2026-08-15 (session 3, close) — TRIAD MailerLite rebuild + deck v2

**Objective:** Execute runbook §0 — rebuild capture assets in the real TRIAD
MailerLite account; then deck revisions from Paul's feedback.

**Decisions:**
- Root cause of silent reconnects: claude.ai caches OAuth grants per connector
  URL. Fix: fresh query param → `https://mcp.mailerlite.com/mcp?account=triadsynergy`.
- Trial account (paulphalvorson@gmail.com): Paul scheduled deletion; no waiting
  needed before reconnect — verified sequence, not clock.
- Deck framing: I·We·It replaced with "three questions" (decision register A1).
- $400,000 appears on the mandate slide **pending** Mike's written consent
  (due Tue Aug 18) — strike-reminder in speaker notes of both formats.
- Sunset date written as **Dec 2026** (Paul's note said Dec 2025; assumed typo — unconfirmed).

**Deliverables (all on `claude/triad-mailerlite-rebuild-l73qbq`):**
- MailerLite TRIAD acct 2577317: group `195871454532732922`, field `LinkedIn URL`
  `1428818`, form `195871469051316158` — IDs + share URL in runbook §0 (rewritten).
- `deck/form_qr.png` regenerated from new share URL, decode-verified.
- Both decks rebuilt to v2.1: engagement card (title), corrected timeline,
  new "Who remains — and the mandate" slide (team/mandate/deliverables),
  named tech stack, We definition, three-questions framing. Now 10 slides.
- Decision register: A1 framing amendment.

**Open loops:**
1. Paul (Mon): form content in dashboard (§1 copy, LinkedIn field) · double
   opt-in keep/kill decision · domain auth for triadsynergy.com · consent email
   to Mike (now must also cover the $400K on-slide) · confirm Dec 2026 sunset date.
2. Claude (Mon–Tue): kit email + +7-day follow-up drafts · MailerLite→Airtable
   wiring test · board-variant deck · Brand DNA refresh.
3. Branch unmerged — decide whether to PR/merge `claude/triad-mailerlite-rebuild-l73qbq`.

**Next session:** Kit email + follow-up drafts in the TRIAD account (the last
build step before Tuesday's deck freeze).

**Deviation log:** None material. Session paused deck work cleanly at Paul's
"pause here." Wrong-account saga closed: two failed re-auths, then the
query-param fix; protocol (auth check before create) held — no stray assets.
