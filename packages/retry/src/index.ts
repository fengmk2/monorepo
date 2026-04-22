import { RetryError } from "./error.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
} from "./types.js";

export abstract class BaseRetryPolicy implements RetryPolicy {
  public abstract next(input: RetryDecisionInput): RetryDecision;

  public onExhausted(input: RetryExhaustedInput): RetryError {
    return new RetryError("Retry policy exhausted all attempts.", {
      attempts: input.attempts,
      lastError: input.error,
      lastResponse: input.response,
    });
  }
}
