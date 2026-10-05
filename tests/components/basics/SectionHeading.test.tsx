/**
 * @file tests/components/basics/SectionHeading.test.tsx
 * @desc Component tests for SectionHeading: default look and no wrapper, level and detail, actions
 *       wrapper, anchor, types, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "../../../src/components/basics/SectionHeading.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("SectionHeading", () => {
  it("is an h2 with the section look and no wrapper by default", () => {
    const { container } = render(<SectionHeading id="faq">Questions</SectionHeading>);
    const heading = screen.getByRole("heading", { level: 2, name: "Questions" });
    expect(container.firstElementChild).toBe(heading);
    expect(heading).toHaveClass("scroll-mt-20", "font-bold", "text-c1", "text-xl");
    expect(heading).toHaveAttribute("id", "faq");
  });

  it("takes a level and puts the detail inside the heading's name", () => {
    render(
      <SectionHeading level={3} detail="(12)">
        Pool
      </SectionHeading>,
    );
    const heading = screen.getByRole("heading", { level: 3, name: "Pool (12)" });
    expect(screen.getByText("(12)")).toHaveClass("font-normal", "text-base", "text-c4");
    expect(heading).toContainElement(screen.getByText("(12)"));
  });

  it("puts actions beside the heading in a wrapper", () => {
    render(
      <SectionHeading actions={<a href="/packs">See all public packs</a>} wrapperClassName="mb-2">
        Recent public packs
      </SectionHeading>,
    );
    const heading = screen.getByRole("heading", { name: "Recent public packs" });
    const wrapper = heading.closest("div.justify-between");
    expect(wrapper).toHaveClass("flex", "flex-wrap", "items-baseline", "gap-2", "mb-2");
    expect(wrapper).toContainElement(screen.getByRole("link", { name: "See all public packs" }));
  });

  it("links to itself with an anchor named after its text", () => {
    render(
      <SectionHeading id="unreleased" anchor>
        Not <em>released</em> yet
      </SectionHeading>,
    );
    const anchor = screen.getByRole("link", { name: "Link to section: Not released yet" });
    expect(anchor).toHaveAttribute("href", "#unreleased");
    expect(anchor).toHaveTextContent("#");
  });

  it("needs an id with anchor (types)", () => {
    // @ts-expect-error anchor needs an id
    const heading = <SectionHeading anchor>Pool</SectionHeading>;
    expect(heading).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SectionHeading id="pool" anchor detail="(3)" actions={<button type="button">Retry</button>}>
        Pool
      </SectionHeading>,
    );
    await expectNoAxeViolations(container);
  });
});
