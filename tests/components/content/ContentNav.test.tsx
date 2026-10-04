/**
 * @file tests/components/content/ContentNav.test.tsx
 * @desc Component tests for ContentNav: aria-current on the live page, navTitle over title with
 *       the full title on the title attribute, a long title's line-clamp without navTitle, group
 *       headings, an empty-heading group, both the desktop nav and the phone disclosure, axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentNav } from "../../../src/components/content/ContentNav.js";
import type { ContentNavGroup } from "../../../src/components/content/types.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const router = vi.hoisted(() => ({ pathname: "/docs" as string | null }));
const usePathname = vi.hoisted(() => vi.fn(() => router.pathname));
vi.mock("next/navigation.js", () => ({ usePathname }));

const LONG_TITLE =
  "Setting up a beatmap pool from scratch with hosts, voters and a tiebreaker, start to finish";

const GROUPS: ContentNavGroup[] = [
  {
    heading: "Guides",
    items: [
      { href: "/docs/guides/start", title: "Getting started", navTitle: "Start" },
      { href: "/docs/guides/long", title: LONG_TITLE },
    ],
  },
  {
    items: [{ href: "/docs/tags/pools", title: "pools", badge: "12" }],
  },
];

describe("ContentNav", () => {
  beforeEach(() => {
    router.pathname = "/docs";
    usePathname.mockClear();
  });

  it("marks the current page with aria-current=page", () => {
    router.pathname = "/docs/guides/start";
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    const current = screen.getAllByRole("link", { name: "Start" })[0];
    expect(current).toHaveAttribute("aria-current", "page");
    const other = screen.getAllByRole("link", { name: "pools12" })[0];
    expect(other).not.toHaveAttribute("aria-current");
  });

  it("shows navTitle instead of title, with the full title on the title attribute", () => {
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    const link = screen.getAllByRole("link", { name: "Start" })[0] as HTMLElement;
    expect(link).toHaveAttribute("title", "Getting started");
    expect(screen.queryAllByText("Getting started")).toHaveLength(0);
  });

  it("wraps a long title with line-clamp-2 and keeps the full title on the title attribute", () => {
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    const link = screen.getAllByRole("link", { name: LONG_TITLE })[0] as HTMLElement;
    expect(link).toHaveAttribute("title", LONG_TITLE);
    const label = within(link).getByText(LONG_TITLE);
    expect(label).toHaveClass("line-clamp-2", "min-w-0", "break-words");
  });

  it("renders a badge beside its item's label", () => {
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    expect(screen.getAllByText("12")[0]).toHaveClass("font-mono");
  });

  it("renders group headings, and no heading for a group without one", () => {
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    expect(screen.getAllByText("Guides")[0]).toHaveClass("uppercase");
    expect(screen.queryByText("pools", { selector: "p" })).not.toBeInTheDocument();
  });

  it("renders the index link with the default label, and a custom one on request", () => {
    const { rerender } = render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    expect(screen.getAllByRole("link", { name: "Overview" })[0]).toHaveAttribute("href", "/docs");
    rerender(<ContentNav label="Docs" indexHref="/docs" indexLabel="Home" groups={GROUPS} />);
    expect(screen.getAllByRole("link", { name: "Home" })[0]).toHaveAttribute("href", "/docs");
  });

  it("renders both the desktop nav and the phone disclosure", () => {
    render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    expect(screen.getAllByRole("navigation", { name: "Docs" })).toHaveLength(2);
    expect(screen.getByRole("group")).toBeInTheDocument(); // <details>
    expect(screen.getByText("Contents")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ContentNav label="Docs" indexHref="/docs" groups={GROUPS} />);
    await expectNoAxeViolations(container);
  });
});
