import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, money, num, monthsAgo, today } from "../lib/format.js";

// Payment / delinquency history for an obligation.
//
//   currentObligations/getFullKey → current days-past-due, returned checks, first delinquency
//   obligations/getFullKey        → times-past-due + 30/60/90/120/150 aging buckets
//   financialHistory/effectiveFrom → the discrete late/payment events

const schema = {
  bank: z.string().optional().describe("Bank ID. Defaults to AFS_SAMPLE_BANK."),
  obligor: z.string().optional().describe("Obligor number. Defaults to AFS_SAMPLE_OBLIGOR."),
  obligation: z.string().optional().describe("Obligation number. Defaults to AFS_SAMPLE_OBLIGATION."),
  obligationId: z.string().optional().describe("Obligation ID for the ledger. Defaults to AFS_SAMPLE_OBLIGATION_ID."),
  effectiveFrom: z.string().optional().describe("Ledger start (YYYY-MM-DD). Default: 12 months ago."),
};

/** Days between a previous-due date and now, floored at 0. */
function daysPastDue(prevDue) {
  if (!prevDue) return 0;
  const diff = Math.floor((Date.now() - new Date(prevDue).getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const obligation = args.obligation || config.sample.obligation;
    const effectiveFrom = args.effectiveFrom || monthsAgo(12);

    const notes = [];

    // Obligation (aging buckets) + current obligation (delinquency). currentObligations
    // legitimately 404s for some facilities — treat that as "no record", not an error.
    const [obRes, coRes] = await Promise.all([
      afsGet(`/obligations/getFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "obligations.getFullKey", allow404: true }),
      afsGet(`/currentObligations/getFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "currentObligations.getFullKey", allow404: true }),
    ]);
    const ob = obRes.data?.obligations;
    const co = coRes.data?.currentObligations;
    if (obRes.notFound) notes.push("No obligation record found.");
    if (coRes.notFound) notes.push("No current-obligation record (common for revolving facilities).");

    // Prefer the obligationId from the record; fall back to arg / sample.
    const obligationId = ob?.obligationId ?? args.obligationId ?? config.sample.obligationId;

    // Ledger: try the requested window, then widen back to obligation origination
    // (AFS returns 404 — not empty — when nothing falls in the window).
    let fh = [];
    const pull = async (from) => {
      const r = await afsGet(`/financialHistory/effectiveFrom/${obligationId}`, {
        query: { effectiveFrom: from, effectiveTo: today(), sortOrder: "ASC" },
        fixtureKey: "financialHistory.effectiveFrom",
        allow404: true,
      });
      return r.notFound ? [] : r.data?.financialHistory || [];
    };
    fh = await pull(effectiveFrom);
    if (fh.length === 0 && !args.effectiveFrom) {
      const wide = ob?.originalObligationDate && ob.originalObligationDate > "1901" ? ob.originalObligationDate : "2000-01-01";
      fh = await pull(wide);
      if (fh.length) notes.push(`No activity in the last 12 months; widened ledger window to ${wide}.`);
    }

    // Discrete late events: payments/reversals in the ledger window.
    const events = fh
      .filter((t) => /pay|revers|late|return/i.test(t.transactionOriginLit || ""))
      .map((t) => ({ date: t.effectiveDate, type: t.transactionOriginLit, amount: money(t.transactionAmount) }));

    const payload = {
      key: { bank, obligor, obligation, obligationId },
      status: {
        currentDaysPastDue: num(ob?.pastDueDays) ?? daysPastDue(co?.principalPreviousDueDate),
        timesPastDue: num(ob?.pastDueTimes),
        returnedCheckCount: num(co?.returnCheckCount),
        nextDueDate: co?.nextDueDate,
        firstDelinquencyDate: co?.firstDelinquencyDate,
        principalPastDue: money(co?.principalPastDue),
        principalBilledNotPaid: money(co?.principalBilledNotPaid),
        performing: ob?.nonPerformingIndicatorLit,
        finalClose: co?.finalCloseIndicatorLit,
      },
      agingBuckets: {
        "30": num(ob?.pastDue30Days),
        "60": num(ob?.pastDue60Days),
        "90": num(ob?.pastDue90Days),
        "120": num(ob?.pastDue120Days),
        "150": num(ob?.pastDue150Days),
      },
      events,
      ledgerTransactions: fh.length,
      notes,
    };

    return toolResult(
      `Payment history for obligation ${obligation}: ${payload.status.currentDaysPastDue} days past due, ` +
        `${payload.status.timesPastDue ?? 0} times past due, ${payload.status.returnedCheckCount ?? 0} returned check(s).`,
      payload
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "payment_history",
    "Report payment/delinquency history for an obligation: current days-past-due, times-past-due, returned checks, aging buckets, and discrete late events.",
    schema,
    handler
  );
}
