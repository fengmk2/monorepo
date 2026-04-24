import * as v from "valibot";
import { bench, describe } from "vite-plus/test";

import { standardValidate } from "../../src/index.js";
import { validInput } from "./fixtures.js";
import {
  valibotAsyncValidator,
  valibotSchema,
  zodAsyncSchema,
  zodAsyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation ecosystem async success", () => {
  describe("zod", () => {
    bench("native zod.safeParseAsync", async () => {
      await zodAsyncSchema.safeParseAsync(validInput);
    });

    bench("standardValidate(zod)", async () => {
      await standardValidate(zodAsyncSchema, validInput);
    });

    bench("createStandardValidator(zod)", async () => {
      await zodAsyncValidator(validInput);
    });
  });

  describe("valibot", () => {
    bench("native valibot.safeParseAsync", async () => {
      await v.safeParseAsync(valibotSchema, validInput);
    });

    bench("standardValidate(valibot)", async () => {
      await standardValidate(valibotSchema, validInput);
    });

    bench("createStandardValidator(valibot)", async () => {
      await valibotAsyncValidator(validInput);
    });
  });
});
