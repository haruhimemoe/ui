/**
 * @file tests/components/basics/Card.test.tsx
 * @desc Component tests for Card: panel classes, optional h2 title labelling the region, native
 *       props, className, ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
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

  it("lets the caller override the accessible name", () => {
    render(
      <Card title="Shown" aria-label="Hidden name" aria-labelledby={undefined}>
        Body
      </Card>,
    );
    expect(screen.getByRole("region", { name: "Hidden name" })).toBeInTheDocument();
  });

  it("has no axe violations with and without a title", async () => {
    const { container } = render(
      <main>
        <Card title="Titled">
          <p>Text</p>
        </Card>
        <Card>
          <p>Untitled</p>
        </Card>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
