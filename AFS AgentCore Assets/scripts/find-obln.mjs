// Find the obligation number(s) under a bank/obligor by trying the instrument
// list variants and scanning getFullKey for small obligation numbers.
//   node --env-file=.env.local scripts/find-obln.mjs <bank> <obligor>

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");
const bank = process.argv[2] || "5";
const obligor = process.argv[3] || "13";

async function get(path, query) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query || {})) if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    headers: { Authorization: auth, Accept: "application/json", "Afs-AppChannel": "AFS-MCP", "Afs-tranXref": `find-${Date.now()}-${Math.random()}` },
  });
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

// Try the instrument-list variants (with application + rowLimit hints).
for (const path of [
  `/financialInstrument/listAllByObligor/${bank}-${obligor}`,
  `/financialInstrument/listOblnByObg/${bank}-${obligor}`,
]) {
  const r = await get(path, { rowLimit: 50 });
  console.log(`\n${path} → ${r.status}`);
  if (r.status === 200) {
    const rows = r.body?.financialInstrument || [];
    console.log(rows.map((x) => ({ fiNumber: x.fiNumber, application: x.application, type: x.type, shortName: x.shortName, nickname: x.nickname })));
  } else {
    console.log(JSON.stringify(r.body)?.slice(0, 200));
  }
}

// Scan obligation numbers via the full key.
console.log(`\nScanning obligations/getFullKey/${bank}-${obligor}-N …`);
const found = [];
for (let n = 1; n <= 12; n++) {
  const r = await get(`/obligations/getFullKey/${bank}-${obligor}-${n}`);
  if (r.status === 200 && r.body?.obligations) {
    const o = r.body.obligations;
    found.push(n);
    console.log(`  obligation ${n}: id=${o.obligationId} type=${o.typeLit} maturity=${o.legalMaturityDate} commitment(closeAmount)=${o.closeAmount}`);
  } else {
    process.stdout.write(`  ${n}:${r.status} `);
  }
}
console.log(`\n\nFound obligation numbers: ${found.join(", ") || "none in 1–12"}`);
