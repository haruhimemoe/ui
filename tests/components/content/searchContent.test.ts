/**
 * @file tests/components/content/searchContent.test.ts
 * @desc Tests for searchContent: a blank query returns everything, multi-word AND matching, a
 *       keyword hit, a badge hit, and title-prefix entries sorting first.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { searchContent } from "../../../src/components/content/searchContent.js";
import type { ContentSearchItem } from "../../../src/components/content/types.js";

const ITEMS: ContentSearchItem[] = [
  {
    href: "/docs/guides/start",
    title: "Getting started",
    description: "Install and run your first map.",
  },
  {
    href: "/docs/tags/bold",
    title: "Bold",
    badge: "[b]",
    description: "Make text heavier.",
    keywords: ["b", "strong"],
  },
  {
    href: "/docs/tags/color",
    title: "Color",
    description: "Tint a run of text.",
    keywords: ["colour"],
  },
  {
    href: "/docs/guides/advanced",
    title: "Advanced setup",
    description: "Queues, pools and more.",
  },
];

describe("searchContent", () => {
  it("returns every item, in input order, for a blank query", () => {
    expect(searchContent(ITEMS, "")).toEqual(ITEMS);
    expect(searchContent(ITEMS, "   ")).toEqual(ITEMS);
  });

  it("matches only items where every word of a multi-word query appears", () => {
    const found = searchContent(ITEMS, "getting started");
    expect(found.map((item) => item.href)).toEqual(["/docs/guides/start"]);
  });

  it("matches a word found only in keywords", () => {
    const found = searchContent(ITEMS, "strong");
    expect(found.map((item) => item.href)).toEqual(["/docs/tags/bold"]);
  });

  it("matches a word found only in the badge", () => {
    const found = searchContent(ITEMS, "[b]");
    expect(found.map((item) => item.href)).toEqual(["/docs/tags/bold"]);
  });

  it("is case-insensitive", () => {
    const found = searchContent(ITEMS, "COLOR");
    expect(found.map((item) => item.href)).toEqual(["/docs/tags/color"]);
  });

  it("returns nothing when a word of the query matches no item", () => {
    expect(searchContent(ITEMS, "getting nonexistent")).toEqual([]);
  });

  it("orders title-prefix matches first, then the rest in input order", () => {
    // "setup" hits "Advanced setup" (not a title-prefix match) and nothing else by itself;
    // use a query that both a title-prefix item and a later, non-prefix item match.
    const items: ContentSearchItem[] = [
      { href: "/a", title: "Setup guide", description: "Queues and more." },
      { href: "/b", title: "Getting started", description: "A setup walkthrough." },
      { href: "/c", title: "Setup tips", description: "More setup detail." },
    ];
    const found = searchContent(items, "setup");
    expect(found.map((item) => item.href)).toEqual(["/a", "/c", "/b"]);
  });
});
