/**
 * @file src/components/filters/ChipGroup.tsx
 * @desc Labeled multi-select row of Chips (mods, game modes). Each chip is its own toggle button
 *       in the tab order; the group reports the picked values in the options' order.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import type { ReactNode } from "react";
import { Chip } from "./Chip.js";
import { GroupFrame, type GroupFrameProps } from "./GroupFrame.js";

/** One chip: the value it stands for, what it shows, and whether it can be toggled. */
export type ChipOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean | undefined;
  /** Why the chip can't be picked right now; it stays focusable. See Chip. */
  unavailableReason?: ReactNode;
};

/**
 * Every native `<fieldset>` prop except `onChange` and `children`, plus `label` (names the group)
 * and `hideLabel` (leave the name to a surrounding FilterRow), the options and the picked values.
 */
export type ChipGroupProps = Omit<GroupFrameProps, "onChange" | "children"> & {
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
export function ChipGroup({ options, value, onChange, ...props }: ChipGroupProps) {
  return (
    <GroupFrame {...props}>
      <div className="flex flex-wrap items-center gap-1">
        {options.map((option) => (
          <Chip
            key={option.value}
            pressed={value.includes(option.value)}
            disabled={option.disabled}
            unavailableReason={option.unavailableReason}
            onPressedChange={(on) => onChange(toggleValue(value, option.value, on, options))}
          >
            {option.label}
          </Chip>
        ))}
      </div>
    </GroupFrame>
  );
}
