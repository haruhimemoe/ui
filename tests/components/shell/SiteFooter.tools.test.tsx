/**
 * @file tests/components/shell/SiteFooter.tools.test.tsx
 * @desc The "haruhime tools" column: haruhimeToolsColumn's data (current tool left out, "All
 *       tools" last) and SiteFooter's `tools` prop placing it among the columns.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Fri Oct 9, 2026
 */

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  HARUHIME_TOOLS,
  haruhimeToolsColumn,
} from "../../../src/components/shell/haruhimeTools.js";
import { SiteFooter, type SiteFooterColumn } from "../../../src/components/shell/SiteFooter.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const COLUMNS: SiteFooterColumn[] = [
  { title: "pools", items: [{ label: "Search", href: "/search" }] },
  { title: "Legal", items: [{ label: "Terms", href: "/legal/terms" }] },
];

const navTitles = () =>
  screen
    .getAllByRole("region")
    .map((column) => column.getAttribute("aria-labelledby"))
    .map((id) => document.getElementById(id ?? "")?.textContent);

describe("haruhimeToolsColumn", () => {
  it("lists every live tool on https and then All tools on www", () => {
    const column = haruhimeToolsColumn();
    expect(column.title).toBe("haruhime tools");
    expect(column.items.map((item) => item.href)).toEqual([
      "https://packs.haruhime.moe",
      "https://pools.haruhime.moe",
      "https://bb.haruhime.moe",
      "https://harumin.haruhime.moe",
      "https://tourney.haruhime.moe",
      "https://www.haruhime.moe",
    ]);
    expect(column.items[0]?.label).toBe("packs: mappool downloads");
    expect(column.items.at(-1)?.label).toBe("All tools");
    expect(HARUHIME_TOOLS.every((tool) => tool.href.startsWith("https://"))).toBe(true);
  });

  it("leaves the current tool out and takes a title, label and href", () => {
    const column = haruhimeToolsColumn({
      current: "pools",
      title: "More tools",
      allLabel: "haruhime.moe",
      allHref: "https://example.com",
    });
    expect(column.title).toBe("More tools");
    expect(column.items.map((item) => item.label)).toEqual([
      "packs: mappool downloads",
      "bb: osu! BBCode editor",
      "harumin: osu! Discord bot",
      "tourney: osu! tournament runner",
      "haruhime.moe",
    ]);
    expect(column.items.at(-1)?.href).toBe("https://example.com");
  });

  it("drops the All tools entry when allLabel is false", () => {
    expect(haruhimeToolsColumn({ current: "bb", allLabel: false }).items).toHaveLength(4);
  });
});

describe("SiteFooter tools", () => {
  it("adds no column without the prop", () => {
    render(<SiteFooter columns={COLUMNS} />);
    expect(navTitles()).toEqual(["pools", "Legal"]);
  });

  it("puts the column second by default, without the current tool", async () => {
    const { container } = render(<SiteFooter columns={COLUMNS} tools={{ current: "pools" }} />);
    expect(navTitles()).toEqual(["pools", "haruhime tools", "Legal"]);
    const nav = screen.getByRole("region", { name: "haruhime tools" });
    expect(within(nav).queryByRole("link", { name: /^pools/ })).toBeNull();
    expect(within(nav).getByRole("link", { name: "bb: osu! BBCode editor" })).toHaveAttribute(
      "href",
      "https://bb.haruhime.moe",
    );
    await expectNoAxeViolations(container);
  });

  it("places the column at a clamped position and renders it alone", () => {
    const { unmount } = render(<SiteFooter columns={COLUMNS} tools={{ position: 9 }} />);
    expect(navTitles()).toEqual(["pools", "Legal", "haruhime tools"]);
    unmount();
    render(<SiteFooter tools={{ position: -2 }} />);
    expect(navTitles()).toEqual(["haruhime tools"]);
  });
});

describe("SiteFooter link order", () => {
  const labels = (title: string) =>
    within(screen.getByRole("region", { name: title }))
      .getAllByRole("listitem")
      .map((item) => item.textContent);

  it("sorts each column's entries longest label first, ties kept in order", () => {
    render(
      <SiteFooter
        columns={[
          {
            title: "Links",
            items: [
              { label: "API", href: "/api" },
              { label: "Brand", href: "/brand" },
              { label: "Source on GitHub", href: "/src" },
              { label: "Guide", href: "/guide" },
            ],
          },
        ]}
        tools={{ current: "packs" }}
      />,
    );
    expect(labels("Links")).toEqual(["Source on GitHub", "Brand", "Guide", "API"]);
    const tools = labels("haruhime tools");
    expect(tools).toEqual([...tools].sort((a, b) => (b?.length ?? 0) - (a?.length ?? 0)));
    expect(tools.at(-1)).toBe("All tools");
  });

  it("keeps the given order with sortLinks false", () => {
    render(
      <SiteFooter
        sortLinks={false}
        columns={[
          {
            title: "Links",
            items: [
              { label: "API", href: "/api" },
              { label: "Source on GitHub", href: "/src" },
            ],
          },
        ]}
      />,
    );
    expect(labels("Links")).toEqual(["API", "Source on GitHub"]);
  });
});
