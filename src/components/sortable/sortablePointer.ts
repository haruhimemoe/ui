/**
 * @file src/components/sortable/sortablePointer.ts
 * @desc One pointer drag on a sortable handle, any pointer type: pointer capture, a lift past
 *       the threshold, a hit test per move, auto-scroll per frame within 48px of an edge (64px
 *       on coarse pointers), re-measuring after scroll or resize. pointerup drops; pointercancel,
 *       lostpointercapture, Escape and window blur cancel; the click after a drop is swallowed.
 *       While lifted, <body> gets user-select none and a grabbing cursor, restored after.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { edgeScroll, type SortableAxis } from "./sortableMath.js";

/** What a session asks of the engine. */
export type PointerHost = {
  liftPointer(id: string): boolean;
  hoverAt(x: number, y: number): void;
  dropPointer(): void;
  cancelPointer(): void;
  remeasure(): void;
  hovered(): { element: HTMLElement; axis: SortableAxis } | null;
  sessionEnded(): void;
};

export type PointerOptions = { threshold: number; autoScroll: boolean };

const scrollParent = (element: HTMLElement, axis: SortableAxis): HTMLElement | null => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const overflow = axis === "horizontal" ? style.overflowX : style.overflowY;
    const room =
      axis === "horizontal"
        ? node.scrollWidth > node.clientWidth
        : node.scrollHeight > node.clientHeight;
    if (room && /auto|scroll/.test(overflow)) return node;
  }
  return null;
};

const nudge = (box: Element, axis: SortableAxis, by: number): void => {
  if (axis === "horizontal") box.scrollLeft += by;
  else box.scrollTop += by;
};

/**
 * @function startPointerSession
 * @param host {PointerHost} the engine
 * @param id {string} the item whose handle was pressed
 * @param down {PointerEvent} the pointerdown
 * @param handle {HTMLElement} the handle, which takes pointer capture
 * @param options {PointerOptions} the lift threshold and whether to auto-scroll
 * @returns {() => void} ends the session (idempotent): listeners off, body restored, capture released
 */
export function startPointerSession(
  host: PointerHost,
  id: string,
  down: PointerEvent,
  handle: HTMLElement,
  options: PointerOptions,
): () => void {
  const pointerId = down.pointerId;
  const origin = { x: down.clientX, y: down.clientY };
  let last = origin;
  let lifted = false;
  let ended = false;
  let frame = 0;
  const body = document.body.style;
  const saved = { userSelect: body.userSelect, cursor: body.cursor };
  const zone = window.matchMedia?.("(pointer: coarse)").matches ? 64 : 48; // the edge zone, px
  try {
    handle.setPointerCapture?.(pointerId);
  } catch {
    // The pointer is already gone; window listeners still see its events.
  }

  const autoScroll = (): void => {
    const hovered = host.hovered();
    const axis = hovered?.axis ?? "vertical";
    const at = axis === "horizontal" ? last.x : last.y;
    const box = hovered ? scrollParent(hovered.element, axis) : null;
    if (box) {
      const rect = box.getBoundingClientRect();
      const by =
        axis === "horizontal"
          ? edgeScroll(at, rect.left, rect.right, zone)
          : edgeScroll(at, rect.top, rect.bottom, zone);
      if (by !== 0) nudge(box, axis, by);
    }
    const page = document.scrollingElement;
    const by = edgeScroll(
      at,
      0,
      axis === "horizontal" ? window.innerWidth : window.innerHeight,
      zone,
    );
    if (page && by !== 0) nudge(page, axis, by);
  };

  const tick = (): void => {
    frame = 0;
    if (ended || !lifted) return;
    if (options.autoScroll) autoScroll();
    frame = requestAnimationFrame(tick);
  };

  const swallowClick = (): void => {
    const swallow = (event: MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener("click", swallow, true), 0);
  };

  const move = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    last = { x: event.clientX, y: event.clientY };
    if (!lifted) {
      if (Math.hypot(last.x - origin.x, last.y - origin.y) < options.threshold) return;
      if (!host.liftPointer(id)) {
        end();
        return;
      }
      lifted = true;
      body.userSelect = "none";
      body.cursor = "grabbing";
      frame = requestAnimationFrame(tick);
    }
    host.hoverAt(last.x, last.y);
  };

  const up = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    if (lifted) {
      host.hoverAt(event.clientX, event.clientY);
      host.dropPointer();
      swallowClick();
    }
    end();
  };

  const cancel = (): void => {
    if (lifted) host.cancelPointer();
    end();
  };

  const cancelFor = (event: PointerEvent): void => {
    if (event.pointerId === pointerId) cancel();
  };

  const onEscape = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !lifted) return;
    event.preventDefault();
    event.stopPropagation();
    cancel();
  };

  const rescan = (): void => {
    if (lifted) host.remeasure();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancelFor);
  handle.addEventListener("lostpointercapture", cancelFor);
  window.addEventListener("keydown", onEscape, true);
  window.addEventListener("blur", cancel);
  window.addEventListener("scroll", rescan, true);
  window.addEventListener("resize", rescan);

  function end(): void {
    if (ended) return;
    ended = true;
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancelFor);
    handle.removeEventListener("lostpointercapture", cancelFor);
    window.removeEventListener("keydown", onEscape, true);
    window.removeEventListener("blur", cancel);
    window.removeEventListener("scroll", rescan, true);
    window.removeEventListener("resize", rescan);
    body.userSelect = saved.userSelect;
    body.cursor = saved.cursor;
    try {
      if (handle.hasPointerCapture?.(pointerId)) handle.releasePointerCapture(pointerId);
    } catch {
      // Already released.
    }
    host.sessionEnded();
  }

  return end;
}
