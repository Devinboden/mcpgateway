# mcpgateway

An AgentCore **MCP Gateway** fronting two MCP servers — one **custom (AFS)**, one **managed (Snowflake)** — with a **virtual knowledge-graph semantic layer on top** and **two employees with differentiated permissions**, all consumed by **Claude Code as a single endpoint**.

> Why this shape: a gateway in front of one server is theater; two (one managed, one custom) justify it and give real breadth of testing. The knowledge graph on top turns "two MCPs behind a gateway" into a unified, governed data layer.

## Topology

See **[`planning/topology.html`](planning/topology.html)** for the diagram. In short:

```
Claude Code  →  Knowledge-Graph layer  →  AgentCore Gateway  →  ┬─ AFS MCP (custom)        — OBO: user identity
 (one connector)   (keys, not data)        (single endpoint)    └─ Snowflake managed MCP  — PUR: service identity
```

The knowledge graph is a **client of the gateway** (server to the agent, client to the gateway). nCino/Salesforce is the **identity spine** for entity resolution.

## Locked decisions

1. **Identity — mixed, per-target.** OBO (on-behalf-of, forwards the user) for **AFS**; PUR (privileged service identity) for **Snowflake managed**. The inbound user JWT is always validated at the gateway, so per-employee access is enforced centrally regardless of target. Humans live in **Cognito**, never IAM users.
2. **Entity resolution — deterministic + human-gated fuzzy.** Deterministic crosswalk anchored on the **nCino Account ID** (spine). Fuzzy matching is a fallback that **only proposes candidates** into a review queue; nothing fuzzy joins a credit query until a human confirms. Link status: `confirmed-deterministic` / `pending-review` / `human-confirmed` / `rejected` — only `confirmed-*` participates.
3. **Graph shape — virtual.** The graph holds **keys + relationships, not data**. Attributes hydrate on demand through the gateway. At ~1.5B Snowflake rows, any materialization lives **in Snowflake** (aggregating views), never in the graph.
4. **Graph store — Amazon Neptune** (AWS-native, slots into the stack directly).
5. **Snowflake — service-role-per-employee** (differentiated downstream data per person).
6. **Demo permission split (placeholder):** Employee A = Relationship Manager (`afs:read` + `snowflake:read`, role `ROLE_RM`); Employee B = Credit Analyst (`snowflake:read` only, role `ROLE_ANALYST`, blocked from AFS).

## What to build

See **[`planning/plan.md`](planning/plan.md)** for the concrete, ordered step list.

## Known gotchas

- **Tool-name namespacing** — the gateway prefixes tools per target (triple-underscore); preserve/alias names or update agent references.
- **OBO claim pass-through** — must actually flow the user claim to AFS or attribution collapses to a service principal.
- **Managed-MCP OBO wall** — Snowflake managed MCP may not honor a delegated token (the reason it's PUR).
- **Audit asymmetry** — AFS calls carry the human; Snowflake calls carry the service identity. Documented, accepted.
