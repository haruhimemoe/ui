/**
 * @file src/components/mdx/MdxTable.tsx
 * @desc react-markdown/MDX's `table` override: wraps the table in a named, focusable scroll
 *       region (a table can overflow its column on narrow screens), named by its caption when
 *       one is given. Drops the `node` prop react-markdown passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { Children, type ComponentProps, isValidElement } from "react";
import { textOf } from "./textOf.js";

/** Every native `<table>` prop, plus the `node` react-markdown passes (dropped). */
export type MdxTableProps = ComponentProps<"table"> & { node?: unknown };

/**
 * @function MdxTable
 * @param props {MdxTableProps} native table props; a `caption` child names the scroll region
 * @returns {JSX.Element} a horizontally scrollable, focusable, labelled region wrapping the table
 */
export function MdxTable({ node: _node, children, ...props }: MdxTableProps) {
  const caption = Children.toArray(children).find(
    (child) => isValidElement(child) && child.type === "caption",
  );
  return (
    // biome-ignore lint/a11y/useSemanticElements: a named scroll box, not a form group
    <div
      role="group"
      aria-label={textOf(caption) || "Table"}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs keyboard focus
      tabIndex={0}
      className="overflow-x-auto"
    >
      <table {...props}>{children}</table>
    </div>
  );
}
