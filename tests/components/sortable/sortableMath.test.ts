/**
 * @file tests/components/sortable/sortableMath.test.ts
 * @desc The sortable lists' pure math: targetAt (between by midpoint, the lifted item skipped,
 *       the nested container winning, outside every container, onto an item or the container,
 *       the horizontal axis), the final index when moving down in the same container,
 *       isNoopMove, the auto-scroll curve and its zone, and moveItem's edges. The keyboard
 *       targets are in sortableKeyboard.test.ts.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import {
  edgeScroll,
  isNoopMove,
  type MeasuredContainer,
  moveItem,
  SCROLL_MAX,
  scrollSpeed,
  targetAt,
} from "../../../src/components/sortable/sortableMath.js";

const box = (top: number, bottom: number, left = 0, right = 400) => ({ top, bottom, left, right });
const rows = (ids: string[], top: number, height = 40) =>
  ids.map((id, index) => ({
    id,
    index,
    rect: box(top + index * height, top + (index + 1) * height),
  }));

const NM: MeasuredContainer = {
  id: "nm",
  mode: "between",
  axis: "vertical",
  rect: box(0, 120),
  depth: 0,
  items: rows(["a", "b", "c"], 0),
};
const HD: MeasuredContainer = {
  id: "hd",
  mode: "onto",
  axis: "vertical",
  rect: box(200, 280),
  depth: 0,
  items: rows(["d", "e"], 200),
};

describe("targetAt", () => {
  it("finds the insertion index by midpoints, skipping the lifted item", () => {
    expect(targetAt({ x: 10, y: 10 }, [NM], "c")).toEqual({
      container: "nm",
      index: 0,
      onto: null,
    });
    expect(targetAt({ x: 10, y: 70 }, [NM], "c")).toEqual({
      container: "nm",
      index: 2,
      onto: null,
    });
    // a lifted, pointer under b's midpoint: a is skipped, b counts, so a lands after b.
    expect(targetAt({ x: 10, y: 65 }, [NM], "a")).toEqual({
      container: "nm",
      index: 1,
      onto: null,
    });
  });

  it("gives the final index when moving down in the same container", () => {
    const target = targetAt({ x: 10, y: 115 }, [NM], "a");
    expect(target).toEqual({ container: "nm", index: 2, onto: null });
    expect(moveItem(["a", "b", "c"], 0, target?.index ?? -1)).toEqual(["b", "c", "a"]);
  });

  it("lets the deepest container under the point win", () => {
    const inner: MeasuredContainer = { ...HD, id: "inner", rect: box(40, 80), depth: 1, items: [] };
    expect(targetAt({ x: 10, y: 60 }, [NM, inner], "a")).toEqual({
      container: "inner",
      index: 0,
      onto: null,
    });
  });

  it("returns null outside every container", () => {
    expect(targetAt({ x: 10, y: 160 }, [NM, HD], "a")).toBeNull();
    expect(targetAt({ x: 500, y: 10 }, [NM, HD], "a")).toBeNull();
  });

  it("drops onto an item, or onto the container's own space", () => {
    expect(targetAt({ x: 10, y: 250 }, [NM, HD], "a")).toEqual({
      container: "hd",
      index: 1,
      onto: "e",
    });
    const tall = { ...HD, rect: box(200, 330) };
    expect(targetAt({ x: 10, y: 300 }, [tall], "a")).toEqual({
      container: "hd",
      index: 2,
      onto: null,
    });
    // never onto the lifted item itself
    expect(targetAt({ x: 10, y: 210 }, [tall], "d")).toEqual({
      container: "hd",
      index: 2,
      onto: null,
    });
  });

  it("measures along x on a horizontal axis", () => {
    const row: MeasuredContainer = {
      id: "row",
      mode: "between",
      axis: "horizontal",
      rect: box(0, 40, 0, 300),
      depth: 0,
      items: ["a", "b", "c"].map((id, index) => ({
        id,
        index,
        rect: box(0, 40, index * 100, (index + 1) * 100),
      })),
    };
    expect(targetAt({ x: 160, y: 20 }, [row], "a")).toEqual({
      container: "row",
      index: 1,
      onto: null,
    });
  });
});

describe("isNoopMove", () => {
  it("is a no-op only for a between move to the same place", () => {
    const from = { container: "nm", index: 1 };
    expect(isNoopMove("between", from, { container: "nm", index: 1 })).toBe(true);
    expect(isNoopMove("between", from, { container: "nm", index: 2 })).toBe(false);
    expect(isNoopMove("between", from, { container: "hd", index: 1 })).toBe(false);
    expect(isNoopMove("onto", from, { container: "nm", index: 1 })).toBe(false);
  });
});

describe("auto-scroll", () => {
  it("ramps quadratically to the maximum at the edge and stops outside the zone", () => {
    expect(scrollSpeed(0, 48)).toBe(SCROLL_MAX);
    expect(scrollSpeed(-10, 48)).toBe(SCROLL_MAX);
    expect(scrollSpeed(24, 48)).toBe(4);
    expect(scrollSpeed(47, 48)).toBe(1);
    expect(scrollSpeed(48, 48)).toBe(0);
    expect(scrollSpeed(10, 0)).toBe(0);
  });

  it("scrolls back near the start edge and forward near the end edge", () => {
    expect(edgeScroll(5, 0, 800, 48)).toBeLessThan(0);
    expect(edgeScroll(795, 0, 800, 48)).toBeGreaterThan(0);
    expect(edgeScroll(400, 0, 800, 48)).toBe(0);
    expect(edgeScroll(830, 0, 800, 64)).toBe(SCROLL_MAX);
  });
});

describe("moveItem", () => {
  it("moves up and down, and copies", () => {
    const list = ["a", "b", "c", "d"] as const;
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, 1, 1)).toEqual(["a", "b", "c", "d"]);
    expect(moveItem(list, 1, 1)).not.toBe(list);
  });

  it("clamps the target and ignores a missing source", () => {
    expect(moveItem(["a", "b"], 0, 9)).toEqual(["b", "a"]);
    expect(moveItem(["a", "b"], 1, -3)).toEqual(["b", "a"]);
    expect(moveItem(["a", "b"], 5, 0)).toEqual(["a", "b"]);
    expect(moveItem([], 0, 0)).toEqual([]);
  });
});
