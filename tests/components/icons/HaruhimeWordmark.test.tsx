/**
 * @file tests/components/icons/HaruhimeWordmark.test.tsx
 * @desc Component tests for HaruhimeWordmark and HaruhimeWordmarkLink: accessible name, custom
 *       title, decorative mode, sizing, the brand paths and colors, the link, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { HaruhimeWordmark } from "../../../src/components/icons/HaruhimeWordmark.js";
import { HaruhimeWordmarkLink } from "../../../src/components/icons/HaruhimeWordmarkLink.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("HaruhimeWordmark", () => {
  it("is an image named haruhime.moe by its <title>", () => {
    const { container } = render(<HaruhimeWordmark />);
    const img = screen.getByRole("img", { name: "haruhime.moe" });
    expect(container.querySelector("svg > title")).toHaveTextContent("haruhime.moe");
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("takes a custom title", () => {
    render(<HaruhimeWordmark title="haruhime.moe home" />);
    expect(screen.getByRole("img", { name: "haruhime.moe home" })).toBeInTheDocument();
  });

  it("drops the role and title and hides itself when decorative", () => {
    const { container } = render(<HaruhimeWordmark decorative />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
    expect(svg?.querySelector("title")).toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("keeps the brand asset's viewBox, three paths and colors", () => {
    const { container } = render(<HaruhimeWordmark />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "18 228 4447 1179");
    const fills = [...(svg?.querySelectorAll("path") ?? [])].map((p) => p.getAttribute("fill"));
    expect(fills).toEqual(["#ffffff", "#ff66ab", "#ffffff"]);
  });

  it("is h-6 w-auto by default, and a className replaces the size", () => {
    const { rerender } = render(<HaruhimeWordmark />);
    expect(screen.getByRole("img")).toHaveClass("h-6", "w-auto");
    rerender(<HaruhimeWordmark className="h-8 w-auto" />);
    expect(screen.getByRole("img")).toHaveClass("h-8", "w-auto");
    expect(screen.getByRole("img")).not.toHaveClass("h-6");
  });

  it("passes native svg props and a ref through", () => {
    const ref = createRef<SVGSVGElement>();
    render(<HaruhimeWordmark ref={ref} data-testid="mark" />);
    expect(ref.current).toBe(screen.getByRole("img"));
    expect(ref.current).toHaveAttribute("data-testid", "mark");
  });

  it("has no axe violations, labelled or decorative", async () => {
    const { container } = render(
      <div>
        <HaruhimeWordmark />
        <HaruhimeWordmark decorative />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("HaruhimeWordmarkLink", () => {
  it("links to haruhime.moe with an accessible name and a decorative wordmark", () => {
    const { container } = render(<HaruhimeWordmarkLink />);
    const link = screen.getByRole("link", { name: "haruhime.moe" });
    expect(link).toHaveAttribute("href", "https://www.haruhime.moe");
    expect(container.querySelector("a > svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("dims until hovered like the packs footer, with className last", () => {
    render(<HaruhimeWordmarkLink className="shrink-0" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("opacity-80", "transition-opacity", "hover:opacity-100");
    expect(link.className.endsWith(" shrink-0")).toBe(true);
  });

  it("takes an href, an aria-label, native props and wordmark classes", () => {
    const ref = createRef<HTMLAnchorElement>();
    const { container } = render(
      <HaruhimeWordmarkLink
        ref={ref}
        href="/"
        aria-label="haruhime.moe home"
        rel="home"
        wordmarkClassName="h-8 w-auto"
      />,
    );
    const link = screen.getByRole("link", { name: "haruhime.moe home" });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute("href", "/");
    expect(link).toHaveAttribute("rel", "home");
    expect(container.querySelector("svg")).toHaveClass("h-8");
  });

  it("is reachable with the keyboard", async () => {
    const user = userEvent.setup();
    render(<HaruhimeWordmarkLink />);
    await user.tab();
    expect(screen.getByRole("link", { name: "haruhime.moe" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<HaruhimeWordmarkLink />);
    await expectNoAxeViolations(container);
  });
});
