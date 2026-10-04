/**
 * @file src/components/brand/BrandSwatch.tsx
 * @desc One palette token on a brand page: a button showing the color, its token and its hex,
 *       that copies the hex to the clipboard and reports the result in an `<output>` beside it.
 *       The color comes from the brand data through an inline `backgroundColor` (hue-independent,
 *       like `StarRating`). Its own client file with finished class strings (no `cx`), so
 *       `BrandPage`, the Server Component that renders it, ships no tailwind-merge.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { ReactNode } from "react";
import { StatusOutput } from "../actions/StatusOutput.js";
import { useLatestStatus } from "../actions/useLatestStatus.js";

/** `BrandSwatch`'s props. */
export type BrandSwatchProps = {
  /** The palette token's name ("h1", "b6"). */
  token: string;
  /** The token's color as `"#rrggbb"`; shown, painted and copied. */
  hex: string;
  /** Status after a successful copy. Defaults to "Copied". */
  copiedLabel?: ReactNode | undefined;
  /** Status when the clipboard refuses. Defaults to "Couldn't copy". */
  failedLabel?: ReactNode | undefined;
};

const BUTTON_CLASS_NAME =
  "flex w-full items-center gap-3 rounded-md bg-b5 p-2 text-left transition-colors hover:bg-b3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h1";

/**
 * @function BrandSwatch
 * @param props {BrandSwatchProps} the token, its hex, and optional status text
 * @returns {JSX.Element} the click-to-copy swatch button and its status `<output>`
 */
export function BrandSwatch({
  token,
  hex,
  copiedLabel = "Copied",
  failedLabel = "Couldn't copy",
}: BrandSwatchProps) {
  const { status, start, settle } = useLatestStatus<"copied" | "failed">();

  const copy = async () => {
    const run = start();
    try {
      await navigator.clipboard.writeText(hex);
      settle(run, "copied");
    } catch {
      settle(run, "failed");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button type="button" className={BUTTON_CLASS_NAME} onClick={copy}>
        <span
          aria-hidden="true"
          className="size-10 shrink-0 rounded-md border border-b2"
          style={{ backgroundColor: hex }}
        />
        <span className="flex flex-col">
          <span className="font-bold text-c1">{token}</span>
          <span className="font-mono text-c3 text-sm">{hex}</span>
        </span>
      </button>
      <StatusOutput run={status?.run ?? null}>
        {status?.result === "copied" ? copiedLabel : failedLabel}
      </StatusOutput>
    </div>
  );
}
