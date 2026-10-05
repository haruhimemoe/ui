/**
 * @file tests/components/basics/StatList.test.tsx
 * @desc Component tests for StatList: dt/dd pairs, each variant's classes, duplicate labels with
 *       no key warning, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatList } from "../../../src/components/basics/StatList.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

afterEach(() => vi.restoreAllMocks());

const ITEMS = [
  { label: "Version", value: "0.13.0" },
  { label: "Stars", value: <strong>7</strong> },
];

describe("StatList", () => {
  it("renders dt and dd pairs, each pair in a div", () => {
    const { container } = render(<StatList items={ITEMS} />);
    const groups = container.querySelectorAll("dl > div");
    expect(groups).toHaveLength(2);
    expect(screen.getAllByRole("term").map((t) => t.textContent)).toEqual(["Version", "Stars"]);
    expect(screen.getAllByRole("definition").map((d) => d.textContent)).toEqual(["0.13.0", "7"]);
    expect(screen.getAllByRole("term")[0]).toHaveClass("text-c4", "text-xs");
    expect(screen.getAllByRole("term")[0]?.className).not.toMatch(/uppercase/);
    expect(screen.getAllByRole("definition")[0]).toHaveClass(
      "font-bold",
      "text-c1",
      "tabular-nums",
    );
  });

  it("styles each variant", () => {
    const { container, rerender } = render(<StatList items={ITEMS} />);
    expect(container.querySelector("dl")).toHaveClass(
      "flex",
      "flex-wrap",
      "gap-x-6",
      "gap-y-2",
      "text-sm",
    );
    rerender(<StatList items={ITEMS} variant="tiles" />);
    expect(container.querySelector("dl")).toHaveClass("flex", "flex-wrap", "gap-2");
    expect(container.querySelector("dl > div")).toHaveClass(
      "min-w-24",
      "rounded-[10px]",
      "bg-b4",
      "px-3",
      "py-2",
    );
    rerender(<StatList items={ITEMS} variant="grid" />);
    expect(container.querySelector("dl")).toHaveClass("grid", "grid-cols-2", "sm:grid-cols-4");
    rerender(<StatList items={ITEMS} variant="grid" columns={3} />);
    expect(container.querySelector("dl")).toHaveClass("sm:grid-cols-3");
  });

  // Review Focus 3.
  it("renders two items with the same label without a key warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <StatList
        items={[
          { label: "BPM", value: "…" },
          { label: "BPM", value: "…" },
        ]}
      />,
    );
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<StatList items={ITEMS} variant="tiles" />);
    await expectNoAxeViolations(container);
  });
});
