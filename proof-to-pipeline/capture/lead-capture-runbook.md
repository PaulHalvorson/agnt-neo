# Lead Capture Runbook — EAIO Talk

Flow: **MailerLite form → "EAIO Gift Kit" group → kit email → Airtable Targets row →
scheduler bookings tracked in Touch Log.**

## 0. LIVE ASSETS (created 2026-08-15 in the TRIAD account, acct 2493801)

| Asset | ID / URL |
|---|---|
| Group `EAIO Gift Kit — 2026-08-21` | `195866738980554546` |
| Custom field `LinkedIn URL` | `1428749` (key `linkedin_url`) |
| Form `EAIO Gift Kit — talk capture` (embedded) | `195866746620478475` |
| **Hosted form / QR target** | https://preview.mailerlite.io/forms/2493801/195866746620478475/share |

QR (navy-on-white, in both decks): `../deck/form_qr.png`.
Still needed in the dashboard (form builder, ~5 min): add the LinkedIn URL field,
optional Location/Phone, headline + consent copy from §1 below. The share URL and
QR stay valid — content edits don't change the slug.
**Deliverability (Monday):** account signed up under paulphalvorson@gmail.com —
set the sender to DrPaul@TriadSynergy.com and authenticate the triadsynergy.com
domain (MailerLite → Settings → Domains) BEFORE any kit email goes out; mail
"from" a gmail.com address via MailerLite will fail DMARC.

## 1. MailerLite (Monday)

**Group:** `EAIO Gift Kit — 2026-08-21`

**Form** (embedded or hosted MailerLite form; hosted URL is what slide 9's QR encodes):
- Headline: "The EAIO Gift Kit — the prompt and the agent from today's talk"
- Fields: **Email** (MailerLite requires email as the subscriber key) + custom field
  **LinkedIn URL**. Copy above the fields: *"Leave whichever you prefer — a LinkedIn
  profile is fine if you'd rather not share email; use any address + your LinkedIn
  URL and I'll connect there."* Optional fields: Location, Phone (both marked
  optional — per decision, never required).
- Consent line: "You'll get the kit plus one follow-up. No sequence, no spam."

**Kit email** (instant, on join):
Subject: `Your EAIO kit: the Proof-to-Pipeline prompt + the listening-report agent`
Body: kit links (host both files on the future ALF/TRIAD web space or attach), one
paragraph of thanks, scheduler link, sign-off with tagline.

**Follow-up email** (+7 days, single):
Subject: `One week later — did the protocol run?`
Body: "If you tried P2P or the agent, I'd genuinely like to hear what broke."
+ availability line + scheduler link. Nothing after this — manual from here.

## 2. Airtable (Monday, ~30 min)

Base `TRIAD Revenue Generation` (appeXrwpcijE6XVY5) → table `Targets` (tbl3SwIr3Pwa3sJRY).
Per capture (manual entry from MailerLite subscriber list, or via automation later):

| Field | Value |
|---|---|
| Name / Organization / LinkedIn / Email | from form |
| Segment | LinkedIn (or fitting) |
| Motion | Warm network |
| Stage | Target |
| Warmth | Warm |
| Lead source | `EAIO talk 2026-08-21, MailerLite form` |
| Next action | `Confirm kit received; watch scheduler` |
| Next action date | +3 days |

## 3. Booking tracking

Scheduler: https://scheduler.zoom.us/paul-halvorson
On booking → Touch Log row (Channel: Call, Touch type: Inbound) → advance Stage.
Friday Review picks up: captures / kit sends / bookings. **Target: 3–5 booked calls
by Sept 20.**

## Privacy notes

- The capture list is TRIAD's, not ARC's — never merge with ARC/ALF lists.
- Honor the "one follow-up only" promise; manual outreach after must be personal.
