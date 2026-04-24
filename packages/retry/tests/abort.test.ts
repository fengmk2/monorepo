import { describe, expect, it, vi } from "vite-plus/test";

import { AbortError, RetryError } from "../src/errors.js";
import { BaseRetryPolicy } from "../src/index.js";
import type { RetryDecision, RetryDecisionInput, RetryRunResult } from "../src/types.js";

class SequencePolicy extends BaseRetryPolicy<Error, string> {
  public readonly seen: RetryDecisionInput<Error, string>[] = [];
  private index = 0;

  constructor(private readonly decisions: RetryDecision[]) {
    super();
  }

  public next(input: RetryDecisionInput<Error, string>): RetryDecision {
    this.seen.push(input);
    const decision = this.decisions[Math.min(this.index, this.decisions.length - 1)];
    this.index += 1;
    return decision ?? { shouldRetry: false, delayMs: 0, reason: "policy-declined" };
  }
}

function expectFailureResult(result: RetryRunResult<string>): {
  ok: false;
  attempts: number;
  error: AbortError | RetryError;
} {
  expect(result).toMatchObject({ ok: false });
  if (result.ok) {
    throw new Error("Expected failure result");
  }

  return result;
}

describe("BaseRetryPolicy abort behavior", () => {
  it("throws immediately when signal is already aborted in throw mode", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort(new Error("aborted-before-start"));

    await expect(policy.run(execute, { signal: controller.signal })).rejects.toThrow(
      "aborted-before-start",
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns terminal result when signal is already aborted in non-throw mode", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const controller = new AbortController();
    controller.abort("aborted-before-start");

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("aborted-before-start");
    expect(failure.error).toBeInstanceOf(RetryError);
    if (!(failure.error instanceof RetryError)) {
      throw new Error("Expected RetryError wrapper in non-throw mode");
    }
    expect(failure.error.lastError).toBeInstanceOf(AbortError);
    expect(execute).not.toHaveBeenCalled();
  });

  it("preserves AbortError reason instance in non-throw abort result", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const abortError = new AbortError("already-aborted");

    const fakeSignal = {
      aborted: true,
      reason: abortError,
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    if (!(failure.error instanceof RetryError)) {
      throw new Error("Expected RetryError wrapper in non-throw mode");
    }
    expect(failure.error.lastError).toBe(abortError);
  });

  it("returns terminal result when signal is aborted during execute in non-throw mode", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const controller = new AbortController();

    const execute = vi.fn<(attempt: number) => Promise<string>>().mockImplementation(async () => {
      controller.abort("aborted-during-execute");
      throw new Error("failed");
    });

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-during-execute");
    expect(failure.error).toBeInstanceOf(RetryError);
    if (!(failure.error instanceof RetryError)) {
      throw new Error("Expected RetryError wrapper in non-throw mode");
    }
    expect(failure.error.lastError).toBeInstanceOf(AbortError);
  });

  it("throws when signal aborts while waiting between retries", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 50, reason: "retry" }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValueOnce(new Error("fail-once"));

    const runPromise = policy.run(execute, { signal: controller.signal });
    await Promise.resolve();
    controller.abort(new Error("aborted-during-sleep"));

    await expect(runPromise).rejects.toThrow("aborted-during-sleep");
  });

  it("normalizes non-serializable abort reasons to fallback message", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");
    const circular: { self?: unknown } = {};
    circular.self = circular;
    const controller = new AbortController();
    controller.abort(circular);

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
  });

  it("covers immediate abort check during abort-aware sleep", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    let readCount = 0;
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      reason: "abort-immediate-sleep-check",
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    await expect(policy.run(execute, { signal: fakeSignal })).rejects.toThrow(
      "abort-immediate-sleep-check",
    );
  });

  it("handles undefined abort reason fallback message", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    const fakeSignal = {
      aborted: true,
      reason: undefined,
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("Retry aborted.");
  });

  it("retries in non-throw mode with signal and positive delay", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const controller = new AbortController();
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      signal: controller.signal,
      sleep,
      throwOnExhausted: false,
    });

    expect(result).toEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(10);
  });

  it("retries in non-throw mode with signal and zero delay", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const controller = new AbortController();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    expect(result).toEqual({ ok: true, value: "ok" });
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
  });

  it("handles sync sleep failure with signal before listener registration", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockImplementation(() => {
      throw new Error("sleep-sync-fail");
    });

    await expect(policy.run(execute, { signal: controller.signal, sleep })).rejects.toThrow(
      "sleep-sync-fail",
    );
  });

  it("returns non-throw failure result when signal aborts during backoff sleep", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 50, reason: "retry" }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const runPromise = policy.run(execute, {
      signal: controller.signal,
      throwOnExhausted: false,
    });

    await Promise.resolve();
    controller.abort("aborted-in-backoff");

    const result = await runPromise;
    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-in-backoff");
    expect(failure.error).toBeInstanceOf(RetryError);
    if (!(failure.error instanceof RetryError)) {
      throw new Error("Expected RetryError wrapper in non-throw mode");
    }
    expect(failure.error.lastError).toBeInstanceOf(AbortError);
  });

  it("rethrows non-abort sleep errors in non-throw mode", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const controller = new AbortController();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi
      .fn<(delayMs: number) => Promise<void>>()
      .mockRejectedValue(new Error("sleep-fail"));

    await expect(
      policy.run(execute, {
        signal: controller.signal,
        sleep,
        throwOnExhausted: false,
      }),
    ).rejects.toThrow("sleep-fail");
  });

  it("returns abort result from waitForDelay catch path in non-throw mode", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 10, reason: "retry" }]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();

    let readCount = 0;
    const fakeSignal = {
      get aborted() {
        readCount += 1;
        return readCount >= 3;
      },
      reason: "aborted-from-wait-catch",
      addEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
      removeEventListener:
        vi.fn<(type: string, listener: EventListenerOrEventListenerObject) => void>(),
    } as unknown as AbortSignal;

    const result = await policy.run(execute, {
      signal: fakeSignal,
      sleep,
      throwOnExhausted: false,
    });

    const failure = expectFailureResult(result);
    expect(failure.attempts).toBe(1);
    expect(failure.error.message).toBe("aborted-from-wait-catch");
  });
});
