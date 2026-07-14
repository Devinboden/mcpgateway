// BoomClient — thin wrapper over the Boom REST API (https://api.boom.build).
//
// Transport-agnostic and runtime-agnostic: the fixture is INJECTED as a parsed object
// (not read from disk here), so the same class works in a Node process (stdio) and in a
// serverless function (Vercel HTTP) where filesystem access is unreliable.
//
//   USE_FIXTURE=true  (default) → serve the injected fixture, no network / key.
//   USE_FIXTURE=false + BOOM_API_KEY → live api.boom.build. Identical tool surface.
//
// OpenAPI: https://api.boom.build/openapi.json

export class BoomClient {
  constructor({ useFixture = true, apiKey = null, baseUrl = "https://api.boom.build", fixture = null } = {}) {
    this.useFixture = useFixture;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.fixture = fixture;
    if (!this.useFixture && !this.apiKey) {
      throw new Error("boom-mcp: live mode requires BOOM_API_KEY (or set USE_FIXTURE=true).");
    }
    if (this.useFixture && !this.fixture) {
      throw new Error("boom-mcp: fixture mode requires an injected fixture object.");
    }
  }

  static fromEnv(env = process.env, fixture = null) {
    return new BoomClient({
      useFixture: String(env.BOOM_USE_FIXTURE ?? env.USE_FIXTURE ?? "true").toLowerCase() !== "false",
      apiKey: env.BOOM_API_KEY ?? null,
      baseUrl: env.BOOM_BASE_URL ?? "https://api.boom.build",
      fixture,
    });
  }

  get mode() {
    return this.useFixture ? "BOOM-FIXTURE" : "BOOM-LIVE";
  }

  async _get(path) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${this.apiKey}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Boom GET ${path} → ${res.status} ${res.statusText}`);
    return res.json();
  }

  // GET /companies/external-id/{externalUniqueId} → Company { id, externalUniqueId, name, fileIds[] }
  async lookupCompany(externalUniqueId) {
    if (this.useFixture) {
      const c = this.fixture.company;
      if (externalUniqueId && c.externalUniqueId && externalUniqueId !== c.externalUniqueId) {
        return { ...c, _warning: `FIXTURE: requested ${externalUniqueId}, returning ${c.name} (${c.externalUniqueId}).` };
      }
      return c;
    }
    return this._get(`/companies/external-id/${encodeURIComponent(externalUniqueId)}`);
  }

  async listFiles(externalUniqueId) {
    if (this.useFixture) {
      return Object.values(this.fixture.files).map((f) => ({
        fileId: f.id, fileName: f.fileName, status: f.status,
        statementEndDates: f.statementEndDates, externalUniqueId: f.externalUniqueId,
      }));
    }
    const company = await this.lookupCompany(externalUniqueId);
    return Promise.all((company.fileIds ?? []).map((id) => this._get(`/files/${id}`)));
  }

  // GET /files/{fileId} → File { id, status, financialStatements[] }
  async getSpread(fileId) {
    if (this.useFixture) {
      return this.fixture.files[fileId] ?? Object.values(this.fixture.files)[0];
    }
    return this._get(`/files/${encodeURIComponent(fileId)}`);
  }

  // POST /auth/file-validation-session/{fileId} → { token, url, expiresAt }
  // A short-lived, authenticated deep link into Boom's spreading/validation UI for a file.
  // Inherently LIVE (it points at the real Boom app), so it requires an API key regardless
  // of fixture mode for data.
  async createValidationSession(fileId) {
    if (!this.apiKey) {
      throw new Error("boom_create_validation_session is a live capability — set BOOM_API_KEY (not available in pure fixture mode).");
    }
    const res = await fetch(`${this.baseUrl}/auth/file-validation-session/${encodeURIComponent(fileId)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Boom POST /auth/file-validation-session/${fileId} → ${res.status} ${res.statusText}`);
    return res.json();
  }

  // GET /companies?limit=&offset= → { data:[{ id, name, externalUniqueId, fileIds }], total }
  // Resolve a borrower DIRECTLY in Boom by NAME — no Salesforce/externalUniqueId bridge needed.
  async findCompany(name) {
    const needle = (name ?? "").toLowerCase().trim();
    if (this.useFixture) {
      const c = this.fixture.company;
      return (!needle || (c.name ?? "").toLowerCase().includes(needle)) ? [c] : [];
    }
    const res = await this._get(`/companies?limit=100&offset=0`);
    const list = res.data ?? res.items ?? (Array.isArray(res) ? res : []);
    const matches = needle ? list.filter((c) => (c.name ?? "").toLowerCase().includes(needle)) : list;
    return matches.map((c) => ({ id: c.id, name: c.name, externalUniqueId: c.externalUniqueId, fileIds: c.fileIds ?? [] }));
  }
}
