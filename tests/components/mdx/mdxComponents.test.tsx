/**
 * @file tests/components/mdx/mdxComponents.test.tsx
 * @desc Guards the shape of mdxComponents and the public ./mdx barrel's export surface.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { mdxComponents } from "../../../src/components/mdx/mdxComponents.js";
import * as mdx from "../../../src/mdx.js";

describe("mdxComponents", () => {
  it("overrides exactly a, blockquote, h2, h3, pre and table", () => {
    expect(Object.keys(mdxComponents).sort()).toEqual([
      "a",
      "blockquote",
      "h2",
      "h3",
      "pre",
      "table",
    ]);
  });
});

describe("src/mdx.ts", () => {
  it("exports mdxComponents, CodeBlock, Callout, parseCodeMeta and slugify", () => {
    expect(Object.keys(mdx).sort()).toEqual(
      ["Callout", "CodeBlock", "mdxComponents", "parseCodeMeta", "slugify"].sort(),
    );
  });
});
