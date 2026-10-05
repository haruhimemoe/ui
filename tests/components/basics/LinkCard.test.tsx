/**
 * @file tests/components/basics/LinkCard.test.tsx
 * @desc Component tests for LinkCard: the title/href shorthand, heading level, media layout and
 *       padding, a caller-placed CardLink, no-landmark, types, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardLink } from "../../../src/components/basics/CardLink.js";
import { LinkCard } from "../../../src/components/basics/LinkCard.js";
import { CARD_LINK_LIFT } from "../../../src/components/basics/surfaceStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("LinkCard", () => {
  it("renders the shorthand as one heading holding the one card link", () => {
    const { container } = render(
      <LinkCard title="packs" href="https://packs.haruhime.moe">
        <p>Packs from a mappool.</p>
      </LinkCard>,
    );
    const heading = screen.getByRole("heading", { level: 3, name: "packs" });
    expect(within(heading).getByRole("link", { name: "packs" })).toHaveAttribute(
      "href",
      "https://packs.haruhime.moe",
    );
    expect(container.querySelectorAll("[data-card-link]")).toHaveLength(1);
  });

  it("takes a heading level", () => {
    render(<LinkCard title="ui" href="/libraries/ui" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "ui" })).toBeInTheDocument();
  });

  it("puts media first, full-bleed, and the padding on the body", () => {
    const { container } = render(
      <LinkCard title="ui" href="/libraries/ui" media={<img alt="" src="/banner.svg" />}>
        <p>Body</p>
      </LinkCard>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.firstElementChild?.tagName).toBe("IMG");
    const body = root.children[1] as HTMLElement;
    expect(body).toHaveClass("p-5", "flex", "flex-col", "gap-4");
    expect(root.className.split(" ")).not.toContain("p-5");
  });

  it("pads the root without media and lifts every other control", () => {
    const { container } = render(<LinkCard title="ui" href="/libraries/ui" padding="md" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("p-4", "relative", "isolate", "overflow-hidden", "hover:bg-b3");
    expect(root).toHaveClass("focus-within:bg-b3", "rounded-[10px]", "bg-b4");
    for (const name of CARD_LINK_LIFT.split(" ")) expect(root).toHaveClass(name);
  });

  it("is no landmark", () => {
    const { container } = render(<LinkCard title="ui" href="/libraries/ui" />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("holds a caller-placed CardLink when there is no title", () => {
    render(
      <LinkCard className="sm:p-6">
        <h3>
          <CardLink href="https://pools.haruhime.moe">pools</CardLink>
        </h3>
      </LinkCard>,
    );
    expect(screen.getByRole("link", { name: "pools" })).toHaveAttribute("data-card-link");
  });

  it("needs href with title (types)", () => {
    // @ts-expect-error title and href come together
    const card = <LinkCard title="x" />;
    expect(card).toBeTruthy();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <LinkCard title="ui" href="/libraries/ui">
        <a href="https://github.com/haruhimemoe/ui">GitHub</a>
        <button type="button">Copy</button>
      </LinkCard>,
    );
    await expectNoAxeViolations(container);
  });
});
