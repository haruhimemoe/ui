/**
 * @file tests/components/brand/BrandPage.test.tsx
 * @desc Component tests for BrandPage and BrandSwatch: section order, the Family section only
 *       with a `familyHref`, slots in place, downloadable assets on the right tile, the contact
 *       `mailto:`, the swatch copying its hex, a brandPageData-shaped literal, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrandPage, type BrandPageProps } from "../../../src/components/brand/BrandPage.js";
import { BrandSwatch } from "../../../src/components/brand/BrandSwatch.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

// Shaped exactly like @haruhimemoe/brand's brandPageData("pools") (mutable assets array included).
const data = {
  name: "pools",
  mark: "po",
  tagline: "osu! mappools, searchable",
  url: "https://pools.haruhime.moe",
  writing: "Write pools in lowercase, even at the start of a sentence.",
  dos: ["Link to the site", "Use the files as they are"],
  donts: ["Recolor the icon", "Stretch the wordmark"],
  palette: { b6: "#1a1d22", h1: "#ff66ab" },
  assets: [
    { label: "Icon", href: "/brand/pools-icon.svg", dark: true },
    { label: "Wordmark, on light", href: "/brand/pools-wordmark-on-light.svg", dark: false },
  ],
  contact: "haruhime@haruhime.moe",
  familyHref: "https://haruhime.moe/brand" as string | null,
};

// Structural fit: the brand data object is assignable to the props as is.
const props: BrandPageProps = data;

const headings = () => screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BrandPage", () => {
  it("renders the sections in order", () => {
    render(<BrandPage {...props} />);
    expect(headings()).toEqual([
      "Name",
      "Logo",
      "Colors",
      "Type",
      "Do's and don'ts",
      "osu!",
      "Family",
      "Contact",
    ]);
    expect(screen.getByText(data.writing)).toBeInTheDocument();
    expect(screen.getByText(data.tagline)).toBeInTheDocument();
    expect(screen.getByText("Nunito")).toBeInTheDocument();
    expect(
      screen.getByText("Not affiliated with osu! or ppy. osu! is a trademark of ppy Pty Ltd."),
    ).toBeInTheDocument();
    expect(screen.getByText("Recolor the icon")).toBeInTheDocument();
  });

  it("drops the Family section when familyHref is null", () => {
    render(<BrandPage {...props} familyHref={null} />);
    expect(headings()).not.toContain("Family");
    expect(screen.queryByText(/haruhime\.moe family/)).toBeNull();
  });

  it("links the family page", () => {
    render(<BrandPage {...props} />);
    expect(screen.getByRole("link", { name: "Part of the haruhime.moe family." })).toHaveAttribute(
      "href",
      "https://haruhime.moe/brand",
    );
  });

  it("renders slots in place", () => {
    render(
      <BrandPage
        {...props}
        fonts={[{ name: "Inter", usage: "Body" }]}
        slots={{
          afterLogo: <h2>Extra logo</h2>,
          afterColors: <h2>Extra colors</h2>,
          end: <h2>Extra end</h2>,
        }}
      />,
    );
    expect(headings()).toEqual([
      "Name",
      "Logo",
      "Extra logo",
      "Colors",
      "Extra colors",
      "Type",
      "Do's and don'ts",
      "osu!",
      "Family",
      "Contact",
      "Extra end",
    ]);
    expect(screen.getByText("Inter")).toBeInTheDocument();
    expect(screen.queryByText("Nunito")).toBeNull();
  });

  it("gives every asset a download link on a tile matching its background", () => {
    render(<BrandPage {...props} />);
    const icon = screen.getByRole("link", { name: /Icon/ });
    expect(icon).toHaveAttribute("href", "/brand/pools-icon.svg");
    expect(icon).toHaveAttribute("download");
    const light = screen.getByRole("link", { name: /Wordmark, on light/ });
    expect(light).toHaveAttribute("download");
    const tiles = screen.getAllByRole("img");
    expect(tiles[0]?.parentElement?.className).toContain("bg-b6");
    expect(tiles[1]?.parentElement?.className).toContain("bg-c1");
  });

  it("links the contact address with mailto:", () => {
    render(<BrandPage {...props} />);
    expect(screen.getByRole("link", { name: "haruhime@haruhime.moe" })).toHaveAttribute(
      "href",
      "mailto:haruhime@haruhime.moe",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<BrandPage {...props} />);
    await expectNoAxeViolations(container);
  });
});

describe("BrandSwatch", () => {
  it("copies its hex and says so", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<BrandSwatch token="h1" hex="#ff66ab" />);
    const button = screen.getByRole("button", { name: /h1/ });
    expect(within(button).getByText("#ff66ab")).toBeInTheDocument();
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("#ff66ab");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
  });

  it("says when the clipboard refuses", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn(() => Promise.reject(new Error("no")));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<BrandSwatch token="b6" hex="#1a1d22" />);
    await user.click(screen.getByRole("button", { name: /b6/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy");
  });
});
