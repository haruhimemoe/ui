/**
 * @file src/components/actions/Pagination.tsx
 * @desc Previous / next links around "Page X of Y". Renders nothing for a single page. The
 *       caller builds each page's URL, so it works with any query string or route shape. When
 *       the link a keyboard user pressed goes away (Next on the last page), focus moves to the
 *       status text instead of the page body.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { buttonClasses } from "../basics/buttonStyles.js";
import { PaginationStatus } from "./PaginationStatus.js";

/** Every native `<nav>` prop except children, plus the page state and the link builder. */
export type PaginationProps = Omit<ComponentProps<"nav">, "children"> & {
  /** The current page, 1-based. */
  page: number;
  /** How many pages there are. At 1 or fewer, nothing renders. */
  pageCount: number;
  /** Builds the URL for a page number, e.g. `(p) => \`/packs?page=${p}\``. */
  hrefFor: (page: number) => string;
  /** Text of the link to the page before. Defaults to "Previous". */
  previousLabel?: ReactNode | undefined;
  /** Text of the link to the page after. Defaults to "Next". */
  nextLabel?: ReactNode | undefined;
  /** The middle text. Defaults to "Page X of Y". */
  formatStatus?: ((page: number, pageCount: number) => ReactNode) | undefined;
};

const defaultStatus = (page: number, pageCount: number): ReactNode =>
  `Page ${page} of ${pageCount}`;

/**
 * @function Pagination
 * @param props {PaginationProps} page, pageCount and hrefFor, optional labels, plus native nav
 *        props (`aria-label` defaults to "Pages")
 * @returns {JSX.Element | null} a `<nav>` with previous / next pill links, or null for one page
 */
export function Pagination({
  page,
  pageCount,
  hrefFor,
  previousLabel = "Previous",
  nextLabel = "Next",
  formatStatus = defaultStatus,
  className,
  ...props
}: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <nav
      aria-label="Pages"
      className={cx("flex items-center justify-between gap-3 text-sm", className)}
      {...props}
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className={buttonClasses({ variant: "secondary" })}
        >
          {previousLabel}
        </Link>
      ) : (
        <span />
      )}
      <PaginationStatus>{formatStatus(page, pageCount)}</PaginationStatus>
      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={buttonClasses({ variant: "secondary" })}
        >
          {nextLabel}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
