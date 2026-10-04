/**
 * @file tests/components/content/ContentLayout.test.tsx
 * @desc Component tests for ContentLayout: the nav slot and children both render, the grid
 *       classes, native div props and a merged className, axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentLayout } from "../../../src/components/content/ContentLayout.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("ContentLayout", () => {
  it("renders the nav slot and the children, children inside a min-w-0 wrapper", () => {
    render(
      <ContentLayout nav={<nav aria-label="Docs">Nav</nav>}>
        <p>Page body</p>
      </ContentLayout>,
    );
    expect(screen.getByRole("navigation", { name: "Docs" })).toBeInTheDocument();
    const body = screen.getByText("Page body");
    expect(body.parentElement).toHaveClass("min-w-0");
  });

  it("uses the bb grid classes", () => {
    render(
      <ContentLayout nav={<nav aria-label="Docs">Nav</nav>} data-testid="layout">
        <p>Page body</p>
      </ContentLayout>,
    );
    expect(screen.getByTestId("layout")).toHaveClass(
      "grid",
      "grid-cols-1",
      "gap-6",
      "lg:grid-cols-[14rem_minmax(0,1fr)]",
      "lg:gap-10",
    );
  });

  it("merges a caller className last and passes other native div props through", () => {
    render(
      <ContentLayout nav={<nav aria-label="Docs">Nav</nav>} data-testid="layout" className="mt-8">
        <p>Page body</p>
      </ContentLayout>,
    );
    const layout = screen.getByTestId("layout");
    expect(layout.className.endsWith(" mt-8")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ContentLayout nav={<nav aria-label="Docs">Nav</nav>}>
        <p>Page body</p>
      </ContentLayout>,
    );
    await expectNoAxeViolations(container);
  });
});
