import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// Collateral items pledged by an obligor.
// AFS: GET /collateral/list/{bank}-{obligor}

const schema = {
  bank: z.string().optional().describe("Bank id. Defaults to sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
};

async function handler(args) {
  try {
    const bank = args.bank || config.sample.bank;
    const obligor = args.obligor || config.sample.obligor;
    const { data, meta } = await afsGet(`/collateral/list/${bank}-${obligor}`, {
      fixtureKey: "collateral.list",
    });
    const payload = unwrap(data);
    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const collateral = rows.map((c) =>
      pick(c, [
        "collateralItem", "collateralType", "collateralTypeLit", "shortDescription",
        "functionType", "functionTypeLit", "currentCollateralValue", "currencyCode",
        "newExisting", "ownerObligor",
      ])
    );
    return toolResult(`${collateral.length} collateral item(s) for ${bank}-${obligor} [${meta.mode}].`, {
      key: `${bank}-${obligor}`,
      count: collateral.length,
      collateral,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "list_collateral",
    "List the collateral items pledged by an obligor — type, description, current value, function. (Real-estate / negotiable detail lives on each item.)",
    schema,
    handler
  );
}
