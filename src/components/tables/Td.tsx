/**
 * @file src/components/tables/Td.tsx
 * @desc A data cell with the shared padding. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { CELL, NUMERIC } from "./tableStyles.js";

/** Every native `<td>` prop (including `ref`), plus a flag for a number. */
export type TdProps = ComponentProps<"td"> & {
  /** Line up digits (`tabular-nums`), for a number. */
  numeric?: boolean | undefined;
};

/**
 * @function Td
 * @param props {TdProps} native td props, plus numeric
 * @returns {JSX.Element} a `<td>` with the shared cell padding
 */
export function Td({ numeric = false, className, ...props }: TdProps) {
  return <td className={cx(CELL, numeric && NUMERIC, className)} {...props} />;
}
