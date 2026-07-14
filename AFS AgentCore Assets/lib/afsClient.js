import { randomUUID } from "node:crypto";
import { config, assertLiveReady } from "./config.js";
import { resolveFixture } from "./fixtures.js";

/**
 * Thin AFS Vision REST client.
 *
 * Every AFS call shares the same contract:
 *   - HTTP Basic auth
 *   - Afs-AppChannel + Afs-tranXref request headers (echoed back on the response)
 *   - A JSON envelope shaped { "<resource>": <payload>, "messages": [...] }
 *
 * Each tool calls `afsCall(...)` with a logical `fixtureKey` so the exact same
 * call path works in fixture mode (no network) and live mode (real HTTP).
 */

function buildHeaders() {
  const tranXref = randomUUID();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Afs-AppChannel": config.appChannel,
    "Afs-tranXref": tranXref,
  };
  if (config.username || config.password) {
    const token = Buffer.from(`${config.username}:${config.password}`).toString("base64");
    headers.Authorization = `Basic ${token}`;
  }
  return { headers, tranXref };
}

function buildUrl(path, query) {
  const url = new URL(config.baseUrl.replace(/\/$/, "") + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url.toString();
}

/**
 * @param {object} opts
 * @param {"GET"|"POST"} opts.method
 * @param {string} opts.path     - AFS path beginning with "/"
 * @param {object} [opts.query]  - query string params
 * @param {object} [opts.body]   - JSON body for POST
 * @param {string} opts.fixtureKey - logical operation id used to resolve fixtures
 * @param {object} [opts.fixtureParams] - params passed to a fixture builder
 * @param {boolean} [opts.allow404] - treat 404 as an empty result instead of throwing
 * @returns {Promise<{data:object, messages:Array, meta:object, notFound?:boolean}>}
 */
export async function afsCall({ method, path, query, body, fixtureKey, fixtureParams, allow404 }) {
  if (config.fixtureMode) {
    const data = resolveFixture(fixtureKey, fixtureParams || query || {});
    return { data, messages: data?.messages || [], meta: { mode: "fixture", fixtureKey } };
  }

  assertLiveReady();
  const { headers, tranXref } = buildHeaders();
  const url = buildUrl(path, query);

  const res = await fetch(url, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`AFS ${method} ${path} returned non-JSON (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  const messages = Array.isArray(data?.messages) ? data.messages : [];
  if (res.status === 404 && allow404) {
    return { data: null, messages, notFound: true, meta: { mode: "live", status: 404 } };
  }
  if (!res.ok) {
    const detail = messages.map((m) => m.text).filter(Boolean).join("; ") || res.statusText;
    throw new Error(`AFS ${method} ${path} failed (HTTP ${res.status}): ${detail}`);
  }

  // AFS reports business-level failures via messages[].severity even on 200.
  const errors = messages.filter((m) => /e|error/i.test(String(m.severity || "")));
  if (errors.length) {
    throw new Error(`AFS ${method} ${path} returned errors: ${errors.map((m) => m.text).join("; ")}`);
  }

  return {
    data,
    messages,
    meta: {
      mode: "live",
      tranXref: res.headers.get("Afs-tranXref") || tranXref,
      taskId: res.headers.get("Afs-taskId") || undefined,
      tranTimeMs: res.headers.get("Afs-tranTime") || undefined,
    },
  };
}

export const afsGet = (path, { query, fixtureKey, fixtureParams, allow404 } = {}) =>
  afsCall({ method: "GET", path, query, fixtureKey, fixtureParams, allow404 });

export const afsPost = (path, { body, query, fixtureKey, fixtureParams } = {}) =>
  afsCall({ method: "POST", path, body, query, fixtureKey, fixtureParams });
