/**
 * @file src/components/palette/paletteEvents.ts
 * @desc How anything opens the mounted CommandPalette without a context provider: a CustomEvent
 *       on window that the palette listens for. `CommandPaletteButton` and app code call
 *       `openCommandPalette`, optionally with a page to open onto.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import type { Page } from "./types.js";

/** The event name CommandPalette listens for on window. */
export const PALETTE_EVENT = "haruhime:palette";

/** The event's detail. */
export type PaletteEventDetail = { page?: Page | undefined };

/**
 * @function openCommandPalette
 * @param page {Page} a page to open straight onto, above the root
 * @returns {void}
 */
export function openCommandPalette(page?: Page): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<PaletteEventDetail>(PALETTE_EVENT, { detail: { page } }));
}
