/**
 * @file tests/components/palette/CommandPalette.keyboard.test.tsx
 * @desc Inside the palette: every command listed by group with an empty query, typing filters
 *       and marks matches, arrows wrap, Home and End jump, hover activates, Enter and click run
 *       the command with the context and close (unless closeOnRun is false), a rejecting run is
 *       logged and the palette stays usable, Tab stays put, and the live region counts.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  activeOption,
  dialog,
  input,
  options,
  pressHotkey,
  renderPalette,
  spies,
} from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

beforeEach(() => vi.clearAllMocks());

describe("CommandPalette keyboard", () => {
  it("lists everything under its group, filters as you type, and marks the match", async () => {
    const { user } = renderPalette();
    await pressHotkey(user);
    expect(options().map((o) => o.textContent)).toEqual([
      "Go homeGH",
      "Copy page URLCtrlShiftC",
      "Toggle thing",
      "Chord targetGP",
    ]);
    expect(screen.getByRole("group", { name: "Navigate" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Page" })).toBeInTheDocument();
    expect(screen.getByText("Navigate")).not.toHaveClass("uppercase");
    expect(screen.getByText("4 results")).toBeInTheDocument();
    await user.keyboard("link");
    expect(options()).toHaveLength(1);
    expect(options()[0]).toHaveTextContent("Copy page URL");
    expect(options()[0]?.querySelector("mark")).toBeNull();
    await user.clear(input());
    await user.keyboard("cpu");
    expect([...(options()[0]?.querySelectorAll("mark") ?? [])].map((m) => m.textContent)).toEqual([
      "C",
      "p",
      "U",
    ]);
    await user.clear(input());
    await user.keyboard("zzz");
    // The hint is a disabled option: the listbox may only own options and groups.
    const hint = screen.getByRole("option", { name: "No matching commands" });
    expect(hint).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByText("0 results")).toBeInTheDocument();
    expect(input()).not.toHaveAttribute("aria-activedescendant");
  });

  it("moves with arrows (wrapping), Home and End, and hover", async () => {
    const { user } = renderPalette();
    await pressHotkey(user);
    expect(activeOption()).toHaveTextContent("Go home");
    expect(activeOption()).toHaveAttribute("aria-selected", "true");
    // State is shown by an edge, not background alone (bg-b4 on b6 is 1.5:1).
    expect(activeOption()).toHaveClass("border-h1");
    expect(options()[1]).not.toHaveClass("border-h1");
    await user.keyboard("{ArrowUp}");
    expect(activeOption()).toHaveTextContent("Chord target");
    await user.keyboard("{ArrowDown}");
    expect(activeOption()).toHaveTextContent("Go home");
    await user.keyboard("{End}");
    expect(activeOption()).toHaveTextContent("Chord target");
    await user.keyboard("{Home}");
    expect(activeOption()).toHaveTextContent("Go home");
    await user.hover(options()[2] as HTMLElement);
    expect(activeOption()).toHaveTextContent("Toggle thing");
    await user.keyboard("{Tab}");
    expect(input()).toHaveFocus();
  });

  it("Enter runs the active command with the context and closes; click runs too", async () => {
    const { user } = renderPalette();
    await pressHotkey(user);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(spies.copy).toHaveBeenCalledOnce();
    const ctx = spies.copy.mock.calls[0]?.[0];
    expect(ctx.pathname).toBe("/here");
    ctx.navigate("/there");
    expect(push).toHaveBeenCalledWith("/there");
    expect(dialog()).not.toHaveAttribute("open");
    await pressHotkey(user);
    await user.click(screen.getByRole("option", { name: /Go home/ }));
    expect(spies.home).toHaveBeenCalledOnce();
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("keeps the palette open for closeOnRun false, and survives a rejecting run", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { user } = renderPalette({
      commands: [
        { id: "t", title: "Toggle", closeOnRun: false, run: spies.toggle },
        {
          id: "bad",
          title: "Bad",
          run: async () => {
            throw new Error("nope");
          },
        },
        {
          id: "worse",
          title: "Worse",
          closeOnRun: false,
          run: () => {
            throw new Error("sync");
          },
        },
      ],
    });
    await pressHotkey(user);
    await user.keyboard("{Enter}");
    expect(spies.toggle).toHaveBeenCalledOnce();
    expect(dialog()).toHaveAttribute("open");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(error).toHaveBeenCalledOnce();
    expect(dialog()).toHaveAttribute("open");
    await user.keyboard("{ArrowUp}{Enter}");
    await waitFor(() => expect(error).toHaveBeenCalledTimes(2));
    expect(dialog()).not.toHaveAttribute("open");
  });
});
