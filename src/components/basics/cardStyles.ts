/**
 * @file src/components/basics/cardStyles.ts
 * @desc The osu!-web panel look that Card and FilterPanel share: the rounded b4 surface and its
 *       title, plus the heading levels either one takes for that title.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Oct 5, 2026
 */

import { surfaceClasses } from "./surfaceStyles.js";

/** A heading level for a component's title: `h2` to `h6` (a page has one `h1`). */
export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

/** The panel: the shared surface at p-5. */
export const CARD = surfaceClasses({ padding: "lg" });

/** The panel's title: bold c1 at text-lg. */
export const CARD_HEADING = "font-bold text-c1 text-lg";
