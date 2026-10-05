/**
 * @file tests/components/sortable/SortableLayer.test.tsx
 * @desc SortableLayer: the assertive live region is in the page before anything is said, it
 *       speaks each announcement, the instructions are a hidden paragraph the handles point at,
 *       and no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { handle, live, renderBoard } from "../../helpers/sortable.js";

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
});
