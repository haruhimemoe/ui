/**
 * @file tests/components/sortable/SortableList.test.tsx
 * @desc SortableList: an ol of li rows with the item classes and its own live region, each row
 *       given its handle and move buttons; a keyboard drag reorders through onMove; lifted in the
 *       row's context; moveButtons off, as="ul" and itemProps on the li; two lists sharing one
 *       hook move items between them with one live region; disabled; no axe violations.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { SortableLayer } from "../../../src/components/sortable/SortableLayer.js";
import {
  SortableList,
  type SortableListProps,
} from "../../../src/components/sortable/SortableList.js";
import { moveItem } from "../../../src/components/sortable/sortableMath.js";
import { useSortable } from "../../../src/components/sortable/useSortable.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { applyMove, handle, type Lists, live } from "../../helpers/sortable.js";

function Stages(props: Partial<Omit<SortableListProps<string>, "children">>) {
  const [items, setItems] = useState(["Alpha", "Bravo", "Charlie"]);
  return (
    <SortableList
      items={items}
      getId={(stage) => stage.toLowerCase()}
      getLabel={(stage) => stage}
      label="Stages"
      aria-label="Stages"
      itemClassName="flex gap-2"
      onMove={({ from, to }) => setItems((was) => moveItem(was, from.index, to.index))}
      {...props}
    >
      {(stage, { handle: grip, moveButtons, lifted }) => (
        <>
          {grip}
          <span>{lifted ? `${stage} (lifted)` : stage}</span>
          {moveButtons}
        </>
      )}
    </SortableList>
  );
}

function Day() {
  const [lists, setLists] = useState<Lists>({ morning: ["tea", "toast"], evening: ["soup"] });
  const sortable = useSortable({ onMove: (move) => setLists((was) => applyMove(was, move)) });
  return (
    <>
      <SortableLayer sortable={sortable} />
      {[
        ["morning", "Morning"],
        ["evening", "Evening"],
      ].map(([key = "", name = ""]) => (
        <SortableList
          key={key}
          sortable={sortable}
          id={key}
          items={lists[key] ?? []}
          getId={(food) => food}
          getLabel={(food) => food}
          label={name}
          aria-label={name}
        >
          {(food, { handle: grip }) => (
            <>
              {grip}
              <span>{food}</span>
            </>
          )}
        </SortableList>
      ))}
    </>
  );
}

const rows = (list: string) =>
  within(screen.getByRole("list", { name: list }))
    .getAllByRole("listitem")
    .map((item) => item.querySelector("span")?.textContent);

describe("SortableList", () => {
  it("renders an ol of rows, each with its handle and move buttons, and its own live region", () => {
    render(<Stages />);
    const list = screen.getByRole("list", { name: "Stages" });
    expect(list.tagName).toBe("OL");
    expect(list).toHaveAttribute("data-sortable-container");
    for (const item of within(list).getAllByRole("listitem")) {
      expect(item).toHaveClass("relative", "flex", "gap-2");
    }
    expect(live()).toBeEmptyDOMElement();
    expect(handle("Alpha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move Alpha down" }).querySelector("svg"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("reorders with a keyboard drag", async () => {
    const user = userEvent.setup();
    render(<Stages />);
    handle("Alpha").focus();
    await user.keyboard(" ");
    expect(live()).toHaveTextContent("Picked up Alpha. Position 1 of 3.");
    expect(rows("Stages")[0]).toBe("Alpha (lifted)");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(live()).toHaveTextContent("Alpha: position 3 of 3.");
    await user.keyboard("{Enter}");
    expect(rows("Stages")).toEqual(["Bravo", "Charlie", "Alpha"]);
    expect(handle("Alpha")).toHaveFocus();
  });

  it("leaves out the buttons, renders a ul and puts itemProps on each li", () => {
    render(
      <Stages
        moveButtons={false}
        as="ul"
        itemProps={(stage) => ({ "aria-label": `${stage} stage` })}
      />,
    );
    expect(screen.getByRole("list", { name: "Stages" }).tagName).toBe("UL");
    expect(screen.queryByRole("button", { name: "Move Alpha down" })).toBeNull();
    expect(screen.getByRole("listitem", { name: "Alpha stage" })).toHaveAttribute(
      "data-sortable-item",
      "alpha",
    );
  });

  it("moves items between two lists that share one hook, with one live region", async () => {
    const user = userEvent.setup();
    render(<Day />);
    expect(document.querySelectorAll('[aria-live="assertive"]')).toHaveLength(1);
    handle("tea").focus();
    await user.keyboard(" ");
    await user.keyboard("{PageDown}");
    expect(live()).toHaveTextContent("tea: position 1 of 2 in Evening.");
    await user.keyboard("{Enter}");
    expect(rows("Morning")).toEqual(["toast"]);
    expect(rows("Evening")).toEqual(["tea", "soup"]);
  });

  it("locks every handle and button while disabled", () => {
    render(<Stages disabled />);
    expect(handle("Alpha")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Move Alpha down" })).toBeDisabled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Stages />);
    await expectNoAxeViolations(container);
  });
});
