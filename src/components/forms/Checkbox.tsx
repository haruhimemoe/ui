/**
 * @file src/components/forms/Checkbox.tsx
 * @desc Checkbox with a bold label and an inline hint (the packs download-options look). The whole
 *       row toggles it; the label alone is its accessible name and the hint its description.
 *       Server-safe: the required id names the label, hint and error.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { FieldError, type FieldProps, fieldDescribedBy, hintId } from "./FieldFrame.js";

/** Every native checkbox `<input>` prop (including `ref`), plus an id, label, hint and error. */
export type CheckboxProps = Omit<ComponentProps<"input">, "id" | "type"> & FieldProps;

/**
 * @function Checkbox
 * @param props {CheckboxProps} native input props (`checked`, `defaultChecked`, `onChange`...),
 *        plus id, label, hint, error and wrapperClassName; `className` goes on the `<input>`
 * @returns {JSX.Element} the checkbox row, and the error under it when given
 */
export function Checkbox({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: CheckboxProps) {
  const labelId = `${id}-label`;
  return (
    <div className={cx("flex flex-col gap-1", wrapperClassName)}>
      <label htmlFor={id} className="flex items-start gap-2 text-sm">
        <input
          {...props}
          type="checkbox"
          id={id}
          aria-labelledby={labelId}
          aria-describedby={fieldDescribedBy(id, hint, error, describedBy)}
          aria-invalid={error ? true : invalid}
          className={cx("mt-1 accent-h1", className)}
        />
        <span>
          <span id={labelId} className="font-bold text-c1">
            {label}
          </span>
          {hint ? (
            <span className="text-c3">
              {" · "}
              <span id={hintId(id)}>{hint}</span>
            </span>
          ) : null}
        </span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}
