/**
 * @file tests/components/tables/Table.test.tsx
 * @desc Component tests for Table, THead, TBody, Th and Td: the apps' table look, the scrolling
 *       wrapper, a visible or screen-reader-only caption, column and row headers, number cells,
 *       native props and refs, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Table } from "../../../src/components/tables/Table.js";
import { TBody } from "../../../src/components/tables/TBody.js";
import { Td } from "../../../src/components/tables/Td.js";
import { THead } from "../../../src/components/tables/THead.js";
import { Th } from "../../../src/components/tables/Th.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const Slots = ({ hideCaption = false }: { hideCaption?: boolean }) => (
  <Table caption="The pool's maps" hideCaption={hideCaption} wrapperClassName="mt-4">
    <THead>
      <tr>
        <Th>Slot</Th>
        <Th numeric>Stars</Th>
        <Th>
          <span className="sr-only">Copy ID</span>
        </Th>
      </tr>
    </THead>
    <TBody>
      <tr>
        <Th scope="row">NM1</Th>
        <Td numeric>5.23</Td>
        <Td>
          <button type="button">Copy ID</button>
        </Td>
      </tr>
    </TBody>
  </Table>
);

describe("Table", () => {
  it("is a full-width table named by its caption, in a wrapper that scrolls sideways", () => {
    render(<Slots />);
    const table = screen.getByRole("table", { name: "The pool's maps" });
    expect(table).toHaveClass("w-full", "text-left", "text-sm");
    expect(table.parentElement).toHaveClass("overflow-x-auto", "mt-4");
    expect(screen.getByText("The pool's maps")).toHaveClass("font-bold", "text-c3");
  });

  it("makes the scrolling wrapper a focusable region named by the caption, or by scrollLabel", () => {
    const { rerender } = render(<Slots />);
    const region = screen.getByRole("region", { name: "The pool's maps" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toContainElement(screen.getByRole("table"));
    rerender(
      <Table scrollLabel="Results">
        <TBody />
      </Table>,
    );
    expect(screen.getByRole("region", { name: "Results" })).toHaveAttribute("tabindex", "0");
    rerender(
      <Table>
        <TBody />
      </Table>,
    );
    expect(screen.getByRole("region", { name: "Table" })).toBeInTheDocument();
  });

  it("keeps the caption for screen readers only with hideCaption", () => {
    render(<Slots hideCaption />);
    expect(screen.getByRole("table", { name: "The pool's maps" })).toBeInTheDocument();
    expect(screen.getByText("The pool's maps")).toHaveClass("sr-only");
  });

  it("renders no caption without one", () => {
    const { container } = render(
      <Table>
        <TBody />
      </Table>,
    );
    expect(container.querySelector("caption")).toBeNull();
  });

  it("gives column headers scope col, row headers scope row in bold c1, and pads cells", () => {
    render(<Slots />);
    const [slot, stars] = screen.getAllByRole("columnheader");
    expect(slot).toHaveAttribute("scope", "col");
    expect(slot).toHaveClass("py-2", "pr-3", "last:pr-0");
    expect(stars).toHaveClass("tabular-nums");
    const row = screen.getByRole("rowheader", { name: "NM1" });
    expect(row).toHaveAttribute("scope", "row");
    expect(row).toHaveClass("font-bold", "text-c1");
    expect(screen.getByRole("cell", { name: "5.23" })).toHaveClass("tabular-nums", "py-2");
  });

  it("styles the head in small capitals and rules each body row", () => {
    render(<Slots />);
    const [head, body] = screen.getAllByRole("rowgroup");
    expect(head).toHaveClass("text-c3", "text-xs", "uppercase");
    expect(body).toHaveClass("[&>tr]:border-t", "[&>tr]:border-b4");
    expect(within(body as HTMLElement).getAllByRole("row")).toHaveLength(1);
  });

  it("merges className last and passes refs to each element", () => {
    const table = createRef<HTMLTableElement>();
    const cell = createRef<HTMLTableCellElement>();
    render(
      <Table ref={table} className="min-w-[40rem]">
        <TBody className="[&>tr]:align-top">
          <tr>
            <Td ref={cell} className="pr-6">
              x
            </Td>
          </tr>
        </TBody>
      </Table>,
    );
    expect(table.current).toHaveClass("min-w-[40rem]");
    expect(cell.current).toHaveClass("pr-6");
    expect(cell.current).not.toHaveClass("pr-3");
  });

  it("has no axe violations with a visible or hidden caption", async () => {
    const { container, rerender } = render(<Slots />);
    await expectNoAxeViolations(container);
    rerender(<Slots hideCaption />);
    await expectNoAxeViolations(container);
  });
});
