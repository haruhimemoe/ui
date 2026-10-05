/**
 * @file src/remark/index.ts
 * @desc The public entry point for `@haruhimemoe/ui/remark`: one remark plugin for MDX and
 *       react-markdown that combines code meta, callouts, heading ids, figures and embeds, plus
 *       the individual plugins and the slug helpers for callers who want only one piece.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import { type ArticleData, articleData } from "./articleData.js";
import { remarkCallouts } from "./callouts.js";
import { remarkCodeMeta } from "./codeMeta.js";
import { remarkEmbeds } from "./embeds.js";
import { appendMdxExports } from "./estree.js";
import { remarkFigures } from "./figures.js";
import { remarkHeadingIds } from "./headingIds.js";
import type { MdNode } from "./mdast.js";

export type { ArticleData, TocItem } from "./articleData.js";
export { articleData } from "./articleData.js";
export type { CalloutType } from "./callouts.js";
export { remarkCallouts } from "./callouts.js";
export { remarkCodeMeta } from "./codeMeta.js";
export { remarkEmbeds } from "./embeds.js";
export type { EmbedTarget } from "./embedUrl.js";
export { parseEmbedUrl } from "./embedUrl.js";
export { remarkFigures } from "./figures.js";
export { remarkHeadingIds } from "./headingIds.js";
export { createSlugger, slugify } from "./slugify.js";

/** Which of the five plugins `remarkHaruhime` runs; each defaults to on. */
export type RemarkHaruhimeOptions = {
  codeMeta?: boolean;
  callouts?: boolean;
  headingIds?: boolean;
  figures?: boolean;
  embeds?: boolean;
  /** default false; MDX only: react-markdown would render the ESM nodes */
  mdxExports?: boolean;
  /** default 200 */
  wordsPerMinute?: number | undefined;
  /** react-markdown only: a function can't cross Turbopack's serializable plugin options */
  collect?: (data: ArticleData) => void;
};

/**
 * @function remarkHaruhime
 * @param options {RemarkHaruhimeOptions} per-plugin opt-outs; omit to run all five
 * @returns {(tree: MdNode) => void} a remark transformer running code meta, callouts, heading
 *          ids, figures and embeds over one tree. A default export, because Turbopack only takes
 *          MDX plugins by module name: `remarkPlugins: ["@haruhimemoe/ui/remark"]`.
 */
export default function remarkHaruhime(options: RemarkHaruhimeOptions = {}) {
  return (tree: MdNode): void => {
    if (options.codeMeta !== false) remarkCodeMeta()(tree);
    if (options.callouts !== false) remarkCallouts()(tree);
    if (options.headingIds !== false) remarkHeadingIds()(tree);
    if (options.figures !== false) remarkFigures()(tree);
    if (options.embeds !== false) remarkEmbeds()(tree);
    if (!options.collect && !options.mdxExports) return;
    const data = articleData(tree, { wordsPerMinute: options.wordsPerMinute });
    options.collect?.(data);
    if (options.mdxExports) appendMdxExports(tree, data);
  };
}
