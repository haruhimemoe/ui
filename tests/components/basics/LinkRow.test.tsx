/**
 * @file tests/components/basics/LinkRow.test.tsx
 * @desc Component tests for LinkRow: plain vs named nav, current item marking, accent and quiet
 *       variants, target/rel passthrough, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkRow } from "../../../src/components/basics/LinkRow.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const ITEMS = [
  { href: "/changelog", label: "All" },
  { href: "/changelog/kind/packages", label: "Packages", current: true },
  { href: "https://github.com/haruhimemoe", label: "GitHub", target: "_blank" as const },
];

describe("LinkRow", () => {
  it("is a plain wrapping list without a label", () => {
    render(<LinkRow items={ITEMS} />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("list")).toHaveClass(
      "flex",
      "flex-wrap",
      "gap-x-4",
      "gap-y-1",
      "text-sm",
    );
  });

  it("sits in a named nav with a label", () => {
    render(<LinkRow items={ITEMS} label="Changelog filter" />);
    const nav = screen.getByRole("navigation", { name: "Changelog filter" });
    expect(within(nav).getAllByRole("link")).toHaveLength(3);
  });

  it("marks only the current item, by weight and underline, not color alone", () => {
    render(<LinkRow items={ITEMS} />);
    const current = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("aria-current") === "page");
    expect(current.map((a) => a.textContent)).toEqual(["Packages"]);
    expect(current[0]).toHaveClass(
      "font-bold",
      "text-c1",
      "underline",
      "decoration-2",
      "underline-offset-4",
    );
  });

  it("draws accent and quiet links, with taller rows on touch", () => {
    const { rerender } = render(<LinkRow items={ITEMS} />);
    const all = screen.getByRole("link", { name: "All" });
    expect(all).toHaveClass("text-h1", "font-bold", "coarse:py-2");
    rerender(<LinkRow items={ITEMS} variant="quiet" />);
    expect(screen.getByRole("link", { name: "All" })).toHaveClass(
      "font-normal",
      "text-c2",
      "hover:text-c1",
    );
  });

  it("passes target and gets rel=noreferrer off-site", () => {
    render(<LinkRow items={ITEMS} />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("rel", "noreferrer");
  });

  it("has no axe violations", async () => {
    const { container } = render(<LinkRow items={ITEMS} label="Filters" />);
    await expectNoAxeViolations(container);
  });
});
