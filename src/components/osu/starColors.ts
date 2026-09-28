/**
 * @file src/components/osu/starColors.ts
 * @desc osu!'s star-rating color spectrum (internal), for StarRating's pill. The stops are osu!
 *       (lazer) difficulty colors, as data (no osu! source copied), blended in RGB between stops.
 *       They are the same at every --hue, like the wordmark's brand colors.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

type Rgb = readonly [number, number, number];

const STOPS: readonly (readonly [number, Rgb])[] = [
  [0.1, [66, 144, 251]],
  [1.25, [79, 192, 255]],
  [2, [79, 255, 213]],
  [2.5, [124, 255, 79]],
  [3.3, [246, 240, 92]],
  [4.2, [255, 128, 104]],
  [4.9, [255, 78, 111]],
  [5.8, [198, 69, 184]],
  [6.7, [101, 99, 222]],
  [7.7, [24, 21, 142]],
  [9, [0, 0, 0]],
];

const css = ([r, g, b]: Rgb): string => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;

/**
 * @function starRatingColor
 * @param stars {number} a star rating
 * @returns {string} a CSS `rgb()` color: grey below 0.1 (and for NaN), black from 9 up, and a
 *          straight blend between the two stops around it otherwise
 */
export const starRatingColor = (stars: number): string => {
  if (!(stars >= 0.1)) return css([170, 170, 170]);
  const upper = STOPS.findIndex(([at]) => stars < at);
  const low = STOPS[upper - 1];
  const high = STOPS[upper];
  if (!low || !high) return css([0, 0, 0]);
  const t = (stars - low[0]) / (high[0] - low[0]);
  const mix = (i: 0 | 1 | 2) => low[1][i] + (high[1][i] - low[1][i]) * t;
  return css([mix(0), mix(1), mix(2)]);
};

/**
 * @function starRatingTextColor
 * @param stars {number} a star rating
 * @returns {string} text that reads on `starRatingColor(stars)`: black up to 6.5, then osu!'s pale
 *          yellow on the dark end of the spectrum
 */
export const starRatingTextColor = (stars: number): string =>
  stars >= 6.5 ? css([255, 217, 102]) : css([0, 0, 0]);
