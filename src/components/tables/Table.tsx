/**
 * @file src/components/tables/Table.tsx
 * @desc A data table on the apps' look: full width, small left-aligned text, in a wrapper that
 *       scrolls sideways on phones, with an optional caption (visible, or for screen readers only).
 *       Server-safe. Fill it with THead, TBody, Th and Td.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
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
  /** The scroll wrapper's accessible name when there is no caption. Default "Table". */
  scrollLabel?: string | undefined;
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
  scrollLabel = "Table",
  className,
  children,
  ...props
}: TableProps) {
  const captionId = useId();
  return (
    // The wrapper scrolls sideways on narrow screens, so it must take keyboard focus (WCAG
    // 2.1.1): a named region (a section), labelled by the caption when there is one.
    <section
      // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs keyboard focus
      tabIndex={0}
      aria-labelledby={caption ? captionId : undefined}
      aria-label={caption ? undefined : scrollLabel}
      className={cx("overflow-x-auto", wrapperClassName)}
    >
      <table className={cx("w-full text-left text-sm", className)} {...props}>
        {caption ? (
          <caption
            id={captionId}
            className={hideCaption ? "sr-only" : `mb-2 text-left ${FIELD_LABEL}`}
          >
            {caption}
          </caption>
        ) : null}
        {children}
      </table>
    </section>
  );
}
