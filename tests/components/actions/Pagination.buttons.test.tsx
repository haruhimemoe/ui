/**
 * @file tests/components/actions/Pagination.buttons.test.tsx
 * @desc Pagination in button mode: onPageChange from the keyboard, ends that stay focusable but
 *       ignore presses, an unknown page count with hasNext, a live status, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../../../src/components/actions/Pagination.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Pagination buttons", () => {
  it("calls onPageChange from the keyboard and keeps the ends in place, aria-disabled", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);
    const previous = screen.getByRole("button", { name: "Previous" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    expect(previous).toHaveClass("bg-b3", "aria-disabled:opacity-50");
    await user.tab();
    expect(previous).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPageChange).not.toHaveBeenCalled();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("announces the status politely, since the page changes in place", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);
    const status = screen.getByText("Page 2 of 3");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-current", "page");
  });

  it("shows Page N with an unknown count, and Next only while hasNext", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender, container } = render(
      <Pagination page={4} pageCount={null} hasNext onPageChange={onPageChange} />,
    );
    expect(screen.getByText("Page 4")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
    rerender(<Pagination page={4} pageCount={null} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    rerender(<Pagination page={1} pageCount={null} onPageChange={onPageChange} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("takes a custom status for an unknown count and has no axe violations", async () => {
    const { container } = render(
      <Pagination
        page={2}
        pageCount={null}
        hasNext
        onPageChange={() => {}}
        formatStatus={(page, count) => `p${page}/${count ?? "?"}`}
      />,
    );
    expect(screen.getByText("p2/?")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
