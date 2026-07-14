# Chrome model — final handoff

> ⚠️ **SUPERSEDED (historical onboarding note).** This was a one-time handoff whose
> TODO ("book a loan", "close the build→book→fund→service cycle") is now **done**:
> the cycle was completed via the UI (obligor 5-34558) and servicing writes are
> live-tested. It also references an old CAPS file layout that no longer exists.
> Current truth: [`../overview/servicing-api-capability.md`](../overview/servicing-api-capability.md),
> [`../writes/booking.md`](../writes/booking.md). Kept for provenance only.

## How to use this file
You are a Claude Code session on a machine **with Chrome + a logged-in dd3 AFS Vision
tab**, and this repo (`AFS-mcp-v2`) cloned. **Paste this whole file as your opening
message** (or just say "read api-discovery/CHROME_HANDOFF.md and go"). It's the
complete brief — the API-only side is done and won't pick work back up, so own the
TODO below end-to-end and keep committing to the repo.

First steps: `git pull`; create `api-discovery/.env` with `API_USER`/`API_PASS` (see
`.env.example`); skim `COVERAGE_STATUS.md` (source of truth). Then execute the TODO.

---

The API-only (managed-machine) work is **complete**. Everything that can be learned
from the REST API as `AFSDD301` is documented here. This is the one final handoff:
below is the precise, self-contained TODO that genuinely **requires the browser or a
broader role** — nothing here bounces back to the API-only side.

## Done (don't redo) — all in `api-discovery/`
- 110 specs, 231 read services + 57 writes — full field models (`findings_all/`, `SCHEMAS.md`).
- Reads: structural 100%; ~42% live single-obligor, ~20% permission floor, ~80% reachable.
- Writes: `reserveNumber`, `createObligor`/`createCustomer`, `createFinancial`
  validation matrices + error-code taxonomy; `updateStatus`.
- `createFinancial.transaction` = **433-name catalog** (`financial_transaction_apis.md`),
  `simulate:"true"` = confirmed dry-run.
- Valid-values: read-side 386 fields (`valid_values_read.md`) + origination 88 (`VALID_VALUES_HARVESTED.md`).
- Booking root-caused (`readyToBook_booking.md`): patch-PUT impossible.

## TODO — only Chrome / a broader role can do these

### 1. Remaining origination picklist domains  (Chrome)
~half of the 167 origination coded fields still lack their full value lists. Use the
proven **react-select React-props extraction** (each dropdown's `props.options` =
`[{code,literal}]`) across the remaining `commercialOrig` steps. Merge into
`VALID_VALUES_HARVESTED.md` (machine-readable: `captured/harvested_picklists.json`).

### 2. Book a loan  (Chrome / back-office role)
The loan builds to closing-complete but **booking can't be triggered via API**
(root cause: PUT write-model needs nested objects like `IncomeStmtSmry.statementYear`
the GET omits — patch-PUT impossible). Options:
- In the UI, at the closing/post stage, set **`readyToBook = "1 - Yes"`** on a
  completed WP and route it to servicing; OR
- extend `tools/createWorkpackage.js::buildPayload` to emit a PUT-valid body with
  `readyToBook=1`; OR
- find the **back-office/servicing-post role or queue** that posts ready-to-book WPs.
Existing loans (5-13) prove booking happens — the origination role just can't trigger it.

### 3. Permission-gated reads  (needs a role grant, not Chrome per se)
47/231 read services + `accrualSchedules`/`billingSchedules` return **403 for
`AFSDD301`**. A broader-permission login resolves these in one re-sweep
(`probe.py --config endpoints_all.json`).

### 4. Live loan round-trip  (after booking)
Once a loan is booked: `createFinancial` to fund it (pick a `transaction` from
`financial_transaction_apis.md`, `simulate:"true"` first), then read back
`balances`/`charges`/`financialHistory`/`currentObligations` — the full
build→book→fund→service cycle we've never closed end-to-end.

## Seed + keys (verified in dd3)
bank 5 · obligor 13 = Zeppelin Inc · nameId 7866 · obligation 18 (charges, chargeCode 1000) ·
collateralItem 18 · fiNumber 42 / fiId 24096 · orgLevelId 37953 · addressId 8149 ·
organizationId 1 · invoices key `bank-billYear` (e.g. 5-2026-1) · officer 10111111.
Other data-rich obligors: 34160 (Piedmont), 1136, 39, 62.
