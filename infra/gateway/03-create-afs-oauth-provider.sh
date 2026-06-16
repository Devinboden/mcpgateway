#!/usr/bin/env bash
# Create the AFS outbound OAuth2 credential provider (Cognito client-credentials / M2M).
# This is the "service identity" the gateway uses to call AFS (architecture.md ADR-001).
#
# The Cognito app-client SECRET is fetched at runtime and written only to a temp file
# OUTSIDE the repo, then removed. It is never committed.
set -euo pipefail
cd "$(dirname "$0")"

REGION="${REGION:-us-east-1}"
POOL_ID="${POOL_ID:-us-east-1_Z1otWFj2I}"
CLIENT_ID="${CLIENT_ID:-7ktuvp7o0u0k21sn2rc0837g29}"
PROVIDER_NAME="${PROVIDER_NAME:-afs-cognito-m2m}"
DISCOVERY_URL="https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/openid-configuration"

SECRET="$(aws cognito-idp describe-user-pool-client \
  --user-pool-id "$POOL_ID" --client-id "$CLIENT_ID" --region "$REGION" \
  --query 'UserPoolClient.ClientSecret' --output text)"
[ -n "$SECRET" ] || { echo "no client secret"; exit 1; }

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
cat > "$TMP" <<JSON
{
  "name": "${PROVIDER_NAME}",
  "credentialProviderVendor": "CustomOauth2",
  "oauth2ProviderConfigInput": {
    "customOauth2ProviderConfig": {
      "oauthDiscovery": { "discoveryUrl": "${DISCOVERY_URL}" },
      "clientId": "${CLIENT_ID}",
      "clientSecret": "${SECRET}",
      "clientAuthenticationMethod": "CLIENT_SECRET_BASIC"
    }
  }
}
JSON

aws bedrock-agentcore-control create-oauth2-credential-provider \
  --cli-input-json "file://$TMP" --region "$REGION" \
  --query '{arn:credentialProviderArn,name:name}' --output json
