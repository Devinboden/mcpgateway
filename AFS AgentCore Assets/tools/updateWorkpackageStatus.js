import { z } from "zod";
import { afsPost } from "../lib/afsClient.js";
import { toolResult, toolError } from "../lib/format.js";

// Workpackage status action (withdraw/hold/reactivate/forceClose/lock/unlock).
// AFS: POST /jobs/updateStatus  Body { workpackages:[{ id, action, reason }] }.

const ACTIONS = ["withdraw", "hold", "reactivate", "forceClose", "lock", "unlock"];

const schema = {
  workpackageId: z.union([z.string(), z.number()]).describe("Workpackage id."),
  action: z.enum(ACTIONS).describe("Status action."),
  reason: z.string().optional().describe("Reason code (≤4), e.g. OTHR. Required by AFS for withdraw (default 'OTHR')."),
};

async function handler(args) {
  try {
    const id = Number(args.workpackageId);
    if (!Number.isInteger(id)) throw new Error("workpackageId must be an integer.");
    const reason = (args.reason || (args.action === "withdraw" ? "OTHR" : "")).slice(0, 4);
    const body = { workpackages: [{ id, action: args.action, reason }] };
    const { data, meta } = await afsPost("/jobs/updateStatus", { body, fixtureKey: "jobs.updateStatus" });
    const messages = data?.messages || [];
    return toolResult(`Action '${args.action}' executed on WP ${id} [${meta.mode}].`, {
      workpackageId: id, action: args.action, reason, messages,
    });
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "update_workpackage_status",
    "Run a status action on a workpackage: withdraw / hold / reactivate / forceClose / lock / unlock. withdraw needs a reason code (default OTHR). Stateful.",
    schema,
    handler
  );
}
