/**
 * @file tests/remark/embeds.test.ts
 * @desc Tests for remarkEmbeds: a paragraph holding only a bare YouTube or Twitch URL becomes a
 *       data-embed div that keeps the link as fallback; other links are untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { remarkEmbeds } from "../../src/remark/embeds.js";
import type { MdNode } from "../../src/remark/mdast.js";

const URL_A = "https://youtu.be/dQw4w9WgXcQ";
const link = (url: string, text = url): MdNode => ({
  type: "link",
  url,
  children: [{ type: "text", value: text }],
});
const paragraph = (...children: MdNode[]): MdNode => ({ type: "paragraph", children });
const run = (node: MdNode) => remarkEmbeds()({ type: "root", children: [node] });

describe("remarkEmbeds", () => {
  it("marks a bare video URL paragraph as an embed div and keeps the link", () => {
    const p = paragraph(link(URL_A));
    run(p);
    expect(p.data?.hName).toBe("div");
    expect(p.data?.hProperties).toEqual({ dataEmbed: URL_A });
    expect(p.children?.[0]?.type).toBe("link");
  });

  it("leaves a link with its own text alone", () => {
    const p = paragraph(link(URL_A, "the VOD"));
    run(p);
    expect(p.data).toBeUndefined();
  });

  it("leaves a bare URL with other text in the paragraph alone", () => {
    const p = paragraph({ type: "text", value: "Watch " }, link(URL_A));
    run(p);
    expect(p.data).toBeUndefined();
  });

  it("leaves an unknown host alone", () => {
    const p = paragraph(link("https://vimeo.com/123"));
    run(p);
    expect(p.data).toBeUndefined();
  });
});
