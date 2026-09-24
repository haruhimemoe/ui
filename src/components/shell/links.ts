/**
 * @file src/components/shell/links.ts
 * @desc Link data shared by SiteHeader and SiteFooter, plus the rules they apply to it: which
 *       hrefs leave the app (plain `<a>`), which link marks the current page, and which hrefs can
 *       ever be the current page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { isExternalHref } from "../../utils/href.js";

export { isExternalHref };

/** A nav or footer entry. Without `href` it renders as plain text, with `note` beside it. */
export type SiteLinkItem = {
  label: string;
  href?: string | undefined;
  note?: string | undefined;
};

const trimSlash = (path: string): string =>
  path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

// The app path an href points at, without query, fragment or trailing slash. Undefined for an
// href that leaves the app or is relative ("packs", "#main", "?page=2").
const appPath = (href: string): string | undefined => {
  if (isExternalHref(href)) return undefined;
  const target = trimSlash(href.replace(/[?#].*$/s, ""));
  return target.startsWith("/") ? target : undefined;
};

/**
 * @function canBeCurrent
 * @param href {string} a nav link target
 * @returns {boolean} true when some pathname makes `ariaCurrentFor` mark the link, which is only
 *          for a path in the app ("/packs"). False for external, relative, fragment-only and
 *          query-only hrefs.
 */
export const canBeCurrent = (href: string): boolean => appPath(href) !== undefined;

/**
 * @function ariaCurrentFor
 * @param pathname {string | null} the current pathname (`usePathname()`), null outside the router
 * @param href {string} a nav link target
 * @returns {"page" | "true" | undefined} "page" when the link is the current page, "true" when
 *          the current page sits under it (`/packs` while on `/packs/123`), undefined otherwise.
 *          External and relative hrefs never match, and "/" only matches itself.
 */
export function ariaCurrentFor(pathname: string | null, href: string): "page" | "true" | undefined {
  const target = appPath(href);
  if (!pathname || target === undefined) return undefined;
  const here = trimSlash(pathname);
  if (here === target) return "page";
  if (target !== "/" && here.startsWith(`${target}/`)) return "true";
  return undefined;
}
