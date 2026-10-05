/**
 * @file src/remark/embeds.ts
 * @desc A remark plugin that marks a paragraph holding only a bare YouTube or Twitch URL (a link
 *       whose text is its own URL) as `<div data-embed="url">`. The link stays inside as the
 *       fallback; the `div` override in `mdxComponents` renders the player.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { parseEmbedUrl } from "./embedUrl.js";
import { type MdNode, textContent, walk } from "./mdast.js";

/**
 * @function remarkEmbeds
 * @returns {(tree: MdNode) => void} a remark transformer that marks bare video URLs as embeds
 */
export const remarkEmbeds =
  () =>
  (tree: MdNode): void => {
    walk(tree, (node) => {
      if (node.type !== "paragraph" || node.children?.length !== 1) return;
      const link = node.children[0];
      if (link?.type !== "link" || !link.url || textContent(link) !== link.url) return;
      if (!parseEmbedUrl(link.url)) return;
      node.data = {
        ...node.data,
        hName: "div",
        hProperties: { ...node.data?.hProperties, dataEmbed: link.url },
      };
    });
  };
