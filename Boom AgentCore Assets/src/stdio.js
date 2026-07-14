#!/usr/bin/env node
// Boom MCP — stdio transport (local use / npx / desktop connector).
// Reads the fixture from disk and injects it into the shared BoomClient, then registers
// the shared tool surface. Live mode: BOOM_USE_FIXTURE=false + BOOM_API_KEY.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BoomClient } from "./boomClient.js";
import { registerBoomTools } from "./tools.js";

const fixturePath = process.env.BOOM_FIXTURE_PATH
  ?? join(dirname(fileURLToPath(import.meta.url)), "..", "data", "atlas_spread.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

const client = BoomClient.fromEnv(process.env, fixture);
const server = new McpServer({ name: "boom-mcp", version: "0.1.0" });
registerBoomTools(server, client);

await server.connect(new StdioServerTransport());
console.error(`boom-mcp (${client.mode}) running on stdio`);
