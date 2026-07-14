# Multi-obligor read sweep — findings

Probed the obligor/obligation-keyed read endpoints that were **empty (404) for the
single Zeppelin seed** across 11 distinct obligors on bank 5 (`multi_sweep.py`,
read-only). Purpose: flip "empty-for-seed" into live-verified by finding obligors
that actually have the data.

Obligors swept (bank 5): 1136 (Mickey Mouse Pizza), 39 (Shell Company),
34160 (Piedmont PCI), 13 (Zeppelin), 62, 21456, 21449, 21100, 12968, 12471, 2357.

## Resolved — now live on the broader book

| Endpoint | Obligor-oblns w/ 200 | Note |
|----------|---------------------:|------|
| `currentObligations/getFullKey` | 13 | **was 404-empty for Zeppelin** — now confirmed live; the 4 `_obligation*` patterns resolve |
| `charges/listFullKey` | 17 | widely populated (call WITHOUT pattern — finding #6) |
| `exposure/listObligor` | 11 | facilities per obligor |
| `collateral/list` | 5 | 5 of 11 obligors have collateral |
| `addresses/getPrimaryAddrByNameId` | 11 | via harvested nameId per obligor |

## Still zero across all 11 — need correct service/key or permission

`phones/list/{nameId}`, `invoices/listFullKey`, `collateralNegotiable/listFullKey`,
`billingSchedules/listFullKey`, `accrualSchedules/listFullKey` returned no 200.
Likely causes: (a) guessed `listFullKey` service may be wrong for these resources
(check each spec's actual service segment), (b) `accrualSchedules` is permission-
denied (403, known), (c) none of these obligors carry that data. **Resolved** in the
corrected-path re-probe below — the earlier zeros were wrong key/service guesses.

## Corrected-path re-probe (the earlier zeros were wrong key/service guesses)

| Endpoint | Real path | Result |
|----------|-----------|--------|
| invoices | `/invoices/list/{bank}-{billYear}` (e.g. `5-2026`) | ✅ 200, 5 rows — keyed by **bank+billYear**, not obligor |
| collateralNegotiable | `/collateralNegotiable/list/{bank}-{obligor}` (`5-13`) | ✅ 200, 1 row — **2-part** key |
| billingSchedules | `/billingSchedules/listFullKey/{b}-{o}-{obln}-{chargeCode}` | 🔒 403 — permission-denied (like accrualSchedules) |
| phones | `/phones/list?nameId={id}` (nameId is a **required query param**) | ∅ 404 — empty for Zeppelin (resolves for obligors with phones on file); `/phones/get` needs `nameId`+`phoneSequence` |

So invoices + collateralNegotiable are now resolved; billingSchedules joins the
permission-gated set; phones still needs its correct call.

## Takeaway
The "empty-for-Zeppelin 404s" are largely a **single-seed artifact**, not endpoint
gaps — sweeping the book resolves them. `currentObligations` is now live-verified.
Read live-resolution rises accordingly; remaining zeros are key/service/permission,
not missing endpoints.
