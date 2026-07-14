import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { toolResult, toolError, unwrap, pick } from "../lib/format.js";

// Resolve valid financial-transaction names (the `transaction` apiName for
// post_financial_transaction). AFS: GET /apis/list?apiNameSearch=

const schema = {
  search: z.string().optional().describe("Substring to filter apiNames (e.g. 'Disburse', 'Payment')."),
  category: z.string().optional().describe("Filter by category (e.g. Disbursement, Payment, Advance)."),
};

async function handler(args) {
  try {
    const path = args.category ? "/apis/listByCategory" : "/apis/list";
    const query = args.category
      ? { category: args.category, sortOrder: "A" }
      : { apiNameSearch: args.search || "", sortOrder: "A" };
    const { data, meta } = await afsGet(path, { query, fixtureKey: "apis.list" });
    const payload = unwrap(data);
    const rows = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const apis = rows
      .map((a) => pick(a, ["apiName", "name", "category", "description", "headerType"]))
      .filter((a) => !args.search || JSON.stringify(a).toLowerCase().includes(args.search.toLowerCase()));
    return toolResult(`${apis.length} transaction api(s)${args.search ? ` matching "${args.search}"` : ""} [${meta.mode}].`, {
      count: apis.length, apis,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "lookup_transaction_apis",
    "List valid financial-transaction apiNames (the `transaction` value for post_financial_transaction), e.g. DisburseFuture, DisburseCurrent. Filter by search substring or category.",
    schema,
    handler
  );
}
