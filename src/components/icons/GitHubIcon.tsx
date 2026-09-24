/**
 * @file src/components/icons/GitHubIcon.tsx
 * @desc The GitHub mark as a static inline SVG (no icon library, no external request). Always
 *       decorative: label the link or button around it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";

/** Every native `<svg>` prop except children and viewBox. */
export type GitHubIconProps = Omit<ComponentProps<"svg">, "children" | "viewBox">;

/**
 * @function GitHubIcon
 * @param props {GitHubIconProps} native svg props; `className` replaces the default size
 *        ("size-5")
 * @returns {JSX.Element} the GitHub mark in the current text color, hidden from assistive tech
 */
export function GitHubIcon({ className = "size-5", ...props }: GitHubIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="currentColor"
      {...props}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}
