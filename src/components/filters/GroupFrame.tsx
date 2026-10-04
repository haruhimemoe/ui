/**
 * @file src/components/filters/GroupFrame.tsx
 * @desc The labelled fieldset that ChipGroup, ChoiceChips and RangeSlider share (internal): a
 *       `<fieldset>` named by a bold label, or, with `hideLabel`, a bare fieldset with role none
 *       that leaves the name to a surrounding FilterRow. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { FIELD_LABEL } from "../forms/fieldStyles.js";

/** Every native `<fieldset>` prop, plus the group's label and whether a FilterRow names it. */
export type GroupFrameProps = ComponentProps<"fieldset"> & {
  /** Names the group (`aria-labelledby`), shown above the controls. */
  label: ReactNode;
  /**
   * Leave the name to a surrounding FilterRow: no label shows, and the fieldset is not a group
   * of its own (role none), so screen readers hear the row's name once. Unlike the fields'
   * hideLabel (TextInput, RadioGroup...), which keeps the label for screen readers, this one
   * drops it.
   */
  hideLabel?: boolean | undefined;
};

/**
 * @function GroupFrame
 * @param props {GroupFrameProps} the label, hideLabel, the controls as children, and native
 *        fieldset props (`className` merges last)
 * @returns {JSX.Element} a `<fieldset>` labelled by its label, or with role none and no label
 */
export function GroupFrame({
  label,
  hideLabel = false,
  className,
  children,
  ...props
}: GroupFrameProps) {
  const labelId = useId();
  return (
    <fieldset
      // Inside a FilterRow (hideLabel), the row's fieldset is the group. A second group with the
      // same name would be read twice. The fieldset stays, so `disabled` still reaches every
      // control inside it.
      role={hideLabel ? "none" : undefined}
      aria-labelledby={hideLabel ? undefined : labelId}
      className={cx("flex flex-col gap-2", className)}
      {...props}
    >
      {hideLabel ? null : (
        <span id={labelId} className={FIELD_LABEL}>
          {label}
        </span>
      )}
      {children}
    </fieldset>
  );
}
