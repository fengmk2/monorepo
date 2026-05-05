import { bench, describe } from "vitest";

import {
  runAsyncRetryRealWorld,
  runExponentialBackoffRealWorld,
  runPRetryRealWorld,
  runPromiseRetryRealWorld,
  runZapExponentialRealWorld,
  runZapFixedRealWorld,
} from "./adapters.js";
import { createSuccessAfterTwoRetriesTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | real-world | success-after-2-retries", () => {
  bench("zap | fixed-delay", async () => {
    await runZapFixedRealWorld(createSuccessAfterTwoRetriesTask());
  });

  bench("zap | exponential-backoff", async () => {
    await runZapExponentialRealWorld(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | p-retry", async () => {
    await runPRetryRealWorld(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | async-retry", async () => {
    await runAsyncRetryRealWorld(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | promise-retry", async () => {
    await runPromiseRetryRealWorld(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | exponential-backoff", async () => {
    await runExponentialBackoffRealWorld(createSuccessAfterTwoRetriesTask());
  });
});
