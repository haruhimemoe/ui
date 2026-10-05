/**
 * @file tests/components/sortable/SortableHandle.test.tsx
 * @desc SortableHandle: a native button named "Reorder {label}", described by the instructions,
 *       a toggle while lifted, a hidden six-dot grip, a 24px target that grows to 44px on coarse
 *       pointers, no touch scrolling, className merged last, and no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SortableHandle } from "../../../src/components/sortable/SortableHandle.js";
import { useSortable } from "../../../src/components/sortable/useSortable.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { handle, renderBoard } from "../../helpers/sortable.js";

function One({ className }: { className?: string }) {
  const sortable = useSortable({ onMove: () => true });
  return (
    <ol {...sortable.container("one", { label: "One" })}>
      <li {...sortable.item("x", { container: "one", index: 0, label: "X" })}>
        <SortableHandle sortable={sortable} id="x" className={className} />
      </li>
    </ol>
  );
}

describe("SortableHandle", () => {
  it("is a labelled, described button with a hidden grip", () => {
    renderBoard();
    const grip = handle("A");
    expect(grip.tagName).toBe("BUTTON");
    expect(grip).toHaveAttribute("type", "button");
    expect(grip).toHaveAttribute("aria-pressed", "false");
    expect(grip).toHaveAccessibleDescription(
      "Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel.",
    );
    expect(grip.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(grip.querySelectorAll("circle")).toHaveLength(6);
  });

  it("is a 24px target, 44px on coarse pointers, with no touch scrolling, className last", () => {
    render(<One className="self-start" />);
    const grip = handle("X");
    for (const name of ["size-6", "coarse:size-11", "touch-none", "cursor-grab", "self-start"]) {
      expect(grip).toHaveClass(name);
    }
  });

  it("shows when it is lifted", async () => {
    const user = userEvent.setup();
    render(<One />);
    handle("X").focus();
    await user.keyboard(" ");
    expect(handle("X")).toHaveAttribute("aria-pressed", "true");
    expect(handle("X")).toHaveAttribute("data-lifted", "");
    expect(handle("X")).toHaveClass("data-[lifted]:bg-h2");
  });

  it("has no axe violations", async () => {
    const { container } = renderBoard();
    await expectNoAxeViolations(container);
  });
});
