/**
 * @file src/components/basics/Notice.tsx
 * @desc Short status text in one of three tones (info, warning, error). Silent to screen readers
 *       unless `live` is set: then errors get role="alert" and the other tones role="status". A
 *       live info or warning notice should stay mounted with its children changing, since a
 *       status region that mounts with its text already inside may not be announced.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

export type NoticeTone = "info" | "warning" | "error";

/** Every native `<p>` prop (including `ref`), plus a tone, a live flag and the element to render. */
export type NoticeProps = ComponentProps<"p"> & {
  tone?: NoticeTone | undefined;
  /**
   * Make it a live region: role="alert" for errors, role="status" otherwise. Keep a live info or
   * warning notice mounted and change its children (empty when idle) so each message is read.
   */
  live?: boolean | undefined;
  /** Render a `<div>` instead of a `<p>` when the notice holds block content like a list. */
  as?: "p" | "div" | undefined;
};

const TONES: Record<NoticeTone, string> = {
  info: "text-c3",
  warning: "text-amber-300",
  error: "text-rose-300",
};

/**
 * @function Notice
 * @param props {NoticeProps} native paragraph props, plus tone (default "info"), live (default
 *        false) and as (default "p")
 * @returns {JSX.Element} a small toned `<p>` (or `<div>`), announced only when live
 */
export function Notice({
  tone = "info",
  live = false,
  as = "p",
  className,
  ...props
}: NoticeProps) {
  const role = live ? (tone === "error" ? "alert" : "status") : undefined;
  const classes = cx("text-sm", TONES[tone], className);

  if (as === "div") {
    // Same attributes either way; only the ref's element type differs.
    return <div role={role} className={classes} {...(props as ComponentProps<"div">)} />;
  }
  return <p role={role} className={classes} {...props} />;
}
