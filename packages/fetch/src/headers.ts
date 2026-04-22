/**
 * Header utility helpers for request normalization and merging.
 *
 * @module
 */

/**
 * Merges two HeadersInit objects, with the second one taking precedence.
 */
export function mergeHeaders(base?: HeadersInit, override?: HeadersInit): Headers | undefined {
  if (!(base || override)) {
    return;
  }

  const merged = new Headers(base);
  if (override) {
    const overrideHeaders = new Headers(override);
    for (const [key, value] of overrideHeaders.entries()) {
      merged.set(key, value);
    }
  }
  return merged;
}
