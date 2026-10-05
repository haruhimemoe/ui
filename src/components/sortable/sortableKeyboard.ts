/**
 * @file src/components/sortable/sortableKeyboard.ts
 * @desc The sortable lists' keyboard math. keyboardTargets gives the keyboard one flat list of
 *       targets across containers in DOM order (every insertion index of a "between" container,
 *       each other item and then the container itself for an "onto" one); keyboardStep walks it
 *       for the arrows, Home and End, PageUp and PageDown, without wrapping. No DOM and no
 *       React: server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { SortableMode, SortableTarget } from "./sortableMath.js";

/** What the keyboard needs from a container: no rects. */
export type KeyboardContainer = {
  id: string;
  mode: SortableMode;
  items: readonly { id: string; index: number }[];
};

/** One keyboard step: arrows, Home and End, PageUp and PageDown. */
export type KeyboardStep =
  | "previous"
  | "next"
  | "first"
  | "last"
  | "previousContainer"
  | "nextContainer";

/**
 * @function keyboardTargets
 * @param containers {readonly KeyboardContainer[]} the droppable containers, in DOM order
 * @param lifted {string} the lifted item's id
 * @returns {SortableTarget[]} one flat list: every insertion index of a "between" container
 *          (its current place included), each other item and then the container itself for an
 *          "onto" container
 */
export function keyboardTargets(
  containers: readonly KeyboardContainer[],
  lifted: string,
): SortableTarget[] {
  return containers.flatMap((container) => {
    const others = container.items.filter((item) => item.id !== lifted);
    if (container.mode === "onto") {
      return [
        ...others.map((item) => ({ container: container.id, index: item.index, onto: item.id })),
        { container: container.id, index: container.items.length, onto: null },
      ];
    }
    return Array.from({ length: others.length + 1 }, (_, index) => ({
      container: container.id,
      index,
      onto: null,
    }));
  });
}

const sameTarget = (a: SortableTarget, b: SortableTarget): boolean =>
  a.container === b.container && a.index === b.index && a.onto === b.onto;

/**
 * @function keyboardStep
 * @param targets {readonly SortableTarget[]} from keyboardTargets
 * @param current {SortableTarget | null} the target now, or null (an "onto" lift before any step)
 * @param from {{ container: string; index: number }} where the lifted item is
 * @param step {KeyboardStep} the key's step
 * @returns {SortableTarget | null} the next target; the same one at an end (no wrapping)
 */
export function keyboardStep(
  targets: readonly SortableTarget[],
  current: SortableTarget | null,
  from: { container: string; index: number },
  step: KeyboardStep,
): SortableTarget | null {
  if (targets.length === 0) return current;
  const at = current ? targets.findIndex((target) => sameTarget(target, current)) : -1;
  // No target yet: stand just before the first target after the lifted item.
  const after = targets.findIndex((t) => t.container === from.container && t.index > from.index);
  const anchor = after === -1 ? 0 : after;
  const container = current?.container ?? from.container;
  const firstOf = (id: string) => targets.findIndex((target) => target.container === id);
  const pick = (index: number) => targets[index] ?? current;
  switch (step) {
    case "next":
      return pick(at === -1 ? anchor : Math.min(at + 1, targets.length - 1));
    case "previous":
      return pick(at === -1 ? Math.max(anchor - 1, 0) : Math.max(at - 1, 0));
    case "first":
      return pick(firstOf(container));
    case "last":
      return pick(targets.findLastIndex((target) => target.container === container));
    default: {
      const ids = [...new Set(targets.map((target) => target.container))];
      const i = ids.indexOf(container);
      const next =
        step === "nextContainer" ? ids[Math.min(i + 1, ids.length - 1)] : ids[Math.max(i - 1, 0)];
      return next === undefined ? current : pick(firstOf(next));
    }
  }
}
