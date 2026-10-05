/**
 * @file tests/components/osu/mapCardView.test.ts
 * @desc MapCard's pure view: titles, link, cover URLs per layout and background, stats
 *       overrides key by key, non-finite numbers dropped, states, status text.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import { mapCardView } from "../../../src/components/osu/mapCardView.js";
import { META } from "../../helpers/maps.js";

describe("mapCardView", () => {
  it("titles a known map and links its osu! page", () => {
    const v = mapCardView({ beatmapId: 129891, map: META });
    expect(v.fullTitle).toBe("xi - FREEDOM DiVE");
    expect(v.songTitle).toBe("FREEDOM DiVE");
    expect(v.artist).toBe("xi");
    expect(v.link).toBe("https://osu.ppy.sh/beatmaps/129891");
    expect(v.square).toEqual({ url: "https://assets.ppy.sh/beatmaps/39804/covers/list@2x.jpg" });
    expect(v.backgroundUrl).toBeNull();
    expect(v.whole).toBe(false);
  });

  it("falls back to Beatmap <id> and a placeholder square without a map", () => {
    const v = mapCardView({ beatmapId: 5 });
    expect(v.fullTitle).toBe("Beatmap 5");
    expect(v.songTitle).toBe("Beatmap 5");
    expect(v.artist).toBeNull();
    expect(v.square).toEqual({ url: null });
    expect(v.hasFacts).toBe(false);
  });

  it("draws the card@2x background only with a background, and coverUrl replaces both", () => {
    expect(mapCardView({ beatmapId: 1, map: META, background: "blur" }).backgroundUrl).toBe(
      "https://assets.ppy.sh/beatmaps/39804/covers/card@2x.jpg",
    );
    const own = mapCardView({ beatmapId: 1, map: META, background: "cover", coverUrl: "/c.svg" });
    expect(own.backgroundUrl).toBe("/c.svg");
    expect(own.square).toEqual({ url: "/c.svg" });
    const none = mapCardView({ beatmapId: 1, map: META, background: "cover", coverUrl: null });
    expect(none.backgroundUrl).toBeNull();
    expect(none.square).toBeNull();
  });

  it("drops covers, facts and background for missing and error", () => {
    for (const state of ["missing", "error"] as const) {
      const v = mapCardView({ beatmapId: 5, map: META, state, background: "cover", stars: 3 });
      expect(v.failed).toBe(true);
      expect(v.square).toBeNull();
      expect(v.backgroundUrl).toBeNull();
      expect(v.hasFacts).toBe(false);
      expect(v.fullTitle).toBe("Beatmap 5");
    }
  });

  it("overrides stats key by key, stars too, and drops non-finite numbers", () => {
    const v = mapCardView({
      beatmapId: 1,
      map: { ...META, bpm: Number.POSITIVE_INFINITY },
      stars: 8.5,
      stats: { ar: 10, cs: null },
    });
    expect(v.stars).toBe(8.5);
    expect(v.stats).toEqual({ cs: null, ar: 10, od: 8, hp: 6, bpm: null, lengthSeconds: 263 });
    expect(
      mapCardView({ beatmapId: 1, map: { ...META, starRating: Number.NaN } }).stars,
    ).toBeNull();
  });

  it("skeletons only a loading card with no song yet", () => {
    expect(mapCardView({ beatmapId: 5, state: "loading" }).skeleton).toBe(true);
    expect(mapCardView({ beatmapId: 5, state: "loading", map: META }).skeleton).toBe(false);
    expect(mapCardView({ beatmapId: 5 }).skeleton).toBe(false);
  });

  it("shows status in the card layout by default, words it, and links whole cards", () => {
    const card = mapCardView({ beatmapId: 1, map: META, layout: "card" });
    expect(card.status).toBe("ranked");
    expect(card.statusText).toBe("Ranked");
    expect(card.whole).toBe(true);
    expect(mapCardView({ beatmapId: 1, map: META }).status).toBeNull();
    const odd = mapCardView({
      beatmapId: 1,
      map: { ...META, status: "mystery" },
      showStatus: true,
    });
    expect(odd.statusText).toBe("mystery");
    expect(
      mapCardView({ beatmapId: 1, map: META, showStatus: true, statusLabel: "Ranked!" }).statusText,
    ).toBe("Ranked!");
    expect(mapCardView({ beatmapId: 1, map: META, layout: "card", href: null }).whole).toBe(false);
  });
});
