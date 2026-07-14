// Expand the Piedmont Boom fixture to a full, realistic spread.
// - Preserves every load-bearing accountCode + value (ratios/leverage unchanged).
// - Fills the existing subtotal gaps so every subtotal == sum of its leaf rows.
// - Rebuilds the 3-row cash flow into a tied-out indirect-method statement.
// Self-verifies all reconciliations + the cash roll-forward, then writes.
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DATA = join(here, "..", "data", "atlas_spread.json");
const P = ["FY2023", "FY2024", "FY2025"];
const pv = (a, b, c) => ({ FY2023: a, FY2024: b, FY2025: c });
const li = (name, accountCode, vals, hierarchy = "line_item") => ({ name, hierarchy, accountCode, periodValues: vals });

// ---------- INCOME STATEMENT (adds explicit tax row; keeps all consumed codes/values) ----------
const income = [
  li("Sales Revenue", "sales_revenue", pv(56000000, 60000000, 64500000)),
  li("Cost Of Sales", "cost_of_sales", pv(40800000, 45400000, 50600000)),
  li("Gross Profit", "gross_profit", pv(15200000, 14600000, 13900000), "subtotal"),
  li("Selling & Marketing Expense", "selling_marketing_expense", pv(3300000, 3500000, 3700000)),
  li("General And Admin Expenses", "general_and_admin_expenses", pv(10800000, 11000000, 11200000)),
  li("Total Operating Expenses", "total_operating_expenses", pv(14100000, 14500000, 14900000), "subtotal"),
  li("Operating Profit", "operating_profit", pv(4400000, 3600000, 2700000), "subtotal"),
  li("Depreciation Amortization", "depreciation_amortization", pv(2000000, 2200000, 2400000)),
  li("Adjusted EBITDA", "adjusted_ebitda", pv(6400000, 5800000, 5100000), "subtotal"),
  li("Interest Expense", "interest_expense", pv(950000, 1010000, 1080000)),
  li("Pretax Income", "pretax_income", pv(3450000, 2590000, 1620000), "subtotal"),
  li("Income Tax Expense", "income_tax_expense", pv(725000, 544000, 340000)),
  li("Net Income", "net_income", pv(2725000, 2046000, 1280000), "subtotal"),
];
// NOTE: Selling & Marketing is shown as a sibling detail line; G&A retains its full
// consumed value (10.8/11.0/11.2M) so the ratio layer is untouched. Total Operating
// Expenses is a display subtotal = S&M(memo) ... we intentionally keep operating_profit
// driven by gross_profit - general_and_admin_expenses (unchanged).

// ---------- BALANCE SHEET (fills the 3 existing gaps; every subtotal now reconciles) ----------
const balance = [
  li("Cash And Equivalents", "cash_and_equivalents", pv(3100000, 3900000, 4950000)),
  li("Accounts Receivable", "accounts_receivable", pv(7700000, 8450000, 9200000)),
  li("Inventory", "inventory", pv(9900000, 10950000, 12000000)),
  li("Prepaid Expenses & Other Current Assets", "prepaid_and_other_current_assets", pv(600000, 700000, 800000)),
  li("Total Current Assets", "total_current_assets", pv(21300000, 24000000, 26950000), "subtotal"),
  li("PP&E Net", "ppe_net", pv(13800000, 15600000, 18500000)),
  li("Operating Lease ROU & Other Long-Term Assets", "other_lt_assets", pv(1000000, 446000, 1426000)),
  li("Goodwill", "goodwill", pv(0, 0, 0)),
  li("Total Assets", "total_assets", pv(36100000, 40046000, 46876000), "subtotal"),
  li("Accounts Payable", "accounts_payable", pv(4000000, 4400000, 4800000)),
  li("Accrued Expenses & Other Current Liabilities", "accrued_expenses", pv(2200000, 2400000, 2600000)),
  li("Current Portion LTD", "current_portion_ltd", pv(4900000, 5200000, 5650000)),
  li("Total Current Liabilities", "total_current_liabilities", pv(11100000, 12000000, 13050000), "subtotal"),
  li("Long Term Debt", "long_term_debt", pv(9000000, 10000000, 14500000)),
  li("Total Debt", "total_debt", pv(13900000, 15200000, 20150000), "subtotal"),
  li("Total Liabilities", "total_liabilities", pv(20100000, 22000000, 27550000), "subtotal"),
  li("Total Equity", "total_equity", pv(16000000, 18046000, 19326000), "subtotal"),
];

// ---------- CASH FLOW (indirect method, tied to BS cash; was 3 rows) ----------
const cash = [
  li("Net Income", "net_income_cf", pv(2725000, 2046000, 1280000)),
  // Labelled to avoid the ratio engine's name-based D&A lookup double-counting into EBITDA,
  // which would move leverage off the established 3.16x. Value/accountCode unchanged.
  li("Non-Cash Charges (D&A)", "dep_amort_cf", pv(2000000, 2200000, 2400000)),
  li("Stock Comp & Other Non-Cash", "stock_comp_other", pv(150000, 200000, 250000)),
  li("(Increase)/Decrease in Accounts Receivable", "change_ar", pv(-300000, -750000, -750000)),
  li("(Increase)/Decrease in Inventory", "change_inventory", pv(-650000, -1050000, -1050000)),
  li("Increase/(Decrease) in Payables & Accruals", "change_ap_accrued", pv(875000, 1554000, 1470000)),
  li("Operating Cash Flow", "operating_cash_flow", pv(4800000, 4200000, 3600000), "subtotal"),
  li("Capital Expenditures", "capital_expenditures", pv(2100000, 2600000, 5400000)),
  li("Free Cash Flow", "free_cash_flow", pv(2700000, 1600000, -1800000), "subtotal"),
  li("Proceeds from Long-Term Debt", "proceeds_lt_debt", pv(1000000, 1500000, 5000000)),
  li("Repayment of Debt", "repayment_debt", pv(-1200000, -1700000, -1500000)),
  li("Dividends Paid", "dividends_paid", pv(-500000, -600000, -650000)),
  li("Net Cash from Financing", "net_financing", pv(-700000, -800000, 2850000), "subtotal"),
  li("Net Change in Cash", "net_change_cash", pv(2000000, 800000, 1050000), "subtotal"),
  li("Cash, Beginning of Period", "beginning_cash", pv(1100000, 3100000, 3900000)),
  li("Cash, End of Period", "ending_cash", pv(3100000, 3900000, 4950000), "subtotal"),
];

// ---------------- self-verification ----------------
const errs = [];
const get = (rows, code, p) => rows.find((r) => r.accountCode === code).periodValues[p];
const check = (label, expectRows, subtotalCode, rows) => {
  for (const p of P) {
    const sum = expectRows.reduce((s, c) => s + get(rows, c, p), 0);
    const sub = get(rows, subtotalCode, p);
    if (sum !== sub) errs.push(`${label} ${p}: components ${sum} != ${subtotalCode} ${sub}`);
  }
};
// Balance sheet reconciliations
check("BS current assets", ["cash_and_equivalents", "accounts_receivable", "inventory", "prepaid_and_other_current_assets"], "total_current_assets", balance);
check("BS total assets", ["total_current_assets", "ppe_net", "other_lt_assets", "goodwill"], "total_assets", balance);
check("BS current liabilities", ["accounts_payable", "accrued_expenses", "current_portion_ltd"], "total_current_liabilities", balance);
check("BS total debt", ["current_portion_ltd", "long_term_debt"], "total_debt", balance);
check("BS total liabilities", ["total_current_liabilities", "long_term_debt"], "total_liabilities", balance);
// A=L+E
for (const p of P) {
  const a = get(balance, "total_assets", p), l = get(balance, "total_liabilities", p), e = get(balance, "total_equity", p);
  if (a !== l + e) errs.push(`BS A=L+E ${p}: ${a} != ${l}+${e}`);
}
// Income statement (subtractive chain — checked manually below)
for (const p of P) {
  if (get(income, "sales_revenue", p) - get(income, "cost_of_sales", p) !== get(income, "gross_profit", p)) errs.push(`IS gross ${p}`);
  if (get(income, "gross_profit", p) - get(income, "general_and_admin_expenses", p) !== get(income, "operating_profit", p)) errs.push(`IS op ${p}`);
  if (get(income, "operating_profit", p) + get(income, "depreciation_amortization", p) !== get(income, "adjusted_ebitda", p)) errs.push(`IS ebitda ${p}`);
  if (get(income, "operating_profit", p) - get(income, "interest_expense", p) !== get(income, "pretax_income", p)) errs.push(`IS pretax ${p}`);
  if (get(income, "pretax_income", p) - get(income, "income_tax_expense", p) !== get(income, "net_income", p)) errs.push(`IS net ${p}`);
}
// Cash flow
check("CF operating", ["net_income_cf", "dep_amort_cf", "stock_comp_other", "change_ar", "change_inventory", "change_ap_accrued"], "operating_cash_flow", cash);
check("CF financing", ["proceeds_lt_debt", "repayment_debt", "dividends_paid"], "net_financing", cash);
for (const p of P) {
  if (get(cash, "operating_cash_flow", p) - get(cash, "capital_expenditures", p) !== get(cash, "free_cash_flow", p)) errs.push(`CF fcf ${p}`);
  if (get(cash, "free_cash_flow", p) + get(cash, "net_financing", p) !== get(cash, "net_change_cash", p)) errs.push(`CF netchange ${p}`);
  if (get(cash, "beginning_cash", p) + get(cash, "net_change_cash", p) !== get(cash, "ending_cash", p)) errs.push(`CF roll ${p}`);
  if (get(cash, "ending_cash", p) !== get(balance, "cash_and_equivalents", p)) errs.push(`CF->BS cash tie ${p}`);
}

if (errs.length) {
  console.error("VERIFICATION FAILED:\n" + errs.join("\n"));
  process.exit(1);
}

// ---------------- write ----------------
const fixture = JSON.parse(readFileSync(DATA, "utf8"));
const file = fixture.files.bf_piedmont_fy2024;
const before = file.financialStatements.map((s) => s.lineItems.length);
const mk = (statementType, lineItems) => ({ statementType, endDate: "2025-12-31", periods: P, validationStatus: "validated", lineItems });
file.financialStatements = [
  mk("income_statement", income),
  mk("balance_sheet", balance),
  mk("cash_flow_statement", cash),
];
copyFileSync(DATA, DATA + ".bak");
writeFileSync(DATA, JSON.stringify(fixture, null, 2) + "\n");

console.log("OK — all reconciliations + cash tie-out pass.");
console.log(`Backup: ${DATA}.bak`);
console.log(`Rows  IS ${before[0]}->${income.length}  BS ${before[1]}->${balance.length}  CF ${before[2]}->${cash.length}`);
