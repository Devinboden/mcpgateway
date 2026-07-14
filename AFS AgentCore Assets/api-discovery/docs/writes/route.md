# `POST /route` — Route Workpackage (live findings)

Body `Wf-ws-autoroute-AutoRouteRequest`:
```
{ autoRoutingFlags: { autoVisitStep, autoAcknowledgeField, sendBack, autoOverride, routingLimit },
  workpackage: { id, targetStage, owner?, queue?, targetDate? },
  units: [ { unitId, targetStage, owner?, queue?, targetDate? } ] }
```

Live-verified against origination WP 32687 (commercialOrig, wfType 5701) at stage
`applicationStage` (2026-06-25):

- **`targetStage` is required** at the workpackage level when no `units[]` are
  passed: `[error|2] Missing or empty workpackage level target stage`.
- Response shape `Wf-ws-autoroute-WpRouteInfo`:
  `{ workpackage:{id,description,routeStatus,routeStatusDescription,wpStatus,
  wpStatusLit}, units:[{unitOid,description,summary:{routeStatus,startState,
  endState},routingAttempts:[{success,routeTo,messages}],messages:[…]}] }`.
  `routeStatus "1" = Failed`. **Unit-level `messages[]` carry the real reasons.**
- **Stage validity is discoverable by probing** (a failed route does NOT mutate):
  - invalid target → `[error|12] The target stage '<x>' is not valid to be routed to.`
  - valid-but-blocked target → `[error|18] Unit has step(s) that are not complete`.

### Valid adjacent target stages from `applicationStage` (commercialOrig)
`bookingStage` · `postApprovalStage` · `docPrepStage`.
(Booking path = **`bookingStage`**.) Everything else tested was rejected as invalid.

### Routing to `bookingStage` surfaces the incomplete-step required fields
On the `Application Request Information` / `Request Entry` steps, all on the deal
`Request`: `initialApplAmt.c`, `collateralType`, `purposeCode`, `initialApplSource`,
`initialApplDate`, `applicationCDate`. `autoOverride`/`autoVisitStep` do NOT fill
these — they need real values, so the WP must be PUT-updated before re-routing.

> Stateful: routing that SUCCEEDS advances the WP. Failed routes are safe (no state
> change) and are the validation-loop mechanism for discovering stages + blockers.
