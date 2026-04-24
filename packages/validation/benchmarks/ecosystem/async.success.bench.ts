import { bench, describe } from "vite-plus/test";

import { standardValidate } from "../../src/index.js";
import { validInput } from "./fixtures.js";
import {
  nativeValibotAsyncStandardValidate,
  nativeValibotSyncSchema,
  nativeZodAsyncSchema,
  nativeZodAsyncStandardValidate,
  zapValibotAsyncValidator,
  zapZodAsyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation | ecosystem | async | success", () => {
  describe("zod", () => {
    bench("native | zod | standard-schema-validate", async () => {
      await nativeZodAsyncStandardValidate(validInput);
    });

    bench("zap | zod | standardValidate", async () => {
      await standardValidate(nativeZodAsyncSchema, validInput);
    });

    bench("zap | zod | createStandardValidator", async () => {
      await zapZodAsyncValidator(validInput);
    });
  });

  describe("valibot", () => {
    bench("native | valibot | standard-schema-validate", async () => {
      await nativeValibotAsyncStandardValidate(validInput);
    });

    bench("zap | valibot | standardValidate", async () => {
      await standardValidate(nativeValibotSyncSchema, validInput);
    });

    bench("zap | valibot | createStandardValidator", async () => {
      await zapValibotAsyncValidator(validInput);
    });
  });
});
