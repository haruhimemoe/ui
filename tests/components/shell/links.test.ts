/**
 * @file tests/components/shell/links.test.ts
 * @desc Unit tests for the shell's link rules: external href detection, aria-current matching, and
 *       which hrefs can ever be the current page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { describe, expect, it } from "vitest";
import {
  ariaCurrentFor,
  canBeCurrent,
  isExternalHref,
} from "../../../src/components/shell/links.js";

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

describe("canBeCurrent", () => {
  it("is true for paths in the app, with or without a trailing slash, query or fragment", () => {
    for (const href of ["/", "/packs", "/packs/", "/guide?tab=1#top", "/#top"]) {
      expect(canBeCurrent(href), href).toBe(true);
    }
  });

  it("is false for external, relative, fragment-only, query-only and empty hrefs", () => {
    for (const href of [
      "https://example.com/packs",
      "//cdn.example.com/packs",
      "mailto:hi@example.com",
      "packs",
      "#main",
      "?page=2",
      "",
    ]) {
      expect(canBeCurrent(href), href).toBe(false);
    }
  });

  it("agrees with ariaCurrentFor: an href it rules out is never marked", () => {
    const pathnames = ["/", "/packs", "/packs/1", "/guide", "/main"];
    for (const href of ["https://example.com/packs", "packs", "#main", "?page=2", "main"]) {
      for (const pathname of pathnames) {
        expect(ariaCurrentFor(pathname, href), `${href} on ${pathname}`).toBeUndefined();
      }
    }
    expect(pathnames.some((pathname) => ariaCurrentFor(pathname, "/packs"))).toBe(true);
  });
});
