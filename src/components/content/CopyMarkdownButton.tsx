/**
 * @file src/components/content/CopyMarkdownButton.tsx
 * @desc A button that fetches a page's raw Markdown and copies it to the clipboard, reporting the
 *       result in an `<output>` beside it (a polite live region), for a doc page's "Copy as
 *       Markdown" action. Any failure (the fetch rejects, the response isn't ok, or the clipboard
 *       refuses) announces the same failure message; the button never throws. Its own client file
 *       with finished class strings (no `cx`), so tailwind-merge stays out of the browser bundle
 *       for `ContentPage`, the Server Component that renders it. Not a wrapper around
 *       `CopyButton`, which imports `cx`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { ReactNode } from "react";
import { StatusOutput } from "../actions/StatusOutput.js";
import { useLatestStatus } from "../actions/useLatestStatus.js";

/** `CopyMarkdownButton`'s props. */
export type CopyMarkdownButtonProps = {
  /** Fetched on click; the response body is copied to the clipboard. */
  href: string;
  /** The button's text. Defaults to "Copy as Markdown". */
  label?: ReactNode | undefined;
  /** Status after a successful copy. Defaults to "Copied". */
  copiedLabel?: ReactNode | undefined;
  /** Status when the fetch, the response, or the clipboard fails. Defaults to "Couldn't copy". */
  failedLabel?: ReactNode | undefined;
};

// buttonClasses({ variant: "secondary" }) copied as a literal, so this file imports no cx.
const BUTTON_CLASS_NAME =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h1 disabled:cursor-not-allowed disabled:opacity-50 bg-b3 text-c1 not-disabled:hover:bg-b2 h-9 px-4 text-sm";

/**
 * @function CopyMarkdownButton
 * @param props {CopyMarkdownButtonProps} the Markdown source's URL, plus optional label and
 *        status text
 * @returns {JSX.Element} the button and an `<output>` that announces the copy's result
 */
export function CopyMarkdownButton({
  href,
  label = "Copy as Markdown",
  copiedLabel = "Copied",
  failedLabel = "Couldn't copy",
}: CopyMarkdownButtonProps) {
  const { status, start, settle } = useLatestStatus<"copied" | "failed">();

  const copy = async () => {
    const run = start();
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error(String(response.status));
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      settle(run, "copied");
    } catch {
      settle(run, "failed");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className={BUTTON_CLASS_NAME} onClick={copy}>
        {label}
      </button>
      <StatusOutput run={status?.run ?? null}>
        {status?.result === "copied" ? copiedLabel : failedLabel}
      </StatusOutput>
    </div>
  );
}
