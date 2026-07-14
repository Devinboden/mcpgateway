import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// Read back an origination workpackage. AFS: GET /wp/commercialOrig/{id}
// The full payload is large — returns a stage/state summary + counts, with the raw
// payload available under `raw` for deeper inspection.

const schema = {
  id: z.union([z.string(), z.number()]).describe("Workpackage id."),
  full: z.boolean().optional().describe("Include the full raw payload (large). Default false."),
};

async function handler(args) {
  try {
    const id = String(args.id);
    const { data, meta } = await afsGet(`/wp/commercialOrig/${id}`, { fixtureKey: "wp.commercialOrig" });
    const wp = unwrap(data) || data || {};
    const units = (wp.units || []).map((u) => pick(u, ["unitId", "stage", "state", "status", "lock", "ownerId"]));
    const summary = {
      id: wp.id ?? id,
      description: wp.description,
      productStructure: wp.productStructure,
      readyToBook: wp.readyToBook,
      units,
      counts: {
        parties: wp.parties?.length ?? wp.deal?.parties?.length,
        requests: wp.deal?.requests?.length,
        obligations: wp.deal?.requests?.reduce?.((n, r) => n + (r.obligations?.length || 0), 0),
        collateral: wp.deal?.collateral?.length,
      },
    };
    return toolResult(`Workpackage ${id} [${meta.mode}]: ${units.map((u) => u.stage).join(", ") || "—"}.`, {
      ...summary, ...(args.full ? { raw: wp } : {}),
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "get_origination_workpackage",
    "Read back an origination workpackage (commercialOrig) by id — stage/state per unit, product structure, readyToBook, and party/request/obligation/collateral counts. Pass full=true for the raw payload.",
    schema,
    handler
  );
}
