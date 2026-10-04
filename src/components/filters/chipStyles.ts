/**
 * @file src/components/filters/chipStyles.ts
 * @desc The chip look that Chip and ChoiceChips share (the osu! beatmap listing pills): the pill,
 *       pink when on, b3 when off. In forced-colors mode an "on" chip takes the system highlight
 *       colors, so on and off still look different.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

/** The pill: rounded, px-2.5 py-1, bold text-xs; 44px tall on a coarse pointer. */
// py-1 with the text-xs line height makes a 24px pill: WCAG 2.2's minimum target size.
// inline-flex so a ChoiceChips <label> (inline) can take a min-height.
export const CHIP =
  "inline-flex items-center rounded-full px-2.5 py-1 font-bold text-xs transition-colors coarse:min-h-11 coarse:px-3.5";

/** A chip that is on (pressed or checked). */
export const CHIP_ON =
  "bg-h1 text-b6 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]";

/** A chip that is off. */
export const CHIP_OFF =
  "bg-b3 text-c2 contrast-more:inset-ring contrast-more:inset-ring-c4 forced-colors:border";

/** A chip that can't be used right now: dimmed, with a not-allowed cursor (GrayText in forced
 *  colors). */
export const CHIP_UNAVAILABLE = "cursor-not-allowed opacity-40 forced-colors:text-[GrayText]";
