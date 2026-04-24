import type { StandardSchemaV1 } from "@standard-schema/spec";
import { bench, describe } from "vite-plus/test";

import {
  createStandardValidator,
  createSyncStandardValidator,
  standardValidate,
  standardValidateSync,
} from "../src/index.js";

const syncSchema: StandardSchemaV1<unknown, string> = {
  "~standard": {
    version: 1,
    vendor: "benchmark",
    validate: (input: unknown) => ({
      value: String(input),
    }),
  },
};

const asyncSchema: StandardSchemaV1<unknown, string> = {
  "~standard": {
    version: 1,
    vendor: "benchmark",
    validate: async (input: unknown) => ({
      value: String(input),
    }),
  },
};

const input = { id: 42, name: "Ada" };

const reusableAsync = createStandardValidator(syncSchema);
const reusableSync = createSyncStandardValidator(syncSchema);

describe("@zap-studio/validation", () => {
  bench("standardValidate (sync schema)", async () => {
    await standardValidate(syncSchema, input);
  });

  bench("standardValidate (async schema)", async () => {
    await standardValidate(asyncSchema, input);
  });

  bench("createStandardValidator (reused)", async () => {
    await reusableAsync(input);
  });

  bench("standardValidateSync", () => {
    standardValidateSync(syncSchema, input);
  });

  bench("createSyncStandardValidator (reused)", () => {
    reusableSync(input);
  });
});
