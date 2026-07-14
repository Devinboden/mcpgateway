# AFS Vision — call mechanics (how to actually invoke the APIs)

Reverse-engineered from the live-verified `afs-mcp-v2` client + legacy Python client.
This is the layer the OpenAPI specs leave implicit. Cited to source.

## URL assembly

```
{baseUrl}/{resource}/{service}/{key}?{query}
```
- `baseUrl` for this sandbox = `https://dd3.afsvision.us/webx/api/v1`
- `{resource}` = the path from the API table (e.g. `obligations`, `balances`, `obligors`).
- **`{service}` = the "Service Name" column in Pattern Admin** — it's literally the URL
  path segment: `get`, `getFullKey`, `list`, `listFullKey`, `listObligor`,
  `listByNameId`, `effectiveFrom`, etc.
- `{key}` = composite key (see below), positional, hyphen-joined.
- Source: `afs-mcp-v2/lib/afsClient.js:32-38`, `tools/loanSummary.js:41-52`

So a pattern maps to a real URL:
`_obligationDetails` (service `getFullKey`) → `GET /obligations/getFullKey/{bank}-{obligor}-{obligation}`
optionally `?pattern=_obligationDetails` to apply the field projection.

## Composite key formats

| Key shape | Pattern | Used by (service) |
|-----------|---------|-------------------|
| 2-part | `{bank}-{obligor}` | `/obligors/get`, `/collateral/list`, `/exposure/listObligor` |
| 3-part | `{bank}-{obligor}-{obligation}` | `/obligations/getFullKey`, `/balances/listFullKey`, `/currentObligations/getFullKey` |
| 5-part | `{bank}-{supObligor}-{supCollItem}-{obligor}-{application}` | `/supportReferences/list` |
| obligationId (single int) | distinct numeric id from `obligations/getFullKey` response | `/financialHistory/effectiveFrom/{obligationId}` |

## Auth + required headers (every call)

- `Authorization: Basic base64(user:pass)`
- `Afs-AppChannel`: app channel id, **max 24 chars** (e.g. `AFS-MCP`)
- `Afs-tranXref`: **UUID, unique per request** (echoed back on response)
- `Content-Type: application/json`, `Accept: application/json`
- `User-Agent`: **browser UA required** — dd3 is behind Cloudflare and blocks
  default lib agents (HTTP 403 / error 1010). Already handled in our probe scripts.
- Source: `afs-mcp-v2/lib/afsClient.js:17-30`; Cloudflare quirk confirmed by our own
  `fetch_specs.py` 403→200 fix.

## Response envelope + error semantics (important for MCP tools)

- Body shape: `{ "<resource>": <payload>, "messages": [ {severity, text}, ... ] }`
- **Business errors are reported via `messages[].severity` even on HTTP 200.**
  A call can be HTTP 200 but logically failed — must inspect `messages` for
  severity matching `/e|error/i`.
- `404` often means "empty result", not a hard error (`allow404` pattern).
- Response headers: `Afs-tranXref`, `Afs-taskId`, `Afs-tranTime` (ms).
- Source: `afs-mcp-v2/lib/afsClient.js:75-99`

## Known query/filter params

| Endpoint | Params |
|----------|--------|
| `/jobs/listByOfficers` | `officer1Code`, `officer2Code`, `owner`, `originatedOnOrAfter`, `rowLimit` |
| `/financialHistory/effectiveFrom/{obligationId}` | `effectiveFrom`, `effectiveTo`, `sortOrder` |
| generic list | `rowLimit`, `pattern` |

## Write endpoints + quirks

- `POST /reserveNumber` body: `{ correlationId, bankId, obligorNumber, reserveType, expirationDays, reserveNumber? }`
  - `reserveType`: **2 = obligation number, 3 = collateral item number**
  - `correlationId`: idempotency key, **≤15 chars (auto-truncated)**
  - `expirationDays`: default 30
- `POST /createCustomer`, `POST /createObligor`, `POST /wp/commercialOrig`, `POST /wp/commercialPost`
- Balance codes (in `/balances` response): **1 = Commitment, 2 = Amount Takendown, 3 = Unused** — commitment lives in balances, not on the obligation record.
- Source: `afs-mcp-v2/tools/reserveObligationNumber.js`, `fixtures/enrichedLoan.js`

## Candidate seed IDs (TRY against dd3 — NOT confirmed valid here)

From `afs-mcp-v2/sample.config.js` (env may differ from dd3 — verify before trusting):
- `bank=5`, `obligor=13`, `obligation=42`, `obligationId=24096`, `officer=10111111`

Fixtures (`enrichedLoan.js`) are synthetic ("John's Lights and Fixtures", obligor 500123) — ignore for live.

> If the sample key isn't valid in dd3, **harvest** a real one: `GET /jobs/listByOfficers?officer1Code=…&rowLimit=5` or a list/search pattern, then drive detail calls off the returned bank-obligor-obligation.
