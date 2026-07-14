# `createException` + `createScheduledFinancial` — validation  `[discovered]`

Probed with malformed payloads (nothing created). Adds a **third validation behavior**
to the two in finding #8.

## `POST /exceptions/createException`  (body `Wf-xom-ws-ExceptionInsert`)
**Batch validation, distinct code scheme:** returns **HTTP 200** with `messages[]`
listing **ALL** missing required at once (not one-at-a-time), code `EX020900007`.

| Probe | HTTP | reports |
|-------|------|---------|
| `{}` | 200 | `organizationId`, `bankId`, `applicationId` (+ `exceptionTypeId`) all "missing and required" |
| `{organizationId}` | 200 | `bankId`, `applicationId`, `exceptionTypeId` still required |

**Required:** `organizationId`, `bankId`, `applicationId`, `exceptionTypeId` (note the
`…Id` field names — not `bank`/`obligorNumber`). Other fields: `obligorNumber`,
`subclass`, `assignedToUserId`, `statusCode`, `advanceRate`, `specialInstructions`, …
Error code format `EX0209…` is exception-module-specific (vs the numeric 1–4 taxonomy).

## `POST /createScheduledFinancial`  (body `Wf-ws-servicing-ServicingUpdateSchedFinancialRequest`)
**Mirrors `createFinancial`** — one-at-a-time required cascade, code `1`:

| Probe | HTTP | code | message |
|-------|------|-----:|---------|
| `{}` | 400 | 1 | Required field 'scheduledFinancial' was not provided. |
| `{scheduledFinancial:{}}` | 400 | 1 | Required field 'application' was not provided. |
| `+keys, no transaction` | 400 | 1 | Required field 'transaction' was not provided. |
| `+transaction:"ZZ"` | 200 | 1 | "API name is required… financial api not found on the API Table" |

**Required:** `scheduledFinancial.{application, bankNumber, oblgrNumber, oblnNumber,
effectiveDate, transaction}` + schedule fields; `transaction` = a valid apiName from
the **433-name catalog** (`financial_transaction_apis.md`), same as `createFinancial`.

## Three write-validation models now mapped (updates finding #8)
1. **Upfront 400, one-at-a-time** — `reserveNumber`, `createObligor`, `createCustomer`,
   `createFinancial`, `createScheduledFinancial` (code 1–4 taxonomy).
2. **Draft-then-step (201)** — `/wp/*` workpackage creates (step-level messages).
3. **Batch 200 + module code scheme** — `createException` (all missing at once, `EX…`).
