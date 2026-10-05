/**
 * @file src/components/content/ContentIndex.tsx
 * @desc A content section's card grid with no search: one link per entry, its title, badge and
 *       description. For short sections (`/legal`, a handful of guides) where `ContentSearch`'s
 *       field would be overkill. Server-safe: no directive, no state; `ContentSearch` renders
 *       this for its own filtered list, so the card look lives in one place. Lays its tiles out
 *       on the shared CardGrid and surface, since 0.13.0.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
 */

import Link from "next/link.js";
import { CardGrid } from "../basics/CardGrid.js";
import { surfaceClasses } from "../basics/surfaceStyles.js";
import type { ContentSearchItem } from "./types.js";

/** `ContentIndex`'s props. */
export type ContentIndexProps = {
  items: readonly ContentSearchItem[];
};

const TILE = surfaceClasses({ className: "flex flex-col gap-1 hover:bg-b3" });

/**
 * @function ContentIndex
 * @param props {ContentIndexProps} the section's entries
 * @returns {JSX.Element} a two-column card grid (one column on phones), each card the entry's
 *          title, badge and description
 */
export function ContentIndex({ items }: ContentIndexProps) {
  return (
    <CardGrid gap="sm">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={TILE}>
          <span className="flex items-baseline justify-between gap-2">
            <span className="font-bold text-c1">{item.title}</span>
            {item.badge ? <span className="font-mono text-c4 text-xs">{item.badge}</span> : null}
          </span>
          <span className="text-c3 text-sm">{item.description}</span>
        </Link>
      ))}
    </CardGrid>
  );
}
