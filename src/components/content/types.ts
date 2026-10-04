/**
 * @file src/components/content/types.ts
 * @desc Content navigation's data: a link (`ContentNavItem`), a run of links under an optional
 *       heading (`ContentNavGroup`), and a searchable item (`ContentSearchItem`, for task 7's
 *       `ContentSearch`). Plain, server-safe types with no next-kit or brand import: a caller
 *       resolves its own entries (a docs registry today, a blog section later) into these
 *       shapes, so `ui` stays section-agnostic.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** One sidebar link: a resolved href, its full title, and an optional nav-length title. */
export type ContentNavItem = {
  href: string;
  title: string;
  /** Shown in the nav instead of `title`, for a long title. */
  navTitle?: string;
  /** A short tag beside the label, e.g. a count or "new". */
  badge?: string;
};

/** A run of links under an optional heading. No `heading` renders no label above them. */
export type ContentNavGroup = {
  heading?: string;
  items: readonly ContentNavItem[];
};

/** A `ContentNavItem` plus the text a fuzzy search matches against. */
export type ContentSearchItem = ContentNavItem & {
  description: string;
  keywords?: readonly string[];
};
