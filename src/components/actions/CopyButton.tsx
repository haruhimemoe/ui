/**
 * @file src/components/actions/CopyButton.tsx
 * @desc A button that copies text to the clipboard and reports the result in an <output> beside
 *       it (a polite live region), like the packs export and doc pages. If the clipboard is
 *       missing or refuses, it says so and tells the reader to copy by hand.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { type ReactNode, useState } from "react";
import { cx } from "../../utils/cx.js";
import { Button, type ButtonProps } from "../basics/Button.js";

/** Every Button prop (native button props, variant, size) except children and onClick. */
export type CopyButtonProps = Omit<ButtonProps, "children" | "onClick"> & {
  /** The text to copy. */
  text: string;
  /** The button's text. Defaults to "Copy". */
  label?: ReactNode | undefined;
  /** Status after a successful copy. Defaults to "Copied.". */
  copiedMessage?: ReactNode | undefined;
  /** Status when the clipboard is missing or refuses. */
  failedMessage?: ReactNode | undefined;
  /** Classes for the wrapper around the button and its status. */
  wrapperClassName?: string | undefined;
};

/**
 * @function CopyButton
 * @param props {CopyButtonProps} the text to copy, optional label and status messages, plus
 *        Button props (`variant` defaults to "secondary"; `className` styles the button itself)
 * @returns {JSX.Element} the button and an `<output>` that announces "Copied." or the failure
 */
export function CopyButton({
  text,
  label = "Copy",
  copiedMessage = "Copied.",
  failedMessage = "Couldn't copy. Select the text and copy it by hand.",
  wrapperClassName,
  variant = "secondary",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState<"copied" | "failed" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  };

  return (
    <div className={cx("flex flex-wrap items-center gap-3", wrapperClassName)}>
      <Button variant={variant} onClick={copy} {...props}>
        {label}
      </Button>
      <output className="text-c3 text-sm">
        {copied === "copied" ? copiedMessage : copied === "failed" ? failedMessage : ""}
      </output>
    </div>
  );
}
