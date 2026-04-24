import { bench, describe } from "vite-plus/test";

import { standardValidate } from "../../src/index.js";
import { inputTiers } from "./fixtures.js";
import {
  nativeValibotAsyncStandardValidate,
  nativeValibotSyncSchema,
  nativeZodAsyncSchema,
  nativeZodAsyncStandardValidate,
  zapValibotAsyncValidator,
  zapZodAsyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation | ecosystem | async | success", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native | zod | standard-schema-validate", async () => {
        await nativeZodAsyncStandardValidate(tier.valid);
      });

      bench("zap | zod | standardValidate", async () => {
        await standardValidate(nativeZodAsyncSchema, tier.valid);
      });

      bench("zap | zod | createStandardValidator", async () => {
        await zapZodAsyncValidator(tier.valid);
      });

      bench("native | valibot | standard-schema-validate", async () => {
        await nativeValibotAsyncStandardValidate(tier.valid);
      });

      bench("zap | valibot | standardValidate", async () => {
        await standardValidate(nativeValibotSyncSchema, tier.valid);
      });

      bench("zap | valibot | createStandardValidator", async () => {
        await zapValibotAsyncValidator(tier.valid);
      });
    });
  }
});
