/**
 * @file tests/components/content/ContentPage.article.test.tsx
 * @desc ContentPage's article parts: formatted dates, "Updated" only when it differs from
 *       published, impossible dates printed as given, reading time, the byline (with and without
 *       osu! ids, joined "A, B and C"), toc before the body in the DOM, footer after, proseSize.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentPage } from "../../../src/components/content/ContentPage.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("ContentPage article parts", () => {
  it("prints ISO dates formatted inside time[datetime]", () => {
    render(
      <ContentPage title="T" lastUpdated="2026-10-04">
        <p>B</p>
      </ContentPage>,
    );
    const time = document.querySelector('time[datetime="2026-10-04"]');
    expect(time?.textContent).toBe("Oct 4, 2026");
    expect(time?.parentElement?.textContent).toBe("Last updated Oct 4, 2026");
  });

  it("prints a non-ISO lastUpdated as given", () => {
    render(
      <ContentPage title="T" lastUpdated="October 2026">
        <p>B</p>
      </ContentPage>,
    );
    expect(document.querySelector("time")?.textContent).toBe("October 2026");
  });

  it("shows published, then Updated only when it differs, then reading time, dot-separated", async () => {
    const { container, rerender } = render(
      <ContentPage title="T" published="2026-10-01" lastUpdated="2026-10-04" readingMinutes={6}>
        <p>B</p>
      </ContentPage>,
    );
    const meta = document.querySelector('time[datetime="2026-10-01"]')?.parentElement;
    expect(meta?.textContent).toBe("Oct 1, 2026·Updated Oct 4, 2026·6 min read");
    expect(meta?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    await expectNoAxeViolations(container);
    rerender(
      <ContentPage title="T" published="2026-10-04" lastUpdated="2026-10-04">
        <p>B</p>
      </ContentPage>,
    );
    expect(screen.queryByText(/Updated/)).toBeNull();
    expect(document.querySelectorAll("time")).toHaveLength(1);
  });

  it("survives an impossible published date", () => {
    render(
      <ContentPage title="T" published="2026-02-30" lastUpdated="2026-03-02">
        <p>B</p>
      </ContentPage>,
    );
    expect(document.querySelector('time[datetime="2026-02-30"]')?.textContent).toBe("2026-02-30");
    expect(screen.getByText(/Updated/).textContent).toBe("Updated Mar 2, 2026");
  });

  it("links authors with an osu! id or href, avatars from the id, names joined", async () => {
    const { container } = render(
      <ContentPage
        title="T"
        authors={[
          { name: "David", userId: 2 },
          { name: "Ref", href: "https://x.example/ref", avatarUrl: "/ref.png" },
          { name: "Guest" },
        ]}
      >
        <p>B</p>
      </ContentPage>,
    );
    expect(screen.getByRole("link", { name: "David" })).toHaveAttribute(
      "href",
      "https://osu.ppy.sh/users/2",
    );
    expect(screen.getByRole("link", { name: "David" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Ref" })).toHaveAttribute(
      "href",
      "https://x.example/ref",
    );
    expect(screen.queryByRole("link", { name: "Guest" })).toBeNull();
    const imgs = [...container.querySelectorAll("img")].map((img) => img.getAttribute("src"));
    expect(imgs).toEqual(["https://a.ppy.sh/2", "/ref.png"]);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.getByText("Guest").parentElement?.textContent).toBe("David, Ref and Guest");
    await expectNoAxeViolations(container);
  });

  it("joins two authors with and, and skips a link when href is null", () => {
    render(
      <ContentPage title="T" authors={[{ name: "A", userId: 1, href: null }, { name: "B" }]}>
        <p>B</p>
      </ContentPage>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("B", { selector: "span" }).parentElement?.textContent).toContain(
      "A and B",
    );
  });

  it("puts the toc before the body in the DOM and the footer after it, and passes proseSize", () => {
    render(
      <ContentPage
        title="T"
        toc={<nav aria-label="On this page">toc</nav>}
        footer={<nav aria-label="More guides">pn</nav>}
        proseSize="sm"
      >
        <p>Body text</p>
      </ContentPage>,
    );
    const toc = screen.getByRole("navigation", { name: "On this page" });
    const body = screen.getByText("Body text");
    const footer = screen.getByRole("navigation", { name: "More guides" });
    expect(toc.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(body.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(toc.parentElement).toHaveClass("xl:order-2");
    expect(body.parentElement).toHaveClass("max-w-3xl", "text-sm");
    expect(footer.parentElement).toHaveClass("mt-10");
  });
});
