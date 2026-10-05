"use client";

import {
  moveItem,
  SORTABLE_CONTAINER,
  SORTABLE_ITEM,
  SortableHandle,
  SortableLayer,
  SortableList,
  type SortableMove,
  SortableMoveButtons,
  useSortable,
} from "@haruhimemoe/ui";
import { useState } from "react";

// The 0.15.0 sortable lists from a client file: a SortableList on its own hook, and a
// two-container board on useSortable with one SortableLayer.
export function Sortable15() {
  const [stages, setStages] = useState(["Qualifiers", "Finals"]);
  const [board, setBoard] = useState<Record<string, string[]>>({ a: ["One"], b: ["Two"] });
  const sortable = useSortable({
    onMove: ({ id, to }: SortableMove) =>
      setBoard((was) => {
        // to.index is already the index after the item leaves its list, in either list.
        const without = Object.fromEntries(
          Object.entries(was).map(([key, ids]) => [key, ids.filter((item) => item !== id)]),
        );
        const target = [...(without[to.container] ?? [])];
        target.splice(to.index, 0, id);
        return { ...without, [to.container]: target };
      }),
  });
  return (
    <section aria-label="Sortable lists">
      <SortableList
        items={stages}
        getId={(stage) => stage}
        getLabel={(stage) => stage}
        label="Stages"
        aria-label="Stages"
        onMove={({ from, to }) => setStages((was) => moveItem(was, from.index, to.index))}
      >
        {(stage, { handle, moveButtons }) => (
          <>
            {handle}
            <span>{stage}</span>
            {moveButtons}
          </>
        )}
      </SortableList>
      <SortableLayer sortable={sortable} />
      {Object.entries(board).map(([key, ids]) => (
        <ol
          key={key}
          aria-label={`List ${key}`}
          {...sortable.container(key, { label: key })}
          className={SORTABLE_CONTAINER}
        >
          {ids.map((id, index) => (
            <li
              key={id}
              {...sortable.item(id, { container: key, index, label: id })}
              className={SORTABLE_ITEM}
            >
              <SortableHandle sortable={sortable} id={id} />
              <span>{id}</span>
              <SortableMoveButtons sortable={sortable} id={id} label={id} />
            </li>
          ))}
        </ol>
      ))}
    </section>
  );
}
