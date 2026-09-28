/**
 * @file tests/components/filters/rangeMath.test.ts
 * @desc Unit tests for RangeSlider's math: guarded bounds and step, normalizing a range from a
 *       URL, snapping without float noise, and reading a typed box.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { describe, expect, it } from "vitest";
import {
  defaultParse,
  dragEnd,
  nextRange,
  normalizeRange,
  rangeBounds,
  readDraft,
  snap,
} from "../../../src/components/filters/rangeMath.js";

const stars = rangeBounds(0, 10, 0.1);

describe("rangeBounds", () => {
  it("orders the bounds and falls back to step 1 for a step that can't divide", () => {
    expect(rangeBounds(10, 0, 0)).toEqual({ min: 0, max: 10, step: 1, decimals: 0 });
    expect(rangeBounds(0, 1, Number.NaN).step).toBe(1);
    expect(rangeBounds(0.5, 1, 0.25)).toEqual({ min: 0.5, max: 1, step: 0.25, decimals: 2 });
  });
});

describe("normalizeRange and nextRange", () => {
  it("clamps, orders and opens a range from a URL", () => {
    expect(normalizeRange([-3, 42], stars, true)).toEqual({
      low: 0,
      high: 10,
      highOpen: true,
      highOut: null,
    });
    expect(normalizeRange([7, 3], stars, false)).toMatchObject({ low: 7, high: 7 });
  });

  it("snaps without float noise and reports nothing when nothing changed", () => {
    expect(snap(0.30000000000000004, stars)).toBe(0.3);
    const state = normalizeRange([2, 6], stars, true);
    expect(nextRange("low", 2.04, state, stars, true)).toBeNull();
    expect(nextRange("high", 10, state, stars, true)).toEqual([2, null]);
  });

  it("moves the other end when a drag starts off two parked thumbs", () => {
    const parked = normalizeRange([3, 3], stars, false);
    expect(dragEnd("high", 2.5, parked)).toBe("low");
    expect(dragEnd("low", 3.5, parked)).toBe("high");
    expect(dragEnd("high", 3.5, parked)).toBe("high");
  });
});

describe("readDraft", () => {
  it("reads empty as no limit, drops a trailing +, and takes a comma decimal", () => {
    expect(readDraft(" ", "low", stars, defaultParse)).toBe(0);
    expect(readDraft("", "high", stars, defaultParse)).toBe(10);
    expect(readDraft("10+", "high", stars, defaultParse)).toBe(10);
    expect(readDraft("5,5", "low", stars, defaultParse)).toBe(5.5);
    expect(readDraft("abc", "low", stars, defaultParse)).toBeNull();
    expect(readDraft("1", "low", stars, () => Number.NaN)).toBeNull();
  });
});
