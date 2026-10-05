/**
 * @file src/components/sortable/SortableLayer.tsx
 * @desc One per useSortable, mounted before anything is spoken: the sr-only assertive live
 *       region with the latest announcement (assertive, so each arrow press is heard before the
 *       next), the instructions as a hidden paragraph the handles point at with
 *       aria-describedby, and, during pointer drags only, a fixed aria-hidden chip that follows
 *       the pointer (12px offset, clamped in the viewport) with the item's label and, over a
 *       refused target, the reason. The chip is how a touch user sees what is under their
 *       finger.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { Sortable } from "./sortableTypes.js";

export type SortableLayerProps = { sortable: Sortable };

/**
 * @function SortableLayer
 * @param props {SortableLayerProps} the hook
 * @returns {JSX.Element} the live region, the instructions and the pointer chip
 */
export function SortableLayer({ sortable }: SortableLayerProps) {
  const { announcement, instructions, instructionsId, chip, chipRef } = sortable.layer;
  return (
    <>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <p id={instructionsId} hidden>
        {instructions}
      </p>
      {chip ? (
        <div
          ref={chipRef}
          aria-hidden="true"
          data-sortable-chip=""
          className="pointer-events-none fixed top-0 left-0 z-50 flex max-w-[min(20rem,calc(100vw-2rem))] flex-col rounded-md bg-b2 px-2 py-1 text-sm"
        >
          <span className="truncate text-c1">{chip.label}</span>
          {chip.refusal ? <span className="truncate text-c3">{chip.refusal}</span> : null}
        </div>
      ) : null}
    </>
  );
}
