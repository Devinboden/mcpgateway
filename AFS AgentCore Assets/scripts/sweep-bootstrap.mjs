// Bootstrap real seed keys for the read-sweep by drilling known obligors.
const base = (process.env.AFS_BASE_URL || '').replace(/\/$/, '');
const auth = 'Basic ' + Buffer.from(`${process.env.AFS_USERNAME}:${process.env.AFS_PASSWORD}`).toString('base64');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
let n = 0;
const h = () => ({ Authorization: auth, Accept: 'application/json', 'User-Agent': UA, 'Afs-AppChannel': 'AFS-SWEEP', 'Afs-tranXref': 'sw-' + Date.now() + '-' + (++n) });
async function get(path) {
  try {
    const r = await fetch(base + path, { headers: h() });
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { j = t; }
    return { status: r.status, body: j };
  } catch (e) { return { status: 0, body: String(e) }; }
}
const bank = '5';
const obligors = ['34160', '1136', '39', '34392'];
const out = { bank, obligors: {} };
for (const obg of obligors) {
  const rec = { keys: {} };
  const o = await get(`/obligors/get/${bank}-${obg}`);
  rec.obligorStatus = o.status;
  if (o.status === 200 && o.body && typeof o.body === 'object') {
    const p = o.body.obligor || o.body;
    rec.name = p.shortName || p.obligorName || p.name || '';
  }
  // applications under obligor
  const ap = await get(`/obligorApplications/list/${bank}-${obg}`);
  if (ap.status === 200) {
    const arr = Array.isArray(ap.body) ? ap.body : (ap.body.obligorApplications || ap.body.items || []);
    rec.keys.application = [...new Set(arr.map(x => String(x.application ?? x.applicationNumber ?? '')).filter(Boolean))];
  }
  // financial instruments -> obligation numbers + ids
  const fi = await get(`/financialInstrument/listAllByObligor/${bank}-${obg}`);
  if (fi.status === 200) {
    const arr = Array.isArray(fi.body) ? fi.body : (fi.body.financialInstrument || fi.body.items || []);
    rec.keys.obligation = [...new Set(arr.map(x => String(x.obligation ?? x.obligationNumber ?? '')).filter(Boolean))];
    rec.keys.obligationId = [...new Set(arr.map(x => String(x.obligationId ?? x.id ?? '')).filter(Boolean))];
    rec.keys.financialInstrumentId = [...new Set(arr.map(x => String(x.financialInstrumentId ?? x.id ?? '')).filter(Boolean))];
    rec.fiCount = arr.length;
  }
  // collateral items
  const col = await get(`/collateral/list/${bank}-${obg}`);
  if (col.status === 200) {
    const arr = Array.isArray(col.body) ? col.body : (col.body.collateral || col.body.items || []);
    rec.keys.collateralItem = [...new Set(arr.map(x => String(x.collateralItem ?? x.item ?? x.sequence ?? '')).filter(Boolean))];
  }
  // names -> nameId
  const nm = await get(`/names/getByObligor/${bank}-${obg}`);
  if (nm.status === 200) {
    const b = nm.body;
    const ids = [];
    const scan = (o) => { if (o && typeof o === 'object') { if (o.nameId) ids.push(String(o.nameId)); for (const v of Object.values(o)) scan(v); } };
    scan(b);
    rec.keys.nameId = [...new Set(ids)];
  }
  out.obligors[obg] = rec;
}
console.log(JSON.stringify(out, null, 1));
