/**
 * @file tests/components/shell/links.test.ts
 * @desc Unit tests for the shell's link rules: external href detection and aria-current matching.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { describe, expect, it } from "vitest";
import { ariaCurrentFor, isExternalHref } from "../../../src/components/shell/links.js";

describe("isExternalHref", () => {
  it("treats URLs with a scheme and protocol-relative URLs as external", () => {
    for (const href of [
      "https://packs.haruhime.moe",
      "http://example.com",
      "mailto:hi@example.com",
      "//cdn.example.com/x",
      "HTTPS://EXAMPLE.COM",
    ]) {
      expect(isExternalHref(href)).toBe(true);
    }
  });

  it("treats paths, fragments and queries as internal", () => {
    for (const href of ["/", "/packs", "packs", "#main", "?page=2"]) {
      expect(isExternalHref(href)).toBe(false);
    }
  });
});

describe("ariaCurrentFor", () => {
  it("marks the exact path as the current page", () => {
    expect(ariaCurrentFor("/packs", "/packs")).toBe("page");
    expect(ariaCurrentFor("/", "/")).toBe("page");
  });

  it("marks a section link as current while on a page under it", () => {
    expect(ariaCurrentFor("/packs/123", "/packs")).toBe("true");
    expect(ariaCurrentFor("/packs/a/b", "/packs/")).toBe("true");
  });

  it("ignores trailing slashes, queries and fragments", () => {
    expect(ariaCurrentFor("/guide/", "/guide")).toBe("page");
    expect(ariaCurrentFor("/guide", "/guide?tab=1#top")).toBe("page");
  });

  it("never matches the home link against other pages, or a shared prefix that is not a segment", () => {
    expect(ariaCurrentFor("/packs", "/")).toBeUndefined();
    expect(ariaCurrentFor("/packsy", "/packs")).toBeUndefined();
  });

  it("never matches outside the router, external links or relative hrefs", () => {
    expect(ariaCurrentFor(null, "/packs")).toBeUndefined();
    expect(ariaCurrentFor("", "/packs")).toBeUndefined();
    expect(ariaCurrentFor("/packs", "https://example.com/packs")).toBeUndefined();
    expect(ariaCurrentFor("/packs", "packs")).toBeUndefined();
    expect(ariaCurrentFor("/packs", "#main")).toBeUndefined();
  });
});
