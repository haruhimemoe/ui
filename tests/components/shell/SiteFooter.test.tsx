/**
 * @file tests/components/shell/SiteFooter.test.tsx
 * @desc Component tests for SiteFooter: link columns from data, text-only entries with notes,
 *       internal and external links, extra slot, fine print, parent wordmark and GitHub links,
 *       native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { SiteFooter, type SiteFooterColumn } from "../../../src/components/shell/SiteFooter.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const COLUMNS: SiteFooterColumn[] = [
  {
    title: "Tools",
    items: [
      { label: "packs", href: "https://packs.haruhime.moe" },
      { label: "pools", note: "soon" },
      { label: "sheets", note: "soon" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Brand", href: "/brand" },
      { label: "hi@example.com", href: "mailto:hi@example.com" },
    ],
  },
  { title: "Legal", items: [{ label: "Disclaimer", href: "/disclaimer" }] },
];

describe("SiteFooter", () => {
  it("renders a contentinfo landmark on the dark footer background", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(screen.getByRole("contentinfo")).toHaveClass(
      "border-t",
      "border-b4",
      "bg-b6",
      "text-c3",
      "text-sm",
    );
  });

  it("renders one labelled navigation per column with its title", () => {
    render(<SiteFooter columns={COLUMNS} />);
    for (const { title } of COLUMNS) {
      const nav = screen.getByRole("navigation", { name: title });
      expect(within(nav).getByText(title)).toHaveClass("uppercase", "text-xs", "text-c4");
    }
    const about = screen.getByRole("navigation", { name: "About" });
    expect(within(about).getByRole("link", { name: "Brand" })).toHaveAttribute("href", "/brand");
    expect(within(about).getByRole("link", { name: "hi@example.com" })).toHaveAttribute(
      "href",
      "mailto:hi@example.com",
    );
  });

  it("shows entries without an href as plain text with a small uppercase note", () => {
    render(<SiteFooter columns={COLUMNS} />);
    const tools = screen.getByRole("navigation", { name: "Tools" });
    expect(within(tools).getAllByRole("link")).toHaveLength(1);
    expect(within(tools).getByRole("link", { name: "packs" })).toHaveAttribute(
      "href",
      "https://packs.haruhime.moe",
    );
    for (const name of ["pools", "sheets"]) {
      expect(within(tools).getByText(name).parentElement).toHaveTextContent(`${name} soon`);
    }
    expect(within(tools).getAllByText("soon")[0]).toHaveClass("text-xs", "uppercase", "text-c4");
  });

  it("shows a note beside a link too", () => {
    render(
      <SiteFooter
        columns={[{ title: "Tools", items: [{ label: "packs", href: "/", note: "new" }] }]}
      />,
    );
    expect(screen.getByRole("link", { name: "packs" }).parentElement).toHaveTextContent(
      "packs new",
    );
  });

  it("sizes the column grid to the number of columns and skips it with none", () => {
    const { rerender } = render(<SiteFooter columns={COLUMNS} />);
    const grid = () => screen.getByRole("navigation", { name: "Legal" }).parentElement;
    expect(grid()).toHaveClass("grid", "sm:grid-cols-3");

    rerender(<SiteFooter columns={COLUMNS.slice(1)} />);
    expect(grid()).toHaveClass("sm:grid-cols-2");

    rerender(
      <SiteFooter
        columns={[...COLUMNS, { title: "More", items: [] }, { title: "Extra", items: [] }]}
      />,
    );
    expect(grid()).toHaveClass("sm:grid-cols-4");

    rerender(<SiteFooter columns={[{ title: "Legal", items: [] }]} />);
    expect(grid()).toHaveClass("grid");
    expect(grid()?.className).not.toMatch(/grid-cols/);

    rerender(<SiteFooter />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("renders extra above the fine print, and the wordmark and GitHub icon on the last row", () => {
    render(
      <SiteFooter
        columns={COLUMNS}
        extra={<button type="button">Clear local data</button>}
        finePrint="Not affiliated with osu!."
      />,
    );
    const button = screen.getByRole("button", { name: "Clear local data" });
    const fine = screen.getByText("Not affiliated with osu!.");
    expect(fine.tagName).toBe("P");
    expect(fine).toHaveClass("text-c4", "text-xs");
    expect(button.compareDocumentPosition(fine) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const parent = screen.getByRole("link", { name: "haruhime.moe" });
    const github = screen.getByRole("link", { name: "haruhimemoe on GitHub" });
    expect(parent.parentElement).toBe(github.parentElement);
    expect(parent.parentElement).toHaveClass("justify-between");
    expect(fine.compareDocumentPosition(parent) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("links the parent brand with the inline haruhime.moe wordmark by default", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: "haruhime.moe" });
    expect(link).toHaveAttribute("href", "https://www.haruhime.moe");
    expect(link).toHaveClass("opacity-80", "hover:opacity-100");
    // The link carries the name; the wordmark inside is decorative, so it is not read twice.
    const svg = link.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(within(link).queryByRole("img")).toBeNull();
  });

  it("takes a custom parent href, and drops the wordmark with parentLink={false}", () => {
    const { rerender } = render(<SiteFooter parentHref="https://example.com" />);
    expect(screen.getByRole("link", { name: "haruhime.moe" })).toHaveAttribute(
      "href",
      "https://example.com",
    );

    rerender(<SiteFooter parentLink={false} finePrint="Fine print." />);
    expect(screen.queryByRole("link", { name: "haruhime.moe" })).toBeNull();
    // Without the wordmark the fine print shares the row with the GitHub icon.
    const github = screen.getByRole("link", { name: "haruhimemoe on GitHub" });
    expect(screen.getByText("Fine print.").parentElement).toBe(github.parentElement);
  });

  it("links the haruhimemoe GitHub org with a decorative icon by default", () => {
    render(<SiteFooter />);
    const link = screen.getByRole("link", { name: "haruhimemoe on GitHub" });
    expect(link).toHaveAttribute("href", "https://github.com/haruhimemoe");
    expect(link).toHaveClass("text-c3", "hover:text-c1");
    const svg = link.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", "0 0 16 16");
  });

  it("takes a custom GitHub href and label, or leaves the icon out", () => {
    const { rerender } = render(
      <SiteFooter githubHref="https://github.com/haruhimemoe/ui" githubLabel="Source on GitHub" />,
    );
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/haruhimemoe/ui",
    );

    rerender(<SiteFooter githubHref={false} />);
    expect(screen.queryByRole("link", { name: /GitHub/ })).toBeNull();
    expect(screen.getByRole("link", { name: "haruhime.moe" })).toBeInTheDocument();
  });

  it("renders no bottom row when there is nothing to put in it", () => {
    render(<SiteFooter columns={COLUMNS} parentLink={false} githubHref={false} />);
    expect(screen.getByRole("contentinfo").querySelector(".pt-6")).toBeNull();
  });

  it("renders extra alone, with no empty row under it, when the links are off", () => {
    render(
      <SiteFooter
        parentLink={false}
        githubHref={false}
        extra={<button type="button">Clear local data</button>}
      />,
    );
    const section = screen.getByRole("button").parentElement;
    expect(section).toHaveClass("border-t", "pt-6");
    expect(section?.children).toHaveLength(1);
  });

  it("renders the fine print alone when it is the only thing in the bottom row", () => {
    render(<SiteFooter parentLink={false} githubHref={false} finePrint="Only this." />);
    const fine = screen.getByText("Only this.");
    expect(fine.parentElement).toHaveClass("justify-between");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("appends a caller className last and passes footer props and a ref through", () => {
    const ref = createRef<HTMLElement>();
    render(<SiteFooter ref={ref} className="mt-10" data-testid="foot" />);
    const footer = screen.getByRole("contentinfo");
    expect(ref.current).toBe(footer);
    expect(footer.className.endsWith(" mt-10")).toBe(true);
    expect(footer).toHaveAttribute("data-testid", "foot");
  });

  it("has no axe violations with everything on, and with the wordmark off", async () => {
    const { container } = render(
      <div>
        <SiteFooter
          columns={COLUMNS}
          extra={<button type="button">Clear local data</button>}
          finePrint="Not affiliated with osu! or ppy Pty Ltd."
        />
        <SiteFooter
          columns={[{ title: "Site", items: [{ label: "Thanks", href: "/thanks" }] }]}
          parentLink={false}
          finePrint="Fine print."
          githubLabel="haruhimemoe org on GitHub"
        />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
