# infra/boom — Boom MCP behind the gateway

Boom (`Noland-LAL/boom-mcp`, a Next.js spreading-engine MCP) deployed to **AgentCore Runtime**
and fronted by the gateway as a custom target — same pattern as AFS. See
[architecture.md ADR-005](../../planning/architecture.md#55-adr-005--snowflake-moved-out-of-the-gateway-boom-moved-in).

## Live resources
- **Runtime:** `arn:aws:bedrock-agentcore:us-east-1:111204669101:runtime/boom_mcp-fQUgkK4pjp` (fixture mode)
- **Gateway target:** `VASU5DSO4U` (`boom`); outbound = `afs-cognito-m2m` (Cognito M2M service identity)
- **Tools:** `boom___boom_lookup_company`, `…_list_files`, `…_get_spread`, `…_get_line_items`, `…_get_ratios`, `…_find_company`, `…_benchmark_portfolio`, `…_explain_metric`, `…_create_validation_session`

## Files
| File | Purpose |
|---|---|
| `codebuild-ecr-policy.json` | Inline policy → CodeBuild role: ECR **push** on `bedrock-agentcore-*`. |
| `runtime-ecr-policy.json` | Inline policy → Runtime exec role: ECR **pull** on `bedrock-agentcore-*`. |

The gateway target config/creds live with the other targets in
[`../gateway/`](../gateway/) (`target-boom-config.json`, `target-boom-creds.json`).

## Deploy recipe (in the boom-mcp checkout)
```bash
cp Dockerfile.agentcore Dockerfile                       # toolkit builds ./Dockerfile
# edit Dockerfile FROM -> public.ecr.aws/docker/library/node:22-slim   (avoid Docker Hub 429)
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8               # toolkit prints emoji
agentcore configure -n boom_mcp -e src/agentcore.js -dt container -p MCP -r us-east-1 \
  -er  arn:aws:iam::111204669101:role/AmazonBedrockAgentCoreSDKRuntime-us-east-1-8b303da646 \
  -cber arn:aws:iam::111204669101:role/AmazonBedrockAgentCoreSDKCodeBuild-us-east-1-8b303da646 \
  -ac '{"customJWTAuthorizer":{"discoveryUrl":"https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Z1otWFj2I/.well-known/openid-configuration","allowedClients":["7ktuvp7o0u0k21sn2rc0837g29"]}}' -ni
# set source_path to the repo ROOT in .bedrock_agentcore.yaml (not src/), then:
agentcore deploy
```
Then create the gateway target from `../gateway/target-boom-*.json`. Fixture mode now; go live
later with `BOOM_USE_FIXTURE=false` + `BOOM_API_KEY` (a runtime env var, mirror `infra/afs/go-live.sh`).
