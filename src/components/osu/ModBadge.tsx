/**
 * @file src/components/osu/ModBadge.tsx
 * @desc A mod pool slot's pill (NM1, HD2, TB), colored by its mod bucket the way tournament
 *       sheets and packs.haruhime.moe color them: NM sky, HD amber, HR rose, DT and NC violet,
 *       FM emerald, TB orange. Anything else is a quiet b3 pill; `color` picks any of 17 colors
 *       (the buckets', the pool palette's and neutral) for a custom bucket. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** A badge color: the six bucket colors, @haruhimemoe/pool's PALETTE names, or neutral. */
export type ModBadgeColor =
  | "sky"
  | "amber"
  | "rose"
  | "violet"
  | "emerald"
  | "orange"
  | "green"
  | "teal"
  | "pink"
  | "lime"
  | "cyan"
  | "fuchsia"
  | "yellow"
  | "red"
  | "indigo"
  | "stone"
  | "neutral";

/** Every native `<span>` prop (except the legacy `color`), plus the slot and an optional color. */
export type ModBadgeProps = Omit<ComponentProps<"span">, "color"> & {
  /** A mod or slot label ("HD", "NM1", "TB"). Its first two letters pick the color. */
  mod: string;
  /** Overrides the color picked from the mod's first two letters. */
  color?: ModBadgeColor | undefined;
};

// Literal classes, so the app's Tailwind finds them through theme.css's @source. Every background
// is light enough for text-b6 at 4.5:1 or more.
const COLORS: Record<ModBadgeColor, string> = {
  sky: "bg-sky-400 text-b6",
  amber: "bg-amber-300 text-b6",
  rose: "bg-rose-400 text-b6",
  violet: "bg-violet-400 text-b6",
  emerald: "bg-emerald-400 text-b6",
  orange: "bg-orange-400 text-b6",
  green: "bg-green-400 text-b6",
  teal: "bg-teal-300 text-b6",
  pink: "bg-pink-400 text-b6",
  lime: "bg-lime-300 text-b6",
  cyan: "bg-cyan-300 text-b6",
  fuchsia: "bg-fuchsia-400 text-b6",
  yellow: "bg-yellow-300 text-b6",
  red: "bg-red-400 text-b6",
  indigo: "bg-indigo-300 text-b6",
  stone: "bg-stone-300 text-b6",
  neutral: "bg-b3 text-c2",
};

const BUCKETS: Record<string, ModBadgeColor> = {
  NM: "sky",
  HD: "amber",
  HR: "rose",
  DT: "violet",
  NC: "violet",
  FM: "emerald",
  TB: "orange",
};

const BASE =
  "inline-flex min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 font-extrabold text-xs forced-colors:border";

/** The color's classes: `color` when it is one, else the mod's bucket, else neutral. */
const colorClasses = (color: string | undefined, mod: string): string => {
  if (color !== undefined && Object.hasOwn(COLORS, color)) return COLORS[color as ModBadgeColor];
  const bucket = BUCKETS[mod.slice(0, 2).toUpperCase()];
  return COLORS[bucket ?? "neutral"];
};

/**
 * @function ModBadge
 * @param props {ModBadgeProps} the mod or slot label, an optional color, and native span props
 *        (children replace the shown text; a `title` can name the bucket)
 * @returns {JSX.Element} a rounded pill in the color (or the bucket's), dark text on color, c2 on
 *          neutral
 */
export function ModBadge({ mod, color, className, children, ...props }: ModBadgeProps) {
  return (
    <span className={cx(BASE, colorClasses(color, mod), className)} {...props}>
      {children ?? mod}
    </span>
  );
}
