/**
 * @file src/components/filters/chipStyles.ts
 * @desc The chip look that Chip and ChoiceChips share (the osu! beatmap listing pills): the pill,
 *       pink when on, b3 when off. In forced-colors mode an "on" chip takes the system highlight
 *       colors, so on and off still look different.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/** The pill: rounded, px-2.5 py-0.5, bold text-xs. */
export const CHIP = "rounded-full px-2.5 py-0.5 font-bold text-xs transition-colors";

/** A chip that is on (pressed or checked). */
export const CHIP_ON =
  "bg-h1 text-b6 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]";

/** A chip that is off. */
export const CHIP_OFF = "bg-b3 text-c2";

/** A chip that can't be used right now: dimmed, with a not-allowed cursor. */
export const CHIP_UNAVAILABLE = "cursor-not-allowed opacity-40";
