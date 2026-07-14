// End-to-end loan builder for dd3 — validation-loop driver.
// Posts RAW so we see ALL of AFS's messages[]; persists minted IDs to
// scripts/.build-state.json so stages chain.
//
//   node --env-file=.env.local scripts/build-loan.mjs <stage>
// stages: customer | obligor | reserve | orig | route | fund | simfund | readback
//
// Net-new borrower for the end-to-end build (per GOAL). Codes are ground-truth
// from valid_values.md / staged WPs 32645-46.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { buildPayload } from "../tools/createWorkpackage.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const STATE = join(__dir, ".build-state.json");
const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");

function loadState() { return existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {}; }
function saveState(s) { writeFileSync(STATE, JSON.stringify(s, null, 2)); }

async function afs(method, path, body) {
  const headers = {
    Authorization: auth, Accept: "application/json", "Content-Type": "application/json",
    "Afs-AppChannel": "AFS-BUILD", "Afs-tranXref": `bl-${Date.now()}`,
  };
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, statusText: res.statusText, data, raw: text };
}

function printMsgs(r) {
  console.log("HTTP", r.status, r.statusText);
  const msgs = (r.data && r.data.messages) || [];
  console.log(`messages (${msgs.length}):`);
  for (const m of msgs) console.log(`  [${m.severity}|${m.code ?? ""}] ${m.fieldId ? m.fieldId + ": " : ""}${m.text}`);
  if (typeof r.data === "string") console.log("BODY:", r.data.slice(0, 600));
}

const BORROWER = {
  primaryName: "*Cascade Build Co LLC", // sandbox requires '*' test-data prefix on Name
  shortName: "Cascade Build", // <=15
  taxId: "451234567",
};

const stages = {
  // 1) Create the customer (party). Required: organizationId, customer.name.fullName.
  async customer(state) {
    const body = {
      organizationId: "1",
      customer: {
        definition: "0",                  // real customers carry definition "0"
        type: "1",                        // party type 1 (from staged WP)
        shortName: BORROWER.shortName,
        taxId: BORROWER.taxId,
        classCode: "0",
        privacyCode: "0",
        languageId: "0",
        obligorRequired: "Y",
        name: { fullName: BORROWER.primaryName, type: "1" },
      },
    };
    console.log("POST /createCustomer\n", JSON.stringify(body, null, 1));
    const r = await afs("POST", "/createCustomer", body);
    printMsgs(r);
    const d = r.data || {};
    // createCustomer returns the minted customer id as `ilmId`.
    const id = d.ilmId ?? d.customer?.ilmId ?? d.nameId ?? d.primaryId;
    if (id) { state.customerIlmId = String(id); saveState(state); console.log("=> customerIlmId (ilmId)", id); }
    else { console.log("=> (no id in response; inspect raw)"); writeFileSync(join(__dir, ".last-customer.json"), r.raw); }
  },

  // 2) Create the obligor under bank 5, linked to the customer via ilmId.
  async obligor(state) {
    if (!state.customerIlmId) throw new Error("run `customer` stage first");
    const body = {
      obligor: {
        bankId: "5",
        shortName: state.shortName,
        type: "120",                      // obligor type (Mickey Mouse Pizza = 120)
        ilmId: state.customerIlmId,        // link to parent customer
        orgLevelData: { assignmentUnit: "1001500", officer1: "10111111" },
      },
    };
    console.log("POST /createObligor\n", JSON.stringify(body, null, 1));
    const r = await afs("POST", "/createObligor", body);
    printMsgs(r);
    const d = r.data || {};
    const num = d.obligorNumber ?? d.obligor?.obligorNumber ?? d.number;
    if (num) { state.obligorNumber = String(num); saveState(state); console.log("=> obligorNumber", num); }
    else { console.log("=> (no obligorNumber; inspect raw)"); writeFileSync(join(__dir, ".last-obligor.json"), r.raw); }
  },

  // 3) Reserve an obligation number (reserveType 2) for the new obligor.
  async reserve(state) {
    if (!state.obligorNumber) throw new Error("run `obligor` stage first");
    const body = {
      correlationId: `casc${Date.now()}`.slice(0, 15),
      bankId: "5",
      obligorNumber: state.obligorNumber,
      reserveType: 2,                      // 2 = obligation number
      expirationDays: 30,
    };
    console.log("POST /reserveNumber\n", JSON.stringify(body, null, 1));
    const r = await afs("POST", "/reserveNumber", body);
    printMsgs(r);
    const d = r.data || {};
    const rn = d.reserveNumber ?? d.reservedNumber ?? d.number;
    if (rn) { state.reservedObligation = String(rn); saveState(state); console.log("=> reservedObligation", rn); }
    else { console.log("=> (no reserveNumber; inspect raw)"); writeFileSync(join(__dir, ".last-reserve.json"), r.raw); }
  },

  // 4) Create the origination workpackage via the proven buildPayload().
  async orig(state) {
    if (!state.obligorNumber || !state.customerIlmId) throw new Error("run customer+obligor first");
    const args = {
      bank: "5",
      organizationId: "1",
      obligorNumber: state.obligorNumber,
      customerId: state.customerIlmId,     // party.customerId = obligor nameId (= customer ilmId)
      borrowerName: state.borrowerName,     // "*Cascade Build Co LLC"
      obligorType: "120",
      officer: "10111111",
      assignmentUnit: "1001500",
      application: "1",
      applicationCollected: "Y",
      description: "Origination — Cascade Build Co LLC (full E2E build)",
      workflow: "origination",
      facilities: [
        {
          name: "Term Loan",
          amount: 2000000,
          currency: "USD",
          productStructure: "F",
          productCode: "200",
          requestType: "NA",
          obligationType: "3040",
          revolvingType: "N",
          securedCode: "1",
        },
      ],
    };
    const payload = buildPayload(args);
    writeFileSync(join(__dir, ".orig-payload.json"), JSON.stringify(payload, null, 2));
    console.log("POST /wp/commercialOrig (payload saved to .orig-payload.json)");
    const r = await afs("POST", "/wp/commercialOrig", payload);
    printMsgs(r);
    const d = r.data || {};
    const id = d.id ?? d.workpackageId;
    if (id) { state.origWpId = String(id); saveState(state); console.log("=> origWpId", id); }
    else { console.log("=> (no WP id; inspect raw)"); writeFileSync(join(__dir, ".last-orig.json"), r.raw); }
  },

  // 4-full) POST a fresh origination with ALL booking-required request fields set.
  async origfull(state) {
    if (!state.obligorNumber || !state.customerIlmId) throw new Error("run customer+obligor first");
    const COLL = process.env.COLL_TYPE || "2084";
    const PURPOSE = process.env.PURPOSE_CODE || "1";        // RE: 1805 Commercial Loans Secured By RE
    const SOURCE = process.env.APPL_SOURCE || "1";
    const APPLDATE = process.env.APPL_DATE || "2024-06-25";
    const OBLN_TYPE = process.env.OBLN_TYPE || "3015";      // 3015 = "Loan- Term" (directly bookable, single-level)
    const AMOUNT = Number(process.env.AMOUNT || 2000000);
    const NAME = process.env.FAC_NAME || "RE Term Loan";
    const DESC = process.env.DESC || "Origination — Cascade Build Co LLC (real estate term loan, for booking)";
    const args = {
      bank: "5", organizationId: "1",
      obligorNumber: state.obligorNumber, customerId: state.customerIlmId,
      borrowerName: state.borrowerName, obligorType: "120",
      officer: "10111111", assignmentUnit: "1001500", application: "1", applicationCollected: "Y",
      description: DESC,
      workflow: "origination",
      facilities: [{ name: NAME, amount: AMOUNT, currency: "USD", productStructure: "F",
        productCode: "200", requestType: "NA", obligationType: OBLN_TYPE, revolvingType: "N",
        securedCode: "1", collateralType: COLL, purposeCode: PURPOSE }],
    };
    const payload = buildPayload(args);
    for (const req of payload.deal.requests) {
      req.initialApplAmt = AMOUNT; req.initialApplAmtCur = "USD";
      req.initialApplSource = SOURCE; req.initialApplDate = APPLDATE; req.applicationCDate = APPLDATE;
      req.collateralType = COLL; req.purposeCode = PURPOSE;
    }
    writeFileSync(join(__dir, ".origfull-payload.json"), JSON.stringify(payload, null, 2));
    console.log(`POST /wp/commercialOrig (full)  oblnType=${OBLN_TYPE} amt=${AMOUNT} coll=${COLL} purpose=${PURPOSE} source=${SOURCE}`);
    const r = await afs("POST", "/wp/commercialOrig", payload);
    printMsgs(r);
    const id = (r.data || {}).id;
    if (id) { state.origFullWpId = String(id); state.origWpId = String(id); saveState(state); console.log("=> origFullWpId/origWpId", id); }
  },

  // 4b) Enrich the deal request with the fields the booking step requires.
  //     GET the WP, patch deal.requests[*], PUT it back. Picklist probe values via env.
  async enrich(state) {
    if (!state.origWpId) throw new Error("run `orig` stage first");
    const id = state.origWpId;
    const g = await afs("GET", `/wp/commercialOrig/${id}`);
    const wp = g.data;
    const reqs = wp?.deal?.requests || [];
    const COLL = process.env.COLL_TYPE || "2084";
    const PURPOSE = process.env.PURPOSE_CODE || "1";
    const SOURCE = process.env.APPL_SOURCE || "1";
    const APPLDATE = process.env.APPL_DATE || "2024-06-25";
    for (const req of reqs) {
      req.initialApplAmt = 2000000;
      req.initialApplAmtCur = "USD";
      req.collateralType = COLL;
      req.purposeCode = PURPOSE;
      req.initialApplSource = SOURCE;
      req.initialApplDate = APPLDATE;
      req.applicationCDate = APPLDATE;
    }
    console.log(`PUT /wp/commercialOrig/${id}  (collateralType=${COLL} purposeCode=${PURPOSE} initialApplSource=${SOURCE})`);
    const r = await afs("PUT", `/wp/commercialOrig/${id}`, wp);
    printMsgs(r);
    writeFileSync(join(__dir, ".last-enrich.json"), r.raw.slice(0, 4000));
  },

  // 5) Route the workpackage toward booking. Auto-flags let AFS visit/ack/override
  //    steps automatically. targetStage overridable via TARGET_STAGE env.
  async route(state) {
    if (!state.origWpId) throw new Error("run `orig` stage first");
    const targetStage = process.env.TARGET_STAGE || undefined;
    const body = {
      autoRoutingFlags: {
        autoVisitStep: "Y",
        autoAcknowledgeField: "Y",
        autoOverride: "Y",
      },
      workpackage: { id: state.origWpId, ...(targetStage ? { targetStage } : {}) },
    };
    console.log("POST /route\n", JSON.stringify(body, null, 1));
    const r = await afs("POST", "/route", body);
    console.log("HTTP", r.status, r.statusText);
    writeFileSync(join(__dir, ".last-route.json"), r.raw);
    const d = r.data || {};
    const wp = d.workpackage || {};
    console.log("routeStatus:", wp.routeStatus, "|", wp.routeStatusDescription, "| wpStatus:", wp.wpStatus, wp.wpStatusLit);
    const msgs = wp.messages || d.messages || [];
    console.log(`messages (${msgs.length}):`);
    for (const m of msgs) console.log(`  [${m.severity}|${m.code ?? ""}] ${m.text}`);
    const units = d.units || [];
    for (const u of units) {
      const att = (u.routingAttempts || []);
      console.log(`unit ${u.unitOid} ${u.description}: attempts=${att.length}`,
        JSON.stringify(u.summary || {}).slice(0, 200));
      for (const a of att) {
        console.log(`   attempt success=${a.success} routeTo=${JSON.stringify(a.routeTo)}`);
        for (const m of (a.messages || [])) console.log(`     [${m.severity}|${m.code ?? ""}] ${m.text}`);
      }
    }
  },
};

const stage = process.argv[2];
if (!stages[stage]) { console.error("unknown stage:", stage, "\nstages:", Object.keys(stages).join(", ")); process.exit(1); }
const state = loadState();
await stages[stage](state);
