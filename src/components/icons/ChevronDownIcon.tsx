/**
 * @file src/components/icons/ChevronDownIcon.tsx
 * @desc A plain downward chevron as a static inline SVG (no icon library, no external request),
 *       in the current text color. Always decorative: label the control around it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps } from "react";

/** Every native `<svg>` prop except children and viewBox. */
export type ChevronDownIconProps = Omit<ComponentProps<"svg">, "children" | "viewBox">;

/**
 * @function ChevronDownIcon
 * @param props {ChevronDownIconProps} native svg props; `className` replaces the default size
 *        ("size-5")
 * @returns {JSX.Element} a downward chevron in the current text color, hidden from assistive tech
 */
export function ChevronDownIcon({ className = "size-5", ...props }: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
      {...props}
    >
      <path d="M12 16l-6-6 1.4-1.4L12 13.2l4.6-4.6L18 10l-6 6Z" />
    </svg>
  );
}
