# infra/snowflake

Snowflake assets for the credit demo. Snowflake is **reached directly** (not via the gateway) —
it is a governed MCP, so it keeps native per-user identity + RBAC/column-masking (see
[architecture.md ADR-005](../../planning/architecture.md#55-adr-005--snowflake-moved-out-of-the-gateway-boom-moved-in)).

## Files
| File | Purpose | Status |
|---|---|---|
| `01-grants.sql` | ROLE_RM/ROLE_ANALYST read access to the 6 source objects + EXECUTE on procs + USAGE on the MCP server | **active** |
| `02-rewrite-procedures.sql` | 6 PIEDMONT_MCP procs → `EXECUTE AS CALLER` + in-proc masking (`CURRENT_ROLE()='ROLE_ANALYST' → NULL`) | **active** |

> **⚠️ Apply order matters:** `CREATE OR REPLACE PROCEDURE` **drops the procedure's grants**. Run
> `02` **then** `01` (or re-run `01` after `02`). A role-restricted PAT (no secondary roles) will get
> `Unknown function …` if the grants are stale — a test user with `ALL` secondary roles masks this.
| `05-direct-access-users.sql` | per-employee users `EMPLOYEE_A`(ROLE_RM) / `EMPLOYEE_B`(ROLE_ANALYST) | **active** |
| `original/` | baseline DDL of the 6 procs (provenance) | reference |
| `03-service-user.sql`, `04-create-pats-and-providers.sh` | gateway PAT plumbing | **retired** (ADR-005) |

## Direct access — how it works
A client (Claude Desktop, or later the KG) connects to **PIEDMONT_MCP directly** via the
pre-existing **`PIEDMONT_MCP_OAUTH`** Snowflake OAuth integration (confidential client, redirect
`https://claude.ai/api/mcp/auth_callback`, refresh tokens on, `ACCOUNTADMIN/SECURITYADMIN` blocked).
The employee logs in as their **own Snowflake user**; their **default role** (`ROLE_RM` /
`ROLE_ANALYST`) drives the `EXECUTE AS CALLER` masking — RM sees exposure `$`, Analyst sees `NULL`.
No service identity, no gateway, no per-user contortions.

- **MCP endpoint:** `https://sptnhmv-xf37990.snowflakecomputing.com/api/v2/databases/CREDIT_MEMO_DB/schemas/CREDIT_RISK/mcp-servers/PIEDMONT_MCP`
- **OAuth integration:** `PIEDMONT_MCP_OAUTH` (client id via `SELECT SYSTEM$SHOW_OAUTH_CLIENT_SECRETS('PIEDMONT_MCP_OAUTH')`)
- **Users:** `employee_a` (ROLE_RM), `employee_b` (ROLE_ANALYST) — passwords set out-of-band.

**Verified:** `GET_BALANCE_TREND(847291)` as ROLE_RM returns `$` balances; as ROLE_ANALYST returns
only `pct_change`/`direction`.

> Identity note: this uses **Snowflake's own** login. For corporate SSO (one identity across the
> stack) you'd instead front Snowflake with **External OAuth** trusting the company IdP — but Cognito
> access tokens lack an `aud` claim, so Cognito-as-IdP isn't a clean fit; that's a productionization
> choice with the real IdP (Okta/Entra).
