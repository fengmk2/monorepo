import type { BenchmarkFetch } from "./types.js";

export function installMockFetch(payload: unknown): BenchmarkFetch {
  const mockFetch: BenchmarkFetch = async () =>
    new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  globalThis.fetch = mockFetch as typeof fetch;
  return mockFetch;
}
