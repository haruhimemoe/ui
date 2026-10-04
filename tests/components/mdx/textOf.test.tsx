/**
 * @file tests/components/mdx/textOf.test.tsx
 * @desc Unit tests for textOf: flattens a ReactNode tree (strings, numbers, arrays, nested
 *       elements) to plain text, and treats null/undefined/boolean as empty.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { textOf } from "../../../src/components/mdx/textOf.js";

describe("textOf", () => {
  it("returns a plain string as-is", () => {
    expect(textOf("hello")).toBe("hello");
  });

  it("stringifies a number", () => {
    expect(textOf(42)).toBe("42");
  });

  it("joins an array of nodes", () => {
    expect(textOf(["a", "b", 3])).toBe("ab3");
  });

  it("flattens nested elements", () => {
    expect(
      textOf(
        <code>
          a<b>b</b>
        </code>,
      ),
    ).toBe("ab");
  });

  it("treats null as empty", () => {
    expect(textOf(null)).toBe("");
  });

  it("treats false as empty", () => {
    expect(textOf(false)).toBe("");
  });

  it("treats undefined as empty", () => {
    expect(textOf(undefined)).toBe("");
  });
});
