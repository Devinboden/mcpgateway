// Live AFS probe. Hits a few read-only endpoints and prints the RAW envelope
// (status + key headers + body) so we can lock the field mappings.
//
// Run with Node's built-in env loader (Node 20.6+ / 24):
//   node --env-file=.env.local scripts/probe-live.mjs
//
// Optional overrides:  BANK=1 OBLIGOR=500123 OBLIGATION=1 OBLIGATION_ID=900045

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const user = process.env.AFS_USERNAME || "";
const pass = process.env.AFS_PASSWORD || "";
const channel = (process.env.AFS_APP_CHANNEL || "AFS-MCP").slice(0, 24);

const bank = process.env.BANK || process.env.AFS_SAMPLE_BANK || "1";
const obligor = process.env.OBLIGOR || process.env.AFS_SAMPLE_OBLIGOR || "500123";
const obligation = process.env.OBLIGATION || process.env.AFS_SAMPLE_OBLIGATION || "1";
const obligationId = process.env.OBLIGATION_ID || process.env.AFS_SAMPLE_OBLIGATION_ID || "900045";
const officer = process.env.AFS_SAMPLE_OFFICER || "JSMITH";

if (!base || !user || !pass) {
  console.error("Missing AFS_BASE_URL / AFS_USERNAME / AFS_PASSWORD in .env.local");
  process.exit(1);
}

const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
const months12Ago = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
const today = new Date().toISOString().slice(0, 10);

async function probe(label, path, query) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query || {})) if (v) url.searchParams.set(k, v);

  console.log(`\n${"=".repeat(72)}\n${label}\nGET ${url}`);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: auth,
        Accept: "application/json",
        "Afs-AppChannel": channel,
        "Afs-tranXref": `probe-${Date.now()}`,
      },
    });
    const text = await res.text();
    console.log(`HTTP ${res.status} ${res.statusText}  (${Date.now() - started}ms)`);
    console.log("Afs-taskId:", res.headers.get("Afs-taskId"), "| Afs-tranTime:", res.headers.get("Afs-tranTime"));
    try {
      const json = JSON.parse(text);
      const pretty = JSON.stringify(json, null, 2);
      console.log("BODY:\n" + (pretty.length > 4000 ? pretty.slice(0, 4000) + "\n…(truncated)" : pretty));
    } catch {
      console.log("BODY (non-JSON):\n" + text.slice(0, 1500));
    }
  } catch (err) {
    console.log("REQUEST FAILED:", err?.cause?.code || err?.code || err?.message);
    console.log("  → likely network reachability: this host may only be reachable from inside the corporate network / a specific egress IP.");
  }
}

console.log(`AFS probe → ${base}\nloan key: bank ${bank} / obligor ${obligor} / obligation ${obligation} (obligationId ${obligationId})`);

await probe("1. Borrower", `/obligors/get/${bank}-${obligor}`);
await probe("2. Obligation terms (commitment lives here)", `/obligations/getFullKey/${bank}-${obligor}-${obligation}`);
await probe("3. Exposure (array vs object?)", `/exposure/listObligor/${bank}-${obligor}`);
await probe("4. Balances (outstanding)", `/balances/listFullKey/${bank}-${obligor}-${obligation}`);
await probe("5. Financial history (runningBalance populated?)", `/financialHistory/effectiveFrom/${obligationId}`, {
  effectiveFrom: months12Ago,
  effectiveTo: today,
  sortOrder: "ASC",
});
await probe("6. Jobs by officer", `/jobs/listByOfficers`, { officer1Code: officer });

console.log(`\n${"=".repeat(72)}\nProbe complete.`);
