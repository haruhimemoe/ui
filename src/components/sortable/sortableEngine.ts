/**
 * @file src/components/sortable/sortableEngine.ts
 * @desc The state machine behind useSortable, as the hook sees it. The layers under it:
 *       sortableRegistry.ts (what the props getters register), sortableMoves.ts (commit, the
 *       buttons, focus after a move), sortableDrag.ts (lift, step, drop, cancel). This file adds
 *       the layout effect (a vanished lift cancels, focus, pruning, one re-render when the
 *       registry changed), the handle's bindings with its keys, and the Sortable a render
 *       returns. The hook keeps one engine per component and renders from `snapshot`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { SortableDrag } from "./sortableDrag.js";
import type { KeyboardStep } from "./sortableKeyboard.js";
import { containerProps, indicatorOf, itemProps } from "./sortableProps.js";
import type { Sortable, SortableHandleBindings, SortableSnapshot } from "./sortableTypes.js";

export { IDLE } from "./sortableMoves.js";

const STEPS: Readonly<Record<string, KeyboardStep>> = {
  ArrowUp: "previous",
  ArrowLeft: "previous",
  ArrowDown: "next",
  ArrowRight: "next",
  Home: "first",
  End: "last",
  PageUp: "previousContainer",
  PageDown: "nextContainer",
};

/** The registry, the drag in progress and everything it says. */
export class SortableEngine extends SortableDrag {
  private suppressClick = false;

  /** Layout effect: a vanished lift cancels, focus moves, stale entries go, one re-render if the registry changed. */
  afterRender(): void {
    if (this.lift && !this.isLive(this.items.get(this.lift.id))) this.cancel();
    this.focus.apply();
    this.prune();
    if (this.dirty) {
      this.dirty = false;
      this.publish({});
    }
  }

  /** Unmount: stop listening, publish nothing. */
  dispose(): void {
    this.stopLift();
    this.focus.dispose();
  }

  /** What the hook returns for one render. */
  api(snapshot: SortableSnapshot, instructionsId: string): Sortable {
    const indicator = indicatorOf(this, snapshot.target, snapshot.active);
    return {
      container: (id, options) => containerProps(this, id, options, indicator),
      item: (id, options) => itemProps(this, id, options, snapshot.active, indicator),
      handle: (id) => this.handleProps(id, snapshot, instructionsId),
      moveBy: (id, by) => this.moveBy(id, by),
      moveTo: (id, to) => this.moveTo(id, to),
      canMoveBy: (id, by) => this.canMoveBy(id, by),
      state: {
        active: snapshot.active,
        via: snapshot.via,
        target: snapshot.target,
        pending: snapshot.pending,
      },
      layer: {
        announcement: snapshot.announcement,
        instructions: this.text.instructions,
        instructionsId,
        chip: snapshot.chip,
        chipRef: this.chipRef,
      },
    };
  }

  private handleProps(
    id: string,
    snapshot: SortableSnapshot,
    instructionsId: string,
  ): SortableHandleBindings {
    const item = this.items.get(id);
    const off =
      this.options.disabled === true || snapshot.pending || item?.options.draggable === false;
    return {
      ref: this.refFor("handle", id),
      type: "button",
      "aria-label": this.text.handle(this.labelOf(id)),
      "aria-describedby": instructionsId,
      "aria-pressed": snapshot.active === id,
      "aria-disabled": off ? true : undefined,
      "data-lifted": snapshot.active === id ? "" : undefined,
      "data-sortable-handle": id,
      onPointerDown: () => undefined,
      onKeyDown: (event) => this.keyDown(id, event),
      onKeyUp: (event) => this.keyUp(event),
      onClick: (event) => this.click(id, event),
      onBlur: () => this.blur(id),
    };
  }

  private keyDown(id: string, event: ReactKeyboardEvent<HTMLElement>): void {
    const lifted = this.lift?.id === id && this.lift.via === "keyboard";
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.suppressClick = true;
      if (lifted) this.drop();
      else if (this.lift === null) this.start(id, "keyboard");
      return;
    }
    if (!lifted) return;
    if (event.key === "Escape" || event.key === "Tab") {
      // Tab cancels and still moves focus on.
      if (event.key === "Escape") event.preventDefault();
      this.cancel();
      return;
    }
    const step = STEPS[event.key];
    if (step) {
      event.preventDefault();
      this.stepTo(step);
    }
  }

  private keyUp(event: ReactKeyboardEvent<HTMLElement>): void {
    if (event.key !== " " && event.key !== "Enter") return;
    // A browser's keyboard click comes right after keyup; swallow it, then listen again.
    setTimeout(() => {
      this.suppressClick = false;
    }, 0);
  }

  private click(id: string, event: ReactMouseEvent<HTMLElement>): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    // detail 0: Enter or Space delivered as a click (NVDA and JAWS in browse mode). Real clicks do nothing.
    if (event.detail !== 0) return;
    if (this.lift?.id === id) this.drop();
    else if (this.lift === null) this.start(id, "keyboard");
  }

  private blur(id: string): void {
    if (this.lift?.id === id && this.lift.via === "keyboard") this.cancel();
  }
}
