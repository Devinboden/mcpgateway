import { z } from "zod";
import { toolResult, toolError } from "../lib/format.js";
import harvested from "../api-discovery/captured/harvested_picklists.json";
import crosswalk from "../api-discovery/captured/picklist_crosswalk.json";
import refLists from "../api-discovery/captured/picklist_api_names.json";

// resolve_codes — the keystone reference tool. Given a coded field name, return its
// valid {code,label} set, from the bundled harvest catalog, falling back to the
// field->refList crosswalk + the /rs/pl name catalog. Fully offline/deterministic.

const optsToCodes = (opts) => (opts || []).map(([code, label]) => ({ code, label }));

const schema = {
  field: z.string().describe("The coded field name, e.g. obligationType, propertyType, basis, chargeType."),
};

async function handler(args) {
  try {
    const field = String(args.field || "").trim();
    if (!field) throw new Error("field is required.");

    // 1) direct hit in the harvested catalog (keyed by field id)
    if (harvested[field]?.opts?.length) {
      const codes = optsToCodes(harvested[field].opts);
      return toolResult(`${codes.length} valid code(s) for "${field}" (harvested catalog).`, {
        field, label: harvested[field].label || null, source: "harvested", count: codes.length, codes,
      });
    }

    // 2) crosswalk -> refList name -> /rs/pl name catalog
    const link = crosswalk[field];
    if (link?.refList && refLists[link.refList]?.opts?.length) {
      const codes = optsToCodes(refLists[link.refList].opts);
      return toolResult(
        `${codes.length} valid code(s) for "${field}" via refList ${link.refList} (call /rs/pl/${link.kind}?name=${link.refList}).`,
        { field, refList: link.refList, kind: link.kind, match: link.match, source: "crosswalk", count: codes.length, codes }
      );
    }

    // 3) miss — suggest near matches
    const lc = field.toLowerCase();
    const suggestions = Object.keys(harvested).filter((k) => k.toLowerCase().includes(lc) || lc.includes(k.toLowerCase())).slice(0, 8);
    return toolResult(`No coded values found for "${field}".`, {
      field, source: "none", count: 0, codes: [],
      suggestions, hint: "Try one of the suggestions, or browse the catalog://valid-values resource.",
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "resolve_codes",
    "Resolve the valid codes for a coded AFS field (e.g. obligationType, propertyType, basis). Returns {code,label} pairs from the harvested catalog, falling back to the field->refList crosswalk. Use BEFORE setting any coded field on a write.",
    schema,
    handler
  );
}
