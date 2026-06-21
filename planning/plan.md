# Build plan — ordered steps

Concrete steps to stand up the end-to-end system. Do them in order; groups are mostly sequential (A→F), with B able to run alongside A.

---

## A. Identity & accounts (Cognito) — ✅ DONE (2026-06-14)

**Provisioned resources (account `111204669101`, region `us-east-1`):**

| Resource | Value |
|----------|-------|
| User pool | `mcpgateway-users` → `us-east-1_Z1otWFj2I` |
| Resource server | `https://mcpgateway/api` |
| Scopes | `afs:read`, `snowflake:read` (full names prefixed: `https://mcpgateway/api/afs:read`, …) |
| App client | `mcpgateway-client` → `7ktuvp7o0u0k21sn2rc0837g29` (has secret; `client_credentials` + `USER_PASSWORD_AUTH`) |
| Employee A (RM) | user `employee-a`, group `ROLE_RM` |
| Employee B (Analyst) | user `employee-b`, group `ROLE_ANALYST` |
| JWKS URL | `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Z1otWFj2I/.well-known/jwks.json` |

**Open items carried into Phase C:**
- Both users are in `FORCE_CHANGE_PASSWORD` — set permanent passwords before Phase F validation.
- **Group → scope translation is unresolved.** Membership in `ROLE_RM` / `ROLE_ANALYST` surfaces in the token's `cognito:groups` claim, but does **not** automatically put `afs:read` / `snowflake:read` scope strings in a user's access token. Decide in Phase C: (1) gateway authorizes off `cognito:groups`, or (2) add a Pre-Token-Generation Lambda that maps group → scopes. Nothing is broken; this is a deferred decision.

---

1. Confirm the AWS account + region, and that AgentCore, Neptune, and Cognito are all available there.
2. Create the **Cognito user pool**.
3. Define a **resource server + scopes**: `afs:read`, `snowflake:read`.
4. Create an **app client** that issues JWTs for those scopes.
5. Create the **two employees**:
   - **A — Relationship Manager:** scopes `afs:read` + `snowflake:read`.
   - **B — Credit Analyst:** scope `snowflake:read` only.

## B. Data sources reachable

**Snowflake access (prereq for 7–8) — ✅ established (2026-06-14):**
- Account `SPTNHMV-XF37990`, user `DEVIN.BODEN`, role `SECURITYADMIN`, warehouse `CREDIT_MEMO_WH`.
- `snow` CLI connection `mcpgateway` (config at `~/.snowflake/config.toml`).
- Auth = **RSA key-pair** (`authenticator = SNOWFLAKE_JWT`, private key `~/.snowflake/rsa_key.p8`) — MFA/password no longer required for CLI. Public key registered on the user via `ALTER USER … SET RSA_PUBLIC_KEY`.
- *Note:* the account login password is in this session's history and was briefly stored in config; rotate it when convenient. Key-pair auth does not depend on it.

**AFS source:** repo at `https://github.com/Devinboden/AFS-mcp-v2` (currently deployed on Vercel; plan is to re-host on AgentCore Runtime for private networking + native OBO/audit).

6. Confirm the **AFS MCP** is reachable as an **HTTPS endpoint** (existing deployment, or host on AgentCore Runtime). Record the URL. — ✅ DONE (2026-06-14, hosted on AgentCore Runtime)

   **Hosted on AgentCore Runtime via CodeBuild (Option 1).**
   - Source: `AFS-mcp-v2` (Next.js + mcp-handler). Adapted for AgentCore: shared handler factory `lib/afsMcpHandler.js` mounted at both `/api/mcp` (Vercel parity) and `/mcp` (AgentCore); `output: standalone`; `Dockerfile` (ARM64, **port 8000**, `AFS_FIXTURE_MODE=true`). Base image pulled from **ECR Public** (`public.ecr.aws/docker/library/node:24-slim`) to dodge Docker Hub rate limits.
   - Deployed with the `agentcore` starter toolkit → CodeBuild builds ARM64 image, pushes to ECR, creates the runtime. Config in `AFS-mcp-v2/.bedrock_agentcore.yaml`.
   - **Agent ARN:** `arn:aws:bedrock-agentcore:us-east-1:111204669101:runtime/afs_mcp-F82Tf5DI8Q`
   - **MCP endpoint:** `https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/<url-encoded-ARN>/invocations?qualifier=DEFAULT`
   - **Inbound auth:** Cognito JWT (customJWTAuthorizer; discoveryUrl = pool `us-east-1_Z1otWFj2I`, allowedClients = `7ktuvp7o0u0k21sn2rc0837g29`). Added a Cognito **domain** `mcpgateway-111204669101` to mint client-credentials tokens.
   - **Verified end-to-end:** client-credentials JWT → `initialize` (200, serverInfo `afs-mcp-v2`) → `tools/list` returns all **9 tools** (jobs_by_officer, portfolio_by_officer, reserve_obligation_number, create_workpackage, loan_summary, revolver_utilization, payment_history, afs_show_officer_loans, afs_show_summary).
   - **Gotchas hit & fixed:** (1) AgentCore MCP probes port **8000** not 8080; (2) Dockerfile `COPY public` failed — app has no `public/`; (3) Docker Hub 429 → use ECR Public base.
   - *Still fixture mode* — flip `AFS_FIXTURE_MODE=false` + set `AFS_USERNAME`/`AFS_PASSWORD` for live AFS Vision. Vercel deployment remains unchanged at `/api/mcp`.
7. Confirm/enable the **Snowflake managed MCP**; record its endpoint + auth method. — ✅ DONE (2026-06-14)

   - Managed MCP is **enabled**; `SHOW MCP SERVERS IN ACCOUNT` returns two:
     - **`PIEDMONT_MCP`** (`CREDIT_MEMO_DB.CREDIT_RISK`, owner SYSADMIN) — **the gateway target.** 6 credit tools: `find_obligor`, `list_facilities`, `get_risk_rating_trend`, `get_revolver_usage_trend`, `get_balance_trend`, `get_payment_history`. Tools are procedures running on `CREDIT_MEMO_WH` under the **caller's role**.
     - `CLAUDE_MCP_SERVER` (`CLAUDE_MCP_DB.MCP`) — generic `SYSTEM_EXECUTE_SQL` (arbitrary SQL). **Do not expose via the gateway** (ungoverned).
   - **Endpoint (PIEDMONT_MCP):** `https://SPTNHMV-XF37990.snowflakecomputing.com/api/v2/databases/CREDIT_MEMO_DB/schemas/CREDIT_RISK/mcp-servers/PIEDMONT_MCP`
   - **Auth:** Snowflake OAuth / key-pair JWT / PAT bearer. For the gateway this is the **PUR** path — service identity mapped to the employee's Snowflake role (`ROLE_RM` / `ROLE_ANALYST`), which makes the Step-8 masking apply per-employee automatically.
   - *Not yet done:* live HTTP reachability test against the endpoint (needs a bearer token; will happen when the gateway connects in Phase C, or can be curl-tested on request).
8. In **Snowflake**, create the two roles (`ROLE_RM`, `ROLE_ANALYST`) with differentiated data access, and create **aggregating views** (rolled-up financials per obligor — never the raw ~1.5B rows). — ✅ DONE (2026-06-14)

   **Built in `DEMO_CREDIT` (Enterprise edition confirmed):**
   - Source data discovered in `DEMO_CREDIT` schemas (AFS, CDL, CIF, NCO, GFS, DEP, DFP, EFS). Grain = `OBLIGOR_NUMBER` (1,000 obligors).
   - Roles `ROLE_RM`, `ROLE_ANALYST` created (mirror the Cognito groups); both granted to `DEVIN.BODEN` for testing.
   - Curated schema **`DEMO_CREDIT.GATEWAY`** with 3 aggregating views (one row per obligor):
     - `V_OBLIGOR_FINANCIAL_SUMMARY` — latest-statement financials + ratios (revenue, EBITDA, debt, debt/EBITDA, DSCR).
     - `V_OBLIGOR_EXPOSURE_SUMMARY` — latest as-of-date exposure rolled up (commitment, outstanding, balance, utilization).
     - `V_OBLIGOR_360` — spine + master + exposure + financials joined.
   - **Differentiation = column-level masking** (locked choice). Masking policy `mask_exposure` nulls the exposure-dollar columns (`total_commitment`, `total_outstanding`, `total_current_balance`, `total_accrued_interest`) for everyone except `ROLE_RM`/admins. Verified: RM sees dollars, Analyst sees `NULL`; both see ratios.
   - SQL scripts: `~/.snowflake/phaseB_core.sql`, `~/.snowflake/phaseB_masking.sql`.

## C. Gateway

> **🔄 ARCHITECTURE REVISION (2026-06-21) — see [architecture.md ADR-005](architecture.md#55-adr-005--snowflake-moved-out-of-the-gateway-boom-moved-in).**
> Snowflake was **removed from the gateway** (it's a governed MCP — reached **directly** for native per-user RBAC/masking). The gateway now fronts only the **custom/ungoverned** MCPs: **AFS** and **Boom** (`Noland-LAL/boom-mcp`, deployed to AgentCore Runtime like AFS). Steps 11–12's Snowflake-target work is **retired** (procedures/masking/grants kept for direct access; targets/PATs/`SVC_GATEWAY` deleted). KG → gateway (AFS, Boom) + KG → Snowflake directly.

**Infra-as-code:** JSON configs live in [`infra/gateway/`](../infra/gateway/) (trust-policy, role-permissions, authorizer-config, protocol-config). Built with raw `aws bedrock-agentcore-control` (file://-based JSON) rather than the starter toolkit, for explicit control + reproducibility.

9. Create the **AgentCore Gateway** with an **inbound authorizer = the Cognito pool** (validates the user JWT). — ✅ DONE (2026-06-15)

   - **Gateway IAM role:** `arn:aws:iam::111204669101:role/mcpgateway-gw-role` (trust = `bedrock-agentcore.amazonaws.com` scoped by SourceAccount + gateway ARN; perms = InvokeAgentRuntime on AFS, workload-identity/token-vault, logs).
   - **Gateway ARN:** `arn:aws:bedrock-agentcore:us-east-1:111204669101:gateway/mcpgateway-eerhmo8ymw` (id `mcpgateway-eerhmo8ymw`), status **READY**.
   - **Gateway MCP URL:** `https://mcpgateway-eerhmo8ymw.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp`
   - **Inbound auth:** `CUSTOM_JWT` → Cognito pool `us-east-1_Z1otWFj2I` (discoveryUrl `.well-known/openid-configuration`, allowedClients `7ktuvp7o0u0k21sn2rc0837g29`). Same pool/client as the AFS runtime, so user + machine tokens both validate.
   - **Protocol:** MCP with **`searchType: SEMANTIC`** (enables the gateway's semantic tool-search → satisfies E22).
   - **Authorization decision (resolves the Group-A open item):** per-target A/B authz will use the gateway's **Policy Engine (Cedar)** in step 13, authorizing directly off the `cognito:groups` claim — **no Pre-Token-Generation Lambda needed.** (Authorizer also supports `allowedScopes`/`customClaims` if we later want scope-based gating.)
> **⚠️ OBO finding + decision (2026-06-15) — revises locked decision #1 for AFS.**
> An MCP-protocol gateway only accepts **MCP-server targets**, which **do not support token pass-through**; and AgentCore OBO **token-exchange** requires an IdP that implements RFC 8693 / RFC 7523 — **Cognito does neither**. So **true per-user OBO to AFS is not achievable on this stack.** Decision (goals: keep it in AWS > have an audit trail > restrict access): use a **service identity outbound to AFS** and capture **per-employee audit at the gateway** instead of inside AFS.
> - **Authentication ≠ attribution.** AFS authenticates a *service* (the gateway); the *employee* identity is validated at the gateway inbound (Cognito JWT) and recorded in **gateway CloudWatch/CloudTrail logs** → that is the audit trail (replaces step-27 "AFS shows the human").
> - **Access restriction** (Employee B blocked from AFS) is enforced at the gateway via **Cedar/`cognito:groups`** (step 13), independent of OBO.
> - **Cognito is still required** — it is the inbound human-identity spine (who is calling → drives authz + audit). We just stop asking it to do the impossible token-exchange.

10. Add **target 1: AFS MCP** (MCP-server target). — ✅ DONE (2026-06-15)

    - **Outbound auth = OAuth client-credentials (service identity)** via AgentCore Identity OAuth2 credential provider **`afs-cognito-m2m`** (`arn:aws:bedrock-agentcore:us-east-1:111204669101:token-vault/default/oauth2credentialprovider/afs-cognito-m2m`) — Cognito app client `7ktuvp7o…`, `CLIENT_SECRET_BASIC`, scope `…/afs:read`. (Secret handled out-of-repo; never committed.)
    - **Target** `afs` (id `Q5ICZU7W8K`), type `mcp.mcpServer`, endpoint = AFS runtime invocation URL (url-encoded ARN, `?qualifier=DEFAULT`), **listingMode DEFAULT** (semantic search disabled on the gateway, so DEFAULT static sync is used). Status **READY**, `tools/list` synced via the M2M token.
    - Gateway role gained `secretsmanager:GetSecretValue` on `bedrock-agentcore-identity*` for the provider's stored secret.
11. Add **target 2: Snowflake managed MCP** (MCP-server target). — ⛔ BLOCKED (2026-06-15): data-layer mismatch.

    - **`PIEDMONT_MCP` = 6 stored procedures** in `CREDIT_MEMO_DB.CREDIT_RISK` (find_obligor, list_facilities, get_risk_rating_trend, get_revolver_usage_trend, get_balance_trend, get_payment_history) that read **raw `DEMO_CREDIT` source tables** (e.g. `DEMO_CREDIT.DEP.DEP_BAL_RECORD`, `DEMO_CREDIT.CIF.CIF_CSTMR_MSTR`).
    - **Three gaps that block differentiation:**
      1. **Access:** `ROLE_RM`/`ROLE_ANALYST` have grants only on `DEMO_CREDIT.GATEWAY` views + `CREDIT_MEMO_WH`; **no USAGE on `CREDIT_MEMO_DB`/`CREDIT_RISK`** → can't call the procedures.
      2. **Data layer:** Phase B masking is on the `DEMO_CREDIT.GATEWAY.V_OBLIGOR_*` **views**; the procedures read the **unmasked raw source tables** instead.
      3. **Rights model (decisive):** the procedures are **`EXECUTE AS OWNER`**, so masking evaluates `current_role()` as the *owner* (SYSADMIN), not the caller → **per-employee masking cannot differentiate through them** even if access + masking were added.
    - **Consequence:** targeting `PIEDMONT_MCP` as-is yields identical, fully-unmasked results for both employees (or errors before grants) — no demo differentiation.
    - **Decision (chosen): (a) rewrite the procedures.** Keeps the rich trend tools and makes differentiation real.
    - **DONE (2026-06-15) — procedures rewritten + verified.** Code in [`infra/snowflake/`](../infra/snowflake/): `01-grants.sql` (roles get identical read access to the 6 source objects + EXECUTE on the procs + USAGE on the MCP server), `02-rewrite-procedures.sql` (all 6 changed to **`EXECUTE AS CALLER`**; dollar/exposure fields wrapped in `CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE … END`). Baseline of the originals kept in `infra/snowflake/original/`.
    - Differentiation mechanism = **in-procedure role logic** (not a masking policy) because the procs return VARIANT/JSON, which masking policies can't cover. `EXECUTE AS CALLER` makes `CURRENT_ROLE()` resolve to the calling employee's role.
    - **Verified:** `get_balance_trend(847291)` → RM sees `start/end/min_balance, change` ($); Analyst sees only `pct_change`+`direction`. `get_risk_rating_trend` identical for both (no dollars). Masked tools: `list_facilities` (commitment), `get_revolver_usage_trend` (commitment/drawn/available), `get_balance_trend` ($ balances), `get_payment_history` (scheduled/paid $).
    - **DONE (2026-06-15) — Snowflake targets live.** `infra/snowflake/03-service-user.sql` (service user `SVC_GATEWAY` TYPE=SERVICE, both roles, network policy `NP_GATEWAY_ALLOW_ALL`) + `04-create-pats-and-providers.sh` (two role-restricted PATs `PAT_RM`/`PAT_ANALYST` → API-key providers `snowflake-pat-rm`/`snowflake-pat-analyst`, secret-safe). Two gateway targets created, both **READY** (tools synced): **`snowflake-rm`** (`AM7Z1QQZEM`, ROLE_RM PAT) and **`snowflake-analyst`** (`CQ0SEYLRUL`, ROLE_ANALYST PAT), same `PIEDMONT_MCP` endpoint, PAT presented as `Authorization: Bearer`.
    - **Topology note:** one Snowflake MCP → **two role-targets** (a gateway outbound credential is per-target, not per-user). Cedar (step 13) routes Employee A→`snowflake-rm`, Employee B→`snowflake-analyst`. Tools are namespaced per target (step 14).
12. Configure **AgentCore Identity** outbound credentials per target: — ✅ DONE (2026-06-15)
    - AFS → ~~OBO~~ **service identity (OAuth client-credentials)** — per-user audit at the gateway. ✅
    - Snowflake → **PUR via two role-targets** (PAT per role): `snowflake-rm` (ROLE_RM), `snowflake-analyst` (ROLE_ANALYST). Procedures rewritten `EXECUTE AS CALLER` so the PAT's role drives the in-proc masking. ✅
13. Configure **scope → target authorization**: A reaches both targets; B reaches Snowflake only.
14. Check **tool-name namespacing** (triple-underscore prefixes); preserve/alias names so agent references don't break.

## D. Knowledge graph (Neptune, virtual)

> **✅ D-1 DONE (2026-06-21) — KG-MCP server (`kg-mcp/`, separate Node project).** `kg_resolve`
> (name → cross-system keys, status-filtered) + `kg_hydrate` (fan out to confirmed-linked systems,
> join one obligor view). Crosswalk is a virtual seed (keys+relationships only) **behind an interface**
> so Neptune drops in for D-2. **Identity flows through the KG:** the employee token is forwarded to the
> gateway (Cedar A/B applies) and the `cognito:groups` is mapped to the Snowflake role (masking applies)
> — one identity, both paths. **Verified:** resolve Piedmont → hydrate joins Boom (gateway) + Snowflake
> (direct); RM sees Snowflake `$`, Analyst masked; AFS link `pending-review` (surfaced, not faked).
> Remaining: D-2 Neptune store · D-3 fuzzy matcher + review queue · D-4 deploy to Runtime + real
> per-employee Snowflake broker + make the KG Claude's single connector.

15. Provision the **Neptune cluster** (VPC, IAM auth).
16. Define the **ontology**: `Obligor → Facility/Loan → Account → FinancialPeriod`, with **link-status** on edges.
17. Build the **deterministic crosswalk loader**; seed it (anchor = nCino Account ID) and load Piedmont.
18. Build the **fuzzy matcher** (emits **candidates only**) + the **review queue** (human approve/reject → `human-confirmed`, promoted to a permanent crosswalk entry).
19. Build the **status-filtered query layer** (traverses **`confirmed-*` only**) with **virtual hydration** that calls down through the gateway at query time.
20. Build & deploy the **KG-MCP server** (exposes resolve + hydrate tools). It authenticates to the gateway with a service identity, passing through OBO on the AFS path.

## E. Agent wiring

21. Add the **KG as Claude Code's single remote connector** (gateway/KG URL + bearer token).
22. Tune **tool descriptions** / rely on the gateway's **semantic tool search** so the agent picks tools cleanly.

## F. Validate (end-to-end)

23. As **Employee A**: resolve Piedmont → hydrate AFS + Snowflake → confirm the cross-source join and full access.
24. As **Employee B**: confirm **blocked from AFS** and limited Snowflake data (role differentiation working).
25. Trigger the **fuzzy fallback**: a candidate lands in the review queue, stays out of results until approved, then joins.
26. Confirm **virtual** behavior: no data copied into the graph; fresh hydration; aggregating views used (no raw 1.5B scan).
27. Confirm **audit**: AFS shows the real user (OBO); document the Snowflake service-attribution asymmetry.

## G. Client & model layer (Cowork on Bedrock)

Goal: the human-facing surface is **Claude Cowork in the Claude Desktop app**, with **model inference served by Amazon Bedrock** (in-account, same account/region as the gateway) and **tools served by the AgentCore Gateway** from Group C. Model config and tools config are **separate concerns** — don't conflate them.

28. In the **Bedrock console** (same account + region as the gateway, `us-east-1`), **Request model access** for the target Claude model and create/choose an **inference profile**. Grant the desktop principal `bedrock:InvokeModel*`.
29. Install **Claude Desktop** (Windows x64) for each employee and sign in.
30. **Point inference at Bedrock:** Developer → *Configure third-party inference* → **Amazon Bedrock** → auth via the AWS profile (`~/.aws`) → set **Model ID + inference profile**. For fleet rollout, push this via **MDM** (Jamf / Intune / Group Policy) instead of per-machine.
31. **Add the AgentCore Gateway as an MCP connector** in Desktop (gateway/KG URL + **Employee A/B Cognito JWT** as bearer — reuse the pool `us-east-1_Z1otWFj2I` / client-credentials flow already stood up in B6). This is the *tools* path — distinct from the *model* config in step 30. **Do not** confuse the Bedrock "LLM gateway" (a model proxy) with the AgentCore Gateway (MCP/tools).
32. Drive the workflows from the **Cowork tab**. Bedrock-mode limits to note: **Chat tab, Computer Use, and Skills Marketplace are disabled** (they need Anthropic-hosted inference); `/desktop` CLI handoff is unavailable on Bedrock.
33. **(FINAL STEP — test only) Wire this Claude Code CLI into Bedrock.** `CLAUDE_CODE_USE_BEDROCK=1`, `AWS_REGION=us-east-1`, `ANTHROPIC_MODEL`=inference-profile id. **Cost rationale:** all build work in Groups A–F (and the Cowork wiring) is done on the **Claude Pro subscription** (included/"free" tokens). Flipping this CLI to Bedrock makes inference consume **paid Bedrock tokens**, so it is deliberately the **last action** and **test-only** — used to prove the end-to-end Bedrock inference path works, then reverted. Do **not** run the build on Bedrock.

### Network posture (how "internal" this is)
With Group G in place, all three outbound data paths stay under your control:
- **Model inference** → only your configured **Bedrock region(s)** (in-account; can be VPC-private via PrivateLink).
- **Tools / data (MCP)** → only the **AgentCore Gateway** and its approved targets (Cognito-JWT gated; AFS via OBO, Snowflake via PUR).
- **To Anthropic** → only **aggregate telemetry** (token counts, model ID, error codes). No prompts, data, or tool payloads.

Caveat — *not fully air-gapped*: the **Desktop app runs on the user's laptop** (Cowork reads/writes **local files**), and the aggregate telemetry above still leaves. "Internal" here means *the data plane stays inside your AWS boundary*, not *zero egress*. For headless/VPC-only with zero local surface, host the agent on **AgentCore Runtime** instead — but that drops the Cowork UX and weakens AFS OBO attribution (no human in the loop).
