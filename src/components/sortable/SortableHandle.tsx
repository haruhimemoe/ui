/**
 * @file src/components/sortable/SortableHandle.tsx
 * @desc The grip that lifts a sortable item: a native button with a six-dot grip, named
 *       "Reorder {label}", described by the instructions, a toggle while lifted. A 24px target,
 *       44px on coarse pointers; touch-action none so a finger on the handle drags while the
 *       rest of the row still scrolls. No directive, but it takes a Sortable, so only client
 *       components render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import type { Sortable } from "./sortableTypes.js";

/** Native button props (the handle's own bindings win), the hook and the item's id. */
export type SortableHandleProps = Omit<ComponentProps<"button">, "children"> & {
  sortable: Sortable;
  id: string;
};

const HANDLE =
  "inline-flex size-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded text-c3 hover:text-c1 active:cursor-grabbing aria-disabled:cursor-not-allowed coarse:size-11 data-[lifted]:bg-h2 data-[lifted]:text-c1";

const DOTS = [
  [6, 3],
  [10, 3],
  [6, 8],
  [10, 8],
  [6, 13],
  [10, 13],
] as const;

/**
 * @function SortableHandle
 * @param props {SortableHandleProps} the hook, the item's id and native button props
 * @returns {JSX.Element} the grip button
 */
export function SortableHandle({ sortable, id, className, ...props }: SortableHandleProps) {
  return (
    <button {...props} {...sortable.handle(id)} type="button" className={cx(HANDLE, className)}>
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.5} />
        ))}
      </svg>
    </button>
  );
}
