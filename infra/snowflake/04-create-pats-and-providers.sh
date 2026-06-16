#!/usr/bin/env bash
# Mint one role-restricted PAT per role on SVC_GATEWAY and register each as an AgentCore
# API-key credential provider. The PAT secret is captured in-memory and pushed straight into
# the token vault; it is NEVER echoed or written to the repo. Idempotent (removes/recreates).
#
# Prereqs: 03-service-user.sql applied; snow CLI conn 'mcpgateway'; aws creds.
set -euo pipefail
REGION="${REGION:-us-east-1}"

declare -A ROLE_FOR=( [rm]=ROLE_RM [analyst]=ROLE_ANALYST )
for key in rm analyst; do
  role="${ROLE_FOR[$key]}"
  pat_name="PAT_${key^^}"
  provider="snowflake-pat-${key}"

  # (re)mint the PAT, role-restricted
  snow sql -c mcpgateway --query "alter user SVC_GATEWAY remove programmatic access token ${pat_name};" >/dev/null 2>&1 || true
  SECRET="$(snow sql -c mcpgateway --format json --query \
    "alter user SVC_GATEWAY add programmatic access token ${pat_name} role_restriction='${role}' days_to_expiry=90 comment='AgentCore gateway PAT for ${role}';" \
    2>/dev/null | python -c "
import sys,json
rows=json.load(sys.stdin)
row={k.lower():v for k,v in rows[0].items()}
print(row.get('token_secret',''))
")"
  if [ -z "$SECRET" ]; then echo "FAILED to mint PAT for $role"; exit 1; fi

  # (re)create the AgentCore API-key credential provider with the PAT
  aws bedrock-agentcore-control delete-api-key-credential-provider --name "$provider" --region "$REGION" >/dev/null 2>&1 || true
  ARN="$(aws bedrock-agentcore-control create-api-key-credential-provider \
        --name "$provider" --api-key "$SECRET" --region "$REGION" \
        --query 'credentialProviderArn' --output text)"
  unset SECRET
  echo "${role}: provider ${provider} -> ${ARN}"
done
