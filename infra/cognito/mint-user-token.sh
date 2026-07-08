#!/usr/bin/env bash
# Mint a Cognito USER access token (USER_PASSWORD_AUTH) for testing gateway authorization.
# The token carries cognito:groups (e.g. ROLE_RM / ROLE_ANALYST). Uses the confidential M2M
# client (so it computes SECRET_HASH); client_id is in the gateway allowedClients.
#
# Usage: mint-user-token.sh <username> <password>   -> prints the access token (JWT)
set -euo pipefail
export MSYS_NO_PATHCONV=1
REGION="${REGION:-us-east-1}"; POOL="${POOL:-us-east-1_Z1otWFj2I}"; CLIENT="${CLIENT:-7ktuvp7o0u0k21sn2rc0837g29}"
U="$1"; P="$2"
SECRET=$(aws cognito-idp describe-user-pool-client --user-pool-id "$POOL" --client-id "$CLIENT" --region "$REGION" --query 'UserPoolClient.ClientSecret' --output text)
SH=$(python -c "import hmac,hashlib,base64,sys;print(base64.b64encode(hmac.new(sys.argv[1].encode(),(sys.argv[2]+sys.argv[3]).encode(),hashlib.sha256).digest()).decode())" "$SECRET" "$U" "$CLIENT")
aws cognito-idp initiate-auth --client-id "$CLIENT" --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME="$U",PASSWORD="$P",SECRET_HASH="$SH" --region "$REGION" \
  --query 'AuthenticationResult.AccessToken' --output text
