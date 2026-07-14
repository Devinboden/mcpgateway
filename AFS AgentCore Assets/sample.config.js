// ── Sample loan ──────────────────────────────────────────────────────────────
// The loan the tools default to when a call doesn't specify bank/obligor/etc.
// This is the single source of truth — edit these values and `git push`; Vercel
// redeploys and the deployed server demos the new loan. No env vars needed.
//
// (Optional: the matching AFS_SAMPLE_* env vars still override these if set.)
export const sample = {
  bank: "5",
  obligor: "13",
  obligation: "42",
  obligationId: "24096",
  officer: "10111111",
};
