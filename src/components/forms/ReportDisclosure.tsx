/**
 * @file src/components/forms/ReportDisclosure.tsx
 * @desc "Report this": a Disclosure holding a reason field and a submit button. The caller sends
 *       the reason (`onSubmit`) and says how it went: done (the form goes away and the page says
 *       so, thanks or "already reported") or an error (shown on the field, for a retry). One send
 *       at a time; a throw reads as `failedMessage`. Moved from bb.haruhime.moe (ReportForm).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../basics/Button.js";
import { Disclosure } from "../basics/Disclosure.js";
import { Textarea } from "./Textarea.js";

/** What `onSubmit` says: done (with what to say) or not (with the error). */
export type ReportResult = { ok: true; message?: ReactNode } | { ok: false; message: ReactNode };

/** ReportDisclosure's props. */
export type ReportDisclosureProps = {
  /** Sends the trimmed reason. */
  onSubmit: (reason: string) => Promise<ReportResult>;
  /** The disclosure button's text (default "Report"). */
  summary?: ReactNode;
  /** The reason field's label (default "What's wrong with it?"). */
  label?: ReactNode;
  /** Help under the field. */
  hint?: ReactNode;
  /** The submit button's text (default "Send report"). */
  submitLabel?: ReactNode;
  /** The submit button's text while sending (default "Sending…"). */
  pendingLabel?: ReactNode;
  /** Said once sent, when the result has no message (default "Thanks. Your report was sent."). */
  sentMessage?: ReactNode;
  /** Said when `onSubmit` throws (default "Couldn't send the report. Try again."). */
  failedMessage?: ReactNode;
  /** The reason's shortest length (default 3). */
  minLength?: number | undefined;
  /** The reason's longest length. */
  maxLength?: number | undefined;
  /** The field's height in rows (default 3). */
  rows?: number | undefined;
  /** Classes for the wrapper. */
  className?: string | undefined;
};

/**
 * @function ReportDisclosure
 * @param props {ReportDisclosureProps} the send callback, the words and the reason's limits
 * @returns {JSX.Element} the disclosure with its form, or the status once sent
 */
export function ReportDisclosure({
  onSubmit,
  summary = "Report",
  label = "What's wrong with it?",
  hint,
  submitLabel = "Send report",
  pendingLabel = "Sending…",
  sentMessage = "Thanks. Your report was sent.",
  failedMessage = "Couldn't send the report. Try again.",
  minLength = 3,
  maxLength,
  rows = 3,
  className,
}: ReportDisclosureProps) {
  const id = useId();
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const [done, setDone] = useState<ReactNode>(null);
  const running = useRef(false);
  const status = useRef<HTMLParagraphElement>(null);
  // The form goes away with the button that had focus, so focus lands on the outcome instead
  // of falling to the body.
  useEffect(() => {
    if (done !== null) status.current?.focus();
  }, [done]);
  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (running.current) return;
    running.current = true;
    setPending(true);
    setError(null);
    try {
      const result = await onSubmit(reason.trim());
      if (result.ok) setDone(result.message ?? sentMessage);
      else setError(result.message);
    } catch {
      setError(failedMessage);
    }
    running.current = false;
    setPending(false);
  };
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {done === null ? (
        <Disclosure summary={summary}>
          <form className="flex flex-col gap-2" onSubmit={send}>
            <Textarea
              id={`${id}-reason`}
              label={label}
              hint={hint}
              error={error ?? undefined}
              value={reason}
              rows={rows}
              minLength={minLength}
              maxLength={maxLength}
              required
              onChange={(event) => setReason(event.currentTarget.value)}
            />
            <Button type="submit" variant="secondary" disabled={pending} className="self-start">
              {pending ? pendingLabel : submitLabel}
            </Button>
          </form>
        </Disclosure>
      ) : null}
      {/* Mounted from the start (empty), so the outcome is announced when it arrives. */}
      <p
        ref={status}
        role="status"
        tabIndex={-1}
        className={done === null ? "sr-only" : "text-c2 text-sm"}
      >
        {done}
      </p>
    </div>
  );
}
