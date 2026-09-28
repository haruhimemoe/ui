/**
 * @file tests/components/forms/RadioGroup.test.tsx
 * @desc Component tests for RadioGroup: the legend, option names and hints, arrow keys, controlled
 *       and uncontrolled use, the group's hint and error, required and disabled, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "../../../src/components/forms/RadioGroup.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const OPTIONS = [
  { value: "private", label: "Private", hint: "Only you and your editors." },
  { value: "unlisted", label: "Unlisted", hint: "Anyone with the link." },
  { value: "public", label: "Public" },
];

describe("RadioGroup", () => {
  it("is a group named by its legend; each radio is named by its label and described by its hint", () => {
    render(<RadioGroup label="Who can see this pool" options={OPTIONS} defaultValue="private" />);
    expect(screen.getByRole("group", { name: "Who can see this pool" })).toBeInTheDocument();
    const priv = screen.getByRole("radio", { name: "Private" });
    expect(priv).toBeChecked();
    expect(priv).toHaveAccessibleDescription("Only you and your editors.");
    expect(priv).toHaveClass("accent-h1");
    expect(screen.getByText("Who can see this pool")).toHaveClass("font-bold", "text-c3");
  });

  it("moves and picks with the arrow keys and reports the value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup label="Vis" options={OPTIONS} defaultValue="private" onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Private" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Unlisted" })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith("unlisted");
  });

  it("follows value when controlled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup label="Vis" name="vis" options={OPTIONS} value="public" onChange={onChange} />,
    );
    await user.click(screen.getByRole("radio", { name: "Private" }));
    expect(onChange).toHaveBeenCalledWith("private");
    expect(screen.getByRole("radio", { name: "Public" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Public" })).toHaveAttribute("name", "vis");
  });

  it("describes the group with its hint and error, and marks the radios invalid", () => {
    render(
      <RadioGroup
        label="Vis"
        options={OPTIONS}
        hint="You can change it later."
        error="Pick one."
        required
      />,
    );
    const group = screen.getByRole("group", { name: "Vis" });
    expect(group).toHaveAccessibleDescription("You can change it later. Pick one.");
    expect(screen.getByRole("alert")).toHaveTextContent("Pick one.");
    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeRequired();
      expect(radio).toHaveAttribute("aria-invalid", "true");
    }
  });

  it("turns every radio off with disabled, and has no axe violations", async () => {
    const { container, rerender } = render(
      <RadioGroup label="Vis" options={OPTIONS} error="Pick one." />,
    );
    await expectNoAxeViolations(container);
    rerender(<RadioGroup label="Vis" options={OPTIONS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });
});
