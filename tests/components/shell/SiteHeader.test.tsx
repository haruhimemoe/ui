/**
 * @file tests/components/shell/SiteHeader.test.tsx
 * @desc Component tests for SiteHeader: brand slot, nav from data with aria-current, alignment,
 *       actions slot, native props, keyboard order, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "../../../src/components/shell/SiteHeader.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const router = vi.hoisted(() => ({ pathname: "/" as string | null }));
vi.mock("next/navigation", () => ({ usePathname: () => router.pathname }));

const BRAND = (
  <Link href="/" className="font-extrabold text-c1 text-xl tracking-tight">
    packs<span className="text-h1">.</span>
  </Link>
);

const LINKS = [
  { href: "/new", label: "New pack" },
  { href: "/packs", label: "Public packs" },
  { href: "/guide", label: "Guides" },
];

describe("SiteHeader", () => {
  beforeEach(() => {
    router.pathname = "/";
  });

  it("renders a banner with the osu!-web dark bar and the brand first", () => {
    render(<SiteHeader brand={BRAND} links={LINKS} />);
    const banner = screen.getByRole("banner");
    expect(banner).toHaveClass("border-b", "border-b4", "bg-b6");
    expect(within(banner).getAllByRole("link")[0]).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "packs." })).toHaveAttribute("href", "/");
  });

  it("renders every nav link inside a navigation named Main by default", () => {
    render(<SiteHeader brand={BRAND} links={LINKS} />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const { href, label } of LINKS) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(within(nav).getByRole("list")).toHaveClass("flex-wrap");
  });

  it("takes a custom nav label", () => {
    render(<SiteHeader brand={BRAND} links={LINKS} navLabel="Tools" />);
    expect(screen.getByRole("navigation", { name: "Tools" })).toBeInTheDocument();
  });

  it("marks the current page's link", () => {
    router.pathname = "/guide";
    render(<SiteHeader brand={BRAND} links={LINKS} />);
    expect(screen.getByRole("link", { name: "Guides" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "New pack" })).not.toHaveAttribute("aria-current");
  });

  it("leaves out the nav when there are no links", () => {
    render(<SiteHeader brand={BRAND} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("pushes the actions slot to the far end, and renders no wrapper without it", () => {
    const { rerender } = render(
      <SiteHeader brand={BRAND} links={LINKS} actions={<a href="/signin">Sign in</a>} />,
    );
    const signIn = screen.getByRole("link", { name: "Sign in" });
    expect(signIn.parentElement).toHaveClass("ml-auto");

    rerender(<SiteHeader brand={BRAND} links={LINKS} />);
    expect(screen.getByRole("banner").querySelector(".ml-auto")).toBeNull();
  });

  it("keeps packs' spacing for the start layout and centers the nav on request", () => {
    const { rerender } = render(<SiteHeader brand={BRAND} links={LINKS} />);
    const row = screen.getByRole("banner").firstElementChild;
    expect(row).toHaveClass("max-w-5xl", "flex-wrap", "gap-x-8", "gap-y-2");
    expect(screen.getByRole("navigation")).not.toHaveClass("flex-1");

    rerender(<SiteHeader brand={BRAND} links={LINKS} navAlign="center" />);
    expect(screen.getByRole("banner").firstElementChild).toHaveClass("gap-4");
    expect(screen.getByRole("navigation")).toHaveClass("flex-1");
    expect(within(screen.getByRole("navigation")).getByRole("list")).toHaveClass("justify-center");
  });

  it("appends a caller className last and passes header props and a ref through", () => {
    const ref = createRef<HTMLElement>();
    render(<SiteHeader ref={ref} brand={BRAND} className="sticky" data-testid="top" />);
    const banner = screen.getByRole("banner");
    expect(ref.current).toBe(banner);
    expect(banner.className.endsWith(" sticky")).toBe(true);
    expect(banner).toHaveAttribute("data-testid", "top");
  });

  it("tabs from the brand through the nav to the actions", async () => {
    const user = userEvent.setup();
    render(<SiteHeader brand={BRAND} links={LINKS} actions={<a href="/signin">Sign in</a>} />);
    const order = ["packs.", "New pack", "Public packs", "Guides", "Sign in"];
    for (const name of order) {
      await user.tab();
      expect(screen.getByRole("link", { name })).toHaveFocus();
    }
  });

  it("has no axe violations in either layout", async () => {
    router.pathname = "/packs";
    const { container } = render(
      <div>
        <SiteHeader brand={BRAND} links={LINKS} actions={<a href="/signin">Sign in</a>} />
        <SiteHeader
          brand={<Link href="/">haruhime.moe home</Link>}
          links={[
            { href: "https://packs.haruhime.moe", label: "packs" },
            { label: "pools", note: "soon" },
          ]}
          navLabel="Tools"
          navAlign="center"
        />
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
