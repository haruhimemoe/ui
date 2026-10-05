/**
 * @file src/components/sortable/sortableDrag.ts
 * @desc The drag half of useSortable's state machine: lifting an item (rects measured once, a
 *       keyboard lift in a "between" list starts at its own place), keyboard steps through
 *       keyboardTargets with the over announcement and the indicator scrolled into view, drop
 *       (a refused keyboard target stays lifted and says why), cancel, and the pointer chip's
 *       position (12px from the pointer, clamped in the viewport).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { SortableAnnouncementInfo } from "./announcements.js";
import { type KeyboardStep, keyboardStep, keyboardTargets } from "./sortableKeyboard.js";
import type { SortableTarget } from "./sortableMath.js";
import { type Lift, SortableMoves } from "./sortableMoves.js";
import { indicatorOf } from "./sortableProps.js";
import type { SortableMove, SortableSnapshot, SortableTargetState } from "./sortableTypes.js";

/** Lifting, stepping, dropping and cancelling. */
export class SortableDrag extends SortableMoves {
  /** The pointer, for the chip. */
  protected point = { x: 0, y: 0 };
  private chip: HTMLElement | null = null;

  protected canLift(id: string): boolean {
    const item = this.items.get(id);
    return (
      item !== undefined &&
      item.options.draggable !== false &&
      this.options.disabled !== true &&
      !this.snapshot.pending &&
      this.lift === null
    );
  }

  protected start(id: string, via: "pointer" | "keyboard"): boolean {
    const item = this.items.get(id);
    if (!item || !this.canLift(id)) return false;
    const { container, index, label } = item.options;
    const lift: Lift = { id, via, label, from: { container, index }, measured: this.measure() };
    this.lift = lift;
    this.focus.forget();
    const own = via === "keyboard" && this.modeOf(container) === "between";
    const target = own ? this.targetState({ ...lift.from, onto: null }, lift) : null;
    if (via === "keyboard") window.addEventListener("blur", this.onWindowBlur);
    this.publish({
      active: id,
      via,
      target,
      announcement: this.text.lifted(this.info(lift.from, label)),
      chip: via === "pointer" ? { label, refusal: null } : null,
    });
    return true;
  }

  protected targetState(target: SortableTarget, lift: Lift): SortableTargetState {
    const move: SortableMove = {
      id: lift.id,
      from: lift.from,
      to: { container: target.container, index: target.index },
      onto: target.onto,
      via: lift.via,
    };
    return { ...move, refusal: this.refusalOf(move) };
  }

  private overInfo(state: SortableTargetState, lift: Lift): SortableAnnouncementInfo {
    const onto =
      this.modeOf(state.to.container) === "onto"
        ? { target: state.onto === null ? null : this.labelOf(state.onto) }
        : {};
    const reason = state.refusal ? { reason: state.refusal } : {};
    const joining = state.to.container !== lift.from.container;
    return this.info(state.to, lift.label, { ...onto, ...reason }, joining);
  }

  protected stepTo(step: KeyboardStep): void {
    const lift = this.lift;
    if (!lift) return;
    const now = this.snapshot.target;
    const current = now ? { ...now.to, onto: now.onto } : null;
    const next = keyboardStep(keyboardTargets(lift.measured, lift.id), current, lift.from, step);
    if (!next) return;
    const state = this.targetState(next, lift);
    this.publish({ target: state, announcement: this.text.over(this.overInfo(state, lift)) });
    const indicator = indicatorOf(this, state, lift.id);
    const element =
      indicator?.kind === "item"
        ? this.items.get(indicator.id)?.element
        : this.containers.get(state.to.container)?.element;
    element?.scrollIntoView?.({
      block: "nearest",
      inline: "nearest",
      behavior: this.motion ? "smooth" : "auto",
    });
  }

  protected drop(): void {
    const lift = this.lift;
    if (!lift) return;
    const target = this.snapshot.target;
    if (target === null) {
      this.cancel();
      return;
    }
    if (target.refusal !== null) {
      const reason = target.refusal ? { reason: target.refusal } : {};
      const announcement = this.text.refused(this.info(lift.from, lift.label, reason));
      if (lift.via === "keyboard") this.publish({ announcement });
      else this.end({ announcement });
      return;
    }
    this.end({});
    const { id, from, to, onto, via } = target;
    this.commit({ id, from, to, onto, via }, null);
  }

  protected cancel(): void {
    const lift = this.lift;
    if (!lift) return;
    this.end({ announcement: this.text.cancelled(this.info(lift.from, lift.label)) });
  }

  private end(patch: Partial<SortableSnapshot>): void {
    this.stopLift();
    this.publish({ active: null, via: null, target: null, chip: null, ...patch });
  }

  protected stopLift(): void {
    this.lift = null;
    window.removeEventListener("blur", this.onWindowBlur);
  }

  private readonly onWindowBlur = (): void => {
    if (this.lift?.via === "keyboard") this.cancel();
  };

  // The pointer chip (SortableLayer renders it; pointer drags move it)

  readonly chipRef = (element: HTMLElement | null): void => {
    this.chip = element;
    this.placeChip();
  };

  protected placeChip(): void {
    const chip = this.chip;
    if (!chip) return;
    const x = Math.max(8, Math.min(this.point.x + 12, window.innerWidth - chip.offsetWidth - 8));
    const y = Math.max(8, Math.min(this.point.y + 12, window.innerHeight - chip.offsetHeight - 8));
    chip.style.transform = `translate(${x}px, ${y}px)`;
  }
}
