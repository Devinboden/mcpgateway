# AFS Vision API — Executive Inventory

_Generated from the 110 OpenAPI specs + live findings. Two faces: **build a bespoke loan** (write/origination) and **pull all data** (read/servicing)._

| | Origination / Workflow (`wf`) | Servicing (`svc`) |
|---|---|---|
| Specs | 48 | 62 |
| Read (GET) services | 58 | 173 |
| Total read services | **231** | (per findings_all: 231 incl. duplicates across specs) |
| Write (POST/PUT) ops | 57 (see ../writes/SCHEMAS.md) | 0 (svc is read-only) |

---

## A. Build a bespoke loan — the writable model

**Proven build chain** (live, all 200/201 — see ../build/loan-build-log.md):

| Step | Endpoint | Required fields | Mints |
|------|----------|-----------------|-------|
| 1 | `POST /createCustomer` | organizationId · customer.name.fullName (needs `*` prefix in dd3) | customer ilmId |
| 2 | `POST /createObligor` | obligor.bankId · shortName · type · ilmId · **orgLevelData(assignmentUnit, officer1)** | obligor number |
| 3 | `POST /reserveNumber` | correlationId · bankId · obligorNumber · reserveType(2=obln) · expirationDays | reserved obligation # |
| 4 | `POST /wp/commercialOrig` | (workpackage — builds the loan; see field model below) | origination WP id |
| 5 | route → approve → accept → close | `/route` + UI decision/acceptance/closing | unit `complete` |
| 6 | (book) | complete the workflow to the **Funding/Booking** stage → "Yes – Execute" (proven end-to-end via the UI; no one-shot API endpoint — see [../writes/booking.md](../writes/booking.md)) | servicing obligation |
| 7 | `POST /createFinancial` | financial.{bankNumber,application,oblgrNumber,oblnNumber,effectiveDate,transaction,balanceCode} + tranAmount | financial txn on booked obln |

**The bespoke-loan payload** (`Wf-cbm-VisionOrigWorkPackage`, 64 top-level + deeply nested). Object tree with field counts — full field lists in [../field-model/origination-field-model.md](../field-model/origination-field-model.md):

| Object | Schema | Direct fields | What it sets |
|--------|--------|--------------:|--------------|
| `parties[]` | Wf-cbm-Party | 85 | customer/borrower entity |
| `parties[].obligors[]` | Wf-cbm-Obligor | 107 | the obligor (bank, type, fx, finStmt, geo, NAICS) |
| `deal` | Wf-cbm-Deal | 24 | applicationCollected, decisions, approvalReq, fee charges |
| `deal.requests[]` | Wf-cbm-Request | 109 | the credit request (amount, product, application, dates) |
| `deal.requests[].obligations[]` | Wf-cbm-Obligation | 316 | **the loan itself** — type, GL, rate, maturity, collateral, ratings, LTV, escrow, … |
| `collateralItems[]` | Wf-cbm-Collateral | 131 | collateral (RE, UCC, value, flood, insurance) |
| `guarantees[]` | Wf-cbm-Guarantee | 30 | guarantors |
| `lender` | Wf-cbm-Lender | 7 | officer + assignment unit (officer-view visibility) |
| `underWriting` | Wf-cbm-Underwriting | 6 | underwriting data |

> **The obligation (the loan) alone exposes 316 fields** — productStructure, obligationType, GL, secured/collateral, rate & repricing, maturity & duration, amortization, escrow, ratings (PD/LGD/Final Grade), LTV, RAROC, regulatory, participation, SBA, etc. `productStructure:"C"` = Standalone Loan (directly bookable); `"F"` = Commitment. All codes catalogued in [../valid-values/catalog.md](../valid-values/catalog.md).

**Servicing-style create writes** (the non-workpackage ones):
- `createCustomer` (Wf-cbm-Party) · `createObligor` (Wf-cbm-Obligor) · `reserveNumber` · `createFinancial` / `createScheduledFinancial` (Wf-cbm-FinancialTransaction — fund/advance/pay/adjust an existing obligation).
- Full write field models: [../writes/SCHEMAS.md](../writes/SCHEMAS.md).

---

## B. Pull all data — the read catalog

Every readable resource, by domain. **Key** = positional hyphen-joined composite (e.g. `5-13` bank-obligor, `5-13-42` +obligation). **Response model** = the payload schema returned. **Fields** = that model's direct field count (`·N` = total incl. nested, depth-2) — each coded field carries a sibling `<field>Lit` human label. **Live 200** = `<200s captured>/<services>` for the seed obligor (Zeppelin 5-13); 0/n usually = empty-for-seed or needs another key, not broken (see ../field-model/all-endpoints/).

### Obligor / Customer

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `ObligorRoot` | ObligorRoot | {id} | xom-ObligorRoot | 47 (·87) | 0/1 |
| `addressMaintenance` | addressMaintenance | {id} | LoanAdminWorkPackage | 61 (·1227) | 0/2 |
| `addresses` | get; getPrimaryAddrByNameId | {addressId} | Address | 25 | 2/2 |
| `citizenships` | get; list | {nameId-sequence} | Citizenship | 6 | 0/2 |
| `customName` | get; list | {nameId} | CustomName | 3 | 0/2 |
| `customObligor` | get; list | {bank-obligor} | CustomObligor | 4 | 0/2 |
| `customObligorApplication` | get; list | {bank-obligor-application} | CustomObligorApplication | 5 | 0/2 |
| `customerIdentifications` | get; list | {nameId-sequence} | CustomerIdentification | 11 | 0/2 |
| `nameAddresses` | get; list; listAlternateAddresses | {nameId-sequence} | NameAddress | 11 | 1/3 |
| `names` | get; getByObligor; list; listBySSN; listByTaxId | {—} | Name | 91 | 2/5 |
| `obligorApplications` | get; list | {bank-obligor-application} | ObligorApplication | 57 | 0/2 |
| `obligorDDAInstructions` | get; list | {bank-obligor-sequence} | ObligorDDAInstruction | 11 | 0/2 |
| `obligorWireInstructions` | get; list | {bank-obligor-wireId} | ObligorWireInstruction | 32 | 0/2 |
| `obligors` | get; list; listAllByBank; listByNameId | {bank-obligor} | Obligor | 90 | 3/4 |
| `phones` | get; list | {—} | Phone | 7 | 0/2 |

### Obligation

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `ObligationRoot` | ObligationRoot | {id} | xom-ObligationRoot | 39 (·57) | 0/1 |
| `currentObligations` | get; getFullKey | {obligationId} | CurrentObligation | 113 | 1/2 |
| `customObligation` | get; list | {obligationId} | CustomObligation | 7 | 0/2 |
| `futureObligations` | get; getFullKey | {obligationId} | FutureObligation | 26 | 1/2 |
| `obligations` | get; getFullKey; getFullKeyPayoff | {obligationId} | Obligation | 295 | 3/3 |

### Balances & Financials

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `balances` | get; getFullKey; list; listFullKey | {obligationId-balanceCode} | Balance | 69 | 2/4 |
| `financialHistory` | effectiveFrom; get; list; listAllById; numberOfDays | {obligationId} | FinancialHistory | 56 | 1/5 |
| `financialHistorySchedAct` | get; list | {obligationId-sequence} | FinancialHistorySchedAct | 12 | 0/2 |
| `financialInstrument` | get; getFullKey; listAllByObligor; listAllByObligorApp | {financialInstrumentId} | FinancialInstrument | 74 | 4/6 |
| `nonFinancial` | nonFinancial | {id} | LoanAdminWorkPackage | 77 (·4138) | 0/2 |
| `otherFinancials2` | otherFinancials2 | {id} | LoanAdminWorkPackage | 72 (·3290) | 0/2 |

### Charges & Fees

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `amortizationSchedCharge` | get; getFullKey; list; listFullKey | {obligationId-type-chargeCode} | AmortizationSchedCharge | 7 | 0/4 |
| `charges` | get; getFullKey; list; listFullKey | {obligationId-chargeCode} | Charge | 126 | 2/4 |
| `feeManagement` | feeManagement | {id} | LoanAdminWorkPackage | 80 (·4143) | 0/2 |
| `flatFees` | get; getFullKey; list; listFullKey | {obligationId-chargeCode} | FlatFee | 22 | 0/4 |
| `lateChargeControl` | get; list | {bank-application-formulaType} | LateChargeControl | 19 | 0/2 |
| `penaltyAmountCurrencies` | get; list | {bank-application-penaltyId} | PenaltyAmountCurrency | 9 | 0/2 |
| `penaltyAmountIncrements` | get; list | {bank-application-penaltyId-penaltyIncrement} | PenaltyAmountIncrement | 6 | 0/2 |
| `penaltyDefinitions` | get; list; listAllByBank | {bank-application-penaltyId} | PenaltyDefinition | 32 | 0/3 |

### Billing & Invoices

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `billingSchedules` | get; getFullKey; list; listFullKey | {obligationId-chargeCode} | BillingSchedule | 51 | 0/4 |
| `invoiceLineItems` | get; list; listByInvoice; listByInvoiceObln; listByObl | {bank-billYear-invoiceNumber-obligation-chargeCode-chargeType} | InvoiceLineItem | 63 | 0/6 |
| `invoices` | get; list; listAllByObligor; listbyobg | {bank-billYear-invoiceNumber} | Invoice | 14 | 0/4 |

### Schedules

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `accrualSchedules` | get; getFullKey; list; listFullKey | {obligationId-chargeCode} | AccrualSchedule | 24 | 0/4 |
| `amortizationSchedule` | get; getFullKey; list; listByOblnId; listFullKey | {obligationId-type} | AmortizationSchedule | 5 | 0/5 |
| `primeSchedules` | get; getFullKey; list; listFullKey | {obligationId-chargeCode} | PrimeSchedule | 53 | 0/4 |
| `repaymentSchedules` | get; list; listFullKey | {obligationId} | RepaymentSchedule | 42 | 0/3 |
| `scheduledActivity` | get; list; listByOblnId | {dealId-obligationId-sequence} | ScheduledActivity | 56 | 0/3 |

### Collateral

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `CollateralRoot` | CollateralRoot | {id} | xom-CollateralRoot | 46 (·106) | 0/1 |
| `collBorrowingBase` | get | {bank-obligor-collateralItem} | CollBorrowingBase | 17 | 0/1 |
| `collFloodFilings` | get; list | {bank-obligor-collateralItem-sequence} | CollFloodFiling | 22 | 0/2 |
| `collNegotHistory` | get; list | {bank-obligor-collateralItem} | CollNegotHistory | 12 | 0/2 |
| `collNegotReprice` | get; list | {bank} | CollNegotReprice | 36 | 1/2 |
| `collRETenant` | get; list | {bank-obligor-collateralItem-tenantSequence} | CollRETenant | 21 | 0/2 |
| `collRealEstate` | get | {bank-obligor-collateralItem} | CollRealEstate | 86 | 1/1 |
| `collateral` | get; list | {bank-obligor-collateralItem} | Collateral | 84 | 2/2 |
| `collateralInsurance` | get; list | {bank-obligor-collateralItem-sequence} | CollateralInsurance | 45 | 0/2 |
| `collateralNegotiable` | get; list | {bank-obligor-collateralItem} | CollateralNegotiable | 18 | 1/2 |
| `customCollateral` | get; list | {bank-obligor-collateralItem} | CustomCollateral | 5 | 0/2 |
| `exceptionCollateral` | exceptionCollateral | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionDocCollateral` | exceptionDocCollateral | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `supportReferences` | get; list; listIndObligorLiab; listIndObligorSupp; lis | {supportingBank-supportingObligor-supportingCollateralItem-supportedObligor-supportedAplication-supportedObligation} | SupportReference | 34 | 2/7 |

### Exposure & Risk

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `exposure` | listCustomer; listObligor | {nameId} | Exposure | 39 | 2/2 |

### Rates & Repricing

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `rateIndicative` | get; list | {bank-rateId} | RateIndicative | 31 | 0/2 |

### Instructions

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `ddaWireChanges` | ddaWireChanges | {id} | LoanAdminWorkPackage | 78 (·4144) | 0/2 |
| `depositInstructions` | get; list | {nameId-sequence-depositInstructionId} | DepositInstruction | 12 | 0/2 |
| `wireInstructions` | get; list | {nameId-sequence-wireId} | WireInstruction | 34 | 0/2 |

### Org / Hierarchy

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `banks` | get; list | {bank} | Bank | 186 | 0/2 |
| `orgLevelData` | get; list | {organizationId-bank-orgLevelType-orgLevelValue} | OrgLevelData | 6 | 0/2 |
| `orgLevelPointer` | get; list | {organizationId-bank-orgLevelType-orgLevelValue-orgLevelTypePointer} | OrgLevelPointer | 7 | 0/2 |
| `organizationLevels` | get | {orgLevelId} | OrganizationLevel | 141 | 1/1 |

### Custom Fields

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `customDeal` | get; list | {bank-dealId} | CustomDeal | 4 | 0/2 |
| `customEscrow` | get; list | {obligationId} | CustomEscrow | 7 | 0/2 |

### Reference / Lookups

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `apis` | get; list; listByCategory; listCategories | {—} | Api | 43 | 1/4 |

### Other

| Resource | GET services | Key | Response model | Fields | Live 200 |
|----------|--------------|-----|----------------|-------:|----------|
| `ExceptionType` | ExceptionType | {id} | xom-cfg-ExceptionType | 43 (·71) | 0/1 |
| `QueueAdmin` | QueueAdmin | {id} | wum-Queue | 31 (·47) | 0/1 |
| `QueueGroupAdmin` | QueueGroupAdmin | {id} | qg-QueueGroup | 32 (·57) | 0/1 |
| `abe` | schedules; tasks | {—} | abe-Schedule | 18 (·20) | 0/3 |
| `advances2` | advances2 | {id} | LoanAdminWorkPackage | 72 (·3289) | 0/2 |
| `alertType` | alertType | {id} | alert-AlertType | 35 (·74) | 0/1 |
| `assetSales` | get; getFullKey; list; listFullKey | {obligationId} | AssetSale | 11 | 0/4 |
| `commercialOrig` | commercialOrig | {id} | VisionOrigWorkPackage | 64 (·2496) | 0/2 |
| `commercialPost` | commercialPost | {id} | VisionOrigWorkPackage | 64 (·2250) | 0/2 |
| `doc` | apicatalog; apidoc | {—} | · | · | 0/2 |
| `employees` | {id} | {id} | ws-employee-EmployeeDefinition | 5 (·103) | 0/2 |
| `exceptionCovenants` | exceptionCovenants | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionCreditPolicy` | exceptionCreditPolicy | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionEntity` | exceptionEntity | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionNoteLoan` | exceptionNoteLoan | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionProcessing` | exceptionProcessing | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionRequirements` | exceptionRequirements | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptionReview` | exceptionReview | {id} | xom-ExceptionWorkpackage | 32 (·266) | 0/1 |
| `exceptions` | listExceptions | {—} | xom-ws-Response | 4 (·126) | 1/2 |
| `holderofrecords` | allAdminsByEntityForASelectedHolderOfRecord; allDealsF | {—} | ws-holderofRecords-HolderofRecordsResponse | 4 (·78) | 0/5 |
| `jobs` | joblistInquiry; listByOfficers | {—} | jl-WorkPackageEntry | 72 (·241) | 2/4 |
| `notePad` | get | {notePadId} | NotePad | 6 | 0/1 |
| `oblnRestructure` | oblnRestructure | {id} | LoanAdminWorkPackage | 78 (·4146) | 0/2 |
| `offsetTranCtrl` | get; list; listByBank | {bank} | OffsetTranCtrl | 20 | 1/3 |
| `otherMaintenance` | otherMaintenance | {id} | LoanAdminWorkPackage | 67 (·3299) | 0/2 |
| `payments2` | payments2 | {id} | LoanAdminWorkPackage | 72 (·3290) | 0/2 |
| `pba` | get; getFullKey; list; listByBalance; listFullKey | {obligationId-balanceCode-assocPrincipalBalanceCode-sequence} | Pba | 11 | 0/5 |
| `ping` | /ping | {—} | rs-api-sample-PingData | 15 (·24) | 1/2 |
| `repricing2` | repricing2 | {id} | LoanAdminWorkPackage | 77 (·2831) | 0/2 |
| `roleAdmin` | roleAdmin | {id} | up-Role | 38 (·85) | 0/1 |
| `syndiDealMaintenance` | syndiDealMaintenance | {id} | SyndiWorkPackage | 76 (·4038) | 0/2 |
| `syndiDealPipeline` | syndiDealPipeline | {id} | SyndiWorkPackage | 76 (·2085) | 0/2 |
| `syndiRepricing` | syndiRepricing | {id} | SyndiWorkPackage | 76 (·4038) | 0/2 |
| `up` | listAlertTypes; listContextGroups; listCreditAuthority | {—} | adm-ContextGroup | 29 (·45) | 8/11 |
| `userProfileAdmin` | userProfileAdmin | {id} | up-UserProfile | 57 (·121) | 0/2 |

---

## C. Pull EVERYTHING for one booked loan — recipe
Given `bank-obligor` (e.g. 5-13) and `bank-obligor-obligation` (5-13-42):
1. **Entity:** `/obligors/get/{b-o}` · `/names/...` · `/addresses/...` · `/phones/list/...` · `/citizenships/...` · `/obligorApplications/...`
2. **Exposure/risk:** `/exposure/listObligor/{b-o}` · `/organizationLevels/...`
3. **Obligation:** `/obligations/getFullKey/{b-o-obln}` (pin a `pattern`) · `/currentObligations/...` · `/futureObligations/...` · `/financialInstrument/...`
4. **Money:** `/balances/listFullKey/{b-o-obln}` (commitment/takendown/unused/principal) · `/financialHistory/listAllById/{obligationId}` (every posted txn = `apiName`) · `/charges/...` · `/flatFees/...` · `/accrualSchedules/...`
5. **Collateral:** `/collateral/list/{b-o}` · `/collRealEstate/...` · `/supportReferences/...` · `/collateralInsurance/...` · `/collFloodFilings/...`
6. **Schedules/billing:** `/amortizationSchedule/...` · `/repaymentSchedules/...` · `/billingSchedules/...` · `/invoices/...` · `/invoiceLineItems/...`

> Mechanics (auth, headers, key shapes, the `pattern` projection param, 404=empty) in [../mechanics/call-mechanics.md](../mechanics/call-mechanics.md); per-resource field models in [../field-model/all-endpoints/](../field-model/all-endpoints/INDEX.md).