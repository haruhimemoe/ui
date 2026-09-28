/**
 * @file tests/components/actions/InlineConfirm.test.tsx
 * @desc Component tests for InlineConfirm: the two steps, focus on cancel when it opens and back
 *       on the trigger when it closes, Escape, a pending confirm that keeps focus, a failed
 *       confirm that stays open, trigger props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InlineConfirm } from "../../../src/components/actions/InlineConfirm.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const setup = (onConfirm: () => void | Promise<void> = () => {}, onCancel = vi.fn()) => {
  const user = userEvent.setup();
  const utils = render(
    <InlineConfirm
      trigger="Delete"
      question="Delete this pack for good?"
      confirmLabel="Yes, delete it"
      cancelLabel="Keep it"
      pendingLabel="Deleting…"
      onConfirm={onConfirm}
      onCancel={onCancel}
      triggerProps={{ "aria-label": "Delete pack Mappool 1" }}
    />,
  );
  return { user, onCancel, ...utils };
};

describe("InlineConfirm", () => {
  it("opens from the keyboard into a group named by the question, with focus on cancel", async () => {
    const { user } = setup();
    await user.tab();
    expect(screen.getByRole("button", { name: "Delete pack Mappool 1" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("group", { name: "Delete this pack for good?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep it" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Yes, delete it" })).toHaveFocus();
  });

  it("puts focus back on the trigger after cancel or Escape", async () => {
    const { user, onCancel } = setup();
    await user.click(screen.getByRole("button", { name: "Delete pack Mappool 1" }));
    await user.click(screen.getByRole("button", { name: "Keep it" }));
    expect(screen.getByRole("button", { name: "Delete pack Mappool 1" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("group")).toBeNull();
    expect(screen.getByRole("button", { name: "Delete pack Mappool 1" })).toHaveFocus();
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("keeps focus on a pending confirm, runs it once, then returns to the trigger", async () => {
    let finish = () => {};
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { user } = setup(onConfirm);
    await user.click(screen.getByRole("button", { name: "Delete pack Mappool 1" }));
    const yes = screen.getByRole("button", { name: "Yes, delete it" });
    await user.click(yes);
    await user.click(screen.getByRole("button", { name: "Deleting…" }));
    await user.click(screen.getByRole("button", { name: "Keep it" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    const pending = screen.getByRole("button", { name: "Deleting…" });
    expect(pending).toHaveAttribute("aria-disabled", "true");
    expect(pending).not.toBeDisabled();
    await act(async () => finish());
    expect(screen.getByRole("button", { name: "Delete pack Mappool 1" })).toHaveFocus();
  });

  it("stays open with focus in place when the confirm fails", async () => {
    const { user } = setup(() => Promise.reject(new Error("offline")));
    await user.click(screen.getByRole("button", { name: "Delete pack Mappool 1" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete it" }));
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, delete it" })).toHaveFocus();
  });

  it("uses the default labels and has no axe violations in either step", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <InlineConfirm trigger="Revoke" question="Revoke this key?" onConfirm={() => {}} />,
    );
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Revoke" }));
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("bg-transparent");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass("bg-b3");
    await expectNoAxeViolations(container);
  });
});
