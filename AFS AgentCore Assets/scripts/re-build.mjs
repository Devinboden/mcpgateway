// Build a bookable REAL ESTATE term loan and API-drive it to Credit Approval,
// leaving exactly ONE UI step (the credit decision). Then the rest can finish.
//   node --env-file=.env.local scripts/re-build.mjs
//
// Uses the cleaned-PUT technique (strip citizenship/addresses refList that corrupts
// the round-trip) to set scalar fields + the approval authority, and routes via API.
// Does NOT PUT a decision (append-only + two-sided XOID linkage => UI only).

import { buildPayload } from "../tools/createWorkpackage.js";
import { writeFileSync } from "node:fs";

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");
const H = () => ({ Authorization: auth, Accept: "application/json", "Content-Type": "application/json",
  "Afs-AppChannel": "AFS-REBUILD", "Afs-tranXref": `rb-${Date.now()}-${Math.floor(performance.now())}` });

const clean = (wp) => { for (const p of (wp.parties || [])) { delete p.citizenship; delete p.addresses;
  delete p.billingAddresses; delete p.customerCFData; for (const o of (p.obligors || [])) { delete o.obligorCFData;
  o.finStmt = o.finStmt || {}; if (o.finStmt.statementYear == null) o.finStmt.statementYear = 2024; } } return wp; };
const get = async (id) => (await fetch(`${base}/wp/commercialOrig/${id}`, { headers: H() })).json();
const put = async (id, wp) => { const r = await fetch(`${base}/wp/commercialOrig/${id}`, { method: "PUT", headers: H(), body: JSON.stringify(clean(wp)) }); return { status: r.status, data: await r.json() }; };
const route = async (id, target) => { const r = await fetch(`${base}/route`, { method: "POST", headers: H(),
  body: JSON.stringify({ autoRoutingFlags: { autoVisitStep: "Y", autoAcknowledgeField: "Y", autoOverride: "Y" }, workpackage: { id, targetStage: target } }) });
  const d = await r.json(); const u = (d.units || [])[0] || {}; const s = u.summary || {};
  return { status: s.routeStatusDescription, end: (s.endState || {}).stageLit, msgs: (u.messages || []).map(m => `[${m.code}] ${m.text}`) }; };
const msgs = (r) => (r.data.messages || []).map(m => `  [${m.severity}|${m.code}] ${m.text}`.slice(0, 140)).join("\n");

// state from prior build (reuse obligor 34392 / customer 46934)
const obligorNumber = "34392", customerId = "46934", borrowerName = "*Cascade Build Co LLC";

// 1) POST a fresh RE term-loan origination, all app-stage fields set.
const args = {
  bank: "5", organizationId: "1", obligorNumber, customerId, borrowerName, obligorType: "120",
  officer: "10111111", assignmentUnit: "1001500", application: "1", applicationCollected: "Y",
  description: "Origination — Cascade Build Co LLC (CRE term loan, API-driven)", workflow: "origination",
  facilities: [{ name: "CRE Term Loan", amount: 2000000, currency: "USD", productStructure: "C",
    productCode: "200", requestType: "NA", obligationType: "3015", revolvingType: "N", securedCode: "1",
    collateralType: "2084", purposeCode: "1805" }],  // productStructure C = Standalone Loan (directly bookable)
};
const payload = buildPayload(args);
for (const req of payload.deal.requests) { req.initialApplAmt = 2000000; req.initialApplAmtCur = "USD";
  req.initialApplSource = "110"; req.initialApplDate = "2024-06-25"; req.applicationCDate = "2024-06-25";
  req.collateralType = "2084"; req.purposeCode = "1805"; req.durationCode = "3"; }
const pr = await fetch(`${base}/wp/commercialOrig`, { method: "POST", headers: H(), body: JSON.stringify(payload) });
const wpId = (await pr.json()).id;
console.log("1) POST origination -> WP", wpId, "(HTTP", pr.status + ")");

// 2) Route app -> preApproval
let rt = await route(wpId, "bookingStage");
console.log("2) route:", rt.status, "-> end:", rt.end);

// 3) Set durationCode (in case) + add approval authority (ONE approver), cleaned PUT.
let wp = await get(wpId);
for (const req of (wp.deal.requests || [])) req.durationCode = "3";
wp.deal.approvalReq = wp.deal.approvalReq || {};
wp.deal.approvalReq.approvers = [{ approvalAuthority: "0100", approvalType: "P", isHighestLvl: true, requestApprover: 181 }];
wp.deal.approvalReq.isLenderApprovalRequired = false;
let p3 = await put(wpId, wp);
console.log("3) PUT durationCode + approver -> HTTP", p3.status);
console.log(msgs(p3));

// 4) Route preApproval -> Credit Approval
rt = await route(wpId, "bookingStage");
console.log("4) route:", rt.status, "-> end:", rt.end);
for (const m of rt.msgs) console.log("   ", m);

const after = await get(wpId);
console.log("\n=> WP", wpId, "at stage:", (after.units?.[0] || {}).stage,
  "| approvers:", ((after.deal.approvalReq || {}).approvers || []).length,
  "| decisions:", (after.deal.decisions || []).length, "| lock:", after.lockUserId);
console.log("=> NEXT: enter ONE credit decision via the UI (Credit Approval > Decision Management) as AFSDD302, then route to book.");
writeFileSync(new URL("./.re-wpid", import.meta.url), String(wpId));
