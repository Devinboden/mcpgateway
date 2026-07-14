// Live read-sweep: call every GET read service against real booked obligations,
// capture ground-truth response samples, emit a coverage matrix + markdown catalog.
//
// Self-bootstraps an entity graph (bank > obligor > obligation/collateral/name),
// then expands each of the 231 path templates into valid concrete keys and captures.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const base = (process.env.AFS_BASE_URL || '').replace(/\/$/, '');
const auth = 'Basic ' + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString('base64');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
let xn = 0;
const h = () => ({ Authorization: auth, Accept: 'application/json', 'User-Agent': UA, 'Afs-AppChannel': 'AFS-SWEEP', 'Afs-tranXref': 'sw-' + Date.now() + '-' + (++xn) });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function get(path) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(base + path, { headers: h() });
      const t = await r.text();
      let j; try { j = JSON.parse(t); } catch { j = t; }
      return { status: r.status, body: j };
    } catch (e) { if (attempt) return { status: 0, body: String(e) }; await sleep(300); }
  }
}
const unwrap = (j) => {
  if (j && typeof j === 'object' && !Array.isArray(j)) {
    const k = Object.keys(j).find(k => k !== 'messages' && j[k] && typeof j[k] === 'object');
    if (k) return j[k];
  }
  return j;
};
const asArray = (p) => Array.isArray(p) ? p : (p && typeof p === 'object' ? [p] : []);
const msgOf = (j) => (j && j.messages ? j.messages.map(m => `[${m.severity}] ${m.text}`).join(' | ') : '');

// ---- entity graph -------------------------------------------------------
const BANK = '5';
const SEED_OBLIGORS = ['34160', '1136', '39', '34392'];
// global pools for internal/global-unique ids harvested anywhere
const pool = { obligationId: new Set(), financialInstrumentId: new Set(), nameId: new Set(), addressId: new Set(), notePadId: new Set(), orgLevelId: new Set(), organizationId: new Set(['1']), chargeCode: new Set(), balanceCode: new Set(), type: new Set(), sequence: new Set(['1']), dealId: new Set(), billYear: new Set(), invoiceNumber: new Set(), penaltyId: new Set(), rateId: new Set(), wireId: new Set(), depositInstructionId: new Set(), application: new Set(['1']), collateralItem: new Set(), fiNumber: new Set(), financialInstrumentId2: new Set(), id: new Set(), formulaType: new Set(), chargeType: new Set(), orgLevelType: new Set(), penaltyId2: new Set() };
const add = (k, v) => { if (v != null && v !== '' && pool[k]) pool[k].add(String(v)); };

// per-obligor relational bundle
const graph = {}; // obligor -> { obligationNums:Set, obligationIds:Set, collateralItems:Set, nameIds:Set, applications:Set }

function harvest(body) {
  // generic: scan any object for fields whose name maps to a pool key
  const map = { obligationId: 'obligationId', financialInstrumentId: 'financialInstrumentId', nameId: 'nameId', addressId: 'addressId', notePadId: 'notePadId', userNotesId: 'notePadId', orgLevelId: 'orgLevelId', organizationId: 'organizationId', chargeCode: 'chargeCode', balanceCode: 'balanceCode', dealId: 'dealId', billYear: 'billYear', invoiceNumber: 'invoiceNumber', penaltyId: 'penaltyId', rateId: 'rateId', wireId: 'wireId', depositInstructionId: 'depositInstructionId', application: 'application', collateralItem: 'collateralItem', fiNumber: 'fiNumber' };
  const seen = new Set();
  (function walk(o, d) {
    if (!o || typeof o !== 'object' || d > 6) return;
    if (seen.has(o)) return; seen.add(o);
    for (const [k, v] of Object.entries(o)) {
      if (v != null && typeof v !== 'object' && map[k]) add(map[k], v);
      else if (typeof v === 'object') walk(v, d + 1);
    }
  })(body, 0);
}

async function bootstrap() {
  for (const obg of SEED_OBLIGORS) {
    const g = graph[obg] = { obligationNums: new Set(), obligationIds: new Set(), collateralItems: new Set(), nameIds: new Set(), applications: new Set() };
    // FI list at obligor level -> obligationIds (==FI ids) + applications
    const fi = await get(`/financialInstrument/listAllByObligor/${BANK}-${obg}`);
    for (const r of asArray(unwrap(fi.body))) {
      if (r.financialInstrumentId != null) { g.obligationIds.add(String(r.financialInstrumentId)); add('obligationId', r.financialInstrumentId); add('financialInstrumentId', r.financialInstrumentId); }
      if (r.application != null) { g.applications.add(String(r.application)); add('application', r.application); }
    }
    // map each obligationId -> obligation number; harvest charge/balance codes
    for (const oid of [...g.obligationIds].slice(0, 8)) {
      const ob = await get(`/obligations/get/${oid}`);
      const p = unwrap(ob.body);
      if (p && p.obligation != null) g.obligationNums.add(String(p.obligation));
      harvest(ob.body);
      const bal = await get(`/balances/list/${oid}`);
      for (const b of asArray(unwrap(bal.body))) add('balanceCode', b.balanceCode);
      const ch = await get(`/charges/list/${oid}`);
      for (const c of asArray(unwrap(ch.body))) add('chargeCode', c.chargeCode);
    }
    // collateral
    const col = await get(`/collateral/list/${BANK}-${obg}`);
    for (const c of asArray(unwrap(col.body))) { const it = c.collateralItem ?? c.item ?? c.sequence; if (it != null) { g.collateralItems.add(String(it)); add('collateralItem', it); } }
    // name + addresses
    const nm = await get(`/names/getByObligor/${BANK}-${obg}`);
    harvest(nm.body);
    for (const id of [...pool.nameId].slice(-3)) g.nameIds.add(id);
    for (const nid of [...g.nameIds]) {
      const na = await get(`/nameAddresses/list/${nid}`);
      for (const a of asArray(unwrap(na.body))) { add('addressId', a.addressId); add('sequence', a.sequence); }
    }
  }
  add('dealId', BANK); // deal often keyed at bank level; also try obligors as deal
  for (const o of SEED_OBLIGORS) add('dealId', o);
}

// ---- key resolution per path template -----------------------------------
function valueFor(param, obg) {
  const g = obg ? graph[obg] : null;
  switch (param) {
    case 'bank': case 'supportingBank': return [BANK];
    case 'obligor': case 'supportingObligor': case 'supportedObligor': return obg ? [obg] : SEED_OBLIGORS;
    case 'obligation': case 'supportedObligation': return g ? [...g.obligationNums].slice(0, 2) : [...new Set(Object.values(graph).flatMap(x => [...x.obligationNums]))].slice(0, 3);
    case 'obligationId': return g ? [...g.obligationIds].slice(0, 2) : [...pool.obligationId].slice(0, 4);
    case 'financialInstrumentId': return [...pool.financialInstrumentId].slice(0, 4);
    case 'collateralItem': case 'supportingCollateralItem': return g ? [...g.collateralItems].slice(0, 2) : [...pool.collateralItem].slice(0, 3);
    case 'nameId': return g ? [...g.nameIds].slice(0, 2) : [...pool.nameId].slice(0, 4);
    case 'application': case 'supportedAplication': return g ? [...g.applications].slice(0, 2) : [...pool.application].slice(0, 2);
    case 'dealId': return obg ? [obg] : [...pool.dealId].slice(0, 3);
    case 'id': return [...pool.obligationId].slice(0, 2); // wp/* ids: use known WP id below
    default: {
      const direct = pool[param];
      return direct ? [...direct].slice(0, 2) : [];
    }
  }
}

// expand a path template into up to K concrete paths
function expand(path, params) {
  if (params.length === 0) return [path];
  const obligorAnchored = params[0] === 'bank' && (params[1] === 'obligor' || params[1] === 'supportingBank' || params.includes('obligor'));
  const results = [];
  const anchors = obligorAnchored ? SEED_OBLIGORS : [null];
  for (const obg of anchors) {
    // build value lists per param under this anchor
    const lists = params.map(p => valueFor(p, obligorAnchored ? obg : null));
    if (lists.some(l => l.length === 0)) continue;
    // cartesian, capped
    let combos = [[]];
    for (const l of lists) {
      const next = [];
      for (const c of combos) for (const v of l.slice(0, 2)) next.push([...c, v]);
      combos = next.slice(0, 6);
    }
    for (const combo of combos) {
      let i = 0;
      const concrete = path.replace(/\{[^}]+\}/g, () => combo[i++]);
      results.push(concrete);
    }
    if (results.length >= 6) break;
  }
  return [...new Set(results)].slice(0, 6);
}

// ---- main ---------------------------------------------------------------
const ops = JSON.parse(readFileSync('api-discovery/captured/_read_ops.json', 'utf-8'));
// known good WP ids for wf/wp/* reads (the loans we built)
const WP_IDS = ['32697', '32689'];

console.error(`Bootstrapping entity graph (bank ${BANK}, obligors ${SEED_OBLIGORS.join(',')})...`);
await bootstrap();
console.error('graph:', Object.fromEntries(Object.entries(graph).map(([o, g]) => [o, { obln: g.obligationNums.size, oid: g.obligationIds.size, coll: g.collateralItems.size, name: g.nameIds.size }])));
console.error('pools:', Object.fromEntries(Object.entries(pool).filter(([, s]) => s.size).map(([k, s]) => [k, s.size])));

mkdirSync('api-discovery/captured/read_samples', { recursive: true });
const results = [];
let i = 0;
for (const op of ops) {
  i++;
  let candidates;
  if (op.path.startsWith('/wp/') && op.pathParams.length === 1 && op.pathParams[0] === 'id') {
    candidates = WP_IDS.map(id => op.path.replace('{id}', id));
  } else {
    candidates = expand(op.path, op.pathParams);
  }
  const tried = [];
  let best = null;
  if (candidates.length === 0) {
    results.push({ layer: op.layer, path: op.path, params: op.pathParams, query: op.queryParams, status: 'NO_KEY', note: 'no harvested key available for path params', tried: [] });
    continue;
  }
  for (const url of candidates) {
    const res = await get(url);
    tried.push({ url, status: res.status });
    harvest(res.body);
    const ok = res.status === 200;
    if (ok && !best) best = { url, status: res.status, body: res.body };
    if (ok) break;
  }
  if (!best) best = { url: tried[0].url, status: tried[0].status, body: (await get(tried[0].url)).body };
  // capture sample
  const safe = op.path.replace(/[\/{}]/g, '_').replace(/^_/, '').slice(0, 96);
  const payload = unwrap(best.body);
  const first = asArray(payload)[0] ?? payload;
  const fields = first && typeof first === 'object' ? Object.keys(first) : [];
  writeFileSync(`api-discovery/captured/read_samples/${op.layer}_${safe}.json`, JSON.stringify({ service: op.path, opId: op.opId, queryParams: op.queryParams, urlTried: best.url, status: best.status, fieldCount: fields.length, fields, sample: best.body }, null, 1));
  results.push({ layer: op.layer, path: op.path, params: op.pathParams, query: op.queryParams, status: best.status, urlTried: best.url, fieldCount: fields.length, message: best.status === 200 ? '' : msgOf(best.body).slice(0, 140), allTried: tried });
  if (i % 25 === 0) console.error(`  ...${i}/${ops.length}`);
}

writeFileSync('api-discovery/captured/read_sweep_results.json', JSON.stringify(results, null, 1));
const by = (s) => results.filter(r => r.status === s).length;
const ok = results.filter(r => r.status === 200);
console.error('\n=== SWEEP COMPLETE ===');
console.error('total services:', results.length);
console.error('200 OK:', ok.length, '| 4xx:', results.filter(r => typeof r.status === 'number' && r.status >= 400 && r.status < 500).length, '| 404:', by(404), '| 403:', by(403), '| NO_KEY:', results.filter(r => r.status === 'NO_KEY').length);
console.error('fields captured (sum over 200s):', ok.reduce((a, r) => a + (r.fieldCount || 0), 0));
