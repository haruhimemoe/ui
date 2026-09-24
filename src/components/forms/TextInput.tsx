/**
 * @file src/components/forms/TextInput.tsx
 * @desc Labeled text input on the shared field look, with an optional hint and error wired through
 *       aria-describedby and aria-invalid. Server-safe: the required id names the hint and error.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { FieldFrame, type FieldProps, fieldDescribedBy } from "./FieldFrame.js";
import { fieldClasses } from "./fieldStyles.js";

/** Every native `<input>` prop (including `ref` and `type`), plus an id, label, hint and error. */
export type TextInputProps = Omit<ComponentProps<"input">, "id"> & FieldProps;

/**
 * @function TextInput
 * @param props {TextInputProps} native input props, plus id, label, hint, error and
 *        wrapperClassName; `className` goes on the `<input>`
 * @returns {JSX.Element} a label, the input, and the hint and error when given
 */
export function TextInput({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: TextInputProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <input
        {...props}
        id={id}
        aria-describedby={fieldDescribedBy(id, hint, error, describedBy)}
        aria-invalid={error ? true : invalid}
        className={fieldClasses(className)}
      />
    </FieldFrame>
  );
}
