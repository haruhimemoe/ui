/**
 * @file tests/components/shell/LinkTabs.test.tsx
 * @desc Component tests for LinkTabs: a named nav of links, aria-current on the current one and
 *       its pill, off-site links, keyboard order, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LinkTabs } from "../../../src/components/shell/LinkTabs.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const ITEMS = [
  { href: "/search?tab=pools", label: "Pools", current: true },
  { href: "/search?tab=maps", label: "Maps" },
  { href: "https://osu.ppy.sh/beatmapsets", label: "osu! listing" },
];

describe("LinkTabs", () => {
  it("is a named nav whose current link is aria-current=page on a b3 pill", () => {
    render(<LinkTabs label="What to search" items={ITEMS} className="mt-2" />);
    const nav = screen.getByRole("navigation", { name: "What to search" });
    expect(nav).toHaveClass("mt-2");
    const pools = screen.getByRole("link", { name: "Pools" });
    expect(pools).toHaveAttribute("aria-current", "page");
    expect(pools).toHaveClass("bg-b3", "text-c1", "rounded-full");
    const maps = screen.getByRole("link", { name: "Maps" });
    expect(maps).not.toHaveAttribute("aria-current");
    expect(maps).toHaveClass("text-c3");
    expect(screen.getByRole("link", { name: "osu! listing" })).toHaveAttribute(
      "href",
      "https://osu.ppy.sh/beatmapsets",
    );
  });

  it("puts every tab in the tab order and has no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(<LinkTabs label="Tabs" items={ITEMS} />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Pools" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Maps" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });
});
