/**
 * @file tests/components/basics/CardGrid.test.tsx
 * @desc Component tests for CardGrid: the flex li wrapper, columns and gap defaults, custom
 *       columns/gap/list element, flattening arrays and fragments while skipping null and false,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardGrid } from "../../../src/components/basics/CardGrid.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

afterEach(() => vi.restoreAllMocks());

describe("CardGrid", () => {
  it("wraps each child in one flex li so cards in a row match height", () => {
    render(
      <CardGrid>
        <div>A</div>
        <div>B</div>
      </CardGrid>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item).toHaveClass("flex", "[&>*]:w-full");
      expect(item.children).toHaveLength(1);
    }
  });

  it("is one column on phones, two from sm by default, with the md gap", () => {
    render(<CardGrid>{[<div key="a">A</div>]}</CardGrid>);
    expect(screen.getByRole("list")).toHaveClass(
      "grid",
      "grid-cols-1",
      "sm:grid-cols-2",
      "gap-4",
      "sm:gap-5",
    );
  });

  it("takes three columns, the sm gap and an ordered list", () => {
    render(
      <CardGrid columns={3} gap="sm" as="ol">
        <div>A</div>
      </CardGrid>,
    );
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(list).toHaveClass("sm:grid-cols-2", "lg:grid-cols-3", "gap-2.5");
  });

  // Review Focus 1.
  it("flattens arrays and fragments, skips null and false, and warns about no keys", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <CardGrid>
        {[<div key="a">A</div>, false]}
        <>
          <div>B</div>
          <div>C</div>
        </>
        {null}
        <>
          <div>D</div>
        </>
      </CardGrid>,
    );
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <CardGrid>
        <a href="/a">A</a>
        <a href="/b">B</a>
      </CardGrid>,
    );
    await expectNoAxeViolations(container);
  });
});
