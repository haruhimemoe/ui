/**
 * @file tests/components/osu/playerLinks.test.ts
 * @desc Unit tests for PlayerCard's URL and name helpers: profile and avatar URLs, osu-web's flag
 *       code points, country names with a fallback, and GIF detection.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import {
  avatarUrl,
  countryName,
  flagUrl,
  isAnimatedImage,
  normalizeCountryCode,
  profileUrl,
} from "../../../src/components/osu/playerLinks.js";

describe("playerLinks", () => {
  it("builds the profile and avatar URLs from an id", () => {
    expect(profileUrl(2)).toBe("https://osu.ppy.sh/users/2");
    expect(avatarUrl(3638962)).toBe("https://a.ppy.sh/3638962");
  });

  it("names a flag by its regional-indicator code points, like osu-web", () => {
    expect(flagUrl("US")).toBe("https://osu.ppy.sh/assets/images/flags/1f1fa-1f1f8.svg");
    expect(flagUrl("hr")).toBe("https://osu.ppy.sh/assets/images/flags/1f1ed-1f1f7.svg");
    expect(flagUrl(" au ")).toBe("https://osu.ppy.sh/assets/images/flags/1f1e6-1f1fa.svg");
  });

  it("draws no flag for anything but two ASCII letters", () => {
    for (const code of ["USA", "1A", "", "  ", "ü1", undefined]) {
      expect(flagUrl(code), String(code)).toBeNull();
      expect(normalizeCountryCode(code)).toBeNull();
    }
  });

  it("names the country in English, falling back to the code", () => {
    expect(countryName("US")).toBe("United States");
    expect(countryName("vn")).toBe("Vietnam");
    expect(countryName("ZZ")).toMatch(/^(ZZ|Unknown Region)$/);
    expect(countryName("1A")).toBe("1A");
  });

  it("spots an animated GIF cover, query string or not", () => {
    expect(isAnimatedImage("https://assets.ppy.sh/c/1/abc.gif")).toBe(true);
    expect(isAnimatedImage("https://x.test/a.GIF?v=2")).toBe(true);
    expect(isAnimatedImage("https://x.test/a.jpeg")).toBe(false);
    expect(isAnimatedImage("https://x.test/gif/a.png")).toBe(false);
  });
});
