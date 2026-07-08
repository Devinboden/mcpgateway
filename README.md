# mcpgateway

An AgentCore **MCP Gateway** fronting **custom MCP servers (AFS, Boom)**, with **Snowflake reached directly** as an already-governed MCP, a **virtual knowledge-graph semantic layer on top**, and **two employees with differentiated permissions**, all consumed by **Claude Code / Cowork as a single endpoint**.

> Why this shape: a gateway in front of one server is theater; two (one managed, one custom) justify it and give real breadth of testing. The knowledge graph on top turns "two MCPs behind a gateway" into a unified, governed data layer.

## Topology

See **[`planning/topology.html`](planning/topology.html)** for the diagram, and
**[`planning/architecture.md`](planning/architecture.md)** for the authoritative
as-built architecture + decision record. In short:

```
Claude Code  →  Knowledge-Graph layer ─┬─ AgentCore Gateway ─┬─ AFS MCP (custom)   — service identity (M2M); audit at gateway
 (one connector)   (keys, not data)     │  inbound: Cognito JWT └─ Boom MCP (custom) — service identity (M2M)
                                        │  authZ: Cedar ← groups
                                        └─ Snowflake managed MCP (DIRECT) — native user identity + RBAC/masking
```

The gateway fronts the **custom / ungoverned** MCPs (AFS, Boom). **Snowflake is reached directly** — it is already a governed MCP, so it keeps native per-user identity + RBAC/column-masking instead of collapsing to a gateway service identity (see [architecture.md ADR-005](planning/architecture.md)).

The knowledge graph is a **client of the gateway** (server to the agent, client to the gateway). nCino/Salesforce is the **identity spine** for entity resolution.

> **Audit & observability:** the KG mints one **`traceId` per request** and threads it through every
> hop (KG → gateway → AFS/Boom, KG → Snowflake direct), emitting **structured JSON audit events**
> (auth, tool call, each downstream call with latency + allow/deny). The id is echoed as
> `X-Trace-Id`/`_trace` and set as Snowflake's `QUERY_TAG`, so one id stitches the KG log to
> Snowflake's own query history. See [architecture.md §6.1](planning/architecture.md#61-correlation-ids--structured-audit-logging-kg).

> **Enterprise-grade readiness:** a standing audit of *what is vs. isn't enterprise/regulated-grade*
> (architecture is enterprise-shaped; gaps are operational posture — root account, public endpoints,
> credential handling) lives in [architecture.md §11](planning/architecture.md#11-enterprise-grade-readiness-audit-2026-06-21).

> **Auth reality (see [architecture.md](planning/architecture.md) §5):** the original
> plan called for **OBO** to AFS, but AgentCore Gateway MCP targets don't support token
> pass-through and Cognito can't do OAuth token-exchange — so **true OBO is not achievable
> on this stack.** Both targets use a **service identity** outbound; per-employee identity
> is validated and **audited at the gateway**, and access is restricted there via Cedar.
> Authentication and attribution are deliberately decoupled.

## Locked decisions

1. **Identity — ~~mixed, per-target~~ → service identity per-target (REVISED, see [ADR-001](planning/architecture.md#51-adr-001--afs-uses-a-service-identity-not-obo)).** Originally OBO for **AFS** + PUR for **Snowflake**. Implementation finding: OBO is **not achievable** (MCP targets reject token pass-through; Cognito can't do token-exchange). Both targets now use a **service identity** outbound (AFS: Cognito M2M; Snowflake: PAT per role). The inbound user JWT is still always validated at the gateway, so **per-employee access is enforced centrally** (Cedar) and **audited at the gateway** regardless of target. Humans live in **Cognito**, never IAM users.
2. **Entity resolution — deterministic + human-gated fuzzy.** Deterministic crosswalk anchored on the **nCino Account ID** (spine). Fuzzy matching is a fallback that **only proposes candidates** into a review queue; nothing fuzzy joins a credit query until a human confirms. Link status: `confirmed-deterministic` / `pending-review` / `human-confirmed` / `rejected` — only `confirmed-*` participates.
3. **Graph shape — virtual.** The graph holds **keys + relationships, not data**. Attributes hydrate on demand through the gateway. At ~1.5B Snowflake rows, any materialization lives **in Snowflake** (aggregating views), never in the graph.
4. **Graph store — DynamoDB now, Neptune later (REVISED, [ADR-007](planning/architecture.md#57-adr-007--crosswalk--review-queue-persist-in-dynamodb-neptune-deferred-for-cost)).** The crosswalk + review queue persist in **DynamoDB** (`kg-crosswalk`, pay-per-request, scale-to-zero, no VPC) behind the `Crosswalk` interface. **Neptune (D-2) is deferred for cost** (VPC-only, standing charge) and slots in unchanged when multi-hop graph traversal (e.g. guarantor relationships) is actually needed.
5. **Snowflake — service-role-per-employee** (differentiated downstream data per person).
6. **Demo permission split (placeholder):** Employee A = Relationship Manager (`afs:read` + `snowflake:read`, role `ROLE_RM`); Employee B = Credit Analyst (`snowflake:read` only, role `ROLE_ANALYST`, blocked from AFS).

## What to build

See **[`planning/plan.md`](planning/plan.md)** for the concrete, ordered step list.

## Known gotchas

- **Tool-name namespacing** — the gateway prefixes tools per target (triple-underscore); preserve/alias names or update agent references.
- **OBO wall is universal here (RESOLVED → service identity)** — MCP-protocol gateway targets don't support token pass-through, and Cognito implements neither RFC 8693 (token-exchange) nor RFC 7523 (JWT-bearer), so OBO can't flow the user claim to **either** target — not just the managed Snowflake one. Resolution: service identity outbound + audit at the gateway. See [ADR-001](planning/architecture.md#51-adr-001--afs-uses-a-service-identity-not-obo).
- **Audit asymmetry (intentional)** — the gateway is the single source of *employee → tool → time*; AFS sees a service, Snowflake sees a role. Documented, accepted. See [architecture.md §6](planning/architecture.md#6-audit-model).
- **Cognito group ≠ scope (RESOLVED)** — authorize off `cognito:groups` directly via the gateway's **Cedar policy engine**; no Pre-Token-Generation Lambda needed. See [architecture.md §4](planning/architecture.md#4-inbound-authorization-gateway).
- **Semantic search vs. dynamic discovery** — can't have both; semantic search is disabled so live MCP discovery + client-credentials/PAT providers work. See [ADR-002](planning/architecture.md#53-adr-002--semantic-search-disabled).
