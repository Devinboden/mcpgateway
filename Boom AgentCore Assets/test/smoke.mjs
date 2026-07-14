#!/usr/bin/env node
// Smoke test — spawns the stdio server over the real MCP protocol, lists + calls every tool,
// and asserts a known fixture figure. Run: npm test
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const EXT_ID = "001bb00000Atlas01AAA";
let failures = 0;
const assert = (label, got, want) => {
  const pass = got === want;
  if (!pass) failures++;
  console.log(`Assert: ${label} = ${got} (expect ${want}) → ${pass ? "PASS" : "FAIL"}`);
};
const parse = (res) => JSON.parse(res.content[0].text);

const transport = new StdioClientTransport({ command: "node", args: [join(ROOT, "src/stdio.js")] });
const client = new Client({ name: "boom-smoke", version: "0.0.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name).join(", "));
assert("tool count", tools.length, 9);

const company = parse(await client.callTool({ name: "boom_lookup_company", arguments: { externalUniqueId: EXT_ID } }));
console.log("company:", company.company.name, "| files:", company.company.fileIds.join(","));

const files = parse(await client.callTool({ name: "boom_list_files", arguments: { externalUniqueId: EXT_ID } }));
const fileId = files.files[0].fileId;
console.log("first file:", fileId, files.files[0].status);

parse(await client.callTool({ name: "boom_get_spread", arguments: { fileId } }));

const li = parse(await client.callTool({ name: "boom_get_line_items", arguments: { fileId, accountCodes: ["adjusted_ebitda", "total_debt"] } }));
const ebitda = li.rows.find((r) => r.accountCode === "adjusted_ebitda")?.periodValues?.["FY2024"];
assert("FY2024 adjusted_ebitda", ebitda, 5800000);

// boom_get_ratios — the shared deriveRatios() path, exposed as a data tool (raw numbers + display cards)
const r = parse(await client.callTool({ name: "boom_get_ratios", arguments: { fileId } }));
assert("ratios card count", r.ratios.length, 6);
assert("raw.revenue is numeric", typeof r.raw.revenue, "number");

// boom_explain_metric — Boom Intelligence stub; must be keyed to the clicked metric
const ex = parse(await client.callTool({ name: "boom_explain_metric", arguments: { metric: "Total Leverage", value: "NM", company: "Piedmont Precision Components, Inc." } }));
assert("explain echoes the metric", ex.metric, "Total Leverage");
assert("explain is leverage-specific", /leverage/i.test(ex.headline), true);
assert("explain has drivers", Array.isArray(ex.drivers) && ex.drivers.length > 0, true);

// boom_benchmark_portfolio — Boom Intelligence portfolio stub; highlights the named borrower
const pf = parse(await client.callTool({ name: "boom_benchmark_portfolio", arguments: { company: "Piedmont Precision Components, Inc." } }));
assert("portfolio has rows", Array.isArray(pf.rows) && pf.rows.length >= 3, true);
assert("portfolio highlights borrower", pf.rows.some((r) => r.highlight), true);

await client.close();
console.log(`\nSmoke test ${failures ? "FAILED (" + failures + ")" : "complete — all pass"}.`);
process.exit(failures ? 1 : 0);
