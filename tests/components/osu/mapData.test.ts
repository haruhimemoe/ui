/**
 * @file tests/components/osu/mapData.test.ts
 * @desc MapCard's shared data helpers: songOf, shownNumber and the default labels.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import { DEFAULT_MAP_LABELS, shownNumber, songOf } from "../../../src/components/osu/mapData.js";

describe("mapData", () => {
  it("names a song only when artist and title are both known", () => {
    expect(songOf({ artist: "xi", title: "FREEDOM DiVE" })).toBe("xi - FREEDOM DiVE");
    expect(songOf({ artist: " ", title: "FREEDOM DiVE" })).toBeNull();
    expect(songOf({ title: "FREEDOM DiVE" })).toBeNull();
    expect(songOf(null)).toBeNull();
  });

  it("shows only finite numbers", () => {
    expect(shownNumber(4.2)).toBe(true);
    expect(shownNumber(0)).toBe(true);
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, null, undefined]) {
      expect(shownNumber(bad)).toBe(false);
    }
  });

  it("words every label in plain English", () => {
    const l = DEFAULT_MAP_LABELS;
    expect(l.mappedBy("peppy")).toBe("mapped by peppy");
    expect(l.setMappedBy("peppy")).toBe("Mapped by peppy");
    expect(l.fallbackTitle(5)).toBe("Beatmap 5");
    expect(l.loading(5)).toBe("Loading beatmap 5");
    expect(l.missing(5)).toBe("Beatmap 5 wasn't found. Check the ID.");
    expect(l.copyId).toBe("Copy ID");
    expect(l.copyIdName(5)).toBe("Copy ID 5");
    expect(l.copyFailed(5)).toBe("Couldn't copy. The beatmap ID is 5.");
  });
});
