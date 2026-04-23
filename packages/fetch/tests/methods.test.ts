import type { StandardSchemaV1 } from "@zap-studio/validation";
import { describe, expect, it, vi } from "vite-plus/test";

import { createMethod } from "../src/methods.js";
import type { $Fetch } from "../src/types.js";

const schema = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: (input: unknown) => ({ value: input }),
  },
} satisfies StandardSchemaV1;

type FetchMock = (...args: unknown[]) => Promise<unknown>;
type MockedFetch = $Fetch & ReturnType<typeof vi.fn<FetchMock>>;

function createFetchMock(implementation: FetchMock = async () => undefined): MockedFetch {
  return vi.fn<FetchMock>(implementation) as unknown as MockedFetch;
}

describe("createMethod", () => {
  it("creates a method helper", () => {
    expect(typeof createMethod(createFetchMock(), "GET")).toBe("function");
  });

  it("passes input, schema, and method options to the fetch function", async () => {
    const fetchMock = createFetchMock();
    const get = createMethod(fetchMock, "GET");

    await get("/users", schema, { headers: { A: "1" } });
    const call = fetchMock.mock.calls[0];

    expect(call?.[0]).toBe("/users");
    expect(call?.[1]).toBe(schema);
    expect(call?.[2]).toEqual({
      headers: { A: "1" },
      method: "GET",
    });
  });

  it("preserves throwOnValidationError: false for the result-object overload", async () => {
    const fetchMock = createFetchMock();
    const post = createMethod(fetchMock, "POST");

    await post("/users", schema, { json: { name: "Zap" }, throwOnValidationError: false });
    const call = fetchMock.mock.calls[0];

    expect(call?.[2]).toEqual({
      json: { name: "Zap" },
      method: "POST",
      throwOnValidationError: false,
    });
  });

  it("supports raw Response calls without a schema", async () => {
    const fetchMock = createFetchMock();
    const del = createMethod(fetchMock, "DELETE");

    await del("/users/1", { headers: { A: "1" } });
    const call = fetchMock.mock.calls[0];

    expect(call?.[0]).toBe("/users/1");
    expect(call?.[1]).toEqual({ headers: { A: "1" }, method: "DELETE" });
  });

  it("lets the helper method win when runtime options contain a method", async () => {
    const fetchMock = createFetchMock();
    const patch = createMethod(fetchMock, "PATCH");

    await patch("/users/1", schema, { method: "POST" } as never);
    const call = fetchMock.mock.calls[0];

    expect(call?.[2]).toMatchObject({ method: "PATCH" });
  });
});
