/**
 * @file tests/helpers/palette.tsx
 * @desc Shared setup for the CommandPalette tests: fixture commands, a render that mounts the
 *       palette with an opener button, and small readers for the input and options. Each test
 *       file mocks next/navigation.js itself (vi.mock is per file).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { CommandPalette } from "../../src/components/palette/CommandPalette.js";
import type { Command, CommandPaletteProps } from "../../src/components/palette/types.js";

/** Spies the fixture commands call. */
export const spies = { home: vi.fn(), copy: vi.fn(), toggle: vi.fn(), chord: vi.fn() };

export const COMMANDS: readonly Command[] = [
  { id: "go.home", title: "Go home", group: "Navigate", run: spies.home, shortcut: "g h" },
  {
    id: "copy",
    title: "Copy page URL",
    group: "Page",
    keywords: ["link"],
    shortcut: "mod+shift+c",
    run: spies.copy,
  },
  { id: "toggle", title: "Toggle thing", group: "Page", closeOnRun: false, run: spies.toggle },
  { id: "chord", title: "Chord target", group: "Page", shortcut: "g p", run: spies.chord },
];

/**
 * Renders the palette after an "Open me" button (the opener focus tests use it), with any props
 * overridden. Returns user-event and the container.
 */
export function renderPalette(props: Partial<CommandPaletteProps> = {}) {
  const user = userEvent.setup();
  const utils = render(
    <div>
      <button type="button">Open me</button>
      <input aria-label="Other field" />
      <CommandPalette commands={COMMANDS} recents={false} {...props} />
    </div>,
  );
  return { user, ...utils };
}

/** Presses the default hotkey as a non-Mac (Control+K). */
export const pressHotkey = (user: ReturnType<typeof userEvent.setup>) =>
  user.keyboard("{Control>}k{/Control}");

export const dialog = () => document.querySelector("dialog") as HTMLDialogElement;
export const input = () => screen.getByRole("combobox") as HTMLInputElement;
/** The selectable rows: hint rows are options too, but disabled. */
export const options = () =>
  screen.getAllByRole("option").filter((row) => row.getAttribute("aria-disabled") !== "true");
export const activeOption = () =>
  document.getElementById(input().getAttribute("aria-activedescendant") ?? "");
