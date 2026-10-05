/**
 * @file tests/components/sortable/sortableKeyboard.test.ts
 * @desc The sortable lists' keyboard math: keyboardTargets lists every target across containers
 *       and modes in DOM order, and keyboardStep walks it (arrows, Home and End, PageUp and
 *       PageDown), stopping at the ends and starting beside an "onto" lift.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import {
  type KeyboardContainer,
  keyboardStep,
  keyboardTargets,
} from "../../../src/components/sortable/sortableKeyboard.js";

const items = (ids: string[]) => ids.map((id, index) => ({ id, index }));
const NM: KeyboardContainer = { id: "nm", mode: "between", items: items(["a", "b", "c"]) };
const HD: KeyboardContainer = { id: "hd", mode: "onto", items: items(["d", "e"]) };

describe("keyboardTargets and keyboardStep", () => {
  const targets = keyboardTargets([NM, HD], "a");

  it("lists every insertion index of a between container, and each item then the end of an onto one", () => {
    expect(targets).toEqual([
      { container: "nm", index: 0, onto: null },
      { container: "nm", index: 1, onto: null },
      { container: "nm", index: 2, onto: null },
      { container: "hd", index: 0, onto: "d" },
      { container: "hd", index: 1, onto: "e" },
      { container: "hd", index: 2, onto: null },
    ]);
  });

  it("walks off one container into the next, and stops at the ends", () => {
    const from = { container: "nm", index: 0 };
    const start = { container: "nm", index: 0, onto: null };
    expect(keyboardStep(targets, start, from, "previous")).toEqual(start);
    const third = keyboardStep(targets, { container: "nm", index: 2, onto: null }, from, "next");
    expect(third).toEqual({ container: "hd", index: 0, onto: "d" });
    const end = { container: "hd", index: 2, onto: null };
    expect(keyboardStep(targets, end, from, "next")).toEqual(end);
  });

  it("jumps with first, last and the container steps", () => {
    const from = { container: "nm", index: 0 };
    const mid = { container: "nm", index: 1, onto: null };
    expect(keyboardStep(targets, mid, from, "first")).toEqual({
      container: "nm",
      index: 0,
      onto: null,
    });
    expect(keyboardStep(targets, mid, from, "last")).toEqual({
      container: "nm",
      index: 2,
      onto: null,
    });
    expect(keyboardStep(targets, mid, from, "nextContainer")).toEqual({
      container: "hd",
      index: 0,
      onto: "d",
    });
    const inHd = { container: "hd", index: 1, onto: "e" };
    expect(keyboardStep(targets, inHd, from, "previousContainer")).toEqual({
      container: "nm",
      index: 0,
      onto: null,
    });
    expect(keyboardStep(targets, mid, from, "previousContainer")).toEqual({
      container: "nm",
      index: 0,
      onto: null,
    });
  });

  it("starts beside the lifted item when an onto lift has no target yet", () => {
    const onto = keyboardTargets([HD], "d");
    const from = { container: "hd", index: 0 };
    expect(keyboardStep(onto, null, from, "next")).toEqual({
      container: "hd",
      index: 1,
      onto: "e",
    });
    expect(keyboardStep(onto, null, from, "previous")).toEqual({
      container: "hd",
      index: 1,
      onto: "e",
    });
    expect(keyboardStep(onto, null, from, "last")).toEqual({
      container: "hd",
      index: 2,
      onto: null,
    });
  });

  it("returns the current target when there are none", () => {
    expect(keyboardStep([], null, { container: "x", index: 0 }, "next")).toBeNull();
  });
});
