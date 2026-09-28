/**
 * @file src/components/osu/ModBadge.tsx
 * @desc A mod pool slot's pill (NM1, HD2, TB), colored by its mod bucket the way tournament
 *       sheets and packs.haruhime.moe color them: NM sky, HD amber, HR rose, DT and NC violet,
 *       FM emerald, TB orange. Anything else is a quiet b3 pill; `className` recolors it (a
 *       custom bucket). Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<span>` prop (including `ref`), plus the slot or mod it shows. */
export type ModBadgeProps = ComponentProps<"span"> & {
  /** A mod or slot label ("HD", "NM1", "TB"). Its first two letters pick the color. */
  mod: string;
};

const BUCKETS: Record<string, string> = {
  NM: "bg-sky-400",
  HD: "bg-amber-300",
  HR: "bg-rose-400",
  DT: "bg-violet-400",
  NC: "bg-violet-400",
  FM: "bg-emerald-400",
  TB: "bg-orange-400",
};

const BASE =
  "inline-flex min-w-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-0.5 font-extrabold text-xs";

/**
 * @function ModBadge
 * @param props {ModBadgeProps} the mod or slot label, and native span props (children replace
 *        the shown text; a `title` can name the bucket)
 * @returns {JSX.Element} a rounded pill in the bucket's color with dark text, or b3 with c2 text
 */
export function ModBadge({ mod, className, children, ...props }: ModBadgeProps) {
  const color = BUCKETS[mod.slice(0, 2).toUpperCase()];
  return (
    <span className={cx(BASE, color ? `${color} text-b6` : "bg-b3 text-c2", className)} {...props}>
      {children ?? mod}
    </span>
  );
}
