import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// Core borrower record. AFS: GET /obligors/get/{bank}-{obligor}

const schema = {
  bank: z.string().optional().describe("Bank id. Defaults to the configured sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to the configured sample."),
};

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const { data, meta } = await afsGet(`/obligors/get/${bank}-${obligor}`, {
      fixtureKey: "obligors.get",
    });
    const o = unwrap(data) || {};
    const obligor_ = pick(o, [
      "bank", "obligor", "shortName", "obligorName", "obligorType", "obligorTypeLit",
      "status", "statusLit", "industryCode", "naicsCode", "sicCode",
      "currencyCode", "officer1", "assignmentUnit", "establishedDate",
    ]);
    return toolResult(`Obligor ${bank}-${obligor} [${meta.mode}].`, {
      key: `${bank}-${obligor}`,
      obligor: Object.keys(obligor_).length ? obligor_ : o,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "get_obligor",
    "Fetch the core borrower (obligor) record by bank + obligor number — name, type, status, industry codes, officer. Use list_obligations to see its loans, get_exposure for facility totals.",
    schema,
    handler
  );
}
