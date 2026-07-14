// Resolve { fileId | companyName } → { file, company } against a BoomClient.
// Shared by the data tools (boom_get_ratios) and the HTTP widget tools (boom_show_*),
// so borrower/file resolution lives in ONE place and behaves identically everywhere.
export async function resolveFile(client, { fileId, companyName }) {
  let fid = fileId, company = companyName;
  if (!fid && companyName) {
    const c = (await client.findCompany(companyName))[0];
    if (!c) throw new Error(`No Boom company matching "${companyName}".`);
    company = c.name;
    for (const id of c.fileIds ?? []) { const f = await client.getSpread(id); if ((f.financialStatements ?? []).length) { fid = id; break; } }
    fid = fid ?? (c.fileIds ?? [])[0];
  }
  if (!fid) throw new Error("Provide fileId or companyName.");
  const file = await client.getSpread(fid);
  // fileId-only path: the file's own name is the junk upload filename — resolve the real
  // company name by finding the Boom company that owns this fileId.
  if (!company) {
    try {
      const owner = (await client.findCompany("")).find((c) => (c.fileIds ?? []).includes(fid));
      if (owner?.name) company = owner.name;
    } catch { /* fall through to fallback */ }
  }
  return { file, company: company || file.externalUniqueId || "Borrower" };
}
