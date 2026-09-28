/**
 * @file src/components/actions/pages.ts
 * @desc Pagination's page math (internal): what to do with a page and page count that came from
 *       a URL or an API, where they can be NaN, fractional or out of range.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/** A page and a page count after normalizing. `pageCount` is null when it isn't known. */
export type PageState = { page: number; pageCount: number | null };

/**
 * @function normalizePages
 * @param page {number} the current page, 1-based, as the caller has it
 * @param pageCount {number | null} how many pages there are, or null when it isn't known
 * @returns {PageState} whole numbers: a non-finite count is 1 and a negative one 0, and the page
 *          sits between 1 and the count (at least 1), with a non-finite page read as 1
 */
export const normalizePages = (page: number, pageCount: number | null): PageState => {
  const count =
    pageCount === null ? null : Number.isFinite(pageCount) ? Math.max(Math.floor(pageCount), 0) : 1;
  const last = count === null ? Number.POSITIVE_INFINITY : Math.max(count, 1);
  const current = Number.isFinite(page) ? Math.min(Math.max(Math.floor(page), 1), last) : 1;
  return { page: current, pageCount: count };
};
