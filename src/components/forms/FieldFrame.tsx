/**
 * @file src/components/forms/FieldFrame.tsx
 * @desc Internal layout shared by the form fields: label on top, the control, then the hint and
 *       the error. Ids derive from the control's required id, so the fields need no useId and stay
 *       server components. The hint and error sit in `<div>`s, so they can hold a list.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** The label, hint and error every form field takes, keyed on the control's required id. */
export type FieldProps = {
  /** The control's id. The label points at it; the hint and error get `<id>-hint`, `<id>-error`. */
  id: string;
  /** Visible label text. */
  label: ReactNode;
  /** Help text under the control, linked with aria-describedby. Checkbox shows it inline. */
  hint?: ReactNode | undefined;
  /** Error text under the control (a list is fine). Marks the control aria-invalid and links it. */
  error?: ReactNode | undefined;
  /** Classes for the wrapper around the label, control, hint and error (layout, width). */
  wrapperClassName?: string | undefined;
};

/**
 * @function hintId
 * @param id {string} the control's id
 * @returns {string} the id of the control's hint element
 */
export const hintId = (id: string): string => `${id}-hint`;

/**
 * @function errorId
 * @param id {string} the control's id
 * @returns {string} the id of the control's error element
 */
export const errorId = (id: string): string => `${id}-error`;

/**
 * @function fieldDescribedBy
 * @param id {string} the control's id
 * @param hint {ReactNode} the hint, if any
 * @param error {ReactNode} the error, if any
 * @param extra {string} the caller's own aria-describedby, kept last
 * @returns {string | undefined} the aria-describedby value, or undefined when there is nothing
 */
export const fieldDescribedBy = (
  id: string,
  hint: ReactNode,
  error: ReactNode,
  extra: string | undefined,
): string | undefined =>
  // A plain join, not cx: these are ids, and cx would treat an id like "text-hint" as a class.
  [hint ? hintId(id) : null, error ? errorId(id) : null, extra].filter(Boolean).join(" ") ||
  undefined;

/**
 * @function FieldError
 * @param props {{ id: string; error?: ReactNode }} the control's id and the error, if any
 * @returns {JSX.Element | null} the error in a `<div>` (block content like a list is fine), or
 *          nothing without an error
 */
export function FieldError({ id, error }: { id: string; error?: ReactNode | undefined }) {
  return error ? (
    <div id={errorId(id)} role="alert" className="text-rose-300 text-sm">
      {error}
    </div>
  ) : null;
}

type FieldFrameProps = Omit<FieldProps, "wrapperClassName"> & {
  className?: string | undefined;
  children: ReactNode;
};

/**
 * @function FieldFrame
 * @param props {FieldFrameProps} the control's id, label, hint, error, wrapper classes and the
 *        control itself as children
 * @returns {JSX.Element} the label, control, hint and error stacked in a column
 */
export function FieldFrame({ id, label, hint, error, className, children }: FieldFrameProps) {
  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="font-bold text-c3 text-sm">
        {label}
      </label>
      {children}
      {hint ? (
        <div id={hintId(id)} className="text-c4 text-xs">
          {hint}
        </div>
      ) : null}
      <FieldError id={id} error={error} />
    </div>
  );
}
