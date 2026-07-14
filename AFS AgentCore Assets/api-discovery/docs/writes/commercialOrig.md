# `/wp/commercialOrig` — Origination workpackage (live findings)

POST create body model: see [SCHEMAS.md](SCHEMAS.md) (`Wf-cbm-VisionOrigWorkPackage`).
This file records **live behavior** + the **proven minimal payload** + a **new read
discovery**.

## NEW read discovery — `GET /wp/commercialOrig/{id}` works (200)

Not in the original read sweep (the `/wp/*` endpoints were treated as POST/PUT-only).
A plain `GET /wp/commercialOrig/{workpackageId}` returns the **full populated
workpackage JSON** under Basic auth — i.e. the exact valid, enriched payload AFS
persisted. Verified 2026-06-25:

| WP id | obligor | borrower | status |
|------:|--------:|----------|--------|
| 32646 | 1136 | Mickey Mouse Pizza | 200 — full payload |
| 32645 | 39 | Shell Company | 200 — full payload |

Captured payloads: `api-discovery/captured/wp_commercialOrig_3264{5,6}.json`.
This is the best ground-truth source for field codes (every coded field carries a
sibling `<field>Lit` human label in the GET response — e.g. `type:120`/`typeLit`,
`product.code:200`/`codeLit:"AFS products"`). MCP read tools can use this to fetch a
WP by id. (PUT `/wp/commercialOrig/{id}` = update, still treated as stateful.)

## Proven create payload (the reusable builder)

`tools/createWorkpackage.js` → `buildPayload(args)` already successfully created
WPs 32645/32646 against `/wp/commercialOrig` (and `/wp/commercialPost`). It builds a
full `Wf-cbm-VisionOrigWorkPackage`:

```
{
  bankId, organizationId:"1", description, readyToBook:"0"|"1",
  parties:[ { xoid:"PTY1", customerId(=obligor nameId), primaryName, shortName,
              type(obligorType), orgLevelData:{assignmentUnit,officer1},
              obligors:[ { xoid:"OBG1", obligorNumber, shortName, type, isExisting:true,
                           orgLevelData, fxInfo:{siteId:"1",currencyCode:"USD"},
                           finStmt:{stmtType:"0"}, geographicInfo:{geographicCode:"US"},
                           obgrAppls:[{appl:"1", naics?}] } ] } ],
  deal:{ applicationCollected:"Y", requests:[ {
           xoid:"REQ1", type:"NA", amount, amountCur:"USD", application:"1",
           borrower:{xoid:"OBG1"},
           product:{productStructure:"F", code:"200"},
           effectiveDate, legalMaturityDate, durationCode?, collateralType?, purposeCode?,
           origData:{revolvingType:"R"|"N", obligationType:"3040", advisedGuideType:"A", securedCode:"1"},
           obligations:[ {xoid:"OBL1", isExisting:false, shortName, obligationType, legalMaturityDate} ]
         } ] },
  lender:{ orgLevelData:{assignmentUnit,officer1} },
  primaryBorrower:{ xoid:"OBG1" }
}
```

**Key gotcha (documented in the tool):** `parties[].customerId` is the obligor's
**servicing nameId** (from `/obligors/get/{bank}-{obligor}` → `obligors.nameId`),
**NOT** the obligor number. For an existing obligor, omit it and AFS resolves it.

## Empty-body behavior
`POST /wp/commercialOrig {}` → **201** (creates a draft; see INDEX.md). Do not
empty-probe — it persists a draft workpackage.

## API-completion of the workflow — what works, what is UI-only (live, 2026-06-25)

Attempting to drive an origination to booking entirely via API revealed:

**Works via API (`PUT /wp/commercialOrig/{id}` with a "cleaned" body):**
- The GET→PUT round-trip corrupts on nested refLists. **Strip before PUT:**
  `parties[].citizenship`, `parties[].addresses`, `parties[].billingAddresses`,
  `parties[].customerCFData`, `obligors[].obligorCFData`; set
  `obligors[].finStmt.statementYear`. Then scalar edits PUT cleanly (durationCode,
  obligations[].generalLedger, etc.). A successful PUT also **releases a stale lock**
  (`lockUserId` from a failed prior PUT).
- Adding the **approval authority** (`deal.approvalReq.approvers[]` =
  `{approvalAuthority:"0100", approvalType:"P", isHighestLvl:true, requestApprover:<approverOid>}`,
  e.g. 181 = AFSDD342) — works the FIRST time on some WPs, but the round-trip is
  fragile: different data triggers other refList errors (e.g. *"meta type cbm/Obligation
  but this refList expects cbm/Request"*). Not reliable across WPs.
- `POST /route` to advance stages (as the appropriate user for SoD).

**UI-only (could not be done reliably via API):**
- The **credit decision**. `deal.decisions[]` is a **two-sided linked dataset**:
  `deal.decisions[i].requestDecisions[] (oid)` ↔ `deal.requests[j].decisions[] (oid)`,
  created atomically by the UI Decision Entry. The PUT is **append-only** for these
  arrays (each PUT ADDS, `deleteInd` does not remove), and a decision with empty
  `xoid` is "rendered invalid and ignored." So a valid decision cannot be forged via
  PUT. Enter it in the UI (Credit Approval > Decision Management) as the approver.

**SoD note:** API calls inherit the Basic-auth user. Use the **originator** creds for
app/preApproval edits + routing, and the **approver** creds (AFSDD302) for the
decision. The decision's `entryUserOid` must be the approver (37 = AFSDD302).
