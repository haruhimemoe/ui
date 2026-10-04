/**
 * @file src/components/basics/textTones.ts
 * @desc Text's tones and sizes as finished class strings (internal, no cx), so a client file
 *       that must not load tailwind-merge (PaletteInput) can still use the error tone. Status
 *       tones get one lighter step under prefers-contrast: more.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** Text's color: c2 body, c3 muted, c4 subtle, or a status color. */
export type TextTone = "default" | "muted" | "subtle" | "error" | "warning" | "success";

/** Text's size: text-xs, text-sm (the default) or text-base. */
export type TextSize = "xs" | "sm" | "base";

/** The class for each tone. Every tone clears 4.5:1 on b4, b5 and b6 at text-sm. */
export const TEXT_TONES: Readonly<Record<TextTone, string>> = {
  default: "text-c2",
  muted: "text-c3",
  subtle: "text-c4",
  error: "text-rose-300 contrast-more:text-rose-200",
  warning: "text-amber-300 contrast-more:text-amber-200",
  success: "text-emerald-300 contrast-more:text-emerald-200",
};

/** The class for each size. */
export const TEXT_SIZES: Readonly<Record<TextSize, string>> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
};
