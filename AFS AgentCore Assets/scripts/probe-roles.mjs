// Probe which AFS login can read the role-gated (403-for-AFSDD301) endpoints.
// Read-only. Creds come from a JSON file OUTSIDE the repo (never committed):
//   ROLE_CREDS=/path/to/creds.json node scripts/probe-roles.mjs
// creds.json = [ { "label": "name", "username": "...", "password": "..." }, ... ]
//
// Signal: 403 = login lacks the role; 200/404/400/422 = login CAN reach it (has the role).
import { readFileSync } from "node:fs";

const base = (process.env.AFS_BASE_URL || "https://dd3.afsvision.us/webx/api/v1").replace(/\/$/, "");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

// Known sandbox keys (bank 5 · Piedmont 34160 · obligationId 30733 == obln 75).
const K = { bank: "5", obligor: "34160", obligationId: "30733", obln: "75", chargeCode: "1000", application: "1" };

// One representative endpoint per role-gated family.
const TARGETS = [
  ["accrualSchedules", `/accrualSchedules/list/${K.obligationId}-${K.chargeCode}?sortOrder=A`],
  ["billingSchedules", `/billingSchedules/list/${K.obligationId}-${K.chargeCode}?sortOrder=A`],
  ["repaymentSchedules", `/repaymentSchedules/list/${K.obligationId}?sortOrder=A`],
  ["primeSchedules", `/primeSchedules/list/${K.obligationId}-${K.chargeCode}?sortOrder=A`],
  ["rateIndicative", `/rateIndicative/list/${K.bank}?sortOrder=A`],
  ["penaltyDefinitions", `/penaltyDefinitions/listAllByBank/${K.bank}`],
  ["obligorDDAInstructions", `/obligorDDAInstructions/list/${K.bank}-${K.obligor}?sortOrder=A`],
  ["obligorWireInstructions", `/obligorWireInstructions/list/${K.bank}-${K.obligor}?sortOrder=A`],
  ["lateChargeControl", `/lateChargeControl/list/${K.bank}-${K.application}?sortOrder=A`],
  ["assetSales", `/assetSales/list/${K.obligationId}?sortOrder=A`],
  ["banks", `/banks/list?organizationId=1&sortOrder=A`],
  ["obligorApplications", `/obligorApplications/list/${K.bank}-${K.obligor}?sortOrder=A`],
  ["up/listRoles", `/up/listRoles`],
];

let n = 0;
const headers = (u, p) => ({
  Authorization: "Basic " + Buffer.from(`${u}:${p}`).toString("base64"),
  Accept: "application/json", "User-Agent": UA,
  "Afs-AppChannel": "AFS-ROLEPROBE", "Afs-tranXref": "rp-" + Date.now() + "-" + (++n),
});

async function probe(login) {
  const row = { label: login.label || login.username, user: login.username, results: {} };
  for (const [name, path] of TARGETS) {
    try {
      const r = await fetch(base + path, { headers: headers(login.username, login.password) });
      row.results[name] = r.status; // 401 = bad creds; 403 = no role; else = reachable
    } catch (e) {
      row.results[name] = "ERR";
    }
  }
  return row;
}

const credsFile = process.env.ROLE_CREDS;
if (!credsFile) { console.error("Set ROLE_CREDS=/path/to/creds.json (outside the repo)."); process.exit(1); }
const logins = JSON.parse(readFileSync(credsFile, "utf8"));

const rows = [];
for (const login of logins) rows.push(await probe(login));

// ---- report ----
const can = (s) => (s === 401 ? "AUTH" : s === 403 ? "  ·" : s === "ERR" ? "ERR" : " ✓");
const pad = (s, w) => String(s).padEnd(w);
console.log("\nReachability (✓ = can read · '·' = 403 no-role · AUTH = bad creds):\n");
console.log(pad("family", 24) + rows.map((r) => pad(r.label.slice(0, 10), 11)).join(""));
for (const [name] of TARGETS) {
  console.log(pad(name, 24) + rows.map((r) => pad(`${can(r.results[name])}(${r.results[name]})`, 11)).join(""));
}
console.log("\nPer-login summary:");
for (const r of rows) {
  const authFail = Object.values(r.results).every((s) => s === 401);
  const reachable = TARGETS.filter(([n2]) => ![401, 403, "ERR"].includes(r.results[n2])).map(([n2]) => n2);
  console.log(`  ${pad(r.label, 16)} ${authFail ? "BAD CREDS (all 401)" : `unlocks ${reachable.length}/${TARGETS.length}: ${reachable.join(", ") || "none"}`}`);
}
