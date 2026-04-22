import { RetryError } from "./error.js";
import type {
  RetryDecision,
  RetryDecisionInput,
  RetryExhaustedInput,
  RetryPolicy,
  RetryRunOptions,
  RetryRunResult,
} from "./types.js";

export abstract class BaseRetryPolicy<TError = unknown, TData = unknown> implements RetryPolicy<
  TError,
  TData
> {
  public abstract next(input: RetryDecisionInput<TError, TData>): RetryDecision;

  public onExhausted(input: RetryExhaustedInput<TError, TData>): RetryError {
    return new RetryError("Retry policy exhausted all attempts.", {
      attempts: input.attempts,
      lastError: input.error,
      lastData: input.data,
    });
  }

  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions & { throwOnExhausted: false },
  ): Promise<RetryRunResult<T>>;

  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options?: RetryRunOptions & { throwOnExhausted?: true | undefined },
  ): Promise<T>;

  public async run<T>(
    execute: (attempt: number) => Promise<T>,
    options: RetryRunOptions = {},
  ): Promise<T | RetryRunResult<T>> {
    const sleep = options.sleep ?? defaultSleep;
    let attempt = 1;
    let lastError: TError | undefined;

    while (true) {
      try {
        const value = await execute(attempt);
        if (options.throwOnExhausted === false) {
          return { ok: true, value };
        }
        return value;
      } catch (error) {
        lastError = error as TError;
        const decision = this.next({
          attempt,
          error: error as TError,
        });

        if (!decision.shouldRetry) {
          const terminalError = this.onExhausted({ attempts: attempt, error: lastError });
          if (options.throwOnExhausted === false) {
            return {
              ok: false,
              error: terminalError,
              attempts: attempt,
            };
          }
          throw terminalError;
        }

        await sleep(decision.delayMs);
        attempt += 1;
      }
    }
  }
}

async function defaultSleep(delayMs: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
