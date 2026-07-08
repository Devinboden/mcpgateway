#!/usr/bin/env bash
# Create the AgentCore Gateway execution role and attach its inline permissions.
# Idempotent: re-running updates the inline policy and is a no-op on the role if it exists.
#
# Prereqs: aws CLI v2, credentials for account 111204669101, run from this directory.
set -euo pipefail
cd "$(dirname "$0")"

ROLE_NAME="${ROLE_NAME:-mcpgateway-gw-role}"

if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  echo "role $ROLE_NAME exists; updating assume-role policy"
  aws iam update-assume-role-policy --role-name "$ROLE_NAME" \
    --policy-document file://trust-policy.json
else
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://trust-policy.json \
    --description "Execution role for AgentCore MCP Gateway (mcpgateway)" \
    --query 'Role.Arn' --output text
fi

aws iam put-role-policy --role-name "$ROLE_NAME" \
  --policy-name mcpgateway-gw-permissions \
  --policy-document file://role-permissions.json

echo "role ready: $(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)"
