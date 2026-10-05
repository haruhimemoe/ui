/**
 * @file src/components/mdx/Glossary.tsx
 * @desc An MDX-authored glossary: a `<dl>` of entries, each term wrapped in a `<dfn>` and given an
 *       id (`#term-<slug>`) that a `Term` link (or any anchor) can point at. An entry's aliases
 *       get the same anchor id on an empty span, so a Term for "Freemod" still lands on the "FM"
 *       entry. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { type ComponentProps, Fragment, type ReactNode } from "react";
import { slugify } from "../../remark/slugify.js";
import { cx } from "../../utils/cx.js";

/** One glossary entry: its term, definition, and any alternate names that mean the same thing. */
export type GlossaryEntry = {
  /** The entry's canonical term. */
  term: string;
  /** The entry's definition. */
  definition: ReactNode;
  /** Alternate names that should resolve to this entry's anchor. */
  aliases?: readonly string[] | undefined;
};

/** Native dl props (children replaced by the rendered entries), plus the glossary's entries. */
export type GlossaryProps = Omit<ComponentProps<"dl">, "children"> & {
  /** The glossary's entries. */
  entries: readonly GlossaryEntry[];
};

/**
 * @function Glossary
 * @param props {GlossaryProps} the entries, plus native dl props
 * @returns {JSX.Element} a `<dl>` of `dt`/`dd` pairs, each `dt` id'd by its (and its aliases')
 *          slug for Term and other anchors to target
 */
export function Glossary({ entries, className, ...props }: GlossaryProps) {
  return (
    <dl className={cx("mt-4", className)} {...props}>
      {entries.map((entry) => (
        <Fragment key={entry.term}>
          <dt id={`term-${slugify(entry.term)}`}>
            <dfn className="not-italic">{entry.term}</dfn>
            {entry.aliases?.length ? (
              <span className="ml-2 font-normal text-c3 text-sm">({entry.aliases.join(", ")})</span>
            ) : null}
            {entry.aliases?.map((alias) => (
              <span key={alias} id={`term-${slugify(alias)}`} />
            ))}
          </dt>
          <dd>{entry.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
