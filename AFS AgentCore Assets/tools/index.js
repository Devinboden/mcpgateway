import { register as jobsByOfficer } from "./jobsByOfficer.js";
import { register as portfolioByOfficer } from "./portfolioByOfficer.js";
import { register as reserveObligationNumber } from "./reserveObligationNumber.js";
import { register as createWorkpackage } from "./createWorkpackage.js";
import { register as loanSummary } from "./loanSummary.js";
import { register as revolverUtilization } from "./revolverUtilization.js";
import { register as paymentHistory } from "./paymentHistory.js";
// Phase-1 read + reference tools (api-discovery/docs/mcp-wireframe.md).
import { register as getObligor } from "./getObligor.js";
import { register as listObligations } from "./listObligations.js";
import { register as getObligationDetail } from "./getObligationDetail.js";
import { register as listCollateral } from "./listCollateral.js";
import { register as getExposure } from "./getExposure.js";
import { register as searchCustomers } from "./searchCustomers.js";
import { register as resolveCodes } from "./resolveCodes.js";
import { register as listPicklist } from "./listPicklist.js";
// Phase-2 guarded writes.
import { register as createCustomer } from "./createCustomer.js";
import { register as createObligor } from "./createObligor.js";
import { register as postFinancial } from "./postFinancial.js";
import { register as lookupTransactionApis } from "./lookupTransactionApis.js";
import { register as updateWorkpackageStatus } from "./updateWorkpackageStatus.js";
import { register as routeWorkpackage } from "./routeWorkpackage.js";
import { register as getOriginationWorkpackage } from "./getOriginationWorkpackage.js";

// Single place to wire every tool onto the MCP server.
export function registerTools(server) {
  // Existing (Workflow + Servicing)
  jobsByOfficer(server);
  portfolioByOfficer(server);
  reserveObligationNumber(server);
  createWorkpackage(server);
  loanSummary(server);
  revolverUtilization(server);
  paymentHistory(server);
  // Phase-1 reads
  getObligor(server);
  listObligations(server);
  getObligationDetail(server);
  listCollateral(server);
  getExposure(server);
  searchCustomers(server);
  // Phase-1 reference / codes
  resolveCodes(server);
  listPicklist(server);
  // Phase-2 guarded writes
  createCustomer(server);
  createObligor(server);
  postFinancial(server);
  lookupTransactionApis(server);
  updateWorkpackageStatus(server);
  routeWorkpackage(server);
  getOriginationWorkpackage(server);
}

export const TOOL_CATALOG = [
  { name: "jobs_by_officer", group: "Workflow", summary: "Officer's in-flight workpackages (origination / post-approval)." },
  { name: "portfolio_by_officer", group: "Workflow", summary: "Officer's booked servicing loans (bridged via obligors)." },
  { name: "reserve_obligation_number", group: "Workflow", summary: "Reserve a new obligation number." },
  { name: "create_workpackage", group: "Workflow", summary: "Create + fill a Post Approval workpackage for an obligor." },
  { name: "loan_summary", group: "Servicing", summary: "Borrower, facilities, terms, outstanding, collateral, guaranties." },
  { name: "revolver_utilization", group: "Servicing", summary: "Drawn ÷ commitment from the balances codes." },
  { name: "payment_history", group: "Servicing", summary: "Days/times past due, returned checks, aging buckets." },
  { name: "get_obligor", group: "Reads", summary: "Core borrower record by bank + obligor." },
  { name: "list_obligations", group: "Reads", summary: "All obligations under an obligor (ids for detail)." },
  { name: "get_obligation_detail", group: "Reads", summary: "One obligation: terms + balances + charges + history." },
  { name: "list_collateral", group: "Reads", summary: "Collateral items pledged by an obligor." },
  { name: "get_exposure", group: "Reads", summary: "Obligor facility / exposure totals." },
  { name: "search_customers", group: "Reads", summary: "Name → nameId / obligor resolver." },
  { name: "resolve_codes", group: "Reference", summary: "Valid codes for a coded field (keystone)." },
  { name: "list_picklist", group: "Reference", summary: "Options for an AFS refList name." },
  { name: "create_customer", group: "Write", summary: "Create a customer (party) → ilmId." },
  { name: "create_obligor", group: "Write", summary: "Create an obligor under a customer." },
  { name: "post_financial_transaction", group: "Write", summary: "Post a financial txn (simulate-first)." },
  { name: "lookup_transaction_apis", group: "Reference", summary: "Valid financial-transaction apiNames." },
  { name: "update_workpackage_status", group: "Write", summary: "Withdraw/hold/.../unlock a workpackage." },
  { name: "advance_workpackage_stage", group: "Write", summary: "Route a workpackage to a target stage." },
  { name: "get_origination_workpackage", group: "Reads", summary: "Read back a commercialOrig workpackage." },
];
