import { describe, expect, it } from "vite-plus/test";

import { ExponentialBackoff } from "../src/exponential-backoff.js";

describe("ExponentialBackoff", () => {
  it("retries with base delay at first attempt", () => {
    const policy = new ExponentialBackoff({
      maxAttempts: 5,
      baseDelayMs: 100,
      maxDelayMs: 1_000,
    });

    expect(policy.next({ attempt: 1 })).toEqual({
      shouldRetry: true,
      delayMs: 100,
      reason: "retry",
    });
  });

  it("doubles delay on subsequent attempts", () => {
    const policy = new ExponentialBackoff({
      maxAttempts: 5,
      baseDelayMs: 100,
      maxDelayMs: 1_000,
    });

    expect(policy.next({ attempt: 2 }).delayMs).toBe(200);
    expect(policy.next({ attempt: 3 }).delayMs).toBe(400);
  });

  it("caps delay at maxDelayMs", () => {
    const policy = new ExponentialBackoff({
      maxAttempts: 10,
      baseDelayMs: 100,
      maxDelayMs: 250,
    });

    expect(policy.next({ attempt: 4 })).toEqual({
      shouldRetry: true,
      delayMs: 250,
      reason: "retry",
    });
  });

  it("stops retrying when max attempts is reached", () => {
    const policy = new ExponentialBackoff({
      maxAttempts: 3,
      baseDelayMs: 100,
      maxDelayMs: 1_000,
    });

    expect(policy.next({ attempt: 3 })).toEqual({
      shouldRetry: false,
      delayMs: 0,
      reason: "max-attempts-reached",
    });
  });

  it("treats attempt 0 as base delay", () => {
    const policy = new ExponentialBackoff({
      maxAttempts: 5,
      baseDelayMs: 100,
      maxDelayMs: 1_000,
    });

    expect(policy.next({ attempt: 0 }).delayMs).toBe(100);
  });
});
