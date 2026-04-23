/**
 * Terminal error types used by retry policies and runners.
 *
 * @module
 */

/**
 * Context payload attached to `RetryError`.
 */
export interface RetryErrorContext {
  readonly attempts: number;
  readonly lastError?: unknown;
  readonly lastData?: unknown;
}

/**
 * Error thrown when retries are exhausted.
 *
 * @example
 * throw new RetryError("Retry exhausted", {
 *   attempts: 3,
 *   lastError: new Error("network"),
 * });
 */
export class RetryError extends Error {
  /**
   * Total attempts performed before exhaustion.
   */
  public readonly attempts: number;
  /**
   * Last captured error from execution.
   */
  public readonly lastError?: unknown;
  /**
   * Last captured data value, when available.
   */
  public readonly lastData?: unknown;

  /**
   * Creates a RetryError with structured terminal context.
   */
  constructor(message: string, context: RetryErrorContext) {
    super(message);
    this.name = "RetryError";
    this.attempts = context.attempts;
    this.lastError = context.lastError;
    this.lastData = context.lastData;
  }
}
