/**
 * @file src/components/basics/TextLink.tsx
 * @desc A text link: next/link inside the app, a plain <a> off-site (with rel="noreferrer" in a
 *       new tab), in the `accent` look for running text or the `plain` one for names in lists.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { AutoLink, type AutoLinkProps } from "./AutoLink.js";
import { linkClasses, type TextLinkVariant } from "./linkStyles.js";

/** Every next/link prop (including `ref`), plus the link's look. */
export type TextLinkProps = AutoLinkProps & {
  /** "accent" (default) for running text, "plain" for a name or title in a list or table. */
  variant?: TextLinkVariant | undefined;
};

/**
 * @function TextLink
 * @param props {TextLinkProps} next/link props, plus an optional variant
 * @returns {JSX.Element} a next/link, or a plain `<a>` for an external href, styled as a text link
 */
export function TextLink({ variant, className, ...props }: TextLinkProps) {
  return <AutoLink className={linkClasses({ variant, className })} {...props} />;
}
