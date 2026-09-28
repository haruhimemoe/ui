/**
 * @file src/components/basics/cardStyles.ts
 * @desc The osu!-web panel look that Card and FilterPanel share: the rounded b4 surface and its
 *       title, plus the heading levels either one takes for that title.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/** A heading level for a component's title: `h2` to `h6` (a page has one `h1`). */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

/** The panel: rounded, b4 background, p-5, c2 text. */
export const CARD = "rounded-[10px] bg-b4 p-5 text-c2";

/** The panel's title: bold c1 at text-lg. */
export const CARD_HEADING = "font-bold text-c1 text-lg";
