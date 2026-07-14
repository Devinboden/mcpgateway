# `POST /jobs/updateStatus` — workpackage status update (live findings)

Previously **spec-only / not called** (stateful batch). Now live-verified for
**workpackage cleanup** (2026-06-25).

Body `Wf-ws-wpStatusUpdate-StatusUpdateRequest`:
```
{ "workpackages": [ { "id": <int, required>,
                      "action": "<string ≤25, required>",
                      "reason": "<string ≤4>",
                      "owner": "<string ≤8>",
                      "units": [...] } ] }
```

## Verified action: `withdraw`
`{workpackages:[{id, action:"withdraw", reason:"OTHR"}]}` → **HTTP 200**
`[info|0] Status update Action: 'withdraw' successfully executed for Workpackage ID:
<id> and all of its unit(s).`

- `reason` = a **Job List Withdraw reason code** (see ../valid-values/catalog.md):
  `OTHR` (Other), `AWNC`, `CONA`, `NLNF`, `OBRF`, `OBTC`, `TCON`, `TDRE`, `TPEM`,
  `TREL`.
- Batch-capable: pass multiple objects in `workpackages[]` (we did one-per-call for
  clear per-WP results).
- Works across stages: cleared draft WPs (applicationStage) **and** approved/
  closing-prep WPs in one sweep.
- Other Job List actions map to other `action` strings (UI exposes Withdraw, Hold,
  Reactivate, Force Close, Reassign, Requeue, Delete) — only `withdraw` exercised.

## Unit status codes observed (`units[].status`)
| code | meaning |
|------|---------|
| `a` | active |
| `cc` | complete (origination done; e.g. the kept loan 32697) |
| `cw` | closed / withdrawn (after `action:"withdraw"`) |

## Cleanup performed
Withdrew 18 stray WPs created across the build session **+ the original 8 empty-draft
debt (32679–32686)** that prior sessions could not clear (no reason code then):
`32679–32696` withdrawn (all `cw`); **`32697` kept** (the canonical completed CRE
Standalone Loan, `cc`). Reason `OTHR`.

> Safe-cleanup recipe: `POST /jobs/updateStatus` with `action:"withdraw"`,
> `reason:"OTHR"`, one WP id per call; verify each `unit.status` flips `a`/`cc` → `cw`.
