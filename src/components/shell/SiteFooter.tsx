/**
 * @file src/components/shell/SiteFooter.tsx
 * @desc Site footer: link columns from data under one nav landmark, each a section headed by its title (entries without an href show as text with
 *       a small note, like "soon"), an optional "haruhime tools" column linking the other tools,
 *       an optional extra slot, one line of fine print, the
 *       haruhime.moe wordmark linking the parent site, a GitHub icon link, and an optional
 *       Discord icon link beside it (white, as Discord's brand guidelines ask).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";
import type { HeadingLevel } from "../basics/cardStyles.js";
import { DiscordIcon } from "../icons/DiscordIcon.js";
import { GitHubIcon } from "../icons/GitHubIcon.js";
import { HaruhimeWordmarkLink } from "../icons/HaruhimeWordmarkLink.js";
import { type HaruhimeToolsOptions, haruhimeToolsColumn } from "./haruhimeTools.js";
import { LinkNote } from "./LinkNote.js";
import { linkItemKey, type SiteLinkItem } from "./links.js";

/** One footer column: a title (its heading, which names the column's section) and its entries. */
export type SiteFooterColumn = {
  title: string;
  items: readonly SiteLinkItem[];
};

/** Every native `<footer>` prop (including `ref`), plus the columns and the bottom row. */
export type SiteFooterProps = Omit<ComponentProps<"footer">, "children"> & {
  /** Link columns, left to right. Internal hrefs use `next/link`, external ones a plain `<a>`. */
  columns?: readonly SiteFooterColumn[] | undefined;
  /** The one nav landmark around the columns. Default "Footer". Keep it unlike the header's. */
  navLabel?: string | undefined;
  /** The column titles' heading level. Default 2. */
  headingLevel?: HeadingLevel | undefined;
  /**
   * Adds the "haruhime tools" column (haruhimeToolsColumn): the other haruhime.moe tools and
   * "All tools". `current` leaves this tool out; `position` places it (default 1).
   */
  tools?: HaruhimeToolsOptions | undefined;
  /** Rendered above the fine print, e.g. a "clear local data" control. */
  extra?: ReactNode;
  /** One line of small print, e.g. a trademark notice. */
  finePrint?: ReactNode;
  /** Show the haruhime.moe wordmark linking the parent site. Default true. */
  parentLink?: boolean | undefined;
  /** Where the wordmark links. Default "https://www.haruhime.moe". */
  parentHref?: string | undefined;
  /** Where the GitHub icon links, or false to leave it out. Default the haruhimemoe org. */
  githubHref?: string | false | undefined;
  /** The GitHub link's accessible name. Default "haruhimemoe on GitHub". */
  githubLabel?: string | undefined;
  /** Where the Discord icon links, e.g. a server invite. No Discord icon without it. */
  discordHref?: string | undefined;
  /** The Discord link's accessible name. Default "Discord". */
  discordLabel?: string | undefined;
};

// The GitHub icon link in the bottom row.
const ICON_LINK = "shrink-0 text-c3 transition-colors hover:text-c1";

// Discord's brand guidelines ask for the logo in color, black or white, never recolored. c1 is
// white at every hue, so the Discord link stays white and dims on hover instead of changing hue.
const DISCORD_LINK = "shrink-0 text-c1 transition-opacity hover:opacity-80";

// Static strings so Tailwind sees every class. Four or more columns share the four-column grid.
const GRID_COLUMNS = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"] as const;

/**
 * @function SiteFooter
 * @param props {SiteFooterProps} columns, the tools column, extra slot, fine print, parent, GitHub and Discord
 *        links and their names, and native footer props
 * @returns {JSX.Element} the footer: columns on top, then extra, fine print and the brand row
 */
export function SiteFooter({
  columns: ownColumns = [],
  navLabel = "Footer",
  headingLevel = 2,
  tools,
  extra,
  finePrint,
  parentLink = true,
  parentHref = "https://www.haruhime.moe",
  githubHref = "https://github.com/haruhimemoe",
  githubLabel = "haruhimemoe on GitHub",
  discordHref,
  discordLabel = "Discord",
  className,
  ...props
}: SiteFooterProps) {
  const columns = [...ownColumns];
  if (tools) {
    const at = Math.max(0, Math.min(tools.position ?? 1, columns.length));
    columns.splice(at, 0, haruhimeToolsColumn(tools));
  }
  const fine = finePrint ? <p className="text-c4 text-xs">{finePrint}</p> : null;
  const github = githubHref ? (
    <a href={githubHref} aria-label={githubLabel} className={ICON_LINK}>
      <GitHubIcon />
    </a>
  ) : null;
  const discord = discordHref ? (
    <a href={discordHref} aria-label={discordLabel} className={DISCORD_LINK}>
      <DiscordIcon />
    </a>
  ) : null;
  // Both icons sit together at the row's end, Discord first. One icon stays a direct child.
  const icons =
    discord && github ? (
      <div className="flex shrink-0 items-center gap-4">
        {discord}
        {github}
      </div>
    ) : (
      (discord ?? github)
    );
  // With the wordmark, the fine print gets its own line and the row holds wordmark + icon.
  // Without it, the fine print shares the row with the icon.
  const rowStart = parentLink ? <HaruhimeWordmarkLink href={parentHref} /> : fine;
  const Heading = `h${headingLevel}` as const;
  const columnId = (title: string) => `footer-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <footer className={cx("border-b4 border-t bg-b6 text-c3 text-sm", className)} {...props}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {columns.length > 0 ? (
          // One nav landmark for the whole footer; each column is a section named by its
          // heading, so heading navigation finds the columns and landmark lists stay short.
          <nav
            aria-label={navLabel}
            className={cx("grid gap-8", GRID_COLUMNS[Math.min(columns.length, 4)])}
          >
            {columns.map((column) => (
              <section key={column.title} aria-labelledby={columnId(column.title)}>
                <Heading
                  id={columnId(column.title)}
                  className="mb-3 font-bold text-c4 text-xs uppercase tracking-wide"
                >
                  {column.title}
                </Heading>
                <ul className="flex flex-col gap-2">
                  {column.items.map((item) => (
                    <li key={linkItemKey(item)}>
                      {item.href ? (
                        <AutoLink
                          href={item.href}
                          className="wrap-anywhere transition-colors hover:text-c1"
                        >
                          {item.label}
                        </AutoLink>
                      ) : (
                        <span>{item.label}</span>
                      )}
                      <LinkNote note={item.note} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        ) : null}
        {extra || fine || rowStart || icons ? (
          <div className="flex flex-col gap-3 border-b4 border-t pt-6">
            {extra}
            {parentLink ? fine : null}
            {rowStart || icons ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                {rowStart}
                {icons}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
