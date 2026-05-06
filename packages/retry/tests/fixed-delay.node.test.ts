import { describe, expect, it } from "vitest";

import { FixedDelay } from "../src/fixed-delay.js";

describe("FixedDelay", () => {
  it("retries with constant delay before max attempts", () => {
    const policy = new FixedDelay({
      maxAttempts: 4,
      delayMs: 300,
    });

    expect(policy.next({ attempt: 1 })).toEqual({
      shouldRetry: true,
      delayMs: 300,
      reason: "retry",
    });
    expect(policy.next({ attempt: 3 }).delayMs).toBe(300);
  });

  it("stops retrying when max attempts is reached", () => {
    const policy = new FixedDelay({
      maxAttempts: 2,
      delayMs: 300,
    });

    expect(policy.next({ attempt: 2 })).toEqual({
      shouldRetry: false,
      delayMs: 0,
      reason: "max-attempts-reached",
    });
  });
});
