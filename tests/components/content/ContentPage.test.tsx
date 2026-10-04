/**
 * @file tests/components/content/ContentPage.test.tsx
 * @desc Component tests for ContentPage: the h1 and description, the last-updated time, the copy
 *       button only when markdownHref is set, the JSON-LD script only when jsonLd is set, children
 *       inside the Prose wrapper, actions passed through, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentPage } from "../../../src/components/content/ContentPage.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("ContentPage", () => {
  it("renders the title as the h1 and the description as the lead", () => {
    render(
      <ContentPage title="Getting started" description="Pick a map pack and go.">
        <p>Body</p>
      </ContentPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Getting started" })).toBeInTheDocument();
    expect(screen.getByText("Pick a map pack and go.")).toBeInTheDocument();
  });

  it("renders no time and no copy button when lastUpdated and markdownHref are unset", () => {
    const { container } = render(
      <ContentPage title="Getting started">
        <p>Body</p>
      </ContentPage>,
    );
    expect(container.querySelector("time")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders a time element carrying lastUpdated as dateTime", () => {
    render(
      <ContentPage title="Getting started" lastUpdated="2026-10-04">
        <p>Body</p>
      </ContentPage>,
    );
    const time = document.querySelector('time[datetime="2026-10-04"]');
    expect(time).not.toBeNull();
    expect(time?.closest("div")?.textContent).toContain("Last updated");
  });

  it("uses a custom lastUpdatedLabel", () => {
    render(
      <ContentPage title="Getting started" lastUpdated="2026-10-04" lastUpdatedLabel="Updated">
        <p>Body</p>
      </ContentPage>,
    );
    expect(document.querySelector("time")?.parentElement?.textContent).toContain("Updated");
  });

  it("renders the copy-as-markdown button only when markdownHref is set", () => {
    render(
      <ContentPage title="Getting started" markdownHref="/docs/guide.md">
        <p>Body</p>
      </ContentPage>,
    );
    expect(screen.getByRole("button", { name: "Copy as Markdown" })).toBeInTheDocument();
  });

  it("renders the caller's actions alongside the time and copy button", () => {
    render(
      <ContentPage
        title="Getting started"
        lastUpdated="2026-10-04"
        markdownHref="/docs/guide.md"
        actions={<button type="button">Edit on GitHub</button>}
      >
        <p>Body</p>
      </ContentPage>,
    );
    expect(document.querySelector("time")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Copy as Markdown" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit on GitHub" })).toBeInTheDocument();
  });

  it("renders no script tag when jsonLd is unset, and one with the data when it is set", () => {
    const { container, rerender } = render(
      <ContentPage title="Getting started">
        <p>Body</p>
      </ContentPage>,
    );
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();

    rerender(
      <ContentPage title="Getting started" jsonLd={{ "@type": "TechArticle", name: "Guide" }}>
        <p>Body</p>
      </ContentPage>,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(script?.innerHTML).toContain("TechArticle");
  });

  it("renders children inside the Prose wrapper", () => {
    render(
      <ContentPage title="Getting started">
        <p>Body text</p>
      </ContentPage>,
    );
    const body = screen.getByText("Body text");
    expect(body.parentElement).toHaveClass("max-w-3xl");
  });

  it("has no axe violations with every slot filled", async () => {
    const { container } = render(
      <ContentPage
        title="Getting started"
        description="Pick a map pack and go."
        lastUpdated="2026-10-04"
        markdownHref="/docs/guide.md"
        jsonLd={{ "@type": "TechArticle", name: "Guide" }}
        actions={<button type="button">Edit on GitHub</button>}
      >
        <p>Body</p>
      </ContentPage>,
    );
    await expectNoAxeViolations(container);
  });
});
