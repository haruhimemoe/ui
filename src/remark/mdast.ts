/**
 * @file src/remark/mdast.ts
 * @desc The slice of an mdast node these remark plugins read and write, plus three small
 *       helpers (`walk`, `setProperty`, `textContent`) that the plugins in this directory share.
 *       No `unist-util-visit` or `@types/mdast` import: this type is the whole contract.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

/** The slice of an mdast node these plugins read and write. */
export type MdNode = {
  type: string;
  children?: MdNode[];
  value?: string;
  meta?: string | null;
  depth?: number;
  url?: string;
  title?: string | null;
  alt?: string | null;
  data?: { hProperties?: Record<string, unknown>; [key: string]: unknown };
};

/**
 * @function walk
 * @param node {MdNode} the node to start from
 * @param visit {(node: MdNode) => void} called on `node`, then on every descendant, depth first
 * @returns {void}
 */
export const walk = (node: MdNode, visit: (node: MdNode) => void): void => {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
};

/**
 * @function setProperty
 * @param node {MdNode} the node to annotate
 * @param key {string} the hast property name (camelCase, e.g. `dataMeta`)
 * @param value {unknown} the property's value
 * @returns {void} sets one HTML attribute that mdast-util-to-hast copies onto the rendered element
 */
export const setProperty = (node: MdNode, key: string, value: unknown): void => {
  node.data ??= {};
  node.data.hProperties = { ...node.data.hProperties, [key]: value };
};

/**
 * @function textContent
 * @param node {MdNode} the node to read
 * @returns {string} the node's plain text: its value, or its children's text joined
 */
export const textContent = (node: MdNode): string =>
  typeof node.value === "string" ? node.value : (node.children ?? []).map(textContent).join("");
