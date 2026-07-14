# Loan build log — one fully-nested loan, end-to-end in dd3

> ⚠️ **SUPERSEDED (historical discovery log).** This log records the earlier
> API-patch attempt on obligor 34392 / WP 32697, which ended with the (now false)
> conclusion that booking was blocked and `createFinancial` couldn't post. Both were
> **resolved**: a full nested loan was booked end-to-end via the UI (obligor 5-34558,
> obligations 18 + 26), and `createFinancial` posts internal transactions to the
> ledger. For current truth see [`../writes/booking.md`](../writes/booking.md),
> [`../writes/createFinancial.md`](../writes/createFinancial.md), and
> [`../overview/servicing-api-capability.md`](../overview/servicing-api-capability.md).
> Kept for provenance only — do not cite the "blocked" conclusions below.

Goal: `createCustomer → createObligor → reserveNumber → /wp/commercialOrig
(complete all steps) → route/book → createFinancial (fund)`, then read back
(balances/charges/financialHistory/currentObligations).

Method: validation loop — submit → read AFS `messages[]` → fix → repeat. Prefer
ground-truth codes captured from the dd3 UI / staged WPs over guessing. Use
`simulate` for `createFinancial` first.

Environment: dd3 sandbox, Basic auth, logged-in Chrome session as `ID1, AFS DD3
EVENT`. Bank 5, organizationId 1, officer 10111111 (Mary*Jones), assignment unit
1001500 (*Commercial Lending- East).

## Reusable assets discovered
- `tools/createWorkpackage.js::buildPayload(args)` — proven to create
  `/wp/commercialOrig` + `/wp/commercialPost` (staged WPs 32645/32646).
- `GET /wp/commercialOrig/{id}` — reads back a full populated WP (new discovery).
- Ground-truth codes → `../valid-values/catalog.md`.

## Existing entities on the book (candidates)
| obligor | name | notes |
|--------:|------|-------|
| 13 | Zeppelin Inc. | seed, fully booked (5-13) |
| 34160 | Piedmont PCI | targeted by try-wp.mjs (Post Approval) |
| 1136 | Mickey Mouse Pizza | API-staged origination (WP 32646) |
| 39 | Shell Company | API-staged origination (WP 32645) |

---

## Step log

_(appended as each call is made — request body, response, messages, IDs minted)_

### Step 0 — onboarding (done)
- `.env` created; read probe `GET /obligors/get/5-13` → 200 (`shortName: "Zeppelin Inc"`).
- Chrome connected (deviceId 4d54a212…), logged-in session confirmed.
- `GET /wp/commercialOrig/32646` + `/32645` → 200, full payloads captured.

Driver: `scripts/build-loan.mjs <stage>` (raw POST, prints `messages[]`, persists
minted IDs to `scripts/.build-state.json`). Net-new borrower: **\*Cascade Build Co
LLC** (shortName "Cascade Build", taxId 451234567).

### Step 1 — `POST /createCustomer` ✅ (obligor 0 → customer minted)
Validation loop:
1. `definition:"C"` → **HTTP 400**, generic servicing failure (Failure Code 3219).
   Lesson: an invalid enum on a create can surface as a generic servicing failure,
   not a clean field message.
2. `definition:"0"`, `type:"1"`, `name.type:"1"` → **HTTP 200** but
   `[error|1] Object Name requires an asterisk`. Lesson: **dd3 sandbox requires the
   `*` test-data prefix on the Name `fullName`.**
3. `name.fullName:"*Cascade Build Co LLC"` → **HTTP 200** `[info|0] Creation of
   Customer was successful.`

Final body:
```json
{ "organizationId":"1",
  "customer":{ "definition":"0","type":"1","shortName":"Cascade Build",
    "taxId":"451234567","classCode":"0","privacyCode":"0","languageId":"0",
    "obligorRequired":"Y","name":{"fullName":"*Cascade Build Co LLC","type":"1"} } }
```
Response: `{"ilmId":"46934", messages:[Creation of Customer was successful]}`.
**Minted: customer `ilmId = 46934`** (this is the customer/ILM id — the `customerId`
the WP party uses, and the obligor's parent customer).

### Step 2 — `POST /createObligor` ✅
Validation loop:
1. `{bankId, shortName, type:"120", ilmId:"46934"}` → **HTTP 200**
   `[error|1] Assignment Unit is required to complete this transaction.`
2. + `orgLevelData:{assignmentUnit:"1001500", officer1:"10111111"}` → **HTTP 200**
   `[info|0] Creation of Obligor was successful.`

Final body:
```json
{ "obligor":{ "bankId":"5","shortName":"Cascade Build","type":"120",
  "ilmId":"46934","orgLevelData":{"assignmentUnit":"1001500","officer1":"10111111"} } }
```
**Minted: obligor `34392`** (bank 5). Read-back `GET /obligors/get/5-34392` → 200,
`shortName "Cascade Build"`, **`nameId 46934`** (== customer ilmId — link confirmed).
Lesson: obligor.`ilmId` = the parent customer's ilmId; `orgLevelData` (assignment
unit + officer) is **required** even though the spec marks only bankId/shortName/
type/ilmId required.

### Step 3 — `POST /reserveNumber` ✅
Body `{correlationId, bankId:"5", obligorNumber:"34392", reserveType:2,
expirationDays:30}` → **HTTP 200** `[info|0] Obligation reservation is successful.`
**Reserved obligation number = `18`** (per-obligor numbering; independent of other
obligors' obligation 18). reserveType 2 = obligation number.

### Step 4 — `POST /wp/commercialOrig` ✅ (the big one)
Built with the proven `tools/createWorkpackage.js::buildPayload()`, wired to the new
entity: `customerId=46934`, `obligorNumber=34392`, `obligorType=120`, officer
10111111, unit 1001500, one Term Loan facility ($2,000,000, product 200/F, type
3040, non-revolving, secured). Payload saved to `scripts/.orig-payload.json`.

→ **HTTP 201 Created, 0 messages. Minted origination WP `32687`.**

Read-back `GET /wp/commercialOrig/32687` → 200, fully populated:
- party `*Cascade Build Co LLC`, ilmId 46934, obligor 34392 (type 120)
- deal.applicationCollected Y; request type NA, product 200, obligationType 3040
- obligation: shortName "Term Loan", **futureInfo.comtBal 2,000,000 USD**,
  effective 2024-06-25 → maturity 2029-06-25, origData {advisedGuideType A,
  revolvingType N, securedCode 1}
- lender.orgLevels: 1001500 (*Commercial Lending- East) + 10111111 (Mary*Jones)
- `readyToBook: 0` — still in the Application stage; next: route/book.

### Step 5 — `POST /route` (booking) — IN PROGRESS, blocked on 6 required fields
WP 32687 is at stage `applicationStage` (stageId 25, unit "Origination",
queue 9020000000000012). `POST /route` discovery (validation loop):

- Body shape that works: `{autoRoutingFlags:{autoVisitStep:"Y",
  autoAcknowledgeField:"Y",autoOverride:"Y"}, workpackage:{id, targetStage}}`.
- **`targetStage` is REQUIRED** at workpackage level (or pass unit info):
  `[error|2] Missing or empty workpackage level target stage`.
- **Valid next-stage targets from `applicationStage`** (probed — these returned
  "steps not complete" rather than "not valid", proving they're adjacent):
  **`bookingStage`**, `postApprovalStage`, `docPrepStage`. All others
  (approvalStage, book, closing, underwriting, …) → `[error|12] The target stage
  '…' is not valid to be routed to.`  → **booking path = `bookingStage`**.
- Routing to `bookingStage` → `[error|18] Unit has step(s) that are not complete`
  + the exact missing required fields (step `Application Request Information` /
  `Request Entry`), all on the **deal request** object:

  | Meta path | Field | Note |
  |-----------|-------|------|
  | `cbm/Request.initialApplAmt.c` | Value (initial application amount) | = facility amount |
  | `cbm/Request.collateralType` | Collateral Type | picklist (mem: 2084) |
  | `cbm/Request.purposeCode` | Purpose Code | **picklist — need code** |
  | `cbm/Request.initialApplSource` | Initial Application Source | **picklist — need code** |
  | `cbm/Request.initialApplDate` | Initial Application Date | date |
  | `cbm/Request.applicationCDate` | Application Date | date |

  Auto-override flags do NOT fill these (they need real values). Next: PUT
  `/wp/commercialOrig/32687` to add these request fields, then re-route to
  `bookingStage`. Picklist codes (collateralType/purposeCode/initialApplSource) to
  be harvested from the UI Application Request Information step (no valid-values
  READ endpoint exists in the specs — only `taskProcessor/validValueImport`).

#### Picklist codes harvested from UI (Chrome, dd3) -> ../valid-values/catalog.md
- `initialApplSource`: 100 Verbal / 110 In Person / 120 Online Application -> used 110.
- `purposeCode`: large NAICS-purpose list -> used 1910 (Commercial, Industrial).
- `durationCode`: 0 Not Entered / 1 Time / 3 Term / 6 Prevent Maturity Invoice -> 3.
- `collateralType`: 2084 (API-accepted).

#### Re-built complete WP + stage progression (hybrid: route via API, complete steps in UI)
- `origfull` POST with valid codes -> **WP 32689** (201, 0 messages) — the keeper.
  (Earlier partials 32687, 32688 -> cleanup debt.)
- Routing `32689 -> bookingStage` advanced it stage-by-stage; each hop revealed the
  next stage's required step (completed in the UI, then re-routed via API):

  | Hop | From -> To | Blocker resolved to advance |
  |-----|-----------|------------------------------|
  | 1 | applicationStage -> **preApprovalStage** | Application Request Info: initialApplAmt, collateralType 2084, purposeCode 1910, initialApplSource 110, dates |
  | 2 | preApprovalStage -> (blocked) | Request Info: **durationCode 3 (Term)**; Approval Reqs: **add Approval Authority** (AFSDD342, Commercial Loans Approver L1) |
  | 3 | preApprovalStage -> **secondaryApprovalStage (Credit Approval)** | Approval Authority must be **Highest Level** |
  | 4 | Credit Approval -> (blocked) | **Decision Management: a Deal Decision is required** <- current |

- At `secondaryApprovalStage` (stageId 15) the WP persists `readOnly: true` (no user
  lock, `isSegDutyViolated: false`, still owned by ID1). The credit-approval Decision
  is the next gate; UI must check the WP out (edit) to enter it.

> **Workflow gotcha:** do NOT keep the WP open in the UI while routing via API — the
> route advances the DB copy and the stale UI copy becomes read-only / errors on save
> ("Workpackage has been modified in the database"). Pattern: complete steps in UI ->
> SAVE -> CLOSE UI -> route via API -> reopen for next stage.

### Step 5 (cont.) — Credit Approval decision gate
- WP 32689 at `secondaryApprovalStage` blocks on Step **Decision Management /
  Decision Entry: "A Deal Decision(s) is required"**.
- The originator login (ID1/AFSDD301) gets `readOnly: true` and cannot check out /
  edit the WP at this stage (segregation of duties — originator != approver).
- **Approver login AFSDD302** authenticates to the API and CAN act on the WP:
  routing 32689 as AFSDD302 returns the same "Decision required" step message (not
  "access denied") — so the decision must be ENTERED (into `deal.decisions[]` /
  `request.decisions[]`, schema `Wf-cbm-Decision`) before routing past Credit Approval.
- No dedicated decision/approval REST endpoint exists; the decision is the UI's
  "Decision Management" action. Decision-type codes require an editable WP (the
  read-only originator view can't open the Add-Decision dialog), so the decision is
  being entered in the UI as the approver (AFSDD302), then routed to book via API.

### Step 5 (cont.) — Credit decision via approver AFSDD302 (ID2) — APPROVED
A second login **AFSDD302 (= ID2)** with credit-approval authority was provided.
ID2 can edit the WP at Credit Approval (ID1 could not — SoD). Driven in the UI:
1. **Credit Approval > Decision Management**: added Deal Decision = **Approved**
   (Approver AFSDD342, Title Credit Officer). Routed -> **Customer Acceptance**.
2. **Customer Acceptance**: set Disposition = **Accepted**. Routed -> **Post Approval**.
3. **Post Approval -> Closing Preparation**: set Commitment Information
   `General Ledger=10001`, `Derivative Indicator=1` (+ Derivative Description).

Full stage path achieved: applicationStage -> preApprovalStage ->
secondaryApprovalStage (Credit Approval) -> Customer Acceptance -> Post Approval ->
Closing Preparation. **One step from booking.**

### BLOCKER (structural) — Highest-Level commitment has no child takedown
At Closing Prep, the `*Commitment Amount` on the HIGHEST LEVEL obligation is
**disabled + reads empty to validation** (forward route only offers "Pre-Approval";
booking is gated). Root cause via API GET of 32689:
- obligation `commitmentLevel="H"` (Highest Level), `title="Highest Level"`,
  `futureInfo.comtBal=2,000,000`, but **`obligations`(children)=0**,
  `takeDownRow=false`, `highLevelTakeDown=false`.
- A Highest-Level commitment is a PARENT; its bookable commitment amount is derived
  from child takedown obligations. With no child, the amount field is empty/disabled
  -> booking blocked.

**Fix options (not yet applied):** (a) add a child takedown obligation (the $2M
takedown) under the highest level via the Commitment Structure step; or (b) rebuild
the origination with the obligation as a single-level (non-"H") commitment so the
amount is directly bookable. `buildPayload` does not set `commitmentLevel`, so AFS
defaults it to "H" — for a simple bookable loan it likely needs single-level or a
takedown child.

> Note: while ID2 holds the WP checked out in the UI, `POST /route` via API returns
> `[error|16] Unit status does not allow routing` — at post-approval stages, route
> via the UI Send Work dialog (close/check-in the UI first to free it for API).

### BLOCKER detail — Commitment Structure (Closing Prep)
The Commitment Structure grid shows ONE row: "Highest Level" / $2,000,000 / no
"Taken Down From". ADD menu offers **Add Loan** (DISABLED), **Add Commit**, **Add LC**.
"Add Loan" disabled => can't directly add a loan takedown under the highest-level
commitment in the current state. Also: `obligationType 3040` displays as
**"Revolving Facility"** in the UI, but the build set `revolvingType=N` / shortName
"Term Loan" — a type/structure mismatch likely contributing.

**Conclusion:** booking 32689 needs an obligation-structure fix, not a single field:
- (a) rebuild the origination with a single-level (non-"H") obligation and a
  term-loan-appropriate `obligationType` (3040 is "Revolving Facility"), so the
  commitment amount is directly bookable; OR
- (b) build the proper takedown structure under the highest-level commitment
  (Add Commit / takedown) so the derived amount populates.
`buildPayload` defaults to a single highest-level obligation with `obligationType
3040` and no takedown — fine for *staging* an origination (matches WPs 32645/46),
but not directly bookable.

### Net result of this session
- API create chain proven end-to-end (customer 46934, obligor 34392, reserved obln
  18, origination WP 32689) — all documented.
- Entire origination→booking workflow reverse-engineered + documented across 6
  stages, with every required field + picklist code captured (../valid-values/catalog.md).
- Loan **credit-APPROVED** (approver AFSDD342 via login AFSDD302) and customer
  **ACCEPTED**; advanced to Closing Preparation — 1 structural step from booking.
- Funding (`createFinancial`) pends booking.

### Step 6 — Funding via `createFinancial` (proved on existing loans; per user pivot)
Since 32689's booking is structurally blocked, the **funding half** was proven on
existing booked obligations using `simulate` (dry run). Full detail:
[../writes/createFinancial.md](../writes/createFinancial.md).
- `transaction` code = servicing `apiName` (`DisburseFuture` / `DisburseCurrent`),
  harvested from `/financialHistory/listAllById/24096`.
- Required `balanceCode` discovered via validation loop; obligation-specific codes
  read from `/balances/listFullKey`.
- `createFinancial` validates against LIVE obligation state (matured / frozen /
  already-disbursed / current-vs-future / balance-code existence) — proving the
  endpoint is fully functional.
- **No real POST possible:** every dd3 booked obligation is matured/frozen/fully-
  disbursed. A clean takedown needs an open current obligation with availability
  (which booking 32689 would have produced). Override passwords / backdating NOT used.

## SESSION SUMMARY
- ✅ API create chain end-to-end: customer 46934, obligor 34392, reserved obln 18,
  origination WP 32689 (all documented).
- ✅ Full origination→booking workflow reverse-engineered across 6 stages; WP 32689
  credit-APPROVED (approver AFSDD342 via login AFSDD302) + customer-ACCEPTED + into
  Closing Preparation. Booking blocked only by the Highest-Level-commitment-needs-
  takedown structural issue.
- ✅ `createFinancial` funding mechanism proven via simulate (codes, fields, live
  validation). Real POST gated by sandbox data state (all obligations terminal).
- ✅ Dozens of picklist codes harvested → ../valid-values/catalog.md. New read discovery
  `GET /wp/commercialOrig/{id}`. `/route` + `createFinancial` write findings added.
- ⏭ Open: book 32689 (needs single-level/takedown restructure or rebuild with a
  term-loan obligation type); fund a freshly-booked open obligation; clean up stray
  draft WPs (32679–32688) — needs a withdraw/delete reason code from the UI dialog.

### Step 4-RE — Bookable RE term loan WP 32691 — driven to Closing Prep, final structural wall
Built WP **32691** = CRE term loan (obligationType **3015 "Loan- Term"**, collateralType
2084 = "CMRE - Mixed Use - Non Residential", purposeCode 1805, GL 20001). Driven the
FULL credit workflow this session (hybrid API + UI as ID2/AFSDD302):
- API: created, set durationCode, **added the approval authority via cleaned PUT**,
  routed app→preApproval. (Lock from a failed PUT was released via a `/route` call.)
- UI (as AFSDD302): Risk Assessment ▸ **Approval Requirements** → added authority
  (AFSDD342, Highest Level). Routed → Credit Approval. **Decision = Approved**
  (the two-sided decision dataset the API can't forge). Routed → Customer Acceptance
  → **Disposition = Accepted**. Routed → Post Approval → **Closing Preparation**:
  set General Ledger **20001 (Commercial Real Estate)**, Derivative Indicator 1 +
  description. → **The loan is APPROVED and ACCEPTED in dd3.**

**FINAL BLOCKER (root cause now exact):** the obligation is a **"Highest Level"
Commitment** — `buildPayload` sets `productStructure:"F"` (= **Commitment**) and AFS
defaults `commitmentLevel:"H"`. A Commitment node's **Commitment Amount is derived
from takedowns and is DISABLED** (confirmed in the Obligation Entry EDIT dialog —
the $2,000,000 is greyed/uneditable), so it reads empty to validation and gates the
forward route to booking. In Commitment Structure, **"Add Loan" is disabled** (only
Add Commit / Add LC), so a bookable loan-takedown can't be added under it.
- This affects BOTH the revolver (3040) AND the term loan (3015) — obligationType
  was necessary but NOT sufficient. The issue is the **Commitment product structure**.
- **Fix (origination-time):** originate the obligation with a directly-bookable
  **loan** product structure (NOT productStructure "F"/Commitment) so the loan amount
  is the bookable amount with no takedown layer. `buildPayload` hardcodes
  `productStructure:"F"` and `code:"200"`; a bookable single loan likely needs a
  different product/structure (to be confirmed from a booked loan's origination, e.g.
  Piedmont 83/91 which are single-level `type 3015` "Loan- Term").

Net: every workflow stage + decision + acceptance is proven and reproducible; the
last 1% (booking) needs the correct origination product structure, not a UI step.

### Step 4-RE2 — Bookable STANDALONE LOAN (WP 32697) driven to COMPLETE
Rebuilt with **`productStructure: "C"` (Standalone Loan)** — the directly-bookable
structure (vs "F" Commitment). Drove the full workflow (API originator setup + UI as
AFSDD302): approval authority → decision Approved → acceptance Accepted → Closing
Preparation. At Closing Prep the obligation is a **"STANDALONE LOAN"** with **"Loan
Information"** and an editable **"Current Outstanding" $2,000,000** (NOT the derived/
disabled "Commitment Amount" of the "F" Commitment) — confirming productStructure C
fixes the booking blocker.

Closing-prep required steps completed (codes in ../valid-values/catalog.md):
- Loan Information: General Ledger 20001 (Commercial RE), Balance Indicator Basic,
  **Maturity Period 2 (Greater Than 1 Year)** — fixes "Legal Maturity ≤ Effective +
  365 days" error.
- Obligation Rating Display: added a **Final Grade** rating + Split Rating **15
  Acceptable Risk @ 100%** ("At least one rating must be entered").

→ **All required Closing-Prep steps ✓; unit `state: "complete"` (status "cc").**
The origination is DONE.

### Booking mechanism — finding
The final BOOK (post to servicing) is **not a user-facing action** for the
origination/approver roles (AFSDD301/302). Exhaustively checked: in-WP route icons
(forward route gone once complete; backward → Pre-Approval only), TOOLS menu, WP
folder menu, Job List row menu (Edit/View/Assign/Reassign/Comments), Job List MORE
(Rename/Unlock/Force Close/Reassign/Requeue/Target Date/Delete), Job List toolbar
(Withdraw/Hold/Reactivate). `POST /route` to any forward stage → `[16] Unit status
does not allow routing` (unit already complete). `readyToBook` stays 0 and can't be
PUT (the GET→PUT round-trip corrupts on a cbm/Obligation-vs-cbm/Request refList).
**Conclusion:** booking a completed origination WP is a downstream **back-office /
batch execution** process (a different role/queue posts "ready-to-book" WPs to
servicing) — outside the origination role's UI. The loan is fully built + approved +
accepted + closing-complete; the servicing post is the one remaining out-of-role step.

### Step 7 — Cleanup (done) — `POST /jobs/updateStatus action:"withdraw"`
Discovered the cleanup mechanism (was spec-only/never-called): withdraw via
`/jobs/updateStatus` with reason `OTHR`. **Withdrew 18 stray WPs** (32679–32696,
incl. the original 8-draft debt 32679–32686 the brief flagged), **kept 32697** (the
canonical completed CRE Standalone Loan). Detail:
[../writes/jobsUpdateStatus.md](../writes/jobsUpdateStatus.md).
Unit status: `a`/`cc` → `cw` (withdrawn). Sandbox is now tidy.
