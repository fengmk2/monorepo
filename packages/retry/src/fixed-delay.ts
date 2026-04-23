/**
 * Fixed-delay retry strategy.
 *
 * @module
 */

import { BaseRetryPolicy } from "./index.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

/**
 * Configuration for `FixedDelay`.
 */
export interface FixedDelayOptions {
  maxAttempts: number;
  delayMs: number;
}

/**
 * Retries with a constant delay between attempts.
 *
 * @example
 * const policy = new FixedDelay({
 *   maxAttempts: 3,
 *   delayMs: 250,
 * });
 */
export class FixedDelay extends BaseRetryPolicy {
  private readonly maxAttempts: number;
  private readonly delayMs: number;

  /**
   * Creates a fixed-delay retry policy.
   */
  constructor(options: FixedDelayOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.delayMs = options.delayMs;
  }

  /**
   * Computes retry decision for the current attempt.
   */
  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }

    return { shouldRetry: true, delayMs: this.delayMs, reason: "retry" };
  }
}
