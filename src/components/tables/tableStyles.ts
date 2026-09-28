/**
 * @file src/components/tables/tableStyles.ts
 * @desc The cell padding Th and Td share (internal): room on the right between columns, none after
 *       the last one, as the apps' tables have it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/** A header or data cell: py-2 and pr-3, with no right padding on the row's last cell. */
export const CELL = "py-2 pr-3 last:pr-0";

/** Numbers line up in a column. */
export const NUMERIC = "tabular-nums";
