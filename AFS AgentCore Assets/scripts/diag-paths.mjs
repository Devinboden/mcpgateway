// Path/gateway diagnostic. Tries several candidate bases on the host and prints
// status + key response headers + a snippet, so we can find where the API lives.
const host = "https://dd3.afsvision.us";
const user = process.env.AFS_USERNAME || "";
const pass = process.env.AFS_PASSWORD || "";
const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");

const targets = [
  ["root", "/"],
  ["login path (webx/rs)", "/webx/rs/app/15/15"],
  ["afsroot base", "/afsroot/api/v1/"],
  ["afsroot obligors", "/afsroot/api/v1/obligors/get/1-500123"],
  ["webx/rs api guess", "/webx/rs/api/v1/obligors/get/1-500123"],
  ["webx api guess", "/webx/api/v1/obligors/get/1-500123"],
  ["rs api guess", "/rs/api/v1/obligors/get/1-500123"],
];

for (const [label, path] of targets) {
  const url = host + path;
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { Authorization: auth, Accept: "application/json", "Afs-AppChannel": "AFS-MCP", "Afs-tranXref": "diag" },
    });
    const text = await res.text();
    const snippet = text.replace(/\s+/g, " ").trim().slice(0, 90);
    console.log(
      `${String(res.status).padEnd(3)} ${label.padEnd(22)} ${path}\n` +
        `     server=${res.headers.get("server")} | www-auth=${res.headers.get("www-authenticate")} | ctype=${res.headers.get("content-type")} | loc=${res.headers.get("location")}\n` +
        `     ${snippet}`
    );
  } catch (e) {
    console.log(`ERR ${label.padEnd(22)} ${path} → ${e?.cause?.code || e?.message}`);
  }
}
