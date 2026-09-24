/**
 * @file tests/components/icons/GitHubIcon.test.tsx
 * @desc Component tests for GitHubIcon: the mark, default and custom size, native props, and
 *       accessibility inside a labelled link.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { GitHubIcon } from "../../../src/components/icons/GitHubIcon.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("GitHubIcon", () => {
  it("draws the 16x16 GitHub mark in the current text color, hidden from assistive tech", () => {
    const { container } = render(<GitHubIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.querySelectorAll("path")).toHaveLength(1);
    expect(svg?.querySelector("path")?.getAttribute("d")).toMatch(/^M8 0C3\.58 0 0 3\.58 0 8c/);
  });

  it("is size-5 by default, and a className replaces the size", () => {
    const { container, rerender } = render(<GitHubIcon />);
    expect(container.querySelector("svg")).toHaveClass("size-5");
    rerender(<GitHubIcon className="size-4" />);
    expect(container.querySelector("svg")).toHaveClass("size-4");
    expect(container.querySelector("svg")).not.toHaveClass("size-5");
  });

  it("passes native svg props and a ref through", () => {
    const ref = createRef<SVGSVGElement>();
    render(<GitHubIcon ref={ref} data-testid="gh" focusable="false" />);
    expect(ref.current).toBe(screen.getByTestId("gh"));
    expect(ref.current).toHaveAttribute("focusable", "false");
  });

  it("has no axe violations inside a labelled link", async () => {
    const { container } = render(
      <a href="https://github.com/haruhimemoe" aria-label="haruhimemoe on GitHub">
        <GitHubIcon />
      </a>,
    );
    expect(screen.getByRole("link", { name: "haruhimemoe on GitHub" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
