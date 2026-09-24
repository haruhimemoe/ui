/**
 * @file tests/components/filters/FilterPanel.test.tsx
 * @desc Component tests for FilterPanel: region naming, heading level, the live result count, the
 *       clear button and where focus goes after it, the phone disclosure (aria-expanded, keyboard),
 *       native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChipGroup } from "../../../src/components/filters/ChipGroup.js";
import { FilterPanel } from "../../../src/components/filters/FilterPanel.js";
import { FilterRow } from "../../../src/components/filters/FilterRow.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const MODS = [
  { value: "HD", label: "HD" },
  { value: "HR", label: "HR" },
];

/** A panel with one chip row, wired the way an app would wire it. */
function Filters({ onClear }: { onClear?: () => void }) {
  const [mods, setMods] = useState<string[]>(["HD"]);
  const count = mods.length === 0 ? 120 : 12;
  return (
    <FilterPanel
      title="Filters"
      resultCount={`${count} packs`}
      active={mods.length > 0}
      onClear={() => {
        setMods([]);
        onClear?.();
      }}
      defaultOpen
    >
      <FilterRow label="Mods">
        <ChipGroup label="Mods" hideLabel options={MODS} value={mods} onChange={setMods} />
      </FilterRow>
    </FilterPanel>
  );
}

const toggle = () => screen.getByRole("button", { name: "Filters" });

describe("FilterPanel", () => {
  it("is a region named by its h2 title", () => {
    render(<FilterPanel title="Filters">rows</FilterPanel>);
    const panel = screen.getByRole("region", { name: "Filters" });
    expect(panel.tagName).toBe("SECTION");
    expect(panel).toHaveClass("rounded-[10px]", "bg-b4", "p-5", "text-c2");
    expect(screen.getByRole("heading", { level: 2, name: "Filters" })).toHaveClass(
      "font-bold",
      "text-c1",
      "text-lg",
    );
  });

  it("takes another heading level", () => {
    render(
      <FilterPanel title="Filter packs" headingLevel={3}>
        rows
      </FilterPanel>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Filter packs" })).toBeInTheDocument();
  });

  it("shows the result count in a polite live output that is always there", () => {
    const { rerender } = render(<FilterPanel title="Filters">rows</FilterPanel>);
    const output = screen.getByRole("status");
    expect(output.tagName).toBe("OUTPUT");
    expect(output).toHaveAttribute("aria-live", "polite");
    expect(output).toBeEmptyDOMElement();

    rerender(
      <FilterPanel title="Filters" resultCount="42 packs">
        rows
      </FilterPanel>,
    );
    expect(screen.getByRole("status")).toBe(output);
    expect(output).toHaveTextContent("42 packs");
  });

  it("shows the clear button only while active with an onClear", () => {
    const onClear = vi.fn();
    const { rerender } = render(
      <FilterPanel title="Filters" onClear={onClear}>
        rows
      </FilterPanel>,
    );
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    rerender(
      <FilterPanel title="Filters" active>
        rows
      </FilterPanel>,
    );
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

    rerender(
      <FilterPanel title="Filters" active onClear={onClear}>
        rows
      </FilterPanel>,
    );
    const clear = screen.getByRole("button", { name: "Clear filters" });
    expect(clear).toHaveAttribute("type", "button");
    expect(clear).toHaveClass("font-bold", "text-h1", "text-sm", "hover:text-c1");
  });

  it("calls onClear, and takes a custom label", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <FilterPanel title="Filters" active onClear={onClear} clearLabel="Reset">
        rows
      </FilterPanel>,
    );
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("moves focus to the heading when the clear button goes away under the keyboard", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(<Filters onClear={onClear} />);
    expect(screen.getByRole("status")).toHaveTextContent("12 packs");

    screen.getByRole("button", { name: "Clear filters" }).focus();
    await user.keyboard("{Enter}");

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Filters" })).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Filters" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("status")).toHaveTextContent("120 packs");
    expect(screen.getByRole("button", { name: "HD" })).toHaveAttribute("aria-pressed", "false");
  });

  it("leaves focus alone when the filters are cleared some other way", async () => {
    const user = userEvent.setup();
    render(<Filters />);
    const chip = screen.getByRole("button", { name: "HD" });
    await user.click(chip);
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
    expect(chip).toHaveFocus();
  });

  it("leaves focus alone when focus already moved on by the time the button goes", async () => {
    const user = userEvent.setup();
    function Later() {
      const [active, setActive] = useState(true);
      return (
        <FilterPanel title="Filters" active={active} onClear={() => {}} defaultOpen>
          <button type="button" onClick={() => setActive(false)}>
            Apply
          </button>
        </FilterPanel>
      );
    }
    render(<Later />);
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    const apply = screen.getByRole("button", { name: "Apply" });
    await user.click(apply);
    expect(apply).toHaveFocus();
  });

  it("folds the rows away on phones behind a button named by the title", async () => {
    const user = userEvent.setup();
    render(
      <FilterPanel title="Filters">
        <p>rows</p>
      </FilterPanel>,
    );
    const button = toggle();
    const body = screen.getByText("rows").parentElement as HTMLElement;
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", body.id);
    expect(button).toHaveClass("sm:hidden");
    expect(body).toHaveClass("hidden", "sm:flex");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(body).toHaveClass("flex");
    expect(body).not.toHaveClass("hidden");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(body).toHaveClass("hidden");
  });

  it("opens and closes the rows from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <FilterPanel title="Filters">
        <p>rows</p>
      </FilterPanel>,
    );
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("can start open on phones", () => {
    render(
      <FilterPanel title="Filters" defaultOpen>
        <p>rows</p>
      </FilterPanel>,
    );
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("rows").parentElement).not.toHaveClass("hidden");
  });

  it("puts the toggle, then clear, then the rows in the tab order", async () => {
    const user = userEvent.setup();
    render(<Filters />);
    await user.tab();
    expect(toggle()).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Clear filters" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "HD" })).toHaveFocus();
  });

  it("appends a caller className and passes native props and a ref through", () => {
    const ref = createRef<HTMLElement>();
    render(
      <FilterPanel ref={ref} title="Filters" className="mt-6" data-testid="filters">
        rows
      </FilterPanel>,
    );
    const panel = screen.getByRole("region", { name: "Filters" });
    expect(ref.current).toBe(panel);
    expect(panel).toHaveAttribute("data-testid", "filters");
    expect(panel.className.endsWith(" mt-6")).toBe(true);
  });

  it("has no axe violations closed, open, and active with a count", async () => {
    const { container } = render(
      <div>
        <FilterPanel title="Closed">
          <FilterRow label="Mods">
            <ChipGroup label="Mods" hideLabel options={MODS} value={[]} onChange={() => {}} />
          </FilterRow>
        </FilterPanel>
        <FilterPanel
          title="Open"
          defaultOpen
          active
          onClear={() => {}}
          resultCount="3 packs"
          headingLevel={3}
        >
          <FilterRow label="Mods">
            <ChipGroup label="Mods" hideLabel options={MODS} value={["HR"]} onChange={() => {}} />
          </FilterRow>
        </FilterPanel>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
