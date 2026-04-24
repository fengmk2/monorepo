import { bench, describe } from "vite-plus/test";

import { standardValidateSync } from "../../src/index.js";
import { inputTiers } from "./fixtures.js";
import {
  nativeArktypeSyncSchema,
  nativeArktypeSyncStandardValidate,
  nativeValibotSyncSchema,
  nativeValibotSyncStandardValidate,
  nativeZodSyncSchema,
  nativeZodSyncStandardValidate,
  zapArktypeSyncValidator,
  zapValibotSyncValidator,
  zapZodSyncValidator,
} from "./schemas.js";

describe("@zap-studio/validation | ecosystem | sync | failure", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native | zod | standard-schema-validate", async () => {
        await nativeZodSyncStandardValidate(tier.invalid);
      });

      bench("zap | zod | standardValidateSync", () => {
        standardValidateSync(nativeZodSyncSchema, tier.invalid);
      });

      bench("zap | zod | createSyncStandardValidator", () => {
        zapZodSyncValidator(tier.invalid);
      });

      bench("native | arktype | standard-schema-validate", async () => {
        await nativeArktypeSyncStandardValidate(tier.invalid);
      });

      bench("zap | arktype | standardValidateSync", () => {
        standardValidateSync(nativeArktypeSyncSchema, tier.invalid);
      });

      bench("zap | arktype | createSyncStandardValidator", () => {
        zapArktypeSyncValidator(tier.invalid);
      });

      bench("native | valibot | standard-schema-validate", async () => {
        await nativeValibotSyncStandardValidate(tier.invalid);
      });

      bench("zap | valibot | standardValidateSync", () => {
        standardValidateSync(nativeValibotSyncSchema, tier.invalid);
      });

      bench("zap | valibot | createSyncStandardValidator", () => {
        zapValibotSyncValidator(tier.invalid);
      });
    });
  }
});
