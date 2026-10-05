/**
 * @file tests/components/content/ContentIndex.test.tsx
 * @desc Component tests for ContentIndex: one link per item with its title, badge and
 *       description, no search field, axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentIndex } from "../../../src/components/content/ContentIndex.js";
import type { ContentSearchItem } from "../../../src/components/content/types.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const ITEMS: ContentSearchItem[] = [
  { href: "/legal/terms", title: "Terms", description: "The rules of the road." },
  { href: "/legal/privacy", title: "Privacy", badge: "new", description: "What we collect." },
];

describe("ContentIndex", () => {
  it("renders one link per item with its description", () => {
    render(<ContentIndex items={ITEMS} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Terms/ })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByText("The rules of the road.")).toBeInTheDocument();
    expect(screen.getByText("What we collect.")).toBeInTheDocument();
  });

  it("shows a badge beside the title when given", () => {
    render(<ContentIndex items={ITEMS} />);
    expect(screen.getByText("new")).toHaveClass("font-mono");
  });

  it("renders no search field or live region", () => {
    render(<ContentIndex items={ITEMS} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContentIndex items={ITEMS} />);
    await expectNoAxeViolations(container);
  });

  it("lays its tiles out on CardGrid with the shared 10px surface", () => {
    render(<ContentIndex items={ITEMS} />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("gap-2.5", "sm:grid-cols-2");
    const tile = screen.getByRole("link", { name: /Terms/ });
    expect(tile).toHaveClass("rounded-[10px]", "bg-b4", "p-3", "hover:bg-b3");
    expect(tile.className.split(" ")).not.toContain("rounded-md");
    expect(tile.parentElement).toHaveClass("flex");
  });
});
