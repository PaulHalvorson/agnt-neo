# Proof-to-Pipeline (P2P)

**A reusable prompt that turns finished client work into promotional assets and a measurable prospect pipeline.**

Version 1.0 · TRIAD Synergy · August 2026
License: share freely with attribution — "Proof-to-Pipeline by Paul Halvorson, TRIAD Synergy"

---

## What it does

You point it at a body of completed (or in-flight) client work. It interviews you — one
question at a time, with concrete options — until it understands your goals, audience,
constraints, and brand. Then it guides the build of three deliverables plus the machinery
to harvest interest:

1. A **presentation** sized to your slot, in your brand system
2. **Promotional materials** describing your services
3. A **replicable protocol** (agent- or code-based) so the work repeats
4. A **capture loop**: gift artifacts → contact form → CRM, with provenance tagging

It closes with a **retro phase**: the delivered presentation's transcript feeds a
continuous-improvement pass over the deck and the protocol itself.

## The prompt

> Act as an expert in project setup and workflow optimization using AI tools like Claude
> Chat, Cowork and/or Code, with a focus on emerging best practices for data integration,
> client project execution and professional presentation development. Guide and educate me
> about what we are doing (provide both a simple explanation and a technical explanation).
>
> ### Task
> Guide me in setting up a project that leverages my available data sources and the work
> completed to date for **[CLIENT / PROJECT]**. The goal is **[GOAL — e.g., organize and
> utilize this data effectively, ultimately creating a deliverable that promotes my
> professional services and supports business growth]**.
>
> ### Instructions
> 1. **Interview Design Stage**
>    - Design an interview process to extract the information needed for project setup.
>    - Ask iterative questions, ONE at a time, about my data, goals, and deliverable
>      requirements.
>    - For each question provide four response options: three specific choices and one
>      open-ended or hybrid option.
>    - Refine each question based on my responses before moving to the next.
>    - After **[N=10]** questions, summarize progress at a high level and suggest up to
>      **[M=5]** additional questions; I decide whether to continue or complete the
>      interview stage.
> 2. **Project Development Stage** — from the interview insights, guide the build of:
>    - A **[LENGTH]** presentation plus **[Q&A LENGTH]** to showcase **[SUBJECT]** to
>      **[AUDIENCE]**.
>    - Promotional materials that describe my services and demonstrate their value.
>    - A replicable protocol or process (agent- or code-based) I can apply to future
>      projects to teach, share and promote my work.
> 3. **Deliverable Requirements**
>    - The deck must be visually engaging, concise, and illustrative of my work.
>    - Use the branding and formatting requirements of **[BRAND SYSTEM]**.
>    - Include **[SHARED ARTIFACTS — e.g., one prompt and one agent]** as examples of my
>      expertise to share with prospects at the end.
>    - Provide a mechanism for prospects to submit **[CAPTURE FIELDS]** (e.g., via
>      **[FORM TOOL]**) in exchange for **[THE EXCHANGE]**, captured into
>      **[CRM/DATABASE]**. Include a link to my calendar: **[SCHEDULER URL]**.
> 4. **Retro Stage** — after delivery, take the session transcript and run it through a
>    continuous-improvement pass: what landed, what dragged, what questions came up →
>    revise the deck, the promo materials, and this protocol.
>
> ### Approach
> - Use emerging best practices for AI-driven project management; confirm which folders,
>   drives, and data sources the AI can actually reach before planning around them.
> - Provide actionable, step-by-step guidance for each stage.
> - Offer creative solutions; ensure deliverables promote my work and support my goals.
> - Keep the protocol adaptable for future projects.
> - Along the way, ask questions, offer suggestions, and remind me when I am deviating so
>   I choose how best to proceed.

## The slots

| Slot | This project's value (worked example) |
|---|---|
| CLIENT / PROJECT | ARC Retreat Community + ARC Legacy Fund |
| GOAL | Organize the ARC corpus; create deliverables promoting professional services |
| LENGTH / Q&A | 10 minutes + 5 Q&A |
| SUBJECT | Professional services (AI-informed fractional executive) |
| AUDIENCE | Simple Consulting — Elite AI Operators (peers) |
| BRAND SYSTEM | TRIAD Synergy I·We·It (navy/teal/gold); client work in client branding |
| SHARED ARTIFACTS | One prompt (this one) + one agent (sanitized listening-report skill) |
| CAPTURE FIELDS | LinkedIn **or** email (one required, respondent's choice) |
| FORM TOOL / CRM | MailerLite → Airtable (Targets table, Lead source tagged) |
| SCHEDULER URL | https://scheduler.zoom.us/paul-halvorson |
| N / M | 10 / 5 |

## Operating notes (learned in production)

- **Recon before interviewing.** Have the AI inventory reachable data sources first;
  questions grounded in what actually exists get better answers than generic ones.
- **Evidence beats opinion at forks.** When positioning is contested, pull the live
  pipeline/CRM and let the data argue.
- **One question at a time is a feature.** Batching questions gets them dismissed.
- **Confidentiality is a stage-gate.** Read the actual client agreement before building
  public-facing assets from client work; work-product and IP clauses bite harder than
  confidentiality clauses.
- **Cloud source of truth.** Anything that exists only on a laptop gets promoted to a
  synced cloud source before the protocol depends on it.
