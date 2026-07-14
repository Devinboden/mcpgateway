# Boom MCP — Amazon Bedrock AgentCore Runtime image.
# MUST be ARM64 per the AgentCore container contract. Serves streamable-HTTP MCP on 0.0.0.0:8000/mcp.
FROM public.ecr.aws/docker/library/node:22-slim

WORKDIR /app

# Install deps against the committed lockfile (reproducible). --omit=dev skips build/test tooling.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Only what the AgentCore entrypoint needs: the shared tool core + the fixture data.
COPY src ./src
COPY data ./data

ENV NODE_ENV=production \
    PORT=8000 \
    BOOM_USE_FIXTURE=true

EXPOSE 8000
CMD ["node", "src/agentcore.js"]
