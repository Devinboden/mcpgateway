# AFS Vision — Valid Values Catalog (harvested from dd3 UI)

Ground-truth picklist codes captured from the live dd3 AFS Vision UI (logged in as
`ID1, AFS DD3 EVENT`). Source = the Commercial Loan Origination wizard + servicing
screens. Each entry: `code → label`, keyed by the field it populates.

> **UI widget note:** AFS picklists are **react-select** components
> (`div.afs-picklist__option`, menu `div.afs-picklist__menu-list`). Options render
> into the DOM only while the menu is **open**; the selected value lives in
> `div.afs-picklist__single-value`. Display format is `"<code> - <label>"`, so the
> code is the prefix before the first ` - `. Long lists are async/virtualized — type
> in the box to filter or scroll the menu to force-render more options.

Legend: `*` prefix on a label is AFS's own marker for sandbox/test reference data.

> ⭐ **Bulk harvest:** [harvested.md](harvested.md) — **155 coded
> fields · 3,720 code→label rows** pulled from the AFS picklist **React props**
> (`react-select props.options = {code,literal}`) + native `<select>` options, no
> per-dropdown clicking. Covers the full collateral real-estate property domain, the
> **Deal Specifics pricing/repayment/fee set** (pricingMethod, pricingOption, baseRate
> = index rate, basis, calc1 = calculation type, methOfCollection, chargeType,
> feeTitleCode), indirect supports, and entity rating — all via the **ADD-dialog**
> notebooks at pre-approval (EDIT dialogs don't open on API-staged WPs; ADD dialogs do).
>
> 🔌 **Canonical source — the picklist API:** every coded domain is one GET away via
> `/rs/pl/fixed?name=<RefListName>` and `/rs/pl/dynamic?name=ilm/pl/<Name>&wfType=5701`
> → `{plName, items:[{code,literal}]}`. Full writeup + the in-browser harvester:
> [../writes/picklist_api.md](../writes/picklist_api.md),
> `scripts/harvest-picklists.js`.
> Includes the big reference lists: **collateralType (274)**, **NAICS (500)**, **SIC
> (500)**, country (264), purposeCode (219), late-charge models (205), obligationType,
> securedCode, billType, prepayCode, creditBureau, etc. Machine-readable:
> `captured/harvested_picklists.json`. The sections below are the originally
> hand-harvested codes; the two overlap.
>
> **Reusable extraction technique:** for each `.afs-picklist__control`, climb its
> `__reactFiber$` to `memoizedProps.options` (`[{code,literal}]`), key by the control's
> `<input>` id (minus `_N`), merge into `localStorage.afsCodes`; run on each WP step,
> then download `localStorage.afsCodes`. Survives navigation via localStorage.

> ✅ **Pricing/Collateral/Rating gap — RESOLVED (2026-06-26).** The Deal Specifics
> Pricing Options, Repayment, and Fee dialogs (pricingMethod, pricingOption, baseRate =
> Index Rate, basis, calc1 = Calculation Type, methOfCollection, chargeType,
> feeTitleCode), the Collateral notebook (full RE property set), and Entity Rating were
> all harvested via the **ADD-dialog** notebooks. Key learnings: (1) the rate/index
> fields live under the **Deal Specifics top tab → Pricing Options → ADD**, only present
> at **pre-approval+** (WP 28476 was used); (2) on API-staged WPs the **EDIT** dialog
> renders no modal, but the **ADD** dialog opens fine — so harvest via ADD, not EDIT;
> (3) `Add Loan` on a commitment is greyed once the loan exists, so the loan-obligation
> rate fields are reached through the Pricing Options dialog rather than the obligation
> notebook. The picklist API (`/rs/pl/fixed|dynamic`) is the canonical source either way.

---

## Origination · Deal Summary [Application Stage]

### `applicationCollected` — *Application Collected (required)
Maps to the `applicationCollected` field on the origination workpackage (Y/N flag).

| code | label |
|------|-------|
| `N` | No |
| `Y` | Yes |

### `organizationId` — Organization ID
Confirmed elsewhere: `organizationId = 1`.

| code | label |
|------|-------|
| `1` | *AFS Bank N.A. |

### Bank (deal grid, read-only on this step)
| code | label | base ccy |
|------|-------|----------|
| `5` | *AFS Bank | USD |

---

## Origination workpackage — codes captured from staged WPs (`GET /wp/commercialOrig/{id}`)

Harvested live from two prior API-staged originations: **WP 32646** (Mickey Mouse
Pizza, obligor 1136) and **WP 32645** (Shell Company, obligor 39). Full payloads
saved under `api-discovery/captured/`.

### `parties[].type` — Customer (party) type
| code | label | seen on |
|------|-------|---------|
| `1` | (customer type 1) | Mickey Mouse Pizza |

### `parties[].obligors[].type` — Obligor type
| code | label | seen on |
|------|-------|---------|
| `120` | (obligor type 120) | Mickey Mouse Pizza (obligor 1136) |
| `140` | (obligor type 140) | Shell Company (obligor 39) |
| `125` | LLP | (from prior harvest / memory) |

### `deal.requests[].type` — Request type
| code | label |
|------|-------|
| `NA` | New Approval |

### `deal.requests[].product` — Product
| code | label | productStructure |
|------|-------|------------------|
| `200` | AFS products | `F` = Commitment |

### `deal.requests[].application` — Application
| code | label |
|------|-------|
| `1` | *Commercial Loan |

### `obligationType` (request + obligation level)
| code | label | seen on |
|------|-------|---------|
| `3040` | Term Loan (shortName "Term Loan") | 32645, 32646 |
| `3015` | Revolving LOC (from try-wp.mjs default) | — |

### Obligation coded fields (from 32646 deal.requests[].obligations[])
| field | value | meaning |
|-------|-------|---------|
| `securedCode` | `1` | Secured |
| `commitmentLevel` | `H` | Highest Level |
| `maturityInd` | `1` | — |
| `letterCreditType` | `N` | not an LC |
| `oblnCategory` | `F` | — |
| `origData.advisedGuideType` | `A` | — |
| `origData.revolvingType` | `R`/`N` | revolving / non-revolving |

### `fxInfo` (obligor)
| field | code | label |
|-------|------|-------|
| `currencyCategory` | `1` | Currency Tier 1 |
| `currencyCode` | `USD` | United States Dollars |
| `siteId` | `1` | Domestic |

### `finStmt` (obligor)
| field | code | label |
|-------|------|-------|
| `stmtType` | `0` | Not Entered |
| `suppressBilling` | `0` | No |

### `geographicInfo` (obligor)
| field | code | label |
|-------|------|-------|
| `geographicInd` | `0` | Not Entered |
| `geographicCode` | `US` | United States (from buildPayload) |

### `lender.orgLevels` — officer + assignment unit (drives officer-view visibility)
| level value | label | role |
|-------------|-------|------|
| `1001500` | *Commercial Lending- East | assignment unit / cost center |
| `10111111` | Mary*Jones | officer (officer1) |

### Other known codes (from memory / prior harvest)
| field | code | label |
|-------|------|-------|
| state | `39` | Pennsylvania |
| country | `1` | US |
| collateralType | `2084` | (collateral type) |
| chargeType | `1` | Interest |
| chargeType | `4` | Accrual Fee |
| reserveType | `2` | Obligation number |
| reserveType | `3` | Collateral item number |
| organizationId | `1` | *AFS Bank N.A. |
| bank | `5` | *AFS Bank (base ccy USD) |

## Origination · Application Request Information [Application Stage]

Harvested live from the dd3 origination wizard (WP 32688), 2026-06-25. These are the
request-level fields required to route an origination from `applicationStage` →
`bookingStage`.

### `initialApplSource` — *Initial Application Source (required)
| code | label |
|------|-------|
| `100` | Verbal |
| `110` | In Person |
| `120` | Online Application |

### `purposeCode` — Purpose Code (required) — large picklist (80+ values)
First entries (full list is a long NAICS-style purpose-of-funds catalog; sample):
| code | label |
|------|-------|
| `0` | Not Entered |
| `1035` | Acquisition Business Loans |
| `1315` | Business Expansion |
| `1350` | Business Finance |
| `1770` | Commercial Loans Not Secured By RE |
| `1805` | Commercial Loans Secured By Real Estate |
| `1910` | Commercial, Industrial |
| `3415` | Finance Inventory |
| … | (codes step by ~35; many more — RE, construction, equipment, etc.) |

Used for the build: **`purposeCode = 1910` (Commercial, Industrial)**.

## Origination · Request Information [Pre Approval Stage]

Required to route `preApprovalStage → bookingStage` (harvested from WP 32689).

### `durationCode` — *Duration Code (required)
| code | label |
|------|-------|
| `0` | Not Entered |
| `1` | Time |
| `3` | Term |
| `6` | Prevent Maturity Invoice |

Used for the build: **`durationCode = 3` (Term)**.

Also on this step: `*Obligation Type` 3040 = **Revolving Facility** (label), `*Advised/
Guidance` Advised, `Maturity Period` "1 Year or Less", `Secured Code` Unsecured.
**Next blocker (preApproval → booking):** Step *Approval Requirements Management* —
"At least one Approval Authority must be added" (a hard requirement, code 97).

### Other Application Request Information fields (observed defaults)
| field | value | note |
|-------|-------|------|
| `*Assignment Unit` | 1001500 (*Commercial Lending- East) | from lender |
| `*Service Unit` | 0 (*Not Entered) | |
| `*Officer 1` | 10111111 (Mary*Jones) | |
| `*Participation / Syndication` | N (No) | |
| `*Revolve/Non-Revolve` | N (Non-Revolving) | |
| `SBA Obligation(s) in Request` | N (No) | |
| `*Initial Application Date` | date | `initialApplDate` |
| `*Application Date` | date | `applicationCDate` |
| `*Initial Application Amount` | USD amount | `initialApplAmt` (+ `initialApplAmtCur`) |
| `collateralType` | `2084` | accepted by API (valid) |

> **Still to harvest from UI dropdowns** (react-select, open menu to read):
> obligor type full list, deal/product full lists, collateralType list, chargeCode
> list, pricing/index codes, and the status/withdraw/delete **reason** codes (needed
> to clean up the stray drafts 32679–32686 via `/jobs/updateStatus`).

## Origination · Credit Approval + Customer Acceptance + Closing Prep (UI, as approver AFSDD302/ID2)

Harvested while driving WP 32689 through booking as the approver.

### Decision Entry — `*Decision` (deal decision)
| code | label |
|------|-------|
| `2` | Approved |
| `3` | Conditionally Approved |
| `4` | Declined |

### Decision Entry — `*Title`
| code | label |
|------|-------|
| `0000` | Approver |
| `0100` | Credit Officer |
| `0200` | Senior Credit Officer |
| `0300` | Vice President |
| `0400` | Senior Vice President |

Approver picklist = the AFSDD3xx approver users (AFSDD342…384). The decision's
Approver must hold the required authority ("Commercial Loans Approver Level 1").
Entered-by user = the logged-in approver (AFSDD302/ID2).

### Customer Acceptance — Disposition
| value | meaning |
|-------|---------|
| Accepted | customer accepts approved terms |
| Notified of Decline/Withdrawal | — |
| Withdrawn | — |

### Closing Preparation · Commitment Information
| field | code | label |
|-------|------|-------|
| `*General Ledger` | 10001 | Commercial Loans |
| | 20001 | Commercial Real Estate |
| | 30001 | Held for Sale |
| | 40001 | SBA Loans |
| | 99999 | Conversion Default |
| `*Derivative Indicator` | 0 | Not Entered |
| | 1 | Not Applicable |
| | 2 | Swap |

Used: General Ledger **10001**, Derivative Indicator **1** (+ a Derivative
Description, which becomes required once the indicator is set).

## Obligation Type — CORRECTION (from booked servicing obligation 5-34160-83)
Read live from a BOOKED term loan: `obligations/getFullKey/5-34160-83` → `type:3015`,
`typeLit:"Loan- Term"`. So:
| code | label | notes |
|------|-------|-------|
| `3015` | **Loan- Term** | directly-bookable term loan (use for term / real-estate term loans) |
| `3040` | **Revolving Facility** | a revolving commitment — needs a takedown structure to book |

Earlier note ("3015 = Revolving LOC") was wrong. For a bookable **real estate term
loan**: obligationType **3015**, General Ledger **20001** (Commercial Real Estate),
purposeCode **1805** (Commercial Loans Secured By Real Estate), revolvingType N.
> Note: `buildPayload` still yields `commitmentLevel:"H"` (Highest Level) regardless
> of type — for a non-revolving term loan the amount = loan amount directly, so it
> should book where the revolving 3040 did not.

## `productStructure` — Product structure (1-char) — CRITICAL for booking
Probed live by POSTing originations with each value + reading the obligation back:
| code | label (productStructureLit) | oblnCategory | bookable? |
|------|------------------------------|--------------|-----------|
| `F` | Commitment | F | NO — Highest-Level commitment, amount derived/disabled |
| `C` | **Standalone Loan** | C | **YES — directly bookable single loan** |
| `L` | Letter Of Credit | L | (LC) |
| `N` | (unlabeled) | N | — |
| `P` | (unlabeled) | P | — |
`buildPayload` hardcoded `F`. For a directly-bookable term/RE loan use **`C`
(Standalone Loan)** — no takedown layer, the loan amount is the bookable amount.

## Closing Prep · Obligation Rating + misc (standalone loan, WP 32697)
Required to complete a STANDALONE LOAN before booking.
### `*Maturity Period`
| code | label |
|------|-------|
| `1` | 1 Year or Less |
| `2` | Greater Than 1 Year |
| `3` | Demand |
> The Legal Maturity Date must be ≤ Effective + 365 days when period = "1 Year or
> Less". For a multi-year term loan, use **2 (Greater Than 1 Year)**.

### Obligation Rating — `*Type`
| code | label |
|------|-------|
| `5` | Probability of Default |
| `6` | Loss Given Default |
| `10` | Final Grade |
| `100` | Federal |
| `200` | State |

### Obligation Rating — Split Rating `*Risk Rating` (risk grade)
| code | label |
|------|-------|
| `11` | Virtually No Risk |
| `12` | Low Risk |
| `13` | Moderate Risk |
| `14` | Average Risk |
| `15` | Acceptable Risk |
| `16` | Borderline Risk |
| `17` | OAEM |
| `18` | Substandard |
| `19` | Doubtful |
(At least one rating with a Split Rating + Risk Rating Percent is required.)

## Job List — Withdraw / Reassign **Reason Codes** (for cleanup of stray WPs)
Harvested from the Job List **Withdraw** dialog (the reason code needed to
withdraw/close a workpackage):
| code | label |
|------|-------|
| `AWNC` | Application Approved But Will Not Close |
| `CONA` | Counter Offer Not Accepted |
| `NLNF` | No Longer Need Funds; Prior to Decision |
| `OBRF` | Offered Better Rate/Fee at Another Institution |
| `OBTC` | Offered Better Terms/Conditions |
| `OTHR` | Other |
| `TCON` | Transferred to Consumer Lending |
| `TDRE` | Transferred to Developmental R/E Group |
| `TPEM` | Transferred to Portfolio Exception Management |
| `TREL` | Transferred to Relationship Manager |
