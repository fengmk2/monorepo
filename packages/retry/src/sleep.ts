/**
 * Default delay implementation used by `BaseRetryPolicy.run` when no custom
 * `sleep` is provided.
 *
 * @module @zap-studio/retry/sleep
 */

/**
 * Awaits a timer-based delay, unless `delayMs` is non-positive.
 *
 * @param delayMs - Milliseconds to wait before resolving.
 * @returns Promise that resolves when the delay completes.
 */
export async function defaultSleep(delayMs: number): Promise<void> {
  if (delayMs <= 0) {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
}
