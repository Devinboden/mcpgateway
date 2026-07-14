# boom-mcp

MCP connector for the **Boom** spreading engine (`https://api.boom.build`) — exposes raw,
normalized income-statement / balance-sheet / cash-flow line items keyed by `accountCode`.

**Two transports, one tool core.** The four tools are defined once in `src/tools.js` and
registered onto either:
- **stdio** (`src/stdio.js`) — local use, `npx`, or a desktop connector.
- **streamable HTTP** (`app/api/[transport]/route.js`) — a remote connector you deploy
  (Vercel) and register by URL in the Claude / Cowork connectors panel.

Demo runs in **fixture mode** (`BOOM_USE_FIXTURE=true`, default) — serves a canned Atlas
spread with no network or key. Flip to **live** with `BOOM_USE_FIXTURE=false` + `BOOM_API_KEY`;
the tool surface is identical.

## Tools

| Tool | Returns |
|---|---|
| `boom_lookup_company` | Boom Company for a Salesforce Account Id (`externalUniqueId`) + `fileIds` |
| `boom_list_files` | spread files (id, name, status, statement end dates) |
| `boom_get_spread` | full parsed spread — `financialStatements[]` with `lineItems` by `accountCode` |
| `boom_get_line_items` | flattened rows (optionally filtered by `accountCode`) |
| `boom_get_ratios` | computed credit ratios from the spread — `raw` numeric values (for IRIS/the memo) + `ratios` display cards |
| `boom_create_validation_session` | authenticated URL into Boom's spreading/validation UI for a file (open in a browser) — live capability |

(The HTTP transport also exposes `boom_show_spread` / `boom_show_ratios` — the same data rendered as the MCP-App **Financials widget**. Data tools above are on both transports.)

## Ratio ownership

Ratios are computed **here**, not by Boom-the-vendor and not in the widget:

- **Boom the vendor** (`api.boom.build`) owns **raw line items** only — generic, multi-tenant, no bank policy.
- **This server is the Acme Bank consumer/integration layer** (an adapter that wraps Boom). It owns the **ratio calculation** (`src/ratios.js`), because ratio definitions are **bank-specific policy** — they don't belong in the vendor engine.
- Ratios are a **deterministic function of the spread** → computed **on read**, never stored. One `deriveRatios()` feeds three consumers: the widget (display), `boom_get_ratios` (the agent / a rating engine like IRIS), and the memo at assembly. No duplicated copy can drift.
- **Grading is omitted.** Pass/watch/breach needs covenant thresholds, which are **nCino-owned**. Covenant pass/fail is a downstream **join** (Boom ratio × nCino threshold), graded by IRIS. Boom surfaces neutral numbers.

So: **raw line item → Boom · standard ratio → this consumer layer · rating + grade → IRIS · threshold/definition → nCino.** Long-term, lift the per-bank ratio *definitions* into versioned config evaluated by a generic engine (engine = reusable foundation; definitions = the per-bank deployable). The only place to *persist* a ratio is the immutable memo/DocMan record — not a cache.

## Local (stdio)

```bash
npm install
npm test           # spawns the server over MCP, calls every tool, asserts
npm start          # run the stdio server (fixture mode)
```

Register as a user-level connector in Claude Code:

```bash
claude mcp add boom --scope user -e BOOM_USE_FIXTURE=true -- node /abs/path/to/boom-mcp/src/stdio.js
```

## Remote (HTTP, for the connectors panel)

```bash
npm install
npm run dev        # http://localhost:3000  → MCP endpoint at /api/mcp
# deploy:
vercel deploy --prod
```

Then in the connectors panel, **Add custom connector → Remote MCP server URL** =
`https://<your-deploy>/api/mcp`. Set `BOOM_USE_FIXTURE` / `BOOM_API_KEY` as Vercel env vars
for live mode.

## Env

| Var | Default | Meaning |
|---|---|---|
| `BOOM_USE_FIXTURE` | `true` | serve the bundled fixture; `false` → live API |
| `BOOM_API_KEY` | — | required when not in fixture mode |
| `BOOM_BASE_URL` | `https://api.boom.build` | override the API base |
| `BOOM_FIXTURE_PATH` | `data/atlas_spread.json` | stdio only — swap the fixture |

## Layout

```
src/tools.js        # the 4 tools — ONE definition for both transports
src/boomClient.js   # fixture + live client (fixture injected, runtime-agnostic)
src/stdio.js        # stdio entry (bin: boom-mcp)
app/                # Next.js App Router — the remote HTTP connector
data/               # sample fixture (Atlas)
test/smoke.mjs      # protocol-level smoke test
```
