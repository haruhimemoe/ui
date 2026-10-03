/**
 * @file tests/components/shell/HeaderMenu.test.tsx
 * @desc Component tests for HeaderMenu: the disclosure button, keyboard through the links,
 *       Escape back to the button, closing on a link, a click outside or focus leaving, the
 *       panel's alignment, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HeaderMenu } from "../../../src/components/shell/HeaderMenu.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const Menu = ({ align }: { align?: "start" | "end" }) => (
  <div>
    <HeaderMenu
      label="peppy"
      align={align}
      items={[
        { href: "/new", label: "Make a pool" },
        { href: "/account", label: "Account" },
      ]}
    >
      <button type="button">Sign out</button>
    </HeaderMenu>
    <button type="button">Elsewhere</button>
  </div>
);

describe("HeaderMenu", () => {
  it("opens from the keyboard, tabs through its links, and Escape puts focus back", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu />);
    const button = screen.getByRole("button", { name: "peppy" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveClass("min-h-6");
    expect(screen.queryByRole("link", { name: "Account" })).toBeNull();
    await user.tab();
    await user.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(button.getAttribute("aria-controls") ?? "");
    expect(panel).toBeVisible();
    expect(panel).toHaveClass("right-0", "flex");
    await user.tab();
    expect(screen.getByRole("link", { name: "Make a pool" })).toHaveFocus();
    await expectNoAxeViolations(container);
    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes on a link, on a click outside, and when focus leaves it", async () => {
    const user = userEvent.setup();
    render(<Menu align="start" />);
    const button = screen.getByRole("button", { name: "peppy" });
    await user.click(button);
    expect(document.getElementById(button.getAttribute("aria-controls") ?? "")).toHaveClass(
      "left-0",
    );
    await user.click(screen.getByRole("link", { name: "Account" }));
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveFocus();
    expect(button).toHaveAttribute("aria-expanded", "true");
    await user.tab();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("takes a button label for image-only content", () => {
    render(<HeaderMenu label={<span aria-hidden="true">🙂</span>} buttonLabel="Account menu" />);
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
  });
});
