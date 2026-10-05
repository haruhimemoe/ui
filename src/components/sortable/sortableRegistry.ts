/**
 * @file src/components/sortable/sortableRegistry.ts
 * @desc The registry under useSortable: the containers, items and handles the props getters
 *       register during render (callback refs hold their elements), which of them are live,
 *       each container's items by index, and the rects measured at lift. Entries neither mounted
 *       nor rendered in the latest render are pruned after it. `dirty` asks the hook for one
 *       more render when the registry changed.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { MeasuredContainer, SortableMode } from "./sortableMath.js";
import type { SortableContainerOptions, SortableItemOptions } from "./sortableTypes.js";

/** One registered container or item: its latest options, its element, the render it was in. */
export type Entry<T> = { options: T; element: HTMLElement | null; generation: number };

/** An item's id and entry. */
export type ItemEntry = [string, Entry<SortableItemOptions>];

/**
 * @function visible
 * @param element {HTMLElement | null | undefined} an element
 * @returns {HTMLElement | null} the element when it is in the page and not inside `[hidden]`
 */
export const visible = (element: HTMLElement | null | undefined): HTMLElement | null =>
  element?.isConnected && element.closest("[hidden]") === null ? element : null;

/** Containers, items and handles by id. */
export class SortableRegistry {
  readonly containers = new Map<string, Entry<SortableContainerOptions>>();
  readonly items = new Map<string, Entry<SortableItemOptions>>();
  readonly handles = new Map<string, HTMLElement>();
  private readonly refs = new Map<string, (element: HTMLElement | null) => void>();
  private generation = 0;
  /** Something registered, moved or mounted since the last layout effect. */
  protected dirty = false;

  /** A new host render: registrations from here on are this generation's. */
  beginRender(): void {
    this.generation += 1;
  }

  /** Mounted (connected), or rendered in the latest render and not mounted yet. */
  isLive(entry: Entry<unknown> | undefined): boolean {
    if (!entry) return false;
    return entry.element ? entry.element.isConnected : entry.generation === this.generation;
  }

  /** Records `options` for `id`; new entries and `moved` ones mark the registry dirty. */
  register<T>(
    map: Map<string, Entry<T>>,
    id: string,
    options: T,
    moved: (was: T) => boolean,
  ): void {
    const entry = map.get(id);
    if (!entry) {
      map.set(id, { options, element: null, generation: this.generation });
      this.dirty = true;
      return;
    }
    if (moved(entry.options)) this.dirty = true;
    entry.options = options;
    entry.generation = this.generation;
  }

  /** One stable callback ref per container, item or handle id. */
  refFor(kind: "container" | "item" | "handle", id: string): (element: HTMLElement | null) => void {
    const key = `${kind}:${id}`;
    const known = this.refs.get(key);
    if (known) return known;
    const ref = (element: HTMLElement | null): void => {
      if (kind === "handle") {
        if (element) this.handles.set(id, element);
        else this.handles.delete(id);
        return;
      }
      const entry = kind === "container" ? this.containers.get(id) : this.items.get(id);
      if (entry) {
        entry.element = element;
        this.dirty = true;
      }
    };
    this.refs.set(key, ref);
    return ref;
  }

  /** Drops entries that are neither mounted nor rendered this generation, with their refs. */
  protected prune(): void {
    for (const [kind, map] of [
      ["container", this.containers],
      ["item", this.items],
    ] as const) {
      for (const [id, entry] of map) {
        if (entry.element || entry.generation === this.generation) continue;
        map.delete(id);
        this.refs.delete(`${kind}:${id}`);
      }
    }
  }

  /** A container's live items, by index. */
  itemsIn(container: string): ItemEntry[] {
    return [...this.items]
      .filter(([, entry]) => entry.options.container === container && this.isLive(entry))
      .sort(([, a], [, b]) => a.options.index - b.options.index);
  }

  modeOf(container: string): SortableMode {
    return this.containers.get(container)?.options.mode ?? "between";
  }

  labelOf(id: string): string {
    return this.items.get(id)?.options.label ?? id;
  }

  /** More than one live container: announcements name the container. */
  hasSeveral(): boolean {
    return [...this.containers.values()].filter((entry) => this.isLive(entry)).length > 1;
  }

  /** The droppable containers in DOM order, with their visible items, measured now. */
  measure(): MeasuredContainer[] {
    const shown = [...this.containers].flatMap(([id, entry]) => {
      const element = this.isLive(entry) ? visible(entry.element) : null;
      return element && entry.options.disabled !== true ? [{ id, entry, element }] : [];
    });
    shown.sort((a, b) =>
      a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );
    return shown.map(({ id, entry, element }) => ({
      id,
      mode: entry.options.mode ?? "between",
      axis: entry.options.axis ?? "vertical",
      rect: element.getBoundingClientRect(),
      depth: shown.filter((other) => other.element !== element && other.element.contains(element))
        .length,
      items: this.itemsIn(id).flatMap(([itemId, item]) => {
        const box = visible(item.element);
        return box
          ? [{ id: itemId, index: item.options.index, rect: box.getBoundingClientRect() }]
          : [];
      }),
    }));
  }
}
