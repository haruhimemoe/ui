/**
 * @file tests/components/sortable/sortableStyles.test.ts
 * @desc The indicator class strings: keyed off the data attributes, h1 for a target, c4 for a
 *       refused one and the lifted outline, the line centred in --sortable-gap, forced colors,
 *       the fade on the motion tokens, and no opacity on the lifted row.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import {
  SORTABLE_CONTAINER,
  SORTABLE_ITEM,
} from "../../../src/components/sortable/sortableStyles.js";

describe("SORTABLE_ITEM", () => {
  const classes = SORTABLE_ITEM.split(" ");
  it("draws the line in a before: pseudo-element on each axis", () => {
    expect(classes).toContain("relative");
    expect(classes).toContain("data-[sortable-line=top]:before:border-t-2");
    expect(classes).toContain("data-[sortable-line=left]:before:border-l-2");
    expect(SORTABLE_ITEM).toContain("var(--sortable-gap,0px)");
    expect(classes).toContain("forced-colors:before:border-[Highlight]");
    expect(classes).toContain("motion-safe:before:transition-opacity");
    expect(classes).toContain("before:duration-short");
  });
  it("outlines onto targets in h1, refused ones in c4, and the lifted item in c4", () => {
    expect(classes).toContain("data-[sortable-drop=onto]:outline-h1");
    expect(classes).toContain("data-[sortable-refused]:data-[sortable-drop=onto]:outline-c4");
    expect(classes).toContain("data-[sortable-refused]:before:border-c4");
    expect(classes).toContain("data-[sortable-state=lifted]:outline-c4");
    expect(SORTABLE_ITEM).not.toMatch(/opacity-50/);
  });
});

describe("SORTABLE_CONTAINER", () => {
  it("outlines an empty or onto container while it is the target", () => {
    expect(SORTABLE_CONTAINER).toContain("data-[sortable-drop=inside]:outline-dashed");
    expect(SORTABLE_CONTAINER).toContain("data-[sortable-drop=inside]:outline-h1");
    expect(SORTABLE_CONTAINER).toContain(
      "data-[sortable-refused]:data-[sortable-drop=inside]:outline-c4",
    );
  });
});
