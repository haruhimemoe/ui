/**
 * @file tests/components/basics/AutoLink.test.tsx
 * @desc Component tests for AutoLink: internal and external hrefs, the new-tab rel default,
 *       next/link props dropped off-site, native props, ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AutoLink } from "../../../src/components/basics/AutoLink.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("AutoLink", () => {
  it("renders internal paths and external URLs as links with their href", () => {
    render(
      <div>
        <AutoLink href="/packs">Packs</AutoLink>
        <AutoLink href="https://github.com/haruhimemoe">GitHub</AutoLink>
        <AutoLink href="mailto:hi@example.com">Mail</AutoLink>
      </div>,
    );
    expect(screen.getByRole("link", { name: "Packs" })).toHaveAttribute("href", "/packs");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/haruhimemoe",
    );
    expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute(
      "href",
      "mailto:hi@example.com",
    );
  });

  it("gives an external new-tab link rel=noreferrer unless a rel is passed", () => {
    render(
      <div>
        <AutoLink href="https://example.com" target="_blank">
          New tab
        </AutoLink>
        <AutoLink href="/\\evil.example" target="_blank">
          Backslash
        </AutoLink>
        <AutoLink href="https://example.com" target="_blank" rel="opener">
          Own rel
        </AutoLink>
        <AutoLink href="/docs" target="_blank">
          Internal
        </AutoLink>
      </div>,
    );
    expect(screen.getByRole("link", { name: "New tab" })).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByRole("link", { name: "Backslash" })).toHaveAttribute("rel", "noreferrer");
    expect(screen.getByRole("link", { name: "Own rel" })).toHaveAttribute("rel", "opener");
    expect(screen.getByRole("link", { name: "Internal" })).not.toHaveAttribute("rel");
  });

  it("drops next/link's own props on an external link", () => {
    render(
      <AutoLink href="https://example.com" prefetch={false} replace scroll={false}>
        Out
      </AutoLink>,
    );
    const link = screen.getByRole("link", { name: "Out" });
    for (const name of ["prefetch", "replace", "scroll"]) {
      expect(link).not.toHaveAttribute(name);
    }
  });

  it("passes native props and a ref through on both kinds", () => {
    const internal = createRef<HTMLAnchorElement>();
    const external = createRef<HTMLAnchorElement>();
    render(
      <div>
        <AutoLink ref={internal} href="/a" className="x" data-testid="in">
          A
        </AutoLink>
        <AutoLink ref={external} href="https://example.com" className="y" rel="me">
          B
        </AutoLink>
      </div>,
    );
    expect(internal.current).toBe(screen.getByRole("link", { name: "A" }));
    expect(internal.current).toHaveClass("x");
    expect(internal.current).toHaveAttribute("data-testid", "in");
    expect(external.current).toBe(screen.getByRole("link", { name: "B" }));
    expect(external.current).toHaveClass("y");
    expect(external.current).toHaveAttribute("rel", "me");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <AutoLink href="/a">Inside</AutoLink>
        <AutoLink href="https://example.com">Outside</AutoLink>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
