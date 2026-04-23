/**
 * Header utility helpers for request normalization and merging.
 *
 * @module
 */

/**
 * Merges two HeadersInit objects, with the second one taking precedence.
 *
 * @param base - Base/default headers.
 * @param override - Request-level override headers.
 * @returns A merged `Headers` object, or `undefined` when both inputs are empty.
 * @throws {TypeError} When either header input contains invalid header names or values.
 *
 * @example
 * const headers = mergeHeaders(
 *   { Authorization: "Bearer token" },
 *   { "X-Trace-Id": "abc" },
 * );
 *
 * console.log(headers?.get("Authorization")); // Bearer token
 */
export function mergeHeaders(): undefined;
export function mergeHeaders(base: HeadersInit | undefined): Headers | undefined;
export function mergeHeaders(
  base: HeadersInit | undefined,
  override: HeadersInit | undefined,
): Headers | undefined;
export function mergeHeaders(
  ...args:
    | []
    | [base: HeadersInit | undefined]
    | [base: HeadersInit | undefined, override: HeadersInit | undefined]
): Headers | undefined {
  const [base, override] = args;
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
