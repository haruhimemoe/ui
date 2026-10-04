/**
 * @file src/remark/headingIds.ts
 * @desc A remark plugin that gives every depth-2 and depth-3 heading a GitHub-style id slugged
 *       from its text, deduplicated across the document. A heading that already has an id
 *       (`data.hProperties.id`) keeps it, and a heading whose text slugs to an empty string gets
 *       no id at all.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { type MdNode, setProperty, textContent, walk } from "./mdast.js";
import { createSlugger } from "./slugify.js";

/**
 * @function remarkHeadingIds
 * @returns {(tree: MdNode) => void} a remark transformer that ids depth-2/3 headings
 */
export const remarkHeadingIds =
  () =>
  (tree: MdNode): void => {
    const slug = createSlugger();
    walk(tree, (node) => {
      if (node.type !== "heading" || (node.depth !== 2 && node.depth !== 3)) return;
      if (node.data?.hProperties?.id) return;
      const id = slug(textContent(node));
      if (id) setProperty(node, "id", id);
    });
  };
