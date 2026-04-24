/**
 * Exponential backoff retry strategy.
 *
 * @module @zap-studio/retry/exponential-backoff
 */

import { BaseRetryPolicy } from "./index.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

/**
 * Configuration for `ExponentialBackoff`.
 */
export interface ExponentialBackoffOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

/**
 * Retries with exponential delay growth up to a max cap.
 *
 * @example
 * const policy = new ExponentialBackoff({
 *   maxAttempts: 5,
 *   baseDelayMs: 100,
 *   maxDelayMs: 2_000,
 * });
 */
export class ExponentialBackoff extends BaseRetryPolicy {
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  /**
   * Creates an exponential backoff retry policy.
   */
  constructor(options: ExponentialBackoffOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.baseDelayMs = options.baseDelayMs;
    this.maxDelayMs = options.maxDelayMs;
  }

  /**
   * Computes retry decision for the current attempt.
   */
  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }

    const exponent = Math.max(0, input.attempt - 1);
    const delayMs = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** exponent);

    return { shouldRetry: true, delayMs, reason: "retry" };
  }
}
