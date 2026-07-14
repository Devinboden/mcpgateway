# Mined keys (from captured responses — no new calls)

## Wanted path tokens — candidate values found

| Token | Distinct values (sample) | Found in (sample) |
|-------|--------------------------|-------------------|
| `addressId` | addressId=8149, addressId=8154, addressId=8155 | addresses__getPrimaryAddrByNameId, nameAddresses__list |
| `assocPrincipalBalanceCode` | assocPrincipalBalanceCode=10 | balances__listFullKey |
| `balanceCode` | balanceCode=10, balanceCode=39, balanceCode=51, balanceCode=53, balanceCode=54, balanceCode=55, balanceCode=70 | balances___outstandingBalances__list, balances__list, balances__listFullKey … |
| `billYear` | — none in captures — | |
| `chargeType` | chargeType=1, chargeType=4 | charges__getFullKey, charges__listFullKey |
| `dealId` | — none in captures — | |
| `depositInstructionId` | — none in captures — | |
| `formulaType` | — none in captures — | |
| `id` | id=1129, id=116, id=120, id=1219, id=1229, id=125, id=129, id=148 … | harvest__jobs_listByOfficers, jobs__joblistInquiry, jobs__listByOfficers |
| `invoiceNumber` | — none in captures — | |
| `notePadId` | — none in captures — | |
| `orgLevelType` | — none in captures — | |
| `orgLevelTypePointer` | — none in captures — | |
| `orgLevelValue` | — none in captures — | |
| `organizationId` | organizationId=1 | addresses__getPrimaryAddrByNameId, names__get, names__getByObligor |
| `penaltyId` | — none in captures — | |
| `penaltyIncrement` | — none in captures — | |
| `rateId` | — none in captures — | |
| `sequence` | sequence=1, sequence=2, sequence=3 | balances__list, balances__listFullKey, financialHistory__listAllById … |
| `tenantSequence` | — none in captures — | |
| `type` | type=1, type=2, type=3, type=3015, type=3040 | exposure__listCustomer, exposure__listObligor, financialInstrument___obligationDetails__getFullKey … |
| `wireId` | — none in captures — | |

## All id-like fields observed (Id/Number/Item/Code/Oid)

| Field | #distinct | values (sample) |
|-------|----------:|-----------------|
| `changeHistoryId` | 994 | 237485, 237486, 237487, 237488, 237489, 237490, 237491, 237492, 237493, 237494 … |
| `unitOid` | 201 | 9020000001214665, 9020000001216621, 9020000001228748, 9020000001318211, 9020000001318272, 9020000001329044, 9020000001817191, 9020000001995886, 9020000001998038, 9020000002035055 … |
| `longId` | 154 | 1129, 116, 120, 1219, 1229, 125, 129, 148, 149, 159 … |
| `userId` | 89 | 10, 100, 101, 102, 103, 107, 116, 117, 118, 119 … |
| `obligorNumber` | 45 | 1011, 1136, 1169, 1177, 12471, 12968, 13, 1318, 138, 1433 … |
| `orgLevelId` | 23 | 37917, 37918, 37922, 37923, 37924, 37925, 37926, 37953, 37954, 37959 … |
| `ownerId` | 23 | 101, 108, 111, 14, 149, 15, 2, 208, 21, 22 … |
| `financialInstrumentId` | 17 | 24073, 24074, 24075, 24096, 24097, 24100, 24103, 24128, 24154, 24155 … |
| `xrefNumber` | 17 | 000500000000001, 000500000000002, 000500000000003, 000500000000004, 000500000000005, 000500000000008, 000500000000011, 000500000000032, 000500000000052, 000500000000053 … |
| `shortXrefNumber` | 17 | 1, 11, 2, 3, 32, 4, 5, 52, 53, 561 … |
| `fiNumber` | 17 | 109, 117, 125, 18, 182, 190, 208, 216, 224, 26 … |
| `balanceCode` | 7 | 10, 39, 51, 53, 54, 55, 70 |
| `currencyCode` | 7 | AUD, BHD, CAD, EUR, GBP, KRW, USD |
| `costCenterId` | 6 | 0, 1001500, 1002500, 1003500, 1007500, 2001500 |
| `mgrCostCenterId` | 6 | 0, 1001500, 1002500, 1003500, 1007500, 2001500 |
| `collateralItem` | 4 | 18, 26, 34, 59 |
| `headerCode` | 4 | 51, 53, 54, 55 |
| `addressId` | 3 | 8149, 8154, 8155 |
| `rootTypeId` | 3 | 146, 49, 57 |
| `obligationId` | 2 | 24073, 24096 |
| `memoItem` | 2 | 1, 6 |
| `chargeCode` | 2 | 1000, 4700 |
| `naicsCode` | 2 | 423690, 711130 |
| `sicCode` | 2 | 3679, 3724 |
| `nameId` | 2 | 7866, 7868 |
| `securedCode` | 2 | 1, 4 |
| `officerId` | 2 | 10111111, 101111111 |
| `mgrOfficerId` | 2 | 0, 101111111 |
| `decisionId` | 2 | 1, 2 |
| `dispositionId` | 2 | 0, Approved |
| `alternateNameId` | 2 | 7866, 7871 |
| `zipCode` | 1 | 19341 |
| `organizationId` | 1 | 1 |
| `creditBureauResidenceCode` | 1 | 0 |
| `generalLedgerCode` | 1 | 10001 |
| `assocPrincipalBalanceCode` | 1 | 10 |
| `functionalCurrencyCode` | 1 | USD |
| `revalueDateLimitCode` | 1 | 3 |
| `revalueDateCalendarId` | 1 | 1 |
| `fxSiteId` | 1 | 1 |
| `issueStatusCode` | 1 | 1 |
| `obligationcurrencyCode` | 1 | USD |
| `beqCurrencyCode` | 1 | USD |
| `workPackageId` | 1 | 2 |
| `obligationCurrencyCode` | 1 | USD |
| `geographicCode` | 1 | US |
| `appId` | 1 | 1 |
| `bankId` | 1 | 5 |
| `lockUserId` | 1 | 15 |
| `checkCalendarId` | 1 | 1 |
| `durationCode` | 1 | 1 |
| `billTypeCode` | 1 | 1 |
| `partSettleDateCalendarId` | 1 | 1 |
| `billAloneCode` | 1 | 1 |
| `lateChargeModelCode` | 1 | 1000 |
| `nextStatementDateCalendarId` | 1 | 1 |
| `supportingCurrencyCode` | 1 | USD |
| `supportedCurrencyCode` | 1 | USD |
| `supportingCollateralItem` | 1 | 18 |
