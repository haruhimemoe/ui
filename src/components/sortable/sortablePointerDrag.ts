/**
 * @file src/components/sortable/sortablePointerDrag.ts
 * @desc The pointer half of useSortable's drag: a primary-button pointerdown on a handle starts
 *       one sortablePointer.ts session, and the session calls back here to lift, hit-test each
 *       move with targetAt against the rects measured at lift (re-measured after a scroll or
 *       resize), drop, cancel and find the hovered list for auto-scroll. The chip follows the
 *       pointer and shows a refusal; the body cursor turns not-allowed over a refused target.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { SortableDrag } from "./sortableDrag.js";
import { type SortableAxis, targetAt } from "./sortableMath.js";
import { type PointerHost, startPointerSession } from "./sortablePointer.js";
import { visible } from "./sortableRegistry.js";

/** Lifting, stepping and dropping, plus pointer sessions. */
export class SortablePointerDrag extends SortableDrag implements PointerHost {
  private stopPointer: (() => void) | null = null;

  protected pointerDown(id: string, event: ReactPointerEvent<HTMLElement>): void {
    if (!event.isPrimary || event.button !== 0) return;
    if (this.stopPointer !== null || !this.canLift(id)) return;
    this.stopPointer = startPointerSession(this, id, event.nativeEvent, event.currentTarget, {
      threshold: this.options.threshold ?? 4,
      autoScroll: this.options.autoScroll ?? true,
    });
  }

  protected override stopLift(): void {
    super.stopLift();
    const stop = this.stopPointer;
    this.stopPointer = null;
    stop?.();
  }

  liftPointer(id: string): boolean {
    return this.start(id, "pointer");
  }

  hoverAt(x: number, y: number): void {
    const lift = this.lift;
    if (!lift) return;
    this.point = { x, y };
    this.placeChip();
    const found = targetAt(this.point, lift.measured, lift.id);
    const state = found ? this.targetState(found, lift) : null;
    const refused = state !== null && state.refusal !== null;
    document.body.style.cursor = refused ? "not-allowed" : "grabbing";
    const now = this.snapshot.target;
    const same =
      state === now ||
      (state !== null &&
        now !== null &&
        state.to.container === now.to.container &&
        state.to.index === now.to.index &&
        state.onto === now.onto &&
        state.refusal === now.refusal);
    if (same) return;
    this.publish({ target: state, chip: { label: lift.label, refusal: state?.refusal || null } });
  }

  dropPointer(): void {
    this.drop();
  }

  cancelPointer(): void {
    this.cancel();
  }

  remeasure(): void {
    const lift = this.lift;
    if (lift?.via !== "pointer") return;
    lift.measured = this.measure();
    this.hoverAt(this.point.x, this.point.y);
  }

  hovered(): { element: HTMLElement; axis: SortableAxis } | null {
    const id = this.snapshot.target?.to.container;
    if (id === undefined) return null;
    const entry = this.containers.get(id);
    const element = visible(entry?.element);
    return element ? { element, axis: entry?.options.axis ?? "vertical" } : null;
  }

  sessionEnded(): void {
    this.stopPointer = null;
  }
}
