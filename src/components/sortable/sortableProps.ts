/**
 * @file src/components/sortable/sortableProps.ts
 * @desc What container() and item() return. indicatorOf works out which element shows the drop
 *       indicator for the current target: in a "between" container the item after the
 *       insertion point (a line before it), else the last item (a line after it), else the
 *       container itself; in an "onto" container the item under it or the container. The props
 *       getters register the container or item and carry the matching data attributes.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { SortableRegistry } from "./sortableRegistry.js";
import type {
  SortableContainerOptions,
  SortableContainerProps,
  SortableItemOptions,
  SortableItemProps,
  SortableTargetState,
} from "./sortableTypes.js";

/** The element that shows where a drop lands. */
export type Indicator =
  | { kind: "container"; id: string; refused: boolean }
  | {
      kind: "item";
      id: string;
      drop: "before" | "after" | "onto";
      line: "top" | "bottom" | "left" | "right" | undefined;
      refused: boolean;
    };

/**
 * @function indicatorOf
 * @param registry {SortableRegistry} the hook's registry
 * @param target {SortableTargetState | null} the current target
 * @param active {string | null} the lifted item's id
 * @returns {Indicator | null} the element to mark, or null with no drag or no target
 */
export function indicatorOf(
  registry: SortableRegistry,
  target: SortableTargetState | null,
  active: string | null,
): Indicator | null {
  if (!target || !active) return null;
  const refused = target.refusal !== null;
  const container = registry.containers.get(target.to.container);
  if (!container) return null;
  if ((container.options.mode ?? "between") === "onto") {
    return target.onto === null
      ? { kind: "container", id: target.to.container, refused }
      : { kind: "item", id: target.onto, drop: "onto", line: undefined, refused };
  }
  const others = registry.itemsIn(target.to.container).filter(([id]) => id !== active);
  const horizontal = container.options.axis === "horizontal";
  const next = others[target.to.index];
  if (next) {
    return {
      kind: "item",
      id: next[0],
      drop: "before",
      line: horizontal ? "left" : "top",
      refused,
    };
  }
  const last = others.at(-1);
  if (last) {
    return {
      kind: "item",
      id: last[0],
      drop: "after",
      line: horizontal ? "right" : "bottom",
      refused,
    };
  }
  return { kind: "container", id: target.to.container, refused };
}

/**
 * @function containerProps
 * @param registry {SortableRegistry} the hook's registry
 * @param id {string} the container's id
 * @param options {SortableContainerOptions} its label, mode, axis and disabled flag
 * @param indicator {Indicator | null} from indicatorOf
 * @returns {SortableContainerProps} the ref, the focus fallback tabIndex and the data attributes
 */
export function containerProps(
  registry: SortableRegistry,
  id: string,
  options: SortableContainerOptions,
  indicator: Indicator | null,
): SortableContainerProps {
  registry.register(registry.containers, id, options, () => false);
  const here = indicator?.kind === "container" && indicator.id === id;
  return {
    ref: registry.refFor("container", id),
    tabIndex: -1,
    "data-sortable-container": id,
    "data-sortable-drop": here ? "inside" : undefined,
    "data-sortable-refused": here && indicator.refused ? "" : undefined,
  };
}

/**
 * @function itemProps
 * @param registry {SortableRegistry} the hook's registry
 * @param id {string} the item's id
 * @param options {SortableItemOptions} its container, index, label and draggable flag
 * @param active {string | null} the lifted item's id
 * @param indicator {Indicator | null} from indicatorOf
 * @returns {SortableItemProps} the ref and the data attributes
 */
export function itemProps(
  registry: SortableRegistry,
  id: string,
  options: SortableItemOptions,
  active: string | null,
  indicator: Indicator | null,
): SortableItemProps {
  registry.register(
    registry.items,
    id,
    options,
    (was) => was.container !== options.container || was.index !== options.index,
  );
  const here = indicator?.kind === "item" && indicator.id === id ? indicator : null;
  return {
    ref: registry.refFor("item", id),
    "data-sortable-item": id,
    "data-sortable-state": active === id ? "lifted" : undefined,
    "data-sortable-drop": here?.drop,
    "data-sortable-line": here?.line,
    "data-sortable-refused": here?.refused ? "" : undefined,
  };
}
