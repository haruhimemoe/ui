/**
 * @file tests/remark/localHrefs.test.ts
 * @desc Tests for rehypeLocalHrefs on hand-built hast: rewrites only same-page hrefs whose
 *       prefixed id exists and whose bare id doesn't; external, empty and dead links stay.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { rehypeLocalHrefs } from "../../src/remark/localHrefs.js";

const a = (href: string) => ({ type: "element", tagName: "a", properties: { href }, children: [] });
const el = (id: string) => ({ type: "element", tagName: "h2", properties: { id }, children: [] });

describe("rehypeLocalHrefs", () => {
  it("rewrites, skips and leaves alone as it should", () => {
    const links = [
      a("#x"),
      a("#bare"),
      a("#dead"),
      a("#"),
      a("https://x.example/#x"),
      a("#%E0%A4"),
    ];
    const tree = {
      type: "root",
      children: [el("user-content-x"), el("bare"), el("user-content-bare"), ...links],
    };
    rehypeLocalHrefs()(tree);
    expect(links.map((link) => link.properties.href)).toEqual([
      "#user-content-x",
      "#bare",
      "#dead",
      "#",
      "https://x.example/#x",
      "#%E0%A4",
    ]);
  });

  it("takes another prefix", () => {
    const link = a("#x");
    rehypeLocalHrefs({ prefix: "p-" })({ type: "root", children: [el("p-x"), link] });
    expect(link.properties.href).toBe("#p-x");
  });
});
