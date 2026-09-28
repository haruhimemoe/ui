/**
 * @file src/components/osu/StarRating.tsx
 * @desc A star-rating pill colored on osu!'s difficulty spectrum (the packs beatmap cards):
 *       "★ 5.23" on the rating's color. Screen readers hear "5.23 stars" and an optional label
 *       after it (what a `title` tells mouse users). Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { starRatingColor, starRatingTextColor } from "./starColors.js";

/** Every native `<span>` prop except children, plus the rating and what screen readers hear. */
export type StarRatingProps = Omit<ComponentProps<"span">, "children"> & {
  /** The star rating. Shown with two decimals; NaN shows as "–". */
  value: number;
  /** Read after the rating by screen readers, e.g. "with HR". */
  label?: ReactNode;
  /** The word read after the number (default "stars"). */
  unit?: string | undefined;
};

/**
 * @function StarRating
 * @param props {StarRatingProps} the rating, an optional label and unit, and native span props
 *        (`style` merges over the spectrum colors)
 * @returns {JSX.Element} a rounded pill with a star and the rating, colored by the rating
 */
export function StarRating({
  value,
  label,
  unit = "stars",
  className,
  style,
  ...props
}: StarRatingProps) {
  const text = Number.isFinite(value) ? value.toFixed(2) : "–";
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-xs tabular-nums",
        className,
      )}
      style={{
        backgroundColor: starRatingColor(value),
        color: starRatingTextColor(value),
        ...style,
      }}
      {...props}
    >
      <span aria-hidden="true">★</span>
      <span aria-hidden="true">{text}</span>
      {/* One node for screen readers, so its spaces survive: "5.23 stars, with HR". */}
      <span className="sr-only">
        {text} {unit}
        {label ? <>, {label}</> : null}
      </span>
    </span>
  );
}
