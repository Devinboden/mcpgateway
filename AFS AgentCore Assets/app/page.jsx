import { config } from "../lib/config.js";
import { TOOL_CATALOG } from "../tools/index.js";

const card = {
  background: "#121b2e",
  border: "1px solid #25324d",
  borderRadius: 12,
  padding: "18px 20px",
};

const chip = (bg, fg) => ({
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  background: bg,
  color: fg,
});

const SOURCE_MAP = [
  {
    tool: "loan_summary",
    sources:
      "obligors/get (borrower) + exposure/listObligor (facilities) + obligations/getFullKey (terms/maturity/commitment) + balances/listFullKey (outstanding) + collateral/list + supportReferences (guaranties)",
  },
  {
    tool: "revolver_utilization",
    sources:
      "financialHistory/effectiveFrom/{obligationId} (12-mo ledger) → running funded balance ÷ commitment = utilization",
  },
  {
    tool: "payment_history",
    sources:
      "currentObligations/getFullKey (days/times past due, returned checks, aging) + financialHistory (discrete late events)",
  },
];

export default function Home() {
  const mode = config.fixtureMode ? "FIXTURE" : "LIVE";
  const groups = [...new Set(TOOL_CATALOG.map((t) => t.group))];

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <img src="/icon.png" alt="AFS" width={36} height={36} style={{ borderRadius: 6, background: "#fff", padding: 2 }} />
        <h1 style={{ fontSize: 30, margin: 0 }}>AFS MCP v2</h1>
        <span style={chip(mode === "LIVE" ? "#10331f" : "#33260f", mode === "LIVE" ? "#5fdc8b" : "#f0c060")}>
          {mode} MODE
        </span>
      </header>
      <p style={{ color: "#9fb0c8", marginTop: 8, lineHeight: 1.5 }}>
        Model Context Protocol server for AFS Vision — workflow actions plus one enriched loan through
        servicing. Deployed on Vercel (Next.js + <code>mcp-handler</code>).
      </p>

      <section style={{ ...card, marginTop: 24 }}>
        <div style={{ fontSize: 13, color: "#9fb0c8", marginBottom: 6 }}>MCP endpoint</div>
        <code style={{ fontSize: 15, color: "#7fd1ff" }}>POST /api/mcp</code>
        <div style={{ fontSize: 13, color: "#9fb0c8", marginTop: 12 }}>
          AFS base URL: <code style={{ color: "#cfe" }}>{config.baseUrl}</code>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g} style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "#8aa0c0" }}>{g}</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {TOOL_CATALOG.filter((t) => t.group === g).map((t) => (
              <div key={t.name} style={card}>
                <code style={{ fontSize: 15, color: "#7fd1ff" }}>{t.name}</code>
                <div style={{ color: "#c5d2e6", marginTop: 6, fontSize: 14 }}>{t.summary}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "#8aa0c0" }}>
          Servicing source map
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {SOURCE_MAP.map((row) => (
            <div key={row.tool} style={card}>
              <code style={{ fontSize: 14, color: "#7fd1ff" }}>{row.tool}</code>
              <div style={{ color: "#9fb0c8", marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>{row.sources}</div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: 40, color: "#62748f", fontSize: 12 }}>
        Sample loan: bank {config.sample.bank} / obligor {config.sample.obligor} / obligation{" "}
        {config.sample.obligation} · officer {config.sample.officer}
      </footer>
    </main>
  );
}
