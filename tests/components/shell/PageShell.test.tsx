/**
 * @file tests/components/shell/PageShell.test.tsx
 * @desc Component tests for PageShell: skip link first and pointing at main, header and footer
 *       slots, custom main id and classes, native props, keyboard, accessibility of a full page
 *       (with the real next/navigation, outside a router).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { PageShell } from "../../../src/components/shell/PageShell.js";
import { SiteFooter } from "../../../src/components/shell/SiteFooter.js";
import { SiteHeader } from "../../../src/components/shell/SiteHeader.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const HEADER = (
  <SiteHeader
    brand={<Link href="/">packs home</Link>}
    links={[
      { href: "/new", label: "New pack" },
      { href: "/packs", label: "Public packs" },
    ]}
  />
);

const FOOTER = (
  <SiteFooter
    columns={[{ title: "Legal", items: [{ label: "Disclaimer", href: "/disclaimer" }] }]}
    finePrint="Not affiliated with osu!."
  />
);

describe("PageShell", () => {
  it("starts with a skip link that targets the main landmark", () => {
    const { container } = render(<PageShell>content</PageShell>);
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", "#main");
    expect(container.querySelector("a")).toBe(skip);
    expect(skip).toHaveClass("sr-only", "focus:not-sr-only");
    const mains = screen.getAllByRole("main");
    expect(mains).toHaveLength(1);
    expect(mains[0]).toHaveAttribute("id", "main");
  });

  it("renders children inside main, between the header and footer slots", () => {
    render(
      <PageShell header={HEADER} footer={FOOTER}>
        <p>hello pack</p>
      </PageShell>,
    );
    const banner = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");
    expect(main).toHaveTextContent("hello pack");
    expect(main).toHaveClass("mx-auto", "max-w-5xl", "flex-1", "px-4", "py-10");
    expect(banner.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders no header or footer when the slots are empty", () => {
    render(<PageShell>page</PageShell>);
    expect(screen.queryByRole("banner")).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("takes a custom skip label, main id and main classes", () => {
    render(
      <PageShell skipLabel="Skip to the pack" mainId="content" mainClassName="max-w-7xl!">
        page
      </PageShell>,
    );
    expect(screen.getByRole("link", { name: "Skip to the pack" })).toHaveAttribute(
      "href",
      "#content",
    );
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "content");
    expect(main.className.endsWith(" max-w-7xl!")).toBe(true);
  });

  it("keeps the footer at the bottom, appends a caller className and passes div props and a ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <PageShell ref={ref} className="bg-b5" data-testid="shell">
        page
      </PageShell>,
    );
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass("flex", "min-h-dvh", "flex-col");
    expect(root?.className.endsWith(" bg-b5")).toBe(true);
    expect(root).toHaveAttribute("data-testid", "shell");
  });

  it("puts the skip link first in tab order, before the header links", async () => {
    const user = userEvent.setup();
    render(
      <PageShell header={HEADER} footer={FOOTER}>
        page
      </PageShell>,
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "packs home" })).toHaveFocus();
  });

  it("marks no nav link current outside the app router", () => {
    render(<PageShell header={HEADER}>page</PageShell>);
    expect(screen.getByRole("link", { name: "New pack" })).not.toHaveAttribute("aria-current");
  });

  it("has no axe violations as a full page", async () => {
    const { container } = render(
      <PageShell header={HEADER} footer={FOOTER}>
        <h1>Title</h1>
        <p>content</p>
      </PageShell>,
    );
    await expectNoAxeViolations(container);
  });
});
