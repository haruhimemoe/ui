/**
 * @file tests/components/sortable/SortableLayer.test.tsx
 * @desc SortableLayer: the assertive live region is in the page before anything is said, it
 *       speaks each announcement, the instructions are a hidden paragraph the handles point at,
 *       the pointer chip shows only during pointer drags with the refusal under the label, and
 *       no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { handle, live, mockLayout, pointer, renderBoard } from "../../helpers/sortable.js";

describe("SortableLayer", () => {
  it("mounts the live region before the first announcement", async () => {
    const { user } = renderBoard();
    const region = live();
    expect(region).toBeEmptyDOMElement();
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toHaveClass("sr-only");
    handle("A").focus();
    await user.keyboard(" ");
    expect(live()).toBe(region);
    expect(region).toHaveTextContent("Picked up A. Position 1 of 3 in NM.");
  });

  it("keeps the instructions in a hidden paragraph the handles point at", () => {
    renderBoard();
    const id = handle("A").getAttribute("aria-describedby") ?? "";
    const instructions = document.getElementById(id);
    expect(instructions?.tagName).toBe("P");
    expect(instructions).toHaveAttribute("hidden");
    expect(instructions).toHaveTextContent(/^Press Space or Enter to pick up\./);
  });

  it("has no axe violations", async () => {
    const { container } = renderBoard();
    await expectNoAxeViolations(container);
  });

  it("shows the chip during pointer drags only, with the refusal under the label", async () => {
    mockLayout();
    const { user } = renderBoard({
      canDrop: (move) => (move.to.container === "hd" ? "HD is full." : true),
    });
    handle("A").focus();
    await user.keyboard(" ");
    expect(document.querySelector("[data-sortable-chip]")).toBeNull();
    await user.keyboard("{Escape}");
    pointer("pointerDown", handle("A"), 10, 20);
    pointer("pointerMove", handle("A"), 10, 30);
    const chip = document.querySelector<HTMLElement>("[data-sortable-chip]");
    expect(chip).toHaveAttribute("aria-hidden", "true");
    expect(chip).toHaveTextContent("A");
    expect(chip?.style.transform).toBe("translate(22px, 42px)");
    pointer("pointerMove", handle("A"), 10, 250);
    expect(document.querySelector("[data-sortable-chip]")).toHaveTextContent("AHD is full.");
    expect(document.body.style.cursor).toBe("not-allowed");
    pointer("pointerUp", handle("A"), 10, 250);
    expect(document.querySelector("[data-sortable-chip]")).toBeNull();
    expect(live()).toHaveTextContent(
      "A can't go there: HD is full. Back at position 1 of 3 in NM.",
    );
    vi.restoreAllMocks();
  });
});
