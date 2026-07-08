#!/usr/bin/env bash
# Create the PUBLIC Cognito app client for interactive (authorization-code + PKCE) login,
# used by Claude Desktop / Claude.ai custom connectors and mcp-remote. This is separate from
# the confidential client_credentials client (7ktuvp7o...) used for M2M / outbound to AFS.
#
# Cognito has no Dynamic Client Registration; Claude supports specifying a custom client_id
# (public, PKCE) when DCR is absent. Prints the new client id.
set -euo pipefail
export MSYS_NO_PATHCONV=1
REGION="${REGION:-us-east-1}"
POOL_ID="${POOL_ID:-us-east-1_Z1otWFj2I}"

aws cognito-idp create-user-pool-client \
  --user-pool-id "$POOL_ID" \
  --client-name mcpgateway-desktop \
  --no-generate-secret \
  --allowed-o-auth-flows-user-pool-client \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid profile email \
      "https://mcpgateway/api/afs:read" "https://mcpgateway/api/snowflake:read" \
  --callback-urls \
      "https://claude.ai/api/mcp/auth_callback" \
      "https://claude.com/api/mcp/auth_callback" \
      "http://localhost:8090/oauth/callback" \
  --supported-identity-providers COGNITO \
  --explicit-auth-flows ALLOW_REFRESH_TOKEN_AUTH \
  --region "$REGION" \
  --query 'UserPoolClient.ClientId' --output text
