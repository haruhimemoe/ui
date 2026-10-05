/**
 * @file tests/remark/index.test.ts
 * @desc Tests for the default remarkHaruhime export: runs code meta, callouts, heading ids,
 *       figures and embeds together, respects per-plugin opt-outs, and the module's exported
 *       surface is exactly what the package's public API promises.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import remarkHaruhime from "../../src/remark/index.js";
import type { MdNode } from "../../src/remark/mdast.js";

describe("remarkHaruhime", () => {
  it("runs code meta, callouts and heading ids on one tree", () => {
    const tree: MdNode = {
      type: "root",
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "Usage" }] },
        { type: "code", value: "x", meta: 'title="a.ts"' },
        {
          type: "blockquote",
          children: [{ type: "paragraph", children: [{ type: "text", value: "[!NOTE]\nBody." }] }],
        },
      ],
    };
    remarkHaruhime()(tree);
    expect(tree.children?.[0]?.data?.hProperties?.id).toBe("usage");
    expect(tree.children?.[1]?.data?.hProperties?.dataMeta).toBe('title="a.ts"');
    expect(tree.children?.[2]?.data?.hProperties?.dataCallout).toBe("note");
  });

  it("skips callouts when { callouts: false } but still sets ids and meta", () => {
    const tree: MdNode = {
      type: "root",
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "Usage" }] },
        { type: "code", value: "x", meta: 'title="a.ts"' },
        {
          type: "blockquote",
          children: [{ type: "paragraph", children: [{ type: "text", value: "[!NOTE]\nBody." }] }],
        },
      ],
    };
    remarkHaruhime({ callouts: false })(tree);
    expect(tree.children?.[0]?.data?.hProperties?.id).toBe("usage");
    expect(tree.children?.[1]?.data?.hProperties?.dataMeta).toBe('title="a.ts"');
    expect(tree.children?.[2]?.data).toBeUndefined();
  });

  it("skips code meta and heading ids when disabled, keeping callouts", () => {
    const tree: MdNode = {
      type: "root",
      children: [
        { type: "heading", depth: 2, children: [{ type: "text", value: "Usage" }] },
        { type: "code", value: "x", meta: 'title="a.ts"' },
        {
          type: "blockquote",
          children: [{ type: "paragraph", children: [{ type: "text", value: "[!NOTE]\nBody." }] }],
        },
      ],
    };
    remarkHaruhime({ codeMeta: false, headingIds: false })(tree);
    expect(tree.children?.[0]?.data).toBeUndefined();
    expect(tree.children?.[1]?.data).toBeUndefined();
    expect(tree.children?.[2]?.data?.hProperties?.dataCallout).toBe("note");
  });

  it("works when called with undefined options", () => {
    const tree: MdNode = {
      type: "root",
      children: [{ type: "heading", depth: 2, children: [{ type: "text", value: "Usage" }] }],
    };
    remarkHaruhime(undefined)(tree);
    expect(tree.children?.[0]?.data?.hProperties?.id).toBe("usage");
  });

  it("exposes exactly the public surface", async () => {
    const mod = await import("../../src/remark/index.js");
    expect(Object.keys(mod).sort()).toEqual([
      "createSlugger",
      "default",
      "parseEmbedUrl",
      "remarkCallouts",
      "remarkCodeMeta",
      "remarkEmbeds",
      "remarkFigures",
      "remarkHeadingIds",
      "slugify",
    ]);
  });

  it("runs figures and embeds by default and skips each when turned off", () => {
    const make = (): MdNode => ({
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "image", url: "/a.png", alt: "A", title: null }] },
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url: "https://youtu.be/dQw4w9WgXcQ",
              children: [{ type: "text", value: "https://youtu.be/dQw4w9WgXcQ" }],
            },
          ],
        },
      ],
    });
    const on = make();
    remarkHaruhime()(on);
    expect(on.children?.map((c) => c.data?.hName)).toEqual(["figure", "div"]);
    const off = make();
    remarkHaruhime({ figures: false, embeds: false })(off);
    expect(off.children?.map((c) => c.data?.hName)).toEqual([undefined, undefined]);
  });
});
