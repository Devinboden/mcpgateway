import * as L from "../fixtures/enrichedLoan.js";

// Maps a logical operation (fixtureKey) to a bundled-loan response. Live mode
// never touches this — it exists so the server is fully demoable with no creds.
const FIXTURES = {
  "obligors.get": () => L.obligor,
  "exposure.listObligor": () => L.exposure,
  "obligations.getFullKey": () => L.obligation,
  "balances.listFullKey": () => L.balances,
  "collateral.list": () => L.collateral,
  "supportReferences.list": () => L.supportReferences,
  "financialHistory.effectiveFrom": () => L.financialHistory,
  "currentObligations.getFullKey": () => L.currentObligation,
  "jobs.listByOfficers": () => L.jobsByOfficer,
  "financialInstrument.listAllByObligor": () => L.financialInstruments,
  "reserveNumber.reserve": () => L.reserveNumber,
  "workpackage.create": () => ({ id: "WP-FIXTURE-1", messages: [{ severity: "info", text: "Workpackage created (fixture)." }] }),
};

export function resolveFixture(fixtureKey, params) {
  const fn = FIXTURES[fixtureKey];
  if (!fn) {
    throw new Error(`No fixture registered for "${fixtureKey}". Set AFS_FIXTURE_MODE=false to call live AFS.`);
  }
  return fn(params);
}

export const SAMPLE = L.SAMPLE;
