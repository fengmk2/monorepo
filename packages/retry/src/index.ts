/**
 * Retry runner base class and shared orchestration implementation.
 *
 * @module @zap-studio/retry
 */

import { RetryError } from "./error.js";
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
    if (options.throwOnExhausted === false) {
      return this.runResultMode(execute, sleep);
    }

    return this.runThrowMode(execute, sleep);
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
  ): Promise<T> {
    let attempt = 1;

    while (true) {
      try {
        return await execute(attempt);
      } catch (error) {
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
          await sleep(decision.delayMs);
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
  ): Promise<RetryRunResult<T>> {
    let attempt = 1;

    while (true) {
      try {
        const value = await execute(attempt);
        return { ok: true, value };
      } catch (error) {
        const typedError = error as TError;
        const decision = this.next({
          attempt,
          error: typedError,
        });

        if (!decision.shouldRetry) {
          const terminalError = this.onExhausted({
            attempts: attempt,
            error: typedError,
          });

          return {
            ok: false,
            error: terminalError,
            attempts: attempt,
          };
        }

        if (decision.delayMs > 0) {
          await sleep(decision.delayMs);
        }

        attempt += 1;
      }
    }
  }
}

/**
 * Default delay implementation used by `run(...)` when no custom sleep function is provided.
 *
 * Returns immediately when `delayMs` is non-positive.
 */
async function defaultSleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
