/**
 * @file tests/components/osu/MapGroup.test.tsx
 * @desc MapGroup: heading level, count and "of target", detail, aria-labelledby, headingProps id
 *       winning over the generated id, empty text, no empty text for children without a count,
 *       empty slot rows vs summary, rest props on the section, ol vs ul, copy scope, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MapGroup } from "../../../src/components/osu/MapGroup.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("MapGroup", () => {
  it("names its section by a level-3 heading with count, target and detail", () => {
    render(
      <MapGroup title="NM" count={4} target={5} detail="Nomod">
        <li>map</li>
      </MapGroup>,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.textContent).toBe("NM (4 of 5) · Nomod");
    expect(screen.getByRole("region", { name: "NM (4 of 5) · Nomod" })).toContainElement(heading);
    expect(screen.getByText("(4 of 5) · Nomod").className).toContain("text-c3");
  });

  it("takes a heading level and headingProps, whose id wins", () => {
    render(
      <MapGroup title="HD" headingLevel={2} headingProps={{ id: "hd", tabIndex: -1 }}>
        <li>map</li>
      </MapGroup>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "HD" });
    expect(heading).toHaveAttribute("id", "hd");
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading.closest("section")).toHaveAttribute("aria-labelledby", "hd");
  });

  it("says No maps yet. when empty, and takes its own text", () => {
    const { rerender } = render(<MapGroup title="NM" count={0} />);
    expect(screen.getByText("No maps yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<MapGroup title="NM" empty="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("shows no empty text and no (0) for children without a count", () => {
    render(
      <MapGroup title="NM">
        <li>map one</li>
      </MapGroup>,
    );
    expect(screen.queryByText("No maps yet.")).toBeNull();
    expect(screen.getByRole("heading").textContent).toBe("NM");
  });

  it("draws empty slots as dashed rows, or one summary row", () => {
    const { container, rerender } = render(
      <MapGroup title="NM" count={1} emptySlots={2}>
        <li>map</li>
      </MapGroup>,
    );
    let empties = container.querySelectorAll("li[data-empty-slot]");
    expect(empties).toHaveLength(2);
    expect(empties[0]).toHaveTextContent("Empty slot");
    expect((empties[0] as HTMLElement).className).toContain("border-dashed");
    rerender(
      <MapGroup
        title="NM"
        count={1}
        emptySlots={2}
        emptySlotsAs="summary"
        emptySlotText={(n) => `${n} more NM maps`}
      >
        <li>map</li>
      </MapGroup>,
    );
    empties = container.querySelectorAll("li[data-empty-slot]");
    expect(empties).toHaveLength(1);
    expect(empties[0]).toHaveTextContent("2 more NM maps");
  });

  it("passes rest props to the section and lists in ol by default", () => {
    const { container, rerender } = render(
      <MapGroup title="NM" data-sortable-container="" className="x">
        <li>map</li>
      </MapGroup>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section).toHaveAttribute("data-sortable-container");
    expect(section.className).toContain("x");
    expect(container.querySelector("ol")).not.toBeNull();
    rerender(
      <MapGroup title="NM" list="ul">
        <li>map</li>
      </MapGroup>,
    );
    expect(container.querySelector("ul")).not.toBeNull();
  });

  it("shows an optional mod pill, hidden from the heading's name", () => {
    render(
      <MapGroup title="Custom" badge={{ mod: "X", color: "teal" }}>
        <li>map</li>
      </MapGroup>,
    );
    expect(screen.getByRole("heading", { name: "Custom" })).toBeInTheDocument();
    expect(screen.getByText("X").className).toContain("bg-teal-300");
  });

  it("puts actions beside the heading", () => {
    render(
      <MapGroup title="NM" actions={<button type="button">Find maps</button>}>
        <li>map</li>
      </MapGroup>,
    );
    expect(screen.getByRole("button", { name: "Find maps" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MapGroup title="NM" count={1} target={3} emptySlots={2}>
        <li>map</li>
      </MapGroup>,
    );
    await expectNoAxeViolations(container);
  });
});
