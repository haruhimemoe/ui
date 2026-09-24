/**
 * @file src/components/actions/CopyButton.tsx
 * @desc A button that copies text to the clipboard and reports the result in an <output> beside
 *       it (a polite live region), like the packs export and doc pages. If the clipboard is
 *       missing or refuses, it says so and tells the reader to copy by hand. Each press empties
 *       the status first and then writes the result as a new node, so a second copy is announced
 *       too.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { type ReactNode, useRef, useState } from "react";
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
  const [status, setStatus] = useState<{ result: "copied" | "failed"; press: number } | null>(null);
  const presses = useRef(0);

  const copy = async () => {
    // Empty the live region, then fill it with a fresh node: a status that never changes (the
    // same "Copied." twice) is not announced again.
    setStatus(null);
    const press = ++presses.current;
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ result: "copied", press });
    } catch {
      setStatus({ result: "failed", press });
    }
  };

  return (
    <div className={cx("flex flex-wrap items-center gap-3", wrapperClassName)}>
      <Button variant={variant} onClick={copy} {...props}>
        {label}
      </Button>
      <output className="text-c3 text-sm">
        {status ? (
          <span key={status.press}>
            {status.result === "copied" ? copiedMessage : failedMessage}
          </span>
        ) : null}
      </output>
    </div>
  );
}
