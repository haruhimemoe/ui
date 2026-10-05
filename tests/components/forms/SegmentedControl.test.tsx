/**
 * @file tests/components/forms/SegmentedControl.test.tsx
 * @desc Component tests for SegmentedControl: legend naming and hideLabel, Tab landing on the
 *       checked radio and arrow-key picking, skipping disabled options, size and checked styling,
 *       a stale value checking nothing while Tab still reaches the first enabled radio,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  SegmentedControl,
  type SegmentedOption,
} from "../../../src/components/forms/SegmentedControl.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

type Mode = "fit" | "actual" | "huge";
const OPTIONS: SegmentedOption<Mode>[] = [
  { value: "fit", label: "Fit (64%)" },
  { value: "actual", label: "Actual size" },
];

function Controlled({
  initial,
  options = OPTIONS,
  onPick,
}: {
  initial: Mode;
  options?: SegmentedOption<Mode>[];
  onPick?: (v: Mode) => void;
}) {
  const [mode, setMode] = useState<Mode>(initial);
  return (
    <>
      <button type="button">Before</button>
      <SegmentedControl
        label="Preview size"
        hideLabel
        size="sm"
        options={options}
        value={mode}
        onChange={(next) => {
          onPick?.(next);
          setMode(next);
        }}
      />
    </>
  );
}

describe("SegmentedControl", () => {
  it("names the group by its legend, sr-only with hideLabel", () => {
    render(<Controlled initial="fit" />);
    const group = screen.getByRole("group", { name: "Preview size" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getByText("Preview size")).toHaveClass("sr-only");
    expect(screen.getByRole("radio", { name: "Fit (64%)" })).toBeChecked();
  });

  it("lands Tab on the checked radio and picks with the arrow keys", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Controlled initial="actual" onPick={onPick} />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole("radio", { name: "Actual size" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(onPick).toHaveBeenLastCalledWith("fit");
    expect(screen.getByRole("radio", { name: "Fit (64%)" })).toBeChecked();
  });

  it("skips a disabled option", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(
      <Controlled
        initial="fit"
        onPick={onPick}
        options={[
          OPTIONS[0] as SegmentedOption<Mode>,
          { value: "actual", label: "Actual size", disabled: true },
          { value: "huge", label: "Huge" },
        ]}
      />,
    );
    await user.tab();
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onPick).toHaveBeenLastCalledWith("huge");
  });

  it("styles the checked option and both sizes, 44px on touch", () => {
    const { rerender } = render(
      <SegmentedControl
        label="View"
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value="a"
        onChange={() => {}}
      />,
    );
    const a = screen.getByText("A").closest("label");
    expect(a).toHaveClass(
      "bg-h2",
      "text-c1",
      "forced-colors:underline",
      "h-8",
      "text-sm",
      "coarse:min-h-11",
    );
    expect(screen.getByText("B").closest("label")).toHaveClass("text-c3");
    rerender(
      <SegmentedControl
        label="View"
        size="sm"
        options={[{ value: "a", label: "A" }]}
        value="a"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("A").closest("label")).toHaveClass("min-h-6", "text-xs");
  });

  // Review Focus 5.
  it("checks nothing for a stale value and still takes Tab on the first enabled radio", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <SegmentedControl
          label="View"
          options={[
            { value: "a", label: "A", disabled: true },
            { value: "b", label: "B" },
          ]}
          value="gone"
          onChange={() => {}}
        />
      </>,
    );
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("radio", { name: "B" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Controlled initial="fit" />);
    await expectNoAxeViolations(container);
  });
});
