// Central configuration. Secrets + environment (creds, base URL) come from env;
// the demo loan lives in ../sample.config.js so it can be changed via git push.

import { sample as sampleDefaults } from "../sample.config.js";

const truthy = (v) => String(v ?? "").toLowerCase() === "true";

export const config = {
  baseUrl: process.env.AFS_BASE_URL || "https://afsvision.client.com/afsroot/api/v1",
  username: process.env.AFS_USERNAME || "",
  password: process.env.AFS_PASSWORD || "",
  appChannel: (process.env.AFS_APP_CHANNEL || "AFS-MCP").slice(0, 24),

  // LIVE is the default. Fixture mode is opt-in.
  fixtureMode: truthy(process.env.AFS_FIXTURE_MODE),

  // Source of truth = sample.config.js (edit + push to change). Env vars, if
  // present, still override per-field.
  sample: {
    bank: process.env.AFS_SAMPLE_BANK || sampleDefaults.bank,
    obligor: process.env.AFS_SAMPLE_OBLIGOR || sampleDefaults.obligor,
    obligation: process.env.AFS_SAMPLE_OBLIGATION || sampleDefaults.obligation,
    obligationId: process.env.AFS_SAMPLE_OBLIGATION_ID || sampleDefaults.obligationId,
    officer: process.env.AFS_SAMPLE_OFFICER || sampleDefaults.officer,
  },
};

/**
 * In live mode we need credentials. Surface a clear error instead of letting
 * AFS bounce the request with a 401.
 */
export function assertLiveReady() {
  if (config.fixtureMode) return;
  const missing = [];
  if (!config.username) missing.push("AFS_USERNAME");
  if (!config.password) missing.push("AFS_PASSWORD");
  if (missing.length) {
    throw new Error(
      `AFS live mode is active but ${missing.join(" and ")} ${
        missing.length > 1 ? "are" : "is"
      } not set. Set credentials, or set AFS_FIXTURE_MODE=true to use the bundled sample loan.`
    );
  }
}
