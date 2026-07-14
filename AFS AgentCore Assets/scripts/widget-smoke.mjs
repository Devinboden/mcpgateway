import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = new URL(process.env.MCP_URL || "http://localhost:3100/api/mcp");
const client = new Client({ name: "widget-smoke", version: "0.0.1" });
await client.connect(new StreamableHTTPClientTransport(url));

const { tools } = await client.listTools();
console.log("TOOLS:", tools.map((t) => t.name).join(", "));
const { resources } = await client.listResources();
console.log("RESOURCES:", resources.map((r) => `${r.name} <${r.uri}>`).join(" | "));

for (const [name, args] of [["afs_show_officer_loans", {}], ["afs_show_summary", {}]]) {
  const res = await client.callTool({ name, arguments: args });
  console.log(`\n# ${name}${res.isError ? " [ERROR]" : ""}`);
  console.log(res.content?.[0]?.text);
  console.log("_meta.ui:", JSON.stringify(res._meta?.ui));
  console.log("structuredContent:", JSON.stringify(res.structuredContent).slice(0, 700));
}

// Confirm the widget resource actually serves HTML.
const r = await client.readResource({ uri: "ui://afs/summary.html" });
const html = r.contents?.[0]?.text || "";
console.log(`\nsummary.html: ${html.length} bytes, mime=${r.contents?.[0]?.mimeType}, has Truist mark=${html.includes('aria-label="Truist"')}, has brand token=${html.includes("--truist:#2D1A47")}`);

await client.close();
console.log("\nOK");
