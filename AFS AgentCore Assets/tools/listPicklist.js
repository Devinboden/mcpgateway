import { z } from "zod";
import { toolResult, toolError } from "../lib/format.js";
import refLists from "../api-discovery/captured/picklist_api_names.json";

// list_picklist — return the options for a specific AFS refList name (e.g. CLRE245,
// PRMS200, *ORG050) from the captured /rs/pl name catalog. The live equivalent is
// GET /webx/rs/pl/fixed|dynamic?name=<refList>; this serves the captured snapshot.

const schema = {
  refList: z.string().describe("The refList name, e.g. CLRE245, PRMS200, *ORG050, ilm/pl/RequestType."),
};

async function handler(args) {
  try {
    const name = String(args.refList || "").trim();
    if (!name) throw new Error("refList is required.");
    const entry = refLists[name];
    if (!entry?.opts) {
      const suggestions = Object.keys(refLists).filter((k) => k.toLowerCase().includes(name.toLowerCase())).slice(0, 10);
      return toolResult(`refList "${name}" not in the captured catalog.`, { refList: name, count: 0, codes: [], suggestions });
    }
    const codes = entry.opts.map(([code, label]) => ({ code, label }));
    return toolResult(`${codes.length} option(s) for refList ${name} (${entry.kind}).`, {
      refList: name, kind: entry.kind, plName: entry.plName, count: codes.length, codes,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "list_picklist",
    "Return the options for a specific AFS refList name (e.g. CLRE245, PRMS200, *ORG050) from the captured /rs/pl catalog. Prefer resolve_codes when you have a field name rather than a refList name.",
    schema,
    handler
  );
}
