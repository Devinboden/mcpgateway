import { z } from "zod";
import { afsPost } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError, today } from "../lib/format.js";

// Post a financial transaction (fund / disburse / payment). AFS: POST /createFinancial
// Required: financial.{bankNumber, application, oblgrNumber, oblnNumber, effectiveDate,
// transaction, balanceCode}. `transaction` = a servicing apiName (lookup_transaction_apis).
// `balanceCode` is obligation-specific (read from get_obligation_detail balances).
// SIMULATE-FIRST: simulate defaults true → AFS runs full validation and posts nothing;
// the dry-run outcome (would-post / would-fail-because) is returned as a result.

const schema = {
  bank: z.string().optional().describe("Bank number. Defaults to sample."),
  obligor: z.string().optional().describe("Obligor number. Defaults to sample."),
  obligation: z.string().optional().describe("Obligation number. Defaults to sample."),
  application: z.string().optional().describe("Application. Default '1'."),
  transaction: z.string().describe("Servicing apiName, e.g. DisburseFuture / DisburseCurrent (lookup_transaction_apis)."),
  balanceCode: z.string().describe("Balance code on the obligation (from get_obligation_detail balances)."),
  tranAmount: z.number().describe("Transaction amount."),
  currency: z.string().optional().describe("Amount currency. Default 'USD'."),
  effectiveDate: z.string().optional().describe("Effective date YYYY-MM-DD. Default today."),
  takenDownFromObln: z.string().optional().describe("Parent commitment obligation for a takedown."),
  simulate: z.boolean().optional().describe("Dry run (default TRUE — validates, posts nothing). Set false to actually post."),
};

async function handler(args) {
  const simulate = args.simulate !== false; // default true
  const financial = {
    bankNumber: args.bank || config.sample.bank,
    oblgrNumber: args.obligor || config.sample.obligor,
    oblnNumber: args.obligation || config.sample.obligation,
    application: args.application || "1",
    effectiveDate: args.effectiveDate || today(),
    transaction: args.transaction,
    balanceCode: args.balanceCode,
    tranAmount: args.tranAmount,
    tranAmountCur: args.currency || "USD",
    takenDownFromObln: args.takenDownFromObln,
  };
  const body = { simulate: String(simulate), financial };
  const key = `${financial.bankNumber}-${financial.oblgrNumber}-${financial.oblnNumber}`;

  try {
    const { data, meta } = await afsPost("/createFinancial", { body, fixtureKey: "createFinancial.post" });
    const messages = data?.messages || [];
    if (simulate) {
      return toolResult(`Dry run OK — ${args.transaction} ${args.tranAmount} ${financial.tranAmountCur} on ${key} would post.`, {
        simulate: true, wouldPost: true, key, transaction: args.transaction, amount: args.tranAmount, balanceCode: args.balanceCode, messages,
      });
    }
    return toolResult(`Posted ${args.transaction} ${args.tranAmount} ${financial.tranAmountCur} on ${key} [${meta.mode}].`, {
      simulate: false, posted: true, key, transaction: args.transaction, amount: args.tranAmount, messages,
    });
  } catch (err) {
    // In simulate mode, a validation failure IS the answer — surface it as a result.
    if (simulate) {
      return toolResult(`Dry run: ${args.transaction} on ${key} would NOT post.`, {
        simulate: true, wouldPost: false, key, reason: err?.message || String(err),
      });
    }
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "post_financial_transaction",
    "Post a financial transaction (disburse/fund/takedown/payment) via createFinancial. SIMULATE-FIRST: defaults to a dry run that validates and posts nothing, returning would-post / would-fail-because. transaction=apiName (lookup_transaction_apis); balanceCode from get_obligation_detail. Set simulate=false to actually post.",
    schema,
    handler
  );
}
