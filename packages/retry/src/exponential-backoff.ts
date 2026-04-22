import { BaseRetryPolicy } from "./index.js";
import type { RetryDecision, RetryDecisionInput } from "./types.js";

export interface ExponentialBackoffOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export class ExponentialBackoff extends BaseRetryPolicy {
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(options: ExponentialBackoffOptions) {
    super();
    this.maxAttempts = options.maxAttempts;
    this.baseDelayMs = options.baseDelayMs;
    this.maxDelayMs = options.maxDelayMs;
  }

  public next(input: RetryDecisionInput): RetryDecision {
    if (input.attempt >= this.maxAttempts) {
      return { shouldRetry: false, delayMs: 0, reason: "max-attempts-reached" };
    }

    const exponent = Math.max(0, input.attempt - 1);
    const delayMs = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** exponent);

    return { shouldRetry: true, delayMs, reason: "retry" };
  }
}
