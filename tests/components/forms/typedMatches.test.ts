/**
 * @file tests/components/forms/typedMatches.test.ts
 * @desc typedMatches, the type-to-confirm rule TypeToConfirm and ConfirmDialog share: exact and
 *       case-sensitive, spaces around either side ignored, spaces inside counted.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import { typedMatches } from "../../../src/components/forms/typedMatches.js";

describe("typedMatches", () => {
  it.each([
    ["OWC 2026", "OWC 2026", true],
    ["  OWC 2026 ", "OWC 2026", true],
    ["OWC 2026", " OWC 2026  ", true],
    ["owc 2026", "OWC 2026", false],
    ["OWC  2026", "OWC 2026", false],
    ["OWC", "OWC 2026", false],
    ["", "OWC 2026", false],
    ["peppy", "peppy", true],
    ["Peppy", "peppy", false],
  ])("typedMatches(%j, %j) is %s", (typed, expected, result) => {
    expect(typedMatches(typed, expected)).toBe(result);
  });
});
