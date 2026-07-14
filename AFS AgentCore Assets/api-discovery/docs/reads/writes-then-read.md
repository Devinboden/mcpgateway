# Can "create WPs via writes, then read them" close the read gap? — tested 2026-06-26

**Short answer: no, not meaningfully.** Creating origination workpackages does **not**
unlock the unresolved reads. They are gated by the same two walls already identified
(role-403 + booking), plus a handful of pure query-param/spec fixes that need no writes
at all. Evidence below (`scripts/sweep-pass3.mjs`, `captured/read_pass3.json`).

## Why origination WPs don't materialize the `/wp/*` reads
The `/wp/ObligorRoot|ObligationRoot|CollateralRoot|exception*|otherFinancials2/{id}`
reads, hit against **existing** WPs (28476 pre-approval, 32591 post-approval), all fail:

> `=cannot retrieve data for root model: oid=…, rootType=211/212/213/209/208,
> error=The model for a persistent reference …`

These read a **persisted / booked servicing model**, not the in-flight origination WP's
model. So no amount of origination-WP creation produces them — they need the **booking**
step (the one gated thing). `/wp/commercialPost/{id}` **does** return 200 against a
post-approval WP (32591) — confirming the pattern works only where the model is persisted.

## The 404 servicing reads are booking/servicing-state gated too
`collateralInsurance`, `depositInstructions`, `wireInstructions`, `flood filings`,
`assetSales`, `scheduledActivity`, etc. return empty because the **booked** obligors have
no such record. Adding the sub-record to an *origination* WP doesn't help — these read the
**servicing** store, populated only after booking + servicing maintenance.

## What writes/booking can't touch at all: the 47 role-403 reads
`accrualSchedules, billingSchedules, repaymentSchedules, primeSchedules, rateIndicative,
obligor{Applications,DDA,Wire}Instructions, penaltyDefinitions, lateChargeControl, banks,
notePad, up/*`. Server refuses `AFSDD301` before looking at data. Role grant only.

## Genuine zero-write lifts found while testing (no WPs created)
| read | fix | result |
|------|-----|--------|
| `/apis/get` | `?apiName=DisburseFuture` | **200** (43 fields) |
| `/names/getByObligor/{bank}-{obg}` | composite key | **200** (92 fields) |
| `/obligors/listByNameId/{bank}` | `?nameId=…&rowLimit=25` | **200** |
| `/wp/commercialPost/{id}` | real post-approval WP id | **200** |
| `/phones/list`, `/nameAddresses/listAlternateAddresses` | correct params | **404** (reachable, empty — characterized) |

### Spec corrections (update the param model)
- `financialInstrument/listOblnByObg` `instrumentType` enum = **`obligation` | `escrow` |
  `trade`** (not the `C/F/L` guessed earlier; that was the 422). With `=obligation` it
  advances 422→400, so a further required param remains — but the enum is now known.
- `names/list` `nameType` enum = `customer|rate|bank|officer|orgLevel|realEstate|deal|
  organization|filing|remitTo|groupName` (not `O`).
- `obligors/listAllByBank?bank=5` returns **413 Request Entity Too Large** — the read works
  but the bank-wide list is too big; needs a working row cap (the `rowLimit` ref param did
  not cap it here — param name/placement still to pin down).

## Verdict
The read ceiling is **role + booking**, exactly as `../overview/coverage-status.md` states. "Make WPs
and read them" converts almost nothing the two grants wouldn't, because the unresolved
reads target persisted/servicing models or carry a hard entitlement check. The only
write-free gains are precise query-param/spec fixes (a few reads + the corrections above).
