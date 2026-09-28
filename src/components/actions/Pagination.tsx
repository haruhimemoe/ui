/**
 * @file src/components/actions/Pagination.tsx
 * @desc Previous / next around "Page X of Y". Renders nothing for a single page. Two modes: links
 *       (`hrefFor`, the caller builds each page's URL, so it works with any query string or route
 *       shape) or buttons (`onPageChange`, for results fetched in place, where the page count may
 *       be unknown). When a link a keyboard user pressed goes away (Next on the last page), focus
 *       moves to the status text instead of the page body; buttons stay and ignore presses. A page
 *       or count from a URL is normalized first: NaN reads as page 1, and a page past either end
 *       is pulled back inside. A server component; button mode needs client code for its handler.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { ButtonLink } from "../basics/ButtonLink.js";
import { buttonClasses } from "../basics/buttonStyles.js";
import { PaginationButton } from "./PaginationButton.js";
import { PaginationStatus } from "./PaginationStatus.js";
import { normalizePages } from "./pages.js";

type PaginationBase = Omit<ComponentProps<"nav">, "children"> & {
  /** The current page, 1-based. NaN reads as 1; a page past either end is pulled back inside. */
  page: number;
  /** Text of the control for the page before. Defaults to "Previous". */
  previousLabel?: ReactNode | undefined;
  /** Text of the control for the page after. Defaults to "Next". */
  nextLabel?: ReactNode | undefined;
};

/** Link mode: each page has a URL. */
type PaginationLinkProps = PaginationBase & {
  /** How many pages there are. At 1 or fewer (or NaN), nothing renders. */
  pageCount: number;
  /** Builds the URL for a page number, e.g. `(p) => \`/packs?page=${p}\``. */
  hrefFor: (page: number) => string;
  onPageChange?: undefined;
  hasNext?: undefined;
  /** The middle text. Defaults to "Page X of Y". */
  formatStatus?: ((page: number, pageCount: number) => ReactNode) | undefined;
};

/** Button mode: the caller changes the page in place. */
type PaginationButtonModeProps = PaginationBase & {
  /** How many pages there are, or null when that isn't known (then `hasNext` says if there's more). */
  pageCount: number | null;
  /** Called with the page to show (from client code). */
  onPageChange: (page: number) => void;
  hrefFor?: undefined;
  /** With a null `pageCount`: whether there is a page after this one. Default false. */
  hasNext?: boolean | undefined;
  /** The middle text. Defaults to "Page X of Y", or "Page X" with a null `pageCount`. */
  formatStatus?: ((page: number, pageCount: number | null) => ReactNode) | undefined;
};

/** Every native `<nav>` prop except children, the page state, and `hrefFor` or `onPageChange`. */
export type PaginationProps = PaginationLinkProps | PaginationButtonModeProps;

const defaultStatus = (page: number, pageCount: number | null): ReactNode =>
  pageCount === null ? `Page ${page}` : `Page ${page} of ${pageCount}`;

// Button mode's ends stay in place, dimmed, and keep focus.
const BUTTON = buttonClasses({
  variant: "secondary",
  className: "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
});

/**
 * @function Pagination
 * @param props {PaginationProps} page, pageCount, and hrefFor (links) or onPageChange (buttons),
 *        optional labels, plus native nav props (`aria-label` defaults to "Pages")
 * @returns {JSX.Element | null} a `<nav>` with previous / next pills around the status, or null
 *          when there is only one page
 */
export function Pagination(props: PaginationProps) {
  const {
    page: rawPage,
    pageCount: rawPageCount,
    hrefFor,
    onPageChange,
    hasNext = false,
    previousLabel = "Previous",
    nextLabel = "Next",
    formatStatus = defaultStatus,
    className,
    ...rest
  } = props;
  const { page, pageCount } = normalizePages(rawPage, rawPageCount);
  const more = pageCount === null ? hasNext : page < pageCount;
  if (page <= 1 && !more) return null;
  // Link mode never has a null count, so both status formatters take this call.
  const status = (formatStatus as (page: number, pageCount: number | null) => ReactNode)(
    page,
    pageCount,
  );
  const nav = cx("flex items-center justify-between gap-3 text-sm", className);

  if (onPageChange) {
    return (
      <nav aria-label="Pages" className={nav} {...rest}>
        <PaginationButton
          page={page - 1}
          off={page <= 1}
          onPageChange={onPageChange}
          className={BUTTON}
        >
          {previousLabel}
        </PaginationButton>
        <PaginationStatus live>{status}</PaginationStatus>
        <PaginationButton
          page={page + 1}
          off={!more}
          onPageChange={onPageChange}
          className={BUTTON}
        >
          {nextLabel}
        </PaginationButton>
      </nav>
    );
  }

  return (
    <nav aria-label="Pages" className={nav} {...rest}>
      {page > 1 && hrefFor ? (
        <ButtonLink href={hrefFor(page - 1)} rel="prev" variant="secondary">
          {previousLabel}
        </ButtonLink>
      ) : (
        <span />
      )}
      <PaginationStatus>{status}</PaginationStatus>
      {more && hrefFor ? (
        <ButtonLink href={hrefFor(page + 1)} rel="next" variant="secondary">
          {nextLabel}
        </ButtonLink>
      ) : (
        <span />
      )}
    </nav>
  );
}
