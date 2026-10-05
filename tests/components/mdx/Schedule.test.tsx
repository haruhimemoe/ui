/**
 * @file tests/components/mdx/Schedule.test.tsx
 * @desc Schedule: an ordered list of rows, each a `when` (plain or a `<time>` with dateTime), a
 *       bold label and an optional note.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Schedule } from "../../../src/components/mdx/Schedule.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Schedule", () => {
  it("is an ordered list; when is a time only with dateTime", async () => {
    const { container } = render(
      <Schedule
        items={[
          { when: "Week 1", label: "Registration", note: "Two weeks" },
          { when: "Oct 4, 2026", dateTime: "2026-10-04", label: "Qualifiers" },
        ]}
      />,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    const times = container.querySelectorAll("time");
    expect(times).toHaveLength(1);
    expect(times[0]).toHaveAttribute("datetime", "2026-10-04");
    expect(screen.getByText("Registration")).toHaveClass("font-bold");
    expect(screen.getByText("Two weeks")).toHaveClass("text-sm");
    await expectNoAxeViolations(container);
  });
});
