/**
 * @file tests/remark/figures.test.ts
 * @desc Tests for remarkFigures: a paragraph holding only an image becomes a figure, its title
 *       moves into a trailing figcaption, and images in running text or code are untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { remarkFigures } from "../../src/remark/figures.js";
import type { MdNode } from "../../src/remark/mdast.js";

const image = (title: string | null): MdNode => ({ type: "image", url: "/a.png", alt: "A", title });
const run = (children: MdNode[]): MdNode => {
  const root: MdNode = { type: "root", children };
  remarkFigures()(root);
  return root;
};

describe("remarkFigures", () => {
  it("turns a lone image without a title into a figure with no caption", () => {
    const p: MdNode = { type: "paragraph", children: [image(null)] };
    run([p]);
    expect(p.data?.hName).toBe("figure");
    expect(p.children).toHaveLength(1);
  });

  it("moves the title into a trailing figcaption and removes it from the image", () => {
    const img = image("Qualifier lobby");
    const p: MdNode = { type: "paragraph", children: [img] };
    run([p]);
    expect(p.data?.hName).toBe("figure");
    expect(img.title).toBeNull();
    expect(p.children?.[1]).toEqual({
      type: "paragraph",
      data: { hName: "figcaption" },
      children: [{ type: "text", value: "Qualifier lobby" }],
    });
  });

  it("leaves an image inside running text alone", () => {
    const p: MdNode = {
      type: "paragraph",
      children: [{ type: "text", value: "See " }, image("x")],
    };
    run([p]);
    expect(p.data).toBeUndefined();
  });

  it("never touches a code block that looks like an image line", () => {
    const code: MdNode = { type: "code", value: "![A](/a.png)" };
    run([code]);
    expect(code).toEqual({ type: "code", value: "![A](/a.png)" });
  });
});
