/**
 * @file src/components/actions/PaginationButton.tsx
 * @desc Pagination's Previous or Next button in button mode (internal). At the first or last page
 *       it stays in place and keeps focus, but ignores presses (aria-disabled). Its classes arrive
 *       finished from Pagination, so it imports no class merging.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import type { ReactNode } from "react";

/** The page it goes to, whether it's off, the handler, finished classes and its text. */
export type PaginationButtonProps = {
  page: number;
  off: boolean;
  onPageChange: (page: number) => void;
  className: string;
  children: ReactNode;
};

/**
 * @function PaginationButton
 * @param props {PaginationButtonProps} the target page, whether there is none, the page handler,
 *        classes and text
 * @returns {JSX.Element} a `<button type="button">` that calls `onPageChange(page)` unless it's off
 */
export function PaginationButton({
  page,
  off,
  onPageChange,
  className,
  children,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-disabled={off || undefined}
      className={className}
      onClick={() => {
        if (!off) onPageChange(page);
      }}
    >
      {children}
    </button>
  );
}
