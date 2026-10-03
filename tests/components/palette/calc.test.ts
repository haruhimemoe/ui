/**
 * @file tests/components/palette/calc.test.ts
 * @desc evaluate: precedence, unary minus, k/m suffixes, functions, modulo, constants; null on
 *       garbage, division by zero and empty calls. formatResult trims. isBareNumber.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { evaluate, formatResult, isBareNumber } from "../../../src/components/palette/calc.js";

describe("evaluate", () => {
  it.each([
    ["1 + 2 * 3", 7],
    ["(1 + 2) * 3", 9],
    ["2 ^ 3 ^ 2", 512],
    ["-2 ^ 2", -4],
    ["2 ^ -1", 0.5],
    ["10 % 4", 2],
    ["1.5k + 2m", 2001500],
    ["sqrt(16) + abs(-3)", 7],
    ["round(2.5) + floor(2.9) + ceil(2.1)", 8],
    ["min(3, 1, 2) + max(3, 1, 2)", 4],
    ["pi * 2", Math.PI * 2],
    ["e", Math.E],
    ["7 / 2", 3.5],
    ["--3", 3],
  ])("%s = %s", (expression, expected) => {
    expect(evaluate(expression)).toBeCloseTo(expected, 10);
  });

  it.each([
    "",
    "   ",
    "1 /",
    "1 / 0",
    "5 % 0",
    "sqrt()",
    "foo(1)",
    "2 +* 3",
    "(1 + 2",
    "1 2",
    "*",
    "a",
  ])("returns null for %j", (expression) => {
    expect(evaluate(expression)).toBeNull();
  });
});

describe("formatResult", () => {
  it.each([
    [7, "7"],
    [3.5, "3.5"],
    [1 / 3, "0.3333333333"],
    [2001500, "2001500"],
    [-0, "0"],
  ])("%s → %s", (value, text) => {
    expect(formatResult(value)).toBe(text);
  });
});

describe("isBareNumber", () => {
  it("is true for a plain number and false for an expression", () => {
    expect(isBareNumber("2")).toBe(true);
    expect(isBareNumber(" -2.5 ")).toBe(true);
    expect(isBareNumber("2k")).toBe(false);
    expect(isBareNumber("2 + 2")).toBe(false);
  });
});
