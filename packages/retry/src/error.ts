export interface RetryErrorContext {
  readonly attempts: number;
  readonly lastError?: unknown;
  readonly lastResponse?: unknown;
}

export class RetryError extends Error {
  public readonly attempts: number;
  public readonly lastError?: unknown;
  public readonly lastResponse?: unknown;

  constructor(message: string, context: RetryErrorContext) {
    super(message);
    this.name = "RetryError";
    this.attempts = context.attempts;
    this.lastError = context.lastError;
    this.lastResponse = context.lastResponse;
  }
}
