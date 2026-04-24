import { bench, describe } from "vite-plus/test";

import { standardValidateSync } from "../../src/index.js";
import { invalidInput } from "./fixtures.js";
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
  describe("zod", () => {
    bench("native | zod | standard-schema-validate", async () => {
      await nativeZodSyncStandardValidate(invalidInput);
    });

    bench("zap | zod | standardValidateSync", () => {
      standardValidateSync(nativeZodSyncSchema, invalidInput);
    });

    bench("zap | zod | createSyncStandardValidator", () => {
      zapZodSyncValidator(invalidInput);
    });
  });

  describe("arktype", () => {
    bench("native | arktype | standard-schema-validate", async () => {
      await nativeArktypeSyncStandardValidate(invalidInput);
    });

    bench("zap | arktype | standardValidateSync", () => {
      standardValidateSync(nativeArktypeSyncSchema, invalidInput);
    });

    bench("zap | arktype | createSyncStandardValidator", () => {
      zapArktypeSyncValidator(invalidInput);
    });
  });

  describe("valibot", () => {
    bench("native | valibot | standard-schema-validate", async () => {
      await nativeValibotSyncStandardValidate(invalidInput);
    });

    bench("zap | valibot | standardValidateSync", () => {
      standardValidateSync(nativeValibotSyncSchema, invalidInput);
    });

    bench("zap | valibot | createSyncStandardValidator", () => {
      zapValibotSyncValidator(invalidInput);
    });
  });
});
