// Boom Intelligence — PREVIEW STUB, now DATA-DRIVEN.
//
// Stands in for Boom's not-yet-GA INTELLIGENCE platform (driver analysis, profit/gain-fade,
// portfolio benchmarking — the conversational "Boom Assistant" they're building). This is the SEAM:
// when Boom ships their intelligence MCP, swap this module for calls into their platform — same
// tool contract.
//
// The explanation is COMPUTED from the borrower's real spread ratios (passed in as `r`), not canned
// text — so it's accurate for any borrower and never contradicts the live numbers. The handler
// resolves the spread and hands us deriveRatios().raw.

const norm = (m) => (m || "").toLowerCase();

// ---- formatters ----
const m$ = (n) => n == null ? "—" : (Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : Math.abs(n) >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`);
const pc = (n) => n == null ? "—" : `${(n * 100).toFixed(1)}%`;
const xx = (n) => n == null ? "NM" : `${n.toFixed(2)}x`;

// metric key → intelligence builder. `r` = raw ratios (revenue, ebitda, leverage, …), `v` = displayed
// value the user clicked, `co` = company.
const KEYED = [
  {
    test: /leverage/,
    build: (r, v, co) => {
      const lev = r.leverage, debt = r.totalDebt, eb = r.ebitda, em = r.ebitdaMargin;
      const healthy = eb != null && eb > 0 && em != null && em > 0.04;
      const high = lev != null && lev >= 4;
      return {
        headline: `Why ${co}'s leverage is ${v || xx(lev)}`,
        drivers: [
          `Leverage is ${xx(lev)} — ${m$(debt)} of funded debt over ${m$(eb)} of EBITDA${em != null ? ` (${pc(em)} margin)` : ""}.`,
          healthy
            ? `EBITDA is positive${em >= 0.1 ? " and reasonably healthy" : ""}, so this is a real leverage figure driven by the debt load — not a denominator artifact.`
            : `EBITDA is thin/near-breakeven, so the denominator is inflating the ratio as much as the debt is — the earnings base is the thing to watch.`,
          high
            ? `At ${xx(lev)} the borrower is leveraged up and headroom to a typical 4.0–4.5x policy ceiling is tightening.`
            : `At ${xx(lev)} there's still cushion to a typical 4.0–4.5x covenant ceiling.`,
        ],
        trend: r.revenueYoY != null
          ? `Revenue is ${r.revenueYoY >= 0 ? "up" : "down"} ${pc(Math.abs(r.revenueYoY))} YoY while leverage sits at ${xx(lev)} — the question is whether earnings keep pace with the debt.`
          : `Leverage at ${xx(lev)}.`,
        portfolioContext: `In Boom's precision-manufacturing book, ${high ? "4x+ leverage is upper-range and usually ties to a capex cycle" : "sub-4x leverage sits mid-book"}.`,
        read: high
          ? `The credit turns on whether the debt-funded investment converts to EBITDA; if margins keep compressing, leverage pushes past policy. Anchor on the EBITDA trajectory.`
          : `Leverage is manageable for ${co}; the watch item is the margin trend, not the absolute debt level.`,
        followups: ["Pull the EBITDA bridge to see what's moving margins", "Map debt maturities against the equipment payback"],
      };
    },
  },
  {
    test: /interest coverage|coverage|icr/,
    build: (r, v, co) => {
      const cov = r.interestCoverage, op = r.operatingIncome;
      const weak = cov != null && cov < 1.5;
      const ok = cov != null && cov >= 2;
      return {
        headline: `What's behind ${co}'s interest coverage of ${v || xx(cov)}`,
        drivers: [
          `Coverage is ${xx(cov)} — operating income of ${m$(op)} against the interest load.`,
          ok ? `That's adequate cushion: operations are covering interest comfortably.` :
          weak ? `That's thin — operating income is barely clearing the interest burden.` :
                 `That's moderate cushion; the trend matters more than the point estimate.`,
          `Coverage moves with operating margin, so it's an earnings-quality read as much as a debt-service one.`,
        ],
        trend: `Track operating-income direction — coverage follows margin, and margin is the upstream variable.`,
        portfolioContext: `Boom's book runs coverage in the 2–4x range for healthy precision names; ${cov != null ? `${xx(cov)} screens ${ok ? "in range" : "below"}` : "this"} accordingly.`,
        read: ok
          ? `Coverage is sound for ${co}; it isn't the binding constraint — margin trajectory is.`
          : `Coverage is the metric to watch; it will stay tight until operating margin recovers.`,
        followups: ["Decompose operating income: gross margin vs SG&A", "Stress coverage at a 10% EBITDA decline"],
      };
    },
  },
  {
    test: /revenue|sales|growth/,
    build: (r, v, co) => {
      const rev = r.revenue, yoy = r.revenueYoY;
      const growing = yoy != null && yoy > 0;
      return {
        headline: `What's driving ${co}'s revenue of ${v || m$(rev)}`,
        drivers: [
          `Top line is ${m$(rev)}${yoy != null ? `, ${growing ? "up" : "down"} ${pc(Math.abs(yoy))} YoY` : ""}.`,
          growing
            ? `Demand isn't the problem — the borrower is winning work; the credit question lives below the gross-margin line, in conversion to profit.`
            : `Revenue is soft — worth isolating whether it's volume, pricing, or program timing before underwriting forward.`,
          `For AS9100 aerospace/defense precision work, mix and pricing move margin more than raw volume does.`,
        ],
        trend: yoy != null ? `${growing ? "Growing" : "Declining"} ${pc(Math.abs(yoy))} YoY.` : `Revenue at ${m$(rev)}.`,
        portfolioContext: `Boom's precision peers run mid-single-digit growth; ${co} is ${growing && yoy <= 0.1 ? "in range" : growing ? "above cohort" : "below cohort"} — ${growing ? "revenue isn't the outlier, margin is" : "watch the top line"}.`,
        read: growing
          ? `Revenue is healthy for ${co}; the credit question is below the gross-margin line, not at the top.`
          : `The soft top line is the first thing to diligence for ${co}.`,
        followups: ["Pull revenue by program / customer concentration", "Tie growth to backlog / book-to-bill"],
      };
    },
  },
  {
    test: /ebitda/,
    build: (r, v, co) => {
      const eb = r.ebitda, em = r.ebitdaMargin, op = r.operatingIncome;
      const thin = em != null && em < 0.08;
      const healthy = em != null && em >= 0.1;
      return {
        headline: `Why ${co}'s EBITDA is ${v || m$(eb)}`,
        drivers: [
          `EBITDA is ${m$(eb)}${em != null ? ` — a ${pc(em)} margin` : ""}, built off operating income of ${m$(op)} plus D&A.`,
          healthy ? `That's a solid margin for precision machining — earnings are carrying the balance sheet.` :
          thin ? `That margin is thin for AS9100 work (mid-teens is more typical) — the earnings base is the watch item.` :
                 `That margin is adequate but the trend matters — watch whether it's compressing.`,
          `The lever is gross margin against a relatively fixed SG&A base; small margin moves swing EBITDA materially.`,
        ],
        trend: `EBITDA margin at ${pc(em)} — ${thin ? "softening; confirm cyclical (mix/rework) vs structural (cost base)" : "watch the direction quarter over quarter"}.`,
        portfolioContext: `Boom's precision cohort runs ~12–16% EBITDA margin; ${em != null ? `${pc(em)} is ${healthy ? "in/above range" : "below range"}` : "this"}.`,
        read: thin
          ? `Margin is the metric to press ${co} on — get a normalized EBITDA and a path back toward a teens margin before sizing the facility.`
          : `EBITDA is sound for ${co}; the credit rests on holding this margin through the capex cycle.`,
        followups: ["Build a normalized EBITDA (strip one-timers)", "Benchmark EBITDA margin vs the precision-mfg cohort"],
      };
    },
  },
  {
    test: /gross margin|margin/,
    build: (r, v, co) => {
      const gm = r.grossMargin;
      const thin = gm != null && gm < 0.22;
      return {
        headline: `What's pressuring ${co}'s gross margin of ${v || pc(gm)}`,
        drivers: [
          `Gross margin is ${pc(gm)}${thin ? " — toward the thin end for AS9100 / ISO 13485 precision machining (mid-20s is more typical)" : " — in a reasonable band for precision machining"}.`,
          `Usual drivers: material cost pass-through lag, scrap/rework on tight-tolerance parts, and fixed-price vs T&M contract mix.`,
          `Floor utilization swings absorption of fixed overhead, so volume and margin move together.`,
        ],
        trend: `Margin at ${pc(gm)} — ${thin ? "drifting toward the low end, the leading indicator for EBITDA" : "holding; watch for compression"}.`,
        portfolioContext: `Boom's precision cohort medians ~22–26% gross margin; ${gm != null ? `${pc(gm)} screens ${thin ? "bottom-quartile" : "in range"}` : "this"}.`,
        read: thin
          ? `Gross margin is the upstream cause of any earnings pressure for ${co}; the mix/rework drivers are the key diligence step.`
          : `Gross margin is healthy for ${co}; the watch is whether cost inflation erodes it.`,
        followups: ["Split fixed-price vs T&M margin", "Pull scrap/rework and material-cost trend"],
      };
    },
  },
  {
    test: /total debt|debt/,
    build: (r, v, co) => {
      const debt = r.totalDebt, lev = r.leverage, eb = r.ebitda;
      const levered = lev != null && lev >= 3.5;
      return {
        headline: `Context on ${co}'s total debt of ${v || m$(debt)}`,
        drivers: [
          `Funded debt is ${m$(debt)} — ${xx(lev)} of EBITDA (${m$(eb)}).`,
          levered
            ? `That's a real debt load relative to earnings; incremental facilities tighten leverage headroom.`
            : `Absolute leverage capacity isn't the binding constraint — the balance sheet has room.`,
          `What gates the next facility is the EBITDA-to-debt relationship, not the dollar amount alone.`,
        ],
        trend: `Debt at ${m$(debt)} against ${m$(eb)} EBITDA — ${levered ? "leverage is the watch item" : "comfortable coverage of the debt"}.`,
        portfolioContext: `In Boom's book, ${levered ? "3.5x+ funded leverage usually ties to a capex or acquisition cycle — confirm the use of proceeds" : "low leverage with healthy earnings is mid-book"}.`,
        read: levered
          ? `The debt is material for ${co}; structure on the EBITDA path and the equipment payback, with covenant headroom in mind.`
          : `${co} has leverage capacity; the credit turns on the earnings path, not the debt level.`,
        followups: ["Show revolver availability vs commitment", "Map debt maturities and amortization"],
      };
    },
  },
];

function genericBuild(metric, r, v, co) {
  return {
    headline: `Drill-down on "${metric}" for ${co}`,
    drivers: [
      `Looking at the period-over-period movement in "${metric}" and the line items that compose it.`,
      "Separating run-rate from one-time effects to isolate the real trend.",
    ],
    trend: `Trend for "${metric}" across the available periods.`,
    portfolioContext: `How ${co}'s "${metric}" compares to Boom's relevant peer cohort.`,
    read: `A focused read on what "${metric}" (${v || "current value"}) means for ${co}'s credit.`,
    followups: ["Pull the contributing line items", "Benchmark vs the portfolio"],
  };
}

// Portfolio benchmark — PREVIEW STUB. Data-driven for the subject borrower: its own row reflects the
// real EBITDA margin (passed in via `ratios`); the comparison cohort is illustrative.
export function benchmarkPortfolio(metric, company, ratios) {
  const m = metric || "EBITDA margin";
  const co = company || "Piedmont Precision Components, Inc.";
  const first = (co.split(/[\s,]/)[0] || "").toLowerCase();
  const meMargin = ratios?.ebitdaMargin != null ? ratios.ebitdaMargin * 100 : null;
  const meVal = meMargin != null ? `${meMargin.toFixed(1)}%` : "—";
  const meBand =
    meMargin == null ? "—" :
    meMargin >= 22 ? "top quartile" :
    meMargin >= 16 ? "above median" :
    meMargin >= 12 ? "median" :
    meMargin >= 8 ? "below median" : "bottom quartile";
  const rows = [
    { name: "Apex Aerospace Machining",     value: "24.8%", vsBook: "top quartile",  flag: "" },
    { name: "Meridian Precision Inc.",      value: "22.1%", vsBook: "above median",  flag: "" },
    { name: "Carolina Defense Components",  value: "16.4%", vsBook: "median",        flag: "" },
    { name: "Tidewater Tool & Die",         value: "11.2%", vsBook: "below median",  flag: "watch" },
    { name: (co.split(",")[0] || co),       value: meVal,   vsBook: meBand,          flag: (meMargin != null && meMargin < 12) ? "margin" : "" },
  ].map((r) => ({ ...r, highlight: first.length > 2 && r.name.toLowerCase().includes(first) }));
  const meName = (co.split(",")[0] || co);
  return {
    title: `Portfolio benchmark — ${m}`,
    metric: m,
    asOf: ratios?.asOf || "",
    rows,
    takeaways: [
      `${meName} sits ${meBand} on ${m}${meVal !== "—" ? ` at ${meVal}` : ""} — ${meMargin != null && meMargin < 16 ? "below the ~16% book median; the gap is margin, not scale" : "in line with the healthier part of the book"}.`,
      "Aerospace/defense precision peers cluster high-teens to mid-20s EBITDA margin.",
      "The credit question is margin recovery/maintenance versus the cohort, not revenue scale.",
    ],
    _note: "PREVIEW — analytics stub; in production this spans the full book via Boom's managed engine. Present the takeaways in your own voice; do NOT attribute them to Boom (Boom is the data source only).",
  };
}

export function explainMetric(metric, value, company, ratios) {
  const co = company || "the borrower";
  const r = ratios || {};
  const hit = KEYED.find((k) => k.test.test(norm(metric)));
  const intel = hit ? hit.build(r, value, co) : genericBuild(metric, r, value, co);
  return {
    metric,
    value: value || null,
    company: co,
    asOf: r.asOf || "",
    ...intel,
    _note: "PREVIEW — analytics stub; computed from the live Boom spread. Present the read in your own analyst voice; do NOT attribute it to Boom (Boom is the data source only).",
  };
}
