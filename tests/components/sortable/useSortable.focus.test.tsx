/**
 * @file tests/components/sortable/useSortable.focus.test.tsx
 * @desc Where focus goes after a sortable move: the handle, even when the row remounts in
 *       another container; the destination container when the item is gone; the same move
 *       button, or the other one at an end; buttons found by id with quotes and colons; async
 *       moves (resolve, reject, a string reason); moveTo; onto moves from the buttons; and no
 *       second move while one is pending.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  SortableMove,
  SortableResult,
} from "../../../src/components/sortable/sortableTypes.js";
import { handle, type Lists, live, order, renderBoard } from "../../helpers/sortable.js";

const button = (name: string) => screen.getByRole("button", { name });
const remove = (lists: Lists, move: SortableMove): Lists =>
  Object.fromEntries(
    Object.entries(lists).map(([key, ids]) => [key, ids.filter((id) => id !== move.id)]),
  );

describe("focus after a move", () => {
  it("keeps focus on the handle when the row remounts in another container", async () => {
    const { user } = renderBoard();
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{PageDown}");
    await user.keyboard("{Enter}");
    expect(order("HD")).toEqual(["a", "d", "e"]);
    expect(handle("A")).toHaveFocus();
  });

  it("falls back to the destination container when the item is gone", async () => {
    const { user } = renderBoard({ transform: remove });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{PageDown}");
    await user.keyboard("{Enter}");
    expect(document.querySelector('[data-sortable-container="hd"]')).toHaveFocus();
  });

  it("keeps focus on the same move button, or the other one at an end", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    await user.click(button("Move B up"));
    expect(order("NM")).toEqual(["b", "a", "c"]);
    expect(button("Move B up")).toBeDisabled();
    expect(button("Move B down")).toHaveFocus();
    expect(live()).toHaveTextContent("Dropped B. Position 1 of 3 in NM.");
    await user.click(button("Move B down"));
    expect(order("NM")).toEqual(["a", "b", "c"]);
    expect(button("Move B down")).toHaveFocus();
    expect(onMove).toHaveBeenLastCalledWith({
      id: "b",
      from: { container: "nm", index: 0 },
      to: { container: "nm", index: 1 },
      onto: null,
      via: "button",
    });
  });

  it("finds the buttons of an id with quotes and colons", async () => {
    const { user } = renderBoard({ initial: { nm: ['x"y:z', "b"], hd: [] } });
    await user.click(button('Move X"Y:Z down'));
    expect(order("NM")).toEqual(["b", 'x"y:z']);
    expect(button('Move X"Y:Z up')).toHaveFocus();
  });

  it("accepts an async move once it resolves", async () => {
    const { user } = renderBoard({ onMove: async () => true });
    handle("A").focus();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    await waitFor(() => expect(live()).toHaveTextContent("Dropped A. Position 2 of 3 in NM."));
    expect(order("NM")).toEqual(["b", "a", "c"]);
    await waitFor(() => expect(handle("A")).toHaveFocus());
  });

  it("refuses an async move that rejects, or that answers with a reason", async () => {
    const failing = renderBoard({ onMove: () => Promise.reject(new Error("offline")) });
    handle("A").focus();
    await failing.user.keyboard(" ");
    await failing.user.keyboard("{ArrowDown}");
    await failing.user.keyboard("{Enter}");
    await waitFor(() =>
      expect(live()).toHaveTextContent("A can't go there. Back at position 1 of 3 in NM."),
    );
    expect(order("NM")).toEqual(["a", "b", "c"]);
    failing.unmount();

    const refusing = renderBoard({ onMove: async () => "The server said no." });
    handle("A").focus();
    await refusing.user.keyboard(" ");
    await refusing.user.keyboard("{ArrowDown}");
    await refusing.user.keyboard("{Enter}");
    await waitFor(() =>
      expect(live()).toHaveTextContent(
        "A can't go there: The server said no. Back at position 1 of 3 in NM.",
      ),
    );
    expect(order("NM")).toEqual(["a", "b", "c"]);
  });

  it("moves to another container's end with moveTo and focuses the handle", async () => {
    const onMove = vi.fn(() => true);
    const { user } = renderBoard({ onMove });
    await user.click(button("Send A to HD"));
    expect(onMove).toHaveBeenCalledWith({
      id: "a",
      from: { container: "nm", index: 0 },
      to: { container: "hd", index: 2 },
      onto: null,
      via: "button",
    });
    expect(order("HD")).toEqual(["d", "e", "a"]);
    expect(handle("A")).toHaveFocus();
  });

  it("reports onto moves from the buttons", async () => {
    const onMove = vi.fn(() => false);
    const { user } = renderBoard({ onMove, modes: { nm: "onto" } });
    await user.click(button("Move B up"));
    expect(onMove).toHaveBeenCalledWith({
      id: "b",
      from: { container: "nm", index: 1 },
      to: { container: "nm", index: 0 },
      onto: "a",
      via: "button",
    });
    expect(live()).toHaveTextContent("B can't go there. Back at position 2 of 3 in NM.");
    expect(button("Move B up")).toHaveFocus();
  });

  it("ignores new lifts and moves while a move is pending", async () => {
    let resolve: (value: SortableResult) => void = () => {};
    const onMove = vi.fn(
      () =>
        new Promise<SortableResult>((done) => {
          resolve = done;
        }),
    );
    const { user } = renderBoard({ onMove });
    await user.click(button("Move B up"));
    expect(button("Move C up")).toBeDisabled();
    fireEvent.keyDown(handle("C"), { key: " " });
    expect(handle("C")).toHaveAttribute("aria-pressed", "false");
    expect(onMove).toHaveBeenCalledOnce();
    await act(async () => resolve(true));
    await waitFor(() => expect(button("Move B down")).toHaveFocus());
    expect(order("NM")).toEqual(["b", "a", "c"]);
  });
});
