/**
 * @file tests/components/palette/CommandPalette.pages.test.tsx
 * @desc Nested pages: Enter on a page command pushes it (breadcrumb, placeholder, its rows),
 *       Backspace on an empty input and Escape pop one level and restore the parent's query and
 *       active row, Backspace with text deletes text, the root can't be popped, and axe passes
 *       on a nested page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Command } from "../../../src/components/palette/types.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import {
  activeOption,
  dialog,
  input,
  options,
  pressHotkey,
  renderPalette,
} from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

const run = vi.fn();
const COMMANDS: readonly Command[] = [
  { id: "a", title: "Alpha", run },
  {
    id: "mods",
    title: "Pick mod",
    page: {
      title: "Mods",
      placeholder: "Which mod?",
      commands: [
        { id: "hd", title: "Hidden", run },
        {
          id: "hr",
          title: "Hard Rock",
          page: { title: "HR options", commands: [{ id: "hr1", title: "HR one", run }] },
        },
      ],
    },
  },
];

describe("CommandPalette pages", () => {
  it("pushes a page, pops with Backspace and Escape, and restores the parent", async () => {
    const { user, container } = renderPalette({ commands: COMMANDS });
    await pressHotkey(user);
    await user.keyboard("pick");
    await user.keyboard("{Enter}");
    expect(screen.getByText("Mods", { selector: "span" })).toBeInTheDocument();
    expect(input()).toHaveAttribute("placeholder", "Which mod?");
    expect(input()).toHaveValue("");
    expect(options().map((o) => o.textContent)).toEqual(["Hidden", "Hard Rock"]);
    expect(screen.getAllByText("back", { exact: false }).length).toBeGreaterThan(0);
    await expectNoAxeViolations(container);
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getAllByText(/Mods|HR options/, { selector: "span" })).toHaveLength(2);
    expect(options()[0]).toHaveTextContent("HR one");
    await user.keyboard("{Backspace}");
    expect(input()).toHaveAttribute("placeholder", "Which mod?");
    expect(activeOption()).toHaveTextContent("Hard Rock");
    await user.keyboard("ha{Backspace}");
    expect(input()).toHaveValue("h");
    expect(input()).toHaveAttribute("placeholder", "Which mod?");
    await user.keyboard("{Escape}");
    expect(input()).toHaveValue("pick");
    expect(activeOption()).toHaveTextContent("Pick mod");
    expect(dialog()).toHaveAttribute("open");
    await user.keyboard("{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}");
    expect(input()).toHaveValue("");
    expect(dialog()).toHaveAttribute("open");
    await user.keyboard("{Escape}");
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("runs a leaf on a nested page and closes", async () => {
    const { user } = renderPalette({ commands: COMMANDS });
    await pressHotkey(user);
    await user.keyboard("{ArrowDown}{Enter}{Enter}");
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ pathname: "/here" }), {});
    expect(dialog()).not.toHaveAttribute("open");
  });
});
