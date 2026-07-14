# AFS AgentCore Assets — read me first

A reference snapshot of the **AFS MCP** as deployed to **Amazon Bedrock AgentCore Runtime**, kept in
the mcpgateway repo. Like the Boom snapshot, this is a *reference copy*, not the source of truth.

- **Source repo:** https://github.com/Devinboden/AFS-mcp-v2.git
- **Snapshot of:** `origin/main` @ commit **`131ff4b`**.
- **Recovered:** the AgentCore container recipe (`Dockerfile`) and entrypoint (`server.js`) were
  **never committed to the AFS repo** and the CodeBuild S3 source was deleted, so they were
  **recovered from the deployed image** (`bedrock-agentcore-afs_mcp:20260701-164834-725`) — pulled out
  of its layers. They are byte-for-byte what built the live runtime.

## How AFS-on-AgentCore differs from the Vercel build
AFS is a Next.js project with two deployments of the **same tool core** (`tools/`, `lib/`):
- **Vercel:** `app/api/[transport]/route.js` (mcp-handler) serves MCP at **`/api/mcp`** + the web UI.
- **AgentCore:** `server.js` — a standalone Node HTTP server serving streamable MCP at **`/mcp` on
  `0.0.0.0:8000`** (stateless), registering the same tools/resources/**widgets** via the raw MCP SDK.
  Unlike Boom's AgentCore build, **AFS-on-AgentCore *does* serve the Truist MCP-App widgets**
  (`server.js` calls `registerWidgets`, which reads `app/_widgets.js`).

---

## Which files matter for an AgentCore deployment

### ✅ Essential — the runtime won't work without these
| File / dir | Why |
|---|---|
| `server.js` | **The entrypoint.** Serves streamable MCP at `/mcp` on `:8000`. `CMD ["node","server.js"]`. |
| `tools/` (`index.js` + the 24 tools) | The AFS tool surface (`registerTools`). |
| `lib/` (`afsClient.js`, `config.js`, `afsResources.js`, `widgets.js`, `format.js`, `widgetData.js`, `fixtures.js`) | AFS REST client, config, reference resources, widget assembly. |
| `app/_widgets.js` | Built base64 MCP-App widgets (read by `lib/widgets.js`). **Runtime-needed** (AFS serves widgets). |
| `sample.config.js`, `fixtures/` | Sample loan config + fixture data (imported even in live mode). |
| `api-discovery/captured/{harvested_picklists,picklist_api_names,picklist_crosswalk}.json` | Picklist/crosswalk reference data read by `resolveCodes`/`listPicklist`/`afsResources`. |
| `package.json` + `package-lock.json` | Deps. Build does `npm ci --omit=dev`. |

### 🔧 Build & deploy control files
| File | Why |
|---|---|
| **`Dockerfile`** | The recovered build recipe: `node:22-slim` (arm64), `npm ci --omit=dev`, `COPY . .`, `ENV PORT=8000`, `CMD node server.js`. |
| `.dockerignore` | **Added here** (the original had none). Keeps `.env.local` secrets and the api-discovery bulk out of the image. |
| Deploy script | `mcpgateway/infra/afs/go-live.sh` — sets the runtime image + **replays the Cognito JWT authorizer** and **injects AFS creds** from Secrets Manager. |

### ⚠️ Present but NOT needed for AgentCore (Vercel / Next.js only)
`app/api/[transport]/route.js`, `app/page.jsx`, `app/layout.jsx`, `next.config.mjs`, `vercel.json`.
Build-time only (regenerate `app/_widgets.js`): `widget/`, `vendor/ext-apps-app-with-deps.js`,
`scripts/build-widget.mjs`.

### ✂️ Trimmed from this snapshot (dev-only discovery artifacts, ~74 MB)
Removed to keep the folder lean; recover from the AFS repo if needed: `api-discovery/specs/` (OpenAPI
specs), `api-discovery/docs/field-model/`, `api-discovery/captured/read_samples/`, `api-discovery/tools/`.
> ⚠️ The **deployed image wastefully contains all of these** (~75 MB) because the original build had no
> `.dockerignore`. The `.dockerignore` here fixes that for future builds.

---

## How to deploy to AgentCore Runtime

**Runtime facts:**

| Item | Value |
|---|---|
| Runtime | `afs_mcp-F82Tf5DI8Q` |
| Deployed image | `bedrock-agentcore-afs_mcp:20260701-164834-725` |
| ECR repo | `111204669101.dkr.ecr.us-east-1.amazonaws.com/bedrock-agentcore-afs_mcp` |
| CodeBuild | `bedrock-agentcore-afs_mcp-builder` (buildspec: `docker build .`) |
| Platform / port / protocol | `linux/arm64` · `8000` · `MCP` (`/mcp`) |
| Auth | Cognito JWT authorizer, pool `us-east-1_Z1otWFj2I` |
| AFS backend | `AFS_BASE_URL` (e.g. `https://dd3.afsvision.us/webx/api/v1`), `AFS_FIXTURE_MODE=false` (live) |
| AFS creds | HTTP Basic, from Secrets Manager `mcpgateway/afs-vision` — injected as runtime env by `go-live.sh` |

**Steps:**
```bash
# 1. Build the ARM64 image from this Dockerfile and push to ECR (CodeBuild, or docker buildx).
#    The .dockerignore keeps secrets + api-discovery bulk out of the image.
# 2. Roll the runtime to the new image via the deploy script (it also replays the Cognito JWT
#    authorizer and injects AFS creds from Secrets Manager — do NOT bake creds into the image):
IMAGE=<ECR>/bedrock-agentcore-afs_mcp:<tag> bash mcpgateway/infra/afs/go-live.sh
# 3. After READY, re-sync the gateway target so afs___* tools refresh.
```

---

## Credentials & configuration — where to store them (read this if launching your own)

`lib/config.js` reads a small set of env vars. **Only two are secret:** `AFS_USERNAME` / `AFS_PASSWORD`.

| Variable | Required | What it is |
|---|---|---|
| `AFS_USERNAME` / `AFS_PASSWORD` | **secret** | HTTP Basic credentials for your AFS Vision tenant |
| `AFS_BASE_URL` | yes | Your AFS Vision REST base, e.g. `https://<tenant>.afsvision.us/webx/api/v1` |
| `AFS_APP_CHANNEL` | optional | Trace tag echoed on each request (≤24 chars); default `AFS-MCP` |
| `AFS_FIXTURE_MODE` | optional | `true` = serve the bundled sample loan with **no creds** (good first run); default `false` (live) |

### Where to put them — by environment
- **AgentCore Runtime (production): AWS Secrets Manager, injected as runtime env — never in the image.**
  Create your own secret, then let `go-live.sh` read it and inject it at deploy time:
  ```bash
  aws secretsmanager create-secret --name <you>/afs-vision --region us-east-1 \
    --secret-string '{"AFS_USERNAME":"...","AFS_PASSWORD":"..."}'
  # go-live.sh reads SECRET_ID + BASE_URL and injects AFS_USERNAME/AFS_PASSWORD/AFS_BASE_URL as runtime env
  SECRET_ID=<you>/afs-vision BASE_URL=https://<tenant>.afsvision.us/webx/api/v1 \
    IMAGE=<ECR>/bedrock-agentcore-afs_mcp:<tag> bash mcpgateway/infra/afs/go-live.sh
  ```
- **Local dev / testing (`npm run dev`): `.env.local`** — copy `.env.example` → `.env.local` and fill
  it in. It is gitignored **and** excluded from the image by `.dockerignore`. Never commit it.
- **Vercel deployment:** set the same variables under **Project → Settings → Environment Variables**.

### Golden rules
- ❌ **Never commit credentials, and never bake them into the image.** The recovered original build did
  exactly this (`.env.local` landed in an image layer) — the `.dockerignore` here prevents a repeat.
- ✅ Credentials reach the runtime **only** via Secrets Manager → runtime env (through `go-live.sh`).
- 🚀 **Zero-credential first run:** set `AFS_FIXTURE_MODE=true` to serve the bundled sample loan, then
  switch to live once your AFS tenant creds are in Secrets Manager.

---

## Security caveats (worth fixing on the real runtime)
1. **`.env.local` (AFS Basic creds) was baked into the deployed image** — the original build lacked a
   `.dockerignore`, so `COPY . .` copied it into a layer. Anyone who can pull the image can read it.
   Rebuild with the `.dockerignore` here; keep creds only in Secrets Manager / runtime env.
2. **~75 MB of api-discovery specs are baked into the image** — waste, same root cause; fixed by the
   `.dockerignore`.
3. `.bedrock_agentcore.yaml`-style toolkit config was not used for AFS (it was built via a hand-written
   `Dockerfile` + `server.js` in a since-deleted S3 source zip). This snapshot restores those two files.

## Refresh this folder
`git archive origin/main` from the AFS repo, re-overlay `Dockerfile` + `server.js` (kept here), keep
the `.dockerignore`, and re-trim the api-discovery bulk.
