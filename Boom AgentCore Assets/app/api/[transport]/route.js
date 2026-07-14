// Boom MCP — streamable HTTP transport (remote connector for Cowork / Claude).
// Exposes the shared data tools PLUS MCP App widgets (OUR Accenture-accelerator UI rendered over Boom data):
//   boom_show_ratios → unified Financials widget, opened inline (key-ratio cards)    (ui://boom/financials.html)
//   boom_show_spread → unified Financials widget, opened fullscreen (tabbed spread)  (ui://boom/financials.html)
// External iframes are blocked by Claude inside widgets; the /boom route redirects into Boom in a real browser instead.

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { BoomClient } from "../../../src/boomClient.js";
import { registerBoomTools } from "../../../src/tools.js";
import { shapeStatements, deriveRatios } from "../../../src/ratios.js";
import { resolveFile } from "../../../src/resolve.js";
import fixture from "../../../data/atlas_spread.json";
import { WIDGETS } from "../../_widgets.js";

const client = BoomClient.fromEnv(process.env, fixture);
const APP_MIME = "text/html;profile=mcp-app";
const html = (name) => Buffer.from(WIDGETS[name], "base64").toString("utf8");
// STABLE resource URI (no content hash). Fingerprinting was REVERTED 2026-05-31: Cowork caches the
// widget at the CONNECTOR level (not by URI), so versioning never busted the cache — and worse, each
// new hash orphaned the previous URI, so a host holding a cached old URI got a 404 ("unable to reach
// Boom Financials Intelligence"). A stable URI is ALWAYS served: worst case the host shows a slightly
// stale widget after a deploy (refresh by reconnecting the connector), never a broken one.
// REV bump forces hosts to fetch a FRESH widget after a redesign: tools point at the revisioned
// URI (which the host has never cached → fetches current HTML), while the legacy unversioned URI
// stays REGISTERED and served below, so any host holding the old cached URI never 404s.
const WIDGET_REV = "r2";
const widgetUri = (name) => `ui://boom/${name}.${WIDGET_REV}.html`;
const legacyUri = (name) => `ui://boom/${name}.html`;

// Spread shaping + ratio derivation live in src/ratios.js (shared with the boom_get_ratios data
// tool); file/company resolution lives in src/resolve.js — compute ratios ONCE, read everywhere.

// ---- unified Financials widget payload (ratios + shaped statements + live-panel link) ----
const panelBase = () => (process.env.BOOM_PANEL_BASE_URL || "https://boom-mcp.vercel.app").replace(/\/+$/, "");
function financialsPayload(client, file, company, initialMode) {
  const { ratios } = deriveRatios(file);
  return {
    company,
    fileId: file.id,
    asOf: file.financialStatements?.[0]?.endDate || "",
    source: client.mode,
    ratios,
    statements: shapeStatements(file),
    panelUrl: `${panelBase()}/boom?fileId=${encodeURIComponent(file.id)}`,
    initialMode,
  };
}

// Model-facing summary for the show_* tools. The WIDGET reads the full payload from
// structuredContent (and content fallback); the MODEL only needs the headline ratios to
// write its interpretive read — so we DROP the bulky statements JSON from its context.
// Keeps the ratios (label=value) so the agent can comment without restating a number list.
function modelSummary(shaped) {
  const r = (shaped.ratios || []).map((x) => `${x.label} ${x.value}${x.sub ? ` (${x.sub})` : ""}`).join(" · ");
  // This text is the model's ENTIRE view of the result (the widget data rides separately in
  // structuredContent). Front-load a hard, imperative directive so even a generic chat session does
  // not "helpfully" redraw the spread with the visualize/artifact tool — the #1 reported bug.
  return `✅ The Boom Financials widget for ${shaped.company} is now rendered in this chat. It ALREADY shows the KPI tiles, the revenue/EBITDA trend chart, AND the full tabbed balance sheet / income statement / cash flow. `
    + `THIS WIDGET IS THE ENTIRE DELIVERABLE — your job is essentially done. `
    + `STOP HERE: do NOT call boom_show_spread or boom_show_ratios again for this borrower. The widget is ALREADY on screen — calling either tool a second time renders a DUPLICATE stacked spread (the exact "so many spreads" bug being reported). One call = one widget; you have already made it. `
    + `Do NOT also call deal_show_summary — that renders a SEPARATE deal-at-a-glance widget and stacks a duplicate UI under this spread. This spread is the COMPLETE answer to a "spreads / pull up the spread" request; the deal summary is a separate command the user must ask for explicitly. `
    + `ABSOLUTE RULE: produce NOTHING that re-displays this data. Do NOT call mcp__visualize__show_widget or any visualize/artifact/HTML/canvas tool; do NOT create an artifact; do NOT draw another KPI grid, card set, table, or chart; do NOT restate the figures as a list. Re-rendering this data creates a duplicate stacked UI, which is a known bug and is wrong. `
    + `Your reply must be AT MOST one short sentence of interpretation, or nothing at all. `
    + `(Headline ratios, for that one optional sentence only: ${r}.)`;
}

const handler = createMcpHandler(
  (server) => {
    registerBoomTools(server, client);

    // ---- boom_show_spread → unified Financials widget, opened expanded ----
    server.registerTool("boom_show_spread", {
      title: "Show the Boom spread (interactive panel)",
      description: "[CUSTOMER-SPECIFIC — Accenture-accelerator experience/UI; ships in the SI-built customer connector, not Boom's generic platform] Render the borrower's financials as an interactive Accenture-accelerator widget. THIS is the tool for 'pull up / show / view / open / look at the spread' — it renders the widget INLINE in the chat (NEVER a link). It opens INLINE as key-ratio cards; the user clicks 'Full spread' to expand to the tabbed balance sheet / income statement / cash flow in place. Pass companyName or fileId. Use when the user wants to SEE/open/pull up the spread. Do NOT use 'Open the live Boom spread' (the link tool) for this — that is only for opening the real Boom web app. PRESENTATION (important): the widget ALREADY displays every figure as cards — do NOT restate the ratios/values as a bulleted list in your reply (that is redundant). After it renders, write AT MOST a 2–3 sentence interpretive read (the trend, the driver, the one thing a banker should notice), or simply offer the next step. No bullet list of numbers.",
      inputSchema: { companyName: z.string().optional(), fileId: z.string().optional() },
      _meta: { ui: { resourceUri: widgetUri("financials") } },
    }, async (args) => {
      const { file, company } = await resolveFile(client, args);
      const shaped = financialsPayload(client, file, company, "inline");
      // structuredContent = full payload for the WIDGET; content = terse summary for the MODEL
      // (keeps the big statements JSON out of the model context — see modelSummary).
      return { content: [{ type: "text", text: modelSummary(shaped) }], structuredContent: shaped, _meta: { ui: { resourceUri: widgetUri("financials") } } };
    });

    // ---- resources (one per widget) ----
    // Register the CURRENT (revisioned) URI that the tools point at, PLUS the legacy unversioned
    // URI — both serve the same fresh html(name). The revisioned URI forces hosts to fetch anew
    // after a redesign; the legacy URI stays alive so a host holding the old cached URI never 404s.
    for (const name of ["financials", "portfolio"]) {
      for (const uri of [widgetUri(name), legacyUri(name)]) {
        server.registerResource(`Boom ${name} widget`, uri,
          { title: `Boom ${name}`, mimeType: APP_MIME },
          async () => ({ contents: [{ uri, mimeType: APP_MIME, text: html(name) }] }));
      }
    }
  },
  {
    // serverInfo is passed whole into the MCP `initialize` response. SDK 1.26's Implementation
    // schema supports `icons` + `websiteUrl`, so this is the lever for the connector-list icon
    // (was the library default "mcp-typescript server on vercel" with no icon → generic globe).
    serverInfo: {
      name: "Boom Financials Intelligence",
      version: "0.1.0",
      websiteUrl: "https://boom.build",
      icons: [
        // Our own hosted Boom mark (app/icon.svg) — HTTPS, stable, on our domain.
        { src: `${panelBase()}/icon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
      ],
    },
  },
  { basePath: "/api", maxDuration: 60, verboseLogs: true }
);

export { handler as GET, handler as POST };
