/**
 * @file src/components/shell/AutoLink.tsx
 * @desc A link that picks its element from the href: `next/link` for paths inside the app, a
 *       plain `<a>` for anything with a scheme (https:, mailto:) or a protocol-relative URL.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import Link from "next/link.js";
import type { ComponentProps } from "react";
import { isExternalHref } from "./links.js";

/** Every native `<a>` prop (including `ref`), with `href` required and a plain string. */
export type AutoLinkProps = Omit<ComponentProps<"a">, "href"> & { href: string };

/**
 * @function AutoLink
 * @param props {AutoLinkProps} native anchor props with a string href
 * @returns {JSX.Element} a `next/link` for internal paths, a plain `<a>` for external URLs
 */
export function AutoLink({ href, ...props }: AutoLinkProps) {
  if (isExternalHref(href)) return <a href={href} {...props} />;
  // Link takes every anchor prop, but types a few handlers (onClick, onMouseEnter) without
  // `| undefined`, which exactOptionalPropertyTypes rejects for a spread of optional props.
  return <Link href={href} {...(props as Omit<ComponentProps<typeof Link>, "href">)} />;
}
