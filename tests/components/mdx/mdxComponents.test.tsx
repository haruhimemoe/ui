/**
 * @file tests/components/mdx/mdxComponents.test.tsx
 * @desc Guards the shape of mdxComponents and the public ./mdx barrel's export surface.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { mdxComponents } from "../../../src/components/mdx/mdxComponents.js";
import * as mdx from "../../../src/mdx.js";

describe("mdxComponents", () => {
  it("overrides the twelve elements", () => {
    expect(Object.keys(mdxComponents).sort()).toEqual([
      "a",
      "blockquote",
      "details",
      "div",
      "h2",
      "h3",
      "h4",
      "img",
      "input",
      "kbd",
      "pre",
      "table",
    ]);
  });
});

describe("src/mdx.ts", () => {
  it("exports the MDX pieces", () => {
    expect(Object.keys(mdx).sort()).toEqual(
      [
        "Callout",
        "CodeBlock",
        "Embed",
        "Figure",
        "Glossary",
        "Kbd",
        "MdxLinkCard",
        "Schedule",
        "Steps",
        "Term",
        "mdxComponents",
        "parseCodeMeta",
        "parseEmbedUrl",
        "slugify",
      ].sort(),
    );
  });
});
