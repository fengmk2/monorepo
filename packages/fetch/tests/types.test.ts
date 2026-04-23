import { describe, expect, it } from "vite-plus/test";

import type { ExtendedRequestInit, FetchDefaults } from "../src/types.js";

describe("types", () => {
  it("models native request body input and json input as separate options", () => {
    const requestBody: ExtendedRequestInit = { body: "raw" };
    const jsonBody: ExtendedRequestInit = { json: { name: "Zap" } };
    const defaults: FetchDefaults = {
      baseURL: "",
      throwOnFetchError: true,
      throwOnValidationError: true,
    };

    // @ts-expect-error body and json are mutually exclusive.
    const invalid: ExtendedRequestInit = { body: "raw", json: { name: "Zap" } };

    expect(requestBody.body).toBe("raw");
    expect("json" in jsonBody).toBe(true);
    expect(defaults.throwOnFetchError).toBe(true);
    void invalid;
  });
});
