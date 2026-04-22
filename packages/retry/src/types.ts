export interface RetryDecisionInput {
  readonly attempt: number;
  readonly maxAttempts?: number | undefined;
  readonly method?: string | undefined;
  readonly url?: string | undefined;
  readonly error?: unknown;
  readonly response?: unknown;
}

export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly delayMs: number;
  readonly reason?: "retry" | "max-attempts-reached" | "policy-declined";
}

export interface RetryExhaustedInput {
  readonly attempts: number;
  readonly error?: unknown;
  readonly response?: unknown;
}

export interface RetryPolicy {
  next(input: RetryDecisionInput): RetryDecision;
  onExhausted?(input: RetryExhaustedInput): Error;
}
