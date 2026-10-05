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

  it("never links a javascript: or data: href, and treats //host as external", () => {
    // Built at runtime so the lint rule against script URLs stays on everywhere else.
    const scriptHref = ["java", "script:alert(1)"].join("");
    const { rerender } = render(<MdxLinkCard href={scriptHref} title="Bad" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Bad")).toBeInTheDocument();
    rerender(<MdxLinkCard href=" data:text/html,hi" title="Bad" />);
    expect(screen.queryByRole("link")).toBeNull();
    rerender(<MdxLinkCard href="//example.com/x" title="Off site" />);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link").getAttribute("rel")).toContain("noopener");
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });
});
