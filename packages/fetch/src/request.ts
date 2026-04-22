import { mergeHeaders } from "./headers.js";
import type { ExtendedRequestInit } from "./types.js";

export interface NormalizedRequest {
  url: string;
  request?: Request;
  options: ExtendedRequestInit;
}

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
