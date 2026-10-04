/**
 * @file src/remark/codeMeta.ts
 * @desc A remark plugin that copies a fenced code block's meta string (the text after the
 *       language on the opening fence, e.g. `title="a.ts" {2}`) onto the node as
 *       `data.hProperties.dataMeta`, so mdast-util-to-hast renders it as `data-meta` and
 *       CodeBlock can read it client-side.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { type MdNode, setProperty, walk } from "./mdast.js";

/**
 * @function remarkCodeMeta
 * @returns {(tree: MdNode) => void} a remark transformer that sets `dataMeta` on every code node
 *          that has a non-empty `meta` string
 */
export const remarkCodeMeta =
  () =>
  (tree: MdNode): void => {
    walk(tree, (node) => {
      if (node.type === "code" && node.meta) setProperty(node, "dataMeta", node.meta);
    });
  };
