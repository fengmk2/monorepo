export function isExternalHref(href: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(href);
}

export function getExternalLinkProps(...args: [] | [href: string | undefined]) {
  const [href] = args;
  if (!href || !isExternalHref(href)) {
    return {};
  }

  return {
    rel: "noreferrer noopener",
    target: "_blank",
  } as const;
}
