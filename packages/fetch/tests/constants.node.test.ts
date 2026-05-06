import { describe, expect, it } from "vitest";

import { GLOBAL_DEFAULTS } from "../src/constants.js";

describe("GLOBAL_DEFAULTS", () => {
  it("uses fetch-compatible defaults", () => {
    expect(GLOBAL_DEFAULTS).toEqual({
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    });
  });
});
