/**
 * @file src/components/mdx/MdxDiv.tsx
 * @desc react-markdown/MDX's `div` override: routes a remarkEmbeds `data-embed` div to Embed,
 *       leaving every other div plain. MDX never swaps literal JSX tags, so a hand-written
 *       `<div>` in MDX source never reaches this override. Drops the `node` prop react-markdown
 *       passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { Embed } from "./Embed.js";

/** Native div props, react-markdown's node (dropped), and remarkEmbeds' data-embed. */
export type MdxDivProps = ComponentProps<"div"> & {
  node?: unknown;
  "data-embed"?: string | undefined;
};

/**
 * @function MdxDiv
 * @param props {MdxDivProps} native div props
 * @returns {JSX.Element} an Embed for a `data-embed` div (from remarkEmbeds), else a plain div.
 *          MDX never swaps literal JSX tags, so a hand-written `<div>` in MDX never gets here.
 */
export function MdxDiv({ node: _node, "data-embed": embed, ...props }: MdxDivProps) {
  if (embed) return <Embed url={embed} />;
  return <div {...props} />;
}
