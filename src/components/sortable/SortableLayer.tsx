/**
 * @file src/components/sortable/SortableLayer.tsx
 * @desc One per useSortable, mounted before anything is spoken: the sr-only assertive live
 *       region with the latest announcement (assertive, so each arrow press is heard before the
 *       next), and the instructions as a hidden paragraph the handles point at with
 *       aria-describedby.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { Sortable } from "./sortableTypes.js";

export type SortableLayerProps = { sortable: Sortable };

/**
 * @function SortableLayer
 * @param props {SortableLayerProps} the hook
 * @returns {JSX.Element} the live region and the instructions
 */
export function SortableLayer({ sortable }: SortableLayerProps) {
  const { announcement, instructions, instructionsId } = sortable.layer;
  return (
    <>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      <p id={instructionsId} hidden>
        {instructions}
      </p>
    </>
  );
}
