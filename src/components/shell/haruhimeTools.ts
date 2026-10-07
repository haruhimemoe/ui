/**
 * @file src/components/shell/haruhimeTools.ts
 * @desc The haruhime.moe tools as data (HARUHIME_TOOLS) and the footer column that links them
 *       from each tool (haruhimeToolsColumn): every other tool plus "All tools" on the parent
 *       site. Sibling subdomains are separate sites to search engines, so each tool links the
 *       others. Server-safe: no directive, no hooks.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Wed Oct 7, 2026
 */

import type { SiteLinkItem } from "./links.js";

/** A live haruhime.moe tool's id: its subdomain. */
export type HaruhimeToolId = "packs" | "pools" | "bb" | "harumin";

/** One live haruhime.moe tool: its name, home page and what it is in a few words. */
export type HaruhimeTool = {
  id: HaruhimeToolId;
  name: string;
  href: string;
  /** A few words after the name in the footer, like "mappool downloads". */
  blurb: string;
};

/** The live haruhime.moe tools in launch order. A tool joins this list once it's live. */
export const HARUHIME_TOOLS: readonly HaruhimeTool[] = [
  { id: "packs", name: "packs", href: "https://packs.haruhime.moe", blurb: "mappool downloads" },
  { id: "pools", name: "pools", href: "https://pools.haruhime.moe", blurb: "mappool builder" },
  { id: "bb", name: "bb", href: "https://bb.haruhime.moe", blurb: "osu! BBCode editor" },
  {
    id: "harumin",
    name: "harumin",
    href: "https://harumin.haruhime.moe",
    blurb: "osu! Discord bot",
  },
];

/** haruhimeToolsColumn's (and SiteFooter's `tools` prop's) options. */
export type HaruhimeToolsOptions = {
  /** The tool the footer sits on. It's left out of the list (its own column links it). */
  current?: HaruhimeToolId | undefined;
  /** The column's title (and nav landmark name). Default "haruhime tools". */
  title?: string | undefined;
  /** The last entry, linking the parent site. Default "All tools"; false leaves it out. */
  allLabel?: string | false | undefined;
  /** Where "All tools" links. Default "https://www.haruhime.moe". */
  allHref?: string | undefined;
  /** Where SiteFooter puts the column among `columns` (0 is first). Default 1, after the first. */
  position?: number | undefined;
};

/**
 * @function haruhimeToolsColumn
 * @param options {HaruhimeToolsOptions} the current tool, title and "All tools" link
 * @returns {{ title: string; items: SiteLinkItem[] }} a footer column: each other tool as
 *          "name: blurb", then "All tools" on the parent site
 */
export function haruhimeToolsColumn(options: HaruhimeToolsOptions = {}): {
  title: string;
  items: SiteLinkItem[];
} {
  const { current, title = "haruhime tools", allLabel = "All tools" } = options;
  const items: SiteLinkItem[] = HARUHIME_TOOLS.filter((tool) => tool.id !== current).map(
    (tool) => ({ href: tool.href, label: `${tool.name}: ${tool.blurb}` }),
  );
  if (allLabel !== false) {
    items.push({ href: options.allHref ?? "https://www.haruhime.moe", label: allLabel });
  }
  return { title, items };
}
