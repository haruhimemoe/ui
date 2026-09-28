/**
 * @file tests/components/basics/Badge.test.tsx
 * @desc Component tests for Badge: the four tones, className merging, native props, and that it
 *       reads as plain text (no role), accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "../../../src/components/basics/Badge.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Badge", () => {
  it("is a neutral pill by default", () => {
    render(<Badge>3 maps</Badge>);
    const badge = screen.getByText("3 maps");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).not.toHaveAttribute("role");
    expect(badge).toHaveClass("rounded-full", "text-xs", "bg-b3", "text-c2");
  });

  it("takes the accent, warning and muted tones", () => {
    render(
      <>
        <Badge tone="accent">New</Badge>
        <Badge tone="warning">Unranked</Badge>
        <Badge tone="muted">beta</Badge>
      </>,
    );
    expect(screen.getByText("New")).toHaveClass("bg-h1", "text-b6");
    expect(screen.getByText("Unranked")).toHaveClass("bg-amber-300/20", "text-amber-200");
    expect(screen.getByText("beta")).toHaveClass("border-b3", "uppercase", "text-c4");
  });

  it("appends className last and passes native props and a ref through", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="bg-b2" title="Not ranked on osu!">
        x
      </Badge>,
    );
    expect(ref.current).toHaveClass("bg-b2");
    expect(ref.current).not.toHaveClass("bg-b3");
    expect(ref.current).toHaveAttribute("title", "Not ranked on osu!");
  });

  it("has no axe violations in every tone", async () => {
    const { container } = render(
      <p>
        Pool <Badge>built</Badge> <Badge tone="accent">new</Badge>{" "}
        <Badge tone="warning">check</Badge> <Badge tone="muted">beta</Badge>
      </p>,
    );
    await expectNoAxeViolations(container);
  });
});
