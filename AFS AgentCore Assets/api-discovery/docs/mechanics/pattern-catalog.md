# AFS Pattern Catalog — System patterns

The pattern layer that the OpenAPI specs do **not** encode (spec only has a free-text
`pattern` query param). Captured from the Pattern Admin UI (dd3), 2026-06-25.

- **Service Name** = the invocation variant the pattern is bound to (`get`,
  `getFullKey`, `list`, `listFullKey`, `listOblnByObg`, `listByNameId`, etc.).
  This drives which key/params the call needs — a key piece of undocumented logic.
- Only **System** patterns (`_underscore`) listed — portable/reusable. User patterns
  (test/saved queries like `chargeTest`, `obligationsDetail3008…`) excluded as env noise.
- All System patterns show **Active = No** in the UI — to verify against live behavior.
- Field projections per pattern were **not pursued** (would need calling each endpoint
  with `?pattern=<name>` and recording returned fields — low value vs the resolved list).

---

## `/financialInstrument` — Financial Instrument (15 patterns; 10 System)

| Pattern | Service Name |
|---------|--------------|
| `_chargesDetail` | get |
| `_chargesList` | get |
| `_obligationDetails` | getFullKey |
| `_obligationDetails2` | get |
| `_obligationList` | listOblnByObg |
| `_obligationList` | listOblnByObgAppl |
| `_outstandingBalances` | get |
| `_payoffDetails` | get |
| `_repaymentDetails` | getFullKey |
| `_transactionHistory` | getFullKey |

## `/organizationLevels` — Organization Levels Pivot (13 patterns; 10 System)

| Pattern | Service Name |
|---------|--------------|
| `_obligationList` | get |
| `_orgLevelCollateral` | get |
| `_orgLevelDeal` | get |
| `_orgLevelName` | get |
| `_orgLevelNameOrg1` | get |
| `_orgLevelObligation` | get |
| `_orgLevelObligor` | get |
| `_orgLevelTrade` | get |
| `_payoffDetails` | get |
| `_serviceUnit` | get |

## `/obligations` — Obligations (12 patterns; 6 System)

| Pattern | Service Name |
|---------|--------------|
| `_obligationDetails` | get |
| `_obligationDetails2` | getFullKey |
| `_obligationList` | get |
| `_outstandingBalances` | getFullKey |
| `_payoffDetails` | getFullKeyPayoff |
| `_transactionHistory` | get |

## `/charges` — Charges (11 patterns; 4 System)

| Pattern | Service Name |
|---------|--------------|
| `_chargesDetail` | getFullKey |
| `_chargesList` | getFullKey |
| `_chargesList` | listFullKey |
| `_payoffDetails` | list |

## `/obligors` — Obligors (9 patterns; 4 System)

| Pattern | Service Name |
|---------|--------------|
| `_customerSearch` | list |
| `_obligorDetails` | get |
| `_obligorsList` | listByNameId |
| `_payoffDetails` | get |

## `/currentObligations` — Current Obligation Information (8 patterns; 4 System)

| Pattern | Service Name |
|---------|--------------|
| `_obligationDetails` | get |
| `_obligationDetails2` | get |
| `_obligationList` | get |
| `_payoffDetails` | get |

## `/futureObligations` — Future Obligation Information (7 patterns; 4 System)

| Pattern | Service Name |
|---------|--------------|
| `_obligationDetails` | get |
| `_obligationDetails2` | get |
| `_obligationList` | get |
| `_payoffDetails` | get |

## `/names` — Names (7 patterns; 5 System)

| Pattern | Service Name |
|---------|--------------|
| `_collateralDetail` | get |
| `_customerDetail` | get |
| `_customerSearch` | any |
| `_nameOnly` | get |
| `_orgLevelDetail` | get |

## `/addresses` — Address information (6 patterns; 5 System)

| Pattern | Service Name |
|---------|--------------|
| `_alternateAddresses` | get |
| `_collateralDetail` | getPrimaryAddrByNameId |
| `_customerDetail` | getPrimaryAddrByNameId |
| `_customerSearch` | getPrimaryAddrByNameId |
| `_orgLevelDetail` | getPrimaryAddrByNameId |

## `/flatFees` — Flat Fees (6 patterns; 2 System)

| Pattern | Service Name |
|---------|--------------|
| `_chargesList` | get |
| `_payoffDetails` | get |

## `/balances` — Balance Information (5 patterns; 1 System)

| Pattern | Service Name |
|---------|--------------|
| `_outstandingBalances` | list |

## `/supportReferences` — Support References (5 patterns; 5 System)

| Pattern | Service Name |
|---------|--------------|
| `_collateralDetail` | listSupportedByItem |
| `_indirectObligationSupport` | listIndOblnSupport |
| `_indirectObligorLiability` | listIndObligorLiab |
| `_indirectObligorSupport` | listIndObligorSupp |
| `_listSupportingCollateral` | listSupportingColl |

## `/collateralNegotiable` — Collateral Negotiable (4 patterns; 2 System)

| Pattern | Service Name |
|---------|--------------|
| `_collateralDetail` | get |
| `_listSupportingCollateral` | get |

## `/invoiceLineItems` — Invoice Line Items (4 patterns; 4 System)

| Pattern | Service Name |
|---------|--------------|
| `_invoicesDetail` | listByInvoice |
| `_invoicesDetail` | listByInvoiceObln |
| `_invoicesList` | listByObligation |
| `_invoicesList` | listByObligor |

## `/accrualSchedules` — Accrual Schedules (3 patterns; 3 System)

| Pattern | Service Name |
|---------|--------------|
| `_chargesDetail` | get |
| `_chargesList` | get |
| `_payoffDetails` | get |

## `/apis` — Financial Transaction Apis (3 patterns; 2 System)

| Pattern | Service Name |
|---------|--------------|
| `_categoryOnly` | listCategories |
| `_descriptionOnly` | get |

## `/collateral` — Collateral (3 patterns; 3 System)

| Pattern | Service Name |
|---------|--------------|
| `_collateralDetail` | get |
| `_collateralList` | list |
| `_listSupportingCollateral` | get |

## `/phones` — Phone Numbers for all Customers (3 patterns; 3 System)

| Pattern | Service Name |
|---------|--------------|
| `_customerDetail` | list |
| `_customerSearch` | list |
| `_orgLevelDetail` | list |
