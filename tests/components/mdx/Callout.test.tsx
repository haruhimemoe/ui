/**
 * @file tests/components/mdx/Callout.test.tsx
 * @desc Component tests for Callout: default and typed labels, a custom title, the hidden icon,
 *       children, and accessibility for all three types.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "../../../src/components/mdx/Callout.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Callout", () => {
  it("defaults to a note with a visible label", () => {
    render(<Callout>Text</Callout>);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Note");
    expect(screen.getByText("Text")).toBeInTheDocument();
  });

  it("shows the Warning label and border for type warning", () => {
    render(<Callout type="warning">Text</Callout>);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Warning");
    expect(note.className).toContain("border-h2");
  });

  it("replaces the label with a custom title", () => {
    render(<Callout title="Heads up">Text</Callout>);
    expect(screen.getByRole("note")).toHaveTextContent("Heads up");
    expect(screen.queryByText("Note")).not.toBeInTheDocument();
  });

  it("hides the icon svg from assistive tech", () => {
    const { container } = render(<Callout>Text</Callout>);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it.each(["note", "tip", "warning"] as const)("is axe-clean for type %s", async (type) => {
    const { container } = render(<Callout type={type}>Text</Callout>);
    await expectNoAxeViolations(container);
  });
});
