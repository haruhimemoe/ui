/**
 * @file src/components/mdx/Figure.tsx
 * @desc An MDX-authored figure: MdxImg sized by width/height, with an optional caption and
 *       credit line. `priority` loads the image eagerly at high fetch priority, for a hero image
 *       above the fold; otherwise it loads lazily like every other MdxImg. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { MdxImg } from "./MdxImg.js";

/** Native figure props (children replaced by the image, caption and credit), plus the image's own. */
export type FigureProps = Omit<ComponentProps<"figure">, "children"> & {
  /** The image's src. */
  src: string;
  /** The image's alt text. */
  alt: string;
  /** The image's intrinsic width. */
  width: number;
  /** The image's intrinsic height. */
  height: number;
  /** The figcaption's own text, before the credit. */
  caption?: ReactNode | undefined;
  /** A source or photographer line, appended after the caption. */
  credit?: ReactNode | undefined;
  /** Loads eagerly at high fetch priority, for a hero image above the fold. Default false. */
  priority?: boolean | undefined;
};

/**
 * @function Figure
 * @param props {FigureProps} the image's src/alt/width/height, an optional caption and credit,
 *        priority, and native figure props
 * @returns {JSX.Element} a `<figure>` with a sized MdxImg and, when given, a figcaption
 */
export function Figure({
  src,
  alt,
  width,
  height,
  caption,
  credit,
  priority = false,
  className,
  ...props
}: FigureProps) {
  return (
    <figure className={cx("mt-4", className)} {...props}>
      <MdxImg
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...(priority ? { loading: "eager", fetchPriority: "high" } : {})}
      />
      {caption || credit ? (
        <figcaption className="mt-2 text-c3 text-sm">
          {caption}
          {credit ? <span className="ml-1 text-c4">{credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
