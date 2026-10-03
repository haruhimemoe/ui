/**
 * @file tests/components/palette/CommandPalette.recents.test.tsx
 * @desc Recents in the dialog: a run lands in the Recent group on the next open, newest first
 *       and capped at five, under the storage key; counts break ranking ties; the calculator
 *       isn't recorded; `recents={false}` records nothing.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readRecents } from "../../../src/components/palette/recents.js";
import type { Command } from "../../../src/components/palette/types.js";
import { options, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

afterEach(() => localStorage.clear());

const cmd = (id: string, title = id): Command => ({ id, title, run: () => {} });

describe("CommandPalette recents", () => {
  it("records runs under the key and shows Recent first, newest first, five at most", async () => {
    const commands = ["a", "b", "c", "d", "e", "f", "g"].map((id) => cmd(id));
    const { user } = renderPalette({ commands, recents: true, storageKey: "t" });
    for (const id of ["b", "c", "d", "e", "f", "g"]) {
      await pressHotkey(user);
      await user.keyboard(id);
      await user.keyboard("{Enter}");
    }
    expect(Object.keys(readRecents("t"))).toHaveLength(6);
    await pressHotkey(user);
    expect(screen.getByRole("group", { name: "Recent" })).toBeInTheDocument();
    expect(
      options()
        .slice(0, 5)
        .map((o) => o.textContent),
    ).toEqual(["g", "f", "e", "d", "c"]);
    expect(options()).toHaveLength(12);
  });

  it("breaks a score tie by run count, and records neither the calculator nor with recents off", async () => {
    const commands = [cmd("one", "Copy A"), cmd("two", "Copy B")];
    const { user, unmount } = renderPalette({ commands, recents: true, storageKey: "t" });
    await pressHotkey(user);
    await user.keyboard("{ArrowDown}{Enter}");
    await pressHotkey(user);
    await user.keyboard("copy");
    expect(options()[0]).toHaveTextContent("Copy B");
    await user.clear(screen.getByRole("combobox"));
    await user.keyboard("1+1{Enter}");
    expect(readRecents("t").calc).toBeUndefined();
    unmount();
    const off = renderPalette({ commands, recents: false, storageKey: "off" });
    await pressHotkey(off.user);
    await off.user.keyboard("{Enter}");
    expect(readRecents("off")).toEqual({});
  });
});
