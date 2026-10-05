/**
 * @file src/remark/figures.ts
 * @desc A remark plugin that turns a paragraph holding only an image into a `<figure>`. The
 *       image's title, when it has one, moves into a trailing `<figcaption>` and leaves the image,
 *       so no tooltip repeats the caption. Images inside running text are untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { type MdNode, walk } from "./mdast.js";

/**
 * @function remarkFigures
 * @returns {(tree: MdNode) => void} a remark transformer that makes lone images figures
 */
export const remarkFigures =
  () =>
  (tree: MdNode): void => {
    walk(tree, (node) => {
      if (node.type !== "paragraph" || node.children?.length !== 1) return;
      const image = node.children[0];
      if (image?.type !== "image") return;
      node.data = { ...node.data, hName: "figure" };
      if (!image.title) return;
      node.children.push({
        type: "paragraph",
        data: { hName: "figcaption" },
        children: [{ type: "text", value: image.title }],
      });
      image.title = null;
    });
  };
