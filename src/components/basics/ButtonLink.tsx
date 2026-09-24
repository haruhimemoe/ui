/**
 * @file src/components/basics/ButtonLink.tsx
 * @desc next/link styled as a pill button. Off-site hrefs (a scheme like https: or mailto:, or
 *       //host) render a plain <a>, with rel="noreferrer" when opened in a new tab.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import Link from "next/link";
import type { ComponentProps } from "react";
import { isExternalHref } from "../../utils/href.js";
import { type ButtonSize, type ButtonVariant, buttonClasses } from "./buttonStyles.js";

/** Every next/link prop (including `ref`), plus a button variant and size. */
export type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
};

/**
 * @function ButtonLink
 * @param props {ButtonLinkProps} next/link props, plus an optional button variant and size
 * @returns {JSX.Element} a next/link styled as a pill button, or a plain `<a>` for an external
 *          href (next/link's own props are dropped there)
 */
export function ButtonLink({
  variant,
  size,
  className,
  href,
  target,
  rel,
  ...props
}: ButtonLinkProps) {
  const classes = buttonClasses({ variant, size, className });

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
        className={classes}
        {...anchorProps}
      />
    );
  }

  return <Link href={href} target={target} rel={rel} className={classes} {...props} />;
}
