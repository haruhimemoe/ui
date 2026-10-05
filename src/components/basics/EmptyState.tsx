/**
 * @file src/components/basics/EmptyState.tsx
 * @desc The "nothing here yet" box: dashed (default) or filled, `md` centered with p-6 or `sm`
 *       left-aligned and tight, with an optional bold title and an action under the message. A
 *       plain div with no role: when it appears after a search, the caller announces it with
 *       its own live region. Heights like min-h-48 go in className. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<div>` prop, plus the look, the size, a title and an action. */
export type EmptyStateProps = Omit<ComponentProps<"div">, "title"> & {
  variant?: "dashed" | "filled" | undefined;
  size?: "sm" | "md" | undefined;
  /** A bold c1 line above the message. */
  title?: ReactNode | undefined;
  /** A button or link under the message. */
  action?: ReactNode | undefined;
};

// The dashes are decorative (1.4.11 doesn't apply); the c3 text carries the meaning.
const VARIANTS = {
  dashed: "border-2 border-dashed border-b2 text-c3 text-sm",
  filled: "bg-b4 text-c3",
} as const;
const SIZES = {
  sm: "flex flex-col gap-1 px-3 py-2 text-left",
  md: "grid place-items-center gap-2 p-6 text-center",
} as const;

/**
 * @function EmptyState
 * @param props {EmptyStateProps} variant (default "dashed"), size (default "md"), title,
 *        action, the message as children, plus native div props
 * @returns {JSX.Element} the box
 */
export function EmptyState({
  variant = "dashed",
  size = "md",
  title,
  action,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cx("rounded-[10px]", VARIANTS[variant], SIZES[size], className)} {...props}>
      {title ? <p className="font-bold text-c1">{title}</p> : null}
      {children}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
