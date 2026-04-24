import { bench, describe } from "vite-plus/test";

import { standardValidate } from "../../src/index.js";
import { invalidInput } from "./fixtures.js";
import {
  nativeValibotAsyncStandardValidate,
  nativeValibotSyncSchema,
  nativeZodAsyncSchema,
  nativeZodAsyncStandardValidate,
  zapValibotAsyncValidator,
  zapZodAsyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation | ecosystem | async | failure", () => {
  describe("zod", () => {
    bench("native | zod | standard-schema-validate", async () => {
      await nativeZodAsyncStandardValidate(invalidInput);
    });

    bench("zap | zod | standardValidate", async () => {
      await standardValidate(nativeZodAsyncSchema, invalidInput);
    });

    bench("zap | zod | createStandardValidator", async () => {
      await zapZodAsyncValidator(invalidInput);
    });
  });

  describe("valibot", () => {
    bench("native | valibot | standard-schema-validate", async () => {
      await nativeValibotAsyncStandardValidate(invalidInput);
    });

    bench("zap | valibot | standardValidate", async () => {
      await standardValidate(nativeValibotSyncSchema, invalidInput);
    });

    bench("zap | valibot | createStandardValidator", async () => {
      await zapValibotAsyncValidator(invalidInput);
    });
  });
});
