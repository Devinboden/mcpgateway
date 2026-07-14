# `POST /createFinancial` — post a servicing financial transaction  `[ledger-verified]`

Body `Wf-ws-servicing-ServicingUpdateFinancialRequest` (full model in SCHEMAS.md):
`{ simulate, financial: { bankNumber, application, oblgrNumber, oblnNumber,
effectiveDate, tranAmount, tranAmountCur, transaction, balanceCode, chargeCode,
takenDownFromObln, … }, tmpOffsetEntry }`

Required (validated live): `financial.bankNumber, application, oblgrNumber,
oblnNumber, effectiveDate, transaction` **+ `balanceCode`** (*"Balance Code is
required to complete this transaction."*). Fee/charge transactions also need
`chargeCode` (*"Charge Code is required to complete this transaction."*).

## `simulate` — dry run vs commit
`simulate:"true"` → HTTP 200, full validation, posts nothing. `simulate:"false"`
executes and **commits** (verified below).

## Internal transactions POST to the ledger  `[live 2026-07-11, obligor 5-34558]`
On a live non-matured loan, a real `simulate:"false"` **`AdjustFutBalPayment $1`**
(and its `AdjustFutBalAdvance` reversal) returned *"Update Transaction Successful"*
**and left records** in `GET /financialHistory/listAllById/{obligationId}` — proving
the endpoint commits, not just validates.
> Watch the **ledger**, not `balances`: `AdjustFutBal*` hits the *commitment's*
> future/unused balance (30800), so the *takedown's* current principal (30801) doesn't
> visibly change. And `financialTransactions/list` returns `404`-empty even on a funded
> loan — the real posted ledger is `financialHistory/listAllById/{obligationId}`.

## The real blocker for CASH movement = obligation offset instructions (NOT maturity)
Any transaction that moves cash **in or out** — `AdvanceCurrent`, `DisburseCurrent`,
`PayInterest`, `PayPrincipalBalanceCode`, `PayAccrualFee` — fails with:
> *"Offset Transaction must be defined at the obligor or obligation level."*

This is **not** satisfied by an inline `tmpOffsetEntry:{}`. The obligation needs
default payment/offset instructions (`obligorDDAInstructions` / `wp/ddaWireChanges`),
which are **403** for the dd3 credential pool. So cash can't move until a back-office
role sets up the loan's payment instructions. Purely-internal transactions
(`AdjustFutBal*`, revals) need no offset and post fine. Fee transactions
(`PayLateCharge`, `AssessPrepayPenalty`) instead need a matching charge code on the
loan (creating one = `feeManagement` `403`).

## `transaction` = the servicing API name (`apiName`)
The `transaction` value is the financial `apiName` (433-name catalog in
`financial_transaction_apis.md`), seen in `financialHistory/listAllById`. Confirmed
valid on live loans: `DisburseFuture`, `DisburseCurrent`, `AdvanceCurrent`,
`AdjustFutBalPayment`, `AdjustFutBalAdvance`. (`PaymentCurrent` is **not** valid →
*"…not found on the system API Table."*)

| transaction | meaning | notes |
|---|---|---|
| `DisburseFuture` | disburse the commitment / future balance | balance codes 54 / 53 / 51 / 55 |
| `DisburseCurrent` | disburse against a current obligation | cash-out — needs offset |
| `AdvanceCurrent` | advance against a current obligation | cash-out — needs offset |
| `AdjustFutBalPayment` / `AdjustFutBalAdvance` | internal future-balance reval | posts, no offset |

## `balanceCode` — obligation-specific, from `/balances/listFullKey/{key}`
Read them per obligation; passing one the obligation doesn't define →
*"Balance code definition (…) does not exist."* Live (obligor 5-34558):

| obligation | balance codes |
|---|---|
| 5-34558-18 (commitment) | 54 Commitment=$5M · 55 Takendown=$1M · 51 Unused=$4M · 53 Original |
| 5-34558-26 (takedown) | 10 Principal=$1M · 53 Original |

## Live-state validation — per-loan states, not universal walls
`createFinancial` validates against the obligation's servicing state. These are
**per-loan conditions** (our live 5-34558 loan hit none of them):

| condition | message |
|---|---|
| matured obligation | *"Obligation and/or commitment has matured; password is required."* |
| frozen obligation | *"Transaction not valid. Obligation in Frozen Status."* |
| future obln + DisburseCurrent | *"…only valid for current obligations."* |
| fully-disbursed balance | *"Balance Code has already been disbursed."* |

> ⚠️ The earlier sandbox loans (Zeppelin 5-13, Piedmont 34160, etc.) were all matured
> 2020–2022 vintages, which made the write *look* universally blocked and spawned a
> "matured / password required" myth. A freshly-booked loan (5-34558, matures 2027)
> clears maturity — the write works.

## Posts only to an already-booked obligation
`createFinancial` cannot bootstrap one: a reserved obligation number → `GET
/obligations/getFullKey` `404` → `createFinancial` SQL error (record doesn't exist).
Obligations are produced by origination workpackages and booked by completing the
workflow — see [`booking.md`](./booking.md).

## Takedown structure
A revolver advance = `DisburseCurrent` on a current obligation with `takenDownFromObln`
= the parent commitment. The first takedown establishing a current obligation under a
commitment is done via `/wp/advances2`, not `createFinancial` directly.
