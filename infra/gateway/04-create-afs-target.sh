#!/usr/bin/env bash
# Create the AFS gateway target (mcpServer + OAuth client-credentials service identity).
# In DEFAULT listing mode the gateway synchronously calls AFS tools/list using the M2M
# token; the call succeeds only once 03-create-afs-oauth-provider.sh has run.
set -euo pipefail
cd "$(dirname "$0")"

REGION="${REGION:-us-east-1}"
GATEWAY_ID="${GATEWAY_ID:-mcpgateway-eerhmo8ymw}"

aws bedrock-agentcore-control create-gateway-target \
  --gateway-identifier "$GATEWAY_ID" \
  --name afs \
  --description "AFS custom MCP (AgentCore Runtime). Outbound: Cognito client-credentials service identity. Per-user audit at gateway." \
  --target-configuration file://target-afs-config.json \
  --credential-provider-configurations file://target-afs-creds.json \
  --region "$REGION" \
  --query '{id:targetId,status:status}' --output json
