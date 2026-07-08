-- Phase C / ADR-005 — per-employee Snowflake users for DIRECT access.
-- Each employee logs in to Snowflake (via the PIEDMONT_MCP_OAUTH integration) as themselves;
-- their DEFAULT_ROLE drives the EXECUTE AS CALLER procedures' masking (RM sees $, Analyst masked).
-- This is the "Snowflake does its own per-user governance" path — no gateway involved.
--
-- Passwords are set OUT OF BAND (not in this repo) via ALTER USER … SET PASSWORD.

USE ROLE USERADMIN;

CREATE USER IF NOT EXISTS EMPLOYEE_A
  LOGIN_NAME = 'employee_a'
  DEFAULT_ROLE = ROLE_RM
  DEFAULT_WAREHOUSE = CREDIT_MEMO_WH
  MUST_CHANGE_PASSWORD = FALSE
  COMMENT = 'Demo Relationship Manager — direct Snowflake access; default ROLE_RM (sees exposure $).';

CREATE USER IF NOT EXISTS EMPLOYEE_B
  LOGIN_NAME = 'employee_b'
  DEFAULT_ROLE = ROLE_ANALYST
  DEFAULT_WAREHOUSE = CREDIT_MEMO_WH
  MUST_CHANGE_PASSWORD = FALSE
  COMMENT = 'Demo Credit Analyst — direct Snowflake access; default ROLE_ANALYST (exposure $ masked).';

USE ROLE SECURITYADMIN;
GRANT ROLE ROLE_RM      TO USER EMPLOYEE_A;
GRANT ROLE ROLE_ANALYST TO USER EMPLOYEE_B;

SHOW USERS LIKE 'EMPLOYEE_%';
