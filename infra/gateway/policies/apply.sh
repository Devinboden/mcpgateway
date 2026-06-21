#!/usr/bin/env bash
# Create the 3 Cedar policies in the policy engine from the .cedar files (no JSON escaping pain).
set -euo pipefail
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")"
ENGINE="${ENGINE:-mcpgateway_authz-hfy2_5p_23}"
REGION="${REGION:-us-east-1}"

for pair in "permit_rm:permit-rm.cedar" "permit_analyst:permit-analyst.cedar" "forbid_analyst_afs:forbid-analyst-afs.cedar"; do
  name="${pair%%:*}"; f="${pair##*:}"
  TMP="$(mktemp)"
  python -c "import json,sys;print(json.dumps({'name':sys.argv[1],'policyEngineId':sys.argv[2],'definition':{'cedar':{'statement':open(sys.argv[3]).read()}}}))" "$name" "$ENGINE" "$f" > "$TMP"
  echo "creating policy $name ($f)..."
  aws bedrock-agentcore-control create-policy --cli-input-json "file://$(cygpath -m "$TMP")" --region "$REGION" \
    --query '{name:name,id:policyId,status:status}' --output json 2>&1
  rm -f "$TMP"
done
