import type { ExtendedRequestInit, FetchDefaults } from "./types.js";

export function resolveRequestUrl(
  resourceUrl: string,
  defaults: FetchDefaults,
  searchParams: ExtendedRequestInit["searchParams"] | undefined,
): string {
  const isRelativeOutput = !defaults.baseURL && !isAbsoluteURL(resourceUrl);
  const url = new URL(resourceUrl, ensureTrailingSlash(defaults.baseURL));
  const urlSearchParams = new URLSearchParams(url.search);

  url.search = "";
  mergeSearchParams(url.searchParams, defaults.searchParams);
  mergeSearchParams(url.searchParams, urlSearchParams);
  mergeSearchParams(url.searchParams, searchParams);

  if (isRelativeOutput) {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  return url.toString();
}

function mergeSearchParams(
  target: URLSearchParams,
  source: ExtendedRequestInit["searchParams"] | undefined,
): void {
  for (const [key, value] of new URLSearchParams(source)) {
    target.set(key, value);
  }
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function isAbsoluteURL(url: string): boolean {
  return /^(?:https?:)?\/\//i.test(url);
}
