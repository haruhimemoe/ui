/**
 * @file src/components/basics/Progress.tsx
 * @desc A labelled progress bar: a native `<progress>` drawn in b3 and h1 (the native bar in
 *       forced colors), named by its visible label or an aria-label, and described by an
 *       `<output>` under it (a polite live region, always mounted) holding the status text.
 *       No value means indeterminate. Server-safe (useId works in Server Components).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { textClasses } from "./textStyles.js";

/** Every native `<div>` prop, plus the bar's name, its value and max, and a status line. */
export type ProgressProps = Omit<ComponentProps<"div">, "children"> & {
  /** The bar's accessible name; shown above it unless hideLabel. */
  label: string;
  hideLabel?: boolean | undefined;
  /** Omitted (or not a finite number): indeterminate. Clamped into [0, max]. */
  value?: number | undefined;
  /** Default 1. Not a positive finite number: 1. */
  max?: number | undefined;
  /** Text under the bar ("3 of 12 sets ready"), in an `<output>` the bar points at. */
  status?: ReactNode | undefined;
};

const BAR =
  "h-2 w-full appearance-none overflow-hidden rounded-full bg-b3 forced-colors:appearance-auto [&::-moz-progress-bar]:bg-h1 [&::-webkit-progress-bar]:bg-b3 [&::-webkit-progress-value]:bg-h1";

/**
 * @function Progress
 * @param props {ProgressProps} label, hideLabel, value, max (default 1), status, plus native div props
 * @returns {JSX.Element} the label, the bar and the status output
 */
export function Progress({
  label,
  hideLabel = false,
  value,
  max = 1,
  status,
  className,
  ...props
}: ProgressProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const statusId = `${id}-status`;
  const top = Number.isFinite(max) && max > 0 ? max : 1;
  const current =
    value === undefined || !Number.isFinite(value) ? undefined : Math.min(Math.max(value, 0), top);
  return (
    <div className={cx("flex flex-col gap-1", className)} {...props}>
      {hideLabel ? null : (
        <span id={labelId} className="text-c2 text-sm">
          {label}
        </span>
      )}
      <progress
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={hideLabel ? undefined : labelId}
        aria-describedby={statusId}
        value={current}
        max={top}
        className={BAR}
      />
      <output id={statusId} className={textClasses({ tone: "muted", size: "sm" })}>
        {status}
      </output>
    </div>
  );
}
