/**
 * @file tests/components/mdx/MdxLinkCard.test.tsx
 * @desc MdxLinkCard: one link named by the title, a hostname source line for an off-site href,
 *       no heading, and no source line for a path unless one is given.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MdxLinkCard } from "../../../src/components/mdx/MdxLinkCard.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("MdxLinkCard", () => {
  it("is one link named by the title, opening off-site links in a new tab, no heading", async () => {
    const { container } = render(
      <MdxLinkCard
        href="https://osu.ppy.sh/wiki/en/Tournaments"
        title="Tournament wiki"
        description="Rules and support"
      />,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName("Tournament wiki, opens in a new tab");
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]?.getAttribute("rel")).toContain("noopener");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("osu.ppy.sh")).toBeInTheDocument();
    expect(screen.getByText("Rules and support")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows no source line for a path unless given one, and no new-tab text", () => {
    const { rerender } = render(<MdxLinkCard href="/guides/seeding" title="Seeding" />);
    expect(screen.getByRole("link")).toHaveAccessibleName("Seeding");
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
    rerender(<MdxLinkCard href="/guides/seeding" title="Seeding" source="packs.haruhime.moe" />);
    expect(screen.getByText("packs.haruhime.moe")).toBeInTheDocument();
  });
});
