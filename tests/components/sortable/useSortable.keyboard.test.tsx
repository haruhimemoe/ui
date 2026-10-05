/**
 * @file tests/components/sortable/useSortable.keyboard.test.tsx
 * @desc useSortable from the keyboard: lift, steps across two containers, Home, End, PageUp and
 *       PageDown, one onMove per drop with the right move, Escape, Tab and window blur cancel, a
 *       refused target stays lifted and says why, a click with detail 0 lifts and drops, nothing
 *       while disabled or pending, a drop in place sends nothing, and a lifted item that leaves
 *       the list cancels.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SortableResult } from "../../../src/components/sortable/sortableTypes.js";
import { Board, handle, live, order, renderBoard } from "../../helpers/sortable.js";

const item = (id: string) => document.querySelector(`[data-sortable-item="${id}"]`);

describe("useSortable from the keyboard", () => {
  it("lifts with Space, steps across both containers and drops once", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    handle("A").focus();
    await user.keyboard(" ");
    expect(live()).toHaveTextContent("Picked up A. Position 1 of 3 in NM.");
    expect(handle("A")).toHaveAttribute("aria-pressed", "true");
    expect(item("a")).toHaveAttribute("data-sortable-state", "lifted");
    await user.keyboard("{ArrowDown}");
    expect(live()).toHaveTextContent("A: position 2 of 3 in NM.");
    expect(item("c")).toHaveAttribute("data-sortable-drop", "before");
    expect(item("c")).toHaveAttribute("data-sortable-line", "top");
    await user.keyboard("{ArrowDown}");
    expect(live()).toHaveTextContent("A: position 3 of 3 in NM.");
    expect(item("c")).toHaveAttribute("data-sortable-drop", "after");
    expect(item("c")).toHaveAttribute("data-sortable-line", "bottom");
    await user.keyboard("{ArrowDown}");
    expect(live()).toHaveTextContent("A: position 1 of 3 in HD.");
    await user.keyboard("{Enter}");
    expect(onMove).toHaveBeenCalledOnce();
    expect(onMove).toHaveBeenCalledWith({
      id: "a",
      from: { container: "nm", index: 0 },
      to: { container: "hd", index: 0 },
      onto: null,
      via: "keyboard",
    });
    expect(order("NM")).toEqual(["b", "c"]);
    expect(order("HD")).toEqual(["a", "d", "e"]);
    expect(live()).toHaveTextContent("Dropped A. Position 1 of 3 in HD.");
    expect(handle("A")).toHaveFocus();
    expect(document.querySelector("[data-sortable-state], [data-sortable-drop]")).toBeNull();
  });

  it("jumps with Home, End, PageUp and PageDown", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    handle("B").focus();
    await user.keyboard(" ");
    expect(live()).toHaveTextContent("Picked up B. Position 2 of 3 in NM.");
    await user.keyboard("{End}");
    expect(live()).toHaveTextContent("B: position 3 of 3 in NM.");
    await user.keyboard("{Home}");
    expect(live()).toHaveTextContent("B: position 1 of 3 in NM.");
    await user.keyboard("{PageDown}");
    expect(live()).toHaveTextContent("B: position 1 of 3 in HD.");
    await user.keyboard("{End}");
    expect(live()).toHaveTextContent("B: position 3 of 3 in HD.");
    await user.keyboard("{PageUp}");
    expect(live()).toHaveTextContent("B: position 1 of 3 in NM.");
    await user.keyboard("{Escape}");
    expect(live()).toHaveTextContent("Cancelled. B is back at position 2 of 3 in NM.");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("cancels on Escape, on Tab and when the window loses focus", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Escape}");
    expect(live()).toHaveTextContent("Cancelled. A is back at position 1 of 3 in NM.");
    expect(handle("A")).toHaveAttribute("aria-pressed", "false");
    expect(handle("A")).toHaveFocus();
    await user.keyboard(" ");
    expect(live()).toHaveTextContent("Picked up A.");
    await user.tab();
    expect(live()).toHaveTextContent("Cancelled. A is back");
    expect(handle("A")).not.toHaveFocus();
    handle("A").focus();
    await user.keyboard(" ");
    expect(live()).toHaveTextContent("Picked up A.");
    fireEvent.blur(window);
    expect(live()).toHaveTextContent("Cancelled. A is back");
    expect(document.querySelector("[data-sortable-state]")).toBeNull();
    expect(onMove).not.toHaveBeenCalled();
  });

  it("keeps a refused target lifted and says why", async () => {
    const onMove = vi.fn(() => true);
    const canDrop = vi.fn((move: { to: { container: string } }) =>
      move.to.container === "hd" ? "HD is full." : true,
    );
    const { user } = renderBoard({ onMove, canDrop });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{PageDown}");
    expect(live()).toHaveTextContent("A: position 1 of 3 in HD. Can't go there: HD is full.");
    expect(item("d")).toHaveAttribute("data-sortable-drop", "before");
    expect(item("d")).toHaveAttribute("data-sortable-refused", "");
    await user.keyboard("{Enter}");
    expect(onMove).not.toHaveBeenCalled();
    expect(handle("A")).toHaveAttribute("aria-pressed", "true");
    expect(live()).toHaveTextContent(
      "A can't go there: HD is full. Back at position 1 of 3 in NM.",
    );
    await user.keyboard("{Escape}");
  });

  it("lifts and drops on a click with detail 0, and ignores real clicks", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    fireEvent.click(handle("A"), { detail: 0 });
    expect(live()).toHaveTextContent("Picked up A.");
    fireEvent.keyDown(handle("A"), { key: "ArrowDown" });
    fireEvent.click(handle("A"), { detail: 0 });
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({ to: { container: "nm", index: 1 }, via: "keyboard" }),
    );
    await user.click(handle("C"));
    expect(handle("C")).toHaveAttribute("aria-pressed", "false");
    expect(onMove).toHaveBeenCalledOnce();
  });

  it("does nothing while disabled, and ignores lifts while a move is pending", async () => {
    const first = renderBoard({ disabled: true });
    expect(handle("A")).toHaveAttribute("aria-disabled", "true");
    handle("A").focus();
    await first.user.keyboard(" ");
    expect(live()).toBeEmptyDOMElement();
    first.unmount();

    let resolve: (value: SortableResult) => void = () => {};
    const onMove = vi.fn(
      () =>
        new Promise<SortableResult>((done) => {
          resolve = done;
        }),
    );
    const { user } = renderBoard({ onMove });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(handle("B")).toHaveAttribute("aria-disabled", "true");
    handle("B").focus();
    await user.keyboard(" ");
    expect(handle("B")).toHaveAttribute("aria-pressed", "false");
    await act(async () => resolve(true));
    expect(handle("B")).not.toHaveAttribute("aria-disabled");
    expect(order("NM")).toEqual(["b", "a", "c"]);
    expect(onMove).toHaveBeenCalledOnce();
  });

  it("sends nothing for a drop where it started", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(onMove).not.toHaveBeenCalled();
    expect(live()).toHaveTextContent("Dropped A. Position 1 of 3 in NM.");
  });

  it("cancels when the lifted item leaves the list", async () => {
    const onMove = vi.fn(() => true);
    const { user, rerender } = renderBoard({ onMove });
    handle("B").focus();
    await user.keyboard(" ");
    rerender(<Board onMove={onMove} hidden={["b"]} />);
    expect(live()).toHaveTextContent(/^Cancelled\. B is back at position 2 of \d in NM\.$/);
    expect(document.querySelector("[data-sortable-state]")).toBeNull();
    expect(onMove).not.toHaveBeenCalled();
  });
});
