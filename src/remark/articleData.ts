/**
 * @file src/remark/articleData.ts
 * @desc An article's table of contents, word count and reading time from its mdast tree. The TOC
 *       reads ids from `data.hProperties.id` (run it after remarkHeadingIds), so entries always
 *       match the anchors. Words are Intl.Segmenter word segments (Japanese works without spaces)
 *       in text outside code, inline code, raw HTML, ESM and JSX expressions; text inside JSX
 *       elements counts.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { type MdNode, textContent, walk } from "./mdast.js";

/** One TOC entry: the heading's id, its plain text and its level. */
export type TocItem = { id: string; text: string; depth: 2 | 3 | 4 };
/** What articleData returns, and what mdxExports exports. */
export type ArticleData = { toc: TocItem[]; words: number; readingMinutes: number };

const SKIP = new Set([
  "code",
  "inlineCode",
  "html",
  "mdxjsEsm",
  "mdxFlowExpression",
  "mdxTextExpression",
  "yaml",
  "toml",
]);

const countWords = (node: MdNode, segmenter: Intl.Segmenter): number => {
  if (SKIP.has(node.type)) return 0;
  if (node.type === "text") {
    let count = 0;
    for (const segment of segmenter.segment(node.value ?? "")) if (segment.isWordLike) count++;
    return count;
  }
  return (node.children ?? []).reduce((sum, child) => sum + countWords(child, segmenter), 0);
};

/**
 * @function articleData
 * @param tree {MdNode} the document root, after heading ids are set
 * @param options {{ wordsPerMinute?: number }} reading speed, default 200; zero or less means 200
 * @returns {ArticleData} the TOC (h2 to h4 with ids), the word count and max(1, ceil(words / wpm))
 */
export function articleData(
  tree: MdNode,
  options: { wordsPerMinute?: number | undefined } = {},
): ArticleData {
  const toc: TocItem[] = [];
  walk(tree, (node) => {
    if (node.type !== "heading" || !node.depth || node.depth < 2 || node.depth > 4) return;
    const id = node.data?.hProperties?.id;
    if (typeof id !== "string" || !id) return;
    toc.push({ id, text: textContent(node).trim(), depth: node.depth as 2 | 3 | 4 });
  });
  const words = countWords(tree, new Intl.Segmenter("en", { granularity: "word" }));
  const rate = options.wordsPerMinute && options.wordsPerMinute > 0 ? options.wordsPerMinute : 200;
  return { toc, words, readingMinutes: Math.max(1, Math.ceil(words / rate)) };
}
