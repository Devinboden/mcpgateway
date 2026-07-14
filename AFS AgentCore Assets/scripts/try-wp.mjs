// Live tester for create_workpackage: builds the payload and POSTs it raw so we
// see ALL of AFS's validation messages (afsClient throws on error-severity).
//   node --env-file=.env.local scripts/try-wp.mjs
// Override codes via env, e.g. PRODUCT_CODE=210 OBLN_TYPE=3010 node ... try-wp.mjs

import { buildPayload } from "../tools/createWorkpackage.js";

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");

const args = {
  bank: "5",
  obligorNumber: "34160",
  borrowerName: "Piedmont PCI",
  officer: "10111111",
  assignmentUnit: process.env.ASSIGN_UNIT || "1001500",
  organizationId: process.env.ORG_ID || undefined,
  application: "1",
  description: "Post Approval — API staged (Piedmont test)",
  facilities: [
    {
      name: "Revolving LOC",
      amount: 3000000,
      revolvingType: process.env.REVOLVE || "R",
      productStructure: process.env.PROD_STRUCT || "F",
      productCode: process.env.PRODUCT_CODE || "200",
      obligationType: process.env.OBLN_TYPE || "3015",
      requestType: process.env.REQ_TYPE || "NA",
    },
  ],
};

const payload = buildPayload(args);
const res = await fetch(base + "/wp/commercialPost", {
  method: "POST",
  headers: { Authorization: auth, "Content-Type": "application/json", Accept: "application/json", "Afs-AppChannel": "AFS-MCP", "Afs-tranXref": `wp-${Date.now()}` },
  body: JSON.stringify(payload),
});
const text = await res.text();
let body; try { body = JSON.parse(text); } catch { body = text; }
console.log("HTTP", res.status, res.statusText);
console.log("created id:", body?.id);
const msgs = body?.messages || [];
console.log(`messages (${msgs.length}):`);
for (const m of msgs) console.log(`  [${m.severity}] ${m.fieldId ? m.fieldId + ": " : ""}${m.text}`);
if (typeof body === "string") console.log(body.slice(0, 500));
