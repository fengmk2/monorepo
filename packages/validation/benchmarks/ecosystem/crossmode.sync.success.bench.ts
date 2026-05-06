import * as v from "valibot";
import { bench, describe } from "vitest";

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

describe("@zap-studio/validation | ecosystem | crossmode | sync | success", () => {
  for (const tier of inputTiers) {
    describe(`tier:${tier.name}`, () => {
      bench("native-api | zod | safeParse", () => {
        nativeZodSyncSchema.safeParse(tier.valid);
      });
      bench("standard-schema-native | zod | validate", async () => {
        await nativeZodSyncStandardValidate(tier.valid);
      });
      bench("zap | zod | standardValidateSync", () => {
        standardValidateSync(nativeZodSyncSchema, tier.valid);
      });
      bench("zap | zod | createSyncStandardValidator", () => {
        zapZodSyncValidator(tier.valid);
      });

      bench("native-api | arktype | call", () => {
        nativeArktypeSyncSchema(tier.valid);
      });
      bench("standard-schema-native | arktype | validate", async () => {
        await nativeArktypeSyncStandardValidate(tier.valid);
      });
      bench("zap | arktype | standardValidateSync", () => {
        standardValidateSync(nativeArktypeSyncSchema, tier.valid);
      });
      bench("zap | arktype | createSyncStandardValidator", () => {
        zapArktypeSyncValidator(tier.valid);
      });

      bench("native-api | valibot | safeParse", () => {
        v.safeParse(nativeValibotSyncSchema, tier.valid);
      });
      bench("standard-schema-native | valibot | validate", async () => {
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
