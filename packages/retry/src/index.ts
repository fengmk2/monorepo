/**
 * Retry runner base class and shared orchestration implementation.
 *
 * @module @zap-studio/retry
 */

import { sleepWithAbortSignal, throwIfAborted, toAbortError } from "./abort.js";
import { RetryError } from "./errors.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";

/**
 * Base class for implementing retry policies and running retry orchestration.
 *
 * Extend this class and implement {@link BaseRetryPolicy.next} to define retry
 * behavior, then call {@link BaseRetryPolicy.run} to execute operations with that
 * policy.
 */
export abstract class BaseRetryPolicy<TError = unknown, TData = unknown> implements RetryPolicy<
  TError,
  TData
> {
  /**
   * Returns the retry decision for a failed attempt.
   *
   * @param input - Attempt context used to compute retry behavior.
   * @throws Any error thrown by a concrete retry policy implementation.
   */
  public abstract next(input: RetryDecisionInput<TError, TData>): RetryDecision;

  /**
   * Builds the terminal error thrown or returned when retries are exhausted.
   *
   * Override this when you need custom terminal error types.
   *
   * @param input - Exhaustion context.
   * @returns `RetryError` by default.
   * @throws Any error thrown by an overriding policy implementation.
   */
  public onExhausted(input: RetryExhaustedInput<TError, TData>): RetryError {
    return new RetryError("Retry policy exhausted all attempts.", {
      attempts: input.attempts,
      lastError: input.error,
      lastData: input.data,
    });
  }

  /**
   * Runs retry orchestration in non-throw mode.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Runner settings with `throwOnExhausted: false`.
   * @returns A discriminated result union containing success value or terminal error.
   * @throws Any error thrown by `next`, `onExhausted`, or a custom `sleep`.
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions & { throwOnExhausted: false },
  ): Promise<RetryRunResult<T>>;

  /**
   * Runs retry orchestration and throws terminal error on exhaustion.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Optional runner settings.
   * @returns The successful execution value.
   * @throws {RetryError} When retries are exhausted and `onExhausted` returns the
   *   terminal retry error. The default implementation returns `RetryError` with the last
   *   execution failure available on `RetryError.lastError`.
   * @throws {AbortError} When `options.signal` is already aborted or aborts while retrying.
   * @throws Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
   *   function.
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options?: RetryRunOptions & { throwOnExhausted?: true },
  ): Promise<T>;

  /**
   * Runs retry orchestration in non-throw mode.
   *
   * When `throwOnExhausted` is `false`, returns a discriminated result union.
   *
   * @param execute - Async function to execute per attempt.
   * @param options - Runner settings.
   * @returns Success value or terminal result object based on option mode.
   * @throws Any error thrown by `next`, by `onExhausted`, or by a custom `sleep`
   *   function. When `throwOnExhausted` is `false`, exhaustion itself is returned
   *   as `{ ok: false }` instead of thrown.
   *   Abort errors are also returned as `{ ok: false }` in non-throw mode.
   *
   * @example
   * const result = await policy.run(doWork, { throwOnExhausted: false });
   * if (!result.ok) console.error(result.error);
   */
  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions = {},
  ): Promise<T | RetryRunResult<T>> {
    const sleep = options.sleep ?? defaultSleep;
    const signal = options.signal;
    if (options.throwOnExhausted === false) {
      return this.runResultMode(execute, sleep, signal);
    }

    return this.runThrowMode(execute, sleep, signal);
  }

  /**
   * Runs retry orchestration in throwing mode.
   *
   * This path is selected when `throwOnExhausted` is not `false`.
   *
   * @param execute - Async function to execute per attempt.
   * @param sleep - Delay function used between retry attempts.
   * @returns The successful execution value.
   * @throws {RetryError} Terminal error returned by `onExhausted(...)`.
   * @throws Any error thrown by `next`, by `onExhausted`, or by `sleep`.
   */
  private async runThrowMode<T>(
    execute: (attempt: number) => Promise<T>,
    sleep: (delayMs: number) => Promise<void>,
    signal?: AbortSignal,
  ): Promise<T> {
    let attempt = 1;

    while (true) {
      throwIfAborted(signal);

      try {
        return await execute(attempt);
      } catch (error) {
        throwIfAborted(signal);

        const typedError = error as TError;
        const decision = this.next({
          attempt,
          error: typedError,
        });

        if (!decision.shouldRetry) {
          throw this.onExhausted({
            attempts: attempt,
            error: typedError,
          });
        }

        if (decision.delayMs > 0) {
          if (signal) {
            await sleepWithAbortSignal(sleep, decision.delayMs, signal);
          } else {
            await sleep(decision.delayMs);
          }
        }

        attempt += 1;
      }
    }
  }

  /**
   * Runs retry orchestration in non-throw mode.
   *
   * This path is selected when `throwOnExhausted` is `false`.
   *
   * @param execute - Async function to execute per attempt.
   * @param sleep - Delay function used between retry attempts.
   * @returns A discriminated result union containing success value or terminal error.
   * @throws Any error thrown by `next`, by `onExhausted`, or by `sleep`.
   */
  private async runResultMode<T>(
    execute: (attempt: number) => Promise<T>,
    sleep: (delayMs: number) => Promise<void>,
    signal?: AbortSignal,
  ): Promise<RetryRunResult<T>> {
    let attempt = 1;

    while (true) {
      const earlyAbortResult = this.abortResult(signal, Math.max(0, attempt - 1));
      if (earlyAbortResult) return earlyAbortResult;

      const execution = await this.runAttempt(execute, attempt);
      if (execution.ok) {
        return { ok: true, value: execution.value };
      }

      const failure = await this.handleFailure({
        attempt,
        error: execution.error as TError,
        sleep,
        signal,
      });
      if (failure) return failure;

      attempt += 1;
    }
  }

  /**
   * Runs a single attempt in non-throw mode and normalizes success/failure shape.
   *
   * @param execute - Async operation callback.
   * @param attempt - Current attempt number.
   * @returns Success payload or captured execution error.
   */
  private async runAttempt<T>(
    execute: (attempt: number) => Promise<T>,
    attempt: number,
  ): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
    try {
      return {
        ok: true,
        value: await execute(attempt),
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  /**
   * Handles a failed attempt in non-throw mode.
   *
   * Applies abort handling, retry decision evaluation, terminal error conversion,
   * and optional retry delay waiting.
   *
   * @param params - Failure handling context.
   * @param params.attempt - Current attempt number.
   * @param params.error - Execution failure from the attempt.
   * @param params.sleep - Delay implementation used between retries.
   * @param params.signal - Optional cancellation signal.
   * @returns A terminal non-throw result when processing should stop, otherwise `undefined`.
   */
  private async handleFailure(params: {
    attempt: number;
    error: TError;
    sleep: (delayMs: number) => Promise<void>;
    signal: AbortSignal | undefined;
  }): Promise<RetryRunResult<never> | undefined> {
    const { attempt, error, sleep, signal } = params;
    const postExecuteAbortResult = this.abortResult(signal, attempt);
    if (postExecuteAbortResult) return postExecuteAbortResult;

    const decision = this.next({
      attempt,
      error,
    });

    if (!decision.shouldRetry) {
      const terminalError = this.onExhausted({
        attempts: attempt,
        error,
      });

      return {
        ok: false,
        error: terminalError,
        attempts: attempt,
      };
    }

    if (decision.delayMs > 0) {
      const sleepAbortResult = await this.waitForDelay(sleep, decision.delayMs, signal, attempt);
      if (sleepAbortResult) return sleepAbortResult;
    }

    return;
  }

  /**
   * Builds a non-throw abort result when the signal is aborted.
   *
   * @param signal - Optional cancellation signal.
   * @param attempts - Attempt count to report in terminal result.
   * @returns Abort result payload or `undefined` when not aborted.
   */
  private abortResult(
    signal: AbortSignal | undefined,
    attempts: number,
  ): RetryRunResult<never> | undefined {
    if (!signal?.aborted) {
      return;
    }

    return {
      ok: false,
      error: toRetryError(signal.reason, attempts),
      attempts,
    };
  }

  /**
   * Waits for retry delay in non-throw mode and maps aborts to terminal results.
   *
   * @param sleep - Delay function implementation.
   * @param delayMs - Delay duration in milliseconds.
   * @param signal - Optional cancellation signal.
   * @param attempts - Attempt count to report if aborted during wait.
   * @returns Abort result when canceled during wait, otherwise `undefined`.
   * @throws Any non-abort error thrown by delay execution.
   */
  private async waitForDelay(
    sleep: (delayMs: number) => Promise<void>,
    delayMs: number,
    signal: AbortSignal | undefined,
    attempts: number,
  ): Promise<RetryRunResult<never> | undefined> {
    if (!signal) {
      await sleep(delayMs);
      return;
    }

    try {
      await sleepWithAbortSignal(sleep, delayMs, signal);
      return;
    } catch (error) {
      const abortResult = this.abortResult(signal, attempts);
      if (abortResult) {
        return abortResult;
      }
      throw error;
    }
  }
}

/**
 * Default delay implementation used by `run(...)` when no custom sleep function is provided.
 *
 * Returns immediately when `delayMs` is non-positive.
 */
export async function defaultSleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Converts an abort reason into a `RetryError` for non-throw runner mode.
 *
 * @param reason - Abort reason from `AbortSignal.reason`.
 * @returns Retry terminal error value.
 */
function toRetryError(reason: unknown, attempts: number): RetryError {
  const abortError = toAbortError(reason);
  return new RetryError(abortError.message, {
    attempts,
    lastError: abortError,
  });
}
