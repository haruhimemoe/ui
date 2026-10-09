/**
 * @file tests/components/osu/MapCard.test.tsx
 * @desc MapCard's row layout: title and fallback, BeatmapMeta with extra fields, the link and
 *       its overrides, slot badge, stars and stats, status, every state, Copy ID, compact, long
 *       titles, bad set ids, non-finite numbers, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { MapCard } from "../../../src/components/osu/MapCard.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { stubClipboard } from "../../helpers/clipboard.js";
import { META } from "../../helpers/maps.js";

let restore = () => {};
afterEach(() => restore());

describe("MapCard row", () => {
  it("titles the map and links it to its osu! page in the same tab", () => {
    render(<MapCard beatmapId={129891} map={META} />);
    const link = screen.getByRole("link", { name: "xi - FREEDOM DiVE" });
    expect(link).toHaveAttribute("href", "https://osu.ppy.sh/beatmaps/129891");
    expect(link).not.toHaveAttribute("target");
    expect(link.className).not.toContain("after:absolute");
    expect(link.closest("p")).toHaveAttribute("title", "xi - FREEDOM DiVE");
    expect(screen.getByText("[FOUR DIMENSIONS] mapped by Nakagawa-Kanon")).toBeInTheDocument();
  });

  it("puts nothing from map's extra fields on the page", () => {
    const { container } = render(<MapCard beatmapId={129891} map={META} />);
    expect(container.innerHTML).not.toMatch(/checksum|da8aae79|mode="osu"/);
  });

  it("takes an href, null for no link, and newTab", () => {
    const { rerender } = render(<MapCard beatmapId={1} map={META} href="/maps/1" />);
    expect(screen.getByRole("link", { name: "xi - FREEDOM DiVE" })).toHaveAttribute(
      "href",
      "/maps/1",
    );
    rerender(<MapCard beatmapId={1} map={META} href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("xi - FREEDOM DiVE").tagName).toBe("P");
    rerender(<MapCard beatmapId={1} map={META} newTab />);
    const tab = screen.getByRole("link", { name: "xi - FREEDOM DiVE (opens in a new tab)" });
    expect(tab).toHaveAttribute("target", "_blank");
    expect(tab).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("falls back to Beatmap <id> with no map", () => {
    const { container } = render(<MapCard beatmapId={5} />);
    expect(screen.getByRole("link", { name: "Beatmap 5" })).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("aria-busy");
    expect(container.querySelector(".animate-pulse, [class*='animate-pulse']")).toBeNull();
  });

  it("draws the slot badge, colored by mod or by color", () => {
    const { rerender } = render(<MapCard beatmapId={1} map={META} slot={{ label: "NM1" }} />);
    expect(screen.getByText("NM1").className).toContain("bg-sky-400");
    rerender(
      <MapCard beatmapId={1} map={META} slot={{ label: "X1", color: "pink", title: "Custom" }} />,
    );
    expect(screen.getByText("X1").className).toContain("bg-pink-400");
    expect(screen.getByText("X1")).toHaveAttribute("title", "Custom");
    expect(screen.getByText("X1").parentElement?.className).toContain("w-14");
  });

  it("shows stars and stats, overridden per key", () => {
    const { rerender } = render(<MapCard beatmapId={1} map={META} />);
    expect(screen.getByText("7.12 stars")).toBeInTheDocument();
    rerender(
      <MapCard
        beatmapId={1}
        map={META}
        stars={8.5}
        starsLabel="with HR"
        starsNote="HR"
        starsTitle="Rating with HR"
        stats={{ ar: 10, bpm: null }}
      />,
    );
    expect(screen.getByText(/8\.50 stars, with HR/)).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getByTitle("Rating with HR")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByTitle("Beats per minute")).toBeNull();
    expect(screen.getByTitle("Circle size")).toBeInTheDocument();
  });

  it("never prints NaN or Infinity from bad data", () => {
    const { container } = render(
      <MapCard
        beatmapId={1}
        map={{ ...META, starRating: Number.NaN, bpm: Number.POSITIVE_INFINITY }}
      />,
    );
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
    expect(screen.queryByText(/ stars/)).toBeNull();
  });

  it("hides the status in a row unless asked, and colors it by status", () => {
    const { rerender } = render(<MapCard beatmapId={1} map={META} />);
    expect(screen.queryByText("Ranked")).toBeNull();
    rerender(<MapCard beatmapId={1} map={META} showStatus />);
    expect(screen.getByText("Ranked").className).toContain("bg-lime-300");
    rerender(<MapCard beatmapId={1} map={{ ...META, status: "loved" }} showStatus />);
    expect(screen.getByText("Loved").className).toContain("bg-pink-300");
    rerender(<MapCard beatmapId={1} map={{ ...META, status: "graveyard" }} showStatus />);
    expect(screen.getByText("Graveyard").className).toContain("bg-b6");
    rerender(<MapCard beatmapId={1} map={{ ...META, status: "mystery" }} showStatus />);
    expect(screen.getByText("mystery").className).toContain("bg-b3");
  });

  it("marks a loading card busy, with skeleton bars, the ID and sr text", () => {
    const { container, rerender } = render(<MapCard beatmapId={5} state="loading" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading beatmap 5").className).toContain("sr-only");
    expect(screen.getByRole("link", { name: "Beatmap 5" })).toBeInTheDocument();
    expect(container.innerHTML).toContain("motion-safe:animate-pulse");
    rerender(<MapCard beatmapId={5} state="loading" map={META} />);
    expect(container.innerHTML).not.toContain("motion-safe:animate-pulse");
    expect(screen.getByRole("link", { name: "xi - FREEDOM DiVE" })).toBeInTheDocument();
  });

  it("says why for missing and error, with no cover and no stats", () => {
    const { container, rerender } = render(<MapCard beatmapId={5} map={META} state="missing" />);
    const missing = screen.getByText("Beatmap 5 wasn't found. Check the ID.");
    expect(missing.className).toContain("text-rose-300");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    rerender(<MapCard beatmapId={5} state="error" message="The mirror timed out." />);
    expect(screen.getByText("The mirror timed out.").className).toContain("text-rose-300");
  });

  it("offers Copy ID only when asked, in every state", async () => {
    const user = userEvent.setup();
    restore = stubClipboard().restore;
    const { rerender } = render(<MapCard beatmapId={129891} map={META} />);
    expect(screen.queryByRole("button", { name: /Copy ID/ })).toBeNull();
    for (const state of ["ready", "loading", "missing", "error"] as const) {
      rerender(<MapCard beatmapId={129891} state={state} copyId />);
      expect(screen.getByRole("button", { name: "Copy ID 129891" })).toHaveTextContent("Copy ID");
    }
    await user.click(screen.getByRole("button", { name: "Copy ID 129891" }));
    expect(screen.getByText("Copied.")).toBeInTheDocument();
  });

  it("wraps its actions under the text below the 2xl container width", () => {
    const { container } = render(
      <MapCard beatmapId={1} map={META} copyId actions={<button type="button">Remove</button>} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("@container");
    const group = screen.getByRole("button", { name: "Remove" }).parentElement as HTMLElement;
    expect(group.className).toContain("w-full");
    expect(group.className).toContain("@2xl:w-auto");
    expect(group.firstElementChild?.querySelector("button")).toHaveAccessibleName("Copy ID 1");
  });

  it("goes compact: tighter padding, a 32px square, the byline on the title's line", () => {
    const { container } = render(<MapCard beatmapId={1} map={META} density="compact" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("px-3");
    expect(root.className).toContain("py-2");
    expect(container.querySelector(".size-8")).not.toBeNull();
    expect(screen.getByText(/· \[FOUR DIMENSIONS\]/)).toBeInTheDocument();
  });

  it("keeps compact stats' screen-reader text inside their clip, so a phone never scrolls sideways", () => {
    const { container } = render(<MapCard beatmapId={1} map={META} density="compact" />);
    const clip = container.querySelector(".overflow-hidden.whitespace-nowrap") as HTMLElement;
    expect(clip).toHaveClass("relative");
    expect(clip.querySelector(".sr-only")).not.toBeNull();
  });

  it("truncates a very long title and keeps the full text in title", () => {
    const long = "x".repeat(300);
    render(<MapCard beatmapId={1} map={{ ...META, artist: long, title: long }} />);
    const title = screen.getByRole("link").closest("p") as HTMLElement;
    expect(title.className).toContain("truncate");
    expect(title.className).toContain("min-w-0");
    expect(title).toHaveAttribute("title", `${long} - ${long}`);
    expect(title.closest(".flex-1")?.className).toContain("min-w-0");
  });

  it("builds no ppy.sh URL from a bad set id, and draws the placeholder", () => {
    for (const beatmapsetId of [0, -1, 1.5, Number.NaN]) {
      const { container, unmount } = render(
        <MapCard beatmapId={1} map={{ ...META, beatmapsetId }} />,
      );
      expect(container.innerHTML).not.toContain("assets.ppy.sh");
      expect(container.textContent).toContain("♪");
      unmount();
    }
  });

  it("puts leading first, the preview over the cover, details under the stats, and takes labels", () => {
    const { container } = render(
      <MapCard
        beatmapId={7}
        map={META}
        slot={{ label: "NM1" }}
        leading={<button type="button">Drag</button>}
        preview={<button type="button">Play</button>}
        details={<span>added by peppy</span>}
        labels={{ mappedBy: (c) => `von ${c}` }}
      />,
    );
    const row = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(row.firstElementChild).toHaveTextContent("Drag");
    const play = screen.getByRole("button", { name: "Play" });
    expect(play.parentElement?.className).toContain("*:[grid-area:1/1]");
    expect(play.parentElement?.querySelector("img")).not.toBeNull();
    expect(screen.getByText("added by peppy")).toBeInTheDocument();
    expect(screen.getByText("[FOUR DIMENSIONS] von Nakagawa-Kanon")).toBeInTheDocument();
    render(<MapCard beatmapId={8} labels={{ fallbackTitle: (id) => `Map ${id}` }} />);
    expect(screen.getByRole("link", { name: "Map 8" })).toBeInTheDocument();
  });

  it("renders as li and passes native props", () => {
    const { container } = render(
      <ul>
        <MapCard as="li" beatmapId={1} map={META} data-map={1} className="extra" />
      </ul>,
    );
    const li = container.querySelector("li") as HTMLElement;
    expect(li).toHaveAttribute("data-map", "1");
    expect(li.className).toContain("extra");
    expect(li.className).toContain("bg-b4");
  });

  it("has no axe violations in each state", async () => {
    const { container } = render(
      <ul>
        <MapCard as="li" beatmapId={1} map={META} slot={{ label: "NM1" }} copyId />
        <MapCard as="li" beatmapId={2} state="loading" copyId />
        <MapCard as="li" beatmapId={3} state="missing" />
        <MapCard as="li" beatmapId={4} state="error" message="Failed." density="compact" />
      </ul>,
    );
    await expectNoAxeViolations(container);
  });
});
