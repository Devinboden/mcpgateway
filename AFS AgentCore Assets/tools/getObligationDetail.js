import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap, today, monthsAgo } from "../lib/format.js";

// Composite: a single obligation's full picture — terms + balances + charges +
// recent financial history. Each section is fault-isolated so one failing read
// doesn't sink the bundle. NOTE: charges full-key services 500 with `pattern`, so
// it is omitted (per api-discovery findings).

const schema = {
  bank: z.string().optional().describe("Bank id. Defaults to sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
  obligation: z.string().optional().describe("Obligation number. Defaults to sample."),
  obligationId: z.string().optional().describe("Internal obligation id (for the financial-history ledger). Defaults to sample."),
};

async function section(fn) {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const obligation = args.obligation || config.sample.obligation;
    const obligationId = args.obligationId || config.sample.obligationId;
    const fullKey = `${bank}-${obligor}-${obligation}`;

    const [terms, balances, charges, history] = await Promise.all([
      section(async () => unwrap((await afsGet(`/obligations/getFullKey/${fullKey}`, { fixtureKey: "obligations.getFullKey" })).data)),
      section(async () => unwrap((await afsGet(`/balances/listFullKey/${fullKey}`, { fixtureKey: "balances.listFullKey" })).data)),
      // pattern intentionally omitted — charges/listFullKey 500s with it.
      section(async () => unwrap((await afsGet(`/charges/listFullKey/${fullKey}`, { fixtureKey: "charges.listFullKey" })).data)),
      section(async () => unwrap((await afsGet(`/financialHistory/effectiveFrom/${obligationId}`, {
        query: { effectiveFrom: monthsAgo(12), effectiveTo: today(), sortOrder: "D" },
        fixtureKey: "financialHistory.effectiveFrom",
      })).data)),
    ]);

    const payload = { key: fullKey, obligationId, terms, balances, charges, financialHistory: history };
    const failed = [["terms", terms], ["balances", balances], ["charges", charges], ["financialHistory", history]]
      .filter(([, s]) => !s.ok).map(([n]) => n);
    const note = failed.length ? ` (sections unavailable: ${failed.join(", ")})` : "";
    return toolResult(`Obligation ${fullKey} detail.${note}`, payload);
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "get_obligation_detail",
    "Full picture of ONE obligation — terms/maturity/rate + balance codes + charges + 12mo financial-history ledger, bundled. Each section is fault-isolated. Get the obligation key from list_obligations.",
    schema,
    handler
  );
}
