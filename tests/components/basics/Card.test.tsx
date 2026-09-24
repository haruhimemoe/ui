/**
 * @file tests/components/basics/Card.test.tsx
 * @desc Component tests for Card: panel classes, optional title labelling the region, its heading
 *       level, native props, className, ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Card } from "../../../src/components/basics/Card.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Card", () => {
  it("renders a titled card as a region labelled by its h2", () => {
    render(
      <Card title="Beatmaps">
        <p>12 maps</p>
      </Card>,
    );
    const region = screen.getByRole("region", { name: "Beatmaps" });
    const heading = screen.getByRole("heading", { level: 2, name: "Beatmaps" });
    expect(region).toContainElement(heading);
    expect(region).toHaveAttribute("aria-labelledby", heading.id);
    expect(heading).toHaveClass("mb-2", "font-bold", "text-c1", "text-lg");
    expect(screen.getByText("12 maps")).toBeInTheDocument();
  });

  it("renders the title at the heading level asked for, still labelling the region", () => {
    for (const level of [3, 4] as const) {
      const { unmount } = render(
        <Card title="Mods" headingLevel={level}>
          Body
        </Card>,
      );
      const heading = screen.getByRole("heading", { level, name: "Mods" });
      expect(heading.tagName).toBe(`H${level}`);
      expect(heading).toHaveClass("mb-2", "font-bold", "text-c1", "text-lg");
      expect(screen.getByRole("region", { name: "Mods" })).toHaveAttribute(
        "aria-labelledby",
        heading.id,
      );
      unmount();
    }
  });

  it("defaults to an h2 and renders no heading for headingLevel alone", () => {
    const { container, rerender } = render(<Card title="Stats">Body</Card>);
    expect(screen.getByRole("heading", { name: "Stats" }).tagName).toBe("H2");

    rerender(<Card headingLevel={3}>Body</Card>);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(container.querySelector("section")).not.toHaveAttribute("headinglevel");
  });

  it("uses the osu!-web panel classes", () => {
    const { container } = render(<Card>Body</Card>);
    expect(container.firstElementChild).toHaveClass("rounded-[10px]", "bg-b4", "p-5", "text-c2");
  });

  it("renders no heading and no label without a title", () => {
    const { container } = render(<Card>Body</Card>);
    const section = container.querySelector("section");
    expect(section).not.toHaveAttribute("aria-labelledby");
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("takes rich content as the title", () => {
    render(
      <Card
        title={
          <>
            Settings <small>beta</small>
          </>
        }
      >
        Body
      </Card>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Settings beta");
  });

  it("gives each card its own heading id", () => {
    render(
      <div>
        <Card title="One">a</Card>
        <Card title="Two">b</Card>
      </div>,
    );
    const [one, two] = screen.getAllByRole("heading", { level: 2 });
    expect(one?.id).toBeTruthy();
    expect(one?.id).not.toBe(two?.id);
  });

  it("appends a caller className and passes native props and ref through", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Card ref={ref} title="Stats" className="mt-4" id="stats" data-testid="card">
        Body
      </Card>,
    );
    expect(ref.current).toBe(screen.getByTestId("card"));
    expect(ref.current).toHaveAttribute("id", "stats");
    expect(ref.current?.className.endsWith(" mt-4")).toBe(true);
  });

  it("lets a caller class replace a built-in one that sets the same property", () => {
    render(
      <Card className="p-3" data-testid="card">
        Body
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("p-3");
    expect(card).not.toHaveClass("p-5");
  });

  it("lets the caller override the accessible name", () => {
    render(
      <Card title="Shown" aria-label="Hidden name" aria-labelledby={undefined}>
        Body
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Hidden name" })).toBeInTheDocument();
  });

  it("has no axe violations with and without a title, and nested under another card", async () => {
    const { container } = render(
      <main>
        <Card title="Titled">
          <p>Text</p>
          <Card title="Nested" headingLevel={3}>
            <p>Inside</p>
          </Card>
        </Card>
        <Card>
          <p>Untitled</p>
        </Card>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
