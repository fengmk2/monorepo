import type { RetryError } from "./error";

export interface RetryDecision {
  readonly shouldRetry: boolean;
  readonly delayMs: number;
  readonly reason?: "retry" | "max-attempts-reached" | "policy-declined";
}

export interface RetryDecisionInput<TError = unknown, TData = unknown> {
  readonly attempt: number;
  readonly maxAttempts?: number | undefined;
  readonly error?: TError;
  readonly data?: TData;
}

export interface RetryExhaustedInput<TError = unknown, TData = unknown> {
  readonly attempts: number;
  readonly error?: TError;
  readonly data?: TData;
}

export interface RetryPolicy<TError = unknown, TData = unknown> {
  next(input: RetryDecisionInput<TError, TData>): RetryDecision;
  onExhausted(input: RetryExhaustedInput<TError, TData>): RetryError;
}

export interface RetryRunOptions {
  readonly sleep?: ((delayMs: number) => Promise<void>) | undefined;
}
