# infra/gateway/policies — Cedar A/B authorization (C13)

Per-employee tool authorization at the gateway, enforced by an AgentCore **policy engine**
(`mcpgateway_authz-…`) attached to the gateway in **ENFORCE** mode
(`infra/gateway/policy-engine-config.json`). Default-deny; **forbid overrides permit**.

| Policy | Effect |
|---|---|
| `permit-rm.cedar` | `cognito:groups` contains `ROLE_RM` → any tool (AFS + Boom) |
| `permit-analyst.cedar` | `cognito:groups` contains `ROLE_ANALYST` → any tool |
| `forbid-analyst-afs.cedar` | Analyst is **blocked from all 9 `afs___*` tools** (overrides the permit) |

**Cedar model (AgentCore Gateway):** principal `AgentCore::OAuthUser` (from the JWT `sub`),
JWT claims as **tags**, action `AgentCore::Action::"<target>___<tool>"`, resource
`AgentCore::Gateway::"<arn>"`.

**Verified (ENFORCE):** RM → AFS ✅ + Boom ✅; Analyst → AFS 🚫 (denied) + Boom ✅. Tested by
minting employee access tokens (`../../cognito/mint-user-token.sh`) which carry `cognito:groups`.

## Apply
```bash
ENGINE=mcpgateway_authz-… ./apply.sh        # creates the 3 policies from the .cedar files
# then attach the engine to the gateway (LOG_ONLY first to be safe):
#   update-gateway … --policy-engine-configuration file://../policy-engine-config.json
```

## Gotchas (all fixed here)
- **`cognito:groups` is a STRING tag, not a Set** — use `getTag(...) like "*ROLE_RM*"`, **not**
  `.contains(...)` (Cedar: "expected Set but saw String").
- **Guard with `hasTag`** before `getTag` or validation fails ("unable to guarantee safety").
- **No unconditional permits** — the engine rejects "overly permissive" policies; always gate with a
  `when` condition.
- **Gateway role IAM** needs `bedrock-agentcore:GetPolicyEngine` + `AuthorizeAction` /
  `PartiallyAuthorizeActions` / `BatchAuthorizeActions` on **both** the policy-engine and gateway ARNs
  (see `../role-permissions.json`).
