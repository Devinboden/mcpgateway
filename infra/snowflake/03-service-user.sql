-- Phase C / C11 — service identity the gateway uses to reach the Snowflake MCP.
-- One TYPE=SERVICE user holding BOTH roles; each PAT (created separately, secret-safe) is
-- ROLE_RESTRICTION'd to one role so the session role -> the procedures' CURRENT_ROLE() check.
-- A network policy is REQUIRED before a PAT can be used (Snowflake constraint).
-- Demo policy is permissive (0.0.0.0/0); restrict to the gateway egress range in production.

USE ROLE ACCOUNTADMIN;

CREATE USER IF NOT EXISTS SVC_GATEWAY
  TYPE = SERVICE
  DEFAULT_WAREHOUSE = CREDIT_MEMO_WH
  COMMENT = 'AgentCore Gateway outbound service identity for Snowflake MCP (PAT auth).';

GRANT ROLE ROLE_RM      TO USER SVC_GATEWAY;
GRANT ROLE ROLE_ANALYST TO USER SVC_GATEWAY;

CREATE NETWORK POLICY IF NOT EXISTS NP_GATEWAY_ALLOW_ALL
  ALLOWED_IP_LIST = ('0.0.0.0/0')
  COMMENT = 'DEMO: permissive policy to satisfy the PAT network-policy requirement. Restrict to gateway egress in prod.';

ALTER USER SVC_GATEWAY SET NETWORK_POLICY = NP_GATEWAY_ALLOW_ALL;

SHOW USERS LIKE 'SVC_GATEWAY';
