/**
 * @file tests/remark/headingIds.test.ts
 * @desc Tests for remarkHeadingIds: depth-2/3 headings get a slugged id from their text (inline
 *       code and emphasis included), depth 1/4 get none, duplicates are suffixed, an existing id
 *       is kept, and text that slugs to empty gets no id.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { remarkHeadingIds } from "../../src/remark/headingIds.js";
import type { MdNode } from "../../src/remark/mdast.js";

const heading = (depth: number, children: MdNode[], data?: MdNode["data"]): MdNode => ({
  type: "heading",
  depth,
  children,
  ...(data ? { data } : {}),
});

describe("remarkHeadingIds", () => {
  it("ids a depth-2 heading from its text, including inlineCode and emphasis children", () => {
    const h = heading(2, [
      { type: "text", value: "The " },
      { type: "inlineCode", value: "pre" },
      { type: "text", value: " " },
      { type: "emphasis", children: [{ type: "text", value: "tag" }] },
    ]);
    remarkHeadingIds()({ type: "root", children: [h] });
    expect(h.data?.hProperties?.id).toBe("the-pre-tag");
  });

  it("ids a depth-3 heading", () => {
    const h = heading(3, [{ type: "text", value: "Usage" }]);
    remarkHeadingIds()({ type: "root", children: [h] });
    expect(h.data?.hProperties?.id).toBe("usage");
  });

  it("does not id depth-1 or depth-4 headings", () => {
    const h1 = heading(1, [{ type: "text", value: "Title" }]);
    const h4 = heading(4, [{ type: "text", value: "Sub" }]);
    remarkHeadingIds()({ type: "root", children: [h1, h4] });
    expect(h1.data).toBeUndefined();
    expect(h4.data).toBeUndefined();
  });

  it("suffixes duplicate heading text with -1", () => {
    const a = heading(2, [{ type: "text", value: "Usage" }]);
    const b = heading(2, [{ type: "text", value: "Usage" }]);
    remarkHeadingIds()({ type: "root", children: [a, b] });
    expect(a.data?.hProperties?.id).toBe("usage");
    expect(b.data?.hProperties?.id).toBe("usage-1");
  });

  it("keeps an existing custom id", () => {
    const h = heading(2, [{ type: "text", value: "Usage" }], {
      hProperties: { id: "custom" },
    });
    remarkHeadingIds()({ type: "root", children: [h] });
    expect(h.data?.hProperties?.id).toBe("custom");
  });

  it("sets no id when the heading text slugs to an empty string", () => {
    const h = heading(2, [{ type: "text", value: "!!!" }]);
    remarkHeadingIds()({ type: "root", children: [h] });
    expect(h.data?.hProperties?.id).toBeUndefined();
  });
});
