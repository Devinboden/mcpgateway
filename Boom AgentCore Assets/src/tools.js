// The Boom MCP tool surface — ONE definition, registered onto either transport's server.
//
// `server` is the MCP server passed by:
//   - stdio:  new McpServer(...)               (@modelcontextprotocol/sdk)
//   - HTTP:   the callback arg of createMcpHandler(...)  (mcp-handler)
// Both expose the same `registerTool(name, {title, description, inputSchema}, handler)` API,
// so this module is transport-agnostic. Keep all Boom tool logic here and nowhere else.

import { z } from "zod";
import { deriveRatios } from "./ratios.js";
import { resolveFile } from "./resolve.js";
import { explainMetric, benchmarkPortfolio } from "./intelligence.js";

const ok = (obj) => ({ content: [{ type: "text", text: JSON.stringify(obj, null, 2) }] });

export function registerBoomTools(server, client) {
  const mode = client.mode;

  server.registerTool(
    "boom_lookup_company",
    {
      title: "Look up Boom company by external id",
      description:
        "[BOOM-MANAGED — generic Boom API wrapper; would ship in Boom's own managed connector] Resolve a Boom Company from the Salesforce Account Id (externalUniqueId bridge). Returns the company and its fileIds.",
      inputSchema: { externalUniqueId: z.string().describe("Salesforce Account Id (externalUniqueId).") },
    },
    async ({ externalUniqueId }) => {
      const company = await client.lookupCompany(externalUniqueId);
      return ok({ _source: mode, _provenance: { system: "Boom", record: company.id }, company });
    }
  );

  server.registerTool(
    "boom_find_company",
    {
      title: "Find a Boom company by name",
      description:
        "[BOOM-MANAGED — generic Boom API wrapper; would ship in Boom's own managed connector] Resolve a borrower DIRECTLY in Boom by NAME — returns matches with { id, name, externalUniqueId, fileIds }. Use this FIRST when you only have a company name (e.g. 'Piedmont'); do NOT route through Salesforce/nCino just to get an id. Prefer this over boom_lookup_company unless you already hold the Salesforce Account Id.",
      inputSchema: { name: z.string().describe("Company name or partial name, e.g. 'Piedmont'.") },
    },
    async ({ name }) => {
      const matches = await client.findCompany(name);
      return ok({ _source: mode, _provenance: { system: "Boom", record: "company-search" }, query: name, matches });
    }
  );

  server.registerTool(
    "boom_get_spread",
    {
      title: "Get a Boom spread",
      description:
        "[BOOM-MANAGED — generic Boom API wrapper; would ship in Boom's own managed connector] Fetch the parsed spread for a completed file: financialStatements[] (income_statement, balance_sheet, cash_flow_statement) with lineItems keyed by accountCode and periodValues.",
      inputSchema: { fileId: z.string().describe("Boom file id, e.g. from boom_list_files.") },
    },
    async ({ fileId }) => {
      const file = await client.getSpread(fileId);
      return ok({ _source: mode, _provenance: { system: "Boom", record: file.id }, file });
    }
  );

  server.registerTool(
    "boom_get_ratios",
    {
      title: "Get key credit ratios (computed)",
      description:
        "[CUSTOMER-SPECIFIC — the bank's ratio methodology (bank policy); ships in the customer connector the SI/Accenture builds, NOT Boom's generic platform. Boom owns the raw spread; the ratio DEFINITIONS are per-bank.] Compute the borrower's standard credit ratios from the Boom spread — leverage, interest coverage, gross/EBITDA margins, revenue growth, EBITDA, total debt. Returns RAW numeric values (the contract a rating engine / IRIS or the memo consumes) PLUS display strings. Pass fileId or companyName. Boom owns the raw spread; these ratios are deterministic over it and computed on read (not stored). Covenant pass/fail is NOT graded here — thresholds are nCino-owned, so grading is a downstream join in the risk view.",
      inputSchema: {
        companyName: z.string().optional().describe("Borrower name (e.g. 'Piedmont'). Provide this OR fileId."),
        fileId: z.string().optional().describe("Boom file id. Provide this OR companyName."),
      },
    },
    async (args) => {
      const { file, company } = await resolveFile(client, args);
      const { raw, ratios } = deriveRatios(file);
      return ok({
        _source: mode,
        _provenance: { system: "Boom", record: file.id },
        company,
        asOf: file.financialStatements?.[0]?.endDate || "",
        raw,
        ratios,
      });
    }
  );

}
