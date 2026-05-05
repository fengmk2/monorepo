import { describe, expect, it } from "vitest";

import { RetryError } from "../src/errors.js";
import type {
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "../src/types.js";

describe("types", () => {
  it("supports generic RetryPolicy contracts", () => {
    const policy: RetryPolicy<TypeError, { status: number }> = {
      next: (input: RetryDecisionInput<TypeError, { status: number }>) => ({
        shouldRetry: input.attempt < 3,
        delayMs: 100,
        reason: "retry",
      }),
      onExhausted: (input: RetryExhaustedInput<TypeError, { status: number }>) =>
        new RetryError("exhausted", {
          attempts: input.attempts,
          lastError: input.error,
          lastData: input.data,
        }),
    };

    const decision = policy.next({
      attempt: 1,
      data: { status: 500 },
      error: new TypeError("network"),
    });
    const error = policy.onExhausted({
      attempts: 3,
      data: { status: 500 },
      error: new TypeError("network"),
    });

    expect(decision.shouldRetry).toBe(true);
    expect(decision.delayMs).toBe(100);
    expect(error).toBeInstanceOf(RetryError);
  });

  it("accepts empty run options", () => {
    const options: RetryRunOptions = { throwOnExhausted: false };
    const result: RetryRunResult<string> = {
      ok: true,
      value: "ok",
    };

    expect(options).toEqual({ throwOnExhausted: false });
    expect(result).toEqual({ ok: true, value: "ok" });
  });
});
