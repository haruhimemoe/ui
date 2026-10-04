/**
 * @file tests/components/palette/CommandPalette.args.test.tsx
 * @desc Argument prompts: a text arg (Required on empty), a number arg (Enter a number), a
 *       custom validate message, a choice arg as filtered rows, the crumb trail of accepted
 *       values, Backspace and Escape stepping back, and run called with every value.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Command } from "../../../src/components/palette/types.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { dialog, input, options, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

const run = vi.fn();
beforeEach(() => run.mockClear());

const JUMP: Command = {
  id: "jump",
  title: "Jump to beatmap",
  args: [
    {
      name: "id",
      label: "Beatmap id",
      type: "number",
      validate: (v) => (Number(v) < 1 ? "Must be positive" : undefined),
    },
    {
      name: "mod",
      label: "Mod",
      type: "choice",
      choices: [
        { value: "HD", label: "Hidden" },
        { value: "HR", label: "Hard Rock", subtitle: "AR up" },
      ],
    },
    { name: "note", label: "Note", type: "text" },
  ],
  run,
};

describe("CommandPalette args", () => {
  it("collects number, choice and text args, validating each, then runs with all of them", async () => {
    const { user, container } = renderPalette({ commands: [JUMP] });
    await pressHotkey(user);
    await user.keyboard("{Enter}");
    expect(input()).toHaveAttribute("placeholder", "Beatmap id");
    expect(screen.getByText("Jump to beatmap", { selector: "span" })).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    await user.keyboard("{Enter}");
    expect(screen.getByText("Required")).toBeInTheDocument();
    // An inline error is a status region (always mounted), not an alert.
    expect(screen.getByText("Required")).toHaveAttribute("role", "status");
    expect(input()).toHaveAttribute("aria-invalid", "true");
    expect(input()).toHaveAttribute("aria-describedby", screen.getByText("Required").id);
    await expectNoAxeViolations(container);
    await user.keyboard("abc{Enter}");
    expect(screen.getByText("Enter a number")).toBeInTheDocument();
    await user.clear(input());
    await user.keyboard("0{Enter}");
    expect(screen.getByText("Must be positive")).toBeInTheDocument();
    await user.clear(input());
    await user.keyboard("42{Enter}");
    expect(input()).toHaveAttribute("placeholder", "Mod");
    expect(screen.getByText("42", { selector: "span" })).toBeInTheDocument();
    expect(options().map((o) => o.textContent)).toEqual(["Hidden", "Hard RockAR up"]);
    await user.keyboard("hard");
    expect(options()).toHaveLength(1);
    await expectNoAxeViolations(container);
    await user.keyboard("{Enter}");
    expect(input()).toHaveAttribute("placeholder", "Note");
    await user.keyboard("{Backspace}");
    expect(input()).toHaveAttribute("placeholder", "Mod");
    expect(screen.queryByText("HR", { selector: "span" })).toBeNull();
    await user.keyboard("{Enter}");
    await user.keyboard("gg{Enter}");
    expect(run).toHaveBeenCalledWith(expect.anything(), { id: "42", mod: "HD", note: "gg" });
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("Escape at the first arg cancels back to the list; a click on a choice picks it", async () => {
    const { user } = renderPalette({ commands: [JUMP] });
    await pressHotkey(user);
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");
    expect(input()).toHaveAttribute("placeholder", "Search commands…");
    expect(options()[0]).toHaveTextContent("Jump to beatmap");
    await user.keyboard("{Enter}7{Enter}");
    await user.click(screen.getByRole("option", { name: /Hard Rock/ }));
    expect(input()).toHaveAttribute("placeholder", "Note");
    // A mouse pick keeps the keyboard in the input: the next prompt can be typed straight away.
    expect(input()).toHaveFocus();
    expect(screen.getByText("HR", { selector: "span" })).toBeInTheDocument();
  });
});
