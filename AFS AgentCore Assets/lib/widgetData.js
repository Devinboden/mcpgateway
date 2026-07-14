import { afsGet } from "./afsClient.js";
import { config } from "./config.js";
import { num, money, today } from "./format.js";

// Shapes live AFS data into the payloads the (Truist-branded) widgets expect.

// Month-end drawn-balance series from "Amount Takendown" ledger postings.
// Each financialHistory row's headerCode is a balance code; summing the
// takedown-code rows cumulatively reconstructs the funded balance (validated
// live: it reconciles to the current Amount Takendown). Returns the last `n`
// month-end snapshots with funded balance + utilization vs commitment.
function monthEndSeries(txns, commitment, n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const me = new Date(now.getFullYear(), now.getMonth() - i + 1, 0); // last day of that month
    const cutoff = me.toISOString().slice(0, 10);
    const funded = txns.reduce((a, t) => (t.date <= cutoff ? a + t.amt : a), 0);
    const utilizationPct = commitment ? Math.round((funded / commitment) * 1000) / 10 : null;
    out.push({ month: cutoff.slice(0, 7), balance: funded, utilizationPct });
  }
  return out;
}

// ── Officer loan book (widget/officer.html) ──────────────────────────────────
// Shows the officer's BOOKED servicing loans (not workpackages). Bridge:
//   jobs/listByOfficers → distinct {bank, obligor} → financialInstrument/
//   listAllByObligor → booked obligations (fiNumber = obligation #).
// Expects: { officerId, source, count, loans:[{borrower,facility,type,amount,riskGrade,status,workpackageId,bank,obligor,obligation}] }
export async function assembleOfficerLoans(officer) {
  const officerId = officer || config.sample.officer;
  const { data, meta } = await afsGet("/jobs/listByOfficers", {
    query: { officer1Code: officerId },
    fixtureKey: "jobs.listByOfficers",
  });
  const wps = data?.jobListByOfficers || [];

  // Distinct obligors from the officer's workpackages.
  const seen = new Map();
  for (const wp of wps) {
    if (!wp.obligorNumber) continue;
    const key = `${wp.bankId}-${wp.obligorNumber}`;
    if (!seen.has(key)) seen.set(key, { bank: wp.bankId, obligor: wp.obligorNumber, customerName: (wp.customerName || "").replace(/^\*/, "") });
  }
  const obligors = [...seen.values()].slice(0, 100); // bound fan-out (covers all of an officer's obligors)

  // Each obligor → its booked obligations.
  const per = await Promise.all(
    obligors.map(async (o) => {
      const r = await afsGet(`/financialInstrument/listAllByObligor/${o.bank}-${o.obligor}`, {
        query: { rowLimit: 100 },
        fixtureKey: "financialInstrument.listAllByObligor",
        allow404: true,
      });
      const fis = r.notFound ? [] : r.data?.financialInstrument || [];
      return fis.map((fi) => ({
        borrower: o.customerName,
        facility: fi.shortName || `Obligation ${fi.fiNumber}`,
        type: `Obln ${fi.fiNumber}`,
        amount: undefined, // commitment not pulled here (per-loan balance call); open the summary for it
        riskGrade: "",
        status: fi.closeIndicator ? "Closed" : "Booked",
        workpackageId: fi.fiNumber,
        bank: o.bank,
        obligor: o.obligor,
        obligation: fi.fiNumber,
      }));
    })
  );
  const loans = per.flat();
  return { officerId, source: meta.mode, count: loans.length, loans };
}

// ── Credit-memo summary (widget/summary.html) ────────────────────────────────
// Expects: { borrower, wpId, source, viewInAfsUrl?, summary:{facilities,balances,
//   collateral,guarantees,risk_ratings,past_due}, analytics:{revolver_usage,
//   payment_history,balance_trend} }
export async function assembleSummary({ bank, obligor, obligation } = {}) {
  bank = bank || config.sample.bank;
  obligor = obligor || config.sample.obligor;
  obligation = obligation || config.sample.obligation;

  const [obgR, obR, balR, colR, coR] = await Promise.allSettled([
    afsGet(`/obligors/get/${bank}-${obligor}`, { fixtureKey: "obligors.get", allow404: true }),
    afsGet(`/obligations/getFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "obligations.getFullKey", allow404: true }),
    afsGet(`/balances/listFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "balances.listFullKey", allow404: true }),
    afsGet(`/collateral/list/${bank}-${obligor}`, { fixtureKey: "collateral.list", allow404: true }),
    afsGet(`/currentObligations/getFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "currentObligations.getFullKey", allow404: true }),
  ]);
  const val = (r, k) => (r.status === "fulfilled" ? r.value.data?.[k] : undefined);
  const borrowerRec = val(obgR, "obligors");
  const o = val(obR, "obligations") || {};
  const balRows = val(balR, "balances") || [];
  const colls = val(colR, "collateral") || [];
  const co = val(coR, "currentObligations") || {};

  const byCode = (re) => balRows.find((b) => re.test(b.balanceCodeLit || ""));
  const commitment = num(byCode(/commitment/i)?.balance) ?? num(o.closeAmount);
  const drawn = num(byCode(/taken\s*down/i)?.balance);
  const util = commitment ? Math.round(((drawn ?? 0) / commitment) * 1000) / 10 : null;

  // 12-month drawn/utilization series from the ledger's Amount-Takendown postings.
  const takedownCode = byCode(/taken\s*down/i)?.balanceCode;
  const obligationId = o.obligationId;
  let months = [];
  if (obligationId != null && takedownCode != null && commitment) {
    const from = o.originalObligationDate && o.originalObligationDate > "1901" ? o.originalObligationDate : "2000-01-01";
    const fhR = await afsGet(`/financialHistory/effectiveFrom/${obligationId}`, {
      query: { effectiveFrom: from, effectiveTo: today(), sortOrder: "ASC" },
      fixtureKey: "financialHistory.effectiveFrom",
      allow404: true,
    });
    const txns = (fhR.notFound ? [] : fhR.data?.financialHistory || [])
      .filter((t) => t.headerCode === takedownCode)
      .map((t) => ({ date: String(t.effectiveDate), amt: num(t.transactionAmount) || 0 }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    months = monthEndSeries(txns, commitment, 12);
  }
  const utils = months.map((m) => m.utilizationPct).filter((v) => v != null);
  const high = utils.length ? Math.max(...utils) : util;
  const low = utils.length ? Math.min(...utils) : util;
  const average = utils.length ? Math.round((utils.reduce((a, b) => a + b, 0) / utils.length) * 10) / 10 : util;
  const monthsAtZero = months.filter((m) => (m.balance || 0) === 0).length;

  const facilities = [{
    title: o.typeLit || `Obligation ${obligation}`,
    process_type: o.typeLit,
    amount: commitment,
    current_outstanding: drawn,
    legal_maturity_date: o.legalMaturityDate,
  }];

  return {
    borrower: borrowerRec?.shortName || `${bank}-${obligor}`,
    wpId: String(obligation),
    source: obgR.status === "fulfilled" ? obgR.value.meta?.mode : "live",
    // Deep link into AFS. For now → the AFS app login; later we'll target the loan.
    viewInAfsUrl: process.env.AFS_UI_URL || "https://dd3.afsvision.us/webx/rs/app/15/15",
    summary: {
      facilities: { facilities },
      balances: { balances: balRows.map((b) => ({ description: b.balanceCodeLit, amount: money(b.balance) })) },
      collateral: { collateral: colls.map((c) => ({ type_description: c.collateralTypeLit, current_value: c.currentValue })) },
      past_due: { past_due: [{ days_past_due: num(o.pastDueDays), total_times_past_due: num(o.pastDueTimes) }] },
    },
    analytics: {
      revolver_usage: { average, high, low, days_at_zero: monthsAtZero, months },
      payment_history: {
        buckets: {
          "30_59": num(o.pastDue30Days),
          "60_89": num(o.pastDue60Days),
          "90_plus": (num(o.pastDue90Days) || 0) + (num(o.pastDue120Days) || 0) + (num(o.pastDue150Days) || 0),
        },
        current_days_past_due: num(o.pastDueDays),
        current_past_due_amount: money(co.principalPastDue ?? o.pastDueAmount),
      },
      balance_trend: {
        current: money(drawn),
        commitment: money(commitment),
        months: months.map((m) => ({ month: m.month, balance: m.balance })),
      },
    },
  };
}
