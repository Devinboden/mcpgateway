# AFS Vision API — Findings (executive summary)

> ⚠️ **Partly superseded.** The mechanics findings and error-code taxonomy below remain
> accurate and unique. But two conclusions are now **false**: **booking-is-unreachable**
> and **"no real POST possible / obligations matured-frozen"**. A full nested loan was
> booked end-to-end via the UI (obligor 5-34558), and `createFinancial` posts internal
> transactions to the ledger — the real cash-movement blocker is the obligation's
> **offset/payment instructions** (`obligorDDAInstructions`, `403`), not maturity. The
> role-blocked `403` set is **37 families** (earlier 47/3 figures in this file are stale).
> Current truth: [role-gated-services.md](./role-gated-services.md) ·
> [servicing-api-capability.md](./servicing-api-capability.md) ·
> [../writes/booking.md](../writes/booking.md).

Robust documentation for building MCPs against AFS Vision (`dd3.afsvision.us`).
Three layers, cross-referenced:

| Layer | Source | Where |
|-------|--------|-------|
| Field model (types, x-fieldId, precision, titles) | OpenAPI specs — **authoritative** | per-endpoint `findings/<resource>.md` |
| Pattern catalog (named projections + bound service) | Pattern Admin UI | [../mechanics/pattern-catalog.md](../mechanics/pattern-catalog.md) |
| Call mechanics + live behavior | `afs-mcp-v2` code + **live probing** | [../mechanics/call-mechanics.md](../mechanics/call-mechanics.md), `responses/` |
| **Live read catalog (ground-truth responses)** | **all 231 GET reads called live in dd3** | **[../reads/read-catalog-live.md](../reads/read-catalog-live.md)** |

- Per-endpoint detail: [../field-model/key-endpoints/INDEX.md](../field-model/key-endpoints/INDEX.md) (18 high-value endpoints)
- Reproduce: `fetch_specs.py` → `build_endpoints.py` → `probe.py` → `make_findings.py`

## Live read sweep (2026-06-26) — every GET read called against real loans

`scripts/sweep-reads.mjs` + `sweep-pass2.mjs` enumerate all **231 GET read services**
(`enum_reads.py`), self-bootstrap an entity graph from real booked obligations
(bank 5: Piedmont 34160, Mickey Mouse 1136, Shell 39, +34392), expand each path
template into valid keys, and capture verbatim responses. `gen_read_catalog.py`
renders [../reads/read-catalog-live.md](../reads/read-catalog-live.md). Raw per-service samples:
`captured/read_samples/*.json` (202 files); status matrix: `captured/read_sweep_results.json`.

| Outcome | Count | Meaning |
|---|---|---|
| **200 — live data captured** | **66** | real response + field list saved (**3,770 fields total**) |
| 400 / 422 | 65 | reachable; needs a query param or value we couldn't source (requirement documented) |
| **403 — entitlement-blocked** | **37** | `AFSDD301` lacks the role; families: accrualSchedules, assetSales, banks, billingSchedules, lateChargeControl, notePad, obligorApplications, obligor{DDA,Wire}Instructions, penaltyDefinitions, primeSchedules, rateIndicative, repaymentSchedules, up/*, wp/* |
| 404 | 31 | key shape valid, no record for these obligors in the sandbox |
| NO_KEY | 29 | no child key (penaltyId, rateId, wireId, invoiceNumber, …) was harvestable to exercise the template |

**Key model proven:** `obligationId` (internal) **== `financialInstrumentId`** — FI id 30733
→ obligation #75, 30745 → #83, 24096 → #42. Composite keys are hyphen-joined
(`{bank}-{obligor}-{obligation}`, `{nameId}-{sequence}`). This upgrades the
spec-derived `../field-model/origination-field-model.md` to ground-truth for the 66 covered services.

---

## ⭐ Write + origination-to-booking findings (live build session)

Beyond the read sweep below, a live end-to-end **loan build** in dd3 mapped the
write path and the full commercial-origination workflow. New artifacts:

| Topic | Where |
|-------|-------|
| ⭐ **Executive inventory** — both faces (build a bespoke loan · pull all data) | [api-inventory.md](api-inventory.md) |
| ⭐ **Bespoke-loan field model** — complete writable field tables (Obligation 316, Party 85, Request 109, Collateral 131, …) | [../field-model/origination-field-model.md](../field-model/origination-field-model.md) |
| Booking/execution surface (booked via UI; async-route + tasks; no one-shot API endpoint) | [../writes/booking.md](../writes/booking.md) |
| **End-to-end build log** (every call, body, message, minted ID) | [../build/loan-build-log.md](../build/loan-build-log.md) |
| **Valid-values catalog** (picklist code→label, harvested from dd3 UI) | [../valid-values/catalog.md](../valid-values/catalog.md) |
| `/wp/commercialOrig` — **new read** `GET /wp/commercialOrig/{id}`, proven payload, cleaned-PUT technique, UI-only decision | [../writes/commercialOrig.md](../writes/commercialOrig.md) |
| `/route` — valid target stages + validation-loop mechanics | [../writes/route.md](../writes/route.md) |
| `/createFinancial` — funding via `simulate`, transaction/balance codes, live-state validation | [../writes/createFinancial.md](../writes/createFinancial.md) |
| Write request schemas (all 57 ops) + empty-body matrix | [../writes/SCHEMAS.md](../writes/SCHEMAS.md) · [../writes/INDEX.md](../writes/INDEX.md) |
| Captured ground-truth WP payloads (staged 32645/32646) | `captured/` |
| Drivers: staged validation-loop · API-driven RE-loan setup | `../scripts/build-loan.mjs` · `../scripts/re-build.mjs` |

**Live build results (dd3, 2026-06-25):**
- **Create chain proven:** `createCustomer` (ilmId 46934) → `createObligor` (34392)
  → `reserveNumber` (obln 18) → `POST /wp/commercialOrig` (WPs 32687/32689/32691),
  all 200/201. Lessons: dd3 requires the `*` test-data prefix on Names; obligor needs
  `orgLevelData` (assignment unit + officer); customer `definition:"0"`.
- **Full origination → booking workflow reverse-engineered** across 6 stages
  (`applicationStage → preApproval → Credit Approval → Customer Acceptance →
  Post Approval → Closing Preparation`). WP 32691 (CRE term loan) was driven to
  **APPROVED + customer-ACCEPTED** (hybrid API + UI; credit decision is UI-only — a
  two-sided linked dataset the append-only PUT can't forge; SoD: originator vs
  approver/AFSDD302).
- **`createFinancial` funding proven via `simulate`** (codes `DisburseFuture`/
  `DisburseCurrent` = servicing `apiName`; `balanceCode` required + obligation-
  specific). No real POST possible — all dd3 booked obligations are matured/frozen/
  fully-disbursed (data-state limit, not endpoint limit).
- **Booking structure SOLVED:** `productStructure:"C"` = **"Standalone Loan"** (vs
  `"F"` Commitment) yields a directly-bookable single loan with an editable
  **"Current Outstanding"** amount (no derived/disabled Commitment Amount). WP **32697**
  (CRE term loan, obligationType 3015) was rebuilt with it and driven through the
  WHOLE workflow to unit `state:"complete"` (approved + accepted + closing-prep done).
  The only remaining step — posting a completed origination to **servicing** — is a
  **back-office / batch execution** outside the origination role's UI (no "Book"
  action in Send Work / toolbar / menus / Job List; `/route` → "unit status does not
  allow routing"; `readyToBook` un-PUTtable). Full runbook in [../build/loan-build-log.md](../build/loan-build-log.md).
- **Cleanup proven:** `POST /jobs/updateStatus {action:"withdraw", reason:"OTHR"}`
  withdrew 18 stray WPs incl. the original 8-draft debt; kept 32697.
  [../writes/jobsUpdateStatus.md](../writes/jobsUpdateStatus.md).

---

## Read completion scorecard (from documented artifacts, not estimates)

231 read services across all 110 specs. Counted from `responses/` + `../field-model/all-endpoints/`.

| Tier | Count | % |
|------|------:|--:|
| **Structural documentation** — every service has its spec field model + live probe result + a `../field-model/all-endpoints/` entry | **231 / 231** | **100%** |
| **Resolved** — live-documented (200/204) **+** permission-blocked (403, nothing more possible without a role grant) | **94 / 231** | **41%** |
| Remaining — reachable, structurally documented, but no live data captured (400 needs-key: 71 · 404 empty-for-seed: 64 · err: 2) | 137 / 231 | 59% |

Status breakdown: `200×46, 204×1, 403×47, 400×71, 404×64, 406×1, err×1`.
Per-resource detail: [../field-model/all-endpoints/INDEX.md](../field-model/all-endpoints/INDEX.md).

**Key mining (no new calls):** `mine_keys.py` scanned all captures for embedded
keys → yielded `addressId` (8149/8154/8155) and `organizationId` (1), which lifted
`addresses__get` 400→200. 14 other unresolved tokens (`dealId`, `penaltyId`,
`invoiceNumber`, `rateId`, `wireId`, …) have **no value in any capture** — they
need other obligors (multi-obligor sweep) or writes. Captures are now squeezed dry.

> Definition used: "complete" = **documented-with-data OR didn't-have-permission**.
> The 60% remainder isn't undocumented — it's services we couldn't exercise live
> with one obligor + one login (need other keys or broader read scope).

---

## The big discoveries (not in the JSON spec)

### 1. The `pattern` query param controls the projection — proven
The same path returns **different field sets** depending on `?pattern=`. On
`GET /obligations/get/{obligationId}`:
- `?pattern=_obligationDetails` → **41 fields**
- `?pattern=_obligationList` → **25 fields**
- `?pattern=_transactionHistory` → `{obligation, financialHistory}` only

The OpenAPI documents the *full* model; the pattern selects a subset. Each MCP
tool should pin a known pattern. Projections per pattern are now recorded in each
`findings/<resource>.md`.

### 2. URL contract: `{base}/{resource}/{service}/{key}?pattern={name}`
The Pattern Admin **"Service Name" is literally the URL path segment** (validated
against all 18 specs). Key shape is positional and **varies per service**:

| Key shape | Example service / path |
|-----------|------------------------|
| 2-part `{bank}-{obligor}` | `/obligors/get/5-13` |
| 3-part `{bank}-{obligor}-{obligation}` | `/obligations/getFullKey/5-13-42` |
| 4-part `…-{application}-{fiNumber}` | `/financialInstrument/getFullKey/5-13-1-1` |
| 4-part `…-{obligation}-{chargeCode}` | `/charges/getFullKey/5-13-42-{chargeCode}` |
| 5-part (guarantor chain) | `/supportReferences/list/{supBank}-{supObligor}-{supCollItem}-{obligor}-{app}` |
| single `{obligationId}` | `/obligations/get/{obligationId}`, `/financialHistory/effectiveFrom/{id}` |

### 3. Response envelope + error semantics
- Body: `{ "<resource>": <payload>, "messages": [ {severity, text, code, time} ] }`
- **Business errors arrive via `messages[].severity` even on HTTP 200** — must
  inspect `messages`, not just status. (Probe runner flags this as `afs_error`.)

### 4. HTTP status semantics (observed)
| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK (check `messages` anyway) | obligations, balances, obligors, financialInstrument |
| 400 | `"Unresolved variables; only N value(s) given for M unique variable(s)"` → **missing required key/param** | org-levels (needs `orgLevelId`), charges (needs `chargeCode`) |
| 403 | `"Access to this service is not permitted by the current user's permissions"` → **role/permission scope** | `/accrualSchedules` denied for `AFSDD301` |
| 404 | empty / record-not-found for the given key (no message body) | currentObligations, names, phones for seed key |

### 5. Auth / headers (required every call)
Basic auth + `Afs-AppChannel` (≤24 chars) + per-request `Afs-tranXref` (UUID).
`dd3` is behind **Cloudflare** — a browser `User-Agent` is mandatory (default
lib agents get 403/1010). All handled in `probe.py`.

### 6. `pattern` is optional almost everywhere — but BREAKS 4 specific services
Mapped with/without `pattern=` across all endpoints (`check_patterns.py`):

| Verdict | Count | Meaning |
|---------|------:|---------|
| pattern OK | 46 | works **with or without** pattern (it just selects a projection subset) |
| **PATTERN BREAKS** | **4** | 500 / hang **with** pattern; **200 without** |
| pattern required | 0 | (none — pattern is never mandatory) |
| n/a | 26 | non-200 for both (permission / empty / key) — pattern-independent |

**The 4 that break — call these WITHOUT `pattern`:**
- `charges/getFullKey` (`_chargesDetail`, `_chargesList`)
- `charges/listFullKey` (`_chargesList`)
- `obligations/getFullKeyPayoff` (`_payoffDetails`)

i.e. the **charges full-key services and the payoff service** error when a
`pattern` is passed; isolated via `diag_charges.py` (`?pattern=…` → read timeout,
`?pattern=…&rowLimit=5` → `"HTTP 500 Internal Server Error"`). The full field
model still returns without the pattern. **NOT** charges-wide and **NOT**
flatFees/accrualSchedules (earlier speculation corrected).

**Implication for MCPs:** safe to pass `pattern` to select projections on 46
endpoints; for the charges full-key + payoff services, omit it.

### 8. Two distinct write-validation models (create-reject vs workpackage-draft)
Discovered via the empty-`{}` write sweep:
- **`create*` / `reserveNumber` / `employees`** → **upfront 400 rejection**; required
  fields validated immediately, nothing created. (e.g. `createObligor` empty →
  "Required field 'obligor' was not provided.")
- **`/wp/*` (workpackage) endpoints** → **create a DRAFT first (HTTP 201)**, then
  return **step-level** validation in `messages`: "Step 'Customer Search': A customer
  must be selected.", "Step 'Transaction Management': At least one transaction must be
  added." This reveals each workpackage's workflow steps — but **a draft workpackage
  is persisted on every call**, even an empty one.
- **`createException`** → HTTP 200 with an error in `messages` using a different code
  scheme (`EX020900007`), and 4 `/wp/*` (ddaWireChanges, feeManagement, nonFinancial,
  syndiDealPipeline) returned **500** on empty bodies.

⚠ **Operational note:** the empty-body probe created 8 draft workpackages in dd3
(ids 32679–32686) because `/wp/*` create-then-validate. Lesson: do **not** send
empty bodies to `/wp/*` — document them from spec + step-messages instead.

### 7. Writes have a structured error-code taxonomy + rich validation messages
From live write-probing (`reserveNumber`, malformed payloads → rejections). The
`messages[].code` is a **machine-readable validation category**, and the `text`
often **lists the valid values**:

| `code` | Category | Example message |
|-------:|----------|-----------------|
| 0 | success (severity `info`) | "Obligation reservation is successful." |
| 1 | field-level (required / type / length) | "Required field 'bankId' was not provided." · "Length of value exceeds maximum length of 15" |
| 2 | invalid reference / FK | "Invalid Obligor Number: '9999999'." |
| 3 | invalid enum (text lists valid set) | "Invalid Reserve Type: '99'. Valid values are '2' for Obligation or '3' for Collateral." |
| 4 | out-of-range | "Invalid Expiration Days: '-5'. Valid values are zero or integers greater than zero." |

Spec `maxLength`s **are enforced**, required-fields are enforced, and FK/enum/range
checks exist beyond the spec. MCP write tools should surface `messages[].text`
verbatim and can branch on `code`. Full matrix: `../writes/reserveNumber.md`.

---

## Live probe coverage (read-only, 2026-06-25)

Seed entity: `bank=5, obligor=13` = **Zeppelin Inc.** (Exton, PA). All keys below
verified valid in dd3 and **harvested live** from working calls:

| Var | Value | Harvested from |
|-----|-------|----------------|
| `nameId` | 7866 | `/obligors/get/5-13` |
| `collateralItem` | 18 | `/collateral/list/5-13` (4 items; CRE $800k) |
| `orgLevelId` | 37953 | `/financialInstrument/listAllByObligor/5-13` |
| `fiNumber` | 42 | same (fiNumber 42 ↔ fiId 24096 ↔ obligation 42, `application=1`) |
| `obligation` / `financialInstrumentId` | 42 / 24096 | sample.config + confirmed |

**Coverage after the child-key cascade — 77 System-pattern probes:**

| Result | Count | Meaning |
|--------|------:|---------|
| ✅ 200 | **46** | working pattern + projection captured (was 21 before cascade) |
| ⚠ 400 | 14 | needs `chargeCode` (no fee charges on this obligor), or is a **search** service needing criteria, or an anomaly (see below) |
| ∅ 404 | 14 | valid call, **empty** for Zeppelin (no current-obligation rows, no phones, no negotiable collateral) |
| 🔒 403 | 3 | `/accrualSchedules` — permission-denied for `AFSDD301` |

The cascade (harvest child keys → re-seed → re-probe) lifted org-levels (10/10),
names (4/5), addresses (4/5), financialInstrument (8/10) from 400 → 200.

### Characterized remainders
- **`chargeCode` (charges, flatFees):** RESOLVED — Zeppelin **obligation 18** has
  charges: `chargeCode 1000` (Interest, $500k principal, non-accrual, $17k past
  due) and `4700` (Accrual Fee). But the System patterns 500 the server when passed
  as `pattern=` (see finding #6) — the data is retrieved by calling the key-based
  service **without** the pattern. Captured: `responses/_charges_diag.json`.
- **Search services (HTTP 422/400):** `names/_customerSearch` (`any`),
  `apis/_descriptionOnly` — these take **search criteria/body**, not a positional
  key. Different invocation; document as search endpoints.
- **Anomaly:** `financialInstrument/listOblnByObg` + `listOblnByObgAppl` return a
  bare HTTP 400 (no AFS message) with `5-13` / `5-13-1` — to revisit (may need a
  different param or body).
- **`addressId`:** `/addresses/getPrimaryAddrByNameId` doesn't echo the id, so
  `/addresses/get/{addressId}` (`_alternateAddresses`) stays unresolved.

---

## Comprehensive read sweep — ALL 110 specs / 231 services

Beyond the curated 18, a bare-call sweep (`build_all_endpoints.py` →
`probe.py --config endpoints_all.json` → `make_findings_all.py`) enumerated and
probed **every** read service. Per-service docs: [../field-model/all-endpoints/](findings_all)
(spec field model + live status). Single-obligor seed (Zeppelin 5-13).

| Status | Count | Meaning |
|--------|------:|---------|
| ✅ 200 | 45 | working — full field model captured |
| 🔒 403 | 47 | permission-denied for `AFSDD301` (read scope — won't change without a role grant) |
| ⚠ 400 | 72 | needs a key we don't have (85 services have unresolved path tokens: addressId, invoiceId, citizenship id, …) |
| ∅ 404 | 64 | valid call, empty for this obligor |
| 204 / 406 / err | 3 | no-content / not-acceptable / timeout |

**Structural read coverage is now ~100%** — every service across all specs is
enumerated and documented with its field model; 200s add live projections. The
non-200s are characterized by reason (permission / missing-key / empty), not gaps.
More live 200s would require more seed keys or a broader-permission user.

## Write coverage

**57 write ops, 100% structurally documented** — full request-body field models
(required fields, types, lengths, enums, nested objects) in
[../writes/SCHEMAS.md](../writes/SCHEMAS.md).

Live behavior captured:
- **`reserveNumber`** — full validation matrix + success shape
  ([../writes/reserveNumber.md](../writes/reserveNumber.md)).
- **Empty-body sweep** of 22 create/diagnostic ops → revealed the two validation
  models (finding #8) + create* required fields + error-code taxonomy (finding #7).
  Results table: [../writes/INDEX.md](../writes/INDEX.md).
- **35 stateful/destructive/batch ops** (`update*`, `delete`, `route`, `async`,
  `taskProcessor/*`, `PUT`/`DELETE`) — documented from spec only, **not called**.

Known sandbox artifacts: 8 empty draft workpackages (ids 32679–32686) from the
`/wp/*` empty-body probes. **RESOLVED 2026-06-25** — withdrawn via
`POST /jobs/updateStatus {action:"withdraw", reason:"OTHR"}` (the reason code was
harvested from the Job List Withdraw dialog). See ../writes/jobsUpdateStatus.md.

### Safe lever for deeper write probing: `simulate`
`createFinancial` (and likely `createScheduledFinancial`) has a **`simulate`**
field — a dry-run flag. This allows full validation + success-shape probing of
financial posting **without creating transactions**. Best next write to map.

## Open follow-ups

1. **`charges` via REST** — DONE: charges retrieved (obligation 18). Note for MCP:
   call charges/flatFees **without** the `pattern` param (it 500s — finding #6).
2. **`/accrualSchedules` 403** — CONFIRMED in the live sweep: one of 37 entitlement-
   blocked reads for `AFSDD301` (full list in the Live read sweep table above).
3. **Search services** (`_customerSearch`, `apis/_descriptionOnly`) — document the
   search criteria/body shape (separate from key-based calls).
4. **`financialInstrument/listOblnByObg` anomaly** — the bare 400 is a missing
   required `instrumentType` query param (sweep pass 2 confirmed; valid values still
   to pin down — `C/F/O/L` all returned 422).
5. **Remaining endpoints** — `enum_reads.py` now enumerates **all 231** GET reads;
   `../reads/read-catalog-live.md` covers them. Extend `build_endpoints.py` only for writes.
6. **Write-endpoint validation** — not yet run; requires `--allow-writes`.
