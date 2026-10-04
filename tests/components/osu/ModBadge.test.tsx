/**
 * @file tests/components/osu/ModBadge.test.tsx
 * @desc ModBadge's color prop: it beats the bucket, neutral, the pool palette's shades, a value
 *       outside the list falling back, the forced-colors border, className last, axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModBadge, type ModBadgeColor } from "../../../src/components/osu/ModBadge.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const SHADES: Record<ModBadgeColor, string> = {
  sky: "bg-sky-400",
  amber: "bg-amber-300",
  rose: "bg-rose-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  orange: "bg-orange-400",
  green: "bg-green-400",
  teal: "bg-teal-300",
  pink: "bg-pink-400",
  lime: "bg-lime-300",
  cyan: "bg-cyan-300",
  fuchsia: "bg-fuchsia-400",
  yellow: "bg-yellow-300",
  red: "bg-red-400",
  indigo: "bg-indigo-300",
  stone: "bg-stone-300",
  neutral: "bg-b3",
};

describe("ModBadge color", () => {
  it("paints every color with dark text, neutral with c2", () => {
    render(
      <div>
        {(Object.keys(SHADES) as ModBadgeColor[]).map((color) => (
          <ModBadge key={color} mod="C1" color={color}>
            {color}
          </ModBadge>
        ))}
      </div>,
    );
    for (const [color, shade] of Object.entries(SHADES)) {
      const badge = screen.getByText(color);
      expect(badge).toHaveClass(shade);
      expect(badge).toHaveClass(color === "neutral" ? "text-c2" : "text-b6");
    }
  });

  it("beats the bucket the mod's letters pick", () => {
    render(<ModBadge mod="HD2" color="teal" />);
    expect(screen.getByText("HD2")).toHaveClass("bg-teal-300");
    expect(screen.getByText("HD2")).not.toHaveClass("bg-amber-300");
  });

  it("keeps the bucket, then neutral, without a color", () => {
    render(
      <div>
        <ModBadge mod="HR1" />
        <ModBadge mod="X1" />
      </div>,
    );
    expect(screen.getByText("HR1")).toHaveClass("bg-rose-400");
    expect(screen.getByText("X1")).toHaveClass("bg-b3", "text-c2");
  });

  it("falls back to the bucket, then neutral, for a color outside the list", () => {
    render(
      <div>
        <ModBadge mod="HD1" color={"purple" as ModBadgeColor} />
        <ModBadge mod="Q1" color={"constructor" as ModBadgeColor} />
      </div>,
    );
    expect(screen.getByText("HD1")).toHaveClass("bg-amber-300", "text-b6");
    expect(screen.getByText("Q1")).toHaveClass("bg-b3", "text-c2");
  });

  it("keeps a border in forced colors and merges className last", () => {
    render(<ModBadge mod="NM1" color="red" className="bg-pink-300" />);
    const badge = screen.getByText("NM1");
    expect(badge).toHaveClass("forced-colors:border", "bg-pink-300");
    expect(badge).not.toHaveClass("bg-red-400");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        {(Object.keys(SHADES) as ModBadgeColor[]).map((color) => (
          <ModBadge key={color} mod="NM1" color={color} />
        ))}
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
