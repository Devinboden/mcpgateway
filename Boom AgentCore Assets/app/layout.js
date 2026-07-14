export const metadata = {
  title: "Boom MCP — Spreading Engine Connector",
  description: "Remote MCP connector exposing the Boom spreading engine (income/balance/cash-flow line items by accountCode).",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '"DM Sans", "Inter", system-ui, sans-serif', background: "#FAF8FB", color: "#1A1A1A" }}>
        {children}
      </body>
    </html>
  );
}
