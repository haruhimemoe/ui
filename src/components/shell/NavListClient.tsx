/**
 * @file src/components/shell/NavListClient.tsx
 * @desc The nav list that marks the current page (internal). The only client part of the header:
 *       it reads the pathname to set aria-current. Its classes arrive finished from NavLinks on
 *       the server, so it imports no class merging and ships no tailwind-merge to the browser.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Sep 24, 2026
 * @modified Thu Sep 24, 2026
 */

"use client";

import { usePathname } from "next/navigation.js";
import type { ComponentProps } from "react";
import { ariaCurrentFor, type SiteLinkItem } from "./links.js";
import { NavItem, navItemKey } from "./NavItem.js";

/** Every native `<ul>` prop (including `ref`), plus the links and their finished classes. */
export type NavListClientProps = Omit<ComponentProps<"ul">, "children"> & {
  links: readonly SiteLinkItem[];
  /** Classes for a link that is not the current page. */
  linkClassName: string;
  /** Classes for the current page's link. */
  currentClassName: string;
};

/**
 * @function NavListClient
 * @param props {NavListClientProps} the links, the classes for current and other links, and
 *        native list props (`className` already merged)
 * @returns {JSX.Element} a `<ul>` of links, the one for the current path marked aria-current
 */
export function NavListClient({
  links,
  linkClassName,
  currentClassName,
  ...props
}: NavListClientProps) {
  const pathname = usePathname();
  return (
    <ul {...props}>
      {links.map((item) => {
        const current = item.href ? ariaCurrentFor(pathname, item.href) : undefined;
        return (
          <NavItem
            key={navItemKey(item)}
            item={item}
            current={current}
            linkClassName={current ? currentClassName : linkClassName}
          />
        );
      })}
    </ul>
  );
}
