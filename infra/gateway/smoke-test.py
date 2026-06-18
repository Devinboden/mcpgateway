#!/usr/bin/env python3
"""
Data-plane smoke test for the AgentCore MCP Gateway.

Mints a Cognito client-credentials (M2M) token, then does a real MCP handshake against the
gateway endpoint (initialize -> notifications/initialized -> tools/list) and prints the
namespaced tool catalog. Proves inbound JWT auth + outbound to the targets end-to-end.

Usage:  python infra/gateway/smoke-test.py
Env overrides: REGION, POOL_ID, CLIENT_ID, GATEWAY_URL, TOKEN_URL, SCOPES
The client secret is fetched at runtime via the AWS CLI; nothing secret is printed.
"""
import json, os, subprocess, sys, urllib.request, urllib.parse, base64

REGION     = os.environ.get("REGION", "us-east-1")
POOL_ID    = os.environ.get("POOL_ID", "us-east-1_Z1otWFj2I")
CLIENT_ID  = os.environ.get("CLIENT_ID", "7ktuvp7o0u0k21sn2rc0837g29")
GATEWAY_URL= os.environ.get("GATEWAY_URL",
    "https://mcpgateway-eerhmo8ymw.gateway.bedrock-agentcore.us-east-1.amazonaws.com/mcp")
TOKEN_URL  = os.environ.get("TOKEN_URL",
    "https://mcpgateway-111204669101.auth.us-east-1.amazoncognito.com/oauth2/token")
SCOPES     = os.environ.get("SCOPES",
    "https://mcpgateway/api/afs:read https://mcpgateway/api/snowflake:read")

def get_secret():
    out = subprocess.check_output([
        "aws","cognito-idp","describe-user-pool-client",
        "--user-pool-id",POOL_ID,"--client-id",CLIENT_ID,"--region",REGION,
        "--query","UserPoolClient.ClientSecret","--output","text"], text=True).strip()
    if not out:
        sys.exit("no client secret")
    return out

def mint_token(secret):
    body = urllib.parse.urlencode({"grant_type":"client_credentials","scope":SCOPES}).encode()
    basic = base64.b64encode(f"{CLIENT_ID}:{secret}".encode()).decode()
    req = urllib.request.Request(TOKEN_URL, data=body, headers={
        "Authorization": f"Basic {basic}",
        "Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["access_token"]

def parse_body(raw, ctype):
    # streamable HTTP may return JSON or text/event-stream
    if "text/event-stream" in (ctype or ""):
        for line in raw.decode().splitlines():
            if line.startswith("data:"):
                return json.loads(line[5:].strip())
        return None
    return json.loads(raw.decode()) if raw.strip() else None

def rpc(token, payload, session=None):
    headers = {"Authorization": f"Bearer {token}",
               "Content-Type": "application/json",
               "Accept": "application/json, text/event-stream"}
    if session: headers["Mcp-Session-Id"] = session
    req = urllib.request.Request(GATEWAY_URL, data=json.dumps(payload).encode(), headers=headers)
    with urllib.request.urlopen(req) as r:
        return parse_body(r.read(), r.headers.get("Content-Type")), r.headers.get("Mcp-Session-Id")

def main():
    token = mint_token(get_secret())
    print("token minted OK")
    init, sid = rpc(token, {"jsonrpc":"2.0","id":1,"method":"initialize","params":{
        "protocolVersion":"2025-06-18",
        "capabilities":{},
        "clientInfo":{"name":"smoke-test","version":"0.1"}}})
    print("initialize OK; server:", (init or {}).get("result",{}).get("serverInfo"))
    print("session:", sid)
    # notify initialized (best-effort)
    try: rpc(token, {"jsonrpc":"2.0","method":"notifications/initialized"}, sid)
    except Exception: pass
    tools, _ = rpc(token, {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}, sid)
    names = [t["name"] for t in (tools or {}).get("result",{}).get("tools",[])]
    print(f"\ntools/list -> {len(names)} tools:")
    for n in sorted(names):
        print("  ", n)

if __name__ == "__main__":
    main()
