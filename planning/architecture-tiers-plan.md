# Credit-Intelligence Platform — Interactive Architecture Plan (Enhanced)

> Blueprint for a **3-page click-through HTML** that walks a viewer from what exists today, to the
> full proof-of-concept, to a production-hardened deployment. Each page is a layered diagram whose
> boxes are **clickable** and expand to show specifics **and a short "why we chose this" narrative**.
> This plan is the content source; the HTML is generated from it.

---

## 0. Interaction & design model (how the HTML behaves)

- **Three tabs across the top:** `Current` · `Interim (Full POC)` · `Production`. A short one-line
  thesis under each tab explains what that tier is *for*.
- **Layered diagram per tab** — five horizontal bands, top to bottom:
  1. **Clients** (who talks to it)
  2. **Front door** (the KG semantic layer)
  3. **Gateway** (AgentCore Gateway — the governed multiplexer)
  4. **Tools / MCPs** (custom + managed connectors)
  5. **Data & stores** (Snowflake, Neptune/DynamoDB, secrets)
  - Plus two **vertical rails** spanning the bands: **Identity/Auth** (left) and **Governance &
    Observability** (right), because those cut across every layer.
- **Clickable boxes** → open a **detail drawer** (right-side panel) with three sections:
  `What it is` · `Specifics` (bullet facts, exact AWS service names) · `Why this decision`
  (1–3 sentence narrative). Esc / click-away closes.
- **Badges on boxes:** `NEW` (introduced at this tier), `CHANGED` (evolves from the prior tier),
  `MANAGED` (managed connector) vs `CUSTOM` (our code), `PUBLIC`/`PRIVATE` (network exposure).
- **Tier-delta strip** at the bottom of each page: "What changed from the previous tier" — 3–5
  bullets so the evolution reads as a story, not three unrelated pictures.
- **Legend** (persistent): color/badge key, and a data-flow arrow key.
- **Governance highlight toggle:** a control that dims everything except the governance path
  (Cognito → Cedar → masking → audit → OBO) so the security story pops.
- Self-contained: inline CSS/JS, no external calls, works offline, mobile-responsive.

**Value-adds beyond the ask (baked in):**
- A **request-flow animation/trace** ("Resolve → Hydrate → Render") that highlights the path across
  boxes for one representative question.
- **Migration triggers** between tiers (the event that forces the next tier — e.g., "first real
  customer PII" → Production).
- **Personas** (RM vs Analyst) shown as a small chip that, when toggled, annotates which boxes each
  role can reach.
- **Cost & ops** note per tier (what you pay/operate for).
- **Risk ledger** per tier (top 3 residual risks), so it's honest, not a glossy pitch.

---

## 1. CURRENT — as-built (public, App Runner, DynamoDB)

**Thesis:** the working demo — a governed semantic layer proving natural-language → cross-system
credit intelligence, optimized for iteration speed.

### Clients (band 1)
- **Cowork / Claude Desktop** — connects to the KG via OAuth; renders MCP-App widgets.
  *Why:* fastest path to a Claude UI with widget rendering; no app to build.
- **Custom webapp (`kg-agent-app`)** — thin UI on the Claude Agent SDK; Bedrock inference; identity
  injection via a role dropdown. *Why:* a self-hosted Cowork alternative we fully control.
- **Bedrock (test only)** — final, test-only inference path. *Why:* build on Pro tokens; Bedrock is
  the last-mile validation, not the daily driver.

### Front door (band 2)
- **KG MCP — AWS App Runner** `[PUBLIC]` — the single door; ~7 tools (`kg_search`, `kg_call`,
  `kg_resolve`, `kg_hydrate`, + `kg_show_cards/table/chart`). Validates the Cognito JWT (jose+JWKS),
  advertises OAuth discovery, forwards the token downstream, **serves its own MCP-App widgets**.
  *Why App Runner:* it must be a directly-connectable standard HTTPS/OAuth endpoint *and* serve
  widget resources — an AgentCore Runtime endpoint is neither. *Why front-of-gateway:* exposes ~7
  tools while hiding dozens downstream behind `kg_search`/`kg_call`.

### Gateway (band 3)
- **AgentCore Gateway** `[internal]` — MCP multiplexer + **Cedar** policy engine; prefixes tool
  names; DYNAMIC `tools/list`. Only the KG talks to it. *Why:* one governed choke point for tool
  authorization; Cedar gives declarative permit/forbid by role.
- **Known limit callout:** refuses `resources/read` → widgets are served by the KG, not the gateway.

### Tools / MCPs (band 4)
- **AFS MCP — AgentCore Runtime** `[CUSTOM]` — 24 tools, live AFS Vision (HTTP Basic); MCP-App
  widgets. *Why Runtime:* managed, isolated container behind the gateway.
- **Boom MCP — AgentCore Runtime** `[CUSTOM]` — 9 tools (financial spreads/ratios).

### Data & stores (band 5)
- **Snowflake — direct (SQL API)** `[PUBLIC]` — `CREDIT_MEMO_DB.CREDIT_RISK`, 6 procs; per-employee
  PAT → **native row/col masking**. *Why direct, not via gateway:* preserves masking on the
  employee's own credential; the gateway would flatten identity.
- **DynamoDB — identity crosswalk** — nCino spine → {AFS, Snowflake, Boom} keys + link status.
  *Why DynamoDB:* durable, exact-key, low-ops reference data.

### Identity/Auth rail
- **Amazon Cognito** — user pool; `cognito:groups` (ROLE_RM/ROLE_ANALYST) is the role truth.
- **Token forwarding** — KG forwards the employee JWT downstream. *Honest caveat:* the gateway
  authorizes the *user*, not the *path* → a JWT holder could reach the gateway directly (confused
  deputy). Named here; fixed in Production.

### Governance & Observability rail
- **Cedar** (execution-time authz) · **Snowflake masking** (data-time) · **`kg_search` role filter**
  (discovery-time, defense-in-depth, not a boundary) · **structured audit** (traceId, per call).

### Tier-delta & risk
- **Residual risks:** public networking; confused-deputy token forwarding; masking only on Snowflake.
- **Migration trigger → Interim:** need for more data sources + a real graph + private networking.

---

## 2. INTERIM — Full POC (VPC, all-MCPs-behind-gateway incl. managed, Neptune KG)

**Thesis:** the complete proof-of-concept — **private by default in a VPC** (managed SaaS connectors
egress out, by documented exception), every data source (custom *and* third-party) unified behind the
one governed gateway, and a real graph brain.

### Clients (band 1) — unchanged
- Cowork / webapp / Bedrock, now reaching a **private** ingress.

### Front door (band 2)
- **KG semantic layer — ECS Fargate in VPC** `[CHANGED]` `[PRIVATE]` — same ~7-tool surface, now on
  Fargate in private subnets (not App Runner). *Why:* control the network placement; step toward
  enterprise. Widgets optionally served from **S3 + CloudFront** to decouple UI from the service.
- **Amazon Neptune — KG graph store** `[NEW]` `[CHANGED from DynamoDB]` — the crosswalk becomes a
  real **graph**: obligors, entities, facilities, and their relationships across systems, with
  traversal (e.g., "show all obligors sharing a guarantor"). *Why Neptune:* relationships and
  multi-hop questions are first-class; exact-key lookups still fine; sets up entity-resolution and
  link-provenance the demo's flat crosswalk can't express.

### Gateway (band 3)
- **AgentCore Gateway — in VPC** `[CHANGED]` — now the aggregation point for **all five** MCPs
  (custom + managed). *Why:* one governance/discovery surface across every source, third-party
  included. Managed connectors inherit the same Cedar authorization + `tools/list` discovery.

### Tools / MCPs (band 4) — the big expansion
- **AFS MCP — AgentCore Runtime (VPC)** `[CUSTOM]`
- **Boom MCP — AgentCore Runtime (VPC)** `[CUSTOM]`
- **Salesforce — managed connector** `[NEW]` `[MANAGED]` — CRM: relationship, pipeline, contacts.
  *Why:* the RM's book of business in the same governed surface. AgentCore ships a native "Salesforce
  Lightning Platform" template. **Caveat:** Console-only to configure and egresses to public SaaS — a
  documented exception to "all private."
- **S&P Capital IQ (CapIQ) — managed MCP** `[NEW]` `[MANAGED]` — company financials, comparables,
  market data via S&P's managed MCP server, fronted by the gateway as an MCP target. *Why:*
  authoritative external financials with no MCP for us to build/maintain.
- **IBIS World — managed MCP** `[NEW]` `[MANAGED]` — industry research/benchmarks via IBIS World's
  managed MCP server. *Why:* industry & sector risk context with zero MCP maintenance.
- **Snowflake — managed MCP** `[CHANGED]` `[MANAGED]` — moves from *direct SQL* to a managed
  Snowflake MCP behind the gateway (over PrivateLink). *Why:* brings Snowflake under the same governed
  gateway. **Trade-off:** native masking now depends on the MCP carrying the employee's identity
  (per-user credential now, OBO in Production) rather than a shared service account — verify this.
- *Managed MCPs attach as gateway MCP-passthrough targets; only AFS & Boom remain custom. (Salesforce
  is one of ~16 native managed templates; CapIQ, IBIS and Snowflake are vendor-provided managed MCP
  servers the gateway fronts.)*

### Data & stores (band 5)
- **Snowflake — managed MCP (via PrivateLink)** `[CHANGED]` `[MANAGED]` `[PRIVATE]` — now a gateway
  MCP target, not a direct SQL call; masking preserved only if the MCP carries per-user identity.
- **Neptune** (above) replaces DynamoDB as the KG store.
- **Secrets Manager** — all downstream creds (AFS Basic, connector API keys, Snowflake) centralized.

### Identity/Auth rail
- **Cognito**, light (demo-grade) — role signal intact; heavy OBO deferred to Production. *Why:* keep
  the POC's auth simple so the focus is the data/graph/connector story.

### Governance & Observability rail
- Cedar (now spanning managed connectors too) · masking · **VPC Flow Logs + CloudTrail + CloudWatch**
  · structured audit with trace propagation.

### Tier-delta & risk
- **Changed from Current:** into a VPC; DynamoDB → Neptune; +Salesforce (managed) + CapIQ/IBIS (OpenAPI targets) behind the gateway;
  Snowflake via PrivateLink; KG on Fargate.
- **Residual risks:** auth still light (no OBO); masking still Snowflake-only; single-region.
- **Migration trigger → Production:** first real customer PII / first non-demo user / audit review.

---

## 3. PRODUCTION — hardened (auth-heavy, OBO, exposed-endpoint control, rotation, Neptune)

**Thesis:** what passes a bank's security & architecture review — private by default, path-attested
identity, rotated secrets, governed on every leg, resilient, and fully audited.

### Clients (band 1)
- Same clients, but reaching a **hardened, WAF-fronted ingress** only.

### Ingress / exposed endpoints (new emphasis)
- **Exposed-endpoint control** `[NEW]` — the *only* public surface is a **WAF → ALB / API Gateway**
  in front of the KG; everything else is private. Diagram explicitly labels **what is exposed vs
  private**. *Why:* minimize and harden the attack surface; make exposure auditable.

### Front door (band 2)
- **KG semantic layer — ECS Fargate (multi-AZ, VPC)** `[CHANGED]` — ≥2 AZ, autoscaled; no public path.
- **Neptune (multi-AZ)** — KG store with backups/PITR + link provenance.

### Gateway (band 3)
- **AgentCore Gateway — locked to the KG's client id** `[CHANGED]` — accepts *only* the KG's workload
  identity. *Why:* makes the "single front door" a real boundary, not a convention.

### Tools / MCPs (band 4)
- AFS, Boom (custom, VPC) + Salesforce (managed) + CapIQ/IBIS (OpenAPI targets) — all with **per-actor
  attribution** for any writes.

### Data & stores (band 5)
- Snowflake (PrivateLink) · Neptune (multi-AZ) · **KMS/CMK encryption** everywhere.

### Identity/Auth rail — the heavy tier
- **Real SSO** — Cognito hosted UI / bank IdP; the webapp forwards the *user's* token (no server-side
  impersonation). *Why:* real identity, kills the impersonation primitive.
- **OBO / token exchange via AgentCore Identity** `[NEW]` — the KG exchanges the user token for a
  delegation token (**actor = KG, subject = employee**); the gateway validates the actor; Cedar still
  reads the subject's role. *Why:* closes the confused-deputy gap — path attestation, not just user
  auth. *(Open item: confirm the OBO token preserves `cognito:groups` for Cedar.)*
- **Secrets rotation** `[NEW]` — Secrets Manager automatic rotation; **no plaintext creds**; connector
  keys + AFS creds fetched at request time. *Why:* limits credential blast radius.

### Governance & Observability rail
- Cedar **default-deny + CI-manifest-driven** (no hand-maintained write list) · **masking/field
  governance on ALL legs** (AFS/Boom/connectors, not just Snowflake) · **immutable/WORM audit +
  retention** · **Bedrock invocation logging** · GuardDuty / Config / CloudTrail.

### Resilience
- Multi-AZ, defined **DR (RTO/RPO)**, Neptune PITR, WAF + rate limiting.

### Tier-delta & risk
- **Changed from Interim:** OBO + gateway client-lockdown; real SSO; secrets rotation; masking on all
  legs; WORM audit; multi-AZ/DR; KMS; explicit exposed-vs-private labeling.
- **Residual (honest):** third-party connector data-residency review; ongoing Cedar policy change
  control; cost of always-on multi-AZ.

---

## 4. Cross-tier comparison (feeds the delta strip + a summary table)

| Concern | Current | Interim | Production |
|---|---|---|---|
| Networking | Public | VPC (private subnets) | VPC + PrivateLink, WAF ingress |
| KG compute | App Runner | ECS Fargate (VPC) | ECS Fargate (multi-AZ) |
| KG store | DynamoDB crosswalk | **Neptune graph** | Neptune (multi-AZ, PITR) |
| Data sources | AFS, Boom (custom); Snowflake direct | + Salesforce, CapIQ, IBIS, Snowflake as managed MCPs | same, all governed |
| Snowflake access | direct SQL (per-user PAT) | managed MCP behind gateway | managed MCP; masking via OBO |
| MCP topology | 2 custom behind gateway | all 5 behind gateway | all 5, gateway locked to KG |
| Auth | token forwarding | light (demo) | SSO + **OBO/token exchange** |
| Secrets | Secrets Mgr (some plaintext env) | Secrets Mgr centralized | rotation, no plaintext |
| Masking | Snowflake only | Snowflake only | all legs |
| Audit | structured (KG) | + VPC/CloudTrail | immutable/WORM + Bedrock logging |
| Resilience | single instance | single region | multi-AZ + DR |

---

## 5. Build notes for the HTML
- One HTML file, three `<section>` tabs; a small JS router; a reusable "box" component and a "drawer"
  component fed by a JS data object (so content = the sections above, encoded as data).
- Encode each box as `{ id, band, title, badges[], what, specifics[], why }`; render bands as CSS
  grid; drawer reads the clicked box's object.
- Color system: brand-neutral, professional (slate + one accent); managed vs custom via badge, not
  color, for clarity. Governance rail in a distinct accent so the security story is legible.
- Accessibility: keyboard-navigable boxes, focus states, drawer closes on Esc.
