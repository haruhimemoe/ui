/**
 * @file tests/components/palette/CommandPaletteButton.test.tsx
 * @desc CommandPaletteButton: a ghost button that dispatches the palette event, with the hint
 *       "Ctrl K" (or "⌘K" on a Mac after mount), an accessible name, Button props passed through.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CommandPaletteButton } from "../../../src/components/palette/CommandPaletteButton.js";
import { PALETTE_EVENT } from "../../../src/components/palette/paletteEvents.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

afterEach(() => vi.unstubAllGlobals());

describe("CommandPaletteButton", () => {
  it("opens the palette and shows the platform hint", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener(PALETTE_EVENT, listener);
    const { container } = render(<CommandPaletteButton className="ml-2" />);
    const button = screen.getByRole("button", { name: "Open command palette" });
    expect(button).toHaveClass("ml-2");
    expect(button).toHaveTextContent("Ctrl K");
    await user.click(button);
    expect(listener).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
    window.removeEventListener(PALETTE_EVENT, listener);
  });

  it("says ⌘K on a Mac and takes a custom label", () => {
    vi.stubGlobal("navigator", { ...navigator, platform: "MacIntel", userAgentData: undefined });
    render(<CommandPaletteButton label="Search">Find</CommandPaletteButton>);
    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toHaveTextContent("Find");
    expect(button).toHaveTextContent("⌘K");
  });
});
