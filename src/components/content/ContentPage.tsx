/**
 * @file src/components/content/ContentPage.tsx
 * @desc A content section's page: the `PageHeader` (title, description as its lead), a meta row
 *       with the byline, published date, "Updated" date (only when it differs from published),
 *       reading time and a "Copy as Markdown" button, and the body in `Prose`. Optional `toc`
 *       (rendered before the body, in an `xl:grid-cols` layout) and `footer` (rendered after the
 *       body). Optional JSON-LD structured data. Server-safe: no state, no browser APIs. A caller
 *       resolves its own entries into these props (a docs page today, a blog post later), the way
 *       `ContentNav` and `ContentLayout` do.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Tue Oct 6, 2026
 */

import { Fragment, type ReactNode } from "react";
import { PageHeader } from "../basics/PageHeader.js";
import { Prose } from "../basics/Prose.js";
import { JsonLd } from "../meta/JsonLd.js";
import { type ContentAuthor, ContentByline } from "./ContentByline.js";
import { CopyMarkdownButton } from "./CopyMarkdownButton.js";
import { formatContentDate } from "./contentDate.js";

export type { ContentAuthor };

/** `ContentPage`'s props. */
export type ContentPageProps = {
  /** The page's h1. */
  title: ReactNode;
  /** A sentence under the title, passed to `PageHeader` as its `lead`. */
  description?: ReactNode | undefined;
  /** The page's author(s), shown first in the meta row. */
  authors?: readonly ContentAuthor[] | undefined;
  /** When the page was first published, as a `<time dateTime>`-ready string (e.g. an ISO date). */
  published?: string | undefined;
  /** When the page was last updated, as a `<time dateTime>`-ready string (e.g. an ISO date). Shown
   * as "Updated" next to `published` when the two differ, or alone (as `lastUpdatedLabel`) when
   * `published` is unset. */
  lastUpdated?: string | undefined;
  /** The label before the last-updated time when `published` is unset. Defaults to "Last updated". */
  lastUpdatedLabel?: ReactNode | undefined;
  /** Minutes to read, shown as "{n} min read" in the meta row. */
  readingMinutes?: number | undefined;
  /** The page's raw Markdown source. When set, shows a "Copy as Markdown" button that fetches it. */
  markdownHref?: string | undefined;
  /** A schema.org object for `JsonLd`. Pass `ld.graph(...)` yourself for several nodes. */
  jsonLd?: Record<string, unknown> | undefined;
  /** Extra buttons or links, shown alongside the meta row and the copy button. */
  actions?: ReactNode | undefined;
  /** A table of contents, rendered before the body in a two-column layout above `xl`. */
  toc?: ReactNode | undefined;
  /** Rendered after the body (e.g. related-page links), outside `Prose`. */
  footer?: ReactNode | undefined;
  /** `Prose`'s `size`: "sm" for dense docs and legal pages. Defaults to "base". */
  proseSize?: "base" | "sm" | undefined;
  /** The page body, rendered inside `Prose`. */
  children: ReactNode;
};

/**
 * @function ContentPage
 * @param props {ContentPageProps} the title and optional description, authors, published and
 *        last-updated dates, reading time, Markdown source, JSON-LD data, actions, toc and footer,
 *        plus the page body as children
 * @returns {JSX.Element} optional `JsonLd`, a `PageHeader` whose actions hold the meta row, the
 *          copy button and the caller's actions, then the optional toc beside the body (in
 *          `Prose`) and the optional footer after it
 */
export function ContentPage({
  title,
  description,
  authors,
  published,
  lastUpdated,
  lastUpdatedLabel = "Last updated",
  readingMinutes,
  markdownHref,
  jsonLd,
  actions,
  toc,
  footer,
  proseSize,
  children,
}: ContentPageProps) {
  const items: { key: string; node: ReactNode }[] = [];
  if (authors && authors.length > 0)
    items.push({ key: "by", node: <ContentByline authors={authors} /> });
  if (published)
    items.push({
      key: "published",
      node: <time dateTime={published}>{formatContentDate(published)}</time>,
    });
  if (lastUpdated && lastUpdated !== published) {
    items.push({
      key: "updated",
      node: (
        <span>
          {published ? "Updated" : lastUpdatedLabel}{" "}
          <time dateTime={lastUpdated}>{formatContentDate(lastUpdated)}</time>
        </span>
      ),
    });
  }
  // One string: `{n} min read` would server-render as `1<!-- --> min read`.
  if (readingMinutes)
    items.push({ key: "reading", node: <span>{`${readingMinutes} min read`}</span> });
  const meta = items.length > 0 || markdownHref || actions;
  const body = (
    <>
      <Prose size={proseSize}>{children}</Prose>
      {footer ? <div className="mt-10">{footer}</div> : null}
    </>
  );
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      {/* mb-8: the meta row and copy button end the header, so without it they touch the body. */}
      <PageHeader
        className="mb-8"
        title={title}
        lead={description}
        actions={
          meta ? (
            <>
              {items.length > 0 ? (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-c4 text-sm">
                  {items.map((item, index) => (
                    <Fragment key={item.key}>
                      {index > 0 ? <span aria-hidden="true">·</span> : null}
                      {item.node}
                    </Fragment>
                  ))}
                </div>
              ) : null}
              {markdownHref ? <CopyMarkdownButton href={markdownHref} /> : null}
              {actions}
            </>
          ) : undefined
        }
      />
      {toc ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-10">
          <div className="xl:order-2">{toc}</div>
          <div className="min-w-0">{body}</div>
        </div>
      ) : (
        body
      )}
    </>
  );
}
