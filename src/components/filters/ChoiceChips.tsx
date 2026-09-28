/**
 * @file src/components/filters/ChoiceChips.tsx
 * @desc One choice from a few, as a real radio group drawn as chips (the pools status and type
 *       filters): native radio inputs under one name, so Tab reaches the checked chip, the arrow
 *       keys move and pick, and screen readers hear "radio, 1 of 3, checked". Same look as Chip,
 *       with the focus ring on the chip, not the hidden input. A labelled fieldset like ChipGroup.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { CHIP, CHIP_OFF, CHIP_ON, CHIP_UNAVAILABLE } from "./chipStyles.js";
import { GroupFrame, type GroupFrameProps } from "./GroupFrame.js";

/** One choice: the value it stands for, what it shows, and whether it can be picked. */
export type ChoiceChipOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean | undefined;
};

/**
 * Every native `<fieldset>` prop except `onChange`, `children` and `defaultValue`, plus `label`
 * and `hideLabel` (as on ChipGroup), the options, the picked value and the radios' name.
 */
export type ChoiceChipsProps<T extends string = string> = Omit<
  GroupFrameProps,
  "onChange" | "children" | "defaultValue"
> & {
  options: readonly ChoiceChipOption<T>[];
  /** The picked value. */
  value: T;
  /** Called with the value of the chip that was picked. */
  onChange: (value: T) => void;
  /** The radios' name, for a form (default: a generated one). */
  name?: string | undefined;
};

// A label around a hidden radio: it shows the input's focus and disabled state itself.
const LABEL =
  "cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-h1 has-focus-visible:outline-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-40";

/**
 * @function ChoiceChips
 * @param props {ChoiceChipsProps} label, options, the picked value and a change handler, plus
 *        native fieldset props (`disabled` turns off every chip). Render it from client code.
 * @returns {JSX.Element} a `<fieldset>` named by its label, with one radio chip per option
 */
export function ChoiceChips<T extends string = string>({
  options,
  value,
  onChange,
  name,
  ...props
}: ChoiceChipsProps<T>) {
  const generated = useId();
  return (
    <GroupFrame {...props}>
      <div className="flex flex-wrap items-center gap-1">
        {options.map((option) => {
          const on = option.value === value;
          return (
            <label
              key={option.value}
              className={cx(
                CHIP,
                LABEL,
                on ? CHIP_ON : CHIP_OFF,
                !on && !option.disabled && "hover:bg-b2",
                option.disabled && CHIP_UNAVAILABLE,
              )}
            >
              <input
                type="radio"
                name={name ?? generated}
                value={option.value}
                checked={on}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </GroupFrame>
  );
}
