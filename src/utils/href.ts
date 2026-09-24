/**
 * @file src/utils/href.ts
 * @desc Tells hrefs that leave the app (a URL scheme or a protocol-relative //host) from paths
 *       inside it, so links can pick a plain <a> or next/link.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

// A URL scheme ("https:", "mailto:") or a protocol-relative "//host".
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * @function isExternalHref
 * @param href {string} a link target
 * @returns {boolean} true when the href has a scheme or starts with `//`, so it leaves the app
 *          and should be a plain `<a>` instead of `next/link`
 */
export const isExternalHref = (href: string): boolean => EXTERNAL.test(href);
