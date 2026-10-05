/**
 * @file tests/components/basics/EmptyState.test.tsx
 * @desc Component tests for EmptyState: dashed default, filled/sm variant, title and action,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "../../../src/components/basics/EmptyState.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("EmptyState", () => {
  it("is a dashed, centered box by default, with no role", () => {
    const { container } = render(<EmptyState>No maps yet.</EmptyState>);
    const box = container.firstElementChild as HTMLElement;
    expect(box.tagName).toBe("DIV");
    expect(box).not.toHaveAttribute("role");
    expect(box).toHaveClass(
      "rounded-[10px]",
      "border-2",
      "border-dashed",
      "border-b2",
      "text-c3",
      "text-sm",
    );
    expect(box).toHaveClass("grid", "place-items-center", "gap-2", "p-6", "text-center");
  });

  it("fills and goes small", () => {
    const { container } = render(
      <EmptyState variant="filled" size="sm" className="min-h-48">
        Nothing
      </EmptyState>,
    );
    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveClass("bg-b4", "px-3", "py-2", "min-h-48");
    expect(box.className.split(" ")).not.toContain("border-dashed");
  });

  it("shows a title above the message and an action under it", () => {
    render(
      <EmptyState title="No packs" action={<a href="/new">Make one</a>}>
        Save a pack to see it here.
      </EmptyState>,
    );
    expect(screen.getByText("No packs")).toHaveClass("font-bold", "text-c1");
    expect(screen.getByRole("link", { name: "Make one" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<EmptyState title="Empty">Nothing yet.</EmptyState>);
    await expectNoAxeViolations(container);
  });
});
