// Officer-driven discovery: officer → workpackages → obligor → obligations.
// Prints raw AFS JSON at each hop so we can see real identifiers + field shapes.
//
//   node --env-file=.env.local scripts/discover.mjs <OFFICER_CODE>

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");
const officer = process.argv[2] || process.env.AFS_SAMPLE_OFFICER;

async function get(path, query) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query || {})) if (v) url.searchParams.set(k, v);
  const res = await fetch(url, {
    headers: { Authorization: auth, Accept: "application/json", "Afs-AppChannel": "AFS-MCP", "Afs-tranXref": `disc-${Date.now()}` },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

function show(label, r) {
  console.log(`\n— ${label} → HTTP ${r.status}`);
  console.log(typeof r.body === "string" ? r.body.slice(0, 300) : JSON.stringify(r.body, null, 2)?.slice(0, 2500));
}

console.log(`Discovery for officer "${officer}" on ${base}`);

// 1. Workpackages for the officer
const jobs = await get("/jobs/listByOfficers", { officer1Code: officer });
show("jobs/listByOfficers", jobs);

const list = jobs.body?.jobListByOfficers || [];
const withObligor = list.find((j) => j.obligorNumber);
if (!withObligor) {
  console.log("\nNo workpackage with an obligorNumber found for this officer. Try another officer code.");
  process.exit(0);
}

const bank = withObligor.bankId || withObligor.appId || "1";
const obligor = withObligor.obligorNumber;
console.log(`\n>>> Using bank ${bank} / obligor ${obligor} (from WP ${withObligor.id} — ${withObligor.customerName})`);

// 2. Borrower + obligor's instruments/obligations + exposure
show(`obligors/get/${bank}-${obligor}`, await get(`/obligors/get/${bank}-${obligor}`));
show(`financialInstrument/listOblnByObg/${bank}-${obligor}`, await get(`/financialInstrument/listOblnByObg/${bank}-${obligor}`));
show(`exposure/listObligor/${bank}-${obligor}`, await get(`/exposure/listObligor/${bank}-${obligor}`));

console.log("\nDone. Paste me the obligation number(s) you see above and I'll full-enrich one.");
