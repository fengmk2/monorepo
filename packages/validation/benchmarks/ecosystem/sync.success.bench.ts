import { bench, describe } from "vite-plus/test";

import { standardValidateSync } from "../../src/index.js";
import { validInput } from "./fixtures.js";
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
  describe("zod", () => {
    bench("native | zod | standard-schema-validate", async () => {
      await nativeZodSyncStandardValidate(validInput);
    });

    bench("zap | zod | standardValidateSync", () => {
      standardValidateSync(nativeZodSyncSchema, validInput);
    });

    bench("zap | zod | createSyncStandardValidator", () => {
      zapZodSyncValidator(validInput);
    });
  });

  describe("arktype", () => {
    bench("native | arktype | standard-schema-validate", async () => {
      await nativeArktypeSyncStandardValidate(validInput);
    });

    bench("zap | arktype | standardValidateSync", () => {
      standardValidateSync(nativeArktypeSyncSchema, validInput);
    });

    bench("zap | arktype | createSyncStandardValidator", () => {
      zapArktypeSyncValidator(validInput);
    });
  });

  describe("valibot", () => {
    bench("native | valibot | standard-schema-validate", async () => {
      await nativeValibotSyncStandardValidate(validInput);
    });

    bench("zap | valibot | standardValidateSync", () => {
      standardValidateSync(nativeValibotSyncSchema, validInput);
    });

    bench("zap | valibot | createSyncStandardValidator", () => {
      zapValibotSyncValidator(validInput);
    });
  });
});
