# Booking a loan into servicing  `[UI-proven 2026-07-11]`

**Booking IS reproducible.** A full nested commercial loan was originated, closed,
and BOOKED end-to-end through the AFS Vision UI — obligor **5-34558**, commitment
obligation **5-34558-18** ($5M revolving line), takedown **5-34558-26** ($1M) —
`Request Booked Indicator: Yes`, with real disbursements posted to the ledger
(`DisburseFuture $5M`, `DisburseCurrent $1M` in `financialHistory/listAllById`).
_(Consolidates the former `readyToBook_booking.md` + `booking_and_execution.md`.)_

## Booking is the workflow's final step, not a single endpoint
There is no one-shot `POST /book` in the WebX API. "Booking" = driving the
origination workpackage through its full stage sequence to the terminal
**Funding/Booking** stage and answering **"Are you ready to Book? → Yes – Execute"**,
which posts the obligation(s) to servicing. The UI does exactly this via repeated
`Send Work` (route) actions:

```
Application → Pre-Approval → (approval; SoD: originator ≠ approver) →
Closing Preparation → Loan Closing (offset entry + funding review) →
Funding/Booking (Book CLO → "Yes – Execute") → BOOKED
```

Segregation of duties is enforced — the same user cannot both originate and approve
(we originated as ID2/AFSDD302, approved as ID1/AFSDD301).

## Reaching booking via the API — needs write-valid WP payloads (not a patch)
Driving the same workflow through the API means routing the WP forward and setting
the stage fields (including `readyToBook`). Two hard facts from live probing:

### `createFinancial` cannot bootstrap an obligation
It posts only to an **already-booked** obligation. A reserved obligation number is not
a servicing obligation: `GET /obligations/getFullKey/5-34392-18` (reserved via
`reserveNumber`) → **404**; `createFinancial` against it → SQL error (record doesn't
exist). Obligations are produced only by origination workpackages (commercialOrig /
advances2 / …), then booked by completing the flow. See [`createFinancial.md`](./createFinancial.md).

### The naive `readyToBook` GET→PUT patch is a dead end (write-model ≠ read-model)
`readyToBook` is a top-level field on `Wf-cbm-VisionOrigWorkPackage` (`'0'`; spec:
"Cannot proceed to the next stage until the user selects '1 – Yes'"). You cannot flip
it by patching the GET body:
- `GET /wp/commercialOrig/{id}` body does **not** round-trip to `PUT` — setting
  `readyToBook='1'` and PUTting it back → **400 `Required field 'statementYear' was
  not provided`**. `statementYear` is required on nested schema `Wf-cbm-IncomeStmtSmry`,
  which the GET body never returns. The PUT validator wants nested write-model objects
  the GET omits, so patch-PUT can't satisfy it — you'd reconstruct the full
  write-valid payload from scratch (e.g. a `buildPayload` producing PUT/POST-valid
  commercialOrig bodies, extended to set `readyToBook=1`).
- All PUTs rejected `400`; **no WP was modified**.

### No single "execute booking" endpoint either
Tested every candidate against a `complete` unit — none books in one call:

| Endpoint | Result |
|---|---|
| `POST /route` → forward stage | `[16] Unit status does not allow routing` (a `complete` unit can't be routed) |
| `POST /async/route` | `200` → queues a businessAutomation task that runs the same route engine and fails (*"Auto routing single wp failed"*) |
| `POST /jobs/updateStatus` | actions limited to `withdraw, hold, reactivate, forceClose, unlock, lock` — no book/execute |
| `PUT /wp/commercialOrig/{id}` `readyToBook:"1"` | `400` (write-model asymmetry, above) |
| `POST /taskProcessor/{extracts,ddaAba,wireAba,exceptionRefresh,validValueImport}` | data-extract / ABA / refresh / import jobs — none books |

**So:** booking is reachable, but through the *workflow*, not a shortcut. The UI drives
it trivially (proven). An API-only booking would require building the full write-valid
WP payloads to route the WP forward and set `readyToBook`; the GET→PUT patch shortcut
is closed.

## Async-route / businessAutomation discoveries
- `POST /async/route` — async twin of `/route`; returns `{taskID, selfURL:
  "…/businessAutomation/tasks/{id}", executeTimestamp}` and runs the route in a
  background businessAutomation task.
- `GET /businessAutomation/tasks/{id}` — read an async task `{id, eventDesc, state,
  scheduledTs, startedTs, endedTs, runAsUser, messages[]}`. (`/tasks` list, `/events`,
  `/scheduledTasks` → 404; only `/tasks/{id}` and `/schedules` exist.)
- `/jobs/updateStatus` `action:"withdraw"` + `reason:"OTHR"` is the working WP
  **cleanup** path (see [`jobsUpdateStatus.md`](./jobsUpdateStatus.md)).

## See also
- Full booked-loan capability (reads + servicing writes, ledger-verified):
  [`../overview/servicing-api-capability.md`](../overview/servicing-api-capability.md)
- What the origination workflow builds: [`commercialOrig.md`](./commercialOrig.md)
