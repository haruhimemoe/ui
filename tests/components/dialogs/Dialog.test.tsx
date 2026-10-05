/**
 * @file tests/components/dialogs/Dialog.test.tsx
 * @desc Dialog: follows open, focuses initialFocus and hands focus back (to the opener, else
 *       returnFocus), Escape and backdrop presses ask the owner, a press that starts inside never
 *       dismisses, not dismissible ignores both, a browser close is reported and releases the
 *       lock, unmounting while open releases the lock and hands focus over without asking the
 *       owner, a dialog opened from a closing one returns focus to that one's opener, classes,
 *       and axe on the open dialog.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, type RefObject } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog, type DialogProps } from "../../../src/components/dialogs/Dialog.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const dialogNamed = (name: string) =>
  document.querySelector(`dialog[aria-label="${name}"]`) as HTMLDialogElement;
const overflow = () => document.documentElement.style.overflow;
const cancel = (element: HTMLDialogElement) => {
  let notPrevented = true;
  act(() => {
    notPrevented = element.dispatchEvent(new Event("cancel", { cancelable: true }));
  });
  return notPrevented;
};

type Options = Partial<Omit<DialogProps, "open">> & {
  opener?: boolean;
  shown?: boolean;
  inside?: RefObject<HTMLButtonElement | null>;
};

const view = (open: boolean, { opener = true, shown = true, inside, ...props }: Options = {}) => (
  <div>
    {opener ? <button type="button">Opener</button> : null}
    <h2 tabIndex={-1}>Fallback</h2>
    {shown ? (
      <Dialog open={open} onDismiss={() => {}} aria-label="Test dialog" {...props}>
        <p>Body text</p>
        <button type="button" ref={inside}>
          Inside
        </button>
      </Dialog>
    ) : null}
  </div>
);

const fallback = () => screen.getByRole("heading", { name: "Fallback" });

describe("Dialog", () => {
  it("shows modally when open turns true, focuses initialFocus, and hands focus back on close", () => {
    const inside = createRef<HTMLButtonElement>();
    const { rerender } = render(view(false, { initialFocus: inside, inside }));
    const opener = screen.getByRole("button", { name: "Opener" });
    opener.focus();
    rerender(view(true, { initialFocus: inside, inside }));
    expect(dialogNamed("Test dialog")).toHaveAttribute("open");
    expect(inside.current).toHaveFocus();
    expect(overflow()).toBe("hidden");
    rerender(view(false, { initialFocus: inside, inside }));
    expect(dialogNamed("Test dialog")).not.toHaveAttribute("open");
    expect(opener).toHaveFocus();
    expect(overflow()).toBe("");
  });

  it("leaves the page's scroll alone with lockScroll off", () => {
    render(view(true, { lockScroll: false }));
    expect(overflow()).toBe("");
  });

  it("falls back to returnFocus when the opener has left the page", () => {
    const options = { returnFocus: fallback };
    const { rerender } = render(view(false, options));
    screen.getByRole("button", { name: "Opener" }).focus();
    rerender(view(true, options));
    rerender(view(true, { ...options, opener: false }));
    rerender(view(false, { ...options, opener: false }));
    expect(fallback()).toHaveFocus();
  });

  it("asks the owner on Escape and stays open; not dismissible ignores Escape and backdrop", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(view(true, { onDismiss }));
    expect(cancel(dialogNamed("Test dialog"))).toBe(false);
    expect(onDismiss).toHaveBeenCalledWith("escape");
    expect(dialogNamed("Test dialog")).toHaveAttribute("open");
    onDismiss.mockClear();
    rerender(view(true, { onDismiss, dismissible: false }));
    expect(cancel(dialogNamed("Test dialog"))).toBe(false);
    fireEvent.pointerDown(dialogNamed("Test dialog"));
    fireEvent.click(dialogNamed("Test dialog"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses on a backdrop press only when it starts and ends on the backdrop", () => {
    const onDismiss = vi.fn();
    render(view(true, { onDismiss }));
    const element = dialogNamed("Test dialog");
    // A text selection dragged from inside out onto the backdrop.
    fireEvent.pointerDown(screen.getByText("Body text"));
    fireEvent.click(element);
    // A press that starts on the backdrop but ends inside.
    fireEvent.pointerDown(element);
    fireEvent.click(screen.getByRole("button", { name: "Inside" }));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerDown(element);
    fireEvent.click(element);
    expect(onDismiss).toHaveBeenCalledWith("backdrop");
  });

  it("reports a close the browser made itself and releases the lock", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(view(false, { onDismiss }));
    const opener = screen.getByRole("button", { name: "Opener" });
    opener.focus();
    rerender(view(true, { onDismiss }));
    act(() => dialogNamed("Test dialog").close());
    expect(onDismiss).toHaveBeenCalledWith("browser");
    expect(overflow()).toBe("");
    expect(opener).toHaveFocus();
    // The owner follows; nothing runs twice.
    rerender(view(false, { onDismiss }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("releases the lock and hands focus to returnFocus when unmounted while open", () => {
    const onDismiss = vi.fn();
    const options = { onDismiss, returnFocus: fallback };
    const { rerender } = render(view(false, options));
    screen.getByRole("button", { name: "Opener" }).focus();
    rerender(view(true, options));
    expect(overflow()).toBe("hidden");
    // The row that held both the trigger and the dialog was deleted.
    rerender(view(true, { ...options, opener: false, shown: false }));
    expect(overflow()).toBe("");
    expect(fallback()).toHaveFocus();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("returns focus to the first dialog's opener when opened from inside it as it closes", () => {
    function Pair({ step }: { step: 0 | 1 | 2 }) {
      return (
        <div>
          <button type="button">Start</button>
          {/* Second comes first, so its open effect runs while First is still open. */}
          <Dialog open={step === 2} onDismiss={() => {}} aria-label="Second">
            <button type="button">Done</button>
          </Dialog>
          <Dialog open={step === 1} onDismiss={() => {}} aria-label="First">
            <button type="button">Next</button>
          </Dialog>
        </div>
      );
    }
    const { rerender } = render(<Pair step={0} />);
    screen.getByRole("button", { name: "Start" }).focus();
    rerender(<Pair step={1} />);
    screen.getByRole("button", { name: "Next" }).focus();
    rerender(<Pair step={2} />);
    expect(dialogNamed("First")).not.toHaveAttribute("open");
    expect(dialogNamed("Second")).toHaveAttribute("open");
    rerender(<Pair step={0} />);
    expect(screen.getByRole("button", { name: "Start" })).toHaveFocus();
    expect(overflow()).toBe("");
  });

  it("fades in by default, not with motion off, and lets the caller's classes win", () => {
    const { rerender } = render(view(true, { className: "bg-b6" }));
    const element = dialogNamed("Test dialog");
    expect(element).toHaveClass("duration-short", "starting:opacity-0", "bg-b6", "p-0");
    expect(element).not.toHaveClass("bg-transparent");
    rerender(view(true, { motion: false }));
    expect(element).not.toHaveClass("duration-short");
  });

  it("passes axe while open", async () => {
    const { container } = render(view(true));
    await expectNoAxeViolations(container);
  });
});
