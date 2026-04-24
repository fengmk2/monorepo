import { describe, expect, it, vi } from "vite-plus/test";

import { RetryError } from "../src/error.js";
import { __internal, BaseRetryPolicy } from "../src/index.js";
import type { RetryDecision, RetryDecisionInput, RetryExhaustedInput } from "../src/types.js";

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

class CustomTerminalPolicy extends BaseRetryPolicy<Error> {
  public next(): RetryDecision {
    return { shouldRetry: false, delayMs: 0, reason: "policy-declined" };
  }

  public override onExhausted(input: RetryExhaustedInput<Error>): RetryError {
    return new RetryError(`custom:${input.attempts}`, {
      attempts: input.attempts,
      lastError: input.error,
    });
  }
}

function expectFailureResult(result: unknown): { ok: false; attempts: number; error: RetryError } {
  expect(result).toMatchObject({ ok: false });
  if (!result || typeof result !== "object" || !("ok" in result) || result.ok !== false) {
    throw new Error("Expected failure result");
  }

  return result as { ok: false; attempts: number; error: RetryError };
}

describe("BaseRetryPolicy", () => {
  it("returns successful execution result without retrying", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    const result = await policy.run(execute);

    expect(result).toBe("ok");
    expect(execute).toHaveBeenCalledWith(1);
    expect(policy.seen).toEqual([]);
  });

  it("retries with provided sleep implementation until success", async () => {
    const policy = new SequencePolicy([
      { shouldRetry: true, delayMs: 10, reason: "retry" },
      { shouldRetry: true, delayMs: 20, reason: "retry" },
    ]);
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, { sleep });

    expect(result).toBe("ok");
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
    expect(execute).toHaveBeenNthCalledWith(3, 3);
    expect(sleep).toHaveBeenNthCalledWith(1, 10);
    expect(sleep).toHaveBeenNthCalledWith(2, 20);
    expect(policy.seen).toHaveLength(2);
  });

  it("throws RetryError from default onExhausted when retries stop", async () => {
    const policy = new SequencePolicy([
      { shouldRetry: true, delayMs: 0, reason: "retry" },
      { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" },
    ]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail-1"));
    execute.mockRejectedValueOnce(new Error("fail-2"));

    await expect(policy.run(execute)).rejects.toMatchObject({
      name: "RetryError",
      attempts: 2,
    });
  });

  it("returns terminal result instead of throwing when throwOnExhausted is false", async () => {
    const policy = new SequencePolicy([
      { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" },
    ]);
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("fail"));

    const result = await policy.run(execute, { throwOnExhausted: false });

    expect(result).toMatchObject({
      ok: false,
      attempts: 1,
    });
  });

  it("returns success result object when throwOnExhausted is false", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 0, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>().mockResolvedValue("ok");

    const result = await policy.run(execute, { throwOnExhausted: false });

    expect(result).toEqual({ ok: true, value: "ok" });
  });

  it("uses custom terminal error from overridden onExhausted", async () => {
    const policy = new CustomTerminalPolicy();
    const execute = vi
      .fn<(attempt: number) => Promise<string>>()
      .mockRejectedValue(new Error("nope"));

    await expect(policy.run(execute)).rejects.toThrow("custom:1");
  });

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
    expect(execute).not.toHaveBeenCalled();
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
    expect(failure.attempts).toBe(0);
    expect(failure.error.message).toBe("aborted-during-execute");
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

  it("uses default sleep when delay is positive and no custom sleep is provided", async () => {
    vi.useFakeTimers();
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 25, reason: "retry" }]);
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const runPromise = policy.run(execute);
    await vi.advanceTimersByTimeAsync(25);
    await expect(runPromise).resolves.toBe("ok");
    vi.useRealTimers();
  });

  it("normalizes non-serializable abort reasons to a fallback message", async () => {
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

  it("covers immediate abort check inside sleepWithAbortSignal", async () => {
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

  it("retries in non-throw mode with positive delay and custom sleep", async () => {
    const policy = new SequencePolicy([{ shouldRetry: true, delayMs: 15, reason: "retry" }]);
    const sleep = vi.fn<(delayMs: number) => Promise<void>>().mockResolvedValue();
    const execute = vi.fn<(attempt: number) => Promise<string>>();
    execute.mockRejectedValueOnce(new Error("fail"));
    execute.mockResolvedValueOnce("ok");

    const result = await policy.run(execute, {
      throwOnExhausted: false,
      sleep,
    });

    expect(result).toEqual({ ok: true, value: "ok" });
    expect(sleep).toHaveBeenCalledWith(15);
    expect(execute).toHaveBeenNthCalledWith(1, 1);
    expect(execute).toHaveBeenNthCalledWith(2, 2);
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

  it("covers defaultSleep guard through internal test export", async () => {
    await expect(__internal.defaultSleep(0)).resolves.toBeUndefined();
  });
});
