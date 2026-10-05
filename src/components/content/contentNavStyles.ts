/**
 * @file src/components/content/contentNavStyles.ts
 * @desc The class strings ContentNav and Toc share: links, the current link, the sticky column
 *       and the phone disclosure. Finished strings, no cx, because ContentNav is a client file.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** ContentNav's and Toc's plain link, before the coarse-pointer pad. */
export const CONTENT_NAV_LINK =
  "flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-b4 hover:text-c1 text-c3 coarse:py-2.5";
/** ContentNav's current-page link (`aria-current="page"`). */
export const CONTENT_NAV_CURRENT =
  "flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-b4 hover:text-c1 bg-b4 font-bold text-c1 coarse:py-2.5";
/** The sticky wide-screen column both components render their link list into. */
export const CONTENT_NAV_COLUMN = "sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1";
/** The phone `<details>` disclosure's own classes (the caller adds its breakpoint). */
export const CONTENT_NAV_DISCLOSURE = "rounded-md bg-b4 p-2";
/** The disclosure's `<summary>`. */
export const CONTENT_NAV_SUMMARY = "cursor-pointer px-2 py-1 font-bold text-c2 text-sm";
