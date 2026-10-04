/**
 * @file src/components/content/ContentIndex.tsx
 * @desc A content section's card grid with no search: one link per entry, its title, badge and
 *       description. For short sections (`/legal`, a handful of guides) where `ContentSearch`'s
 *       field would be overkill. Server-safe: no directive, no state; `ContentSearch` renders
 *       this for its own filtered list, so the card look lives in one place.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import Link from "next/link.js";
import type { ContentSearchItem } from "./types.js";

/** `ContentIndex`'s props. */
export type ContentIndexProps = {
  items: readonly ContentSearchItem[];
};

/**
 * @function ContentIndex
 * @param props {ContentIndexProps} the section's entries
 * @returns {JSX.Element} a two-column card grid (one column on phones), each card the entry's
 *          title, badge and description
 */
export function ContentIndex({ items }: ContentIndexProps) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex h-full flex-col gap-1 rounded-md bg-b4 p-3 hover:bg-b3"
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className="font-bold text-c1">{item.title}</span>
              {item.badge ? <span className="font-mono text-c4 text-xs">{item.badge}</span> : null}
            </span>
            <span className="text-c3 text-sm">{item.description}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
