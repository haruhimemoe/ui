/**
 * @file tests/components/basics/Surface.test.tsx
 * @desc Component tests for Surface and surfaceClasses: each element, the padding map, a caller
 *       padding replacing the built-in one, native props, the contrast and forced-colors
 *       classes, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Surface } from "../../../src/components/basics/Surface.js";
import { surfaceClasses } from "../../../src/components/basics/surfaceStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const BOX = ["rounded-[10px]", "bg-b4", "text-c2"];

describe("Surface", () => {
  it("renders a div by default with the box and p-3", () => {
    const { container } = render(<Surface>Body</Surface>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass(...BOX, "p-3");
  });

  it("renders every listed element", () => {
    for (const as of ["section", "article", "form", "p"] as const) {
      const { container, unmount } = render(<Surface as={as}>Body</Surface>);
      expect(container.firstElementChild?.tagName).toBe(as.toUpperCase());
      unmount();
    }
    const { container } = render(
      <ul>
        <Surface as="li">Row</Surface>
      </ul>,
    );
    expect(container.querySelector("li")).toHaveClass(...BOX);
  });

  it("maps padding sm, md and lg to p-3, p-4 and p-5", () => {
    expect(surfaceClasses().split(" ")).toContain("p-3");
    expect(surfaceClasses({ padding: "md" }).split(" ")).toContain("p-4");
    expect(surfaceClasses({ padding: "lg" }).split(" ")).toContain("p-5");
  });

  it("lets a caller p-0 replace the built-in padding", () => {
    const { container } = render(<Surface className="p-0">Cover</Surface>);
    const classes = (container.firstElementChild as HTMLElement).className.split(" ");
    expect(classes).toContain("p-0");
    expect(classes).not.toContain("p-3");
  });

  it("keeps the high contrast ring and the forced-colors border", () => {
    expect(surfaceClasses().split(" ")).toEqual(
      expect.arrayContaining([
        "contrast-more:inset-ring",
        "contrast-more:inset-ring-c4",
        "forced-colors:border",
      ]),
    );
  });

  it("passes native props through", () => {
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <>
        <Surface as="section" aria-label="Flag">
          Flags
        </Surface>
        <Surface as="form" aria-label="Pool" onSubmit={onSubmit}>
          <button type="submit">Run</button>
        </Surface>
      </>,
    );
    expect(screen.getByRole("region", { name: "Flag" })).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("form", { name: "Pool" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ul>
        <Surface as="li">Row</Surface>
        <Surface as="li" padding="lg">
          Row
        </Surface>
      </ul>,
    );
    await expectNoAxeViolations(container);
  });
});
