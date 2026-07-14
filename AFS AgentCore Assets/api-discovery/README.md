# AFS Vision API — reverse-engineering & documentation

Everything we know about the AFS Vision WebX REST API (`dd3.afsvision.us`), assembled
for building MCP servers against it. Reverse-engineered from the 110 OpenAPI specs, live
probing as `AFSDD301`, and the origination UI (Chrome).

> **Path convention:** doc references in backticks (e.g. `captured/…`) are relative to
> **this `api-discovery/` folder**. Executable harvesters/builders live in
> [`tools/`](tools/) (Python) and the repo-root [`../scripts/`](../scripts/) (Node).

---

## Start here

| If you want… | Read |
|---|---|
| **The one-page status** (how close to full mapping) | **[docs/overview/coverage-status.md](docs/overview/coverage-status.md)** ← source of truth |
| The executive findings summary | [docs/overview/api-findings.md](docs/overview/api-findings.md) |
| The "build a bespoke loan / pull all data" inventory | [docs/overview/api-inventory.md](docs/overview/api-inventory.md) |
| **What our credentials CAN do** (reads, origination→booking, ledger-proven servicing writes) | **[docs/overview/servicing-api-capability.md](docs/overview/servicing-api-capability.md)** `[live-tested]` |
| What's role-gated (`403`) + which bank role owns each | [docs/overview/role-gated-services.md](docs/overview/role-gated-services.md) |

## Headline numbers

| Lens | State |
|---|---|
| API surface (specs + field models) | **~100%** — 110 specs · 231 reads + 57 writes |
| Reads live-verified | **~48%** (110/231) — capped by role + booking, not discovery |
| Writes (validation rules) | **~90%** |
| Build-a-loan (through closing) | **~95%** |
| Coded-value domains | **155 fields / 3,720 rows · 85 refList names · 114 field→refList links** |

---

## Documentation map (`docs/`)

```
docs/
  overview/      coverage-status · api-findings · api-inventory
  reads/         read-catalog-live · multi-obligor-sweep · writes-then-read
  writes/        per-endpoint write docs + SCHEMAS, picklist API, booking, txn catalog
  valid-values/  catalog · harvested · read-side · name-catalog · crosswalk
  field-model/   origination-field-model + key-endpoints/ + all-endpoints/ (per-endpoint)
  build/         loan-build-log (historical discovery log — superseded; see writes/booking.md)
  mechanics/     call-mechanics · pattern-catalog · pattern-admin · mined-keys
  archive/       chrome-handoff (historical)
```

### Reads — [docs/reads/](docs/reads/)
- **[read-catalog-live.md](docs/reads/read-catalog-live.md)** — every GET read called live; URL, status, field list, sample (66/231 returned data).
- [multi-obligor-sweep.md](docs/reads/multi-obligor-sweep.md) — the 8-obligor union behind the 48% figure.
- [writes-then-read.md](docs/reads/writes-then-read.md) — proof the read ceiling is role+booking, not WP creation.

### Writes — [docs/writes/](docs/writes/)
- [SCHEMAS.md](docs/writes/SCHEMAS.md) — request field models for all 57 writes · [INDEX.md](docs/writes/INDEX.md).
- Per-op: [reserveNumber](docs/writes/reserveNumber.md) · [createObligor/createCustomer](docs/writes/createObligor_createCustomer.md) · [createFinancial](docs/writes/createFinancial.md) · [commercialOrig](docs/writes/commercialOrig.md) · [route](docs/writes/route.md) · [jobsUpdateStatus](docs/writes/jobsUpdateStatus.md).
- **[picklist_api.md](docs/writes/picklist_api.md)** — the `/rs/pl/fixed|dynamic` coded-domain endpoint.
- **[booking.md](docs/writes/booking.md)** — how a loan gets booked to servicing (proven end-to-end via the UI; why the API GET→PUT patch shortcut is a dead end).
- [financial_transaction_apis.md](docs/writes/financial_transaction_apis.md) — the 433-name `createFinancial.transaction` catalog.

### Valid values — [docs/valid-values/](docs/valid-values/)
- [catalog.md](docs/valid-values/catalog.md) — curated origination codes + the harvest technique.
- [harvested.md](docs/valid-values/harvested.md) — **155 coded fields / 3,720 rows** (UI harvest).
- [name-catalog.md](docs/valid-values/name-catalog.md) — **85 callable refList names** (`/rs/pl`).
- **[crosswalk.md](docs/valid-values/crosswalk.md)** — **field → refList** map: "to populate field X, call `/rs/pl/fixed?name=Y`".
- [read-side.md](docs/valid-values/read-side.md) — code→label pairs mined from responses.

### Field model — [docs/field-model/](docs/field-model/)
- [origination-field-model.md](docs/field-model/origination-field-model.md) — every field you can populate on a loan.
- [key-endpoints/](docs/field-model/key-endpoints/) (top-18) · [all-endpoints/](docs/field-model/all-endpoints/) (every endpoint).

---

## Tooling (`tools/`) & data

| Path | What |
|---|---|
| [tools/](tools/) | Python generators + probes (run **from this `api-discovery/` dir**) |
| [tools/archive/](tools/archive/) | one-off probe scripts (historical) |
| `captured/` | JSON artifacts (harvests, read samples, crosswalk source) |
| `responses/` | raw live read-probe captures |
| `specs/` | the 110 OpenAPI specs |
| [../scripts/](../scripts/) | Node harvesters/builders (`harvest-picklists.js`, `sweep-reads.mjs`, `build-loan.mjs`, …) |

### Regenerate the catalogs (from `api-discovery/`)
```bash
python tools/gen_harvested.py      # -> docs/valid-values/harvested.md
python tools/gen_pl_names.py       # -> docs/valid-values/name-catalog.md
python tools/gen_crosswalk.py      # -> docs/valid-values/crosswalk.md
python tools/gen_read_catalog.py   # -> docs/reads/read-catalog-live.md
python tools/extract_enums.py      # -> docs/valid-values/read-side.md
python tools/gen_inventory.py      # -> docs/overview/api-inventory.md + field-model
```

---

## The role boundary — what's left is a grant, not a technical gap

Booking is **solved**: a full nested loan was originated → closed → **booked** end-to-end
via the UI (obligor 5-34558, obligations 18 + 26) — see
[docs/writes/booking.md](docs/writes/booking.md) and
[docs/overview/servicing-api-capability.md](docs/overview/servicing-api-capability.md).

What remains is a single **back-office / servicing-admin role grant**, which would:
1. Open the **37** config/schedule/instruction reads that are `403` for the whole DD30x
   pool (see [docs/overview/role-gated-services.md](docs/overview/role-gated-services.md)).
2. Let the loan's **payment/offset instructions** be defined → making `createFinancial`
   cash-movement transactions post (internal transactions already post to the ledger).

Everything reachable without that grant is mapped, captured, and live-tested.
