/**
 * @file src/components/basics/buttonStyles.ts
 * @desc Shared class builder for Button and ButtonLink (osu!-web pill buttons).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { cx } from "../../utils/cx.js";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

/** Options for {@link buttonClasses}. */
export type ButtonClassOptions = {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  className?: string | undefined;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h1 disabled:cursor-not-allowed disabled:opacity-50";

// Hover only when not disabled. `not-disabled:` (not `enabled:`) so links, which are never
// :disabled, keep their hover colors.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-h2 text-c1 not-disabled:hover:bg-h1 not-disabled:hover:text-b6",
  secondary: "bg-b3 text-c1 not-disabled:hover:bg-b2",
  ghost: "bg-transparent text-c2 not-disabled:hover:bg-b4 not-disabled:hover:text-c1",
};

const SIZES: Record<ButtonSize, string> = {
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

/**
 * @function buttonClasses
 * @param opts {ButtonClassOptions} variant (default "primary"), size (default "md") and extra
 *        classes
 * @returns {string} the pill button classes, with the caller's className appended last (it
 *          replaces a built-in class that sets the same property)
 */
export const buttonClasses = ({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}): string => cx(BASE, VARIANTS[variant], SIZES[size], className);
