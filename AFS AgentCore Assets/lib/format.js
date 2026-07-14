// Small shaping helpers shared by the tools. Keep these dumb and pure.

/** Pick a subset of keys from an object, dropping null/undefined. */
export function pick(obj, keys) {
  const out = {};
  if (!obj) return out;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) out[k] = obj[k];
  }
  return out;
}

/** Coerce AFS numeric strings to numbers; pass through real numbers. */
export function num(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/** Round to cents for display-friendly money. */
export function money(v) {
  const n = num(v);
  return n === undefined ? undefined : Math.round(n * 100) / 100;
}

/** Build the standard MCP tool result envelope (human text + structured JSON). */
export function toolResult(summaryLine, payload) {
  return {
    content: [
      { type: "text", text: `${summaryLine}\n\n${JSON.stringify(payload, null, 2)}` },
    ],
    structuredContent: payload,
  };
}

/** Wrap a thrown error as an MCP error result so the client sees the reason. */
export function toolError(err) {
  return {
    isError: true,
    content: [{ type: "text", text: `Error: ${err?.message || String(err)}` }],
  };
}

/** Unwrap the AFS `{ "<resource>": payload, "messages": [...] }` envelope to the payload. */
export function unwrap(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const key = Object.keys(data).find((k) => k !== "messages" && data[k] && typeof data[k] === "object");
  return key ? data[key] : data;
}

/** ISO date N months back from `from` (default today), as YYYY-MM-DD. */
export function monthsAgo(months, from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export const today = () => new Date().toISOString().slice(0, 10);
