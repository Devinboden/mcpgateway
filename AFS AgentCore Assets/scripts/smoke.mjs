import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = new URL(process.env.MCP_URL || "http://localhost:3100/api/mcp");
const client = new Client({ name: "smoke", version: "0.0.1" });
await client.connect(new StreamableHTTPClientTransport(url));

const { tools } = await client.listTools();
console.log("TOOLS:", tools.map((t) => t.name).join(", "));

async function call(name, args) {
  const res = await client.callTool({ name, arguments: args });
  const sc = res.structuredContent;
  console.log(`\n# ${name}${res.isError ? " [ERROR]" : ""}`);
  console.log(res.content?.[0]?.text?.split("\n")[0]);
  if (sc) console.log(JSON.stringify(sc).slice(0, 600));
  return res;
}

await call("jobs_by_officer", {});
await call("portfolio_by_officer", { maxObligors: 5 });
await call("loan_summary", {});
await call("revolver_utilization", {});
await call("payment_history", {});
// Mutating — only when RESERVE=1, since it consumes a real obligation number.
if (process.env.RESERVE === "1") await call("reserve_obligation_number", { bankId: "5", obligorNumber: "13" });

await client.close();
console.log("\nOK");
