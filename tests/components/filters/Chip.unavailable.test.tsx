/**
 * @file tests/components/filters/Chip.unavailable.test.tsx
 * @desc Chip and ChipGroup with an unavailable reason: blocked but focusable (aria-disabled), the
 *       reason as description and title, no toggle from click or keyboard, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../../../src/components/filters/Chip.js";
import { ChipGroup } from "../../../src/components/filters/ChipGroup.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Chip unavailable", () => {
  it("stays in the tab order, described by its reason, and never toggles", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const onClick = vi.fn();
    render(
      <>
        <p id="extra">Mods for NM1.</p>
        <Chip
          pressed={false}
          onPressedChange={onPressedChange}
          onClick={onClick}
          unavailableReason="EZ can't go with HR."
          aria-describedby="extra"
        >
          EZ
        </Chip>
      </>,
    );
    const chip = screen.getByRole("button", { name: "EZ" });
    expect(chip).toHaveAttribute("aria-disabled", "true");
    expect(chip).not.toBeDisabled();
    expect(chip).toHaveAccessibleDescription("EZ can't go with HR. Mods for NM1.");
    expect(chip).toHaveAttribute("title", "EZ can't go with HR.");
    expect(chip).toHaveClass("cursor-not-allowed", "opacity-40");
    expect(chip).not.toHaveClass("not-disabled:hover:bg-b2");
    await user.tab();
    expect(chip).toHaveFocus();
    await user.keyboard("{Enter} ");
    await user.click(chip);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("passes a reason through ChipGroup options and has no axe violations", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ChipGroup
        label="Mods"
        options={[
          { value: "HR", label: "HR" },
          { value: "EZ", label: "EZ", unavailableReason: <>Not with HR.</> },
        ]}
        value={["HR"]}
        onChange={onChange}
      />,
    );
    const ez = screen.getByRole("button", { name: "EZ" });
    expect(ez).toHaveAccessibleDescription("Not with HR.");
    expect(ez).not.toHaveAttribute("title");
    await expectNoAxeViolations(container);
  });
});
