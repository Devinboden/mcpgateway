#!/usr/bin/env bash
# Create (or print) the AgentCore MCP Gateway with Cognito CUSTOM_JWT inbound auth.
# Semantic search is intentionally DISABLED (see planning/architecture.md ADR-002).
#
# NOTE: create-gateway generates a new gateway id each run. To reconfigure the existing
# gateway in place (e.g. toggle search), use update-gateway with the same identifier —
# see the commented block at the bottom.
set -euo pipefail
cd "$(dirname "$0")"

REGION="${REGION:-us-east-1}"
ROLE_ARN="${ROLE_ARN:-arn:aws:iam::111204669101:role/mcpgateway-gw-role}"
NAME="${NAME:-mcpgateway}"

aws bedrock-agentcore-control create-gateway \
  --name "$NAME" \
  --description "MCP Gateway fronting AFS (custom) + Snowflake (managed) MCP servers" \
  --role-arn "$ROLE_ARN" \
  --protocol-type MCP \
  --protocol-configuration file://protocol-config.json \
  --authorizer-type CUSTOM_JWT \
  --authorizer-configuration file://authorizer-config.json \
  --region "$REGION" \
  --output json

# --- Reconfigure the existing gateway in place (preserves id + URL) ---
# GATEWAY_ID=mcpgateway-eerhmo8ymw
# aws bedrock-agentcore-control update-gateway \
#   --gateway-identifier "$GATEWAY_ID" --name "$NAME" \
#   --role-arn "$ROLE_ARN" --protocol-type MCP \
#   --protocol-configuration file://protocol-config.json \
#   --authorizer-type CUSTOM_JWT --authorizer-configuration file://authorizer-config.json \
#   --region "$REGION"
