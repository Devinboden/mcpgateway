# Write operations — validation findings

Safe creates probed with an empty `{}` body (rejected → required-field / error-code messages; nothing created). Stateful/destructive/batch ops documented from spec only (NOT called).

Total writes: 57 · probed (safe-create): 22 · spec-only (risky): 35

## Safe creates — empty-body validation probe

| Method | Path | Required (spec) | Empty-{} status | First message |
|--------|------|-----------------|-----------------|---------------|
| POST | `/wp/addressMaintenance` | — | 201 | [required\|code 1] Step 'Customer Search': A customer must be selected. |
| POST | `/wp/advances2` | — | 201 | [required\|code 1] Step 'Transaction Management': At least one transaction must be added. |
| POST | `/wp/commercialOrig` | — | 201 |  |
| POST | `/wp/commercialPost` | — | 201 | [required\|code 1] Step 'Customer Management': At least one Customer must have 'Obligor Req |
| POST | `/wp/ddaWireChanges` | — | 500 | <!DOCTYPE html>

<html lang="en">
  <head>
    <meta http-equiv="X-UA-Compatible" cont |
| POST | `/employees` | bankId, orgLevelId, organizationId | 400 | [error\|code 1] Required field 'organizationId' was not provided. |
| POST | `/exceptions/createException` | — | 200 | [error\|code EX020900007] Element organizationId is missing and required. |
| POST | `/wp/feeManagement` | — | 500 | <!DOCTYPE html>

<html lang="en">
  <head>
    <meta http-equiv="X-UA-Compatible" cont |
| POST | `/createFinancial` | financial | 400 | [error\|code 1] Required field 'financial' was not provided. |
| POST | `/createScheduledFinancial` | scheduledFinancial | 400 | [error\|code 1] Required field 'scheduledFinancial' was not provided. |
| POST | `/wp/nonFinancial` | — | 500 | <!DOCTYPE html>

<html lang="en">
  <head>
    <meta http-equiv="X-UA-Compatible" cont |
| POST | `/wp/otherFinancials2` | — | 201 | [required\|code 1] Step 'Transaction Management': At least one transaction must be added. |
| POST | `/wp/otherMaintenance` | — | 201 | [required\|code 1] Step 'Customer/Obligor Search': A customer must be selected. |
| POST | `/wp/payments2` | — | 201 | [required\|code 1] Step 'Transaction Management': At least one transaction must be added. |
| POST | `/ping/echo` | — | 204 |  |
| POST | `/reserveNumber` | correlationId, bankId, obligorNumber, reserveType, expirationDays | 400 | [error\|code 1] Required field 'bankId' was not provided. |
| POST | `/createCustomer` | organizationId, customer | 400 | [error\|code 1] Required field 'organizationId' was not provided. |
| POST | `/createObligor` | obligor | 400 | [error\|code 1] Required field 'obligor' was not provided. |
| POST | `/wp/syndiDealMaintenance` | — | 201 |  |
| POST | `/wp/syndiDealPipeline` | — | 500 | <!DOCTYPE html>

<html lang="en">
  <head>
    <meta http-equiv="X-UA-Compatible" cont |
| POST | `/wp/userProfileAdmin` | userId, primaryName, defaultBank, defaultAppl, selectedQueueGroups, defaultQueue, defaultOrg, timezone | 400 | [error\|code 1] Required field 'userId' was not provided. |
| POST | `/wp/userProfileAdmin/{id}` | userId, primaryName, defaultBank, defaultAppl, selectedQueueGroups, defaultQueue, defaultOrg, timezone | 404 |  |

## Stateful / destructive / batch — spec-only (NOT called)

| Method | Path | Required (spec) | Why not called |
|--------|------|-----------------|----------------|
| POST | `/businessAutomation/scheduleTask` | — | mutates/routes/batch |
| PUT | `/wp/addressMaintenance/{id}` | — | PUT/DELETE |
| PUT | `/wp/advances2/{id}` | — | PUT/DELETE |
| POST | `/async/route` | workpackage | mutates/routes/batch |
| POST | `/async/wp/{wfType}` | — | mutates/routes/batch |
| POST | `/updateCollateralBorrowingBase` | bank, obligorNumber, itemNumber | mutates/routes/batch |
| POST | `/updateCurrentCollateralValue` | bank, obligorNumber, itemNumber, currentValue | mutates/routes/batch |
| PUT | `/wp/commercialOrig/{id}` | — | PUT/DELETE |
| PUT | `/wp/commercialPost/{id}` | — | PUT/DELETE |
| PUT | `/wp/ddaWireChanges/{id}` | — | PUT/DELETE |
| PUT | `/employees/{id}` | bankId, orgLevelId, organizationId | PUT/DELETE |
| DELETE | `/employees/{id}` | — | PUT/DELETE |
| PUT | `/wp/feeManagement/{id}` | — | PUT/DELETE |
| POST | `/jobs/updateAssignment` | — | mutates/routes/batch |
| POST | `/jobs/updateStatus` | — | mutates/routes/batch |
| PUT | `/wp/nonFinancial/{id}` | — | PUT/DELETE |
| POST | `/wp/oblnRestructure` | — | mutates/routes/batch |
| PUT | `/wp/oblnRestructure/{id}` | — | PUT/DELETE |
| PUT | `/wp/otherFinancials2/{id}` | — | PUT/DELETE |
| PUT | `/wp/otherMaintenance/{id}` | — | PUT/DELETE |
| PUT | `/wp/payments2/{id}` | — | PUT/DELETE |
| POST | `/wp/repricing2` | — | mutates/routes/batch |
| PUT | `/wp/repricing2/{id}` | — | PUT/DELETE |
| POST | `/route` | workpackage | mutates/routes/batch |
| PUT | `/wp/syndiDealMaintenance/{id}` | — | PUT/DELETE |
| PUT | `/wp/syndiDealPipeline/{id}` | — | PUT/DELETE |
| POST | `/wp/syndiRepricing` | — | mutates/routes/batch |
| PUT | `/wp/syndiRepricing/{id}` | — | PUT/DELETE |
| POST | `/taskProcessor/ddaAba` | — | mutates/routes/batch |
| POST | `/taskProcessor/exceptionRefresh` | — | mutates/routes/batch |
| POST | `/taskProcessor/extracts` | — | mutates/routes/batch |
| POST | `/taskProcessor/validValueImport` | — | mutates/routes/batch |
| POST | `/taskProcessor/wireAba` | — | mutates/routes/batch |
| POST | `/updateFedRefNumber` | fedReferenceNumber, processDate | mutates/routes/batch |
| PUT | `/wp/userProfileAdmin/{id}` | userId, primaryName, defaultBank, defaultAppl, selectedQueueGroups, defaultQueue, defaultOrg, timezone | PUT/DELETE |
