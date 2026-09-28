/**
 * @file src/utils/href.ts
 * @desc Tells hrefs that leave the app (a URL scheme or a protocol-relative //host) from paths
 *       inside it, so links can pick a plain <a> or next/link. It reads an href the way a
 *       browser's URL parser does: leading spaces and control characters don't count, tabs and
 *       newlines anywhere are dropped, and a backslash counts as a slash (`/\host` is `//host`).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

// A URL scheme ("https:", "mailto:") or a protocol-relative "//host", with "\" read as "/".
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|[/\\]{2})/i;

/**
 * @function parsedStart
 * @param href {string} a link target
 * @returns {string} the href as the URL parser starts reading it: every tab, line feed and
 *          carriage return removed, then the leading C0 controls and spaces
 */
const parsedStart = (href: string): string => {
  const text = href.replace(/[\t\n\r]/g, "");
  let start = 0;
  while (start < text.length && text.charCodeAt(start) <= 0x20) start++;
  return text.slice(start);
};

/**
 * @function isExternalHref
 * @param href {string} a link target
 * @returns {boolean} true when a browser reads the href as a scheme or a `//host` (so also
 *          `/\host`, `\\host` and `" https://host"`): it leaves the app and should be a plain
 *          `<a>` instead of `next/link`
 */
export const isExternalHref = (href: string): boolean => EXTERNAL.test(parsedStart(href));
