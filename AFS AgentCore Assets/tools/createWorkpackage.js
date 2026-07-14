import { z } from "zod";
import { afsGet, afsPost } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, monthsAgo } from "../lib/format.js";

// Create + robustly fill a "Post Approval" (commercialPost) workpackage.
// AFS: POST /wp/commercialPost  (operationId Wf-commercialPost:/commercialPostCreate:post)
//
// Builds a full Wf-cbm-VisionOrigWorkPackage: party + (existing) obligor, a deal
// with one request per facility, and a lender block carrying the officer +
// assignment unit (this is what makes the loan surface in the officer view).
// Tenant-specific codes are parameters with defaults so we can tune to whatever
// the sandbox accepts; AFS validation comes back in `messages[]`.

const facilitySchema = z.object({
  name: z.string().describe("Facility short name, e.g. 'Revolving LOC'."),
  amount: z.number().describe("Commitment amount."),
  currency: z.string().optional().describe("Currency code. Default USD."),
  productStructure: z.string().optional().describe("Product structure code. Default 'F'."),
  productCode: z.string().optional().describe("Product code. Default '200'."),
  requestType: z.string().optional().describe("Request type code. Default 'NA'."),
  obligationType: z.string().optional().describe("Obligation type code (tenant config), e.g. '3015'."),
  revolvingType: z.string().optional().describe("'R' revolving / 'N' non-revolving. Default 'N'."),
  securedCode: z.string().optional().describe("Secured code. Default '1'."),
  purposeCode: z.string().optional().describe("Purpose code."),
  collateralType: z.string().optional().describe("Primary collateral type code."),
  durationCode: z.string().optional().describe("Duration code."),
  effectiveDate: z.string().optional().describe("Effective/origination date YYYY-MM-DD. Default ~24mo ago."),
  maturityDate: z.string().optional().describe("Legal maturity date YYYY-MM-DD."),
});

const schema = {
  bank: z.string().optional().describe("Bank ID. Defaults to sample bank."),
  organizationId: z.string().optional().describe("ILM organization ID. Default '1'."),
  obligorNumber: z.string().optional().describe("Existing obligor number. Defaults to sample obligor."),
  customerId: z.string().optional().describe("ILM customer id (NOT the obligor number — they differ). Omit for an existing obligor; AFS resolves the customer from the obligor."),
  applicationCollected: z.string().optional().describe("Deal 'Application Collected' indicator (Y/N). Default 'Y'."),
  obligorType: z.string().optional().describe("Obligor type code."),
  borrowerName: z.string().optional().describe("Borrower display name."),
  officer: z.string().optional().describe("Loan officer code (officer1). Defaults to sample officer — drives officer-view visibility."),
  assignmentUnit: z.string().optional().describe("Assignment unit / cost center. Default '1001500'."),
  application: z.string().optional().describe("Application code. Default '1'."),
  naics: z.string().optional().describe("NAICS code for the obligor application."),
  currency: z.string().optional().describe("Obligor currency code. Default 'USD'."),
  fxSiteId: z.string().optional().describe("Obligor FX site id. Default '1'."),
  stmtType: z.string().optional().describe("Obligor financial-statement type code. Default '0'."),
  geographicCode: z.string().optional().describe("Obligor geographic/country code. Default 'US'."),
  description: z.string().optional().describe("Workpackage description."),
  workflow: z
    .enum(["origination", "postApproval"])
    .optional()
    .describe("Which workflow to create the WP in: 'origination' starts in the origination stage (default); 'postApproval' starts in customer acceptance."),
  readyToBook: z.boolean().optional().describe("Set readyToBook flag ('1'). Default false."),
  facilities: z.array(facilitySchema).min(1).optional().describe("Facilities to add. Defaults to a sample TL + LOC."),
};

export function buildPayload(args) {
  const bankId = args.bank || config.sample.bank;
  const obligorNumber = args.obligorNumber || config.sample.obligor;
  const customerId = args.customerId; // ILM customer id (NOT the obligor number); omit for existing obligors
  const officer1 = args.officer || config.sample.officer;
  const assignmentUnit = args.assignmentUnit || "1001500";
  const application = args.application || "1";
  const obgXoid = "OBG1";

  const facilities = args.facilities?.length
    ? args.facilities
    : [
        { name: "Term Loan", amount: 2000000, revolvingType: "N", obligationType: "3040" },
        { name: "Revolving LOC", amount: 3000000, revolvingType: "R", obligationType: "3040" },
      ];

  const orgLevelData = { assignmentUnit, officer1 };

  const requests = facilities.map((f, i) => ({
    xoid: `REQ${i + 1}`,
    type: f.requestType || "NA",
    amount: f.amount,
    amountCur: f.currency || "USD",
    application,
    borrower: { xoid: obgXoid },
    product: { productStructure: f.productStructure || "F", code: f.productCode || "200" },
    effectiveDate: f.effectiveDate || monthsAgo(24),
    legalMaturityDate: f.maturityDate || monthsAgo(-36), // ~3y out
    durationCode: f.durationCode,
    collateralType: f.collateralType,
    purposeCode: f.purposeCode,
    origData: {
      revolvingType: f.revolvingType || "N",
      obligationType: f.obligationType || "3040",
      advisedGuideType: "A",
      securedCode: f.securedCode || "1",
    },
    obligations: [
      {
        xoid: `OBL${i + 1}`,
        isExisting: false,
        shortName: f.name.slice(0, 15),
        obligationType: f.obligationType || "3040",
        legalMaturityDate: f.maturityDate || monthsAgo(-36),
      },
    ],
  }));

  return {
    bankId,
    organizationId: args.organizationId || "1",
    description: args.description || `Origination — API staged (${obligorNumber})`,
    readyToBook: args.readyToBook ? "1" : "0",
    parties: [
      {
        xoid: "PTY1",
        customerId,
        primaryName: args.borrowerName,
        shortName: (args.borrowerName || `OBG ${obligorNumber}`).slice(0, 15),
        type: args.obligorType,
        orgLevelData,
        obligors: [
          {
            xoid: obgXoid,
            obligorNumber,
            shortName: (args.borrowerName || `OBG ${obligorNumber}`).slice(0, 15),
            type: args.obligorType,
            isExisting: true,
            orgLevelData,
            fxInfo: { siteId: args.fxSiteId || "1", currencyCode: args.currency || "USD" },
            finStmt: { stmtType: args.stmtType || "0" },
            geographicInfo: { geographicCode: args.geographicCode || "US" },
            obgrAppls: [{ appl: application, naics: args.naics ? { naics: args.naics } : undefined }],
          },
        ],
      },
    ],
    deal: { applicationCollected: args.applicationCollected || "Y", requests },
    lender: { orgLevelData },
    primaryBorrower: { xoid: obgXoid },
  };
}

async function handler(args) {
  try {
    // The WP party.customerId is the obligor's servicing nameId — derive it from
    // /obligors/get when not supplied (the obligor number itself is NOT valid here).
    let customerId = args.customerId;
    if (!customerId) {
      const bank = args.bank || config.sample.bank;
      const obligor = args.obligorNumber || config.sample.obligor;
      const { data } = await afsGet(`/obligors/get/${bank}-${obligor}`, { fixtureKey: "obligors.get", allow404: true });
      const nameId = data?.obligors?.nameId;
      if (nameId != null) customerId = String(nameId);
    }

    const payload = buildPayload({ ...args, customerId });
    const workflow = args.workflow || "origination";
    const path = workflow === "postApproval" ? "/wp/commercialPost" : "/wp/commercialOrig";
    const { data, messages, meta } = await afsPost(path, {
      body: payload,
      fixtureKey: "workpackage.create",
    });

    const wpId = data?.id;
    const errors = (messages || []).filter((m) => /e|require/i.test(String(m.severity || "")));
    const line = wpId
      ? `Created ${workflow} workpackage ${wpId} for obligor ${payload.parties[0].obligors[0].obligorNumber} [${meta.mode}].`
      : `Workpackage not created — ${errors.length} validation message(s) [${meta.mode}].`;

    return toolResult(line, {
      workpackageId: wpId,
      workflow,
      obligor: payload.parties[0].obligors[0].obligorNumber,
      officer: payload.lender.orgLevelData.officer1,
      facilities: payload.deal.requests.map((r) => ({ amount: r.amount, product: r.product.code })),
      messages,
      submittedPayload: payload,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "create_workpackage",
    "Create and fill a Post Approval (commercialPost) workpackage for an existing obligor — party, obligor, facilities, and lender (officer + assignment unit). Returns the new workpackage id, or AFS validation messages if it's rejected.",
    schema,
    handler
  );
}
