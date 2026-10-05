/**
 * @file src/components/basics/Surface.tsx
 * @desc The list-item box: Card's color and radius with smaller padding, no heading and no
 *       landmark. `as` picks the element (a row `li`, a tool `section`, a `form`). No layout
 *       classes of its own: callers add `flex flex-col gap-2`. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ElementType } from "react";
import { type SurfacePadding, surfaceClasses } from "./surfaceStyles.js";

/** The elements Surface renders. */
export type SurfaceElement = "div" | "li" | "section" | "article" | "form" | "p";

/** Every native prop of the chosen element (including `ref`), plus `as` and `padding`. */
export type SurfaceProps<T extends SurfaceElement = "div"> = ComponentProps<T> & {
  /** The element (default "div"). */
  as?: T | undefined;
  /** p-3 (default "sm"), p-4 ("md") or p-5 ("lg"). */
  padding?: SurfacePadding | undefined;
};

/**
 * @function Surface
 * @param props {SurfaceProps} the element, the padding, plus its native props; `className`
 *        merges last, so `p-0` replaces the padding
 * @returns {JSX.Element} the element with the surface classes
 */
export function Surface<T extends SurfaceElement = "div">(props: SurfaceProps<T>) {
  const {
    as,
    padding = "sm",
    className,
    ...rest
  } = props as unknown as SurfaceProps<"div"> & {
    as?: SurfaceElement | undefined;
  };
  const Tag: ElementType = as ?? "div";
  return <Tag className={surfaceClasses({ padding, className })} {...rest} />;
}
