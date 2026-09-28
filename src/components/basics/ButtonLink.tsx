/**
 * @file src/components/basics/ButtonLink.tsx
 * @desc next/link styled as a pill button. Off-site hrefs (a scheme like https: or mailto:, or
 *       //host) render a plain <a>, with rel="noreferrer" when opened in a new tab (AutoLink).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import { AutoLink, type AutoLinkProps } from "./AutoLink.js";
import { type ButtonSize, type ButtonVariant, buttonClasses } from "./buttonStyles.js";

/** Every next/link prop (including `ref`), plus a button variant and size. */
export type ButtonLinkProps = AutoLinkProps & {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
};

/**
 * @function ButtonLink
 * @param props {ButtonLinkProps} next/link props, plus an optional button variant and size
 * @returns {JSX.Element} a next/link styled as a pill button, or a plain `<a>` for an external
 *          href (next/link's own props are dropped there)
 */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <AutoLink className={buttonClasses({ variant, size, className })} {...props} />;
}
