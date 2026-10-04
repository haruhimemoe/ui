/**
 * @file src/components/content/ContentSearch.tsx
 * @desc A content section's search: one field that narrows its entries as it's typed, with the
 *       result count said to screen readers, then `ContentIndex`'s card grid over what matched.
 *       Port of bb's docs search (`bb.haruhime.moe/src/components/docs/DocsSearch.tsx`), with the
 *       entries, label and count noun taken from props instead of a hardcoded docs shape.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { useState } from "react";
import { TextInput } from "../forms/TextInput.js";
import { ContentIndex } from "./ContentIndex.js";
import { searchContent } from "./searchContent.js";
import type { ContentSearchItem } from "./types.js";

/** `ContentSearch`'s props. */
export type ContentSearchProps = {
  items: readonly ContentSearchItem[];
  /** The field's label, and the search landmark's name read by nothing else here. */
  label: string;
  placeholder?: string;
  /** Singular and plural noun for the unfiltered count ("12 pages."). Default `["page", "pages"]`. */
  countNoun?: readonly [string, string];
};

/**
 * @function ContentSearch
 * @param props {ContentSearchProps} the section's entries, the field's label, an optional
 *        placeholder, and an optional singular/plural noun for the unfiltered count
 * @returns {JSX.Element} the field, the result count (a live region) and the matching entries
 */
export function ContentSearch({
  items,
  label,
  placeholder,
  countNoun = ["page", "pages"],
}: ContentSearchProps) {
  const [query, setQuery] = useState("");
  const found = searchContent(items, query);
  const trimmed = query.trim();
  const [singular, plural] = countNoun;
  const countText =
    trimmed === ""
      ? `${items.length} ${items.length === 1 ? singular : plural}.`
      : `${found.length} ${found.length === 1 ? "match" : "matches"}.`;
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        id="content-search"
        type="search"
        label={label}
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <p className="text-c3 text-sm" aria-live="polite">
        {countText}
      </p>
      <ContentIndex items={found} />
    </div>
  );
}
