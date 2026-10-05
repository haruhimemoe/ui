/**
 * @file src/components/content/Toc.tsx
 * @desc An article's table of contents, built from `TocItem[]` (articleData's output): a sticky
 *       column from `xl` up beside the page, and a phone disclosure above it, both labelled "On
 *       this page". Server-safe: no directive, no state. Shares its link and column classes with
 *       `ContentNav` through `contentNavStyles.ts`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps, JSX } from "react";
import type { TocItem } from "../../remark/articleData.js";
import { cx } from "../../utils/cx.js";
import {
  CONTENT_NAV_COLUMN,
  CONTENT_NAV_DISCLOSURE,
  CONTENT_NAV_LINK,
  CONTENT_NAV_SUMMARY,
} from "./contentNavStyles.js";
import type { TocNode } from "./tocTree.js";
import { tocTree } from "./tocTree.js";

/** `Toc`'s props. */
export type TocProps = Omit<ComponentProps<"nav">, "children"> & {
  /** The flat TOC, in document order (articleData's `toc`). */
  items: readonly TocItem[];
  /** The deepest heading level kept. Default `3`. */
  maxDepth?: 2 | 3 | 4 | undefined;
  /** The nav landmark's accessible name, for both the column and the phone disclosure. Default
   * `"On this page"`. */
  label?: string | undefined;
};

const list = (nodes: TocNode[], nested: boolean): JSX.Element => (
  <ol className={nested ? "ml-3 border-b3 border-l pl-1" : "flex flex-col"}>
    {nodes.map((node, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: ids can repeat; the index keeps keys unique
      <li key={`${node.item.id}-${index}`}>
        <a href={`#${node.item.id}`} className={CONTENT_NAV_LINK}>
          {node.item.text}
        </a>
        {node.children.length > 0 ? list(node.children, true) : null}
      </li>
    ))}
  </ol>
);

/**
 * @function Toc
 * @param props {TocProps} the flat TOC, the deepest level to keep and the nav's accessible name
 * @returns {JSX.Element | null} the column and the phone disclosure, or null when fewer than two
 *          items survive `maxDepth`
 */
export function Toc({
  items,
  maxDepth = 3,
  label = "On this page",
  className,
  ...props
}: TocProps) {
  const tree = tocTree(items, maxDepth);
  if (items.filter((item) => item.depth <= maxDepth).length < 2) return null;
  return (
    <>
      <nav aria-label={label} className={cx("hidden xl:block", className)} {...props}>
        <div className={CONTENT_NAV_COLUMN}>{list(tree, false)}</div>
      </nav>
      <details className={`${CONTENT_NAV_DISCLOSURE} xl:hidden`}>
        <summary className={CONTENT_NAV_SUMMARY}>{label}</summary>
        <nav aria-label={label} className="mt-2">
          {list(tree, false)}
        </nav>
      </details>
    </>
  );
}
