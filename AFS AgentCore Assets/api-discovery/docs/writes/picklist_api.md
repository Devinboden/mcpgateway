# The AFS picklist API — `/rs/pl/fixed` & `/rs/pl/dynamic` (canonical coded-domain source)

Discovered live in dd3 (2026-06-26, Chrome) while harvesting origination picklists.
This is the **authoritative source for every coded domain** the UI renders — far
cleaner than scraping rendered dropdowns or mining `<field>Lit` pairs from responses.

## The two endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `GET /webx/rs/pl/fixed?name=<RefListName>` | static/reference coded lists | `/rs/pl/fixed?name=Product%20Structure` |
| `GET /webx/rs/pl/dynamic?name=ilm%2Fpl%2F<Name>&wfType=5701` | workflow/config-driven lists | `/rs/pl/dynamic?name=ilm/pl/RequestType&wfType=5701` |

Some fixed lists are **scoped** by bank/application:
`/rs/pl/fixed?bank=5&appl=1&name=APPL030` (the `application` field's domain). Requests
also carry a `crc=<hash>` cache-buster (optional — omit it and the call still works).

### Response shape (both)
```json
{ "plName": "Product Structure",
  "items": [ {"code":"C","literal":"Standalone Loan"},
             {"code":"F","literal":"Commitment"},
             {"code":"L","literal":"Letter Of Credit"} ] }
```
`items[].code` + `items[].literal` = exactly the `[code,label]` pairs the harvest catalog
stores. Auth = the normal session cookie (no extra headers). Bare `/rs/pl/fixed` (no
`name`) → 500; there is **no catalog/list endpoint** (probed `/pl/list`, `/pl/names`,
`/pl/catalog`, `/reflists`, … all 404). So names must be discovered, not listed.

## How the names are discovered

The transport is **XMLHttpRequest** (not `fetch`), fired when a screen/dialog renders
its picklists. Screen templates (`/rs/app/ui/template/screens/ilm/orig/<screen>`)
declare each picklist as `{"field":"productStructure","tagName":"afs:picklist"}` but
**do not** carry the pl `name` — the field→name mapping is resolved in the JS bundle at
render time. Observed mappings:

| field | kind | name requested |
|-------|------|----------------|
| `productStructure` | fixed | `Product Structure` |
| `application` | fixed | `APPL030` (bank/appl-scoped) |
| `obligorRequired` | fixed | `Answers` |
| `requestType` | dynamic | `ilm/pl/RequestType` |
| `letterOfCredit` | dynamic | `ilm/pl/LetterOfCreditType` |

**Dynamic** names follow a convention: `ilm/pl/<PascalCaseField>`. **Fixed** names are
AFS refList names (`Product Structure`) or codes (`APPL030`) and are **not** reliably
derivable — capture them from the live calls.

### Live refList-name inventory — 84 names captured (2026-06-26)
Replaying the XHR-recorded `/pl/*` calls across the collateral, pricing, repayment, fee,
rating, support and financial-analysis screens yielded **84 refList names · 1,018
options**, each directly callable. The fixed-name codes are prefixed by domain:
`CLRE*` (collateral real-estate), `COLR*` (collateral), `CONL*` (negotiable), `COBB*`
(borrowing base), `ADDR*` (address — `ADDR212`=265 counties), `*ORG*` (org levels),
`ACCS*` (accrual), `CHGH*` (charge), `PRMS*` (prime/index — `PRMS200`=52), `REPY*`
(repayment), `RSKR*` (risk rating), `SUPR*` (support), `*CUR100` (currency=46). Full
table: **[../valid-values/name-catalog.md](../../valid-values/name-catalog.md)**; raw incl. all options:
`captured/picklist_api_names.json`. This closes the "names aren't derivable" gap — the
inventory IS the lookup table for direct `/rs/pl/fixed` calls.

## Harvest mechanism (proven)

Two in-page interceptors capture the app's picklist traffic during SPA navigation
(`scripts/harvest-picklists.js`):
- **fetch wrapper** — stores any `/rs/pl/*` response (`{plName,items}`) into
  `localStorage.afsPL`, keyed by `plName`.
- **XHR `open` wrapper** — records every `/rs/pl/(fixed|dynamic)` request URL into
  `localStorage.afsPLurls` (the app uses XHR, so this is what actually fires).

Replaying the recorded URLs through the wrapped `fetch` then populates `afsPL` with full
option lists. Complementary DOM scrape (React-fiber `props.options` + native `<select>`
`<option>`) writes `localStorage.afsCodes` for fields rendered on-screen. Both feed
`captured/harvested_picklists.json`.

## Why this matters

Given a pl `name`, **any** coded domain is one GET away — including the dialog-only
fields the UI won't render on API-staged workpackages (EDIT dialogs don't open on a
`locked, modified` WP; ADD dialogs do). The remaining harvest gap is now purely a
**name-discovery** problem, not an access problem: walk a workpackage that has every
section (collateral, compliance, pricing/deal-specifics at pre-approval) with the XHR
interceptor installed, and every picklist name it renders is captured, then fetched.
