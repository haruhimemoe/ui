/**
 * @file playground/components/SortableDemo.tsx
 * @desc /sortable: a single SortableList with its own hook, and a two-container board on
 *       useSortable where NM1 refuses to move to HD, for trying by hand and for play:axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import {
  moveItem,
  SORTABLE_CONTAINER,
  SORTABLE_ITEM,
  SortableHandle,
  SortableLayer,
  SortableList,
  SortableMoveButtons,
  useSortable,
} from "@haruhimemoe/ui";
import { useState } from "react";

const NAMES = { nm: "NM", hd: "HD" } as const;
type Key = keyof typeof NAMES;

/** Applies a "between" move: `to.index` is already the index after the item leaves its list. */
const applyMove = (
  was: Record<string, string[]>,
  id: string,
  to: { container: string; index: number },
) => {
  const without = Object.fromEntries(
    Object.entries(was).map(([key, ids]) => [key, ids.filter((item) => item !== id)]),
  );
  const target = [...(without[to.container] ?? [])];
  target.splice(to.index, 0, id);
  return { ...without, [to.container]: target };
};

export function SortableDemo() {
  const [stages, setStages] = useState(["Alpha", "Bravo", "Charlie", "Delta"]);
  const [board, setBoard] = useState<Record<string, string[]>>({
    nm: ["NM1", "NM2", "NM3"],
    hd: ["HD1", "HD2"],
  });
  const sortable = useSortable({
    onMove: ({ id, to }) => setBoard((was) => applyMove(was, id, to)),
    canDrop: ({ id, to }) => (id === "NM1" && to.container === "hd" ? "NM1 stays in NM." : true),
  });
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="single" className="flex flex-col gap-3">
        <h2 id="single" className="font-bold text-c1 text-lg">
          Single list
        </h2>
        <SortableList
          items={stages}
          getId={(stage) => stage}
          getLabel={(stage) => stage}
          label="Stages"
          aria-labelledby="single"
          data-testid="single"
          onMove={({ from, to }) => setStages((was) => moveItem(was, from.index, to.index))}
          className="gap-2 [--sortable-gap:0.5rem]"
          itemClassName="flex items-center gap-3 rounded-[10px] bg-b4 p-3"
        >
          {(stage, { handle, moveButtons }) => (
            <>
              {handle}
              <span className="flex-1 font-bold text-c1">{stage}</span>
              {moveButtons}
            </>
          )}
        </SortableList>
      </section>
      <section aria-labelledby="board" className="flex flex-col gap-3">
        <h2 id="board" className="font-bold text-c1 text-lg">
          Board
        </h2>
        <SortableLayer sortable={sortable} />
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(NAMES) as Key[]).map((key) => (
            <div key={key} className="flex flex-col gap-2">
              <h3 id={`board-${key}`} className="font-bold text-c2">
                {NAMES[key]}
              </h3>
              <ol
                aria-labelledby={`board-${key}`}
                {...sortable.container(key, { label: NAMES[key] })}
                className={`${SORTABLE_CONTAINER} flex min-h-16 flex-col gap-2 rounded-[10px] bg-b4 p-2 [--sortable-gap:0.5rem]`}
              >
                {(board[key] ?? []).map((id, index) => (
                  <li
                    key={id}
                    {...sortable.item(id, { container: key, index, label: id })}
                    className={`${SORTABLE_ITEM} flex items-center gap-3 rounded-md bg-b5 p-2`}
                  >
                    <SortableHandle sortable={sortable} id={id} />
                    <span className="flex-1 text-c1">{id}</span>
                    <SortableMoveButtons sortable={sortable} id={id} label={id} />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
