/**
 * @file tests/utils/cx.test.ts
 * @desc Unit tests for cx: order, falsy values, empty input.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { cx } from "../../src/utils/cx.js";

describe("cx", () => {
  it("joins classes in order with single spaces", () => {
    expect(cx("a", "b c", "d")).toBe("a b c d");
  });

  it("skips false, null, undefined, 0 and empty strings", () => {
    const off = false;
    expect(cx("a", off && "b", null, undefined, 0, "", "c")).toBe("a c");
  });

  it("returns an empty string for no classes", () => {
    expect(cx()).toBe("");
    expect(cx(undefined, false)).toBe("");
  });
});
