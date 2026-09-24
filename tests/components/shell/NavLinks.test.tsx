/**
 * @file tests/components/shell/NavLinks.test.tsx
 * @desc Component tests for NavLinks: links from data, aria-current from the pathname, text-only
 *       entries, the server-only list when no link can be current, alignment, keyboard order,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavLinks } from "../../../src/components/shell/NavLinks.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const router = vi.hoisted(() => ({ pathname: "/" as string | null }));
// The list's only client hook. No call means NavLinks rendered no client component.
const usePathname = vi.hoisted(() => vi.fn(() => router.pathname));
vi.mock("next/navigation", () => ({ usePathname }));

const LINKS = [
  { href: "/new", label: "New pack" },
  { href: "/packs", label: "Public packs" },
  { href: "https://github.com/haruhimemoe", label: "GitHub" },
  { label: "pools", note: "soon" },
];

// Nothing here can be the current page: external links, a relative one and a text-only entry.
const OFFSITE = [
  { href: "https://github.com/haruhimemoe", label: "GitHub" },
  { href: "#main", label: "Top" },
  { label: "pools", note: "soon" },
];

describe("NavLinks", () => {
  beforeEach(() => {
    router.pathname = "/";
    usePathname.mockClear();
  });

  it("renders one list item per entry, links with their hrefs", () => {
    render(<NavLinks links={LINKS} />);
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "New pack" })).toHaveAttribute("href", "/new");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/haruhimemoe",
    );
  });

  it("marks the link for the current path with aria-current=page and lights it", () => {
    router.pathname = "/packs";
    render(<NavLinks links={LINKS} />);
    const current = screen.getByRole("link", { name: "Public packs" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveClass("text-c1");
    expect(current).not.toHaveClass("text-c3");
    const other = screen.getByRole("link", { name: "New pack" });
    expect(other).not.toHaveAttribute("aria-current");
    expect(other).toHaveClass("text-c3", "hover:text-c1");
  });

  it("marks a section link with aria-current=true on a page under it", () => {
    router.pathname = "/packs/abc";
    render(<NavLinks links={LINKS} />);
    expect(screen.getByRole("link", { name: "Public packs" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("marks nothing outside the app router, where the pathname is null", () => {
    router.pathname = null;
    render(<NavLinks links={LINKS} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("shows entries without an href as dimmed text with their note, not as links", () => {
    render(<NavLinks links={[...LINKS, { label: "sheets" }]} />);
    expect(screen.getAllByRole("link")).toHaveLength(3);
    const pools = screen.getByText("pools");
    expect(pools).toHaveAttribute("aria-disabled", "true");
    expect(pools).toHaveClass("text-c4");
    expect(pools).toHaveTextContent("pools soon");
    expect(screen.getByText("soon")).toHaveClass("text-xs", "uppercase");
    expect(screen.getByText("sheets")).toHaveTextContent(/^sheets$/);
  });

  it("uses the compact left-aligned list by default and the centered one on request", () => {
    const { rerender } = render(<NavLinks links={LINKS} />);
    expect(screen.getByRole("list")).toHaveClass("flex-wrap", "text-sm", "gap-x-5");
    expect(screen.getByRole("link", { name: "New pack" })).toHaveClass("text-c3");

    rerender(<NavLinks links={LINKS} align="center" />);
    const list = screen.getByRole("list");
    expect(list).toHaveClass("flex-wrap", "justify-center", "gap-x-6");
    expect(list).not.toHaveClass("text-sm");
    expect(screen.getByRole("link", { name: "New pack" })).toHaveClass("text-c2");
  });

  it("appends a caller className last and passes list props and a ref through", () => {
    const ref = createRef<HTMLUListElement>();
    render(<NavLinks ref={ref} links={LINKS} className="mt-1" data-testid="nav" />);
    const list = screen.getByRole("list");
    expect(ref.current).toBe(list);
    expect(list.className.endsWith(" mt-1")).toBe(true);
    expect(list).toHaveAttribute("data-testid", "nav");
  });

  it("renders on the server alone, with the same markup, when no link can be the current page", () => {
    const ref = createRef<HTMLUListElement>();
    const { container, unmount } = render(
      <NavLinks ref={ref} links={OFFSITE} align="center" className="mt-1" data-testid="nav" />,
    );
    expect(usePathname).not.toHaveBeenCalled();
    expect(ref.current).toBe(screen.getByTestId("nav"));
    const serverOnly = container.innerHTML;
    unmount();

    // The same entries plus one internal link go through the client list. Without that link's
    // item, the markup matches.
    const withInternal = render(
      <NavLinks
        links={[...OFFSITE, { href: "/new", label: "New pack" }]}
        align="center"
        className="mt-1"
        data-testid="nav"
      />,
    ).container;
    expect(usePathname).toHaveBeenCalled();
    withInternal.querySelector("li:last-child")?.remove();
    expect(withInternal.innerHTML).toBe(serverOnly);
  });

  it("puts the links in tab order and skips text-only entries", async () => {
    const user = userEvent.setup();
    render(<NavLinks links={LINKS} />);
    await user.tab();
    expect(screen.getByRole("link", { name: "New pack" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Public packs" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it("has no axe violations with a current link and a text-only entry", async () => {
    router.pathname = "/new";
    const { container } = render(
      <nav aria-label="Main">
        <NavLinks links={LINKS} />
      </nav>,
    );
    await expectNoAxeViolations(container);
  });
});
