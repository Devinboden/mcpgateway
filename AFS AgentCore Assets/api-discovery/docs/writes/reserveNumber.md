# `POST /reserveNumber` — write findings  `[discovered]`

Reserves an Obligation or Collateral number for later use. Validation rules below
are **discovered by live probing** (malformed payloads → rejection messages);
the spec only gives field types/maxLengths.

## Request body  `[spec]` + enforced `[discovered]`

| Field | Type | Spec | Required? (probed) | Enforced rule (probed) |
|-------|------|------|--------------------|------------------------|
| `correlationId` | string | maxLen 15 | **yes** | maxLen 15 **enforced** (16+ → 400); idempotency key |
| `bankId` | string | maxLen 4 | **yes** | maxLen 4 **enforced** (5+ → 400) |
| `obligorNumber` | string | maxLen 10 | **yes** | **must exist** — FK check (9999999 → 400 "Invalid Obligor Number") |
| `reserveType` | int | maxLen 4 | **yes** | **enum {2=Obligation, 3=Collateral}**; 99 → 400; non-numeric → 400 |
| `expirationDays` | int | maxLen 4 | **yes** | **≥ 0** (zero or positive); -5 → 400 |
| `reserveNumber` | string | maxLen 10 | no | optional — request a specific number |

## Success response  `[discovered]`

```json
{ "reserveNumber": 257, "messages": [ { "text": "Obligation reservation is successful.", "code": "0", "severity": "info" } ] }
```
- `reserveType 2` → "Obligation reservation is successful." (got #257)
- `reserveType 3` → "Collateral reservation is successful." (got #67)
- Returns the assigned integer in `reserveNumber`. **`correlationId` is an idempotency
  key** — reusing it returns the same reservation (no duplicate created).

## Validation matrix (live, read this for MCP error handling)

| Probe | HTTP | code | Message |
|-------|------|-----:|---------|
| omit `correlationId` | 400 | 1 | Required field 'correlationId' was not provided. |
| omit `bankId` | 400 | 1 | Required field 'bankId' was not provided. |
| omit `obligorNumber` | 400 | 1 | Required field 'obligorNumber' was not provided. |
| omit `reserveType` | 400 | 1 | Required field 'reserveType' was not provided. |
| omit `expirationDays` | 400 | 1 | Required field 'expirationDays' was not provided. |
| `reserveType=99` | 400 | 3 | Invalid Reserve Type: '99'. Valid values are '2' for Obligation or '3' for Collateral. |
| `reserveType="abc"` | 400 | 1 | The value 'abc' is invalid for the field 'reserveType' and cannot be read. |
| `correlationId` len 20 | 400 | 1 | Length of value exceeds maximum length of 15 |
| `bankId="99999"` | 400 | 1 | Length of value exceeds maximum length of 4 |
| `obligorNumber="9999999"` | 400 | 2 | Invalid Obligor Number: '9999999'. |
| `expirationDays=-5` | 400 | 4 | Invalid Expiration Days: '-5'. Valid values are zero or integers greater than zero. |
| `reserveType=3` (collateral) | 200 | 0 | Collateral reservation is successful. |

## Error-code taxonomy  `[discovered]` (applies broadly — see API_FINDINGS #7)
- `code 0` = success (severity info)
- `code 1` = field-level validation (required / type / length)
- `code 2` = invalid reference / FK (obligor must exist)
- `code 3` = invalid enum value (lists the valid set in the text)
- `code 4` = out-of-range value

## Data created
2 reservations (obligation #257, collateral #67), idempotent on `correlationId`
(`DISC-RSV-001`, `DISC-RSV-COL3`) — re-runs reuse them, no duplicates.
