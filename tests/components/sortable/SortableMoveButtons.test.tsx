/**
 * @file tests/components/sortable/SortableMoveButtons.test.tsx
 * @desc SortableMoveButtons: "Move {label} up" and "down" names with default chevron icons
 *       (aria-hidden, sized "sm"), a title mirroring the aria-label, off at the ends, vertical
 *       orientation, its own words and variant (sized "md" when text overrides are set), focus
 *       kept on the same button or moved to the other one at an end, and no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
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
  it("names both buttons, shows a hidden chevron and a matching title, and turns off at the ends", () => {
    renderBoard();
    const up = button("Move A up");
    expect(up.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(up).toHaveAttribute("title", "Move A up");
    expect(up).toBeDisabled();
    expect(button("Move C down")).toBeDisabled();
    expect(button("Move B up")).toBeEnabled();
    expect(button("Move B up")).toHaveAttribute("data-sortable-move", "up");
    expect(button("Move B up")).toHaveAttribute("data-sortable-for", "b");
    expect(button("Move B up").className).toBe(buttonClasses({ variant: "ghost", size: "sm" }));
  });

  it("takes its own words, variant and a sensible size", () => {
    render(<Pair />);
    expect(button("Move x down")).toHaveTextContent("Lower");
    expect(button("Move y up")).toHaveTextContent("Raise");
    expect(button("Move y up")).toHaveAttribute("title", "Move y up");
    expect(button("Move y up").className).toBe(buttonClasses({ variant: "secondary", size: "md" }));
  });

  it('stacks vertically with orientation="vertical"', () => {
    const { container } = render(<SortableMoveButtonsHarness orientation="vertical" />);
    expect(container.querySelector("span")?.className).toContain("flex-col");
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

function SortableMoveButtonsHarness({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const sortable = useSortable({ onMove: () => true });
  return (
    <ol {...sortable.container("solo", { label: "Solo" })}>
      <li {...sortable.item("x", { container: "solo", index: 0, label: "x" })}>
        <SortableMoveButtons sortable={sortable} id="x" label="x" orientation={orientation} />
      </li>
    </ol>
  );
}
