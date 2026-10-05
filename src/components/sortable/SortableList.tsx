/**
 * @file src/components/sortable/SortableList.tsx
 * @desc One sortable container and its rows on useSortable: an ol (or ul) with
 *       SORTABLE_CONTAINER and one li per item with SORTABLE_ITEM, each row handed a ready
 *       handle and Up and Down buttons to place where its layout wants them. On its own it makes
 *       its own hook and renders its own SortableLayer; with `sortable` it joins a shared hook
 *       (several lists, one layer). Every row is registered before any renders, so each row's
 *       Down button knows how many follow it. It takes a render function, so only client
 *       components render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { type ComponentProps, type ReactElement, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import type { SortableAnnouncements } from "./announcements.js";
import { SortableHandle } from "./SortableHandle.js";
import { SortableLayer } from "./SortableLayer.js";
import { SortableMoveButtons } from "./SortableMoveButtons.js";
import { SORTABLE_CONTAINER, SORTABLE_ITEM } from "./sortableStyles.js";
import type { Sortable, UseSortableOptions } from "./sortableTypes.js";
import { useSortable } from "./useSortable.js";

/** What each row's render function gets besides its item. */
export type SortableRowContext = {
  index: number;
  handle: ReactElement;
  moveButtons: ReactElement | null;
  lifted: boolean;
};

export type SortableListProps<T> = Omit<ComponentProps<"ol">, "children" | "onChange" | "ref"> & {
  items: readonly T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  /** Container label for announcements. */
  label: string;
  /** Join a shared hook (multi-container). Omitted: the list makes its own and renders its own SortableLayer. */
  sortable?: Sortable | undefined;
  /** Container id; default useId(). */
  id?: string | undefined;
  /** Required without `sortable`. */
  onMove?: UseSortableOptions["onMove"] | undefined;
  canDrop?: UseSortableOptions["canDrop"];
  announcements?: Partial<SortableAnnouncements> | undefined;
  disabled?: boolean | undefined;
  mode?: "between" | "onto" | undefined;
  axis?: "vertical" | "horizontal" | undefined;
  /** Default "ol". */
  as?: "ol" | "ul" | undefined;
  /** Default true. */
  moveButtons?: boolean | undefined;
  itemClassName?: string | undefined;
  /** Per-row li props (a name, a selected border, a focus handler). The sortable attributes win. */
  itemProps?:
    | ((item: T, index: number) => Omit<ComponentProps<"li">, "children" | "ref">)
    | undefined;
  children: (item: T, ctx: SortableRowContext) => ReactNode;
};

const refuse = (): false => false;

/**
 * @function SortableList
 * @param props {SortableListProps<T>} the items, how to name them, the move handler or a shared
 *        hook, and a render function per row
 * @returns {JSX.Element} the list (and its SortableLayer when it owns its hook)
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  label,
  sortable: shared,
  id,
  onMove,
  canDrop,
  announcements,
  disabled,
  mode = "between",
  axis = "vertical",
  as = "ol",
  moveButtons = true,
  itemClassName,
  itemProps,
  children: renderRow,
  className,
  ...rest
}: SortableListProps<T>) {
  const ownId = useId();
  const own = useSortable({
    onMove: onMove ?? refuse,
    canDrop,
    announcements,
    disabled: shared ? undefined : disabled,
  });
  const sortable = shared ?? own;
  const containerId = id ?? ownId;
  const listProps = {
    ...rest,
    ...sortable.container(containerId, {
      label,
      mode,
      axis,
      disabled: shared ? disabled : undefined,
    }),
    className: cx(
      SORTABLE_CONTAINER,
      axis === "horizontal" ? "flex flex-row flex-wrap" : "flex flex-col",
      className,
    ),
  };
  const rows = items.map((item, index) => {
    const itemId = getId(item);
    const itemLabel = getLabel(item);
    const bound = sortable.item(itemId, { container: containerId, index, label: itemLabel });
    return { item, index, itemId, itemLabel, bound };
  });
  const rendered = rows.map(({ item, index, itemId, itemLabel, bound }) => {
    const extra = itemProps?.(item, index) ?? {};
    return (
      <li
        key={itemId}
        {...extra}
        {...bound}
        className={cx(SORTABLE_ITEM, itemClassName, extra.className)}
      >
        {renderRow(item, {
          index,
          handle: <SortableHandle sortable={sortable} id={itemId} />,
          moveButtons: moveButtons ? (
            <SortableMoveButtons sortable={sortable} id={itemId} label={itemLabel} />
          ) : null,
          lifted: sortable.state.active === itemId,
        })}
      </li>
    );
  });
  return (
    <>
      {shared ? null : <SortableLayer sortable={own} />}
      {as === "ul" ? <ul {...listProps}>{rendered}</ul> : <ol {...listProps}>{rendered}</ol>}
    </>
  );
}
