import { z } from "zod";
import { randomUUID } from "node:crypto";
import { afsPost } from "../lib/afsClient.js";
import { config } from "../lib/config.js";
import { toolResult, toolError } from "../lib/format.js";

// Reserve a new obligation (or collateral) number for an obligor.
// AFS: POST /reserveNumber  (operationId Wf-reserveNumber:/reserveNumber:post)

const schema = {
  bankId: z.string().describe("Bank ID the number is reserved under."),
  obligorNumber: z.string().describe("Obligor number the obligation will hang off of."),
  reserveType: z
    .number()
    .int()
    .optional()
    .describe("AFS reserve type: 2 = Obligation, 3 = Collateral. Defaults to 2 (obligation)."),
  expirationDays: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Days the reservation stays valid before it expires. Default 30."),
  reserveNumber: z
    .string()
    .optional()
    .describe("Request a specific number instead of letting AFS assign the next one."),
  correlationId: z
    .string()
    .optional()
    .describe("Idempotency/correlation id. Auto-generated if omitted."),
};

async function handler(args) {
  try {
    const body = {
      correlationId: (args.correlationId || randomUUID()).slice(0, 15),
      bankId: args.bankId,
      obligorNumber: args.obligorNumber,
      reserveType: args.reserveType ?? 2,
      reserveNumber: args.reserveNumber,
      expirationDays: args.expirationDays ?? 30,
    };

    const { data, meta } = await afsPost("/reserveNumber", {
      body,
      fixtureKey: "reserveNumber.reserve",
    });

    const reserved = data?.reserveNumber;
    return toolResult(
      `Reserved obligation number ${reserved} for bank ${body.bankId} / obligor ${body.obligorNumber} [${meta.mode}].`,
      {
        reserveNumber: reserved,
        bankId: body.bankId,
        obligorNumber: body.obligorNumber,
        reserveType: body.reserveType,
        expirationDays: body.expirationDays,
        correlationId: body.correlationId,
      }
    );
  } catch (err) {
    return toolError(err);
  }
}

export function register(server) {
  server.tool(
    "reserve_obligation_number",
    "Reserve a new obligation number for a bank/obligor in AFS, returning the assigned number.",
    schema,
    handler
  );
}
