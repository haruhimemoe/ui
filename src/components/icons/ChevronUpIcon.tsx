/**
 * @file src/components/icons/ChevronUpIcon.tsx
 * @desc A plain upward chevron as a static inline SVG (no icon library, no external request), in
 *       the current text color. Always decorative: label the control around it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps } from "react";

/** Every native `<svg>` prop except children and viewBox. */
export type ChevronUpIconProps = Omit<ComponentProps<"svg">, "children" | "viewBox">;

/**
 * @function ChevronUpIcon
 * @param props {ChevronUpIconProps} native svg props; `className` replaces the default size
 *        ("size-5")
 * @returns {JSX.Element} an upward chevron in the current text color, hidden from assistive tech
 */
export function ChevronUpIcon({ className = "size-5", ...props }: ChevronUpIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
      {...props}
    >
      <path d="M12 8l6 6-1.4 1.4L12 10.8l-4.6 4.6L6 14l6-6Z" />
    </svg>
  );
}
