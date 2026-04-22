/**
 * Request normalization helpers for RequestInfo-compatible inputs.
 *
 * @module
 */

import { mergeHeaders } from "./headers.js";
import type { ExtendedRequestInit } from "./types.js";

/**
 * Normalized representation used by internal request execution.
 */
export interface NormalizedRequest {
  url: string;
  request?: Request;
  options: ExtendedRequestInit;
}

/**
 * Normalizes RequestInfo and request-level options into a consistent internal shape.
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
