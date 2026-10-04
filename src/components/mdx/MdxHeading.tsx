/**
 * @file src/components/mdx/MdxHeading.tsx
 * @desc react-markdown/MDX's `h2`/`h3` override: gives the heading a stable id (the given `id`,
 *       from remark's heading-id plugin, or a slug of its own text) and a hover-revealed anchor
 *       link beside it. Drops the `node` prop react-markdown passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps } from "react";
import { slugify } from "../../remark/slugify.js";
import { textOf } from "./textOf.js";

/** Every native heading prop, plus the `node` react-markdown passes (dropped). */
export type MdxHeadingProps = ComponentProps<"h2"> & { node?: unknown };

const WRAP = "group flex items-baseline gap-2 [&:first-child>:first-child]:mt-0";
// The ! wins over Prose's [&_a]:text-h1 and [&_a]:underline, which outrank plain utilities.
const ANCHOR =
  "inline-flex min-h-6 min-w-6 items-center justify-center rounded text-c4! no-underline! hover:text-h1!";

const heading = (Tag: "h2" | "h3") =>
  function MdxHeading({ node: _node, id, children, ...props }: MdxHeadingProps) {
    const text = textOf(children);
    const slug = id ?? slugify(text);
    return (
      <div className={WRAP}>
        <Tag id={slug || undefined} {...props}>
          {children}
        </Tag>
        {slug ? (
          <a href={`#${slug}`} aria-label={`Link to section: ${text}`} className={ANCHOR}>
            #
          </a>
        ) : null}
      </div>
    );
  };

/**
 * @function MdxH2
 * @param props {MdxHeadingProps} native h2 props and an optional id
 * @returns {JSX.Element} an `<h2>` with a slug id and an anchor link
 */
export const MdxH2 = heading("h2");

/**
 * @function MdxH3
 * @param props {MdxHeadingProps} native h3 props and an optional id
 * @returns {JSX.Element} an `<h3>` with a slug id and an anchor link
 */
export const MdxH3 = heading("h3");
