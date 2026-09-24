/**
 * @file src/components/icons/HaruhimeWordmarkLink.tsx
 * @desc The parent brand wordmark as a plain external link to haruhime.moe (a real `<a>`, not
 *       next/link, since it leaves the app), dimmed until hovered like the packs footer.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { HaruhimeWordmark } from "./HaruhimeWordmark.js";

/** Every native `<a>` prop except children, plus classes for the wordmark inside. */
export type HaruhimeWordmarkLinkProps = Omit<ComponentProps<"a">, "children"> & {
  /** Replaces the wordmark's default size ("h-6 w-auto"). */
  wordmarkClassName?: string | undefined;
};

/**
 * @function HaruhimeWordmarkLink
 * @param props {HaruhimeWordmarkLinkProps} native anchor props (`href` defaults to
 *        https://www.haruhime.moe, `aria-label` to "haruhime.moe"), plus the wordmark's classes
 * @returns {JSX.Element} an `<a>` wrapping the decorative wordmark
 */
export function HaruhimeWordmarkLink({
  href = "https://www.haruhime.moe",
  className,
  wordmarkClassName,
  ...props
}: HaruhimeWordmarkLinkProps) {
  return (
    <a
      href={href}
      aria-label="haruhime.moe"
      className={cx("opacity-80 transition-opacity hover:opacity-100", className)}
      {...props}
    >
      <HaruhimeWordmark decorative className={wordmarkClassName} />
    </a>
  );
}
