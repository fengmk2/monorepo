import { describe, expect, it } from "vitest";

import { RetryError } from "../src/errors.js";
import { SequencePolicy } from "./sequence-policy.js";

describe("BaseRetryPolicy", () => {
  it("creates RetryError with data from default onExhausted", () => {
    const policy = new SequencePolicy([
      { shouldRetry: false, delayMs: 0, reason: "policy-declined" },
    ]);

    const error = policy.onExhausted({
      attempts: 3,
      error: new Error("boom"),
      data: "payload",
    });

    expect(error).toBeInstanceOf(RetryError);
    expect(error.lastData).toBe("payload");
    expect(error.attempts).toBe(3);
  });
});
