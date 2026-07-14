import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, money, num, monthsAgo, today } from "../lib/format.js";

// Revolver utilization — read straight from the balances array, which carries
// the commitment and drawn amounts as distinct balance codes. (Validated live:
// the ledger's runningBalance is often "Not Developed", so we don't rely on it.)
//
//   balances/listFullKey/{bank}-{obligor}-{obligation}
//     · "Commitment Balance"  → commitment
//     · "Amount Takendown"    → funded / drawn
//     · "Unused Balance"      → available
//   utilization = drawn ÷ commitment
//
//   financialHistory/effectiveFrom/{obligationId} → optional transaction list

const schema = {
  bank: z.string().optional().describe("Bank ID. Defaults to AFS_SAMPLE_BANK."),
  obligor: z.string().optional().describe("Obligor number. Defaults to AFS_SAMPLE_OBLIGOR."),
  obligation: z.string().optional().describe("Obligation number. Defaults to AFS_SAMPLE_OBLIGATION."),
  obligationId: z.string().optional().describe("Obligation ID for the optional ledger. Defaults to AFS_SAMPLE_OBLIGATION_ID."),
  includeLedger: z.boolean().optional().describe("Also return the transaction ledger. Default false."),
  effectiveFrom: z.string().optional().describe("Ledger start (YYYY-MM-DD). Default: 12 months ago."),
  effectiveTo: z.string().optional().describe("Ledger end (YYYY-MM-DD). Default: today."),
};

const findBalance = (rows, re) => rows.find((b) => re.test(b.balanceCodeLit || ""));

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const obligation = args.obligation || config.sample.obligation;

    const { data, meta } = await afsGet(`/balances/listFullKey/${bank}-${obligor}-${obligation}`, {
      fixtureKey: "balances.listFullKey",
    });
    const rows = data?.balances || [];

    const commitment = num(findBalance(rows, /commitment/i)?.balance);
    const drawn = num(findBalance(rows, /taken\s*down/i)?.balance);
    const unused = num(findBalance(rows, /unused/i)?.balance);

    // Fall back to (commitment - unused) when there's no explicit drawn row.
    const funded = drawn ?? (commitment != null && unused != null ? commitment - unused : undefined);
    const utilization =
      commitment && commitment > 0 && funded != null
        ? Math.round((funded / commitment) * 1000) / 10
        : undefined;

    let ledger;
    if (args.includeLedger) {
      const obligationId = args.obligationId || config.sample.obligationId;
      const { data: fhData } = await afsGet(`/financialHistory/effectiveFrom/${obligationId}`, {
        query: { effectiveFrom: args.effectiveFrom || monthsAgo(12), effectiveTo: args.effectiveTo || today(), sortOrder: "ASC" },
        fixtureKey: "financialHistory.effectiveFrom",
      });
      ledger = (fhData?.financialHistory || []).map((t) => ({
        date: t.effectiveDate,
        type: t.transactionOriginLit,
        amount: money(t.transactionAmount),
        // runningBalance is numeric only when AFS has computed it.
        runningBalance: num(t.runningBalance),
      }));
    }

    return toolResult(
      utilization != null
        ? `Drawn $${funded.toLocaleString()} / commitment $${commitment.toLocaleString()} = ${utilization}% utilization [${meta.mode}].`
        : `Could not derive utilization from balances for ${bank}-${obligor}-${obligation} [${meta.mode}].`,
      {
        key: { bank, obligor, obligation },
        commitment: money(commitment),
        drawn: money(funded),
        unused: money(unused),
        utilizationPercent: utilization,
        balanceCodes: rows.map((b) => ({ code: b.balanceCodeLit, amount: money(b.balance), asOf: b.effectiveDate })),
        ...(ledger ? { ledger } : {}),
      }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "revolver_utilization",
    "Compute revolver utilization (drawn ÷ commitment) from the balances array's Commitment/Takendown/Unused codes; optionally include the transaction ledger.",
    schema,
    handler
  );
}
