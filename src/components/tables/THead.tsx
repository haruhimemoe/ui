/**
 * @file src/components/tables/THead.tsx
 * @desc A table's header rows in small muted capitals, the apps' column-heading look. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<thead>` prop (including `ref`). */
export type THeadProps = ComponentProps<"thead">;

/**
 * @function THead
 * @param props {THeadProps} native thead props; the header `<tr>` as children
 * @returns {JSX.Element} a `<thead>` in c3 at text-xs, uppercase
 */
export function THead({ className, ...props }: THeadProps) {
  return <thead className={cx("text-c3 text-xs uppercase", className)} {...props} />;
}
