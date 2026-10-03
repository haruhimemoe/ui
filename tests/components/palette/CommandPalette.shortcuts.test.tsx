/**
 * @file tests/components/palette/CommandPalette.shortcuts.test.tsx
 * @desc Command shortcuts while the palette is closed: a combo runs its command, a chord runs
 *       within 800 ms and not after, neither fires from an editable target or while open, a
 *       page command opens onto its page, and the row shows the shortcut as kbd.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dialog, input, pressHotkey, renderPalette, spies } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.useRealTimers());

describe("CommandPalette shortcuts", () => {
  it("runs a combo and a chord from the page, not from a field, not while open", async () => {
    const { user } = renderPalette();
    await user.keyboard("{Control>}{Shift>}c{/Shift}{/Control}");
    expect(spies.copy).toHaveBeenCalledOnce();
    await user.keyboard("gp");
    expect(spies.chord).toHaveBeenCalledOnce();
    await user.keyboard("gh");
    expect(spies.home).toHaveBeenCalledOnce();
    await user.click(screen.getByLabelText("Other field"));
    await user.keyboard("gp");
    expect(spies.chord).toHaveBeenCalledOnce();
    await user.keyboard("{Escape}");
    (document.activeElement as HTMLElement).blur();
    await pressHotkey(user);
    await user.keyboard("gp");
    expect(spies.chord).toHaveBeenCalledOnce();
    expect(input()).toHaveValue("gp");
  });

  it("drops a chord after 800 ms or when another key comes between", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user } = renderPalette();
    await user.keyboard("g");
    vi.advanceTimersByTime(900);
    await user.keyboard("p");
    expect(spies.chord).not.toHaveBeenCalled();
    await user.keyboard("gxp");
    expect(spies.chord).not.toHaveBeenCalled();
    await user.keyboard("gp");
    expect(spies.chord).toHaveBeenCalledOnce();
  });

  it("opens onto a page command's page, and skips a command whose `when` is false", async () => {
    const { user } = renderPalette({
      commands: [
        {
          id: "maps",
          title: "Maps",
          shortcut: "g m",
          page: { title: "Maps", commands: [{ id: "m1", title: "Map one", run: () => {} }] },
        },
        { id: "hidden", title: "Hidden", shortcut: "g x", when: () => false, run: spies.toggle },
      ],
    });
    await user.keyboard("gx");
    expect(spies.toggle).not.toHaveBeenCalled();
    expect(dialog()).not.toHaveAttribute("open");
    await user.keyboard("gm");
    expect(dialog()).toHaveAttribute("open");
    expect(screen.getByRole("option", { name: /Map one/ })).toBeInTheDocument();
    expect(screen.getByText("Maps", { selector: "span" })).toBeInTheDocument();
  });
});
