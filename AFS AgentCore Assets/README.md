# AFS MCP v2

A Model Context Protocol (MCP) server for **AFS Vision**, built on **Next.js + [`mcp-handler`](https://www.npmjs.com/package/mcp-handler)** and deployable to **Vercel**. JavaScript, no build step beyond Next.

> 📐 **Design:** [`docs/mcp-wireframe.md`](docs/mcp-wireframe.md) — the full target tool/resource surface for the AFS Vision MCP, now that the API is mapped (see [`api-discovery/`](api-discovery/)). The tools below are the implemented subset.

It exposes five tools across two areas:

| Tool | Area | What it does |
| --- | --- | --- |
| `jobs_by_officer` | Workflow | A loan officer's in-flight workpackages — origination / post-approval (`/jobs/listByOfficers`). |
| `portfolio_by_officer` | Workflow | A loan officer's **booked** servicing loans, bridged: workpackage obligors → `financialInstrument/listAllByObligor`. |
| `reserve_obligation_number` | Workflow | Reserve a new obligation number (`POST /reserveNumber`, reserveType 2). |
| `loan_summary` | Servicing | Borrower + facilities + terms/maturity/commitment + outstanding + collateral + guaranties. |
| `revolver_utilization` | Servicing | Commitment / Amount Takendown / Unused from the balances codes → drawn ÷ commitment. |
| `payment_history` | Servicing | Days/times past due, returned checks, aging buckets, late events (auto-widens window). |

> **Officer entry points, two sides:** `jobs_by_officer` = work in flight (origination/post-approval, may not be booked). `portfolio_by_officer` = booked loans of record. Servicing has no direct "obligations by officer" call, so the portfolio is reached by bridging through the officer's obligors.

## Servicing source map

```
loan_summary         obligors/get + exposure/listObligor + obligations/getFullKey
                     + balances/listFullKey + collateral/list + supportReferences
revolver_utilization financialHistory/effectiveFrom/{obligationId}  → funded ÷ commitment
payment_history      currentObligations/getFullKey + obligations/getFullKey + financialHistory
```

## Layout

```
app/
  api/[transport]/route.js   MCP endpoint (createMcpHandler) → POST /api/mcp
  page.jsx / layout.jsx      Landing page: mode, endpoint, tool catalog, source map
lib/
  config.js                  Env config + live-mode credential guard
  afsClient.js               AFS HTTP client (basic auth, Afs-* headers, envelope/messages)
  fixtures.js                fixtureKey → bundled-loan response resolver
  format.js                  pick / money / toolResult / date helpers
tools/
  index.js                   Registers all tools + TOOL_CATALOG
  jobsByOfficer.js  reserveObligationNumber.js
  loanSummary.js    revolverUtilization.js   paymentHistory.js
fixtures/
  enrichedLoan.js            One fully-enriched sample loan (envelope-shaped)
```

## Running locally

```bash
cp .env.example .env.local      # fill in creds, or set AFS_FIXTURE_MODE=true
npm install
npm run dev                      # http://localhost:3000  (MCP at /api/mcp)
```

### Run modes

- **Live (default):** calls AFS Vision over HTTP. Requires `AFS_USERNAME` + `AFS_PASSWORD`
  (and `AFS_BASE_URL` if not the default host). Missing creds produce a clear error.
- **Fixture:** set `AFS_FIXTURE_MODE=true` to serve the bundled sample loan
  (John's Lights and Fixtures, a $5MM revolver at 64% utilization) with no credentials —
  useful for demos and wiring up clients.

## Auth & headers

Every AFS call uses HTTP Basic auth and sends `Afs-AppChannel` + a unique `Afs-tranXref`
(echoed back, surfaced in tool metadata for tracing). Business-level errors returned in the
`messages[]` envelope are raised as tool errors even on HTTP 200.

## Deploy to Vercel

1. Push this folder to a Git repo and import it in Vercel (auto-detects Next.js).
2. Set environment variables: `AFS_BASE_URL`, `AFS_USERNAME`, `AFS_PASSWORD`, `AFS_APP_CHANNEL`.
   (Optional: `REDIS_URL` to enable the SSE transport at `/api/sse`.)
3. The MCP endpoint is `https://<your-app>.vercel.app/api/mcp`.

## Connecting a client

Point any MCP client at the streamable-HTTP endpoint:

```json
{
  "mcpServers": {
    "afs": { "url": "https://<your-app>.vercel.app/api/mcp" }
  }
}
```
