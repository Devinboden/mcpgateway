import { z } from "zod";
import { afsPost } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap } from "../lib/format.js";

// Create an obligor under a customer. AFS: POST /createObligor
// Body { obligor: Wf-cbm-Obligor }. Required: bankId, ilmId (hard FK from
// createCustomer), shortName, type, plus orgLevelData (assignmentUnit, officer1).
// NOTE: creates a REAL record — no simulate.

const schema = {
  ilmId: z.string().describe("ILM id from create_customer (hard FK)."),
  shortName: z.string().describe("Obligor short name."),
  type: z.string().describe("Obligor type code (use resolve_codes('obligorType') for valid values)."),
  bankId: z.string().optional().describe("Bank id. Defaults to sample bank."),
  assignmentUnit: z.string().optional().describe("Assignment unit / cost center. Default '1001500'."),
  officer1: z.string().optional().describe("Primary officer code. Defaults to sample officer."),
};

async function handler(args) {
  try {
    for (const k of ["ilmId", "shortName", "type"]) {
      if (!args[k]) throw new Error(`${k} is required.`);
    }
    const body = {
      obligor: {
        bankId: args.bankId || config.sample.bank,
        ilmId: args.ilmId,
        shortName: args.shortName,
        type: args.type,
        orgLevelData: {
          assignmentUnit: args.assignmentUnit || "1001500",
          officer1: args.officer1 || config.sample.officer,
        },
      },
    };
    const { data, meta } = await afsPost("/createObligor", { body, fixtureKey: "createObligor.create" });
    const d = unwrap(data) || data || {};
    const obligorNumber = d.obligor ?? d.obligorNumber ?? d.id;
    return toolResult(
      `Created obligor ${obligorNumber} (bank ${body.obligor.bankId}, "${args.shortName}") [${meta.mode}].`,
      { obligorNumber, bankId: body.obligor.bankId, ilmId: args.ilmId, shortName: args.shortName, type: args.type }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "create_obligor",
    "Create an obligor under a customer (ilmId from create_customer). Requires shortName + type (resolve_codes('obligorType')); defaults assignmentUnit/officer. NOTE: creates a real record — no dry-run.",
    schema,
    handler
  );
}
