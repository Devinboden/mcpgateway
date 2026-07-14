import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, pick } from "../lib/format.js";

// Pull the workpackages (jobs) assigned to a loan officer.
// AFS: GET /jobs/listByOfficers  (operationId Wf-jobs:/listByOfficers:get)

const schema = {
  officer1Code: z
    .string()
    .optional()
    .describe("Primary loan officer code to list workpackages for. Defaults to AFS_SAMPLE_OFFICER."),
  officer2Code: z.string().optional().describe("Secondary officer code filter."),
  owner: z.string().optional().describe("Filter by current workpackage owner."),
  originatedOnOrAfter: z
    .string()
    .optional()
    .describe("Only workpackages originated on/after this date (YYYY-MM-DD)."),
  rowLimit: z.number().int().positive().optional().describe("Max rows to return."),
};

async function handler(args) {
  try {
    const officer1Code = args.officer1Code || config.sample.officer;
    const { data, meta } = await afsGet("/jobs/listByOfficers", {
      query: {
        officer1Code,
        officer2Code: args.officer2Code,
        owner: args.owner,
        originatedOnOrAfter: args.originatedOnOrAfter,
        rowLimit: args.rowLimit,
      },
      fixtureKey: "jobs.listByOfficers",
    });

    const raw = data?.jobListByOfficers || [];
    const jobs = raw.map((j) =>
      pick(j, [
        "id",
        "bankId",
        "customerName",
        "obligorNumber",
        "officerId",
        "stage",
        "status",
        "decisionId",
        "description",
        "originatedDt",
        "lastUpdated",
        "targetDate",
        "hasAttachments",
      ])
    );

    return toolResult(
      `${jobs.length} workpackage(s) for officer ${officer1Code} [${meta.mode}].`,
      { officer: officer1Code, count: jobs.length, jobs }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "jobs_by_officer",
    "List a loan officer's in-flight WORKPACKAGES (origination / post-approval side) — stage, status, decision, target date. For the officer's booked loans use portfolio_by_officer.",
    schema,
    handler
  );
}
