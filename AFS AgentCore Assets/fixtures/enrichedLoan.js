// One fully-enriched loan "through servicing", shaped to match the AFS Vision
// response envelopes exactly. Used when AFS_FIXTURE_MODE=true.
//
//   Borrower : John's Lights and Fixtures  (bank 1 / obligor 500123)
//   Facility : Obligation 1 (obligationId 900045) — $5MM revolving line of credit
//   Officer  : JSMITH
//
// Numbers are internally consistent: 12-month ledger runs the funded balance
// from $0 up to $3,200,000 → 64% utilization against the $5MM commitment.

export const SAMPLE = {
  bank: 1,
  obligor: 500123,
  obligation: 1,
  obligationId: 900045,
  officer: "JSMITH",
};

export const obligor = {
  obligors: {
    bank: 1,
    obligor: 500123,
    nameId: 77001,
    shortName: "John's Lights and Fixtures",
    obligorType: 2,
    obligorTypeLit: "Corporation",
    statusCode: 1,
    statusCodeLit: "Active",
    currencyCode: "USD",
    salesVolume: 48250000.0,
    salesVolumeCC: "USD",
    income: 6120000.0,
    incomeCC: "USD",
    openedDate: "2019-03-14",
    reviewDate: "2026-03-31",
    probabilityOfDefault: 1.85,
    tickerSymbol: "",
  },
};

export const exposure = {
  exposure: [
    {
      nameId: 77001,
      bank: 1,
      application: 1,
      obligor: 500123,
      type: "L",
      obligationcurrencyCode: "USD",
      prinBalCurrentDirect: 3200000.0,
      prinBalCurrentAggr: 3200000.0,
      futureDirect: 1800000.0,
      letterDirect: 0.0,
      totalDirect: 5000000.0,
      totalAggr: 5000000.0,
      bookBalDirect: 3200000.0,
    },
  ],
};

export const obligation = {
  obligations: {
    obligationId: 900045,
    obligation: 1,
    type: 110,
    typeLit: "Revolving Line of Credit",
    purposeCode: 40,
    purposeCodeLit: "Working Capital",
    securedCode: 1,
    securedCodeLit: "Secured",
    originalObligationDate: "2023-06-01",
    legalMaturityDate: "2026-06-01",
    estimatedMaturityDate: "2026-06-01",
    originalTerm: 36,
    remainingTerm: 0,
    originalRate: 8.25,
    rateSpread: 2.75,
    accrualStatus: 1,
    accrualStatusLit: "Accruing",
    nonPerformingIndicator: 0,
    nonPerformingIndicatorLit: "Performing",
    // commitment lives on the obligation as the authorized/close amount
    closeAmount: 5000000.0,
    collateralValue: 6750000.0,
    collateralAvailability: 5400000.0,
    pastDueDays: 0,
    pastDueTimes: 1,
    pastDue30Days: 1,
    pastDue60Days: 0,
    pastDue90Days: 0,
    pastDue120Days: 0,
    pastDue150Days: 0,
    actualLoanToValue: 47.4,
    riskWeightPercent: 100.0,
    reviewDate: "2026-03-31",
  },
};

export const balances = {
  balances: [
    {
      obligationId: 900045,
      balanceCode: 1,
      balanceCodeLit: "Commitment Balance",
      effectiveDate: "2026-06-01",
      balance: 5000000.0,
      balanceBEQ: 5000000.0,
    },
    {
      obligationId: 900045,
      balanceCode: 2,
      balanceCodeLit: "Amount Takendown",
      effectiveDate: "2026-06-01",
      balance: 3200000.0,
      balanceBEQ: 3200000.0,
    },
    {
      obligationId: 900045,
      balanceCode: 3,
      balanceCodeLit: "Unused Balance",
      effectiveDate: "2026-06-01",
      balance: 1800000.0,
      balanceBEQ: 1800000.0,
    },
  ],
};

export const collateral = {
  collateral: [
    {
      bank: 1,
      obligor: 500123,
      collateralItem: 1,
      collateralType: 200,
      collateralTypeLit: "Accounts Receivable",
      shortDescription: "AR-BLANKET",
      collateralName: "Blanket lien on accounts receivable",
      currencyCode: "USD",
      currentValue: 4200000.0,
      originalValue: 3900000.0,
      netUseableValue: 3360000.0,
      maxLendableValue: 3360000.0,
      advancePercent: 80.0,
      revalueDate: "2026-05-31",
      receivedDate: "2023-05-20",
    },
    {
      bank: 1,
      obligor: 500123,
      collateralItem: 2,
      collateralType: 210,
      collateralTypeLit: "Inventory",
      shortDescription: "INV-BLANKET",
      collateralName: "Blanket lien on lighting & fixture inventory",
      currencyCode: "USD",
      currentValue: 2550000.0,
      originalValue: 2400000.0,
      netUseableValue: 2040000.0,
      maxLendableValue: 2040000.0,
      advancePercent: 50.0,
      revalueDate: "2026-05-31",
      receivedDate: "2023-05-20",
    },
  ],
};

export const supportReferences = {
  supportReferences: [
    {
      supportingBank: 1,
      supportingObligor: 500190,
      supportingCollateralItem: 1,
      supportedObligor: 500123,
      supportedAplication: 1,
      supportedObligation: 1,
      referenceType: 1,
      referenceTypeLit: "Guaranty",
      supportType: 2,
      supportTypeLit: "Unlimited Personal Guaranty",
      amountLimit: 5000000.0,
      percentLimit: 100.0,
      effectiveDate: "2023-06-01",
      expirationDate: "2027-06-01",
      supportingCurrencyCode: "USD",
    },
  ],
};

// 12-month transaction ledger. Advances (debit) raise the funded balance,
// paydowns (credit) lower it. runningBalance ends at 3,200,000.
export const financialHistory = {
  financialHistory: [
    txn("2025-06-15", 1500000, "ADV", "Advance", 1500000),
    txn("2025-07-20", 600000, "ADV", "Advance", 2100000),
    txn("2025-08-18", -400000, "PAY", "Principal Payment", 1700000),
    txn("2025-09-22", 900000, "ADV", "Advance", 2600000),
    txn("2025-10-15", -300000, "PAY", "Principal Payment", 2300000),
    txn("2025-11-19", 750000, "ADV", "Advance", 3050000),
    txn("2025-12-10", 500000, "ADV", "Advance", 3550000),
    txn("2026-01-21", -700000, "PAY", "Principal Payment", 2850000),
    txn("2026-02-18", 650000, "ADV", "Advance", 3500000),
    txn("2026-03-17", -300000, "PAY", "Principal Payment", 3200000),
    txn("2026-04-15", 0, "INT", "Interest Billed", 3200000),
    txn("2026-05-15", 0, "INT", "Interest Billed", 3200000),
  ],
};

function txn(date, amount, origin, originLit, runningBalance) {
  return {
    obligationId: 900045,
    effectiveDate: date,
    postedDate: date,
    timestamp: `${date}T09:00:00Z`,
    sequence: 1,
    transactionAmount: amount, // signed: + = drawdown, - = paydown
    transactionCC: "USD",
    transactionOrigin: origin === "ADV" ? 100 : origin === "PAY" ? 200 : 300,
    transactionOriginLit: originLit,
    debitCreditIndicator: amount >= 0 ? 1 : 2, // 1=debit(advance) 2=credit(payment)
    runningBalance,
    headerCode: 2, // Amount Takendown balance code (matches the balances fixture)
    headerCodeLit: "Amount Takendown",
  };
}

export const currentObligation = {
  currentObligations: {
    obligationId: 900045,
    nextDueDate: "2026-06-15",
    originalTermMonths: 36,
    totalOriginalPayment: 36,
    totalPaymentsMade: 35,
    returnCheckCount: 1,
    currentBalance: 3200000.0,
    currentBalanceBEQ: 3200000.0,
    principalBilledNotPaid: 0.0,
    principalPastDue: 0.0,
    principalPreviousDueDate: "2026-05-15",
    principalPaidToDate: "2026-05-15",
    firstDelinquencyDate: "2025-08-20",
    creditBureauPastDueAmount: 0.0,
    finalCloseIndicator: 0,
    finalCloseIndicatorLit: "Open",
  },
};

// Workpackages assigned to the officer (jobs/listByOfficers shape).
export const jobsByOfficer = {
  jobListByOfficers: [
    {
      id: "WP-104882",
      longId: 104882,
      customerName: "John's Lights and Fixtures",
      obligorNumber: "500123",
      officerId: "JSMITH",
      stage: "CR",
      status: "In Review",
      decisionId: "PENDING",
      description: "Annual review + $1MM line increase",
      rootTypeId: 12,
      originatedDt: "2026-05-02T13:22:00Z",
      lastUpdated: "2026-06-03T10:05:00Z",
      targetDate: "2026-06-20T00:00:00Z",
      targetStatus: "0",
      hasAttachments: true,
    },
    {
      id: "WP-104915",
      longId: 104915,
      customerName: "Cascade Freight Partners",
      obligorNumber: "500144",
      officerId: "JSMITH",
      stage: "UW",
      status: "Underwriting",
      decisionId: "PENDING",
      description: "New $2.5MM term loan",
      rootTypeId: 11,
      originatedDt: "2026-05-18T09:10:00Z",
      lastUpdated: "2026-06-04T16:40:00Z",
      targetDate: "2026-06-30T00:00:00Z",
      targetStatus: "0",
      hasAttachments: false,
    },
  ],
};

// Booked obligations for the obligor (financialInstrument/listAllByObligor).
// fiNumber is the obligation number.
export const financialInstruments = {
  financialInstrument: [
    { fiNumber: 1, application: 1, type: 0, shortName: "Revolving Line", closeIndicator: 0 },
    { fiNumber: 7, application: 1, type: 0, shortName: "Term Loan", closeIndicator: 0 },
  ],
};

export const reserveNumber = {
  reserveNumber: 100245,
};
