/**
 * @file src/components/forms/Select.tsx
 * @desc Labeled native select on the shared field look, with an optional hint and error wired
 *       through aria-describedby and aria-invalid. Options come in as children. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { FieldFrame, type FieldProps, fieldDescribedBy } from "./FieldFrame.js";
import { fieldClasses } from "./fieldStyles.js";

/** Every native `<select>` prop (including `ref`), plus a required id, label, hint and error. */
export type SelectProps = Omit<ComponentProps<"select">, "id"> & FieldProps;

/**
 * @function Select
 * @param props {SelectProps} native select props with `<option>` children, plus id, label, hint,
 *        error and wrapperClassName; `className` goes on the `<select>`
 * @returns {JSX.Element} a label, the select, and the hint and error when given
 */
export function Select({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: SelectProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <select
        {...props}
        id={id}
        aria-describedby={fieldDescribedBy(id, hint, error, describedBy)}
        aria-invalid={error ? true : invalid}
        className={fieldClasses(className)}
      />
    </FieldFrame>
  );
}
