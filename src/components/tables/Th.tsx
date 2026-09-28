/**
 * @file src/components/tables/Th.tsx
 * @desc A header cell: a column heading by default (scope col), or a row's heading (scope row,
 *       bold c1). Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { CELL, NUMERIC } from "./tableStyles.js";

/** Every native `<th>` prop (including `ref`), plus a flag for a numbers column. */
export type ThProps = ComponentProps<"th"> & {
  /** Line up digits (`tabular-nums`), for a column of numbers. */
  numeric?: boolean | undefined;
};

/**
 * @function Th
 * @param props {ThProps} native th props (`scope` defaults to "col"), plus numeric
 * @returns {JSX.Element} a `<th>` with the shared cell padding; bold c1 when it heads a row
 */
export function Th({ scope = "col", numeric = false, className, ...props }: ThProps) {
  return (
    <th
      scope={scope}
      className={cx(CELL, scope === "row" && "font-bold text-c1", numeric && NUMERIC, className)}
      {...props}
    />
  );
}
