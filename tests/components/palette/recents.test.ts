/**
 * @file tests/components/palette/recents.test.ts
 * @desc Recents in localStorage: namespacing, counting, ordering by last use, pruning to 50,
 *       and silence when storage throws or holds garbage. openCommandPalette dispatches its event.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  openCommandPalette,
  PALETTE_EVENT,
} from "../../../src/components/palette/paletteEvents.js";
import {
  boostFrom,
  readRecents,
  recentIds,
  recordRecent,
  storageKeyFor,
} from "../../../src/components/palette/recents.js";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("recents", () => {
  it("namespaces the key and starts empty", () => {
    expect(storageKeyFor("pools")).toBe("haruhime:palette:pools");
    expect(readRecents("pools")).toEqual({});
  });

  it("counts runs and orders ids by last use", () => {
    recordRecent("a", "x", 1);
    recordRecent("a", "y", 2);
    const recents = recordRecent("a", "x", 3);
    expect(recents).toEqual({ x: { n: 2, t: 3 }, y: { n: 1, t: 2 } });
    expect(recentIds(recents)).toEqual(["x", "y"]);
    expect(recentIds(recents, 1)).toEqual(["x"]);
    expect(boostFrom(recents)("x")).toBe(2);
    expect(boostFrom(recents)("nope")).toBe(0);
    expect(readRecents("b")).toEqual({});
  });

  it("prunes to the 50 most recent", () => {
    for (let i = 0; i < 55; i++) recordRecent("a", `c${i}`, i);
    const recents = readRecents("a");
    expect(Object.keys(recents)).toHaveLength(50);
    expect(recents.c4).toBeUndefined();
    expect(recents.c54).toEqual({ n: 1, t: 54 });
  });

  it("is silent when storage throws or holds garbage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("private mode");
    });
    expect(readRecents("a")).toEqual({});
    expect(recordRecent("a", "x")).toEqual({});
    vi.restoreAllMocks();
    localStorage.setItem(storageKeyFor("a"), "not json");
    expect(readRecents("a")).toEqual({});
    localStorage.setItem(storageKeyFor("a"), JSON.stringify({ x: "bad", y: { n: 1, t: 1 } }));
    expect(readRecents("a")).toEqual({ y: { n: 1, t: 1 } });
  });
});

describe("openCommandPalette", () => {
  it("dispatches the palette event with the page", () => {
    const listener = vi.fn();
    window.addEventListener(PALETTE_EVENT, listener);
    const page = { title: "Maps" };
    openCommandPalette(page);
    expect(listener).toHaveBeenCalledOnce();
    const event = listener.mock.calls[0]?.[0] as CustomEvent;
    expect(event.detail).toEqual({ page });
    window.removeEventListener(PALETTE_EVENT, listener);
  });
});
