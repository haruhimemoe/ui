/**
 * @file src/components/forms/Textarea.tsx
 * @desc Labeled textarea on the shared field look (at least 6rem tall, resizes vertically), with
 *       an optional hint and error wired through aria-describedby and aria-invalid. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { FieldFrame, type FieldProps, fieldDescribedBy } from "./FieldFrame.js";
import { fieldClasses } from "./fieldStyles.js";

/** Every native `<textarea>` prop (including `ref`), plus a required id, label, hint and error. */
export type TextareaProps = Omit<ComponentProps<"textarea">, "id"> & FieldProps;

/**
 * @function Textarea
 * @param props {TextareaProps} native textarea props, plus id, label, hint, error and
 *        wrapperClassName; `className` goes on the `<textarea>`
 * @returns {JSX.Element} a label, the textarea, and the hint and error when given
 */
export function Textarea({
  id,
  label,
  hint,
  error,
  wrapperClassName,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...props
}: TextareaProps) {
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <textarea
        {...props}
        id={id}
        aria-describedby={fieldDescribedBy(id, hint, error, describedBy)}
        aria-invalid={error ? true : invalid}
        className={fieldClasses(cx("min-h-24 resize-y", className))}
      />
    </FieldFrame>
  );
}
