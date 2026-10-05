/**
 * @file tests/components/basics/CodeChip.test.tsx
 * @desc Component tests for CodeChip: code and copy button rendering, copy={false}, a custom
 *       label, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeChip } from "../../../src/components/basics/CodeChip.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("CodeChip", () => {
  it("shows the code and a copy button whose name starts with Copy", () => {
    render(<CodeChip code="bun add x" />);
    expect(screen.getByText("bun add x").tagName).toBe("CODE");
    expect(screen.getByText("bun add x")).toHaveClass(
      "rounded",
      "bg-b6",
      "font-mono",
      "wrap-anywhere",
    );
    const button = screen.getByRole("button", { name: "Copy bun add x" });
    expect(button).toHaveTextContent("Copy");
  });

  it("drops the button with copy={false} and takes a custom name", () => {
    const { rerender } = render(<CodeChip code="bun add x" copy={false} />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<CodeChip code="bun add x" copyLabel="Copy install command" />);
    expect(screen.getByRole("button", { name: "Copy install command" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<CodeChip code="bun add @haruhimemoe/ui" />);
    await expectNoAxeViolations(container);
  });
});
