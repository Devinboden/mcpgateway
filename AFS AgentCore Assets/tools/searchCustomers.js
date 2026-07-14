import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// Resolve a customer by name -> nameId / obligor. AFS: GET /names/list
// (nameType enum: customer|rate|bank|officer|orgLevel|realEstate|deal|organization|
//  filing|remitTo|groupName). Requires search + organizationId + nameType.

const schema = {
  search: z.string().describe("Name (or fragment) to search for."),
  organizationId: z.string().optional().describe("Organization id. Defaults to 1."),
  nameType: z.string().optional().describe("Name type enum (default 'customer')."),
  rowLimit: z.number().int().positive().optional().describe("Max rows (default 25)."),
};

async function handler(args) {
  try {
    if (!args.search) throw new Error("search is required.");
    const { data, meta } = await afsGet("/names/list", {
      query: {
        search: args.search,
        organizationId: args.organizationId || "1",
        nameType: args.nameType || "customer",
        rowLimit: args.rowLimit || 25,
        sortOrder: "A",
      },
      fixtureKey: "names.list",
    });
    const payload = unwrap(data);
    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const matches = rows.map((n) =>
      pick(n, ["nameId", "fullName", "shortName", "nameType", "taxId", "city", "state", "obligor", "bank"])
    );
    return toolResult(`${matches.length} customer match(es) for "${args.search}" [${meta.mode}].`, {
      search: args.search, count: matches.length, matches,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "search_customers",
    "Search customers by name -> resolve to nameId / obligor (the keys other tools need). nameType defaults to 'customer'.",
    schema,
    handler
  );
}
