/**
 * @file tests/components/basics/ButtonLink.test.tsx
 * @desc Component tests for ButtonLink: internal next/link, external plain anchors, rel handling,
 *       variants, className, ref, keyboard focus, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ButtonLink } from "../../../src/components/basics/ButtonLink.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ButtonLink", () => {
  it("renders an internal link styled as a primary pill", () => {
    render(<ButtonLink href="/packs">Browse packs</ButtonLink>);
    const link = screen.getByRole("link", { name: "Browse packs" });
    expect(link).toHaveAttribute("href", "/packs");
    expect(link).toHaveClass("bg-h2", "rounded-full", "h-9", "px-4");
    expect(link).not.toHaveAttribute("rel");
  });

  it("accepts a URL object href for internal links", () => {
    render(<ButtonLink href={{ pathname: "/packs", query: { page: "2" } }}>Next</ButtonLink>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/packs?page=2");
  });

  it("applies the variant and size", () => {
    render(
      <ButtonLink href="/" variant="ghost" size="lg">
        Home
      </ButtonLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("bg-transparent", "h-11", "px-6");
    expect(link).not.toHaveClass("bg-h2");
  });

  it("appends a caller className after the built-in classes", () => {
    render(
      <ButtonLink href="/" className="w-full">
        Wide
      </ButtonLink>,
    );
    expect(screen.getByRole("link").className.endsWith(" w-full")).toBe(true);
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <ButtonLink ref={ref} href="/about" aria-describedby="hint" data-testid="about">
        About
      </ButtonLink>,
    );
    expect(ref.current).toBe(screen.getByRole("link", { name: "About" }));
    expect(ref.current).toHaveAttribute("data-testid", "about");
    expect(ref.current).toHaveAttribute("aria-describedby", "hint");
  });

  it("does not add rel to an internal link opened in a new tab", () => {
    render(
      <ButtonLink href="/docs" target="_blank">
        Docs
      </ButtonLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).not.toHaveAttribute("rel");
  });

  it("renders an external https link as a plain anchor with the same classes", () => {
    render(
      <ButtonLink href="https://osu.ppy.sh" variant="secondary">
        osu!
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "osu!" });
    expect(link).toHaveAttribute("href", "https://osu.ppy.sh");
    expect(link).toHaveClass("bg-b3", "rounded-full");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("adds rel=noreferrer to an external link opened in a new tab", () => {
    render(
      <ButtonLink href="https://github.com" target="_blank">
        GitHub
      </ButtonLink>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("keeps a caller rel on an external link", () => {
    render(
      <ButtonLink href="https://github.com" target="_blank" rel="me noopener">
        Me
      </ButtonLink>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("rel", "me noopener");
  });

  it("treats mailto: and protocol-relative hrefs as external", () => {
    render(
      <div>
        <ButtonLink href="mailto:someone@example.com">Mail</ButtonLink>
        <ButtonLink href="//cdn.example.com/file.zip" target="_blank">
          File
        </ButtonLink>
      </div>,
    );
    expect(screen.getByRole("link", { name: "Mail" })).toHaveAttribute(
      "href",
      "mailto:someone@example.com",
    );
    expect(screen.getByRole("link", { name: "File" })).toHaveAttribute("rel", "noreferrer");
  });

  it("drops next/link-only props on external anchors instead of leaking them to the DOM", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ButtonLink
        href="https://example.com"
        prefetch={false}
        replace
        scroll={false}
        shallow
        passHref
        locale={false}
        onNavigate={() => {}}
        transitionTypes={["slide"]}
      >
        Out
      </ButtonLink>,
    );
    const link = screen.getByRole("link");
    for (const attr of ["prefetch", "replace", "scroll", "shallow", "passhref", "locale"]) {
      expect(link).not.toHaveAttribute(attr);
    }
    expect(error).not.toHaveBeenCalled();
  });

  it("is reachable with Tab and passes clicks to the caller", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <ButtonLink href="https://example.com" onClick={onClick}>
        Go
      </ButtonLink>,
    );
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations for internal and external links", async () => {
    const { container } = render(
      <nav aria-label="Actions">
        <ButtonLink href="/new">New pack</ButtonLink>
        <ButtonLink href="https://github.com" target="_blank" variant="secondary">
          Source
        </ButtonLink>
        <ButtonLink href="/help" variant="ghost" size="lg">
          Help
        </ButtonLink>
      </nav>,
    );
    await expectNoAxeViolations(container);
  });
});
