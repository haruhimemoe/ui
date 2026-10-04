/**
 * @file src/components/mdx/MdxBlockquote.tsx
 * @desc react-markdown/MDX's `blockquote` override: a blockquote carrying `data-callout` (set by
 *       the `remarkCallouts` plugin on a GitHub-style `> [!NOTE]` blockquote) renders as a
 *       Callout of that type; any other blockquote renders plainly. Drops the `node` prop
 *       react-markdown passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps } from "react";
import type { CalloutType } from "../../remark/callouts.js";
import { Callout } from "./Callout.js";

/** Every native `<blockquote>` prop, plus `node` (dropped) and the callout plugin's marker. */
export type MdxBlockquoteProps = ComponentProps<"blockquote"> & {
  node?: unknown;
  "data-callout"?: string;
};

const TYPES: readonly string[] = ["note", "tip", "warning"];

/**
 * @function MdxBlockquote
 * @param props {MdxBlockquoteProps} native blockquote props and an optional `data-callout` type
 * @returns {JSX.Element} a Callout for a known `data-callout` type, otherwise a plain blockquote
 */
export function MdxBlockquote({
  node: _node,
  "data-callout": callout,
  children,
  ...props
}: MdxBlockquoteProps) {
  if (callout && TYPES.includes(callout)) {
    return <Callout type={callout as CalloutType}>{children}</Callout>;
  }
  return <blockquote {...props}>{children}</blockquote>;
}
