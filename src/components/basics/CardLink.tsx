/**
 * @file src/components/basics/CardLink.tsx
 * @desc The link that makes a card one click target: an AutoLink whose `after:` box covers its
 *       nearest positioned ancestor (LinkCard, or any `relative` box), marked `data-card-link`
 *       so LinkCard's lift skips it. Its name is its own text. Use one per card. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { cx } from "../../utils/cx.js";
import { AutoLink, type AutoLinkProps } from "./AutoLink.js";

/** Every next/link prop (including `ref`); off-site hrefs render a plain `<a>`, as AutoLink does. */
export type CardLinkProps = AutoLinkProps;

const CARD_LINK =
  "font-bold text-c1 after:absolute after:inset-0 after:rounded-[inherit] after:content-['']";

/**
 * @function CardLink
 * @param props {CardLinkProps} next/link props; `className` merges last
 * @returns {JSX.Element} the link, with a cover over its positioned ancestor
 */
export function CardLink({ className, ...props }: CardLinkProps) {
  return <AutoLink {...props} data-card-link="" className={cx(CARD_LINK, className)} />;
}
