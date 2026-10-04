/**
 * @file src/components/actions/AsyncButton.tsx
 * @desc A button that runs an async action and says how it went in an <output> beside it (a
 *       polite live region), like the apps' refresh and retry buttons. While the action runs the
 *       button stays focusable but ignores presses (aria-disabled), and can show a pending label.
 *       A rejected action shows the failure message in rose.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { type ReactNode, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";
import { Button, type ButtonProps } from "../basics/Button.js";
import { TEXT_TONES } from "../basics/textTones.js";
import { StatusOutput } from "./StatusOutput.js";
import { useLatestStatus } from "./useLatestStatus.js";

/** Every Button prop except onClick, plus the action and what to say while and after it runs. */
export type AsyncButtonProps = Omit<ButtonProps, "onClick"> & {
  /** Runs on press. What it returns (or resolves to) is shown as the result, e.g. "Done.". */
  action: () => ReactNode | Promise<ReactNode>;
  /** The button's text while the action runs. Defaults to the button's children. */
  pendingLabel?: ReactNode;
  /** Shown when the action throws or rejects: a message, or a function of the error. */
  failedMessage?: ReactNode | ((error: unknown) => ReactNode);
  /** Classes for the wrapper around the button and its status. */
  wrapperClassName?: string | undefined;
};

type Outcome = { message: ReactNode; failed: boolean };

/**
 * @function AsyncButton
 * @param props {AsyncButtonProps} the action, an optional pending label and failure message, plus
 *        Button props (`className` and `ref` go on the button)
 * @returns {JSX.Element} the button and an `<output>` that announces the action's result
 */
export function AsyncButton({
  action,
  pendingLabel,
  failedMessage = "Something went wrong. Try again.",
  wrapperClassName,
  className,
  children,
  ...props
}: AsyncButtonProps) {
  const [pending, setPending] = useState(false);
  // `pending` reaches the button only after a render; two presses in one frame must not both run.
  const running = useRef(false);
  const { status, start, settle } = useLatestStatus<Outcome>();

  const run = async () => {
    if (running.current) return;
    running.current = true;
    setPending(true);
    const id = start();
    try {
      settle(id, { message: await action(), failed: false });
    } catch (error) {
      const message = typeof failedMessage === "function" ? failedMessage(error) : failedMessage;
      settle(id, { message, failed: true });
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  return (
    <div className={cx("flex flex-wrap items-center gap-3", wrapperClassName)}>
      <Button
        aria-disabled={pending || undefined}
        onClick={run}
        className={cx("aria-disabled:cursor-wait aria-disabled:opacity-70", className)}
        {...props}
      >
        {pending && pendingLabel !== undefined ? pendingLabel : children}
      </Button>
      <StatusOutput run={status?.run ?? null}>
        {status?.result.failed ? (
          <span className={TEXT_TONES.error}>{status.result.message}</span>
        ) : (
          status?.result.message
        )}
      </StatusOutput>
    </div>
  );
}
