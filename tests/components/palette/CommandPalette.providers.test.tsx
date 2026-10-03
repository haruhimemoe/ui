/**
 * @file tests/components/palette/CommandPalette.providers.test.tsx
 * @desc Providers in the dialog: the minLength hint, Searching…, rows under the provider's group
 *       after the static matches, the empty and error hints, root providers from the prop, and
 *       a page's providers stopping when the page is popped.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { act, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Command, Provider } from "../../../src/components/palette/types.js";
import { options, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => vi.useRealTimers());

const row = (id: string): Command => ({ id, title: id, run: () => {} });

describe("CommandPalette providers", () => {
  it("searches the root providers and lists rows after static matches", async () => {
    const search = vi.fn(async (q: string) => (q === "go" ? [row("go map")] : []));
    const provider: Provider = { id: "maps", group: "Maps", search, debounceMs: 50 };
    const { user } = renderPalette({ providers: [provider] });
    await pressHotkey(user);
    await user.keyboard("g");
    expect(screen.getByText("Type 2 characters to search")).toBeInTheDocument();
    await user.keyboard("o");
    expect(screen.getByText("Searching…")).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(options().map((o) => o.textContent)).toEqual(["Go homeGH", "go map"]);
    expect(screen.getByRole("group", { name: "Maps" })).toBeInTheDocument();
    await user.keyboard("x");
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText("No results for “gox”")).toBeInTheDocument();
    expect(screen.queryAllByRole("option").filter((o) => !o.getAttribute("aria-disabled"))).toEqual(
      [],
    );
  });

  it("shows the error hint when a search rejects, and searches a page's providers only there", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const failing: Provider = {
      id: "f",
      search: async () => {
        throw new Error("down");
      },
      debounceMs: 10,
    };
    const pageSearch = vi.fn(async () => [row("inner")]);
    const { user } = renderPalette({
      providers: [failing],
      commands: [
        {
          id: "p",
          title: "Open page",
          page: {
            title: "Inner",
            providers: [{ id: "i", search: pageSearch, debounceMs: 10, minLength: 1 }],
          },
        },
      ],
    });
    await pressHotkey(user);
    await user.keyboard("zz");
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByText("Couldn't search, try again")).toBeInTheDocument();
    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");
    await user.keyboard("a");
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(pageSearch).toHaveBeenCalledWith("a", expect.any(AbortSignal));
    expect(options()[0]).toHaveTextContent("inner");
    await user.keyboard("{Escape}");
    expect(pageSearch).toHaveBeenCalledOnce();
  });

  it("keeps the last rows while a new search runs, marks the list busy, and keys two providers apart", async () => {
    const warn = vi.spyOn(console, "error").mockImplementation(() => {});
    const a: Provider = { id: "a", group: "A", debounceMs: 50, search: async () => [row("a row")] };
    const b: Provider = { id: "b", group: "B", debounceMs: 50, search: async () => [row("b row")] };
    const { user } = renderPalette({ providers: [a, b] });
    await pressHotkey(user);
    await user.keyboard("g");
    // Two "Type 2 characters" hints, one per provider, with distinct keys: no React warning.
    expect(screen.getAllByText("Type 2 characters to search")).toHaveLength(2);
    expect(warn).not.toHaveBeenCalled();
    await user.keyboard("o");
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(options().map((o) => o.textContent)).toEqual(["Go homeGH", "a row", "b row"]);
    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-busy");
    await user.keyboard("x");
    // Searching again: the old rows stay under a Searching… hint and the list is busy.
    expect(screen.getAllByText("Searching…")).toHaveLength(2);
    expect(options().map((o) => o.textContent)).toEqual(["a row", "b row"]);
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-busy", "true");
    await act(async () => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByRole("listbox")).not.toHaveAttribute("aria-busy");
    expect(screen.queryByText("Searching…")).toBeNull();
  });
});
