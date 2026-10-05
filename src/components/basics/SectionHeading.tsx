/**
 * @file src/components/basics/SectionHeading.tsx
 * @desc The h2 under a page's h1: bold c1 at text-xl with room under a sticky header
 *       (scroll-mt-20). `detail` (a count) sits inside the heading's name; `actions` sit to the
 *       right; `anchor` adds a `#` link to its id. With neither actions nor anchor it renders
 *       only the heading. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { textOf } from "../mdx/textOf.js";
import type { HeadingLevel } from "./cardStyles.js";
import { HeadingAnchor } from "./HeadingAnchor.js";

type SectionHeadingBase = Omit<ComponentProps<"h2">, "title"> & {
  /** Heading level (default 2). */
  level?: HeadingLevel | undefined;
  /** Small text after the title, inside the heading: a count "(12)" or a short detail. */
  detail?: ReactNode | undefined;
  /** Right-aligned beside the heading: a "See all" link, buttons. */
  actions?: ReactNode | undefined;
  /** Classes for the wrapper that holds the heading and actions or anchor. */
  wrapperClassName?: string | undefined;
};

/** Every native heading prop, plus level, detail, actions, and `anchor`, which needs an `id`. */
export type SectionHeadingProps = SectionHeadingBase &
  ({ anchor: true; id: string } | { anchor?: false | undefined });

/**
 * @function SectionHeading
 * @param props {SectionHeadingProps} the title as children, level, detail, actions, anchor,
 *        wrapperClassName, plus native heading props
 * @returns {JSX.Element} the heading, or a row holding it and its anchor and actions
 */
export function SectionHeading({
  level = 2,
  detail,
  actions,
  anchor,
  wrapperClassName,
  className,
  children,
  id,
  ...props
}: SectionHeadingProps) {
  const Tag = `h${level}` as const;
  const heading = (
    <Tag id={id} className={cx("scroll-mt-20 font-bold text-c1 text-xl", className)} {...props}>
      {children}
      {detail === undefined ? null : (
        <>
          {" "}
          <span className="font-normal text-base text-c4">{detail}</span>
        </>
      )}
    </Tag>
  );
  if (!actions && !anchor) return heading;
  return (
    <div className={cx("flex flex-wrap items-baseline justify-between gap-2", wrapperClassName)}>
      <div className="flex items-baseline gap-2">
        {heading}
        {anchor && id ? <HeadingAnchor id={id} text={textOf(children)} /> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
