/**
 * @file src/components/mdx/Term.tsx
 * @desc An MDX-authored link from a term used in prose to its Glossary entry: dotted underline,
 *       targeting `#term-<slug>` of either the given `term` or (when omitted) the link's own
 *       text, or an explicit `href` for a glossary that lives elsewhere. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { slugify } from "../../remark/slugify.js";
import { cx } from "../../utils/cx.js";
import { MdxLink } from "./MdxLink.js";
import { textOf } from "./textOf.js";

/** Native anchor props (href replaced by the term/href shorthand), plus the term shorthand. */
export type TermProps = Omit<ComponentProps<"a">, "href"> & {
  /** The glossary entry's canonical term, if it differs from this link's own text. */
  term?: string | undefined;
  /** An explicit target, for a glossary that lives on another page. Default: `#term-<slug>`. */
  href?: string | undefined;
};

/**
 * @function Term
 * @param props {TermProps} an optional term and href, plus native anchor props; children is the
 *        link's own text
 * @returns {JSX.Element} an MdxLink to the glossary entry's anchor (by `href`, by `term`, or by
 *          the link's own text), dotted-underlined
 */
export function Term({ term, href, children, className, ...props }: TermProps) {
  const target = href ?? `#term-${slugify(term ?? textOf(children))}`;
  return (
    <MdxLink
      href={target}
      className={cx("underline decoration-dotted underline-offset-2", className)}
      {...props}
    >
      {children ?? term}
    </MdxLink>
  );
}
