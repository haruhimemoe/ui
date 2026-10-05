/**
 * @file src/components/forms/SegmentedControl.tsx
 * @desc A two to four way view switch drawn like Tabs' pill track, built on native radios: Tab
 *       lands on the checked one, arrows move and pick, screen readers hear "radio, 1 of 2,
 *       checked". `hideLabel` keeps the group named through an sr-only legend. 24px at `sm`,
 *       44px on coarse pointers. For links that switch a view, use LinkTabs; for a filter among
 *       other chips, ChoiceChips.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { FIELD_LABEL } from "./fieldStyles.js";

/** One choice: its value, what it shows, and whether it can be picked. */
export type SegmentedOption<T extends string = string> = {
  value: T;
  label: ReactNode;
  disabled?: boolean | undefined;
};

/** Every native `<fieldset>` prop except onChange, children and defaultValue, plus the choices. */
export type SegmentedControlProps<T extends string = string> = Omit<
  ComponentProps<"fieldset">,
  "onChange" | "children" | "defaultValue"
> & {
  /** The legend, which names the group. */
  label: ReactNode;
  /** Hide the legend visually; the group keeps its name (unlike GroupFrame's hideLabel). */
  hideLabel?: boolean | undefined;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** The radios' name (default: a generated one). */
  name?: string | undefined;
  /** "sm": text-xs, 24px. "md" (default): text-sm, 32px. */
  size?: "sm" | "md" | undefined;
};

const TRACK =
  "flex w-fit gap-1 rounded-full bg-b4 p-1 contrast-more:inset-ring contrast-more:inset-ring-c4 forced-colors:border";
const OPTION =
  "inline-flex cursor-pointer items-center rounded-full px-3 transition-colors coarse:min-h-11 has-focus-visible:outline-2 has-focus-visible:outline-h1 has-focus-visible:outline-offset-2 has-disabled:cursor-not-allowed has-disabled:text-c4 forced-colors:has-disabled:text-[GrayText]";
const SIZES = { sm: "min-h-6 text-xs", md: "h-8 text-sm" } as const;

/**
 * @function SegmentedControl
 * @param props {SegmentedControlProps} legend, hideLabel, options, value, onChange, name, size
 *        (default "md"), plus native fieldset props. Render it from client code.
 * @returns {JSX.Element} the fieldset with one radio per option
 */
export function SegmentedControl<T extends string = string>({
  label,
  hideLabel = false,
  options,
  value,
  onChange,
  name,
  size = "md",
  className,
  ...props
}: SegmentedControlProps<T>) {
  const generated = useId();
  return (
    <fieldset className={cx("min-w-0", className)} {...props}>
      <legend className={hideLabel ? "sr-only" : cx(FIELD_LABEL, "mb-1")}>{label}</legend>
      <div className={TRACK}>
        {options.map((option) => {
          const on = option.value === value;
          return (
            <label
              key={option.value}
              className={cx(
                OPTION,
                SIZES[size],
                on ? "bg-h2 text-c1 forced-colors:underline" : "text-c3 hover:text-c1",
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
    </fieldset>
  );
}
