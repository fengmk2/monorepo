import { describe, expect, it } from "vite-plus/test";

import { RetryError } from "../src/error.js";

describe("RetryError", () => {
  it("stores message and context fields", () => {
    const lastError = new Error("boom");
    const error = new RetryError("Retry exhausted", {
      attempts: 3,
      lastError,
      lastData: { id: 1 },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RetryError");
    expect(error.message).toBe("Retry exhausted");
    expect(error.attempts).toBe(3);
    expect(error.lastError).toBe(lastError);
    expect(error.lastData).toEqual({ id: 1 });
  });

  it("supports missing optional context values", () => {
    const error = new RetryError("Retry exhausted", { attempts: 1 });

    expect(error.lastError).toBeUndefined();
    expect(error.lastData).toBeUndefined();
  });
});
