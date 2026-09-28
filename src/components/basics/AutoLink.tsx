/**
 * @file src/components/basics/AutoLink.tsx
 * @desc A link that picks its element from the href (internal): `next/link` for paths inside the
 *       app, a plain `<a>` for a string href that leaves it (a scheme like https: or mailto:, or
 *       //host). The plain `<a>` drops next/link's own props, and gets rel="noreferrer" when it
 *       opens in a new tab. ButtonLink, TextLink, the nav and the footer all render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
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
 *          an external string href, with rel="noreferrer" when `target="_blank"` and no `rel`
 */
export function AutoLink({ href, target, rel, ...props }: AutoLinkProps) {
  if (typeof href === "string" && isExternalHref(href)) {
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
