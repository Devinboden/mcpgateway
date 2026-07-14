# Servicing API capability — live-tested on a booked loan  `[ledger-verified]`

_What the `dd3` sandbox credentials can actually **do** on a live loan, proven end-to-end
against a real booked obligation on 2026-07-11. This is the ground-truth companion to
[`role-gated-services.md`](./role-gated-services.md) (which maps what's `403`)._

## The test subject — a real, booked, nested loan

Built and **booked entirely through the AFS Vision UI** (origination → approval → closing →
funding/booking), then exercised via API:

| | Obligation | Structure | Terms |
|---|---|---|---|
| Commitment | **5-34558-18** (id 30800) | "Highest Level" | $5,000,000 revolving line, 6.5% fixed, Actual/360, interest-only, matures 2027-07-10 |
| Takedown | **5-34558-26** (id 30801) | *Taken Down From* the commitment | $1,000,000, principal 100% at maturity |

Obligor **5-34558** = `*ZZTEST Nested Borrower LLC` (obligorType 120, LLC). This gave us the
first **non-matured, fully-booked** loan to test servicing against — every prior sandbox loan
was a matured 2020–2022 vintage, which is what made servicing *look* broken.

## What the API can do (verified)

### 1. Reads — full position monitoring ✅
| API | Result |
|---|---|
| `obligors/get`, `names/list` | ✅ look up borrower |
| `financialInstrument/listAllByObligor` | ✅ all facilities in the relationship |
| `balances/listFullKey` | ✅ commitment $5M, $1M drawn, $4M unused |
| `charges/listFullKey` | ✅ the interest charge + `earnedInceptionToDate` (accrued interest) |
| `exposure/listObligor` | ✅ obligor exposure |
| `obligations/getFullKey` | ✅ full obligation detail |
| **`financialHistory/listAllById/{obligationId}`** | ✅ **the transaction ledger** (see below) |
| `accrualSchedules`, `repaymentSchedules`, `billingSchedules` | 🔒 `403` (role) |

> ⚠️ Ledger-read gotcha: `financialTransactions/list/{id}` returns `404`-empty even on a
> funded loan — it is **the wrong endpoint**. The real posted ledger is
> **`financialHistory/listAllById/{obligationId}`**. Do not read `404` here as "nothing posted."

### 2. Origination → booking ✅ (proven — we booked one)
`createCustomer` → `createObligor` → `reserveNumber` (real records) → build the nested
commitment+takedown, price/schedule/rate it → route through approval → closing → **BOOKED**.
The booking posted real disbursements to the ledger (below).

### 3. Servicing writes — internal transactions POST; cash movement is walled ⚙️

**Internal (non-cash) transactions commit for real.** A `simulate:"false"`
`AdjustFutBalPayment $1` returned "Update Transaction Successful" **and left ledger records** —
records `[7]–[10]` on the commitment below. (It hit the *commitment's* future/unused balance,
not the takedown's current principal — hence a naive current-balance read shows no change even
though the post is real. Measure the ledger, not just `balances`.)

**Cash-moving transactions are blocked — in *both* directions.** Anything that moves money
between the loan and an external account fails with **"Offset Transaction must be defined at
the obligor or obligation level"**:

| Transaction | Direction | Result |
|---|---|---|
| `AdvanceCurrent`, `DisburseCurrent` | cash **out** | 💸 needs offset |
| `PayInterest`, `PayInterimInterest`, `PayAccrualFee`, `PayPrincipalBalanceCode` | cash **in** | 💸 needs offset |
| `AdjustFutBalPayment`, `AdjustFutBalAdvance` | internal reval | ✅ **posts + commits** |
| `PayLateCharge` | — | needs a flat-fee charge the loan lacks (create = `feeManagement` `403`) |
| `AssessPrepayPenalty` | — | needs a prepay-penalty charge code the loan lacks |

The "offset" is **not** an inline payload field (`tmpOffsetEntry:{}` doesn't satisfy it) — it's
**default payment/DDA instructions defined on the obligation**, i.e. `obligorDDAInstructions` /
`wp/ddaWireChanges`, which are **`403`** for our role. So cash can't move until a back-office
role sets up the loan's payment instructions.

Also reachable (not `403`), gated only on loan data or full payloads: `updateCurrentCollateralValue`
/ `updateCollateralBorrowingBase` (need a collateral item), `wp/repricing2` / `wp/syndiRepricing`
(create draft WPs `201`), `createScheduledFinancial`, `exceptions/createException`, `/route`,
`jobs/updateStatus` / `updateAssignment`.

## Ledger evidence (the proof)

`GET /financialHistory/listAllById/30800` (the commitment) — 11 records:

```
[0-2] DisburseFuture      $5,000,000   ← booking: the $5M commitment
[3]   IncreaseFASBPaid…   $1,500       ← FASB fee accounting
[4]   DecreaseFASBBNP    -$1,500
[5-6] DisburseCurrent    ±$1,000,000   ← the takedown draw
[7]   AdjustFutBalPayment  -$1   ⟵ API-posted (our test)
[8]   AdjustFutBalAdvance  -$1   ⟵ API-posted
[9]   AdjustFutBalPayment  +$1   ⟵ API-posted
[10]  AdjustFutBalAdvance  +$1   ⟵ API-posted (net $0 — payment + reversal)
```
`GET /financialHistory/listAllById/30801` (the takedown) — 2 records: `DisburseCurrent $1,000,000`.

## The real boundary (high confidence, ledger-proven)

Our credentials are a **front-office originator + servicing-operator** identity:

- ✅ **Read** any loan's full position (balances, charges, exposure, obligations, ledger)
- ✅ **Originate, close, and BOOK** loans — including nested commitment/takedown structures
- ✅ **Post internal servicing transactions** to the ledger (balance revals/adjustments commit)
- 🔒 **Cannot move cash** in or out of a live loan — needs payment/offset instructions on the
  obligation (`obligorDDAInstructions` = `403`)
- 🔒 **Cannot administer bank config** — rate/prime schedules, penalty/late-charge rules,
  accrual/billing/repayment schedules, bank & user admin (the 37-family `403` set)

**Single unlock:** a back-office / servicing-admin role grant. It would (a) let us define payment
instructions → making cash-movement transactions post, and (b) open the 37 `403` config/schedule
families. Nothing about the `createFinancial` API itself is broken.

## Confidence

| Claim | Confidence | Basis |
|---|---|---|
| Internal servicing writes post & commit | **High** | ledger records `[7]–[10]` |
| Cash movement (either direction) is walled on payment instructions | **High** | reproduced across advance + payment txns |
| The 37 `403` families are config/maintenance-access, not transactions | **High** | per-account 403 sweep |
| A payment-instruction grant would let cash post | **Medium** | inferred — the offset error names exactly that setup; not yet tested with instructions in place |
