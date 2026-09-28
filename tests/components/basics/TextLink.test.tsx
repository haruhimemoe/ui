/**
 * @file tests/components/basics/TextLink.test.tsx
 * @desc Component tests for TextLink and linkClasses: the two looks, internal and external
 *       hrefs, the new-tab rel default, className merging, native props, keyboard, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { linkClasses } from "../../../src/components/basics/linkStyles.js";
import { TextLink } from "../../../src/components/basics/TextLink.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("linkClasses", () => {
  it("underlines the accent look at rest and the plain look on hover", () => {
    expect(linkClasses()).toContain("text-h1");
    expect(linkClasses().split(" ")).toContain("underline");
    const plain = linkClasses({ variant: "plain" }).split(" ");
    expect(plain).toEqual(expect.arrayContaining(["font-bold", "text-c1", "hover:underline"]));
    expect(plain).not.toContain("underline");
  });

  it("lets a caller class replace a built-in one", () => {
    expect(linkClasses({ className: "text-c2" })).not.toContain("text-h1");
  });
});

describe("TextLink", () => {
  it("links inside the app and off it, with rel=noreferrer on an off-site new tab", () => {
    render(
      <p>
        Read <TextLink href="/docs">the docs</TextLink> or{" "}
        <TextLink href="https://osu.ppy.sh" target="_blank">
          osu!
        </TextLink>
      </p>,
    );
    expect(screen.getByRole("link", { name: "the docs" })).toHaveAttribute("href", "/docs");
    const osu = screen.getByRole("link", { name: "osu!" });
    expect(osu).toHaveAttribute("rel", "noreferrer");
    expect(osu).toHaveClass("text-h1", "underline");
  });

  it("takes the plain look, className last, native props and a ref", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <TextLink ref={ref} href="/packs/1" variant="plain" className="truncate" data-row="1">
        My pack
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: "My pack" });
    expect(ref.current).toBe(link);
    expect(link).toHaveClass("font-bold", "text-c1", "truncate");
    expect(link.className.endsWith(" truncate")).toBe(true);
    expect(link).toHaveAttribute("data-row", "1");
  });

  it("is in the tab order and has no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <p>
        See <TextLink href="/a">one</TextLink> and <TextLink href="/b">two</TextLink>.
      </p>,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "one" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "two" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });
});
