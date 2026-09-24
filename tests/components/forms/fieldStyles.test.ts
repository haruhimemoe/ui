/**
 * @file tests/components/forms/fieldStyles.test.ts
 * @desc Unit tests for fieldClasses: the exact packs field classes, and extras appended last.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { fieldClasses } from "../../../src/components/forms/fieldStyles.js";

const PACKS_FIELD =
  "w-full rounded-md border border-b3 bg-b6 px-3 py-2 text-c1 text-sm placeholder:text-c4 focus-visible:border-h1 focus-visible:outline-none disabled:opacity-50 aria-invalid:border-rose-400";

describe("fieldClasses", () => {
  it("returns the packs field classes unchanged with no extras", () => {
    expect(fieldClasses()).toBe(PACKS_FIELD);
  });

  it("appends extra classes last", () => {
    expect(fieldClasses("font-mono")).toBe(`${PACKS_FIELD} font-mono`);
  });

  it("lets a caller's class replace a built-in one that sets the same property", () => {
    expect(fieldClasses("w-auto")).not.toContain("w-full");
    expect(fieldClasses("w-auto").split(" ")).toContain("w-auto");
    expect(fieldClasses("w-32")).not.toContain("w-full");
    expect(fieldClasses("w-40")).not.toContain("w-full");
    const slot = fieldClasses("w-auto text-sm").split(" ");
    expect(slot).not.toContain("w-full");
    expect(slot.filter((c) => c === "text-sm")).toHaveLength(1);
    const title = fieldClasses("font-bold text-lg").split(" ");
    expect(title).not.toContain("text-sm");
    expect(title).toContain("text-lg");
  });

  it("ignores an empty extra", () => {
    expect(fieldClasses("")).toBe(PACKS_FIELD);
  });

  it("marks invalid fields with a rose border and dims disabled ones", () => {
    expect(fieldClasses()).toContain("aria-invalid:border-rose-400");
    expect(fieldClasses()).toContain("disabled:opacity-50");
  });
});
