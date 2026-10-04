/**
 * @file src/components/content/searchContent.ts
 * @desc The search over a content section's entries: a blank query returns everything, otherwise
 *       every typed word must appear somewhere in the entry (title, navTitle, description, badge
 *       or any keyword). Pure and server-safe, so `ContentSearch` and a future server-rendered
 *       index can both call it. Port of bb's `searchDocs` (`bb.haruhime.moe/src/utils/docs.ts`),
 *       simplified to a plain AND match over one haystack per entry instead of per-word scoring.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ContentSearchItem } from "./types.js";

/** The text of an entry a query's words are matched against, lowercased. */
const haystackOf = (item: ContentSearchItem): string =>
  [item.title, item.navTitle, item.description, item.badge, ...(item.keywords ?? [])]
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .toLowerCase();

/**
 * @function searchContent
 * @param items {readonly ContentSearchItem[]} the section's entries
 * @param query {string} what was typed
 * @returns {ContentSearchItem[]} every entry (in input order) when `query` is blank, otherwise
 *          the entries where every lowercased, space-split word of `query` appears in the
 *          entry's title, navTitle, description, badge or keywords; entries whose title starts
 *          with the trimmed query come first, the rest keep their input order
 */
export function searchContent(
  items: readonly ContentSearchItem[],
  query: string,
): ContentSearchItem[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === "") return [...items];
  const words = trimmed.split(/\s+/).filter(Boolean);
  const matches = items.filter((item) => {
    const haystack = haystackOf(item);
    return words.every((word) => haystack.includes(word));
  });
  const isTitlePrefix = (item: ContentSearchItem): boolean =>
    item.title.toLowerCase().startsWith(trimmed);
  return [...matches.filter(isTitlePrefix), ...matches.filter((item) => !isTitlePrefix(item))];
}
