const TOOLS = [
  ["boom_lookup_company", "Resolve a Boom company from a Salesforce Account Id (externalUniqueId)."],
  ["boom_list_files", "List a borrower's spread files (id, name, status, statement end dates)."],
  ["boom_get_spread", "Fetch a parsed spread: financialStatements[] with lineItems by accountCode."],
  ["boom_get_line_items", "Flatten a spread into rows; optionally filter by accountCode."],
  ["boom_create_validation_session", "Mint an authenticated URL into Boom's spreading UI for a file (open in a browser)."],
];

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <svg width="34" height="34" viewBox="0 0 25 24" fill="none" aria-label="Boom">
          <path d="M20.27 16.25l-2.03 2.03-6.08-6.09-6.08 6.09-2.03-2.03 8.11-8.12 8.11 8.12z" fill="#0018F5" />
          <path d="M24.32 12.19l-2.15 2.15L12.16 4.3 2.15 14.34 0 12.19 12.16 0l12.16 12.19z" fill="#0018F5" />
          <path d="M12.18 16.5l3.58 3.59-3.58 3.59-3.58-3.59 3.58-3.59z" fill="#0018F5" />
        </svg>
        <h1 style={{ fontSize: 22, margin: 0 }}>Boom MCP</h1>
      </div>
      <p style={{ color: "#5C5A60", fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>
        Remote MCP connector for the <strong>Boom</strong> spreading engine — raw income-statement,
        balance-sheet, and cash-flow line items keyed by <code>accountCode</code>. Streamable HTTP transport.
      </p>

      <div style={{ background: "#fff", border: "1px solid #D6D3D1", borderRadius: 8, padding: "14px 18px", margin: "20px 0" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#5C5A60", fontWeight: 700, marginBottom: 6 }}>
          Connect
        </div>
        <p style={{ fontSize: 13, margin: "0 0 6px" }}>Register this URL in your connectors panel:</p>
        <code style={{ background: "#FAF8FB", padding: "6px 10px", borderRadius: 5, display: "inline-block", fontSize: 13 }}>
          {"<this-deploy>/api/mcp"}
        </code>
      </div>

      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", color: "#5C5A60", fontWeight: 700, marginBottom: 8 }}>
        Tools
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {TOOLS.map(([name, desc]) => (
          <li key={name} style={{ padding: "10px 0", borderBottom: "1px solid #ECE9EF" }}>
            <code style={{ fontSize: 13, fontWeight: 700, color: "#2D1A47" }}>{name}</code>
            <div style={{ fontSize: 13, color: "#5C5A60", marginTop: 2 }}>{desc}</div>
          </li>
        ))}
      </ul>

      <p style={{ fontSize: 12, color: "#8a8790", marginTop: 24 }}>
        Demo runs in fixture mode (<code>BOOM_USE_FIXTURE=true</code>). Set <code>BOOM_USE_FIXTURE=false</code> +{" "}
        <code>BOOM_API_KEY</code> for live api.boom.build.
      </p>
    </main>
  );
}
