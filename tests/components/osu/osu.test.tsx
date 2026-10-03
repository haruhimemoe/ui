/**
 * @file tests/components/osu/osu.test.tsx
 * @desc Component tests for the osu! display pieces: StarRating (spectrum colors, what screen
 *       readers hear), BeatmapStats (formatting, missing stats, labels) and ModBadge (bucket
 *       colors), with native props and accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BeatmapStats } from "../../../src/components/osu/BeatmapStats.js";
import { ModBadge } from "../../../src/components/osu/ModBadge.js";
import { StarRating } from "../../../src/components/osu/StarRating.js";
import {
  contrastRatio,
  starRatingColor,
  starRatingTextColor,
} from "../../../src/components/osu/starColors.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("star colors", () => {
  it("follows osu!'s spectrum: grey under 0.1, stops, blends, black from 9", () => {
    expect(starRatingColor(0)).toBe("rgb(170 170 170)");
    expect(starRatingColor(Number.NaN)).toBe("rgb(170 170 170)");
    expect(starRatingColor(0.1)).toBe("rgb(66 144 251)");
    expect(starRatingColor(2.25)).toBe("rgb(102 255 146)");
    expect(starRatingColor(12)).toBe("rgb(0 0 0)");
    expect(starRatingTextColor(5)).toBe("rgb(0 0 0)");
    expect(starRatingTextColor(7)).toBe("rgb(255 217 102)");
    expect(starRatingTextColor(6.8)).toBe("rgb(255 255 255)");
  });

  it("keeps the text at 4.5:1 on the pill at every tenth of a star", () => {
    const rgb = (s: string) => (s.match(/\d+/g) ?? []).map(Number) as [number, number, number];
    for (let tenths = 0; tenths <= 100; tenths++) {
      const stars = tenths / 10;
      const ratio = contrastRatio(rgb(starRatingTextColor(stars)), rgb(starRatingColor(stars)));
      expect(ratio, `${stars} stars`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("StarRating", () => {
  it("shows the rating with two decimals on its color, and reads it with the unit and label", () => {
    render(<StarRating value={5.2345} label="with HR" title="Under HR" />);
    const pill = screen.getByTitle("Under HR");
    expect(pill).toHaveTextContent("★5.235.23 stars, with HR");
    expect(pill).toHaveStyle({ backgroundColor: starRatingColor(5.2345) });
    expect(screen.getByText("5.23 stars, with HR").className).toBe("sr-only");
    for (const hidden of pill.querySelectorAll("[aria-hidden]")) {
      expect(hidden).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("shows NaN as a dash, takes a unit, and has no axe violations", async () => {
    const { container } = render(<StarRating value={Number.NaN} unit="Sterne" />);
    expect(screen.getByText("– Sterne")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});

describe("BeatmapStats", () => {
  it("lists the given stats in order, formatted, with abbreviations titled", () => {
    render(
      <BeatmapStats
        cs={4.2}
        ar={9.300000001}
        od={8}
        hp={Number.NaN}
        bpm={180.4}
        lengthSeconds={3725}
      />,
    );
    const terms = screen.getAllByRole("term").map((t) => t.textContent);
    expect(terms).toEqual([
      "CSCircle size",
      "ARApproach rate",
      "ODOverall difficulty",
      "BPMBeats per minute",
      "Length",
    ]);
    expect(screen.getByText("Circle size")).toHaveClass("sr-only");
    expect(screen.getByText("CS")).toHaveAttribute("aria-hidden", "true");
    const values = screen.getAllByRole("definition").map((d) => d.textContent);
    expect(values).toEqual(["4.2", "9.3", "8", "180", "1:02:05"]);
    expect(screen.getByTitle("Approach rate")).toHaveTextContent("ARApproach rate");
  });

  it("takes labels and short lengths, and has no axe violations", async () => {
    const { container } = render(
      <BeatmapStats bpm={200} lengthSeconds={95} labels={{ length: "Länge" }} className="mt-1" />,
    );
    expect(screen.getAllByRole("definition")).toHaveLength(2);
    expect(screen.getByText("Länge")).toBeInTheDocument();
    expect(screen.getByText("1:35")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("mt-1", "flex-wrap");
    await expectNoAxeViolations(container);
  });
});

describe("ModBadge", () => {
  it("colors a slot by its bucket and falls back to a quiet pill", () => {
    render(
      <>
        <ModBadge mod="HD2" title="Hidden" />
        <ModBadge mod="nc1" />
        <ModBadge mod="C1" />
        <ModBadge mod="TB" className="bg-pink-300 text-b6">
          Tiebreaker
        </ModBadge>
      </>,
    );
    expect(screen.getByTitle("Hidden")).toHaveClass("bg-amber-300", "text-b6");
    expect(screen.getByText("nc1")).toHaveClass("bg-violet-400");
    expect(screen.getByText("C1")).toHaveClass("bg-b3", "text-c2");
    const tb = screen.getByText("Tiebreaker");
    expect(tb).toHaveClass("bg-pink-300");
    expect(tb).not.toHaveClass("bg-orange-400");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ModBadge mod="NM1" />);
    await expectNoAxeViolations(container);
  });
});
