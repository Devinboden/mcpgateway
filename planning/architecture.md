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
│ AgentCore Gateway  (single MCP endpoint)                     │
│   • Inbound authN  : CUSTOM_JWT  → Cognito user pool         │
│   • Inbound authZ  : Cedar policy engine ← cognito:groups    │
│   • Audit          : per-employee access logs (CloudWatch)   │
│   • Tool catalog   : namespaced per target                   │
└───────────────┬───────────────────────────┬─────────────────┘
   outbound: service identity   outbound: service identity (per role)
                │                           │
                ▼                           ▼
        AFS MCP (custom,             Snowflake managed MCP
        AgentCore Runtime)           (PIEDMONT_MCP)
        OAuth client-creds           PAT per role:
        (Cognito M2M token)          ROLE_RM / ROLE_ANALYST
```

The knowledge-graph layer (Group D) will sit *between* Claude and the Gateway as a
client of the Gateway; it is not yet built. This document covers Groups A–C.

---

## 2. Live resource registry (account `111204669101`, region `us-east-1`)

| Component | Identifier |
|---|---|
| Cognito user pool | `us-east-1_Z1otWFj2I` (`mcpgateway-users`) |
| Cognito app client | `7ktuvp7o0u0k21sn2rc0837g29` (secret; `client_credentials` + `USER_PASSWORD_AUTH`) |
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
- **AuthZ (Group C step 13, planned):** Gateway **Cedar policy engine**, evaluating
  `cognito:groups` to decide which targets/tools each employee may invoke:
  - Employee A (`ROLE_RM`) → AFS target **and** Snowflake-RM target.
  - Employee B (`ROLE_ANALYST`) → Snowflake-Analyst target **only** (blocked from AFS).
  - Mode: validate in `LOG_ONLY`, then switch to `ENFORCE`.

This resolves the open "group ≠ scope" item from Group A: **we authorize off the group
claim directly via Cedar — no Pre-Token-Generation Lambda needed.** (The authorizer also
supports `allowedScopes` / `customClaims` if scope-based gating is ever preferred.)

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
  user before a PAT can be used.
- 🔭 **Productionization follow-up:** replace PATs with **External OAuth (Cognito) +
  Snowflake user/role mapping**, or key-pair if/when the Gateway supports it.

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

- [ ] Snowflake: create two role PATs + API-key providers + two targets (ADR-003).
- [ ] Cedar policy engine: author + attach policies; `LOG_ONLY` → `ENFORCE` (step 13).
- [ ] Verify tool namespacing via a data-plane `tools/list` through the Gateway (step 14).
- [ ] Set permanent passwords for `employee-a` / `employee-b` (carried from Group A).
- [ ] Productionization: External-OAuth for Snowflake; scoped IAM principal; PAT rotation.
