import { bench, describe } from "vitest";

import {
  runAsyncRetry,
  runExponentialBackoff,
  runPRetry,
  runPromiseRetry,
  runZapExponential,
  runZapFixed,
} from "./adapters.js";
import { createSuccessFirstTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | success-first-attempt", () => {
  bench("zap | fixed-delay", async () => {
    await runZapFixed(createSuccessFirstTask());
  });

  bench("zap | exponential-backoff", async () => {
    await runZapExponential(createSuccessFirstTask());
  });

  bench("ecosystem | p-retry", async () => {
    await runPRetry(createSuccessFirstTask());
  });

  bench("ecosystem | async-retry", async () => {
    await runAsyncRetry(createSuccessFirstTask());
  });

  bench("ecosystem | promise-retry", async () => {
    await runPromiseRetry(createSuccessFirstTask());
  });

  bench("ecosystem | exponential-backoff", async () => {
    await runExponentialBackoff(createSuccessFirstTask());
  });
});
