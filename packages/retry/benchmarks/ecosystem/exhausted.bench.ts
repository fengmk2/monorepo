import { bench, describe } from "vite-plus/test";

import {
  runAsyncRetry,
  runExponentialBackoff,
  runPRetry,
  runPromiseRetry,
  runZapExponential,
  runZapFixed,
} from "./adapters.js";
import { createAlwaysFailTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | exhausted-after-max-attempts", () => {
  bench("zap | fixed-delay", async () => {
    try {
      await runZapFixed(createAlwaysFailTask());
    } catch {}
  });

  bench("zap | exponential-backoff", async () => {
    try {
      await runZapExponential(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | p-retry", async () => {
    try {
      await runPRetry(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | async-retry", async () => {
    try {
      await runAsyncRetry(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | promise-retry", async () => {
    try {
      await runPromiseRetry(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | exponential-backoff", async () => {
    try {
      await runExponentialBackoff(createAlwaysFailTask());
    } catch {}
  });
});
