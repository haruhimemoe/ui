/**
 * @file src/components/mdx/CodeCopyButton.tsx
 * @desc The copy button CodeBlock renders beside a code fence's header: copies the plain code
 *       text and reports "Copied" or "Copy failed" in a polite live region, like CopyButton. A
 *       server component (CodeBlock) renders this client file, so it takes a finished class
 *       string and never imports cx, keeping tailwind-merge out of the client bundle.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { StatusOutput } from "../actions/StatusOutput.js";
import { useLatestStatus } from "../actions/useLatestStatus.js";

/** The code to copy, and the button's accessible name (e.g. "Copy x.ts" or "Copy code"). */
export type CodeCopyButtonProps = { code: string; label: string };

const BUTTON =
  "inline-flex min-h-6 min-w-6 items-center justify-center rounded px-2 py-0.5 text-c2 text-sm hover:bg-b4 hover:text-c1 coarse:min-h-11 coarse:min-w-11";

/**
 * @function CodeCopyButton
 * @param props {CodeCopyButtonProps} the code to copy and the button's accessible name
 * @returns {JSX.Element} the copy button and an `<output>` announcing "Copied" or "Copy failed"
 */
export function CodeCopyButton({ code, label }: CodeCopyButtonProps) {
  const { status, start, settle } = useLatestStatus<"copied" | "failed">();
  const copy = async () => {
    const run = start();
    try {
      await navigator.clipboard.writeText(code);
      settle(run, "copied");
    } catch {
      settle(run, "failed");
    }
  };
  return (
    <span className="flex items-center gap-2">
      <StatusOutput run={status?.run ?? null}>
        {status?.result === "copied" ? "Copied" : "Copy failed"}
      </StatusOutput>
      <button type="button" aria-label={label} className={BUTTON} onClick={copy}>
        Copy
      </button>
    </span>
  );
}
