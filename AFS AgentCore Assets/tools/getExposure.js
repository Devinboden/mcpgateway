import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap } from "../lib/format.js";

// Facility / exposure totals for an obligor.
// AFS: GET /exposure/listObligor/{bank}-{obligor}

const schema = {
  bank: z.string().optional().describe("Bank id. Defaults to sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
};

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const { data, meta } = await afsGet(`/exposure/listObligor/${bank}-${obligor}`, {
      fixtureKey: "exposure.listObligor",
    });
    const exposure = unwrap(data) ?? data;
    return toolResult(`Exposure for ${bank}-${obligor} [${meta.mode}].`, {
      key: `${bank}-${obligor}`,
      exposure,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "get_exposure",
    "Obligor exposure / facility totals (committed, outstanding, available across the relationship). Use get_obligation_detail for a single obligation's balances.",
    schema,
    handler
  );
}
