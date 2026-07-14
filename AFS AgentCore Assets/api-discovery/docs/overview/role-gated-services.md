# Role-gated services & the Tier-A write surface  `[live-verified]`

_Definitive map of what the `dd3` sandbox credential pool (AFSDD301–310) can and
cannot do, measured live 2026-07-09. Supersedes inferences in `api-findings.md`._

> **Companion:** for what the credentials **can do** (reads, origination→booking, and
> ledger-proven servicing writes on a real booked loan), see
> [`servicing-api-capability.md`](./servicing-api-capability.md). That doc corrects an
> earlier assumption below: `createFinancial` is **not** maturity-blocked — on a live
> non-matured loan it posts internal transactions to the ledger, and the real wall for
> *cash* movement is the payment/offset-instruction setup (`obligorDDAInstructions`, `403`).

## Credential pool & tiers

10 sandbox accounts, all authenticate (`200`). They split into **two role tiers**,
which differ on exactly **one** read (`balances`) and nothing else measured:

| Tier | Accounts | Distinguishing capability |
|------|----------|---------------------------|
| **A** | AFSDD301, 302, 303 | everything Tier-B has **+ `/balances` read** (`200`) |
| **B** | AFSDD304–310 | `/balances` = `403` |

> Note: earlier `401`s on 301/302 were **failed-login lockouts** (auto-cleared after
> cooldown), **not** dead accounts. `403` = role; `401` = auth/lockout; distinct.

## Reads — the fully blocked set (uniform `403` across ALL 10 accounts)

37 endpoints, exploded into every concrete variant, probed per-account. **Every cell
`403`** — the Tier-A/B split does **not** reach any of these:

| Family | Variants | Result (all 10 accts) |
|--------|----------|-----------------------|
| Servicing-maint WPs (ddaWireChanges, feeManagement, nonFinancial, oblnRestructure, syndiDealPipeline) | GET `/{id}` ×5 | `403` |
| accrualSchedules | get/getFullKey/list/listFullKey | `403` |
| billingSchedules | ×4 | `403` |
| primeSchedules | ×4 | `403` |
| repaymentSchedules | get/list/listFullKey | `403` |
| rateIndicative | list/{bank} | `403` |
| penaltyDefinitions | list, listAllByBank | `403` |
| lateChargeControl | list/{bank}-{appl} | `403` |
| obligorDDAInstructions | get, list | `403` |
| obligorWireInstructions | list | `403` |
| assetSales | get/getFullKey/list/listFullKey | `403` |
| obligorApplications | get, list | `403` |
| banks | get, list | `403` |
| notePad | get/{id} | `403` |
| up/listTeams | — | `403` |

**370 read calls, 100% `403`.** This whole set is gated by a role class **no account in
the pool holds** (back-office / servicing-admin / bank-admin).

## What each blocked family does, and who owns it

The 37 blocked endpoints roll up into **19 service families**. Which bank role holds each,
and — critically — whether it's a **day-to-day servicing operation** vs **general config**:

| Family | What it does | Bank role | Op vs Config |
|---|---|---|---|
| `accrualSchedules` | How interest/charges accrue over time | Loan Servicing Ops | 🟢 day-to-day (per-loan) |
| `repaymentSchedules` | Amortization / repayment plan | Loan Servicing Officer | 🟢 day-to-day |
| `billingSchedules` | Billing/statement cadence | Loan Servicing / Billing | 🟢 day-to-day |
| `primeSchedules` | Prime/index-rate schedule | Treasury / Rate Admin | 🔴 config |
| `rateIndicative` | Bank's indicative rate tables | Treasury / Rate Admin | 🔴 config |
| `penaltyDefinitions` | Prepayment-penalty rule definitions | Product/Credit Policy | 🔴 config |
| `lateChargeControl` | Late-fee rules (grace, calc) | Servicing Admin / Collections | 🔴 config |
| `obligorDDAInstructions` | Borrower DDA auto-debit setup | Payment Ops / Cash Mgmt | 🟢 day-to-day |
| `obligorWireInstructions` | Borrower wire instructions | Wire Room / Payment Ops | 🟢 day-to-day |
| `wp/ddaWireChanges` | Change DDA/wire instructions | Payment Ops (dual-control) | 🟢 day-to-day |
| `wp/feeManagement` | Assess / waive / adjust fees | Loan Servicing Officer | 🟢 day-to-day |
| `wp/nonFinancial` | Non-monetary loan maintenance | Loan Servicing Officer | 🟢 day-to-day |
| `wp/oblnRestructure` | Restructure / re-amortize / extend | Workout / PM / Credit Officer | 🟡 event-driven |
| `wp/syndiDealPipeline` | Syndicated-deal pipeline | Syndications / Agency Desk | 🟡 event-driven |
| `assetSales` | Participations / loan sales | Loan Trading / Participations | 🟡 event-driven |
| `obligorApplications` | Borrower loan-application records | Underwriting / Origination | 🟡 event-driven |
| `banks` | Bank master / institution config | System / Bank Admin | 🔴 config |
| `notePad` | Free-text notes on obligors/obligations | Relationship Manager | 🟢 day-to-day |
| `up/listTeams` | User & servicing-team provisioning | Security / System Admin | 🔴 config |

**Reading it:** the 🔴 **config** blocks are *appropriate* — a servicer shouldn't rewrite the
bank's rate tables or penalty rules. The 🟢 **day-to-day** blocks are the real limitation — a
full servicing officer would normally have fee-waiver, payment-instruction, note, and schedule
access; our role doesn't. The 🟡 **event-driven** ones are only needed situationally.

The blocked families cluster into **four owners our credentials are not**: **Treasury/Rate
Admin**, **Payment Ops/Wire Room** (the very setup that blocks `createFinancial` cash posts —
see companion doc), **back-office Servicing Admin**, and **System/Bank Admin**.

## Writes — the Tier-A servicing surface (what we CAN do)

### Reachable — direct money movement (POST; empty `{}` → validation, no mutation)  `[live 303]`
| Endpoint | Empty-body | Meaning |
|----------|-----------|---------|
| `/createFinancial` | `400` | Post payment/advance/disburse/takedown/fee. **UPDATE (live-tested):** not maturity-blocked on a live loan — internal txns (`AdjustFutBal*`) **post to the ledger**; cash-movement txns need payment/offset instructions (`403`). See [`servicing-api-capability.md`](./servicing-api-capability.md). |
| `/createScheduledFinancial` | `400` | Schedule a future financial transaction. |
| `/exceptions/createException` | `200` (EX err) | Create a servicing exception. |

### Reachable — servicing workpackage initiation (POST → `201` draft)  `[Tier-A probe, AFSDD301]`
| Endpoint | Empty-body | Meaning |
|----------|-----------|---------|
| `/wp/advances2` | `201` | Advances workpackage |
| `/wp/payments2` | `201` | Payments workpackage |
| `/wp/otherFinancials2` | `201` | Other financial transactions |
| `/wp/otherMaintenance` | `201` | Non-financial servicing maintenance |
| `/wp/addressMaintenance` | `201` | Address maintenance |

> These `201`s **create a real draft workpackage**. To actually post, the WP must be
> **routed + approved** — and AFS enforces segregation of duties (originator ≠ approver),
> so a single account cannot both create and approve.

### Blocked for Tier-A (`403` on GET/PUT of existing; POST-empty `500`, ambiguous)
`/wp/ddaWireChanges`, `/wp/feeManagement`, `/wp/nonFinancial`, `/wp/oblnRestructure`,
`/wp/syndiDealPipeline` — the config/maintenance WP families. Read + update gated.

## Bottom line

**Tier-A servicing write capability = money movement + servicing-financial workpackage
initiation.** Specifically: post/schedule financial transactions (`createFinancial`,
`createScheduledFinancial`), raise exceptions, and open advances/payments/other-financial/
maintenance/address workpackages. It does **not** include: any schedule/rate/penalty/
late-charge/payment-instruction/asset-sale/bank config (all `403`), nor the ddaWire/fee/
nonFinancial/restructure maintenance packages.

## Recourse for the blocked set

Not obtainable by rotating credentials — **all 10 accounts, both tiers, are exhausted and
identical** on the blocked set. It requires a **broader-role grant** (back-office /
servicing-admin) from the AFS admin/helpdesk — an entitlement change on AFS's side.
