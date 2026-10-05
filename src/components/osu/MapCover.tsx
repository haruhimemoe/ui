/**
 * @file src/components/osu/MapCover.tsx
 * @desc A beatmapset's cover as a plain lazy <img> (no next/image, so apps need no
 *       remotePatterns), with width and height from osu!'s file so nothing shifts while it
 *       loads. Decorative by default (alt=""), since a title sits beside it. With no usable set
 *       id and no src it draws a b5 box with a note glyph. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { type MapCoverSize, mapCoverUrl } from "./mapLinks.js";

/** Every native `<img>` prop except src, alt and children, plus the set and the size. */
export type MapCoverProps = Omit<ComponentProps<"img">, "src" | "alt" | "children"> & {
  /** The set whose cover loads from assets.ppy.sh. */
  beatmapsetId?: number | null | undefined;
  /** Replaces the assets.ppy.sh URL (tests, self-hosted covers). */
  src?: string | undefined;
  /** osu!'s cover file (default "list@2x"). */
  size?: MapCoverSize | undefined;
  /** Default "" (decorative); pass one for a standalone banner. */
  alt?: string | undefined;
  /** Default: square for list sizes, wide otherwise. */
  shape?: "square" | "wide" | undefined;
};

// osu!'s pixel size per file, so the img reserves its box before it loads.
const PIXELS: Record<MapCoverSize, readonly [number, number]> = {
  list: [150, 150],
  "list@2x": [300, 300],
  card: [400, 140],
  "card@2x": [800, 280],
  cover: [900, 250],
  "cover@2x": [1800, 500],
};

/**
 * @function MapCover
 * @param props {MapCoverProps} the set or a src, size, alt, shape and native img props
 * @returns {JSX.Element} the cover image, or a b5 placeholder box when there is no URL
 */
export function MapCover({
  beatmapsetId,
  src,
  size = "list@2x",
  alt = "",
  shape,
  className,
  width,
  height,
  ...props
}: MapCoverProps) {
  const url = src ?? (beatmapsetId == null ? null : mapCoverUrl(beatmapsetId, size));
  const square = (shape ?? (size.startsWith("list") ? "square" : "wide")) === "square";
  const aspect = square
    ? "aspect-square"
    : size.startsWith("card")
      ? "aspect-[20/7]"
      : "aspect-[18/5]";
  const [w, h] = PIXELS[size];
  if (!url) {
    return (
      <span
        aria-hidden="true"
        className={cx(
          "inline-flex items-center justify-center rounded-md bg-b5 text-c4",
          aspect,
          className,
        )}
      >
        ♪
      </span>
    );
  }
  return (
    // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
    <img
      src={url}
      alt={alt}
      width={width ?? w}
      height={height ?? (square ? w : h)}
      loading="lazy"
      decoding="async"
      {...props}
      className={cx("rounded-md bg-b5 object-cover", aspect, className)}
    />
  );
}
