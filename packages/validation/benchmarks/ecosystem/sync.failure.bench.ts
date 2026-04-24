import * as v from "valibot";
import { bench, describe } from "vite-plus/test";

import { standardValidateSync } from "../../src/index.js";
import { invalidInput } from "./fixtures.js";
import {
  arktypeSchema,
  arktypeSyncValidator,
  valibotSchema,
  valibotSyncValidator,
  zodSchema,
  zodSyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation ecosystem sync failure", () => {
  describe("zod", () => {
    bench("native zod.safeParse", () => {
      zodSchema.safeParse(invalidInput);
    });

    bench("standardValidateSync(zod)", () => {
      standardValidateSync(zodSchema, invalidInput);
    });

    bench("createSyncStandardValidator(zod)", () => {
      zodSyncValidator(invalidInput);
    });
  });

  describe("arktype", () => {
    bench("native arktype(schema)", () => {
      arktypeSchema(invalidInput);
    });

    bench("standardValidateSync(arktype)", () => {
      standardValidateSync(arktypeSchema, invalidInput);
    });

    bench("createSyncStandardValidator(arktype)", () => {
      arktypeSyncValidator(invalidInput);
    });
  });

  describe("valibot", () => {
    bench("native valibot.safeParse", () => {
      v.safeParse(valibotSchema, invalidInput);
    });

    bench("standardValidateSync(valibot)", () => {
      standardValidateSync(valibotSchema, invalidInput);
    });

    bench("createSyncStandardValidator(valibot)", () => {
      valibotSyncValidator(invalidInput);
    });
  });
});
