/**
 * @file src/components/basics/buttonStyles.ts
 * @desc Shared class builder for Button and ButtonLink (osu!-web pill buttons).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Oct 5, 2026
 */

import { cx } from "../../utils/cx.js";

/**
 * The pill's colors: `primary` is h2 (h1 on hover), `secondary` b3, `ghost` transparent, `danger`
 * rose-700 (rose-800 on hover) for a confirm that deletes.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * The pill's height, padding and text size: `sm` is a 28px icon square (over the 24px WCAG
 * 2.5.8 minimum target), `md` is h-9 (h-11 on a coarse pointer) and text-sm, `lg` h-11 and
 * text-base.
 */
export type ButtonSize = "sm" | "md" | "lg";

/** Options for {@link buttonClasses}. */
export type ButtonClassOptions = {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
};

// w-fit: a flex-column or grid item keeps its content width instead of stretching. The 1px
// border shows only in forced colors, where the pill's background is dropped.
const BASE =
  "inline-flex w-fit items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h1 disabled:cursor-not-allowed disabled:opacity-50 forced-colors:border forced-colors:disabled:text-[GrayText]";

// Hover only when not disabled. `not-disabled:` (not `enabled:`) so links, which are never
// :disabled, keep their hover colors. Under more contrast, b3 and a transparent pill get a c4
// edge: b3 on b5 is under 1.5:1.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-h2 text-c1 not-disabled:hover:bg-h1 not-disabled:hover:text-b6",
  secondary:
    "bg-b3 text-c1 not-disabled:hover:bg-b2 contrast-more:inset-ring contrast-more:inset-ring-c4",
  ghost:
    "bg-transparent text-c2 not-disabled:hover:bg-b4 not-disabled:hover:text-c1 contrast-more:inset-ring contrast-more:inset-ring-c4",
  danger: "bg-rose-700 text-c1 not-disabled:hover:bg-rose-800",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "size-7 p-0 text-sm",
  md: "h-9 px-4 text-sm coarse:h-11",
  lg: "h-11 px-6 text-base",
};

/**
 * @function buttonClasses
 * @param opts {ButtonClassOptions} variant (default "primary"), size (default "md", "sm" is a
 *        28px icon square) and extra classes
 * @returns {string} the pill button classes, with the caller's className appended last (it
 *          replaces a built-in class that sets the same property)
 */
export const buttonClasses = ({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}): string => cx(BASE, VARIANTS[variant], SIZES[size], className);
