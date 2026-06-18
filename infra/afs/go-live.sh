#!/usr/bin/env bash
# Flip the AFS MCP runtime from fixture mode to LIVE AFS Vision.
#
# Reads creds from Secrets Manager (mcpgateway/afs-vision: {AFS_USERNAME, AFS_PASSWORD}) and
# injects them + AFS_FIXTURE_MODE=false as runtime env vars (which override the image ENV).
# The password is written only to a temp cli-input-json OUTSIDE the repo and removed; it is
# never echoed or committed. NOTE: runtime env vars are stored plaintext in the runtime config.
#
# Revert to fixture: re-run with MODE=fixture (sets AFS_FIXTURE_MODE=true; creds blanked).
set -euo pipefail
export MSYS_NO_PATHCONV=1
REGION="${REGION:-us-east-1}"
RID="${RID:-afs_mcp-F82Tf5DI8Q}"
MODE="${MODE:-live}"
SECRET_ID="${SECRET_ID:-mcpgateway/afs-vision}"

# current immutable config to replay
CFG=$(aws bedrock-agentcore-control get-agent-runtime --agent-runtime-id "$RID" --region "$REGION" --output json)
URI=$(echo "$CFG"  | python -c "import sys,json;print(json.load(sys.stdin)['agentRuntimeArtifact']['containerConfiguration']['containerUri'])")
ROLE=$(echo "$CFG" | python -c "import sys,json;print(json.load(sys.stdin)['roleArn'])")

TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
if [ "$MODE" = "fixture" ]; then
  ENV_JSON='{"AFS_FIXTURE_MODE":"true"}'
else
  ENV_JSON=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ID" --region "$REGION" --query SecretString --output text \
    | python -c "import sys,json;c=json.load(sys.stdin);print(json.dumps({'AFS_FIXTURE_MODE':'false','AFS_USERNAME':c['AFS_USERNAME'],'AFS_PASSWORD':c['AFS_PASSWORD']}))")
fi

# Inbound auth MUST be replayed or update-agent-runtime drops it (reverting to IAM and
# breaking the gateway's bearer-token calls). Restore the B6 Cognito JWT authorizer.
POOL_ID="${POOL_ID:-us-east-1_Z1otWFj2I}"
RUNTIME_CLIENT="${RUNTIME_CLIENT:-7ktuvp7o0u0k21sn2rc0837g29}"
DISCOVERY="https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/openid-configuration"

python - "$RID" "$URI" "$ROLE" "$ENV_JSON" "$DISCOVERY" "$RUNTIME_CLIENT" > "$TMP" <<'PY'
import sys,json
rid,uri,role,env,disc,client=sys.argv[1:7]
json.dump({
  "agentRuntimeId": rid,
  "agentRuntimeArtifact": {"containerConfiguration": {"containerUri": uri}},
  "roleArn": role,
  "networkConfiguration": {"networkMode": "PUBLIC"},
  "protocolConfiguration": {"serverProtocol": "MCP"},
  "authorizerConfiguration": {"customJWTAuthorizer": {"discoveryUrl": disc, "allowedClients": [client]}},
  "environmentVariables": json.loads(env),
}, open(sys.stdout.fileno(),"w"))
PY

aws bedrock-agentcore-control update-agent-runtime --cli-input-json "file://$(cygpath -m "$TMP")" --region "$REGION" \
  --query '{status:status,version:agentRuntimeVersion}' --output json
echo "mode=$MODE applied (env keys: $(echo "$ENV_JSON" | python -c "import sys,json;print(list(json.load(sys.stdin).keys()))"))"
