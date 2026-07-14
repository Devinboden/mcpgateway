import { z } from "zod";
import { assembleOfficerLoans, assembleSummary } from "./widgetData.js";
import { WIDGETS } from "../app/_widgets.js";

// Truist-branded MCP-App widget tools + their ui:// resources. Shared by the Next.js
// route (createMcpHandler) and the AgentCore container entrypoint (server.js) so both
// expose an identical tool surface.

const APP_MIME = "text/html;profile=mcp-app";
const widgetUri = (name) => `ui://afs/${name}.html`;
const widgetHtml = (name) => Buffer.from(WIDGETS[name], "base64").toString("utf8");

export function registerWidgets(server) {
  server.registerTool(
    "afs_show_officer_loans",
    {
      title: "Show an officer's loan book (interactive widget)",
      description:
        "Render the workpackages/loans attached to a loan officer as a Truist-branded widget (borrower, facility, type, amount, status). Use when the user wants to SEE an officer's book. Pass the officer code. PRESENTATION: the widget shows the rows — summarize briefly, don't restate the table.",
      inputSchema: { officerId: z.string().optional().describe("Loan officer code. Defaults to the configured sample officer.") },
      _meta: { ui: { resourceUri: widgetUri("officer") } },
    },
    async ({ officerId }) => {
      const payload = await assembleOfficerLoans(officerId);
      return {
        content: [{ type: "text", text: `Officer loan-book widget rendered for ${payload.officerId} (${payload.source}): ${payload.count} item(s). Don't restate the table.` }],
        structuredContent: payload,
        _meta: { ui: { resourceUri: widgetUri("officer") } },
      };
    }
  );

  server.registerTool(
    "afs_show_summary",
    {
      title: "Show the credit-memo summary (interactive widget)",
      description:
        "Render a loan's servicing summary as a Truist-branded widget: opens as a SNAPSHOT (commitment, outstanding, coverage, risk, past-due, utilization) and expands to a FULL PAGE (facilities, collateral, guaranties, analytics). Use when the user wants to SEE/pull up a loan. Pass bank/obligor/obligation (defaults to the sample loan). PRESENTATION: the widget shows the figures — add at most a brief credit read.",
      inputSchema: {
        bank: z.string().optional().describe("Bank ID. Defaults to sample."),
        obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
        obligation: z.string().optional().describe("Obligation number. Defaults to sample."),
      },
      _meta: { ui: { resourceUri: widgetUri("summary") } },
    },
    async ({ bank, obligor, obligation }) => {
      const payload = await assembleSummary({ bank, obligor, obligation });
      return {
        content: [{ type: "text", text: `Credit-memo summary widget rendered for ${payload.borrower}, obligation ${payload.wpId} (${payload.source}). Don't restate the figures; add at most a brief credit read.` }],
        structuredContent: payload,
        _meta: { ui: { resourceUri: widgetUri("summary") } },
      };
    }
  );

  for (const name of ["summary", "officer"]) {
    server.registerResource(
      `AFS ${name} widget`,
      widgetUri(name),
      { title: `AFS ${name}`, mimeType: APP_MIME },
      async () => ({ contents: [{ uri: widgetUri(name), mimeType: APP_MIME, text: widgetHtml(name) }] })
    );
  }
}
