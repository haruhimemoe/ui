/**
 * @file src/components/mdx/textOf.ts
 * @desc Flattens a ReactNode tree to plain text: strings and numbers pass through, arrays and
 *       element children are recursively joined, and null/undefined/boolean contribute nothing.
 *       Used to get a code block's plain text for Shiki and the copy button, since react-markdown
 *       hands components React children, not a string.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { isValidElement, type ReactNode } from "react";

/**
 * @function textOf
 * @param node {ReactNode} the node (or tree of nodes) to flatten
 * @returns {string} the concatenated text content
 */
export const textOf = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
};
