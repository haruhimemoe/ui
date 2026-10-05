/**
 * @file src/components/actions/StatusOutput.tsx
 * @desc The `<output>` beside CopyButton and AsyncButton (internal): a polite live region whose
 *       message mounts as a new node on every run, so the same text twice is announced twice.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";

/** The reserved status width: as wide as "Copied.", text against the button. */
export const RESERVED_STATUS = "min-w-[4.5rem] text-end";

/** The run the message belongs to (null for none), the message, and extra classes. */
export type StatusOutputProps = {
  run: number | null;
  children?: ReactNode;
  /** Appended to the output's classes (no merge: finished strings only). */
  className?: string | undefined;
};

/**
 * @function StatusOutput
 * @param props {StatusOutputProps} the run's number, its message and extra classes
 * @returns {JSX.Element} an `<output>` in c3 at text-sm, holding the message keyed by its run
 */
export function StatusOutput({ run, children, className }: StatusOutputProps) {
  return (
    <output className={className ? `text-c3 text-sm ${className}` : "text-c3 text-sm"}>
      {run === null ? null : <span key={run}>{children}</span>}
    </output>
  );
}
