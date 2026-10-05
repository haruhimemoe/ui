/**
 * @file src/components/sortable/sortableMath.ts
 * @desc The sortable lists' pure math. targetAt finds where a pointer would drop from rects
 *       measured at lift (the deepest container under it, then an insertion index by item
 *       midpoints, or the item under it in an "onto" container). scrollSpeed and edgeScroll are
 *       the auto-scroll ramp; moveItem applies a "between" move to an array. The keyboard's
 *       targets are in sortableKeyboard.ts. No DOM and no React: server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** A measured box in viewport pixels. A DOMRect fits. */
export type SortableRect = { top: number; right: number; bottom: number; left: number };

/** Which way a container's items run. */
export type SortableAxis = "vertical" | "horizontal";

/** "between": insert between items. "onto": drop on an item or on the container itself. */
export type SortableMode = "between" | "onto";

/** One item as measured at lift. */
export type MeasuredItem = { id: string; index: number; rect: SortableRect };

/** One container as measured at lift: its items by index, and how deep it is nested. */
export type MeasuredContainer = {
  id: string;
  mode: SortableMode;
  axis: SortableAxis;
  rect: SortableRect;
  depth: number;
  items: readonly MeasuredItem[];
};

/** Where a lifted item would land. `index` and `onto` mean what SortableMove's `to` and `onto` mean. */
export type SortableTarget = { container: string; index: number; onto: string | null };

/** Auto-scroll's top speed, in CSS pixels per frame. */
export const SCROLL_MAX = 16;

const holds = (rect: SortableRect, x: number, y: number): boolean =>
  x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

const middle = (rect: SortableRect, axis: SortableAxis): number =>
  axis === "horizontal" ? (rect.left + rect.right) / 2 : (rect.top + rect.bottom) / 2;

/**
 * @function targetAt
 * @param point {{ x: number; y: number }} the pointer, in viewport pixels
 * @param containers {readonly MeasuredContainer[]} the droppable containers, in DOM order
 * @param lifted {string} the lifted item's id (never a target, never counted)
 * @returns {SortableTarget | null} the place under the point in the deepest container that holds
 *          it, or null outside every container
 */
export function targetAt(
  point: { x: number; y: number },
  containers: readonly MeasuredContainer[],
  lifted: string,
): SortableTarget | null {
  let found: MeasuredContainer | null = null;
  for (const container of containers) {
    if (!holds(container.rect, point.x, point.y)) continue;
    if (found === null || container.depth >= found.depth) found = container;
  }
  if (found === null) return null;
  const best = found;
  const others = best.items.filter((item) => item.id !== lifted);
  if (best.mode === "onto") {
    const under = others.find((item) => holds(item.rect, point.x, point.y));
    return under
      ? { container: best.id, index: under.index, onto: under.id }
      : { container: best.id, index: best.items.length, onto: null };
  }
  const along = best.axis === "horizontal" ? point.x : point.y;
  const index = others.filter((item) => middle(item.rect, best.axis) < along).length;
  return { container: best.id, index, onto: null };
}

/**
 * @function isNoopMove
 * @param mode {SortableMode} the destination container's mode
 * @param from {{ container: string; index: number }} where the item is
 * @param to {{ container: string; index: number }} where it would go
 * @returns {boolean} true for a "between" move back to its own place, which changes nothing
 */
export function isNoopMove(
  mode: SortableMode,
  from: { container: string; index: number },
  to: { container: string; index: number },
): boolean {
  return mode === "between" && from.container === to.container && from.index === to.index;
}

/**
 * @function scrollSpeed
 * @param distance {number} pointer distance from the edge, in px (0 or less: at or past it)
 * @param zone {number} how far from the edge scrolling starts (48, 64 on coarse pointers)
 * @returns {number} px per frame: 0 outside the zone, a quadratic ramp to SCROLL_MAX at the edge
 */
export function scrollSpeed(distance: number, zone: number): number {
  if (zone <= 0 || distance >= zone) return 0;
  const depth = Math.min(1, (zone - Math.max(distance, 0)) / zone);
  return Math.max(1, Math.round(SCROLL_MAX * depth * depth));
}

/**
 * @function edgeScroll
 * @param position {number} the pointer along the axis
 * @param start {number} the box's top (or left) edge
 * @param end {number} the box's bottom (or right) edge
 * @param zone {number} the edge zone in px
 * @returns {number} negative near the start edge, positive near the end edge, else 0
 */
export function edgeScroll(position: number, start: number, end: number, zone: number): number {
  if (position - start < zone) return -scrollSpeed(position - start, zone);
  if (end - position < zone) return scrollSpeed(end - position, zone);
  return 0;
}

/**
 * @function moveItem
 * @param list {readonly T[]} the list
 * @param from {number} the item's index
 * @param to {number} its index after the move (clamped into the list)
 * @returns {T[]} a new array with the item moved; a copy when `from` is out of range
 */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (from < 0 || from >= next.length) return next;
  const [item] = next.splice(from, 1) as [T];
  next.splice(Math.max(0, Math.min(to, next.length)), 0, item);
  return next;
}
