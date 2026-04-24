import { bench, describe } from "vite-plus/test";

import {
  runAsyncRetry,
  runExponentialBackoff,
  runPRetry,
  runPromiseRetry,
  runZapExponential,
  runZapFixed,
} from "./adapters.js";
import { createSuccessAfterTwoRetriesTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | success-after-2-retries", () => {
  bench("zap | fixed-delay", async () => {
    await runZapFixed(createSuccessAfterTwoRetriesTask());
  });

  bench("zap | exponential-backoff", async () => {
    await runZapExponential(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | p-retry", async () => {
    await runPRetry(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | async-retry", async () => {
    await runAsyncRetry(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | promise-retry", async () => {
    await runPromiseRetry(createSuccessAfterTwoRetriesTask());
  });

  bench("ecosystem | exponential-backoff", async () => {
    await runExponentialBackoff(createSuccessAfterTwoRetriesTask());
  });
});
