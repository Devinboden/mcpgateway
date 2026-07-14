// AFS reference catalogs exposed as read-only MCP resources, so an agent can pull
// field codes / refList mappings as context instead of guessing. Backed by the
// captured api-discovery artifacts (bundled at build).

import harvested from "../api-discovery/captured/harvested_picklists.json";
import crosswalk from "../api-discovery/captured/picklist_crosswalk.json";
import refLists from "../api-discovery/captured/picklist_api_names.json";

const JSON_MIME = "application/json";

const COVERAGE = {
  summary: "AFS Vision API mapping status (see api-discovery/docs/overview/coverage-status.md).",
  specs: 110,
  reads: { total: 231, liveVerified: "~48% (110/231)", note: "ceiling is role + booking, not discovery" },
  writes: { total: 57, validationRulesMapped: "~90%" },
  buildALoan: "~95% (through closing-complete; servicing post is out-of-role)",
  validValues: { codedFields: 155, rows: 3720, refListNames: 85, fieldToRefListLinks: 114 },
  remainingGaps: ["broader AFSDD301 role (47 x 403 reads)", "back-office/booking role (servicing post)"],
};

function jsonResource(server, name, uri, title, obj) {
  server.registerResource(
    name,
    uri,
    { title, mimeType: JSON_MIME },
    async () => ({ contents: [{ uri, mimeType: JSON_MIME, text: JSON.stringify(obj) }] })
  );
}

export function registerAfsResources(server) {
  jsonResource(server, "AFS valid-values catalog", "catalog://valid-values",
    "Coded fields → code/label (155 fields)", harvested);
  jsonResource(server, "AFS field→refList crosswalk", "catalog://refcode-crosswalk",
    "UI field → /rs/pl refList name (114 links)", crosswalk);
  jsonResource(server, "AFS refList name catalog", "catalog://reflist-names",
    "refList name → options (85 names)", refLists);
  jsonResource(server, "AFS coverage status", "status://coverage",
    "Live API-mapping coverage snapshot", COVERAGE);
}
