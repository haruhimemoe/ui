/**
 * @file tests/helpers/sortable.tsx
 * @desc Shared sortable test setup: a two-container board (NM: a, b, c; HD: d, e) on
 *       useSortable that applies accepted moves to its own state as an app would, plus queries
 *       for the live region, a handle by label and a region's order. Renders the real
 *       SortableHandle, SortableMoveButtons and SortableLayer, so every suite on it exercises
 *       them too.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { SortableHandle } from "../../src/components/sortable/SortableHandle.js";
import { SortableLayer } from "../../src/components/sortable/SortableLayer.js";
import { SortableMoveButtons } from "../../src/components/sortable/SortableMoveButtons.js";
import { moveItem } from "../../src/components/sortable/sortableMath.js";
import type {
  SortableMove,
  SortableResult,
  UseSortableOptions,
} from "../../src/components/sortable/sortableTypes.js";
import { useSortable } from "../../src/components/sortable/useSortable.js";

/** Container id to item ids; an id's label is the id in capitals. */
export type Lists = Record<string, string[]>;

export const START: Lists = { nm: ["a", "b", "c"], hd: ["d", "e"] };

const NAMES: Readonly<Record<string, string>> = { nm: "NM", hd: "HD" };

/**
 * @function applyMove
 * @param lists {Lists} the board
 * @param move {SortableMove} an accepted "between" or "onto" move
 * @returns {Lists} the board with the item at `to.index` in `to.container`
 */
export function applyMove(lists: Lists, move: SortableMove): Lists {
  const source = lists[move.from.container] ?? [];
  if (move.from.container === move.to.container) {
    return { ...lists, [move.from.container]: moveItem(source, move.from.index, move.to.index) };
  }
  const target = [...(lists[move.to.container] ?? [])];
  target.splice(move.to.index, 0, move.id);
  return {
    ...lists,
    [move.from.container]: source.filter((id) => id !== move.id),
    [move.to.container]: target,
  };
}

export type BoardProps = Omit<UseSortableOptions, "onMove"> & {
  initial?: Lists;
  /** Asked first; its answer goes back to the hook. Default: accept. */
  onMove?: ((move: SortableMove) => SortableResult | Promise<SortableResult>) | undefined;
  /** How an accepted move changes the board. Default applyMove. */
  transform?: (lists: Lists, move: SortableMove) => Lists;
  modes?: Readonly<Record<string, "between" | "onto">>;
  /** Ids left out of the render, as if the app removed them. */
  hidden?: readonly string[];
};

/**
 * @function Board
 * @param props {BoardProps} the hook's options, the starting board and test switches
 * @returns {JSX.Element} two labelled regions with a sortable list each
 */
export function Board({
  initial = START,
  onMove,
  transform = applyMove,
  modes = {},
  hidden = [],
  ...options
}: BoardProps) {
  const [lists, setLists] = useState<Lists>(initial);
  const sortable = useSortable({
    ...options,
    onMove: (move) => {
      const accept = (answer: SortableResult): SortableResult => {
        if (answer !== false && typeof answer !== "string") setLists((was) => transform(was, move));
        return answer;
      };
      const answer = onMove ? onMove(move) : true;
      return answer instanceof Promise ? answer.then(accept) : accept(answer);
    },
  });
  return (
    <div>
      <SortableLayer sortable={sortable} />
      {Object.entries(lists).map(([container, ids]) => (
        <section key={container} aria-label={NAMES[container] ?? container}>
          <ol
            {...sortable.container(container, {
              label: NAMES[container] ?? container,
              mode: modes[container] ?? "between",
            })}
          >
            {ids
              .filter((id) => !hidden.includes(id))
              .map((id, index) => {
                const label = id.toUpperCase();
                return (
                  <li key={id} {...sortable.item(id, { container, index, label })}>
                    <SortableHandle sortable={sortable} id={id} />
                    <span>{label}</span>
                    <SortableMoveButtons sortable={sortable} id={id} label={label} />
                    <button
                      type="button"
                      onClick={() =>
                        sortable.moveTo(id, { container: "hd", index: Number.MAX_SAFE_INTEGER })
                      }
                    >
                      Send {label} to HD
                    </button>
                  </li>
                );
              })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/**
 * @function renderBoard
 * @param props {BoardProps} the board's props
 * @returns render's result plus a user-event session
 */
export const renderBoard = (props: BoardProps = {}) => ({
  user: userEvent.setup(),
  ...render(<Board {...props} />),
});

/** The assertive live region (the harness's own, later SortableLayer's). */
export const live = (): HTMLElement =>
  document.querySelector<HTMLElement>('[aria-live="assertive"]') as HTMLElement;

/** A handle by its item's label ("Reorder A"). */
export const handle = (label: string): HTMLElement =>
  screen.getByRole("button", { name: `Reorder ${label}` });

/** A region's item ids, in DOM order. */
export const order = (region: string): (string | null)[] =>
  within(screen.getByRole("region", { name: region }))
    .queryAllByRole("listitem")
    .map((item) => item.getAttribute("data-sortable-item"));
