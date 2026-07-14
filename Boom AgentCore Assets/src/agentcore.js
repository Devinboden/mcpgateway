#!/usr/bin/env node
// Boom MCP — Amazon Bedrock AgentCore Runtime entrypoint.
// Contract (docs.aws.amazon.com/bedrock-agentcore .../runtime-mcp-protocol-contract.html):
//   • Transport: streamable-HTTP, STATELESS mode
//   • Host/Port: 0.0.0.0:8000   • Path: POST /mcp   • Platform: ARM64 container
//   • Platform injects an Mcp-Session-Id header; a stateless server must ACCEPT (not reject) it.
// Shares the exact same tool core as stdio.js / the Vercel HTTP route (registerBoomTools) — this
// file only swaps the TRANSPORT, so the AgentCore-hosted server behaves identically to today's Vercel one.

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { BoomClient } from "./boomClient.js";
import { registerBoomTools } from "./tools.js";

const PORT = Number(process.env.PORT || 8000);
const fixturePath = process.env.BOOM_FIXTURE_PATH
  ?? join(dirname(fileURLToPath(import.meta.url)), "..", "data", "atlas_spread.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

// Stateless mode → build a fresh server + transport per request (the SDK's recommended pattern to
// avoid request-id collisions across concurrent stateless calls). BoomClient.fromEnv honors
// BOOM_USE_FIXTURE / BOOM_API_KEY exactly as the other transports do.
function buildServer() {
  const client = BoomClient.fromEnv(process.env, fixture);
  const server = new McpServer({ name: "boom-mcp", version: "0.1.0" });
  registerBoomTools(server, client);
  return server;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const httpServer = createServer(async (req, res) => {
  try {
    // Lightweight health check for container/runtime probes.
    if (req.method === "GET" && (req.url === "/ping" || req.url === "/")) {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }
    if (req.url !== "/mcp" || req.method !== "POST") {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "not found" }));
      return;
    }
    const body = await readBody(req);
    const server = buildServer();
    // sessionIdGenerator: undefined → STATELESS. Accepts the platform-injected Mcp-Session-Id
    // without trying to own session state. enableJsonResponse lets us answer non-streaming calls
    // with application/json (the contract allows json OR text/event-stream).
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => { transport.close().catch(() => {}); server.close().catch(() => {}); });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (err) {
    console.error("boom-mcp agentcore request error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null }));
    }
  }
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.error(`boom-mcp (agentcore, streamable-http) listening on 0.0.0.0:${PORT}/mcp`);
});
