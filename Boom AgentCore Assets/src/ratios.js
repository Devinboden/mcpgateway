// Boom ratio derivation — the bank CONSUMER-LAYER methodology over a raw Boom spread.
//
// ARCHITECTURE (see README "Ratio ownership"):
//   - Boom (the vendor) owns RAW line items only — generic, multi-tenant, no bank policy.
//   - THIS layer (our consumer-layer MCP server) owns the ratio CALCULATION. Ratio
//     definitions are bank-specific policy, so they live here, NOT in the vendor engine.
//   - Ratios are a DETERMINISTIC function of the spread → computed ON READ, never stored.
//     One implementation feeds three consumers (the widget for display, the boom_get_ratios
//     data tool for the agent/IRIS, the memo at assembly), so the number can never disagree.
//   - Grading (pass/watch/breach) is intentionally OMITTED — covenant thresholds are
//     nCino-owned; pass/fail is a downstream JOIN (Boom ratio × nCino threshold), graded by IRIS.
//
// Long-term: lift these inline definitions into versioned config evaluated by a generic engine
// (engine = reusable foundation; per-bank ratio definitions = the bank-specific deployable).

// ---- shape a raw Boom file → statements with resolved period labels (live UUID or fixture name) ----
export function shapeStatements(file) {
  return (file.financialStatements ?? []).map((s) => {
    const pers = s.periods;
    let labels, keys;
    if (Array.isArray(pers) && pers.length && typeof pers[0] === "object") {
      labels = pers.map((p) => p.endDate ?? p.id); keys = pers.map((p) => p.id);
    } else if (Array.isArray(pers) && pers.length) { labels = pers; keys = pers; }
    else { keys = Object.keys(s.lineItems?.[0]?.periodValues ?? {}); labels = keys; }
    const lineItems = (s.lineItems ?? []).filter((li) => li.accountCode || li.name).map((li) => ({
      name: li.name || li.accountCode, accountCode: li.accountCode || "",
      hierarchy: li.hierarchy || "line_item", // header | line_item | total — drives groupings/badges in the widget
      values: keys.map((k) => (li.periodValues ?? {})[k] ?? null),
    }));
    return { statementType: s.statementType, periods: labels, lineItems };
  });
}

// ---- display formatters (the widget reads these strings; raw numbers stay in .raw for IRIS) ----
// Boom spread values are ACTUAL DOLLARS (e.g. 64,500,000 = $64.5M). Scale to $M/$K for display.
const fmtK = (n) => n == null ? "—" : (Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`);
const fmtX = (n) => n == null ? "NM" : `${n.toFixed(2)}x`;
const pct = (n) => n == null ? "—" : `${(n * 100).toFixed(1)}%`;

// ---- derive key ratios from a spread (robust to messy data; nulls → neutral) ----
// Returns { raw, ratios, metrics }:
//   raw     — numeric values (the rating-engine / IRIS / memo contract; no formatting)
//   ratios  — display cards for the widget (formatted strings)
//   metrics — compact display strip for the widget
export function deriveRatios(file) {
  const sts = shapeStatements(file);
  const isList = sts.filter((s) => s.statementType === "income_statement");
  const is = isList.find((s) => s.lineItems.some((l) => l.accountCode === "interest_expense"))
    || isList.sort((a, b) => b.lineItems.length - a.lineItems.length)[0];
  const bs = sts.find((s) => s.statementType === "balance_sheet");
  const cf = sts.find((s) => s.statementType === "cash_flow_statement");
  // accountCode lookup tolerant of naming variants across spread templates (accepts a list of codes)
  const val = (s, codes, i = 0) => {
    for (const code of (Array.isArray(codes) ? codes : [codes])) {
      const li = s?.lineItems.find((l) => l.accountCode === code);
      if (li) return li.values[i];
    }
    return null;
  };
  const byName = (s, re, i = 0) => { const li = s?.lineItems.find((l) => re.test(l.name || "")); return li ? li.values[i] : null; };

  const REV = ["sales_revenue", "net_sales_revenue", "total_revenue"];
  const rev = val(is, REV, 0) ?? byName(is, /^(net sales|total revenue|sales|revenue)$/i, 0);
  const revP = val(is, REV, 1) ?? byName(is, /^(net sales|total revenue|sales|revenue)$/i, 1);
  const cogs = val(is, ["cost_of_sales", "cost_of_goods_sold"], 0) ?? byName(is, /cost of (sales|goods)/i, 0);
  const interest = Math.abs(val(is, "interest_expense", 0) ?? byName(is, /interest expense/i, 0) ?? 0);
  const da = byName(cf, /depreciat|amortiz/i, 0) ?? 0;
  const gp = val(is, "gross_profit", 0) ?? ((rev != null && cogs != null) ? rev - cogs : null);
  const opex = val(is, ["general_and_admin_expenses", "total_operating_expenses", "operating_expenses"], 0) ?? byName(is, /operating expense|general and admin|sg&a/i, 0);
  // prefer a direct operating-profit line; else gross profit − opex
  const op = val(is, ["operating_profit", "operating_income"], 0) ?? byName(is, /income from operations|operating (income|profit)/i, 0)
    ?? ((gp != null && opex != null) ? gp - opex : null);
  const ebitda = op != null ? op + da : null;
  const debtCodes = ["st_loans_payable_bank", "cpltd_bank", "cp_capital_lease_obligation", "cp_related_party_debt", "cp_subordinated_debt", "loans_from_related_company_cp", "capital_lease_obligations", "long_term_debt_bank", "lt_related_party_debt", "sba_ppp_eidl_loans", "overdrafts", "current_portion_ltd", "long_term_debt"];
  let debt = 0, anyDebt = false;
  for (const c of debtCodes) { const v = val(bs, c, 0); if (v != null) { debt += v; anyDebt = true; } }
  const leverage = (anyDebt && ebitda && ebitda > 0) ? debt / ebitda : (ebitda != null && ebitda <= 0 ? null : null);
  const icr = (op != null && interest > 0) ? op / interest : null;
  const yoy = (rev != null && revP) ? (rev - revP) / revP : null;
  const gm = (gp != null && rev) ? gp / rev : null;
  const em = (ebitda != null && rev) ? ebitda / rev : null;

  // raw = the numeric contract a rating engine (IRIS) consumes — no display formatting, no grading.
  const raw = {
    revenue: rev, revenuePrior: revP, grossProfit: gp, operatingIncome: op,
    ebitda, totalDebt: anyDebt ? debt : null, leverage, interestCoverage: icr,
    revenueYoY: yoy, grossMargin: gm, ebitdaMargin: em,
  };

  // Grading (pass/watch/breach vs covenant thresholds) is intentionally OMITTED.
  // Covenant thresholds are nCino-owned; grading returns when Boom figures are joined
  // with nCino in the risk view. Boom surfaces neutral numbers only.
  const ratios = [
    { label: "Revenue", value: fmtK(rev), sub: yoy == null ? "" : `${(yoy * 100).toFixed(1)}% YoY`, status: "neutral" },
    { label: "Gross Margin", value: pct(gm), status: "neutral" },
    { label: "EBITDA", value: fmtK(ebitda), sub: ebitda == null ? "" : `${pct(em)} margin`, status: "neutral" },
    { label: "Total Leverage", value: leverage == null ? "NM" : fmtX(leverage), status: "neutral" },
    { label: "Interest Coverage", value: fmtX(icr), status: "neutral" },
    { label: "Total Debt", value: anyDebt ? fmtK(debt) : "—", status: "neutral" },
  ];
  const metrics = [
    { label: "Revenue", value: fmtK(rev), status: "neutral" },
    { label: "Leverage", value: leverage == null ? "NM" : fmtX(leverage), status: "neutral" },
    { label: "Int. Coverage", value: fmtX(icr), status: "neutral" },
    { label: "EBITDA margin", value: pct(em), status: "neutral" },
  ];
  return { raw, ratios, metrics };
}
