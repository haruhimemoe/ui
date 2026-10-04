/**
 * @file tests/components/osu/PlayerCard.test.tsx
 * @desc Component tests for PlayerCard: the profile link and its overrides, avatar and stand-in,
 *       flags and their alt text, the team flag, the supporter heart, the status row (ring only
 *       with a status, default text, left out when empty), the animated-cover class, native
 *       props, and axe on a full, a minimal and an online card.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlayerCard } from "../../../src/components/osu/PlayerCard.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const FULL = {
  username: "peppy",
  userId: 2,
  coverUrl: "https://assets.ppy.sh/user-profile-covers/2/cover.jpeg",
  countryCode: "AU",
  team: { name: "mom?", flagUrl: "https://assets.ppy.sh/teams/flag/1/flag.png" },
  supporter: true,
} as const;

describe("PlayerCard", () => {
  it("links the whole card to the osu! profile and loads the avatar from a.ppy.sh", () => {
    const { container } = render(<PlayerCard {...FULL} />);
    const link = screen.getByRole("link", { name: "peppy" });
    expect(link).toHaveAttribute("href", "https://osu.ppy.sh/users/2");
    expect(link).not.toHaveAttribute("target");
    expect(link.className).toContain("after:inset-0");
    expect(container.querySelector('img[src="https://a.ppy.sh/2"]')).toHaveAttribute("alt", "");
    expect(container.firstElementChild?.className).toContain("hover:outline-2");
  });

  it("takes an href override, and null draws no link", () => {
    const { rerender } = render(<PlayerCard {...FULL} href="https://example.test/p" />);
    expect(screen.getByRole("link", { name: "peppy" })).toHaveAttribute(
      "href",
      "https://example.test/p",
    );
    rerender(<PlayerCard {...FULL} href={null} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("peppy").tagName).toBe("SPAN");
  });

  it("draws osu!'s country flag named by the country, and none for a bad code", () => {
    const { rerender } = render(<PlayerCard {...FULL} />);
    expect(screen.getByRole("img", { name: "Australia" })).toHaveAttribute(
      "src",
      "https://osu.ppy.sh/assets/images/flags/1f1e6-1f1fa.svg",
    );
    rerender(<PlayerCard {...FULL} countryName="Down Under" />);
    expect(screen.getByRole("img", { name: "Down Under" })).toBeInTheDocument();
    rerender(<PlayerCard {...FULL} countryCode="AUS" />);
    expect(screen.queryByRole("img", { name: /Australia|Down Under/ })).toBeNull();
  });

  it("draws the team flag with its name, and the supporter heart with its label", () => {
    const { rerender } = render(<PlayerCard {...FULL} />);
    const teamFlag = screen.getByRole("img", { name: "mom?" });
    expect(teamFlag).toHaveAttribute("title", "mom?");
    expect(teamFlag).toHaveAttribute("src", FULL.team.flagUrl);
    expect(screen.getByRole("img", { name: "osu! supporter" })).toBeInTheDocument();
    rerender(<PlayerCard {...FULL} supporterLabel="supporter" />);
    expect(screen.getByRole("img", { name: "supporter" })).toBeInTheDocument();
    rerender(<PlayerCard username="Rikki" />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("stands a letter in for the avatar without an id, skipping punctuation", () => {
    const { container } = render(<PlayerCard username="-Tynamo" />);
    expect(container.querySelector("img")).toBeNull();
    const letter = screen.getByText("T");
    expect(letter).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("uses an avatarUrl override over the id", () => {
    const { container } = render(<PlayerCard {...FULL} avatarUrl="https://example.test/a.png" />);
    expect(container.querySelector('img[src="https://example.test/a.png"]')).not.toBeNull();
    expect(container.querySelector('img[src="https://a.ppy.sh/2"]')).toBeNull();
  });

  it("draws the status ring only with a status, with default text", () => {
    const { container, rerender } = render(<PlayerCard {...FULL} status="offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(container.querySelector(".border-b6")).not.toBeNull();
    rerender(<PlayerCard {...FULL} status="online" statusNote="Last seen 29 days ago" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
    expect(screen.getByText("Last seen 29 days ago")).toBeInTheDocument();
    expect(container.querySelector(".border-lime-400")).not.toBeNull();
    rerender(<PlayerCard {...FULL} statusText="osu!" statusNote="formerly ppy" />);
    expect(screen.getByText("osu!")).toBeInTheDocument();
    expect(container.querySelector(".rounded-full.border-4")).toBeNull();
  });

  it("leaves the status row out when there is nothing to say", () => {
    const { container } = render(<PlayerCard {...FULL} />);
    expect(container.querySelector(".pb-2\\.5")).toBeNull();
  });

  it("hides an animated cover for reduced motion, and keeps a still one", () => {
    const { container, rerender } = render(
      <PlayerCard {...FULL} coverUrl="https://assets.ppy.sh/c/x.gif" />,
    );
    const cover = () => container.querySelector('img[src*="assets.ppy.sh/c/"], img[src*="cover"]');
    expect(cover()?.className).toContain("motion-reduce:hidden");
    rerender(<PlayerCard {...FULL} />);
    expect(cover()?.className).not.toContain("motion-reduce:hidden");
  });

  it("passes native props through and merges className last", () => {
    const { container } = render(
      <PlayerCard username="x" data-testid="card" className="h-auto" title="t" />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-testid", "card");
    expect(root).toHaveAttribute("title", "t");
    expect(root?.className).toContain("h-auto");
    expect(root?.className).not.toContain("h-[120px]");
  });

  it("has no axe violations: full, minimal and online", async () => {
    const { container } = render(
      <ul>
        <li>
          <PlayerCard {...FULL} statusText="osu!" statusNote="formerly ppy" />
        </li>
        <li>
          <PlayerCard username="token" statusText="BoBERT" />
        </li>
        <li>
          <PlayerCard {...FULL} username="peppy2" status="online" />
        </li>
      </ul>,
    );
    await expectNoAxeViolations(container);
  });
});
