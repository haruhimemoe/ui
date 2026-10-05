/**
 * @file tests/components/dialogs/ConfirmDialog.test.tsx
 * @desc ConfirmDialog: the trigger opens an alertdialog named by its title with focus on Cancel;
 *       Cancel and Escape close it, call onCancel and return focus; controlled open; the tones;
 *       a resolved confirm closes, runs once and ignores Escape and backdrop while pending; a
 *       failure stays open with an alert; a browser close mid-confirm stays closed; a confirm that
 *       removes its own row sends focus to returnFocus; axe closed, open, pending and failed.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "../../../src/components/dialogs/ConfirmDialog.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const dialog = () => document.querySelector("dialog") as HTMLDialogElement;
const pressEscape = () =>
  act(() => {
    dialog().dispatchEvent(new Event("cancel", { cancelable: true }));
  });

describe("ConfirmDialog", () => {
  it("opens from its trigger with focus on Cancel; Cancel and Escape close it", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        trigger="Delete pack"
        title="Delete this pack?"
        description="Its link stops working."
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Delete pack" });
    expect(dialog()).not.toHaveAttribute("open");
    await user.click(trigger);
    const box = screen.getByRole("alertdialog", { name: "Delete this pack?" });
    expect(box).toHaveAccessibleDescription("Its link stops working.");
    expect(within(box).getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.click(within(box).getByRole("button", { name: "Cancel" }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    pressEscape();
    expect(dialog()).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("follows open and onOpenChange when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const props = { title: "Remove peppy?", onConfirm: () => {}, onOpenChange };
    const { rerender } = render(<ConfirmDialog open={false} {...props} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<ConfirmDialog open {...props} />);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // The owner closes it.
    expect(dialog()).toHaveAttribute("open");
    rerender(<ConfirmDialog open={false} {...props} />);
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("gives a destructive confirm the danger look and a default one primary", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ConfirmDialog
        trigger="Open"
        title="Sure?"
        tone="destructive"
        confirmLabel="Go"
        onConfirm={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("button", { name: "Go" })).toHaveClass("bg-rose-700");
    rerender(<ConfirmDialog trigger="Open" title="Sure?" confirmLabel="Go" onConfirm={() => {}} />);
    expect(screen.getByRole("button", { name: "Go" })).toHaveClass("bg-h2");
  });

  it("runs once while pending, ignores Escape and backdrop, then closes on resolve", async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <ConfirmDialog
        trigger="Revoke"
        title="Revoke this key?"
        confirmLabel="Revoke key"
        pendingLabel="Revoking…"
        onConfirm={onConfirm}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Revoke" }));
    const confirm = screen.getByRole("button", { name: "Revoke key" });
    await user.click(confirm);
    await user.click(confirm);
    await user.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(confirm).toHaveTextContent("Revoking…");
    expect(confirm).toHaveAttribute("aria-disabled", "true");
    expect(confirm).toHaveFocus();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("alertdialog").firstElementChild).toHaveAttribute("aria-busy", "true");
    pressEscape();
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog()).toHaveAttribute("open");
    await act(async () => finish());
    expect(dialog()).not.toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Revoke" })).toHaveFocus();
  });

  it("stays open on a failure, saying why in an alert, focus kept on Confirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi
      .fn()
      .mockRejectedValueOnce(new Error("peppy already owns 50 pools."))
      .mockRejectedValueOnce("not an error");
    render(
      <ConfirmDialog
        trigger="Hand over"
        title="Hand it to peppy?"
        confirmLabel="Hand it over"
        onConfirm={onConfirm}
        failedMessage={(error) =>
          error instanceof Error ? error.message : "Something else went wrong."
        }
      />,
    );
    await user.click(screen.getByRole("button", { name: "Hand over" }));
    const confirm = screen.getByRole("button", { name: "Hand it over" });
    await user.click(confirm);
    expect(await screen.findByRole("alert")).toHaveTextContent("peppy already owns 50 pools.");
    expect(dialog()).toHaveAttribute("open");
    expect(confirm).toHaveFocus();
    await user.click(confirm);
    expect(await screen.findByRole("alert")).toHaveTextContent("Something else went wrong.");
  });

  it("shows the default failure message, or a fixed one", async () => {
    const user = userEvent.setup();
    const fail = () => {
      throw new Error("boom");
    };
    const { unmount } = render(<ConfirmDialog trigger="A" title="A?" onConfirm={fail} />);
    await user.click(screen.getByRole("button", { name: "A" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong. Try again.");
    unmount();
    render(
      <ConfirmDialog trigger="B" title="B?" onConfirm={fail} failedMessage="Couldn't do it." />,
    );
    await user.click(screen.getByRole("button", { name: "B" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't do it.");
  });

  it("stays closed after a browser close mid-confirm, without calling onCancel", async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        trigger="Delete"
        title="Delete it?"
        onCancel={onCancel}
        onConfirm={() =>
          new Promise<void>((resolve) => {
            finish = resolve;
          })
        }
      />,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    act(() => dialog().close());
    expect(dialog()).not.toHaveAttribute("open");
    await act(async () => finish());
    expect(dialog()).not.toHaveAttribute("open");
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("sends focus to returnFocus when the confirm removed its own row", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    function Rows() {
      const [rows, setRows] = useState(["OWC", "SPC"]);
      return (
        <div>
          <h2 id="rows-heading" tabIndex={-1}>
            Packs
          </h2>
          <ul>
            {rows.map((name) => (
              <li key={name}>
                <ConfirmDialog
                  trigger={`Delete ${name}`}
                  title={`Delete ${name}?`}
                  confirmLabel="Delete"
                  tone="destructive"
                  onCancel={onCancel}
                  returnFocus={() => document.getElementById("rows-heading")}
                  onConfirm={() => setRows((all) => all.filter((row) => row !== name))}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }
    render(<Rows />);
    await user.click(screen.getByRole("button", { name: "Delete OWC" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByRole("button", { name: "Delete OWC" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Packs" })).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("passes axe closed, open, pending and failed", async () => {
    const user = userEvent.setup();
    let fail: (error: Error) => void = () => {};
    const { container } = render(
      <ConfirmDialog
        trigger="Delete pool"
        title="Delete OWC 2026?"
        description="This can't be undone."
        tone="destructive"
        onConfirm={() =>
          new Promise<void>((_, reject) => {
            fail = reject;
          })
        }
      />,
    );
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Delete pool" }));
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await expectNoAxeViolations(container);
    await act(async () => fail(new Error("no")));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
