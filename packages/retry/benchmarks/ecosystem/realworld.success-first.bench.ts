import { bench, describe } from "vite-plus/test";

import {
  runAsyncRetryRealWorld,
  runExponentialBackoffRealWorld,
  runPRetryRealWorld,
  runPromiseRetryRealWorld,
  runZapExponentialRealWorld,
  runZapFixedRealWorld,
} from "./adapters.js";
import { createSuccessFirstTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | real-world | success-first-attempt", () => {
  bench("zap | fixed-delay", async () => {
    await runZapFixedRealWorld(createSuccessFirstTask());
  });

  bench("zap | exponential-backoff", async () => {
    await runZapExponentialRealWorld(createSuccessFirstTask());
  });

  bench("ecosystem | p-retry", async () => {
    await runPRetryRealWorld(createSuccessFirstTask());
  });

  bench("ecosystem | async-retry", async () => {
    await runAsyncRetryRealWorld(createSuccessFirstTask());
  });

  bench("ecosystem | promise-retry", async () => {
    await runPromiseRetryRealWorld(createSuccessFirstTask());
  });

  bench("ecosystem | exponential-backoff", async () => {
    await runExponentialBackoffRealWorld(createSuccessFirstTask());
  });
});
