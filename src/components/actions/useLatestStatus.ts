/**
 * @file src/components/actions/useLatestStatus.ts
 * @desc The status that CopyButton and AsyncButton report (internal): each run empties it first,
 *       and only the latest run may fill it, so a slow earlier run can't overwrite a newer result.
 *       Each result carries its run's number, so StatusOutput mounts it as a fresh node and a
 *       repeated message is announced again.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { useRef, useState } from "react";

/** The latest run's result and its number, or null while nothing is to be said. */
export type LatestStatus<T> = { result: T; run: number } | null;

/**
 * @function useLatestStatus
 * @returns {{ status: LatestStatus<T>; start: () => number; settle: (run: number, result: T) =>
 *          void }} the status, `start` (empties it and returns the new run's number) and `settle`
 *          (sets a run's result, unless a later run has started since)
 */
export function useLatestStatus<T>() {
  const [status, setStatus] = useState<LatestStatus<T>>(null);
  const runs = useRef(0);
  const start = (): number => {
    setStatus(null);
    runs.current += 1;
    return runs.current;
  };
  const settle = (run: number, result: T) => {
    if (run === runs.current) setStatus({ result, run });
  };
  return { status, start, settle };
}
