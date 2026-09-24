/**
 * @file tests/components/filters/ChipGroup.test.tsx
 * @desc Component tests for ChipGroup: group labeling, pressed state from value, multi-select in
 *       option order, keyboard use, disabled chips, native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChipGroup, type ChipOption } from "../../../src/components/filters/ChipGroup.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const MODS: ChipOption[] = [
  { value: "NM", label: "NM" },
  { value: "HD", label: "HD" },
  { value: "HR", label: "HR" },
  { value: "DT", label: "DT" },
];

function Mods({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (value: string[]) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ChipGroup
      label="Mods"
      options={MODS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("ChipGroup", () => {
  it("is a group named by its visible label", () => {
    render(<ChipGroup label="Mods" options={MODS} value={[]} onChange={() => {}} />);
    const group = screen.getByRole("group", { name: "Mods" });
    expect(group.tagName).toBe("FIELDSET");
    expect(within(group).getAllByRole("button")).toHaveLength(4);
    expect(screen.getByText("Mods")).toHaveClass("font-bold", "text-c3", "text-sm");
  });

  it("keeps the label for screen readers only with hideLabel", () => {
    render(<ChipGroup label="Mode" hideLabel options={MODS} value={[]} onChange={() => {}} />);
    expect(screen.getByRole("group", { name: "Mode" })).toBeInTheDocument();
    expect(screen.getByText("Mode")).toHaveClass("sr-only");
  });

  it("presses the chips whose values are picked", () => {
    render(<ChipGroup label="Mods" options={MODS} value={["HR", "HD"]} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "HD" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "HR" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "NM" })).toHaveAttribute("aria-pressed", "false");
  });

  it("adds values in option order, whatever order they were clicked in", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Mods onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "DT" }));
    await user.click(screen.getByRole("button", { name: "HD" }));
    await user.click(screen.getByRole("button", { name: "NM" }));
    expect(onChange.mock.calls).toEqual([[["DT"]], [["HD", "DT"]], [["NM", "HD", "DT"]]]);
  });

  it("removes a value when its chip is clicked again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Mods initial={["HD", "HR"]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "HD" }));
    expect(onChange).toHaveBeenLastCalledWith(["HR"]);
    expect(screen.getByRole("button", { name: "HD" })).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps values that aren't options at the end and drops duplicates", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChipGroup label="Mods" options={MODS} value={["XX", "DT", "DT"]} onChange={onChange} />,
    );
    await user.click(screen.getByRole("button", { name: "HD" }));
    expect(onChange).toHaveBeenLastCalledWith(["HD", "DT", "XX"]);
  });

  it("can be used from the keyboard: Tab between chips, Space and Enter toggle", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Mods onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "NM" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "HD" })).toHaveFocus();
    await user.keyboard(" ");
    await user.tab();
    expect(screen.getByRole("button", { name: "HR" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab({ shift: true });
    await user.keyboard("{Enter}");

    expect(onChange.mock.calls).toEqual([[["HD"]], [["HD", "HR"]], [["HR"]]]);
    expect(screen.getByRole("button", { name: "HR", pressed: true })).toBeInTheDocument();
  });

  it("disables one chip from its option, and all chips from the group's disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const options: ChipOption[] = [
      { value: "osu", label: "osu!" },
      { value: "mania", label: "mania", disabled: true },
    ];
    const { rerender } = render(
      <ChipGroup label="Mode" options={options} value={[]} onChange={onChange} />,
    );
    expect(screen.getByRole("button", { name: "mania" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "osu!" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "mania" }));
    expect(onChange).not.toHaveBeenCalled();

    rerender(<ChipGroup label="Mode" options={options} value={[]} onChange={onChange} disabled />);
    expect(screen.getByRole("group", { name: "Mode" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "osu!" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "osu!" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("appends a caller className and passes native props and a ref through", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <ChipGroup
        ref={ref}
        label="Mods"
        options={MODS}
        value={[]}
        onChange={() => {}}
        className="mt-2"
        data-testid="mods"
      />,
    );
    const group = screen.getByRole("group", { name: "Mods" });
    expect(ref.current).toBe(group);
    expect(group).toHaveAttribute("data-testid", "mods");
    expect(group.className.endsWith(" mt-2")).toBe(true);
  });

  it("has no axe violations with chips picked, hidden label and disabled chips", async () => {
    const { container } = render(
      <div>
        <ChipGroup label="Mods" options={MODS} value={["HD"]} onChange={() => {}} />
        <ChipGroup
          label="Mode"
          hideLabel
          options={[
            { value: "osu", label: "osu!" },
            { value: "taiko", label: "taiko", disabled: true },
          ]}
          value={[]}
          onChange={() => {}}
        />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
