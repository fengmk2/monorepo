import { type } from "arktype";
import * as v from "valibot";
import { z } from "zod";

import { createStandardValidator, createSyncStandardValidator } from "../../src/index.js";

export const zodSchema = z.object({
  active: z.boolean(),
  age: z.number().int().min(0),
  email: z.email(),
  name: z.string().min(1),
});

export const zodAsyncSchema = zodSchema.refine(async () => true);

export const arktypeSchema = type({
  active: "boolean",
  age: "number.integer >= 0",
  email: "string.email",
  name: "string > 0",
});

export const valibotSchema = v.object({
  active: v.boolean(),
  age: v.pipe(v.number(), v.integer(), v.minValue(0)),
  email: v.pipe(v.string(), v.email()),
  name: v.pipe(v.string(), v.minLength(1)),
});

export const zodSyncValidator = createSyncStandardValidator(zodSchema);
export const arktypeSyncValidator = createSyncStandardValidator(arktypeSchema);
export const valibotSyncValidator = createSyncStandardValidator(valibotSchema);

export const zodAsyncValidator = createStandardValidator(zodAsyncSchema);
export const valibotAsyncValidator = createStandardValidator(valibotSchema);
