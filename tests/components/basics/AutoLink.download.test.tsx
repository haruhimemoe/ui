/**
 * @file tests/components/basics/AutoLink.download.test.tsx
 * @desc A download link is a plain <a download>, never next/link (no prefetch of an API route or
 *       a large file): AutoLink, ButtonLink, TextLink and BrandPage's asset links, with a boolean,
 *       a filename and the empty string. download={false} stays next/link. next/link is mocked in
 *       this file so the two can be told apart.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { AutoLink } from "../../../src/components/basics/AutoLink.js";
import { ButtonLink } from "../../../src/components/basics/ButtonLink.js";
import { TextLink } from "../../../src/components/basics/TextLink.js";
import { BrandPage } from "../../../src/components/brand/BrandPage.js";

vi.mock("next/link.js", () => ({
  default: ({
    href,
    prefetch: _prefetch,
    ...rest
  }: { href: string; prefetch?: unknown } & Record<string, unknown>) => (
    <a data-next-link="" href={href} {...rest} />
  ),
}));

const isPlain = (name: string) =>
  !screen.getByRole("link", { name }).hasAttribute("data-next-link");

describe("download links", () => {
  it("renders AutoLink with download as a plain anchor: boolean, filename or empty string", () => {
    render(
      <div>
        <AutoLink href="/api/me/export" download>
          Export
        </AutoLink>
        <AutoLink href="/brand/palette.json" download="palette.json">
          Palette
        </AutoLink>
        <AutoLink href="/brand/icon.svg" download="">
          Icon
        </AutoLink>
        <AutoLink href="/docs">Docs</AutoLink>
        <AutoLink href="/docs/x" download={false}>
          Not a download
        </AutoLink>
      </div>,
    );
    expect(isPlain("Export")).toBe(true);
    expect(screen.getByRole("link", { name: "Export" })).toHaveAttribute("download", "");
    expect(isPlain("Palette")).toBe(true);
    expect(screen.getByRole("link", { name: "Palette" })).toHaveAttribute(
      "download",
      "palette.json",
    );
    expect(isPlain("Icon")).toBe(true);
    expect(screen.getByRole("link", { name: "Icon" })).toHaveAttribute("download", "");
    expect(isPlain("Docs")).toBe(false);
    expect(isPlain("Not a download")).toBe(false);
  });

  it("drops next/link's own props on a download and keeps the ref", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const ref = createRef<HTMLAnchorElement>();
    render(
      <AutoLink ref={ref} href="/api/me/export" download prefetch={false} replace scroll={false}>
        Export
      </AutoLink>,
    );
    const link = screen.getByRole("link", { name: "Export" });
    expect(ref.current).toBe(link);
    for (const attr of ["prefetch", "replace", "scroll"]) expect(link).not.toHaveAttribute(attr);
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("gives ButtonLink and TextLink the same plain anchor, with their classes", () => {
    render(
      <div>
        <ButtonLink href="/api/me/export" download variant="secondary">
          Download my data
        </ButtonLink>
        <TextLink href="/brand/haruhime-palette.json" download>
          Download palette (JSON)
        </TextLink>
      </div>,
    );
    expect(isPlain("Download my data")).toBe(true);
    expect(screen.getByRole("link", { name: "Download my data" })).toHaveClass("bg-b3", "w-fit");
    expect(isPlain("Download palette (JSON)")).toBe(true);
    expect(screen.getByRole("link", { name: "Download palette (JSON)" })).toHaveClass("text-h1");
  });

  it("renders BrandPage's asset downloads as plain anchors", () => {
    render(
      <BrandPage
        name="pools"
        mark="po"
        tagline="Pools."
        url="https://pools.haruhime.moe"
        writing="Lowercase."
        dos={["Link to the site"]}
        donts={["Recolor the icon"]}
        palette={{ h1: "#ff66ab" }}
        assets={[{ label: "Palette (JSON)", href: "/brand/pools-palette.json", dark: true }]}
        contact="haruhime@haruhime.moe"
        familyHref={null}
      />,
    );
    expect(isPlain("Palette (JSON)")).toBe(true);
    expect(screen.getByRole("link", { name: "Palette (JSON)" })).toHaveAttribute("download", "");
  });
});
