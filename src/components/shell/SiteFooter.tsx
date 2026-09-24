/**
 * @file src/components/shell/SiteFooter.tsx
 * @desc Site footer: labelled link columns from data (entries without an href show as text with
 *       a small note, like "soon"), an optional extra slot, one line of fine print, the
 *       haruhime.moe wordmark linking the parent site, and a GitHub icon link.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { GitHubIcon } from "../icons/GitHubIcon.js";
import { HaruhimeWordmarkLink } from "../icons/HaruhimeWordmarkLink.js";
import { AutoLink } from "./AutoLink.js";
import type { SiteLinkItem } from "./links.js";

/** One footer column: a title (also the nav landmark's name) and its entries. */
export type SiteFooterColumn = {
  title: string;
  items: readonly SiteLinkItem[];
};

/** Every native `<footer>` prop (including `ref`), plus the columns and the bottom row. */
export type SiteFooterProps = Omit<ComponentProps<"footer">, "children"> & {
  /** Link columns, left to right. Internal hrefs use `next/link`, external ones a plain `<a>`. */
  columns?: readonly SiteFooterColumn[] | undefined;
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
};

// Static strings so Tailwind sees every class. Four or more columns share the four-column grid.
const GRID_COLUMNS = ["", "", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"] as const;

/**
 * @function SiteFooter
 * @param props {SiteFooterProps} columns, extra slot, fine print, parent and GitHub links, and
 *        native footer props
 * @returns {JSX.Element} the footer: columns on top, then extra, fine print and the brand row
 */
export function SiteFooter({
  columns = [],
  extra,
  finePrint,
  parentLink = true,
  parentHref = "https://www.haruhime.moe",
  githubHref = "https://github.com/haruhimemoe",
  githubLabel = "haruhimemoe on GitHub",
  className,
  ...props
}: SiteFooterProps) {
  const fine = finePrint ? <p className="text-c4 text-xs">{finePrint}</p> : null;
  const github = githubHref ? (
    <a
      href={githubHref}
      aria-label={githubLabel}
      className="shrink-0 text-c3 transition-colors hover:text-c1"
    >
      <GitHubIcon />
    </a>
  ) : null;
  // With the wordmark, the fine print gets its own line and the row holds wordmark + icon.
  // Without it, the fine print shares the row with the icon.
  const rowStart = parentLink ? <HaruhimeWordmarkLink href={parentHref} /> : fine;

  return (
    <footer className={cx("border-b4 border-t bg-b6 text-c3 text-sm", className)} {...props}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
        {columns.length > 0 ? (
          <div className={cx("grid gap-8", GRID_COLUMNS[Math.min(columns.length, 4)])}>
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="mb-3 font-bold text-c4 text-xs uppercase tracking-wide">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {column.items.map((item) => (
                    <li key={`${item.label} ${item.href ?? ""}`}>
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
                      {item.note ? (
                        <>
                          {" "}
                          <span className="text-c4 text-xs uppercase tracking-wide">
                            {item.note}
                          </span>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        ) : null}
        {extra || fine || rowStart || github ? (
          <div className="flex flex-col gap-3 border-b4 border-t pt-6">
            {extra}
            {parentLink ? fine : null}
            {rowStart || github ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                {rowStart}
                {github}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
