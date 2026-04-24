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
   * @throws {Error} When `options.signal` is already aborted or aborts while retrying.
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
      if (signal?.aborted) {
        const attempts = Math.max(0, attempt - 1);
        return {
          ok: false,
          error: toRetryError(signal.reason, attempts),
          attempts,
        };
      }

      try {
        const value = await execute(attempt);
        return { ok: true, value };
      } catch (error) {
        if (signal?.aborted) {
          const attempts = Math.max(0, attempt - 1);
          return {
            ok: false,
            error: toRetryError(signal.reason, attempts),
            attempts,
          };
        }

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
          if (signal) {
            try {
              await sleepWithAbortSignal(sleep, decision.delayMs, signal);
            } catch (error) {
              if (signal.aborted) {
                return {
                  ok: false,
                  error: toRetryError(signal.reason, attempt),
                  attempts: attempt,
                };
              }
              throw error;
            }
          } else {
            await sleep(decision.delayMs);
          }
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
export async function defaultSleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

/**
 * Throws an abort error when the provided signal is already aborted.
 *
 * @param signal - Optional cancellation signal.
 * @throws {Error} Abort reason converted to an `Error`.
 */
function throwIfAborted(signal?: AbortSignal): void {
  if (!signal?.aborted) {
    return;
  }

  throw toAbortError(signal.reason);
}

/**
 * Normalizes an abort reason value into an `Error` instance.
 *
 * @param reason - Abort reason from `AbortSignal.reason`.
 * @returns Normalized error instance.
 */
function toAbortError(reason: unknown): Error {
  if (reason instanceof Error) {
    return reason;
  }

  if (typeof reason === "string" && reason.length > 0) {
    return new Error(reason);
  }

  if (reason === undefined) {
    return new Error("Retry aborted.");
  }

  try {
    return new Error(`Retry aborted: ${JSON.stringify(reason)}`);
  } catch {
    return new Error("Retry aborted.");
  }
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

/**
 * Awaits delay sleep while also observing cancellation via `AbortSignal`.
 *
 * @param sleep - Delay function.
 * @param delayMs - Delay duration in milliseconds.
 * @param signal - Cancellation signal.
 * @throws {Error} Abort reason converted to an `Error` when canceled.
 */
async function sleepWithAbortSignal(
  sleep: (delayMs: number) => Promise<void>,
  delayMs: number,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) {
    throw toAbortError(signal.reason);
  }

  let onAbort: (() => void) | undefined;

  try {
    await Promise.race([
      sleep(delayMs),
      new Promise<never>((_, reject) => {
        onAbort = (): void => {
          reject(toAbortError(signal.reason));
        };

        signal.addEventListener("abort", onAbort, { once: true });
      }),
    ]);
  } finally {
    if (onAbort) {
      signal.removeEventListener("abort", onAbort);
    }
  }
}
