/**
 * @file src/components/basics/PageHeader.tsx
 * @desc The one way to title a page: h1 at the shared scale, optional lead, meta line, actions.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Native `<div>` props (including `ref`) for the wrapper, plus the header's slots. */
export type PageHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  /** The page's h1. */
  title: ReactNode;
  /** A sentence under the title. Rendered in a `<p>`, so keep it inline content. */
  lead?: ReactNode | undefined;
  /** A small muted line under the lead (dates, counts, owner). Also a `<p>`. */
  meta?: ReactNode | undefined;
  /** Buttons or links shown to the right of the title, wrapping below it on narrow screens. */
  actions?: ReactNode | undefined;
};

/**
 * @function PageHeader
 * @param props {PageHeaderProps} the page's title, and optional lead text, meta line, and actions
 * @returns {JSX.Element} the page's one h1, with its optional lead, meta line and actions
 */
export function PageHeader({ title, lead, meta, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cx("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}
      {...props}
    >
      <div className="min-w-0 max-w-3xl">
        <h1 className="wrap-anywhere font-extrabold text-3xl text-c1 tracking-tight sm:text-4xl">
          {title}
        </h1>
        {lead ? <p className="mt-2 max-w-2xl text-base text-c3 sm:text-lg">{lead}</p> : null}
        {meta ? <p className="mt-2 text-c4 text-sm">{meta}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
