/**
 * @file tests/theme.test.ts
 * @desc Unit tests for theme.css: the h1 and h2 lightness can be overridden, the values the
 *       README gives for other hues meet WCAG AA contrast (4.5:1) where the defaults do not, and
 *       c1 stays white at every hue.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sat Oct 3, 2026
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const theme = readFileSync(path.join(import.meta.dirname, "../src/theme.css"), "utf8");

/** Relative luminance of an HSL color (h in degrees, s and l in percent). */
const luminance = (h: number, s: number, l: number): number => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4);
};

const contrast = (a: number, b: number): number =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// The palette as theme.css defines it, with the lightness overrides.
const c1 = (hue: number) => luminance(hue, 40, 100);
const b4 = (hue: number) => luminance(hue, 10, 20);
const b5 = (hue: number) => luminance(hue, 10, 15);
const h1 = (hue: number, l = 76) => luminance(hue, 100, l);
const h2 = (hue: number, l = 45) => luminance(hue, 50, l);

describe("theme.css", () => {
  it("lets an app set the h1 and h2 lightness", () => {
    expect(theme).toContain("--color-h1: hsl(var(--hue) 100% var(--h1-l, 76%));");
    expect(theme).toContain("--color-h2: hsl(var(--hue) 50% var(--h2-l, 45%));");
  });

  it("keeps c1 white at every hue, so SiteFooter's Discord logo stays white", () => {
    expect(theme).toContain("--color-c1: hsl(var(--hue) 40% 100%);");
    for (const hue of [0, 150, 200, 240, 333]) expect(c1(hue)).toBe(1);
  });

  it("meets 4.5:1 at the default hue (primary buttons, h1 links on cards)", () => {
    expect(contrast(c1(333), h2(333))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(h1(333), b4(333))).toBeGreaterThanOrEqual(4.5);
  });

  it("needs the README's overrides at the hues it names, and they meet 4.5:1", () => {
    expect(contrast(c1(200), h2(200))).toBeLessThan(4.5);
    expect(contrast(c1(200), h2(200, 42))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(c1(150), h2(150))).toBeLessThan(4.5);
    expect(contrast(c1(150), h2(150, 35))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(h1(240), b4(240))).toBeLessThan(4.5);
    expect(contrast(h1(240, 77), b4(240))).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps h1 text on b5 (links in cards and prose) at 4.5:1 at every hue by default", () => {
    for (let hue = 0; hue < 360; hue++) {
      expect(contrast(h1(hue), b5(hue)), `hue ${hue}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("covers every hue with the README's worst-case values", () => {
    for (let hue = 0; hue < 360; hue++) {
      expect(contrast(c1(hue), h2(hue, 31))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(h1(hue, 77), b4(hue))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("Shiki tokens", () => {
  const b6 = (hue: number) => luminance(hue, 10, 10);
  const c2 = (hue: number) => luminance(hue, 40, 90);
  const c3 = (hue: number) => luminance(hue, 40, 80);
  const c4 = (hue: number) => luminance(hue, 40, 70);
  // The keyword and link tokens get their own hue-derived value (not var(--color-h1)): var's
  // default lightness (76%) fails 4.5:1 against b4 at some hues.
  const keywordLink = (hue: number) => luminance(hue, 100, 78);
  const hsl = (hue: number, offset: number, s: number, l: number) =>
    luminance((hue + offset + 360) % 360, s, l);

  const lines = [
    "  --shiki-foreground: var(--color-c2);",
    "  --shiki-background: var(--color-b6);",
    "  --shiki-token-keyword: hsl(var(--hue) 100% 78%);",
    "  --shiki-token-string: hsl(calc(var(--hue) + 150) 55% 75%);",
    "  --shiki-token-string-expression: hsl(calc(var(--hue) + 150) 55% 75%);",
    "  --shiki-token-constant: hsl(calc(var(--hue) + 40) 55% 74%);",
    "  --shiki-token-function: hsl(calc(var(--hue) + 200) 55% 75%);",
    "  --shiki-token-parameter: hsl(calc(var(--hue) + 60) 55% 75%);",
    "  --shiki-token-comment: var(--color-c4);",
    "  --shiki-token-punctuation: var(--color-c3);",
    "  --shiki-token-link: hsl(var(--hue) 100% 78%);",
  ];

  it("contains every --shiki-* line verbatim", () => {
    for (const line of lines) expect(theme).toContain(line);
  });

  it("meets 4.5:1 against b6 at a sample of hues", () => {
    for (const hue of [0, 150, 200, 240, 333]) {
      expect(contrast(c2(hue), b6(hue)), `foreground hue ${hue}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c4(hue), b6(hue)), `comment hue ${hue}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c3(hue), b6(hue)), `punctuation hue ${hue}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(keywordLink(hue), b6(hue)), `keyword/link hue ${hue}`).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(hsl(hue, 150, 55, 75), b6(hue)), `string hue ${hue}`).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrast(hsl(hue, 40, 55, 74), b6(hue)), `constant hue ${hue}`).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(
        contrast(hsl(hue, 200, 55, 75), b6(hue)),
        `function hue ${hue}`,
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(hsl(hue, 60, 55, 75), b6(hue)),
        `parameter hue ${hue}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("meets 4.5:1 against b6 and b4 (the highlighted-line tint) at every hue", () => {
    for (let hue = 0; hue < 360; hue++) {
      for (const bg of [b6(hue), b4(hue)]) {
        expect(contrast(c2(hue), bg), `foreground hue ${hue}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(c4(hue), bg), `comment hue ${hue}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(c3(hue), bg), `punctuation hue ${hue}`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(keywordLink(hue), bg), `keyword/link hue ${hue}`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(hsl(hue, 150, 55, 75), bg), `string hue ${hue}`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(hsl(hue, 40, 55, 74), bg), `constant hue ${hue}`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(hsl(hue, 200, 55, 75), bg), `function hue ${hue}`).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(hsl(hue, 60, 55, 75), bg), `parameter hue ${hue}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });
});
