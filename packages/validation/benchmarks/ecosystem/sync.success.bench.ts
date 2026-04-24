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

describe("@zap-studio/validation | ecosystem | sync | success", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native | zod | standard-schema-validate", async () => {
        await nativeZodSyncStandardValidate(tier.valid);
      });

      bench("zap | zod | standardValidateSync", () => {
        standardValidateSync(nativeZodSyncSchema, tier.valid);
      });

      bench("zap | zod | createSyncStandardValidator", () => {
        zapZodSyncValidator(tier.valid);
      });

      bench("native | arktype | standard-schema-validate", async () => {
        await nativeArktypeSyncStandardValidate(tier.valid);
      });

      bench("zap | arktype | standardValidateSync", () => {
        standardValidateSync(nativeArktypeSyncSchema, tier.valid);
      });

      bench("zap | arktype | createSyncStandardValidator", () => {
        zapArktypeSyncValidator(tier.valid);
      });

      bench("native | valibot | standard-schema-validate", async () => {
        await nativeValibotSyncStandardValidate(tier.valid);
      });

      bench("zap | valibot | standardValidateSync", () => {
        standardValidateSync(nativeValibotSyncSchema, tier.valid);
      });

      bench("zap | valibot | createSyncStandardValidator", () => {
        zapValibotSyncValidator(tier.valid);
      });
    });
  }
});
