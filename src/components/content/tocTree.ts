/**
 * @file src/components/content/tocTree.ts
 * @desc Nests a flat table of contents (h2 to h4) into a tree, internal and pure. `Toc` renders
 *       the result.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { TocItem } from "../../remark/articleData.js";

/** One TOC entry and the entries nested under it. */
export type TocNode = { item: TocItem; children: TocNode[] };

/**
 * @function tocTree
 * @param items {readonly TocItem[]} the flat TOC, in document order
 * @param maxDepth {2 | 3 | 4} the deepest level kept
 * @returns {TocNode[]} the nested tree: an entry nests under the nearest earlier shallower one,
 *          so a jump from 2 to 4 nests once; entries with no shallower parent stay at the top
 */
export function tocTree(items: readonly TocItem[], maxDepth: 2 | 3 | 4): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const item of items) {
    if (item.depth > maxDepth) continue;
    const node: TocNode = { item, children: [] };
    while (stack.length > 0 && (stack.at(-1) as TocNode).item.depth >= item.depth) stack.pop();
    (stack.at(-1)?.children ?? roots).push(node);
    stack.push(node);
  }
  return roots;
}
