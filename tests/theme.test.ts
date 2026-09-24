/**
 * @file tests/theme.test.ts
 * @desc Unit tests for theme.css: the h1 and h2 lightness can be overridden, and the values the
 *       README gives for other hues meet WCAG AA contrast (4.5:1) where the defaults do not.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
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
const h1 = (hue: number, l = 70) => luminance(hue, 100, l);
const h2 = (hue: number, l = 45) => luminance(hue, 50, l);

describe("theme.css", () => {
  it("lets an app set the h1 and h2 lightness", () => {
    expect(theme).toContain("--color-h1: hsl(var(--hue) 100% var(--h1-l, 70%));");
    expect(theme).toContain("--color-h2: hsl(var(--hue) 50% var(--h2-l, 45%));");
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

  it("covers every hue with the README's worst-case values", () => {
    for (let hue = 0; hue < 360; hue++) {
      expect(contrast(c1(hue), h2(hue, 31))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(h1(hue, 77), b4(hue))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
