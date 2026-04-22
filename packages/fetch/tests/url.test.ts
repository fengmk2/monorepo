import { describe, expect, it } from "vite-plus/test";

import type { FetchDefaults } from "../src/types.js";
import { resolveRequestUrl } from "../src/url.js";

const DEFAULTS: FetchDefaults = {
  baseURL: "",
  throwOnFetchError: true,
  throwOnValidationError: true,
};

describe("resolveRequestUrl", () => {
  it("joins baseURL and relative resources", () => {
    expect(
      resolveRequestUrl("users", { ...DEFAULTS, baseURL: "https://api.example.com" }, undefined),
    ).toBe("https://api.example.com/users");
    expect(
      resolveRequestUrl("/users", { ...DEFAULTS, baseURL: "https://api.example.com/" }, undefined),
    ).toBe("https://api.example.com/users");
  });

  it("ignores baseURL for absolute resources", () => {
    expect(
      resolveRequestUrl(
        "https://other.example.com/users",
        {
          ...DEFAULTS,
          baseURL: "https://api.example.com",
        },
        undefined,
      ),
    ).toBe("https://other.example.com/users");
  });

  it("uses the base protocol for protocol-relative resources", () => {
    expect(
      resolveRequestUrl(
        "//other.example.com/users",
        {
          ...DEFAULTS,
          baseURL: "https://api.example.com",
        },
        undefined,
      ),
    ).toBe("https://other.example.com/users");
  });

  it("keeps relative output when there is no baseURL", () => {
    expect(resolveRequestUrl("/users", DEFAULTS, undefined)).toBe("/users");
    expect(resolveRequestUrl("users", DEFAULTS, undefined)).toBe("users");
  });

  it("merges default, resource, and request search params in that order", () => {
    const url = resolveRequestUrl(
      "users?page=2&from=resource#team",
      {
        ...DEFAULTS,
        baseURL: "https://api.example.com",
        searchParams: { page: "1", locale: "en" },
      },
      { page: "3", q: "zap" },
    );

    expect(url).toBe("https://api.example.com/users?page=3&locale=en&from=resource&q=zap#team");
  });

  it("accepts native URLSearchParams constructor input", () => {
    expect(
      resolveRequestUrl("users", { ...DEFAULTS, baseURL: "https://api.example.com" }, [
        ["a", "1"],
        ["b", "2"],
      ]),
    ).toBe("https://api.example.com/users?a=1&b=2");
    expect(
      resolveRequestUrl(
        "users",
        { ...DEFAULTS, baseURL: "https://api.example.com" },
        new URLSearchParams({ q: "test" }),
      ),
    ).toBe("https://api.example.com/users?q=test");
    expect(
      resolveRequestUrl("users", { ...DEFAULTS, baseURL: "https://api.example.com" }, "q=test"),
    ).toBe("https://api.example.com/users?q=test");
  });

  it("does not add a query string for empty search params", () => {
    expect(
      resolveRequestUrl("users#team", { ...DEFAULTS, baseURL: "https://api.example.com" }, {}),
    ).toBe("https://api.example.com/users#team");
  });

  it("preserves an explicit empty fragment", () => {
    expect(resolveRequestUrl("https://api.example.com/users#", DEFAULTS, undefined)).toBe(
      "https://api.example.com/users#",
    );
  });

  it("preserves an explicit empty fragment when adding search params", () => {
    expect(resolveRequestUrl("https://api.example.com/users#", DEFAULTS, { q: "zap" })).toBe(
      "https://api.example.com/users?q=zap#",
    );
  });
});
