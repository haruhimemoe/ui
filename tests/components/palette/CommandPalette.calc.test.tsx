/**
 * @file tests/components/palette/CommandPalette.calc.test.tsx
 * @desc The calculator row: first, under Calculator, for an expression at the root; absent for a
 *       bare number, off root, or with calculator={false}; Enter copies the result and the live
 *       region says Copied (or Couldn't copy), keeping the palette open.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dialog, options, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

afterEach(() => vi.restoreAllMocks());

const clipboard = (writeText: (t: string) => Promise<void>) =>
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn(writeText) },
  });

describe("CommandPalette calculator", () => {
  it("shows the result first and copies it on Enter", async () => {
    // After renderPalette: userEvent.setup() installs its own clipboard stub.
    const { user } = renderPalette();
    clipboard(async () => {});
    await pressHotkey(user);
    await user.keyboard("2*21");
    expect(options()[0]).toHaveTextContent("= 42");
    expect(screen.getByRole("group", { name: "Calculator" })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("42");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(dialog()).toHaveAttribute("open");
  });

  it("reports a failed copy, and hides for bare numbers, off root and when disabled", async () => {
    const { user, unmount } = renderPalette({
      commands: [{ id: "p", title: "Page", page: { title: "P" } }],
    });
    clipboard(async () => {
      throw new Error("denied");
    });
    await pressHotkey(user);
    await user.keyboard("1+1{Enter}");
    expect(await screen.findByText("Couldn't copy")).toBeInTheDocument();
    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("2");
    expect(screen.queryByText(/^= /)).toBeNull();
    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");
    await user.keyboard("1+1");
    expect(screen.queryByText("= 2")).toBeNull();
    unmount();
    const off = renderPalette({ calculator: false });
    await pressHotkey(off.user);
    await off.user.keyboard("1+1");
    expect(screen.queryByText("= 2")).toBeNull();
  });
});
