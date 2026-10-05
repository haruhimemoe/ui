/**
 * @file tests/components/basics/Progress.test.tsx
 * @desc Component tests for Progress: name and describedby output, hideLabel, indeterminate,
 *       value/max clamping for zero, overflow, negative and NaN input, palette classes,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "../../../src/components/basics/Progress.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Progress", () => {
  it("names the bar by its visible label and describes it by the status output", () => {
    render(<Progress label="Download progress" value={3} max={12} status="3 of 12 sets ready" />);
    const bar = screen.getByRole("progressbar", { name: "Download progress" });
    expect(bar).toHaveAttribute("value", "3");
    expect(bar).toHaveAttribute("max", "12");
    const output = screen.getByRole("status");
    expect(output.tagName).toBe("OUTPUT");
    expect(bar).toHaveAttribute("aria-describedby", output.id);
    expect(bar).toHaveAccessibleDescription("3 of 12 sets ready");
  });

  it("takes an aria-label when the label is hidden", () => {
    render(<Progress label="Loading" hideLabel value={0.5} />);
    expect(screen.getByRole("progressbar", { name: "Loading" })).toHaveAttribute(
      "aria-label",
      "Loading",
    );
    expect(screen.queryByText("Loading")).toBeNull();
  });

  it("is indeterminate with no value, and keeps an empty output mounted", () => {
    render(<Progress label="Loading" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("value");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  // Review Focus 2.
  it("keeps the bar valid for zero, overflowing, negative and NaN input", () => {
    const { rerender } = render(<Progress label="Sets" value={0} max={0} />);
    const bar = () => screen.getByRole("progressbar");
    expect(bar()).toHaveAttribute("max", "1");
    expect(bar()).toHaveAttribute("value", "0");
    rerender(<Progress label="Sets" value={15} max={12} />);
    expect(bar()).toHaveAttribute("value", "12");
    rerender(<Progress label="Sets" value={-2} max={12} />);
    expect(bar()).toHaveAttribute("value", "0");
    rerender(<Progress label="Sets" value={Number.NaN} max={12} />);
    expect(bar()).not.toHaveAttribute("value");
  });

  it("draws the bar from the palette and lets forced colors draw the native one", () => {
    render(<Progress label="Sets" value={1} />);
    expect(screen.getByRole("progressbar")).toHaveClass(
      "h-2",
      "w-full",
      "rounded-full",
      "bg-b3",
      "[&::-webkit-progress-value]:bg-h1",
      "[&::-moz-progress-bar]:bg-h1",
      "forced-colors:appearance-auto",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<Progress label="Sets" value={1} max={2} status="1 of 2" />);
    await expectNoAxeViolations(container);
  });
});
