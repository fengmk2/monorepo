import * as v from "valibot";
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

describe("@zap-studio/validation | ecosystem | crossmode | async | failure", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native-api | zod | safeParseAsync", async () => {
        await nativeZodAsyncSchema.safeParseAsync(tier.invalid);
      });
      bench("standard-schema-native | zod | validate", async () => {
        await nativeZodAsyncStandardValidate(tier.invalid);
      });
      bench("zap | zod | standardValidate", async () => {
        await standardValidate(nativeZodAsyncSchema, tier.invalid);
      });
      bench("zap | zod | createStandardValidator", async () => {
        await zapZodAsyncValidator(tier.invalid);
      });

      bench("native-api | valibot | safeParseAsync", async () => {
        await v.safeParseAsync(nativeValibotSyncSchema, tier.invalid);
      });
      bench("standard-schema-native | valibot | validate", async () => {
        await nativeValibotAsyncStandardValidate(tier.invalid);
      });
      bench("zap | valibot | standardValidate", async () => {
        await standardValidate(nativeValibotSyncSchema, tier.invalid);
      });
      bench("zap | valibot | createStandardValidator", async () => {
        await zapValibotAsyncValidator(tier.invalid);
      });
    });
  }
});
