/**
 * @file src/components/shell/NavLinks.tsx
 * @desc The header's nav list. Server-safe: it merges the classes here, then renders the list
 *       itself when no link can be the current page (external, relative or text-only), or hands
 *       it to the small NavListClient, which reads the path to set aria-current.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { canBeCurrent, type SiteLinkItem } from "./links.js";
import { NavItem, navItemKey } from "./NavItem.js";
import { NavListClient } from "./NavListClient.js";

/** Where the nav sits in the header: after the brand ("start") or centered in the free space. */
export type SiteNavAlign = "start" | "center";

/** Every native `<ul>` prop (including `ref`), plus the links and their alignment. */
export type NavLinksProps = Omit<ComponentProps<"ul">, "children"> & {
  links: readonly SiteLinkItem[];
  align?: SiteNavAlign | undefined;
};

const LISTS: Record<SiteNavAlign, string> = {
  start: "flex flex-wrap gap-x-5 gap-y-1 font-bold text-sm",
  center: "flex flex-wrap items-center justify-center gap-x-6 gap-y-1 font-bold",
};

// One text color per state: the current link is lit, the rest light up on hover.
const LINKS: Record<SiteNavAlign, string> = {
  start: "text-c3 transition-colors hover:text-c1",
  center: "text-c2 transition-colors hover:text-c1",
};
const CURRENT = "text-c1 transition-colors";

/**
 * @function NavLinks
 * @param props {NavLinksProps} the links (items without `href` show as dimmed text with their
 *        `note`), the alignment (default "start") and native list props
 * @returns {JSX.Element} a `<ul>` of links, the one for the current path marked aria-current.
 *          When no link can be current, it skips the client list and nothing reads the path.
 *          From a Server Component with only external and text-only links, nothing hydrates; a
 *          relative href still renders next/link, which does.
 */
export function NavLinks({ links, align = "start", className, ...props }: NavLinksProps) {
  const listClassName = cx(LISTS[align], className);
  if (!links.some((item) => item.href && canBeCurrent(item.href))) {
    return (
      <ul className={listClassName} {...props}>
        {links.map((item) => (
          <NavItem key={navItemKey(item)} item={item} linkClassName={LINKS[align]} />
        ))}
      </ul>
    );
  }
  return (
    <NavListClient
      links={links}
      linkClassName={LINKS[align]}
      currentClassName={CURRENT}
      className={listClassName}
      {...props}
    />
  );
}
