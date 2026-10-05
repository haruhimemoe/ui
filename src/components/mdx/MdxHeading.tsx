/**
 * @file src/components/mdx/MdxHeading.tsx
 * @desc react-markdown/MDX's `h2`/`h3`/`h4` override: gives the heading a stable id (the given
 *       `id`, from remark's heading-id plugin, or a slug of its own text) and a hover-revealed
 *       anchor link beside it. The GFM footnote label (`<h2 class="sr-only" id="footnote-label">`)
 *       renders bare, with no wrapper and no anchor. Drops the `node` prop react-markdown passes
 *       to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { slugify } from "../../remark/slugify.js";
import { HeadingAnchor } from "../basics/HeadingAnchor.js";
import { textOf } from "./textOf.js";

/** Every native heading prop, plus the `node` react-markdown passes (dropped). */
export type MdxHeadingProps = ComponentProps<"h2"> & { node?: unknown };

const WRAP = "group flex items-baseline gap-2 [&:first-child>:first-child]:mt-0";
// The ! wins over Prose's [&_a]:text-h1 and [&_a]:underline, which outrank plain utilities.
const ANCHOR_OVERRIDES = "text-c4! no-underline! hover:text-h1!";

const heading = (Tag: "h2" | "h3" | "h4") =>
  function MdxHeading({ node: _node, id, className, children, ...props }: MdxHeadingProps) {
    // GFM's footnote label (<h2 class="sr-only" id="footnote-label">): no wrapper, no visible anchor.
    // The literal sr-only here also makes Tailwind generate the class for runtime Markdown.
    if (
      Tag === "h2" &&
      typeof className === "string" &&
      className.split(/\s+/).includes("sr-only")
    ) {
      return (
        <h2 id={id} className="sr-only" {...props}>
          {children}
        </h2>
      );
    }
    const text = textOf(children);
    const slug = id ?? slugify(text);
    return (
      <div className={WRAP}>
        <Tag id={slug || undefined} className={className} {...props}>
          {children}
        </Tag>
        {slug ? <HeadingAnchor id={slug} text={text} className={ANCHOR_OVERRIDES} /> : null}
      </div>
    );
  };

/**
 * @function MdxH2
 * @param props {MdxHeadingProps} native h2 props and an optional id
 * @returns {JSX.Element} an `<h2>` with a slug id and an anchor link, or the bare sr-only
 *          footnote label when react-markdown hands it GFM's footnote heading
 */
export const MdxH2 = heading("h2");

/**
 * @function MdxH3
 * @param props {MdxHeadingProps} native h3 props and an optional id
 * @returns {JSX.Element} an `<h3>` with a slug id and an anchor link
 */
export const MdxH3 = heading("h3");

/**
 * @function MdxH4
 * @param props {MdxHeadingProps} native h4 props and an optional id
 * @returns {JSX.Element} an `<h4>` with a slug id and an anchor link
 */
export const MdxH4 = heading("h4");
