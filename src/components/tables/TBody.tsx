/**
 * @file src/components/tables/TBody.tsx
 * @desc A table's body rows, each with a b4 rule above it. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<tbody>` prop (including `ref`). */
export type TBodyProps = ComponentProps<"tbody">;

/**
 * @function TBody
 * @param props {TBodyProps} native tbody props; plain `<tr>`s as children
 * @returns {JSX.Element} a `<tbody>` whose rows get a top border in b4
 */
export function TBody({ className, ...props }: TBodyProps) {
  return <tbody className={cx("[&>tr]:border-b4 [&>tr]:border-t", className)} {...props} />;
}
