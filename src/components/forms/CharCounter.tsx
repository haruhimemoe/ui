/**
 * @file src/components/forms/CharCounter.tsx
 * @desc How much of a length limit a text uses ("1,234 / 60,000 characters"), turning rose and
 *       saying how many to cut once it's over. The caller counts (a BBCode counter, a string's
 *       length), so it fits any rule. Server-safe. Moved from bb.haruhime.moe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { textClasses } from "../basics/textStyles.js";

/** Every native `<p>` prop except children, plus the count, the limit and the unit. */
export type CharCounterProps = Omit<ComponentProps<"p">, "children"> & {
  /** How many are used. */
  count: number;
  /** The most allowed. */
  limit: number;
  /** What is counted (default "characters"). */
  unit?: string | undefined;
  /** Announce "N over the limit" to screen readers when the count goes over (and silence when it comes back). */
  live?: boolean | undefined;
};

const format = (value: number): string => value.toLocaleString("en-US");

/**
 * @function CharCounter
 * @param props {CharCounterProps} the count, the limit, the unit, and native `<p>` props
 * @returns {JSX.Element} "count / limit unit" in c3, or in bold rose with ": N over the limit"
 */
export function CharCounter({
  count,
  limit,
  unit = "characters",
  live = false,
  className,
  ...props
}: CharCounterProps) {
  const over = count - limit;
  const overText = over > 0 ? `${format(over)} over the limit` : "";
  const shown = `${format(count)} / ${format(limit)} ${unit}${over > 0 ? `: ${overText}` : ""}`;
  return (
    <p
      className={textClasses({
        tone: over > 0 ? "error" : "muted",
        bold: over > 0,
        className: cx("tabular-nums", className),
      })}
      {...props}
    >
      {live ? (
        <>
          <span aria-hidden="true">{shown}</span>
          {/* Only the over-limit text is live, so typing isn't read out number by number. */}
          <output aria-live="polite" className="sr-only">
            {overText}
          </output>
        </>
      ) : (
        shown
      )}
    </p>
  );
}
