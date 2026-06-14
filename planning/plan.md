# Build plan — ordered steps

Concrete steps to stand up the end-to-end system. Do them in order; groups are mostly sequential (A→F), with B able to run alongside A.

---

## A. Identity & accounts (Cognito)

1. Confirm the AWS account + region, and that AgentCore, Neptune, and Cognito are all available there.
2. Create the **Cognito user pool**.
3. Define a **resource server + scopes**: `afs:read`, `snowflake:read`.
4. Create an **app client** that issues JWTs for those scopes.
5. Create the **two employees**:
   - **A — Relationship Manager:** scopes `afs:read` + `snowflake:read`.
   - **B — Credit Analyst:** scope `snowflake:read` only.

## B. Data sources reachable

6. Confirm the **AFS MCP** is reachable as an **HTTPS endpoint** (existing deployment, or host on AgentCore Runtime). Record the URL.
7. Confirm/enable the **Snowflake managed MCP**; record its endpoint + auth method.
8. In **Snowflake**, create the two roles (`ROLE_RM`, `ROLE_ANALYST`) with differentiated data access, and create **aggregating views** (rolled-up financials per obligor — never the raw ~1.5B rows).

## C. Gateway

9. Create the **AgentCore Gateway** with an **inbound authorizer = the Cognito pool** (validates the user JWT).
10. Add **target 1: AFS MCP** (MCP-server target).
11. Add **target 2: Snowflake managed MCP** (MCP-server target).
12. Configure **AgentCore Identity** outbound credentials per target:
    - AFS → **OBO** (forward/exchange the user token).
    - Snowflake → **PUR**, mapping each employee to their Snowflake role (`ROLE_RM` / `ROLE_ANALYST`).
13. Configure **scope → target authorization**: A reaches both targets; B reaches Snowflake only.
14. Check **tool-name namespacing** (triple-underscore prefixes); preserve/alias names so agent references don't break.

## D. Knowledge graph (Neptune, virtual)

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
