import { z } from "zod";
import { afsPost } from "../lib/afsClient.js";
import { toolResult, toolError, unwrap } from "../lib/format.js";

// Create a customer (party). AFS: POST /createCustomer
// Body { organizationId (maxLen 9), customer: Wf-cbm-Party }.
// Findings: minimal valid = organizationId + customer.name.fullName; AFS requires an
// asterisk-prefixed object name and definition "0". Returns the ilmId used by createObligor.
// NOTE: this creates a REAL record — there is no simulate for createCustomer.

const schema = {
  fullName: z.string().describe("Customer legal/full name. An '*' is prefixed if missing (AFS object-name marker)."),
  organizationId: z.string().optional().describe("Organization id (maxLen 9). Default '1'."),
  definition: z.string().optional().describe("Customer definition code. Default '0'."),
};

async function handler(args) {
  try {
    const name = String(args.fullName || "").trim();
    if (!name) throw new Error("fullName is required.");
    const fullName = name.startsWith("*") ? name : `*${name}`;
    const body = {
      organizationId: (args.organizationId || "1").slice(0, 9),
      customer: { definition: args.definition || "0", name: { fullName } },
    };
    const { data, meta } = await afsPost("/createCustomer", { body, fixtureKey: "createCustomer.create" });
    const d = unwrap(data) || data || {};
    const ilmId = d.ilmId ?? d.id ?? data?.ilmId;
    return toolResult(
      `Created customer "${fullName}" (ilmId ${ilmId}) [${meta.mode}]. Pass ilmId to create_obligor.`,
      { ilmId, fullName, organizationId: body.organizationId }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "create_customer",
    "Create a customer (party) in AFS and return its ilmId (the hard FK for create_obligor). organizationId maxLen 9; an '*' is prefixed to the name. NOTE: creates a real record — no dry-run exists for createCustomer.",
    schema,
    handler
  );
}
