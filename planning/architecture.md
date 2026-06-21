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

### 5.7 ADR-007 — Crosswalk + review queue persist in **DynamoDB** (Neptune deferred for cost)

**Decision (2026-06-21):** The KG's crosswalk (obligor → cross-system keys) and the human review
queue persist in a single **DynamoDB** table `kg-crosswalk` (`PAY_PER_REQUEST`), behind the existing
`Crosswalk` interface. **Neptune (D-2) is deferred** purely for cost.

**Why DynamoDB now:** Neptune is **VPC-only** and carries a standing hourly cost even when idle; the
demo needs durability, not graph traversal. DynamoDB is **pay-per-request (scale-to-zero)**, has a
**public endpoint** (no VPC/NAT, so App Runner reaches it with just an IAM policy), and bills on the
existing AWS account. One-key model: `pk=OBLIGOR#<ncino>` / `sk=META` holds the obligor + `links`
map; `pk=CANDIDATE` / `sk=cand_<hex>` holds queue items. Approving a candidate does
`UpdateItem … SET links.<system> = …` on the obligor item, so a confirmed link is **durable across
restarts** — no in-memory state.

**Verified (deployed, `kg-mcp:v3`):** resolve/hydrate read from the table; `kg_confirm_candidate
approve` writes `links.afs.status = human-confirmed` (confirmed via `get-item`), and re-hydration
then joins AFS for the RM while Cedar still denies it for the Analyst. Seed/reset via
`scripts/seed-dynamo.mjs`. IAM: `kg-apprunner-instance-role` granted GetItem/PutItem/UpdateItem/
Query/Scan on the table (`infra/apprunner/dynamodb-policy.json`). Neptune remains the documented
later swap (same interface, no logic change).

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
| Claude → KG / Gateway | The **employee** (Cognito JWT) | The token itself (`sub`, `cognito:groups`) |
| KG → Gateway → AFS/Boom | The **service** (M2M token) | **Gateway** access logs (CloudWatch/CloudTrail) |
| KG → Snowflake (direct) | The **employee role** (per-employee PAT) | Snowflake query history (real user + role) |

The single authoritative place that knows *employee → tool → timestamp* for **every** call
is the **Gateway** (for AFS/Boom) plus **Snowflake's own query history** (for the direct leg,
which runs under the employee's role PAT). Downstream AFS knows *service*; Snowflake knows the
*real employee*. This asymmetry is intentional and documented (ADR-001).

### 6.0 Widget vs. data: the KG reads `structuredContent`

`afs_show_summary` (and other MCP-UI tools) return an **interactive widget** the *host* renders
client-side; the actual numbers ride in the result's **`structuredContent`** field, not the plain
`text` content. The KG's gateway client originally read only `type:"text"`, so `kg_hydrate` joined
the widget envelope (metadata) instead of the AFS summary. Fixed in `kg-mcp/src/mcpClient.js`
(`McpClient.extractData`): preference order **`structuredContent` → text(JSON) → JSON `resource`
block**, skipping widget HTML, and the chosen path is recorded as `shape` in the audit log.
Verified live (KG v5): AFS hydrates full facilities/balances/collateral/past-due/revolver analytics
with `shape:"structuredContent"`. Lesson: when fronting MCP-UI tools from a non-rendering consumer,
always read `structuredContent`.

### 6.1 Correlation IDs + structured audit logging (KG)

The KG mints **one `traceId` per inbound MCP request** and threads it through the entire fan-out,
so a single id stitches together what would otherwise be three disconnected log sources:

```
auth.ok        traceId=kg-… user=employee-a groups=[ROLE_RM]
tool.call      traceId=kg-… tool=kg_hydrate user=employee-a
hydrate.start  traceId=kg-… ncino=001bb…
downstream.call traceId=kg-… target=gateway   tool=boom___boom_get_ratios ok=true ms=2386
downstream.call traceId=kg-… target=snowflake tool=…GET_RISK_RATING_TREND  ok=true ms=3500 sf_query_id=01c5…
hydrate.done   traceId=kg-… sources=[boom,snowflake]
```

- **Emission:** structured JSON, one object per line, to **stderr** (stdout is the stdio MCP
  protocol channel) → CloudWatch → (prod) a SIEM. Implemented in `kg-mcp/src/audit.js`.
- **Propagation:** the `traceId` is echoed to the client as the `X-Trace-Id` response header and
  returned in the hydrate payload as `_trace`; it is forwarded downstream as `X-Trace-Id` +
  a W3C `traceparent`, and set as Snowflake's **`QUERY_TAG`** so it lands in
  `SNOWFLAKE.ACCOUNT_USAGE.QUERY_HISTORY` — closing the loop between the KG log and the actual
  Snowflake session that ran *as the employee*. The Snowflake `statementHandle` is captured back
  as `sf_query_id`.
- **Events:** `auth.ok` / `auth.denied` (with reason), `tool.call` (per tool, user, latency,
  error), `hydrate.start` / `hydrate.done`, `downstream.call` (target, tool, ok, latency, and a
  `denied` flag when Cedar blocks a tool — e.g. the Analyst's AFS call).

This is the **in-repo slice** of audit row 16. The remaining enterprise pieces — SIEM aggregation,
a tamper-evident/WORM audit store, and multi-year retention/legal-hold — are platform work, tracked
in §9/§10 and §11.

---

## 7. Tool-name namespacing (Group C step 14)

The Gateway prefixes target tools (triple-underscore convention). Tool references from the
agent/KG layer must use the namespaced names or be aliased. To be verified once both
targets are live and a `tools/list` is captured through the Gateway data plane.

---

## 8. Request lifecycle (end-to-end, as-built)

1. Employee signs into Cognito → receives JWT (carries `sub` + `cognito:groups`).
2. Claude calls the **KG** MCP endpoint (App Runner) with `Authorization: Bearer <JWT>`.
3. KG **validates the JWT itself** (jose/JWKS, issuer + allowedClients), **mints a `traceId`**,
   and emits `auth.ok` (or `auth.denied`).
4. `kg_hydrate` resolves the obligor (DynamoDB crosswalk) and fans out to its **confirmed** links:
   - **AFS / Boom → the Gateway**, forwarding the employee JWT (+ `X-Trace-Id`/`traceparent`).
     The Gateway validates the JWT and **Cedar** evaluates `cognito:groups` → allow/deny per tool;
     allowed calls run under the target's **service** identity. (Analyst's AFS call is denied here.)
   - **Snowflake → direct** via the SQL API using the employee's **role-restricted PAT** (from the
     Secrets Manager broker), with `QUERY_TAG=traceId`. Native `EXECUTE AS CALLER` masking applies.
5. Each leg emits a `downstream.call` audit event (target, tool, ok, latency, `denied`); the KG
   joins the results into one virtual obligor view (nothing persisted) and emits `hydrate.done`.
6. Response returns to Claude with `X-Trace-Id` + `_trace` for end-to-end correlation.

> Note: this supersedes the earlier "Gateway → Snowflake" target state — Snowflake was moved **out**
> of the gateway (ADR-005) and the **KG** is now the front door (ADR-006).

---

## 9. Security notes & known debt

- **Root credentials:** the AWS CLI is currently configured with **account root** access
  keys. Acceptable for this demo; replace with a scoped IAM principal before any real use.
  *(Highest-priority "not enterprise" finding — see §11 row 13.)*
- **Secret handling:** the Cognito app-client secret, Snowflake PATs, and the AFS credential are
  **never written to the repo** (`.gitignore` covers `.env*`; seed data is synthetic). The
  canonical AFS credential lives in **Secrets Manager** (`mcpgateway/afs-vision`). **Caveat:**
  `infra/afs/go-live.sh` reads that secret and **materializes the plaintext value into the AFS
  runtime's `environmentVariables`** at deploy time, so the deployed runtime config holds a
  plaintext copy (readable via `get-agent-runtime`). Storage is correct; the gap is the
  materialization — the runtime should fetch from Secrets Manager at startup via its execution
  role instead (see §11 row 9).
- **Rotation:** AFS M2M tokens are short-lived (auto). **Snowflake PATs are long-lived — schedule
  rotation.** Note the broker (`kg-mcp/src/broker.js`) caches PATs in-process indefinitely; add a
  TTL so a rotated PAT is picked up without a restart (§11 row 8).
- **SQL safety:** Snowflake proc args are string-interpolated with `'`-escaping, not parameterized
  binds. Low risk (proc args only) but move to binds (§11 row 10).
- **Gateway role scope:** `mcpgateway-gw-role` is resource-scoped (specific AFS runtime ARN,
  token-vault, policy-engine/gateway, provider secret prefix); only `logs`/`cloudwatch` are `*`.
  Decent least-privilege; tighten the `secretsmanager`/`kms` scopes further for production.
- **Audit (done):** correlation `traceId` + structured JSON audit logging across every hop
  (§6.1). Remaining: SIEM aggregation + tamper-evident/WORM store + retention (§11 row 16).

---

## 10. Open items / follow-ups

- [x] **Data-plane verified for AFS** via `infra/gateway/smoke-test.py` (mint Cognito M2M token → MCP `initialize`/`tools/list`/`tools/call`). 21 namespaced tools (`<target>___<tool>`) — confirms C14. `afs___afs_show_summary` returns live data end-to-end. ✅ 2026-06-15
- [x] **Invoke-time IAM fix:** gateway role needed `GetResourceOauth2Token`/`GetResourceApiKey`/`GetWorkloadAccessToken` on the **bare** `token-vault/default` ARN (not just `…/default/*`). Sync had worked because it runs as a different principal; live tool calls failed 403 until fixed. Surfaced by setting the gateway `exceptionLevel=DEBUG` (still on — return to default for prod; minor info-leak).
- [x] **Snowflake `Error parsing response` RESOLVED** by bypassing the managed MCP and calling the **SQL API** directly from the KG (the managed MCP couldn't serialize the procedures' VARIANT return). ADR-005. ✅
- [x] **Claude Desktop / Cowork connectivity RESOLVED:** the **KG on App Runner** validates the JWT itself and advertises `.well-known/oauth-protected-resource` + a 401 challenge (interactive login). ADR-006. ✅
- [x] Snowflake: two role PATs + API-key providers + two targets (ADR-003/004). ✅ 2026-06-15
- [x] **Cedar policy engine** authored + attached, mode `ENFORCE`; RM→all, Analyst→all-except-AFS (forbid-overrides). Verified in Phase F. ✅
- [x] Tool-name namespacing verified via data-plane `tools/list` (C14). ✅
- [x] **Permanent passwords** set for `employee-a` / `employee-b` (`Truist!Demo2026`). ✅ 2026-06-21
- [x] **Audit slice (row 16):** correlation `traceId` + structured JSON logging across all hops (KG v4). ✅ 2026-06-21
- [ ] Productionization (remaining): scoped IAM principal (not root); AFS cred fetched from Secrets Manager **at runtime** (not materialized into env vars) + rotate; PAT rotation + broker TTL; Snowflake parameterized binds; SIEM + WORM audit store; network → VPC/PrivateLink. See **§11**.
- [x] **AFS live mode** (`infra/afs/go-live.sh`) — ✅ DONE (2026-06-15). Flips `AFS_FIXTURE_MODE=false` + injects `AFS_USERNAME`/`AFS_PASSWORD` (from Secrets Manager `mcpgateway/afs-vision`) + **`AFS_BASE_URL=https://dd3.afsvision.us/webx/api/v1`** as runtime env vars (no image rebuild). Verified: `jobs_by_officer` returns real live workpackages ("…[live]"). The app (`lib/config.js`) reads `AFS_BASE_URL` (default was an unreachable placeholder → earlier `fetch failed`), `AFS_USERNAME`/`AFS_PASSWORD` (HTTP Basic), `AFS_FIXTURE_MODE`. Revert: `MODE=fixture bash infra/afs/go-live.sh`.
  - **Gotcha (fixed in the script):** `update-agent-runtime` is a full replace — omitting `authorizerConfiguration` **drops the runtime's Cognito JWT authorizer** (reverts to IAM), breaking the gateway's bearer-token calls (`Authorization error when sending message`). The script always replays the customJWTAuthorizer.

---

## 11. Enterprise-grade readiness audit (2026-06-21)

A standing assessment of **what is vs. isn't enterprise/regulated-grade**, audited against the live
artifacts (IAM, Cedar, auth config, runtime env, code) — not from memory. **Verdict: the
*architecture* is enterprise-shaped; the gaps are *operational posture*, not design.** None of the
red rows require re-architecting.

### Already enterprise-shaped ✅
| # | Dimension | Evidence |
|---|---|---|
| 1 | Authorization model | Cedar: default-deny + explicit permits + `forbid`-overrides, claims-as-tags, per-tool AFS enumeration |
| 2 | Data minimization | Virtual hydration — KG stores keys/relationships only; financials fetched live, never persisted |
| 3 | Token validation (KG) | `server.js` validates Cognito JWT (jose/JWKS), checks issuer + allowedClients, 401 challenge |
| 4 | Resource-scoped service IAM | Gateway role → specific AFS runtime ARN; App Runner role → single DynamoDB table ARN |
| 5 | Secrets in repo | `.gitignore` covers `.env*`; seed data synthetic; no PATs/keys committed |
| 6 | Agent governance (SR 11-7) | DRAFT watermark, human-in-the-loop attestation, figure traceability |
| 15a | Live systems of record | **AFS live** (`FIXTURE_MODE=false`, real AFS Vision), **Snowflake live** (per-employee PAT + masking) |
| 16 | Correlation + structured audit | `traceId` across all hops, Snowflake `QUERY_TAG` join, structured JSON events (§6.1) — *done 2026-06-21* |

### Partial ⚠️ (small code changes)
| # | Dimension | Gap |
|---|---|---|
| 7 | Authz granularity | `permit-rm` grants `action` (any tool); enterprise wants per-tool least-privilege for the RM too |
| 8 | Secret rotation | Snowflake PATs long-lived; broker caches in-process forever → add rotation + cache TTL |
| 9 | Downstream cred handling | AFS credential **is** in Secrets Manager (`mcpgateway/afs-vision`), but `go-live.sh` **materializes the plaintext into the runtime's env vars** at deploy (readable via `get-agent-runtime`) → have the runtime fetch from the vault at startup via its execution role instead; add rotation |
| 10 | SQL safety | Snowflake proc args string-interpolated, not parameterized binds |
| 11 | End-user attribution (OBO) | AFS/Boom run under a service identity (Cognito can't RFC 8693) — user attributed at the gateway, not the resource |

### Demo-grade ❌ (platform / org work)
| # | Dimension | Gap |
|---|---|---|
| 12 | Network posture | Everything on **public endpoints** (App Runner/DynamoDB/Snowflake/Secrets over internet). Regulated target = VPC + PrivateLink everywhere. See §11.1. |
| 13 | Build/deploy identity | **`sts get-caller-identity` → `:root`.** No IAM roles, no separation of duties. *Highest-priority finding.* |
| 14 | Authentication strength | Cognito `USER_PASSWORD_AUTH`, shared demo password, no MFA, no enterprise IdP federation |
| 15b | Real data sources | **Boom** runs on bundled data (no external creds) — not wired to a system of record |
| 16b | Observability (rest) | No SIEM aggregation, no tamper-evident/WORM audit store, no multi-year retention/legal-hold |
| 17 | Resilience / HA-DR | Single region, single instance, no WAF, no rate limiting, no DR |

### 11.1 Network posture: demo vs. regulated target
At a regulated bank the public endpoints are the biggest demo-ism. "VPC everything" operationalizes
the real requirement: **no data/control traffic over the public internet, deny-by-default egress,
private DNS, all on the AWS backbone / corporate network.** Component mapping: KG host → private
subnets behind an internal ALB (or AgentCore in-account); DynamoDB/Neptune → VPC/PrivateLink
endpoint; Snowflake → **PrivateLink to Snowflake**; Bedrock → PrivateLink (the SR 11-7 control that
keeps inference in-boundary); Secrets/KMS → VPC endpoints; identity → enterprise IdP federated in;
client→tools → Direct Connect / Transit Gateway, mTLS, egress proxy. Wrapped in a multi-account
landing zone (Control Tower, SCPs, GuardDuty, flow logs). **The application architecture, authz
model, and data-flow design carry over unchanged** — this is a platform/landing-zone project.

### 11.2 Remediation priority
1. **Kill root** (row 13) — IAM roles + permission boundaries, enterprise IdP + MFA (rows 13–14).
2. **Network landing zone** (row 12) — private subnets + PrivateLink to Snowflake/DynamoDB/Bedrock/Secrets.
3. **Data & secrets ops** (rows 8–11, 15b, 16b) — AFS cred → vault + rotation; per-call fetch + cache TTL; bind params; Boom go-live; SIEM + WORM audit; OBO via a token-exchange-capable IdP.

Rows 7–11 are small in-repo code changes; rows 12–17 are platform/org work.
