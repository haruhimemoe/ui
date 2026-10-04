/**
 * @file tests/remark/slugify.test.ts
 * @desc Tests for slugify and createSlugger: GitHub-style heading slugs (lowercase, punctuation
 *       dropped, spaces to hyphens, repeats suffixed).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { createSlugger, slugify } from "../../src/remark/slugify.js";

describe("slugify", () => {
  it("lowercases, drops punctuation, turns spaces into hyphens", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  API v2 (beta)  ")).toBe("api-v2-beta");
    expect(slugify("a  b")).toBe("a--b"); // GitHub keeps one hyphen per space
  });

  it("keeps letters and digits from any script", () => {
    expect(slugify("ビートマップ 2")).toBe("ビートマップ-2");
    expect(slugify("Café-au-lait")).toBe("café-au-lait");
    expect(slugify("use_client")).toBe("use_client");
  });
});

describe("createSlugger", () => {
  it("suffixes repeats -1, -2 like GitHub", () => {
    const slug = createSlugger();
    expect([slug("Usage"), slug("Usage"), slug("Usage")]).toEqual(["usage", "usage-1", "usage-2"]);
  });

  it("skips a suffix already taken by a literal heading, like github-slugger", () => {
    const slug = createSlugger();
    expect([slug("Foo"), slug("Foo"), slug("Foo 1")]).toEqual(["foo", "foo-1", "foo-1-1"]);
  });
});
