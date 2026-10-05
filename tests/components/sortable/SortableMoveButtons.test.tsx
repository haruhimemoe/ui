/**
 * @file tests/components/sortable/SortableMoveButtons.test.tsx
 * @desc SortableMoveButtons: "Move {label} up" and "down" in Up and Down text, off at the ends,
 *       its own words and variant, focus kept on the same button or moved to the other one at an
 *       end, and no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buttonClasses } from "../../../src/components/basics/buttonStyles.js";
import { SortableMoveButtons } from "../../../src/components/sortable/SortableMoveButtons.js";
import { useSortable } from "../../../src/components/sortable/useSortable.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { order, renderBoard } from "../../helpers/sortable.js";

const button = (name: string) => screen.getByRole("button", { name });

function Pair() {
  const sortable = useSortable({ onMove: () => true });
  return (
    <ol {...sortable.container("pair", { label: "Pair" })}>
      {["x", "y"].map((id, index) => (
        <li key={id} {...sortable.item(id, { container: "pair", index, label: id })}>
          <SortableMoveButtons
            sortable={sortable}
            id={id}
            label={id}
            upText="Raise"
            downText="Lower"
            variant="secondary"
          />
        </li>
      ))}
    </ol>
  );
}

describe("SortableMoveButtons", () => {
  it("names both buttons and turns them off at the ends", () => {
    renderBoard();
    expect(button("Move A up")).toHaveTextContent("Up");
    expect(button("Move A down")).toHaveTextContent("Down");
    expect(button("Move A up")).toBeDisabled();
    expect(button("Move C down")).toBeDisabled();
    expect(button("Move B up")).toBeEnabled();
    expect(button("Move B up")).toHaveAttribute("data-sortable-move", "up");
    expect(button("Move B up")).toHaveAttribute("data-sortable-for", "b");
  });

  it("takes its own words and variant", () => {
    render(<Pair />);
    expect(button("Move x down")).toHaveTextContent("Lower");
    expect(button("Move y up")).toHaveTextContent("Raise");
    expect(button("Move y up").className).toBe(buttonClasses({ variant: "secondary" }));
  });

  it("keeps focus on the same button, or the other one at an end", async () => {
    const user = userEvent.setup();
    renderBoard();
    await user.click(button("Move B down"));
    expect(order("NM")).toEqual(["a", "c", "b"]);
    expect(button("Move B up")).toHaveFocus();
    await user.click(button("Move B up"));
    expect(order("NM")).toEqual(["a", "b", "c"]);
    expect(button("Move B up")).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Pair />);
    await expectNoAxeViolations(container);
  });
});
