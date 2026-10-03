/**
 * @file tests/components/forms/CharCounter.test.tsx
 * @desc Component tests for CharCounter: the count and limit, the over-the-limit tone and text,
 *       the unit, native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharCounter } from "../../../src/components/forms/CharCounter.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("CharCounter", () => {
  it("shows the count and limit with separators, in c3 while under", async () => {
    const { container } = render(<CharCounter count={1234} limit={60000} />);
    const text = screen.getByText("1,234 / 60,000 characters");
    expect(text).toHaveClass("text-c3", "tabular-nums");
    expect(text).not.toHaveClass("text-rose-300");
    await expectNoAxeViolations(container);
  });

  it("is not over at exactly the limit", () => {
    render(<CharCounter count={10} limit={10} />);
    expect(screen.getByText("10 / 10 characters")).toHaveClass("text-c3");
  });

  it("turns bold rose and says how many to cut once over", () => {
    render(<CharCounter count={61500} limit={60000} />);
    const text = screen.getByText("61,500 / 60,000 characters: 1,500 over the limit");
    expect(text).toHaveClass("font-bold", "text-rose-300");
  });

  it("with live, announces only the over-limit text through an output", async () => {
    const { container, rerender } = render(<CharCounter count={3} limit={5} live />);
    const output = screen.getByRole("status");
    expect(output).toHaveTextContent("");
    expect(output).toHaveClass("sr-only");
    expect(screen.getByText("3 / 5 characters")).toHaveAttribute("aria-hidden", "true");
    rerender(<CharCounter count={7} limit={5} live />);
    expect(screen.getByRole("status")).toHaveTextContent("2 over the limit");
    await expectNoAxeViolations(container);
  });

  it("takes a unit, native props and classes", () => {
    render(<CharCounter count={3} limit={5} unit="lines" id="counter" className="mt-2" />);
    const text = screen.getByText("3 / 5 lines");
    expect(text).toHaveAttribute("id", "counter");
    expect(text).toHaveClass("mt-2");
  });
});
