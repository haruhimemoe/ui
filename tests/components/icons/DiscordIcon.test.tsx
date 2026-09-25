/**
 * @file tests/components/icons/DiscordIcon.test.tsx
 * @desc Component tests for DiscordIcon: the logo, default and custom size, native props, and
 *       accessibility inside a labelled link.
 * @author David @dvhsh (https://dvh.sh)
 * @created Fri Sep 25, 2026
 * @modified Fri Sep 25, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { DiscordIcon } from "../../../src/components/icons/DiscordIcon.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("DiscordIcon", () => {
  it("draws the 24x24 Discord logo in the current text color, hidden from assistive tech", () => {
    const { container } = render(<DiscordIcon />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "currentColor");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.querySelector("title")).toBeNull();
    expect(svg?.querySelectorAll("path")).toHaveLength(1);
    const d = svg?.querySelector("path")?.getAttribute("d");
    expect(d).toMatch(/^M20\.317 4\.3698a19\.7913 19\.7913 0 00-4\.8851-1\.5152/);
    expect(d).toMatch(/-\.946 2\.4189-2\.1568 2\.4189Z$/);
  });

  it("is size-5 by default, and a className replaces the size", () => {
    const { container, rerender } = render(<DiscordIcon />);
    expect(container.querySelector("svg")).toHaveClass("size-5");
    rerender(<DiscordIcon className="size-4" />);
    expect(container.querySelector("svg")).toHaveClass("size-4");
    expect(container.querySelector("svg")).not.toHaveClass("size-5");
  });

  it("passes native svg props and a ref through", () => {
    const ref = createRef<SVGSVGElement>();
    render(<DiscordIcon ref={ref} data-testid="discord" focusable="false" />);
    expect(ref.current).toBe(screen.getByTestId("discord"));
    expect(ref.current).toHaveAttribute("focusable", "false");
  });

  it("has no axe violations inside a labelled link", async () => {
    const { container } = render(
      <a href="https://discord.gg/example" aria-label="Discord">
        <DiscordIcon />
      </a>,
    );
    expect(screen.getByRole("link", { name: "Discord" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
