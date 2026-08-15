// EAIO deck v1 — TRIAD Synergy I·We·It system
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_16x9"; // 10 x 5.625

const NAVY = "1F3A4D", TEAL = "2E6E6E", GOLD = "C08A2E", MIST = "EEF3F4",
      GREY = "888888", WHITE = "FFFFFF", INK = "22313D";
const F = "Calibri", FH = "Cambria";

// --- helpers -------------------------------------------------------------
function triadKey(s, active) {
  // small "you are here" triangle key, top-right: I(navy) top, We(teal) left, It(gold) right
  const cx = 9.28, cy = 0.42, r = 0.09, R = 0.24;
  const pts = { I: [cx, cy - R], We: [cx - R * 0.87, cy + R * 0.5], It: [cx + R * 0.87, cy + R * 0.5] };
  const col = { I: NAVY, We: TEAL, It: GOLD };
  for (const k of ["I", "We", "It"]) {
    const on = k === active;
    s.addShape("ellipse", {
      x: pts[k][0] - (on ? r * 1.5 : r), y: pts[k][1] - (on ? r * 1.5 : r),
      w: (on ? r * 3 : r * 2), h: (on ? r * 3 : r * 2),
      fill: { color: col[k], transparency: on ? 0 : 65 }, line: { type: "none" },
    });
  }
  s.addText(active, {
    x: cx - 0.5, y: cy + R + 0.06, w: 1.0, h: 0.22, align: "center",
    fontFace: F, fontSize: 9, bold: true, color: col[active], charSpacing: 2,
  });
}
function title(s, txt, color) {
  s.addText(txt, { x: 0.55, y: 0.32, w: 8.2, h: 0.62, fontFace: FH, fontSize: 30,
    bold: true, color: color || NAVY, margin: 0 });
}
function circ(s, x, y, d, color) {
  s.addShape("ellipse", { x, y, w: d, h: d, fill: { color }, line: { type: "none" } });
}

// --- S1 · Title ----------------------------------------------------------
let s = p.addSlide();
s.background = { color: NAVY };
// triad mark
circ(s, 4.62, 0.62, 0.34, WHITE); circ(s, 4.32, 1.02, 0.34, TEAL); circ(s, 4.92, 1.02, 0.34, GOLD);
s.addText("STARTING FROM NOTHING", { x: 0.5, y: 1.72, w: 9.0, h: 0.85, align: "center",
  fontFace: FH, fontSize: 44, bold: true, color: WHITE });
s.addText("Ending a 50-year organization well — with AI in the loop", {
  x: 0.5, y: 2.62, w: 9.0, h: 0.5, align: "center", fontFace: F, fontSize: 19, italic: true, color: GOLD });
s.addText([
  { text: "Paul Halvorson  ·  TRIAD Synergy", options: { fontSize: 15, bold: true, color: WHITE, breakLine: true } },
  { text: "Purpose Driven Action for Business and Community Leaders", options: { fontSize: 11.5, color: "B9C6CE", breakLine: true } },
  { text: "Simple Consulting · Elite AI Operators · August 21, 2026", options: { fontSize: 10.5, color: "8FA3AE" } },
], { x: 0.5, y: 4.28, w: 9.0, h: 1.0, align: "center", fontFace: F, lineSpacingMultiple: 1.25 });
s.addNotes("0:00–0:30. I'm going to show you a real engagement, the agent that runs part of it, and then give you both the method and the agent to take home.");

// --- S2 · The call (forensic open) --------------------------------------
s = p.addSlide();
s.background = { color: WHITE };
title(s, "The call");
const events = [
  ["October 2025", "Property sold. Retreat center goes dark."],
  ["The same season", "Executive Director and staff depart."],
  ["What's left on paper", "No succession plan. No operating playbook."],
  ["Who remains", "A five-person board — and no map."],
];
events.forEach((e, i) => {
  const y = 1.18 + i * 0.98;
  circ(s, 0.62, y + 0.1, 0.2, i === 3 ? GOLD : NAVY);
  s.addText([
    { text: e[0], options: { fontSize: 12, bold: true, color: i === 3 ? GOLD : NAVY, breakLine: true } },
    { text: e[1], options: { fontSize: 14.5, color: INK } },
  ], { x: 1.02, y: y - 0.08, w: 4.4, h: 0.9, fontFace: F, margin: 0, lineSpacingMultiple: 1.05 });
  if (i < 3) s.addShape("line", { x: 0.715, y: y + 0.34, w: 0, h: 0.62, line: { color: "C7D2D8", width: 1.5 } });
});
s.addShape("roundRect", { x: 5.75, y: 1.35, w: 3.75, h: 3.3, rectRadius: 0.09,
  fill: { color: NAVY }, line: { type: "none" }, shadow: { type: "outer", color: "9AA7AE", blur: 8, offset: 3, angle: 90, opacity: 0.35 } });
s.addText([
  { text: "What remained:", options: { fontSize: 14, color: "B9C6CE", breakLine: true } },
  { text: "50 years", options: { fontSize: 54, bold: true, color: WHITE, breakLine: true } },
  { text: "of relationships —", options: { fontSize: 16, color: WHITE, breakLine: true } },
  { text: "nowhere in one place.", options: { fontSize: 16, bold: true, color: GOLD } },
], { x: 5.95, y: 1.75, w: 3.35, h: 2.6, fontFace: F, lineSpacingMultiple: 1.15 });
s.addText("My job: reconstruct the organization's memory — then help it end well, on purpose.",
  { x: 0.62, y: 5.02, w: 8.8, h: 0.4, fontFace: F, fontSize: 13.5, italic: true, color: GREY, margin: 0 });
s.addNotes("0:30–2:00. The 60-second self-contained story. Founded 1977, inter-spiritual retreat community. Property sale closes a chapter; nobody owns the ending. This is a FORENSIC engagement: start from nothing, rebuild the record, then run the goodbye with intention.");

// --- S3 · Method: I·We·It ------------------------------------------------
s = p.addSlide();
s.background = { color: MIST };
title(s, "The method: I · We · It");
// triangle diagram left
const T = { x: 2.05, y: 1.55 }; // top (I)
circ(s, T.x - 0.42, T.y, 0.84, NAVY);
circ(s, T.x - 1.42, T.y + 1.75, 0.84, TEAL);
circ(s, T.x + 0.58, T.y + 1.75, 0.84, GOLD);
s.addText("I", { x: T.x - 0.42, y: T.y, w: 0.84, h: 0.84, align: "center", valign: "middle", fontFace: FH, fontSize: 26, bold: true, color: WHITE, margin: 0 });
s.addText("We", { x: T.x - 1.42, y: T.y + 1.75, w: 0.84, h: 0.84, align: "center", valign: "middle", fontFace: FH, fontSize: 22, bold: true, color: WHITE, margin: 0 });
s.addText("It", { x: T.x + 0.58, y: T.y + 1.75, w: 0.84, h: 0.84, align: "center", valign: "middle", fontFace: FH, fontSize: 22, bold: true, color: WHITE, margin: 0 });
s.addShape("line", { x: T.x - 0.62, y: T.y + 0.78, w: -0.28, h: 0.92, line: { color: GREY, width: 1.75 } });
s.addShape("line", { x: T.x + 0.62, y: T.y + 0.78, w: 0.28, h: 0.92, line: { color: GREY, width: 1.75 } });
s.addShape("line", { x: T.x - 0.52, y: T.y + 2.17, w: 1.04, h: 0, line: { color: GREY, width: 1.75 } });
const rows = [
  [NAVY, "I — the leader", "Succession, identity, letting go. Someone has to own the ending."],
  [TEAL, "We — the community", "Being heard before goodbye. Listening as infrastructure, not sentiment."],
  [GOLD, "It — the systems", "Data, money, tech. Institutional memory is a systems problem."],
];
rows.forEach((r, i) => {
  const y = 1.42 + i * 1.08;
  circ(s, 4.35, y + 0.05, 0.3, r[0]);
  s.addText([
    { text: r[1], options: { fontSize: 15.5, bold: true, color: r[0], breakLine: true } },
    { text: r[2], options: { fontSize: 12.5, color: INK } },
  ], { x: 4.85, y: y - 0.1, w: 4.6, h: 1.0, fontFace: F, margin: 0, lineSpacingMultiple: 1.08 });
});
s.addText("Transitions fail when you optimize one dimension and neglect the other two.",
  { x: 0.55, y: 5.02, w: 8.9, h: 0.4, fontFace: F, fontSize: 13.5, italic: true, color: NAVY, margin: 0 });
s.addNotes("2:00–3:00. This is the map for the next three slides — watch the key in the corner. The framework is the brand and the brand is the framework.");

// --- S4 · It — forensic reconstruction ----------------------------------
s = p.addSlide();
s.background = { color: WHITE };
title(s, "It — forensic reconstruction", GOLD);
triadKey(s, "It");
const steps = ["Fragments", "Merge + verify", "Dedupe review", "Segment", "Master V5"];
steps.forEach((t, i) => {
  const x = 0.55 + i * 1.78;
  s.addShape("roundRect", { x, y: 1.3, w: 1.52, h: 0.66, rectRadius: 0.07,
    fill: { color: i === steps.length - 1 ? GOLD : MIST }, line: { color: i === steps.length - 1 ? GOLD : "CBD8DB", width: 1 } });
  s.addText(t, { x, y: 1.3, w: 1.52, h: 0.66, align: "center", valign: "middle",
    fontFace: F, fontSize: 12.5, bold: true, color: i === steps.length - 1 ? WHITE : INK, margin: 0 });
  if (i < steps.length - 1) s.addText("→", { x: x + 1.5, y: 1.3, w: 0.3, h: 0.66, align: "center", valign: "middle", fontSize: 14, color: GREY, margin: 0 });
});
const stats = [
  ["~2,400", "contacts reconstructed into one verified master list (V1→V5)"],
  ["n = 472", "known opt-in supporters, imported with provenance"],
  ["n = 1,984", "unknown-connection contacts, segmented for consent-first outreach"],
];
stats.forEach((st, i) => {
  const x = 0.55 + i * 3.05;
  s.addShape("roundRect", { x, y: 2.35, w: 2.85, h: 1.7, rectRadius: 0.09, fill: { color: MIST }, line: { type: "none" } });
  s.addText([
    { text: st[0], options: { fontSize: 30, bold: true, color: GOLD, breakLine: true } },
    { text: st[1], options: { fontSize: 11.5, color: INK } },
  ], { x: x + 0.2, y: 2.5, w: 2.45, h: 1.45, fontFace: F, margin: 0, lineSpacingMultiple: 1.1 });
});
s.addText([
  { text: "Plus the operating layer nobody had: ", options: { fontSize: 13.5, color: INK } },
  { text: "new tech stack, new website, email infrastructure, donation rails.", options: { fontSize: 13.5, bold: true, color: NAVY } },
], { x: 0.55, y: 4.35, w: 8.9, h: 0.4, fontFace: F, margin: 0 });
s.addText("Institutional memory is a data problem before it is a story problem.",
  { x: 0.55, y: 5.02, w: 8.9, h: 0.4, fontFace: F, fontSize: 13.5, italic: true, color: GREY, margin: 0 });
s.addNotes("3:00–4:30. Mailing-list archaeology: exports, spreadsheets, paper fragments to one verified master. The segmentation matters: consent-first outreach to the unknown 1,984 — respect encoded in data structure. Work shown in ARC's own branding where screenshots appear.");

// --- S5 · We — Season of Listening --------------------------------------
s = p.addSlide();
s.background = { color: WHITE };
title(s, "We — the Season of Listening", TEAL);
triadKey(s, "We");
const big = [["2,436", "campaign launch emails delivered"], ["97.95%", "delivery rate on a rebuilt list"], ["31.5%", "opens — sector average is ~28.6%"]];
big.forEach((b, i) => {
  const x = 0.55 + i * 1.92;
  s.addText([
    { text: b[0], options: { fontSize: 30, bold: true, color: TEAL, breakLine: true } },
    { text: b[1], options: { fontSize: 10, color: INK } },
  ], { x, y: 1.22, w: 1.78, h: 1.25, fontFace: F, margin: 0, lineSpacingMultiple: 1.05 });
});
// scorecard mini-table
const rowsSc = [
  ["Stream", "Floor", "Target", "Stretch"],
  ["Survey responses", "60", "100", "150"],
  ["Circle RSVPs (each)", "10", "20–25", "30+"],
  ["Story-archive gifts", "10", "25", "50"],
];
const scY = 2.72, rh = 0.42, cw = [2.6, 0.95, 0.95, 0.95];
rowsSc.forEach((r, ri) => {
  let x = 0.55;
  r.forEach((c, ci) => {
    s.addShape("rect", { x, y: scY + ri * rh, w: cw[ci], h: rh,
      fill: { color: ri === 0 ? TEAL : ri % 2 ? MIST : WHITE }, line: { color: "D5DFE1", width: 0.75 } });
    s.addText(c, { x: x + 0.08, y: scY + ri * rh, w: cw[ci] - 0.16, h: rh, valign: "middle",
      align: ci === 0 ? "left" : "center", fontFace: F, fontSize: 11,
      bold: ri === 0, color: ri === 0 ? WHITE : INK, margin: 0 });
    x += cw[ci];
  });
});
s.addText("Listening Circles · community survey · story archive — a goodbye run on a scorecard.",
  { x: 0.55, y: 4.62, w: 5.4, h: 0.7, fontFace: F, fontSize: 12.5, italic: true, color: GREY, margin: 0 });
// fresh-numbers terminal card
s.addShape("roundRect", { x: 6.35, y: 1.22, w: 3.15, h: 3.6, rectRadius: 0.09, fill: { color: NAVY }, line: { type: "none" },
  shadow: { type: "outer", color: "9AA7AE", blur: 8, offset: 3, angle: 90, opacity: 0.35 } });
s.addText([
  { text: "● live — agent run", options: { fontSize: 10, color: "7BC9A3", breakLine: true } },
  { text: "FRI AUG 21 · 8:00 AM", options: { fontSize: 10, color: "8FA3AE", breakLine: true } },
  { text: " ", options: { fontSize: 6, breakLine: true } },
  { text: "[ FRESH NUMBERS ]", options: { fontSize: 16, bold: true, color: GOLD, breakLine: true } },
  { text: "filled morning-of from the", options: { fontSize: 10.5, color: WHITE, breakLine: true } },
  { text: "daily report agent —", options: { fontSize: 10.5, color: WHITE, breakLine: true } },
  { text: "including last night's", options: { fontSize: 10.5, color: WHITE, breakLine: true } },
  { text: "Listening Circle (Aug 20).", options: { fontSize: 10.5, bold: true, color: WHITE } },
], { x: 6.55, y: 1.45, w: 2.75, h: 3.2, fontFace: "Courier New", lineSpacingMultiple: 1.18 });
s.addNotes("4:30–6:00. Fill the box Friday morning from the ALF run. Say it plainly: 'These numbers are from last night's circle — my agent briefed me this morning.' Pause one beat.");

// --- S6 · The agent (dark, technical) -----------------------------------
s = p.addSlide();
s.background = { color: NAVY };
title(s, "The agent: a daily report with judgment", WHITE);
const streams = ["RSVP sheet (live)", "Survey sheet (live)", "Human-only stream", "Campaign stats (fallback-first)"];
streams.forEach((t, i) => {
  const y = 1.28 + i * 0.72;
  s.addShape("roundRect", { x: 0.55, y, w: 2.75, h: 0.56, rectRadius: 0.07, fill: { color: "2C4B60" }, line: { type: "none" } });
  s.addText(t, { x: 0.7, y, w: 2.5, h: 0.56, valign: "middle", fontFace: F, fontSize: 11.5, color: WHITE, margin: 0 });
  s.addShape("line", { x: 3.3, y: y + 0.28, w: 0.5, h: 1.56 - i * 0.72 + (i > 1 ? (i - 1.5) * -1.44 : 0), line: { type: "none" } });
});
// arrows into pipeline
s.addText("→", { x: 3.32, y: 2.3, w: 0.4, h: 0.5, fontSize: 20, color: GOLD, align: "center", valign: "middle", margin: 0 });
const pipe = [["Scorecard", "floor / target / stretch, pace not totals"], ["Standing flags", "carried forward until a human clears them"], ["Digest", "ghost-written in the client lead's own voice"]];
pipe.forEach((t, i) => {
  const y = 1.28 + i * 0.98;
  s.addShape("roundRect", { x: 3.85, y, w: 2.9, h: 0.82, rectRadius: 0.07, fill: { color: "16303F" }, line: { color: "3E5B6E", width: 1 } });
  s.addText([
    { text: t[0], options: { fontSize: 13, bold: true, color: WHITE, breakLine: true } },
    { text: t[1], options: { fontSize: 10, color: "AFC2CC" } },
  ], { x: 4.0, y: y + 0.08, w: 2.65, h: 0.7, fontFace: F, margin: 0, lineSpacingMultiple: 1.05 });
});
s.addShape("roundRect", { x: 7.0, y: 1.28, w: 2.45, h: 2.94, rectRadius: 0.09, fill: { color: GOLD }, line: { type: "none" } });
s.addText([
  { text: "THE HONESTY RULES", options: { fontSize: 12.5, bold: true, color: NAVY, breakLine: true } },
  { text: " ", options: { fontSize: 5, breakLine: true } },
  { text: "“Never claim a run happened unattended.”", options: { fontSize: 11.5, italic: true, color: NAVY, breakLine: true } },
  { text: " ", options: { fontSize: 5, breakLine: true } },
  { text: "“Surface discrepancies; never resolve them silently.”", options: { fontSize: 11.5, italic: true, color: NAVY, breakLine: true } },
  { text: " ", options: { fontSize: 5, breakLine: true } },
  { text: "“Count the community, not the insiders.”", options: { fontSize: 11.5, italic: true, color: NAVY } },
], { x: 7.18, y: 1.45, w: 2.1, h: 2.6, fontFace: F, lineSpacingMultiple: 1.12 });
s.addText("The engineering isn't the automation — it's the judgment encoded as rules. That's what makes a grieving board trust an agent.",
  { x: 0.55, y: 4.7, w: 8.9, h: 0.62, fontFace: F, fontSize: 14, italic: true, color: GOLD, margin: 0 });
s.addNotes("6:00–7:30. Technical meat for this room. Fallback-first design: assume the API fails, label data freshness. Human-in-the-loop by contract, not accident. This exact agent — sanitized — is in the kit.");

// --- S7 · I — ending well, forward --------------------------------------
s = p.addSlide();
s.background = { color: WHITE };
title(s, "I — ending well, forward");
triadKey(s, "I");
const arc = [["The ending", "Succession owned. Dissolution run with dignity, on a schedule."],
             ["The legacy", "A dedicated legacy fund distributing the remaining assets to mission-aligned partners — the community's story continues past the org."],
             ["The category", "This is repeatable work: transition · turnaround · succession, for small nonprofits, businesses, and public agencies."]];
arc.forEach((a, i) => {
  const y = 1.3 + i * 1.18;
  s.addShape("roundRect", { x: 0.55, y, w: 0.62, h: 0.62, rectRadius: 0.09, fill: { color: NAVY }, line: { type: "none" } });
  s.addText(String(i + 1), { x: 0.55, y, w: 0.62, h: 0.62, align: "center", valign: "middle", fontFace: FH, fontSize: 20, bold: true, color: WHITE, margin: 0 });
  s.addText([
    { text: a[0], options: { fontSize: 15.5, bold: true, color: NAVY, breakLine: true } },
    { text: a[1], options: { fontSize: 12.5, color: INK } },
  ], { x: 1.4, y: y - 0.05, w: 8.0, h: 1.1, fontFace: F, margin: 0, lineSpacingMultiple: 1.08 });
});
s.addText("Most consultants sell beginnings. Almost nobody owns endings — and every organization has one.",
  { x: 0.55, y: 4.95, w: 8.9, h: 0.45, fontFace: F, fontSize: 14, italic: true, color: GOLD, margin: 0 });
s.addNotes("7:30–8:30. The I of the triad: leadership through an ending. Name the fund amount verbally ONLY if Board Chair consent covers it; the slide stays general. Land the positioning line.");

// --- S8 · The protocol (reveal) -----------------------------------------
s = p.addSlide();
s.background = { color: MIST };
title(s, "The protocol: Proof-to-Pipeline");
const loop = [["1 · Interview", "10 questions + 5, one at a time"], ["2 · Build", "deck · promo · a working agent"], ["3 · Capture", "gift kit → form → CRM, tagged"], ["4 · Retro", "this session's transcript → v2"]];
loop.forEach((n, i) => {
  const x = 0.55 + i * 2.35;
  s.addShape("roundRect", { x, y: 1.5, w: 2.1, h: 1.3, rectRadius: 0.09, fill: { color: i === 3 ? GOLD : NAVY }, line: { type: "none" },
    shadow: { type: "outer", color: "AEB9BD", blur: 6, offset: 2, angle: 90, opacity: 0.3 } });
  s.addText([
    { text: n[0], options: { fontSize: 14.5, bold: true, color: WHITE, breakLine: true } },
    { text: n[1], options: { fontSize: 10.5, color: i === 3 ? "FFF3DE" : "B9C6CE" } },
  ], { x: x + 0.16, y: 1.66, w: 1.8, h: 1.0, fontFace: F, margin: 0, lineSpacingMultiple: 1.1 });
  if (i < 3) s.addText("→", { x: x + 2.08, y: 1.5, w: 0.3, h: 1.3, align: "center", valign: "middle", fontSize: 18, color: GREY, margin: 0 });
});
s.addText("This talk — the deck, the gifts, the follow-up you're about to get —", {
  x: 0.55, y: 3.35, w: 8.9, h: 0.42, align: "center", fontFace: F, fontSize: 16, color: INK, margin: 0 });
s.addText("was produced by the prompt in your inbox.", {
  x: 0.55, y: 3.77, w: 8.9, h: 0.55, align: "center", fontFace: FH, fontSize: 22, bold: true, color: NAVY, margin: 0 });
s.addText("And the transcript of this session feeds the next revision. The loop is the product.",
  { x: 0.55, y: 4.65, w: 8.9, h: 0.4, align: "center", fontFace: F, fontSize: 12.5, italic: true, color: GREY, margin: 0 });
s.addNotes("8:30–9:30. The meta moment — deliver plainly, no flourish. One beat after 'in your inbox.'");

// --- S9 · Close / gifts --------------------------------------------------
s = p.addSlide();
s.background = { color: NAVY };
s.addText("Two gifts. One field. Your choice.", { x: 0.5, y: 0.5, w: 9.0, h: 0.6, align: "center", fontFace: FH, fontSize: 28, bold: true, color: WHITE });
const gifts = [["THE PROMPT", "Proof-to-Pipeline — the parameterized prompt that produced this talk"], ["THE AGENT", "Transition Listening Report — the sanitized production skill, judgment rules intact"]];
gifts.forEach((g, i) => {
  const x = 0.7 + i * 3.1;
  s.addShape("roundRect", { x, y: 1.45, w: 2.85, h: 1.9, rectRadius: 0.09, fill: { color: "16303F" }, line: { color: GOLD, width: 1.25 } });
  s.addText([
    { text: g[0], options: { fontSize: 13, bold: true, color: GOLD, charSpacing: 2, breakLine: true } },
    { text: " ", options: { fontSize: 6, breakLine: true } },
    { text: g[1], options: { fontSize: 11.5, color: WHITE } },
  ], { x: x + 0.2, y: 1.66, w: 2.45, h: 1.5, fontFace: F, lineSpacingMultiple: 1.12 });
});
// QR — live MailerLite form (TRIAD account), regenerate via: python3 -c "import qrcode; ..." → form_qr.png
s.addShape("roundRect", { x: 7.0, y: 1.45, w: 2.3, h: 1.9, rectRadius: 0.09, fill: { color: WHITE }, line: { type: "none" } });
s.addImage({ path: __dirname + "/form_qr.png", x: 7.17, y: 1.5, w: 1.8, h: 1.8 });
s.addText([
  { text: "LinkedIn or email — whichever you prefer. ", options: { fontSize: 15, bold: true, color: WHITE } },
  { text: "The kit arrives within the hour.", options: { fontSize: 15, color: "B9C6CE" } },
], { x: 0.5, y: 3.62, w: 9.0, h: 0.45, align: "center", fontFace: F, margin: 0 });
s.addText("I take a small number of fractional engagements for organizations in transition — if you have one, or know one:",
  { x: 0.5, y: 4.25, w: 9.0, h: 0.4, align: "center", fontFace: F, fontSize: 12.5, italic: true, color: "B9C6CE", margin: 0 });
s.addText("scheduler.zoom.us/paul-halvorson", { x: 0.5, y: 4.68, w: 9.0, h: 0.5, align: "center", fontFace: FH, fontSize: 21, bold: true, color: GOLD, margin: 0 });
s.addText("Paul Halvorson · TRIAD Synergy · DrPaul@TriadSynergy.com · Purpose Driven Action for Business and Community Leaders",
  { x: 0.5, y: 5.22, w: 9.0, h: 0.3, align: "center", fontFace: F, fontSize: 9.5, color: "8FA3AE", margin: 0 });
s.addNotes("9:30–10:00. DROP THE FORM LINK IN ZOOM CHAT NOW. One availability line, no pitch, no price. Then: 'Questions — let's go.'");

p.writeFile({ fileName: "/home/user/agnt-neo/proof-to-pipeline/deck/EAIO_TriadSynergy_Deck_V1.pptx" })
  .then(() => console.log("written"));
