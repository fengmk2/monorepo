import asyncRetry from "async-retry";
import { backOff } from "exponential-backoff";
import pRetry from "p-retry";
import promiseRetry from "promise-retry";

import { ExponentialBackoff } from "../../src/exponential-backoff.js";
import { FixedDelay } from "../../src/fixed-delay.js";
import type { BenchmarkTask } from "./fixtures.js";
import { maxAttempts } from "./fixtures.js";

const noSleep = async (): Promise<void> => {};

export async function runZapFixed(task: BenchmarkTask): Promise<void> {
  const policy = new FixedDelay({ maxAttempts, delayMs: 0 });
  await policy.run(async () => task(), { sleep: noSleep });
}

export async function runZapExponential(task: BenchmarkTask): Promise<void> {
  const policy = new ExponentialBackoff({
    maxAttempts,
    baseDelayMs: 0,
    maxDelayMs: 0,
  });
  await policy.run(async () => task(), { sleep: noSleep });
}

export async function runPRetry(task: BenchmarkTask): Promise<void> {
  await pRetry(async () => task(), {
    retries: maxAttempts - 1,
    factor: 1,
    minTimeout: 0,
    maxTimeout: 0,
    randomize: false,
  });
}

export async function runAsyncRetry(task: BenchmarkTask): Promise<void> {
  await asyncRetry(async () => task(), {
    retries: maxAttempts - 1,
    factor: 1,
    minTimeout: 0,
    maxTimeout: 0,
    randomize: false,
  });
}

export async function runPromiseRetry(task: BenchmarkTask): Promise<void> {
  await promiseRetry(
    async (retry) => {
      try {
        return await task();
      } catch (error) {
        retry(error);
      }

      throw new Error("unreachable");
    },
    {
      retries: maxAttempts - 1,
      factor: 1,
      minTimeout: 0,
      maxTimeout: 0,
      randomize: false,
    },
  );
}

export async function runExponentialBackoff(task: BenchmarkTask): Promise<void> {
  await backOff(async () => task(), {
    numOfAttempts: maxAttempts,
    startingDelay: 0,
    timeMultiple: 1,
    maxDelay: 0,
    jitter: "none",
    retry: async () => true,
  });
}

export async function runZapFixedRealWorld(task: BenchmarkTask): Promise<void> {
  const policy = new FixedDelay({ maxAttempts, delayMs: 0 });
  await policy.run(async () => task());
}

export async function runZapExponentialRealWorld(task: BenchmarkTask): Promise<void> {
  const policy = new ExponentialBackoff({
    maxAttempts,
    baseDelayMs: 0,
    maxDelayMs: 0,
  });
  await policy.run(async () => task());
}

export async function runPRetryRealWorld(task: BenchmarkTask): Promise<void> {
  await pRetry(async () => task(), {
    retries: maxAttempts - 1,
    minTimeout: 0,
    maxTimeout: 0,
  });
}

export async function runAsyncRetryRealWorld(task: BenchmarkTask): Promise<void> {
  await asyncRetry(async () => task(), {
    retries: maxAttempts - 1,
    minTimeout: 0,
    maxTimeout: 0,
  });
}

export async function runPromiseRetryRealWorld(task: BenchmarkTask): Promise<void> {
  await promiseRetry(
    async (retry) => {
      try {
        return await task();
      } catch (error) {
        retry(error);
      }

      throw new Error("unreachable");
    },
    {
      retries: maxAttempts - 1,
      minTimeout: 0,
      maxTimeout: 0,
    },
  );
}

export async function runExponentialBackoffRealWorld(task: BenchmarkTask): Promise<void> {
  await backOff(async () => task(), {
    numOfAttempts: maxAttempts,
    startingDelay: 0,
    maxDelay: 0,
  });
}
