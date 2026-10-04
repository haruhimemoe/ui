/**
 * @file tests/components/content/ContentSearch.test.tsx
 * @desc Component tests for ContentSearch: typing narrows the list, the live-region count text
 *       updates (and is present before any typing), the custom count noun, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContentSearch } from "../../../src/components/content/ContentSearch.js";
import type { ContentSearchItem } from "../../../src/components/content/types.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const ITEMS: ContentSearchItem[] = [
  { href: "/docs/guides/start", title: "Getting started", description: "Install and run." },
  { href: "/docs/tags/bold", title: "Bold", badge: "[b]", description: "Heavier text." },
  { href: "/docs/tags/color", title: "Color", description: "Tint a run of text." },
];

describe("ContentSearch", () => {
  it("shows the live region count before any typing", () => {
    render(<ContentSearch items={ITEMS} label="Search the docs" />);
    const status = screen.getByText("3 pages.");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("narrows the list and updates the count as the user types", async () => {
    const user = userEvent.setup();
    render(<ContentSearch items={ITEMS} label="Search the docs" />);
    await user.type(screen.getByRole("searchbox", { name: "Search the docs" }), "bold");
    expect(screen.getByText("1 match.")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Bold/ })).toBeInTheDocument();
  });

  it("pluralizes matches, and reports zero matches for a query nothing fits", async () => {
    const user = userEvent.setup();
    render(<ContentSearch items={ITEMS} label="Search the docs" />);
    await user.type(screen.getByRole("searchbox", { name: "Search the docs" }), "e");
    expect(screen.getByText(/\d+ matches\./)).toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox", { name: "Search the docs" }));
    await user.type(screen.getByRole("searchbox", { name: "Search the docs" }), "nonexistent");
    expect(screen.getByText("0 matches.")).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("uses a custom singular/plural count noun for the unfiltered count", () => {
    render(
      <ContentSearch
        items={[ITEMS[0] as ContentSearchItem]}
        label="Search"
        countNoun={["entry", "entries"]}
      />,
    );
    expect(screen.getByText("1 entry.")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContentSearch items={ITEMS} label="Search the docs" />);
    await expectNoAxeViolations(container);
  });
});
