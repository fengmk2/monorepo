/**
 * Request normalization helpers for RequestInfo-compatible inputs.
 *
 * @module
 */

import { mergeHeaders } from "./headers.js";
import type { ExtendedRequestInit } from "./types.js";

/**
 * Normalized representation used by internal request execution.
 *
 * - `url`: resolved string URL from `RequestInfo`
 * - `request`: original Request clone when input is a Request
 * - `options`: normalized request options merged with Request headers
 */
export interface NormalizedRequest {
  url: string;
  request?: Request;
  options: ExtendedRequestInit;
}

/**
 * Normalizes RequestInfo and request-level options into a consistent internal shape.
 *
 * @param resource - Request URL/path or Request instance.
 * @param options - Optional request options.
 * @returns A normalized request structure for internal processing.
 *
 * @example
 * const normalized = normalizeRequest("/users", { method: "GET" });
 * console.log(normalized.url); // "/users"
 */
export function normalizeRequest(
  resource: RequestInfo,
  options?: ExtendedRequestInit,
): NormalizedRequest {
  if (!(resource instanceof Request)) {
    return {
      url: resource,
      options: options ?? {},
    };
  }

  const request = new Request(resource);
  const { headers, ...rest } = options || {};
  const mergedHeaders = mergeHeaders(request.headers, headers);
  const normalizedOptions = { ...rest } as ExtendedRequestInit;

  if (mergedHeaders) {
    normalizedOptions.headers = mergedHeaders;
  }

  return {
    url: request.url,
    request,
    options: normalizedOptions,
  };
}
