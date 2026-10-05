/**
 * @file tests/components/osu/MapSetCard.test.tsx
 * @desc MapSetCard: header link, status and badges, the note's warning tone, difficulty rows in
 *       the caller's order, version links by default and plain for null, Copy ID names with the
 *       version, its own copy scope, empty text, header-only background, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MapSetCard, type MapSetDifficulty } from "../../../src/components/osu/MapSetCard.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { stubClipboard } from "../../helpers/clipboard.js";

let restore = () => {};
afterEach(() => restore());

const DIFFS: MapSetDifficulty[] = [
  { beatmapId: 658127, version: "FOUR DIMENSIONS", stars: 7.3, stats: { ar: 9.3, bpm: 200 } },
  {
    beatmapId: 658128,
    version: "Insane",
    stars: 5.1,
    href: null,
    details: "Played in 3 past pools",
  },
];
const SET = { beatmapsetId: 292301, artist: "xi", title: "Blue Zenith", creator: "Asphyxia" };

describe("MapSetCard", () => {
  it("links the set and shows status, badges, mapper and the note", () => {
    render(
      <MapSetCard
        {...SET}
        status="ranked"
        badges={<span>Check first</span>}
        note="Contains a loud section."
        difficulties={DIFFS}
      />,
    );
    expect(screen.getByRole("link", { name: "xi - Blue Zenith" })).toHaveAttribute(
      "href",
      "https://osu.ppy.sh/beatmapsets/292301",
    );
    expect(screen.getByText("Ranked").className).toContain("bg-lime-300");
    expect(screen.getByText("Check first")).toBeInTheDocument();
    expect(screen.getByText("Mapped by Asphyxia")).toBeInTheDocument();
    expect(screen.getByText("Contains a loud section.").className).toContain("text-amber-300");
  });

  it("lists difficulties in the caller's order, linked unless href is null", () => {
    const { container } = render(<MapSetCard {...SET} difficulties={DIFFS} />);
    const rows = [...container.querySelectorAll("li[data-beatmap-id]")];
    expect(rows.map((row) => row.getAttribute("data-beatmap-id"))).toEqual(["658127", "658128"]);
    expect(screen.getByRole("link", { name: "FOUR DIMENSIONS" })).toHaveAttribute(
      "href",
      "https://osu.ppy.sh/beatmaps/658127",
    );
    expect(screen.queryByRole("link", { name: "Insane" })).toBeNull();
    expect(screen.getByText("Played in 3 past pools")).toBeInTheDocument();
    expect(screen.getByText("7.30 stars")).toBeInTheDocument();
  });

  it("names each Copy ID with its version, one Copied. per set", async () => {
    const user = userEvent.setup();
    restore = stubClipboard().restore;
    render(<MapSetCard {...SET} difficulties={DIFFS} copyId />);
    await user.click(screen.getByRole("button", { name: "Copy ID 658127 (FOUR DIMENSIONS)" }));
    await user.click(screen.getByRole("button", { name: "Copy ID 658128 (Insane)" }));
    expect(screen.getAllByText("Copied.")).toHaveLength(1);
  });

  it("says when there are no difficulties", () => {
    const { rerender } = render(<MapSetCard {...SET} difficulties={[]} />);
    expect(screen.getByText("No difficulties.")).toBeInTheDocument();
    rerender(<MapSetCard {...SET} difficulties={[]} emptyText="Nothing here." />);
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
  });

  it("puts the background behind the header only", () => {
    const { container } = render(<MapSetCard {...SET} background="cover" difficulties={DIFFS} />);
    const img = container.querySelector("img.-z-10") as HTMLElement;
    expect(img).toHaveAttribute("src", "https://assets.ppy.sh/beatmaps/292301/covers/card@2x.jpg");
    expect(img.closest("ul")).toBeNull();
  });

  it("has no axe violations", async () => {
    restore = stubClipboard().restore;
    const { container } = render(
      <ul>
        <MapSetCard as="li" {...SET} status="loved" difficulties={DIFFS} copyId background="blur" />
      </ul>,
    );
    await expectNoAxeViolations(container);
  });
});
