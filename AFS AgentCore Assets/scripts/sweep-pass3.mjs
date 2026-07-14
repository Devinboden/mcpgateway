// Pass 3: lift unresolved reads WITHOUT writes —
//  (A) supply the right query params (real keys) to the "400 needs-param" reads
//  (B) hit /wp/* reads against EXISTING workpackage ids
// Captures any new 200s; reports what stays role/booking-gated.
const base = (process.env.AFS_BASE_URL || '').replace(/\/$/, '');
const auth = 'Basic ' + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString('base64');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36';
let xn = 0;
const h = () => ({ Authorization: auth, Accept: 'application/json', 'User-Agent': UA, 'Afs-AppChannel': 'AFS-SWEEP3', 'Afs-tranXref': 's3-' + Date.now() + '-' + (++xn) });
const get = async (p) => { try { const r = await fetch(base + p, { headers: h() }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; } return { status: r.status, body: j }; } catch (e) { return { status: 0, body: String(e) }; } };
const unwrap = (j) => { if (j && typeof j === 'object' && !Array.isArray(j)) { const k = Object.keys(j).find(k => k !== 'messages' && j[k] && typeof j[k] === 'object'); if (k) return j[k]; } return j; };
const asArray = (p) => Array.isArray(p) ? p : (p && typeof p === 'object' ? [p] : []);
const msg = (j) => (j && j.messages ? j.messages.map(m => `[${m.severity}] ${m.text}`).join(' | ').slice(0, 110) : '');

const NID = '46643', BANK = '5', OBG = '34160', OID = '30733', TODAY = '2026-06-25';
// (A) query-param fixes — [label, path]
const A = [
  ['names/list', `/names/list?search=Piedmont&organizationId=1&nameType=O&sortOrder=A`],
  ['phones/list', `/phones/list?nameId=${NID}&sortOrder=A`],
  ['phones/get', `/phones/get?nameId=${NID}&phoneSequence=1`],
  ['obligors/listAllByBank', `/obligors/listAllByBank?bank=${BANK}&sortOrder=A`],
  ['obligors/listByNameId', `/obligors/listByNameId/${BANK}?nameId=${NID}&sortOrder=A`],
  ['nameAddresses/listAlternateAddresses', `/nameAddresses/listAlternateAddresses?alternameNameId=${NID}&sortOrder=A`],
  ['apis/get', `/apis/get?apiName=DisburseFuture`],
  ['apis/list', `/apis/list?apiNameSearch=&sortOrder=A`],
  ['apis/listByCategory', `/apis/listByCategory?category=Payment&sortOrder=A`],
  ['offsetTranCtrl/list', `/offsetTranCtrl/list/${BANK}?offsetTrans=1&sortOrder=A`],
  ['financialHistory/list', `/financialHistory/list/${OID}?effectiveDate=2026-06-03&sortOrder=A`],
  ['holderofrecords/allDeals', `/holderofrecords/allDealsForASelectedHolderOfRecord?bankId=${BANK}&searchBy=C&customerId=${NID}&asOfDate=${TODAY}&inAdminRole=N`],
  ['holderofrecords/allHolders', `/holderofrecords/allHoldersofRecordinDeal?bankId=${BANK}&dealNo=${OBG}&inAdminRole=N&asOfDate=${TODAY}`],
  ['names/getByObligor', `/names/getByObligor/${BANK}-${OBG}`],
];
// listOblnByObg instrumentType — try several values
for (const it of ['L', 'C', 'F', 'B', '', 'ALL', '1', '2', '0']) A.push([`listOblnByObg(it=${it || 'none'})`, `/financialInstrument/listOblnByObg/${BANK}-${OBG}?instrumentType=${it}&sortOrder=A`]);

// (B) /wp/* reads against existing WP ids
const WPIDS = { app: '28476', preApp: '28476', post: '32591', collat: '32591' };
const B = [
  ['wp/ObligorRoot', `/wp/ObligorRoot/${WPIDS.preApp}`],
  ['wp/ObligationRoot', `/wp/ObligationRoot/${WPIDS.preApp}`],
  ['wp/CollateralRoot', `/wp/CollateralRoot/${WPIDS.collat}`],
  ['wp/commercialPost', `/wp/commercialPost/${WPIDS.post}`],
  ['wp/exceptionCollateral', `/wp/exceptionCollateral/${WPIDS.post}`],
  ['wp/exceptionCovenants', `/wp/exceptionCovenants/${WPIDS.post}`],
  ['wp/exceptionEntity', `/wp/exceptionEntity/${WPIDS.post}`],
  ['wp/exceptionCreditPolicy', `/wp/exceptionCreditPolicy/${WPIDS.post}`],
  ['wp/exceptionRequirements', `/wp/exceptionRequirements/${WPIDS.post}`],
  ['wp/otherFinancials2', `/wp/otherFinancials2/${WPIDS.post}`],
  ['wp/ExceptionType', `/wp/ExceptionType/${WPIDS.post}`],
];

const out = { paramFixes: [], wpReads: [] };
console.error('=== (A) query-param fixes (no writes) ===');
for (const [label, path] of A) {
  const r = await get(path);
  const fields = r.status === 200 ? (Object.keys(asArray(unwrap(r.body))[0] || {}).length) : 0;
  const tag = r.status === 200 ? `200 OK (${fields}f)` : `${r.status} ${msg(r.body)}`;
  console.error(`  ${label.padEnd(34)} -> ${tag}`);
  out.paramFixes.push({ label, path, status: r.status, fields });
}
console.error('\n=== (B) /wp/* reads vs existing WP ids ===');
for (const [label, path] of B) {
  const r = await get(path);
  const fields = r.status === 200 ? (Object.keys(unwrap(r.body) || {}).length) : 0;
  const tag = r.status === 200 ? `200 OK (${fields}f)` : `${r.status} ${msg(r.body)}`;
  console.error(`  ${label.padEnd(28)} -> ${tag}`);
  out.wpReads.push({ label, path, status: r.status, fields });
}
const lifted = [...out.paramFixes, ...out.wpReads].filter(x => x.status === 200).length;
console.error(`\n=== PASS 3: ${lifted} reads lifted to 200 without any writes ===`);
import('node:fs').then(fs => fs.writeFileSync('api-discovery/captured/read_pass3.json', JSON.stringify(out, null, 1)));
