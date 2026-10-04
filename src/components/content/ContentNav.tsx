/**
 * @file src/components/content/ContentNav.tsx
 * @desc A content section's side navigation: an index link, then each group of links, the
 *       current page marked. A column beside the page on wide screens; a phone disclosure above
 *       it. Port of bb's docs sidebar (`bb.haruhime.moe/src/components/docs/DocsNav.tsx`), with
 *       the index link and groups taken from props instead of a hardcoded "docs" shape, so a
 *       docs section, and later a blog section, can both use it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import Link from "next/link.js";
import { usePathname } from "next/navigation.js";
import type { ContentNavGroup, ContentNavItem } from "./types.js";

/** `ContentNav`'s props. */
export type ContentNavProps = {
  /** The nav landmark's accessible name, for both the column and the phone disclosure. */
  label: string;
  /** Where the index link (the section's overview page) points. */
  indexHref: string;
  /** The index link's label. Default `"Overview"`. */
  indexLabel?: string;
  groups: readonly ContentNavGroup[];
};

const LINK_CLASS_NAME =
  "flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-b4 hover:text-c1 text-c3";
const CURRENT_CLASS_NAME =
  "flex items-baseline justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-b4 hover:text-c1 bg-b4 font-bold text-c1";

/**
 * @function ContentNav
 * @param props {ContentNavProps} the nav's accessible name, the index link, and the groups
 *        beneath it
 * @returns {JSX.Element} the navigation, as a column and as a phone disclosure
 */
export function ContentNav({ label, indexHref, indexLabel = "Overview", groups }: ContentNavProps) {
  const path = usePathname();
  const link = (item: ContentNavItem) => {
    const current = path === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          aria-current={current ? "page" : undefined}
          title={item.title}
          className={current ? CURRENT_CLASS_NAME : LINK_CLASS_NAME}
        >
          <span className="line-clamp-2 min-w-0 break-words">{item.navTitle ?? item.title}</span>
          {item.badge ? <span className="font-mono text-c4 text-xs">{item.badge}</span> : null}
        </Link>
      </li>
    );
  };
  const list = (
    <div className="flex flex-col gap-4">
      <ul>{link({ href: indexHref, title: indexLabel })}</ul>
      {groups.map((group, index) => (
        <div key={group.heading ?? index}>
          {group.heading ? (
            <p className="mb-1 px-2 font-bold text-c4 text-xs uppercase tracking-wide">
              {group.heading}
            </p>
          ) : null}
          <ul>{group.items.map((item) => link(item))}</ul>
        </div>
      ))}
    </div>
  );
  return (
    <>
      <nav aria-label={label} className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-1">{list}</div>
      </nav>
      <details className="rounded-md bg-b4 p-2 lg:hidden">
        <summary className="cursor-pointer px-2 py-1 font-bold text-c2 text-sm">Contents</summary>
        <nav aria-label={label} className="mt-2">
          {list}
        </nav>
      </details>
    </>
  );
}
