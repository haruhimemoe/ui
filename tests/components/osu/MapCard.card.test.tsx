/**
 * @file tests/components/osu/MapCard.card.test.tsx
 * @desc MapCard's card layout and backgrounds: whole-card link on by default with the lift
 *       selector, status on by default, title and artist lines, slot chip over the cover,
 *       footer with details, Copy ID and actions, none/cover/blur backgrounds with the overlay,
 *       the c3 override and forced-colors hiding, no background on missing, compact, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CARD_LINK_LIFT } from "../../../src/components/basics/surfaceStyles.js";
import { MapCard } from "../../../src/components/osu/MapCard.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { META } from "../../helpers/maps.js";

const backgroundOf = (container: HTMLElement) => container.querySelector("img.-z-10");

describe("MapCard card", () => {
  it("links the whole card by default, with the lift and the outlines", () => {
    const { container } = render(<MapCard layout="card" beatmapId={129891} map={META} />);
    const link = screen.getByRole("link", { name: "FREEDOM DiVE" });
    expect(link).toHaveAttribute("data-card-link");
    const root = container.firstElementChild as HTMLElement;
    for (const cls of CARD_LINK_LIFT.split(" ")) expect(root.className).toContain(cls);
    expect(root.className).toContain("hover:outline-2");
    expect(root.className).toContain("has-[a:focus-visible]:outline-h1");
    expect(root.className).toContain("p-0");
  });

  it("turns the whole-card link off on request, and with no link", () => {
    const { container, rerender } = render(
      <MapCard layout="card" beatmapId={1} map={META} wholeCardLink={false} />,
    );
    expect(screen.getByRole("link")).not.toHaveAttribute("data-card-link");
    expect((container.firstElementChild as HTMLElement).className).not.toContain("hover:outline-2");
    rerender(<MapCard layout="card" beatmapId={1} map={META} href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("can link a whole row too", () => {
    render(<MapCard beatmapId={1} map={META} wholeCardLink />);
    expect(screen.getByRole("link")).toHaveAttribute("data-card-link");
  });

  it("shows status, title, artist and byline on separate lines", () => {
    render(<MapCard layout="card" beatmapId={1} map={META} />);
    expect(screen.getByText("Ranked")).toBeInTheDocument();
    expect(screen.getByText("xi").tagName).toBe("P");
    expect(screen.getByText("[FOUR DIMENSIONS] mapped by Nakagawa-Kanon").className).toContain(
      "mt-auto",
    );
  });

  it("pins the slot pill over the cover on a b6 chip", () => {
    render(<MapCard layout="card" beatmapId={1} map={META} slot={{ label: "HD2" }} />);
    expect(screen.getByText("HD2").parentElement?.className).toContain("bg-b6/70");
  });

  it("puts details, Copy ID and actions in an always-visible footer", () => {
    render(
      <MapCard
        layout="card"
        beatmapId={1}
        map={META}
        copyId
        details={<span>added by peppy</span>}
        actions={<button type="button">Add</button>}
      />,
    );
    const footer = screen.getByRole("button", { name: "Add" }).parentElement as HTMLElement;
    expect(footer.className).toContain("border-t");
    expect(footer).toHaveTextContent("added by peppy");
    expect(footer.querySelector("button[aria-label='Copy ID 1']")).not.toBeNull();
  });

  it("draws no background by default, the card@2x cover with an overlay for cover", () => {
    const { container, rerender } = render(<MapCard layout="card" beatmapId={1} map={META} />);
    expect(backgroundOf(container)).toBeNull();
    rerender(<MapCard layout="card" beatmapId={1} map={META} background="cover" />);
    const img = backgroundOf(container) as HTMLImageElement;
    expect(img).toHaveAttribute("src", "https://assets.ppy.sh/beatmaps/39804/covers/card@2x.jpg");
    expect(img).toHaveAttribute("alt", "");
    expect(img.className).toContain("forced-colors:hidden");
    expect(img.className).not.toContain("blur-xl");
    const overlay = img.nextElementSibling as HTMLElement;
    expect(overlay.className).toContain("bg-b5/80");
    expect(overlay.className).toContain("forced-colors:hidden");
    expect(container.querySelector("dl")?.className).toContain("[&_dt]:text-c3");
  });

  it("blurs the cover for blur, behind the same overlay", () => {
    const { container } = render(<MapCard beatmapId={1} map={META} background="blur" />);
    const img = backgroundOf(container) as HTMLImageElement;
    expect(img.className).toContain("blur-xl");
    expect(img.className).toContain("scale-110");
    expect((img.nextElementSibling as HTMLElement).className).toContain("bg-b5/80");
  });

  it("uses coverUrl for both covers, and draws neither for null", () => {
    const { container, rerender } = render(
      <MapCard layout="card" beatmapId={1} map={META} background="cover" coverUrl="/c.svg" />,
    );
    expect(backgroundOf(container)).toHaveAttribute("src", "/c.svg");
    expect(container.querySelectorAll('img[src="/c.svg"]')).toHaveLength(2);
    rerender(<MapCard layout="card" beatmapId={1} map={META} background="cover" coverUrl={null} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toContain("♪");
  });

  it("ignores the background for missing and error", () => {
    const { container } = render(
      <MapCard layout="card" beatmapId={1} map={META} background="cover" state="missing" />,
    );
    expect(container.querySelector("img")).toBeNull();
  });

  it("goes compact: 72px panel and square", () => {
    const { container } = render(
      <MapCard layout="card" density="compact" beatmapId={1} map={META} />,
    );
    expect(container.querySelector(".min-h-\\[72px\\]")).not.toBeNull();
    expect(container.querySelector(".size-\\[72px\\]")).not.toBeNull();
  });

  it("has no axe violations with each background", async () => {
    const { container } = render(
      <div>
        <MapCard layout="card" beatmapId={1} map={META} titleAs="h3" copyId />
        <MapCard layout="card" beatmapId={2} map={META} background="cover" titleAs="h3" />
        <MapCard layout="card" beatmapId={3} map={META} background="blur" titleAs="h3" />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
