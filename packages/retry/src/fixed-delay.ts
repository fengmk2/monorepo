import { BaseRetryPolicy } from "./index.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

export interface FixedDelayOptions {
  maxAttempts: number;
  delayMs: number;
}

export class FixedDelay extends BaseRetryPolicy {
  private readonly maxAttempts: number;
  private readonly delayMs: number;

  constructor(options: FixedDelayOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.delayMs = options.delayMs;
  }

  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }

    return { shouldRetry: true, delayMs: this.delayMs, reason: "retry" };
  }
}
