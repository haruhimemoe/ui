/**
 * @file src/components/content/ContentPage.tsx
 * @desc A content section's page: the `PageHeader` (title, description as its lead), a meta row
 *       with when the page was last updated and a "Copy as Markdown" button, and the body in
 *       `Prose`. Optional JSON-LD structured data. Server-safe: no state, no browser APIs. A
 *       caller resolves its own entries into these props (a docs page today, a blog post later),
 *       the way `ContentNav` and `ContentLayout` do.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ReactNode } from "react";
import { PageHeader } from "../basics/PageHeader.js";
import { Prose } from "../basics/Prose.js";
import { JsonLd } from "../meta/JsonLd.js";
import { CopyMarkdownButton } from "./CopyMarkdownButton.js";

/** `ContentPage`'s props. */
export type ContentPageProps = {
  /** The page's h1. */
  title: ReactNode;
  /** A sentence under the title, passed to `PageHeader` as its `lead`. */
  description?: ReactNode | undefined;
  /** When the page was last updated, as a `<time dateTime>`-ready string (e.g. an ISO date). */
  lastUpdated?: string | undefined;
  /** The label before the last-updated time. Defaults to "Last updated". */
  lastUpdatedLabel?: ReactNode | undefined;
  /** The page's raw Markdown source. When set, shows a "Copy as Markdown" button that fetches it. */
  markdownHref?: string | undefined;
  /** A schema.org object for `JsonLd`. Pass `ld.graph(...)` yourself for several nodes. */
  jsonLd?: Record<string, unknown> | undefined;
  /** Extra buttons or links, shown alongside the last-updated time and the copy button. */
  actions?: ReactNode | undefined;
  /** The page body, rendered inside `Prose`. */
  children: ReactNode;
};

/**
 * @function ContentPage
 * @param props {ContentPageProps} the title and optional description, last-updated time, Markdown
 *        source, JSON-LD data and actions, plus the page body as children
 * @returns {JSX.Element} optional `JsonLd`, a `PageHeader` whose actions hold the last-updated
 *          time, the copy button and the caller's actions, then the body in `Prose`
 */
export function ContentPage({
  title,
  description,
  lastUpdated,
  lastUpdatedLabel = "Last updated",
  markdownHref,
  jsonLd,
  actions,
  children,
}: ContentPageProps) {
  const meta = lastUpdated || markdownHref || actions;
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PageHeader
        title={title}
        lead={description}
        actions={
          meta ? (
            <>
              {lastUpdated ? (
                <div className="text-c4 text-sm">
                  {lastUpdatedLabel} <time dateTime={lastUpdated}>{lastUpdated}</time>
                </div>
              ) : null}
              {markdownHref ? <CopyMarkdownButton href={markdownHref} /> : null}
              {actions}
            </>
          ) : undefined
        }
      />
      <Prose>{children}</Prose>
    </>
  );
}
