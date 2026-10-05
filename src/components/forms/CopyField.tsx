/**
 * @file src/components/forms/CopyField.tsx
 * @desc A read-only field you copy from (a pack key, a short link, an API key, a magnet link):
 *       TextInput readOnly in mono, focus selects the whole value, then a row with a CopyButton
 *       and the caller's other buttons. The Copy button is described by a hidden copy of the
 *       label ("Copy, Pack key"), never by the input, whose value would be read out.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { type FocusEvent, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { CopyButton } from "../actions/CopyButton.js";
import type { ButtonVariant } from "../basics/buttonStyles.js";
import { TextInput, type TextInputProps } from "./TextInput.js";

/** TextInput's props without the ones CopyField owns, plus the value and the copy row. */
export type CopyFieldProps = Omit<TextInputProps, "id" | "value" | "readOnly" | "onChange"> & {
  /** The input's id (default: a generated one). */
  id?: string | undefined;
  value: string;
  copyLabel?: ReactNode | undefined;
  copiedMessage?: ReactNode | undefined;
  failedMessage?: ReactNode | undefined;
  copyVariant?: ButtonVariant | undefined;
  /** More buttons in the copy row, after Copy (Copy share link, Add magnet link). */
  actions?: ReactNode | undefined;
  /** font-mono on the input (default true). */
  mono?: boolean | undefined;
};

/**
 * @function CopyField
 * @param props {CopyFieldProps} the label and value, the copy texts and variant, actions, mono,
 *        plus TextInput props (`ref`, `hint`, `error`, `hideLabel` reach the input; `className`
 *        styles the input; `wrapperClassName` places the whole field)
 * @returns {JSX.Element} the field and its copy row
 */
export function CopyField({
  id,
  value,
  label,
  copyLabel = "Copy",
  copiedMessage = "Copied.",
  failedMessage = "Couldn't copy. Select the text and copy it by hand.",
  copyVariant = "secondary",
  actions,
  mono = true,
  onFocus,
  wrapperClassName,
  className,
  ...props
}: CopyFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const forId = `${inputId}-copy-for`;
  const select = (event: FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
    event.currentTarget.select();
  };
  return (
    <div className={cx("flex flex-col gap-2", wrapperClassName)}>
      <TextInput
        {...props}
        id={inputId}
        label={label}
        value={value}
        readOnly
        onFocus={select}
        wrapperClassName="gap-2"
        className={cx(mono && "font-mono", className)}
      />
      <span id={forId} hidden>
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          text={value}
          label={copyLabel}
          copiedMessage={copiedMessage}
          failedMessage={failedMessage}
          variant={copyVariant}
          aria-describedby={forId}
        />
        {actions}
      </div>
    </div>
  );
}
