import { z } from "zod";
import { afsGet } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError } from "../lib/format.js";

// Officer → BOOKED servicing portfolio.
//
// There's no "obligations by officer" call in servicing, so we bridge:
//   jobs/listByOfficers(officer)            → workpackages (origination side)
//   → distinct {bank, obligor}              → the officer's customers
//   financialInstrument/listAllByObligor    → that obligor's BOOKED obligations
//
// Each booked obligation's `fiNumber` is its obligation number (usable with the
// servicing full-key endpoints / the loan_* tools).

const schema = {
  officer1Code: z.string().optional().describe("Loan officer code. Defaults to AFS_SAMPLE_OFFICER."),
  maxObligors: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Cap on distinct obligors to expand into booked loans (bounds fan-out). Default 10."),
  rowLimit: z.number().int().positive().optional().describe("Max workpackages to scan for obligors."),
};

async function handler(args) {
  try {
    const officer = args.officer1Code || config.sample.officer;
    const maxObligors = args.maxObligors || 10;

    // 1. Workpackages → distinct obligors (origination side).
    const { data, meta } = await afsGet("/jobs/listByOfficers", {
      query: { officer1Code: officer, rowLimit: args.rowLimit },
      fixtureKey: "jobs.listByOfficers",
    });
    const wps = data?.jobListByOfficers || [];

    const seen = new Map();
    for (const wp of wps) {
      if (!wp.obligorNumber) continue;
      const key = `${wp.bankId}-${wp.obligorNumber}`;
      if (!seen.has(key)) seen.set(key, { bank: wp.bankId, obligor: wp.obligorNumber, customerName: wp.customerName });
    }
    const obligors = [...seen.values()];
    const truncated = obligors.length > maxObligors;
    const scan = obligors.slice(0, maxObligors);

    // 2. Each obligor → booked obligations.
    const results = await Promise.all(
      scan.map(async (o) => {
        const r = await afsGet(`/financialInstrument/listAllByObligor/${o.bank}-${o.obligor}`, {
          query: { rowLimit: 100 },
          fixtureKey: "financialInstrument.listAllByObligor",
          allow404: true,
        });
        const loans = (r.notFound ? [] : r.data?.financialInstrument || []).map((fi) => ({
          obligation: fi.fiNumber, // obligation number
          name: fi.shortName,
          application: fi.application,
          closed: fi.closeIndicator ? true : undefined,
        }));
        return { ...o, bookedLoans: loans };
      })
    );

    const totalLoans = results.reduce((n, r) => n + r.bookedLoans.length, 0);
    const notes = [];
    if (truncated) notes.push(`Officer has ${obligors.length} distinct obligors; expanded the first ${maxObligors}. Raise maxObligors to see more.`);

    return toolResult(
      `Officer ${officer}: ${totalLoans} booked obligation(s) across ${results.length} obligor(s) [${meta.mode}].`,
      { officer, obligorsScanned: results.length, totalBookedLoans: totalLoans, portfolio: results, notes }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "portfolio_by_officer",
    "List a loan officer's BOOKED servicing loans, by bridging workpackage obligors to their booked obligations (obligation numbers usable with the loan_* tools).",
    schema,
    handler
  );
}
