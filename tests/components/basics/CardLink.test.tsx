/**
 * @file tests/components/basics/CardLink.test.tsx
 * @desc Component tests for CardLink: the data-card-link marker, the cover classes, internal and
 *       external hrefs, className merging, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardLink } from "../../../src/components/basics/CardLink.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("CardLink", () => {
  it("marks itself and covers its positioned ancestor", () => {
    render(<CardLink href="/libraries/ui">@haruhimemoe/ui</CardLink>);
    const link = screen.getByRole("link", { name: "@haruhimemoe/ui" });
    expect(link).toHaveAttribute("data-card-link");
    expect(link).toHaveAttribute("href", "/libraries/ui");
    expect(link).toHaveClass("font-bold", "text-c1", "after:absolute", "after:inset-0");
  });

  it("renders a plain anchor with rel=noreferrer for an off-site new tab", () => {
    render(
      <CardLink href="https://evergreencup.org" target="_blank">
        evergreencup.org
      </CardLink>,
    );
    const link = screen.getByRole("link", { name: "evergreencup.org" });
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("data-card-link");
  });

  it("lets the caller's classes win", () => {
    render(
      <CardLink href="/x" className="text-[#051a0d] after:rounded-[10px]">
        x
      </CardLink>,
    );
    const classes = screen.getByRole("link").className.split(" ");
    expect(classes).toContain("after:rounded-[10px]");
    expect(classes).not.toContain("after:rounded-[inherit]");
    expect(classes).not.toContain("text-c1");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div className="relative">
        <CardLink href="/x">Card</CardLink>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
