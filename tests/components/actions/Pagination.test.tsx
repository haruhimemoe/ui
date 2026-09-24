/**
 * @file tests/components/actions/Pagination.test.tsx
 * @desc Component tests for Pagination: single page, first / middle / last page links, labels,
 *       native nav props, className, keyboard order, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Pagination } from "../../../src/components/actions/Pagination.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const hrefFor = (page: number) => `/packs?page=${page}`;

describe("Pagination", () => {
  it("renders nothing for one page or none", () => {
    const { container, rerender } = render(<Pagination page={1} pageCount={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Pagination page={1} pageCount={0} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows only the next link on the first page", () => {
    render(<Pagination page={1} pageCount={3} hrefFor={hrefFor} />);
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    const next = screen.getByRole("link", { name: "Next" });
    expect(next).toHaveAttribute("href", "/packs?page=2");
    expect(next).toHaveAttribute("rel", "next");
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("shows both links in the middle", () => {
    render(<Pagination page={2} pageCount={3} hrefFor={hrefFor} />);
    const previous = screen.getByRole("link", { name: "Previous" });
    expect(previous).toHaveAttribute("href", "/packs?page=1");
    expect(previous).toHaveAttribute("rel", "prev");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/packs?page=3");
  });

  it("shows only the previous link on the last page", () => {
    render(<Pagination page={3} pageCount={3} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/packs?page=2");
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });

  it("marks the current page with aria-current", () => {
    render(<Pagination page={2} pageCount={5} hrefFor={hrefFor} />);
    const current = screen.getByText("Page 2 of 5");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("text-c4");
  });

  it("is a labelled nav that keeps the packs layout and appends className last", () => {
    render(<Pagination page={1} pageCount={2} hrefFor={hrefFor} className="mt-6" />);
    const nav = screen.getByRole("navigation", { name: "Pages" });
    expect(nav).toHaveClass("flex", "items-center", "justify-between", "gap-3", "text-sm");
    expect(nav.className.endsWith(" mt-6")).toBe(true);
  });

  it("styles the links as secondary pill buttons", () => {
    render(<Pagination page={2} pageCount={3} hrefFor={hrefFor} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveClass("rounded-full", "bg-b3", "h-9", "px-4");
    }
  });

  it("takes custom labels, a custom status and native nav props", () => {
    render(
      <Pagination
        page={2}
        pageCount={4}
        hrefFor={hrefFor}
        previousLabel="Newer"
        nextLabel="Older"
        formatStatus={(page, count) => `${page} / ${count}`}
        aria-label="Pack pages"
        data-testid="pager"
      />,
    );
    const nav = screen.getByRole("navigation", { name: "Pack pages" });
    expect(nav).toHaveAttribute("data-testid", "pager");
    expect(screen.getByRole("link", { name: "Newer" })).toHaveAttribute("href", "/packs?page=1");
    expect(screen.getByRole("link", { name: "Older" })).toHaveAttribute("href", "/packs?page=3");
    expect(screen.getByText("2 / 4")).toHaveAttribute("aria-current", "page");
  });

  it("tabs from the previous link to the next link", async () => {
    const user = userEvent.setup();
    render(<Pagination page={2} pageCount={3} hrefFor={hrefFor} />);
    await user.tab();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Next" })).toHaveFocus();
  });

  it("has no axe violations on the first, middle and last page", async () => {
    for (const page of [1, 2, 3]) {
      const { container, unmount } = render(
        <Pagination page={page} pageCount={3} hrefFor={hrefFor} />,
      );
      await expectNoAxeViolations(container);
      unmount();
    }
  });
});
