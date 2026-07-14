# AFS picklist crosswalk — UI field → refList name (`/rs/pl/*`)

**114 of 147 harvested fields linked** to a callable refList name by option-set match (96 exact, rest ≥0.6 Jaccard). For a linked field, populate it directly with `GET /webx/rs/pl/fixed?name=<refList>` (or `/dynamic` for `ilm/pl/*`). Source catalogs: `harvested_picklists.json`, `picklist_api_names.json`. Unlinked fields are native `<select>`s or lists not exercised via `/rs/pl` this sweep.

> ⚠️ **Confidence:** links with **≥3 options are reliable** (distinctive code sets). 2-option Y/N-style matches (`#opts` = 2) can be **coincidental** — many boolean lists share the same `{0,1}`/`{N,Y}` codes — so treat those as hints, not proof.

| field id | label | refList name | kind | match | #opts |
|---|---|---|---|---:|---:|
| `activeInProd` | Active In Production | `CLRE464` | fixed | 1.0 | 2 |
| `advAftrMatOpt` | Advance After Maturity Option | `CLRE242` | fixed | 1.0 | 3 |
| `amtPctInd` | Amount/Percent | `APPL030` | fixed | 1.0 | 2 |
| `application` | Application | `APPL030` | fixed | 1.0 | 2 |
| `applicationCollected` | Application Collected | `Answers` | fixed | 1.0 | 2 |
| `assignmentUnit` | Assignment Unit | `*ORG050` | fixed | 1.0 | 16 |
| `autoWaiveInd` | Auto Waive Override | `CLRE464` | fixed | 1.0 | 2 |
| `bankTaxCode` | Bank Tax Code | `CLRE242` | fixed | 1.0 | 3 |
| `basis` | Basis | `ACCS203` | fixed | 1.0 | 7 |
| `calc1` | Calculation Type 1 | `PRMS206` | fixed | 1.0 | 5 |
| `calendarCode` | Calendar | `COBB221` | fixed | 1.0 | 3 |
| `ceyFeeInd` | FASB? | `CLRE464` | fixed | 1.0 | 2 |
| `chargeType` | Charge Type | `CHGH200` | fixed | 1.0 | 11 |
| `closeOptionInd` | Auto Close Commitment Option | `CLRE242` | fixed | 1.0 | 3 |
| `contactOfficer1` | Officer 1 | `*ORG402` | fixed | 1.0 | 14 |
| `controllingInterest` | Controlling Interest | `CLRE464` | fixed | 1.0 | 2 |
| `costCenter` | Assignment Unit | `*ORG050` | fixed | 1.0 | 16 |
| `country` | Country of Origin | `ADDR212` | fixed | 1.0 | 265 |
| `crBurCode` | Credit Bureau | `SUPR215` | fixed | 1.0 | 10 |
| `currencyCategory` | Currency Category | `CLRE464` | fixed | 1.0 | 2 |
| `currentOccupancyInd` | Current Occupancy Indicator | `CLRE242` | fixed | 1.0 | 3 |
| `curtypeInt` | Currency Type | `*CUR100` | fixed | 1.0 | 46 |
| `curtypeYr1` | Currency Type | `*CUR100` | fixed | 1.0 | 46 |
| `curtypeYr2` | Currency Type | `*CUR100` | fixed | 1.0 | 46 |
| `curtypeYr3` | Currency Type | `*CUR100` | fixed | 1.0 | 46 |
| `derivitiveInd` | Derivative Indicator | `CLRE242` | fixed | 1.0 | 3 |
| `earningType` | Tier/Earnings Type | `CHGH206` | fixed | 1.0 | 9 |
| `essentialGovernmentUse` | Essential Government Use | `CLRE464` | fixed | 1.0 | 2 |
| `fallbackLang` | Fallback Language | `CLRE464` | fixed | 1.0 | 2 |
| `frequencyCode` | Frequency | `COBB212` | fixed | 1.0 | 10 |
| `frozenFlag` | Frozen Status | `CLRE464` | fixed | 1.0 | 2 |
| `govrnmtContctPurpse` | Government Contract Purpose | `CLRE464` | fixed | 1.0 | 2 |
| `hasAppraisalInfo` | Appraisal Information | `Answers` | fixed | 1.0 | 2 |
| `hasInspectionInfo` | Inspection Information | `Answers` | fixed | 1.0 | 2 |
| `hasInsuranceInfo` | Insurance Information | `Answers` | fixed | 1.0 | 2 |
| `hasLienInfo` | Filing Information | `Answers` | fixed | 1.0 | 2 |
| `hasTenantInfo` | Tenant Information | `Answers` | fixed | 1.0 | 2 |
| `highlylevTrans` | Highly Leveraged Transaction | `CLRE464` | fixed | 1.0 | 2 |
| `improvementAmountSource` | Improvement Amount Source | `CLRE464` | fixed | 1.0 | 2 |
| `indBusInd` | Individual or Business | `CLRE464` | fixed | 1.0 | 2 |
| `indicator` | Indicator | `CLRE464` | fixed | 1.0 | 2 |
| `infrastructureAccess` | Infrastructure Access | `CLRE464` | fixed | 1.0 | 2 |
| `irrigated` | Irrigated | `CLRE464` | fixed | 1.0 | 2 |
| `isDataAccurate` | Is the data in the above field | `CLRE464` | fixed | 1.0 | 2 |
| `isTiers` | Is Pricing Based on Tiers? | `Answers` | fixed | 1.0 | 2 |
| `jurisdictionCode` | Jurisdiction | `CLRE464` | fixed | 1.0 | 2 |
| `landContamination` | Land Contamination | `CLRE464` | fixed | 1.0 | 2 |
| `landUseRestriction` | Land Use Restrictions | `CLRE464` | fixed | 1.0 | 2 |
| `letterOfCredit` | Letter of Credit Type | `ilm/pl/LetterOfCreditType` | dynamic | 1.0 | 2 |
| `lobOverride` | Line of Business Override | `CLRE464` | fixed | 1.0 | 2 |
| `noiIndicator` | NOI Indicator | `CLRE242` | fixed | 1.0 | 3 |
| `onlineBankEligInd` | Online Banking Eligibility | `CLRE464` | fixed | 1.0 | 2 |
| `orgLevels0` | User Defined 1 | `*ORG001` | fixed | 1.0 | 4 |
| `orgLevels1` | User Defined 2 | `*ORG002` | fixed | 1.0 | 68 |
| `orgLevels10` | Officer 1 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels11` | Officer 2 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels12` | Officer 3 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels13` | Officer 4 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels14` | Officer 5 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels15` | Officer 6 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels16` | Officer 7 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels17` | Officer 8 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels18` | Officer 9 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels19` | Officer 10 | `*ORG402` | fixed | 1.0 | 14 |
| `orgLevels2` | User Defined 3 | `*ORG003` | fixed | 1.0 | 5 |
| `orgLevels8` | Assignment Unit | `*ORG050` | fixed | 1.0 | 16 |
| `orgLevels9` | Service Unit | `*ORG060` | fixed | 1.0 | 7 |
| `overrideFASBCost` | Override FASB Cost | `APPL030` | fixed | 1.0 | 2 |
| `ownershipInterest` | Ownership Interest | `CLRE242` | fixed | 1.0 | 3 |
| `partSyndi` | Participation / Syndication | `Answers` | fixed | 1.0 | 2 |
| `pastDueNotice` | Past Due Notice to Indirect | `CLRE464` | fixed | 1.0 | 2 |
| `paymentTypeCode` | Payment Type | `Payment+Type+Code` | fixed | 1.0 | 4 |
| `pctAmtSelector` | Limit by Percent or Amount | `APPL030` | fixed | 1.0 | 2 |
| `pricingMethod` | Pricing Method | `Pricing+Method` | fixed | 1.0 | 2 |
| `pricingOption` | Pricing Option | `ilm/pl/PricingOption` | dynamic | 1.0 | 2 |
| `primaryOccupancy` | Primary Occupancy | `CLRE245` | fixed | 1.0 | 14 |
| `primaryState` | Primary State | `ADDR209` | fixed | 1.0 | 82 |
| `prinRepayInd` | Principal Repayment? | `Answers` | fixed | 1.0 | 2 |
| `productStructure` | Product | `Product Structure` | fixed | 1.0 | 3 |
| `propertyCategory` | Property Category | `CLRE203` | fixed | 1.0 | 4 |
| `propertyType` | Property Type | `CLRE206` | fixed | 1.0 | 4 |
| `ratingFrequency` | Rating Frequency | `COBB212` | fixed | 1.0 | 10 |
| `react-select-24-input` |  | `Answers` | fixed | 1.0 | 2 |
| `reasonCode` | Reason Code | `RSKR203` | fixed | 1.0 | 3 |
| `recourse` | Recourse | `CLRE464` | fixed | 1.0 | 2 |
| `release` | Release | `Answers` | fixed | 1.0 | 2 |
| `safeKeepingCode` | Safekeeping Code | `CLRE464` | fixed | 1.0 | 2 |
| `sbaProgram` | SBA | `Answers` | fixed | 1.0 | 2 |
| `searchType` | Search By | `APPL030` | fixed | 1.0 | 2 |
| `serviceUnit` | Service Unit | `*ORG060` | fixed | 1.0 | 7 |
| `siteId` | FX Site ID | `CLRE464` | fixed | 1.0 | 2 |
| `state` | State/Province | `ADDR209` | fixed | 1.0 | 82 |
| `supportType` | Support Type | `ilm/pl/GuaranteeSupportType` | dynamic | 1.0 | 9 |
| `timeZone` | Time Zone | `ADDR233` | fixed | 1.0 | 25 |
| `underwritingOfficer` | Officer 2 | `*ORG402` | fixed | 1.0 | 14 |
| `waterRights` | Water Rights | `CLRE464` | fixed | 1.0 | 2 |
| `expirationDateLimit` | Expiration Date Limit | `COBB203` | fixed | 0.909 | 10 |
| `limitCode` | Limit | `COBB203` | fixed | 0.909 | 10 |
| `methOfCollection` | Method of Collection | `REPY254` | fixed | 0.9 | 9 |
| `industryCode` | Industry Code | `ACCS203` | fixed | 0.857 | 6 |
| `prnBalPmntOrder` | Principal Spread Option | `ACCS203` | fixed | 0.857 | 6 |
| `permanentWaiveReason` | Permanent Waive Reason | `PRMS206` | fixed | 0.8 | 4 |
| `feeTitleCode` | Fee Title | `Fee+Title` | fixed | 0.778 | 28 |
| `poolEligibility` | Loss Allowance Pool Eligibilit | `CLRE242` | fixed | 0.75 | 4 |
| `craInd` | CRA Indicator | `ACCS203` | fixed | 0.714 | 5 |
| `formula` | Freeze Formula | `ACCS203` | fixed | 0.714 | 5 |
| `securedCode` | Secured Code | `ACCS203` | fixed | 0.714 | 5 |
| `billAloneCode` | Bill Alone Indicator | `APPL030` | fixed | 0.667 | 3 |
| `initiallPayableInd` | Initially Payable Indicator | `APPL030` | fixed | 0.667 | 3 |
| `maturityInd` | Maturity Period | `APPL030` | fixed | 0.667 | 3 |
| `prepayCode` | Prepay Code | `CLRE464` | fixed | 0.667 | 3 |
| `submissionInd` | Submission Indicator | `APPL030` | fixed | 0.667 | 3 |
| `lateChargeFormulaType` | Late Charge Formula | `COBB212` | fixed | 0.625 | 16 |
| `paidLoanEligibility` | Paid Loan Indicator | `SUPR215` | fixed | 0.6 | 6 |
