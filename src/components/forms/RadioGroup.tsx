/**
 * @file src/components/forms/RadioGroup.tsx
 * @desc A native radio group on the Checkbox look: a fieldset named by its legend, one radio per
 *       option with a bold label and an inline hint, then the group's hint and error. Each
 *       option's label is its accessible name and its hint the description; the group's hint and
 *       error describe the fieldset, and an error marks it invalid. Arrow keys move and pick, as
 *       native radios do. Controlled (`value`) or uncontrolled (`defaultValue`).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { FieldError, fieldDescribedBy, hintId } from "./FieldFrame.js";
import { FIELD_LABEL } from "./fieldStyles.js";

/** One radio: its value, its label, an optional inline hint, and whether it can be picked. */
export type RadioOption = {
  value: string;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean | undefined;
};

/** Every native `<fieldset>` prop except `onChange` and `children`, plus the group's parts. */
export type RadioGroupProps = Omit<
  ComponentProps<"fieldset">,
  "onChange" | "children" | "defaultValue"
> & {
  /** The legend, which names the group. */
  label: ReactNode;
  options: readonly RadioOption[];
  /** The radios' name, for a form (default: a generated one). */
  name?: string | undefined;
  /** The picked value, when the caller holds it. */
  value?: string | undefined;
  /** The value picked at first, when the group holds it. */
  defaultValue?: string | undefined;
  /** Called with the picked option's value. */
  onChange?: ((value: string) => void) | undefined;
  /** Help text under the options, linked to the group with aria-describedby. */
  hint?: ReactNode;
  /** Error text under the options (a list is fine). Marks the group invalid and links it. */
  error?: ReactNode;
  /** Every radio gets `required`, so a form won't submit without a pick. */
  required?: boolean | undefined;
};

/**
 * @function RadioGroup
 * @param props {RadioGroupProps} the legend, options, value or defaultValue, a change handler,
 *        the group's hint and error, plus native fieldset props (`disabled` turns off every radio)
 * @returns {JSX.Element} a `<fieldset>` with its `<legend>`, the radios, and the hint and error
 */
export function RadioGroup({
  label,
  options,
  name,
  value,
  defaultValue,
  onChange,
  hint,
  error,
  required,
  className,
  "aria-describedby": describedBy,
  ...props
}: RadioGroupProps) {
  const id = useId();
  return (
    <fieldset
      aria-describedby={fieldDescribedBy(id, hint, error, describedBy)}
      className={cx("flex flex-col gap-2", className)}
      {...props}
    >
      <legend className={cx("mb-1", FIELD_LABEL)}>{label}</legend>
      {options.map((option, i) => {
        const optionId = `${id}-${i}`;
        return (
          <label key={option.value} className="flex items-start gap-2 text-sm">
            <input
              type="radio"
              id={optionId}
              name={name ?? id}
              value={option.value}
              {...(value === undefined
                ? { defaultChecked: option.value === defaultValue }
                : { checked: option.value === value })}
              disabled={option.disabled}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-labelledby={`${optionId}-label`}
              aria-describedby={option.hint ? hintId(optionId) : undefined}
              onChange={() => onChange?.(option.value)}
              className="mt-1 accent-h1"
            />
            <span>
              <span id={`${optionId}-label`} className="font-bold text-c1">
                {option.label}
              </span>
              {option.hint ? (
                <span className="text-c3">
                  {" · "}
                  <span id={hintId(optionId)}>{option.hint}</span>
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
      {hint ? (
        <div id={hintId(id)} className="text-c4 text-xs">
          {hint}
        </div>
      ) : null}
      <FieldError id={id} error={error} />
    </fieldset>
  );
}
