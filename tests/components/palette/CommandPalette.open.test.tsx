/**
 * @file tests/components/palette/CommandPalette.open.test.tsx
 * @desc Opening and closing: the hotkey toggles (also from inside the palette and from a field),
 *       openCommandPalette opens (onto a page too), Escape and a backdrop click close at the
 *       root, focus goes back to the opener, the page's scroll is locked while open, and the
 *       open palette passes axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { openCommandPalette } from "../../../src/components/palette/paletteEvents.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { dialog, input, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

describe("CommandPalette opening", () => {
  it("is empty until the hotkey opens it, then toggles closed and returns focus", async () => {
    const { user } = renderPalette();
    expect(dialog()).not.toHaveAttribute("open");
    expect(screen.queryByRole("combobox")).toBeNull();
    const opener = screen.getByRole("button", { name: "Open me" });
    opener.focus();
    await pressHotkey(user);
    expect(dialog()).toHaveAttribute("open");
    expect(input()).toHaveFocus();
    // The input row carries the focus cue (the one focusable thing in the dialog).
    expect(input().parentElement?.parentElement).toHaveClass("has-[input:focus-visible]:border-h1");
    expect(document.documentElement.style.overflow).toBe("hidden");
    await pressHotkey(user);
    expect(dialog()).not.toHaveAttribute("open");
    expect(input).toThrow();
    expect(opener).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("opens from another field without typing into it, and from openCommandPalette", async () => {
    const { user } = renderPalette();
    const field = screen.getByLabelText("Other field");
    await user.click(field);
    await pressHotkey(user);
    expect(field).toHaveValue("");
    expect(input()).toHaveValue("");
    await user.keyboard("{Escape}");
    expect(dialog()).not.toHaveAttribute("open");
    act(() => openCommandPalette({ title: "Maps", placeholder: "Find a map" }));
    expect(input()).toHaveAttribute("placeholder", "Find a map");
    expect(screen.getByText("Maps")).toBeInTheDocument();
  });

  it("closes on a backdrop click but not on a click inside, and passes axe", async () => {
    const { user, container } = renderPalette({ label: "Jump to" });
    await pressHotkey(user);
    expect(dialog()).toHaveAttribute("aria-label", "Jump to");
    await expectNoAxeViolations(container);
    await user.click(input());
    expect(dialog()).toHaveAttribute("open");
    await user.click(dialog());
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("honors a custom hotkey", async () => {
    const { user } = renderPalette({ hotkey: "mod+j" });
    await pressHotkey(user);
    expect(dialog()).not.toHaveAttribute("open");
    await user.keyboard("{Control>}j{/Control}");
    expect(dialog()).toHaveAttribute("open");
  });

  it("resyncs when the browser closes the dialog itself (back gesture, close watcher)", async () => {
    const { user } = renderPalette();
    await pressHotkey(user);
    expect(document.documentElement.style.overflow).toBe("hidden");
    act(() => dialog().close());
    expect(document.documentElement.style.overflow).toBe("");
    expect(screen.queryByRole("combobox")).toBeNull();
    await pressHotkey(user);
    expect(dialog()).toHaveAttribute("open");
    expect(input()).toHaveFocus();
  });
});
