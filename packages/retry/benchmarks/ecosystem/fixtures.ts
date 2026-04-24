export const maxAttempts = 3;

export type BenchmarkTask = () => Promise<"ok">;

export function createSuccessFirstTask(): BenchmarkTask {
  return async () => "ok";
}

export function createSuccessAfterTwoRetriesTask(): BenchmarkTask {
  let failures = 0;

  return async () => {
    if (failures < 2) {
      failures += 1;
      throw new Error("benchmark-failure");
    }

    return "ok";
  };
}

export function createAlwaysFailTask(): BenchmarkTask {
  return async () => {
    throw new Error("benchmark-failure");
  };
}
