/**
 * @file tests/components/icons/ChevronUpIcon.test.tsx
 * @desc Component tests for ChevronUpIcon: the mark, default and custom size, native props, and
 *       accessibility inside a labelled button.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ChevronUpIcon } from "../../../src/components/icons/ChevronUpIcon.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("ChevronUpIcon", () => {
  it("draws an upward chevron in the current text color, hidden from assistive tech", () => {
    const { container } = render(<ChevronUpIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.querySelectorAll("path")).toHaveLength(1);
  });

  it("is size-5 by default, and a className replaces the size", () => {
    const { container, rerender } = render(<ChevronUpIcon />);
    expect(container.querySelector("svg")).toHaveClass("size-5");
    rerender(<ChevronUpIcon className="size-4" />);
    expect(container.querySelector("svg")).toHaveClass("size-4");
    expect(container.querySelector("svg")).not.toHaveClass("size-5");
  });

  it("passes native svg props and a ref through", () => {
    const ref = createRef<SVGSVGElement>();
    render(<ChevronUpIcon ref={ref} data-testid="chevron-up" focusable="false" />);
    expect(ref.current).toBe(screen.getByTestId("chevron-up"));
    expect(ref.current).toHaveAttribute("focusable", "false");
  });

  it("has no axe violations inside a labelled button", async () => {
    const { container } = render(
      <button type="button" aria-label="Move item up">
        <ChevronUpIcon />
      </button>,
    );
    expect(screen.getByRole("button", { name: "Move item up" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
