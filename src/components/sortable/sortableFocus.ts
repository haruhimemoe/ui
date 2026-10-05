/**
 * @file src/components/sortable/sortableFocus.ts
 * @desc Focus after a sortable move. A FocusKeeper holds one request (the moved item's handle,
 *       or the move button it came from) and applies it after each render until the element is
 *       connected, refocusing it if a later remount drops focus to the body; it falls back to
 *       the destination container when the item is gone, and forgets the request when focus
 *       goes elsewhere or on the next pointerdown. moveButton finds a SortableMoveButtons button
 *       by its data attributes, never by a selector built from an id.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { visible } from "./sortableRegistry.js";

/** Where focus should land after a move. */
export type FocusRequest = {
  id: string;
  container: string;
  /** A move button's direction, or null for the handle. */
  button: -1 | 1 | null;
  /** What was focused last, so a remount that drops focus to the body gets it back. */
  done: HTMLElement | null;
};

/**
 * @function flip
 * @param by {-1 | 1} a direction
 * @returns {-1 | 1} the other one
 */
export const flip = (by: -1 | 1): -1 | 1 => (by === -1 ? 1 : -1);

/**
 * @function moveButton
 * @param id {string} the item's id
 * @param by {-1 | 1} -1 for Up, 1 for Down
 * @returns {HTMLElement | null} that enabled, visible button, or null
 */
export function moveButton(id: string, by: -1 | 1): HTMLElement | null {
  const want = by === -1 ? "up" : "down";
  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-sortable-move]")) {
    if (button.dataset.sortableFor !== id || button.dataset.sortableMove !== want) continue;
    if (!button.disabled) return visible(button);
  }
  return null;
}

/** One pending focus request, applied after renders. */
export class FocusKeeper {
  private request: FocusRequest | null = null;
  private readonly find: (request: FocusRequest) => HTMLElement | null;
  private readonly fallback: (container: string) => HTMLElement | null;

  /**
   * @param find the element a request wants now (null while it isn't rendered)
   * @param fallback the container element to focus when the item is gone
   */
  constructor(
    find: (request: FocusRequest) => HTMLElement | null,
    fallback: (container: string) => HTMLElement | null,
  ) {
    this.find = find;
    this.fallback = fallback;
  }

  /** Asks for focus after the next render; the next pointerdown cancels the request. */
  want(request: FocusRequest): void {
    this.request = request;
    document.removeEventListener("pointerdown", this.forget, true);
    document.addEventListener("pointerdown", this.forget, { capture: true, once: true });
  }

  readonly forget = (): void => {
    this.request = null;
  };

  /** Layout effect: focus the wanted element, or the container when it's gone. */
  apply(): void {
    const request = this.request;
    if (!request) return;
    const active = document.activeElement;
    // The person moved on: stop watching.
    if (request.done && active !== request.done && active !== document.body && active !== null) {
      this.request = null;
      return;
    }
    const element = this.find(request);
    if (!element) {
      if (!request.done) this.fallback(request.container)?.focus({ preventScroll: true });
      this.request = null;
      return;
    }
    if (element !== active) {
      element.focus({ preventScroll: true });
      element.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    }
    request.done = element;
  }

  /** Unmount: drop the request and the listener. */
  dispose(): void {
    this.request = null;
    document.removeEventListener("pointerdown", this.forget, true);
  }
}
