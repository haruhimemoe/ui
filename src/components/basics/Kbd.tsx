/**
 * @file src/components/basics/Kbd.tsx
 * @desc A keyboard key, `<kbd>` with the kit's key look. Server-safe. Also the `kbd` element in
 *       Markdown through mdxComponents, and exported from ./mdx for `<Kbd>Ctrl</Kbd>` in MDX.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { kbdClasses } from "./kbdStyles.js";

/** Every native `<kbd>` prop. */
export type KbdProps = ComponentProps<"kbd">;

/**
 * @function Kbd
 * @param props {KbdProps} native kbd props; className merges last
 * @returns {JSX.Element} a `<kbd>` styled as a key
 */
export function Kbd({ className, ...props }: KbdProps) {
  return <kbd className={cx(kbdClasses, className)} {...props} />;
}
