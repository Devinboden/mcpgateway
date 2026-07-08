# infra/gateway — AgentCore Gateway as code

Reproducible definition of the AgentCore MCP Gateway and its targets. Built with the raw
`aws bedrock-agentcore-control` control-plane API (with `file://` JSON inputs) rather than
the starter toolkit, for explicit control, reproducibility, and to access OBO/credential
features the toolkit doesn't surface.

Full reasoning: [`../../planning/architecture.md`](../../planning/architecture.md).
Ordered build steps: [`../../planning/plan.md`](../../planning/plan.md).

## Files

| File | Purpose |
|---|---|
| `trust-policy.json` | Assume-role trust for the gateway role (`bedrock-agentcore.amazonaws.com`, scoped by source account + gateway ARN). |
| `role-permissions.json` | Inline permissions: InvokeAgentRuntime (AFS), workload-identity/token-vault reads, provider secret, logs. |
| `authorizer-config.json` | Inbound `CUSTOM_JWT` config → Cognito pool `us-east-1_Z1otWFj2I`, app client `7ktuvp7o…`. |
| `protocol-config.json` | MCP protocol config. **No `searchType`** — semantic search disabled (ADR-002). |
| `target-afs-config.json` | AFS target: `mcp.mcpServer` → AFS runtime invocation URL, `listingMode DEFAULT`. |
| `target-afs-creds.json` | AFS outbound: `OAUTH` → provider `afs-cognito-m2m`, scope `…/afs:read`. |
| `0X-*.sh` | Ordered scripts that apply the JSON via the AWS CLI. |

## Apply order

```bash
./01-create-role.sh                 # IAM role + permissions
./02-create-gateway.sh              # gateway (CUSTOM_JWT, no semantic search)
./03-create-afs-oauth-provider.sh   # AFS outbound M2M credential provider
./04-create-afs-target.sh           # AFS target (waits on the provider)
```

`02` prints a **new** gateway id when run from scratch. The currently-deployed gateway is
`mcpgateway-eerhmo8ymw`; to reconfigure it in place use the commented `update-gateway`
block in `02-create-gateway.sh`. Scripts read overrides from env vars (`REGION`,
`GATEWAY_ID`, `ROLE_ARN`, …) and default to the live values.

## Secrets

No secret is ever stored here. `03-…` fetches the Cognito app-client secret at runtime,
writes it only to a temp file outside the repo, and deletes it. Live secrets live in the
AgentCore token vault / AWS Secrets Manager.

## Snowflake targets

Snowflake (two role-specific targets via PAT) is defined under
[`../snowflake/`](../snowflake/).
