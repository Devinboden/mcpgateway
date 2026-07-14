import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// All obligations (financial instruments) under an obligor.
// AFS: GET /financialInstrument/listAllByObligor/{bank}-{obligor}
// Note: financialInstrumentId == the obligation's internal id (== obligationId).

const schema = {
  bank: z.string().optional().describe("Bank id. Defaults to sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
};

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const { data, meta } = await afsGet(`/financialInstrument/listAllByObligor/${bank}-${obligor}`, {
      fixtureKey: "financialInstrument.listAllByObligor",
    });
    const payload = unwrap(data);
    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const obligations = rows.map((r) =>
      pick(r, [
        "financialInstrumentId", "obligor", "application", "applicationLit",
        "type", "processType", "processTypeLit", "shortName",
        "effectiveDate", "closeIndicatorLit", "currencyCode", "fiNumber",
      ])
    );
    return toolResult(
      `${obligations.length} obligation(s) under ${bank}-${obligor} [${meta.mode}]. (financialInstrumentId == obligationId.)`,
      { key: `${bank}-${obligor}`, count: obligations.length, obligations }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "list_obligations",
    "List every obligation (financial instrument) under an obligor — yields each obligation's id (financialInstrumentId == obligationId), application, type, and short name. Feed an id into get_obligation_detail.",
    schema,
    handler
  );
}
