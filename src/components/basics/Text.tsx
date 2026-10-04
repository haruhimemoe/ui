/**
 * @file src/components/basics/Text.tsx
 * @desc A line of text in one of six tones (body, muted, subtle, error, warning, success) and
 *       three sizes. Styling only: not a live region. A message that appears after an action
 *       still goes in Notice live, StatusOutput or a mounted role="status". Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { type TextSize, type TextTone, textClasses } from "./textStyles.js";

/** Every native `<p>` prop (including `ref`), plus the element, tone, size and weight. */
export type TextProps = ComponentProps<"p"> & {
  /** The element: "p" (default), "span" or "div". */
  as?: "p" | "span" | "div" | undefined;
  tone?: TextTone | undefined;
  size?: TextSize | undefined;
  bold?: boolean | undefined;
};

/**
 * @function Text
 * @param props {TextProps} native paragraph props, plus as, tone (default "default"), size
 *        (default "sm") and bold
 * @returns {JSX.Element} a `<p>`, `<span>` or `<div>` in the tone's color and the size
 */
export function Text({ as = "p", tone, size, bold, className, ...props }: TextProps) {
  const classes = textClasses({ tone, size, bold, className });
  // Same attributes for every element; only the ref's element type differs.
  if (as === "span") return <span className={classes} {...(props as ComponentProps<"span">)} />;
  if (as === "div") return <div className={classes} {...(props as ComponentProps<"div">)} />;
  return <p className={classes} {...props} />;
}
