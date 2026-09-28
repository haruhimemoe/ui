/**
 * @file src/components/actions/StatusOutput.tsx
 * @desc The `<output>` beside CopyButton and AsyncButton (internal): a polite live region whose
 *       message mounts as a new node on every run, so the same text twice is announced twice.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ReactNode } from "react";

/** The run the message belongs to (null for none), and the message. */
export type StatusOutputProps = {
  run: number | null;
  children?: ReactNode;
};

/**
 * @function StatusOutput
 * @param props {StatusOutputProps} the run's number and its message
 * @returns {JSX.Element} an `<output>` in c3 at text-sm, holding the message keyed by its run
 */
export function StatusOutput({ run, children }: StatusOutputProps) {
  return (
    <output className="text-c3 text-sm">
      {run === null ? null : <span key={run}>{children}</span>}
    </output>
  );
}
