# AFS MCP v2 — Test Inputs (live `dd3` sandbox)

Real identifiers verified to return data against `https://dd3.afsvision.us/webx/api/v1`.
Use these when `AFS_FIXTURE_MODE` is unset/false (live mode).

## Anchor values

| Thing | Value | Notes |
| --- | --- | --- |
| Loan officer | `10111111` | 100 workpackages, 5+ obligors, 26 booked obligations |
| Bank | `5` | |
| Obligor | `13` | "Zeppelin Inc" (LLP) — total exposure ~$7.95MM |
| Primary obligation | `42` | "Global Line" revolver — commitment $2.0MM, drawn $300K, **15% util** |
| obligationId (for `42`) | `24096` | internal id; tools derive it, only needed for raw financialHistory |

## By tool

### `jobs_by_officer` — in-flight workpackages
- `officer1Code`: `10111111`  → ~100 workpackages (Post Approval, Deal Maintenance, Origination…)

### `portfolio_by_officer` — booked loans
- `officer1Code`: `10111111`, `maxObligors`: `5`  → 26 booked obligations across 5 obligors

### `afs_show_officer_loans` — officer widget
- `officerId`: `10111111`

### `loan_summary` — borrower + facility + collateral
- `bank` `5`, `obligor` `13`, `obligation` `42`  → Zeppelin / Global Line revolver
- Other obligations under 5‑13 to try: `18` Term Loan · `26` NRLOC · `34` Takedown · `59` $1MM Sub · `67` $200k Sub · `75` Takedown · `83`

### `revolver_utilization` — drawn ÷ commitment
- `bank` `5`, `obligor` `13`, `obligation` `42`  → $300K / $2.0MM = 15%
- add `includeLedger: true` to also pull the transaction list (2020-vintage on this loan)

### `payment_history` — delinquency / aging
- `bank` `5`, `obligor` `13`, `obligation` `42`  → returns 0s + notes (this loan has no currentObligations record and only 2020 ledger activity). See "Gaps" below for a better delinquency demo.

### `afs_show_summary` — credit-memo widget
- `bank` `5`, `obligor` `13`, `obligation` `42`

### `reserve_obligation_number` — ⚠️ MUTATES (consumes a number)
- `bankId` `5`, `obligorNumber` `13`, `reserveType` `2` (2=Obligation, 3=Collateral), `expirationDays` `30`

## Fixture-mode equivalent (no creds; `AFS_FIXTURE_MODE=true`)
- Officer `JSMITH`, bank `1`, obligor `500123`, obligation `1`, obligationId `900045`
- Borrower: **John's Lights and Fixtures** — $5MM revolver, 64% utilization

## Gaps worth filling (need a quick probe)
- A loan with a **live `currentObligations` record + recent (last-12-mo) financial history** so
  `payment_history` shows real days/times past due, returned checks, and late events.
- A **delinquent / past-due** obligation to exercise the aging buckets.
  (5‑13‑42 is current and 2020-vintage, so it doesn't show these.)
