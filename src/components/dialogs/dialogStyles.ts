/**
 * @file src/components/dialogs/dialogStyles.ts
 * @desc Finished class strings for the dialogs: the dialog element's base and open motion, the
 *       full-viewport frame a panel sits in, and ConfirmDialog's panel, button row and failure
 *       text. Server-safe, no directive. Internal.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

/** Every Dialog: no browser padding or fill, the palette's text color, a dimmed, blurred backdrop. */
export const DIALOG_BASE = "bg-transparent p-0 text-c1 backdrop:bg-b6/70 backdrop:backdrop-blur-sm";

/**
 * The open fade: opacity 0 to 1 and scale 98% to 100%, the backdrop fading with it, on the
 * motion tokens. Close is instant. Reduced motion zeroes the duration through theme.css.
 */
export const DIALOG_MOTION =
  "transition-[opacity,scale] duration-short ease-standard starting:scale-98 starting:opacity-0 backdrop:transition-opacity backdrop:duration-short backdrop:ease-standard starting:backdrop:opacity-0";

/** A dialog that covers the viewport, so only a press outside the panel lands on the dialog. */
export const DIALOG_FRAME = "m-0 h-dvh max-h-none w-full max-w-none open:flex";

/** ConfirmDialog's panel. Its border stays in forced-colors mode, where the fill and blur go. */
export const PANEL_BASE =
  "m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-b3 bg-b6 p-5 shadow-2xl";

/** ConfirmDialog's buttons: a column with Confirm on top below `sm`, a right-aligned row above. */
export const CONFIRM_BUTTONS =
  "mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end";

/** `textClasses({ tone: "error" })`, finished; dialogStyles.test.ts keeps the two equal. */
export const CONFIRM_ERROR = "text-rose-300 contrast-more:text-rose-200 text-sm";
