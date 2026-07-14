// AFS origination picklist harvester — paste into the dd3 browser console while a
// Commercial Loan Origination workpackage is open. Survives SPA navigation; re-paste
// after any full page reload. Accumulates into localStorage:
//   afsCodes   {field: {label, opts:[[code,label]]}}   <- DOM-rendered dropdowns
//   afsPL      {plName: {plName,url,kind,opts}}         <- /rs/pl/* responses (fetch)
//   afsPLurls  ["/rs/pl/fixed?name=...", ...]           <- /rs/pl/* requests (XHR)
//
// Then: harvestScrape()  -> scrape current screen's rendered dropdowns
//       harvestReplay()  -> re-GET every recorded /rs/pl/ url to fill afsPL with options
//       harvestDownload()-> download all three localStorage buckets as JSON
//
// Discovery of the picklist API is documented in
// api-discovery/findings_writes/picklist_api.md.

(function () {
  // ---- fetch interceptor: capture /rs/pl/* responses ----------------------
  if (!window.__afsPLpatched) {
    const orig = window.fetch;
    window.fetch = async function (...args) {
      const res = await orig.apply(this, args);
      try {
        const url = (typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url)) || '';
        if (/\/rs\/pl\/(fixed|dynamic)/.test(url)) {
          res.clone().json().then(j => {
            if (j && Array.isArray(j.items)) {
              let b = {}; try { b = JSON.parse(localStorage.getItem('afsPL') || '{}'); } catch (e) {}
              const m = url.match(/[?&]name=([^&]+)/);
              const key = j.plName || (m ? decodeURIComponent(m[1]) : url);
              b[key] = { plName: j.plName || key, url: url.replace(/[?&]crc=[^&]*/, ''), kind: /fixed/.test(url) ? 'fixed' : 'dynamic', opts: j.items.map(it => [String(it.code), String(it.literal || it.itemText || '')]) };
              localStorage.setItem('afsPL', JSON.stringify(b));
            }
          }).catch(() => {});
        }
      } catch (e) {}
      return res;
    };
    window.__afsPLpatched = true;
  }
  // ---- XHR interceptor: record /rs/pl/* request urls (app uses XHR) --------
  if (!window.__afsXHRpatched) {
    const O = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u, ...r) {
      try {
        if (/\/rs\/pl\/(fixed|dynamic)/.test(u)) {
          let a = []; try { a = JSON.parse(localStorage.getItem('afsPLurls') || '[]'); } catch (e) {}
          const c = u.replace(/[?&]crc=[^&]*/, '');
          if (!a.includes(c)) { a.push(c); localStorage.setItem('afsPLurls', JSON.stringify(a)); }
        }
      } catch (e) {}
      return O.call(this, m, u, ...r);
    };
    window.__afsXHRpatched = true;
  }

  // ---- DOM scrape: react-select fiber options + native <select> -----------
  window.harvestScrape = function () {
    const fb = el => { const k = Object.keys(el).find(k => /^__react(Fiber|InternalInstance)\$/.test(k)); return k ? el[k] : null; };
    const op = f => { let n = f, h = 0; while (n && h < 40) { const p = n.memoizedProps || n.pendingProps; if (p && Array.isArray(p.options) && p.options.length) return p.options; n = n.return; h++; } return null; };
    const lb = c => { let h = c; for (let i = 0; i < 9 && h; i++) { h = h.parentElement; if (!h) break; const l = h.querySelector(':scope>label,:scope>div>label,:scope label'); if (l && l.textContent.trim() && l.textContent.trim().length < 45) return l.textContent.trim(); } return ''; };
    let s = {}; try { s = JSON.parse(localStorage.getItem('afsCodes') || '{}'); } catch (e) {}
    let a = 0; const newf = [];
    document.querySelectorAll('[class*=picklist__control]').forEach(c => {
      const f = fb(c); if (!f) return; const o = op(f); if (!o) return;
      const inp = c.querySelector('input'); const fld = (inp && inp.id || '').replace(/_\d+$/, '');
      if (!fld || s[fld]) return;
      s[fld] = { label: lb(c), opts: o.map(x => [String(x.code), String(x.literal || x.itemText || '')]).filter(p => p[0] !== 'undefined' && p[0] !== '') }; a++; newf.push(fld);
    });
    document.querySelectorAll('select').forEach(sel => {
      const fld = (sel.id || sel.name || '').replace(/_\d+$/, ''); if (!fld || s[fld]) return;
      const opts = [...sel.options].map(o => [String(o.value), String(o.textContent || '').trim()]).filter(p => p[0] !== '' && p[1] !== '');
      if (opts.length < 2) return; s[fld] = { label: lb(sel), opts }; a++; newf.push(fld);
    });
    localStorage.setItem('afsCodes', JSON.stringify(s));
    return { added: a, total: Object.keys(s).length, newf };
  };

  // ---- replay recorded /rs/pl/ urls to fill afsPL with full options -------
  window.harvestReplay = async function () {
    const urls = JSON.parse(localStorage.getItem('afsPLurls') || '[]'); let ok = 0;
    for (const u of urls) { try { const r = await fetch(u, { headers: { Accept: 'application/json' } }); if (r.status === 200) ok++; } catch (e) {} }
    await new Promise(r => setTimeout(r, 400));
    return { urls: urls.length, fetchedOk: ok, plCaptured: Object.keys(JSON.parse(localStorage.getItem('afsPL') || '{}')).length };
  };

  // ---- download buckets ---------------------------------------------------
  window.harvestDownload = function () {
    const dl = (name, str) => { const b = new Blob([str], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(u); };
    dl('afsCodes.json', localStorage.getItem('afsCodes') || '{}');
    // afsPL/afsPLurls downloaded one at a time (browsers throttle multi auto-download)
    setTimeout(() => dl('afsPL.json', localStorage.getItem('afsPL') || '{}'), 800);
    return { afsCodes: Object.keys(JSON.parse(localStorage.getItem('afsCodes') || '{}')).length, afsPL: Object.keys(JSON.parse(localStorage.getItem('afsPL') || '{}')).length };
  };

  return 'harvester installed — run harvestScrape() per screen, harvestReplay() to fill options, harvestDownload() to export';
})();
