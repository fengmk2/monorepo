/**
 * Public type contracts for retry policies and runner behavior.
 *
 * @module
 */

import type { RetryError } from "./error.js";

/**
 * Retry policy contract used by `BaseRetryPolicy`.
 *
 * @example
 * const policy: RetryPolicy = {
 *   next: ({ attempt }) => ({ shouldRetry: attempt < 3, delayMs: 100 }),
 *   onExhausted: ({ attempts }) => new RetryError("done", { attempts }),
 * };
 */
export interface RetryPolicy<TError = unknown, TData = unknown> {
  next(input: RetryDecisionInput<TError, TData>): RetryDecision;
  onExhausted(input: RetryExhaustedInput<TError, TData>): RetryError;
}

/**
 * Decision returned by a retry policy for a specific attempt.
 */
export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly delayMs: number;
  readonly reason?: "retry" | "max-attempts-reached" | "policy-declined";
}

/**
 * Input passed to `RetryPolicy.next(...)` for each failed attempt.
 */
export interface RetryDecisionInput<TError = unknown, TData = unknown> {
  readonly attempt: number;
  readonly maxAttempts?: number | undefined;
  readonly error?: TError;
  readonly data?: TData;
}

/**
 * Input passed to `RetryPolicy.onExhausted(...)` when retries stop.
 */
export interface RetryExhaustedInput<TError = unknown, TData = unknown> {
  readonly attempts: number;
  readonly error?: TError;
  readonly data?: TData;
}

/**
 * Options for `BaseRetryPolicy.run(...)`.
 */
export interface RetryRunOptions {
  readonly sleep?: ((delayMs: number) => Promise<void>) | undefined;
  readonly throwOnExhausted?: boolean | undefined;
}

/**
 * Result union returned by non-throw runner mode.
 */
export type RetryRunResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: RetryError;
      attempts: number;
    };
