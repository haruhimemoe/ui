/**
 * @file tests/components/sortable/exports.test.ts
 * @desc The barrel exports the sortable pieces, and moveItem and the class strings work from it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import * as ui from "../../../src/index.js";

describe("the sortable exports", () => {
  it("exports the hook, the components, moveItem and the class strings", () => {
    for (const name of [
      "useSortable",
      "SortableList",
      "SortableHandle",
      "SortableMoveButtons",
      "SortableLayer",
      "moveItem",
    ] as const) {
      expect(ui, name).toHaveProperty(name, expect.any(Function));
    }
    expect(ui.moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(ui.SORTABLE_ITEM).toContain("relative");
    expect(ui.SORTABLE_CONTAINER).toContain("data-[sortable-drop=inside]");
  });
});
