/**
 * @file src/components/basics/Badge.tsx
 * @desc A small pill for a status or a tag ("Unranked", "beta", a count). Static text: no role,
 *       so screen readers read it in place with the text around it. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** The badge's colors: neutral b3, accent h1, a warning amber, or a muted outline. */
export type BadgeTone = "neutral" | "accent" | "warning" | "muted";

/** Every native `<span>` prop (including `ref`), plus a tone. */
export type BadgeProps = ComponentProps<"span"> & {
  /** "neutral" (default), "accent", "warning" or "muted" (outlined, small capitals). */
  tone?: BadgeTone | undefined;
};

const BASE =
  "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs forced-colors:border";

// The looks the apps already use: pools' tags and warnings, and its header's beta pill.
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-b3 text-c2 contrast-more:inset-ring contrast-more:inset-ring-c4",
  accent: "bg-h1 font-bold text-b6",
  warning: "bg-amber-300/20 font-bold text-amber-200",
  muted: "border border-b3 bg-b5 font-bold text-c4 uppercase tracking-wide contrast-more:border-c4",
};

/**
 * @function Badge
 * @param props {BadgeProps} native span props, plus a tone (default "neutral")
 * @returns {JSX.Element} a rounded `<span>` pill in the tone's colors
 */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cx(BASE, TONES[tone], className)} {...props} />;
}
