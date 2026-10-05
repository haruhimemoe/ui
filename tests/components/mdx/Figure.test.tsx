/**
 * @file tests/components/mdx/Figure.test.tsx
 * @desc Figure: the sized, lazy image with caption then credit, and the eager/high-priority hero
 *       case with no caption.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Figure } from "../../../src/components/mdx/Figure.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Figure", () => {
  it("renders the sized image with caption then credit", async () => {
    const { container } = render(
      <Figure
        src="/a.png"
        alt="Qualifier lobby"
        width={640}
        height={360}
        caption="Lobby 3"
        credit="Photo: Ref"
      />,
    );
    const img = screen.getByRole("img", { name: "Qualifier lobby" });
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveAttribute("loading", "lazy");
    const caption = container.querySelector("figcaption");
    expect(caption?.textContent).toBe("Lobby 3Photo: Ref");
    expect(screen.getByText("Photo: Ref")).toHaveClass("text-c4");
    await expectNoAxeViolations(container);
  });

  it("loads eagerly with high priority for a hero image, and has no caption when none is given", () => {
    const { container } = render(<Figure src="/a.png" alt="" width={1} height={1} priority />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
    expect(container.querySelector("figcaption")).toBeNull();
  });
});
