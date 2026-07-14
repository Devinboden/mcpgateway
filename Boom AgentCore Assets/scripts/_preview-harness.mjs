// TEMP harness — render widget/financials.html standalone with a MOCK ExtApps host + sample
// fullscreen data, so we can screenshot the real layout locally. Not shipped. Run: node scripts/_preview-harness.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = readFileSync(join(ROOT, "widget", "brand.css"), "utf8");
let html = readFileSync(join(ROOT, "widget", "financials.html"), "utf8").replace("/*__BRAND__*/", () => brand);

const mock = `
globalThis.ExtApps = (() => {
  const SAMPLE = {
    company: "Piedmont Precision Components, Inc.", asOf: "2024-12-31", source: "BOOM-LIVE",
    ratios: [
      {label:"Revenue",value:"$44.9M",sub:"3.0% YoY",status:"neutral"},
      {label:"Gross Margin",value:"18.4%",status:"neutral"},
      {label:"EBITDA",value:"$-19K",sub:"-0.0% margin",status:"neutral"},
      {label:"Total Leverage",value:"NM",status:"neutral"},
      {label:"Interest Coverage",value:"-2.11x",status:"neutral"},
      {label:"Total Debt",value:"$2.1M",status:"neutral"}
    ],
    statements: [
      {statementType:"balance_sheet", periods:["2024-12-31","2023-12-31"], lineItems:[
        {name:"Current Assets:",accountCode:"",hierarchy:"header",values:[null,null]},
        {name:"Cash",accountCode:"cash",hierarchy:"line_item",values:[999,95]},
        {name:"Accounts receivable, net",accountCode:"ar",hierarchy:"line_item",values:[9288,12065]},
        {name:"Inventories, net",accountCode:"inv",hierarchy:"line_item",values:[15826,14198]},
        {name:"Total current assets",accountCode:"tca",hierarchy:"total",values:[27779,29567]},
        {name:"Property, plant and equipment, net",accountCode:"ppe",hierarchy:"line_item",values:[7005,6978]},
        {name:"Total Assets",accountCode:"ta",hierarchy:"total",values:[34832,36587]},
        {name:"Current Liabilities:",accountCode:"",hierarchy:"header",values:[null,null]},
        {name:"Line of credit",accountCode:"loc",hierarchy:"line_item",values:[2127,2103]},
        {name:"Accounts payable",accountCode:"ap",hierarchy:"line_item",values:[2413,2061]},
        {name:"Post-retirement obligation, current portion",accountCode:"pro",hierarchy:"line_item",values:[-84,-97]},
        {name:"Total current liabilities",accountCode:"tcl",hierarchy:"subtotal",values:[6855,7928]},
        {name:"Shareholders' Equity:",accountCode:"",hierarchy:"header",values:[null,null]},
        {name:"Common stock",accountCode:"cs",hierarchy:"line_item",values:[526,525]},
        {name:"Retained earnings",accountCode:"re",hierarchy:"line_item",values:[11331,12954]},
        {name:"Accumulated other comprehensive loss",accountCode:"aoci",hierarchy:"line_item",values:[-2059,-2389]},
        {name:"Treasury stock",accountCode:"ts",hierarchy:"line_item",values:[-1122,-1157]},
        {name:"Total shareholders' equity",accountCode:"tse",hierarchy:"subtotal",values:[23504,24494]},
        {name:"Total Liabilities and Shareholders' Equity",accountCode:"tlse",hierarchy:"total",values:[34832,36587]}
      ]},
      {statementType:"income_statement", periods:["2024-12-31","2023-12-31"], lineItems:[
        {name:"Revenue",accountCode:"sales_revenue",hierarchy:"line_item",values:[44917,43629]}
      ]},
      {statementType:"cash_flow_statement", periods:["2024-12-31","2023-12-31"], lineItems:[
        {name:"Operating cash flow",accountCode:"ocf",hierarchy:"line_item",values:[3000,2500]}
      ]}
    ],
    panelUrl: "https://boom-mcp.vercel.app/boom?fileId=x", fileId: "x", initialMode: "inline"
  };
  class App {
    constructor(){ this.ontoolresult=null; this.onhostcontextchanged=null; }
    getHostContext(){ return { displayMode:"fullscreen", availableDisplayModes:["inline","fullscreen"], theme:"light" }; }
    async connect(){ queueMicrotask(() => this.ontoolresult && this.ontoolresult({ structuredContent: SAMPLE })); }
    requestDisplayMode(){} sendMessage(){} openLink(){}
  }
  return { App };
})();
`;
html = html.replace("/*__EXT_APPS_BUNDLE__*/", () => mock);

const outDir = join(ROOT, ".preview");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), html);
console.log("wrote .preview/index.html");
