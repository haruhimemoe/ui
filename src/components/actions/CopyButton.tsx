/**
 * @file src/components/actions/CopyButton.tsx
 * @desc A button that copies text to the clipboard and reports the result in an <output> beside
 *       it (a polite live region), like the packs export and doc pages. If the clipboard is
 *       missing or refuses, it says so and tells the reader to copy by hand. Each press empties
 *       the status first and then writes the result as a new node, so a second copy is announced
 *       too. Only the latest press reports: a slow earlier copy that settles later is ignored.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import type { ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Button, type ButtonProps } from "../basics/Button.js";
import { RESERVED_STATUS, StatusOutput } from "./StatusOutput.js";
import { useLatestStatus } from "./useLatestStatus.js";

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
  /** "end" (default) puts the status after the button; "start" puts it before. */
  statusPosition?: "end" | "start" | undefined;
  /** Keeps the status's width (as wide as "Copied.") so a press never moves the button. */
  reserveStatus?: boolean | undefined;
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
  statusPosition = "end",
  reserveStatus = false,
  variant = "secondary",
  ...props
}: CopyButtonProps) {
  const { status, start, settle } = useLatestStatus<"copied" | "failed">();

  const copy = async () => {
    const run = start();
    try {
      await navigator.clipboard.writeText(text);
      settle(run, "copied");
    } catch {
      settle(run, "failed");
    }
  };

  const output = (
    <StatusOutput run={status?.run ?? null} className={reserveStatus ? RESERVED_STATUS : undefined}>
      {status?.result === "copied" ? copiedMessage : failedMessage}
    </StatusOutput>
  );

  return (
    <div className={cx("flex flex-wrap items-center gap-3", wrapperClassName)}>
      {statusPosition === "start" ? output : null}
      <Button variant={variant} onClick={copy} {...props}>
        {label}
      </Button>
      {statusPosition === "end" ? output : null}
    </div>
  );
}
