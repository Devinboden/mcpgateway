# `createObligor` + `createCustomer` — validation matrices  `[discovered]`

Probed with malformed payloads (every call 400 — **nothing created**). Confirms the
required-field chains, FK checks, and lengths the spec only implies.

## `POST /createObligor`
Body `{ obligor: Wf-cbm-Obligor }`. Validation order (peeled by probing):

| Probe | HTTP | code | Message |
|-------|------|-----:|---------|
| `{}` | 400 | 1 | Required field 'obligor' was not provided. |
| `{obligor:{}}` | 400 | 1 | Required field 'bankId' was not provided. |
| `{obligor:{bankId}}` | 400 | 1 | Required field 'ilmId' was not provided. |
| `+shortName,+type` | 400 | 1 | (still) Required field 'ilmId' was not provided. |
| `bad type 'ZZ' + fake ilmId` | 400 | 1 | "error returned from the Servicing System: Method Appeared To Fail In…" |
| `fake ilmId 'FAKE999'` | 400 | 1 | same servicing-system error |

**Findings:** required = `obligor.bankId`, `obligor.ilmId` (checked early), plus
`shortName`/`type` (per spec). **`ilmId` is a hard FK** — it must be a real
ILM-assigned id (from a prior `createCustomer`); a fake one fails downstream in the
servicing system. So the chain is **createCustomer → ilmId → createObligor**.

## `POST /createCustomer`
Body `{ organizationId, customer: Wf-cbm-Party }`.

| Probe | HTTP | code | Message |
|-------|------|-----:|---------|
| `{}` | 400 | 1 | Required field 'organizationId' was not provided. |
| `{organizationId}` | 400 | 1 | Required field 'customer' was not provided. |
| `{…,customer:{}}` | 400 | 1 | Required field 'name' was not provided. |
| `{…,customer:{name:{}}}` | 400 | 1 | Required field 'fullName' was not provided. |
| `organizationId len 10` | 400 | 1 | Length of value exceeds maximum length of 9 |

**Findings:** required chain = `organizationId` (**maxLen 9, enforced**) → `customer`
→ `customer.name` → `name.fullName`. Minimal valid customer = organizationId +
`customer.name.fullName` (not sent here, to avoid creating).

> Error code `1` throughout (field/type/length/FK), consistent with the taxonomy in
> `reserveNumber.md` finding #7. All probes rejected — no obligor/customer created.
