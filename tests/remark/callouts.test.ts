/**
 * @file tests/remark/callouts.test.ts
 * @desc Tests for remarkCallouts: GitHub-style `> [!NOTE]` blockquote markers become
 *       data.hProperties.dataCallout, the marker text is stripped, and non-matching or malformed
 *       blockquotes are left untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { remarkCallouts } from "../../src/remark/callouts.js";
import type { MdNode } from "../../src/remark/mdast.js";

const quote = (...texts: string[]): MdNode => ({
  type: "blockquote",
  children: [{ type: "paragraph", children: texts.map((value) => ({ type: "text", value })) }],
});

describe("remarkCallouts", () => {
  it("types [!NOTE] as note and strips the marker from the text", () => {
    const tree = quote("[!NOTE]\nRead this.");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("note");
    expect(tree.children?.[0]?.children?.[0]?.value).toBe("Read this.");
  });

  it("lowercases [!tip]", () => {
    const tree = quote("[!tip]\nBody.");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("tip");
  });

  it("maps [!IMPORTANT] to tip", () => {
    const tree = quote("[!IMPORTANT]\nBody.");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("tip");
  });

  it("maps [!CAUTION] to warning", () => {
    const tree = quote("[!CAUTION]\nBody.");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("warning");
  });

  it("maps [!WARNING] to warning", () => {
    const tree = quote("[!WARNING]\nBody.");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("warning");
  });

  it("removes the first paragraph when the marker is alone in it, keeping the second", () => {
    const tree: MdNode = {
      type: "blockquote",
      children: [
        { type: "paragraph", children: [{ type: "text", value: "[!WARNING]" }] },
        { type: "paragraph", children: [{ type: "text", value: "Second." }] },
      ],
    };
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("warning");
    expect(tree.children?.length).toBe(1);
    expect(tree.children?.[0]?.type).toBe("paragraph");
    expect(tree.children?.[0]?.children?.[0]?.value).toBe("Second.");
  });

  it("joins a marker split across several text nodes before matching", () => {
    const tree = quote("[", "!NOTE]", "\nBody");
    remarkCallouts()(tree);
    expect(tree.data?.hProperties?.dataCallout).toBe("note");
    expect(tree.children?.[0]?.children?.[0]?.value).toBe("Body");
  });

  it("leaves an ordinary quote untouched", () => {
    const tree = quote("Just a quote");
    remarkCallouts()(tree);
    expect(tree.data).toBeUndefined();
  });

  it("leaves a quote with a bogus marker untouched", () => {
    const tree = quote("[!BOGUS] x");
    remarkCallouts()(tree);
    expect(tree.data).toBeUndefined();
  });

  it("leaves a blockquote whose paragraph starts with a non-text child untouched", () => {
    const tree: MdNode = {
      type: "blockquote",
      children: [
        {
          type: "paragraph",
          children: [{ type: "inlineCode", value: "[!NOTE]" }],
        },
      ],
    };
    remarkCallouts()(tree);
    expect(tree.data).toBeUndefined();
  });

  it("leaves a blockquote whose first child is a code node untouched", () => {
    const tree: MdNode = {
      type: "blockquote",
      children: [{ type: "code", value: "[!NOTE]" }],
    };
    remarkCallouts()(tree);
    expect(tree.data).toBeUndefined();
  });

  it("types a callout nested inside another blockquote, leaving the outer quote untouched", () => {
    const inner = quote("[!NOTE]\nNested.");
    const outer: MdNode = {
      type: "blockquote",
      children: [{ type: "paragraph", children: [{ type: "text", value: "Outer." }] }, inner],
    };
    remarkCallouts()(outer);
    expect(outer.data).toBeUndefined();
    expect(inner.data?.hProperties?.dataCallout).toBe("note");
  });
});
