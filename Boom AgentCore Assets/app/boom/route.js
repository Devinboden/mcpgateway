// /boom?fileId=… — redirect straight into Boom's actual SPREAD view for a file.
//
// We deep-link to the financial-statement page (…/file/{fileId}/financial-statement/{stmtId}),
// NOT the validation-session flow — that flow dead-ends on a "Validation completed" screen.
// The statement id is resolved server-side from the file (balance sheet first, else the first
// statement). Auth: relies on the user being signed into Boom in their browser (demo reality);
// if not, Boom bounces to login then back. Optional ?statementId= overrides the resolved one.

import { NextResponse } from "next/server";
import { BoomClient } from "../../src/boomClient.js";
import fixture from "../../data/atlas_spread.json";

export const dynamic = "force-dynamic"; // never cache; always resolve fresh

const APP_BASE = (process.env.BOOM_APP_BASE_URL || "https://app.boom.build").replace(/\/+$/, "");

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const fileId = sp.get("fileId");
  if (!fileId) {
    return new NextResponse("Missing required ?fileId= parameter.", { status: 400 });
  }
  try {
    let stmtId = sp.get("statementId");
    if (!stmtId) {
      const client = BoomClient.fromEnv(process.env, fixture);
      const file = await client.getSpread(fileId);
      const stmts = file?.financialStatements ?? [];
      const stmt = stmts.find((s) => s.statementType === "balance_sheet") ?? stmts[0];
      stmtId = stmt?.id;
    }
    if (!stmtId) {
      return new NextResponse("No financial statement found for this file.", { status: 502 });
    }
    const url = `${APP_BASE}/file/${encodeURIComponent(fileId)}/financial-statement/${encodeURIComponent(stmtId)}`;
    return NextResponse.redirect(url, 302);
  } catch (e) {
    return new NextResponse(e?.message || "Failed to resolve the Boom spread.", { status: 502 });
  }
}
