// Full-enrich one obligation and print the fields the tools map, so we can
// confirm: commitment source, array-vs-object shapes, runningBalance, aging.
//   node --env-file=.env.local scripts/enrich-one.mjs <bank> <obligor> <obligation>

const base = (process.env.AFS_BASE_URL || "").replace(/\/$/, "");
const auth = "Basic " + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString("base64");
const [bank = "5", obligor = "13", obligation = "42"] = process.argv.slice(2);

async function get(path, query) {
  const url = new URL(base + path);
  for (const [k, v] of Object.entries(query || {})) if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    headers: { Authorization: auth, Accept: "application/json", "Afs-AppChannel": "AFS-MCP", "Afs-tranXref": `enr-${Date.now()}-${Math.random()}` },
  });
  const text = await res.text();
  let body; try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

const key = `${bank}-${obligor}-${obligation}`;
console.log(`Enriching ${key}\n`);

const ob = await get(`/obligations/getFullKey/${key}`);
const o = ob.body?.obligations || {};
const obligationId = o.obligationId;
console.log("OBLIGATION", ob.status, {
  obligationId,
  product: o.typeLit,
  commitment_closeAmount: o.closeAmount,
  legalMaturityDate: o.legalMaturityDate,
  originalRate: o.originalRate,
  accrualStatus: o.accrualStatusLit,
  performing: o.nonPerformingIndicatorLit,
  pastDueDays: o.pastDueDays,
  pastDueTimes: o.pastDueTimes,
  aging: [o.pastDue30Days, o.pastDue60Days, o.pastDue90Days, o.pastDue120Days, o.pastDue150Days],
});

const bal = await get(`/balances/listFullKey/${key}`);
console.log("\nBALANCES", bal.status, "isArray=" + Array.isArray(bal.body?.balances),
  (bal.body?.balances || []).map((b) => ({ code: b.balanceCodeLit, balance: b.balance, asOf: b.effectiveDate })));

const co = await get(`/currentObligations/getFullKey/${key}`);
const c = co.body?.currentObligations || {};
console.log("\nCURRENT OBLIGATION", co.status, {
  nextDueDate: c.nextDueDate, returnCheckCount: c.returnCheckCount,
  principalPastDue: c.principalPastDue, principalBilledNotPaid: c.principalBilledNotPaid,
  firstDelinquencyDate: c.firstDelinquencyDate,
});

const col = await get(`/collateral/list/${bank}-${obligor}`);
console.log("\nCOLLATERAL", col.status, "isArray=" + Array.isArray(col.body?.collateral),
  (col.body?.collateral || []).map((x) => ({ item: x.collateralItem, type: x.collateralTypeLit, currentValue: x.currentValue })));

if (obligationId != null) {
  const from = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const to = new Date().toISOString().slice(0, 10);
  const fh = await get(`/financialHistory/effectiveFrom/${obligationId}`, { effectiveFrom: from, effectiveTo: to, sortOrder: "ASC" });
  const rows = fh.body?.financialHistory || [];
  console.log(`\nFINANCIAL HISTORY ${fh.status} (${rows.length} txns) isArray=${Array.isArray(rows)}`);
  console.log("  runningBalance present on row[0]? ", rows[0] ? ("runningBalance" in rows[0]) : "n/a");
  console.log("  sample:", rows.slice(0, 3).map((t) => ({ date: t.effectiveDate, origin: t.transactionOriginLit, amount: t.transactionAmount, dc: t.debitCreditIndicator, running: t.runningBalance })));
} else {
  console.log("\nFINANCIAL HISTORY skipped — no obligationId on obligation record.");
}

// utilization check
if (o.closeAmount) console.log(`\nUtilization vs closeAmount $${o.closeAmount}: needs funded balance from history/balances.`);
