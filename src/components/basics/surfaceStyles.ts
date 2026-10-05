/**
 * @file src/components/basics/surfaceStyles.ts
 * @desc The b4 box Card, Surface and LinkCard share (radius, color, the high contrast ring and
 *       the forced-colors border), its padding steps, and surfaceClasses, which builds it for an
 *       element Surface doesn't cover. One source, so the boxes can't drift.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { cx } from "../../utils/cx.js";

/** A surface's padding: `sm` p-3 (list rows), `md` p-4, `lg` p-5 (Card's). */
export type SurfacePadding = "sm" | "md" | "lg";

/** Options for {@link surfaceClasses}. */
export type SurfaceClassOptions = {
  padding?: SurfacePadding | undefined;
  className?: string | undefined;
};

/** The box without padding: rounded b4, c2 text, a c4 ring under high contrast, a border in forced colors. */
export const SURFACE =
  "rounded-[10px] bg-b4 text-c2 contrast-more:inset-ring contrast-more:inset-ring-c4 forced-colors:border";

/** The padding steps. */
export const SURFACE_PADDING: Record<SurfacePadding, string> = { sm: "p-3", md: "p-4", lg: "p-5" };

/**
 * @function surfaceClasses
 * @param opts {SurfaceClassOptions} padding (default "sm") and the caller's classes, merged last
 * @returns {string} the surface classes; a caller `p-*`, `rounded-*` or `bg-*` replaces the built-in one
 */
export const surfaceClasses = ({ padding = "sm", className }: SurfaceClassOptions = {}): string =>
  cx(SURFACE, SURFACE_PADDING[padding], className);
