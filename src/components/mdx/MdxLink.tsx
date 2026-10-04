/**
 * @file src/components/mdx/MdxLink.tsx
 * @desc react-markdown/MDX's `a` override: an external `http(s)` href opens in a new tab with a
 *       safe rel (full props spread, like the `<a>` AutoLink itself renders for an off-app href);
 *       a same-page hash link is a plain anchor, since AutoLink's own `isExternalHref` check
 *       doesn't treat `#usage` as external and would otherwise send it through next/link, which
 *       has no reason to handle a same-page jump; everything else (internal paths, `mailto:` and
 *       other schemes) goes through AutoLink, which already picks `next/link` or a plain `<a>` by
 *       href and spreads every other prop onto whichever element it renders. Drops the `node`
 *       prop react-markdown passes to every component, so it never reaches the DOM.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps } from "react";
import { AutoLink, type AutoLinkProps } from "../basics/AutoLink.js";

/** Every native `<a>` prop, plus the `node` react-markdown passes (dropped, never rendered). */
export type MdxLinkProps = ComponentProps<"a"> & { node?: unknown };

/**
 * @function MdxLink
 * @param props {MdxLinkProps} the link's href and native anchor props
 * @returns {JSX.Element} an external link (new tab, `rel="noopener noreferrer"`), a plain anchor
 *          for a same-page hash, or an AutoLink (next/link or a plain anchor, by href) otherwise,
 *          every other prop forwarded in full
 */
export function MdxLink({ node: _node, href = "", children, ...props }: MdxLinkProps) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  // AutoLink's props are next/link's (anchor attributes plus next/link-only props like
  // `prefetch`); every prop MdxLink accepts from react-markdown is a native anchor attribute,
  // which AutoLink spreads straight onto whichever element it renders. Narrow cast, like
  // AutoLink's own `href` handling: ComponentProps<"a"> isn't literally ComponentProps<Link>,
  // but every field here is one AutoLink already knows how to forward.
  return (
    <AutoLink href={href} {...(props as Omit<AutoLinkProps, "href">)}>
      {children}
    </AutoLink>
  );
}
