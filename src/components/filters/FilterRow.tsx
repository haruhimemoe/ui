/**
 * @file src/components/filters/FilterRow.tsx
 * @desc One labeled row of a filter panel (osu! beatmap listing layout): the label in a column on
 *       the left and the controls on the right from `sm` up, stacked on phones.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<fieldset>` prop (including `ref`), plus the row's label. */
export type FilterRowProps = ComponentProps<"fieldset"> & {
  /** Shown in the label column; names the row (`role="group"` + `aria-labelledby`). */
  label: ReactNode;
};

/**
 * @function FilterRow
 * @param props {FilterRowProps} the label, the row's controls as children, and native fieldset
 *        props
 * @returns {JSX.Element} a `<fieldset>` (role group) labeled by its label column. Give a
 *          ChipGroup or RangeSlider inside it `hideLabel`, so the label shows and is read once.
 */
export function FilterRow({ label, className, children, ...props }: FilterRowProps) {
  const labelId = useId();
  return (
    <fieldset
      aria-labelledby={labelId}
      className={cx("flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4", className)}
      {...props}
    >
      <span id={labelId} className="shrink-0 font-bold text-c3 text-sm sm:w-28">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </fieldset>
  );
}
