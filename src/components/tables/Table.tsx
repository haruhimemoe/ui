/**
 * @file src/components/tables/Table.tsx
 * @desc A data table on the apps' look: full width, small left-aligned text, in a wrapper that
 *       scrolls sideways on phones, with an optional caption (visible, or for screen readers only).
 *       Server-safe. Fill it with THead, TBody, Th and Td.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { FIELD_LABEL } from "../forms/fieldStyles.js";

/** Every native `<table>` prop (including `ref`), plus a caption and the wrapper's classes. */
export type TableProps = ComponentProps<"table"> & {
  /** Names the table for screen readers. Shown above it unless `hideCaption`. */
  caption?: ReactNode;
  /** Keep the caption for screen readers only (`sr-only`), when a heading already shows. */
  hideCaption?: boolean | undefined;
  /** Classes for the wrapper `<div>` that scrolls sideways. */
  wrapperClassName?: string | undefined;
};

/**
 * @function Table
 * @param props {TableProps} native table props (rows as children), a caption, hideCaption and
 *        wrapperClassName; `className` and `ref` go on the `<table>`
 * @returns {JSX.Element} an `overflow-x-auto` `<div>` around the `<table>` and its caption
 */
export function Table({
  caption,
  hideCaption = false,
  wrapperClassName,
  className,
  children,
  ...props
}: TableProps) {
  return (
    <div className={cx("overflow-x-auto", wrapperClassName)}>
      <table className={cx("w-full text-left text-sm", className)} {...props}>
        {caption ? (
          <caption className={hideCaption ? "sr-only" : `mb-2 text-left ${FIELD_LABEL}`}>
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </div>
  );
}
