/**
 * @file tests/remark/articleData.test.ts
 * @desc Tests for articleData: the TOC from heading ids (h2 to h4, document order), words counted
 *       with Intl.Segmenter outside code, Japanese without spaces, and reading minutes.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { articleData } from "../../src/remark/articleData.js";
import type { MdNode } from "../../src/remark/mdast.js";

const text = (value: string): MdNode => ({ type: "text", value });
const heading = (depth: number, value: string, id?: string): MdNode => ({
  type: "heading",
  depth,
  children: [text(value)],
  ...(id ? { data: { hProperties: { id } } } : {}),
});
const root = (...children: MdNode[]): MdNode => ({ type: "root", children });

describe("articleData", () => {
  it("lists h2 to h4 headings with ids, in order, ids read from hProperties", () => {
    const data = articleData(
      root(
        heading(1, "Title", "title"),
        heading(2, "Seeding", "seed"),
        heading(3, "Ties", "ties"),
        heading(4, "Rolls", "rolls"),
        heading(5, "Deep", "deep"),
        heading(2, "No id"),
      ),
    );
    expect(data.toc).toEqual([
      { id: "seed", text: "Seeding", depth: 2 },
      { id: "ties", text: "Ties", depth: 3 },
      { id: "rolls", text: "Rolls", depth: 4 },
    ]);
  });

  it("counts words outside code, inline code, html and ESM, and inside JSX elements", () => {
    const data = articleData(
      root(
        {
          type: "paragraph",
          children: [text("Book the referee "), { type: "inlineCode", value: "not counted" }],
        },
        { type: "code", value: "const a = 1; const b = 2;" },
        { type: "html", value: "<div>not counted</div>" },
        { type: "mdxjsEsm", value: "export const x = 1" },
        {
          type: "mdxJsxFlowElement",
          children: [{ type: "paragraph", children: [text("Steps count")] }],
        },
      ),
    );
    expect(data.words).toBe(5);
  });

  it("counts Japanese words without spaces", () => {
    const data = articleData(root({ type: "paragraph", children: [text("大会の準備を始めます")] }));
    expect(data.words).toBeGreaterThanOrEqual(3);
  });

  it("reads at least one minute, 200 words a minute by default, or a custom rate", () => {
    const words = (n: number) => root({ type: "paragraph", children: [text("word ".repeat(n))] });
    expect(articleData(root()).readingMinutes).toBe(1);
    expect(articleData(words(401)).readingMinutes).toBe(3);
    expect(articleData(words(401), { wordsPerMinute: 400 }).readingMinutes).toBe(2);
    expect(articleData(words(401), { wordsPerMinute: 0 }).readingMinutes).toBe(3);
  });
});
