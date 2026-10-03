/**
 * @file tests/components/forms/TypeToConfirm.test.tsx
 * @desc Component tests for TypeToConfirm: the button stays off until the name matches, Enter
 *       submits once it does, one run at a time, the pending label, error, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TypeToConfirm } from "../../../src/components/forms/TypeToConfirm.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("TypeToConfirm", () => {
  it("enables the action only when the name is typed exactly, and submits on Enter", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <TypeToConfirm
        id="del"
        expected="OWC 2026"
        submitLabel="Delete this pool"
        onConfirm={onConfirm}
      >
        <p>This deletes the pool for everyone.</p>
      </TypeToConfirm>,
    );
    const field = screen.getByRole("textbox", { name: "Type OWC 2026 to confirm" });
    expect(field).toHaveAttribute("autocomplete", "off");
    expect(field).toHaveAttribute("spellcheck", "false");
    const button = screen.getByRole("button", { name: "Delete this pool" });
    expect(button).toBeDisabled();
    await user.type(field, "owc 2026{Enter}");
    expect(onConfirm).not.toHaveBeenCalled();
    await user.clear(field);
    await user.type(field, " OWC 2026 {Enter}");
    expect(button).toBeEnabled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows the pending label and runs once while pending; a failure leaves the form as typed", async () => {
    const user = userEvent.setup();
    let fail = () => {};
    const onConfirm = vi.fn(
      () => new Promise<void>((_, reject) => (fail = () => reject(new Error("x")))),
    );
    render(
      <TypeToConfirm
        id="t"
        expected="abc"
        label="Name"
        submitLabel="Transfer"
        pendingLabel="Transferring…"
        onConfirm={onConfirm}
        error="The pool is still yours."
      />,
    );
    await user.type(screen.getByRole("textbox", { name: "Name" }), "abc{Enter}{Enter}");
    expect(screen.getByRole("button", { name: "Transferring…" })).toBeDisabled();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => fail());
    expect(screen.getByRole("button", { name: "Transfer" })).toBeEnabled();
    expect(screen.getByRole("textbox")).toHaveValue("abc");
    expect(screen.getByRole("status")).toHaveTextContent("The pool is still yours.");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TypeToConfirm
        id="a"
        expected="x"
        submitLabel="Go"
        onConfirm={() => {}}
        hint="Case matters."
      />,
    );
    await expectNoAxeViolations(container);
  });
});
