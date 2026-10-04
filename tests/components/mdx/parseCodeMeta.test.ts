/**
 * @file tests/components/mdx/parseCodeMeta.test.ts
 * @desc Unit tests for parseCodeMeta: the title quoting styles, line-range parsing (reversed
 *       ranges, duplicates, nonsense tokens ignored), the 10000-line cap, and the empty-meta cases.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { parseCodeMeta } from "../../../src/components/mdx/parseCodeMeta.js";

describe("parseCodeMeta", () => {
  it("parses a double-quoted title with a highlight range list", () => {
    expect(parseCodeMeta('title="x.ts" {1,3-5}')).toEqual({
      title: "x.ts",
      highlight: [1, 3, 4, 5],
    });
  });

  it("parses a single-quoted title with a space, and no highlights", () => {
    expect(parseCodeMeta("title='a b.json'")).toEqual({ title: "a b.json", highlight: [] });
  });

  it("sorts, dedupes, and normalizes a reversed range", () => {
    expect(parseCodeMeta("{5-3, 2,2}")).toEqual({ highlight: [2, 3, 4, 5] });
  });

  it("ignores nonsense tokens (zero, negative, non-numeric)", () => {
    expect(parseCodeMeta("{0,-1,x}")).toEqual({ highlight: [] });
  });

  it("caps the highlight count at 10000 lines", () => {
    expect(parseCodeMeta("{1-999999}").highlight).toHaveLength(10000);
  });

  it("returns an empty highlight list for undefined", () => {
    expect(parseCodeMeta(undefined)).toEqual({ highlight: [] });
  });

  it("returns an empty highlight list for null", () => {
    expect(parseCodeMeta(null)).toEqual({ highlight: [] });
  });
});
