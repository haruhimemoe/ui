/**
 * @file tests/components/bracket/BracketView.test.tsx
 * @desc BracketView: source labels for unknown sides, names escaped and truncated with a title,
 *       linked cards with href, "bye" for an empty side, scores and the winner marked, the
 *       highlighted entrant, a scrolling container, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BracketView } from "../../../src/components/bracket/BracketView.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { match, single8 } from "./fixtures.js";

const played = () => {
  const b = single8();
  b.matches = b.matches.map((m) => {
    if (m.code === "M1")
      return match("M1", "QF", {
        a: { entrant: "t1", settled: true, source: { kind: "seed", seed: 1 } },
        b: { entrant: "t8", settled: true, source: { kind: "seed", seed: 8 } },
        status: "done",
        scoreA: 4,
        scoreB: 2,
        winner: "a",
      });
    if (m.code === "M5")
      return match("M5", "SF", {
        a: { entrant: "t1", settled: true, source: { kind: "winner", match: "M1" } },
        b: { entrant: null, settled: false, source: { kind: "winner", match: "M2" } },
      });
    if (m.code === "M2")
      return match("M2", "QF", {
        a: { entrant: "t4", settled: true, source: { kind: "seed", seed: 4 } },
        b: { entrant: null, settled: true, source: { kind: "seed", seed: 5 } },
        status: "bye",
        winner: "a",
      });
    return m;
  });
  return b;
};

const NAMES = { t1: "<b>x</b>", t8: "Eight", t4: "Four" };

describe("BracketView", () => {
  it("labels an unresolved side by its source", () => {
    render(<BracketView bracket={played()} names={NAMES} />);
    expect(screen.getByText("Winner of M2")).toBeInTheDocument();
    expect(screen.getAllByText("Seed 1").length).toBeGreaterThan(0);
  });

  it("escapes a name and keeps it whole in a title", () => {
    const { container } = render(<BracketView bracket={played()} names={NAMES} />);
    expect(container.querySelector("b")).toBeNull();
    const name = screen.getAllByText("<b>x</b>")[0];
    expect(name).toHaveAttribute("title", "<b>x</b>");
    expect(name).toHaveClass("truncate");
  });

  it("shows bye for an empty settled side", () => {
    render(<BracketView bracket={played()} names={NAMES} />);
    expect(screen.getByText("bye")).toBeInTheDocument();
  });

  it("shows scores and marks the winner", () => {
    const { container } = render(<BracketView bracket={played()} names={NAMES} />);
    const card = container.querySelector('[data-match="M1"]');
    expect(card?.textContent).toContain("4");
    expect(card?.querySelector('[data-winner="true"]')?.textContent).toContain("<b>x</b>");
  });

  it("links match cards with href and leaves them plain without", () => {
    const { rerender } = render(
      <BracketView bracket={played()} names={NAMES} href={(code) => `/m/${code}`} />,
    );
    expect(screen.getByRole("link", { name: /M1/ })).toHaveAttribute("href", "/m/M1");
    rerender(<BracketView bracket={played()} names={NAMES} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("highlights an entrant", () => {
    const { container } = render(<BracketView bracket={played()} names={NAMES} highlight="t8" />);
    expect(container.querySelectorAll('[data-highlight="true"]')).toHaveLength(1);
  });

  it("scrolls sideways in its own container, one labelled group per round", () => {
    const { container } = render(<BracketView bracket={played()} names={NAMES} />);
    expect(container.firstElementChild).toHaveClass("overflow-x-auto");
    expect(screen.getByRole("heading", { name: "SF" })).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BracketView bracket={played()} names={NAMES} href={(c) => `/m/${c}`} />,
    );
    await expectNoAxeViolations(container);
  });
});
