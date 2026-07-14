// AFS MCP server — Bedrock AgentCore Runtime entrypoint.
// AgentCore hosts an MCP server as a container on 0.0.0.0:8000 serving streamable
// HTTP at /mcp (stateless). This reuses the SAME tool/resource/widget registrations
// as the Next.js route (lib/{index,afsResources,widgets}) via the raw MCP SDK.
import http from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerTools } from "./tools/index.js";
import { registerAfsResources } from "./lib/afsResources.js";
import { registerWidgets } from "./lib/widgets.js";

const PORT = Number(process.env.PORT || 8000);
const MCP_PATH = "/mcp";

function buildServer() {
  const server = new McpServer({ name: "afs-mcp-v2", version: "0.1.0" });
  registerTools(server);        // data + reference + write tools
  registerAfsResources(server); // read-only reference catalogs
  registerWidgets(server);      // Truist-branded MCP-App widgets
  return server;
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : undefined); } catch { resolve(undefined); } });
    req.on("error", () => resolve(undefined));
  });
}

const httpServer = http.createServer(async (req, res) => {
  const path = (req.url || "").split("?")[0];

  // AgentCore / container health checks.
  if (req.method === "GET" && (path === "/ping" || path === "/health" || path === "/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", server: "afs-mcp-v2" }));
    return;
  }
  if (path !== MCP_PATH) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found", hint: `MCP endpoint is ${MCP_PATH}` }));
    return;
  }

  // Stateless streamable HTTP: fresh server + transport per request.
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => { try { transport.close(); server.close(); } catch {} });
  try {
    await server.connect(transport);
    const body = req.method === "POST" ? await readJsonBody(req) : undefined;
    await transport.handleRequest(req, res, body);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: String(err?.message || err) }, id: null }));
    }
  }
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`AFS MCP (AgentCore) listening on 0.0.0.0:${PORT}${MCP_PATH}`);
});
