/**
 * @file tests/components/osu/mapLinks.test.ts
 * @desc Map URL helpers: cover sizes, bad ids give null, page and clip URLs, status labels.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import {
  beatmapPageUrl,
  beatmapsetPageUrl,
  isOsuId,
  MAP_STATUS_LABELS,
  type MapCoverSize,
  mapCoverUrl,
  previewClipUrl,
} from "../../../src/components/osu/mapLinks.js";

const SIZES: MapCoverSize[] = ["card", "card@2x", "list", "list@2x", "cover", "cover@2x"];
const BAD = [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53];

describe("mapLinks", () => {
  it("builds assets.ppy.sh cover URLs for every size, list@2x by default", () => {
    expect(mapCoverUrl(39804)).toBe("https://assets.ppy.sh/beatmaps/39804/covers/list@2x.jpg");
    for (const size of SIZES) {
      expect(mapCoverUrl(39804, size)).toBe(
        `https://assets.ppy.sh/beatmaps/39804/covers/${size}.jpg`,
      );
    }
  });

  it("builds nothing from an id that isn't a positive safe integer", () => {
    for (const bad of BAD) {
      expect(isOsuId(bad)).toBe(false);
      expect(mapCoverUrl(bad)).toBeNull();
      expect(previewClipUrl(bad)).toBeNull();
    }
    for (const bad of ["1", null, undefined, {}]) expect(isOsuId(bad)).toBe(false);
    expect(isOsuId(1)).toBe(true);
  });

  it("builds the osu! page and preview clip URLs", () => {
    expect(beatmapPageUrl(129891)).toBe("https://osu.ppy.sh/beatmaps/129891");
    expect(beatmapsetPageUrl(39804)).toBe("https://osu.ppy.sh/beatmapsets/39804");
    expect(previewClipUrl(39804)).toBe("https://b.ppy.sh/preview/39804.mp3");
  });

  it("labels osu!'s statuses, frozen", () => {
    expect(MAP_STATUS_LABELS).toEqual({
      ranked: "Ranked",
      approved: "Approved",
      loved: "Loved",
      qualified: "Qualified",
      pending: "Pending",
      wip: "WIP",
      graveyard: "Graveyard",
    });
    expect(Object.isFrozen(MAP_STATUS_LABELS)).toBe(true);
  });
});
