// Pass 2: retry non-200 reads supplying sensible query-param defaults, to lift
// "reachable but needs a query param" services into captured 200s. Merges results
// back into read_sweep_results.json + read_samples/.
import { readFileSync, writeFileSync } from 'node:fs';
const base = (process.env.AFS_BASE_URL || '').replace(/\/$/, '');
const auth = 'Basic ' + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString('base64');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36';
let xn = 0;
const h = () => ({ Authorization: auth, Accept: 'application/json', 'User-Agent': UA, 'Afs-AppChannel': 'AFS-SWEEP2', 'Afs-tranXref': 's2-' + Date.now() + '-' + (++xn) });
const get = async (p) => { try { const r = await fetch(base + p, { headers: h() }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; } return { status: r.status, body: j }; } catch (e) { return { status: 0, body: String(e) }; } };
const unwrap = (j) => { if (j && typeof j === 'object' && !Array.isArray(j)) { const k = Object.keys(j).find(k => k !== 'messages' && j[k] && typeof j[k] === 'object'); if (k) return j[k]; } return j; };
const asArray = (p) => Array.isArray(p) ? p : (p && typeof p === 'object' ? [p] : []);
const msgOf = (j) => (j && j.messages ? j.messages.map(m => `[${m.severity}] ${m.text}`).join(' | ') : '');

const NAME_IDS = ['46643', '8093', '7870', '46934'];
const TODAY = '2026-06-25';
// pull a real financial-history coordinate (effectiveDate/timestamp/sequence) from a 200 obligation
let fh = {};
for (const oid of ['30733', '30745', '24096']) {
  const r = await get(`/financialHistory/listAllById/${oid}`);
  const row = asArray(unwrap(r.body))[0];
  if (row && row.effectiveDate) { fh = { effectiveDate: row.effectiveDate, timestamp: row.timestamp, sequence: row.sequence, oid }; break; }
}
console.error('financial-history coordinate:', fh);

// query-param default provider. returns array of candidate values (tries each).
const DEFAULTS = {
  sortOrder: ['A'], bank: ['5'], bankId: ['5'], bankNo: ['5'], organizationId: ['1'],
  nameId: NAME_IDS, alternameNameId: NAME_IDS, phoneSequence: ['1'], sequence: ['1', '0'],
  effectiveDate: [fh.effectiveDate || TODAY], effectivedate: [fh.effectiveDate || TODAY],
  effectiveFrom: ['2026-01-01'], effectiveTo: [TODAY], asOfDate: [TODAY], payoffDate: [TODAY],
  timestamp: fh.timestamp != null ? [String(fh.timestamp)] : [], numberOfDays: ['90'],
  billYear: ['2026', '2025'], invoiceNumber: ['1'], obg: ['34160', '1136'], paidOption: ['A', 'B', 'U'],
  instrumentType: ['C', 'F', 'O', 'L'], inAdminRole: ['N'], searchBy: ['C'], nameType: ['O', 'I'],
  applicationId: ['1'], offsetTrans: ['1'], currencyCode: ['USD'], fieldId: ['1'],
  resultCount: ['25'], includeClosedWP: ['N'], allowDup: ['N'], afsInternal: ['N'],
  category: ['Payment'], apiNameSearch: [''], cusipNumber: [''], userOid: ['36', '37'],
  customerId: NAME_IDS, dealNo: ['34160'], obligorNo: ['34160'], obgrSeqNum: ['1'],
  supportedObligor: ['34160'], supportObligation: ['75'], obligation: ['75'],
};

const RES = JSON.parse(readFileSync('api-discovery/captured/read_sweep_results.json', 'utf-8'));
let lifted = 0, retried = 0;
for (const r of RES) {
  if (r.status === 200) continue;
  if (r.status === 403) continue; // entitlement — query params won't help
  if (!r.get && !r.query) {}
  const qparams = r.query || [];
  if (qparams.length === 0) continue;
  // base url = the path with keys already substituted if we had one; else skip (NO_KEY)
  let baseUrl = r.urlTried;
  if (!baseUrl) continue;
  // strip any existing query
  baseUrl = baseUrl.split('?')[0];
  // build candidate query strings: for each param take first default; also try alt instrumentType/paidOption/billYear values
  const provide = qparams.filter(p => DEFAULTS[p] && DEFAULTS[p].length);
  if (provide.length === 0) continue;
  // generate a few combos varying the "multi" params
  const multiKey = qparams.find(p => ['instrumentType', 'paidOption', 'billYear', 'nameType', 'sequence'].includes(p) && DEFAULTS[p].length > 1);
  const variants = multiKey ? DEFAULTS[multiKey] : [null];
  let success = null;
  for (const variant of variants) {
    const qs = provide.map(p => {
      let v = DEFAULTS[p][0];
      if (p === multiKey && variant != null) v = variant;
      return `${p}=${encodeURIComponent(v)}`;
    }).join('&');
    const url = baseUrl + '?' + qs;
    retried++;
    const res = await get(url);
    if (res.status === 200) { success = { url, res }; break; }
    if (!success) success = { url, res }; // keep last for message
  }
  if (success && success.res.status === 200) {
    lifted++;
    r.status = 200; r.urlTried = success.url; r.message = '';
    const payload = unwrap(success.res.body);
    const first = asArray(payload)[0] ?? payload;
    const fields = first && typeof first === 'object' ? Object.keys(first) : [];
    r.fieldCount = fields.length;
    const safe = r.path.replace(/[\/{}]/g, '_').replace(/^_/, '').slice(0, 96);
    writeFileSync(`api-discovery/captured/read_samples/${r.layer}_${safe}.json`, JSON.stringify({ service: r.path, queryParams: r.query, urlTried: success.url, status: 200, fieldCount: fields.length, fields, sample: success.res.body, pass: 2 }, null, 1));
  } else if (success) {
    r.message = msgOf(success.res.body).slice(0, 140) || ('HTTP ' + success.res.status);
    r.pass2Url = success.url; r.pass2Status = success.res.status;
  }
}
writeFileSync('api-discovery/captured/read_sweep_results.json', JSON.stringify(RES, null, 1));
const ok = RES.filter(r => r.status === 200).length;
console.error(`\nPASS 2: retried ${retried} query-param URLs, lifted ${lifted} new services to 200.`);
console.error(`TOTAL 200 OK now: ${ok}/${RES.length}  | fields: ${RES.filter(r => r.status === 200).reduce((a, r) => a + (r.fieldCount || 0), 0)}`);
