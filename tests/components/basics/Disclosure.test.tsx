/**
 * @file tests/components/basics/Disclosure.test.tsx
 * @desc Component tests for Disclosure: aria-expanded and aria-controls, a hidden panel that stays
 *       in the page, keyboard toggling, controlled use, classes, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Disclosure } from "../../../src/components/basics/Disclosure.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Disclosure", () => {
  it("toggles its panel from the keyboard, with aria-expanded and aria-controls", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Disclosure summary="Download options">
        <label>
          <input type="checkbox" /> Include video
        </label>
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: "Download options" });
    const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).not.toBeVisible();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).toBeVisible();
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Include video" })).toHaveFocus();
    await expectNoAxeViolations(container);
    await user.click(button);
    expect(panel).not.toBeVisible();
    expect(panel).toContainElement(screen.getByRole("checkbox", { hidden: true }));
  });

  it("starts open with defaultOpen, and follows open when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Disclosure summary="More" defaultOpen>
        Body
      </Disclosure>,
    );
    expect(screen.getByText("Body")).toBeVisible();
    rerender(
      <Disclosure key="controlled" summary="More" open={false} onOpenChange={onOpenChange}>
        Body
      </Disclosure>,
    );
    await user.click(screen.getByRole("button", { name: "More" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByText("Body")).not.toBeVisible();
  });

  it("merges classes on the wrapper, button and panel", () => {
    render(
      <Disclosure
        summary="S"
        className="mt-2"
        buttonClassName="text-c1"
        panelClassName="pl-4"
        defaultOpen
      >
        P
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: "S" });
    expect(button).toHaveClass("text-c1", "min-h-6");
    expect(button).not.toHaveClass("text-c2");
    expect(button.parentElement).toHaveClass("mt-2", "flex-col");
    expect(screen.getByText("P")).toHaveClass("pl-4");
  });
});
