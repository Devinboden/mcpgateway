# AFS Vision API — coverage status (consolidated, honest)

> ⚠️ **Partly superseded — read the live-tested docs first.** Two headline framings
> below are now **false**: the "**~48% read ceiling**" (correctly reframed as **37**
> role-gated config/schedule/instruction families — see
> [role-gated-services.md](./role-gated-services.md)) and "**booking not reproducible**"
> (a full nested loan was booked end-to-end via the UI — obligor 5-34558 — see
> [../writes/booking.md](../writes/booking.md) and
> [servicing-api-capability.md](./servicing-api-capability.md)). The structural and
> valid-values counts below remain accurate; the coverage-percentage and booking framing
> is discovery-phase.

_Single source of truth for "how close to full mapping." Combines both work
streams (solo API/managed-machine + Chrome personal-machine). Updated each loop._

## Headline

| Lens | Estimate |
|------|---------:|
| **Structural** (every endpoint + schema + field model known) | **~100%** |
| **Reads live-verified** (returns data as `AFSDD301`, 8-obligor union) | **48%** (110/231 incl. perm-characterized) |
| **Writes** (validation rules mapped) | **~90%** |
| **Build-a-loan** (origination through closing-complete) | **~95%** |
| **Valid-values** (coded-field domains captured) | **~60%** |
| **Everything either live or characterized** (we know why each non-200 fails) | **~100%** |

> The read cap (~48%) is **permission/workflow-state gated**, not a discovery gap —
> ~20% is 403 for this login and most of the rest are `/wp/*` reads needing an active
> workpackage. A broader role lifts it; `AFSDD301` is near its ceiling.

## Reads (231 services, 110 specs)
- **Structural: 100%** — every service + field model in `../field-model/all-endpoints/`.
- **Recomputed honestly (fully-keyed sweep, all harvested keys incl. billYear/
  invoiceNumber/chargeCode/addressId):** `200/204 = 50`, `403 = 47`, `400 = 67`,
  `404 = 65`. **Resolved (live + permission-mapped) = 97/231 = 42%** for a single
  obligor (Zeppelin 5-13).
- **Multi-obligor union (8 obligors, measured):** +13 services flip to live →
  **63 live + 47 permission = 110/231 = 48% resolved/characterized.** This is the
  honest definitive figure for this login (supersedes an earlier optimistic "~80%").
- **Permission floor = 47/231 (~20%)** — 403 for AFSDD301 (`accrualSchedules`,
  `billingSchedules`, + ~45). Will NOT resolve without a broader role — the hard cap.
- **Residual unresolved = 121:** mostly `/wp/*` reads that need a workpackage **at a
  specific workflow state** (not obligor data), plus services needing keys not
  harvestable per obligor, plus genuinely-empty-for-these-obligors. A broader role +
  active WPs would lift this; with `AFSDD301` + read-only obligor data it's near the cap.
- `phones` resolved: `/phones/list?nameId={id}` (404 = empty for Zeppelin).
- `/wp/*` GET reads **confirmed functional** with real WP ids (`/wp/commercialOrig/{id}`,
  `/wp/commercialPost/{id}` → 200) — but most WP types have no live workpackage in the
  current job list (test drafts were withdrawn), so they stay unresolved for lack of a
  WP-of-that-type, not for lack of capability. `syndiDealPipeline` = 403. Confirms the
  residual is **workflow-state-dependent**, exactly as characterized.

## Writes (57 ops)
- **Structural: 100%** — full request field models in `../writes/SCHEMAS.md`.
- **`reserveNumber`** — full validation matrix + error-code taxonomy (`reserveNumber.md`).
- **`createFinancial`** — `simulate:"true"` = **confirmed dry-run**; `transaction`
  = an apiName from the **433-name catalog** (`financial_transaction_apis.md`);
  validation chain mapped (apiName → frozen → balanceCode → maturity → balance-code-exists).
- **Two validation models:** `create*`/`reserveNumber` reject upfront; `/wp/*`
  create a draft then validate by step (finding #8).
- **Stateful/destructive (35 ops):** documented from spec; only `updateStatus`
  exercised (withdraw, reason `OTHR`).

## Build a loan
- **Proven:** createCustomer → createObligor → reserveNumber → `/wp/commercialOrig`
  (all steps) → route → decision → accept → **closing-complete** (WP 32697).
- **Booking (post to servicing): reproduced end-to-end via the UI** (see
  [../writes/booking.md](../writes/booking.md)); only the API GET→PUT *patch* shortcut
  is a dead end. `readyToBook` is a
  top-level field (`'0'`); setting it needs `PUT /wp/commercialOrig/{id}`, but the
  **GET body doesn't round-trip** — PUT → 400 `Required field 'statementYear'`
  (belongs in a nested object). It's a **write-model ≠ read-model asymmetry**, not a
  refList per se. Closing it needs either mapping the full PUT write-model (API-only,
  deep — validation loop reveals each next field) or the UI/back-office role. Existing
  loans prove booking happens in the env; the origination role just can't trigger it.

## Valid-values
- **Origination (Chrome):** 149 coded fields / 3,374 code→label rows
  (`../valid-values/harvested.md`, react-select + native-select harvest). Covers
  collateral real-estate, indirect supports, and the **Deal Specifics pricing /
  repayment / fee** set (the previously-flagged rate/index gap: pricingMethod,
  pricingOption, baseRate=index rate, basis, calc1=calc type, methOfCollection,
  chargeType) + entity rating — harvested via ADD-dialog notebooks on a Customer-
  Acceptance WP (32591) and a Pre-Approval WP (28476).
- **Picklist API discovered (Chrome, 2026-06-26):** the canonical coded-domain source
  is `GET /rs/pl/fixed?name=<RefListName>` and `/rs/pl/dynamic?name=ilm/pl/<Name>` →
  `{plName, items:[{code,literal}]}`. Given a name, any domain (incl. dialog-only
  fields) is one GET away — remaining harvest is name-discovery, not access. See
  `../writes/picklist_api.md` + `scripts/harvest-picklists.js`.
- **Read/servicing (API mining):** 386 fields / 470 observed values
  (`../valid-values/read-side.md`, from `<field>Lit` pairs — sparse, grows with more data).
- **Financial transactions:** 433 apiNames (`financial_transaction_apis.md`).
- Gap: ~half of origination coded fields' full domains; read enums are observed-only.

## The remaining gaps, by what would close them
1. **Broader-permission / booking role** → unlocks ~47 403 reads + the book step.
2. **More/active obligors** → denser read resolution + a clean simulated advance.
3. **Chrome (one final handoff):** remaining origination picklist domains; UI
   `readyToBook`/booking surface check.
4. **Clean `readyToBook` PUT** (API, solvable here) → would test booking directly.
