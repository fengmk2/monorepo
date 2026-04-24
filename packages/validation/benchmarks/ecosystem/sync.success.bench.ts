import * as v from "valibot";
import { bench, describe } from "vite-plus/test";

import { standardValidateSync } from "../../src/index.js";
import { validInput } from "./fixtures.js";
import {
  arktypeSchema,
  arktypeSyncValidator,
  valibotSchema,
  valibotSyncValidator,
  zodSchema,
  zodSyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation ecosystem sync success", () => {
  describe("zod", () => {
    bench("native zod.safeParse", () => {
      zodSchema.safeParse(validInput);
    });

    bench("standardValidateSync(zod)", () => {
      standardValidateSync(zodSchema, validInput);
    });

    bench("createSyncStandardValidator(zod)", () => {
      zodSyncValidator(validInput);
    });
  });

  describe("arktype", () => {
    bench("native arktype(schema)", () => {
      arktypeSchema(validInput);
    });

    bench("standardValidateSync(arktype)", () => {
      standardValidateSync(arktypeSchema, validInput);
    });

    bench("createSyncStandardValidator(arktype)", () => {
      arktypeSyncValidator(validInput);
    });
  });

  describe("valibot", () => {
    bench("native valibot.safeParse", () => {
      v.safeParse(valibotSchema, validInput);
    });

    bench("standardValidateSync(valibot)", () => {
      standardValidateSync(valibotSchema, validInput);
    });

    bench("createSyncStandardValidator(valibot)", () => {
      valibotSyncValidator(validInput);
    });
  });
});
