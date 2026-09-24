/**
 * @file tests/environment.test.tsx
 * @desc Guards the test environment itself: next/link renders in jsdom without a router, and the
 *       axe helper catches a real violation.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it } from "vitest";
import { expectNoAxeViolations } from "./helpers/axe.js";

describe("test environment", () => {
  it("renders next/link as a plain anchor", () => {
    render(<Link href="/docs">Docs</Link>);
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("fails the axe check on an unlabeled button", async () => {
    const { container } = render(<button type="button" />);
    await expect(expectNoAxeViolations(container)).rejects.toThrow(/button-name/);
  });
});
