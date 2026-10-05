/**
 * @file tests/components/sortable/useSortable.pointer.test.tsx
 * @desc useSortable by pointer, with mocked rects: no lift under the threshold, a lift past it,
 *       drops between and onto, a drop outside cancels, pointercancel and Escape cancel, the
 *       click after a drag is swallowed, body styles come back, a right button, a second pointer
 *       and a disabled list never lift, auto-scroll near an edge (and not when off), and
 *       unmounting mid-drag cleans up.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handle, live, mockLayout, order, pointer, renderBoard } from "../../helpers/sortable.js";

const item = (id: string) => document.querySelector(`[data-sortable-item="${id}"]`);
const lifted = () => document.querySelector("[data-sortable-state]");

beforeEach(() => {
  mockLayout();
});
afterEach(() => {
  vi.restoreAllMocks();
  document.body.removeAttribute("style");
});

/** Presses A's handle at (10, 20) and moves past the threshold. */
const liftA = () => {
  pointer("pointerDown", handle("A"), 10, 20);
  pointer("pointerMove", handle("A"), 10, 30);
};

describe("useSortable by pointer", () => {
  it("doesn't lift under the threshold", () => {
    const onMove = vi.fn(() => true);
    renderBoard({ onMove });
    pointer("pointerDown", handle("A"), 10, 20);
    pointer("pointerMove", handle("A"), 12, 21);
    expect(lifted()).toBeNull();
    pointer("pointerUp", handle("A"), 12, 21);
    expect(onMove).not.toHaveBeenCalled();
    expect(document.body.style.userSelect).toBe("");
  });

  it("lifts past the threshold and drops between items", () => {
    const onMove = vi.fn(() => true);
    renderBoard({ onMove });
    liftA();
    expect(item("a")).toHaveAttribute("data-sortable-state", "lifted");
    expect(live()).toHaveTextContent("Picked up A. Position 1 of 3 in NM.");
    expect(document.body.style.userSelect).toBe("none");
    expect(document.body.style.cursor).toBe("grabbing");
    pointer("pointerMove", handle("A"), 10, 110);
    expect(item("c")).toHaveAttribute("data-sortable-drop", "after");
    expect(live()).toHaveTextContent("Picked up A.");
    pointer("pointerUp", handle("A"), 10, 110);
    expect(onMove).toHaveBeenCalledWith({
      id: "a",
      from: { container: "nm", index: 0 },
      to: { container: "nm", index: 2 },
      onto: null,
      via: "pointer",
    });
    expect(order("NM")).toEqual(["b", "c", "a"]);
    expect(live()).toHaveTextContent("Dropped A. Position 3 of 3 in NM.");
    expect(document.body.style.userSelect).toBe("");
    expect(document.body.style.cursor).toBe("");
    expect(handle("A")).toHaveFocus();
  });

  it("drops onto an item of an onto container", () => {
    const onMove = vi.fn(() => true);
    renderBoard({ onMove, modes: { hd: "onto" } });
    liftA();
    pointer("pointerMove", handle("A"), 10, 250);
    expect(item("e")).toHaveAttribute("data-sortable-drop", "onto");
    pointer("pointerUp", handle("A"), 10, 250);
    expect(onMove).toHaveBeenCalledWith({
      id: "a",
      from: { container: "nm", index: 0 },
      to: { container: "hd", index: 1 },
      onto: "e",
      via: "pointer",
    });
  });

  it("cancels a drop outside every list, a pointercancel and Escape", () => {
    const onMove = vi.fn(() => true);
    renderBoard({ onMove });
    liftA();
    pointer("pointerMove", handle("A"), 10, 170);
    pointer("pointerUp", handle("A"), 10, 170);
    expect(live()).toHaveTextContent("Cancelled. A is back at position 1 of 3 in NM.");
    liftA();
    expect(lifted()).not.toBeNull();
    pointer("pointerCancel", handle("A"), 10, 30);
    expect(lifted()).toBeNull();
    expect(document.body.style.userSelect).toBe("");
    liftA();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(lifted()).toBeNull();
    expect(live()).toHaveTextContent("Cancelled. A is back");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("swallows the click that follows a drag, and only that one", async () => {
    const clicks = vi.fn();
    document.addEventListener("click", clicks);
    renderBoard();
    liftA();
    pointer("pointerMove", handle("A"), 10, 110);
    pointer("pointerUp", handle("A"), 10, 110);
    fireEvent.click(document.body);
    expect(clicks).not.toHaveBeenCalled();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.click(document.body);
    expect(clicks).toHaveBeenCalledOnce();
    document.removeEventListener("click", clicks);
  });

  it("ignores a right button, a second pointer and a disabled list", () => {
    const onMove = vi.fn(() => true);
    const first = renderBoard({ onMove });
    pointer("pointerDown", handle("A"), 10, 20, { button: 2 });
    pointer("pointerMove", handle("A"), 10, 60, { button: 2 });
    expect(lifted()).toBeNull();
    pointer("pointerUp", handle("A"), 10, 60, { button: 2 });
    pointer("pointerDown", handle("A"), 10, 20, { isPrimary: false, pointerId: 2 });
    pointer("pointerMove", handle("A"), 10, 60, { isPrimary: false, pointerId: 2 });
    expect(lifted()).toBeNull();
    pointer("pointerUp", handle("A"), 10, 60, { isPrimary: false, pointerId: 2 });
    first.unmount();
    renderBoard({ onMove, disabled: true });
    liftA();
    expect(lifted()).toBeNull();
    expect(document.body.style.userSelect).toBe("");
    expect(onMove).not.toHaveBeenCalled();
  });

  it("auto-scrolls the hovered list's scroll box and the page near an edge, unless turned off", async () => {
    // jsdom has no scrollingElement: stand one in that records what it is scrolled by.
    const page = document.createElement("div");
    const pageScroll = vi.fn();
    Object.defineProperty(page, "scrollTop", { configurable: true, get: () => 0, set: pageScroll });
    Object.defineProperty(document, "scrollingElement", { configurable: true, value: page });
    const first = renderBoard();
    const box = screen.getByRole("region", { name: "HD" });
    const boxScroll = vi.fn();
    box.style.overflowY = "auto";
    Object.defineProperty(box, "scrollHeight", { configurable: true, value: 500 });
    Object.defineProperty(box, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(box, "scrollTop", { configurable: true, get: () => 0, set: boxScroll });
    liftA();
    // Over HD: its region (measured off screen by mockLayout) is past its bottom edge.
    pointer("pointerMove", handle("A"), 10, 250);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(boxScroll.mock.calls[0]?.[0]).toBeGreaterThan(0);
    pointer("pointerMove", handle("A"), 10, window.innerHeight - 4);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(pageScroll.mock.calls[0]?.[0]).toBeGreaterThan(0);
    pointer("pointerUp", handle("A"), 10, window.innerHeight - 4);
    first.unmount();
    pageScroll.mockClear();
    renderBoard({ autoScroll: false });
    liftA();
    pointer("pointerMove", handle("A"), 10, window.innerHeight - 4);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(pageScroll).not.toHaveBeenCalled();
    pointer("pointerUp", handle("A"), 10, window.innerHeight - 4);
    Reflect.deleteProperty(document, "scrollingElement");
  });

  it("restores the body when it unmounts mid-drag", () => {
    const { unmount } = renderBoard();
    liftA();
    expect(document.body.style.userSelect).toBe("none");
    unmount();
    expect(document.body.style.userSelect).toBe("");
    expect(document.body.style.cursor).toBe("");
    pointer("pointerMove", window, 10, 110);
    pointer("pointerUp", window, 10, 110);
  });
});
