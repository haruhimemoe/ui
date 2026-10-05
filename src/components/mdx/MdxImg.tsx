/**
 * @file src/components/mdx/MdxImg.tsx
 * @desc react-markdown/MDX's `img` override: a plain, lazy, async-decoded `<img>` with rounded
 *       corners. A plain tag, not next/image, so apps never need remotePatterns for Markdown
 *       images. Drops the `node` prop react-markdown passes to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native img prop, plus react-markdown's node (dropped). */
export type MdxImgProps = ComponentProps<"img"> & { node?: unknown };

/** The image look, shared with Figure. */
export const MDX_IMG = "h-auto max-w-full rounded-md";

/**
 * @function MdxImg
 * @param props {MdxImgProps} native img props; width and height pass through when given
 * @returns {JSX.Element} a lazy, async-decoded, rounded `<img>` (plain img: no remotePatterns needed)
 */
export function MdxImg({ node: _node, alt = "", className, ...props }: MdxImgProps) {
  return (
    // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
    <img alt={alt} loading="lazy" decoding="async" className={cx(MDX_IMG, className)} {...props} />
  );
}
