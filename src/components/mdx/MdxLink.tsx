/**
 * @file src/components/mdx/MdxLink.tsx
 * @desc react-markdown/MDX's `a` override: an external `http(s)` href opens in a new tab with a
 *       safe rel; a same-page hash, mailto or other off-app href is a plain anchor; everything
 *       else goes through next/link. Drops the `node` prop react-markdown passes to every
 *       component, so it never reaches the DOM.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import Link from "next/link.js";
import type { ComponentProps } from "react";
import { isExternalHref } from "../../utils/href.js";

/** Every native `<a>` prop, plus the `node` react-markdown passes (dropped, never rendered). */
export type MdxLinkProps = ComponentProps<"a"> & { node?: unknown };

/**
 * @function MdxLink
 * @param props {MdxLinkProps} the link's href and native anchor props
 * @returns {JSX.Element} an external link (new tab, `rel="noopener noreferrer"`), a plain anchor
 *          for a hash or other off-app href, or a next/link for an internal path
 */
export function MdxLink({
  node: _node,
  href = "",
  children,
  className,
  title,
  id,
  ...props
}: MdxLinkProps) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={title}
        id={id}
        {...props}
      >
        {children}
      </a>
    );
  }
  if (href.startsWith("#") || isExternalHref(href)) {
    return (
      <a href={href} className={className} title={title} id={id} {...props}>
        {children}
      </a>
    );
  }
  // Only these reach next/link: under exactOptionalPropertyTypes the anchor's event props don't
  // fit LinkProps (TS2375), so the rest of ...props never gets passed here.
  const linkProps: ComponentProps<typeof Link> = { href };
  if (className !== undefined) linkProps.className = className;
  if (title !== undefined) linkProps.title = title;
  if (id !== undefined) linkProps.id = id;
  return <Link {...linkProps}>{children}</Link>;
}
