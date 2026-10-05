/**
 * @file tests/components/dialogs/ConfirmDialog.type.test.tsx
 * @desc ConfirmDialog with typeToConfirm: the field takes focus with no autocomplete,
 *       autocapitalize or spellcheck; Confirm stays aria-disabled, and says why, until the text
 *       matches (trimmed, case-sensitive); Enter submits only on a match; the text resets on each
 *       open; the object form's label and hint; axe while typing.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ConfirmDialog,
  type ConfirmDialogProps,
} from "../../../src/components/dialogs/ConfirmDialog.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;

const setup = (extra: Partial<ConfirmDialogProps> = {}) => {
  const user = userEvent.setup();
  const onConfirm = vi.fn();
  const utils = render(
    <ConfirmDialog
      trigger="Delete pool"
      title="Delete OWC 2026?"
      tone="destructive"
      confirmLabel="Delete for good"
      typeToConfirm="OWC 2026"
      onConfirm={onConfirm}
      {...(extra as object)}
    />,
  );
  const open = () => user.click(screen.getByRole("button", { name: "Delete pool" }));
  return { user, onConfirm, open, ...utils };
};

describe("ConfirmDialog typeToConfirm", () => {
  it("focuses the field and keeps Confirm off, saying why, until the name matches", async () => {
    const { user, onConfirm, open } = setup();
    await open();
    const field = screen.getByRole("textbox", { name: "Type OWC 2026 to confirm" });
    expect(field).toHaveFocus();
    expect(field).toHaveAttribute("autocomplete", "off");
    expect(field).toHaveAttribute("autocapitalize", "off");
    expect(field).toHaveAttribute("spellcheck", "false");
    const confirm = screen.getByRole("button", { name: "Delete for good" });
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    expect(confirm).toHaveAccessibleDescription("Type OWC 2026 to confirm");
    await user.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    await user.type(field, "owc 2026");
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    await user.clear(field);
    await user.type(field, "  OWC 2026 ");
    expect(confirm).not.toHaveAttribute("aria-disabled");
    expect(confirm).not.toHaveAttribute("aria-describedby");
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("submits with Enter only once the name matches", async () => {
    const { user, onConfirm, open } = setup();
    await open();
    await user.keyboard("OWC{Enter}");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(dialog()).toHaveAttribute("open");
    await user.keyboard(" 2026{Enter}");
    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(dialog()).not.toHaveAttribute("open"));
  });

  it("starts empty on every open", async () => {
    const { user, open } = setup();
    await open();
    await user.keyboard("OWC");
    act(() => {
      dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
    });
    await open();
    expect(screen.getByRole("textbox", { name: "Type OWC 2026 to confirm" })).toHaveValue("");
  });

  it("takes a label and a hint from the object form", async () => {
    const { open } = setup({
      typeToConfirm: { expected: "peppy", label: "Type your osu! username", hint: "It's peppy." },
    });
    await open();
    expect(
      screen.getByRole("textbox", { name: "Type your osu! username" }),
    ).toHaveAccessibleDescription("It's peppy.");
  });

  it("passes axe while typing", async () => {
    const { user, open, container } = setup();
    await open();
    await user.keyboard("OW");
    await expectNoAxeViolations(container);
  });
});
