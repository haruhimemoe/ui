/**
 * @file src/components/basics/LinkRow.tsx
 * @desc A wrapping row of text links (a card's GitHub / npm / Changelog, a page's filters), in a
 *       named nav when given a label. The caller marks the current item, shown by weight and an
 *       underline, not color alone. Taller tap rows on coarse pointers. For pill links that
 *       switch a view, use LinkTabs; for a section's vertical nav, ContentNav. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { AutoLinkProps } from "./AutoLink.js";
import { TextLink } from "./TextLink.js";

/** One link: where it goes, its text, whether it is the current page, and target/rel. */
export type LinkRowItem = { href: string; label: ReactNode; current?: boolean | undefined } & Pick<
  AutoLinkProps,
  "target" | "rel"
>;

/** Every native `<ul>` prop, plus the links, an optional nav label and the look. */
export type LinkRowProps = Omit<ComponentProps<"ul">, "children"> & {
  items: readonly LinkRowItem[];
  /** With a label, the list sits in a `<nav aria-label>`. Without, a plain list (links in a card). */
  label?: string | undefined;
  /** "accent" (default): bold accent links. "quiet": c2 links that turn c1 on hover. */
  variant?: "accent" | "quiet" | undefined;
};

const LINK = "inline-block coarse:py-2";
const QUIET = "font-normal text-c2 hover:text-c1";
const CURRENT = "font-bold text-c1 underline decoration-2 underline-offset-4";

/**
 * @function LinkRow
 * @param props {LinkRowProps} the links, an optional nav label, the variant (default "accent"),
 *        plus native list props
 * @returns {JSX.Element} the list, in a named nav when labelled
 */
export function LinkRow({ items, label, variant = "accent", className, ...props }: LinkRowProps) {
  const list = (
    <ul className={cx("flex flex-wrap gap-x-4 gap-y-1 text-sm", className)} {...props}>
      {items.map((item) => (
        <li key={item.href}>
          <TextLink
            href={item.href}
            target={item.target}
            rel={item.rel}
            variant={variant === "accent" ? "accent" : "plain"}
            aria-current={item.current ? "page" : undefined}
            className={cx(
              LINK,
              variant === "accent" ? "font-bold" : QUIET,
              item.current && CURRENT,
            )}
          >
            {item.label}
          </TextLink>
        </li>
      ))}
    </ul>
  );
  return label ? <nav aria-label={label}>{list}</nav> : list;
}
