import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, pick, money } from "../lib/format.js";

// Assemble the servicing "summary" view of a loan by fanning out across the
// borrower, facility list, terms, outstanding, collateral, and guaranties.
//
//   obligors/get          → borrower
//   exposure/listObligor   → facility list
//   obligations/getFullKey → terms / maturity / commitment
//   balances/listFullKey   → outstanding
//   collateral/list        → collateral
//   supportReferences/list → guaranties (best-effort; needs the supporting key)

const schema = {
  bank: z.string().optional().describe("Bank ID. Defaults to AFS_SAMPLE_BANK."),
  obligor: z.string().optional().describe("Obligor number. Defaults to AFS_SAMPLE_OBLIGOR."),
  obligation: z.string().optional().describe("Obligation number. Defaults to AFS_SAMPLE_OBLIGATION."),
  supportingObligor: z
    .string()
    .optional()
    .describe("Guarantor's obligor number (enables the supportReferences/guaranties lookup)."),
  supportingCollateralItem: z
    .string()
    .optional()
    .describe("Guarantor's collateral item number (part of the support-reference key)."),
  supportedApplication: z
    .string()
    .optional()
    .describe("Application code of the supported obligation. Default 1."),
};

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const obligation = args.obligation || config.sample.obligation;

    const calls = {
      borrower: afsGet(`/obligors/get/${bank}-${obligor}`, { fixtureKey: "obligors.get" }),
      facilities: afsGet(`/exposure/listObligor/${bank}-${obligor}`, { fixtureKey: "exposure.listObligor" }),
      terms: afsGet(`/obligations/getFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "obligations.getFullKey" }),
      outstanding: afsGet(`/balances/listFullKey/${bank}-${obligor}-${obligation}`, { fixtureKey: "balances.listFullKey" }),
      collateral: afsGet(`/collateral/list/${bank}-${obligor}`, { fixtureKey: "collateral.list" }),
    };

    // Guaranties need a full 5-part supporting key — only call when supplied.
    if (args.supportingObligor && args.supportingCollateralItem) {
      const app = args.supportedApplication || "1";
      const key = `${bank}-${args.supportingObligor}-${args.supportingCollateralItem}-${obligor}-${app}`;
      calls.guaranties = afsGet(`/supportReferences/list/${key}`, { fixtureKey: "supportReferences.list" });
    }

    const keys = Object.keys(calls);
    const settled = await Promise.allSettled(Object.values(calls));
    const got = {};
    const warnings = [];
    settled.forEach((r, i) => {
      if (r.status === "fulfilled") got[keys[i]] = r.value.data;
      else warnings.push(`${keys[i]}: ${r.reason?.message || r.reason}`);
    });

    const borrower = got.borrower?.obligors;
    const obg = got.terms?.obligations;
    const balRows = got.outstanding?.balances || [];
    const byCode = (re) => balRows.find((b) => re.test(b.balanceCodeLit || ""));
    // Commitment/drawn live in the balances array as distinct codes; closeAmount
    // is frequently 0, so balances win when present.
    const commitmentBal = byCode(/commitment/i);
    const drawnBal = byCode(/taken\s*down/i) || byCode(/princ/i);
    const commitment = money(commitmentBal?.balance) ?? money(obg?.closeAmount);
    const outstandingRow = drawnBal || balRows[0];

    const summary = {
      key: { bank, obligor, obligation },
      borrower: borrower && {
        name: borrower.shortName,
        type: borrower.obligorTypeLit,
        status: borrower.statusCodeLit,
        salesVolume: money(borrower.salesVolume),
        currency: borrower.currencyCode,
        reviewDate: borrower.reviewDate,
        probabilityOfDefault: borrower.probabilityOfDefault,
      },
      facilities: (got.facilities?.exposure || []).map((e) =>
        pick(e, ["application", "type", "totalDirect", "prinBalCurrentDirect", "futureDirect", "obligationcurrencyCode"])
      ),
      terms: obg && {
        product: obg.typeLit,
        purpose: obg.purposeCodeLit,
        secured: obg.securedCodeLit,
        commitment,
        legalMaturityDate: obg.legalMaturityDate,
        rate: obg.originalRate,
        accrualStatus: obg.accrualStatusLit,
        performing: obg.nonPerformingIndicatorLit,
        loanToValue: obg.actualLoanToValue,
      },
      outstanding: outstandingRow && {
        balanceType: outstandingRow.balanceCodeLit,
        amount: money(outstandingRow.balance),
        currency: outstandingRow.currencyCode || "USD",
        asOf: outstandingRow.effectiveDate,
      },
      balanceCodes: balRows.map((b) => ({ code: b.balanceCodeLit, amount: money(b.balance) })),
      collateral: (got.collateral?.collateral || []).map((c) => ({
        item: c.collateralItem,
        type: c.collateralTypeLit,
        description: c.collateralName,
        currentValue: money(c.currentValue),
        netUseableValue: money(c.netUseableValue),
        advancePercent: c.advancePercent,
      })),
      guaranties: (got.guaranties?.supportReferences || []).map((g) => ({
        guarantor: g.supportingObligor,
        type: g.supportTypeLit,
        amountLimit: money(g.amountLimit),
        percentLimit: g.percentLimit,
        expirationDate: g.expirationDate,
      })),
    };

    if (!args.supportingObligor) {
      warnings.push("guaranties: skipped — pass supportingObligor + supportingCollateralItem to include support references.");
    }

    return toolResult(
      `Servicing summary for ${summary.borrower?.name || `${bank}-${obligor}`}, obligation ${obligation}.`,
      { ...summary, warnings }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "loan_summary",
    "Assemble the servicing summary for a loan: borrower, facilities, terms/maturity/commitment, outstanding, collateral and guaranties.",
    schema,
    handler
  );
}
