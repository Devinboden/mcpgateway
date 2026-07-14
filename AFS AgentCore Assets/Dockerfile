# Bedrock AgentCore Runtime — AFS MCP server.
# AgentCore hosts an MCP server as a linux/arm64 container serving streamable HTTP on
# 0.0.0.0:8000 at /mcp (see server.js). Same 24 tools as the Vercel /api/mcp deploy.
FROM --platform=linux/arm64 node:22-slim

WORKDIR /app

# Install prod deps (reproducible). server.js only needs @modelcontextprotocol/sdk +
# zod, but the full dependency set is installed for simplicity.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# App code: server.js, tools/, lib/, app/_widgets.js, api-discovery/captured/*.json.
COPY . .

ENV NODE_ENV=production PORT=8000
EXPOSE 8000

# AFS creds + config come from AgentCore Runtime env / Secrets Manager at deploy time:
#   AFS_BASE_URL, AFS_USERNAME, AFS_PASSWORD, AFS_APP_CHANNEL
CMD ["node", "server.js"]
