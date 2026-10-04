/**
 * @file src/remark/callouts.ts
 * @desc A remark plugin for GitHub-style callouts: a blockquote whose first paragraph starts
 *       with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` (case-insensitive)
 *       gets `data.hProperties.dataCallout` set to one of three rendered types, and the marker
 *       text is stripped from the paragraph (the paragraph itself is dropped if the marker was
 *       its only content).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { type MdNode, setProperty, walk } from "./mdast.js";

/** The three callout types this plugin renders. */
export type CalloutType = "note" | "tip" | "warning";

const TYPES: Record<string, CalloutType> = {
  note: "note",
  tip: "tip",
  important: "tip",
  warning: "warning",
  caution: "warning",
};

const MARKER = /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\r?\n)?/i;

/**
 * @function remarkCallouts
 * @returns {(tree: MdNode) => void} a remark transformer that types matching blockquotes and
 *          strips their marker text
 */
export const remarkCallouts =
  () =>
  (tree: MdNode): void => {
    walk(tree, (node) => {
      if (node.type !== "blockquote") return;
      const paragraph = node.children?.[0];
      if (paragraph?.type !== "paragraph" || !paragraph.children) return;
      // A parser may split "[!NOTE]" over several text nodes: join the leading run first.
      let end = 0;
      while (paragraph.children[end]?.type === "text") end++;
      if (end === 0) return;
      const text = paragraph.children
        .slice(0, end)
        .map((child) => child.value ?? "")
        .join("");
      const match = MARKER.exec(text);
      if (!match) return;
      const key = (match[1] as string).toLowerCase();
      const calloutType = TYPES[key];
      if (!calloutType) return;
      setProperty(node, "dataCallout", calloutType);
      const rest = text.slice(match[0].length);
      paragraph.children.splice(0, end, ...(rest ? [{ type: "text", value: rest }] : []));
      if (paragraph.children[0]?.type === "break") paragraph.children.shift();
      if (paragraph.children.length === 0) node.children?.shift();
    });
  };
