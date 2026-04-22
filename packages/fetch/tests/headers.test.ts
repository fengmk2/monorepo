import { describe, expect, it } from "vite-plus/test";

import { mergeHeaders } from "../src/headers.js";

describe("mergeHeaders", () => {
  it("returns undefined when no headers are provided", () => {
    expect(mergeHeaders(undefined, undefined)).toBeUndefined();
  });

  it("accepts object, Headers, and tuple inputs", () => {
    const base = new Headers({ A: "1" });
    const tuples: [string, string][] = [["B", "2"]];

    const fromObject = mergeHeaders({ A: "1" }, undefined);
    const fromHeaders = mergeHeaders(base, undefined);
    const fromTuples = mergeHeaders(tuples, undefined);

    expect(fromObject?.get("A")).toBe("1");
    expect(fromHeaders?.get("A")).toBe("1");
    expect(fromTuples?.get("B")).toBe("2");
  });

  it("merges headers with override values taking precedence", () => {
    const headers = mergeHeaders({ A: "1", B: "2" }, { B: "20", C: "3" });

    expect(headers?.get("A")).toBe("1");
    expect(headers?.get("B")).toBe("20");
    expect(headers?.get("C")).toBe("3");
  });
});
