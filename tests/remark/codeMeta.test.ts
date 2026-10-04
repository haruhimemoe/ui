/**
 * @file tests/remark/codeMeta.test.ts
 * @desc Tests for remarkCodeMeta: a code node's fenced-code meta string becomes
 *       data.hProperties.dataMeta, reachable through nested blocks, without clobbering existing
 *       hProperties.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { remarkCodeMeta } from "../../src/remark/codeMeta.js";
import type { MdNode } from "../../src/remark/mdast.js";

describe("remarkCodeMeta", () => {
  it("sets data.hProperties.dataMeta from a code node's meta string", () => {
    const tree: MdNode = { type: "code", value: "const x = 1;", meta: 'title="a.ts" {2}' };
    remarkCodeMeta()(tree);
    expect(tree.data?.hProperties?.dataMeta).toBe('title="a.ts" {2}');
  });

  it("leaves a code node with no meta untouched", () => {
    const tree: MdNode = { type: "code", value: "const x = 1;", meta: null };
    remarkCodeMeta()(tree);
    expect(tree.data).toBeUndefined();
  });

  it("reaches a code node nested inside a listItem", () => {
    const code: MdNode = { type: "code", value: "x", meta: 'title="b.ts"' };
    const tree: MdNode = {
      type: "root",
      children: [{ type: "listItem", children: [code] }],
    };
    remarkCodeMeta()(tree);
    expect(code.data?.hProperties?.dataMeta).toBe('title="b.ts"');
  });

  it("keeps existing hProperties keys", () => {
    const tree: MdNode = {
      type: "code",
      value: "x",
      meta: 'title="c.ts"',
      data: { hProperties: { className: ["language-ts"] } },
    };
    remarkCodeMeta()(tree);
    expect(tree.data?.hProperties?.className).toEqual(["language-ts"]);
    expect(tree.data?.hProperties?.dataMeta).toBe('title="c.ts"');
  });
});
