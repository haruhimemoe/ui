/**
 * @file src/components/basics/textStyles.ts
 * @desc textClasses: Text's look as a class string, for elements Text can't be (an <output>, a
 *       <time>, a <li>, a class map). Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { cx } from "../../utils/cx.js";
import { TEXT_SIZES, TEXT_TONES, type TextSize, type TextTone } from "./textTones.js";

export type { TextSize, TextTone } from "./textTones.js";

/** Options for {@link textClasses}. */
export type TextClassOptions = {
  /** "default" (c2), "muted" (c3), "subtle" (c4), "error", "warning" or "success". */
  tone?: TextTone | undefined;
  /** "xs", "sm" (default) or "base". */
  size?: TextSize | undefined;
  /** font-bold. */
  bold?: boolean | undefined;
  className?: string | undefined;
};

/**
 * @function textClasses
 * @param opts {TextClassOptions} tone (default "default"), size (default "sm"), bold and extra
 *        classes
 * @returns {string} the text classes, with the caller's className last (it replaces a built-in
 *          class that sets the same property)
 */
export const textClasses = ({
  tone = "default",
  size = "sm",
  bold = false,
  className,
}: TextClassOptions = {}): string =>
  cx(TEXT_TONES[tone], TEXT_SIZES[size], bold && "font-bold", className);
