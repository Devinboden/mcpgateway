# AFS API Pattern Admin — reference

Source: API Pattern Admin table (dd3.afsvision.us). "Pattern Count" = number of
predefined query patterns (saved filters) configured for that API. High counts
flag endpoints with rich, often-undocumented filtering behavior worth probing.

Full table — 110 APIs.

| Category | API Name | Path | Patterns |
|----------|----------|------|---------:|
| API | OpenAPI documentation | `/doc/apidoc` | 0 |
| Bank | Penalty Amount Currencies | `/penaltyAmountCurrencies` | 1 |
| Bank | Penalty Amount Increments | `/penaltyAmountIncrements` | 1 |
| Bank | Penalty Definition | `/penaltyDefinitions` | 1 |
| Charges | Charges | `/charges` | 11 |
| Collateral | Collateral | `/collateral` | 3 |
| Collateral | Collateral Insurance | `/collateralInsurance` | 0 |
| Collateral | Collateral Negotiable | `/collateralNegotiable` | 4 |
| Collateral | Collateral Borrowing Base | `/collBorrowingBase` | 0 |
| Collateral | Collateral Flood Filings | `/collFloodFilings` | 1 |
| Collateral | Collateral Negotiable History | `/collNegotHistory` | 2 |
| Collateral | Collateral Negotiable Repricing | `/collNegotReprice` | 0 |
| Collateral | Collateral Real Estate | `/collRealEstate` | 1 |
| Collateral | Collateral Real Estate Tenants | `/collRETenant` | 0 |
| Collateral | Update Collateral Borrowing Base | `/updateCollateralBorrowingBase` | 0 |
| Collateral | Update Current Collateral Value | `/updateCurrentCollateralValue` | 0 |
| Customer | Address information | `/addresses` | 6 |
| Customer | Citizenship Information | `/citizenships` | 1 |
| Customer | Customer Identification Information | `/customerIdentifications` | 1 |
| Customer | Deposit Instructions | `/depositInstructions` | 0 |
| Customer | Exposure | `/exposure` | 2 |
| Customer | Name Addresses | `/nameAddresses` | 2 |
| Customer | Names | `/names` | 7 |
| Customer | Phone Numbers for all Customers | `/phones` | 3 |
| Customer | Wire Instructions | `/wireInstructions` | 0 |
| Diagnostics | Ping Data Echo | `/ping/echo` | 0 |
| Diagnostics | Ping | `/ping` | 1 |
| Exception | Exception Collateral | `/wp/CollateralRoot` | 0 |
| Exception | Create Exception | `/exceptions/createException` | 0 |
| Exception | Monitoring Items - Collateral | `/wp/exceptionCollateral` | 0 |
| Exception | Monitoring Items - Covenants | `/wp/exceptionCovenants` | 0 |
| Exception | Policy Exceptions - Credit Policy | `/wp/exceptionCreditPolicy` | 0 |
| Exception | Documentation Exceptions - Collateral | `/wp/exceptionDocCollateral` | 0 |
| Exception | Documentation Exceptions - Entity | `/wp/exceptionEntity` | 0 |
| Exception | Documentation Exceptions - Note/Loan | `/wp/exceptionNoteLoan` | 0 |
| Exception | Processing Exceptions - Processing | `/wp/exceptionProcessing` | 0 |
| Exception | Monitoring Items - Requirements | `/wp/exceptionRequirements` | 0 |
| Exception | Monitoring Items - Review | `/wp/exceptionReview` | 0 |
| Exception | Exception Type | `/wp/ExceptionType` | 0 |
| Exception | List Exceptions | `/exceptions/listExceptions` | 0 |
| Exception | Exception Obligation | `/wp/ObligationRoot` | 0 |
| Exception | Exception Obligor | `/wp/ObligorRoot` | 0 |
| Financials | Create Financial | `/createFinancial` | 0 |
| Financials | Create Schedule Financial Activity | `/createScheduledFinancial` | 0 |
| Global | Global | `/global` | 2 |
| Holder of Records | All Administrators by Entity | `/holderofrecords/allAdminsByEntityForASelectedHolderOfRecord` | 0 |
| Holder of Records | All Deals for a Selected Holder of Record | `/holderofrecords/allDealsForASelectedHolderOfRecord` | 0 |
| Holder of Records | All Funds By Fund Manager | `/holderofrecords/allFundsByFundManager` | 0 |
| Holder of Records | All Holders of Record in a Deal | `/holderofrecords/allHoldersofRecordinDeal` | 0 |
| Holder of Records | Beneficial Owners for a Fund within Deal | `/holderofrecords/beneficialOwnersForAFundWithinADeal` | 0 |
| Loan Administration | Address Maintenance | `/wp/addressMaintenance` | 0 |
| Loan Administration | Advances | `/wp/advances2` | 0 |
| Loan Administration | DDA/Wire Instructions | `/wp/ddaWireChanges` | 0 |
| Loan Administration | Fee Management | `/wp/feeManagement` | 0 |
| Loan Administration | Non-Financial Maintenance | `/wp/nonFinancial` | 0 |
| Loan Administration | Obligation Hierarchy Restructure | `/wp/oblnRestructure` | 0 |
| Loan Administration | Other Financials | `/wp/otherFinancials2` | 0 |
| Loan Administration | Other Maintenance | `/wp/otherMaintenance` | 0 |
| Loan Administration | Payments | `/wp/payments2` | 1 |
| Loan Administration | Repricing | `/wp/repricing2` | 0 |
| Obligation | Accrual Schedules | `/accrualSchedules` | 3 |
| Obligation | Amortization Schedule Charges | `/amortizationSchedCharge` | 0 |
| Obligation | Amortization Schedule | `/amortizationSchedule` | 0 |
| Obligation | assetSales | `/assetSales` | 0 |
| Obligation | Balance Information | `/balances` | 5 |
| Obligation | Billing Schedules | `/billingSchedules` | 1 |
| Obligation | Current Obligation Information | `/currentObligations` | 8 |
| Obligation | Financial Transaction History | `/financialHistory` | 1 |
| Obligation | Financial History Scheduled Activity | `/financialHistorySchedAct` | 1 |
| Obligation | Financial Instrument | `/financialInstrument` | 15 |
| Obligation | Flat Fees | `/flatFees` | 6 |
| Obligation | Future Obligation Information | `/futureObligations` | 7 |
| Obligation | Invoice Line Items | `/invoiceLineItems` | 4 |
| Obligation | Invoice Information | `/invoices` | 0 |
| Obligation | notePad | `/notePad` | 0 |
| Obligation | Obligations | `/obligations` | 12 |
| Obligation | Organization Levels Pivot | `/organizationLevels` | 13 |
| Obligation | PBA | `/pba` | 0 |
| Obligation | Prime Schedules | `/primeSchedules` | 1 |
| Obligation | Scheduled Activity | `/scheduledActivity` | 0 |
| Obligation | Update Wire Fed Reference Number | `/updateFedRefNumber` | 0 |
| Obligor | Obligor Applications | `/obligorApplications` | 1 |
| Obligor | Obligor DDA Instructions | `/obligorDDAInstructions` | 0 |
| Obligor | Obligors | `/obligors` | 9 |
| Obligor | Obligor Wire Instructions | `/obligorWireInstructions` | 0 |
| Obligor | Support References | `/supportReferences` | 5 |
| Originations | Origination | `/wp/commercialOrig` | 0 |
| Originations | Post Approval | `/wp/commercialPost` | 0 |
| Syndication and Participations | Deal Maintenance | `/wp/syndiDealMaintenance` | 0 |
| Syndication and Participations | Deal Pipeline | `/wp/syndiDealPipeline` | 1 |
| Syndication and Participations | Repricing | `/wp/syndiRepricing` | 0 |
| System Administration | Alert Type | `/wp/alertType` | 0 |
| System Administration | Financial Transaction Apis | `/apis` | 3 |
| System Administration | Async AutoRouting Workpackage | `/async/route` | 0 |
| System Administration | Async Create Workpackage | `/async/wp/{wfType}` | 0 |
| System Administration | Banks | `/banks` | 0 |
| System Administration | Custom Collateral Fields | `/customCollateral` | 0 |
| System Administration | Custom Deal Fields | `/customDeal` | 0 |
| System Administration | Custom Escrow Fields | `/customEscrow` | 0 |
| System Administration | Custom Customer Fields | `/customName` | 0 |
| System Administration | Custom Obligation Fields | `/customObligation` | 0 |
| System Administration | Custom Obligor Fields | `/customObligor` | 0 |
| System Administration | Custom Obligor Application Fields | `/customObligorApplication` | 0 |
| System Administration | ddaAba | `/taskProcessor/ddaAba` | 0 |
| System Administration | Refresh Batch Exceptions | `/taskProcessor/exceptionRefresh` | 0 |
| System Administration | Extract Data | `/taskProcessor/extracts` | 0 |
| System Administration | Get Schedules | `/businessAutomation/schedules` | 0 |
| System Administration | Get Task | `/businessAutomation/tasks/{id}` | 0 |
| System Administration | Late Charge Control | `/lateChargeControl` | 1 |
| System Administration | Offset Transaction Control | `/offsetTranCtrl` | 0 |
| System Administration | Org Level Data | `/orgLevelData` | 1 |
| System Administration | Organization Level Pointer | `/orgLevelPointer` | 0 |
| System Administration | Queue | `/wp/QueueAdmin` | 0 |
| System Administration | Queue Group | `/wp/QueueGroupAdmin` | 0 |
| System Administration | Rate Indicative | `/rateIndicative` | 1 |
| System Administration | Repayment Schedules | `/repaymentSchedules` | 2 |
| System Administration | Role Administration | `/wp/roleAdmin` | 0 |
| System Administration | Schedule Task | `/businessAutomation/scheduleTask` | 0 |
| System Administration | Import Valid Values | `/taskProcessor/validValueImport` | 0 |
| System Administration | wireAba | `/taskProcessor/wireAba` | 0 |
| User Provisioning | Create Employee | `/employees` | 0 |
| User Provisioning | Delete Employee | `/employees/{id}` | 0 |
| User Provisioning | Get Employee | `/employees/{id}` | 0 |
| User Provisioning | List Alert Types | `/up/listAlertTypes` | 1 |
| User Provisioning | List Context Groups | `/up/listContextGroups` | 0 |
| User Provisioning | List Credit Authority Items | `/up/listCreditAuthorityItems` | 0 |
| User Provisioning | List Limit Groups | `/up/listLimitGroups` | 0 |
| User Provisioning | List Override Conditions | `/up/listOverrideConditions` | 0 |
| User Provisioning | List Queue Groups | `/up/listQueueGroups` | 1 |
| User Provisioning | List Queues | `/up/listQueues` | 1 |
| User Provisioning | List Roles | `/up/listRoles` | 1 |
| User Provisioning | List Teams | `/up/listTeams` | 1 |
| User Provisioning | Update Employee | `/employees/{id}` | 0 |
| User Provisioning | User Profile Administration | `/wp/userProfileAdmin` | 0 |
| User Provisioning | User Profile Change History | `/up/userProfileChangeHistory` | 0 |
| User Provisioning | Search Users | `/up/userSearch` | 2 |
| Workflow | Route Workpackage | `/route` | 0 |
| Workflow | Create Customer | `/createCustomer` | 0 |
| Workflow | Create Obligor | `/createObligor` | 0 |
| Workflow | List Workpackages | `/jobs/joblistInquiry` | 0 |
| Workflow | List Workpackages by officers | `/jobs/listByOfficers` | 0 |
| Workflow | Reserve Number | `/reserveNumber` | 0 |
| Workflow | Update Assignments | `/jobs/updateAssignment` | 0 |
| Workflow | Update Status | `/jobs/updateStatus` | 0 |
