# AFS picklist refList-name catalog (live from `/rs/pl/*`)

**85 refList names · 1344 code→label options**, captured by replaying the
exact `/rs/pl/fixed?name=…` and `/rs/pl/dynamic?name=ilm/pl/…` calls the origination
UI fired (recorded via an XHR interceptor across the collateral, pricing, repayment,
fee, rating, support and financial-analysis screens). Each name here is directly
callable — `GET /webx/rs/pl/fixed?name=<name>` → `{plName, items:[{code,literal}]}`.
Machine-readable (incl. all options): `captured/picklist_api_names.json`. Endpoint
mechanics: [picklist_api.md](../writes/picklist_api.md).

## Naming scheme (decoded)

| prefix | domain | examples |
|---|---|---|
| — | Accrual schedule | `ACCS203` |
| — | Address | `ADDR209`, `ADDR212`, `ADDR233` |
| — | Application | `APPL030` |
| — | Charge header | `CHGH200`, `CHGH206` |
| — | Collateral — Borrowing Base | `COBB203`, `COBB212`, `COBB218`, `COBB221` |
| — | Collateral — Negotiable | `CONL203`, `CONL236` |
| — | Collateral — Real Estate | `CLRE203`, `CLRE206`, `CLRE215`, `CLRE218` |
| — | Collateral — general | `COLR260`, `COLR263`, `COLR269`, `COLR299` |
| — | Currency | `*CUR100` |
| — | Indirect support | `SUPR215`, `SUPR218` |
| — | Named / dynamic | `Answers`, `Answers2`, `Fee+Title`, `Guarantee+Type+Selector` |
| — | Organization levels | `*ORG001`, `*ORG002`, `*ORG003`, `*ORG004` |
| — | Prime / pricing schedule | `PRMS200`, `PRMS206` |
| — | Repayment | `REPY236`, `REPY239`, `REPY254` |
| — | Risk rating | `RSKR203`, `RSKR209`, `RSKR215` |

## Full inventory

| refList name | kind | domain | # options |
|---|---|---|---:|
| `ACCS203` | fixed | Accrual schedule | 7 |
| `ADDR209` | fixed | Address | 82 |
| `ADDR212` | fixed | Address | 265 |
| `ADDR233` | fixed | Address | 25 |
| `APPL030` | fixed | Application | 2 |
| `CHGH200` | fixed | Charge header | 11 |
| `CHGH206` | fixed | Charge header | 9 |
| `COBB203` | fixed | Collateral — Borrowing Base | 11 |
| `COBB212` | fixed | Collateral — Borrowing Base | 10 |
| `COBB218` | fixed | Collateral — Borrowing Base | 11 |
| `COBB221` | fixed | Collateral — Borrowing Base | 3 |
| `CONL203` | fixed | Collateral — Negotiable | 2 |
| `CONL236` | fixed | Collateral — Negotiable | 1 |
| `CLRE203` | fixed | Collateral — Real Estate | 4 |
| `CLRE206` | fixed | Collateral — Real Estate | 4 |
| `CLRE215` | fixed | Collateral — Real Estate | 1 |
| `CLRE218` | fixed | Collateral — Real Estate | 1 |
| `CLRE242` | fixed | Collateral — Real Estate | 3 |
| `CLRE245` | fixed | Collateral — Real Estate | 14 |
| `CLRE389` | fixed | Collateral — Real Estate | 1 |
| `CLRE401` | fixed | Collateral — Real Estate | 3 |
| `CLRE416` | fixed | Collateral — Real Estate | 3 |
| `CLRE449` | fixed | Collateral — Real Estate | 1 |
| `CLRE452` | fixed | Collateral — Real Estate | 2 |
| `CLRE455` | fixed | Collateral — Real Estate | 2 |
| `CLRE458` | fixed | Collateral — Real Estate | 2 |
| `CLRE461` | fixed | Collateral — Real Estate | 2 |
| `CLRE464` | fixed | Collateral — Real Estate | 2 |
| `CLRE467` | fixed | Collateral — Real Estate | 2 |
| `CLRE470` | fixed | Collateral — Real Estate | 2 |
| `COLR260` | fixed | Collateral — general | 17 |
| `COLR263` | fixed | Collateral — general | 10 |
| `COLR269` | fixed | Collateral — general | 3 |
| `COLR299` | fixed | Collateral — general | 2 |
| `COLR308` | fixed | Collateral — general | 2 |
| `COLR311` | fixed | Collateral — general | 2 |
| `COLR350` | fixed | Collateral — general | 3 |
| `COLR353` | fixed | Collateral — general | 3 |
| `*CUR100` | fixed | Currency | 46 |
| `SUPR215` | fixed | Indirect support | 10 |
| `SUPR218` | fixed | Indirect support | 2 |
| `Answers` | fixed | Named / dynamic | 2 |
| `Answers2` | fixed | Named / dynamic | 2 |
| `Fee+Title` | fixed | Named / dynamic | 36 |
| `Guarantee+Type+Selector` | fixed | Named / dynamic | 2 |
| `Indirect+Search+By` | fixed | Named / dynamic | 2 |
| `Individual+Or+Business` | fixed | Named / dynamic | 2 |
| `Payment+Type+Code` | fixed | Named / dynamic | 4 |
| `Pricing+Method` | fixed | Named / dynamic | 2 |
| `Pricing+Type` | fixed | Named / dynamic | 1 |
| `Product Structure` | fixed | Named / dynamic | 3 |
| `ilm/pl/GuaranteeSupportType` | dynamic | Named / dynamic | 9 |
| `ilm/pl/LetterOfCreditType` | dynamic | Named / dynamic | 2 |
| `ilm/pl/PricingOption` | dynamic | Named / dynamic | 2 |
| `ilm/pl/RepayType` | dynamic | Named / dynamic | 0 |
| `ilm/pl/RequestType` | dynamic | Named / dynamic | 7 |
| `up/SystemUsers` | dynamic | Named / dynamic | 326 |
| `*ORG001` | fixed | Organization levels | 4 |
| `*ORG002` | fixed | Organization levels | 68 |
| `*ORG003` | fixed | Organization levels | 5 |
| `*ORG004` | fixed | Organization levels | 1 |
| `*ORG005` | fixed | Organization levels | 1 |
| `*ORG006` | fixed | Organization levels | 1 |
| `*ORG007` | fixed | Organization levels | 1 |
| `*ORG008` | fixed | Organization levels | 1 |
| `*ORG050` | fixed | Organization levels | 16 |
| `*ORG060` | fixed | Organization levels | 7 |
| `*ORG401` | fixed | Organization levels | 14 |
| `*ORG402` | fixed | Organization levels | 14 |
| `*ORG403` | fixed | Organization levels | 14 |
| `*ORG404` | fixed | Organization levels | 14 |
| `*ORG405` | fixed | Organization levels | 14 |
| `*ORG406` | fixed | Organization levels | 14 |
| `*ORG407` | fixed | Organization levels | 14 |
| `*ORG408` | fixed | Organization levels | 14 |
| `*ORG409` | fixed | Organization levels | 14 |
| `*ORG410` | fixed | Organization levels | 14 |
| `PRMS200` | fixed | Prime / pricing schedule | 52 |
| `PRMS206` | fixed | Prime / pricing schedule | 5 |
| `REPY236` | fixed | Repayment | 17 |
| `REPY239` | fixed | Repayment | 10 |
| `REPY254` | fixed | Repayment | 10 |
| `RSKR203` | fixed | Risk rating | 3 |
| `RSKR209` | fixed | Risk rating | 2 |
| `RSKR215` | fixed | Risk rating | 10 |

> Note: `ilm/pl/RepayType` returned 0 items on this call — dynamic lists can be
> context-gated (need a selected parent value). `ADDR212` (265) is the county/
> jurisdiction list; `*CUR100` (46) currency; `PRMS200` (52) the prime/index-rate set.
