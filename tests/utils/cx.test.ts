/**
 * @file tests/utils/cx.test.ts
 * @desc Unit tests for cx: order, falsy values, empty input, and Tailwind conflicts (the later
 *       class wins, like the sites' twMerge-based `cn`).
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

  it("lets a later class win a Tailwind conflict", () => {
    expect(cx("w-full px-3", "w-auto")).toBe("px-3 w-auto");
    expect(cx("w-full", "w-32")).toBe("w-32");
    expect(cx("text-c1 text-sm", "font-bold text-lg")).toBe("text-c1 font-bold text-lg");
    expect(cx("max-w-5xl px-4", "max-w-7xl")).toBe("px-4 max-w-7xl");
  });

  it("knows the palette colors apart from sizes", () => {
    expect(cx("bg-b4 text-c2", "bg-h2")).toBe("text-c2 bg-h2");
    expect(cx("text-c3 text-sm", "text-rose-300")).toBe("text-sm text-rose-300");
    expect(cx("border border-b3", "border-h1")).toBe("border border-h1");
  });

  it("keeps classes under different variants", () => {
    expect(cx("border-b3 focus-visible:border-h1", "aria-invalid:border-rose-400")).toBe(
      "border-b3 focus-visible:border-h1 aria-invalid:border-rose-400",
    );
  });
});
