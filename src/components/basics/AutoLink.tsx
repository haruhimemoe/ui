/**
 * @file src/components/basics/AutoLink.tsx
 * @desc A link that picks its element from the href (internal): `next/link` for paths inside the
 *       app, a plain `<a>` for a string href that leaves it (a scheme like https: or mailto:, or
 *       //host) or that is a download (`download` set, even to `""`): no prefetch and no client
 *       routing for a file. The plain `<a>` drops next/link's own props, and gets rel="noreferrer"
 *       when it opens in a new tab. ButtonLink, TextLink, the nav and the footer all render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
 */

import Link from "next/link.js";
import type { ComponentProps } from "react";
import { isExternalHref } from "../../utils/href.js";

/** Every next/link prop (including `ref`). */
export type AutoLinkProps = ComponentProps<typeof Link>;

/**
 * @function AutoLink
 * @param props {AutoLinkProps} next/link props
 * @returns {JSX.Element} a `next/link` for internal paths (and URL objects), or a plain `<a>` for
 *          an external string href or a download, with rel="noreferrer" when `target="_blank"`
 *          and no `rel`
 */
export function AutoLink({ href, target, rel, ...props }: AutoLinkProps) {
  // `download` counts when set to anything but undefined or false: "" is the attribute's own
  // boolean form. A download is a file, never a page to prefetch or route to.
  const download = props.download !== undefined && props.download !== false;
  if (typeof href === "string" && (isExternalHref(href) || download)) {
    const {
      as: _as,
      replace: _replace,
      scroll: _scroll,
      shallow: _shallow,
      passHref: _passHref,
      prefetch: _prefetch,
      locale: _locale,
      legacyBehavior: _legacyBehavior,
      onNavigate: _onNavigate,
      transitionTypes: _transitionTypes,
      ...anchorProps
    } = props;
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noreferrer" : undefined)}
        {...anchorProps}
      />
    );
  }
  return <Link href={href} target={target} rel={rel} {...props} />;
}
