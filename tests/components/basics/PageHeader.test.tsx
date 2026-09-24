/**
 * @file tests/components/basics/PageHeader.test.tsx
 * @desc Component tests for PageHeader: h1 title, optional lead, meta and actions, native props,
 *       className, ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "../../../src/components/basics/Button.js";
import { PageHeader } from "../../../src/components/basics/PageHeader.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("PageHeader", () => {
  it("renders the title as the page's h1 at the shared scale", () => {
    render(<PageHeader title="Packs" />);
    const heading = screen.getByRole("heading", { level: 1, name: "Packs" });
    expect(heading).toHaveClass("font-extrabold", "text-3xl", "sm:text-4xl", "text-c1");
  });

  it("renders only the title when no slots are given", () => {
    const { container } = render(<PageHeader title="Alone" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  it("renders the lead, meta and actions slots", () => {
    render(
      <PageHeader
        title="My pack"
        lead="Ranked maps from 2024."
        meta="Updated today"
        actions={<Button>Export</Button>}
      />,
    );
    expect(screen.getByText("Ranked maps from 2024.")).toHaveClass("text-c3", "max-w-2xl");
    expect(screen.getByText("Updated today")).toHaveClass("text-c4", "text-sm");
    const export_ = screen.getByRole("button", { name: "Export" });
    expect(export_.parentElement).toHaveClass("flex", "flex-wrap", "items-center", "gap-2");
  });

  it("appends a caller className and passes native props and ref through", () => {
    const ref = createRef<HTMLDivElement>();
    render(<PageHeader ref={ref} title="Docs" className="mb-8" data-testid="header" id="top" />);
    expect(ref.current).toBe(screen.getByTestId("header"));
    expect(ref.current).toHaveAttribute("id", "top");
    expect(ref.current).toHaveClass("flex", "justify-between");
    expect(ref.current?.className.endsWith(" mb-8")).toBe(true);
  });

  it("has no axe violations with every slot filled", async () => {
    const { container } = render(
      <main>
        <PageHeader
          title="Settings"
          lead="Manage your account."
          meta="Signed in"
          actions={<Button variant="secondary">Sign out</Button>}
        />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
