/**
 * @file src/components/shell/NavLinks.tsx
 * @desc The header's nav list. A client component only so it can read the current path and set
 *       aria-current on the matching link; SiteHeader around it stays a server component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import { usePathname } from "next/navigation.js";
import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "./AutoLink.js";
import { ariaCurrentFor, type SiteLinkItem } from "./links.js";

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
 * @returns {JSX.Element} a `<ul>` of links, the one for the current path marked aria-current
 */
export function NavLinks({ links, align = "start", className, ...props }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <ul className={cx(LISTS[align], className)} {...props}>
      {links.map((item) => {
        if (!item.href) {
          return (
            <li key={item.label}>
              <span aria-disabled="true" className="text-c4">
                {item.label}
                {item.note ? (
                  <>
                    {" "}
                    <span className="text-xs uppercase tracking-wide">{item.note}</span>
                  </>
                ) : null}
              </span>
            </li>
          );
        }
        const current = ariaCurrentFor(pathname, item.href);
        return (
          <li key={item.href}>
            <AutoLink
              href={item.href}
              aria-current={current}
              className={current ? CURRENT : LINKS[align]}
            >
              {item.label}
            </AutoLink>
          </li>
        );
      })}
    </ul>
  );
}
