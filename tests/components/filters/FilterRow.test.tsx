/**
 * @file tests/components/filters/FilterRow.test.tsx
 * @desc Component tests for FilterRow: group labeling, label column layout, controls inside it,
 *       keyboard reach, native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ChipGroup } from "../../../src/components/filters/ChipGroup.js";
import { FilterRow } from "../../../src/components/filters/FilterRow.js";
import { RangeSlider } from "../../../src/components/filters/RangeSlider.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("FilterRow", () => {
  it("is a group named by its label column", () => {
    render(
      <FilterRow label="Mode">
        <button type="button">osu!</button>
      </FilterRow>,
    );
    const row = screen.getByRole("group", { name: "Mode" });
    expect(row.tagName).toBe("FIELDSET");
    expect(within(row).getByRole("button", { name: "osu!" })).toBeInTheDocument();
  });

  it("stacks on phones and puts the label in a left column from sm up", () => {
    render(<FilterRow label="Length">controls</FilterRow>);
    const row = screen.getByRole("group", { name: "Length" });
    expect(row).toHaveClass("flex", "flex-col", "sm:flex-row", "sm:items-baseline");
    expect(screen.getByText("Length")).toHaveClass("font-bold", "text-c3", "text-sm", "sm:w-28");
    expect(screen.getByText("controls")).toHaveClass("min-w-0", "flex-1");
  });

  it("holds a ChipGroup and a RangeSlider with hideLabel, naming each row's group once", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FilterRow label="Mods">
          <ChipGroup
            label="Mods"
            hideLabel
            options={[{ value: "HD", label: "HD" }]}
            value={[]}
            onChange={() => {}}
          />
        </FilterRow>
        <FilterRow label="BPM">
          <RangeSlider
            label="BPM"
            hideLabel
            min={60}
            max={300}
            value={[60, 300]}
            onChange={() => {}}
          />
        </FilterRow>
      </div>,
    );
    // One group per row, so a screen reader says "Mods grouping" once, not twice.
    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Mods" })).toContainElement(
      screen.getByRole("button", { name: "HD" }),
    );
    expect(screen.getByRole("group", { name: "BPM" })).toContainElement(
      screen.getByRole("slider", { name: "Minimum BPM" }),
    );
    expect(screen.getAllByText("BPM")).toHaveLength(1);

    await user.tab();
    expect(screen.getByRole("button", { name: "HD" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Minimum BPM" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("slider", { name: "Minimum BPM" })).toHaveFocus();
  });

  it("appends a caller className and passes native props and a ref through", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <FilterRow ref={ref} label="Maps" className="py-2" data-testid="maps">
        x
      </FilterRow>,
    );
    const row = screen.getByRole("group", { name: "Maps" });
    expect(ref.current).toBe(row);
    expect(row).toHaveAttribute("data-testid", "maps");
    expect(row.className.endsWith(" py-2")).toBe(true);
  });

  it("has no axe violations with controls inside", async () => {
    const { container } = render(
      <div>
        <FilterRow label="Mode">
          <ChipGroup
            label="Mode"
            hideLabel
            options={[
              { value: "osu", label: "osu!" },
              { value: "taiko", label: "taiko" },
            ]}
            value={["osu"]}
            onChange={() => {}}
          />
        </FilterRow>
        <FilterRow label="Star rating">
          <RangeSlider
            label="Star rating"
            hideLabel
            min={0}
            max={10}
            step={0.1}
            openEnded
            value={[0, null]}
            onChange={() => {}}
          />
        </FilterRow>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
