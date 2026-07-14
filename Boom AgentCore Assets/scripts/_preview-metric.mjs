import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = readFileSync(join(ROOT, "widget", "brand.css"), "utf8");
let html = readFileSync(join(ROOT, "widget", "metric.html"), "utf8").replace("/*__BRAND__*/", () => brand);
const mock = `
globalThis.ExtApps = (() => {
  const SAMPLE = {
    metric:"Total Leverage", value:"NM", company:"Piedmont Precision Components, Inc.", asOf:"2024-12-31",
    headline:"Why Piedmont Precision Components, Inc.'s leverage reads NM",
    drivers:[
      "The denominator, not the debt, is the issue: LTM EBITDA is essentially breakeven, so Debt/EBITDA is undefined (NM) — not a heavy debt load.",
      "Funded debt is modest — ~$2.1M drawn on the revolver, no term debt of note.",
      "Until EBITDA normalizes, leverage carries almost no signal; coverage and margin do."
    ],
    trend:"Leverage has screened NM for the trailing periods because earnings — not borrowings — are the moving part.",
    portfolioContext:"Across Boom's precision-manufacturing book, a near-zero EBITDA denominator is the #1 cause of NM leverage flags.",
    read:"Don't anchor the credit on leverage — anchor it on the EBITDA recovery. Capacity isn't the constraint; earnings are."
  };
  class App {
    constructor(){ this.ontoolresult=null; this.onhostcontextchanged=null; }
    getHostContext(){ return { displayMode:"inline", availableDisplayModes:["inline"], theme:"light" }; }
    async connect(){ queueMicrotask(() => this.ontoolresult && this.ontoolresult({ structuredContent: SAMPLE })); }
    requestDisplayMode(){} sendMessage(){} openLink(){}
  }
  return { App };
})();
`;
html = html.replace("/*__EXT_APPS_BUNDLE__*/", () => mock);
const out = join(ROOT, ".preview"); mkdirSync(out, { recursive: true });
writeFileSync(join(out, "metric.html"), html);
console.log("wrote .preview/metric.html");
