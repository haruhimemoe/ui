/**
 * @file src/components/shell/NavItem.tsx
 * @desc One entry of the header's nav list (internal): a link, or dimmed text with its note when
 *       the entry has no href. NavLinks renders it on the server, and NavListClient in the
 *       browser, so both lists print the same markup.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Sep 24, 2026
 * @modified Thu Sep 24, 2026
 */

import { AutoLink } from "./AutoLink.js";
import type { SiteLinkItem } from "./links.js";

/** One nav entry, its aria-current and the finished classes for its link. */
export type NavItemProps = {
  item: SiteLinkItem;
  /** The link's aria-current, from `ariaCurrentFor`. */
  current?: "page" | "true" | undefined;
  /** Classes for the link. Ignored for an entry without `href`. */
  linkClassName: string;
};

/**
 * @function navItemKey
 * @param item {SiteLinkItem} a nav entry
 * @returns {string} its React key: the href, or the label for a text-only entry
 */
export const navItemKey = (item: SiteLinkItem): string => item.href || item.label;

/**
 * @function NavItem
 * @param props {NavItemProps} the entry, its aria-current and its link classes
 * @returns {JSX.Element} an `<li>` with the link, or with dimmed text and the note beside it
 */
export function NavItem({ item, current, linkClassName }: NavItemProps) {
  if (!item.href) {
    return (
      <li>
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
  return (
    <li>
      <AutoLink href={item.href} aria-current={current} className={linkClassName}>
        {item.label}
      </AutoLink>
    </li>
  );
}
