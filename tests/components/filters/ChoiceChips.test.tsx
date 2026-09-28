/**
 * @file tests/components/filters/ChoiceChips.test.tsx
 * @desc Component tests for ChoiceChips: a named radio group drawn as chips, arrow keys that move
 *       and pick, Chip's on and off looks, disabled choices, hideLabel, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChoiceChips } from "../../../src/components/filters/ChoiceChips.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "ranked", label: "Ranked" },
  { value: "loved", label: "Loved", disabled: true },
  { value: "graveyard", label: "Graveyard" },
] as const;

type Status = (typeof OPTIONS)[number]["value"];

function Harness({ onChange }: { onChange?: (value: Status) => void }) {
  const [value, setValue] = useState<Status>("all");
  return (
    <ChoiceChips
      label="Status"
      options={OPTIONS}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("ChoiceChips", () => {
  it("is a group of radios named by its label, the checked one drawn on", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Status" })).toBeInTheDocument();
    const all = screen.getByRole("radio", { name: "All" });
    expect(all).toBeChecked();
    expect(all.parentElement).toHaveClass("bg-h1", "text-b6", "rounded-full");
    expect(screen.getByRole("radio", { name: "Ranked" }).parentElement).toHaveClass("bg-b3");
  });

  it("tabs to the checked chip and moves the pick with the arrow keys, skipping disabled ones", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "All" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Ranked" })).toBeChecked();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Graveyard" })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith("graveyard");
    expect(screen.getByRole("radio", { name: "Loved" })).toBeDisabled();
  });

  it("picks on click, uses the given name, and leaves naming to a FilterRow with hideLabel", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ChoiceChips
        label="Type"
        hideLabel
        name="type"
        options={OPTIONS}
        value="all"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText("Ranked"));
    expect(onChange).toHaveBeenCalledWith("ranked");
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("name", "type");
    expect(screen.queryByRole("group")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Harness />);
    await expectNoAxeViolations(container);
  });
});
