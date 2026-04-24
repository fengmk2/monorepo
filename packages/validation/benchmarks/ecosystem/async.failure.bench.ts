import * as v from "valibot";
import { bench, describe } from "vite-plus/test";

import { standardValidate } from "../../src/index.js";
import { invalidInput } from "./fixtures.js";
import {
  valibotAsyncValidator,
  valibotSchema,
  zodAsyncSchema,
  zodAsyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation ecosystem async failure", () => {
  describe("zod", () => {
    bench("native zod.safeParseAsync", async () => {
      await zodAsyncSchema.safeParseAsync(invalidInput);
    });

    bench("standardValidate(zod)", async () => {
      await standardValidate(zodAsyncSchema, invalidInput);
    });

    bench("createStandardValidator(zod)", async () => {
      await zodAsyncValidator(invalidInput);
    });
  });

  describe("valibot", () => {
    bench("native valibot.safeParseAsync", async () => {
      await v.safeParseAsync(valibotSchema, invalidInput);
    });

    bench("standardValidate(valibot)", async () => {
      await standardValidate(valibotSchema, invalidInput);
    });

    bench("createStandardValidator(valibot)", async () => {
      await valibotAsyncValidator(invalidInput);
    });
  });
});
