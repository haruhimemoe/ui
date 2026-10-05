/**
 * @file src/components/basics/StatList.tsx
 * @desc A label/value stat list as a `<dl>`, one `<div>` per pair: `inline` (a wrapping row),
 *       `tiles` (b4 boxes) or `grid` (two columns on phones, `columns` from sm). One label style
 *       for all three: c4 at text-xs. Values are ReactNode ("…" while loading, a StarRating).
 *       Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** One stat: its label, its value, and an optional React key. */
export type StatItem = { label: ReactNode; value: ReactNode; key?: string | undefined };

/** `inline` (default), `tiles` or `grid`. */
export type StatListVariant = "inline" | "tiles" | "grid";

/** Every native `<dl>` prop, plus the stats, the variant and the grid's column count. */
export type StatListProps = Omit<ComponentProps<"dl">, "children"> & {
  items: readonly StatItem[];
  variant?: StatListVariant | undefined;
  /** Grid only: 2 on phones, this many from sm (default 4). */
  columns?: 2 | 3 | 4 | undefined;
};

const LIST: Record<StatListVariant, string> = {
  inline: "flex flex-wrap gap-x-6 gap-y-2",
  tiles: "flex flex-wrap gap-2",
  grid: "grid grid-cols-2 gap-x-6 gap-y-2",
};
const GROUP: Record<StatListVariant, string | undefined> = {
  inline: "flex flex-col",
  tiles: "min-w-24 rounded-[10px] bg-b4 px-3 py-2",
  grid: undefined,
};
const GRID_COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" } as const;

/** The item's key: its own, a label no other item shares, or its index. */
const keyOf = (item: StatItem, index: number, items: readonly StatItem[]): string => {
  if (item.key !== undefined) return item.key;
  const { label } = item;
  if (typeof label === "string" && items.filter((other) => other.label === label).length === 1) {
    return label;
  }
  return `#${index}`;
};

/**
 * @function StatList
 * @param props {StatListProps} the stats, the variant (default "inline"), the grid's columns
 *        (default 4), plus native dl props; on a b4 parent pass `className="[&>div]:bg-b3"` for tiles
 * @returns {JSX.Element} the `<dl>`
 */
export function StatList({
  items,
  variant = "inline",
  columns = 4,
  className,
  ...props
}: StatListProps) {
  return (
    <dl
      className={cx(
        "text-sm",
        LIST[variant],
        variant === "grid" ? GRID_COLUMNS[columns] : undefined,
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div key={keyOf(item, index, items)} className={GROUP[variant]}>
          <dt className="text-c4 text-xs">{item.label}</dt>
          <dd className="font-bold text-c1 tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
