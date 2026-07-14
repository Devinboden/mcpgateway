import { z } from "zod";
import { afsPost } from "../lib/afsClient.js";
import { toolResult, toolError, unwrap } from "../lib/format.js";

// Advance a workpackage to a target stage. AFS: POST /route
// Body { autoRoutingFlags:{...}, workpackage:{ id, targetStage } }.
// A SUCCESSFUL route advances the WP (stateful). A FAILED route is safe (no state
// change) and its unit messages list the incomplete-step blockers — surfaced as a result.

const schema = {
  workpackageId: z.union([z.string(), z.number()]).describe("Workpackage id."),
  targetStage: z.string().describe("Target stage, e.g. bookingStage, postApprovalStage, docPrepStage."),
  autoOverride: z.boolean().optional().describe("Set AFS autoOverride flag."),
  autoVisitStep: z.boolean().optional().describe("Set AFS autoVisitStep flag."),
};

function summarizeRoute(data) {
  const info = unwrap(data) || data || {};
  const wp = info.workpackage || {};
  const units = (info.units || []).map((u) => ({
    summary: u.summary,
    routeStatus: u.routingAttempts?.[0]?.routeStatus,
    messages: (u.messages || []).map((m) => m.text),
  }));
  return { workpackage: { id: wp.id, routeStatus: wp.routeStatus, routeStatusDescription: wp.routeStatusDescription, wpStatusLit: wp.wpStatusLit }, units };
}

async function handler(args) {
  const id = Number(args.workpackageId);
  const body = {
    autoRoutingFlags: { autoOverride: !!args.autoOverride, autoVisitStep: !!args.autoVisitStep },
    workpackage: { id, targetStage: args.targetStage },
  };
  try {
    if (!Number.isInteger(id)) throw new Error("workpackageId must be an integer.");
    const { data, meta } = await afsPost("/route", { body, fixtureKey: "route.route" });
    return toolResult(`Routed WP ${id} → ${args.targetStage} [${meta.mode}].`, {
      routed: true, workpackageId: id, targetStage: args.targetStage, ...summarizeRoute(data),
    });
  } catch (err) {
    // Failed routes do not mutate — return the blockers as the result.
    return toolResult(`WP ${id} did NOT route to ${args.targetStage} (no state change).`, {
      routed: false, workpackageId: id, targetStage: args.targetStage, reason: err?.message || String(err),
    });
  }
}

export function register(server) {
  server.tool(
    "advance_workpackage_stage",
    "Route/advance a workpackage to a target stage (e.g. bookingStage). A successful route advances it; a failed route changes nothing and returns the incomplete-step blockers. Use to drive origination forward.",
    schema,
    handler
  );
}
