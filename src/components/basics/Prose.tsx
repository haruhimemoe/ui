/**
 * @file src/components/basics/Prose.tsx
 * @desc Long-form typography for MDX, docs and legal text, styled with the osu!-web tokens.
 *       Styles the plain elements inside it (headings including h4, links, lists including task
 *       lists, code, tables, blockquotes, definition lists, figures, footnotes and details). The
 *       element that opens the block gets no top margin, so a leading heading sits flush, and the
 *       same zeroing applies when the block opens with a `<section>` (remark-footnotes wraps
 *       content that starts a footnote section). Any `pre` at any depth (including one nested
 *       inside `li` or `blockquote`) gets Prose's fence styles, except CodeBlock's own `pre`
 *       (`role="group"`, the `./mdx` subpath's fenced code renderer), which keeps its own look
 *       untouched. Elements with an `id` get a scroll margin so an in-page anchor (heading,
 *       footnote) doesn't land flush under a sticky header. The `size` prop sets `text-sm` on the
 *       whole block for dense docs and legal pages.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { PROSE_CLASSES } from "./proseStyles.js";

/** Every native `<div>` prop (including `ref`), plus the text size. */
export type ProseProps = ComponentProps<"div"> & {
  /** "sm" sets text-sm on the block (legal pages, dense docs). Default "base". */
  size?: "base" | "sm" | undefined;
};

const SIZES: Record<"base" | "sm", string> = { base: "", sm: "text-sm" };

/**
 * @function Prose
 * @param props {ProseProps} native div props (children are the rendered Markdown or MDX) plus
 *        `size`
 * @returns {JSX.Element} a max-w-3xl `<div>` that styles the headings, links, lists, code,
 *          tables, blockquotes, definition lists, figures, task lists, footnotes and details
 *          inside it. Its first child's top margin is zeroed (`[&>:first-child]:mt-0`), which
 *          outranks the h2 and h3 margins by specificity.
 */
export function Prose({ size = "base", className, ...props }: ProseProps) {
  return <div className={cx(PROSE_CLASSES, SIZES[size], className)} {...props} />;
}
