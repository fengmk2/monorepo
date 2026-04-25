declare module "better-fetch" {
  type BetterFetchType = ((
    url: string,
    params?: Omit<RequestInit, "body"> & { body?: unknown },
  ) => Promise<Response>) & {
    setDefaultHeaders: (headers: HeadersInit) => void;
  };

  const betterFetch: BetterFetchType;
  export default betterFetch;
}
