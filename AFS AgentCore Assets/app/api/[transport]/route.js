import { createMcpHandler } from "mcp-handler";
import { registerTools } from "../../../tools/index.js";
import { registerAfsResources } from "../../../lib/afsResources.js";
import { registerWidgets } from "../../../lib/widgets.js";

// MCP endpoint (streamable HTTP at /api/mcp) for the Vercel/Next.js deployment.
// Registers the AFS data tools, reference-catalog resources, and widgets via the
// shared registrars in tools/index.js + lib/{afsResources,widgets}.
export const maxDuration = 60;

const panelBase = () =>
  (process.env.AFS_PANEL_BASE_URL || "https://afs-mcp-v2.vercel.app").replace(/\/+$/, "");

const handler = createMcpHandler(
  (server) => {
    registerTools(server);        // data + reference + write tools
    registerAfsResources(server); // read-only reference catalogs
    registerWidgets(server);      // Truist-branded MCP-App widgets
  },
  {
    serverInfo: {
      name: "afs-mcp-v2",
      version: "0.1.0",
      websiteUrl: "https://afsvision.com",
      icons: [{ src: `${panelBase()}/icon.png`, mimeType: "image/png", sizes: ["225x225"] }],
    },
  },
  {
    basePath: "/api",
    redisUrl: process.env.REDIS_URL,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
