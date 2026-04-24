import * as v from "valibot";
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

describe("@zap-studio/validation | ecosystem | crossmode | sync | failure", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native-api | zod | safeParse", () => {
        nativeZodSyncSchema.safeParse(tier.invalid);
      });
      bench("standard-schema-native | zod | validate", async () => {
        await nativeZodSyncStandardValidate(tier.invalid);
      });
      bench("zap | zod | standardValidateSync", () => {
        standardValidateSync(nativeZodSyncSchema, tier.invalid);
      });
      bench("zap | zod | createSyncStandardValidator", () => {
        zapZodSyncValidator(tier.invalid);
      });

      bench("native-api | arktype | call", () => {
        nativeArktypeSyncSchema(tier.invalid);
      });
      bench("standard-schema-native | arktype | validate", async () => {
        await nativeArktypeSyncStandardValidate(tier.invalid);
      });
      bench("zap | arktype | standardValidateSync", () => {
        standardValidateSync(nativeArktypeSyncSchema, tier.invalid);
      });
      bench("zap | arktype | createSyncStandardValidator", () => {
        zapArktypeSyncValidator(tier.invalid);
      });

      bench("native-api | valibot | safeParse", () => {
        v.safeParse(nativeValibotSyncSchema, tier.invalid);
      });
      bench("standard-schema-native | valibot | validate", async () => {
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
