/**
 * @file tests/components/content/Toc.test.tsx
 * @desc Toc: nesting (a 2 to 4 jump nests once, a leading h3 sits at the top), maxDepth, nothing
 *       under two items, two renderings (xl column, phone disclosure "On this page"), repeated
 *       ids without key warnings, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toc } from "../../../src/components/content/Toc.js";
import { tocTree } from "../../../src/components/content/tocTree.js";
import type { TocItem } from "../../../src/remark/articleData.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const ITEMS: TocItem[] = [
  { id: "seeding", text: "Seeding", depth: 2 },
  { id: "rolls", text: "Rolls", depth: 4 },
  { id: "ties", text: "Ties", depth: 3 },
  { id: "brackets", text: "Brackets", depth: 2 },
];

describe("tocTree", () => {
  it("nests a 2 to 4 jump once and keeps siblings", () => {
    const tree = tocTree(ITEMS, 4);
    expect(tree.map((n) => n.item.id)).toEqual(["seeding", "brackets"]);
    expect(tree[0]?.children.map((n) => n.item.id)).toEqual(["rolls", "ties"]);
    expect(tree[0]?.children[0]?.children).toEqual([]);
  });

  it("puts a leading h3 or h4 at the top level", () => {
    const tree = tocTree(
      [
        { id: "a", text: "A", depth: 4 },
        { id: "b", text: "B", depth: 3 },
        { id: "c", text: "C", depth: 2 },
      ],
      4,
    );
    expect(tree.map((n) => n.item.id)).toEqual(["a", "b", "c"]);
  });
});

describe("Toc", () => {
  it("renders the xl nav and the phone disclosure, both labelled On this page", async () => {
    const { container } = render(<Toc items={ITEMS} />);
    const navs = screen.getAllByRole("navigation", { name: "On this page" });
    expect(navs).toHaveLength(2);
    expect(navs[0]).toHaveClass("hidden", "xl:block");
    const details = container.querySelector("details");
    expect(details).toHaveClass("xl:hidden");
    expect(details?.querySelector("summary")?.textContent).toBe("On this page");
    expect(within(navs[0] as HTMLElement).getByRole("link", { name: "Seeding" })).toHaveAttribute(
      "href",
      "#seeding",
    );
    expect(within(navs[0] as HTMLElement).queryByRole("link", { name: "Rolls" })).toBeNull(); // maxDepth 3
    expect(within(navs[0] as HTMLElement).getByRole("link", { name: "Ties" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows h4 with maxDepth 4 and takes a label", () => {
    render(<Toc items={ITEMS} maxDepth={4} label="In this guide" />);
    expect(screen.getAllByRole("link", { name: "Rolls" })).toHaveLength(2);
    expect(screen.getAllByRole("navigation", { name: "In this guide" })).toHaveLength(2);
  });

  it("renders nothing with fewer than two items after maxDepth", () => {
    const { container } = render(<Toc items={[ITEMS[0] as TocItem, ITEMS[1] as TocItem]} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders no empty nested list and warns about no keys for repeated ids", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <Toc items={[...ITEMS, { id: "seeding", text: "Seeding", depth: 2 }]} />,
    );
    expect(container.querySelectorAll("ol:empty")).toHaveLength(0);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
