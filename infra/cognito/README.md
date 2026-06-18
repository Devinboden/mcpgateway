# infra/cognito — inbound identity for the gateway

Cognito is the human-identity spine (see `planning/architecture.md` §3). Two app clients:

| Client | Type | Flow | Used by |
|---|---|---|---|
| `7ktuvp7o0u0k21sn2rc0837g29` (`mcpgateway-client`) | confidential (secret) | `client_credentials` | M2M tokens; gateway→AFS outbound; smoke test |
| `4hkln2r3rlev6kom7jvrnsu7fv` (`mcpgateway-desktop`) | **public (no secret)** | `authorization_code` + **PKCE** | **interactive login** from Claude Desktop / Claude.ai / mcp-remote |

Both client IDs are in the gateway authorizer `allowedClients`, so tokens from either validate.

## Interactive OAuth (Claude Desktop / Cowork)

The gateway advertises OAuth discovery, so a Claude custom connector can find Cognito on its own:

```
gateway /mcp  --401-->  WWW-Authenticate: resource_metadata=.../.well-known/oauth-protected-resource
                         -> authorization_servers = https://cognito-idp.us-east-1.amazonaws.com/us-east-1_Z1otWFj2I
                         -> Cognito /.well-known/openid-configuration (authorize + token endpoints)
```

Cognito has **no Dynamic Client Registration**, so Claude can't self-register. Claude supports
supplying a **custom client ID** for non-DCR servers — use the public client above (PKCE, no secret).

### Add the connector in Claude Desktop
1. Settings → Connectors → **Add custom connector**.
2. **Remote MCP server URL:**
   `https://mcpgateway-eerhmo8ymw.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp`
3. **Advanced settings → OAuth Client ID:** `4hkln2r3rlev6kom7jvrnsu7fv` (leave secret blank — public/PKCE).
4. Connect → you'll be sent to the Cognito hosted UI; log in as an employee (e.g. `employee-a`).
5. Tools appear namespaced: `afs___*`, `snowflake-rm___*`, `snowflake-analyst___*`.

**Hosted-UI domain:** `https://mcpgateway-111204669101.auth.us-east-1.amazoncognito.com`
**Registered callback URLs:** `https://claude.ai/api/mcp/auth_callback`,
`https://claude.com/api/mcp/auth_callback`, `http://localhost:8090/oauth/callback`.

> If the login fails with a **redirect_uri mismatch**, the error page shows the exact callback
> Claude used — add it with
> `aws cognito-idp update-user-pool-client --user-pool-id us-east-1_Z1otWFj2I --client-id 4hkln2r3rlev6kom7jvrnsu7fv --callback-urls <existing...> <new>` (callback list is replace-all).

### mcp-remote fallback (if Desktop's auto-OAuth misbehaves)
```
npx mcp-remote https://mcpgateway-eerhmo8ymw.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp \
  --static-oauth-client-info '{"client_id":"4hkln2r3rlev6kom7jvrnsu7fv","redirect_uris":["http://localhost:8090/oauth/callback"],"scope":"openid profile email"}'
```

## Known interop caveats (Cognito vs MCP OAuth 2.1)
- **No DCR** — handled via the custom client ID above.
- **No resource-indicator / audience binding** — Cognito access tokens carry `client_id`, not
  `aud`. The gateway authorizes on `allowedClients`, so this is fine here; a stricter client may warn.
- Employee passwords are set out-of-band (not in this repo). Employees were created in Group A.

## Scripts
- `create-desktop-oauth-client.sh` — creates the public `mcpgateway-desktop` client (idempotent-ish; re-running creates a new client).
