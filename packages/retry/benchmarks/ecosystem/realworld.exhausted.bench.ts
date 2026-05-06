import { bench, describe } from "vitest";

import {
  runAsyncRetryRealWorld,
  runExponentialBackoffRealWorld,
  runPRetryRealWorld,
  runPromiseRetryRealWorld,
  runZapExponentialRealWorld,
  runZapFixedRealWorld,
} from "./adapters.js";
import { createAlwaysFailTask } from "./fixtures.js";

describe("@zap-studio/retry | ecosystem | real-world | exhausted-after-max-attempts", () => {
  bench("zap | fixed-delay", async () => {
    try {
      await runZapFixedRealWorld(createAlwaysFailTask());
    } catch {}
  });

  bench("zap | exponential-backoff", async () => {
    try {
      await runZapExponentialRealWorld(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | p-retry", async () => {
    try {
      await runPRetryRealWorld(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | async-retry", async () => {
    try {
      await runAsyncRetryRealWorld(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | promise-retry", async () => {
    try {
      await runPromiseRetryRealWorld(createAlwaysFailTask());
    } catch {}
  });

  bench("ecosystem | exponential-backoff", async () => {
    try {
      await runExponentialBackoffRealWorld(createAlwaysFailTask());
    } catch {}
  });
});
