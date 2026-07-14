export const metadata = {
  title: "AFS MCP v2",
  description: "AFS Vision MCP server — jobs, obligation numbers, and enriched servicing data.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#0b1220",
          color: "#e6edf6",
        }}
      >
        {children}
      </body>
    </html>
  );
}
