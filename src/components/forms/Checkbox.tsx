/**
 * @file src/components/forms/Checkbox.tsx
 * @desc Checkbox with a bold label and an inline hint (the packs download-options look). The whole
 *       row toggles it; the label alone is its accessible name (plus any aria-labelledby the
 *       caller adds) and the hint its description. Server-safe: the required id names the label,
 *       hint and error.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { FieldError, type FieldProps, fieldControlProps, hintId } from "./FieldFrame.js";

/** Every native checkbox `<input>` prop (including `ref`), plus an id, label, hint and error. */
export type CheckboxProps = Omit<ComponentProps<"input">, "id" | "type"> & FieldProps;

/**
 * @function Checkbox
 * @param props {CheckboxProps} native input props (`checked`, `defaultChecked`, `onChange`...),
 *        plus id, label, hideLabel, hint, error and wrapperClassName; `className` goes on the
 *        `<input>`
 * @returns {JSX.Element} the checkbox row, and the error under it when given
 */
export function Checkbox({
  id,
  label,
  hideLabel,
  hint,
  error,
  wrapperClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  "aria-labelledby": labelledBy,
  ...props
}: CheckboxProps) {
  const labelId = `${id}-label`;
  return (
    <div className={cx("flex flex-col gap-1", wrapperClassName)}>
      <label htmlFor={id} className="flex items-start gap-2 coarse:py-2.5 text-sm">
        <input
          {...props}
          type="checkbox"
          {...fieldControlProps({ id, hint, error, describedBy, invalid })}
          // The label first, then the caller's own ids: a plain join, since these are ids.
          aria-labelledby={labelledBy ? `${labelId} ${labelledBy}` : labelId}
          // 24px, the WCAG 2.2 target size; -mt-0.5 centers it on the first text-sm line.
          className={cx("-mt-0.5 size-6 shrink-0 accent-h1", className)}
        />
        <span>
          <span id={labelId} className={cx("font-bold text-c1", hideLabel && "sr-only")}>
            {label}
          </span>
          {hint ? (
            <span className="text-c3">
              {hideLabel ? null : " · "}
              <span id={hintId(id)}>{hint}</span>
            </span>
          ) : null}
        </span>
      </label>
      <FieldError id={id} error={error} />
    </div>
  );
}
