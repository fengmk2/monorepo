/**
 * Retry runner base class and shared orchestration implementation.
 *
 * @module
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
    let attempt = 1;
    let lastError: TError | undefined;

    while (true) {
      try {
        const value = await execute(attempt);
        if (options.throwOnExhausted === false) {
          return { ok: true, value };
        }
        return value;
      } catch (error) {
        lastError = error as TError;
        const decision = this.next({
          attempt,
          error: error as TError,
        });

        if (!decision.shouldRetry) {
          const terminalError = this.onExhausted({
            attempts: attempt,
            error: lastError,
          });
          if (options.throwOnExhausted === false) {
            return {
              ok: false,
              error: terminalError,
              attempts: attempt,
            };
          }
          throw terminalError;
        }

        await sleep(decision.delayMs);
        attempt += 1;
      }
    }
  }
}

/**
 * Default delay implementation used by `run(...)` when no custom sleep function is provided.
 */
async function defaultSleep(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
