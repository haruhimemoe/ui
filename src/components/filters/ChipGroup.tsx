/**
 * @file src/components/filters/ChipGroup.tsx
 * @desc Labeled multi-select row of Chips (mods, game modes). Each chip is its own toggle button
 *       in the tab order; the group reports the picked values in the options' order.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { Chip } from "./Chip.js";

/** One chip: the value it stands for, what it shows, and whether it can be toggled. */
export type ChipOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
};

/** Every native `<fieldset>` prop except `onChange` and `children`, plus label, options, value. */
export type ChipGroupProps = Omit<ComponentProps<"fieldset">, "onChange" | "children"> & {
  /** Names the group (`role="group"` + `aria-labelledby`). */
  label: ReactNode;
  /**
   * Leave the name to a surrounding FilterRow: no label shows, and the fieldset is not a group
   * of its own (role none), so screen readers hear the row's name once.
   */
  hideLabel?: boolean | undefined;
  options: readonly ChipOption[];
  /** The picked values. */
  value: readonly string[];
  /** Called with the new list of picked values, in the options' order. */
  onChange: (value: string[]) => void;
};

/**
 * @function toggleValue
 * @param value {readonly string[]} the picked values
 * @param option {string} the value to switch on or off
 * @param on {boolean} true to add it, false to remove it
 * @param options {readonly ChipOption[]} the group's options, for ordering
 * @returns {string[]} the new picked values without duplicates, in option order (values that
 *          aren't options keep their place at the end)
 */
const toggleValue = (
  value: readonly string[],
  option: string,
  on: boolean,
  options: readonly ChipOption[],
): string[] => {
  const rest = [...new Set(value)].filter((v) => v !== option);
  const next = on ? [...rest, option] : rest;
  const order = new Map(options.map((o, i) => [o.value, i]));
  const rank = (v: string) => order.get(v) ?? options.length;
  return next.sort((a, b) => rank(a) - rank(b));
};

/**
 * @function ChipGroup
 * @param props {ChipGroupProps} label, options, picked values and a change handler, plus native
 *        fieldset props (`disabled` turns off every chip). `onChange` is a function, so render
 *        this from client code.
 * @returns {JSX.Element} a `<fieldset>` (role group) labeled by its label, one Chip per option.
 *          With `hideLabel`, the fieldset has role none and no label.
 */
export function ChipGroup({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  className,
  ...props
}: ChipGroupProps) {
  const labelId = useId();
  return (
    <fieldset
      // Inside a FilterRow (hideLabel), the row's fieldset is the group. A second group with the
      // same name would be read twice. The fieldset stays, so `disabled` still reaches every chip.
      role={hideLabel ? "none" : undefined}
      aria-labelledby={hideLabel ? undefined : labelId}
      className={cx("flex flex-col gap-2", className)}
      {...props}
    >
      {hideLabel ? null : (
        <span id={labelId} className="font-bold text-c3 text-sm">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1">
        {options.map((option) => (
          <Chip
            key={option.value}
            pressed={value.includes(option.value)}
            disabled={option.disabled}
            onPressedChange={(on) => onChange(toggleValue(value, option.value, on, options))}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
