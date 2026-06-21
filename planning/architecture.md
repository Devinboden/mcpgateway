# Architecture & Decision Record

Authoritative description of the system as **built**, with the reasoning behind each
non-obvious choice. The ordered build steps live in [`plan.md`](plan.md); the
high-level pitch lives in [`../README.md`](../README.md). When this document and the
README disagree, **this document wins** (the README captures the original intent; this
captures what the platform actually allows).

Last updated: 2026-06-15 (Phase C in progress).

---

## 1. System overview

```
Claude (Cowork / Code)
        │  MCP over HTTPS, bearer = employee Cognito JWT
        ▼
┌─────────────────────────────────────────────────────────────┐
│ KG-MCP   (AWS App Runner — Claude's single connector)        │
│   • validates the Cognito JWT, advertises OAuth discovery    │
│   • resolve + virtual-hydrate; joins the sources below       │
│   • forwards the employee identity to BOTH paths ↓           │
└───────────────┬───────────────────────────┬─────────────────┘
   forward employee JWT                map cognito:groups → role
                ▼                           ▼
┌──────────────────────────────────┐   Snowflake managed MCP
│ AgentCore Gateway (single MCP)   │   (DIRECT, per-employee PAT;
│   • Cognito JWT inbound          │    native RBAC/masking, ADR-005)
│   • Inbound authN  : CUSTOM_JWT  → Cognito user pool         │
│   • Inbound authZ  : Cedar policy engine ← cognito:groups    │
│   • Audit          : per-employee access logs (CloudWatch)   │
│   • Tool catalog   : namespaced per target  (afs___, boom___)│
└───────────────┬───────────────────────────┬─────────────────┘
   outbound: service identity (Cognito M2M, afs-cognito-m2m)
                │                           │
                ▼                           ▼
        AFS MCP (custom,             Boom MCP (custom,
        AgentCore Runtime)           AgentCore Runtime)

   Snowflake managed MCP — reached DIRECTLY (not via gateway),
   with native user identity + RBAC/column-masking (ADR-005).
```

The KG (Group D) sits **above** the gateway as its client — Claude's single connector. Hosting:
KG on **App Runner** (it must forward the user token; AgentCore Runtime strips it — ADR-006),
AFS/Boom on **AgentCore Runtime**, gateway = **AgentCore Gateway**, Snowflake **direct**. The KG
itself lives in repo `Devinboden/kg-mcp`.

---

## 2. Live resource registry (account `111204669101`, region `us-east-1`)

| Component | Identifier |
|---|---|
| Cognito user pool | `us-east-1_Z1otWFj2I` (`mcpgateway-users`) |
| Cognito app client (M2M) | `7ktuvp7o0u0k21sn2rc0837g29` (secret; `client_credentials`) — outbound to AFS, smoke test |
| Cognito app client (interactive) | `4hkln2r3rlev6kom7jvrnsu7fv` (`mcpgateway-desktop`, public/PKCE, `authorization_code`) — Claude Desktop/Cowork login |
| Cognito domain | `mcpgateway-111204669101` (token endpoint for M2M) |
| Resource server / scopes | `https://mcpgateway/api` → `afs:read`, `snowflake:read` |
| Employees | `employee-a` (group `ROLE_RM`), `employee-b` (group `ROLE_ANALYST`) |
| Gateway | `mcpgateway-eerhmo8ymw` |
| Gateway URL | `https://mcpgateway-eerhmo8ymw.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp` |
| Gateway IAM role | `arn:aws:iam::111204669101:role/mcpgateway-gw-role` |
| AFS runtime | `arn:aws:bedrock-agentcore:us-east-1:111204669101:runtime/afs_mcp-F82Tf5DI8Q` |
| AFS OAuth provider | `…:token-vault/default/oauth2credentialprovider/afs-cognito-m2m` |
| AFS gateway target | `Q5ICZU7W8K` (`afs`) |
| Snowflake MCP | `PIEDMONT_MCP` (`CREDIT_MEMO_DB.CREDIT_RISK`), account `SPTNHMV-XF37990` |
| Boom runtime | `arn:aws:bedrock-agentcore:us-east-1:111204669101:runtime/boom_mcp-fQUgkK4pjp` (`boom_mcp`) |
| Boom gateway target | `VASU5DSO4U` (`boom`); outbound reuses `afs-cognito-m2m` (M2M) |
| Policy engine (Cedar) | `mcpgateway_authz-hfy2_5p_23` (ENFORCE) — A/B tool authz; policies in `infra/gateway/policies/` |
| Snowflake direct users | `EMPLOYEE_A`(ROLE_RM)/`EMPLOYEE_B`(ROLE_ANALYST) |
| **KG-MCP** | repo `Devinboden/kg-mcp`; deployed on **AWS App Runner** `https://phsc3gpvqk.us-east-1.awsapprunner.com/mcp` (x86 image `kg-mcp:v1` built via CodeBuild). Claude's single connector. |
| KG broker secret | `kg/snowflake-employee-pats` (per-employee Snowflake PATs, keyed by cognito username) |
| Snowflake | **reached directly** (ADR-005). OAuth integration `PIEDMONT_MCP_OAUTH` (redirect `claude.ai/api/mcp/auth_callback`); users `EMPLOYEE_A`(ROLE_RM)/`EMPLOYEE_B`(ROLE_ANALYST). Procedures/masking/grants kept; gateway plumbing retired. See `infra/snowflake/README.md`. |

Infra-as-code for the Gateway lives in [`../infra/gateway/`](../infra/gateway/).

---

## 3. Identity model

**Humans live in Cognito, never IAM** (locked decision). Each employee authenticates to
Cognito and receives a JWT. Two claims matter downstream:

- `sub` / `username` — *who* the employee is → used for **audit**.
- `cognito:groups` — `ROLE_RM` or `ROLE_ANALYST` → used for **authorization** (Cedar) and
  **target routing** (which Snowflake role they reach).

The same Cognito app client is trusted by both the Gateway and the AFS runtime, so both
user tokens (interactive) and machine tokens (M2M, see §5.1) validate against it.

> **Why Cognito is still required even though we abandoned OBO (§5.1):** Cognito is the
> inbound human-identity spine. Without it the Gateway cannot tell Employee A from
> Employee B, which is what powers *all three* of access control, target routing, and
> audit. Dropping OBO does not drop the need for an inbound IdP.

---

## 4. Inbound authorization (Gateway)

- **AuthN:** Gateway `authorizerType = CUSTOM_JWT`, validating against the Cognito pool
  (`discoveryUrl` = pool `.well-known/openid-configuration`, `allowedClients` = app client).
- **AuthZ (Group C step 13) — ✅ DONE (2026-06-21):** Gateway **Cedar policy engine**
  (`mcpgateway_authz-hfy2_5p_23`, **ENFORCE**) evaluating `cognito:groups`:
  - Employee A (`ROLE_RM`) → permit any tool (AFS + Boom).
  - Employee B (`ROLE_ANALYST`) → permit, **but forbid all `afs___*` tools** (forbid overrides).
  - **Verified:** RM → AFS ✅ + Boom ✅; Analyst → AFS 🚫 denied + Boom ✅. Policies + gotchas in
    [`infra/gateway/policies/`](../infra/gateway/policies/). Cedar: principal `AgentCore::OAuthUser`,
    claims-as-tags (`cognito:groups` is a **string** → `like "*ROLE_RM*"`, not `.contains`), action
    `AgentCore::Action::"<target>___<tool>"`, resource = gateway ARN; default-deny.

This resolves the open "group ≠ scope" item from Group A: **we authorize off the group
claim directly via Cedar — no Pre-Token-Generation Lambda needed.** (The authorizer also
supports `allowedScopes` / `customClaims` if scope-based gating is ever preferred.)

**Two token-acquisition paths (both validate at the same authorizer):**
- **M2M** (`client_credentials`, confidential client `7ktuvp7o…`) — for the smoke test and the
  gateway's own outbound-to-AFS credential.
- **Interactive** (`authorization_code` + PKCE, public client `4hkln2r3rlev6kom7jvrnsu7fv`) — for
  **Claude Desktop / Cowork**. The gateway exposes `.well-known/oauth-protected-resource` and 401s
  with a `www-authenticate` pointer, so the Claude client auto-discovers Cognito; since Cognito has
  no DCR, the **public client ID is supplied manually** in the connector's Advanced settings.
  Setup + connect steps: [`../infra/cognito/README.md`](../infra/cognito/README.md).

---

## 5. Outbound authorization (per target)

### 5.0 The constraint that shaped everything

An **MCP-protocol gateway only accepts MCP-server targets.** For that target type the
platform supports these outbound credential types: `GATEWAY_IAM_ROLE` (SigV4), `OAUTH`
(client-credentials / authorization-code / **token-exchange/OBO**), and `API_KEY`. It does
**not** support token **pass-through**, and `http.agentcoreRuntime` targets are rejected on
an MCP gateway.

### 5.1 ADR-001 — AFS uses a **service identity**, not OBO

**Decision:** The Gateway authenticates to AFS with an **OAuth client-credentials (M2M)
token** minted from the Cognito app client (provider `afs-cognito-m2m`). AFS sees a service
principal. Per-employee **audit is captured at the Gateway**, not inside AFS.

**Context / why true OBO is impossible here:**
- Token pass-through is unsupported for MCP-server targets (§5.0).
- AgentCore OBO is done by **token exchange**, which AgentCore Identity **brokers with the
  customer IdP** — it requires the IdP to implement **RFC 8693** (token-exchange grant) or
  **RFC 7523** (JWT-bearer grant). **Amazon Cognito user pools implement neither.**
- Therefore the inbound user JWT cannot be lawfully converted into a user-scoped token AFS
  would accept. Any attempt collapses to a service principal regardless.

**Consequences:**
- ✅ Stays entirely in AWS (priority #1).
- ✅ Audit trail preserved — **at the Gateway layer** (priority #2). Authentication and
  attribution are deliberately decoupled: AFS authenticates a *service*; the Gateway's
  CloudWatch/CloudTrail logs record *which employee* invoked *which tool* (from the
  validated inbound JWT). This is the standard "log at the trust boundary" pattern.
- ✅ Access restriction unaffected (priority #3) — Employee B is blocked from AFS by Cedar
  (§4), which never depended on OBO.
- ⚠️ Revises locked decision #1 and plan step 27: "AFS shows the human" becomes
  "**Gateway log shows the human; AFS shows the service.**"

**Rejected alternatives:**
- *Swap Cognito for an OBO-capable IdP (Entra/Auth0/Okta):* leaves AWS → violates priority #1.
- *IAM SigV4 to AFS:* AWS-native but still a service identity, **and** requires
  re-authorizing the already-built AFS runtime off Cognito-JWT onto IAM. More rework, same
  attribution outcome as the chosen option.

### 5.2 ADR-003 — Snowflake uses **two targets, one PAT per role**

**Decision:** Stand up **two** Snowflake MCP targets, each authenticating with a
**Programmatic Access Token (PAT)** bound to a user whose role is `ROLE_RM` or
`ROLE_ANALYST`. Register each PAT as an AgentCore **API-key credential provider**. Cedar
(§4) routes each employee to the matching target.

**Why per-target and not per-user:** A Gateway outbound credential is **per-target, not
per-employee**; true per-user role mapping would again need OBO/token-exchange Cognito
can't do. Two role-specific targets + Cedar routing reproduces "service-role-per-employee"
within the platform's model. Snowflake's column-masking (Phase B) then differentiates data
automatically because masking keys off the **caller's role** — RM sees exposure dollars,
Analyst sees `NULL`.

**Why PAT and not OAuth (for now):** AgentCore Gateway outbound accepts only OAuth or
API-key — **not** Snowflake key-pair JWT (the usual Snowflake service-auth). Snowflake has
**no native M2M/client-credentials OAuth**; M2M OAuth would require an **External OAuth**
security integration trusting Cognito plus claim→role mapping — hours of setup with
edition/claim gotchas. A PAT (→ API-key provider) bridges the same gap in one step.

**Consequences / tradeoffs:**
- ✅ Fastest path to a working A/B Snowflake demo; tokens are revocable/expirable.
- ⚠️ PATs are **long-lived bearer tokens** held in the AgentCore token vault (Secrets
  Manager) with **manual rotation**. Snowflake also **requires a network policy** on the
  user before a PAT can be used (demo uses a permissive `0.0.0.0/0` policy — restrict in prod).
- 🔭 **Productionization follow-up:** replace PATs with **External OAuth (Cognito) +
  Snowflake user/role mapping**, or key-pair if/when the Gateway supports it.

**Status: IMPLEMENTED (2026-06-15).** PAT presented as `Authorization: Bearer` (no token-type
header needed). Both targets `READY`. Code: `infra/snowflake/03`–`04`, `infra/gateway/target-snowflake-*`.

### 5.4 ADR-004 — Differentiation lives **inside the procedures** (EXECUTE AS CALLER)

**Decision:** The 6 `PIEDMONT_MCP` procedures were rewritten from `EXECUTE AS OWNER` to
**`EXECUTE AS CALLER`**, with dollar/exposure fields wrapped in
`CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE … END`.

**Why not a masking policy (the Phase B mechanism):** the procedures return **VARIANT/JSON**
(`OBJECT_CONSTRUCT`), and Snowflake masking policies apply to **columns**, not constructed
JSON — so a policy can't reach these outputs. `EXECUTE AS OWNER` also made `CURRENT_ROLE()`
resolve to the owner, defeating any role check. Switching to `EXECUTE AS CALLER` makes
`CURRENT_ROLE()` the calling employee's role (the PAT is `ROLE_RESTRICTION`'d), so the
in-procedure check differentiates. Both roles get identical *read access* (grants in
`infra/snowflake/01-grants.sql`); only the *presentation* differs.

**Verified:** `get_balance_trend(847291)` — RM sees `$` balances + change; Analyst sees only
`pct_change`/`direction`. `get_risk_rating_trend` identical for both (no dollars). Masked
tools: `list_facilities`, `get_revolver_usage_trend`, `get_balance_trend`, `get_payment_history`.
Originals preserved in `infra/snowflake/original/`.

### 5.5 ADR-005 — Snowflake moved **out** of the gateway; **Boom** moved in

**Decision (2026-06-21):** The gateway fronts only **custom / ungoverned** MCPs — **AFS** and
**Boom** (`Noland-LAL/boom-mcp`, a Next.js spreading-engine MCP, deployed to AgentCore Runtime
the same way as AFS). **Snowflake is reached directly**, not through the gateway.

**Why:** Building it through the gateway proved the mismatch — Snowflake's managed MCP is *already*
a governed MCP (native RBAC, column-masking, query-history audit, rich identity). Forcing it through
the gateway (a) collapsed per-user identity to a service credential (OBO wall), then (b) required a
**two-target** RM/Analyst split, **PATs**, and **`EXECUTE AS CALLER`** rewrites just to re-create a
role split Snowflake does natively, plus (c) a flaky proxy (`Error parsing response`). Every hard
problem in the build came from putting Snowflake behind the gateway. Reached **directly** with the
user's own identity (External-OAuth/SSO → Snowflake role), Snowflake's native masking differentiates
per-user automatically.

**Retained / retired:**
- **Kept:** the `EXECUTE AS CALLER` procedures + masking + role grants (`infra/snowflake/01`,`02`) —
  still correct for direct access; now `CURRENT_ROLE()` is the **real user's** role, not a PAT's.
- **Retired:** 2 gateway targets, 2 PATs + API-key providers, `SVC_GATEWAY` service user, network
  policy `NP_GATEWAY_ALLOW_ALL`. (`infra/gateway/target-snowflake-*`, `infra/snowflake/04` are now
  historical.)

**Division of labor:** gateway = unification + governance for sources that lack their own (AFS, Boom);
Snowflake = its own per-user governance, joined to the rest at the **KG layer** (KG → gateway for
AFS/Boom, KG → Snowflake directly).

**Boom deployment (`boom_mcp-fQUgkK4pjp`, READY 2026-06-21) — 5 gotchas, all fixed:**
1. **`source_path`** — the toolkit derived it from the entrypoint dir (`src/`), so root `package.json`
   never reached the build (`npm ci → ENOENT`). Fixed: set `source_path` to the repo root in
   `.bedrock_agentcore.yaml` (AFS worked because its entrypoint was at root).
2. **Docker Hub 429** — Boom's Dockerfile pulled `docker.io/.../node:22-slim`. Switched to
   `public.ecr.aws/docker/library/node:22-slim`.
3. **CodeBuild role ECR push** — the shared `…CodeBuild…` role lacked `ecr:InitiateLayerUpload` on the
   new repo. Added `infra/boom/codebuild-ecr-policy.json` (push on `bedrock-agentcore-*`).
4. **Runtime role ECR pull** — `CreateAgentRuntime` needs the `…Runtime…` role to pull the image
   (`ecr:GetAuthorizationToken`/`BatchGetImage`/`GetDownloadUrlForLayer`). Added
   `infra/boom/runtime-ecr-policy.json`.
5. **Toolkit UTF-8 crash** — `agentcore configure/deploy` print emoji; run with `PYTHONUTF8=1`.

Boom verified through the gateway: `tools/list` → 9 `boom___*` tools; `boom___boom_lookup_company`
returns fixture data (Piedmont). Unlike Snowflake, gateway→Boom tool *calls* work cleanly (Boom's
runtime is stateless and accepts the `Mcp-Session-Id` header natively).

### 5.6 ADR-006 — KG hosts on **App Runner**, not AgentCore Runtime (token pass-through)

**Decision (2026-06-21):** The KG-MCP server is deployed on **AWS App Runner** (a plain container
service), **not** AgentCore Runtime. AFS/Boom stay on AgentCore Runtime.

**Why:** The KG's whole job is **identity pass-through** — it must read the employee's JWT and
forward it to the gateway (so Cedar A/B + audit apply) and map it for the Snowflake broker. But
**AgentCore Runtime strips the inbound `Authorization` header** and replaces it with a *workload
access token* (the AgentCore Identity model) — verified from the runtime logs (`hasBearer: false`;
only `x-amzn-bedrock-agentcore-runtime-workload-accesstoken` arrives). The workload token is **not** a
Cognito JWT, so the gateway rejects it, and converting it via AgentCore Identity OBO hits the same
**Cognito-can't-token-exchange** wall (ADR-001). So a token-forwarding front door can't run on
AgentCore Runtime with Cognito.

**App Runner forwards headers**, so the KG gets the raw employee token. The KG then **validates the
Cognito JWT itself** (jose + JWKS, allowedClients), advertises `.well-known/oauth-protected-resource`
+ a 401 challenge (Claude Desktop interactive login), and forwards the token downstream. *"On AWS"
≠ "on AgentCore Runtime"* — App Runner is AWS; **Cedar stays in the gateway, nothing is lost.**

**Build note:** App Runner needs **x86**; the AgentCore image is **arm64**. With no local Docker, the
x86 image (`kg-mcp:v1`) is built in the cloud via a **CodeBuild** project (S3 source zip → ECR), then
App Runner deploys it. Code/infra in `Devinboden/kg-mcp` (`infra/codebuild/`, `infra/apprunner/`).

**Verified (deployed):** `kg_hydrate` through `https://phsc3gpvqk.us-east-1.awsapprunner.com/mcp` —
RM sees Snowflake `$` + Boom; Analyst sees masked Snowflake + Boom; AFS link surfaced as pending.
One employee identity drives the gateway (Cedar) **and** the Snowflake broker, end-to-end, in the cloud.

### 5.3 ADR-002 — Semantic search disabled

**Decision:** The Gateway runs **without** `searchType: SEMANTIC`.

**Why:** `DYNAMIC` (live) MCP-server discovery is **incompatible with semantic search**,
and static tool schemas (`mcpToolSchema`, required for semantic search in `DEFAULT` mode)
are only allowed with authorization-code OAuth providers — not the client-credentials/PAT
providers we use. With ~15 total tools, well-written tool descriptions suffice. Plan E22
("tune descriptions **or** rely on semantic search") is satisfied by the former. Re-enabling
semantic search later would require auth-code providers on every target.

---

## 6. Audit model

| Hop | Authenticated as | Per-employee attribution source |
|---|---|---|
| Claude → Gateway | The **employee** (Cognito JWT) | The token itself (`sub`, `cognito:groups`) |
| Gateway → AFS | The **service** (M2M token) | **Gateway** access logs (CloudWatch/CloudTrail) |
| Gateway → Snowflake | The **service role** (PAT: RM/Analyst) | Gateway logs + Snowflake query history (by role) |

The single authoritative place that knows *employee → tool → timestamp* for **every** call
is the **Gateway**. Downstream systems know *role* (Snowflake) or *service* (AFS). This
asymmetry is intentional and documented.

---

## 7. Tool-name namespacing (Group C step 14)

The Gateway prefixes target tools (triple-underscore convention). Tool references from the
agent/KG layer must use the namespaced names or be aliased. To be verified once both
targets are live and a `tools/list` is captured through the Gateway data plane.

---

## 8. Request lifecycle (end-to-end, target state)

1. Employee signs into Cognito → receives JWT (carries `sub` + `cognito:groups`).
2. Claude calls the Gateway MCP endpoint with `Authorization: Bearer <JWT>`.
3. Gateway validates the JWT (CUSTOM_JWT) and logs the employee identity.
4. Cedar evaluates `cognito:groups` → allow/deny the requested tool/target.
5. Gateway mints/loads the **outbound** credential for the chosen target
   (AFS: Cognito M2M; Snowflake: role PAT) and forwards the tool call.
6. Target executes under the service/role identity; result returns through the Gateway.
7. Gateway emits the per-employee audit record.

---

## 9. Security notes & known debt

- **Root credentials:** the AWS CLI is currently configured with **account root** access
  keys. Acceptable for this demo; replace with a scoped IAM principal before any real use.
- **Secret handling:** the Cognito app-client secret and Snowflake PATs are **never written
  to the repo**. Scripts fetch/inject them via temp files outside the repo (no BOM) and
  remove them immediately; the live secrets live only in the AgentCore token vault /
  Secrets Manager.
- **Rotation:** AFS M2M tokens are short-lived (auto). **Snowflake PATs are long-lived —
  schedule rotation** (see ADR-003 follow-up).
- **Gateway role scope:** `mcpgateway-gw-role` grants `InvokeAgentRuntime` on the AFS
  runtime, workload-identity/token-vault reads, the provider secret, and logs. Tighten the
  `secretsmanager` and `kms` scopes for production.

---

## 10. Open items / follow-ups

- [x] **Data-plane verified for AFS** via `infra/gateway/smoke-test.py` (mint Cognito M2M token → MCP `initialize`/`tools/list`/`tools/call`). 21 namespaced tools (`<target>___<tool>`) — confirms C14. `afs___afs_show_summary` returns live data end-to-end. ✅ 2026-06-15
- [x] **Invoke-time IAM fix:** gateway role needed `GetResourceOauth2Token`/`GetResourceApiKey`/`GetWorkloadAccessToken` on the **bare** `token-vault/default` ARN (not just `…/default/*`). Sync had worked because it runs as a different principal; live tool calls failed 403 until fixed. Surfaced by setting the gateway `exceptionLevel=DEBUG` (still on — return to default for prod; minor info-leak).
- [ ] **Snowflake tool calls fail with `MCP Server tool error: Error parsing response`** (auth now OK). Investigate the PIEDMONT_MCP response shape vs gateway expectations. Does not affect AFS.
- [ ] **Claude Desktop connectivity:** Desktop custom connectors use interactive OAuth; the Cognito app client is `client_credentials`-only with no callback URLs/hosted-UI and employees are in FORCE_CHANGE_PASSWORD. Need auth-code flow + callbacks + user passwords for Desktop to connect (CLI can use a static bearer today).
- [x] Snowflake: two role PATs + API-key providers + two targets (ADR-003/004). ✅ 2026-06-15
- [ ] Cedar policy engine: author + attach policies; A→`afs`+`snowflake-rm`, B→`snowflake-analyst` only; `LOG_ONLY` → `ENFORCE` (step 13).
- [ ] Verify tool namespacing via a data-plane `tools/list` through the Gateway with an employee JWT (step 14) — note the two Snowflake targets produce two namespaced tool sets.
- [ ] Set permanent passwords for `employee-a` / `employee-b` (carried from Group A).
- [ ] Productionization: External-OAuth for Snowflake; scoped IAM principal (not root); PAT rotation; restrict `NP_GATEWAY_ALLOW_ALL`.
- [x] **AFS live mode** (`infra/afs/go-live.sh`) — ✅ DONE (2026-06-15). Flips `AFS_FIXTURE_MODE=false` + injects `AFS_USERNAME`/`AFS_PASSWORD` (from Secrets Manager `mcpgateway/afs-vision`) + **`AFS_BASE_URL=https://dd3.afsvision.us/webx/api/v1`** as runtime env vars (no image rebuild). Verified: `jobs_by_officer` returns real live workpackages ("…[live]"). The app (`lib/config.js`) reads `AFS_BASE_URL` (default was an unreachable placeholder → earlier `fetch failed`), `AFS_USERNAME`/`AFS_PASSWORD` (HTTP Basic), `AFS_FIXTURE_MODE`. Revert: `MODE=fixture bash infra/afs/go-live.sh`.
  - **Gotcha (fixed in the script):** `update-agent-runtime` is a full replace — omitting `authorizerConfiguration` **drops the runtime's Cognito JWT authorizer** (reverts to IAM), breaking the gateway's bearer-token calls (`Authorization error when sending message`). The script always replays the customJWTAuthorizer.
