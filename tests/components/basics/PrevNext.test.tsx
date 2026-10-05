/**
 * @file tests/components/basics/PrevNext.test.tsx
 * @desc Component tests for PrevNext: named links, a lone next pushed to the end, only previous,
 *       nothing with neither link, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrevNext } from "../../../src/components/basics/PrevNext.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const PREV = { href: "/docs/tags/b", title: "[b] Bold" };
const NEXT = { href: "/docs/tags/i", title: "[i] Italic" };

describe("PrevNext", () => {
  it("names each link 'Previous: title' and 'Next: title' inside a named nav", () => {
    render(<PrevNext label="More tags" prev={PREV} next={NEXT} />);
    expect(screen.getByRole("navigation", { name: "More tags" })).toHaveClass(
      "border-t",
      "border-b3",
      "pt-4",
    );
    expect(screen.getByRole("link", { name: "Previous: [b] Bold" })).toHaveAttribute(
      "href",
      "/docs/tags/b",
    );
    expect(screen.getByRole("link", { name: "Next: [i] Italic" })).toHaveAttribute(
      "href",
      "/docs/tags/i",
    );
  });

  it("pushes a lone next link to the end, with no spacer", () => {
    const { container } = render(<PrevNext label="More tags" next={NEXT} />);
    const link = screen.getByRole("link", { name: "Next: [i] Italic" });
    expect(link).toHaveClass("sm:ml-auto", "sm:text-right");
    expect(container.querySelector("nav")?.children).toHaveLength(1);
  });

  it("renders only previous", () => {
    render(<PrevNext label="More tags" prev={PREV} prevText="Older" />);
    expect(screen.getByRole("link", { name: "Older: [b] Bold" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("renders nothing with neither", () => {
    const { container } = render(<PrevNext label="More tags" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("has no axe violations", async () => {
    const { container } = render(<PrevNext label="More guides" prev={PREV} next={NEXT} />);
    await expectNoAxeViolations(container);
  });
});
