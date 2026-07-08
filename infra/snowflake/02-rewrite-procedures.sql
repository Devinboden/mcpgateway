-- Phase C / C11 — rewrite the 6 PIEDMONT_MCP procedures:
--   * EXECUTE AS OWNER  ->  EXECUTE AS CALLER   (so CURRENT_ROLE() = the calling employee role)
--   * dollar/exposure fields wrapped in  CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE <v> END
-- Risk signals (ratings, PD, utilization %, DPD/delinquency) are visible to BOTH roles.
-- Bodies use $$...$$ dollar-quoting (no single-quote doubling). Baseline of the originals is in
-- infra/snowflake/original/piedmont_procedures_baseline.sql.
--
-- Run as the owning role so ownership stays SYSADMIN and PIEDMONT_MCP keeps referencing them.

USE ROLE SYSADMIN;
USE DATABASE CREDIT_MEMO_DB;
USE SCHEMA CREDIT_RISK;
USE WAREHOUSE CREDIT_MEMO_WH;

-- ============================ FIND_OBLIGOR (no dollars) ============================
CREATE OR REPLACE PROCEDURE FIND_OBLIGOR(NAME_SEARCH VARCHAR)
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    SELECT OBJECT_CONSTRUCT(
      'query', :NAME_SEARCH,
      'count', COUNT(*),
      'results', ARRAY_AGG(OBJECT_CONSTRUCT(
                   'obligor_number', customer_number,
                   'obligor_name', customer_name,
                   'naics', naics,
                   'segment', segment,
                   'city', city,
                   'state', state,
                   'line_of_business', line_of_business))
                 WITHIN GROUP (ORDER BY customer_name)
    )
    FROM DEMO_CREDIT.CIF.CIF_CSTMR_MSTR
    WHERE customer_name ILIKE '%' || :NAME_SEARCH || '%'
  );
  RETURN res;
END;
$$;

-- ============================ LIST_FACILITIES (mask commitment_amount) ============================
CREATE OR REPLACE PROCEDURE LIST_FACILITIES(OBLIGOR_NUMBER NUMBER(38,0))
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    SELECT OBJECT_CONSTRUCT(
      'obligor_number', :OBLIGOR_NUMBER,
      'obligor_name', (SELECT MAX(obligor_name) FROM DEMO_CREDIT.AFS.AFS_VDE_OBLIGATION_ROOT WHERE obligor_number = :OBLIGOR_NUMBER),
      'count', COUNT(*),
      'facilities', ARRAY_AGG(OBJECT_CONSTRUCT(
                      'obligation_number', obligation_number,
                      'product_type', product_type,
                      'is_revolver', is_revolver,
                      'commitment_amount', CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE commitment_amount END,
                      'note_rate', note_rate,
                      'orig_date', orig_date,
                      'maturity_date', maturity_date))
                    WITHIN GROUP (ORDER BY obligation_number)
    )
    FROM DEMO_CREDIT.AFS.AFS_VDE_OBLIGATION_ROOT
    WHERE obligor_number = :OBLIGOR_NUMBER
  );
  RETURN res;
END;
$$;

-- ============================ GET_RISK_RATING_TREND (no dollars) ============================
CREATE OR REPLACE PROCEDURE GET_RISK_RATING_TREND(OBLIGOR_NUMBER NUMBER(38,0), MONTHS NUMBER(38,0) DEFAULT 12)
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    WITH base AS (
      SELECT rating_date, CAST(risk_rating AS INT) AS risk_rating, pd_estimate_pct
      FROM DEMO_CREDIT.CDL.CDL_FACTENTITYRATING
      WHERE obligor_number = :OBLIGOR_NUMBER
        AND rating_date >= DATEADD(month, -(:MONTHS - 1),
              (SELECT MAX(rating_date) FROM DEMO_CREDIT.CDL.CDL_FACTENTITYRATING
               WHERE obligor_number = :OBLIGOR_NUMBER))
    )
    SELECT OBJECT_CONSTRUCT(
      'obligor_number', :OBLIGOR_NUMBER,
      'obligor_name', (SELECT MAX(entity_name) FROM DEMO_CREDIT.CDL.CDL_FACTENTITYRATING WHERE obligor_number = :OBLIGOR_NUMBER),
      'metric', 'risk_rating',
      'grain', 'quarterly',
      'note', 'Higher rating = worse credit (1=best, 15=worst); rising = deteriorating.',
      'window', OBJECT_CONSTRUCT('from', MIN(rating_date), 'to', MAX(rating_date), 'periods', COUNT(*)),
      'series', ARRAY_AGG(OBJECT_CONSTRUCT('period', rating_date, 'risk_rating', risk_rating, 'pd_estimate_pct', pd_estimate_pct))
                  WITHIN GROUP (ORDER BY rating_date),
      'summary', OBJECT_CONSTRUCT(
        'start_rating',  MIN_BY(risk_rating, rating_date),
        'end_rating',    MAX_BY(risk_rating, rating_date),
        'peak_rating',   MAX(risk_rating),
        'notches_moved', MAX_BY(risk_rating, rating_date) - MIN_BY(risk_rating, rating_date),
        'direction', CASE WHEN MAX_BY(risk_rating, rating_date) > MIN_BY(risk_rating, rating_date) THEN 'deteriorating'
                          WHEN MAX_BY(risk_rating, rating_date) < MIN_BY(risk_rating, rating_date) THEN 'improving'
                          ELSE 'stable' END)
    )
    FROM base
  );
  RETURN res;
END;
$$;

-- ============================ GET_REVOLVER_USAGE_TREND (mask commitment/drawn/available; keep utilization_pct) ============================
CREATE OR REPLACE PROCEDURE GET_REVOLVER_USAGE_TREND(OBLIGOR_NUMBER NUMBER(38,0), MONTHS NUMBER(38,0) DEFAULT 12)
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    WITH base AS (
      SELECT obligation_number, as_of_date, commitment_amount, drawn_amount, available_amount, utilization_pct
      FROM DEMO_CREDIT.AFS.AFS_V_REVOLVER_USAGE
      WHERE obligor_number = :OBLIGOR_NUMBER
        AND as_of_date >= DATEADD(month, -(:MONTHS - 1),
              (SELECT MAX(as_of_date) FROM DEMO_CREDIT.AFS.AFS_V_REVOLVER_USAGE
               WHERE obligor_number = :OBLIGOR_NUMBER))
    )
    SELECT OBJECT_CONSTRUCT(
      'obligor_number', :OBLIGOR_NUMBER,
      'obligor_name', (SELECT MAX(obligor_name) FROM DEMO_CREDIT.AFS.AFS_V_REVOLVER_USAGE WHERE obligor_number = :OBLIGOR_NUMBER),
      'metric', 'revolver_utilization',
      'grain', 'monthly',
      'window', OBJECT_CONSTRUCT('from', MIN(as_of_date), 'to', MAX(as_of_date), 'periods', COUNT(DISTINCT as_of_date)),
      'series', ARRAY_AGG(OBJECT_CONSTRUCT('period', as_of_date, 'obligation_number', obligation_number,
                          'commitment', CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE commitment_amount END,
                          'drawn',      CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE drawn_amount END,
                          'available',  CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE available_amount END,
                          'utilization_pct', utilization_pct))
                  WITHIN GROUP (ORDER BY as_of_date, obligation_number),
      'summary', OBJECT_CONSTRUCT(
        'start_utilization', MIN_BY(utilization_pct, as_of_date),
        'end_utilization',   MAX_BY(utilization_pct, as_of_date),
        'peak_utilization',  MAX(utilization_pct),
        'direction', CASE WHEN MAX_BY(utilization_pct, as_of_date) > MIN_BY(utilization_pct, as_of_date) THEN 'increasing'
                          WHEN MAX_BY(utilization_pct, as_of_date) < MIN_BY(utilization_pct, as_of_date) THEN 'decreasing'
                          ELSE 'flat' END)
    )
    FROM base
  );
  RETURN res;
END;
$$;

-- ============================ GET_BALANCE_TREND (mask $ balances; keep pct_change/direction) ============================
CREATE OR REPLACE PROCEDURE GET_BALANCE_TREND(OBLIGOR_NUMBER NUMBER(38,0), MONTHS NUMBER(38,0) DEFAULT 12)
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    WITH base AS (
      SELECT as_of_date, ledger_balance, collected_balance
      FROM DEMO_CREDIT.DEP.DEP_BAL_RECORD
      WHERE customer_number = :OBLIGOR_NUMBER
        AND as_of_date >= DATEADD(month, -(:MONTHS - 1),
              (SELECT MAX(as_of_date) FROM DEMO_CREDIT.DEP.DEP_BAL_RECORD
               WHERE customer_number = :OBLIGOR_NUMBER))
    )
    SELECT OBJECT_CONSTRUCT(
      'obligor_number', :OBLIGOR_NUMBER,
      'obligor_name', (SELECT MAX(customer_name) FROM DEMO_CREDIT.CIF.CIF_CSTMR_MSTR WHERE customer_number = :OBLIGOR_NUMBER),
      'metric', 'deposit_balance',
      'grain', 'monthly',
      'window', OBJECT_CONSTRUCT('from', MIN(as_of_date), 'to', MAX(as_of_date), 'periods', COUNT(*)),
      'series', ARRAY_AGG(OBJECT_CONSTRUCT('period', as_of_date,
                          'ledger_balance',    CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE ledger_balance END,
                          'collected_balance', CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE collected_balance END))
                  WITHIN GROUP (ORDER BY as_of_date),
      'summary', OBJECT_CONSTRUCT(
        'start_balance', CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE MIN_BY(ledger_balance, as_of_date) END,
        'end_balance',   CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE MAX_BY(ledger_balance, as_of_date) END,
        'min_balance',   CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE MIN(ledger_balance) END,
        'change',        CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE MAX_BY(ledger_balance, as_of_date) - MIN_BY(ledger_balance, as_of_date) END,
        'pct_change',    ROUND((MAX_BY(ledger_balance, as_of_date) - MIN_BY(ledger_balance, as_of_date))
                               / NULLIF(MIN_BY(ledger_balance, as_of_date), 0) * 100, 1),
        'direction', CASE WHEN MAX_BY(ledger_balance, as_of_date) > MIN_BY(ledger_balance, as_of_date) THEN 'increasing'
                          WHEN MAX_BY(ledger_balance, as_of_date) < MIN_BY(ledger_balance, as_of_date) THEN 'decreasing'
                          ELSE 'flat' END)
    )
    FROM base
  );
  RETURN res;
END;
$$;

-- ============================ GET_PAYMENT_HISTORY (mask $ scheduled/paid; keep DPD/delinquency) ============================
CREATE OR REPLACE PROCEDURE GET_PAYMENT_HISTORY(OBLIGOR_NUMBER NUMBER(38,0), MONTHS NUMBER(38,0) DEFAULT 12)
RETURNS VARIANT LANGUAGE SQL EXECUTE AS CALLER
AS $$
DECLARE res VARIANT;
BEGIN
  res := (
    WITH g AS (
      SELECT due_date,
             SUM(scheduled_payment)      AS scheduled_total,
             SUM(paid_amount)            AS paid_total,
             MAX(days_past_due)          AS worst_dpd,
             COUNT_IF(days_past_due > 0) AS facilities_past_due
      FROM DEMO_CREDIT.AFS.AFS_VDE_REPAYMENT_SCHEDULE
      WHERE obligor_number = :OBLIGOR_NUMBER
        AND due_date >= DATEADD(month, -(:MONTHS - 1),
              (SELECT MAX(due_date) FROM DEMO_CREDIT.AFS.AFS_VDE_REPAYMENT_SCHEDULE
               WHERE obligor_number = :OBLIGOR_NUMBER))
      GROUP BY due_date
    )
    SELECT OBJECT_CONSTRUCT(
      'obligor_number', :OBLIGOR_NUMBER,
      'obligor_name', (SELECT MAX(obligor_name) FROM DEMO_CREDIT.AFS.AFS_VDE_REPAYMENT_SCHEDULE WHERE obligor_number = :OBLIGOR_NUMBER),
      'metric', 'payment_history',
      'grain', 'monthly',
      'window', OBJECT_CONSTRUCT('from', MIN(due_date), 'to', MAX(due_date), 'periods', COUNT(*)),
      'series', ARRAY_AGG(OBJECT_CONSTRUCT('period', due_date,
                          'scheduled_total', CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE scheduled_total END,
                          'paid_total',      CASE WHEN CURRENT_ROLE()='ROLE_ANALYST' THEN NULL ELSE paid_total END,
                          'worst_dpd', worst_dpd, 'facilities_past_due', facilities_past_due))
                  WITHIN GROUP (ORDER BY due_date),
      'summary', OBJECT_CONSTRUCT(
        'months_with_dpd', COUNT_IF(worst_dpd > 0),
        'max_dpd',         MAX(worst_dpd),
        'dpd_events',      SUM(facilities_past_due),
        'current_status',  MAX_BY(worst_dpd, due_date))
    )
    FROM g
  );
  RETURN res;
END;
$$;
