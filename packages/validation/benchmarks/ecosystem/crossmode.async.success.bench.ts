import * as v from "valibot";
import { bench, describe } from "vitest";

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

describe("@zap-studio/validation | ecosystem | crossmode | async | success", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native-api | zod | safeParseAsync", async () => {
        await nativeZodAsyncSchema.safeParseAsync(tier.valid);
      });
      bench("standard-schema-native | zod | validate", async () => {
        await nativeZodAsyncStandardValidate(tier.valid);
      });
      bench("zap | zod | standardValidate", async () => {
        await standardValidate(nativeZodAsyncSchema, tier.valid);
      });
      bench("zap | zod | createStandardValidator", async () => {
        await zapZodAsyncValidator(tier.valid);
      });

      bench("native-api | valibot | safeParseAsync", async () => {
        await v.safeParseAsync(nativeValibotSyncSchema, tier.valid);
      });
      bench("standard-schema-native | valibot | validate", async () => {
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
