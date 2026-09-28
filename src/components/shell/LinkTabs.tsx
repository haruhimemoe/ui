/**
 * @file src/components/shell/LinkTabs.tsx
 * @desc A row of link tabs (Pools / Maps, All / Hidden): a named `<nav>` whose current link is
 *       marked aria-current="page" and drawn as a b3 pill. Links, not ARIA tabs, since each one
 *       loads its own URL. Server-safe: the caller says which link is current.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";

/** One tab: where it links, its text, and whether it is the page being shown. */
export type LinkTabItem = {
  href: string;
  label: ReactNode;
  current?: boolean | undefined;
};

/** Every native `<nav>` prop except children, plus the nav's name and the tabs. */
export type LinkTabsProps = Omit<ComponentProps<"nav">, "children"> & {
  /** The nav landmark's accessible name, e.g. "What to search". */
  label: string;
  /** The tabs, left to right. Give each its own href. */
  items: readonly LinkTabItem[];
};

const TAB = "rounded-full px-3 py-1 font-bold text-sm transition-colors";
// Forced-colors mode drops the pill's background, so the current tab is underlined there.
const CURRENT = "bg-b3 text-c1 forced-colors:underline";
const OTHER = "text-c3 hover:text-c1";

/**
 * @function LinkTabs
 * @param props {LinkTabsProps} the nav's label, the tabs, and native nav props
 * @returns {JSX.Element} a `<nav>` with a list of pill links, the current one aria-current="page"
 */
export function LinkTabs({ label, items, className, ...props }: LinkTabsProps) {
  return (
    <nav aria-label={label} className={className} {...props}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <AutoLink
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cx(TAB, item.current ? CURRENT : OTHER)}
            >
              {item.label}
            </AutoLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
